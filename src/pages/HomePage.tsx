import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { mockEvents } from "@/services/mockData";
import Navbar from "@/components/Navbar";
import EventCategories from "@/components/EventCategories";
import { useState, useEffect } from "react";
import { Event } from "@/types";

const HomePage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedInStatus);
  }, []);

  // Merge admin-created events with mock events
  const getEvents = () => {
    const storedEvents = localStorage.getItem('events');
    const adminCreatedEvents = storedEvents ? JSON.parse(storedEvents) : [];

    const combinedEvents = [...mockEvents];

    adminCreatedEvents.forEach((newEvent: Event) => {
      const existingIndex = combinedEvents.findIndex(e => e.id === newEvent.id);
      if (existingIndex >= 0) {
        combinedEvents[existingIndex] = newEvent;
      } else {
        combinedEvents.push(newEvent);
      }
    });

    return combinedEvents;
  };

  const filteredEvents = getEvents().filter(event =>
    event.isPublished &&
    (selectedCategory === "All" || event.category === selectedCategory)
  );

  const featuredEvents = filteredEvents.slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="bg-primary/5 py-16 md:py-24">
        <div className="container px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Event Tickets</h1>
          <p className="text-xl text-muted-foreground mx-auto max-w-2xl mb-8">
            Discover and book tickets for the best events, performances, and activities near you.
          </p>
          <Link to="/events">
            <Button size="lg" className="mt-4">Browse Events</Button>
          </Link>
        </div>
      </section>

      <section className="py-8 container px-4">
        <h2 className="text-2xl font-bold mb-4">Browse by Category</h2>
        <EventCategories
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </section>

      <section className="py-8 container px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Featured Events</h2>
          <Link to="/events" className="text-primary hover:underline">
            View all events
          </Link>
        </div>

        {featuredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No events found in this category.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setSelectedCategory("All")}
            >
              View all categories
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};

// Simple EventCard component for featured events
const EventCard = ({ event }: { event: Event }) => {
  return (
    <div className="border rounded-lg overflow-hidden shadow hover:shadow-md transition">
      <img
        src={event.imageUrl}
        alt={event.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-bold text-lg line-clamp-1">{event.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {event.descriptionShort || 'No description'}
        </p>
        <div className="mt-4 flex justify-between items-center">
          <span className="font-semibold">
            {event.price === 0 ? 'Free' : `₦${event.price?.toLocaleString()}`}
          </span>
          <Link to={`/events/${event.id}`}>
            <Button size="sm">View</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
