import React from 'react';
import { NewsArticle } from '@/hooks/useNewsArticles';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, Trash2, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface NewsArticleCardProps {
  article: NewsArticle;
  onEdit: (article: NewsArticle) => void;
  onDelete: (id: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export function NewsArticleCard({
  article,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: NewsArticleCardProps) {
  return (
    <Card className="bg-card">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Image preview */}
          {article.image_url && (
            <div className="w-24 h-16 flex-shrink-0">
              <img
                src={article.image_url}
                alt={article.title_hu}
                className="w-full h-full object-cover rounded border border-border"
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-medium text-foreground truncate">
                  {article.title_hu}
                </h3>
                {article.title_en && (
                  <p className="text-sm text-muted-foreground truncate">
                    {article.title_en}
                  </p>
                )}
              </div>
              <Badge variant={article.is_published ? 'default' : 'secondary'}>
                {article.is_published ? (
                  <>
                    <Eye className="w-3 h-3 mr-1" />
                    Publikus
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3 h-3 mr-1" />
                    Rejtett
                  </>
                )}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {article.content_hu.replace(/<[^>]*>/g, '').substring(0, 100)}...
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMoveUp}
              disabled={isFirst}
              className="h-7 w-7"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onMoveDown}
              disabled={isLast}
              className="h-7 w-7"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-col gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(article)}
              className="h-7 w-7"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cikk törlése</AlertDialogTitle>
                  <AlertDialogDescription>
                    Biztosan törölni szeretnéd a "{article.title_hu}" cikket? Ez a művelet nem vonható vissza.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Mégse</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(article.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Törlés
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
