import { useState, useEffect, useCallback } from "react";
import QRCode from "react-qr-code";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Ticket, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface TicketQRCodeProps {
  ticketId: string;
  eventId: string;
  variant?: "button" | "dialog";
  customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  onDownload?: () => void;
}

const TicketQRCode = ({ 
  ticketId, 
  eventId, 
  variant = "button", 
  customerInfo = {},
  onDownload 
}: TicketQRCodeProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [eventData, setEventData] = useState<any>(null);
  const [uniqueCode, setUniqueCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  
  const generateUniqueCode = useCallback(() => {
    return `${eventId.substring(0, 4)}-${ticketId.substring(0, 4)}-${Date.now().toString(36).substring(4, 8)}`.toUpperCase();
  }, [eventId, ticketId]);
  
  useEffect(() => {
    setIsLoading(true);
    try {
      const storedEvents = localStorage.getItem('events');
      if (storedEvents) {
        const events = JSON.parse(storedEvents);
        const event = events.find((e: any) => e.id === eventId);
        if (event) setEventData(event);
      }
      setUniqueCode(generateUniqueCode());
    } catch (error) {
      console.error("Error loading ticket data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [eventId, ticketId, generateUniqueCode]);
  
  const getCustomerInfo = useCallback(() => {
    if (customerInfo.name && customerInfo.email) return customerInfo;
    try {
      const profile = JSON.parse(localStorage.getItem('customerProfile') || '{}');
      return {
        name: profile.fullName || 'Customer',
        email: profile.email || localStorage.getItem('userEmail') || '',
        phone: profile.phone || '',
      };
    } catch (error) {
      console.error("Error getting customer info:", error);
      return { name: 'Customer', email: '', phone: '' };
    }
  }, [customerInfo]);
  
  const customer = getCustomerInfo();
  
  const ticketData = JSON.stringify({
    ticketId,
    eventId,
    uniqueCode: uniqueCode || generateUniqueCode(),
    customer: {
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
    },
    timestamp: new Date().toISOString(),
    used: false,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col space-y-3">
        <Skeleton className="h-[200px] w-full rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  }

  if (variant === "dialog") {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button size="sm" className="flex items-center">
            <Ticket className="h-4 w-4 mr-1" /> Show Ticket
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your Ticket QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-0">
            <div 
              className="relative bg-white w-full rounded-md overflow-hidden"
              style={{
                backgroundImage: eventData?.imageUrl ? `url(${eventData.imageUrl})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '300px'
              }}
            >
              <div className="absolute inset-0 bg-black/60"></div>
              <div className="relative z-10 flex flex-col items-center justify-between h-full p-4">
                <div className="text-white text-center mb-2">
                  <h3 className="font-bold text-lg">{eventData?.title || 'Event Ticket'}</h3>
                  <p className="text-sm opacity-80">{eventData?.date} • {eventData?.time}</p>
                </div>
                
                <div className="bg-white p-3 rounded-md">
                  <QRCode value={ticketData} size={150} />
                </div>
                
                <div className="text-white text-center mt-2">
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-xs opacity-80">{customer.email}</p>
                  <p className="text-xs font-bold mt-1">Code: {uniqueCode || JSON.parse(ticketData).uniqueCode}</p>
                </div>
              </div>
            </div>
            <div className="text-center mt-4 space-y-1">
              <p className="text-xs text-muted-foreground">
                Present this QR code or the unique code at the event entrance for admission
              </p>
              <p className="text-xs font-medium">Ticket ID: {ticketId}</p>
              <p className="text-xs text-muted-foreground">This ticket can only be used once</p>
            </div>
          </div>
          {onDownload && (
            <Button onClick={onDownload} className="w-full mt-2">
              <Download className="h-4 w-4 mr-2" /> Download Ticket
            </Button>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div 
      className="relative bg-white p-4 rounded-md overflow-hidden"
      style={{
        backgroundImage: eventData?.imageUrl ? `url(${eventData.imageUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/60"></div>
      <div className="relative z-10">
        <div className="bg-white p-3 rounded-md mx-auto w-fit">
          <QRCode value={ticketData} size={200} />
        </div>
        <div className="text-center mt-2 text-white">
          <p className="font-medium">{eventData?.title || 'Event Ticket'}</p>
          <p className="text-xs mb-1">{customer.name}</p>
          <p className="text-xs font-bold mt-1">Unique Code: {uniqueCode || JSON.parse(ticketData).uniqueCode}</p>
        </div>
      </div>
    </div>
  );
};

export default TicketQRCode;
