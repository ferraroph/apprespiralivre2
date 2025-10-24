import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Users, Heart, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Post {
  id: string;
  user_id: string;
  content: string;
  likes_count: number;
  created_at: string;
  profiles: {
    nickname: string;
    avatar_url: string | null;
  };
  post_likes: { user_id: string }[];
}

export default function CommunityReal() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newPost, setNewPost] = useState("");

  // Fetch posts
  const { data: posts, isLoading } = useQuery({
    queryKey: ["community-posts"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // First fetch all posts
      const { data: postsData, error: postsError } = await supabase
        .from("community_posts")
        .select(`
          id,
          user_id,
          content,
          likes_count,
          created_at,
          profiles:user_id (nickname, avatar_url)
        `)
        .order("created_at", { ascending: false })
        .limit(20);

      if (postsError) {
        console.error("Error fetching posts:", postsError);
        throw postsError;
      }

      // Then fetch user's likes for these posts
      const postIds = (postsData || []).map(p => p.id);
      const { data: likesData } = await supabase
        .from("post_likes")
        .select("post_id")
        .eq("user_id", user.id)
        .in("post_id", postIds);

      const likedPostIds = new Set((likesData || []).map(l => l.post_id));

      // Merge data
      const postsWithLikes = (postsData || []).map(post => ({
        ...post,
        post_likes: likedPostIds.has(post.id) ? [{ user_id: user.id }] : []
      }));
      
      return postsWithLikes as unknown as Post[];
    },
    staleTime: 30000,
    refetchOnMount: 'always',
  });

  // Get community stats
  const { data: stats } = useQuery({
    queryKey: ["community-stats"],
    queryFn: async () => {
      const [usersResult, postsResult] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("community_posts").select("id", { count: "exact", head: true }),
      ]);

      return {
        users: usersResult.count || 0,
        posts: postsResult.count || 0,
      };
    },
  });

  // Create post mutation with OPTIMISTIC UPDATE
  const createPostMutation = useMutation({
    mutationFn: async (content: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("community_posts")
        .insert({
          user_id: user.id,
          content,
        })
        .select(`
          id,
          user_id,
          content,
          likes_count,
          created_at,
          profiles:user_id (nickname, avatar_url)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (content) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["community-posts"] });

      // Snapshot previous value
      const previousPosts = queryClient.getQueryData<Post[]>(["community-posts"]);

      // Optimistically update
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("nickname, avatar_url")
          .eq("user_id", user.id)
          .single();

        const optimisticPost: Post = {
          id: `temp-${Date.now()}`,
          user_id: user.id,
          content,
          likes_count: 0,
          created_at: new Date().toISOString(),
          profiles: profile || { nickname: "Você", avatar_url: null },
          post_likes: [],
        };

        queryClient.setQueryData<Post[]>(["community-posts"], (old) => 
          [optimisticPost, ...(old || [])]
        );
      }

      return { previousPosts };
    },
    onSuccess: (newPost) => {
      setNewPost("");
      
      // Replace optimistic post with real one
      queryClient.setQueryData<Post[]>(["community-posts"], (old) => {
        if (!old) return [newPost as unknown as Post];
        return old.map(post => 
          post.id.startsWith('temp-') ? (newPost as unknown as Post) : post
        );
      });

      // Update stats
      queryClient.invalidateQueries({ queryKey: ["community-stats"] });
      
      toast({
        title: "Post publicado!",
        description: "Sua mensagem foi compartilhada com a comunidade.",
      });
    },
    onError: (error: Error, _content, context) => {
      // Rollback on error
      if (context?.previousPosts) {
        queryClient.setQueryData(["community-posts"], context.previousPosts);
      }
      
      console.error("Error creating post:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível publicar o post",
        variant: "destructive",
      });
    },
  });

  // Toggle like mutation with OPTIMISTIC UPDATE
  const toggleLikeMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Check if already liked
      const { data: existing } = await supabase
        .from("post_likes")
        .select("*")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .single();

      if (existing) {
        // Unlike
        const { error } = await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);

        if (error) throw error;
        return { action: 'unlike', postId };
      } else {
        // Like
        const { error } = await supabase
          .from("post_likes")
          .insert({ post_id: postId, user_id: user.id });

        if (error) throw error;
        return { action: 'like', postId };
      }
    },
    onMutate: async (postId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["community-posts"] });

      // Snapshot
      const previousPosts = queryClient.getQueryData<Post[]>(["community-posts"]);

      // Optimistically update
      queryClient.setQueryData<Post[]>(["community-posts"], (old) => {
        if (!old) return old;
        
        return old.map(post => {
          if (post.id !== postId) return post;
          
          const userLiked = post.post_likes.length > 0;
          
          return {
            ...post,
            likes_count: userLiked ? post.likes_count - 1 : post.likes_count + 1,
            post_likes: userLiked ? [] : [{ user_id: 'current' }],
          };
        });
      });

      return { previousPosts };
    },
    onError: (_error: Error, _postId, context) => {
      // Rollback
      if (context?.previousPosts) {
        queryClient.setQueryData(["community-posts"], context.previousPosts);
      }
      
      toast({
        title: "Erro",
        description: "Não foi possível curtir o post",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Refetch to sync with server (background)
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
    },
  });

  const handleSubmitPost = () => {
    if (!newPost.trim()) return;
    createPostMutation.mutate(newPost.trim());
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="h-9 w-48 bg-muted rounded mx-auto animate-pulse" />
          <div className="h-5 w-64 bg-muted rounded mx-auto animate-pulse" />
        </div>
        <div className="h-32 bg-muted rounded animate-pulse" />
        <div className="h-48 bg-muted rounded animate-pulse" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-40 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-primary text-glow">
          Comunidade
        </h1>
        <p className="text-muted-foreground">
          Você não está sozinho nessa jornada
        </p>
      </div>

      <Card className="card-premium p-6 animate-slide-up">
        <div className="flex items-center justify-around text-center">
          <div>
            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-primary">{stats?.users || 0}</p>
            <p className="text-sm text-muted-foreground">Membros Ativos</p>
          </div>
          <div className="h-12 w-px bg-border" />
          <div>
            <MessageCircle className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-primary">{stats?.posts || 0}</p>
            <p className="text-sm text-muted-foreground">Posts Publicados</p>
          </div>
        </div>
      </Card>

      {/* Create post */}
      <Card className="card-premium p-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <div className="space-y-4">
          <Textarea
            placeholder="Compartilhe sua jornada, desafios ou vitórias..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            rows={3}
            maxLength={500}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {newPost.length}/500 caracteres
            </p>
            <Button
              onClick={handleSubmitPost}
              disabled={!newPost.trim() || createPostMutation.isPending}
              className="glow-primary-subtle"
            >
              {createPostMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Publicar
            </Button>
          </div>
        </div>
      </Card>

      {/* Posts list */}
      <div className="space-y-4">
        {posts?.map((post, index) => {
          const userLiked = post.post_likes.length > 0;
          
          return (
            <Card
              key={post.id}
              className="card-premium p-6 animate-slide-up"
              style={{ animationDelay: `${(index + 2) * 0.1}s` }}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{post.profiles?.nickname || "Usuário"}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(post.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </div>

                <p className="text-foreground whitespace-pre-wrap">{post.content}</p>

                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={userLiked ? "text-primary hover:text-primary/90" : ""}
                    onClick={() => toggleLikeMutation.mutate(post.id)}
                    disabled={toggleLikeMutation.isPending}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${userLiked ? "fill-current" : ""}`} />
                    {post.likes_count}
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Comentar
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}

        {(!posts || posts.length === 0) && (
          <Card className="p-8 text-center">
            <MessageCircle className="h-16 w-16 mx-auto mb-4 text-primary opacity-50" />
            <p className="text-muted-foreground">
              Seja o primeiro a compartilhar sua jornada!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
