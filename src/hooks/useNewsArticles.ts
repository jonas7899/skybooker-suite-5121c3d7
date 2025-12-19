import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface NewsArticle {
  id: string;
  operator_id: string;
  title_hu: string;
  title_en: string | null;
  content_hu: string;
  content_en: string | null;
  image_url: string | null;
  link_url: string | null;
  link_text_hu: string | null;
  link_text_en: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface NewsArticleFormData {
  title_hu: string;
  title_en?: string;
  content_hu: string;
  content_en?: string;
  image_url?: string;
  link_url?: string;
  link_text_hu?: string;
  link_text_en?: string;
  is_published?: boolean;
}

export function useNewsArticles(operatorId?: string) {
  const { userRole } = useAuth();
  const queryClient = useQueryClient();

  // Fetch published articles for public view
  const { data: publishedArticles, isLoading: isLoadingPublished } = useQuery({
    queryKey: ['news-articles', 'published'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as NewsArticle[];
    },
    enabled: !operatorId,
  });

  // Fetch all articles for operator management
  const { data: operatorArticles, isLoading: isLoadingOperator } = useQuery({
    queryKey: ['news-articles', 'operator', operatorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as NewsArticle[];
    },
    enabled: !!operatorId && (userRole?.role === 'operator_admin' || userRole?.role === 'operator_staff'),
  });

  // Create article
  const createArticle = useMutation({
    mutationFn: async (data: NewsArticleFormData & { operator_id: string }) => {
      // Get max sort_order
      const { data: existing } = await supabase
        .from('news_articles')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1);

      const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

      const { data: article, error } = await supabase
        .from('news_articles')
        .insert({
          ...data,
          sort_order: nextOrder,
        })
        .select()
        .single();

      if (error) throw error;
      return article;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-articles'] });
      toast.success('Cikk létrehozva');
    },
    onError: (error: Error) => {
      toast.error('Hiba történt: ' + error.message);
    },
  });

  // Update article
  const updateArticle = useMutation({
    mutationFn: async ({ id, ...data }: Partial<NewsArticle> & { id: string }) => {
      const { data: article, error } = await supabase
        .from('news_articles')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return article;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-articles'] });
      toast.success('Cikk frissítve');
    },
    onError: (error: Error) => {
      toast.error('Hiba történt: ' + error.message);
    },
  });

  // Delete article
  const deleteArticle = useMutation({
    mutationFn: async (id: string) => {
      // First, get the article to delete its image if any
      const { data: article } = await supabase
        .from('news_articles')
        .select('image_url')
        .eq('id', id)
        .single();

      if (article?.image_url) {
        const path = article.image_url.split('/').pop();
        if (path) {
          await supabase.storage.from('news-images').remove([path]);
        }
      }

      const { error } = await supabase
        .from('news_articles')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-articles'] });
      toast.success('Cikk törölve');
    },
    onError: (error: Error) => {
      toast.error('Hiba történt: ' + error.message);
    },
  });

  // Reorder articles
  const reorderArticles = useMutation({
    mutationFn: async (articles: { id: string; sort_order: number }[]) => {
      const updates = articles.map((article) =>
        supabase
          .from('news_articles')
          .update({ sort_order: article.sort_order })
          .eq('id', article.id)
      );

      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-articles'] });
    },
    onError: (error: Error) => {
      toast.error('Hiba történt: ' + error.message);
    },
  });

  return {
    articles: operatorId ? operatorArticles : publishedArticles,
    isLoading: operatorId ? isLoadingOperator : isLoadingPublished,
    createArticle,
    updateArticle,
    deleteArticle,
    reorderArticles,
  };
}
