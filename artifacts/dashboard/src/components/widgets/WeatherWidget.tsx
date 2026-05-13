import { useEffect, useState } from "react";
import { useGetWeather, getGetWeatherQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Cloud, Droplets, Wind, Thermometer, Sun } from "lucide-react";

export function WeatherWidget() {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [geoError, setGeoError] = useState(false);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        () => {
          setGeoError(true);
        }
      );
    } else {
      setGeoError(true);
    }
  }, []);

  const lat = coords?.lat ?? (geoError ? 40.71 : undefined);
  const lon = coords?.lon ?? (geoError ? -74.01 : undefined);

  const { data: weather, isLoading } = useGetWeather(
    { lat, lon },
    {
      query: {
        enabled: lat !== undefined && lon !== undefined,
        queryKey: getGetWeatherQueryKey({ lat, lon }),
      },
    }
  );

  return (
    <Card className="h-full flex flex-col bg-card/50 backdrop-blur border-white/5 overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-white/50 uppercase tracking-wider flex items-center gap-2">
          <Cloud className="w-4 h-4" /> Weather
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        {isLoading || !weather ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-24 bg-white/5" />
            <Skeleton className="h-4 w-32 bg-white/5" />
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Skeleton className="h-8 w-full bg-white/5" />
              <Skeleton className="h-8 w-full bg-white/5" />
            </div>
          </div>
        ) : (
          <>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-light tracking-tighter text-white">
                  {Math.round(weather.temperature)}&deg;
                </span>
                <span className="text-lg text-white/50 capitalize">
                  {weather.description}
                </span>
              </div>
              <div className="text-sm font-medium text-primary mt-1">
                {weather.city}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-6 pt-4 border-t border-white/5">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Thermometer className="w-4 h-4 text-white/40" />
                <span>Feels {Math.round(weather.feelsLike)}&deg;</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Droplets className="w-4 h-4 text-white/40" />
                <span>{weather.humidity}%</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Wind className="w-4 h-4 text-white/40" />
                <span>{weather.windSpeed} km/h</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
