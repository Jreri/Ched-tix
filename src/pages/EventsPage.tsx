import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { mockEvents } from "@/services/mockData";
import Navbar from "@/components/Navbar";
import { Event } from "@/types";

// Configurable constants
const NO_EVENTS_FOUND_MESSAGE = "No events found";
const NO_EVENTS_DESCRIPTION = "No events have been created yet.";
const CLEAR_SEARCH_LABEL = "Clear Search";
const FREE_LABEL = "Free";
const CURRENCY = "₦";

const EventsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const getEvents = () => {
    const storedEvents = localStorage.getItem('events');
    const adminCreatedEvents = storedEvents ? JSON.parse(storedEvents) : [];

    const combinedEvents = [...mockEvents];

    adminCreatedEvents.forEach((newEvent: Event) => {
      const existingIndex = combinedEvents.findIndex((e) => e.id === newEvent.id);
      if (existingIndex >= 0) {
        combinedEvents[existingIndex] = newEvent;
      } else {
        combinedEvents.push(newEvent);
      }
    });

    return combinedEvents;
  };

  const filteredEvents = getEvents()
    .filter(event => event.isPublished)
    .filter(event => 
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.descriptionShort?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Upcoming Events</h1>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
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

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <h3 className="text-xl font-medium mb-2">{NO_EVENTS_FOUND_MESSAGE}</h3>
              <p className="text-muted-foreground mb-4">{NO_EVENTS_DESCRIPTION}</p>
              {searchTerm && (
                <Button variant="outline" onClick={() => setSearchTerm("")}>
                  {CLEAR_SEARCH_LABEL}
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const EventCard = ({ event }: { event: Event }) => {
  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="aspect-video w-full overflow-hidden">
        <img 
          src={event.imageUrl} 
          alt={event.title} 
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
      </div>
      <CardHeader>
        <CardTitle className="line-clamp-1">{event.title}</CardTitle>
        <CardDescription className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {event.date ? new Date(event.date).toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          }) : 'No date'} | {event.time || 'No time'}
        </CardDescription>
        <CardDescription className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {event.location || 'No location'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-2 text-sm">{event.descriptionShort || 'No description'}</p>
      </CardContent>
      <CardFooter className="mt-auto pt-4">
        <div className="flex justify-between items-center w-full">
          <span className="font-bold">
            {event.price === 0 ? FREE_LABEL : (event.price ? `${CURRENCY}${event.price.toLocaleString()}` : '-')}
          </span>
          <Link to={`/events/${event.id}`}>
            <Button>View Details</Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default EventsPage;
