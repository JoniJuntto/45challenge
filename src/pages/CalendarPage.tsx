import { Calendar } from "@/components/ui/calendar";
import { useChallenge } from "@/contexts/ChallengeContext";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const CalendarPage = () => {
  const { challengeState, isLoading } = useChallenge();
  const [completedDays, setCompletedDays] = useState<Date[]>([]);

  useEffect(() => {
    if (challengeState.dailyProgress) {
      const completedDates = Object.values(challengeState.dailyProgress)
        .filter(day => day.completed)
        .map(day => {
          // Parse the date string, ensuring correct timezone handling
          const [year, month, dayOfMonth] = day.date.split('-').map(Number);
          // Create date in UTC to avoid timezone shifts affecting the date
          return new Date(Date.UTC(year, month - 1, dayOfMonth));
        });
      setCompletedDays(completedDates);
    }
  }, [challengeState.dailyProgress]);

  if (isLoading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-4">Calendar</h1>
        <Skeleton className="h-[350px] w-full max-w-sm rounded-md" />
      </div>
    );
  }

  if (!challengeState.isStarted) {
     return (
      <div>
        <h1 className="text-3xl font-bold mb-4">Calendar</h1>
        <p className="text-muted-foreground">Start the challenge to see your calendar progress.</p>
        {/* Optionally add a button to start the challenge here */}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Challenge Calendar</h1>
      <p className="text-muted-foreground mb-6">
        Highlighted days indicate all daily tasks were completed.
      </p>
      <Calendar
        mode="single" // Keep single mode for basic display
        modifiers={{ completed: completedDays }}
        modifiersStyles={{
          completed: {
            color: 'hsl(var(--primary-foreground))', // Use primary foreground for text
            backgroundColor: 'hsl(var(--primary))', // Use primary color for background
            borderRadius: '50%', // Make it a circle
          },
        }}
        className="rounded-md border max-w-sm" // Style the container
        showOutsideDays={false} // Only show days of the current month
      />
    </div>
  );
};

export default CalendarPage; 