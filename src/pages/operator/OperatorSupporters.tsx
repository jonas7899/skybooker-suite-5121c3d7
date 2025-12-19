import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserSupports, UserSupportEntry } from '@/hooks/useUserSupports';
import { useOperatorSupportTiers, SupportTier } from '@/hooks/useSupportTier';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Plus, Users, Medal, CheckCircle, Search, Euro, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';

const OperatorSupporters: React.FC = () => {
  const { userRole } = useAuth();
  const operatorId = userRole?.operator_id || undefined;
  const { supports, users, isLoading, createSupport, refetch } = useUserSupports(operatorId);
  const { tiers } = useOperatorSupportTiers(operatorId);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedTierId, setSelectedTierId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !selectedTierId || !amount) {
      toast.error('Kérlek töltsd ki az összes kötelező mezőt');
      return;
    }

    setIsSubmitting(true);
    const { error } = await createSupport({
      user_id: selectedUserId,
      support_tier_id: selectedTierId,
      amount_eur: parseFloat(amount),
      payment_date: paymentDate,
      notes: notes || undefined,
    });

    if (error) {
      toast.error('Hiba történt a támogatás rögzítésekor');
    } else {
      toast.success('Támogatás sikeresen rögzítve, értesítés elküldve');
      setIsDialogOpen(false);
      resetForm();
    }
    setIsSubmitting(false);
  };

  const resetForm = () => {
    setSelectedUserId('');
    setSelectedTierId('');
    setAmount('');
    setPaymentDate(format(new Date(), 'yyyy-MM-dd'));
    setNotes('');
  };

  const getTierBadge = (tier?: SupportTier) => {
    if (!tier) return null;
    return (
      <Badge
        style={{ backgroundColor: tier.color || '#CD7F32' }}
        className="text-white"
      >
        {tier.name}
      </Badge>
    );
  };

  const filteredSupports = supports.filter(support =>
    support.user_profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get users who don't have an active (unused) support
  const availableUsers = users.filter(u => 
    !supports.some(s => s.user_id === u.id && !s.booking_used)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Támogatók kezelése</h1>
          <p className="text-muted-foreground">
            Rögzítsd a beérkezett támogatásokat és küldj értesítést a felhasználóknak
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Új támogatás rögzítése
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Támogatás rögzítése</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user">Felhasználó *</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Válassz felhasználót..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        Nincs elérhető felhasználó
                      </div>
                    ) : (
                      availableUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tier">Támogatói fokozat *</Label>
                <Select value={selectedTierId} onValueChange={setSelectedTierId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Válassz fokozatot..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tiers.filter(t => t.is_active).map((tier) => (
                      <SelectItem key={tier.id} value={tier.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: tier.color || '#CD7F32' }}
                          />
                          {tier.name} ({tier.min_amount_eur}+ EUR)
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Összeg (EUR) *</Label>
                  <div className="relative">
                    <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="number"
                      min="1"
                      step="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-9"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Befizetés dátuma *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="date"
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Megjegyzés</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Opcionális megjegyzés..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Mégse
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Rögzítés és értesítés küldése
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{supports.length}</p>
                <p className="text-sm text-muted-foreground">Összes támogatás</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Medal className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {supports.filter(s => !s.booking_used).length}
                </p>
                <p className="text-sm text-muted-foreground">Aktív támogatás</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {supports.filter(s => s.booking_used).length}
                </p>
                <p className="text-sm text-muted-foreground">Felhasznált</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Keresés név alapján..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Támogatások listája</CardTitle>
          <CardDescription>
            Az összes rögzített támogatás és azok státusza
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSupports.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Medal className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Még nincs rögzített támogatás</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Támogató</TableHead>
                    <TableHead>Fokozat</TableHead>
                    <TableHead>Összeg</TableHead>
                    <TableHead>Befizetés</TableHead>
                    <TableHead>Státusz</TableHead>
                    <TableHead>Megjegyzés</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSupports.map((support) => (
                    <TableRow key={support.id}>
                      <TableCell className="font-medium">
                        {support.user_profile?.full_name || 'Ismeretlen'}
                      </TableCell>
                      <TableCell>
                        {getTierBadge(support.support_tier as SupportTier)}
                      </TableCell>
                      <TableCell>{support.amount_eur} EUR</TableCell>
                      <TableCell>
                        {format(new Date(support.payment_date), 'yyyy. MMM d.', { locale: hu })}
                      </TableCell>
                      <TableCell>
                        {support.booking_used ? (
                          <Badge variant="secondary">Felhasználva</Badge>
                        ) : (
                          <Badge className="bg-green-500 text-white">Aktív</Badge>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {support.notes || '-'}
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

export default OperatorSupporters;
