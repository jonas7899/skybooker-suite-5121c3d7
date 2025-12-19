import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNewsArticles, NewsArticle, NewsArticleFormData } from '@/hooks/useNewsArticles';
import { NewsArticleForm } from '@/components/news/NewsArticleForm';
import { NewsArticleCard } from '@/components/news/NewsArticleCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Newspaper, Loader2 } from 'lucide-react';

const OperatorNews: React.FC = () => {
  const { userRole } = useAuth();
  const operatorId = userRole?.operator_id;
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);

  const {
    articles,
    isLoading,
    createArticle,
    updateArticle,
    deleteArticle,
    reorderArticles,
  } = useNewsArticles(operatorId || undefined);

  const handleSubmit = async (data: NewsArticleFormData) => {
    if (editingArticle) {
      await updateArticle.mutateAsync({ id: editingArticle.id, ...data });
    } else if (operatorId) {
      await createArticle.mutateAsync({ ...data, operator_id: operatorId });
    }
    setIsFormOpen(false);
    setEditingArticle(null);
  };

  const handleEdit = (article: NewsArticle) => {
    setEditingArticle(article);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteArticle.mutateAsync(id);
  };

  const handleMoveUp = async (index: number) => {
    if (!articles || index === 0) return;
    
    const newArticles = [...articles];
    const temp = newArticles[index];
    newArticles[index] = newArticles[index - 1];
    newArticles[index - 1] = temp;

    await reorderArticles.mutateAsync(
      newArticles.map((a, i) => ({ id: a.id, sort_order: i }))
    );
  };

  const handleMoveDown = async (index: number) => {
    if (!articles || index === articles.length - 1) return;
    
    const newArticles = [...articles];
    const temp = newArticles[index];
    newArticles[index] = newArticles[index + 1];
    newArticles[index + 1] = temp;

    await reorderArticles.mutateAsync(
      newArticles.map((a, i) => ({ id: a.id, sort_order: i }))
    );
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingArticle(null);
  };

  // Check if user is allowed to create/edit
  const canEdit = userRole?.role === 'operator_admin';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Hírek kezelése
          </h1>
          <p className="text-muted-foreground">
            A nyilvános Hírek oldalon megjelenő cikkek szerkesztése
          </p>
        </div>
        {canEdit && (
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Új cikk
          </Button>
        )}
      </div>

      {articles && articles.length > 0 ? (
        <div className="space-y-3">
          {articles.map((article, index) => (
            <NewsArticleCard
              key={article.id}
              article={article}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onMoveUp={() => handleMoveUp(index)}
              onMoveDown={() => handleMoveDown(index)}
              isFirst={index === 0}
              isLast={index === articles.length - 1}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Newspaper className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nincs még cikk
              </h3>
              <p className="text-muted-foreground mb-4">
                Hozd létre az első cikket a Hírek oldalhoz
              </p>
              {canEdit && (
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Új cikk létrehozása
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <NewsArticleForm
        open={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        article={editingArticle}
        isLoading={createArticle.isPending || updateArticle.isPending}
      />
    </div>
  );
};

export default OperatorNews;
