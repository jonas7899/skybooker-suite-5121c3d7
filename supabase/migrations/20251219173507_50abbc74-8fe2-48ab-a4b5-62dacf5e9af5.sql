-- Create news_articles table
CREATE TABLE public.news_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  operator_id UUID NOT NULL REFERENCES public.operators(id) ON DELETE CASCADE,
  title_hu TEXT NOT NULL,
  title_en TEXT,
  content_hu TEXT NOT NULL,
  content_en TEXT,
  image_url TEXT,
  link_url TEXT,
  link_text_hu TEXT,
  link_text_en TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;

-- Operator admins and staff can view their news articles
CREATE POLICY "Operators can view their news articles"
ON public.news_articles
FOR SELECT
USING (
  (has_role(auth.uid(), 'operator_admin') OR has_role(auth.uid(), 'operator_staff'))
  AND operator_id = get_user_operator_id(auth.uid())
);

-- Operator admins can manage news articles
CREATE POLICY "Operator admins can insert news articles"
ON public.news_articles
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'operator_admin')
  AND operator_id = get_user_operator_id(auth.uid())
);

CREATE POLICY "Operator admins can update news articles"
ON public.news_articles
FOR UPDATE
USING (
  has_role(auth.uid(), 'operator_admin')
  AND operator_id = get_user_operator_id(auth.uid())
);

CREATE POLICY "Operator admins can delete news articles"
ON public.news_articles
FOR DELETE
USING (
  has_role(auth.uid(), 'operator_admin')
  AND operator_id = get_user_operator_id(auth.uid())
);

-- Anyone can view published news articles
CREATE POLICY "Anyone can view published news articles"
ON public.news_articles
FOR SELECT
USING (is_published = true);

-- Create updated_at trigger
CREATE TRIGGER update_news_articles_updated_at
BEFORE UPDATE ON public.news_articles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create news-images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('news-images', 'news-images', true);

-- Storage policies for news-images bucket
CREATE POLICY "Operators can upload news images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'news-images' AND
  (public.has_role(auth.uid(), 'operator_admin') OR public.has_role(auth.uid(), 'operator_staff'))
);

CREATE POLICY "Operators can update news images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'news-images' AND
  (public.has_role(auth.uid(), 'operator_admin') OR public.has_role(auth.uid(), 'operator_staff'))
);

CREATE POLICY "Operators can delete news images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'news-images' AND
  (public.has_role(auth.uid(), 'operator_admin') OR public.has_role(auth.uid(), 'operator_staff'))
);

CREATE POLICY "Anyone can view news images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'news-images');