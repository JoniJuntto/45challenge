
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useChallenge } from "@/contexts/ChallengeContext";

export const AuthButtons = () => {
  const navigate = useNavigate();
  const { user } = useChallenge();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Error logging out");
    }
  };

  const handleLogin = () => {
    navigate("/auth");
  };

  if (user) {
    return (
      <div className="flex flex-col gap-2 mt-2">
        <div className="px-3 py-2">
          <p className="text-sm text-muted-foreground truncate">
            Signed in as:
          </p>
          <p className="text-sm font-medium truncate">{user.email}</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="w-full justify-start mt-2"
      onClick={handleLogin}
    >
      <LogIn className="mr-2 h-4 w-4" />
      Sign in
    </Button>
  );
};
