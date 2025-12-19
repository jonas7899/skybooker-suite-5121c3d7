import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useOperatorSupportTiers, SupportTier } from '@/hooks/useSupportTier';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2, Medal, Award, Trophy, Crown, Star, Gem, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

const iconOptions = [
  { value: 'medal', label: 'Medal', icon: Medal },
  { value: 'award', label: 'Award', icon: Award },
  { value: 'trophy', label: 'Trophy', icon: Trophy },
  { value: 'crown', label: 'Crown', icon: Crown },
  { value: 'star', label: 'Star', icon: Star },
  { value: 'gem', label: 'Gem', icon: Gem },
];

const colorOptions = [
  { value: '#CD7F32', label: 'Bronz' },
  { value: '#C0C0C0', label: 'Ezüst' },
  { value: '#FFD700', label: 'Arany' },
  { value: '#E5E4E2', label: 'Platina' },
  { value: '#B9F2FF', label: 'Gyémánt' },
];

interface TierFormData {
  name: string;
  min_amount_eur: number;
  max_amount_eur: number | null;
  icon: string;
  color: string;
  sort_order: number;
}

const OperatorSupportTiers: React.FC = () => {
  const { userRole } = useAuth();
  const { language } = useLanguage();
  const operatorId = userRole?.operator_id || '';
  const { tiers, isLoading, createTier, updateTier, deleteTier } = useOperatorSupportTiers(operatorId);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<SupportTier | null>(null);
  const [formData, setFormData] = useState<TierFormData>({
    name: '',
    min_amount_eur: 0,
    max_amount_eur: null,
    icon: 'medal',
    color: '#CD7F32',
    sort_order: 0,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      min_amount_eur: 0,
      max_amount_eur: null,
      icon: 'medal',
      color: '#CD7F32',
      sort_order: tiers.length,
    });
    setEditingTier(null);
  };

  const handleOpenDialog = (tier?: SupportTier) => {
    if (tier) {
      setEditingTier(tier);
      setFormData({
        name: tier.name,
        min_amount_eur: tier.min_amount_eur,
        max_amount_eur: tier.max_amount_eur,
        icon: tier.icon || 'medal',
        color: tier.color || '#CD7F32',
        sort_order: tier.sort_order,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error(language === 'hu' ? 'A név megadása kötelező' : 'Name is required');
      return;
    }

    if (editingTier) {
      const { error } = await updateTier(editingTier.id, formData);
      if (!error) {
        toast.success(language === 'hu' ? 'Fokozat frissítve' : 'Tier updated');
        setIsDialogOpen(false);
        resetForm();
      } else {
        toast.error(language === 'hu' ? 'Hiba történt' : 'An error occurred');
      }
    } else {
      const { error } = await createTier(formData);
      if (!error) {
        toast.success(language === 'hu' ? 'Fokozat létrehozva' : 'Tier created');
        setIsDialogOpen(false);
        resetForm();
      } else {
        toast.error(language === 'hu' ? 'Hiba történt' : 'An error occurred');
      }
    }
  };

  const handleDelete = async (tier: SupportTier) => {
    if (window.confirm(language === 'hu' ? `Biztosan törölni szeretnéd a "${tier.name}" fokozatot?` : `Are you sure you want to delete "${tier.name}"?`)) {
      const { error } = await deleteTier(tier.id);
      if (!error) {
        toast.success(language === 'hu' ? 'Fokozat törölve' : 'Tier deleted');
      } else {
        toast.error(language === 'hu' ? 'Hiba történt' : 'An error occurred');
      }
    }
  };

  const SelectedIcon = iconOptions.find(i => i.value === formData.icon)?.icon || Medal;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
            {language === 'hu' ? 'Támogatói fokozatok' : 'Support Tiers'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'hu' 
              ? 'Állítsd be a támogatói fokozatokat és az összeghatárokat'
              : 'Configure support tiers and amount ranges'}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="gradient" onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              {language === 'hu' ? 'Új fokozat' : 'New Tier'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTier 
                  ? (language === 'hu' ? 'Fokozat szerkesztése' : 'Edit Tier')
                  : (language === 'hu' ? 'Új fokozat létrehozása' : 'Create New Tier')
                }
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">{language === 'hu' ? 'Név' : 'Name'}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={language === 'hu' ? 'pl. Arany' : 'e.g. Gold'}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min">{language === 'hu' ? 'Minimum (EUR)' : 'Minimum (EUR)'}</Label>
                  <Input
                    id="min"
                    type="number"
                    value={formData.min_amount_eur}
                    onChange={(e) => setFormData({ ...formData, min_amount_eur: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max">{language === 'hu' ? 'Maximum (EUR)' : 'Maximum (EUR)'}</Label>
                  <Input
                    id="max"
                    type="number"
                    value={formData.max_amount_eur || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      max_amount_eur: e.target.value ? Number(e.target.value) : null 
                    })}
                    placeholder={language === 'hu' ? 'Nincs limit' : 'No limit'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'hu' ? 'Ikon' : 'Icon'}</Label>
                  <Select 
                    value={formData.icon} 
                    onValueChange={(value) => setFormData({ ...formData, icon: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div className="flex items-center gap-2">
                            <opt.icon className="w-4 h-4" />
                            {opt.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{language === 'hu' ? 'Szín' : 'Color'}</Label>
                  <Select 
                    value={formData.color} 
                    onValueChange={(value) => setFormData({ ...formData, color: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: opt.value }}
                            />
                            {opt.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">{language === 'hu' ? 'Sorrend' : 'Sort Order'}</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                />
              </div>

              {/* Preview */}
              <div className="pt-4 border-t">
                <Label className="mb-2 block">{language === 'hu' ? 'Előnézet' : 'Preview'}</Label>
                <div 
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border"
                  style={{ 
                    backgroundColor: `${formData.color}20`,
                    borderColor: `${formData.color}40`,
                  }}
                >
                  <SelectedIcon className="w-5 h-5" style={{ color: formData.color }} />
                  <span className="text-sm font-medium" style={{ color: formData.color }}>
                    {formData.name || (language === 'hu' ? 'Fokozat neve' : 'Tier name')}
                  </span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {language === 'hu' ? 'Mégse' : 'Cancel'}
              </Button>
              <Button variant="gradient" onClick={handleSubmit}>
                {editingTier 
                  ? (language === 'hu' ? 'Mentés' : 'Save')
                  : (language === 'hu' ? 'Létrehozás' : 'Create')
                }
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : tiers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Medal className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {language === 'hu' ? 'Nincsenek fokozatok' : 'No tiers yet'}
            </h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              {language === 'hu' 
                ? 'Hozd létre az első támogatói fokozatot, hogy az ügyfelek tudjanak támogatni'
                : 'Create your first support tier so customers can support you'}
            </p>
            <Button variant="outline" onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              {language === 'hu' ? 'Első fokozat létrehozása' : 'Create First Tier'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tiers.map((tier) => {
            const IconComponent = iconOptions.find(i => i.value === tier.icon)?.icon || Medal;
            return (
              <Card key={tier.id}>
                <CardContent className="flex items-center gap-4 py-4">
                  <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${tier.color}20` }}
                  >
                    <IconComponent className="w-5 h-5" style={{ color: tier.color || '#CD7F32' }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{tier.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {tier.min_amount_eur} - {tier.max_amount_eur || '∞'} EUR
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleOpenDialog(tier)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(tier)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OperatorSupportTiers;
