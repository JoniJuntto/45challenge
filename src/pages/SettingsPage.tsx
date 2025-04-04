import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { useChallenge } from "@/contexts/ChallengeContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const SettingsPage = () => {
  const { theme, setTheme } = useTheme();
  const { challengeState, user, isLoading, resetChallenge } = useChallenge();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Logged out successfully');
      navigate('/'); // Navigate to home after logout
    } catch (error: unknown) {
      let errorMessage = "Logout failed";
      if (error instanceof Error) {
        errorMessage = `Logout failed: ${error.message}`;
      } else if (typeof error === 'string') {
        errorMessage = `Logout failed: ${error}`;
      }
      toast.error(errorMessage);
    }
  };

  const handleDeleteAccount = async () => {
    // NOTE: This requires a backend Supabase function `delete_user_account` 
    // which handles deleting the user from auth and cascading deletes in other tables.
    // Calling this without the backend function will likely fail or leave orphaned data.
    toast.info("Account deletion initiated. This requires backend setup.");
    try {
      // Placeholder for the actual Supabase function call
      // const { error } = await supabase.rpc('delete_user_account');
      // if (error) throw error;
      // toast.success('Account deleted successfully.');
      // navigate('/'); // Navigate away after deletion
      console.warn("Supabase function 'delete_user_account' needs to be implemented for full functionality.");
    } catch (error: unknown) {
      let errorMessage = "Account deletion failed";
      if (error instanceof Error) {
        errorMessage = `Account deletion failed: ${error.message}`;
      } else if (typeof error === 'string') {
        errorMessage = `Account deletion failed: ${error}`;
      }
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <div className="space-y-6">
          <Card>
            <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
            <CardContent><Skeleton className="h-10 w-full" /></CardContent>
          </Card>
          <Card>
            <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
            <CardContent><Skeleton className="h-10 w-full" /></CardContent>
          </Card>
           <Card>
            <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
            <CardContent><Skeleton className="h-10 w-full" /></CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>Select your preferred application theme.</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={theme} onValueChange={setTheme}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="light" id="light" />
              <Label htmlFor="light">Light</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dark" id="dark" />
              <Label htmlFor="dark">Dark</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="system" id="system" />
              <Label htmlFor="system">System</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Challenge Settings */}
      {challengeState.isStarted && (
        <Card>
          <CardHeader>
            <CardTitle>Challenge</CardTitle>
            <CardDescription>Manage your current Thrive45 challenge.</CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Reset Challenge</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. Resetting will end your current challenge 
                    and clear your progress streak. You can start a new challenge afterwards.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={resetChallenge} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Yes, Reset Challenge
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      )}

      {/* Account Settings */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Manage your account settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <p id="email" className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline" onClick={handleLogout}>Log Out</Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete Account</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Account?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This is permanent and cannot be undone. All your challenge data, 
                      progress, and journal entries will be lost.
                      <br /><br />
                      <strong className="text-destructive">Important:</strong> Full account deletion requires backend setup. 
                      Clicking 'Delete' now will only show a confirmation.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete My Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SettingsPage; 