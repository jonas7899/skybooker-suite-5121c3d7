import React, { useState, useEffect } from 'react';
import { UserCog, Search, Plus, MoreVertical } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { hu, enUS } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface OperatorStaff {
  id: string;
  user_id: string;
  role: 'operator_admin' | 'operator_staff';
  operator_id: string | null;
  created_at: string;
  profile: {
    full_name: string;
    phone: string | null;
    status: string;
  } | null;
  operator: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

const AdminOperators: React.FC = () => {
  const { t, language } = useLanguage();
  const [operators, setOperators] = useState<OperatorStaff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const dateLocale = language === 'hu' ? hu : enUS;

  const fetchOperators = async () => {
    setIsLoading(true);
    try {
      // Fetch users with operator_admin or operator_staff roles
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select(`
          id,
          user_id,
          role,
          operator_id,
          created_at
        `)
        .in('role', ['operator_admin', 'operator_staff']);

      if (roleError) throw roleError;

      // Fetch profiles and operators for these users
      const userIds = roleData?.map(r => r.user_id) || [];
      const operatorIds = roleData?.filter(r => r.operator_id).map(r => r.operator_id) || [];

      const [profilesResult, operatorsResult] = await Promise.all([
        supabase.from('profiles').select('id, full_name, phone, status').in('id', userIds),
        supabase.from('operators').select('id, name, slug').in('id', operatorIds)
      ]);

      if (profilesResult.error) throw profilesResult.error;
      if (operatorsResult.error) throw operatorsResult.error;

      const profilesMap = new Map(profilesResult.data?.map(p => [p.id, p]) || []);
      const operatorsMap = new Map(operatorsResult.data?.map(o => [o.id, o]) || []);

      const enrichedData: OperatorStaff[] = (roleData || []).map(role => ({
        ...role,
        role: role.role as 'operator_admin' | 'operator_staff',
        profile: profilesMap.get(role.user_id) || null,
        operator: role.operator_id ? operatorsMap.get(role.operator_id) || null : null,
      }));

      setOperators(enrichedData);
    } catch (error) {
      console.error('Error fetching operators:', error);
      toast.error(t('error.generic'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOperators();
  }, []);

  const toggleOperatorStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', userId);

      if (error) throw error;
      toast.success(newStatus === 'active' ? t('admin.operators.activated') : t('admin.operators.deactivated'));
      fetchOperators();
    } catch (error) {
      console.error('Error updating operator status:', error);
      toast.error(t('error.generic'));
    }
  };

  const filteredOperators = operators.filter(op => {
    const matchesSearch = 
      op.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.operator?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || op.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || op.profile?.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: operators.length,
    admins: operators.filter(op => op.role === 'operator_admin').length,
    staff: operators.filter(op => op.role === 'operator_staff').length,
    active: operators.filter(op => op.profile?.status === 'active').length,
  };

  const getRoleBadge = (role: string) => {
    if (role === 'operator_admin') {
      return <Badge variant="default">{t('admin.operators.roleAdmin')}</Badge>;
    }
    return <Badge variant="secondary">{t('admin.operators.roleStaff')}</Badge>;
  };

  const getStatusBadge = (status: string | undefined) => {
    if (status === 'active') {
      return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">{t('admin.operators.statusActive')}</Badge>;
    }
    if (status === 'suspended') {
      return <Badge variant="destructive">{t('admin.operators.statusSuspended')}</Badge>;
    }
    return <Badge variant="outline">{status || '-'}</Badge>;
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
            <div className="text-2xl font-bold text-primary">{stats.admins}</div>
            <p className="text-xs text-muted-foreground">{t('admin.operators.admins')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-500">{stats.staff}</div>
            <p className="text-xs text-muted-foreground">{t('admin.operators.staffCount')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">{stats.active}</div>
            <p className="text-xs text-muted-foreground">{t('admin.operators.activeCount')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="w-5 h-5" />
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
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder={t('admin.operators.roleFilter')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.operators.allRoles')}</SelectItem>
                <SelectItem value="operator_admin">{t('admin.operators.roleAdmin')}</SelectItem>
                <SelectItem value="operator_staff">{t('admin.operators.roleStaff')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder={t('admin.operators.statusFilter')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.operators.allStatus')}</SelectItem>
                <SelectItem value="active">{t('admin.operators.statusActive')}</SelectItem>
                <SelectItem value="suspended">{t('admin.operators.statusSuspended')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredOperators.length === 0 ? (
            <div className="text-center py-12">
              <UserCog className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">{t('admin.operators.noResults')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('admin.operators.name')}</TableHead>
                    <TableHead>{t('admin.operators.subscriber')}</TableHead>
                    <TableHead>{t('admin.operators.role')}</TableHead>
                    <TableHead>{t('admin.operators.status')}</TableHead>
                    <TableHead>{t('admin.operators.createdAt')}</TableHead>
                    <TableHead className="text-right">{t('admin.operators.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOperators.map((operator) => (
                    <TableRow key={operator.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{operator.profile?.full_name || '-'}</p>
                          <p className="text-sm text-muted-foreground">{operator.profile?.phone || '-'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {operator.operator ? (
                          <Link 
                            to={`/admin/subscribers/${operator.operator.id}`}
                            className="text-primary hover:underline"
                          >
                            {operator.operator.name}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(operator.role)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(operator.profile?.status)}
                      </TableCell>
                      <TableCell>
                        {format(new Date(operator.created_at), 'PP', { locale: dateLocale })}
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
                              onClick={() => toggleOperatorStatus(operator.user_id, operator.profile?.status || '')}
                            >
                              {operator.profile?.status === 'active' 
                                ? t('admin.operators.deactivate') 
                                : t('admin.operators.activate')}
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
