"use client";

import { useState } from "react";
import { suggestCategoriesAction } from "@/app/actions";
import { Button } from "./ui/button";
import { Loader2, Wand2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "./ui/badge";

interface CategorySuggestionsProps {
  topic: string;
  currentCategories: string[];
  onAddCategory: (category: string) => void;
}

export function CategorySuggestions({ topic, currentCategories, onAddCategory }: CategorySuggestionsProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { toast } = useToast();

  const handleSuggestCategories = async () => {
    setLoading(true);
    setSuggestions([]);
    const result = await suggestCategoriesAction(topic, currentCategories);
    setLoading(false);
    
    if (result.error) {
      toast({
        title: "Suggestion Error",
        description: result.error,
        variant: "destructive",
      });
    } else if (result.suggestions) {
      setSuggestions(result.suggestions);
    }
  };

  return (
    <Card className="bg-secondary/50 border-dashed">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Wand2 className="text-accent-foreground" />
                <span>AI Category Helper</span>
            </CardTitle>
            <CardDescription>
                Stuck for ideas? Let our AI suggest some challenging categories based on your quiz title.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Button type="button" onClick={handleSuggestCategories} disabled={loading || !topic}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                {loading ? 'Thinking...' : 'Suggest Categories'}
            </Button>
            {suggestions.length > 0 && (
                <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Click a suggestion to add it:</p>
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map((suggestion, index) => (
                           <Button 
                             key={index} 
                             variant="outline" 
                             size="sm" 
                             onClick={() => onAddCategory(suggestion)}
                             className="bg-background hover:bg-accent/50"
                           >
                            {suggestion}
                           </Button>
                        ))}
                    </div>
                </div>
            )}
        </CardContent>
    </Card>
  );
}
