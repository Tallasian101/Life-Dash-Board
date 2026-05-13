import { WeatherWidget } from "@/components/widgets/WeatherWidget";
import { NewsWidget } from "@/components/widgets/NewsWidget";
import { TodoWidget } from "@/components/widgets/TodoWidget";
import { QuoteWidget } from "@/components/widgets/QuoteWidget";
import { Clock } from "@/components/widgets/Clock";
import { LayoutDashboard } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050A15] text-slate-200 selection:bg-primary/30 selection:text-white pb-12">
      {/* Background ambient light */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-12 relative z-10">
        <header className="flex items-end justify-between mb-10 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white tracking-tight">Life Dashboard</h1>
              <p className="text-sm text-white/50 font-medium tracking-wide">Command Center</p>
            </div>
          </div>
          <Clock />
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-fr">
          <div className="h-[400px] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
            <WeatherWidget />
          </div>
          
          <div className="h-[400px] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both">
            <TodoWidget />
          </div>

          <div className="h-[400px] md:col-span-2 lg:col-span-1 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
            <NewsWidget />
          </div>

          <div className="h-[400px] md:col-span-2 lg:col-span-1 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400 fill-mode-both">
            <QuoteWidget />
          </div>
        </main>
      </div>
    </div>
  );
}
