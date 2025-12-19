import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTimeSlots } from '@/hooks/useTimeSlots';
import { useBookings } from '@/hooks/useBookings';
import { usePricing } from '@/hooks/usePricing';
import { useSupportTier } from '@/hooks/useSupportTier';
import { supabase } from '@/integrations/supabase/client';
import { TimeSlot, FlightPackage } from '@/types/scheduling';
import { PassengerDetails } from '@/types/booking';
import { Coupon, PriceBreakdown } from '@/types/pricing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import CouponInput from '@/components/booking/CouponInput';
import PriceBreakdownComponent from '@/components/booking/PriceBreakdown';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { hu, enUS } from 'date-fns/locale';
import { ArrowLeft, ArrowRight, Check, Plane, Calendar, Users, CreditCard, Lock, Medal } from 'lucide-react';

type Step = 'package' | 'timeslot' | 'passengers' | 'confirm';

const BookingCheckout = () => {
  const { language } = useLanguage();
  const locale = language === 'hu' ? hu : enUS;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [currentStep, setCurrentStep] = useState<Step>('package');
  const [packages, setPackages] = useState<FlightPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<FlightPackage | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [passengerCount, setPassengerCount] = useState(1);
  const [passengerDetails, setPassengerDetails] = useState<PassengerDetails[]>([{ name: '' }]);
  const [notes, setNotes] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);

  const { timeSlots, loading: slotsLoading, fetchWeekSlots, canBook } = useTimeSlots();
  const { createBooking } = useBookings();
  const { calculatePrice, incrementCouponUsage } = usePricing();
  const { currentTier, canBook: hasSupport, canBookPackage } = useSupportTier();

  useEffect(() => {
    checkAuth();
    loadPackages();
    
    const packageId = searchParams.get('package');
    const slotId = searchParams.get('slot');
    
    if (packageId || slotId) {
      loadPreselectedData(packageId, slotId);
    }
  }, []);

  // Calculate price when relevant values change
  useEffect(() => {
    const updatePrice = async () => {
      if (selectedPackage && selectedSlot) {
        const slotDate = new Date(selectedSlot.slot_date);
        const breakdown = await calculatePrice(
          selectedPackage.base_price_huf,
          passengerCount,
          selectedPackage.id,
          slotDate,
          appliedCoupon
        );
        setPriceBreakdown(breakdown);
      }
    };
    updatePrice();
  }, [selectedPackage, selectedSlot, passengerCount, appliedCoupon, calculatePrice]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsAuthenticated(!!user);
  };

  const loadPackages = async () => {
    const { data } = await supabase
      .from('flight_packages')
      .select('*, min_support_tier:support_tiers(id, name, sort_order, color, icon)')
      .eq('is_active', true)
      .order('name');
    
    if (data) setPackages(data as FlightPackage[]);
  };

  const loadPreselectedData = async (packageId: string | null, slotId: string | null) => {
    if (packageId) {
      const { data: pkg } = await supabase
        .from('flight_packages')
        .select('*, min_support_tier:support_tiers(id, name, sort_order, color, icon)')
        .eq('id', packageId)
        .single();
      
      if (pkg) {
        setSelectedPackage(pkg as FlightPackage);
        setCurrentStep('timeslot');
        fetchWeekSlots(new Date());
      }
    }
    
    if (slotId) {
      const { data: slot } = await supabase
        .from('flight_time_slots')
        .select('*, flight_package:flight_packages(*, min_support_tier:support_tiers(id, name, sort_order, color, icon))')
        .eq('id', slotId)
        .single();
      
      if (slot) {
        setSelectedSlot(slot as TimeSlot);
        if (slot.flight_package) {
          setSelectedPackage(slot.flight_package as FlightPackage);
        }
        setCurrentStep('passengers');
      }
    }
  };

  const handlePackageSelect = (pkg: FlightPackage) => {
    // Check if user can book this package based on tier
    const canBookThisPackage = canBookPackage(pkg.min_support_tier?.sort_order);
    if (!canBookThisPackage) {
      toast.error(
        language === 'hu'
          ? `Ez a csomag minimum "${pkg.min_support_tier?.name}" támogatói fokozatot igényel.`
          : `This package requires at least "${pkg.min_support_tier?.name}" support tier.`
      );
      return;
    }
    setSelectedPackage(pkg);
    setCurrentStep('timeslot');
    fetchWeekSlots(new Date());
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (!canBook(slot)) return;
    setSelectedSlot(slot);
    setCurrentStep('passengers');
  };

  const handlePassengerCountChange = (count: number) => {
    const maxPassengers = selectedSlot 
      ? selectedSlot.max_passengers - selectedSlot.current_passengers 
      : selectedPackage?.max_passengers || 1;
    
    const newCount = Math.max(1, Math.min(count, maxPassengers));
    setPassengerCount(newCount);
    
    const newDetails = [...passengerDetails];
    while (newDetails.length < newCount) {
      newDetails.push({ name: '' });
    }
    while (newDetails.length > newCount) {
      newDetails.pop();
    }
    setPassengerDetails(newDetails);
  };

  const updatePassengerDetail = (index: number, field: keyof PassengerDetails, value: string | number) => {
    const newDetails = [...passengerDetails];
    newDetails[index] = { ...newDetails[index], [field]: value };
    setPassengerDetails(newDetails);
  };

  const totalPrice = priceBreakdown?.finalPrice ?? (selectedPackage ? selectedPackage.base_price_huf * passengerCount : 0);

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error(language === 'hu' ? 'Kérjük, jelentkezz be!' : 'Please log in first!');
      navigate('/belepes');
      return;
    }

    if (!selectedPackage || !selectedSlot) return;

    const isValid = passengerDetails.every(p => p.name.trim() !== '');
    if (!isValid) {
      toast.error(language === 'hu' ? 'Add meg az utasok nevét!' : 'Please enter passenger names!');
      return;
    }

    setIsSubmitting(true);
    try {
      await createBooking({
        flight_package_id: selectedPackage.id,
        time_slot_id: selectedSlot.id,
        passenger_count: passengerCount,
        passenger_details: passengerDetails,
        total_price_huf: totalPrice,
        notes,
      });

      // Increment coupon usage if one was applied
      if (appliedCoupon) {
        await incrementCouponUsage(appliedCoupon.id);
      }

      toast.success(
        language === 'hu' 
          ? 'Foglalás sikeresen létrehozva!' 
          : 'Booking created successfully!'
      );
      navigate('/dashboard/bookings');
    } catch (err) {
      toast.error(
        language === 'hu' 
          ? 'Hiba történt a foglalás során' 
          : 'Error creating booking'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 'package', label: language === 'hu' ? 'Csomag' : 'Package', icon: Plane },
    { id: 'timeslot', label: language === 'hu' ? 'Időpont' : 'Time Slot', icon: Calendar },
    { id: 'passengers', label: language === 'hu' ? 'Utasok' : 'Passengers', icon: Users },
    { id: 'confirm', label: language === 'hu' ? 'Megerősítés' : 'Confirm', icon: CreditCard },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const availableSlots = timeSlots.filter(slot => 
    canBook(slot) && 
    (!selectedPackage || slot.flight_package_id === selectedPackage.id || !slot.flight_package_id)
  );

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-4xl mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {language === 'hu' ? 'Vissza' : 'Back'}
        </Button>

        <h1 className="text-3xl font-bold mb-8">
          {language === 'hu' ? 'Foglalás' : 'Book a Flight'}
        </h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                index < currentStepIndex 
                  ? 'bg-primary border-primary text-primary-foreground' 
                  : index === currentStepIndex
                    ? 'border-primary text-primary'
                    : 'border-muted-foreground/30 text-muted-foreground'
              }`}>
                {index < currentStepIndex ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              <span className={`ml-2 text-sm hidden sm:inline ${
                index <= currentStepIndex ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-8 sm:w-16 h-0.5 mx-2 ${
                  index < currentStepIndex ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card>
          <CardContent className="p-6">
            {/* Package Selection */}
            {currentStep === 'package' && (
              <div className="space-y-4">
                <CardHeader className="p-0 pb-4">
                  <CardTitle>{language === 'hu' ? 'Válassz csomagot' : 'Select a Package'}</CardTitle>
                  <CardDescription>
                    {language === 'hu' 
                      ? 'Válaszd ki a repülési csomagot' 
                      : 'Choose your flight package'}
                  </CardDescription>
                </CardHeader>
                
                {packages.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    {language === 'hu' ? 'Nincs elérhető csomag' : 'No packages available'}
                  </p>
                ) : (
                  <div className="grid gap-4">
                    {packages.map((pkg) => {
                      const canBookThis = canBookPackage(pkg.min_support_tier?.sort_order);
                      const isLocked = pkg.min_support_tier && !canBookThis;
                      
                      return (
                        <div
                          key={pkg.id}
                          onClick={() => handlePackageSelect(pkg)}
                          className={`p-4 border rounded-lg transition-all ${
                            isLocked 
                              ? 'opacity-60 cursor-not-allowed border-border bg-muted/30' 
                              : 'cursor-pointer hover:border-primary'
                          } ${
                            selectedPackage?.id === pkg.id ? 'border-primary bg-primary/5' : 'border-border'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold">{pkg.name}</h3>
                                {pkg.min_support_tier && (
                                  <Badge 
                                    variant={canBookThis ? "secondary" : "outline"}
                                    className="text-xs flex items-center gap-1"
                                    style={{ 
                                      borderColor: pkg.min_support_tier.color || undefined,
                                      color: canBookThis ? undefined : pkg.min_support_tier.color || undefined
                                    }}
                                  >
                                    {isLocked ? <Lock className="w-3 h-3" /> : <Medal className="w-3 h-3" />}
                                    {pkg.min_support_tier.name}+
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{pkg.short_description}</p>
                              <div className="flex gap-4 mt-2 text-sm">
                                <span>{pkg.duration_minutes} {language === 'hu' ? 'perc' : 'min'}</span>
                                <span className="capitalize">{pkg.difficulty_level}</span>
                              </div>
                              {isLocked && (
                                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                                  {language === 'hu' 
                                    ? `Min. "${pkg.min_support_tier?.name}" fokozat szükséges`
                                    : `Requires min. "${pkg.min_support_tier?.name}" tier`}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-bold">
                                {pkg.base_price_huf.toLocaleString()} Ft
                              </span>
                              <p className="text-xs text-muted-foreground">
                                / {language === 'hu' ? 'fő' : 'person'}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Time Slot Selection */}
            {currentStep === 'timeslot' && (
              <div className="space-y-4">
                <CardHeader className="p-0 pb-4">
                  <CardTitle>{language === 'hu' ? 'Válassz időpontot' : 'Select Time Slot'}</CardTitle>
                  <CardDescription>
                    {language === 'hu' 
                      ? 'Válaszd ki a neked megfelelő időpontot' 
                      : 'Choose a convenient time for your flight'}
                  </CardDescription>
                </CardHeader>
                
                {slotsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : availableSlots.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    {language === 'hu' ? 'Nincs elérhető időpont' : 'No available time slots'}
                  </p>
                ) : (
                  <div className="grid gap-3">
                    {availableSlots.map((slot) => (
                      <div
                        key={slot.id}
                        onClick={() => handleSlotSelect(slot)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-primary ${
                          selectedSlot?.id === slot.id ? 'border-primary bg-primary/5' : 'border-border'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">
                              {format(new Date(slot.slot_date), 'PPP', { locale })}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {slot.start_time} - {slot.duration_minutes} {language === 'hu' ? 'perc' : 'min'}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm text-muted-foreground">
                              {slot.max_passengers - slot.current_passengers} {language === 'hu' ? 'hely' : 'spots'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep('package')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {language === 'hu' ? 'Vissza' : 'Back'}
                  </Button>
                </div>
              </div>
            )}

            {/* Passenger Details */}
            {currentStep === 'passengers' && (
              <div className="space-y-6">
                <CardHeader className="p-0 pb-4">
                  <CardTitle>{language === 'hu' ? 'Utas adatok' : 'Passenger Details'}</CardTitle>
                  <CardDescription>
                    {language === 'hu' 
                      ? 'Add meg az utasok adatait' 
                      : 'Enter passenger information'}
                  </CardDescription>
                </CardHeader>

                <div>
                  <Label>{language === 'hu' ? 'Utasok száma' : 'Number of passengers'}</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handlePassengerCountChange(passengerCount - 1)}
                      disabled={passengerCount <= 1}
                    >
                      -
                    </Button>
                    <span className="text-xl font-semibold w-8 text-center">{passengerCount}</span>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handlePassengerCountChange(passengerCount + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <Separator />

                {passengerDetails.map((passenger, index) => (
                  <div key={index} className="space-y-4 p-4 border rounded-lg">
                    <h4 className="font-medium">
                      {language === 'hu' ? `${index + 1}. utas` : `Passenger ${index + 1}`}
                    </h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor={`name-${index}`}>
                          {language === 'hu' ? 'Név *' : 'Name *'}
                        </Label>
                        <Input
                          id={`name-${index}`}
                          value={passenger.name}
                          onChange={(e) => updatePassengerDetail(index, 'name', e.target.value)}
                          placeholder={language === 'hu' ? 'Teljes név' : 'Full name'}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`phone-${index}`}>
                          {language === 'hu' ? 'Telefon' : 'Phone'}
                        </Label>
                        <Input
                          id={`phone-${index}`}
                          value={passenger.phone || ''}
                          onChange={(e) => updatePassengerDetail(index, 'phone', e.target.value)}
                          placeholder="+36 ..."
                        />
                      </div>
                      <div>
                        <Label htmlFor={`weight-${index}`}>
                          {language === 'hu' ? 'Testsúly (kg)' : 'Weight (kg)'}
                        </Label>
                        <Input
                          id={`weight-${index}`}
                          type="number"
                          value={passenger.weight_kg || ''}
                          onChange={(e) => updatePassengerDetail(index, 'weight_kg', parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <div>
                  <Label htmlFor="notes">{language === 'hu' ? 'Megjegyzés' : 'Notes'}</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={language === 'hu' ? 'Bármilyen egyéb kérés...' : 'Any special requests...'}
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep('timeslot')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {language === 'hu' ? 'Vissza' : 'Back'}
                  </Button>
                  <Button onClick={() => setCurrentStep('confirm')}>
                    {language === 'hu' ? 'Tovább' : 'Continue'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Confirmation */}
            {currentStep === 'confirm' && (
              <div className="space-y-6">
                <CardHeader className="p-0 pb-4">
                  <CardTitle>{language === 'hu' ? 'Foglalás összegzése' : 'Booking Summary'}</CardTitle>
                  <CardDescription>
                    {language === 'hu' 
                      ? 'Ellenőrizd az adatokat és véglegesítsd a foglalást' 
                      : 'Review your booking details and confirm'}
                  </CardDescription>
                </CardHeader>

                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">{language === 'hu' ? 'Csomag' : 'Package'}</h4>
                    <p className="text-lg">{selectedPackage?.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedPackage?.short_description}</p>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">{language === 'hu' ? 'Időpont' : 'Time Slot'}</h4>
                    <p className="text-lg">
                      {selectedSlot && format(new Date(selectedSlot.slot_date), 'PPP', { locale })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedSlot?.start_time} - {selectedSlot?.duration_minutes} {language === 'hu' ? 'perc' : 'min'}
                    </p>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">{language === 'hu' ? 'Utasok' : 'Passengers'}</h4>
                    {passengerDetails.map((p, i) => (
                      <p key={i} className="text-sm">{p.name}</p>
                    ))}
                  </div>

                  {/* Coupon Input */}
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-3">{language === 'hu' ? 'Kuponkód' : 'Coupon Code'}</h4>
                    <CouponInput
                      packageId={selectedPackage?.id}
                      appliedCoupon={appliedCoupon}
                      onCouponApplied={setAppliedCoupon}
                    />
                  </div>

                  <Separator />

                  {/* Price Breakdown */}
                  {priceBreakdown && selectedPackage && (
                    <PriceBreakdownComponent
                      breakdown={priceBreakdown}
                      passengerCount={passengerCount}
                      pricePerPerson={selectedPackage.base_price_huf}
                    />
                  )}
                </div>

                {!isAuthenticated && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-destructive text-sm">
                      {language === 'hu' 
                        ? 'A foglaláshoz be kell jelentkezned!' 
                        : 'You need to log in to complete the booking!'}
                    </p>
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep('passengers')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {language === 'hu' ? 'Vissza' : 'Back'}
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                    size="lg"
                  >
                    {isSubmitting ? (
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        {language === 'hu' ? 'Foglalás véglegesítése' : 'Confirm Booking'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingCheckout;
