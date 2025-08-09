import Link from "next/link";
import { Logo } from "./Logo";
import { Button } from "./ui/button";
import { Home, LayoutDashboard } from "lucide-react";

export function Header() {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/">
          <Logo className="hidden sm:flex" />
          <Rocket className="h-8 w-8 text-primary sm:hidden" />
        </Link>
        <div className="flex items-center gap-2">
           <Button variant="ghost" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Player View
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Host Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function Rocket(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.3.05-3.05A7.5 7.5 0 0 0 4.5 16.5Z" />
      <path d="M19 19c1.5-1.5 2.5-4.5 2.5-6 0-1.5-1-2.5-2.5-2.5s-2.5 1-2.5 2.5c0 1.5.5 3.5 2.5 6Z" />
      <path d="M12 12c-2-2.9-5.5-4.5-5.5-4.5s1.6-3.5 4.5-5.5c.53-.38 1.2-.18 1.5.35l2.5 4.5c.3.55.1.95-.35 1.5L12 12Z" />
      <path d="M12 12l6-6" />
    </svg>
  )
}
