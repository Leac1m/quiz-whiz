import { CreateQuizForm } from "@/components/CreateQuizForm";
import { Header } from "@/components/Header";

export default function CreateQuizPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold font-headline tracking-tight">Create a New Quiz</h1>
            <p className="text-muted-foreground mt-2">
              Let's build an awesome quiz! Fill in the details below, add your questions, and get ready to engage your audience.
            </p>
          </div>
          <CreateQuizForm />
        </div>
      </main>
    </div>
  );
}
