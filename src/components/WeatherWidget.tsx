import { useEffect, useState } from "react";
import { Cloud, CloudRain, Sun, Wind } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface WeatherData {
  city: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
}

const WeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('weather', {
        body: { city: 'Mumbai' }
      });

      if (error) throw error;
      setWeather(data);
    } catch (error) {
      console.error('Weather fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = () => {
    if (!weather) return <Cloud className="w-12 h-12 text-primary" />;
    
    const condition = weather.condition.toLowerCase();
    if (condition.includes('rain')) return <CloudRain className="w-12 h-12 text-blue-400" />;
    if (condition.includes('clear') || condition.includes('sun')) return <Sun className="w-12 h-12 text-yellow-400" />;
    return <Cloud className="w-12 h-12 text-primary" />;
  };

  if (loading) {
    return (
      <Card className="p-6 jarvis-border bg-card/50 backdrop-blur-xl">
        <div className="animate-pulse space-y-3">
          <div className="h-12 w-12 bg-muted rounded-full" />
          <div className="h-4 bg-muted rounded w-24" />
          <div className="h-6 bg-muted rounded w-16" />
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 jarvis-border bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-xl hover:jarvis-glow transition-all duration-300">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            {getWeatherIcon()}
            <div className="text-right">
              <p className="text-3xl font-bold jarvis-text-glow">
                {weather?.temperature}°C
              </p>
              <p className="text-sm text-muted-foreground">
                Feels {weather?.feelsLike}°C
              </p>
            </div>
          </div>
          
          <div>
            <p className="text-lg font-semibold text-foreground">
              {weather?.city}
            </p>
            <p className="text-sm text-muted-foreground">
              {weather?.condition}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t jarvis-border/50">
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Wind</p>
                <p className="text-sm font-semibold">{weather?.windSpeed} km/h</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Humidity</p>
              <p className="text-sm font-semibold">{weather?.humidity}%</p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default WeatherWidget;
