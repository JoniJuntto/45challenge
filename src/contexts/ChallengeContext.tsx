import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Session } from "@supabase/supabase-js";
import type { TablesInsert, TablesUpdate, Tables } from "@/integrations/supabase/types";

export interface Task {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  type: "checkbox" | "counter" | "timer" | "text";
  completed: boolean;
  value?: number | string;
  maxValue?: number;
}

interface StoredTask extends Omit<Task, 'icon'> {}

interface DailyProgress {
  date: string;
  tasks: StoredTask[];
  completed: boolean;
  day: number;
}

interface ChallengeState {
  isStarted: boolean;
  currentDay: number;
  startDate: string | null;
  dailyProgress: Record<string, DailyProgress>;
  challengeId: string | null;
  streakDays: number;
}

interface ChallengeContextType {
  challengeState: ChallengeState;
  user: User | null;
  isLoading: boolean;
  startChallenge: () => void;
  saveDailyProgress: (date: string, tasks: Task[]) => void;
  resetChallenge: () => void;
}

const initialState: ChallengeState = {
  isStarted: false,
  currentDay: 1,
  startDate: null,
  dailyProgress: {},
  challengeId: null,
  streakDays: 0
};

const ChallengeContext = createContext<ChallengeContextType | undefined>(undefined);

const calculateStreak = (progress: Record<string, DailyProgress>): number => {
    let streak = 0;
    const sortedDates = Object.keys(progress).sort();
    if (sortedDates.length === 0) return 0;

    const today = new Date();
    let currentDate = new Date(today);

    for (let i = 0; i < 45; i++) {
        const dateStrToFind = currentDate.toISOString().split('T')[0];
        const dayData = progress[dateStrToFind];

        if (dayData && dayData.completed) {
            streak++;
        } else {
            const todayStr = today.toISOString().split('T')[0];
            if (dateStrToFind === todayStr && !dayData && Object.keys(progress).length > 0) {
                
            } else {
                break;
            }
        }

        currentDate.setDate(currentDate.getDate() - 1);
    }
    return streak;
};

const convertSupabaseRowToTasks = (taskRow: Tables<'daily_tasks'>): StoredTask[] => {
      return [
        {
          id: "mindfulness",
          title: "Mindfulness Session",
          description: "Take a few minutes to meditate and clear your mind.",
          type: "timer",
          completed: taskRow.mindfulness_completed ?? false,
          value: taskRow.mindfulness_value ?? 0,
        },
        {
          id: "growth",
          title: "Growth Content",
          description: "Read or listen to content that helps you grow.",
          type: "text",
          completed: taskRow.reading_completed ?? false,
          value: taskRow.reading_notes ?? "",
        },
        {
          id: "hydration",
          title: "Hydration",
          description: "Track your water intake throughout the day.",
          type: "counter",
          completed: taskRow.water_consumed ?? false,
          value: taskRow.water_glasses ?? 0,
          maxValue: 8,
        },
        {
          id: "nutrition",
          title: "Nutrition Check",
          description: "How are your eating habits today?",
          type: "checkbox",
          completed: taskRow.diet_followed ?? false,
        },
        {
          id: "movement",
          title: "Movement & Outdoors",
          description: "30 minutes of movement with at least 15 minutes outdoors.",
          type: "checkbox",
          completed: taskRow.workout_1_completed ?? taskRow.workout_2_completed ?? false,
        },
        {
          id: "digital",
          title: "Digital Detox",
          description: "Take a break from screens and disconnect.",
          type: "checkbox",
          completed: taskRow.digital_detox ?? false,
        }
      ];
};

export const ChallengeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [challengeState, setChallengeState] = useState<ChallengeState>(initialState);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    }).catch((error) => {
        console.error("Error getting initial session:", error);
        setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    loadChallengeData();
  }, [user]);

  const syncLocalDataToSupabase = async (localData: ChallengeState, userId: string) => {
      if (!localData.isStarted || !localData.startDate) return;

      try {
          const { data: existingChallenge, error: fetchExistingError } = await supabase
            .from('challenges')
            .select('id')
            .eq('user_id', userId)
            .eq('status', 'active')
            .maybeSingle();

          if (fetchExistingError) throw fetchExistingError;

          if (existingChallenge) {
            console.log("Active challenge already exists for user, skipping sync of challenge creation.");
            return;
          }

          const challengeInsert: TablesInsert<'challenges'> = {
              user_id: userId,
              start_date: localData.startDate,
              current_day: localData.currentDay,
              status: 'active'
          };
          const { data: challenge, error: challengeError } = await supabase
              .from('challenges')
              .insert(challengeInsert)
              .select()
              .single();

          if (challengeError) throw challengeError;
          if (!challenge) throw new Error("Failed to create challenge record during sync.");

          const dailyTasksToInsert: TablesInsert<'daily_tasks'>[] = Object.values(localData.dailyProgress).map((day): TablesInsert<'daily_tasks'> => {
              const waterTask = day.tasks.find(t => t.id === 'hydration');
              const readingTask = day.tasks.find(t => t.id === 'growth');
              const mindfulnessTask = day.tasks.find(t => t.id === 'mindfulness');
              const nutritionTask = day.tasks.find(t => t.id === 'nutrition');
              const movementTask = day.tasks.find(t => t.id === 'movement');
              const digitalTask = day.tasks.find(t => t.id === 'digital');

              return {
                  challenge_id: challenge.id,
                  date: day.date,
                  day_number: day.day,
                  water_consumed: waterTask?.completed ?? false,
                  water_glasses: typeof waterTask?.value === 'number' ? waterTask.value : null,
                  reading_completed: readingTask?.completed ?? false,
                  reading_notes: typeof readingTask?.value === 'string' ? readingTask.value : null,
                  mindfulness_completed: mindfulnessTask?.completed ?? false,
                  mindfulness_value: typeof mindfulnessTask?.value === 'number' ? mindfulnessTask.value : null,
                  diet_followed: nutritionTask?.completed ?? false,
                  workout_1_completed: movementTask?.completed ?? false,
                  workout_2_completed: false,
                  digital_detox: digitalTask?.completed ?? false
              };
          });

          if (dailyTasksToInsert.length > 0) {
              const { error: tasksError } = await supabase
                  .from('daily_tasks')
                  .insert(dailyTasksToInsert);
              if (tasksError) throw tasksError;
          }

          return challenge.id;

      } catch (error: unknown) {
          console.error("Error syncing data to Supabase:", error);
          const message = error instanceof Error ? error.message : "Unknown error";
          toast.error(`Failed to sync progress: ${message}`);
          return null;
      }
  };

  const loadChallengeData = async () => {
    try {
      if (user) {
          const { data: challengeData, error: challengeError } = await supabase
            .from('challenges')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .maybeSingle();

          if (challengeError) throw challengeError;

          if (challengeData) {
            const { data: tasksData, error: tasksError } = await supabase
              .from('daily_tasks')
              .select('*')
              .eq('challenge_id', challengeData.id);

            if (tasksError) throw tasksError;

            const dailyProgress: Record<string, DailyProgress> = {};
            if (tasksData) {
              tasksData.forEach((taskRow: Tables<'daily_tasks'>) => {
                const dateStr = new Date(taskRow.date).toISOString().split('T')[0];
                 if (!isNaN(new Date(taskRow.date).getTime())) {
                    const taskList = convertSupabaseRowToTasks(taskRow);
                    const allCompleted = taskList.every(t => t.completed);
                    dailyProgress[dateStr] = {
                      date: dateStr,
                      tasks: taskList,
                      completed: allCompleted,
                      day: taskRow.day_number ?? 0
                    };
                 } else {
                     console.warn("Skipping invalid date from Supabase task:", taskRow.date);
                 }
              });
            }

            const streak = calculateStreak(dailyProgress);
            setChallengeState({
              isStarted: true,
              currentDay: challengeData.current_day ?? 1,
              startDate: challengeData.start_date,
              dailyProgress,
              challengeId: challengeData.id,
              streakDays: streak
            });
          } else {
            const localData = localStorage.getItem('thrive45_challenge');
            if (localData) {
              try {
                  const parsedData: ChallengeState = JSON.parse(localData);
                  toast.info("Syncing local progress to your account...");
                  const syncedChallengeId = await syncLocalDataToSupabase(parsedData, user.id);
                  if (syncedChallengeId) {
                       toast.success("Sync complete!");
                      await loadChallengeData();
                      return;
                  } else {
                      setChallengeState(parsedData);
                       toast.error("Failed to sync. Progress remains local for now.");
                  }
              } catch (parseError) {
                  console.error("Error parsing local data:", parseError);
                  localStorage.removeItem('thrive45_challenge');
                  setChallengeState(initialState);
              }
            } else {
              setChallengeState(initialState);
            }
          }
      } else {
          const localData = localStorage.getItem('thrive45_challenge');
          if (localData) {
             try {
                 setChallengeState(JSON.parse(localData));
             } catch (parseError) {
                 console.error("Error parsing local data:", parseError);
                 localStorage.removeItem('thrive45_challenge');
                 setChallengeState(initialState);
             }
          } else {
            setChallengeState(initialState);
          }
      }
    } catch (error: unknown) {
        console.error("Error loading challenge data:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        toast.error(`Failed to load progress: ${message}`);
    }
  };

  useEffect(() => {
    if (!isLoading) {
        loadChallengeData();
    }
  }, [user, isLoading]);

  const startChallenge = async () => {
    const today = new Date().toISOString().split('T')[0];

    const newState: ChallengeState = {
      isStarted: true,
      currentDay: 1,
      startDate: today,
      dailyProgress: {},
      challengeId: null,
      streakDays: 0
    };

    setChallengeState(newState);
    localStorage.setItem('thrive45_challenge', JSON.stringify(newState));
    toast.success("Your 45-day challenge has begun!");

    if (user) {
      try {
        const { data: existingChallenge } = await supabase
          .from('challenges')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        if (existingChallenge) {
          const { error: updateError } = await supabase
            .from('challenges')
            .update({ status: 'failed' })
            .eq('id', existingChallenge.id);
          if (updateError) console.error("Error marking previous challenge as failed:", updateError);
        }

        const challengeInsert: TablesInsert<'challenges'> = {
             user_id: user.id,
             start_date: today,
             current_day: 1,
             status: 'active'
         };
        const { data: challenge, error: insertError } = await supabase
          .from('challenges')
          .insert(challengeInsert)
          .select()
          .single();

        if (insertError) throw insertError;

        if (challenge) {
          const stateWithId = { ...newState, challengeId: challenge.id };
          setChallengeState(stateWithId);
          localStorage.setItem('thrive45_challenge', JSON.stringify(stateWithId));
        } else {
            throw new Error("Failed to get challenge details after insert.");
        }

      } catch (error: unknown) {
        console.error("Error starting challenge in Supabase:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        toast.error(`Failed to sync new challenge start: ${message}. Progress saved locally.`);
      }
    }
  };

  const saveDailyProgress = async (date: string, tasks: Task[]) => {
    const tasksForState: StoredTask[] = tasks.map(({ icon, ...rest }) => rest);
    const allCompleted = tasksForState.every(task => task.completed);

    const progressForStreak = {
      ...challengeState.dailyProgress,
      [date]: { date, tasks: tasksForState, completed: allCompleted, day: challengeState.currentDay }
    };
    const newStreak = calculateStreak(progressForStreak);

    const currentDayForRecord = challengeState.currentDay;

    const newState: ChallengeState = {
      ...challengeState,
      currentDay: currentDayForRecord,
      dailyProgress: {
        ...challengeState.dailyProgress,
        [date]: {
          date: date,
          tasks: tasksForState,
          completed: allCompleted,
          day: currentDayForRecord
        }
      },
      streakDays: newStreak,
    };
    setChallengeState(newState);
    localStorage.setItem('thrive45_challenge', JSON.stringify(newState));

    if (user && challengeState.challengeId) {
      try {
         const waterTask = tasks.find(t => t.id === 'hydration');
        const readingTask = tasks.find(t => t.id === 'growth');
        const mindfulnessTask = tasks.find(t => t.id === 'mindfulness');
        const nutritionTask = tasks.find(t => t.id === 'nutrition');
        const movementTask = tasks.find(t => t.id === 'movement');
        const digitalTask = tasks.find(t => t.id === 'digital');

        type DailyTaskBase = Omit<Tables<'daily_tasks'>, 'id' | 'created_at' | 'updated_at' | 'challenge_id' | 'date' | 'day_number'>;
        const taskData: DailyTaskBase = {
          water_consumed: waterTask?.completed ?? false,
          water_glasses: typeof waterTask?.value === 'number' ? waterTask.value : null,
          reading_completed: readingTask?.completed ?? false,
          reading_notes: typeof readingTask?.value === 'string' ? readingTask.value : null,
          mindfulness_completed: mindfulnessTask?.completed ?? false,
          mindfulness_value: typeof mindfulnessTask?.value === 'number' ? mindfulnessTask.value : null,
          diet_followed: nutritionTask?.completed ?? false,
          workout_1_completed: movementTask?.completed ?? false,
          workout_2_completed: false,
          digital_detox: digitalTask?.completed ?? false,
          progress_photo_taken: false,
        };

        const { data: existingRecord, error: fetchError } = await supabase
          .from('daily_tasks')
          .select('id')
          .eq('challenge_id', challengeState.challengeId)
          .eq('date', date)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (existingRecord) {
          const taskUpdate: TablesUpdate<'daily_tasks'> = { ...taskData };
          const { error: updateError } = await supabase
            .from('daily_tasks')
            .update(taskUpdate)
            .eq('id', existingRecord.id);
          if (updateError) throw updateError;
        } else {
          const taskInsert: TablesInsert<'daily_tasks'> = {
             ...taskData,
             challenge_id: challengeState.challengeId,
             date: date,
             day_number: currentDayForRecord
           };
          const { error: insertError } = await supabase
            .from('daily_tasks')
            .insert(taskInsert);
          if (insertError) throw insertError;
        }

        if (challengeState.currentDay !== currentDayForRecord) {
            await supabase
                .from('challenges')
                .update({ current_day: currentDayForRecord })
                .eq('id', challengeState.challengeId);
        }

      } catch (error: unknown) {
        console.error("Error saving challenge progress to Supabase:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        toast.error(`Failed to save progress to cloud: ${message}. Progress saved locally.`);
      }
    }

    if (allCompleted) {
      toast.success("Great job! All tasks completed for today!");
    }
  };

  const resetChallenge = async () => {
    const challengeIdToReset = challengeState.challengeId;

    setChallengeState(initialState);
    localStorage.removeItem('thrive45_challenge');
    toast.info("Challenge reset. You can start again!");

    if (user && challengeIdToReset) {
      try {
        const { error } = await supabase
          .from('challenges')
          .update({ status: 'failed' })
          .eq('id', challengeIdToReset);
         if (error) throw error;
      } catch (error: unknown) {
        console.error("Error marking challenge as failed in Supabase:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        toast.error(`Failed to update challenge status in cloud: ${message}`);
      }
    }
  };

  return (
    <ChallengeContext.Provider value={{
      challengeState,
      user,
      isLoading,
      startChallenge,
      saveDailyProgress,
      resetChallenge
    }}>
      {children}
    </ChallengeContext.Provider>
  );
};

export const useChallenge = () => {
  const context = useContext(ChallengeContext);
  if (context === undefined) {
    throw new Error('useChallenge must be used within a ChallengeProvider');
  }
  return context;
};
