import { useState } from "react";
import {
  useGetTodos,
  getGetTodosQueryKey,
  useCreateTodo,
  useUpdateTodo,
  useDeleteTodo,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckSquare, Plus, Trash2, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function TodoWidget() {
  const [newTodo, setNewTodo] = useState("");
  const queryClient = useQueryClient();

  const { data: todos, isLoading } = useGetTodos({
    query: { queryKey: getGetTodosQueryKey() },
  });

  const createMutation = useCreateTodo({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetTodosQueryKey() });
        setNewTodo("");
      },
    },
  });

  const updateMutation = useUpdateTodo({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetTodosQueryKey() }),
    },
  });

  const deleteMutation = useDeleteTodo({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetTodosQueryKey() }),
    },
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) createMutation.mutate({ data: { text: newTodo.trim() } });
  };

  const handleToggle = (id: number, completed: boolean) => {
    updateMutation.mutate({ id, data: { completed: !completed } });
  };

  return (
    <Card className="h-full flex flex-col bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)] overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-white/50 uppercase tracking-wider flex items-center gap-2">
          <CheckSquare className="w-4 h-4" /> Tasks
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <form onSubmit={handleAdd} className="px-6 pb-4">
          <div className="relative">
            <Input
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new task..."
              className="bg-black/20 border-white/10 text-white placeholder:text-white/30 pr-10 focus-visible:ring-primary/50"
              disabled={createMutation.isPending}
            />
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              className="absolute right-1 top-1 h-8 w-8 text-white/50 hover:text-white hover:bg-white/10"
              disabled={createMutation.isPending || !newTodo.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </form>

        <ScrollArea className="flex-1 px-6 pb-6">
          {isLoading || !todos ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full bg-white/5 rounded-md" />
              ))}
            </div>
          ) : todos.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-sm text-white/30 italic">
              All caught up.
            </div>
          ) : (
            <div className="space-y-2">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className={cn(
                    "group/item flex items-center gap-3 p-2.5 rounded-md border border-transparent hover:bg-white/[0.03] hover:border-white/8 transition-all duration-200",
                    todo.completed && "opacity-50"
                  )}
                >
                  <button
                    onClick={() => handleToggle(todo.id, todo.completed)}
                    className={cn(
                      "flex-shrink-0 h-5 w-5 rounded flex items-center justify-center border transition-all duration-200",
                      todo.completed
                        ? "bg-primary border-primary text-primary-foreground shadow-[0_0_8px_rgba(14,165,233,0.5)]"
                        : "border-white/20 text-transparent hover:border-primary/50"
                    )}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <span
                    className={cn(
                      "flex-1 text-sm transition-all duration-200",
                      todo.completed ? "text-white/40 line-through" : "text-white/90"
                    )}
                  >
                    {todo.text}
                  </span>
                  <button
                    onClick={() => deleteMutation.mutate({ id: todo.id })}
                    className="flex-shrink-0 opacity-0 group-hover/item:opacity-100 text-white/30 hover:text-destructive transition-all duration-200 focus:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
