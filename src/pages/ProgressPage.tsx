
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Activity, Calendar, TrendingUp } from "lucide-react";
import { useChallenge } from "@/contexts/ChallengeContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const ProgressPage = () => {
  const { challengeState, isLoading, startChallenge } = useChallenge();
  
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto animate-fade-in space-y-8">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-8 w-1/2" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-36 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  
  if (!challengeState.isStarted) {
    return (
      <div className="max-w-7xl mx-auto animate-fade-in text-center">
        <h1 className="text-3xl font-bold mb-4">Start Your Challenge to Track Progress</h1>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          Complete all 6 tasks every day for 45 days straight to build discipline and habits. 
          Your progress will be displayed here once you start.
        </p>
        <Button size="lg" onClick={startChallenge}>
          Start Challenge
        </Button>
      </div>
    );
  }

  // Get days completed
  const daysCompleted = Object.values(challengeState.dailyProgress).filter(day => day.completed).length;
  
  // Calculate percentage complete
  const percentComplete = Math.round((daysCompleted / 45) * 100);
  
  // Create weekly data for the chart
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const weeklyData = weekDays.map((day, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (dayOfWeek - index + 7) % 7);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayProgress = challengeState.dailyProgress[dateStr];
    
    return {
      day,
      tasks: dayProgress ? dayProgress.tasks.filter(t => t.completed).length : 0,
      total: 6
    };
  });
  
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const daysInMonth = new Date(2025, 4, 0).getDate(); // April 2025
  
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  // Get days that had all tasks completed
  const completedDays = Object.entries(challengeState.dailyProgress)
    .filter(([_, dayData]) => dayData.completed)
    .map(([date, _]) => new Date(date).getDate());

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">Your Progress</h1>
      <p className="text-muted-foreground mb-8">Track your journey to a better balance</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Days Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-thrive-blue" />
              <span className="text-2xl font-bold">{daysCompleted}/45</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{percentComplete}% of challenge complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Activity className="mr-2 h-4 w-4 text-thrive-green" />
              <span className="text-2xl font-bold">{challengeState.streakDays} days</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Keep going!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Task Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BarChart className="mr-2 h-4 w-4 text-thrive-blue" />
              <span className="text-2xl font-bold">
                {Object.values(challengeState.dailyProgress).length === 0 
                  ? "0%" 
                  : Math.round((Object.values(challengeState.dailyProgress).reduce((acc, day) => 
                      acc + (day.tasks.filter(t => t.completed).length / day.tasks.length), 0) / 
                      Object.values(challengeState.dailyProgress).length) * 100) + "%"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Daily task average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Thrive Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingUp className="mr-2 h-4 w-4 text-thrive-green" />
              <span className="text-2xl font-bold">{Math.round(daysCompleted * 5 + challengeState.streakDays * 3)}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Keep building your score!</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="weekly">
        <TabsList className="mb-4">
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="complete">Full Challenge</TabsTrigger>
        </TabsList>
        
        <TabsContent value="weekly">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-end justify-between p-4">
                {weeklyData.map((day, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="flex flex-col items-center justify-end h-[200px] mb-2">
                      <div className="relative w-14 bg-muted rounded-t-md" style={{
                        height: `${(day.tasks / day.total) * 100}%`,
                        minHeight: "10%"
                      }}>
                        <div className="absolute bottom-0 w-full bg-primary rounded-t-md" style={{
                          height: `${(day.tasks / day.total) * 100}%`
                        }}></div>
                      </div>
                    </div>
                    <span className="text-xs font-medium">{day.day}</span>
                    <span className="text-xs text-muted-foreground">{day.tasks}/{day.total}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>{currentMonth} Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div key={i} className="text-center font-medium text-sm py-2">
                    {day}
                  </div>
                ))}
                
                {/* Add empty cells for days of the week before the 1st */}
                {Array.from({ length: 2 }, (_, i) => (
                  <div key={`empty-${i}`} className="h-12"></div>
                ))}
                
                {calendarDays.map((day) => {
                  const date = new Date(2025, 3, day); // April 2025
                  const dateStr = date.toISOString().split('T')[0];
                  const isToday = dateStr === new Date().toISOString().split('T')[0];
                  const isDayCompleted = challengeState.dailyProgress[dateStr]?.completed;
                  
                  return (
                    <div 
                      key={day} 
                      className={`h-12 flex items-center justify-center rounded-md ${
                        isDayCompleted 
                          ? 'bg-thrive-green/20 text-thrive-green-dark font-medium' 
                          : isToday 
                            ? 'bg-thrive-blue/20 text-thrive-blue-dark font-medium border-2 border-thrive-blue' 
                            : day < new Date().getDate() && !isDayCompleted
                              ? 'bg-red-500/10 text-red-500' 
                              : ''
                      }`}
                    >
                      {day}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="complete">
          <Card>
            <CardHeader>
              <CardTitle>45-Day Challenge Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-9 gap-2">
                {Array.from({ length: 45 }, (_, i) => {
                  const day = i + 1;
                  const isDayCompleted = Object.values(challengeState.dailyProgress)
                    .some(dayData => dayData.day === day && dayData.completed);
                  const isCurrentDay = day === challengeState.currentDay;
                  
                  return (
                    <div
                      key={i}
                      className={`h-12 flex items-center justify-center rounded-md ${
                        isDayCompleted 
                          ? 'bg-thrive-green/20 text-thrive-green-dark font-medium' 
                          : isCurrentDay 
                            ? 'bg-thrive-blue/20 text-thrive-blue-dark font-medium border-2 border-thrive-blue' 
                            : day < challengeState.currentDay 
                              ? 'bg-red-500/10 text-red-500' 
                              : 'bg-muted/50'
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgressPage;
