import { useState } from "react";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MoreVertical, UserPlus, Filter, Download, Eye, Edit, UserCog, Ticket } from "lucide-react";
import Navbar from "@/components/Navbar";

// ----- CONFIGURABLE CONSTANTS -----
const DEFAULT_USERS: { id: string; name: string; email: string; eventsAttended: number; ticketsPurchased: number; lastActive: string }[] = [];
const DEFAULT_ACTIVITIES: { id: string; userId: string; type: string; eventName: string | null; date: string; details: string }[] = [];

const AdminUsersPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("customers");

  const users = DEFAULT_USERS;
  const activities = DEFAULT_ACTIVITIES;

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredActivities = activities.filter(activity => {
    const user = users.find(u => u.id === activity.userId);
    return (
      (user && user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (activity.eventName && activity.eventName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      activity.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.details.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getActivityBadge = (type: string) => {
    switch (type) {
      case "ticket_purchase":
        return <Badge className="bg-green-500">Ticket Purchase</Badge>;
      case "event_attendance":
        return <Badge className="bg-blue-500">Event Attendance</Badge>;
      case "profile_update":
        return <Badge className="bg-yellow-500">Profile Update</Badge>;
      default:
        return <Badge>Other</Badge>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isAdmin={true} />
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Customer Management</h1>
            <p className="text-muted-foreground">Monitor customer activities and manage user accounts</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button className="flex items-center">
              <UserPlus className="h-4 w-4 mr-2" /> Add New Customer
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search customers..." 
              className="pl-8" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex items-center">
              <Filter className="h-4 w-4 mr-1" /> Filter
            </Button>
            <Button variant="outline" size="sm" className="flex items-center">
              <Download className="h-4 w-4 mr-1" /> Export
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="customers" value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
          </TabsList>
          
          <TabsContent value="customers">
            <Card>
              <CardHeader>
                <CardTitle>Customer Accounts</CardTitle>
                <CardDescription>Manage and monitor customer accounts in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="text-center">Events Attended</TableHead>
                      <TableHead className="text-center">Tickets Purchased</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No customers found matching your search
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user, index) => (
                        <TableRow key={user.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={`https://ui-avatars.com/api/?name=${user.name.replace(" ", "+")}`} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-xs text-muted-foreground">{user.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">{user.eventsAttended}</TableCell>
                          <TableCell className="text-center">{user.ticketsPurchased}</TableCell>
                          <TableCell>{user.lastActive}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="flex items-center">
                                  <Eye className="h-4 w-4 mr-2" /> View Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center">
                                  <Edit className="h-4 w-4 mr-2" /> Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center">
                                  <Ticket className="h-4 w-4 mr-2" /> View Tickets
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center">
                                  <UserCog className="h-4 w-4 mr-2" /> Manage Permissions
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="activities">
            <Card>
              <CardHeader>
                <CardTitle>Customer Activities</CardTitle>
                <CardDescription>Recent customer activities in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredActivities.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          No activities found matching your search
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredActivities.map((activity, index) => {
                        const user = users.find(u => u.id === activity.userId);
                        return (
                          <TableRow key={activity.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={`https://ui-avatars.com/api/?name=${user?.name.replace(" ", "+")}`} />
                                  <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{user?.name}</div>
                                  <div className="text-xs text-muted-foreground">{user?.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{getActivityBadge(activity.type)}</TableCell>
                            <TableCell>{activity.eventName || "-"}</TableCell>
                            <TableCell>{activity.date}</TableCell>
                            <TableCell>{activity.details}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="flex items-center">
                                    <Eye className="h-4 w-4 mr-2" /> View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="flex items-center">
                                    <UserCog className="h-4 w-4 mr-2" /> View Customer
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminUsersPage;
