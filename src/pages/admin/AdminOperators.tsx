import React, { useState } from 'react';
import { Building2, Search, Plus, MoreVertical, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminOperators } from '@/hooks/useSubscription';
import { useLanguage } from '@/contexts/LanguageContext';
import SubscriptionStatusBadge from '@/components/subscription/SubscriptionStatusBadge';
import { SubscriptionStatus } from '@/types/subscription';
import { format } from 'date-fns';
import { hu, enUS } from 'date-fns/locale';

const AdminOperators: React.FC = () => {
  const { operators, isLoading, updateOperatorStatus, extendSubscription } = useAdminOperators();
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const dateLocale = language === 'hu' ? hu : enUS;

  const filteredOperators = operators.filter(op => {
    const matchesSearch = op.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || op.subscription_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: operators.length,
    active: operators.filter(op => op.subscription_status === 'active').length,
    trial: operators.filter(op => op.subscription_status === 'trial').length,
    expired: operators.filter(op => op.subscription_status === 'expired').length,
  };

  const getDaysRemaining = (expiresAt?: string) => {
    if (!expiresAt) return undefined;
    const now = new Date();
    const expiry = new Date(expiresAt);
    const days = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
            {t('admin.operators.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('admin.operators.subtitle')}
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          {t('admin.operators.new')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">{t('admin.operators.total')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">{stats.active}</div>
            <p className="text-xs text-muted-foreground">{t('admin.operators.activeSubscription')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-500">{stats.trial}</div>
            <p className="text-xs text-muted-foreground">{t('admin.operators.trial')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-destructive">{stats.expired}</div>
            <p className="text-xs text-muted-foreground">{t('admin.operators.expired')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            {t('admin.operators.list')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('admin.operators.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder={t('admin.operators.statusFilter')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.operators.allStatus')}</SelectItem>
                <SelectItem value="active">{t('admin.operators.active')}</SelectItem>
                <SelectItem value="trial">{t('admin.operators.trial')}</SelectItem>
                <SelectItem value="expired">{t('admin.operators.expired')}</SelectItem>
                <SelectItem value="cancelled">{t('admin.operators.cancelled')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredOperators.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">{t('admin.operators.noResults')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('admin.operators.operator')}</TableHead>
                    <TableHead>{t('admin.operators.status')}</TableHead>
                    <TableHead>{t('admin.operators.expiry')}</TableHead>
                    <TableHead>{t('admin.operators.fee')}</TableHead>
                    <TableHead className="text-right">{t('admin.operators.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOperators.map((operator) => (
                    <TableRow key={operator.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{operator.name}</p>
                          <p className="text-sm text-muted-foreground">{operator.slug}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <SubscriptionStatusBadge 
                          status={operator.subscription_status as SubscriptionStatus}
                          daysRemaining={getDaysRemaining(operator.subscription_expires_at)}
                        />
                      </TableCell>
                      <TableCell>
                        {operator.subscription_expires_at 
                          ? format(new Date(operator.subscription_expires_at), 'PP', { locale: dateLocale })
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {operator.subscription_price_huf?.toLocaleString(language === 'hu' ? 'hu-HU' : 'en-US')} {language === 'hu' ? 'Ft/hó' : 'HUF/mo'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{t('admin.operators.actions')}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => updateOperatorStatus(operator.id, 'active')}
                            >
                              {t('admin.operators.activate')}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => extendSubscription(operator.id, 1)}
                            >
                              <Calendar className="w-4 h-4 mr-2" />
                              {t('admin.operators.addMonth')}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => extendSubscription(operator.id, 12)}
                            >
                              <Calendar className="w-4 h-4 mr-2" />
                              {t('admin.operators.addYear')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => updateOperatorStatus(operator.id, 'expired')}
                              className="text-destructive"
                            >
                              {t('admin.operators.markExpired')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOperators;
