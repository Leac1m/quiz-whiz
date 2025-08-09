"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2, Upload, FileImage } from "lucide-react";
import { Separator } from "./ui/separator";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { CategorySuggestions } from "./CategorySuggestions";
import { useState } from "react";
import { Badge } from "./ui/badge";
import { useToast } from "@/hooks/use-toast";

const questionSchema = z.object({
  text: z.string().min(5, "Question text must be at least 5 characters."),
  type: z.enum(["multiple-choice", "true-false"]),
  options: z.array(z.object({ text: z.string().min(1, "Option text cannot be empty.") })).min(2),
  correctAnswer: z.string().min(1, "You must select a correct answer."),
  time: z.coerce.number().min(5, "Time limit must be at least 5 seconds.").max(120),
  points: z.coerce.number().min(0, "Points cannot be negative.").max(2000),
  mediaUrl: z.string().optional(),
});

const quizFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long.").max(100),
  description: z.string().max(500).optional(),
  categories: z.array(z.string()).min(1, "Please add at least one category."),
  questions: z.array(questionSchema).min(1, "A quiz must have at least one question."),
});

type QuizFormValues = z.infer<typeof quizFormSchema>;

export function CreateQuizForm() {
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryInput, setCategoryInput] = useState("");
  const { toast } = useToast();

  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: {
      title: "",
      description: "",
      categories: [],
      questions: [
        { text: "", type: "multiple-choice", options: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }], correctAnswer: "", time: 30, points: 1000 },
      ],
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  function onSubmit(data: QuizFormValues) {
    toast({
        title: "Quiz Created!",
        description: "Your new quiz has been saved successfully.",
        variant: "default",
    })
    console.log(data);
  }

  const handleAddCategory = () => {
    if (categoryInput && !categories.includes(categoryInput)) {
      const newCategories = [...categories, categoryInput];
      setCategories(newCategories);
      form.setValue("categories", newCategories, { shouldValidate: true });
      setCategoryInput("");
    }
  };
  
  const handleRemoveCategory = (categoryToRemove: string) => {
    const newCategories = categories.filter(cat => cat !== categoryToRemove);
    setCategories(newCategories);
    form.setValue("categories", newCategories, { shouldValidate: true });
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Quiz Details</CardTitle>
            <CardDescription>Give your quiz a catchy title and a brief description.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Ultimate Science Challenge" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="A fun quiz about... " {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="categories"
                render={() => (
                    <FormItem>
                        <FormLabel>Categories</FormLabel>
                        <FormControl>
                            <div className="flex items-center gap-2">
                                <Input
                                    placeholder="e.g., Science"
                                    value={categoryInput}
                                    onChange={(e) => setCategoryInput(e.target.value)}
                                    onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddCategory(); } }}
                                />
                                <Button type="button" onClick={handleAddCategory}>Add</Button>
                            </div>
                        </FormControl>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {categories.map((cat) => (
                                <Badge key={cat} variant="secondary">
                                    {cat}
                                    <button type="button" className="ml-2" onClick={() => handleRemoveCategory(cat)}>
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                         <FormMessage />
                    </FormItem>
                )}
            />
             <CategorySuggestions
                topic={form.watch('title')}
                currentCategories={categories}
                onAddCategory={(cat) => {
                    if (!categories.includes(cat)) {
                        const newCategories = [...categories, cat];
                        setCategories(newCategories);
                        form.setValue('categories', newCategories, { shouldValidate: true });
                    }
                }}
            />
          </CardContent>
        </Card>

        <div>
          {fields.map((field, index) => (
            <Card key={field.id} className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Question {index + 1}</CardTitle>
                  <CardDescription>Design this question for your players.</CardDescription>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name={`questions.${index}.text`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question Text</FormLabel>
                      <FormControl>
                        <Input placeholder="What is the powerhouse of the cell?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`questions.${index}.type`}
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Question Type</FormLabel>
                         <FormControl>
                           <RadioGroup
                            onValueChange={(value) => {
                                field.onChange(value);
                                if (value === 'true-false') {
                                    form.setValue(`questions.${index}.options`, [{ text: 'True' }, { text: 'False' }]);
                                    form.setValue(`questions.${index}.correctAnswer`, '');
                                } else {
                                    form.setValue(`questions.${index}.options`, [{ text: '' }, { text: '' }, { text: '' }, { text: '' }]);
                                }
                            }}
                            defaultValue={field.value}
                            className="flex gap-4"
                           >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl><RadioGroupItem value="multiple-choice" /></FormControl>
                                <FormLabel className="font-normal">Multiple Choice</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl><RadioGroupItem value="true-false" /></FormControl>
                                <FormLabel className="font-normal">True/False</FormLabel>
                            </FormItem>
                           </RadioGroup>
                         </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormItem>
                      <FormLabel>Media (Optional)</FormLabel>
                      <div className="flex items-center gap-2 p-2 border rounded-md border-dashed">
                        <FileImage className="h-8 w-8 text-muted-foreground" />
                        <div className="flex-1">
                            <p className="text-sm font-medium">No file selected</p>
                            <p className="text-xs text-muted-foreground">Upload an image to accompany this question.</p>
                        </div>
                        <Button type="button" variant="outline" size="sm"><Upload className="mr-2 h-4 w-4" /> Upload</Button>
                      </div>
                  </FormItem>
                </div>

                <Separator />
                
                <FormField
                  control={form.control}
                  name={`questions.${index}.correctAnswer`}
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Answer Options</FormLabel>
                       <FormDescription>Enter the options and select the correct answer.</FormDescription>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                          {form.watch(`questions.${index}.options`).map((_, optionIndex) => (
                            <FormField
                                key={optionIndex}
                                control={form.control}
                                name={`questions.${index}.options.${optionIndex}.text`}
                                render={({ field: optionField }) => (
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                           <RadioGroupItem value={optionField.value} disabled={!optionField.value} />
                                        </FormControl>
                                        <Input
                                            {...optionField}
                                            placeholder={`Option ${optionIndex + 1}`}
                                            disabled={form.watch(`questions.${index}.type`) === 'true-false'}
                                        />
                                    </FormItem>
                                )}
                            />
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField
                        control={form.control}
                        name={`questions.${index}.time`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time Limit (seconds)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`questions.${index}.points`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Points</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="flex justify-between items-center">
          <Button type="button" variant="outline" onClick={() => append({ text: "", type: "multiple-choice", options: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }], correctAnswer: "", time: 30, points: 1000 })}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Question
          </Button>

          <Button type="submit" size="lg">Create Quiz</Button>
        </div>
      </form>
    </Form>
  );
}
