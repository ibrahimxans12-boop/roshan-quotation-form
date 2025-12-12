import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./simpleAuth";

function generateQuotationNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `RTT-${year}${month}${day}-${random}`;
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<void> {
  await setupAuth(app);

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId || "admin-user";
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get("/api/hotels", isAuthenticated, async (req, res) => {
    try {
      const hotels = await storage.getHotels();
      res.json(hotels);
    } catch (error) {
      console.error("Error fetching hotels:", error);
      res.status(500).json({ message: "Failed to fetch hotels" });
    }
  });

  app.get("/api/hotels/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const hotel = await storage.getHotel(id);
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }
      res.json(hotel);
    } catch (error) {
      console.error("Error fetching hotel:", error);
      res.status(500).json({ message: "Failed to fetch hotel" });
    }
  });

  app.post("/api/hotels", isAuthenticated, async (req, res) => {
    try {
      const hotel = await storage.createHotel(req.body);
      res.status(201).json(hotel);
    } catch (error) {
      console.error("Error creating hotel:", error);
      res.status(500).json({ message: "Failed to create hotel" });
    }
  });

  app.patch("/api/hotels/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const hotel = await storage.updateHotel(id, req.body);
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }
      res.json(hotel);
    } catch (error) {
      console.error("Error updating hotel:", error);
      res.status(500).json({ message: "Failed to update hotel" });
    }
  });

  app.delete("/api/hotels/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteHotel(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting hotel:", error);
      res.status(500).json({ message: "Failed to delete hotel" });
    }
  });

  app.get("/api/transport", isAuthenticated, async (req, res) => {
    try {
      const transport = await storage.getTransport();
      res.json(transport);
    } catch (error) {
      console.error("Error fetching transport:", error);
      res.status(500).json({ message: "Failed to fetch transport" });
    }
  });

  app.get("/api/transport/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const transport = await storage.getTransportById(id);
      if (!transport) {
        return res.status(404).json({ message: "Transport not found" });
      }
      res.json(transport);
    } catch (error) {
      console.error("Error fetching transport:", error);
      res.status(500).json({ message: "Failed to fetch transport" });
    }
  });

  app.post("/api/transport", isAuthenticated, async (req, res) => {
    try {
      const transport = await storage.createTransport(req.body);
      res.status(201).json(transport);
    } catch (error) {
      console.error("Error creating transport:", error);
      res.status(500).json({ message: "Failed to create transport" });
    }
  });

  app.patch("/api/transport/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const transport = await storage.updateTransport(id, req.body);
      if (!transport) {
        return res.status(404).json({ message: "Transport not found" });
      }
      res.json(transport);
    } catch (error) {
      console.error("Error updating transport:", error);
      res.status(500).json({ message: "Failed to update transport" });
    }
  });

  app.delete("/api/transport/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTransport(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting transport:", error);
      res.status(500).json({ message: "Failed to delete transport" });
    }
  });

  app.get("/api/meals", isAuthenticated, async (req, res) => {
    try {
      const meals = await storage.getMeals();
      res.json(meals);
    } catch (error) {
      console.error("Error fetching meals:", error);
      res.status(500).json({ message: "Failed to fetch meals" });
    }
  });

  app.get("/api/meals/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const meal = await storage.getMeal(id);
      if (!meal) {
        return res.status(404).json({ message: "Meal not found" });
      }
      res.json(meal);
    } catch (error) {
      console.error("Error fetching meal:", error);
      res.status(500).json({ message: "Failed to fetch meal" });
    }
  });

  app.post("/api/meals", isAuthenticated, async (req, res) => {
    try {
      const meal = await storage.createMeal(req.body);
      res.status(201).json(meal);
    } catch (error) {
      console.error("Error creating meal:", error);
      res.status(500).json({ message: "Failed to create meal" });
    }
  });

  app.patch("/api/meals/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const meal = await storage.updateMeal(id, req.body);
      if (!meal) {
        return res.status(404).json({ message: "Meal not found" });
      }
      res.json(meal);
    } catch (error) {
      console.error("Error updating meal:", error);
      res.status(500).json({ message: "Failed to update meal" });
    }
  });

  app.delete("/api/meals/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMeal(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting meal:", error);
      res.status(500).json({ message: "Failed to delete meal" });
    }
  });

  app.get("/api/visa", isAuthenticated, async (req, res) => {
    try {
      const visa = await storage.getVisa();
      res.json(visa);
    } catch (error) {
      console.error("Error fetching visa:", error);
      res.status(500).json({ message: "Failed to fetch visa" });
    }
  });

  app.get("/api/visa/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const visa = await storage.getVisaById(id);
      if (!visa) {
        return res.status(404).json({ message: "Visa not found" });
      }
      res.json(visa);
    } catch (error) {
      console.error("Error fetching visa:", error);
      res.status(500).json({ message: "Failed to fetch visa" });
    }
  });

  app.post("/api/visa", isAuthenticated, async (req, res) => {
    try {
      const visa = await storage.createVisa(req.body);
      res.status(201).json(visa);
    } catch (error) {
      console.error("Error creating visa:", error);
      res.status(500).json({ message: "Failed to create visa" });
    }
  });

  app.patch("/api/visa/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const visa = await storage.updateVisa(id, req.body);
      if (!visa) {
        return res.status(404).json({ message: "Visa not found" });
      }
      res.json(visa);
    } catch (error) {
      console.error("Error updating visa:", error);
      res.status(500).json({ message: "Failed to update visa" });
    }
  });

  app.delete("/api/visa/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteVisa(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting visa:", error);
      res.status(500).json({ message: "Failed to delete visa" });
    }
  });

  app.get("/api/laundry", isAuthenticated, async (req, res) => {
    try {
      const laundry = await storage.getLaundry();
      res.json(laundry);
    } catch (error) {
      console.error("Error fetching laundry:", error);
      res.status(500).json({ message: "Failed to fetch laundry" });
    }
  });

  app.get("/api/laundry/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const laundry = await storage.getLaundryById(id);
      if (!laundry) {
        return res.status(404).json({ message: "Laundry not found" });
      }
      res.json(laundry);
    } catch (error) {
      console.error("Error fetching laundry:", error);
      res.status(500).json({ message: "Failed to fetch laundry" });
    }
  });

  app.post("/api/laundry", isAuthenticated, async (req, res) => {
    try {
      const laundry = await storage.createLaundry(req.body);
      res.status(201).json(laundry);
    } catch (error) {
      console.error("Error creating laundry:", error);
      res.status(500).json({ message: "Failed to create laundry" });
    }
  });

  app.patch("/api/laundry/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const laundry = await storage.updateLaundry(id, req.body);
      if (!laundry) {
        return res.status(404).json({ message: "Laundry not found" });
      }
      res.json(laundry);
    } catch (error) {
      console.error("Error updating laundry:", error);
      res.status(500).json({ message: "Failed to update laundry" });
    }
  });

  app.delete("/api/laundry/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteLaundry(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting laundry:", error);
      res.status(500).json({ message: "Failed to delete laundry" });
    }
  });

  app.get("/api/addons", isAuthenticated, async (req, res) => {
    try {
      const addons = await storage.getAddons();
      res.json(addons);
    } catch (error) {
      console.error("Error fetching addons:", error);
      res.status(500).json({ message: "Failed to fetch addons" });
    }
  });

  app.get("/api/addons/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const addon = await storage.getAddon(id);
      if (!addon) {
        return res.status(404).json({ message: "Addon not found" });
      }
      res.json(addon);
    } catch (error) {
      console.error("Error fetching addon:", error);
      res.status(500).json({ message: "Failed to fetch addon" });
    }
  });

  app.post("/api/addons", isAuthenticated, async (req, res) => {
    try {
      const addon = await storage.createAddon(req.body);
      res.status(201).json(addon);
    } catch (error) {
      console.error("Error creating addon:", error);
      res.status(500).json({ message: "Failed to create addon" });
    }
  });

  app.patch("/api/addons/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const addon = await storage.updateAddon(id, req.body);
      if (!addon) {
        return res.status(404).json({ message: "Addon not found" });
      }
      res.json(addon);
    } catch (error) {
      console.error("Error updating addon:", error);
      res.status(500).json({ message: "Failed to update addon" });
    }
  });

  app.delete("/api/addons/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAddon(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting addon:", error);
      res.status(500).json({ message: "Failed to delete addon" });
    }
  });

  app.get("/api/pricing-packages", isAuthenticated, async (req, res) => {
    try {
      const packages = await storage.getPricingPackages();
      res.json(packages);
    } catch (error) {
      console.error("Error fetching pricing packages:", error);
      res.status(500).json({ message: "Failed to fetch pricing packages" });
    }
  });

  app.get("/api/pricing-packages/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pkg = await storage.getPricingPackage(id);
      if (!pkg) {
        return res.status(404).json({ message: "Pricing package not found" });
      }
      res.json(pkg);
    } catch (error) {
      console.error("Error fetching pricing package:", error);
      res.status(500).json({ message: "Failed to fetch pricing package" });
    }
  });

  app.post("/api/pricing-packages", isAuthenticated, async (req, res) => {
    try {
      const pkg = await storage.createPricingPackage(req.body);
      res.status(201).json(pkg);
    } catch (error) {
      console.error("Error creating pricing package:", error);
      res.status(500).json({ message: "Failed to create pricing package" });
    }
  });

  app.patch("/api/pricing-packages/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pkg = await storage.updatePricingPackage(id, req.body);
      if (!pkg) {
        return res.status(404).json({ message: "Pricing package not found" });
      }
      res.json(pkg);
    } catch (error) {
      console.error("Error updating pricing package:", error);
      res.status(500).json({ message: "Failed to update pricing package" });
    }
  });

  app.delete("/api/pricing-packages/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePricingPackage(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting pricing package:", error);
      res.status(500).json({ message: "Failed to delete pricing package" });
    }
  });

  app.get("/api/service-charges", isAuthenticated, async (req, res) => {
    try {
      const charges = await storage.getServiceCharges();
      res.json(charges);
    } catch (error) {
      console.error("Error fetching service charges:", error);
      res.status(500).json({ message: "Failed to fetch service charges" });
    }
  });

  app.get("/api/service-charges/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const charge = await storage.getServiceCharge(id);
      if (!charge) {
        return res.status(404).json({ message: "Service charge not found" });
      }
      res.json(charge);
    } catch (error) {
      console.error("Error fetching service charge:", error);
      res.status(500).json({ message: "Failed to fetch service charge" });
    }
  });

  app.post("/api/service-charges", isAuthenticated, async (req, res) => {
    try {
      const charge = await storage.createServiceCharge(req.body);
      res.status(201).json(charge);
    } catch (error) {
      console.error("Error creating service charge:", error);
      res.status(500).json({ message: "Failed to create service charge" });
    }
  });

  app.patch("/api/service-charges/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const charge = await storage.updateServiceCharge(id, req.body);
      if (!charge) {
        return res.status(404).json({ message: "Service charge not found" });
      }
      res.json(charge);
    } catch (error) {
      console.error("Error updating service charge:", error);
      res.status(500).json({ message: "Failed to update service charge" });
    }
  });

  app.delete("/api/service-charges/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteServiceCharge(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting service charge:", error);
      res.status(500).json({ message: "Failed to delete service charge" });
    }
  });

  app.get("/api/quotations", isAuthenticated, async (req, res) => {
    try {
      const quotations = await storage.getQuotations();
      res.json(quotations);
    } catch (error) {
      console.error("Error fetching quotations:", error);
      res.status(500).json({ message: "Failed to fetch quotations" });
    }
  });

  app.get("/api/quotations/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const quotation = await storage.getQuotation(id);
      if (!quotation) {
        return res.status(404).json({ message: "Quotation not found" });
      }
      
      const transportItems = await storage.getQuotationTransportByQuotation(id);
      const addonItems = await storage.getQuotationAddonsByQuotation(id);
      
      const selectedTransport = transportItems.map(item => ({
        transportId: item.transportId,
        vehicleCount: item.vehicleCount || 1,
      }));
      
      const selectedAddons = addonItems.map(item => ({
        addonId: item.addonId,
        quantity: item.quantity || 1,
      }));
      
      res.json({
        ...quotation,
        selectedTransport,
        selectedAddons,
      });
    } catch (error) {
      console.error("Error fetching quotation:", error);
      res.status(500).json({ message: "Failed to fetch quotation" });
    }
  });

  app.post("/api/quotations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId || "admin-user";
      const { selectedTransport, selectedAddons, ...quotationData } = req.body;
      
      // Convert date strings to Date objects
      const processedData = {
        ...quotationData,
        travelDate: quotationData.travelDate ? new Date(quotationData.travelDate) : undefined,
        returnDate: quotationData.returnDate ? new Date(quotationData.returnDate) : undefined,
      };

      const quotation = await storage.createQuotation({
        ...processedData,
        quotationNumber: generateQuotationNumber(),
        createdBy: userId,
        status: "draft",
      });

      if (selectedTransport && selectedTransport.length > 0) {
        for (const item of selectedTransport) {
          await storage.createQuotationTransport({
            quotationId: quotation.id,
            transportId: item.transportId,
            vehicleCount: item.vehicleCount,
          });
        }
      }

      if (selectedAddons && selectedAddons.length > 0) {
        for (const item of selectedAddons) {
          await storage.createQuotationAddon({
            quotationId: quotation.id,
            addonId: item.addonId,
            quantity: item.quantity,
          });
        }
      }

      res.status(201).json(quotation);
    } catch (error) {
      console.error("Error creating quotation:", error);
      res.status(500).json({ message: "Failed to create quotation" });
    }
  });

  app.patch("/api/quotations/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { selectedTransport, selectedAddons, ...quotationData } = req.body;
      
      // Convert date strings to Date objects
      const processedData = {
        ...quotationData,
        travelDate: quotationData.travelDate ? new Date(quotationData.travelDate) : undefined,
        returnDate: quotationData.returnDate ? new Date(quotationData.returnDate) : undefined,
      };

      const quotation = await storage.updateQuotation(id, processedData);
      if (!quotation) {
        return res.status(404).json({ message: "Quotation not found" });
      }

      if (selectedTransport) {
        await storage.deleteQuotationTransportByQuotation(id);
        for (const item of selectedTransport) {
          await storage.createQuotationTransport({
            quotationId: id,
            transportId: item.transportId,
            vehicleCount: item.vehicleCount,
          });
        }
      }

      if (selectedAddons) {
        await storage.deleteQuotationAddonsByQuotation(id);
        for (const item of selectedAddons) {
          await storage.createQuotationAddon({
            quotationId: id,
            addonId: item.addonId,
            quantity: item.quantity,
          });
        }
      }

      res.json(quotation);
    } catch (error) {
      console.error("Error updating quotation:", error);
      res.status(500).json({ message: "Failed to update quotation" });
    }
  });

  app.delete("/api/quotations/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteQuotation(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting quotation:", error);
      res.status(500).json({ message: "Failed to delete quotation" });
    }
  });

  app.get("/api/company-settings", isAuthenticated, async (req, res) => {
    try {
      const settings = await storage.getCompanySettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching company settings:", error);
      res.status(500).json({ message: "Failed to fetch company settings" });
    }
  });

  app.patch("/api/company-settings", isAuthenticated, async (req, res) => {
    try {
      const settings = await storage.updateCompanySettings(req.body);
      res.json(settings);
    } catch (error) {
      console.error("Error updating company settings:", error);
      res.status(500).json({ message: "Failed to update company settings" });
    }
  });
}
