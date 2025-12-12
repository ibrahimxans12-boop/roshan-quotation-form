import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  serial,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - Required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - Required for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("admin"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Hotels table
export const hotels = pgTable("hotels", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 50 }).notNull(), // 'makkah' or 'madina'
  starRating: integer("star_rating").default(3),
  // Room category prices (per night - FIXED by hotel)
  price2Bed: decimal("price_2bed", { precision: 10, scale: 2 }).default("0"),
  price3Bed: decimal("price_3bed", { precision: 10, scale: 2 }).default("0"),
  price4Bed: decimal("price_4bed", { precision: 10, scale: 2 }).default("0"),
  price5Bed: decimal("price_5bed", { precision: 10, scale: 2 }).default("0"),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertHotelSchema = createInsertSchema(hotels).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertHotel = z.infer<typeof insertHotelSchema>;
export type Hotel = typeof hotels.$inferSelect;

// Pricing Packages table - Master data for per-person rates (INR)
export const pricingPackages = pgTable("pricing_packages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  adultRate: decimal("adult_rate", { precision: 10, scale: 2 }).notNull(),
  childRate: decimal("child_rate", { precision: 10, scale: 2 }).notNull(),
  infantRate: decimal("infant_rate", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPricingPackageSchema = createInsertSchema(pricingPackages).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPricingPackage = z.infer<typeof insertPricingPackageSchema>;
export type PricingPackage = typeof pricingPackages.$inferSelect;

// Meals table
export const meals = pgTable("meals", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // 'Breakfast', 'Half Board', 'Full Board', 'Room Only'
  pricePerDay: decimal("price_per_day", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMealSchema = createInsertSchema(meals).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertMeal = z.infer<typeof insertMealSchema>;
export type Meal = typeof meals.$inferSelect;

// Transport table
export const transport = pgTable("transport", {
  id: serial("id").primaryKey(),
  routeName: varchar("route_name", { length: 255 }).notNull(),
  vehicleType: varchar("vehicle_type", { length: 100 }).notNull(), // 'Sedan', 'GMC', 'Hiace 7-seater', 'Hiace 12-seater'
  capacity: integer("capacity").notNull(),
  pricePerTrip: decimal("price_per_trip", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTransportSchema = createInsertSchema(transport).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTransport = z.infer<typeof insertTransportSchema>;
export type Transport = typeof transport.$inferSelect;

// Visa table
export const visa = pgTable("visa", {
  id: serial("id").primaryKey(),
  visaType: varchar("visa_type", { length: 100 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  processingDays: integer("processing_days").default(7),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertVisaSchema = createInsertSchema(visa).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertVisa = z.infer<typeof insertVisaSchema>;
export type Visa = typeof visa.$inferSelect;

// Laundry table
export const laundry = pgTable("laundry", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  pricePerDay: decimal("price_per_day", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertLaundrySchema = createInsertSchema(laundry).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertLaundry = z.infer<typeof insertLaundrySchema>;
export type Laundry = typeof laundry.$inferSelect;

// Add-ons table
export const addons = pgTable("addons", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAddonSchema = createInsertSchema(addons).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAddon = z.infer<typeof insertAddonSchema>;
export type Addon = typeof addons.$inferSelect;

// Service charges table
export const serviceCharges = pgTable("service_charges", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  chargeType: varchar("charge_type", { length: 50 }).notNull(), // 'fixed' or 'percentage'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  appliesTo: varchar("applies_to", { length: 50 }).notNull(), // 'adult', 'child', 'infant', 'all'
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertServiceChargeSchema = createInsertSchema(serviceCharges).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertServiceCharge = z.infer<typeof insertServiceChargeSchema>;
export type ServiceCharge = typeof serviceCharges.$inferSelect;

// Company Settings table
export const companySettings = pgTable("company_settings", {
  id: serial("id").primaryKey(),
  companyName: varchar("company_name", { length: 255 }).default("Roshan Tours & Travels"),
  logo: text("logo"), // Base64 encoded logo or URL
  tagline: varchar("tagline", { length: 255 }).default("Professional Umrah & Travel Packages"),
  phoneNumber: varchar("phone_number", { length: 50 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  termsAndConditions: text("terms_and_conditions"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCompanySettingsSchema = createInsertSchema(companySettings).omit({ id: true, updatedAt: true });
export type InsertCompanySettings = z.infer<typeof insertCompanySettingsSchema>;
export type CompanySettings = typeof companySettings.$inferSelect;

// Quotations table
export const quotations = pgTable("quotations", {
  id: serial("id").primaryKey(),
  quotationNumber: varchar("quotation_number", { length: 50 }).notNull().unique(),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerEmail: varchar("customer_email", { length: 255 }),
  customerPhone: varchar("customer_phone", { length: 50 }),
  travelType: varchar("travel_type", { length: 100 }).notNull(), // 'umrah', 'ramadan_umrah', 'international', 'domestic'
  adults: integer("adults").notNull().default(1),
  children: integer("children").notNull().default(0),
  infants: integer("infants").notNull().default(0),
  travelDate: timestamp("travel_date"),
  returnDate: timestamp("return_date"),
  // Pricing Package reference
  pricingPackageId: integer("pricing_package_id"),
  // Makkah details
  makkahHotelId: integer("makkah_hotel_id"),
  makkahRoomBeds: integer("makkah_room_beds").default(2),
  makkahDays: integer("makkah_days").default(0),
  makkahMealPlan: varchar("makkah_meal_plan", { length: 50 }),
  makkahLaundry: boolean("makkah_laundry").default(false),
  // Madina details
  madinaHotelId: integer("madina_hotel_id"),
  madinaRoomBeds: integer("madina_room_beds").default(2),
  madinaDays: integer("madina_days").default(0),
  madinaMealPlan: varchar("madina_meal_plan", { length: 50 }),
  madinaLaundry: boolean("madina_laundry").default(false),
  // Visa
  visaId: integer("visa_id"),
  // Pricing
  discount: decimal("discount", { precision: 12, scale: 2 }).default("0"),
  total: decimal("total", { precision: 12, scale: 2 }),
  perPerson: decimal("per_person", { precision: 12, scale: 2 }),
  // Meta
  notes: text("notes"),
  status: varchar("status", { length: 50 }).default("draft"), // 'draft', 'sent', 'accepted', 'rejected'
  pdfPath: varchar("pdf_path", { length: 500 }),
  createdBy: varchar("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertQuotationSchema = createInsertSchema(quotations).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertQuotation = z.infer<typeof insertQuotationSchema>;
export type Quotation = typeof quotations.$inferSelect;

// Quotation transport items (many-to-many)
export const quotationTransport = pgTable("quotation_transport", {
  id: serial("id").primaryKey(),
  quotationId: integer("quotation_id").notNull(),
  transportId: integer("transport_id").notNull(),
  vehicleCount: integer("vehicle_count").default(1),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertQuotationTransportSchema = createInsertSchema(quotationTransport).omit({ id: true, createdAt: true });
export type InsertQuotationTransport = z.infer<typeof insertQuotationTransportSchema>;
export type QuotationTransport = typeof quotationTransport.$inferSelect;

// Quotation addons (many-to-many)
export const quotationAddons = pgTable("quotation_addons", {
  id: serial("id").primaryKey(),
  quotationId: integer("quotation_id").notNull(),
  addonId: integer("addon_id").notNull(),
  quantity: integer("quantity").default(1),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertQuotationAddonSchema = createInsertSchema(quotationAddons).omit({ id: true, createdAt: true });
export type InsertQuotationAddon = z.infer<typeof insertQuotationAddonSchema>;
export type QuotationAddon = typeof quotationAddons.$inferSelect;

// Relations
export const quotationsRelations = relations(quotations, ({ one, many }) => ({
  pricingPackage: one(pricingPackages, {
    fields: [quotations.pricingPackageId],
    references: [pricingPackages.id],
  }),
  makkahHotel: one(hotels, {
    fields: [quotations.makkahHotelId],
    references: [hotels.id],
  }),
  madinaHotel: one(hotels, {
    fields: [quotations.madinaHotelId],
    references: [hotels.id],
  }),
  visa: one(visa, {
    fields: [quotations.visaId],
    references: [visa.id],
  }),
  transportItems: many(quotationTransport),
  addonItems: many(quotationAddons),
}));

export const quotationTransportRelations = relations(quotationTransport, ({ one }) => ({
  quotation: one(quotations, {
    fields: [quotationTransport.quotationId],
    references: [quotations.id],
  }),
  transport: one(transport, {
    fields: [quotationTransport.transportId],
    references: [transport.id],
  }),
}));

export const quotationAddonsRelations = relations(quotationAddons, ({ one }) => ({
  quotation: one(quotations, {
    fields: [quotationAddons.quotationId],
    references: [quotations.id],
  }),
  addon: one(addons, {
    fields: [quotationAddons.addonId],
    references: [addons.id],
  }),
}));
