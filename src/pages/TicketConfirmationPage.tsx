import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Check, Calendar, MapPin, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import TicketQRCode from "@/components/TicketQRCode";
import { mockEvents } from "@/services/mockData";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { jsPDF } from "jspdf";
import * as htmlToImage from "html-to-image";

const TicketConfirmationPage = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [ticket, setTicket] = useState(null);
  const [event, setEvent] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    customerId: "",
  });
  const [uniqueCode, setUniqueCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const ticketCardRef = useRef(null);

  useEffect(() => {
    setIsLoading(true);
    try {
      // Get customer info
      const customerProfile = JSON.parse(localStorage.getItem("customerProfile") || "{}");
      const customerData = {
        name: customerProfile.fullName || "Customer",
        email: customerProfile.email || localStorage.getItem("userEmail") || "",
        customerId: customerProfile.customerId || "",
      };
      setCustomerInfo(customerData);

      // Get tickets
      const userTickets = JSON.parse(localStorage.getItem("userTickets") || "[]");
      const foundTicket = userTickets.find((t) => t.id === ticketId);

      if (!foundTicket) {
        toast({
          title: "Ticket not found",
          description: "We couldn't find the ticket you're looking for",
          variant: "destructive",
        });
        navigate("/tickets");
        return;
      }

      // Update ticket with customer info
      const updatedTickets = userTickets.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            attendeeName: customerData.name,
            attendeeEmail: customerData.email,
            attendeeCustomerId: customerData.customerId,
          };
        }
        return t;
      });
      localStorage.setItem("userTickets", JSON.stringify(updatedTickets));
      setTicket(foundTicket);

      // Generate unique code
      const code = `${foundTicket.eventId.substring(0, 4)}-${ticketId.substring(0, 4)}-${Date.now()
        .toString(36)
        .substring(4, 8)}`.toUpperCase();
      setUniqueCode(code);

      // Find event details
      const foundEvent = mockEvents.find((e) => e.id === foundTicket.eventId);
      if (foundEvent) setEvent(foundEvent);
    } catch (error) {
      console.error("Error loading ticket data:", error);
      toast({
        title: "Error loading ticket",
        description: "There was a problem loading your ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [ticketId, navigate, toast]);

  const downloadTicketAsPDF = async () => {
    if (!ticketCardRef.current) return;
    setIsDownloading(true);
    try {
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      pdf.setProperties({
        title: `${event?.title || "Event"} Ticket`,
        subject: "Event Ticket",
        creator: "Campus Event System",
      });

      const ticketImage = await htmlToImage.toPng(ticketCardRef.current, { quality: 0.95, backgroundColor: "#fff" });
      const imgWidth = 190;
      const imgHeight = (ticketCardRef.current.offsetHeight * imgWidth) / ticketCardRef.current.offsetWidth;

      pdf.setFontSize(20);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`${event?.title || "Event"} Ticket`, 10, 20);

      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, 10, 30);

      pdf.addImage(ticketImage, "PNG", 10, 40, imgWidth, imgHeight);

      const yPos = 40 + imgHeight + 10;
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Attendee: ${customerInfo.name}`, 10, yPos);
      pdf.text(`Email: ${customerInfo.email}`, 10, yPos + 7);
      pdf.text(`Customer ID: ${customerInfo.customerId || "N/A"}`, 10, yPos + 14);
      pdf.text(`Ticket ID: ${ticketId}`, 10, yPos + 21);
      pdf.text(`Unique Code: ${uniqueCode}`, 10, yPos + 28);

      pdf.setFontSize(10);
      pdf.setTextColor(255, 0, 0);
      pdf.text("IMPORTANT: This ticket can only be used once. Please present it at the event entrance.", 10, yPos + 38);

      pdf.save(`${event?.title || "Event"}_Ticket_${ticketId}.pdf`);
      toast({
        title: "Ticket Downloaded",
        description: "Your ticket has been saved as a PDF file.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Download Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container px-4 py-8">
          <div className="mb-6">
            <Skeleton className="h-10 w-3/4 mb-2" />
            <Skeleton className="h-5 w-1/2" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <Skeleton className="h-[500px] w-full mb-6" />
              <Skeleton className="h-[200px] w-full" />
            </div>
            <div>
              <Skeleton className="h-[300px] w-full mb-6" />
              <Skeleton className="h-[200px] w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket || !event) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-2">Ticket Not Found</h2>
          <p className="text-muted-foreground mb-6 text-center">
            We couldn't find the ticket you're looking for. It may have been deleted or never existed.
          </p>
          <Link to="/tickets">
            <Button>View All Tickets</Button>
          </Link>
        </div>
      </div>
    );
  }

  const purchaseDate = new Date(ticket.purchaseDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const eventDate = new Date(event.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Your Ticket is Ready!</h1>
            <p className="text-muted-foreground">The ticket has been successfully generated and added to your account</p>
          </div>
          <div className="hidden sm:block">
            <Link to="/tickets">
              <Button>View All Tickets</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div ref={ticketCardRef} className="relative rounded-lg overflow-hidden h-[500px] mb-6 shadow-lg">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${ticket.eventImage || event.imageUrl})` }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-black/50"></div>

              <div className="absolute inset-0 flex flex-col justify-between p-6 text-white">
                <div>
                  <div className="bg-black/30 backdrop-blur-sm p-4 rounded-lg inline-block">
                    <h2 className="text-2xl font-bold">{event.title}</h2>
                    <div className="flex items-center text-sm mt-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{eventDate} • {event.time}</span>
                    </div>
                    <div className="flex items-center text-sm mt-1">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-black/40 backdrop-blur-sm p-4 rounded-lg flex flex-col items-center">
                  <div className="text-xs uppercase tracking-wide mb-1 text-center">
                    <span className="block">Ticket ID: {ticket.id}</span>
                    <span className="block mt-1">Unique Code: {uniqueCode}</span>
                    <span className="block mt-1 text-yellow-300">This ticket can only be used once</span>
                  </div>
                  <div className="bg-white p-4 rounded-lg mb-3">
                    <TicketQRCode ticketId={ticket.id} eventId={ticket.eventId} customerInfo={customerInfo} />
                  </div>
                  <div className="text-sm text-center">
                    Scan this QR code or use the unique code at the venue entrance
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-muted p-6 rounded-lg mb-6">
              <h3 className="font-semibold mb-4">Ticket Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Ticket ID</span>
                  <span className="font-medium">{ticket.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Purchase Date</span>
                  <span>{purchaseDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Quantity</span>
                  <span>{ticket.quantity} ticket{ticket.quantity > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Price</span>
                  <span>{event.currency === 'USD' ? '$' : '₦'}{ticket.price.toLocaleString()} each</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <span className="font-medium">Active</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Unique Code</span>
                  <span className="font-mono font-medium">{uniqueCode}</span>
                </div>
              </div>
            </div>

            <div className="sm:hidden">
              <Link to="/tickets">
                <Button className="w-full">View All Tickets</Button>
              </Link>
            </div>
          </div>

          <div>
            <Card className="overflow-hidden">
              <div className="bg-primary/10 p-4 flex items-center justify-center">
                <div className="rounded-full bg-primary/20 p-3">
                  <Check className="h-6 w-6 text-primary" />
                </div>
              </div>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold mb-2">Payment Successful</h2>
                  <p className="text-muted-foreground text-sm">Thank you for your purchase! Your ticket has been generated.</p>
                </div>

                <Button className="w-full gap-2 mb-4" onClick={downloadTicketAsPDF} disabled={isDownloading}>
                  {isDownloading ? "Generating PDF..." : (
                    <>
                      <Download className="h-4 w-4" />
                      Download Ticket as PDF
                    </>
                  )}
                </Button>

                <Link to={`/events/${event.id}`}>
                  <Button variant="outline" className="w-full">
                    Back to Event Details
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <div className="mt-6 bg-muted p-6 rounded-lg">
              <h3 className="font-semibold mb-4">Attendee Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Name</span>
                  <span>{customerInfo.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Email</span>
                  <span className="text-sm">{customerInfo.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Customer ID</span>
                  <span>{customerInfo.customerId}</span>
                </div>
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                This information is encoded in your ticket QR code for verification at the event. 
                Present your ticket and a valid ID at the entrance.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TicketConfirmationPage;
