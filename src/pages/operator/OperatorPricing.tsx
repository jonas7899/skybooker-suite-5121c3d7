import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePricingAdmin } from '@/hooks/usePricingAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { hu, enUS } from 'date-fns/locale';
import { Plus, Trash2, Ticket, Percent, Calendar, Tag } from 'lucide-react';
import { DiscountType, DiscountCondition } from '@/types/pricing';

const OperatorPricing = () => {
  const { language } = useLanguage();
  const locale = language === 'hu' ? hu : enUS;
  const {
    coupons,
    discounts,
    campaigns,
    packages,
    loading,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    createDiscount,
    updateDiscount,
    deleteDiscount,
    createCampaign,
    updateCampaign,
    deleteCampaign,
  } = usePricingAdmin();

  const [couponDialog, setCouponDialog] = useState(false);
  const [discountDialog, setDiscountDialog] = useState(false);
  const [campaignDialog, setCampaignDialog] = useState(false);

  // Form states
  const [couponForm, setCouponForm] = useState({
    code: '',
    discount_type: 'percentage' as DiscountType,
    discount_value: 10,
    flight_package_id: '',
    expires_at: '',
    usage_limit: undefined as number | undefined,
  });

  const [discountForm, setDiscountForm] = useState({
    flight_package_id: '',
    discount_type: 'percentage' as DiscountType,
    discount_value: 10,
    condition_type: 'always' as DiscountCondition,
    condition_days: [] as number[],
  });

  const [campaignForm, setCampaignForm] = useState({
    flight_package_id: '',
    name: '',
    discount_type: 'percentage' as DiscountType,
    discount_value: 15,
    starts_at: '',
    ends_at: '',
  });

  const handleCreateCoupon = async () => {
    try {
      await createCoupon({
        ...couponForm,
        flight_package_id: couponForm.flight_package_id || undefined,
        expires_at: couponForm.expires_at || undefined,
        usage_limit: couponForm.usage_limit || undefined,
      });
      toast.success(language === 'hu' ? 'Kupon létrehozva!' : 'Coupon created!');
      setCouponDialog(false);
      setCouponForm({
        code: '',
        discount_type: 'percentage',
        discount_value: 10,
        flight_package_id: '',
        expires_at: '',
        usage_limit: undefined,
      });
    } catch (err) {
      toast.error(language === 'hu' ? 'Hiba a kupon létrehozásakor' : 'Error creating coupon');
    }
  };

  const handleCreateDiscount = async () => {
    if (!discountForm.flight_package_id) {
      toast.error(language === 'hu' ? 'Válassz csomagot!' : 'Select a package!');
      return;
    }
    try {
      await createDiscount(discountForm);
      toast.success(language === 'hu' ? 'Kedvezmény létrehozva!' : 'Discount created!');
      setDiscountDialog(false);
      setDiscountForm({
        flight_package_id: '',
        discount_type: 'percentage',
        discount_value: 10,
        condition_type: 'always',
        condition_days: [],
      });
    } catch (err) {
      toast.error(language === 'hu' ? 'Hiba a kedvezmény létrehozásakor' : 'Error creating discount');
    }
  };

  const handleCreateCampaign = async () => {
    if (!campaignForm.flight_package_id || !campaignForm.starts_at || !campaignForm.ends_at) {
      toast.error(language === 'hu' ? 'Töltsd ki az összes mezőt!' : 'Fill all fields!');
      return;
    }
    try {
      await createCampaign(campaignForm);
      toast.success(language === 'hu' ? 'Kampány létrehozva!' : 'Campaign created!');
      setCampaignDialog(false);
      setCampaignForm({
        flight_package_id: '',
        name: '',
        discount_type: 'percentage',
        discount_value: 15,
        starts_at: '',
        ends_at: '',
      });
    } catch (err) {
      toast.error(language === 'hu' ? 'Hiba a kampány létrehozásakor' : 'Error creating campaign');
    }
  };

  const formatDiscountValue = (type: DiscountType, value: number) => {
    return type === 'percentage' ? `${value}%` : `${value.toLocaleString()} Ft`;
  };

  const conditionLabels: Record<DiscountCondition, { hu: string; en: string }> = {
    always: { hu: 'Mindig', en: 'Always' },
    weekday: { hu: 'Hétköznap', en: 'Weekdays' },
    weekend: { hu: 'Hétvége', en: 'Weekend' },
    specific_days: { hu: 'Megadott napok', en: 'Specific days' },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{language === 'hu' ? 'Árazás és kedvezmények' : 'Pricing & Discounts'}</h1>
        <p className="text-muted-foreground">
          {language === 'hu' ? 'Kuponok, kedvezmények és kampányok kezelése' : 'Manage coupons, discounts and campaigns'}
        </p>
      </div>

      <Tabs defaultValue="coupons" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="coupons" className="flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            {language === 'hu' ? 'Kuponok' : 'Coupons'}
          </TabsTrigger>
          <TabsTrigger value="discounts" className="flex items-center gap-2">
            <Percent className="h-4 w-4" />
            {language === 'hu' ? 'Kedvezmények' : 'Discounts'}
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {language === 'hu' ? 'Kampányok' : 'Campaigns'}
          </TabsTrigger>
        </TabsList>

        {/* Coupons Tab */}
        <TabsContent value="coupons" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {language === 'hu' ? 'Beváltható kuponkódok' : 'Redeemable coupon codes'}
            </p>
            <Dialog open={couponDialog} onOpenChange={setCouponDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {language === 'hu' ? 'Új kupon' : 'New Coupon'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{language === 'hu' ? 'Új kupon létrehozása' : 'Create New Coupon'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>{language === 'hu' ? 'Kuponkód' : 'Coupon Code'}</Label>
                    <Input
                      value={couponForm.code}
                      onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                      placeholder="SUMMER20"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{language === 'hu' ? 'Típus' : 'Type'}</Label>
                      <Select
                        value={couponForm.discount_type}
                        onValueChange={(v) => setCouponForm({ ...couponForm, discount_type: v as DiscountType })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">{language === 'hu' ? 'Százalék' : 'Percentage'}</SelectItem>
                          <SelectItem value="fixed_amount">{language === 'hu' ? 'Fix összeg' : 'Fixed Amount'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>{language === 'hu' ? 'Érték' : 'Value'}</Label>
                      <Input
                        type="number"
                        value={couponForm.discount_value}
                        onChange={(e) => setCouponForm({ ...couponForm, discount_value: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>{language === 'hu' ? 'Csomag (opcionális)' : 'Package (optional)'}</Label>
                    <Select
                      value={couponForm.flight_package_id}
                      onValueChange={(v) => setCouponForm({ ...couponForm, flight_package_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'hu' ? 'Összes csomag' : 'All packages'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">{language === 'hu' ? 'Összes csomag' : 'All packages'}</SelectItem>
                        {packages.map((pkg) => (
                          <SelectItem key={pkg.id} value={pkg.id}>{pkg.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{language === 'hu' ? 'Lejárat' : 'Expires'}</Label>
                      <Input
                        type="datetime-local"
                        value={couponForm.expires_at}
                        onChange={(e) => setCouponForm({ ...couponForm, expires_at: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>{language === 'hu' ? 'Felhasználási limit' : 'Usage Limit'}</Label>
                      <Input
                        type="number"
                        value={couponForm.usage_limit || ''}
                        onChange={(e) => setCouponForm({ ...couponForm, usage_limit: parseInt(e.target.value) || undefined })}
                        placeholder={language === 'hu' ? 'Korlátlan' : 'Unlimited'}
                      />
                    </div>
                  </div>
                  <Button onClick={handleCreateCoupon} className="w-full">
                    {language === 'hu' ? 'Létrehozás' : 'Create'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {coupons.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  {language === 'hu' ? 'Nincs még kupon' : 'No coupons yet'}
                </CardContent>
              </Card>
            ) : (
              coupons.map((coupon) => (
                <Card key={coupon.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Ticket className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold">{coupon.code}</span>
                            <Badge variant={coupon.is_active ? 'default' : 'secondary'}>
                              {coupon.is_active ? (language === 'hu' ? 'Aktív' : 'Active') : (language === 'hu' ? 'Inaktív' : 'Inactive')}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatDiscountValue(coupon.discount_type, coupon.discount_value)}
                            {coupon.flight_package?.name && ` • ${coupon.flight_package.name}`}
                            {coupon.usage_limit && ` • ${coupon.times_used}/${coupon.usage_limit}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={coupon.is_active}
                          onCheckedChange={(checked) => updateCoupon(coupon.id, { is_active: checked })}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteCoupon(coupon.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Discounts Tab */}
        <TabsContent value="discounts" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {language === 'hu' ? 'Automatikus kedvezmények' : 'Automatic discounts'}
            </p>
            <Dialog open={discountDialog} onOpenChange={setDiscountDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {language === 'hu' ? 'Új kedvezmény' : 'New Discount'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{language === 'hu' ? 'Új kedvezmény létrehozása' : 'Create New Discount'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>{language === 'hu' ? 'Csomag' : 'Package'}</Label>
                    <Select
                      value={discountForm.flight_package_id}
                      onValueChange={(v) => setDiscountForm({ ...discountForm, flight_package_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'hu' ? 'Válassz csomagot' : 'Select package'} />
                      </SelectTrigger>
                      <SelectContent>
                        {packages.map((pkg) => (
                          <SelectItem key={pkg.id} value={pkg.id}>{pkg.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{language === 'hu' ? 'Típus' : 'Type'}</Label>
                      <Select
                        value={discountForm.discount_type}
                        onValueChange={(v) => setDiscountForm({ ...discountForm, discount_type: v as DiscountType })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">{language === 'hu' ? 'Százalék' : 'Percentage'}</SelectItem>
                          <SelectItem value="fixed_amount">{language === 'hu' ? 'Fix összeg' : 'Fixed Amount'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>{language === 'hu' ? 'Érték' : 'Value'}</Label>
                      <Input
                        type="number"
                        value={discountForm.discount_value}
                        onChange={(e) => setDiscountForm({ ...discountForm, discount_value: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>{language === 'hu' ? 'Feltétel' : 'Condition'}</Label>
                    <Select
                      value={discountForm.condition_type}
                      onValueChange={(v) => setDiscountForm({ ...discountForm, condition_type: v as DiscountCondition })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="always">{language === 'hu' ? 'Mindig' : 'Always'}</SelectItem>
                        <SelectItem value="weekday">{language === 'hu' ? 'Hétköznap' : 'Weekdays'}</SelectItem>
                        <SelectItem value="weekend">{language === 'hu' ? 'Hétvége' : 'Weekend'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleCreateDiscount} className="w-full">
                    {language === 'hu' ? 'Létrehozás' : 'Create'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {discounts.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  {language === 'hu' ? 'Nincs még kedvezmény' : 'No discounts yet'}
                </CardContent>
              </Card>
            ) : (
              discounts.map((discount) => (
                <Card key={discount.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                          <Percent className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{discount.flight_package?.name}</span>
                            <Badge variant={discount.is_active ? 'default' : 'secondary'}>
                              {discount.is_active ? (language === 'hu' ? 'Aktív' : 'Active') : (language === 'hu' ? 'Inaktív' : 'Inactive')}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatDiscountValue(discount.discount_type, discount.discount_value)}
                            {' • '}
                            {conditionLabels[discount.condition_type][language]}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={discount.is_active}
                          onCheckedChange={(checked) => updateDiscount(discount.id, { is_active: checked })}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteDiscount(discount.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {language === 'hu' ? 'Időszakos akciók' : 'Time-based promotions'}
            </p>
            <Dialog open={campaignDialog} onOpenChange={setCampaignDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {language === 'hu' ? 'Új kampány' : 'New Campaign'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{language === 'hu' ? 'Új kampány létrehozása' : 'Create New Campaign'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>{language === 'hu' ? 'Kampány neve' : 'Campaign Name'}</Label>
                    <Input
                      value={campaignForm.name}
                      onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                      placeholder={language === 'hu' ? 'Nyári akció' : 'Summer Sale'}
                    />
                  </div>
                  <div>
                    <Label>{language === 'hu' ? 'Csomag' : 'Package'}</Label>
                    <Select
                      value={campaignForm.flight_package_id}
                      onValueChange={(v) => setCampaignForm({ ...campaignForm, flight_package_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'hu' ? 'Válassz csomagot' : 'Select package'} />
                      </SelectTrigger>
                      <SelectContent>
                        {packages.map((pkg) => (
                          <SelectItem key={pkg.id} value={pkg.id}>{pkg.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{language === 'hu' ? 'Típus' : 'Type'}</Label>
                      <Select
                        value={campaignForm.discount_type}
                        onValueChange={(v) => setCampaignForm({ ...campaignForm, discount_type: v as DiscountType })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">{language === 'hu' ? 'Százalék' : 'Percentage'}</SelectItem>
                          <SelectItem value="fixed_amount">{language === 'hu' ? 'Fix összeg' : 'Fixed Amount'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>{language === 'hu' ? 'Érték' : 'Value'}</Label>
                      <Input
                        type="number"
                        value={campaignForm.discount_value}
                        onChange={(e) => setCampaignForm({ ...campaignForm, discount_value: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{language === 'hu' ? 'Kezdés' : 'Start Date'}</Label>
                      <Input
                        type="datetime-local"
                        value={campaignForm.starts_at}
                        onChange={(e) => setCampaignForm({ ...campaignForm, starts_at: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>{language === 'hu' ? 'Vége' : 'End Date'}</Label>
                      <Input
                        type="datetime-local"
                        value={campaignForm.ends_at}
                        onChange={(e) => setCampaignForm({ ...campaignForm, ends_at: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button onClick={handleCreateCampaign} className="w-full">
                    {language === 'hu' ? 'Létrehozás' : 'Create'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {campaigns.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  {language === 'hu' ? 'Nincs még kampány' : 'No campaigns yet'}
                </CardContent>
              </Card>
            ) : (
              campaigns.map((campaign) => {
                const isActive = campaign.is_active && 
                  new Date(campaign.starts_at) <= new Date() && 
                  new Date(campaign.ends_at) >= new Date();
                
                return (
                  <Card key={campaign.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-orange-500/10 rounded-lg">
                            <Tag className="h-5 w-5 text-orange-500" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{campaign.name}</span>
                              <Badge variant={isActive ? 'default' : 'secondary'}>
                                {isActive ? (language === 'hu' ? 'Aktív' : 'Active') : (language === 'hu' ? 'Inaktív' : 'Inactive')}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {campaign.flight_package?.name}
                              {' • '}
                              {formatDiscountValue(campaign.discount_type, campaign.discount_value)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(campaign.starts_at), 'PP', { locale })} - {format(new Date(campaign.ends_at), 'PP', { locale })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={campaign.is_active}
                            onCheckedChange={(checked) => updateCampaign(campaign.id, { is_active: checked })}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteCampaign(campaign.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OperatorPricing;
