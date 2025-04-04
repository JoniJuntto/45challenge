
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  CheckSquare, 
  BarChart, 
  FileText, 
  Settings, 
  Menu, 
  Home
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Sidebar = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  const location = useLocation();

  const navItems = [
    { 
      name: "Home", 
      path: "/", 
      icon: <Home className="w-5 h-5" /> 
    },
    { 
      name: "Daily Tasks", 
      path: "/tasks", 
      icon: <CheckSquare className="w-5 h-5" /> 
    },
    { 
      name: "Progress", 
      path: "/progress", 
      icon: <BarChart className="w-5 h-5" /> 
    },
    { 
      name: "Calendar", 
      path: "/calendar", 
      icon: <Calendar className="w-5 h-5" /> 
    },
    { 
      name: "Journal", 
      path: "/journal", 
      icon: <FileText className="w-5 h-5" /> 
    },
    { 
      name: "Settings", 
      path: "/settings", 
      icon: <Settings className="w-5 h-5" /> 
    },
  ];

  return (
    <aside className={cn(
      "bg-card border-r border-border transition-all duration-300 z-10",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex flex-col h-full p-4">
        <div className="flex items-center justify-between mb-8">
          {!collapsed && (
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-md bg-thrive-blue flex items-center justify-center mr-2">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <h1 className="text-xl font-bold">Thrive45</h1>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <nav className="space-y-2 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                location.pathname === item.path
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted",
                collapsed && "justify-center"
              )}
            >
              {item.icon}
              {!collapsed && <span className="ml-3">{item.name}</span>}
            </Link>
          ))}
        </nav>

        <div className="pt-4 mt-auto border-t border-border">
          <div className={cn(
            "flex items-center",
            collapsed ? "justify-center" : "px-3"
          )}>
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <span className="text-xs font-medium">UI</span>
            </div>
            {!collapsed && (
              <div className="ml-3">
                <p className="text-sm font-medium">User</p>
                <p className="text-xs text-muted-foreground">Day 1 of 45</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
