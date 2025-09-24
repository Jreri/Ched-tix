import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Plus, Tag, Ticket, Users } from "lucide-react";
import Navbar from "@/components/Navbar";

// Configurable constants
const DEFAULT_TOTAL_EVENTS = 0;
const DEFAULT_PUBLISHED_EVENTS = 0;
const DEFAULT_TOTAL_TICKETS = 0;
const DEFAULT_TOTAL_CAPACITY = 0;
const DEFAULT_SOLD_TICKETS = 0;
const DEFAULT_TOTAL_REVENUE = 0;

const AdminDashboardPage = () => {
  const totalEvents = DEFAULT_TOTAL_EVENTS;
  const publishedEvents = DEFAULT_PUBLISHED_EVENTS;
  const totalTicketsAvailable = DEFAULT_TOTAL_TICKETS;
  const totalCapacity = DEFAULT_TOTAL_CAPACITY;
  const soldTickets = DEFAULT_SOLD_TICKETS;
  const totalRevenue = DEFAULT_TOTAL_REVENUE;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isAdmin={true} />
      
      <main className="container px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Link to="/admin/events/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
          </Link>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦0</div>
              <p className="text-xs text-muted-foreground">
                No revenue yet
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEvents}</div>
              <p className="text-xs text-muted-foreground">
                {publishedEvents} published, {totalEvents - publishedEvents} draft
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Ticket Sales</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                No tickets sold yet
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Unique Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                No customers yet
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Events */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Events</h2>
            <Link to="/admin/events" className="text-primary hover:underline text-sm">
              View all events
            </Link>
          </div>
          
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No events created yet</p>
                <Link to="/admin/events/new" className="mt-2 inline-block">
                  <Button variant="outline" size="sm" className="mt-2">
                    <Plus className="h-4 w-4 mr-1" /> Create Your First Event
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>
              Ticket sales for the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <BarChart className="mx-auto h-16 w-16 opacity-50" />
                <p>No data available</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
