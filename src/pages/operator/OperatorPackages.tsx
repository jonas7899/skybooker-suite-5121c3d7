import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useOperatorSupportTiers } from '@/hooks/useSupportTier';
import { supabase } from '@/integrations/supabase/client';
import { FlightPackage } from '@/types/scheduling';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Plane, Clock, Users, Medal } from 'lucide-react';

interface PackageFormData {
  name: string;
  short_description: string;
  detailed_description: string;
  route_description: string;
  duration_minutes: number;
  difficulty_level: string;
  recommended_audience: string;
  base_price_huf: number;
  max_passengers: number;
  min_support_tier_id: string | null;
  is_active: boolean;
}

const defaultFormData: PackageFormData = {
  name: '',
  short_description: '',
  detailed_description: '',
  route_description: '',
  duration_minutes: 30,
  difficulty_level: 'easy',
  recommended_audience: '',
  base_price_huf: 0,
  max_passengers: 1,
  min_support_tier_id: null,
  is_active: true,
};

const OperatorPackages: React.FC = () => {
  const { language } = useLanguage();
  const { userRole } = useAuth();
  const operatorId = userRole?.operator_id;
  const { tiers } = useOperatorSupportTiers(operatorId || undefined);

  const [packages, setPackages] = useState<FlightPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<FlightPackage | null>(null);
  const [formData, setFormData] = useState<PackageFormData>(defaultFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchPackages = async () => {
    if (!operatorId) return;

    try {
      const { data, error } = await supabase
        .from('flight_packages')
        .select('*, min_support_tier:support_tiers(id, name, sort_order, color, icon)')
        .eq('operator_id', operatorId)
        .order('name');

      if (error) throw error;
      setPackages(data as FlightPackage[]);
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast.error(language === 'hu' ? 'Hiba a csomagok betöltésekor' : 'Error loading packages');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [operatorId]);

  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingPackage(null);
  };

  const handleOpenDialog = (pkg?: FlightPackage) => {
    if (pkg) {
      setEditingPackage(pkg);
      setFormData({
        name: pkg.name,
        short_description: pkg.short_description || '',
        detailed_description: pkg.detailed_description || '',
        route_description: pkg.route_description || '',
        duration_minutes: pkg.duration_minutes,
        difficulty_level: pkg.difficulty_level,
        recommended_audience: pkg.recommended_audience || '',
        base_price_huf: pkg.base_price_huf,
        max_passengers: pkg.max_passengers,
        min_support_tier_id: pkg.min_support_tier_id || null,
        is_active: pkg.is_active,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!operatorId) return;

    setIsSaving(true);
    try {
      const packageData = {
        ...formData,
        operator_id: operatorId,
        min_support_tier_id: formData.min_support_tier_id || null,
      };

      if (editingPackage) {
        const { error } = await supabase
          .from('flight_packages')
          .update(packageData)
          .eq('id', editingPackage.id);

        if (error) throw error;
        toast.success(language === 'hu' ? 'Csomag frissítve!' : 'Package updated!');
      } else {
        const { error } = await supabase
          .from('flight_packages')
          .insert(packageData);

        if (error) throw error;
        toast.success(language === 'hu' ? 'Csomag létrehozva!' : 'Package created!');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchPackages();
    } catch (error) {
      console.error('Error saving package:', error);
      toast.error(language === 'hu' ? 'Hiba történt' : 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from('flight_packages')
        .update({ is_active: false })
        .eq('id', deleteId);

      if (error) throw error;
      toast.success(language === 'hu' ? 'Csomag törölve!' : 'Package deleted!');
      fetchPackages();
    } catch (error) {
      console.error('Error deleting package:', error);
      toast.error(language === 'hu' ? 'Hiba történt' : 'An error occurred');
    } finally {
      setDeleteId(null);
    }
  };

  const getDifficultyLabel = (level: string) => {
    const labels: Record<string, { hu: string; en: string }> = {
      easy: { hu: 'Könnyű', en: 'Easy' },
      medium: { hu: 'Közepes', en: 'Medium' },
      aerobatic: { hu: 'Műrepülés', en: 'Aerobatic' },
    };
    return labels[level]?.[language] || level;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
            {language === 'hu' ? 'Repülési csomagok' : 'Flight Packages'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'hu' 
              ? 'Hozz létre és kezelj repülési élményeket' 
              : 'Create and manage flight experiences'}
          </p>
        </div>
        <Button variant="gradient" onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          {language === 'hu' ? 'Új csomag' : 'New Package'}
        </Button>
      </div>

      {packages.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
            <Plane className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-display font-semibold mb-2">
            {language === 'hu' ? 'Még nincs csomag' : 'No packages yet'}
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            {language === 'hu' 
              ? 'Hozd létre az első repülési csomagodat, hogy az ügyfelek foglalhassanak.' 
              : 'Create your first flight package so customers can make bookings.'}
          </p>
          <Button variant="gradient" onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            {language === 'hu' ? 'Első csomag létrehozása' : 'Create First Package'}
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <Card key={pkg.id} className={!pkg.is_active ? 'opacity-60' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
                      {pkg.name}
                      {!pkg.is_active && (
                        <Badge variant="secondary">
                          {language === 'hu' ? 'Inaktív' : 'Inactive'}
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {pkg.short_description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {pkg.duration_minutes} {language === 'hu' ? 'perc' : 'min'}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    max {pkg.max_passengers} {language === 'hu' ? 'fő' : 'pax'}
                  </Badge>
                  <Badge variant="secondary">
                    {getDifficultyLabel(pkg.difficulty_level)}
                  </Badge>
                </div>

                {pkg.min_support_tier && (
                  <div 
                    className="flex items-center gap-2 p-2 rounded-lg border text-sm"
                    style={{ borderColor: pkg.min_support_tier.color || undefined }}
                  >
                    <Medal 
                      className="w-4 h-4" 
                      style={{ color: pkg.min_support_tier.color || undefined }}
                    />
                    <span>
                      {language === 'hu' ? 'Min. fokozat:' : 'Min. tier:'}{' '}
                      <strong style={{ color: pkg.min_support_tier.color || undefined }}>
                        {pkg.min_support_tier.name}
                      </strong>
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-lg font-bold">
                    {pkg.base_price_huf.toLocaleString()} Ft
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(pkg)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(pkg.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPackage 
                ? (language === 'hu' ? 'Csomag szerkesztése' : 'Edit Package')
                : (language === 'hu' ? 'Új csomag létrehozása' : 'Create New Package')}
            </DialogTitle>
            <DialogDescription>
              {language === 'hu' 
                ? 'Add meg a repülési csomag részleteit' 
                : 'Enter the flight package details'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="name">
                  {language === 'hu' ? 'Csomag neve *' : 'Package Name *'}
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={language === 'hu' ? 'pl. Sétarepülés' : 'e.g. Sightseeing Flight'}
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="short_description">
                  {language === 'hu' ? 'Rövid leírás' : 'Short Description'}
                </Label>
                <Input
                  id="short_description"
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  placeholder={language === 'hu' ? 'Rövid összefoglaló' : 'Brief summary'}
                />
              </div>

              <div>
                <Label htmlFor="duration_minutes">
                  {language === 'hu' ? 'Időtartam (perc) *' : 'Duration (minutes) *'}
                </Label>
                <Input
                  id="duration_minutes"
                  type="number"
                  min={5}
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="max_passengers">
                  {language === 'hu' ? 'Max. utasszám *' : 'Max Passengers *'}
                </Label>
                <Input
                  id="max_passengers"
                  type="number"
                  min={1}
                  value={formData.max_passengers}
                  onChange={(e) => setFormData({ ...formData, max_passengers: parseInt(e.target.value) || 1 })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="base_price_huf">
                  {language === 'hu' ? 'Alapár (Ft) *' : 'Base Price (HUF) *'}
                </Label>
                <Input
                  id="base_price_huf"
                  type="number"
                  min={0}
                  value={formData.base_price_huf}
                  onChange={(e) => setFormData({ ...formData, base_price_huf: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="difficulty_level">
                  {language === 'hu' ? 'Nehézségi szint' : 'Difficulty Level'}
                </Label>
                <Select
                  value={formData.difficulty_level}
                  onValueChange={(value) => setFormData({ ...formData, difficulty_level: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">{language === 'hu' ? 'Könnyű' : 'Easy'}</SelectItem>
                    <SelectItem value="medium">{language === 'hu' ? 'Közepes' : 'Medium'}</SelectItem>
                    <SelectItem value="aerobatic">{language === 'hu' ? 'Műrepülés' : 'Aerobatic'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Support Tier Requirement */}
              <div className="sm:col-span-2">
                <Label htmlFor="min_support_tier_id" className="flex items-center gap-2">
                  <Medal className="w-4 h-4" />
                  {language === 'hu' ? 'Minimum támogatói fokozat' : 'Minimum Support Tier'}
                </Label>
                <Select
                  value={formData.min_support_tier_id || 'none'}
                  onValueChange={(value) => setFormData({ 
                    ...formData, 
                    min_support_tier_id: value === 'none' ? null : value 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={language === 'hu' ? 'Nincs korlátozás' : 'No restriction'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      {language === 'hu' ? 'Nincs korlátozás (bárki foglalhat)' : 'No restriction (anyone can book)'}
                    </SelectItem>
                    {tiers.map((tier) => (
                      <SelectItem key={tier.id} value={tier.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: tier.color || '#888' }}
                          />
                          {tier.name} ({tier.min_amount_eur}+ EUR)
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'hu' 
                    ? 'Ha beállítod, csak az adott fokozatú vagy magasabb támogatók foglalhatnak' 
                    : 'If set, only supporters with this tier or higher can book'}
                </p>
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="detailed_description">
                  {language === 'hu' ? 'Részletes leírás' : 'Detailed Description'}
                </Label>
                <Textarea
                  id="detailed_description"
                  value={formData.detailed_description}
                  onChange={(e) => setFormData({ ...formData, detailed_description: e.target.value })}
                  placeholder={language === 'hu' ? 'Részletes leírás a csomagról...' : 'Detailed description of the package...'}
                  rows={3}
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="route_description">
                  {language === 'hu' ? 'Útvonal leírása' : 'Route Description'}
                </Label>
                <Textarea
                  id="route_description"
                  value={formData.route_description}
                  onChange={(e) => setFormData({ ...formData, route_description: e.target.value })}
                  placeholder={language === 'hu' ? 'Az útvonal részletei...' : 'Route details...'}
                  rows={2}
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="recommended_audience">
                  {language === 'hu' ? 'Ajánlott célközönség' : 'Recommended Audience'}
                </Label>
                <Input
                  id="recommended_audience"
                  value={formData.recommended_audience}
                  onChange={(e) => setFormData({ ...formData, recommended_audience: e.target.value })}
                  placeholder={language === 'hu' ? 'pl. Családok, kalandvágyók' : 'e.g. Families, adventure seekers'}
                />
              </div>

              <div className="sm:col-span-2 flex items-center gap-3">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                  {language === 'hu' ? 'Aktív (foglalható)' : 'Active (bookable)'}
                </Label>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                {language === 'hu' ? 'Mégse' : 'Cancel'}
              </Button>
              <Button type="submit" variant="gradient" disabled={isSaving}>
                {isSaving 
                  ? (language === 'hu' ? 'Mentés...' : 'Saving...')
                  : (language === 'hu' ? 'Mentés' : 'Save')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'hu' ? 'Csomag törlése' : 'Delete Package'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'hu' 
                ? 'Biztosan törölni szeretnéd ezt a csomagot? A meglévő foglalások nem érintettek.'
                : 'Are you sure you want to delete this package? Existing bookings will not be affected.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {language === 'hu' ? 'Mégse' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {language === 'hu' ? 'Törlés' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OperatorPackages;