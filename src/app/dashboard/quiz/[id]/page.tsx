'use client';

import { Header } from '@/components/Header';
import { EditQuizForm } from '@/components/EditQuizForm';
import { useQuiz } from '@/hooks/use-queries';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface EditQuizPageProps {
  params: {
    id: string;
  };
}

export default function EditQuizPage({ params }: EditQuizPageProps) {
  const { data: quiz, isLoading, error } = useQuiz(params.id);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow container mx-auto p-4 md:p-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading quiz...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow container mx-auto p-4 md:p-8">
          <Alert variant="destructive" className="max-w-md mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load quiz. The quiz might not exist or the backend is
              not running.
              <div className="mt-2 flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard">Back to Dashboard</Link>
                </Button>
              </div>
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
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold font-headline tracking-tight">
              Edit Quiz: {quiz.title}
            </h1>
            <p className="text-muted-foreground mt-2">
              Update your quiz details, questions, and settings.
            </p>
          </div>
          <EditQuizForm quiz={quiz} />
        </div>
      </main>
    </div>
  );
}
