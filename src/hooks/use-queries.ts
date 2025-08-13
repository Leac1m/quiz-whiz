import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Quiz } from '@/lib/types';

// Quiz queries
export function useQuizzes() {
    return useQuery({
        queryKey: ['quizzes'],
        queryFn: () => api.quiz.getAll(),
    });
}

export function useQuiz(id: string) {
    return useQuery({
        queryKey: ['quiz', id],
        queryFn: () => api.quiz.getById(id),
        enabled: !!id,
    });
}

export function useCreateQuiz() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Partial<Quiz>) => api.quiz.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quizzes'] });
        },
    });
}

export function useUpdateQuiz() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Quiz> }) =>
            api.quiz.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['quizzes'] });
            queryClient.invalidateQueries({ queryKey: ['quiz', variables.id] });
        },
    });
}

export function useDeleteQuiz() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => api.quiz.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quizzes'] });
        },
    });
}

// Game queries
export function useCreateGame() {
    return useMutation({
        mutationFn: (quizId: string) => api.game.create(quizId),
    });
}

export function useJoinGame() {
    return useMutation({
        mutationFn: ({ pin, name }: { pin: string; name: string }) =>
            api.game.join(pin, name),
    });
}

export function useLeaderboard(gameId: string) {
    return useQuery({
        queryKey: ['leaderboard', gameId],
        queryFn: () => api.game.getLeaderboard(gameId),
        enabled: !!gameId,
        refetchInterval: 5000, // Refetch every 5 seconds during game
    });
}

// File upload
export function useUpload() {
    return useMutation({
        mutationFn: (file: File) => api.upload(file),
    });
}

// AI queries
export function useCategorySuggestions() {
    return useMutation({
        mutationFn: (context: string) => api.ai.suggestCategories(context),
    });
}

// System health
export function useHealth() {
    return useQuery({
        queryKey: ['health'],
        queryFn: () => api.health(),
        refetchInterval: 30000, // Check every 30 seconds
    });
}