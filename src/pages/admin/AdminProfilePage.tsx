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
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Navbar from "@/components/Navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ----- CONFIGURABLE CONSTANTS -----
const DEFAULT_VALUES = {
  fullName: "Admin User",
  email: "admin@gmail.com",
  role: "Event Manager",
  phone: "08012345678",
  bio: "Responsible for managing customers and events",
};

const ROLE_OPTIONS = [
  "Event Manager",
  "System Administrator",
  "Finance Officer",
  "Content Manager"
];

// ----- VALIDATION SCHEMA -----
const adminProfileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address").endsWith("@gmail.com", "Must be a valid email"),
  role: z.string().min(2, "Role is required"),
  phone: z.string()
    .regex(/^0\d{9,}$/, "Phone number must start with 0 and have at least 10 digits"),
  bio: z.string().optional(),
});

type AdminProfileValues = z.infer<typeof adminProfileSchema>;

const AdminProfilePage = () => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(false);
  const [profileData, setProfileData] = useState<AdminProfileValues | null>(null);
  
  const form = useForm<AdminProfileValues>({
    resolver: zodResolver(adminProfileSchema),
    defaultValues: profileData || DEFAULT_VALUES,
  });
  
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get("setup") === "true") {
      setIsFirstTimeSetup(true);
      setIsEditing(true);
      form.reset({
        fullName: "",
        email: "admin@gmail.com",
        role: "",
        phone: "",
        bio: "",
      });
    }
  }, [location, form]);
  
  const onSubmit = async (data: AdminProfileValues) => {
    try {
      setProfileData(data);
      
      toast({
        title: isFirstTimeSetup ? "Profile created successfully" : "Profile updated successfully",
        description: "Your profile information has been saved",
      });
      
      if (isFirstTimeSetup) navigate("/admin/profile");
      setIsEditing(false);
      setIsFirstTimeSetup(false);
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save profile information",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isAdmin={true} />
      <div className="container py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Admin Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage src="https://github.com/shadcn.png" alt="Admin" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm">Change Photo</Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{isFirstTimeSetup ? "Complete Your Profile" : "Profile Information"}</CardTitle>
                <CardDescription>
                  {isFirstTimeSetup 
                    ? "Please provide your details to complete your profile setup" 
                    : "Manage your admin information"}
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
                              <Input placeholder="Admin Name" {...field} readOnly={!isEditing} />
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
                              <Input placeholder="admin@gmail.com" {...field} readOnly />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <FormControl>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                                disabled={!isEditing}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                  {ROLE_OPTIONS.map(role => (
                                    <SelectItem key={role} value={role}>{role}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
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
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us about your role" 
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
                        <div></div>
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
      </div>
    </div>
  );
};

export default AdminProfilePage;
