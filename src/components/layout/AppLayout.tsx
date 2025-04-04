
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";
import { AuthButtons } from "../auth/AuthButtons";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const isMobile = useMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Close sidebar when switching from mobile to desktop
    if (!isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      {!isMobile && (
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
          <Sidebar>
            <AuthButtons />
          </Sidebar>
        </div>
      )}

      {/* Mobile sidebar (Sheet) */}
      {isMobile && (
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="md:hidden fixed left-4 top-4 z-40"
              size="icon"
            >
              <Menu />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <Sidebar>
              <AuthButtons />
            </Sidebar>
          </SheetContent>
        </Sheet>
      )}

      {/* Main content */}
      <div className={`flex flex-col flex-1 ${!isMobile ? "md:pl-64" : ""}`}>
        <main className="flex-1 p-6 sm:p-10">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
