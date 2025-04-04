
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Task {
  id: string;
  title: string;
  description: string;
  type: "checkbox" | "counter" | "timer" | "text";
  completed: boolean;
  value?: number | string;
  maxValue?: number;
  icon?: React.ReactNode;
}

interface DailyProgress {
  date: string;
  tasks: Task[];
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
  user: any;
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

export const ChallengeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [challengeState, setChallengeState] = useState<ChallengeState>(initialState);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  // Auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load challenge data
  useEffect(() => {
    loadChallengeData();
  }, [user]);

  // Function to load challenge data from Supabase or localStorage
  const loadChallengeData = async () => {
    setIsLoading(true);
    
    if (user) {
      try {
        // Try to load from Supabase
        const { data: challengeData, error } = await supabase
          .from('challenges')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (challengeData) {
          // Challenge exists in Supabase
          const { data: tasksData, error: tasksError } = await supabase
            .from('daily_tasks')
            .select('*')
            .eq('challenge_id', challengeData.id);

          if (tasksError) throw tasksError;

          // Convert Supabase data to our state format
          const dailyProgress: Record<string, DailyProgress> = {};
          
          if (tasksData) {
            tasksData.forEach((task: any) => {
              const dateStr = new Date(task.date).toISOString().split('T')[0];
              
              // Create task objects based on the DB structure
              const taskList: Task[] = [
                {
                  id: "mindfulness",
                  title: "Mindfulness Session",
                  description: "Take a few minutes to meditate and clear your mind.",
                  type: "timer",
                  completed: task.mindfulness_completed || false,
                  value: task.mindfulness_value || 0,
                },
                {
                  id: "growth",
                  title: "Growth Content",
                  description: "Read or listen to content that helps you grow.",
                  type: "text",
                  completed: task.reading_completed || false,
                  value: task.reading_notes || "",
                },
                {
                  id: "hydration",
                  title: "Hydration",
                  description: "Track your water intake throughout the day.",
                  type: "counter",
                  completed: task.water_consumed || false,
                  value: task.water_glasses || 0,
                  maxValue: 8,
                },
                {
                  id: "nutrition",
                  title: "Nutrition Check",
                  description: "How are your eating habits today?",
                  type: "checkbox",
                  completed: task.diet_followed || false,
                },
                {
                  id: "movement",
                  title: "Movement & Outdoors",
                  description: "30 minutes of movement with at least 15 minutes outdoors.",
                  type: "checkbox",
                  completed: task.workout_completed || false,
                },
                {
                  id: "digital",
                  title: "Digital Detox",
                  description: "Take a break from screens and disconnect.",
                  type: "checkbox",
                  completed: task.digital_detox || false,
                }
              ];
              
              // Calculate if all tasks were completed
              const allCompleted = taskList.every(t => t.completed);
              
              dailyProgress[dateStr] = {
                date: dateStr,
                tasks: taskList,
                completed: allCompleted,
                day: task.day_number || 0
              };
            });
          }

          // Calculate streak
          const streak = calculateStreak(dailyProgress);

          setChallengeState({
            isStarted: true,
            currentDay: challengeData.current_day || 1,
            startDate: challengeData.start_date,
            dailyProgress,
            challengeId: challengeData.id,
            streakDays: streak
          });
        } else {
          // Try to load from localStorage and sync if available
          const localData = localStorage.getItem('thrive45_challenge');
          
          if (localData) {
            const parsedData = JSON.parse(localData);
            
            // Sync local data to Supabase
            await syncLocalDataToSupabase(parsedData, user.id);
            
            toast.success("Your local progress has been synced to your account!");
          } else {
            // No challenge data exists
            setChallengeState(initialState);
          }
        }
      } catch (error: any) {
        console.error("Error loading challenge data:", error);
        toast.error(`Failed to load your progress: ${error.message}`);
        
        // Fallback to localStorage
        const localData = localStorage.getItem('thrive45_challenge');
        if (localData) {
          setChallengeState(JSON.parse(localData));
        }
      }
    } else {
      // Load from localStorage for non-authenticated users
      const localData = localStorage.getItem('thrive45_challenge');
      if (localData) {
        setChallengeState(JSON.parse(localData));
      }
    }
    
    setIsLoading(false);
  };

  // Function to sync localStorage data to Supabase
  const syncLocalDataToSupabase = async (localData: ChallengeState, userId: string) => {
    if (!localData.isStarted) return;
    
    try {
      // Create a challenge record
      const { data: challenge, error: challengeError } = await supabase
        .from('challenges')
        .insert({
          user_id: userId,
          start_date: localData.startDate,
          current_day: localData.currentDay,
          status: 'active'
        })
        .select()
        .single();
      
      if (challengeError) throw challengeError;
      
      // Insert daily task records
      if (challenge) {
        const dailyTasksToInsert = Object.values(localData.dailyProgress).map(day => {
          const waterTask = day.tasks.find(t => t.id === 'hydration');
          const readingTask = day.tasks.find(t => t.id === 'growth');
          const mindfulnessTask = day.tasks.find(t => t.id === 'mindfulness');
          
          return {
            challenge_id: challenge.id,
            date: day.date,
            day_number: day.day,
            water_consumed: day.tasks.find(t => t.id === 'hydration')?.completed || false,
            water_glasses: waterTask?.value || 0,
            reading_completed: day.tasks.find(t => t.id === 'growth')?.completed || false,
            reading_notes: readingTask?.value || '',
            mindfulness_completed: day.tasks.find(t => t.id === 'mindfulness')?.completed || false,
            mindfulness_value: mindfulnessTask?.value || 0,
            diet_followed: day.tasks.find(t => t.id === 'nutrition')?.completed || false,
            workout_completed: day.tasks.find(t => t.id === 'movement')?.completed || false,
            digital_detox: day.tasks.find(t => t.id === 'digital')?.completed || false
          };
        });
        
        if (dailyTasksToInsert.length > 0) {
          const { error: tasksError } = await supabase
            .from('daily_tasks')
            .insert(dailyTasksToInsert);
            
          if (tasksError) throw tasksError;
        }
        
        // Update local state with the new challenge id
        setChallengeState({
          ...localData,
          challengeId: challenge.id
        });
      }
    } catch (error: any) {
      console.error("Error syncing data to Supabase:", error);
      toast.error(`Failed to sync your progress: ${error.message}`);
    }
  };

  // Calculate streak of consecutive completed days
  const calculateStreak = (progress: Record<string, DailyProgress>): number => {
    const dates = Object.keys(progress)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    if (dates.length === 0) return 0;
    
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let currentDate = today;
    
    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      const dayProgress = progress[date];
      
      // Check if this is today or consecutive previous days
      if (date === currentDate && dayProgress.completed) {
        streak++;
        // Move to previous day
        const prevDate = new Date(currentDate);
        prevDate.setDate(prevDate.getDate() - 1);
        currentDate = prevDate.toISOString().split('T')[0];
      } else {
        // Break streak if a day was missed or not completed
        break;
      }
    }
    
    return streak;
  };

  // Start or restart the challenge
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
    
    // Save to localStorage
    localStorage.setItem('thrive45_challenge', JSON.stringify(newState));
    
    if (user) {
      try {
        // Check for existing active challenge
        const { data: existingChallenge, error: fetchError } = await supabase
          .from('challenges')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();
          
        if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
        
        if (existingChallenge) {
          // Update existing challenge to "failed"
          await supabase
            .from('challenges')
            .update({ status: 'failed' })
            .eq('id', existingChallenge.id);
        }
        
        // Create new challenge
        const { data: challenge, error } = await supabase
          .from('challenges')
          .insert({
            user_id: user.id,
            start_date: today,
            current_day: 1,
            status: 'active'
          })
          .select()
          .single();
          
        if (error) throw error;
        
        if (challenge) {
          newState.challengeId = challenge.id;
        }
      } catch (error: any) {
        console.error("Error starting challenge:", error);
        toast.error(`Failed to start challenge: ${error.message}`);
      }
    }
    
    setChallengeState(newState);
    toast.success("Your 45-day challenge has begun! Complete all tasks each day to build your streak.");
  };

  // Save daily progress
  const saveDailyProgress = async (date: string, tasks: Task[]) => {
    // Check if all tasks are completed
    const allCompleted = tasks.every(task => task.completed);
    
    // Get the current date as a string
    const today = new Date().toISOString().split('T')[0];
    
    // Calculate the current day in the challenge
    let currentDay = challengeState.currentDay;
    
    // If this is a new day and yesterday was completed, increment the day counter
    if (date === today && !challengeState.dailyProgress[today]) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (challengeState.dailyProgress[yesterdayStr]?.completed) {
        currentDay++;
      } else if (Object.keys(challengeState.dailyProgress).length > 0) {
        // If we have progress but yesterday wasn't completed, we need to reset
        return resetChallenge();
      }
    }
    
    // Update state with new progress
    const newDailyProgress = {
      ...challengeState.dailyProgress,
      [date]: {
        date,
        tasks,
        completed: allCompleted,
        day: currentDay
      }
    };
    
    const streak = calculateStreak(newDailyProgress);
    
    const newState = {
      ...challengeState,
      currentDay,
      dailyProgress: newDailyProgress,
      streakDays: streak
    };
    
    // Save to localStorage
    localStorage.setItem('thrive45_challenge', JSON.stringify(newState));
    
    // Save to Supabase if user is logged in
    if (user && challengeState.challengeId) {
      try {
        // Update challenge current day
        await supabase
          .from('challenges')
          .update({ current_day: currentDay })
          .eq('id', challengeState.challengeId);
        
        // Find tasks in our state
        const waterTask = tasks.find(t => t.id === 'hydration');
        const readingTask = tasks.find(t => t.id === 'growth');
        const mindfulnessTask = tasks.find(t => t.id === 'mindfulness');
        const nutritionTask = tasks.find(t => t.id === 'nutrition');
        const movementTask = tasks.find(t => t.id === 'movement');
        const digitalTask = tasks.find(t => t.id === 'digital');
        
        // Check if we already have a record for this date
        const { data: existingRecord, error: fetchError } = await supabase
          .from('daily_tasks')
          .select('id')
          .eq('challenge_id', challengeState.challengeId)
          .eq('date', date)
          .single();
          
        if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
        
        const taskData = {
          challenge_id: challengeState.challengeId,
          date,
          day_number: currentDay,
          water_consumed: waterTask?.completed || false,
          water_glasses: waterTask?.value || 0,
          reading_completed: readingTask?.completed || false,
          reading_notes: readingTask?.value || '',
          mindfulness_completed: mindfulnessTask?.completed || false,
          mindfulness_value: mindfulnessTask?.value || 0,
          diet_followed: nutritionTask?.completed || false,
          workout_completed: movementTask?.completed || false,
          digital_detox: digitalTask?.completed || false
        };
        
        if (existingRecord) {
          // Update existing record
          const { error } = await supabase
            .from('daily_tasks')
            .update(taskData)
            .eq('id', existingRecord.id);
            
          if (error) throw error;
        } else {
          // Insert new record
          const { error } = await supabase
            .from('daily_tasks')
            .insert(taskData);
            
          if (error) throw error;
        }
      } catch (error: any) {
        console.error("Error saving challenge progress:", error);
        toast.error(`Failed to save progress: ${error.message}`);
      }
    }
    
    setChallengeState(newState);
    
    if (allCompleted) {
      toast.success("Great job! All tasks completed for today!");
    }
  };

  // Reset challenge
  const resetChallenge = async () => {
    if (user && challengeState.challengeId) {
      try {
        // Mark the current challenge as failed
        await supabase
          .from('challenges')
          .update({ status: 'failed' })
          .eq('id', challengeState.challengeId);
          
        toast.info("Challenge reset. Don't worry, you can start again!");
      } catch (error: any) {
        console.error("Error resetting challenge:", error);
        toast.error(`Failed to reset challenge: ${error.message}`);
      }
    }
    
    // Reset localStorage
    localStorage.removeItem('thrive45_challenge');
    
    // Reset state
    setChallengeState(initialState);
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
