import { useEffect, useRef, useState, useCallback } from "react";
import {
  useGetFocusWeek,
  getGetFocusWeekQueryKey,
  useSaveFocusSession,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Timer, Play, Square } from "lucide-react";
import { cn } from "@/lib/utils";

const FOCUS_COLOR = "24 95% 53%";

function fmt(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function toDateStr(d: Date) {
  return d.toISOString().split("T")[0];
}

export function FocusWidget() {
  const queryClient = useQueryClient();
  const [active, setActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: week, isLoading } = useGetFocusWeek({
    query: { queryKey: getGetFocusWeekQueryKey() },
  });

  const saveMutation = useSaveFocusSession({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetFocusWeekQueryKey() }),
    },
  });

  const start = useCallback(() => {
    startRef.current = Date.now();
    setElapsed(0);
    setActive(true);
    document.documentElement.style.setProperty("--primary", FOCUS_COLOR);
    tickRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current!) / 1000));
    }, 1000);
  }, []);

  const stop = useCallback(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    setActive(false);
    const duration = Math.floor((Date.now() - (startRef.current ?? Date.now())) / 1000);
    document.documentElement.style.removeProperty("--primary");
    if (duration >= 5) {
      saveMutation.mutate({
        data: { date: toDateStr(new Date()), durationSeconds: duration },
      });
    }
    setElapsed(0);
  }, [saveMutation]);

  useEffect(() => () => {
    if (tickRef.current) clearInterval(tickRef.current);
    document.documentElement.style.removeProperty("--primary");
  }, []);

  const maxMinutes = Math.max(...(week?.map((d) => d.totalMinutes) ?? [1]), 1);

  return (
    <Card
      className={cn(
        "h-full flex flex-col bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)] overflow-hidden relative transition-colors duration-700",
        active && "border-primary/30 shadow-[0_8px_40px_rgba(0,0,0,0.6),0_0_0_1px_hsl(var(--primary)/0.2)]"
      )}
    >
      {active && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08)_0%,transparent_60%)] pointer-events-none transition-opacity duration-700" />
      )}

      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-white/50 uppercase tracking-wider flex items-center gap-2">
          <Timer className="w-4 h-4" /> Focus Mode
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-6">
        <div className="flex items-center gap-5">
          <button
            onClick={active ? stop : start}
            className={cn(
              "flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300",
              active
                ? "bg-primary text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_28px_hsl(var(--primary)/0.6)]"
                : "bg-white/8 border border-white/10 text-white/80 hover:bg-white/12 hover:border-white/20"
            )}
          >
            {active ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            {active ? "Stop" : "Start Focusing"}
          </button>

          {active && (
            <div className="flex flex-col">
              <span className="text-3xl font-mono font-light tracking-tight text-primary tabular-nums">
                {fmt(elapsed)}
              </span>
              <span className="text-xs text-white/40 mt-0.5">Session in progress</span>
            </div>
          )}

          {!active && elapsed === 0 && !saveMutation.isPending && (
            <span className="text-sm text-white/30 italic">Ready when you are.</span>
          )}

          {saveMutation.isPending && (
            <span className="text-sm text-white/40">Saving session…</span>
          )}
        </div>

        <div className="flex-1">
          <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">
            This week &mdash; focus hours
          </p>

          {isLoading || !week ? (
            <div className="flex items-end gap-2 h-20">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <Skeleton key={i} className="flex-1 bg-white/5 rounded-sm" style={{ height: `${20 + i * 8}%` }} />
              ))}
            </div>
          ) : (
            <div className="flex items-end gap-2 h-20">
              {week.map((day) => {
                const pct = maxMinutes > 0 ? (day.totalMinutes / maxMinutes) * 100 : 0;
                const isToday = day.date === toDateStr(new Date());
                const hours = (day.totalMinutes / 60).toFixed(1);
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5 group/bar">
                    <div className="relative w-full flex-1 flex items-end">
                      <div
                        className={cn(
                          "w-full rounded-t-sm transition-all duration-500",
                          isToday
                            ? "bg-primary shadow-[0_-2px_12px_hsl(var(--primary)/0.35)]"
                            : "bg-white/15 group-hover/bar:bg-white/25"
                        )}
                        style={{ height: pct < 2 ? "2px" : `${pct}%` }}
                      />
                      {day.totalMinutes > 0 && (
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-white/50 opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
                          {hours}h
                        </span>
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-medium",
                        isToday ? "text-primary" : "text-white/30"
                      )}
                    >
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
