import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Event, TicketTier } from "@/types";
import TicketTierEditor from "@/components/TicketTierEditor";

// --- Schema ---
const eventSchema = z.object({
  title: z.string().min(3),
  date: z.date({ required_error: "Please select a date" }),
  time: z.string().min(1),
  location: z.string().min(3),
  imageUrl: z.string().optional(),
  price: z.coerce.number().min(0),
  currency: z.string().default("NGN"),
  capacity: z.coerce.number().min(1),
  availableTickets: z.coerce.number().min(0),
  descriptionShort: z.string().min(10),
  descriptionLong: z.string().min(50),
  isPublished: z.boolean().default(true),
  category: z.string().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

// Extend type for full submission with extra fields
interface EventFormFullData extends EventFormData {
  id: string;
  imageFile?: File;
  imageData?: string;
  ticketTiers: TicketTier[];
}

interface EventFormProps {
  event?: Event;
  mode: "create" | "edit";
  onEventCreated?: (data: EventFormFullData) => void;
}

const EventForm = ({ event, mode = "create", onEventCreated }: EventFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(event?.imageUrl || null);
  const [ticketTiers, setTicketTiers] = useState<TicketTier[]>(event?.ticketTiers || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: event
      ? {
          ...event,
          date: new Date(event.date),
          price: Number(event.price),
          currency: event.currency || "NGN",
          capacity: Number(event.capacity),
          availableTickets: Number(event.availableTickets),
          isPublished: event.isPublished ?? true,
          category: event.category || "",
        }
      : {
          title: "",
          date: new Date(),
          time: "",
          location: "",
          imageUrl: "",
          price: 0,
          currency: "NGN",
          capacity: 0,
          availableTickets: 0,
          descriptionShort: "",
          descriptionLong: "",
          isPublished: true,
          category: "",
        },
  });

  const handleTicketTiersChange = (updatedTiers: TicketTier[]) => {
    setTicketTiers(updatedTiers);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      form.setValue("imageUrl", url);
    }
  };

  const handleFileUploadClick = () => fileInputRef.current?.click();

  const onSubmit = async (data: EventFormData) => {
    setIsSubmitting(true);
    try {
      const fullData: EventFormFullData = {
        ...data,
        id: event?.id || `event-${Date.now()}`,
        imageFile: selectedFile || undefined,
        ticketTiers,
      };

      if (selectedFile) {
        const reader = new FileReader();
        reader.readAsDataURL(selectedFile);
        reader.onload = () => {
          fullData.imageData = reader.result as string;
          submitData(fullData);
        };
      } else {
        submitData(fullData);
      }
    } catch (err) {
      toast({ variant: "destructive", title: `Failed to ${mode} event` });
      setIsSubmitting(false);
    }
  };

  const submitData = (data: EventFormFullData) => {
    if (onEventCreated) onEventCreated(data);
    else {
      toast({
        title: mode === "create" ? "Event created!" : "Event updated!",
      });
      navigate("/admin/events");
    }
    setIsSubmitting(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Example input */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Event title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Ticket tiers */}
        <TicketTierEditor initialTiers={ticketTiers} onChange={handleTicketTiersChange} />
        {/* File upload */}
        <div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          <Button type="button" onClick={handleFileUploadClick}>Upload Image</Button>
          {previewUrl && <img src={previewUrl} alt="Preview" className="mt-2 w-40 h-40 object-cover rounded" />}
        </div>
        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate("/admin/events")}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (mode === "create" ? "Creating..." : "Updating...") : mode === "create" ? "Create Event" : "Update Event"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EventForm;
