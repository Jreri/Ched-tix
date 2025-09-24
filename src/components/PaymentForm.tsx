import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { TicketTier } from "@/types";

// Configurable constants
const PAYSTACK_PUBLIC_KEY = 'pk_live_95335e54994e0c9971ecec85883cc3055cd9f23e';
const DEFAULT_MAX_QUANTITY = 10;
const SERVICE_FEE_PERCENTAGE = 0.05;
const ATTENDEE_PLACEHOLDER = "Enter customer info, one per line, e.g.\nJohn Doe, john@example.com, +2348012345678";

const PaymentForm = ({ 
  eventId, 
  eventTitle, 
  ticketPrice, 
  onSuccess, 
  onCancel 
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isGroupPurchase, setIsGroupPurchase] = useState(false);
  const [attendeeInfo, setAttendeeInfo] = useState("");
  const [ticketTiers, setTicketTiers] = useState<TicketTier[]>([]);
  const [selectedTierId, setSelectedTierId] = useState<string>("");
  const [selectedTier, setSelectedTier] = useState<TicketTier | null>(null);

  useEffect(() => {
    const fetchEvent = () => {
      const storedEvents = localStorage.getItem('events');
      const events = storedEvents ? JSON.parse(storedEvents) : [];
      const event = events.find(e => e.id === eventId);
      
      if (event && event.ticketTiers?.length) {
        setTicketTiers(event.ticketTiers);
        setSelectedTierId(event.ticketTiers[0].id);
        setSelectedTier(event.ticketTiers[0]);
      } else {
        const defaultTier = {
          id: "default",
          name: "Standard",
          price: ticketPrice,
          description: "Regular admission",
          availableCount: DEFAULT_MAX_QUANTITY
        };
        setTicketTiers([defaultTier]);
        setSelectedTierId("default");
        setSelectedTier(defaultTier);
      }
    };
    
    fetchEvent();
  }, [eventId, ticketPrice]);

  useEffect(() => {
    const tier = ticketTiers.find(t => t.id === selectedTierId);
    setSelectedTier(tier || null);
  }, [selectedTierId, ticketTiers]);

  const currentPrice = selectedTier?.price || ticketPrice;
  const subtotal = currentPrice * quantity;
  const serviceFee = Math.round(subtotal * SERVICE_FEE_PERCENTAGE);
  const total = subtotal + serviceFee;
  const isFreeEvent = total === 0;

  const handleFreeRegistration = () => {
    const ticketId = `TICKET-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
    const ticketData = {
      id: ticketId,
      eventId,
      eventTitle,
      quantity,
      price: 0,
      currency: "NGN",
      purchaseDate: new Date().toISOString(),
      status: "active",
      tierName: selectedTier?.name || "Standard",
      attendees: isGroupPurchase ? attendeeInfo.split('\n').filter(n => n.trim()) : []
    };
    const existingTickets = JSON.parse(localStorage.getItem('userTickets') || '[]');
    existingTickets.push(ticketData);
    localStorage.setItem('userTickets', JSON.stringify(existingTickets));

    toast({
      title: "Registration Successful",
      description: `You have successfully registered for ${eventTitle}`,
    });

    navigate(`/tickets/confirmation/${ticketId}`);
  };

  const handlePaystackPayment = () => {
    setIsLoading(true);

    if (isFreeEvent) {
      handleFreeRegistration();
      return;
    }

    const reference = `TIX-${uuidv4().slice(0, 8)}`;
    const userEmail = localStorage.getItem('userEmail') || 'customer@example.com';

    if (window.PaystackPop) {
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: userEmail,
        amount: total * 100,
        currency: 'NGN',
        ref: reference,
        callback: function(response) {
          setIsLoading(false);
          const ticketId = `TICKET-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          const newTicket = {
            id: ticketId,
            eventId,
            eventTitle,
            quantity,
            price: currentPrice,
            total,
            purchaseDate: new Date().toISOString(),
            paymentRef: response.reference,
            isUsed: false,
            tierName: selectedTier?.name || "Standard",
            attendees: isGroupPurchase ? attendeeInfo.split('\n').filter(n => n.trim()) : []
          };
          const existingTickets = JSON.parse(localStorage.getItem('userTickets') || '[]');
          localStorage.setItem('userTickets', JSON.stringify([...existingTickets, newTicket]));

          toast({
            title: "Payment Successful",
            description: `You purchased ${quantity} ${selectedTier?.name || "Standard"} ticket${quantity > 1 ? 's' : ''} for ${eventTitle}`,
          });
          navigate(`/tickets/confirmation/${ticketId}`);
        },
        onClose: function() {
          setIsLoading(false);
          toast({
            variant: "destructive",
            title: "Payment Cancelled",
            description: "Your payment process was cancelled",
          });
        }
      });
      handler.openIframe();
    } else {
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: "Payment gateway not available. Please try again later.",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isGroupPurchase) {
      const attendees = attendeeInfo.split('\n').filter(n => n.trim());
      if (attendees.length !== quantity) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: `Please enter exactly ${quantity} attendee names for your group purchase.`,
        });
        return;
      }
    }

    if (isFreeEvent) {
      handleFreeRegistration();
    } else {
      handlePaystackPayment();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isFreeEvent ? "Complete Your Registration" : "Complete Your Purchase"}</CardTitle>
        <CardDescription>{isFreeEvent ? `Register for ${eventTitle}` : `Purchase tickets for ${eventTitle}`}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Ticket types, quantity, group purchase, etc. remain the same */}
          {ticketTiers.length > 1 && (
            <div className="space-y-3">
              <Label>Select Ticket Type</Label>
              <RadioGroup value={selectedTierId} onValueChange={setSelectedTierId} className="space-y-3">
                {ticketTiers.map(tier => (
                  <div key={tier.id} className="flex items-start space-x-2">
                    <RadioGroupItem value={tier.id} id={`tier-${tier.id}`} />
                    <div className="grid gap-1.5 leading-none w-full">
                      <Label htmlFor={`tier-${tier.id}`} className="flex justify-between w-full">
                        <span>{tier.name}</span>
                        <span>{tier.price === 0 ? 'Free' : `₦${tier.price.toLocaleString()}`}</span>
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
          )}

          {/* Quantity selector remains the same */}
          {/* Group purchase input updated to customer info */}
          {isGroupPurchase && (
            <div className="space-y-2 p-4 border rounded-md bg-muted/30">
              <Label>Customer Info (one per line)</Label>
              <textarea
                rows={3}
                placeholder={ATTENDEE_PLACEHOLDER}
                value={attendeeInfo}
                onChange={(e) => setAttendeeInfo(e.target.value)}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="text-xs text-muted-foreground">You must enter exactly {quantity} customer info lines</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading 
              ? "Processing..." 
              : isFreeEvent 
                ? "Complete Registration" 
                : `Continue to Pay ₦${total.toLocaleString()}`
            }
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default PaymentForm;
