import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { isValidAdminEmail } from "@/utils/auth";
import { Mail, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Separator } from "@/components/ui/separator";

// Form schema
const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const ForgotPasswordPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof forgotPasswordSchema>) => {
    try {
      setIsSubmitting(true);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const isAdmin = isValidAdminEmail(values.email);
      
      setIsSubmitting(false);
      setIsSubmitted(true);
      
      toast({
        title: "Reset link sent",
        description: "Check your email for password reset instructions.",
      });
      
      // Store for demo purposes
      localStorage.setItem('passwordResetEmail', values.email);
      localStorage.setItem('passwordResetIsAdmin', isAdmin ? 'true' : 'false');
      
    } catch (error) {
      setIsSubmitting(false);
      toast({
        variant: "destructive",
        title: "Request failed",
        description: error instanceof Error ? error.message : "There was a problem with your request.",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-4 animate-fade-in">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 -top-10 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute right-1/4 -bottom-10 w-72 h-72 bg-indigo-300/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      </div>
      <Card className="w-full max-w-md relative backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white dark:border-gray-800 shadow-lg animate-scale-in">
        <div className="absolute -top-3 -right-3">
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-7 w-7 text-primary"/>
          </div>
        </div>
        <CardHeader className="relative">
          <div className="absolute right-0 top-0">
            <ThemeToggle />
          </div>
          <CardTitle className="text-2xl text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600">Reset Password</CardTitle>
          <CardDescription className="text-center dark:text-gray-300">
            {!isSubmitted 
              ? "Enter your email to receive a password reset link" 
              : "Check your inbox for further instructions"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isSubmitted ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="transition-all hover:scale-[1.01]">
                      <FormLabel className="dark:text-gray-200">Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="your.email@example.com" 
                          {...field} 
                          className="border-primary/20 focus:border-primary/50 bg-white/50 dark:bg-gray-800/50 dark:text-gray-100"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full group hover:scale-[1.02] transition-all"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4 group-hover:animate-pulse" />
                      Send Reset Link
                    </>
                  )}
                </Button>
              </form>
            </Form>
          ) : (
            <div className="text-center space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mx-auto max-w-[280px]">
                <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-800/30 mb-4">
                  <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-medium text-green-700 dark:text-green-400">Email Sent</h3>
                <p className="mt-2 text-sm text-green-600 dark:text-green-500">
                  We've sent a password reset link to your email address.
                </p>
              </div>
              
              <Button 
                variant="outline"
                className="mt-6 bg-white/50 dark:bg-gray-800/50"
                onClick={() => setIsSubmitted(false)}
              >
                Try a different email
              </Button>
            </div>
          )}
          
          <div className="relative mt-4">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground dark:text-gray-400">
            <Link to="/login" className="flex items-center justify-center gap-1 text-primary hover:underline hover:text-indigo-600 transition-all dark:text-primary/90">
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
