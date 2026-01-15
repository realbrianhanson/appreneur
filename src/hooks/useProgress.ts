import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UserProgress {
  day_number: number;
  is_unlocked: boolean;
  is_completed: boolean;
  completed_at: string | null;
  tasks_completed: Record<string, unknown>;
  time_spent_seconds: number;
}

interface UserStats {
  days_completed: number;
  streak: number;
  total_time_seconds: number;
  percentile: number;
  cohort_rank: number | null;
  cohort_size: number | null;
}

interface CompleteTaskResult {
  task_id: string;
  day_number: number;
  day_completed: boolean;
  next_day_unlocked: boolean;
}

interface CompleteDayResult {
  day_completed: number;
  next_day_unlocked: boolean;
  is_graduation: boolean;
}

export function useProgress() {
  const { session } = useAuth();
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!session?.access_token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await supabase.functions.invoke("get-progress", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to fetch progress");
      }

      const data = response.data;
      if (data.progress) {
        setProgress(data.progress.map((p: Record<string, unknown>) => ({
          day_number: p.day_number as number,
          is_unlocked: p.is_unlocked as boolean,
          is_completed: p.is_completed as boolean,
          completed_at: p.completed_at as string | null,
          tasks_completed: (p.tasks_completed as Record<string, unknown>) || {},
          time_spent_seconds: p.time_spent_seconds as number,
        })));
      }
      if (data.stats) {
        setStats(data.stats as UserStats);
      }
    } catch (err) {
      console.error("Error fetching progress:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch progress");
    } finally {
      setIsLoading(false);
    }
  }, [session?.access_token]);

  const completeTask = useCallback(async (
    dayNumber: number, 
    taskId: string
  ): Promise<CompleteTaskResult | null> => {
    if (!session?.access_token) return null;

    try {
      const response = await supabase.functions.invoke("complete-task", {
        body: { day_number: dayNumber, task_id: taskId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to complete task");
      }

      const result = response.data.result as CompleteTaskResult;

      // Optimistically update local state
      setProgress(prev => prev.map(p => {
        if (p.day_number === dayNumber) {
          return {
            ...p,
            tasks_completed: {
              ...p.tasks_completed,
              [taskId]: new Date().toISOString(),
            },
            is_completed: result.day_completed,
            completed_at: result.day_completed ? new Date().toISOString() : p.completed_at,
          };
        }
        // Unlock next day if needed
        if (result.next_day_unlocked && p.day_number === dayNumber + 1) {
          return { ...p, is_unlocked: true };
        }
        return p;
      }));

      return result;
    } catch (err) {
      console.error("Error completing task:", err);
      setError(err instanceof Error ? err.message : "Failed to complete task");
      return null;
    }
  }, [session?.access_token]);

  const completeDay = useCallback(async (
    dayNumber: number,
    timeSpentSeconds?: number
  ): Promise<CompleteDayResult | null> => {
    if (!session?.access_token) return null;

    try {
      const response = await supabase.functions.invoke("complete-day", {
        body: { day_number: dayNumber, time_spent_seconds: timeSpentSeconds },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to complete day");
      }

      const result = response.data as CompleteDayResult;

      // Optimistically update local state
      setProgress(prev => prev.map(p => {
        if (p.day_number === dayNumber) {
          return {
            ...p,
            is_completed: true,
            completed_at: new Date().toISOString(),
            time_spent_seconds: p.time_spent_seconds + (timeSpentSeconds || 0),
          };
        }
        // Unlock next day if needed
        if (result.next_day_unlocked && p.day_number === dayNumber + 1) {
          return { ...p, is_unlocked: true };
        }
        return p;
      }));

      // Update stats
      if (stats) {
        setStats({
          ...stats,
          days_completed: stats.days_completed + 1,
          streak: stats.streak + 1,
          total_time_seconds: stats.total_time_seconds + (timeSpentSeconds || 0),
        });
      }

      return result;
    } catch (err) {
      console.error("Error completing day:", err);
      setError(err instanceof Error ? err.message : "Failed to complete day");
      return null;
    }
  }, [session?.access_token, stats]);

  const getDayProgress = useCallback((dayNumber: number): UserProgress | null => {
    return progress.find(p => p.day_number === dayNumber) || null;
  }, [progress]);

  const getCurrentDay = useCallback((): number => {
    // Find the first unlocked but not completed day
    const currentDayProgress = progress.find(p => p.is_unlocked && !p.is_completed);
    if (currentDayProgress) {
      return currentDayProgress.day_number;
    }
    // If all days are completed, return 7
    const completedDays = progress.filter(p => p.is_completed).length;
    return completedDays === 7 ? 7 : completedDays + 1;
  }, [progress]);

  const isTaskCompleted = useCallback((dayNumber: number, taskId: string): boolean => {
    const dayProgress = getDayProgress(dayNumber);
    return dayProgress ? taskId in dayProgress.tasks_completed : false;
  }, [getDayProgress]);

  return {
    progress,
    stats,
    isLoading,
    error,
    fetchProgress,
    completeTask,
    completeDay,
    getDayProgress,
    getCurrentDay,
    isTaskCompleted,
  };
}
