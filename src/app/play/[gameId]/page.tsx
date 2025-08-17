'use client';

import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CheckCircle,
  Loader2,
  Timer,
  Users,
  Wifi,
  WifiOff,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { usePlayerGameSocket } from '@/hooks/use-socket';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Player {
  id: string;
  name: string;
  score: number;
}

interface Question {
  question: string;
  choices: { id: string; text: string }[];
  timeLimit: number;
  questionNumber: number;
  totalQuestions: number;
}

type GameState =
  | 'waiting'
  | 'lobby'
  | 'question'
  | 'reveal'
  | 'leaderboard'
  | 'finished';

function TriangleIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M13.73 4a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 3.73 21h16.54a2 2 0 0 0 1.46-3.46l-8-14Z" />
    </svg>
  );
}

function SquareIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <rect width="18" height="18" x="3" y="3" rx="2" />
    </svg>
  );
}

function CircleIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function DiamondIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M12 2.5 21.5 12 12 21.5 2.5 12 12 2.5Z" />
    </svg>
  );
}

export default function PlayerGamePage({
  params,
}: {
  params: { gameId: string };
}) {
  const searchParams = useSearchParams();
  const playerId = searchParams.get('playerId') || '';
  const playerName = searchParams.get('name') || '';
  const gamePin = searchParams.get('pin') || '';
  const { toast } = useToast();

  // Game state
  const [gameState, setGameState] = useState<GameState>('lobby');
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>( // Change back to null
  // For testing
    // {
    //   question: "How long can a string get?",
    //   choices: [
    //     { id: 1, text: "A Short Text" },
    //     { id: 2, text: "A Fairly Long Text" },
    //     { id: 3, text: "A Fairly very Long Text" },
    //     { id: 4, text: "A Fairly very very very very Long Text" },
    //   ],
    //   timeLimit: 50,
    //   questionNumber: 0,
    //   totalQuestions: 1,
    // }
    );
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [playerScore, setPlayerScore] = useState(0);

  // WebSocket connection (player namespace)
  const {
    submitAnswer,
    joinGame,
    on,
    isConnected,
    error: socketError,
  } = usePlayerGameSocket();

  // Join the game via WebSocket when component mounts
  useEffect(() => {
    if (playerId && playerName && gamePin && isConnected) {
      // Player already joined via REST API, now connect to WebSocket
      joinGame(gamePin, playerId);
      setGameState('lobby');
    }
  }, [playerId, playerName, gamePin, isConnected, joinGame]);

  // Handle socket connection errors
  useEffect(() => {
    if (socketError) {
      toast({
        title: 'Connection Error',
        description: socketError,
        variant: 'destructive',
      });
    }
  }, [socketError, toast]);

  // WebSocket event listeners
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = [
      on('player:joined', (data: { playerId: string; gameId: string }) => {
        toast({
          title: 'Joined Game!',
          description: 'Successfully connected to the game.',
        });
        setGameState('lobby');
      }),

      on('game:lobby_update', (data: { players: Player[] }) => {
        setPlayers(data.players);
        setGameState('lobby');
      }),

      on('game:question', (data: Question) => {
        setCurrentQuestion(data);
        setGameState('question');
        setTimeLeft(data.timeLimit);
        setSelectedAnswer('');
        setHasAnswered(false);
      }),

      on('game:time', (data: { secondsLeft: number }) => {
        setTimeLeft(data.secondsLeft);
      }),

      on('game:reveal', (data: { correctChoiceId: string }) => {
        setGameState('reveal');

        // Show if player got it right
        const { correctChoiceId } = data;
        const index = +correctChoiceId;
        if (selectedAnswer === currentQuestion?.choices[index].id) {
          toast({
            title: 'Correct! 🎉',
            description: 'Great job!',
          });
        } else if (hasAnswered) {
          toast({
            title: 'Incorrect 😔',
            description: `The correct answer was ${currentQuestion?.choices[index].id}`,
            variant: 'destructive',
          });
        }
      }),

      on('answer:submitted', (data: { points: number }) => {
        toast({
          title: 'Answer Submitted!',
          description: `You earned ${data.points} points!`,
        });
      }),

      on('game:leaderboard', (data: { players: Player[] }) => {
        setLeaderboard(data.players);
        setGameState('leaderboard');

        // Update player's score
        const currentPlayer = data.players.find((p) => p.id === playerId);
        if (currentPlayer) {
          setPlayerScore(currentPlayer.score);
        }
      }),

      on('game:game_over', (data: { finalLeaderboard: Player[] }) => {
        setLeaderboard(data.finalLeaderboard);
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
  }, [on, playerId, selectedAnswer, hasAnswered, toast, isConnected]);

  const handleAnswerSelect = (choiceId: string) => {
    if (hasAnswered || gameState !== 'question') return;

    setSelectedAnswer(choiceId);
    setHasAnswered(true);

    // Submit answer via WebSocket
    submitAnswer({
      gameId: params.gameId,
      questionId: `q${currentQuestion?.questionNumber.toString() || '1'}`,
      choiceId,
      timeTaken: (currentQuestion?.timeLimit || 30) - timeLeft,
    });
  };

  // Connection error state
  if (socketError && !isConnected) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-800 text-white">
        <div className="flex-grow flex items-center justify-center p-4">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unable to connect to the game server. Please check your connection
              and try again.
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Waiting for connection or game data
  if (gameState === 'waiting' || !isConnected) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-800 text-white">
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">
              {!isConnected ? 'Connecting to Game...' : 'Joining Game...'}
            </h1>
            <p className="text-gray-400">
              Please wait while we connect you to the game.
            </p>
            {socketError && (
              <p className="text-red-400 mt-2 text-sm">{socketError}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Lobby - waiting for game to start
  if (gameState === 'lobby') {
    return (
      <div className="flex flex-col min-h-screen bg-gray-800 text-white">
        <header className="p-4 bg-gray-900/50 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="text-2xl font-bold">Welcome, {playerName}!</h1>
            {isConnected ? (
              <Wifi className="h-5 w-5 text-green-400" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-400" />
            )}
          </div>
          <p className="text-gray-400">
            Waiting for the host to start the game...
          </p>
        </header>
        <main className="flex-grow flex items-center justify-center p-4">
          <Card className="bg-gray-900 border-gray-700 max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="h-5 w-5" />
                Players in Game ({players.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className={`p-2 rounded text-center font-semibold ${
                      player.id === playerId
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-200'
                    }`}
                  >
                    {player.name}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Question phase
  if (gameState === 'question' && currentQuestion) {
    const choiceIcons = [TriangleIcon, DiamondIcon, CircleIcon, SquareIcon];
    const choiceColors = [
      'bg-red-600 hover:bg-red-700',
      'bg-blue-600 hover:bg-blue-700',
      'bg-yellow-600 hover:bg-yellow-700',
      'bg-green-600 hover:bg-green-700',
    ];

    return (
      <div className="flex flex-col min-h-screen bg-gray-800 text-white">
        <header className="p-4 bg-gray-900/50 text-center">
          <div className="flex items-center justify-center gap-4 mb-2">
            <Timer className="h-5 w-5" />
            <span className="text-xl font-bold">{timeLeft}s</span>
          </div>
          <p className="text-gray-400">
            Question {currentQuestion.questionNumber} of{' '}
            {currentQuestion.totalQuestions}
          </p>
        </header>
        <main className="flex-grow flex flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-bold mb-8 text-center max-w-2xl">
            {currentQuestion.question}
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full responsicve-grid">
            {currentQuestion.choices.map((choice, index) => {
              const IconComponent = choiceIcons[index % choiceIcons.length];
              const colorClass = choiceColors[index % choiceColors.length];

              return (
                <Button
                  key={choice.id}
                  variant="ghost"
                  size="lg"
                  className={`h-auto py-3 text-lg font-semibold text-white border-2 border-white/20 ${
                    selectedAnswer === choice.id
                      ? `${colorClass} border-white`
                      : `hover:${colorClass} bg-gray-700`
                  }`}
                  onClick={() => handleAnswerSelect(choice.id)}
                  disabled={hasAnswered}
                >
                  <div className="flex items-center gap-3 whitespace-normal break-words">
                    <IconComponent className="h-6 w-6" />
                    <span>{choice.text}</span>
                  </div>
                </Button>
              );
            })}
          </div>
          {hasAnswered && (
            <div className="mt-6 text-center">
              <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <p className="text-green-400 font-semibold">
                Answer submitted! Waiting for results...
              </p>
            </div>
          )}
        </main>
      </div>
    );
  }

  // Reveal phase
  if (gameState === 'reveal') {
    return (
      <div className="flex flex-col min-h-screen bg-gray-800 text-white">
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Results</h1>
            <p className="text-xl mb-4">Your Score: {playerScore}</p>
            <p className="text-gray-400">Waiting for next question...</p>
          </div>
        </main>
      </div>
    );
  }

  // Leaderboard
  if (gameState === 'leaderboard' || gameState === 'finished') {
    const playerRank = leaderboard.findIndex((p) => p.id === playerId) + 1;

    return (
      <div className="flex flex-col min-h-screen bg-gray-800 text-white">
        <main className="flex-grow flex flex-col items-center justify-center p-4">
          <h1 className="text-4xl font-bold mb-2">
            {gameState === 'finished' ? 'Final Results' : 'Leaderboard'}
          </h1>
          <p className="text-xl mb-8">
            You're #{playerRank} with {playerScore} points!
          </p>
          <div className="w-full max-w-md space-y-2">
            {leaderboard.slice(0, 10).map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  player.id === playerId
                    ? 'bg-blue-600'
                    : index === 0
                    ? 'bg-yellow-600'
                    : 'bg-gray-700'
                }`}
              >
                <span className="font-semibold">
                  #{index + 1} {player.name}
                </span>
                <span className="font-bold">{player.score}</span>
              </div>
            ))}
          </div>
          {gameState === 'finished' && (
            <Button
              className="mt-8"
              onClick={() => (window.location.href = '/')}
            >
              Play Again
            </Button>
          )}
        </main>
      </div>
    );
  }

  return null;
}
