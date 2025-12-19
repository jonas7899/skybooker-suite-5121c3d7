import React, { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface NewsImageUploadProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  disabled?: boolean;
}

export function NewsImageUpload({ value, onChange, disabled }: NewsImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Csak képfájlok tölthetők fel');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A fájl mérete maximum 5MB lehet');
      return;
    }

    setIsUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Delete old image if exists
      if (value) {
        const oldPath = value.split('/').pop();
        if (oldPath) {
          await supabase.storage.from('news-images').remove([oldPath]);
        }
      }

      // Upload new image
      const { error: uploadError } = await supabase.storage
        .from('news-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('news-images')
        .getPublicUrl(fileName);

      onChange(publicUrl);
      toast.success('Kép feltöltve');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Hiba a feltöltés során');
    } finally {
      setIsUploading(false);
    }
  }, [value, onChange]);

  const handleRemove = useCallback(async () => {
    if (!value) return;

    setIsUploading(true);
    try {
      const path = value.split('/').pop();
      if (path) {
        await supabase.storage.from('news-images').remove([path]);
      }
      onChange(undefined);
      toast.success('Kép törölve');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Hiba a törlés során');
    } finally {
      setIsUploading(false);
    }
  }, [value, onChange]);

  return (
    <div className="space-y-3">
      <Label>Kép</Label>
      
      {value ? (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Előnézet"
            className="w-48 h-32 object-cover rounded-lg border border-border"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6"
            onClick={handleRemove}
            disabled={disabled || isUploading}
          >
            {isUploading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <X className="h-3 w-3" />
            )}
          </Button>
        </div>
      ) : (
        <div className="relative">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={disabled || isUploading}
            className="hidden"
            id="news-image-upload"
          />
          <Label
            htmlFor="news-image-upload"
            className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Feltöltés...</span>
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                <span>Kép feltöltése (max. 5MB)</span>
              </>
            )}
          </Label>
        </div>
      )}
    </div>
  );
}
