import { useEffect, useState } from "react";
import { Calendar, Clock, Cpu, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";

const Dashboard = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card className="p-6 jarvis-border bg-card/50 backdrop-blur-xl hover:jarvis-glow transition-all duration-300">
        <div className="flex items-center gap-3">
          <Clock className="w-8 h-8 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Current Time</p>
            <p className="text-2xl font-bold jarvis-text-glow">{formatTime(time)}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 jarvis-border bg-card/50 backdrop-blur-xl hover:jarvis-glow transition-all duration-300">
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8 text-secondary" />
          <div>
            <p className="text-sm text-muted-foreground">Date</p>
            <p className="text-lg font-semibold text-foreground">
              {formatDate(time)}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6 jarvis-border bg-card/50 backdrop-blur-xl hover:jarvis-glow transition-all duration-300">
        <div className="flex items-center gap-3">
          <Activity className="w-8 h-8 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="text-lg font-semibold text-primary">Online</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 jarvis-border bg-card/50 backdrop-blur-xl hover:jarvis-glow transition-all duration-300">
        <div className="flex items-center gap-3">
          <Cpu className="w-8 h-8 text-secondary" />
          <div>
            <p className="text-sm text-muted-foreground">AI Model</p>
            <p className="text-lg font-semibold text-foreground">Gemini 2.5</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
