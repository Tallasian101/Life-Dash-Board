import { useState } from "react";
import {
  useGetBudgetStatus,
  getGetBudgetStatusQueryKey,
  useRecordSpend,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Wallet, Receipt } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const GAUGE_R = 80;
const GAUGE_CX = 110;
const GAUGE_CY = 100;
const STROKE = 14;
const SEMI_CIRC = Math.PI * GAUGE_R;

function gaugeColor(pct: number): string {
  if (pct >= 0.5) {
    const t = (pct - 0.5) / 0.5;
    const r = Math.round(34 + (234 - 34) * (1 - t));
    const g = Math.round(197 + (179 - 197) * (1 - t));
    const b = Math.round(94 + (8 - 94) * (1 - t));
    return `rgb(${r},${g},${b})`;
  } else {
    const t = pct / 0.5;
    const r = Math.round(239 + (234 - 239) * t);
    const g = Math.round(68 + (179 - 68) * t);
    const b = Math.round(68 + (8 - 68) * t);
    return `rgb(${r},${g},${b})`;
  }
}

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function BudgetWidget() {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");

  const { data: budget, isLoading } = useGetBudgetStatus({
    query: { queryKey: getGetBudgetStatusQueryKey() },
  });

  const spendMutation = useRecordSpend({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetBudgetStatusQueryKey() });
        setAmount("");
        setDesc("");
      },
    },
  });

  const handleSubtract = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!isNaN(val) && val > 0) {
      spendMutation.mutate({ data: { amount: val, description: desc || null } });
    }
  };

  const remaining = budget?.remaining ?? 0;
  const limit = budget?.monthlyLimit ?? 1;
  const pct = limit > 0 ? Math.max(0, Math.min(1, remaining / limit)) : 0;
  const dashLength = pct * SEMI_CIRC;
  const color = gaugeColor(pct);
  const transactions = budget?.transactions ?? [];

  const arcPath = `M ${GAUGE_CX - GAUGE_R} ${GAUGE_CY} A ${GAUGE_R} ${GAUGE_R} 0 0 1 ${GAUGE_CX + GAUGE_R} ${GAUGE_CY}`;

  return (
    <Card className="h-full flex flex-col bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)] overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <CardHeader className="pb-2 shrink-0">
        <CardTitle className="text-sm font-medium text-white/50 uppercase tracking-wider flex items-center gap-2">
          <Wallet className="w-4 h-4" /> Monthly Budget
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4 pb-4 min-h-0">
        {isLoading || !budget ? (
          <div className="flex flex-col items-center gap-4 w-full">
            <Skeleton className="h-[110px] w-[220px] rounded-full bg-white/5" />
            <Skeleton className="h-9 w-full bg-white/5 rounded-lg" />
            <div className="w-full space-y-2 mt-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 w-full bg-white/5 rounded-md" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Gauge */}
            <div className="relative flex items-end justify-center shrink-0" style={{ height: 110 }}>
              <svg width={220} height={110} viewBox="0 0 220 110" className="overflow-visible">
                <path
                  d={arcPath}
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                />
                <path
                  d={arcPath}
                  fill="none"
                  stroke={color}
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                  strokeDasharray={`${dashLength} ${SEMI_CIRC}`}
                  style={{
                    filter: `drop-shadow(0 0 6px ${color})`,
                    transition: "stroke-dasharray 0.6s ease, stroke 0.6s ease",
                  }}
                />
              </svg>
              <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-1">
                <span className="text-xl font-bold tabular-nums leading-tight" style={{ color }}>
                  ${fmt(remaining)}
                </span>
                <span className="text-[10px] text-white/40 tracking-wide mt-0.5">
                  of ${fmt(limit)} remaining
                </span>
              </div>
              <span className="absolute text-[10px] font-medium text-white/30" style={{ bottom: -2, left: 16 }}>$0</span>
              <span className="absolute text-[10px] font-medium text-white/30" style={{ bottom: -2, right: 16 }}>${fmt(limit)}</span>
            </div>

            {/* Spend form */}
            <div className="w-full px-1 shrink-0">
              <div className="flex items-center justify-between text-xs text-white/40 mb-3">
                <span>Spent this month</span>
                <span className="font-mono text-white/60">${fmt(budget.spent)}</span>
              </div>
              <form onSubmit={handleSubtract} className="flex gap-2">
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-24 shrink-0 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  disabled={spendMutation.isPending}
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="flex-1 min-w-0 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
                  disabled={spendMutation.isPending}
                />
                <button
                  type="submit"
                  disabled={spendMutation.isPending || !amount || parseFloat(amount) <= 0}
                  className={cn(
                    "shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    "bg-white/8 border border-white/10 text-white/70 hover:bg-white/12 hover:text-white",
                    "disabled:opacity-40 disabled:cursor-not-allowed"
                  )}
                >
                  Subtract
                </button>
              </form>
            </div>

            {/* Transaction history */}
            <div className="flex-1 min-h-0 flex flex-col">
              <div className="flex items-center gap-2 px-1 mb-2 shrink-0">
                <Receipt className="w-3.5 h-3.5 text-white/30" />
                <span className="text-xs font-medium text-white/30 uppercase tracking-wider">
                  This month
                </span>
                {transactions.length > 0 && (
                  <span className="ml-auto text-xs text-white/20 tabular-nums">
                    {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {transactions.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-xs text-white/20 italic">No transactions yet this month.</p>
                </div>
              ) : (
                <ScrollArea className="flex-1 px-1">
                  <div className="space-y-1">
                    {transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between gap-3 py-2 px-2.5 rounded-lg hover:bg-white/[0.03] transition-colors group/tx"
                      >
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm text-white/80 truncate">
                            {tx.description ?? <span className="italic text-white/30">No description</span>}
                          </span>
                          <span className="text-[10px] text-white/30 mt-0.5">
                            {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <span className="shrink-0 text-sm font-mono font-medium text-red-400/80 tabular-nums">
                          −${fmt(tx.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
