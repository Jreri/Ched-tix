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
import { generateVerificationCode } from "@/utils/auth";
import { Separator } from "@/components/ui/separator";
import { UserPlus } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

// Registration schema
const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const RegisterPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "password",
      confirmPassword: "password",
    },
  });

  const handleSocialLogin = (provider: string) => {
    toast({
      title: `${provider} login`,
      description: `${provider} login is not yet implemented`,
    });
  };

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    setIsSubmitting(true);
    try {
      const customerProfile = {
        fullName: values.fullName,
        email: values.email,
        isAdmin: false,
        isEmailVerified: false,
        customerId: `CUST/${Math.floor(Math.random() * 100000)}`,
        phone: `0801${Math.floor(Math.random() * 10000000)}`,
        address: "",
        bio: "",
      };

      // Save customer info
      localStorage.setItem("customerProfile", JSON.stringify(customerProfile));
      localStorage.setItem("userEmail", values.email);
      localStorage.setItem("isAdmin", "false");

      const verificationCode = generateVerificationCode();
      localStorage.setItem("verificationCode", verificationCode);
      localStorage.setItem("verificationEmail", values.email);
      localStorage.setItem("verificationIsAdmin", "false");

      toast({
        title: "Registration successful",
        description: "Please verify your email to continue.",
      });

      navigate(`/verify-email?email=${encodeURIComponent(values.email)}&isAdmin=false`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error instanceof Error ? error.message : "There was a problem creating your account.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-4 animate-fade-in">
      
      {/* Background gradient circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/3 -top-10 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute right-1/3 -bottom-10 w-72 h-72 bg-indigo-300/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      </div>

      <Card className="w-full max-w-md relative backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white dark:border-gray-800 shadow-lg animate-scale-in p-4">
        
        <div className="absolute -top-3 -right-3 w-16 h-16 flex items-center justify-center rounded-full bg-primary/10">
          <UserPlus className="h-7 w-7 text-primary"/>
        </div>

        <CardHeader>
          <div className="absolute right-6 top-6">
            <ThemeToggle />
          </div>
          <CardTitle className="text-2xl text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600 pt-4">
            Create a Customer Account
          </CardTitle>
          <CardDescription className="text-center dark:text-gray-300">
            Register to access products and services
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              {/* Full Name */}
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-gray-200">Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="John Doe" className="border-primary/20 focus:border-primary/50 bg-white/50 dark:bg-gray-800/50 dark:text-gray-100"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-gray-200">Email</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="youremail@example.com" className="border-primary/20 focus:border-primary/50 bg-white/50 dark:bg-gray-800/50 dark:text-gray-100"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-gray-200">Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} showPasswordToggle className="border-primary/20 focus:border-primary/50 bg-white/50 dark:bg-gray-800/50 dark:text-gray-100"/>
                    </FormControl>
                    <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">Default password: password</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm Password */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-gray-200">Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} showPasswordToggle className="border-primary/20 focus:border-primary/50 bg-white/50 dark:bg-gray-800/50 dark:text-gray-100"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full group hover:scale-[1.02] transition-all" disabled={isSubmitting}>
                {isSubmitting ? "Registering..." : <>
                  <UserPlus className="mr-2 h-4 w-4 group-hover:animate-pulse"/> Register
                </>}
              </Button>
            </form>
          </Form>

          {/* Social Login */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full"/>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-900 px-2 text-muted-foreground dark:text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" aria-label="Sign up with Google" onClick={() => handleSocialLogin("Google")} className="bg-white dark:bg-gray-800 hover:bg-slate-50 dark:hover:bg-gray-700 hover:scale-[1.02] transition-all">
              Google
            </Button>

            <Button variant="outline" aria-label="Sign up with Microsoft" onClick={() => handleSocialLogin("Microsoft")} className="bg-white dark:bg-gray-800 hover:bg-slate-50 dark:hover:bg-gray-700 hover:scale-[1.02] transition-all">
              Microsoft
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground dark:text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline hover:text-indigo-600 transition-all dark:text-primary/90">
              Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegisterPage;
