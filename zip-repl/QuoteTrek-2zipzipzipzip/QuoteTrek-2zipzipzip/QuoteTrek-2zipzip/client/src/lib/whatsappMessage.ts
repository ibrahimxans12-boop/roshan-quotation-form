import type { Quotation, Hotel, Visa } from "@shared/schema";

export function generateWhatsAppMessage(
  quotation: Quotation,
  makkahHotel?: Hotel,
  madinaHotel?: Hotel,
  visa?: Visa
): string {
  const payingTravelers = quotation.adults + quotation.children;
  
  const message = `*Dear Valuable Customer,*

Greetings from *Roshan Tours & Travels*.!!!
Thanks for your query and we are pleased to send details as per your requirement!!!

*PACKAGE SUMMARY*
✈️ Package Type: ${quotation.travelType.replace('_', ' ').toUpperCase()}
📅 Travel Date: ${quotation.travelDate ? new Date(quotation.travelDate).toLocaleDateString() : 'TBD'}
📅 Return Date: ${quotation.returnDate ? new Date(quotation.returnDate).toLocaleDateString() : 'TBD'}

*TRAVELERS*
👨‍👩‍👧‍👦 Adults: ${quotation.adults}
👧 Children: ${quotation.children}
👶 Infants: ${quotation.infants} (Free)

${makkahHotel ? `*MAKKAH ACCOMMODATION*
🏨 Hotel: ${makkahHotel.name}
🌙 Duration: ${quotation.makkahDays} nights
🍽️ Meal Plan: ${quotation.makkahMealPlan || 'Room Only'}
🧺 Laundry: ${quotation.makkahLaundry ? 'Included' : 'Not Included'}
` : ''}

${madinaHotel ? `*MADINA ACCOMMODATION*
🏨 Hotel: ${madinaHotel.name}
🌙 Duration: ${quotation.madinaDays} nights
🍽️ Meal Plan: ${quotation.madinaMealPlan || 'Room Only'}
🧺 Laundry: ${quotation.madinaLaundry ? 'Included' : 'Not Included'}
` : ''}

${visa ? `*VISA DETAILS*
📄 Visa Type: ${visa.visaType}
⏱️ Processing: ${visa.processingDays} days
` : ''}

*PACKAGE INCLUSIONS*
▪️ Airfare
▪️ Accommodation (Hotels mentioned above)
▪️ Meal Plans as selected
▪️ Visa Processing
${quotation.makkahLaundry || quotation.madinaLaundry ? '▪️ Laundry Service' : ''}
▪️ Transport & Ziyarat
▪️ 24/7 Support
▪️ Complimentary Kit

*PRICING*
💰 *Total Package Amount*
*${payingTravelers} Travelers: SAR ${quotation.totalSar ? Number(quotation.totalSar).toLocaleString() : '0'} Per Person*

💵 Price in other currencies:
🇬🇧 GBP £${quotation.totalGbp ? Number(quotation.totalGbp).toLocaleString() : '0'} Per Person

*IF YOU HAVE ANY QUERY FEEL FREE TO CONTACT US*
📞 Call/WhatsApp: +966XXXXXXXXX
📧 Email: info@roshantoursntravels.com

*THANKS & REGARDS*
*TEAM ROSHAN TOURS & TRAVELS*

*NOTE: Room and Airline Fare are Subject to Availability at the time of confirmation.*
*This quotation is valid for 7 days from the date of issue.*

Quotation Reference: ${quotation.quotationNumber}`;

  return message;
}

export function openWhatsAppChat(phoneNumber: string, message: string): void {
  // Remove any non-digit characters from phone number
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  window.open(whatsappUrl, '_blank');
}
