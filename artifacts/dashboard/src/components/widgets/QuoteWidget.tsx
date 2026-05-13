import { useGetDailyQuote, getGetDailyQuoteQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Quote as QuoteIcon } from "lucide-react";

export function QuoteWidget() {
  const { data: quote, isLoading } = useGetDailyQuote({
    query: {
      queryKey: getGetDailyQuoteQueryKey(),
    },
  });

  return (
    <Card className="h-full flex flex-col justify-center bg-card/50 backdrop-blur border-white/5 relative group overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      <CardContent className="p-8 relative">
        <QuoteIcon className="absolute top-6 left-6 w-12 h-12 text-white/5 rotate-180 -z-10" />
        
        {isLoading || !quote ? (
          <div className="space-y-4 max-w-sm mx-auto">
            <Skeleton className="h-6 w-full bg-white/5" />
            <Skeleton className="h-6 w-4/5 bg-white/5" />
            <Skeleton className="h-4 w-1/3 bg-white/5 mt-6 mx-auto" />
          </div>
        ) : (
          <div className="text-center space-y-6">
            <p className="text-xl md:text-2xl font-serif italic text-white/90 leading-relaxed max-w-xl mx-auto">
              "{quote.text}"
            </p>
            <p className="text-sm font-medium tracking-widest text-primary uppercase">
              &mdash; {quote.author}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
