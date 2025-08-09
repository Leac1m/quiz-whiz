import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-4 flex justify-end">
        <Button asChild variant="ghost">
          <Link href="/dashboard">Host Dashboard</Link>
        </Button>
      </header>
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="flex flex-col items-center text-center">
          <Logo />
          <p className="mt-2 mb-8 text-muted-foreground max-w-md">The most engaging way to host live quizzes for any occasion. Jump in and see for yourself!</p>

          <Card className="w-full max-w-sm shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-headline">Join a Game</CardTitle>
              <CardDescription>Enter the PIN from the host's screen.</CardDescription>
            </CardHeader>
            <CardContent>
              <form>
                <div className="grid w-full items-center gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Input id="pin" placeholder="GAME PIN" className="text-center tracking-widest font-bold text-lg h-14" />
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter>
                <Button className="w-full" size="lg" asChild>
                    <Link href="/play/12345">Enter</Link>
                </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
