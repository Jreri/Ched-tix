import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Paystack public key configuration
const PAYSTACK_PUBLIC_KEY = 'pk_live_95335e54994e0c9971ecec85883cc3055cd9f23e';

// Type definition for purchase info
interface PurchaseInfo {
  eventId: string;
  eventTitle: string;
  ticketPrice: number;
  total: number;
  quantity: number;
  currency?: string;
  ticketTierName?: string;
  eventImage: string;
}

const formatCurrency = (amount: number, currency = "NGN") => {
  const symbols = { NGN: "₦", USD: "$", EUR: "€", GBP: "£" };
  return `${symbols[currency as keyof typeof symbols] || "₦"}${amount.toLocaleString()}`;
};

const PaymentPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [purchaseInfo, setPurchaseInfo] = useState<PurchaseInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const purchaseData = sessionStorage.getItem("purchaseInfo");
    if (!purchaseData) {
      toast({
        title: "No purchase information found",
        description: "Please select an event and tickets first",
        variant: "destructive",
      });
      navigate("/events");
      return;
    }

    const parsedData: PurchaseInfo = JSON.parse(purchaseData);

    if (parsedData.ticketPrice === 0 || parsedData.total === 0) {
      toast({
        title: "Free Event",
        description: "This is a free event. No payment required.",
      });
      navigate(`/events/${parsedData.eventId}`);
      return;
    }

    setPurchaseInfo(parsedData);
  }, [navigate, toast]);

  const handlePaymentSuccess = () => {
    if (!purchaseInfo) return;

    const studentProfile = JSON.parse(localStorage.getItem("studentProfile") || "{}");
    const studentInfo = {
      name: studentProfile.fullName || "Student",
      email: studentProfile.email || localStorage.getItem("userEmail") || "",
      studentId: studentProfile.studentId || "",
    };

    const ticketId = `TICKET-${Math.floor(Math.random() * 1000000).toString().padStart(6, "0")}`;

    const ticketData = {
      id: ticketId,
      eventId: purchaseInfo.eventId,
      eventTitle: purchaseInfo.eventTitle,
      quantity: purchaseInfo.quantity,
      price: purchaseInfo.ticketPrice,
      currency: purchaseInfo.currency || "NGN",
      purchaseDate: new Date().toISOString(),
      status: "active",
      eventImage: purchaseInfo.eventImage,
      tierName: purchaseInfo.ticketTierName || "Standard",
      attendeeName: studentInfo.name,
      attendeeEmail: studentInfo.email,
      attendeeStudentId: studentInfo.studentId,
    };

    const existingTickets = JSON.parse(localStorage.getItem("userTickets") || "[]");
    existingTickets.push(ticketData);
    localStorage.setItem("userTickets", JSON.stringify(existingTickets));

    navigate(`/tickets/confirmation/${ticketId}`);
  };

  const handleInitiatePaystack = () => {
    if (!purchaseInfo) return;

    setIsLoading(true);

    const paystackHandler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: localStorage.getItem("userEmail") || "customer@example.com",
      amount: purchaseInfo.total * 100,
      currency: "NGN",
      ref: "TIX_" + Math.floor(Math.random() * 1000000000),
      callback: function (response: any) {
        toast({
          title: "Payment Successful",
          description: `Payment reference: ${response.reference}`,
        });
        setIsLoading(false);
        handlePaymentSuccess();
      },
      onClose: function () {
        toast({
          title: "Payment Cancelled",
          description: "You have cancelled the payment",
          variant: "destructive",
        });
        setIsLoading(false);
      },
    });

    paystackHandler.openIframe();
  };

  const handleCancel = () => {
    navigate(`/events/${purchaseInfo?.eventId || ""}`);
  };

  if (!purchaseInfo) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <p className="ml-4">Loading purchase information...</p>
          </div>
        </div>
      </div>
    );
  }

  const currency = purchaseInfo.currency || "NGN";
  const ticketTierName = purchaseInfo.ticketTierName || "Standard";
  const subtotal = purchaseInfo.ticketPrice * purchaseInfo.quantity;
  const serviceFee = purchaseInfo.total - subtotal;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container px-4 py-8" aria-busy={isLoading}>
        <div className="mb-6">
          <Button variant="ghost" onClick={handleCancel} className="px-0 hover:bg-transparent" disabled={isLoading}>
            &larr; Back to Event
          </Button>
          <h1 className="text-3xl font-bold mt-4">Complete Your Purchase</h1>
          <p className="text-muted-foreground">
            You're purchasing {purchaseInfo.quantity} {ticketTierName} ticket{purchaseInfo.quantity > 1 ? "s" : ""} for {purchaseInfo.eventTitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-3">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Ticket Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Ticket Type</span>
                    <div className="font-medium">{ticketTierName}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Number of Tickets</span>
                    <div className="font-medium">{purchaseInfo.quantity}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Price per Ticket</span>
                    <div className="font-medium">{formatCurrency(purchaseInfo.ticketPrice, currency)}</div>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <div className="font-medium">Order Summary</div>
                  <div className="text-sm">
                    <div className="flex justify-between py-1">
                      <span>Subtotal</span>
                      <span>{formatCurrency(subtotal, currency)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Service Fee</span>
                      <span>{formatCurrency(serviceFee, currency)}</span>
                    </div>
                    <div className="flex justify-between py-1 font-medium">
                      <span>Total</span>
                      <span>{formatCurrency(purchaseInfo.total, currency)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleInitiatePaystack} className="w-full" disabled={isLoading}>
                  {isLoading ? "Redirecting to Paystack..." : `Pay ${formatCurrency(purchaseInfo.total, currency)}`}
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="md:col-span-2">
            <div className="rounded-lg overflow-hidden mb-4">
              <img src={purchaseInfo.eventImage} alt={purchaseInfo.eventTitle} className="w-full h-auto object-cover" />
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-medium mb-2">Event Details</h3>
              <div className="space-y-2 text-sm">
                <div className="font-medium">{purchaseInfo.eventTitle}</div>
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span className="font-medium">{formatCurrency(purchaseInfo.total, currency)}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-4">
                  By completing this purchase, you agree to our terms and conditions. Your payment will be processed securely via Paystack.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentPage;
