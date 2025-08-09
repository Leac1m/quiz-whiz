import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Play, Trophy, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const mockQuizzes = [
  { id: '1', title: 'World Capitals Trivia', questions: 20, plays: 120, image: "https://placehold.co/600x400.png", dataAiHint: "world map" },
  { id: '2', title: '90s Movie Madness', questions: 15, plays: 85, image: "https://placehold.co/600x400.png", dataAiHint: "movie reel" },
  { id: '3', title: 'Science & Nature', questions: 25, plays: 250, image: "https://placehold.co/600x400.png", dataAiHint: "nature forest" },
  { id: '4', title: 'General Knowledge Challenge', questions: 30, plays: 450, image: "https://placehold.co/600x400.png", dataAiHint: "books library" },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <h1 className="text-3xl font-bold font-headline tracking-tight">Host Dashboard</h1>
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
                <CardDescription>Here are the quizzes you've created. Ready to host another one?</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {mockQuizzes.map(quiz => (
                    <Card key={quiz.id} className="overflow-hidden flex flex-col">
                        <Image src={quiz.image} alt={quiz.title} width={600} height={400} className="w-full h-40 object-cover" data-ai-hint={quiz.dataAiHint} />
                        <CardHeader className="flex-grow">
                            <CardTitle className="text-lg">{quiz.title}</CardTitle>
                            <CardDescription>{quiz.questions} Questions</CardDescription>
                        </CardHeader>
                        <CardFooter className="flex flex-col gap-2 items-start">
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>{quiz.plays} plays</span>
                            </div>
                            <div className="w-full flex gap-2">
                                <Button size="sm" className="flex-1" asChild>
                                    <Link href={`/game/${quiz.id}/host`}>
                                        <Play className="mr-2 h-4 w-4" />
                                        Host
                                    </Link>
                                </Button>
                                <Button size="sm" variant="outline" className="flex-1" asChild>
                                    <Link href={`/leaderboard/${quiz.id}`}>
                                        <Trophy className="mr-2 h-4 w-4" />
                                        Leaders
                                    </Link>
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
