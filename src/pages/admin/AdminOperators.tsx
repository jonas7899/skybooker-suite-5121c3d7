import React, { useState, useEffect } from 'react';
import { UserCog, Search, Plus, MoreVertical, Pencil, Trash2, UserPlus, UserMinus, Users } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
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

interface Operator {
  id: string;
  name: string;
  slug: string;
  subscription_status: string;
  created_at: string;
}

interface AvailableUser {
  id: string;
  full_name: string;
  email: string;
}

const AdminOperators: React.FC = () => {
  const { t, language } = useLanguage();
  const [operators, setOperators] = useState<OperatorStaff[]>([]);
  const [operatorsList, setOperatorsList] = useState<Operator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isRemoveAdminDialogOpen, setIsRemoveAdminDialogOpen] = useState(false);
  const [isStaffDialogOpen, setIsStaffDialogOpen] = useState(false);
  const [isAddStaffDialogOpen, setIsAddStaffDialogOpen] = useState(false);
  const [isRemoveStaffDialogOpen, setIsRemoveStaffDialogOpen] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [selectedAdminToRemove, setSelectedAdminToRemove] = useState<OperatorStaff | null>(null);
  const [selectedStaffToRemove, setSelectedStaffToRemove] = useState<OperatorStaff | null>(null);
  const [operatorStaffList, setOperatorStaffList] = useState<OperatorStaff[]>([]);
  const [newOperatorName, setNewOperatorName] = useState('');
  const [newOperatorSlug, setNewOperatorSlug] = useState('');
  const [selectedAdminUserId, setSelectedAdminUserId] = useState('');
  const [selectedStaffUserId, setSelectedStaffUserId] = useState('');
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [availableStaffUsers, setAvailableStaffUsers] = useState<AvailableUser[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [staffSearchTerm, setStaffSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isRemovingAdmin, setIsRemovingAdmin] = useState(false);
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [isRemovingStaff, setIsRemovingStaff] = useState(false);

  const dateLocale = language === 'hu' ? hu : enUS;

  const fetchOperators = async () => {
    setIsLoading(true);
    try {
      // Fetch all operators
      const { data: allOperators, error: operatorsError } = await supabase
        .from('operators')
        .select('id, name, slug, subscription_status, created_at')
        .order('name');

      if (operatorsError) throw operatorsError;
      setOperatorsList(allOperators || []);

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

  const createOperator = async () => {
    if (!newOperatorName.trim() || !newOperatorSlug.trim()) {
      toast.error(t('admin.operators.fillAllFields'));
      return;
    }

    setIsCreating(true);
    try {
      const { data: newOp, error } = await supabase
        .from('operators')
        .insert({
          name: newOperatorName.trim(),
          slug: newOperatorSlug.trim().toLowerCase().replace(/\s+/g, '-'),
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(t('admin.operators.created'));
      setIsDialogOpen(false);
      setNewOperatorName('');
      setNewOperatorSlug('');
      
      // Open assign admin dialog for the new operator
      if (newOp) {
        setSelectedOperator(newOp);
        setIsAssignDialogOpen(true);
        fetchAvailableUsers();
      }
      
      fetchOperators();
    } catch (error: any) {
      console.error('Error creating operator:', error);
      if (error.code === '23505') {
        toast.error(t('admin.operators.slugExists'));
      } else {
        toast.error(t('error.generic'));
      }
    } finally {
      setIsCreating(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      // Get users who are already operator_admins
      const { data: existingAdmins } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'operator_admin');

      const existingAdminIds = existingAdmins?.map(a => a.user_id) || [];

      // Get all profiles with 'user' role who are not already operator admins
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'user');

      const userIds = userRoles?.map(u => u.user_id).filter(id => !existingAdminIds.includes(id)) || [];

      if (userIds.length === 0) {
        setAvailableUsers([]);
        return;
      }

      // Get profiles for these users
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      const users: AvailableUser[] = (profiles || []).map(p => ({
        id: p.id,
        full_name: p.full_name,
        email: '', // We don't have email from profiles
      }));

      setAvailableUsers(users);
    } catch (error) {
      console.error('Error fetching available users:', error);
    }
  };

  const assignAdminToOperator = async () => {
    if (!selectedOperator || !selectedAdminUserId) {
      toast.error(t('admin.operators.selectUser'));
      return;
    }

    setIsAssigning(true);
    try {
      // Insert new operator_admin role
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: selectedAdminUserId,
          role: 'operator_admin',
          operator_id: selectedOperator.id,
          approved_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success(t('admin.operators.adminAssigned'));
      setIsAssignDialogOpen(false);
      setSelectedOperator(null);
      setSelectedAdminUserId('');
      setUserSearchTerm('');
      fetchOperators();
    } catch (error: any) {
      console.error('Error assigning admin:', error);
      if (error.code === '23505') {
        toast.error(t('admin.operators.adminAlreadyAssigned'));
      } else {
        toast.error(t('error.generic'));
      }
    } finally {
      setIsAssigning(false);
    }
  };

  const openAssignDialog = (operator: Operator) => {
    setSelectedOperator(operator);
    setSelectedAdminUserId('');
    setUserSearchTerm('');
    fetchAvailableUsers();
    setIsAssignDialogOpen(true);
  };

  const filteredAvailableUsers = availableUsers.filter(user =>
    user.full_name.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const filteredAvailableStaffUsers = availableStaffUsers.filter(user =>
    user.full_name.toLowerCase().includes(staffSearchTerm.toLowerCase())
  );

  // Staff management functions
  const fetchOperatorStaff = async (operatorId: string) => {
    try {
      const { data: staffRoles, error } = await supabase
        .from('user_roles')
        .select('id, user_id, role, operator_id, created_at')
        .eq('operator_id', operatorId)
        .eq('role', 'operator_staff');

      if (error) throw error;

      const userIds = staffRoles?.map(r => r.user_id) || [];
      
      if (userIds.length === 0) {
        setOperatorStaffList([]);
        return;
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, phone, status')
        .in('id', userIds);

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      const enrichedStaff: OperatorStaff[] = (staffRoles || []).map(role => ({
        ...role,
        role: role.role as 'operator_admin' | 'operator_staff',
        profile: profilesMap.get(role.user_id) || null,
        operator: null,
      }));

      setOperatorStaffList(enrichedStaff);
    } catch (error) {
      console.error('Error fetching operator staff:', error);
    }
  };

  const fetchAvailableStaffUsers = async (operatorId: string) => {
    try {
      // Get users who are already staff for this operator
      const { data: existingStaff } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('operator_id', operatorId)
        .in('role', ['operator_admin', 'operator_staff']);

      const existingStaffIds = existingStaff?.map(s => s.user_id) || [];

      // Get all profiles with 'user' role who are not already staff
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'user');

      const userIds = userRoles?.map(u => u.user_id).filter(id => !existingStaffIds.includes(id)) || [];

      if (userIds.length === 0) {
        setAvailableStaffUsers([]);
        return;
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      const users: AvailableUser[] = (profiles || []).map(p => ({
        id: p.id,
        full_name: p.full_name,
        email: '',
      }));

      setAvailableStaffUsers(users);
    } catch (error) {
      console.error('Error fetching available staff users:', error);
    }
  };

  const openStaffDialog = (operator: Operator) => {
    setSelectedOperator(operator);
    fetchOperatorStaff(operator.id);
    setIsStaffDialogOpen(true);
  };

  const openAddStaffDialog = () => {
    if (!selectedOperator) return;
    setSelectedStaffUserId('');
    setStaffSearchTerm('');
    fetchAvailableStaffUsers(selectedOperator.id);
    setIsAddStaffDialogOpen(true);
  };

  const addStaffToOperator = async () => {
    if (!selectedOperator || !selectedStaffUserId) {
      toast.error(t('admin.operators.selectUser'));
      return;
    }

    setIsAddingStaff(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: selectedStaffUserId,
          role: 'operator_staff',
          operator_id: selectedOperator.id,
          approved_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success(t('admin.operators.staffAdded'));
      setIsAddStaffDialogOpen(false);
      setSelectedStaffUserId('');
      setStaffSearchTerm('');
      fetchOperatorStaff(selectedOperator.id);
      fetchOperators();
    } catch (error: any) {
      console.error('Error adding staff:', error);
      if (error.code === '23505') {
        toast.error(t('admin.operators.staffAlreadyAssigned'));
      } else {
        toast.error(t('error.generic'));
      }
    } finally {
      setIsAddingStaff(false);
    }
  };

  const openRemoveStaffDialog = (staff: OperatorStaff) => {
    setSelectedStaffToRemove(staff);
    setIsRemoveStaffDialogOpen(true);
  };

  const removeStaffFromOperator = async () => {
    if (!selectedStaffToRemove || !selectedOperator) return;

    setIsRemovingStaff(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', selectedStaffToRemove.id);

      if (error) throw error;

      toast.success(t('admin.operators.staffRemoved'));
      setIsRemoveStaffDialogOpen(false);
      setSelectedStaffToRemove(null);
      fetchOperatorStaff(selectedOperator.id);
      fetchOperators();
    } catch (error) {
      console.error('Error removing staff:', error);
      toast.error(t('error.generic'));
    } finally {
      setIsRemovingStaff(false);
    }
  };

  const toggleStaffStatus = async (staff: OperatorStaff) => {
    if (!staff.profile || !selectedOperator) return;
    
    const newStatus = staff.profile.status === 'active' ? 'suspended' : 'active';
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', staff.user_id);

      if (error) throw error;
      
      toast.success(newStatus === 'active' 
        ? t('admin.operators.staffActivated') 
        : t('admin.operators.staffDeactivated'));
      fetchOperatorStaff(selectedOperator.id);
      fetchOperators();
    } catch (error) {
      console.error('Error updating staff status:', error);
      toast.error(t('error.generic'));
    }
  };

  const handleNameChange = (value: string) => {
    setNewOperatorName(value);
    // Auto-generate slug from name only for new operators
    if (!isEditDialogOpen) {
      setNewOperatorSlug(value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    }
  };

  const openEditDialog = (operator: Operator) => {
    setSelectedOperator(operator);
    setNewOperatorName(operator.name);
    setNewOperatorSlug(operator.slug);
    setIsEditDialogOpen(true);
  };

  const updateOperator = async () => {
    if (!selectedOperator || !newOperatorName.trim() || !newOperatorSlug.trim()) {
      toast.error(t('admin.operators.fillAllFields'));
      return;
    }

    setIsCreating(true);
    try {
      const { error } = await supabase
        .from('operators')
        .update({
          name: newOperatorName.trim(),
          slug: newOperatorSlug.trim().toLowerCase().replace(/\s+/g, '-'),
        })
        .eq('id', selectedOperator.id);

      if (error) throw error;

      toast.success(t('admin.operators.updated'));
      setIsEditDialogOpen(false);
      setSelectedOperator(null);
      setNewOperatorName('');
      setNewOperatorSlug('');
      fetchOperators();
    } catch (error: any) {
      console.error('Error updating operator:', error);
      if (error.code === '23505') {
        toast.error(t('admin.operators.slugExists'));
      } else {
        toast.error(t('error.generic'));
      }
    } finally {
      setIsCreating(false);
    }
  };

  const openDeleteDialog = (operator: Operator) => {
    setSelectedOperator(operator);
    setIsDeleteDialogOpen(true);
  };

  const deleteOperator = async () => {
    if (!selectedOperator) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('operators')
        .delete()
        .eq('id', selectedOperator.id);

      if (error) throw error;

      toast.success(t('admin.operators.deleted'));
      setIsDeleteDialogOpen(false);
      setSelectedOperator(null);
      fetchOperators();
    } catch (error) {
      console.error('Error deleting operator:', error);
      toast.error(t('error.generic'));
    } finally {
      setIsDeleting(false);
    }
  };

  const openRemoveAdminDialog = (admin: OperatorStaff) => {
    setSelectedAdminToRemove(admin);
    setIsRemoveAdminDialogOpen(true);
  };

  const removeAdminFromOperator = async () => {
    if (!selectedAdminToRemove) return;

    setIsRemovingAdmin(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', selectedAdminToRemove.id);

      if (error) throw error;

      toast.success(t('admin.operators.adminRemoved'));
      setIsRemoveAdminDialogOpen(false);
      setSelectedAdminToRemove(null);
      fetchOperators();
    } catch (error) {
      console.error('Error removing admin:', error);
      toast.error(t('error.generic'));
    } finally {
      setIsRemovingAdmin(false);
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
        <Button onClick={() => setIsDialogOpen(true)}>
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
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => openRemoveAdminDialog(operator)}
                              className="text-destructive focus:text-destructive"
                            >
                              <UserMinus className="w-4 h-4 mr-2" />
                              {t('admin.operators.removeAdmin')}
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
      {/* Operators List */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.operators.operatorsList')}</CardTitle>
        </CardHeader>
        <CardContent>
          {operatorsList.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{t('admin.operators.noOperators')}</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('admin.operators.operatorName')}</TableHead>
                    <TableHead>{t('admin.operators.operatorSlug')}</TableHead>
                    <TableHead>{t('admin.operators.status')}</TableHead>
                    <TableHead>{t('admin.operators.createdAt')}</TableHead>
                    <TableHead className="text-right">{t('admin.operators.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {operatorsList.map((op) => (
                    <TableRow key={op.id}>
                      <TableCell className="font-medium">{op.name}</TableCell>
                      <TableCell className="text-muted-foreground">{op.slug}</TableCell>
                      <TableCell>
                        <Badge variant={op.subscription_status === 'active' ? 'default' : 'secondary'}>
                          {op.subscription_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(op.created_at), 'PP', { locale: dateLocale })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openStaffDialog(op)} title={t('admin.operators.manageStaff')}>
                            <Users className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openAssignDialog(op)} title={t('admin.operators.assignAdmin')}>
                            <UserPlus className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(op)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(op)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Operator Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.operators.newTitle')}</DialogTitle>
            <DialogDescription>{t('admin.operators.newDescription')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="operatorName">{t('admin.operators.operatorName')}</Label>
              <Input
                id="operatorName"
                value={newOperatorName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder={t('admin.operators.operatorNamePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="operatorSlug">{t('admin.operators.operatorSlug')}</Label>
              <Input
                id="operatorSlug"
                value={newOperatorSlug}
                onChange={(e) => setNewOperatorSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
                placeholder={t('admin.operators.operatorSlugPlaceholder')}
              />
              <p className="text-xs text-muted-foreground">{t('admin.operators.slugHint')}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={createOperator} disabled={isCreating}>
              {isCreating ? t('common.loading') : t('admin.operators.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Operator Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.operators.editTitle')}</DialogTitle>
            <DialogDescription>{t('admin.operators.editDescription')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editOperatorName">{t('admin.operators.operatorName')}</Label>
              <Input
                id="editOperatorName"
                value={newOperatorName}
                onChange={(e) => setNewOperatorName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editOperatorSlug">{t('admin.operators.operatorSlug')}</Label>
              <Input
                id="editOperatorSlug"
                value={newOperatorSlug}
                onChange={(e) => setNewOperatorSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
              />
              <p className="text-xs text-muted-foreground">{t('admin.operators.slugHint')}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={updateOperator} disabled={isCreating}>
              {isCreating ? t('common.loading') : t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.operators.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.operators.deleteDescription')} ({selectedOperator?.name})
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={deleteOperator} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? t('common.loading') : t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Assign Admin Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.operators.assignAdminTitle')}</DialogTitle>
            <DialogDescription>
              {t('admin.operators.assignAdminDescription')} {selectedOperator?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('admin.operators.selectUser')}</Label>
              <Input
                placeholder={t('admin.operators.searchUser')}
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="mb-2"
              />
              <div className="max-h-48 overflow-y-auto border rounded-md">
                {filteredAvailableUsers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4 text-sm">
                    {t('admin.operators.noUsersAvailable')}
                  </p>
                ) : (
                  filteredAvailableUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`p-3 cursor-pointer hover:bg-accent border-b last:border-b-0 transition-colors ${
                        selectedAdminUserId === user.id ? 'bg-accent' : ''
                      }`}
                      onClick={() => setSelectedAdminUserId(user.id)}
                    >
                      <p className="font-medium">{user.full_name}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={assignAdminToOperator} disabled={isAssigning || !selectedAdminUserId}>
              {isAssigning ? t('common.loading') : t('admin.operators.assign')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Admin Confirmation Dialog */}
      <AlertDialog open={isRemoveAdminDialogOpen} onOpenChange={setIsRemoveAdminDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.operators.removeAdminTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.operators.removeAdminDescription')} ({selectedAdminToRemove?.profile?.full_name} - {selectedAdminToRemove?.operator?.name})
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={removeAdminFromOperator} disabled={isRemovingAdmin} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isRemovingAdmin ? t('common.loading') : t('admin.operators.removeAdmin')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Staff Management Dialog */}
      <Dialog open={isStaffDialogOpen} onOpenChange={setIsStaffDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('admin.operators.manageStaffTitle')}</DialogTitle>
            <DialogDescription>
              {t('admin.operators.manageStaffDescription')} {selectedOperator?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">{t('admin.operators.staffMembers')}</h4>
              <Button onClick={openAddStaffDialog} size="sm">
                <UserPlus className="w-4 h-4 mr-2" />
                {t('admin.operators.addStaff')}
              </Button>
            </div>
            {operatorStaffList.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">
                {t('admin.operators.noStaffMembers')}
              </p>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('admin.operators.name')}</TableHead>
                      <TableHead>{t('admin.operators.status')}</TableHead>
                      <TableHead>{t('admin.operators.createdAt')}</TableHead>
                      <TableHead className="text-right">{t('admin.operators.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {operatorStaffList.map((staff) => (
                      <TableRow key={staff.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{staff.profile?.full_name || '-'}</p>
                            <p className="text-sm text-muted-foreground">{staff.profile?.phone || '-'}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(staff.profile?.status)}</TableCell>
                        <TableCell>
                          {format(new Date(staff.created_at), 'PP', { locale: dateLocale })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => toggleStaffStatus(staff)}
                            >
                              {staff.profile?.status === 'active' 
                                ? t('admin.operators.deactivate') 
                                : t('admin.operators.activate')}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => openRemoveStaffDialog(staff)}
                            >
                              <UserMinus className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStaffDialogOpen(false)}>
              {t('common.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Staff Dialog */}
      <Dialog open={isAddStaffDialogOpen} onOpenChange={setIsAddStaffDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.operators.addStaffTitle')}</DialogTitle>
            <DialogDescription>
              {t('admin.operators.addStaffDescription')} {selectedOperator?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('admin.operators.selectUser')}</Label>
              <Input
                placeholder={t('admin.operators.searchUser')}
                value={staffSearchTerm}
                onChange={(e) => setStaffSearchTerm(e.target.value)}
                className="mb-2"
              />
              <div className="max-h-48 overflow-y-auto border rounded-md">
                {filteredAvailableStaffUsers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4 text-sm">
                    {t('admin.operators.noUsersAvailable')}
                  </p>
                ) : (
                  filteredAvailableStaffUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`p-3 cursor-pointer hover:bg-accent border-b last:border-b-0 transition-colors ${
                        selectedStaffUserId === user.id ? 'bg-accent' : ''
                      }`}
                      onClick={() => setSelectedStaffUserId(user.id)}
                    >
                      <p className="font-medium">{user.full_name}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddStaffDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={addStaffToOperator} disabled={isAddingStaff || !selectedStaffUserId}>
              {isAddingStaff ? t('common.loading') : t('admin.operators.addStaff')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Staff Confirmation Dialog */}
      <AlertDialog open={isRemoveStaffDialogOpen} onOpenChange={setIsRemoveStaffDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.operators.removeStaffTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.operators.removeStaffDescription')} ({selectedStaffToRemove?.profile?.full_name})
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={removeStaffFromOperator} disabled={isRemovingStaff} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isRemovingStaff ? t('common.loading') : t('admin.operators.removeStaff')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminOperators;
