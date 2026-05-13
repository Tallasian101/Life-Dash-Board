import { Router } from "express";
import { GetWeatherQueryParams } from "@workspace/api-zod";

const router = Router();

const WMO_CODES: Record<number, { description: string; icon: string }> = {
  0: { description: "Clear sky", icon: "clear" },
  1: { description: "Mainly clear", icon: "clear" },
  2: { description: "Partly cloudy", icon: "cloudy" },
  3: { description: "Overcast", icon: "cloudy" },
  45: { description: "Foggy", icon: "fog" },
  48: { description: "Icy fog", icon: "fog" },
  51: { description: "Light drizzle", icon: "rainy" },
  53: { description: "Drizzle", icon: "rainy" },
  55: { description: "Heavy drizzle", icon: "rainy" },
  61: { description: "Slight rain", icon: "rainy" },
  63: { description: "Rain", icon: "rainy" },
  65: { description: "Heavy rain", icon: "rainy" },
  71: { description: "Slight snow", icon: "snowy" },
  73: { description: "Snow", icon: "snowy" },
  75: { description: "Heavy snow", icon: "snowy" },
  80: { description: "Rain showers", icon: "rainy" },
  81: { description: "Moderate rain showers", icon: "rainy" },
  82: { description: "Heavy rain showers", icon: "rainy" },
  85: { description: "Snow showers", icon: "snowy" },
  86: { description: "Heavy snow showers", icon: "snowy" },
  95: { description: "Thunderstorm", icon: "stormy" },
  96: { description: "Thunderstorm with hail", icon: "stormy" },
  99: { description: "Thunderstorm with heavy hail", icon: "stormy" },
};

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`,
      { headers: { "User-Agent": "PersonalDashboard/1.0" } }
    );
    const data = (await res.json()) as {
      address?: { city?: string; town?: string; village?: string; county?: string };
    };
    return (
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.county ||
      "Unknown"
    );
  } catch {
    return "Unknown";
  }
}

router.get("/weather", async (req, res) => {
  const parsed = GetWeatherQueryParams.safeParse(req.query);
  const lat = parsed.success && parsed.data.lat != null ? parsed.data.lat : 40.71;
  const lon = parsed.success && parsed.data.lon != null ? parsed.data.lon : -74.01;

  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code` +
      `&temperature_unit=celsius&wind_speed_unit=kmh&timezone=auto`;

    const weatherRes = await fetch(url);
    const data = (await weatherRes.json()) as {
      current?: {
        temperature_2m?: number;
        apparent_temperature?: number;
        relative_humidity_2m?: number;
        wind_speed_10m?: number;
        weather_code?: number;
      };
    };

    const current = data.current ?? {};
    const wmo = WMO_CODES[current.weather_code ?? 0] ?? { description: "Unknown", icon: "clear" };
    const city = await reverseGeocode(lat, lon);

    res.json({
      temperature: Math.round((current.temperature_2m ?? 0) * 10) / 10,
      feelsLike: Math.round((current.apparent_temperature ?? 0) * 10) / 10,
      humidity: current.relative_humidity_2m ?? 0,
      windSpeed: Math.round((current.wind_speed_10m ?? 0) * 10) / 10,
      description: wmo.description,
      icon: wmo.icon,
      city,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch weather");
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

export default router;
