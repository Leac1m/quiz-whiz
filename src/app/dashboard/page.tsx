'use client';

import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  PlusCircle,
  Play,
  Trophy,
  Users,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuizzes, useCreateGame } from '@/hooks/use-queries';
import { useGameSocket } from '@/hooks/use-socket';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { data: quizzes, isLoading, error, refetch } = useQuizzes();
  const createGame = useCreateGame();
  const [gameCreationStatus, setGameCreationStatus] = useState<{
    [key: string]: 'idle' | 'creating' | 'success' | 'error';
  }>({});
  const router = useRouter();

  const handleCreateGame = async (quizId: string) => {
    setGameCreationStatus((prev) => ({ ...prev, [quizId]: 'creating' }));

    try {
      // Create game via REST API
      const { gameId, pin } = await createGame.mutateAsync(quizId);

      setGameCreationStatus((prev) => ({ ...prev, [quizId]: 'success' }));

      // Redirect to host page after a short delay
      setTimeout(() => {
        router.push(`/game/${gameId}/host?pin=${pin}&quizId=${quizId}`);
      }, 1000);
    } catch (error) {
      console.error('Failed to create game:', error);
      setGameCreationStatus((prev) => ({ ...prev, [quizId]: 'error' }));

      // Reset status after 3 seconds
      setTimeout(() => {
        setGameCreationStatus((prev) => ({ ...prev, [quizId]: 'idle' }));
      }, 3000);
    }
  };

  const getButtonContent = (quizId: string) => {
    const status = gameCreationStatus[quizId] || 'idle';

    switch (status) {
      case 'creating':
        return (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating...
          </>
        );
      case 'success':
        return (
          <>
            <Play className="mr-2 h-4 w-4" />
            Starting...
          </>
        );
      case 'error':
        return (
          <>
            <AlertCircle className="mr-2 h-4 w-4" />
            Error
          </>
        );
      default:
        return (
          <>
            <Play className="mr-2 h-4 w-4" />
            Host
          </>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow container mx-auto p-4 md:p-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading your quizzes...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow container mx-auto p-4 md:p-8">
          <Alert variant="destructive" className="max-w-md mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load quizzes. Please check if the backend is running on
              localhost:3001.
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full"
                onClick={() => refetch()}
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-3xl font-bold font-headline tracking-tight">
            Host Dashboard
          </h1>
          <Button asChild className="mt-4 md:mt-0">
            <Link href="/dashboard/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Quiz
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My Quizzes</CardTitle>
            <CardDescription>
              {quizzes && quizzes.length > 0
                ? "Here are the quizzes you've created. Ready to host another one?"
                : "You haven't created any quizzes yet. Start by creating your first quiz!"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {quizzes && quizzes.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {quizzes.map((quiz) => (
                  <Card key={quiz.id} className="overflow-hidden flex flex-col">
                    <div className="w-full h-40 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="text-2xl font-bold mb-1">
                          {quiz.questions.length}
                        </div>
                        <div className="text-sm opacity-90">Questions</div>
                      </div>
                    </div>
                    <CardHeader className="flex-grow">
                      <CardTitle className="text-lg">{quiz.title}</CardTitle>
                      <CardDescription>
                        {quiz.description ||
                          `${quiz.questions.length} Questions`}
                      </CardDescription>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {quiz.categories.slice(0, 2).map((category, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-md"
                          >
                            {category}
                          </span>
                        ))}
                        {quiz.categories.length > 2 && (
                          <span className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-md">
                            +{quiz.categories.length - 2} more
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        Status:{' '}
                        <span
                          className={
                            quiz.status === 'published'
                              ? 'text-green-600'
                              : 'text-orange-600'
                          }
                        >
                          {quiz.status}
                        </span>
                      </div>
                    </CardHeader>
                    <CardFooter className="flex flex-col gap-2 items-start">
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>
                          Created{' '}
                          {new Date(quiz.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="w-full flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleCreateGame(quiz.id)}
                          disabled={
                            gameCreationStatus[quiz.id] === 'creating' ||
                            quiz.status === 'draft'
                          }
                        >
                          {getButtonContent(quiz.id)}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          asChild
                        >
                          <Link href={`/dashboard/quiz/${quiz.id}`}>
                            <Trophy className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </Button>
                      </div>
                      {quiz.status === 'draft' && (
                        <div className="text-xs text-orange-600 w-full text-center">
                          Publish quiz to host games
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                  <PlusCircle className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No quizzes yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first quiz to get started with QuizWhiz!
                </p>
                <Button asChild>
                  <Link href="/dashboard/create">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Your First Quiz
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
