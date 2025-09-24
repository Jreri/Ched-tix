import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Clock, MapPin, Download, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { mockEvents } from "@/services/mockData";
import TicketQRCode from "@/components/TicketQRCode";
import { Link } from "react-router-dom";
import { Event } from "@/types";

const CustomerTicketsPage = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [userTickets, setUserTickets] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    customerId: "",
  });
  
  useEffect(() => {
    // Get customer profile information
    const customerProfile = JSON.parse(localStorage.getItem('customerProfile') || '{}');
    setCustomerInfo({
      name: customerProfile.fullName || 'Customer',
      email: customerProfile.email || localStorage.getItem('userEmail') || '',
      customerId: customerProfile.customerId || '',
    });
    
    // Get user tickets from localStorage
    const tickets = JSON.parse(localStorage.getItem('userTickets') || '[]');
    setUserTickets(tickets);
  }, []);
  
  const isTicketUsed = (ticketId: string) => {
    const scannedTickets = JSON.parse(localStorage.getItem('scannedTickets') || '[]');
    return scannedTickets.some((t: any) => t.ticketId === ticketId);
  };
  
  const getFilteredTickets = () => {
    const now = new Date();
    return userTickets.filter(ticket => {
      const event = mockEvents.find(e => e.id === ticket.eventId);
      if (!event) return false;
      const eventDate = new Date(event.date);
      if (activeTab === "upcoming") {
        return eventDate > now && ticket.status === "active";
      } else if (activeTab === "past") {
        return eventDate < now || ticket.status === "used";
      } else {
        return true; // all tickets
      }
    });
  };

  const filteredTickets = getFilteredTickets();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-2">My Tickets</h1>
        <p className="text-muted-foreground mb-8">View and manage your event tickets</p>
        
        <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="all">All Tickets</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {filteredTickets.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">No tickets found</h3>
                <p className="text-muted-foreground mb-4">
                  {activeTab === "upcoming" 
                    ? "You don't have any upcoming event tickets" 
                    : activeTab === "past" 
                      ? "You don't have any past event tickets" 
                      : "You haven't purchased any tickets yet"}
                </p>
                <Link to="/events">
                 <Button>Browse Events</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredTickets.map(ticket => {
              const event = mockEvents.find(e => e.id === ticket.eventId);
              const ticketUsed = ticket.status === "used" || isTicketUsed(ticket.id);
              
              if (!event) return null;
              
              return (
                <Card key={ticket.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-1/4 bg-cover bg-center h-48 md:h-auto" style={{ backgroundImage: `url(${ticket.eventImage || event.imageUrl})` }}></div>
                    <div className="flex-1">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl">{event.title}</CardTitle>
                            <CardDescription className="flex items-center mt-1">
                              <Calendar className="h-4 w-4 mr-1" /> {event.date} <Clock className="h-4 w-4 mx-1" /> {event.time}
                            </CardDescription>
                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                              <MapPin className="h-4 w-4 mr-1" /> {event.location}
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <Badge variant={ticketUsed ? "secondary" : "default"}>
                              {ticketUsed ? "Used" : "Active"}
                            </Badge>
                            <span className="text-sm font-medium mt-2">
                              {event.currency === 'USD' ? '$' : '₦'}{ticket.price.toLocaleString()}
                            </span>
                            <span className="text-xs text-muted-foreground capitalize">
                              {ticket.ticketType ? ticket.ticketType.replace("-", " ") : "Standard"}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-t pt-4 mt-2">
                          <div className="mb-4 md:mb-0">
                            <div className="text-sm font-medium">Ticket ID: {ticket.id}</div>
                            <div className="text-xs text-muted-foreground">Purchased: {new Date(ticket.purchaseDate).toLocaleDateString()}</div>
                            <div className="text-xs font-medium text-primary mt-1">
                              Unique Code: {`${ticket.eventId.substring(0, 4)}-${ticket.id.substring(0, 4)}-${Date.now().toString(36).substring(4, 8)}`.toUpperCase()}
                            </div>
                            {ticketUsed && (
                              <div className="text-xs flex items-center text-amber-500 mt-2">
                                <AlertCircle className="h-3 w-3 mr-1" /> This ticket has been used and cannot be used again
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex items-center">
                              <Download className="h-4 w-4 mr-1" /> Download
                            </Button>
                            {!ticketUsed && (
                              <TicketQRCode 
                                ticketId={ticket.id} 
                                eventId={ticket.eventId}
                                customerInfo={customerInfo}
                                variant="dialog" 
                              />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerTicketsPage;
