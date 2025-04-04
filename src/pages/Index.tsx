
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  CalendarIcon, 
  CheckCircle2, 
  Brain, 
  Droplets, 
  Activity, 
  Book, 
  PhoneOff 
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [focusArea, setFocusArea] = useState("balance");
  const [step, setStep] = useState(1);

  const handleStart = () => {
    if (!startDate) {
      toast.error("Please select a start date");
      return;
    }
    
    // In a real app, we would save these settings to a backend or local storage
    localStorage.setItem("thrive45_start_date", startDate.toISOString());
    localStorage.setItem("thrive45_focus_area", focusArea);
    
    toast.success("Your 45-day challenge is set up!");
    navigate("/tasks");
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl font-bold mb-4">Thrive45</h1>
        <p className="text-xl text-muted-foreground">
          The 45-Day Balance Challenge for lifelong habits
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <Card className="md:col-span-2">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Ready to Transform Your Daily Habits?</CardTitle>
            <CardDescription>
              Thrive45 helps you build lifelong habits through a sustainable 45-day challenge focused on mental clarity, physical activity, and digital balance.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div className="flex flex-col items-center text-center p-4">
                <Brain className="h-10 w-10 text-thrive-blue mb-2" />
                <h3 className="font-medium">Mental Clarity</h3>
                <p className="text-sm text-muted-foreground">Daily mindfulness practice</p>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <Book className="h-10 w-10 text-thrive-blue mb-2" />
                <h3 className="font-medium">Personal Growth</h3>
                <p className="text-sm text-muted-foreground">Read or listen daily</p>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <Droplets className="h-10 w-10 text-thrive-blue mb-2" />
                <h3 className="font-medium">Hydration</h3>
                <p className="text-sm text-muted-foreground">Track your water intake</p>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <Activity className="h-10 w-10 text-thrive-green mb-2" />
                <h3 className="font-medium">Movement</h3>
                <p className="text-sm text-muted-foreground">30 mins daily with outdoor time</p>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <PhoneOff className="h-10 w-10 text-thrive-green mb-2" />
                <h3 className="font-medium">Digital Detox</h3>
                <p className="text-sm text-muted-foreground">Daily screen-free time</p>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <CheckCircle2 className="h-10 w-10 text-thrive-green mb-2" />
                <h3 className="font-medium">Accountability</h3>
                <p className="text-sm text-muted-foreground">Track progress & celebrate wins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-thrive-blue text-white flex items-center justify-center flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-medium">Set Your Start Date</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose when you want to begin your 45-day journey to better habits.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-thrive-blue text-white flex items-center justify-center flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-medium">Complete Daily Tasks</h3>
                  <p className="text-sm text-muted-foreground">
                    Each day, work through 6 simple activities designed to improve your wellbeing.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-thrive-blue text-white flex items-center justify-center flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-medium">Track Your Progress</h3>
                  <p className="text-sm text-muted-foreground">
                    Watch your streak grow and see how your habits improve over time.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-thrive-blue text-white flex items-center justify-center flex-shrink-0">
                  4
                </div>
                <div>
                  <h3 className="font-medium">Journal Your Experience</h3>
                  <p className="text-sm text-muted-foreground">
                    Reflect on your journey with guided prompts and free-form entries.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-thrive-blue text-white flex items-center justify-center flex-shrink-0">
                  5
                </div>
                <div>
                  <h3 className="font-medium">Build Lifelong Habits</h3>
                  <p className="text-sm text-muted-foreground">
                    After 45 days, these practices will become part of your routine.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>{step === 1 ? "Start Your Journey" : "Choose Your Focus"}</CardTitle>
            </CardHeader>
            <CardContent>
              {step === 1 ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">When would you like to start?</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : "Select a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    Your 45-day challenge will end on {startDate ? format(new Date(startDate.getTime() + 44 * 24 * 60 * 60 * 1000), "MMMM d, yyyy") : "..."}
                  </p>
                  
                  <Button className="w-full mt-4" onClick={() => setStep(2)}>
                    Next: Choose Focus Area
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      What would you like to focus on during this challenge?
                    </label>
                    <Select value={focusArea} onValueChange={setFocusArea}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a focus area" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="balance">Overall Balance</SelectItem>
                        <SelectItem value="mental">Mental Health</SelectItem>
                        <SelectItem value="physical">Physical Fitness</SelectItem>
                        <SelectItem value="stress">Stress Management</SelectItem>
                        <SelectItem value="sleep">Sleep Improvement</SelectItem>
                        <SelectItem value="focus">Focus & Productivity</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    We'll customize some of your tasks and prompts based on your focus area.
                  </p>
                  
                  <div className="flex space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button className="flex-1" onClick={handleStart}>
                      Begin 45-Day Challenge
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
