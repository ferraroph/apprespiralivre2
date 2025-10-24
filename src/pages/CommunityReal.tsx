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

      const { data, error } = await supabase
        .from("community_posts")
        .select(`
          *,
          profiles:user_id (nickname, avatar_url),
          post_likes (user_id)
        `)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        console.error("Error fetching posts:", error);
        throw error;
      }
      
      // Filter post_likes to only include current user's likes
      const postsWithUserLikes = (data || []).map(post => ({
        ...post,
        post_likes: (post.post_likes || []).filter((like: any) => like.user_id === user.id)
      }));
      
      return postsWithUserLikes as unknown as Post[];
    },
    staleTime: 0,
    refetchOnMount: true,
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

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (content: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("community_posts").insert({
        user_id: user.id,
        content,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      setNewPost("");
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      queryClient.invalidateQueries({ queryKey: ["community-stats"] });
      toast({
        title: "Post publicado!",
        description: "Sua mensagem foi compartilhada com a comunidade.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Toggle like mutation
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
      } else {
        // Like
        const { error } = await supabase
          .from("post_likes")
          .insert({ post_id: postId, user_id: user.id });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
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
