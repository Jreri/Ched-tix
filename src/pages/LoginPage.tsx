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
import { handleLogin, isValidAdminEmail } from "@/utils/auth";
import { Separator } from "@/components/ui/separator";
import { LogIn, UserRound } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

// Login form schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const LoginPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleEmailChange = (email: string) => {
    if (email) setIsAdminLogin(isValidAdminEmail(email));
  };

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      setIsSubmitting(true);
      // Simulate login delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      handleLogin(values.email, values.password, isAdminLogin);

      toast({
        title: "Login successful",
        description: "Welcome back!",
      });

      navigate(isAdminLogin ? "/admin/dashboard" : "/events");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error instanceof Error ? error.message : "Please check your credentials and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    toast({
      title: `${provider} login`,
      description: `${provider} login is not yet implemented`,
    });
  };

  const handleForgotPassword = () => navigate("/forgot-password");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-4 animate-fade-in">
      <div className="absolute top-4 right-4 z-10"><ThemeToggle /></div>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 -top-10 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute right-1/4 -bottom-10 w-72 h-72 bg-indigo-300/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      </div>

      <Card className="w-full max-w-md relative backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white dark:border-gray-800 shadow-lg animate-scale-in">
        <div className="absolute -top-3 -right-3">
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10">
            <UserRound className="h-7 w-7 text-primary"/>
          </div>
        </div>
        <CardHeader className="relative">
          <CardTitle className="text-2xl text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600 pt-4">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center dark:text-gray-300">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
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
                        placeholder="youremail@calebuniversity.edu.ng"
                        {...field}
                        className="border-primary/20 focus:border-primary/50 bg-white/50 dark:bg-gray-800/50 dark:text-gray-100"
                        onChange={(e) => {
                          field.onChange(e);
                          handleEmailChange(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                    {isAdminLogin && (
                      <p className="text-xs text-primary animate-fade-in">
                        Admin login detected
                      </p>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="transition-all hover:scale-[1.01]">
                    <FormLabel className="dark:text-gray-200">Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={isAdminLogin ? "Admin password" : "Default password: password"}
                        {...field}
                        className="border-primary/20 focus:border-primary/50 bg-white/50 dark:bg-gray-800/50 dark:text-gray-100"
                      />
                    </FormControl>
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="px-0 text-xs text-primary dark:text-primary/90"
                        onClick={handleForgotPassword}
                      >
                        Forgot password?
                      </Button>
                    </div>
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
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    Logging in...
                  </div>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4 group-hover:animate-pulse" />
                    Login
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-900 px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="bg-white dark:bg-gray-800 hover:bg-slate-50 dark:hover:bg-gray-700 hover:scale-[1.02] transition-all"
              onClick={() => handleSocialLogin("Google")}
            >
              Google
            </Button>
            <Button
              variant="outline"
              className="bg-white dark:bg-gray-800 hover:bg-slate-50 dark:hover:bg-gray-700 hover:scale-[1.02] transition-all"
              onClick={() => handleSocialLogin("Microsoft")}
            >
              Microsoft
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground dark:text-gray-400">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-primary hover:underline hover:text-indigo-600 transition-all dark:text-primary/90"
            >
              Register
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
