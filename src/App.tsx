
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import AppLayout from "./components/layout/AppLayout";
import Index from "./pages/Index";
import TasksPage from "./pages/TasksPage";
import ProgressPage from "./pages/ProgressPage";
import JournalPage from "./pages/JournalPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { ChallengeProvider } from "./contexts/ChallengeContext";

const queryClient = new QueryClient();

const App = () => {
  // Force dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
        <ChallengeProvider>
          <TooltipProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<AppLayout><Index /></AppLayout>} />
                <Route path="/tasks" element={<AppLayout><TasksPage /></AppLayout>} />
                <Route path="/progress" element={<AppLayout><ProgressPage /></AppLayout>} />
                <Route path="/journal" element={<AppLayout><JournalPage /></AppLayout>} />
                <Route path="/auth" element={<AuthPage />} />
                {/* Calendar and Settings pages to be implemented later */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </ChallengeProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
