import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Navbar from "@/components/Navbar";

// Profile schema
const customerProfileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  customerId: z.string().min(5, "Customer ID must be at least 5 characters"),
  department: z.string().min(2, "Department is required"),
  level: z.string().min(1, "Level is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  bio: z.string().optional(),
});

type CustomerProfileValues = z.infer<typeof customerProfileSchema>;

const CustomerProfilePage = () => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(false);
  const [profileData, setProfileData] = useState<CustomerProfileValues | null>(null);
  
  // Default values for the form
  const defaultValues: CustomerProfileValues = {
    fullName: "John Doe",
    email: "johndoe@example.com",
    customerId: "CUS/20/001",
    department: "Sales",
    level: "1",
    phone: "08012345678",
    address: "123 Main Street",
    bio: "Customer with interest in our products and services",
  };
  
  const form = useForm<CustomerProfileValues>({
    resolver: zodResolver(customerProfileSchema),
    defaultValues: profileData || defaultValues,
  });
  
  useEffect(() => {
    // Check if this is first time setup
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get("setup") === "true") {
      setIsFirstTimeSetup(true);
      setIsEditing(true);
      // Clear the form for first time setup
      form.reset({
        fullName: "",
        email: "",
        customerId: "",
        department: "",
        level: "",
        phone: "",
        address: "",
        bio: "",
      });
    } else {
      // In a real app, we would fetch the user's profile data here
      const savedProfile = localStorage.getItem('customerProfile');
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        setProfileData(parsedProfile);
        form.reset(parsedProfile);
      }
    }
  }, [location, form]);
  
  const onSubmit = async (data: CustomerProfileValues) => {
    try {
      // Save to localStorage for persistence
      localStorage.setItem('customerProfile', JSON.stringify(data));
      setProfileData(data);
      
      toast({
        title: isFirstTimeSetup ? "Profile created successfully" : "Profile updated successfully",
        description: "Your profile information has been saved",
      });
      
      if (isFirstTimeSetup) {
        navigate("/customer/profile");
      }
      
      setIsEditing(false);
      setIsFirstTimeSetup(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save profile information",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Customer Profile</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>{isFirstTimeSetup ? "Complete Your Profile" : "Profile Information"}</CardTitle>
            <CardDescription>
              {isFirstTimeSetup 
                ? "Please provide your personal details to complete your profile setup" 
                : "Manage your personal information"}
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} readOnly={!isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="john@example.com" {...field} readOnly />
                        </FormControl>
                        <FormMessage />
                        <FormDescription>Email cannot be changed</FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="customerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer ID</FormLabel>
                        <FormControl>
                          <Input placeholder="CUS/20/001" {...field} readOnly={!isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <FormControl>
                          <Input placeholder="Sales" {...field} readOnly={!isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Level</FormLabel>
                        <FormControl>
                          <Input placeholder="1" {...field} readOnly={!isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="08012345678" {...field} readOnly={!isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main Street" {...field} readOnly={!isEditing} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us a bit about yourself" 
                          {...field} 
                          readOnly={!isEditing}
                          className="min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              
              <CardFooter className="flex justify-between">
                {isEditing ? (
                  <>
                    {!isFirstTimeSetup && (
                      <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    )}
                    <Button type="submit">
                      {isFirstTimeSetup ? "Complete Setup" : "Save Changes"}
                    </Button>
                  </>
                ) : (
                  <>
                    <div></div> {/* empty div to maintain spacing */}
                    <Button type="button" onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  </>
                )}
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default CustomerProfilePage;
