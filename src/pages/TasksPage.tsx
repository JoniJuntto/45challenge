
import React, { useState } from "react";
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
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  type: "checkbox" | "counter" | "timer" | "text";
  completed: boolean;
  value?: number | string;
  maxValue?: number;
}

const TasksPage = () => {
  const [tasks, setTasks] = useState<Task[]>([
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

  const handleTaskComplete = (id: string, completed: boolean, value?: number | string) => {
    setTasks(tasks.map(task => 
      task.id === id 
        ? { ...task, completed, value: value !== undefined ? value : task.value } 
        : task
    ));
  };

  const completedCount = tasks.filter(task => task.completed).length;
  const completionPercentage = (completedCount / tasks.length) * 100;
  
  const handleCompleteDay = () => {
    const allCompleted = tasks.every(task => task.completed);
    
    if (allCompleted) {
      toast.success("Congratulations! You've completed all your tasks for today.");
    } else {
      toast("You still have some tasks to complete!", {
        description: `Completed: ${completedCount}/${tasks.length}`,
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Daily Tasks</h1>
          <p className="text-muted-foreground">Day 1 of 45 • April 4, 2025</p>
        </div>
        <Button 
          size="lg"
          onClick={handleCompleteDay}
          className="mt-4 md:mt-0"
        >
          Complete Day
        </Button>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-medium">Daily Progress</h2>
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
            icon={task.icon}
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
