
import React, { useState, useEffect } from "react";
import { 
  Brain, 
  Book, 
  Droplets, 
  Apple, 
  Activity, 
  PhoneOff 
} from "lucide-react";
import { TaskCard } from "@/components/tasks/TaskCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useChallenge, Task } from "@/contexts/ChallengeContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const TasksPage = () => {
  const { challengeState, isLoading, startChallenge, saveDailyProgress } = useChallenge();
  const [tasks, setTasks] = useState<Task[]>([]);

  // Initialize the tasks when the component mounts
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    
    if (challengeState.isStarted && challengeState.dailyProgress[today]) {
      // Use stored tasks for today
      setTasks(challengeState.dailyProgress[today].tasks);
    } else {
      // Initialize default tasks
      setTasks([
        {
          id: "mindfulness",
          title: "Mindfulness Session",
          description: "Take a few minutes to meditate and clear your mind.",
          icon: <Brain className="h-5 w-5" />,
          type: "timer",
          completed: false,
          value: 0,
        },
        {
          id: "growth",
          title: "Growth Content",
          description: "Read or listen to content that helps you grow.",
          icon: <Book className="h-5 w-5" />,
          type: "text",
          completed: false,
          value: "",
        },
        {
          id: "hydration",
          title: "Hydration",
          description: "Track your water intake throughout the day.",
          icon: <Droplets className="h-5 w-5" />,
          type: "counter",
          completed: false,
          value: 0,
          maxValue: 8, // Representing 8 glasses
        },
        {
          id: "nutrition",
          title: "Nutrition Check",
          description: "How are your eating habits today?",
          icon: <Apple className="h-5 w-5" />,
          type: "checkbox",
          completed: false,
        },
        {
          id: "movement",
          title: "Movement & Outdoors",
          description: "30 minutes of movement with at least 15 minutes outdoors.",
          icon: <Activity className="h-5 w-5" />,
          type: "checkbox",
          completed: false,
        },
        {
          id: "digital",
          title: "Digital Detox",
          description: "Take a break from screens and disconnect.",
          icon: <PhoneOff className="h-5 w-5" />,
          type: "checkbox",
          completed: false,
        },
      ]);
    }
  }, [challengeState.isStarted, challengeState.dailyProgress]);

  const handleTaskComplete = (id: string, completed: boolean, value?: number | string) => {
    const updatedTasks = tasks.map(task => 
      task.id === id 
        ? { ...task, completed, value: value !== undefined ? value : task.value } 
        : task
    );
    
    setTasks(updatedTasks);
    
    // Save progress
    const today = new Date().toISOString().split('T')[0];
    saveDailyProgress(today, updatedTasks);
  };

  const completedCount = tasks.filter(task => task.completed).length;
  const completionPercentage = (completedCount / tasks.length) * 100;
  
  const today = new Date().toISOString().split('T')[0];
  const daysCompleted = Object.values(challengeState.dailyProgress).filter(day => day.completed).length;
  
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto animate-fade-in space-y-8">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!challengeState.isStarted) {
    return (
      <div className="max-w-7xl mx-auto animate-fade-in text-center">
        <h1 className="text-3xl font-bold mb-4">Start Your Thrive45 Challenge</h1>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          Complete all 6 tasks every day for 45 days straight to build discipline and habits. 
          Miss a single day, and you'll need to start over from day 1.
        </p>
        <Button size="lg" onClick={startChallenge}>
          Start Challenge
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Daily Tasks</h1>
          <p className="text-muted-foreground">
            Day {challengeState.currentDay} of 45 • Current Streak: {challengeState.streakDays} days
          </p>
        </div>
      </div>

      {challengeState.streakDays < challengeState.currentDay - 1 && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>
            You missed completing all tasks yesterday. Your streak has been reset.
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-medium">Today's Progress</h2>
          <span className="text-sm font-medium">{completedCount}/{tasks.length} completed</span>
        </div>
        <Progress value={completionPercentage} className="h-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            id={task.id}
            title={task.title}
            description={task.description}
            icon={task.icon || <div />}
            type={task.type}
            completed={task.completed}
            value={task.value}
            maxValue={task.maxValue}
            onComplete={handleTaskComplete}
          />
        ))}
      </div>
    </div>
  );
};

export default TasksPage;
