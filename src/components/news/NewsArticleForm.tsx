import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { NewsImageUpload } from './NewsImageUpload';
import { NewsArticle, NewsArticleFormData } from '@/hooks/useNewsArticles';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const formSchema = z.object({
  title_hu: z.string().min(1, 'A magyar cím kötelező'),
  title_en: z.string().optional(),
  content_hu: z.string().min(1, 'A magyar tartalom kötelező'),
  content_en: z.string().optional(),
  image_url: z.string().optional(),
  link_url: z.string().url('Érvénytelen URL').optional().or(z.literal('')),
  link_text_hu: z.string().optional(),
  link_text_en: z.string().optional(),
  is_published: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface NewsArticleFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: NewsArticleFormData) => void;
  article?: NewsArticle | null;
  isLoading?: boolean;
}

export function NewsArticleForm({
  open,
  onClose,
  onSubmit,
  article,
  isLoading,
}: NewsArticleFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title_hu: article?.title_hu || '',
      title_en: article?.title_en || '',
      content_hu: article?.content_hu || '',
      content_en: article?.content_en || '',
      image_url: article?.image_url || '',
      link_url: article?.link_url || '',
      link_text_hu: article?.link_text_hu || '',
      link_text_en: article?.link_text_en || '',
      is_published: article?.is_published || false,
    },
  });

  React.useEffect(() => {
    if (article) {
      form.reset({
        title_hu: article.title_hu || '',
        title_en: article.title_en || '',
        content_hu: article.content_hu || '',
        content_en: article.content_en || '',
        image_url: article.image_url || '',
        link_url: article.link_url || '',
        link_text_hu: article.link_text_hu || '',
        link_text_en: article.link_text_en || '',
        is_published: article.is_published || false,
      });
    } else {
      form.reset({
        title_hu: '',
        title_en: '',
        content_hu: '',
        content_en: '',
        image_url: '',
        link_url: '',
        link_text_hu: '',
        link_text_en: '',
        is_published: false,
      });
    }
  }, [article, form]);

  const handleSubmit = (values: FormValues) => {
    onSubmit({
      title_hu: values.title_hu,
      title_en: values.title_en || undefined,
      content_hu: values.content_hu,
      content_en: values.content_en || undefined,
      image_url: values.image_url || undefined,
      link_url: values.link_url || undefined,
      link_text_hu: values.link_text_hu || undefined,
      link_text_en: values.link_text_en || undefined,
      is_published: values.is_published,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {article ? 'Cikk szerkesztése' : 'Új cikk létrehozása'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Tabs defaultValue="hu" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="hu">Magyar</TabsTrigger>
              <TabsTrigger value="en">English</TabsTrigger>
            </TabsList>

            <TabsContent value="hu" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title_hu">Cím *</Label>
                <Input
                  id="title_hu"
                  {...form.register('title_hu')}
                  placeholder="Magyar cím"
                />
                {form.formState.errors.title_hu && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.title_hu.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="content_hu">Tartalom *</Label>
                <Textarea
                  id="content_hu"
                  {...form.register('content_hu')}
                  placeholder="Magyar tartalom (HTML támogatott)"
                  rows={6}
                />
                {form.formState.errors.content_hu && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.content_hu.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="link_text_hu">Link szövege</Label>
                <Input
                  id="link_text_hu"
                  {...form.register('link_text_hu')}
                  placeholder="pl. 'Bővebben'"
                />
              </div>
            </TabsContent>

            <TabsContent value="en" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title_en">Title</Label>
                <Input
                  id="title_en"
                  {...form.register('title_en')}
                  placeholder="English title (optional)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content_en">Content</Label>
                <Textarea
                  id="content_en"
                  {...form.register('content_en')}
                  placeholder="English content (HTML supported, optional)"
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="link_text_en">Link text</Label>
                <Input
                  id="link_text_en"
                  {...form.register('link_text_en')}
                  placeholder="e.g. 'Read more'"
                />
              </div>
            </TabsContent>
          </Tabs>

          <NewsImageUpload
            value={form.watch('image_url')}
            onChange={(url) => form.setValue('image_url', url || '')}
            disabled={isLoading}
          />

          <div className="space-y-2">
            <Label htmlFor="link_url">Link URL</Label>
            <Input
              id="link_url"
              {...form.register('link_url')}
              placeholder="https://..."
            />
            {form.formState.errors.link_url && (
              <p className="text-sm text-destructive">
                {form.formState.errors.link_url.message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="is_published"
              checked={form.watch('is_published')}
              onCheckedChange={(checked) => form.setValue('is_published', checked)}
            />
            <Label htmlFor="is_published">Publikálva</Label>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Mégse
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Mentés...' : 'Mentés'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
