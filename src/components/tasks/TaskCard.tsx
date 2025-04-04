
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  type: "checkbox" | "counter" | "timer" | "text";
  completed: boolean;
  value?: number | string;
  maxValue?: number;
  className?: string;
  onComplete: (id: string, completed: boolean, value?: number | string) => void;
}

export const TaskCard = ({
  id,
  title,
  description,
  icon,
  type,
  completed,
  value,
  maxValue,
  className,
  onComplete,
}: TaskCardProps) => {
  const [localValue, setLocalValue] = React.useState(value || "");
  const [timerRunning, setTimerRunning] = React.useState(false);
  const [timerValue, setTimerValue] = React.useState(0);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimerValue((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerRunning]);

  const handleCheckboxChange = (checked: boolean) => {
    onComplete(id, checked);
  };

  const handleCounterChange = (newValue: number) => {
    const updatedValue = Math.max(0, Math.min(newValue, maxValue || 100));
    setLocalValue(updatedValue);
    onComplete(id, updatedValue >= (maxValue || 0), updatedValue);
  };

  const handleTimerToggle = () => {
    if (timerRunning) {
      setTimerRunning(false);
      onComplete(id, timerValue >= 60, timerValue); // Complete if at least 1 minute
    } else {
      setTimerRunning(true);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalValue(e.target.value);
    onComplete(id, e.target.value.trim().length > 0, e.target.value);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const renderTaskContent = () => {
    switch (type) {
      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox 
              id={`task-${id}`} 
              checked={completed}
              onCheckedChange={handleCheckboxChange}
            />
            <label
              htmlFor={`task-${id}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Mark as completed
            </label>
          </div>
        );
      
      case "counter":
        const counterValue = typeof localValue === "number" ? localValue : 0;
        const percentage = maxValue ? (counterValue / maxValue) * 100 : 0;
        
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => handleCounterChange(counterValue - 1)}
                  disabled={counterValue <= 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="font-medium text-lg w-12 text-center">{counterValue}</span>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => handleCounterChange(counterValue + 1)}
                  disabled={maxValue ? counterValue >= maxValue : false}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {maxValue && (
                <span className="text-sm text-muted-foreground">of {maxValue}</span>
              )}
            </div>
            
            {maxValue && (
              <div className="progress-bar">
                <div 
                  className="progress-bar-fill" 
                  style={{ "--progress-width": `${percentage}%` } as React.CSSProperties} 
                />
              </div>
            )}
          </div>
        );
      
      case "timer":
        return (
          <div className="space-y-3">
            <div className="text-2xl font-mono text-center">
              {formatTime(timerValue)}
            </div>
            <Button 
              variant={timerRunning ? "destructive" : "default"}
              className="w-full"
              onClick={handleTimerToggle}
            >
              {timerRunning ? "Stop" : "Start"} Timer
            </Button>
          </div>
        );
      
      case "text":
        return (
          <div className="space-y-2">
            <textarea
              className="w-full min-h-[100px] p-2 rounded-md border border-input resize-none"
              placeholder="Add your notes here..."
              value={typeof localValue === "string" ? localValue : ""}
              onChange={handleTextChange}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Card className={cn("overflow-hidden", 
      completed ? "border-thrive-green ring-1 ring-thrive-green" : "",
      className
    )}>
      <CardHeader className="p-4 pb-3 bg-muted/30">
        <div className="flex items-center">
          <div className="mr-2 text-primary">{icon}</div>
          <CardTitle className="text-md">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        {renderTaskContent()}
      </CardContent>
    </Card>
  );
};
