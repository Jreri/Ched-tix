import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import EventForm from "@/components/EventForm";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Event } from "@/types";

const CreateEventPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Handler passed to EventForm
  const handleEventCreated = (formData: any) => {
    const { ticketTiers, ...eventData } = formData;
    
    const newEvent: Event = {
      ...eventData,
      id: `event-${Date.now()}`, // Unique ID
      isPublished: true,          // Auto-publish
      availableTickets: formData.capacity || 100,
      imageUrl: formData.imageData || formData.imageUrl,
      ticketTiers: ticketTiers || [],
    };
    
    // TODO: send `newEvent` to your backend API instead of localStorage
    console.log("New event ready to submit:", newEvent);
    
    // Confirmation toast
    toast({
      title: "Event Published",
      description: "Your event is now live and available to users",
    });
    
    // Redirect to events management page
    navigate("/admin/events");
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isAdmin={true} />
      <main className="container px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Create New Event</h1>
          <p className="text-muted-foreground">Fill in the details to create a new event</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
            <CardDescription>
              Enter the information about your new event - it will be published immediately
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EventForm 
              mode="create" 
              onEventCreated={handleEventCreated}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreateEventPage;
