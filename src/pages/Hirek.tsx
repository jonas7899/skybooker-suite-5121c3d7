import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNewsArticles } from '@/hooks/useNewsArticles';
import { Loader2 } from 'lucide-react';

const Hirek: React.FC = () => {
  const { language } = useLanguage();
  const { articles, isLoading } = useNewsArticles();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl md:text-3xl font-display font-bold text-primary mb-6">
        {language === 'hu' ? 'Hírek, információk' : 'News & Information'}
      </h2>

      {articles && articles.length > 0 ? (
        <div className="space-y-8">
          {articles.map((article, index) => (
            <article
              key={article.id}
              className={index < articles.length - 1 ? 'border-b border-border pb-8' : 'pb-6'}
            >
              <div className="flex flex-col md:flex-row gap-6">
                {article.image_url && (
                  <div className="md:w-48 flex-shrink-0">
                    <img
                      src={article.image_url}
                      alt={language === 'hu' ? article.title_hu : (article.title_en || article.title_hu)}
                      className="w-full h-auto rounded-lg border border-border shadow-md"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-display font-semibold text-foreground mb-3">
                    {language === 'hu' ? article.title_hu : (article.title_en || article.title_hu)}
                  </h3>
                  <div
                    className="prose prose-sm max-w-none text-foreground space-y-3"
                    dangerouslySetInnerHTML={{
                      __html: language === 'hu'
                        ? article.content_hu
                        : (article.content_en || article.content_hu),
                    }}
                  />
                  {article.link_url && (
                    <p className="mt-3">
                      <a
                        href={article.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {language === 'hu'
                          ? (article.link_text_hu || 'Bővebben')
                          : (article.link_text_en || article.link_text_hu || 'Read more')}
                      </a>
                    </p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {language === 'hu'
              ? 'Jelenleg nincsenek hírek.'
              : 'No news available at the moment.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Hirek;
