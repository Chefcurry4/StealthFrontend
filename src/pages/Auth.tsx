import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { GraduationCap, Loader2, ArrowLeft, Mail, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  username: z.string().min(3, "Username must be at least 3 characters").max(50, "Username too long"),
});

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [signUpData, setSignUpData] = useState({ email: "", password: "", username: "" });
  const [signInData, setSignInData] = useState({ email: "", password: "" });
  const [resetEmail, setResetEmail] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [confirmedEmail, setConfirmedEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { signUp, signIn, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (user) {
    navigate("/");
    return null;
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      const validated = signUpSchema.parse(signUpData);
      setIsLoading(true);

      const { error } = await signUp(validated.email, validated.password, validated.username);

      if (error) {
        if (error.message.includes("already registered")) {
          toast({
            title: "Account already exists",
            description: "Please sign in instead.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign up failed",
            description: error.message,
            variant: "destructive",
          });
        }
        return;
      }

      // Show email confirmation screen instead of just a toast
      setConfirmedEmail(validated.email);
      setShowEmailConfirmation(true);
      setSignUpData({ email: "", password: "", username: "" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0] as string] = issue.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      const validated = signInSchema.parse(signInData);
      setIsLoading(true);

      const { error } = await signIn(validated.email, validated.password);

      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message === "Invalid login credentials" 
            ? "Invalid email or password" 
            : error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      
      navigate("/");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0] as string] = issue.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      const validated = resetPasswordSchema.parse({ email: resetEmail });
      setIsLoading(true);

      const { error } = await supabase.auth.resetPasswordForEmail(validated.email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });

      if (error) {
        toast({
          title: "Reset failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Reset email sent",
        description: "Check your email for a password reset link.",
      });
      
      setResetEmail("");
      setShowResetPassword(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0] as string] = issue.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Email confirmation screen with fluid glass aesthetic
  if (showEmailConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden">
        {/* Animated gradient background blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-secondary/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Glass card */}
        <Card className="w-full max-w-md relative z-10 backdrop-blur-xl bg-background/60 border-border/50 shadow-2xl">
          <CardHeader className="text-center pb-2">
            {/* Animated mail icon with glow */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/40 rounded-full blur-xl animate-pulse" />
                <div className="relative p-5 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full border border-primary/30 backdrop-blur-sm">
                  <Mail className="h-10 w-10 text-primary" />
                </div>
                {/* Floating sparkles */}
                <Sparkles className="absolute -top-2 -right-2 h-5 w-5 text-primary/70 animate-bounce" style={{ animationDelay: '0.5s' }} />
                <Sparkles className="absolute -bottom-1 -left-2 h-4 w-4 text-accent/70 animate-bounce" style={{ animationDelay: '1s' }} />
              </div>
            </div>
            
            <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Check your email
            </CardTitle>
          </CardHeader>
          
          <CardContent className="text-center space-y-6">
            <div className="space-y-3">
              <p className="text-muted-foreground">
                We've sent a verification link to
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <Mail className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">{confirmedEmail}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-accent/30 border border-border/50 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-left text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Almost there!</p>
                  <p>Click the link in your email to activate your account and start exploring courses, labs, and universities.</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <p className="text-xs text-muted-foreground">
                Didn't receive the email? Check your spam folder or
              </p>
              <Button
                variant="outline"
                className="w-full backdrop-blur-sm bg-background/50"
                onClick={() => {
                  setShowEmailConfirmation(false);
                  setConfirmedEmail("");
                }}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign Up
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResetPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent/30 py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <CardDescription>
              Enter your email to receive a password reset link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="your@email.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setShowResetPassword(false)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-accent/30 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Students Hub</CardTitle>
          <CardDescription>
            Join to save courses, labs, and build your learning agreement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="your@email.com"
                    value={signInData.email}
                    onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••"
                    value={signInData.password}
                    onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                    className={errors.password ? "border-destructive" : ""}
                  />
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="link"
                  className="w-full text-sm text-muted-foreground"
                  onClick={() => setShowResetPassword(true)}
                >
                  Forgot your password?
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-username">Username</Label>
                  <Input
                    id="signup-username"
                    type="text"
                    placeholder="johndoe"
                    value={signUpData.username}
                    onChange={(e) => setSignUpData({ ...signUpData, username: e.target.value })}
                    className={errors.username ? "border-destructive" : ""}
                  />
                  {errors.username && <p className="text-sm text-destructive">{errors.username}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••"
                    value={signUpData.password}
                    onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                    className={errors.password ? "border-destructive" : ""}
                  />
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
