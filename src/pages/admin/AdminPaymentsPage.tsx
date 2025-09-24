import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { CalendarIcon, Search, TrendingUp, CreditCard } from "lucide-react";

const AdminPaymentsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [payments, setPayments] = useState([]);
  const [events, setEvents] = useState([]);
  
  useEffect(() => {
    const storedEvents = localStorage.getItem('events');
    const eventData = storedEvents ? JSON.parse(storedEvents) : [];
    setEvents(eventData);
    
    const paymentsData = JSON.parse(localStorage.getItem('payments') || '[]');
    setPayments(paymentsData);
  }, []);
  
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.eventTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.referenceId?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "successful") return matchesSearch && payment.status === "successful";
    if (activeTab === "failed") return matchesSearch && payment.status === "failed";
    return matchesSearch;
  });
  
  const paymentsByEvent = events.reduce((acc, event) => {
    acc[event.id] = {
      eventId: event.id,
      eventTitle: event.title,
      totalAmount: 0,
      transactionCount: 0,
      payments: []
    };
    return acc;
  }, {} as Record<string, any>);
  
  const totalRevenue = 0;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isAdmin={true} />
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-2">Payments & Revenue</h1>
        <p className="text-muted-foreground mb-8">Manage and track all payment transactions for events</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <CardDescription>
                Across all events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  ₦{totalRevenue.toLocaleString()}
                </div>
                <div className="bg-primary/10 p-2 rounded-full">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Successful Transactions
              </CardTitle>
              <CardDescription>
                Total number of completed purchases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  0
                </div>
                <div className="bg-green-100 p-2 rounded-full">
                  <CreditCard className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Average Transaction Value
              </CardTitle>
              <CardDescription>
                Per successful purchase
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  ₦0
                </div>
                <div className="bg-blue-100 p-2 rounded-full">
                  <CalendarIcon className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Transactions</TabsTrigger>
              <TabsTrigger value="successful">Successful</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search transactions..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Event</CardTitle>
              <CardDescription>
                Breakdown of earnings for each event
              </CardDescription>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <div className="text-center py-4">No events created yet</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Name</TableHead>
                      <TableHead className="text-right">Transactions</TableHead>
                      <TableHead className="text-right">Total Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event: any) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">{event.title}</TableCell>
                        <TableCell className="text-right">0</TableCell>
                        <TableCell className="text-right">₦0</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                All payment transactions sorted by date
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                No transaction data available yet.
                <p className="mt-2 text-sm">Payment records will appear here when customers purchase tickets.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentsPage;
