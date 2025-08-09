import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Crown, Play, Users, XCircle } from "lucide-react";
import Link from "next/link";


const mockPlayers = ["Player1", "GeekyGecko", "QuizMaster", "SmartyPants", "TriviaTitan", "CaptainClue"];

export default function HostGamePage({ params }: { params: { quizId: string } }) {
  // This is a mock page. In a real app, this would use WebSockets.
  const gameState = "lobby"; // "lobby", "question", "leaderboard"

  return (
    <div className="flex flex-col min-h-screen bg-gray-800 text-white">
      <header className="flex justify-between items-center p-4 bg-gray-900/50">
        <h1 className="font-bold font-headline text-xl">World Capitals Trivia</h1>
        <Button variant="destructive" size="sm" asChild>
            <Link href="/dashboard"><XCircle className="mr-2 h-4 w-4" /> End Game</Link>
        </Button>
      </header>

      {gameState === 'lobby' && (
        <main className="flex-grow grid md:grid-cols-3 gap-4 p-4">
            <div className="md:col-span-2 flex flex-col items-center justify-center bg-gray-900 rounded-lg p-8 text-center">
                <h2 className="text-2xl text-gray-400">Join at <span className="text-white font-bold">quizwhiz.it</span></h2>
                <div className="my-8 bg-white text-gray-900 font-bold text-8xl tracking-widest p-8 rounded-lg shadow-2xl">
                    123 456
                </div>
                <Button size="lg" className="w-full max-w-xs bg-green-600 hover:bg-green-700">
                    <Play className="mr-2 h-5 w-5" /> Start Game
                </Button>
            </div>
            <Card className="bg-gray-900 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2"><Users /> Players</CardTitle>
                    <span className="text-2xl font-bold">{mockPlayers.length}</span>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-2">
                    {mockPlayers.map(player => (
                        <div key={player} className="bg-gray-800 p-3 rounded-md text-center font-semibold truncate">
                            {player}
                        </div>
                    ))}
                </CardContent>
            </Card>
        </main>
      )}

       {gameState === 'leaderboard' && (
        <main className="flex-grow flex flex-col items-center justify-center p-8">
            <h1 className="text-5xl font-bold font-headline mb-8">Leaderboard</h1>
            <div className="w-full max-w-2xl space-y-4">
                <div className="flex items-center bg-yellow-400 text-black p-4 rounded-lg shadow-lg text-2xl font-bold">
                    <Crown className="h-8 w-8 mr-4"/>
                    <span className="flex-1">GeekyGecko</span>
                    <span>12580</span>
                </div>
                 <div className="flex items-center bg-gray-400 text-black p-4 rounded-lg shadow-lg text-xl font-bold">
                    <span className="w-8 mr-4 text-center">2</span>
                    <span className="flex-1">QuizMaster</span>
                    <span>11980</span>
                </div>
                 <div className="flex items-center bg-yellow-700 text-white p-4 rounded-lg shadow-lg text-lg font-bold">
                    <span className="w-8 mr-4 text-center">3</span>
                    <span className="flex-1">SmartyPants</span>
                    <span>11500</span>
                </div>
            </div>
             <Button size="lg" className="mt-8">Next Question</Button>
        </main>
       )}

      <footer className="p-4 bg-gray-900/50 flex justify-between items-center text-sm">
        <div>Question 1 of 20</div>
        <div className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span>Results</span>
        </div>
      </footer>
    </div>
  );
}
