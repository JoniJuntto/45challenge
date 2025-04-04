
import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Save, PlusCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface JournalEntry {
  id: string;
  date: Date;
  mood: string;
  content: string;
}

const JournalPage = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [mood, setMood] = useState("neutral");
  const [content, setContent] = useState("");
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  const handleSaveEntry = () => {
    if (content.trim().length === 0) {
      toast.error("Please write something in your journal entry");
      return;
    }

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date,
      mood,
      content,
    };

    setEntries([newEntry, ...entries]);
    toast.success("Journal entry saved!");
    
    // Reset form for a new entry
    setContent("");
    setDate(new Date());
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">Journal</h1>
      <p className="text-muted-foreground mb-8">
        Reflect on your journey and track your thoughts
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>New Journal Entry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1 block">Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Select a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(date) => date && setDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1 block">Mood</label>
                  <Select value={mood} onValueChange={setMood}>
                    <SelectTrigger>
                      <SelectValue placeholder="How are you feeling?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="great">Great 😁</SelectItem>
                      <SelectItem value="good">Good 🙂</SelectItem>
                      <SelectItem value="neutral">Neutral 😐</SelectItem>
                      <SelectItem value="tired">Tired 😴</SelectItem>
                      <SelectItem value="stressed">Stressed 😓</SelectItem>
                      <SelectItem value="down">Down 😞</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Journal Entry</label>
                <Textarea
                  placeholder="Write your thoughts, reflections, or what you're grateful for today..."
                  className="min-h-[200px]"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveEntry} className="ml-auto">
                <Save className="mr-2 h-4 w-4" />
                Save Entry
              </Button>
            </CardFooter>
          </Card>

          {entries.length > 0 && (
            <div className="mt-8 space-y-6">
              <h2 className="text-xl font-semibold">Previous Entries</h2>
              {entries.map((entry) => (
                <Card key={entry.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{format(entry.date, "MMMM d, yyyy")}</CardTitle>
                      <span className="text-sm">Mood: {entry.mood}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{entry.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Journaling Prompts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Use these prompts to inspire your daily reflection
              </p>
              
              <div className="space-y-3">
                <div className="p-3 bg-accent rounded-md">
                  <p className="font-medium">What are three things you're grateful for today?</p>
                </div>
                <div className="p-3 bg-accent rounded-md">
                  <p className="font-medium">What was challenging today and how did you overcome it?</p>
                </div>
                <div className="p-3 bg-accent rounded-md">
                  <p className="font-medium">Where did you find moments of calm and balance today?</p>
                </div>
                <div className="p-3 bg-accent rounded-md">
                  <p className="font-medium">What made you smile or laugh today?</p>
                </div>
                <div className="p-3 bg-accent rounded-md">
                  <p className="font-medium">How did your body feel during your movement activity?</p>
                </div>
              </div>

              <Button variant="outline" className="w-full mt-4">
                <PlusCircle className="mr-2 h-4 w-4" />
                Get More Prompts
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JournalPage;
