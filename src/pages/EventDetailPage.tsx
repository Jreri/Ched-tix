import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Share2, 
  Ticket, 
  Users 
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { mockEvents } from "@/services/mockData";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Event, TicketTier } from "@/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

// Configurable constants
const MAX_TICKETS_PER_PURCHASE = 10;
const STANDARD_TICKET_NAME = "Standard Admission";
const SERVICE_FEE = 0.0;
const DEFAULT_CURRENCY = "NGN";

const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [ticketCount, setTicketCount] = useState(1);
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTierId, setSelectedTierId] = useState<string>("");
  const { toast } = useToast();
  
  useEffect(() => {
    const getEvent = () => {
      setIsLoading(true);
      
      const storedEvents = localStorage.getItem('events');
      const adminCreatedEvents = storedEvents ? JSON.parse(storedEvents) : [];
      const localEvent = adminCreatedEvents.find((e: Event) => e.id === id);
      
      if (localEvent) {
        setEvent(localEvent);
        if (localEvent.ticketTiers && localEvent.ticketTiers.length > 0) {
          setSelectedTierId(localEvent.ticketTiers[0].id);
        }
      } else {
        const mockEvent = mockEvents.find(e => e.id === id);
        if (mockEvent) {
          setEvent(mockEvent);
        }
      }
      
      setIsLoading(false);
    };
    
    if (id) getEvent();
  }, [id]);
  
  const selectedTier = event?.ticketTiers?.find(tier => tier.id === selectedTierId);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xl">Loading event details...</p>
        </div>
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
            <p className="mb-6">The event you're looking for doesn't exist or has been removed.</p>
            <Link to="/events">
              <Button>Browse Other Events</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const ticketPrice = selectedTier ? selectedTier.price : event.price;
  const totalPrice = ticketPrice * ticketCount;
  const isFreeEvent = totalPrice === 0;

  const handleFreePurchase = () => {
    const ticketId = `TICKET-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
    const ticketData = {
      id: ticketId,
      eventId: event.id,
      eventTitle: event.title,
      quantity: ticketCount,
      price: 0,
      currency: event.currency || DEFAULT_CURRENCY,
      purchaseDate: new Date().toISOString(),
      status: "active",
      eventImage: event.imageUrl,
      tierName: selectedTier?.name || STANDARD_TICKET_NAME,
    };
    
    const existingTickets = JSON.parse(localStorage.getItem('userTickets') || '[]');
    existingTickets.push(ticketData);
    localStorage.setItem('userTickets', JSON.stringify(existingTickets));
    
    toast({
      title: "Success!",
      description: `You have successfully registered for ${event.title}`,
    });
    
    navigate(`/tickets/confirmation/${ticketId}`);
  };

  const handlePaidPurchase = () => {
    sessionStorage.setItem('purchaseInfo', JSON.stringify({
      eventId: event.id,
      eventTitle: event.title,
      ticketPrice: ticketPrice,
      quantity: ticketCount,
      total: totalPrice,
      eventImage: event.imageUrl,
      ticketTierId: selectedTierId,
      ticketTierName: selectedTier?.name || STANDARD_TICKET_NAME,
      currency: event.currency || DEFAULT_CURRENCY
    }));
    
    navigate('/payment');
  };

  const handlePurchase = () => {
    if (isFreeEvent) {
      handleFreePurchase();
    } else {
      handlePaidPurchase();
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container px-4 py-8">
        <div className="mb-6">
          <Link to="/events">
            <Button variant="ghost" className="px-0 hover:bg-transparent">
              &larr; Back to Events
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="lg:col-span-2">
            <div className="rounded-lg overflow-hidden mb-6">
              <img src={event.imageUrl} alt={event.title} className="w-full h-auto max-h-[500px] object-cover" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">{event.title}</h1>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" /><span>{formattedDate}</span></div>
              <div className="flex items-center gap-2"><Clock className="h-5 w-5 text-primary" /><span>{event.time}</span></div>
              <div className="flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /><span>{event.location}</span></div>
            </div>
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">About This Event</h2>
              <p className="whitespace-pre-line">{event.descriptionLong}</p>
            </div>
            <div className="flex flex-wrap gap-3 mb-8">
              <div className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /><span>Capacity: {event.capacity}</span></div>
              <div className="flex items-center gap-2"><Ticket className="h-5 w-5 text-primary" /><span>Available Tickets: {event.availableTickets}</span></div>
            </div>
            <div className="mb-8">
              <Button variant="outline" className="gap-2">
                <Share2 className="h-4 w-4" />
                Share Event
              </Button>
            </div>
          </div>
          
          {/* Ticket Purchase */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>{isFreeEvent ? "Register for Event" : "Get Tickets"}</CardTitle>
              </CardHeader>
              <CardContent>
                {event.ticketTiers && event.ticketTiers.length > 0 ? (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium mb-3">Select Ticket Type</h3>
                    <RadioGroup value={selectedTierId} onValueChange={setSelectedTierId} className="space-y-3">
                      {event.ticketTiers.map(tier => (
                        <div key={tier.id} className="flex items-start space-x-2">
                          <RadioGroupItem value={tier.id} id={`tier-${tier.id}`} />
                          <div className="grid gap-1.5 leading-none w-full">
                            <Label htmlFor={`tier-${tier.id}`} className="flex justify-between w-full">
                              <span>{tier.name}</span>
                              <span className="font-semibold">
                                {tier.price === 0 ? 'Free' : `${event.currency || DEFAULT_CURRENCY} ${tier.price.toLocaleString()}`}
                              </span>
                            </Label>
                            {tier.description && <p className="text-sm text-muted-foreground">{tier.description}</p>}
                            {tier.availableCount !== undefined && tier.availableCount < 10 && (
                              <p className="text-xs text-red-500 font-medium">Only {tier.availableCount} tickets left!</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ) : (
                  <div className="mb-4">
                    <Badge variant="outline">{STANDARD_TICKET_NAME}</Badge>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">
                        {event.price === 0 ? 'Free' : `${event.currency || DEFAULT_CURRENCY} ${event.price.toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Quantity</span>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                        disabled={ticketCount <= 1}
                      >-</Button>
                      <span className="w-8 text-center">{ticketCount}</span>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => setTicketCount(Math.min(MAX_TICKETS_PER_PURCHASE, ticketCount + 1))}
                        disabled={ticketCount >= Math.min(MAX_TICKETS_PER_PURCHASE, selectedTier?.availableCount || event.availableTickets)}
                      >+</Button>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="mb-6">
                  <div className="flex justify-between mb-2"><span>Subtotal</span><span>{isFreeEvent ? 'Free' : `${event.currency || DEFAULT_CURRENCY} ${totalPrice.toLocaleString()}`}</span></div>
                  <div className="flex justify-between mb-2"><span>Service Fee</span><span>{event.currency || DEFAULT_CURRENCY} {SERVICE_FEE.toFixed(2)}</span></div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold"><span>Total</span><span>{isFreeEvent ? 'Free' : `${event.currency || DEFAULT_CURRENCY} ${totalPrice.toLocaleString()}`}</span></div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" size="lg" onClick={handlePurchase}>
                  {isFreeEvent ? "Register Now" : "Purchase Tickets"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EventDetailPage;
