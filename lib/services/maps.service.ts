import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";

export class MapsService {
  /**
   * Geocodes an address to retrieve lat/lng coordinates.
   */
  static async geocodeAddress(address: string) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      logger.warn("Google Maps API Key missing. Returning coordinate stubs.");
      return { latitude: 28.6139, longitude: 77.2090 }; // Default Delhi coordinates
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${apiKey}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.status === "OK" && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {
          latitude: location.lat,
          longitude: location.lng,
          formattedAddress: data.results[0].formatted_address,
        };
      } else {
        logger.warn(`Geocoding failed for address: ${address}. Status: ${data.status}`);
        return { latitude: 28.6139, longitude: 77.2090 };
      }
    } catch (error: any) {
      logger.error("Error geocoding address:", error);
      return { latitude: 28.6139, longitude: 77.2090 };
    }
  }
}
