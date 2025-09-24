import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { 
  Calendar,
  Edit, 
  EyeOff, 
  MoreHorizontal, 
  Plus, 
  Search, 
  Trash2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";
import { mockEvents } from "@/services/mockData";
import { Event } from "@/types";

// Configurable constants
const DEFAULT_CURRENCY = "NGN";

// Format currency function - updated to use Naira sign
const formatCurrency = (amount: number, currency = DEFAULT_CURRENCY) => {
  const symbols = {
    NGN: "₦",
    USD: "$",
    EUR: "€",
    GBP: "£"
  };
  
  return `${symbols[currency as keyof typeof symbols] || "₦"}${amount.toLocaleString()}`;
};

const AdminEventsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  
  // Filter events based on search term
  const filteredEvents = events.filter(event => 
    event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to handle event deletion
  const handleDeleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
    
    const { toast } = useToast();
    toast({
      title: "Event deleted",
      description: "The event has been successfully deleted.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isAdmin={true} />
      
      <main className="container px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold">Manage Events</h1>
          <Link to="/admin/events/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
          </Link>
        </div>
        
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {/* Events Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Event</th>
                    <th className="text-left py-3 px-4">Date & Time</th>
                    <th className="text-left py-3 px-4">Location</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Sales</th>
                    <th className="text-left py-3 px-4">Revenue</th>
                    <th className="text-left py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-muted-foreground">
                      No events found. Get started by creating your first event.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

// Event row component
const EventRow = ({ 
  event, 
  setEvents,
  onDelete
}: { 
  event: Event, 
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>,
  onDelete: (id: string) => void
}) => {
  const soldTickets = event.capacity - event.availableTickets;
  const revenue = soldTickets * event.price;
  const soldPercentage = Math.round((soldTickets / event.capacity) * 100);
  const { toast } = useToast();
  
  const handlePublishToggle = () => {
    const updatedEvent = { ...event, isPublished: !event.isPublished };
    setEvents(prev => prev.map(e => e.id === event.id ? updatedEvent : e));
    
    toast({
      title: updatedEvent.isPublished ? "Event published" : "Event unpublished",
      description: `The event has been ${updatedEvent.isPublished ? "published" : "unpublished"} successfully.`,
    });
  };

  const handleDeleteClick = () => {
    onDelete(event.id);
  };
  
  return (
    <tr className="border-b hover:bg-muted/50">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded overflow-hidden">
            <img 
              src={event.imageUrl} 
              alt={event.title} 
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <div className="font-medium">{event.title}</div>
            <div className="text-sm text-muted-foreground">ID: {event.id}</div>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>
            {new Date(event.date).toLocaleDateString()} | {event.time}
          </span>
        </div>
      </td>
      <td className="py-3 px-4">{event.location}</td>
      <td className="py-3 px-4">
        <Badge variant={event.isPublished ? "default" : "outline"}>
          {event.isPublished ? 'Published' : 'Draft'}
        </Badge>
      </td>
      <td className="py-3 px-4">
        <div>
          <span className="font-medium">{soldTickets} / {event.capacity}</span>
          <div className="text-xs text-muted-foreground">{soldPercentage}% sold</div>
        </div>
      </td>
      <td className="py-3 px-4">
        <span className="font-medium">{formatCurrency(revenue, event.currency)}</span>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center space-x-2">
          <Link to={`/admin/events/${event.id}`}>
            <Button variant="outline" size="sm">
              Manage
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Link to={`/admin/events/${event.id}`}>
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Event
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem onClick={handlePublishToggle}>
                <EyeOff className="h-4 w-4 mr-2" />
                {event.isPublished ? 'Unpublish' : 'Publish'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDeleteClick} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
    </tr>
  );
};

export default AdminEventsPage;
