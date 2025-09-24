import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import EventForm from "@/components/EventForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel,  AlertDialogDescription, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { Event } from "@/types";
import { findEventById, updateEvent, deleteEvent } from "@/services/eventService";

const EditEventPage = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!id) return;

    const e = findEventById(id);
    if (e) setEvent(e);
    else {
      toast({ variant: "destructive", title: "Event not found", description: "This event could not be found" });
      navigate("/admin/events");
    }
    setIsLoading(false);
  }, [id, navigate, toast]);

  const handleDeleteEvent = () => {
    if (!id) return;
    setIsDeleting(true);
    deleteEvent(id);
    toast({ title: "Event deleted", description: "The event has been deleted" });
    navigate("/admin/events");
  };

  const handleEventUpdated = (formData: any) => {
    if (!id) return;
    const { ticketTiers, ...eventData } = formData;
    updateEvent({ ...eventData, id, ticketTiers: ticketTiers || [] });
    toast({ title: "Event updated", description: "The event has been updated" });
    navigate("/admin/events");
  };

  if (isLoading) return <p className="text-center mt-8">Loading event details...</p>;
  if (!event) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isAdmin={true} />
      <main className="container px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Edit Event</h1>
            <p className="text-muted-foreground">Make changes to event details</p>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="gap-2">
                <Trash2 className="h-4 w-4" /> Delete Event
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete "{event.title}".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteEvent} disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
            <CardDescription>Update the information for "{event.title}"</CardDescription>
          </CardHeader>
          <CardContent>
            <EventForm mode="edit" event={event} onEventCreated={handleEventUpdated} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default EditEventPage;
