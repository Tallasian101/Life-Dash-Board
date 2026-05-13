import { useGetNews, getGetNewsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Newspaper, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

export function NewsWidget() {
  const { data: news, isLoading } = useGetNews({
    query: {
      queryKey: getGetNewsQueryKey(),
    },
  });

  return (
    <Card className="h-full flex flex-col bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)] overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-white/50 uppercase tracking-wider flex items-center gap-2">
          <Newspaper className="w-4 h-4" /> World News
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        {isLoading || !news ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-full bg-white/5" />
                <Skeleton className="h-3 w-2/3 bg-white/5" />
              </div>
            ))}
          </div>
        ) : (
          <ScrollArea className="h-[300px] sm:h-full px-6 pb-6">
            <div className="space-y-5">
              {news.map((article) => (
                <a
                  key={article.id}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group/article"
                >
                  <h3 className="text-sm font-medium text-white/90 group-hover/article:text-primary transition-colors line-clamp-2 leading-snug mb-1.5">
                    {article.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-white/40">
                    <span className="font-mono uppercase tracking-wider">{article.source}</span>
                    <span className="flex items-center gap-1">
                      {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover/article:opacity-100 transition-opacity" />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
