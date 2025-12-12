import { eq } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  hotels,
  transport,
  meals,
  visa,
  laundry,
  addons,
  pricingPackages,
  serviceCharges,
  companySettings,
  quotations,
  quotationTransport,
  quotationAddons,
  type User,
  type UpsertUser,
  type Hotel,
  type InsertHotel,
  type Transport,
  type InsertTransport,
  type Meal,
  type InsertMeal,
  type Visa,
  type InsertVisa,
  type Laundry,
  type InsertLaundry,
  type Addon,
  type InsertAddon,
  type PricingPackage,
  type InsertPricingPackage,
  type ServiceCharge,
  type InsertServiceCharge,
  type CompanySettings,
  type InsertCompanySettings,
  type Quotation,
  type InsertQuotation,
  type QuotationTransport,
  type InsertQuotationTransport,
  type QuotationAddon,
  type InsertQuotationAddon,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  getHotels(): Promise<Hotel[]>;
  getHotel(id: number): Promise<Hotel | undefined>;
  createHotel(hotel: InsertHotel): Promise<Hotel>;
  updateHotel(id: number, hotel: Partial<InsertHotel>): Promise<Hotel | undefined>;
  deleteHotel(id: number): Promise<boolean>;
  
  getTransport(): Promise<Transport[]>;
  getTransportById(id: number): Promise<Transport | undefined>;
  createTransport(transport: InsertTransport): Promise<Transport>;
  updateTransport(id: number, transport: Partial<InsertTransport>): Promise<Transport | undefined>;
  deleteTransport(id: number): Promise<boolean>;
  
  getMeals(): Promise<Meal[]>;
  getMeal(id: number): Promise<Meal | undefined>;
  createMeal(meal: InsertMeal): Promise<Meal>;
  updateMeal(id: number, meal: Partial<InsertMeal>): Promise<Meal | undefined>;
  deleteMeal(id: number): Promise<boolean>;
  
  getVisa(): Promise<Visa[]>;
  getVisaById(id: number): Promise<Visa | undefined>;
  createVisa(visa: InsertVisa): Promise<Visa>;
  updateVisa(id: number, visa: Partial<InsertVisa>): Promise<Visa | undefined>;
  deleteVisa(id: number): Promise<boolean>;
  
  getLaundry(): Promise<Laundry[]>;
  getLaundryById(id: number): Promise<Laundry | undefined>;
  createLaundry(laundry: InsertLaundry): Promise<Laundry>;
  updateLaundry(id: number, laundry: Partial<InsertLaundry>): Promise<Laundry | undefined>;
  deleteLaundry(id: number): Promise<boolean>;
  
  getAddons(): Promise<Addon[]>;
  getAddon(id: number): Promise<Addon | undefined>;
  createAddon(addon: InsertAddon): Promise<Addon>;
  updateAddon(id: number, addon: Partial<InsertAddon>): Promise<Addon | undefined>;
  deleteAddon(id: number): Promise<boolean>;
  
  getPricingPackages(): Promise<PricingPackage[]>;
  getPricingPackage(id: number): Promise<PricingPackage | undefined>;
  createPricingPackage(pkg: InsertPricingPackage): Promise<PricingPackage>;
  updatePricingPackage(id: number, pkg: Partial<InsertPricingPackage>): Promise<PricingPackage | undefined>;
  deletePricingPackage(id: number): Promise<boolean>;
  
  getServiceCharges(): Promise<ServiceCharge[]>;
  getServiceCharge(id: number): Promise<ServiceCharge | undefined>;
  createServiceCharge(charge: InsertServiceCharge): Promise<ServiceCharge>;
  updateServiceCharge(id: number, charge: Partial<InsertServiceCharge>): Promise<ServiceCharge | undefined>;
  deleteServiceCharge(id: number): Promise<boolean>;
  
  getCompanySettings(): Promise<CompanySettings | undefined>;
  updateCompanySettings(settings: Partial<InsertCompanySettings>): Promise<CompanySettings>;
  
  getQuotations(): Promise<Quotation[]>;
  getQuotation(id: number): Promise<Quotation | undefined>;
  createQuotation(quotation: InsertQuotation): Promise<Quotation>;
  updateQuotation(id: number, quotation: Partial<InsertQuotation>): Promise<Quotation | undefined>;
  deleteQuotation(id: number): Promise<boolean>;
  
  createQuotationTransport(item: InsertQuotationTransport): Promise<QuotationTransport>;
  createQuotationAddon(item: InsertQuotationAddon): Promise<QuotationAddon>;
  deleteQuotationTransportByQuotation(quotationId: number): Promise<void>;
  deleteQuotationAddonsByQuotation(quotationId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getHotels(): Promise<Hotel[]> {
    return db.select().from(hotels).orderBy(hotels.name);
  }

  async getHotel(id: number): Promise<Hotel | undefined> {
    const [hotel] = await db.select().from(hotels).where(eq(hotels.id, id));
    return hotel;
  }

  async createHotel(hotel: InsertHotel): Promise<Hotel> {
    const [newHotel] = await db.insert(hotels).values(hotel).returning();
    return newHotel;
  }

  async updateHotel(id: number, hotel: Partial<InsertHotel>): Promise<Hotel | undefined> {
    const [updated] = await db
      .update(hotels)
      .set({ ...hotel, updatedAt: new Date() })
      .where(eq(hotels.id, id))
      .returning();
    return updated;
  }

  async deleteHotel(id: number): Promise<boolean> {
    const result = await db.delete(hotels).where(eq(hotels.id, id));
    return true;
  }

  async getTransport(): Promise<Transport[]> {
    return db.select().from(transport).orderBy(transport.routeName);
  }

  async getTransportById(id: number): Promise<Transport | undefined> {
    const [item] = await db.select().from(transport).where(eq(transport.id, id));
    return item;
  }

  async createTransport(item: InsertTransport): Promise<Transport> {
    const [newItem] = await db.insert(transport).values(item).returning();
    return newItem;
  }

  async updateTransport(id: number, item: Partial<InsertTransport>): Promise<Transport | undefined> {
    const [updated] = await db
      .update(transport)
      .set({ ...item, updatedAt: new Date() })
      .where(eq(transport.id, id))
      .returning();
    return updated;
  }

  async deleteTransport(id: number): Promise<boolean> {
    await db.delete(transport).where(eq(transport.id, id));
    return true;
  }

  async getMeals(): Promise<Meal[]> {
    return db.select().from(meals).orderBy(meals.name);
  }

  async getMeal(id: number): Promise<Meal | undefined> {
    const [meal] = await db.select().from(meals).where(eq(meals.id, id));
    return meal;
  }

  async createMeal(meal: InsertMeal): Promise<Meal> {
    const [newMeal] = await db.insert(meals).values(meal).returning();
    return newMeal;
  }

  async updateMeal(id: number, meal: Partial<InsertMeal>): Promise<Meal | undefined> {
    const [updated] = await db
      .update(meals)
      .set({ ...meal, updatedAt: new Date() })
      .where(eq(meals.id, id))
      .returning();
    return updated;
  }

  async deleteMeal(id: number): Promise<boolean> {
    await db.delete(meals).where(eq(meals.id, id));
    return true;
  }

  async getVisa(): Promise<Visa[]> {
    return db.select().from(visa).orderBy(visa.visaType);
  }

  async getVisaById(id: number): Promise<Visa | undefined> {
    const [item] = await db.select().from(visa).where(eq(visa.id, id));
    return item;
  }

  async createVisa(item: InsertVisa): Promise<Visa> {
    const [newItem] = await db.insert(visa).values(item).returning();
    return newItem;
  }

  async updateVisa(id: number, item: Partial<InsertVisa>): Promise<Visa | undefined> {
    const [updated] = await db
      .update(visa)
      .set({ ...item, updatedAt: new Date() })
      .where(eq(visa.id, id))
      .returning();
    return updated;
  }

  async deleteVisa(id: number): Promise<boolean> {
    await db.delete(visa).where(eq(visa.id, id));
    return true;
  }

  async getLaundry(): Promise<Laundry[]> {
    return db.select().from(laundry).orderBy(laundry.name);
  }

  async getLaundryById(id: number): Promise<Laundry | undefined> {
    const [item] = await db.select().from(laundry).where(eq(laundry.id, id));
    return item;
  }

  async createLaundry(item: InsertLaundry): Promise<Laundry> {
    const [newItem] = await db.insert(laundry).values(item).returning();
    return newItem;
  }

  async updateLaundry(id: number, item: Partial<InsertLaundry>): Promise<Laundry | undefined> {
    const [updated] = await db
      .update(laundry)
      .set({ ...item, updatedAt: new Date() })
      .where(eq(laundry.id, id))
      .returning();
    return updated;
  }

  async deleteLaundry(id: number): Promise<boolean> {
    await db.delete(laundry).where(eq(laundry.id, id));
    return true;
  }

  async getAddons(): Promise<Addon[]> {
    return db.select().from(addons).orderBy(addons.name);
  }

  async getAddon(id: number): Promise<Addon | undefined> {
    const [addon] = await db.select().from(addons).where(eq(addons.id, id));
    return addon;
  }

  async createAddon(addon: InsertAddon): Promise<Addon> {
    const [newAddon] = await db.insert(addons).values(addon).returning();
    return newAddon;
  }

  async updateAddon(id: number, addon: Partial<InsertAddon>): Promise<Addon | undefined> {
    const [updated] = await db
      .update(addons)
      .set({ ...addon, updatedAt: new Date() })
      .where(eq(addons.id, id))
      .returning();
    return updated;
  }

  async deleteAddon(id: number): Promise<boolean> {
    await db.delete(addons).where(eq(addons.id, id));
    return true;
  }

  async getPricingPackages(): Promise<PricingPackage[]> {
    return db.select().from(pricingPackages).orderBy(pricingPackages.name);
  }

  async getPricingPackage(id: number): Promise<PricingPackage | undefined> {
    const [pkg] = await db.select().from(pricingPackages).where(eq(pricingPackages.id, id));
    return pkg;
  }

  async createPricingPackage(pkg: InsertPricingPackage): Promise<PricingPackage> {
    const [newPkg] = await db.insert(pricingPackages).values(pkg).returning();
    return newPkg;
  }

  async updatePricingPackage(id: number, pkg: Partial<InsertPricingPackage>): Promise<PricingPackage | undefined> {
    const [updated] = await db
      .update(pricingPackages)
      .set({ ...pkg, updatedAt: new Date() })
      .where(eq(pricingPackages.id, id))
      .returning();
    return updated;
  }

  async deletePricingPackage(id: number): Promise<boolean> {
    await db.delete(pricingPackages).where(eq(pricingPackages.id, id));
    return true;
  }

  async getServiceCharges(): Promise<ServiceCharge[]> {
    return db.select().from(serviceCharges).orderBy(serviceCharges.name);
  }

  async getServiceCharge(id: number): Promise<ServiceCharge | undefined> {
    const [charge] = await db.select().from(serviceCharges).where(eq(serviceCharges.id, id));
    return charge;
  }

  async createServiceCharge(charge: InsertServiceCharge): Promise<ServiceCharge> {
    const [newCharge] = await db.insert(serviceCharges).values(charge).returning();
    return newCharge;
  }

  async updateServiceCharge(id: number, charge: Partial<InsertServiceCharge>): Promise<ServiceCharge | undefined> {
    const [updated] = await db
      .update(serviceCharges)
      .set({ ...charge, updatedAt: new Date() })
      .where(eq(serviceCharges.id, id))
      .returning();
    return updated;
  }

  async deleteServiceCharge(id: number): Promise<boolean> {
    await db.delete(serviceCharges).where(eq(serviceCharges.id, id));
    return true;
  }

  async getCompanySettings(): Promise<CompanySettings | undefined> {
    const [settings] = await db.select().from(companySettings).where(eq(companySettings.id, 1));
    if (!settings) {
      try {
        const [newSettings] = await db.insert(companySettings).values({ 
          id: 1,
          companyName: "Roshan Tours & Travels",
          tagline: "Professional Umrah & Travel Packages"
        }).returning();
        return newSettings;
      } catch (error) {
        const [existing] = await db.select().from(companySettings).where(eq(companySettings.id, 1));
        return existing;
      }
    }
    return settings;
  }

  async updateCompanySettings(settings: Partial<InsertCompanySettings>): Promise<CompanySettings> {
    let [result] = await db.select().from(companySettings).where(eq(companySettings.id, 1));
    
    if (!result) {
      const [newSettings] = await db.insert(companySettings).values({ 
        id: 1,
        ...settings,
        companyName: settings.companyName || "Roshan Tours & Travels",
        tagline: settings.tagline || "Professional Umrah & Travel Packages"
      }).returning();
      return newSettings;
    }
    
    const [updated] = await db
      .update(companySettings)
      .set({ ...settings, updatedAt: new Date() })
      .where(eq(companySettings.id, 1))
      .returning();
    return updated;
  }

  async getQuotations(): Promise<Quotation[]> {
    return db.select().from(quotations).orderBy(quotations.createdAt);
  }

  async getQuotation(id: number): Promise<Quotation | undefined> {
    const [quotation] = await db.select().from(quotations).where(eq(quotations.id, id));
    return quotation;
  }

  async createQuotation(quotation: InsertQuotation): Promise<Quotation> {
    const [newQuotation] = await db.insert(quotations).values(quotation).returning();
    return newQuotation;
  }

  async updateQuotation(id: number, quotation: Partial<InsertQuotation>): Promise<Quotation | undefined> {
    const [updated] = await db
      .update(quotations)
      .set({ ...quotation, updatedAt: new Date() })
      .where(eq(quotations.id, id))
      .returning();
    return updated;
  }

  async deleteQuotation(id: number): Promise<boolean> {
    await db.delete(quotationTransport).where(eq(quotationTransport.quotationId, id));
    await db.delete(quotationAddons).where(eq(quotationAddons.quotationId, id));
    await db.delete(quotations).where(eq(quotations.id, id));
    return true;
  }

  async createQuotationTransport(item: InsertQuotationTransport): Promise<QuotationTransport> {
    const [newItem] = await db.insert(quotationTransport).values(item).returning();
    return newItem;
  }

  async createQuotationAddon(item: InsertQuotationAddon): Promise<QuotationAddon> {
    const [newItem] = await db.insert(quotationAddons).values(item).returning();
    return newItem;
  }

  async deleteQuotationTransportByQuotation(quotationId: number): Promise<void> {
    await db.delete(quotationTransport).where(eq(quotationTransport.quotationId, quotationId));
  }

  async deleteQuotationAddonsByQuotation(quotationId: number): Promise<void> {
    await db.delete(quotationAddons).where(eq(quotationAddons.quotationId, quotationId));
  }

  async getQuotationTransportByQuotation(quotationId: number): Promise<QuotationTransport[]> {
    return db.select().from(quotationTransport).where(eq(quotationTransport.quotationId, quotationId));
  }

  async getQuotationAddonsByQuotation(quotationId: number): Promise<QuotationAddon[]> {
    return db.select().from(quotationAddons).where(eq(quotationAddons.quotationId, quotationId));
  }
}

export const storage = new DatabaseStorage();
