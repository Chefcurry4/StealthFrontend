import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { GraduationCap, Loader2, ArrowLeft, Mail, CheckCircle2, Sparkles, RefreshCw, KeyRound, Camera, Building, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUniversities } from "@/hooks/useUniversities";
import UserFlashcard from "@/components/UserFlashcard";

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
  const [isResending, setIsResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [activeAuthTab, setActiveAuthTab] = useState("signin");
  const [signUpData, setSignUpData] = useState({ 
    email: "", 
    password: "", 
    username: "",
    universityId: "",
    studentLevel: null as 'Bachelor' | 'Master' | null,
  });
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [signInData, setSignInData] = useState({ email: "", password: "" });
  const [resetEmail, setResetEmail] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [resetConfirmedEmail, setResetConfirmedEmail] = useState("");
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [confirmedEmail, setConfirmedEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { signUp, signIn, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: universities } = useUniversities();

  // Get selected university details for flashcard
  const selectedUniversity = universities?.find(u => u.uuid === signUpData.universityId);

  // Countdown timer effect
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (profilePicturePreview) {
        URL.revokeObjectURL(profilePicturePreview);
      }
    };
  }, [profilePicturePreview]);

  // Redirect if already logged in
  if (user) {
    navigate("/");
    return null;
  }

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setProfilePictureFile(file);
    const previewUrl = URL.createObjectURL(file);
    setProfilePicturePreview(previewUrl);
  };

  const uploadProfilePicture = async (userId: string): Promise<string | null> => {
    if (!profilePictureFile) return null;

    const fileExt = profilePictureFile.name.split('.').pop();
    const fileName = `${userId}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-pictures')
      .upload(filePath, profilePictureFile, { upsert: true });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      const validated = signUpSchema.parse(signUpData);
      setIsLoading(true);

      const { error, data } = await signUp(validated.email, validated.password, validated.username);

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

      // If we have additional profile data, update the user profile
      if (data?.user && (signUpData.universityId || signUpData.studentLevel || profilePictureFile)) {
        let profilePhotoUrl: string | null = null;
        
        // Upload profile picture if provided
        if (profilePictureFile) {
          profilePhotoUrl = await uploadProfilePicture(data.user.id);
        }

        // Update user profile with additional data
        const updateData: Record<string, unknown> = {};
        if (signUpData.universityId) updateData.university_id = signUpData.universityId;
        if (signUpData.studentLevel) updateData.student_level = signUpData.studentLevel;
        if (profilePhotoUrl) updateData.profile_photo_url = profilePhotoUrl;

        if (Object.keys(updateData).length > 0) {
          await supabase
            .from("Users(US)")
            .update(updateData)
            .eq("id", data.user.id);
        }
      }

      // Show email confirmation screen
      setConfirmedEmail(validated.email);
      setShowEmailConfirmation(true);
      setSignUpData({ email: "", password: "", username: "", universityId: "", studentLevel: null });
      setProfilePictureFile(null);
      setProfilePicturePreview(null);
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

      // Show reset confirmation screen
      setResetConfirmedEmail(validated.email);
      setShowResetConfirmation(true);
      setResetEmail("");
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

  const handleResendVerificationEmail = async () => {
    if (!confirmedEmail || resendCountdown > 0) return;
    
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: confirmedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        toast({
          title: "Failed to resend",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Email sent!",
        description: "A new verification link has been sent to your email.",
      });
      
      // Start countdown
      setResendCountdown(30);
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
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
                onClick={handleResendVerificationEmail}
                disabled={isResending || resendCountdown > 0}
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : resendCountdown > 0 ? (
                  `Resend in ${resendCountdown}s`
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resend verification email
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setShowEmailConfirmation(false);
                  setConfirmedEmail("");
                  setResendCountdown(0);
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

  // Password reset confirmation screen with fluid glass aesthetic
  if (showResetConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden">
        {/* Animated gradient background blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-accent/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-secondary/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Glass card */}
        <Card className="w-full max-w-md relative z-10 backdrop-blur-xl bg-background/60 border-border/50 shadow-2xl">
          <CardHeader className="text-center pb-2">
            {/* Animated key icon with glow */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-accent/40 rounded-full blur-xl animate-pulse" />
                <div className="relative p-5 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full border border-accent/30 backdrop-blur-sm">
                  <KeyRound className="h-10 w-10 text-accent" />
                </div>
                {/* Floating sparkles */}
                <Sparkles className="absolute -top-2 -left-2 h-5 w-5 text-accent/70 animate-bounce" style={{ animationDelay: '0.5s' }} />
                <Sparkles className="absolute -bottom-1 -right-2 h-4 w-4 text-primary/70 animate-bounce" style={{ animationDelay: '1s' }} />
              </div>
            </div>
            
            <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Reset link sent
            </CardTitle>
          </CardHeader>
          
          <CardContent className="text-center space-y-6">
            <div className="space-y-3">
              <p className="text-muted-foreground">
                We've sent a password reset link to
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
                <Mail className="h-4 w-4 text-accent" />
                <span className="font-medium text-foreground">{resetConfirmedEmail}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-primary/20 border border-border/50 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                <div className="text-left text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Check your inbox</p>
                  <p>Click the link in your email to create a new password. The link will expire in 24 hours.</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <p className="text-xs text-muted-foreground">
                Didn't receive the email? Check your spam folder.
              </p>
              <Button
                variant="outline"
                className="w-full backdrop-blur-sm bg-background/50"
                onClick={() => {
                  setShowResetConfirmation(false);
                  setShowResetPassword(true);
                  setResetEmail(resetConfirmedEmail);
                }}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try a different email
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setShowResetConfirmation(false);
                  setResetConfirmedEmail("");
                }}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Password reset form with fluid glass aesthetic
  if (showResetPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden">
        {/* Animated gradient background blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-accent/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-secondary/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Glass card */}
        <Card className="w-full max-w-md relative z-10 backdrop-blur-xl bg-background/60 border-border/50 shadow-2xl">
          <CardHeader className="text-center pb-2">
            {/* Animated key icon with glow */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-accent/40 rounded-full blur-xl animate-pulse" />
                <div className="relative p-5 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full border border-accent/30 backdrop-blur-sm">
                  <KeyRound className="h-10 w-10 text-accent" />
                </div>
                {/* Floating sparkles */}
                <Sparkles className="absolute -top-2 -left-2 h-5 w-5 text-accent/70 animate-bounce" style={{ animationDelay: '0.5s' }} />
                <Sparkles className="absolute -bottom-1 -right-2 h-4 w-4 text-primary/70 animate-bounce" style={{ animationDelay: '1s' }} />
              </div>
            </div>
            
            <CardTitle className="text-2xl font-semibold">Reset Password</CardTitle>
            <CardDescription className="text-muted-foreground">
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
                  className={`backdrop-blur-sm bg-background/50 ${errors.email ? "border-destructive" : ""}`}
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

  // Main auth form with fluid glass styling
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Animated gradient background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-secondary/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-primary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />
      </div>

      {/* Content wrapper */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col md:flex-row items-center gap-8">
        {/* Auth card */}
        <Card className="w-full max-w-md backdrop-blur-xl bg-background/60 border-border/50 shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/40 rounded-full blur-xl animate-pulse" />
                <div className="relative p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full border border-primary/30 backdrop-blur-sm">
                  <GraduationCap className="h-8 w-8 text-primary" />
                </div>
              </div>
            </div>
            <CardTitle className="text-2xl">Students Hub</CardTitle>
            <CardDescription>
              Join to save courses, labs, and build your learning agreement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full" onValueChange={(v) => setActiveAuthTab(v)}>
              <TabsList className="grid w-full grid-cols-2 bg-background/50 backdrop-blur-sm">
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
                      className={`backdrop-blur-sm bg-background/50 ${errors.email ? "border-destructive" : ""}`}
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
                      className={`backdrop-blur-sm bg-background/50 ${errors.password ? "border-destructive" : ""}`}
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
                  {/* Profile Picture Upload */}
                  <div className="flex justify-center">
                    <div 
                      className="relative cursor-pointer group"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-dashed border-primary/40 flex items-center justify-center overflow-hidden transition-all group-hover:border-primary/60">
                        {profilePicturePreview ? (
                          <img src={profilePicturePreview} alt="Preview" className="h-full w-full object-cover" />
                        ) : (
                          <Camera className="h-8 w-8 text-primary/60 group-hover:text-primary/80 transition-colors" />
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-primary text-primary-foreground">
                        <Upload className="h-3 w-3" />
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfilePictureChange}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">Add a profile photo (optional)</p>

                  <div className="space-y-2">
                    <Label htmlFor="signup-username">Username</Label>
                    <Input
                      id="signup-username"
                      type="text"
                      placeholder="johndoe"
                      value={signUpData.username}
                      onChange={(e) => setSignUpData({ ...signUpData, username: e.target.value })}
                      className={`backdrop-blur-sm bg-background/50 ${errors.username ? "border-destructive" : ""}`}
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
                      className={`backdrop-blur-sm bg-background/50 ${errors.email ? "border-destructive" : ""}`}
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
                      className={`backdrop-blur-sm bg-background/50 ${errors.password ? "border-destructive" : ""}`}
                    />
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>

                  {/* University Select */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      University (optional)
                    </Label>
                    <Select
                      value={signUpData.universityId}
                      onValueChange={(value) => setSignUpData({ ...signUpData, universityId: value })}
                    >
                      <SelectTrigger className="backdrop-blur-sm bg-background/50">
                        <SelectValue placeholder="Select your university" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {universities?.map((uni) => (
                          <SelectItem key={uni.uuid} value={uni.uuid}>
                            {uni.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Student Level Toggle */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Student Level (optional)
                    </Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={signUpData.studentLevel === 'Bachelor' ? 'default' : 'outline'}
                        className={`flex-1 ${signUpData.studentLevel === 'Bachelor' ? '' : 'backdrop-blur-sm bg-background/50'}`}
                        onClick={() => setSignUpData({ 
                          ...signUpData, 
                          studentLevel: signUpData.studentLevel === 'Bachelor' ? null : 'Bachelor' 
                        })}
                      >
                        Bachelor
                      </Button>
                      <Button
                        type="button"
                        variant={signUpData.studentLevel === 'Master' ? 'default' : 'outline'}
                        className={`flex-1 ${signUpData.studentLevel === 'Master' ? '' : 'backdrop-blur-sm bg-background/50'}`}
                        onClick={() => setSignUpData({ 
                          ...signUpData, 
                          studentLevel: signUpData.studentLevel === 'Master' ? null : 'Master' 
                        })}
                      >
                        Master
                      </Button>
                    </div>
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

        {/* User Flashcard Preview - only visible on signup tab and desktop */}
        {activeAuthTab === 'signup' && (
          <div className="hidden md:flex flex-col items-center justify-center gap-4">
            <p className="text-sm text-muted-foreground font-medium">Your Student Card Preview</p>
            <UserFlashcard
              username={signUpData.username || undefined}
              profilePhotoUrl={profilePicturePreview}
              universityName={selectedUniversity?.name}
              universityLogo={selectedUniversity?.logo_url}
              studentLevel={signUpData.studentLevel}
              isPreview
              isPulsating
              size="large"
            />
            <p className="text-xs text-muted-foreground text-center max-w-[240px]">
              This card updates as you fill in your details
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
