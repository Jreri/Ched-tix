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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { handleLogin } from "@/utils/auth";
import "@/utils/auth";

// Configurable constants
const ADMIN_EMAILS = ['ikoroeric2@gmail.com', 'tpad663@gmail.com', 'honoureboiye@gmail.com', 'kingscaleb33@gmail.com'];
const CUSTOMER_PASSWORD = 'password';
const ADMIN_PASSWORD = 'Nwabueze1#';
const DEFAULT_PHONE_PREFIX = '0801';
const TICKET_TYPES = ['Regular', 'VIP', 'VVIP'];

// Login schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  isAdmin: z.boolean().default(false),
});

// Registration schema
const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address").refine(
    email => {
      if (email.includes("@admin")) {
        return ADMIN_EMAILS.includes(email);
      } else {
        return true; // any customer email allowed
      }
    },
    {
      message: "Please use a valid email or authorized admin email"
    }
  ),
  password: z.string().min(1, "Password is required"),
  confirmPassword: z.string(),
  isAdmin: z.boolean().default(false),
  phone: z.string().min(7, "Phone number is required"),
  ticketType: z.string().min(1, "Ticket type is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const LoginPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", isAdmin: false },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      if (values.isAdmin && !ADMIN_EMAILS.includes(values.email)) {
        throw new Error("Admin access restricted. Please use an authorized admin email.");
      }

      const isVerified = handleLogin(values.email, values.password, values.isAdmin);

      if (isVerified === true) {
        toast({ title: "Login successful", description: "Welcome back!" });
        navigate(values.isAdmin ? "/admin/dashboard" : "/events");
      } else {
        toast({ title: "Verification required", description: "Please verify your email address to continue." });
        navigate(`/verify-email?email=${encodeURIComponent(values.email)}&isAdmin=${values.isAdmin}`);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error instanceof Error ? error.message : "Please check your credentials and try again.",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Login</CardTitle>
          <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input placeholder="your.email@example.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder={form.watch("isAdmin") ? ADMIN_PASSWORD : CUSTOMER_PASSWORD} {...field} />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      {form.watch("isAdmin") ? `Admin password: ${ADMIN_PASSWORD}` : `Default password: ${CUSTOMER_PASSWORD}`}
                    </p>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isAdmin"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none"><FormLabel>Admin Login</FormLabel></div>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Login</Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            Don't have an account? <Link to="/register" className="text-primary hover:underline">Register</Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export const RegisterPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("customer");

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: activeTab === "admin" ? ADMIN_PASSWORD : CUSTOMER_PASSWORD,
      confirmPassword: activeTab === "admin" ? ADMIN_PASSWORD : CUSTOMER_PASSWORD,
      isAdmin: false,
      phone: "",
      ticketType: "",
    },
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    form.setValue("isAdmin", value === "admin");
    form.setValue("password", value === "admin" ? ADMIN_PASSWORD : CUSTOMER_PASSWORD);
    form.setValue("confirmPassword", value === "admin" ? ADMIN_PASSWORD : CUSTOMER_PASSWORD);
    form.setValue("email", "");
  };

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    try {
      if (values.isAdmin && !ADMIN_EMAILS.includes(values.email)) {
        throw new Error("Admin registration is restricted to authorized emails only.");
      }

      const userKey = values.isAdmin ? 'adminProfile' : 'customerProfile';
      const userProfile = {
        fullName: values.fullName,
        email: values.email,
        isAdmin: values.isAdmin,
        isEmailVerified: false,
        phone: values.phone || DEFAULT_PHONE_PREFIX + Math.floor(Math.random() * 10000000),
        ticketType: values.ticketType || TICKET_TYPES[0],
        role: values.isAdmin ? "Event Manager" : "Customer",
      };

      localStorage.setItem(userKey, JSON.stringify(userProfile));
      localStorage.setItem('userEmail', values.email);
      localStorage.setItem('isAdmin', values.isAdmin ? 'true' : 'false');

      toast({ title: "Registration successful", description: "Please verify your email to continue." });
      navigate(`/verify-email?email=${encodeURIComponent(values.email)}&isAdmin=${values.isAdmin}`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error instanceof Error ? error.message : "There was a problem creating your account.",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Create an Account</CardTitle>
          <CardDescription className="text-center">Register to access event tickets and more</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="customer">Customer</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>
          </Tabs>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="fullName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder={activeTab === "admin" ? "admin@gmail.com" : "you@example.com"} {...field} />
                  </FormControl>
                  {activeTab === "admin" && <p className="text-xs text-muted-foreground">Admin emails are restricted to authorized addresses only.</p>}
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl><Input placeholder="0801xxxxxxx" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="ticketType" render={({ field }) => (
                <FormItem>
                  <FormLabel>Ticket Type</FormLabel>
                  <FormControl>
                    <Input placeholder="Regular / VIP / VVIP" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl><Input type="password" placeholder={activeTab === "admin" ? ADMIN_PASSWORD : CUSTOMER_PASSWORD} {...field} /></FormControl>
                  <p className="text-xs text-muted-foreground">{activeTab === "admin" ? `Admin password: ${ADMIN_PASSWORD}` : `Default password: ${CUSTOMER_PASSWORD}`}</p>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl><Input type="password" placeholder={activeTab === "admin" ? ADMIN_PASSWORD : CUSTOMER_PASSWORD} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              <Button type="submit" className="w-full">Register</Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            Already have an account? <Link to="/login" className="text-primary hover:underline">Login</Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
