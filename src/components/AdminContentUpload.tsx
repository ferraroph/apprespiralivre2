import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminContentUploadProps {
  onUploadComplete: (url: string) => void;
}

export function AdminContentUpload({ onUploadComplete }: AdminContentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Security: Validate file type
    const validTypes = [
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg',
      'video/mp4', 'video/webm', 'video/ogg',
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp'
    ];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, envie um arquivo de áudio (MP3, WAV), vídeo (MP4, WebM) ou imagem (JPG, PNG, WEBP).",
        variant: "destructive",
      });
      return;
    }

    // Security: Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 100MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      // Upload file to storage
      const { data, error } = await supabase.storage
        .from('content-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      clearInterval(progressInterval);

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('content-media')
        .getPublicUrl(filePath);

      setProgress(100);
      
      toast({
        title: "Upload concluído",
        description: "Arquivo enviado com sucesso!",
      });

      onUploadComplete(publicUrl);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Não foi possível enviar o arquivo.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="media-upload">Upload de Mídia</Label>
        <div className="flex items-center gap-4">
          <Input
            id="media-upload"
            type="file"
            accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,video/mp4,video/webm,video/ogg,image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileUpload}
            disabled={uploading}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={() => document.getElementById('media-upload')?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Selecionar
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Formatos aceitos: MP3/WAV (áudio), MP4/WebM (vídeo), JPG/PNG/WEBP (imagem). Tamanho máximo: 100MB.
        </p>
      </div>

      {uploading && (
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground text-center">
            Enviando... {progress}%
          </p>
        </div>
      )}
    </div>
  );
}
