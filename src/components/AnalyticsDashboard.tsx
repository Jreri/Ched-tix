import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  BarChart,
  LineChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from "recharts";
import { mockEvents, mockUsers, mockTickets } from "@/services/mockData";
import { DateRangeFilter } from "@/components/DateRangeFilter";
import { useDataExport, ExportFormat } from "@/hooks/use-data-export";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { FileDown, RefreshCw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { TimeRange } from "@/types/analytics";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { User, Ticket, Event } from "@/types";

// Chart colors
const COLORS = ["#8b5cf6", "#10b981", "#3b82f6"];
const TICKET_TYPE_COLORS = { standard: "#8b5cf6", vip: "#3b82f6", earlybird: "#10b981" };

const chartConfig = {
  sales: { label: "Tickets Sold", theme: { light: "#8b5cf6", dark: "#a78bfa" } },
  revenue: { label: "Revenue", theme: { light: "#10b981", dark: "#34d399" } },
  attendees: { label: "Attendees", theme: { light: "#3b82f6", dark: "#60a5fa" } }
};

const AnalyticsDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>("7days");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const { exportData } = useDataExport();

  // Loading simulation
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, [refreshKey]);

  // Filter events by search and date
  const filteredEvents = mockEvents.filter(event => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!event.title.toLowerCase().includes(q) &&
          !(event.descriptionShort?.toLowerCase().includes(q)) &&
          !(event.location?.toLowerCase().includes(q))) return false;
    }
    const eventDate = event.date ? new Date(event.date) : undefined;
    if (startDate && eventDate && eventDate < startDate) return false;
    if (endDate && eventDate && eventDate > endDate) return false;
    return true;
  });

  const filteredTickets = mockTickets.filter(ticket => {
    if (!filteredEvents.find(e => e.id === ticket.eventId)) return false;
    const ticketDate = ticket.purchaseDate ? new Date(ticket.purchaseDate) : undefined;
    if (startDate && ticketDate && ticketDate < startDate) return false;
    if (endDate && ticketDate && ticketDate > endDate) return false;
    return true;
  });

  const handleDateRangeChange = (start?: Date, end?: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleRefresh = () => setRefreshKey(prev => prev + 1);

  const handleExport = (format: ExportFormat) => {
    const salesData = generateDailySalesData(filteredTickets, startDate, endDate);
    const rangeText = startDate && endDate
      ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
      : "All time";
    exportData(salesData, format, {
      filename: `analytics-export-${new Date().toISOString().split("T")[0]}`,
      title: "Event Analytics Report",
      subtitle: `Date Range: ${rangeText}`
    });
  };

  // Helper: generate daily sales
  const generateDailySalesData = (tickets: Ticket[], start?: Date, end?: Date) => {
    const salesByDate = new Map<string, { sales: number; revenue: number }>();
    const s = start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const e = end || new Date();
    let current = new Date(s);
    while (current <= e) {
      const key = current.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      salesByDate.set(key, { sales: 0, revenue: 0 });
      current.setDate(current.getDate() + 1);
    }
    tickets.forEach(ticket => {
      if (!ticket.purchaseDate) return;
      const d = new Date(ticket.purchaseDate);
      if (d >= s && d <= e) {
        const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const curr = salesByDate.get(key) || { sales: 0, revenue: 0 };
        curr.sales += 1;
        curr.revenue += ticket.price || 0;
        salesByDate.set(key, curr);
      }
    });
    return Array.from(salesByDate.entries()).map(([date, data]) => ({ date, ...data }));
  };

  // Category data
  const generateCategoryData = (events: Event[], tickets: Ticket[]) => {
    const map = new Map<string, { name: string; tickets: number; revenue: number; events: number }>();
    events.forEach(e => {
      const cat = e.category || "Uncategorized";
      map.set(cat, { name: cat, tickets: 0, revenue: 0, events: (map.get(cat)?.events || 0) + 1 });
    });
    tickets.forEach(t => {
      const e = events.find(ev => ev.id === t.eventId);
      if (!e) return;
      const cat = e.category || "Uncategorized";
      const data = map.get(cat) || { name: cat, tickets: 0, revenue: 0, events: 0 };
      data.tickets += 1;
      data.revenue += t.price || 0;
      map.set(cat, data);
    });
    return Array.from(map.values());
  };

  // Ticket type
  const generateTicketTypeData = (tickets: Ticket[]) => {
    const count = tickets.reduce((acc, t) => {
      const type = t.ticketType || "standard";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const total = Object.values(count).reduce((sum, c) => sum + c, 0);
    return Object.entries(count).map(([name, value]) => ({
      name,
      value,
      percentage: total ? Math.round((value / total) * 100) : 0,
      color: TICKET_TYPE_COLORS[name as keyof typeof TICKET_TYPE_COLORS] || COLORS[0]
    }));
  };

  // Demographics
  const generateDemographicsData = (users: User[], tickets: Ticket[]) => {
    const userIds = new Set(tickets.map(t => t.userId));
    const ticketUsers = users.filter(u => userIds.has(u.id));
    const deptCount = ticketUsers.reduce((acc, u) => {
      const dept = u.department || "Unknown";
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const total = Object.values(deptCount).reduce((sum, c) => sum + c, 0);
    return Object.entries(deptCount)
      .map(([name, value]) => ({ name, value, percentage: total ? Math.round((value / total) * 100) : 0 }))
      .sort((a, b) => b.value - a.value);
  };

  // Top events
  const generateTopEvents = (events: Event[], tickets: Ticket[]) => {
    const soldMap = tickets.reduce((acc, t) => {
      acc[t.eventId] = (acc[t.eventId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return events
      .map(e => {
        const sold = soldMap[e.id] || 0;
        return {
          id: e.id,
          title: e.title,
          date: e.date ? new Date(e.date).toLocaleDateString() : "No date",
          price: e.price || 0,
          soldTickets: sold,
          capacity: e.capacity || 0,
          percentageSold: e.capacity ? Math.round((sold / e.capacity) * 100) : 0
        };
      })
      .sort((a, b) => b.percentageSold - a.percentageSold)
      .slice(0, 5);
  };

  // Derived values
  const totalTicketsSold = filteredTickets.length;
  const totalRevenue = filteredTickets.reduce((sum, t) => sum + (t.price || 0), 0);
  const usedTickets = filteredTickets.filter(t => t.status === "used").length;
  const attendanceRate = totalTicketsSold ? Math.round((usedTickets / totalTicketsSold) * 100) : 0;

  const salesData = generateDailySalesData(filteredTickets, startDate, endDate);
  const categoryData = generateCategoryData(filteredEvents, filteredTickets);
  const ticketTypeData = generateTicketTypeData(filteredTickets);
  const demographicsData = generateDemographicsData(mockUsers, filteredTickets);
  const topEvents = generateTopEvents(filteredEvents, filteredTickets);

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <SearchBar placeholder="Search events..." onSearch={setSearchQuery} />
        <div className="flex flex-col sm:flex-row gap-2">
          <DateRangeFilter onFilterChange={handleDateRangeChange} />
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">Refresh data</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <FileDown className="h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport("csv")}>CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("pdf")}>PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {isLoading ? (
              [1, 2, 3].map(i => (
                <Card key={i}>
                  <CardHeader className="pb-2"><Skeleton className="h-5 w-[140px]" /></CardHeader>
                  <CardContent>
                    <Skeleton className="h-7 w-[70px]" />
                    <Skeleton className="h-4 w-[100px] mt-2" />
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                <Card>
                  <CardHeader><CardTitle className="text-sm font-medium">Total Tickets Sold</CardTitle></CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalTicketsSold}</div>
                    <p className="text-xs text-muted-foreground">
                      {searchQuery ? `Matching: ${searchQuery}` : "Across all events"}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-sm font-medium">Total Revenue</CardTitle></CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₦{totalRevenue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      From {filteredEvents.length} events
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-sm font-medium">Attendance Rate</CardTitle></CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{attendanceRate}%</div>
                    <p className="text-xs text-muted-foreground">Based on used tickets</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Sales Trends */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:justify-between gap-2">
                <div>
                  <CardTitle>Sales Trends</CardTitle>
                  <CardDescription>Ticket sales over time</CardDescription>
                </div>
                <Tabs defaultValue={timeRange} onValueChange={v => setTimeRange(v as TimeRange)}>
                  <TabsList>
                    <TabsTrigger value="7days">7 days</TabsTrigger>
                    <TabsTrigger value="30days">30 days</TabsTrigger>
                    <TabsTrigger value="3months">3 months</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              <AspectRatio ratio={16 / 6} className="mt-4">
                {isLoading ? <Skeleton className="h-full w-full" /> : (
                  <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={salesData} margin={{ top: 5, right: 30, left: 20, bottom: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#efefef" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="sales" strokeWidth={2} stroke="var(--color-sales, #8b5cf6)" activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </AspectRatio>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-6">
          {/* Revenue Bar Chart */}
          <Card>
            <CardHeader><CardTitle>Revenue Over Time</CardTitle><CardDescription>Daily revenue</CardDescription></CardHeader>
            <CardContent>
              <AspectRatio ratio={16 / 6} className="mt-4">
                {isLoading ? <Skeleton className="h-full w-full" /> : (
                  <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={salesData} margin={{ top: 5, right: 30, left: 20, bottom: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#efefef" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="revenue" fill="var(--color-revenue, #10b981)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </AspectRatio>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Sales by Category</CardTitle><CardDescription>Ticket sales by category</CardDescription></CardHeader>
            <CardContent>
              <AspectRatio ratio={16 / 6} className="mt-4">
                {isLoading ? <Skeleton className="h-full w-full" /> : (
                  <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryData} margin={{ top: 5, right: 30, left: 20, bottom: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#efefef" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="tickets" fill="var(--color-sales, #8b5cf6)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </AspectRatio>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
