import React, { useState } from 'react';
import { Users, Check, X, Phone, Mail, Clock, Search, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';
import { hu, enUS } from 'date-fns/locale';

const AdminUsers: React.FC = () => {
  const { pendingUsers, allUsers, isLoading, approveUser, rejectUser, suspendUser, activateUser } = useAdminUsers();
  const { user } = useAuth();
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const t = (hu_text: string, en_text: string) => language === 'hu' ? hu_text : en_text;
  const dateLocale = language === 'hu' ? hu : enUS;

  const handleApprove = async (userId: string) => {
    if (user) {
      await approveUser(userId, user.id);
    }
  };

  const handleRejectClick = (userId: string) => {
    setSelectedUserId(userId);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (selectedUserId) {
      await rejectUser(selectedUserId, rejectionReason);
      setRejectDialogOpen(false);
      setSelectedUserId(null);
      setRejectionReason('');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      active: { label: t('Aktív', 'Active'), variant: 'default' },
      pending: { label: t('Várakozó', 'Pending'), variant: 'secondary' },
      rejected: { label: t('Elutasítva', 'Rejected'), variant: 'destructive' },
      suspended: { label: t('Felfüggesztve', 'Suspended'), variant: 'destructive' },
      inactive: { label: t('Inaktív', 'Inactive'), variant: 'outline' },
      bootstrap: { label: 'Bootstrap', variant: 'outline' },
    };
    const badge = badges[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={badge.variant}>{badge.label}</Badge>;
  };

  const getRoleBadge = (role?: string) => {
    if (!role) return null;
    const roles: Record<string, string> = {
      super_admin: 'Super Admin',
      operator_admin: 'Operator Admin',
      operator_staff: t('Stáb', 'Staff'),
      user: t('Felhasználó', 'User'),
    };
    return <Badge variant="outline">{roles[role] || role}</Badge>;
  };

  const filteredActiveUsers = allUsers
    .filter(u => u.status !== 'pending')
    .filter(u => 
      u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone && u.phone.includes(searchTerm))
    );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
          {t('Felhasználók', 'Users')}
        </h1>
        <p className="text-muted-foreground">
          {t('Felhasználók kezelése és jóváhagyása', 'Manage and approve users')}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{allUsers.length}</div>
            <p className="text-xs text-muted-foreground">{t('Összes felhasználó', 'Total Users')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-500">{pendingUsers.length}</div>
            <p className="text-xs text-muted-foreground">{t('Jóváhagyásra vár', 'Pending Approval')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">
              {allUsers.filter(u => u.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">{t('Aktív', 'Active')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-destructive">
              {allUsers.filter(u => u.status === 'suspended' || u.status === 'rejected').length}
            </div>
            <p className="text-xs text-muted-foreground">{t('Tiltott/Elutasított', 'Suspended/Rejected')}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="relative">
            {t('Jóváhagyásra vár', 'Pending')}
            {pendingUsers.length > 0 && (
              <span className="ml-2 bg-yellow-500 text-white text-xs rounded-full px-2 py-0.5">
                {pendingUsers.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">{t('Összes felhasználó', 'All Users')}</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {t('Jóváhagyásra váró felhasználók', 'Pending Users')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingUsers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">
                    {t('Nincs jóváhagyásra váró felhasználó', 'No pending users')}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingUsers.map((pendingUser) => (
                    <div
                      key={pendingUser.id}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg gap-4"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{pendingUser.full_name}</p>
                        {pendingUser.phone && (
                          <a
                            href={`tel:${pendingUser.phone}`}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                          >
                            <Phone className="w-4 h-4" />
                            {pendingUser.phone}
                          </a>
                        )}
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {pendingUser.id}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t('Regisztrált:', 'Registered:')}{' '}
                          {format(new Date(pendingUser.created_at), 'PPp', { locale: dateLocale })}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleApprove(pendingUser.id)}
                          className="gap-2"
                        >
                          <Check className="w-4 h-4" />
                          {t('Jóváhagyás', 'Approve')}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRejectClick(pendingUser.id)}
                          className="gap-2"
                        >
                          <X className="w-4 h-4" />
                          {t('Elutasítás', 'Reject')}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {t('Összes felhasználó', 'All Users')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={t('Keresés név vagy telefonszám alapján...', 'Search by name or phone...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {filteredActiveUsers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">
                    {t('Nincs találat', 'No results')}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('Név', 'Name')}</TableHead>
                        <TableHead>{t('Telefonszám', 'Phone')}</TableHead>
                        <TableHead>{t('Szerepkör', 'Role')}</TableHead>
                        <TableHead>{t('Státusz', 'Status')}</TableHead>
                        <TableHead>{t('Regisztráció', 'Registered')}</TableHead>
                        <TableHead className="text-right">{t('Műveletek', 'Actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredActiveUsers.map((listUser) => (
                        <TableRow key={listUser.id}>
                          <TableCell className="font-medium">{listUser.full_name}</TableCell>
                          <TableCell>
                            {listUser.phone ? (
                              <a
                                href={`tel:${listUser.phone}`}
                                className="text-primary hover:underline"
                              >
                                {listUser.phone}
                              </a>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>{getRoleBadge(listUser.role?.role)}</TableCell>
                          <TableCell>{getStatusBadge(listUser.status)}</TableCell>
                          <TableCell>
                            {format(new Date(listUser.created_at), 'PP', { locale: dateLocale })}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>{t('Műveletek', 'Actions')}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {listUser.status !== 'active' && (
                                  <DropdownMenuItem onClick={() => activateUser(listUser.id)}>
                                    {t('Aktiválás', 'Activate')}
                                  </DropdownMenuItem>
                                )}
                                {listUser.status === 'active' && (
                                  <DropdownMenuItem
                                    onClick={() => suspendUser(listUser.id)}
                                    className="text-destructive"
                                  >
                                    {t('Felfüggesztés', 'Suspend')}
                                  </DropdownMenuItem>
                                )}
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
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('Regisztráció elutasítása', 'Reject Registration')}
            </DialogTitle>
            <DialogDescription>
              {t(
                'A felhasználó 24 óra múlva újra regisztrálhat.',
                'The user can register again after 24 hours.'
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder={t('Elutasítás indoklása (opcionális)', 'Rejection reason (optional)')}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              {t('Mégse', 'Cancel')}
            </Button>
            <Button variant="destructive" onClick={handleRejectConfirm}>
              {t('Elutasítás', 'Reject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
