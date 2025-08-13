'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Logo } from '@/components/Logo';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useJoinGame } from '@/hooks/use-queries';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle, GamepadIcon } from 'lucide-react';

export default function Home() {
  const [pin, setPin] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const joinGame = useJoinGame();

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (pin.length === 4) {
      setShowNameInput(true);
    } else {
      toast({
        title: 'Invalid PIN',
        description: 'Please enter a 4-digit game PIN.',
        variant: 'destructive',
      });
    }
  };

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!playerName.trim()) {
      toast({
        title: 'Name Required',
        description: 'Please enter your name to join the game.',
        variant: 'destructive',
      });
      return;
    }

    if (playerName.trim().length < 2) {
      toast({
        title: 'Name Too Short',
        description: 'Your name must be at least 2 characters long.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await joinGame.mutateAsync({
        pin: pin,
        name: playerName.trim(),
      });

      toast({
        title: 'Joined Game!',
        description: `Welcome ${playerName}! Waiting for the game to start...`,
      });

      // Redirect to player game page
      router.push(
        `/play/${response.gameId}?playerId=${
          response.playerId
        }&name=${encodeURIComponent(playerName)}&pin=${pin}`
      );
    } catch (error: any) {
      let errorMessage = 'Failed to join the game. Please try again.';

      // Handle specific error cases
      if (error.message?.includes('404')) {
        errorMessage = 'Game not found. Please check the PIN and try again.';
      } else if (error.message?.includes('400')) {
        errorMessage =
          'This name is already taken. Please choose a different name.';
      } else if (error.message?.includes('already started')) {
        errorMessage =
          'This game has already started and is no longer accepting players.';
      }

      toast({
        title: 'Could Not Join Game',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4); // Only numbers, max 4 digits
    setPin(value);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, 20); // Max 20 characters
    setPlayerName(value);
  };

  const handleBack = () => {
    setShowNameInput(false);
    setPlayerName('');
  };

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
          <p className="mt-2 mb-8 text-muted-foreground max-w-md">
            The most engaging way to host live quizzes for any occasion. Jump in
            and see for yourself!
          </p>

          {/* Show error if backend connection fails */}
          {joinGame.error && (
            <Alert variant="destructive" className="mb-6 max-w-sm">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Unable to connect to the game server. Please check if the
                backend is running.
              </AlertDescription>
            </Alert>
          )}

          <Card className="w-full max-w-sm shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-headline flex items-center gap-2">
                <GamepadIcon className="h-6 w-6" />
                Join a Game
              </CardTitle>
              <CardDescription>
                {showNameInput
                  ? `Joining game with PIN: ${pin}`
                  : "Enter the PIN from the host's screen."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!showNameInput ? (
                <form onSubmit={handlePinSubmit}>
                  <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <Input
                        id="pin"
                        placeholder="GAME PIN"
                        className="text-center tracking-widest font-bold text-lg h-14"
                        value={pin}
                        onChange={handlePinChange}
                        maxLength={4}
                        autoFocus
                      />
                    </div>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleJoinGame}>
                  <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <Input
                        id="name"
                        placeholder="Your Name"
                        className="text-center font-semibold text-lg h-14"
                        value={playerName}
                        onChange={handleNameChange}
                        maxLength={20}
                        autoFocus
                      />
                      <p className="text-xs text-muted-foreground">
                        This name will be visible to other players
                      </p>
                    </div>
                  </div>
                </form>
              )}
            </CardContent>
            <CardFooter className="flex gap-2">
              {!showNameInput ? (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePinSubmit}
                  disabled={pin.length !== 4}
                >
                  Continue
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleBack}
                    disabled={joinGame.isPending}
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    size="lg"
                    onClick={handleJoinGame}
                    disabled={joinGame.isPending || !playerName.trim()}
                  >
                    {joinGame.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      'Join Game'
                    )}
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>

          {/* Additional info */}
          <div className="mt-6 text-sm text-muted-foreground max-w-sm">
            <p>
              Need help? Ask your host for the game PIN displayed on their
              screen.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
