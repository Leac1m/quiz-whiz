import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";

function TriangleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13.73 4a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 3.73 21h16.54a2 2 0 0 0 1.46-3.46l-8-14Z" />
    </svg>
  )
}

function SquareIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2" />
      </svg>
    )
}

function CircleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
      </svg>
    )
}

function DiamondIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2.5 21.5 12 12 21.5 2.5 12 12 2.5Z"/>
        </svg>
    )
}

export default function PlayerGamePage({ params }: { params: { gameId: string } }) {
  // This is a mock page. In a real app, this would use WebSockets.
  const gameState = "answering"; // "waiting", "answering", "feedback"

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <header className="flex justify-between items-center p-4 bg-gray-800/50">
        <div className="font-bold">QuizWhiz</div>
        <div className="flex items-center gap-4">
            <span>Score: 1250</span>
            <span className="font-semibold">Player123</span>
        </div>
      </header>
      
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        {gameState === 'waiting' && (
             <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                <h1 className="text-4xl font-headline font-bold">You're in!</h1>
                <p className="text-xl text-gray-400 mt-2">Get ready to play... The host will start soon.</p>
                <Loader2 className="h-8 w-8 text-gray-500 mx-auto mt-8 animate-spin"/>
            </div>
        )}

        {gameState === 'answering' && (
            <div className="w-full h-full flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4 w-full max-w-2xl aspect-square">
                    <button className="bg-red-600 rounded-lg flex items-center justify-center text-white transition-transform hover:scale-105 shadow-lg">
                        <TriangleIcon className="h-1/3 w-1/3" />
                    </button>
                    <button className="bg-blue-600 rounded-lg flex items-center justify-center text-white transition-transform hover:scale-105 shadow-lg">
                        <DiamondIcon className="h-1/3 w-1/3" />
                    </button>
                    <button className="bg-yellow-500 rounded-lg flex items-center justify-center text-white transition-transform hover:scale-105 shadow-lg">
                        <CircleIcon className="h-1/3 w-1/3" />
                    </button>
                    <button className="bg-green-600 rounded-lg flex items-center justify-center text-white transition-transform hover:scale-105 shadow-lg">
                        <SquareIcon className="h-1/3 w-1/3" />
                    </button>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}
