'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  BarChart,
  Crown,
  Play,
  Users,
  XCircle,
  Loader2,
  AlertCircle,
  Timer,
  Wifi,
  WifiOff,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useQuiz } from '@/hooks/use-queries';
import { useHostGameSocket } from '@/hooks/use-socket';
import { useToast } from '@/hooks/use-toast';

interface Player {
  id: string;
  name: string;
  score: number;
}

interface GameData {
  gameId: string;
  pin: string;
  players: Player[];
  currentQuestion: number;
  totalQuestions: number;
  question?: {
    question: string;
    choices: { id: string; text: string }[];
    timeLimit: number;
    questionNumber: number;
    totalQuestions: number;
  };
  leaderboard?: Player[];
  timeLeft?: number;
  stats?: {
    choiceCounts: Record<string, number>;
  };
  correctChoiceId?: string;
}

type GameState = 'lobby' | 'question' | 'reveal' | 'leaderboard' | 'finished';

export default function HostGamePage({
  params,
}: {
  params: { quizId: string };
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  // Get quiz data for the game
  // const { data: quiz, isLoading: quizLoading, error: quizError } = useQuiz(params.gameId);

  // Game state
  const [gameState, setGameState] = useState<GameState>('lobby');
  const [gameData, setGameData] = useState<GameData>({
    gameId: '',
    pin: searchParams.get('pin') || '',
    players: [],
    currentQuestion: 0,
    totalQuestions: 0,
  });
  const [isInitializingGame, setIsInitializingGame] = useState(true);

  // WebSocket connection with authentication
  const {
    startGame,
    initGame,
    nextQuestion,
    revealAnswer,
    endGame,
    on,
    isConnected,
    error: socketError,
  } = useHostGameSocket();

  // Initialize game when component mounts and quiz is loaded
  useEffect(() => {
    if (isConnected) {
      initGame(params.quizId);
    }
  }, [isConnected, initGame]);

  // Handle socket connection errors
  useEffect(() => {
    if (socketError) {
      toast({
        title: 'Connection Error',
        description: socketError,
        variant: 'destructive',
      });

      if (socketError.includes('Authentication')) {
        router.push('/login');
      }
    }
  }, [socketError, toast, router]);

  // WebSocket event listeners
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = [
      on(
        'game:init',
        (data: { gameId: string; pin: string; totalQuestions: number }) => {
          setGameData((prev) => ({
            ...prev,
            gameId: data.gameId,
            pin: data.pin,
            totalQuestions: data.totalQuestions,
          }));
          setIsInitializingGame(false);
          toast({
            title: 'Game Created!',
            description: `Game PIN: ${data.pin}`,
          });
        }
      ),

      on('game:lobby_update', (data: { players: Player[] }) => {
        setGameData((prev) => ({ ...prev, players: data.players }));
      }),

      on('game:question', (data: GameData['question']) => {
        setGameData((prev) => ({
          ...prev,
          question: data,
          currentQuestion: data?.questionNumber || prev.currentQuestion + 1,
        }));
        setGameState('question');
      }),

      on('game:time', (data: { secondsLeft: number }) => {
        setGameData((prev) => ({ ...prev, timeLeft: data.secondsLeft }));
      }),

      on(
        'game:reveal',
        (data: {
          correctChoiceId: string;
          stats: { choiceCounts: Record<string, number> };
        }) => {
          setGameData((prev) => ({
            ...prev,
            correctChoiceId: data.correctChoiceId,
            stats: data.stats,
          }));
          setGameState('reveal');
        }
      ),

      on('game:leaderboard', (data: { players: Player[] }) => {
        setGameData((prev) => ({ ...prev, leaderboard: data.players }));
        setGameState('leaderboard');
      }),

      on('game:game_over', (data: { finalLeaderboard: Player[] }) => {
        setGameData((prev) => ({
          ...prev,
          leaderboard: data.finalLeaderboard,
        }));
        setGameState('finished');
      }),

      on('game:error', (data: { message: string }) => {
        toast({
          title: 'Game Error',
          description: data.message,
          variant: 'destructive',
        });
      }),
    ];

    return () => {
      unsubscribe.forEach((fn) => fn && fn());
    };
  }, [on, toast, isConnected]);

  const handleStartGame = () => {
    if (gameData.gameId && gameData.players.length > 0) {
      startGame(gameData.gameId);
    } else {
      toast({
        title: 'Cannot Start Game',
        description: 'Need at least one player to start the game.',
        variant: 'destructive',
      });
    }
  };

  const handleNextQuestion = () => {
    if (gameData.gameId) {
      nextQuestion(gameData.gameId);
    }
  };

  const handleRevealAnswer = () => {
    if (gameData.gameId) {
      revealAnswer(gameData.gameId);
    }
  };

  const handleEndGame = () => {
    if (gameData.gameId) {
      endGame(gameData.gameId);
    }
    router.push('/dashboard');
  };

  // Loading state
  if (isInitializingGame || !isConnected) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-800 text-white">
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>
              {!isConnected
                ? 'Connecting to server...'
                : 'Initializing game...'}
            </p>
            {socketError && (
              <p className="text-red-400 mt-2 text-sm">{socketError}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Error state

  // if (quizError || !quiz) {
  //   return (
  //     <div className="flex flex-col min-h-screen bg-gray-800 text-white">
  //       <div className="flex-grow flex items-center justify-center">
  //         <Alert variant="destructive" className="max-w-md">
  //           <AlertCircle className="h-4 w-4" />
  //           <AlertDescription>
  //             Failed to load quiz. Please check if the backend is running.
  //             <Button
  //               variant="outline"
  //               size="sm"
  //               className="mt-2 w-full"
  //               onClick={() => router.push('/dashboard')}
  //             >
  //               Back to Dashboard
  //             </Button>
  //           </AlertDescription>
  //         </Alert>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="flex flex-col min-h-screen bg-gray-800 text-white">
      <header className="flex justify-between items-center p-4 bg-gray-900/50">
        <h1 className="font-bold font-headline text-xl">{'quiz.title'}</h1>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Wifi className="h-4 w-4 text-green-400" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-400" />
          )}
          <Button variant="destructive" size="sm" onClick={handleEndGame}>
            <XCircle className="mr-2 h-4 w-4" /> End Game
          </Button>
        </div>
      </header>

      {gameState === 'lobby' && (
        <main className="flex-grow grid md:grid-cols-3 gap-4 p-4">
          <div className="md:col-span-2 flex flex-col items-center justify-center bg-gray-900 rounded-lg p-8 text-center">
            <h2 className="text-2xl text-gray-400">
              Join at <span className="text-white font-bold">quizwhiz.it</span>
            </h2>
            <div className="my-8 bg-white text-gray-900 font-bold text-8xl tracking-widest p-8 rounded-lg shadow-2xl">
              {gameData.pin || '------'}
            </div>
            <Button
              size="lg"
              className="w-full max-w-xs bg-green-600 hover:bg-green-700"
              onClick={handleStartGame}
              disabled={gameData.players.length === 0}
            >
              <Play className="mr-2 h-5 w-5" /> Start Game
            </Button>
            {gameData.players.length === 0 && (
              <p className="text-gray-400 mt-2 text-sm">
                Waiting for players to join...
              </p>
            )}
          </div>
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users /> Players
              </CardTitle>
              <span className="text-2xl font-bold">
                {gameData.players.length}
              </span>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {gameData.players.length > 0 ? (
                gameData.players.map((player) => (
                  <div
                    key={player.id}
                    className="bg-gray-800 p-3 rounded-md text-center font-semibold truncate"
                  >
                    {player.name}
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center text-gray-400 py-4">
                  No players yet
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      )}

      {gameState === 'question' && gameData.question && (
        <main className="flex-grow flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-4xl text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Timer className="h-6 w-6" />
              <span className="text-2xl font-bold">
                {gameData.timeLeft || gameData.question.timeLimit}s
              </span>
            </div>
            <h1 className="text-4xl font-bold mb-8">
              {gameData.question.question}
            </h1>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {gameData.question.choices.map((choice, index) => (
                <div
                  key={choice.id}
                  className="bg-gray-700 p-6 rounded-lg text-xl font-semibold"
                >
                  <span className="text-gray-400 mr-4">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  {choice.text}
                </div>
              ))}
            </div>
            <Button size="lg" onClick={handleRevealAnswer}>
              Reveal Answer
            </Button>
          </div>
        </main>
      )}

      {gameState === 'reveal' && gameData.question && (
        <main className="flex-grow flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-4xl text-center">
            <h1 className="text-4xl font-bold mb-8">
              {gameData.question.question}
            </h1>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {gameData.question.choices.map((choice, index) => (
                <div
                  key={choice.id}
                  className={`p-6 rounded-lg text-xl font-semibold ${
                    choice.id === gameData.correctChoiceId
                      ? 'bg-green-600'
                      : 'bg-gray-700'
                  }`}
                >
                  <span className="text-gray-300 mr-4">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  {choice.text}
                  {gameData.stats && (
                    <div className="text-sm mt-2">
                      {gameData.stats.choiceCounts[choice.id] || 0} votes
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Button size="lg" onClick={handleNextQuestion}>
              {gameData.currentQuestion >= gameData.totalQuestions
                ? 'Finish Game'
                : 'Next Question'}
            </Button>
          </div>
        </main>
      )}

      {(gameState === 'leaderboard' || gameState === 'finished') &&
        gameData.leaderboard && (
          <main className="flex-grow flex flex-col items-center justify-center p-8">
            <h1 className="text-5xl font-bold font-headline mb-8">
              {gameState === 'finished' ? 'Final Results' : 'Leaderboard'}
            </h1>
            <div className="w-full max-w-2xl space-y-4">
              {gameData.leaderboard.slice(0, 10).map((player, index) => (
                <div
                  key={player.id}
                  className={`flex items-center p-4 rounded-lg shadow-lg font-bold ${
                    index === 0
                      ? 'bg-yellow-400 text-black text-2xl'
                      : index === 1
                      ? 'bg-gray-400 text-black text-xl'
                      : index === 2
                      ? 'bg-yellow-700 text-white text-lg'
                      : 'bg-gray-600 text-white'
                  }`}
                >
                  {index === 0 && <Crown className="h-8 w-8 mr-4" />}
                  {index > 0 && (
                    <span className="w-8 mr-4 text-center">{index + 1}</span>
                  )}
                  <span className="flex-1">{player.name}</span>
                  <span>{player.score}</span>
                </div>
              ))}
            </div>
            {gameState === 'leaderboard' && (
              <Button size="lg" className="mt-8" onClick={handleNextQuestion}>
                {gameData.currentQuestion >= gameData.totalQuestions
                  ? 'Finish Game'
                  : 'Next Question'}
              </Button>
            )}
            {gameState === 'finished' && (
              <Button size="lg" className="mt-8" onClick={handleEndGame}>
                Back to Dashboard
              </Button>
            )}
          </main>
        )}

      <footer className="p-4 bg-gray-900/50 flex justify-between items-center text-sm">
        <div>
          Question {gameData.currentQuestion} of {gameData.totalQuestions}
        </div>
        <div className="flex items-center gap-2">
          <BarChart className="h-4 w-4" />
          <span>{gameData.players.length} Players</span>
        </div>
      </footer>
    </div>
  );
}
