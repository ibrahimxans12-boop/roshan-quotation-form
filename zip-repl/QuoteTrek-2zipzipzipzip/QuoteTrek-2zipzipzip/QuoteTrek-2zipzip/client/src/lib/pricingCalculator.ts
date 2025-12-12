import type { Hotel, Visa, Meal, Laundry, PricingPackage, Transport, Addon, ServiceCharge } from "@shared/schema";

export interface SelectedTransport {
  transportId: number;
  vehicleCount: number;
}

export interface SelectedAddon {
  addonId: number;
  quantity: number;
}

export interface QuotationData {
  adults: number;
  children: number;
  infants: number;
  discount?: string | number | null;
  pricingPackageId?: number | null;
  makkahHotelId?: number | null;
  madinaHotelId?: number | null;
  makkahDays?: number | null;
  madinaDays?: number | null;
  makkahRoomBeds?: number | string | null;
  madinaRoomBeds?: number | string | null;
  makkahMealPlan?: string | null;
  madinaMealPlan?: string | null;
  makkahLaundry?: boolean | null;
  madinaLaundry?: boolean | null;
  visaId?: number | null;
  selectedTransport?: SelectedTransport[];
  selectedAddons?: SelectedAddon[];
}

export interface PricingData {
  makkahHotel?: Hotel | null;
  madinaHotel?: Hotel | null;
  visa?: Visa | null;
  pricingPackages?: PricingPackage[];
  meals?: Meal[];
  laundryList?: Laundry[];
  transportList?: Transport[];
  addonsList?: Addon[];
  serviceCharges?: ServiceCharge[];
}

export interface PricingBreakdown {
  hotelCostMakkah: number;
  hotelCostMadina: number;
  mealCostMakkah: number;
  mealCostMadina: number;
  laundryCost: number;
  transportCost: number;
  visaCost: number;
  addonsCost: number;
  serviceChargeCost: number;
  packageCharges: number;
  subtotal: number;
  discount: number;
  total: number;
  perPerson: number;
}

function parseRoomBeds(value: number | string | null | undefined): number {
  if (value === null || value === undefined) return 2;
  const num = typeof value === 'string' ? parseInt(value, 10) : value;
  return isNaN(num) ? 2 : num;
}

function getRoomPrice(hotel: Hotel, bedCount: number): number {
  switch (bedCount) {
    case 2: return Number(hotel.price2Bed) || 0;
    case 3: return Number(hotel.price3Bed) || 0;
    case 4: return Number(hotel.price4Bed) || 0;
    case 5: return Number(hotel.price5Bed) || 0;
    default: return Number(hotel.price2Bed) || 0;
  }
}

export function calculatePricing(
  quotation: QuotationData,
  data: PricingData
): PricingBreakdown {
  let hotelCostMakkah = 0;
  let hotelCostMadina = 0;
  let mealCostMakkah = 0;
  let mealCostMadina = 0;
  let laundryCost = 0;
  let transportCost = 0;
  let visaCost = 0;
  let addonsCost = 0;
  let serviceChargeCost = 0;
  let packageCharges = 0;

  const adults = quotation.adults || 0;
  const children = quotation.children || 0;
  const infants = quotation.infants || 0;
  const totalPeople = adults + children + infants;
  const payingTravelers = adults + children;
  const discountAmount = Number(quotation.discount) || 0;

  const { makkahHotel, madinaHotel, visa, pricingPackages, meals, laundryList, transportList, addonsList, serviceCharges } = data;

  const selectedPackage = pricingPackages?.find(p => p.id === quotation.pricingPackageId);
  if (selectedPackage) {
    packageCharges += Number(selectedPackage.adultRate) * adults;
    packageCharges += Number(selectedPackage.childRate) * children;
    packageCharges += Number(selectedPackage.infantRate) * infants;
  }

  if (makkahHotel && quotation.makkahDays && quotation.makkahDays > 0) {
    const bedCount = parseRoomBeds(quotation.makkahRoomBeds);
    const roomPrice = getRoomPrice(makkahHotel, bedCount);
    const perPersonRate = roomPrice / bedCount;
    hotelCostMakkah = perPersonRate * totalPeople * quotation.makkahDays;
  }

  if (madinaHotel && quotation.madinaDays && quotation.madinaDays > 0) {
    const bedCount = parseRoomBeds(quotation.madinaRoomBeds);
    const roomPrice = getRoomPrice(madinaHotel, bedCount);
    const perPersonRate = roomPrice / bedCount;
    hotelCostMadina = perPersonRate * totalPeople * quotation.madinaDays;
  }

  if (meals && quotation.makkahMealPlan && quotation.makkahDays) {
    const selectedMeal = meals.find(m => m.name === quotation.makkahMealPlan);
    if (selectedMeal) {
      mealCostMakkah = totalPeople * Number(selectedMeal.pricePerDay) * quotation.makkahDays;
    }
  }

  if (meals && quotation.madinaMealPlan && quotation.madinaDays) {
    const selectedMeal = meals.find(m => m.name === quotation.madinaMealPlan);
    if (selectedMeal) {
      mealCostMadina = totalPeople * Number(selectedMeal.pricePerDay) * quotation.madinaDays;
    }
  }

  if (laundryList && laundryList.length > 0) {
    const laundryRate = Number(laundryList[0].pricePerDay);
    if (quotation.makkahLaundry && quotation.makkahDays) {
      laundryCost += laundryRate * quotation.makkahDays * payingTravelers;
    }
    if (quotation.madinaLaundry && quotation.madinaDays) {
      laundryCost += laundryRate * quotation.madinaDays * payingTravelers;
    }
  }

  if (transportList && quotation.selectedTransport) {
    quotation.selectedTransport.forEach(st => {
      const transport = transportList.find(t => t.id === st.transportId);
      if (transport) {
        transportCost += Number(transport.pricePerTrip) * st.vehicleCount;
      }
    });
  }

  if (visa) {
    visaCost = Number(visa.price) * payingTravelers;
  }

  if (addonsList && quotation.selectedAddons) {
    quotation.selectedAddons.forEach(sa => {
      const addon = addonsList.find(a => a.id === sa.addonId);
      if (addon) {
        addonsCost += Number(addon.price) * sa.quantity;
      }
    });
  }

  if (serviceCharges) {
    serviceCharges.forEach(sc => {
      if (!sc.isActive) return;
      const amount = Number(sc.amount);
      if (sc.appliesTo === "all" || sc.appliesTo === "adult") {
        serviceChargeCost += amount * adults;
      }
      if (sc.appliesTo === "all" || sc.appliesTo === "child") {
        serviceChargeCost += amount * children;
      }
    });
  }

  const subtotal = hotelCostMakkah + hotelCostMadina + packageCharges + mealCostMakkah + mealCostMadina + 
                   laundryCost + transportCost + visaCost + addonsCost + serviceChargeCost;
  const total = Math.max(0, subtotal - discountAmount);
  const perPerson = payingTravelers > 0 ? total / payingTravelers : 0;

  return {
    hotelCostMakkah,
    hotelCostMadina,
    mealCostMakkah,
    mealCostMadina,
    laundryCost,
    transportCost,
    visaCost,
    addonsCost,
    serviceChargeCost,
    packageCharges,
    subtotal,
    discount: discountAmount,
    total,
    perPerson
  };
}
