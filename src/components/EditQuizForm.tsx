'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  PlusCircle,
  Trash2,
  Upload,
  FileImage,
  Loader2,
  Check,
  AlertCircle,
  Save,
  ArrowLeft,
} from 'lucide-react';
import { Separator } from './ui/separator';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { CategorySuggestions } from './CategorySuggestions';
import { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useUpdateQuiz, useUpload } from '@/hooks/use-queries';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from './ui/alert';
import { Quiz } from '@/lib/types';
import Link from 'next/link';

const questionSchema = z.object({
  text: z.string().min(5, 'Question text must be at least 5 characters.'),
  type: z.enum(['multiple-choice', 'true-false']),
  options: z
    .array(
      z.object({ text: z.string().min(1, 'Option text cannot be empty.') })
    )
    .min(2),
  correctAnswer: z.string().min(1, 'You must select a correct answer.'),
  time: z.coerce
    .number()
    .min(5, 'Time limit must be at least 5 seconds.')
    .max(120),
  points: z.coerce.number().min(0, 'Points cannot be negative.').max(2000),
  mediaUrl: z.string().optional(),
});

const quizFormSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters long.')
    .max(100),
  description: z.string().max(500).optional(),
  categories: z.array(z.string()).min(1, 'Please add at least one category.'),
  questions: z
    .array(questionSchema)
    .min(1, 'A quiz must have at least one question.'),
  status: z.enum(['draft', 'published']),
});

type QuizFormValues = z.infer<typeof quizFormSchema>;

interface EditQuizFormProps {
  quiz: Quiz;
}

export function EditQuizForm({ quiz }: EditQuizFormProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryInput, setCategoryInput] = useState('');
  const [uploadingFiles, setUploadingFiles] = useState<{
    [key: number]: boolean;
  }>({});
  const { toast } = useToast();
  const router = useRouter();

  // Backend hooks
  const updateQuiz = useUpdateQuiz();
  const uploadFile = useUpload();

  // Transform quiz data to form format
  const transformQuizToForm = (quiz: Quiz): QuizFormValues => {
    return {
      title: quiz.title,
      description: quiz.description || '',
      categories: quiz.categories,
      status: quiz.status,
      questions: quiz.questions.map((question) => ({
        text: question.text,
        type: question.type,
        options: question.options.map((option) => ({ text: option.text })),
        correctAnswer:
          question.options.find(
            (_, index) => index.toString() === question.correctAnswer
          )?.text || '',
        time: question.time,
        points: question.points,
        mediaUrl: question.mediaUrl || '',
      })),
    };
  };

  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: transformQuizToForm(quiz),
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'questions',
  });

  // Initialize categories from quiz data
  useEffect(() => {
    setCategories(quiz.categories);
  }, [quiz.categories]);

  // Transform form data to match backend API format
  const transformQuizData = (data: QuizFormValues) => {
    return {
      title: data.title,
      description: data.description || '',
      categories: data.categories,
      status: data.status,
      questions: data.questions.map((question, index) => ({
        id: quiz.questions[index]?.id || `q${index + 1}`, // Keep existing IDs or generate new ones
        text: question.text,
        type: question.type,
        options: question.options.map((option, optionIndex) => ({
          id: String.fromCharCode(97 + optionIndex), // Generate option IDs (a, b, c, d)
          text: option.text,
        })),
        correctAnswer: question.options
          .findIndex((opt) => opt.text === question.correctAnswer)
          .toString(),
        time: question.time,
        points: question.points,
        mediaUrl: question.mediaUrl || undefined,
      })),
    };
  };

  async function onSubmit(data: QuizFormValues) {
    try {
      // Transform the form data to match backend API format
      const quizData = transformQuizData(data);

      // Update the quiz via API
      await updateQuiz.mutateAsync({ id: quiz.id, data: quizData });

      toast({
        title: 'Quiz Updated Successfully!',
        description: `"${quizData.title}" has been updated.`,
        variant: 'default',
      });

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to update quiz:', error);
      toast({
        title: 'Failed to Update Quiz',
        description: 'There was an error updating your quiz. Please try again.',
        variant: 'destructive',
      });
    }
  }

  const handleFileUpload = async (file: File, questionIndex: number) => {
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload an image file (JPG, PNG, etc.)',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      toast({
        title: 'File Too Large',
        description: 'Please upload an image smaller than 10MB',
        variant: 'destructive',
      });
      return;
    }

    setUploadingFiles((prev) => ({ ...prev, [questionIndex]: true }));

    try {
      const uploadResponse = await uploadFile.mutateAsync(file);

      // Update the form with the uploaded file URL
      form.setValue(
        `questions.${questionIndex}.mediaUrl`,
        uploadResponse.mediaUrl
      );

      toast({
        title: 'Image Uploaded',
        description: `${uploadResponse.originalName} has been uploaded successfully.`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Failed to upload file:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload the image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploadingFiles((prev) => ({ ...prev, [questionIndex]: false }));
    }
  };

  const handleAddCategory = () => {
    if (categoryInput && !categories.includes(categoryInput)) {
      const newCategories = [...categories, categoryInput];
      setCategories(newCategories);
      form.setValue('categories', newCategories, { shouldValidate: true });
      setCategoryInput('');
    }
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    const newCategories = categories.filter((cat) => cat !== categoryToRemove);
    setCategories(newCategories);
    form.setValue('categories', newCategories, { shouldValidate: true });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Show error if quiz update fails */}
        {updateQuiz.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to update quiz. Please check if the backend is running and
              try again.
            </AlertDescription>
          </Alert>
        )}

        {/* Back to Dashboard Button */}
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quiz Details</CardTitle>
            <CardDescription>
              Update your quiz title, description, and settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Ultimate Science Challenge"
                      {...field}
                    />
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
              name="status"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Quiz Status</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="draft" />
                        </FormControl>
                        <FormLabel className="font-normal">Draft</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="published" />
                        </FormControl>
                        <FormLabel className="font-normal">Published</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormDescription>
                    Only published quizzes can be used to host games.
                  </FormDescription>
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
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCategory();
                          }
                        }}
                      />
                      <Button type="button" onClick={handleAddCategory}>
                        Add
                      </Button>
                    </div>
                  </FormControl>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {categories.map((cat) => (
                      <Badge key={cat} variant="secondary">
                        {cat}
                        <button
                          type="button"
                          className="ml-2"
                          onClick={() => handleRemoveCategory(cat)}
                        >
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
                  form.setValue('categories', newCategories, {
                    shouldValidate: true,
                  });
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
                  <CardDescription>
                    Update this question for your players.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  disabled={fields.length <= 1}
                >
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
                        <Input
                          placeholder="What is the powerhouse of the cell?"
                          {...field}
                        />
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
                                form.setValue(`questions.${index}.options`, [
                                  { text: 'True' },
                                  { text: 'False' },
                                ]);
                                form.setValue(
                                  `questions.${index}.correctAnswer`,
                                  ''
                                );
                              } else {
                                form.setValue(`questions.${index}.options`, [
                                  { text: '' },
                                  { text: '' },
                                  { text: '' },
                                  { text: '' },
                                ]);
                              }
                            }}
                            defaultValue={field.value}
                            className="flex gap-4"
                          >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="multiple-choice" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Multiple Choice
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="true-false" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                True/False
                              </FormLabel>
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
                      {form.watch(`questions.${index}.mediaUrl`) ? (
                        <>
                          <Check className="h-8 w-8 text-green-500" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-green-600">
                              Image uploaded
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {form
                                .watch(`questions.${index}.mediaUrl`)
                                ?.split('/')
                                .pop()}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              form.setValue(`questions.${index}.mediaUrl`, '')
                            }
                          >
                            Remove
                          </Button>
                        </>
                      ) : (
                        <>
                          <FileImage className="h-8 w-8 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              No file selected
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Upload an image to accompany this question.
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={uploadingFiles[index]}
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement)
                                  .files?.[0];
                                if (file) handleFileUpload(file, index);
                              };
                              input.click();
                            }}
                          >
                            {uploadingFiles[index] ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload
                              </>
                            )}
                          </Button>
                        </>
                      )}
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
                      <FormDescription>
                        Update the options and select the correct answer.
                      </FormDescription>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                          {form
                            .watch(`questions.${index}.options`)
                            .map((_, optionIndex) => (
                              <FormField
                                key={optionIndex}
                                control={form.control}
                                name={`questions.${index}.options.${optionIndex}.text`}
                                render={({ field: optionField }) => (
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem
                                        value={optionField.value}
                                        disabled={!optionField.value}
                                      />
                                    </FormControl>
                                    <Input
                                      {...optionField}
                                      placeholder={`Option ${optionIndex + 1}`}
                                      disabled={
                                        form.watch(
                                          `questions.${index}.type`
                                        ) === 'true-false'
                                      }
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
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              append({
                text: '',
                type: 'multiple-choice',
                options: [
                  { text: '' },
                  { text: '' },
                  { text: '' },
                  { text: '' },
                ],
                correctAnswer: '',
                time: 30,
                points: 1000,
                mediaUrl: '',
              })
            }
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Question
          </Button>

          <Button type="submit" size="lg" disabled={updateQuiz.isPending}>
            {updateQuiz.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating Quiz...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Update Quiz
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
