
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Index from "./pages/Index";
import TasksPage from "./pages/TasksPage";
import ProgressPage from "./pages/ProgressPage";
import JournalPage from "./pages/JournalPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout><Index /></AppLayout>} />
          <Route path="/tasks" element={<AppLayout><TasksPage /></AppLayout>} />
          <Route path="/progress" element={<AppLayout><ProgressPage /></AppLayout>} />
          <Route path="/journal" element={<AppLayout><JournalPage /></AppLayout>} />
          {/* Calendar and Settings pages to be implemented later */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
      <Sonner />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
