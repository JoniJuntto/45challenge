
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Activity, Calendar, TrendingUp } from "lucide-react";

const ProgressPage = () => {
  // Mock data for the progress chart
  const weeklyData = [
    { day: "Mon", tasks: 5, total: 6 },
    { day: "Tue", tasks: 6, total: 6 },
    { day: "Wed", tasks: 4, total: 6 },
    { day: "Thu", tasks: 5, total: 6 },
    { day: "Fri", tasks: 3, total: 6 },
    { day: "Sat", tasks: 6, total: 6 },
    { day: "Sun", tasks: 5, total: 6 },
  ];

  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const daysInMonth = new Date(2025, 4, 0).getDate(); // April 2025
  
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  // Sample data - which days had all tasks completed
  const completedDays = [1, 3, 5, 7, 8, 10, 12, 14];

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
              <span className="text-2xl font-bold">1/45</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">2% of challenge complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Activity className="mr-2 h-4 w-4 text-thrive-green" />
              <span className="text-2xl font-bold">1 day</span>
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
              <span className="text-2xl font-bold">83%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">5/6 tasks on average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Thrive Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingUp className="mr-2 h-4 w-4 text-thrive-green" />
              <span className="text-2xl font-bold">42</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Great start!</p>
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
                
                {calendarDays.map((day) => (
                  <div 
                    key={day} 
                    className={`h-12 flex items-center justify-center rounded-md ${
                      completedDays.includes(day) 
                        ? 'bg-thrive-green/20 text-thrive-green-dark font-medium' 
                        : day === 1 
                          ? 'bg-thrive-blue/20 text-thrive-blue-dark font-medium border-2 border-thrive-blue' 
                          : day < 1 
                            ? 'bg-muted text-muted-foreground' 
                            : ''
                    }`}
                  >
                    {day}
                  </div>
                ))}
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
                {Array.from({ length: 45 }, (_, i) => (
                  <div
                    key={i}
                    className={`h-12 flex items-center justify-center rounded-md ${
                      i === 0 
                        ? 'bg-thrive-blue/20 text-thrive-blue-dark font-medium border-2 border-thrive-blue' 
                        : 'bg-muted/50'
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgressPage;
