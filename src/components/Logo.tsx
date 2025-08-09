import { Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Rocket className="h-8 w-8 text-primary" />
      <h1 className="text-4xl font-bold font-headline tracking-tighter text-primary">
        QuizWhiz
      </h1>
    </div>
  );
}
