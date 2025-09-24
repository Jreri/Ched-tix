import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import QRScanner from "@/components/QRScanner";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Clock, Calendar, MapPin, User, CheckCircle2, XCircle,
  Ticket, Search, RefreshCw, Camera, Mail, School
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockEvents } from "@/services/mockData";

interface TicketData {
  ticketId: string;
  eventId: string;
  uniqueCode?: string;
  student?: { name: string; email: string; studentId: string };
  timestamp: string;
  alreadyUsed?: boolean;
}

interface ScannedAttendance {
  ticketId: string;
  eventId: string;
  uniqueCode: string;
  studentName: string;
  studentEmail: string;
  studentId: string;
  scannedAt: string;
  eventTitle: string;
}

const ScanAttendancePage = () => {
  const [activeTab, setActiveTab] = useState<"scanner" | "manual">("scanner");
  const [manualCode, setManualCode] = useState("");
  const [scannedTicket, setScannedTicket] = useState<TicketData | null>(null);
  const [validationStatus, setValidationStatus] = useState<"valid" | "invalid" | "pending" | null>(null);
  const [scanning, setScanning] = useState(true);
  const [scannedHistory, setScannedHistory] = useState<ScannedAttendance[]>([]);
  const { toast } = useToast();

  // Load scanned history on mount
  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem("scannedHistory") || "[]");
    setScannedHistory(savedHistory);
  }, []);

  const saveScannedHistory = (history: ScannedAttendance[]) => {
    localStorage.setItem("scannedHistory", JSON.stringify(history));
    setScannedHistory(history);
  };

  const saveScannedTicket = (ticket: TicketData) => {
    const scannedTickets = JSON.parse(localStorage.getItem("scannedTickets") || "[]");
    scannedTickets.push({
      ticketId: ticket.ticketId,
      eventId: ticket.eventId,
      uniqueCode: ticket.uniqueCode,
      scannedAt: new Date().toISOString()
    });
    localStorage.setItem("scannedTickets", JSON.stringify(scannedTickets));
  };

  const validateTicket = (ticket: TicketData) => {
    if (ticket.alreadyUsed) return Promise.resolve({ valid: false, message: "This ticket has already been used" });

    const scannedTickets = JSON.parse(localStorage.getItem("scannedTickets") || "[]");
    const alreadyScanned = scannedTickets.some(
      (t: any) => t.ticketId === ticket.ticketId && t.eventId === ticket.eventId || (ticket.uniqueCode && t.uniqueCode === ticket.uniqueCode)
    );
    if (alreadyScanned) return Promise.resolve({ valid: false, message: "This ticket has already been scanned" });

    const userTickets = JSON.parse(localStorage.getItem("userTickets") || "[]");
    const ticketExists = userTickets.some((t: any) => t.id === ticket.ticketId);
    if (!ticketExists) return Promise.resolve({ valid: false, message: "Invalid ticket ID" });

    return Promise.resolve({ valid: true, message: "Ticket valid" });
  };

  const handleScan = async (ticket: TicketData) => {
    setScannedTicket(ticket);
    setValidationStatus("pending");
    setScanning(false);

    try {
      const result = await validateTicket(ticket);

      if (result.valid) {
        saveScannedTicket(ticket);

        const userTickets = JSON.parse(localStorage.getItem("userTickets") || "[]");
        const updatedTickets = userTickets.map((t: any) => t.id === ticket.ticketId ? { ...t, status: "used" } : t);
        localStorage.setItem("userTickets", JSON.stringify(updatedTickets));

        const event = mockEvents.find(e => e.id === ticket.eventId);
        const newHistoryItem: ScannedAttendance = {
          ticketId: ticket.ticketId,
          eventId: ticket.eventId,
          uniqueCode: ticket.uniqueCode || "N/A",
          studentName: ticket.student?.name || "Unknown",
          studentEmail: ticket.student?.email || "Unknown",
          studentId: ticket.student?.studentId || "Unknown",
          scannedAt: new Date().toISOString(),
          eventTitle: event?.title || "Unknown Event"
        };

        saveScannedHistory([newHistoryItem, ...scannedHistory]);
        setValidationStatus("valid");

        toast({ title: "Ticket Validated", description: `${ticket.student?.name || "Student"} successfully checked in`, variant: "default" });
      } else {
        setValidationStatus("invalid");
        toast({ title: "Invalid Ticket", description: result.message, variant: "destructive" });
      }
    } catch {
      setValidationStatus("invalid");
      toast({ title: "Validation Error", description: "An error occurred while validating the ticket", variant: "destructive" });
    }
  };

  const handleManualSubmit = () => {
    if (!manualCode.trim()) return toast({ title: "Empty Code", description: "Please enter a ticket code", variant: "destructive" });

    const scannedTickets = JSON.parse(localStorage.getItem("scannedTickets") || "[]");
    if (scannedTickets.some((t: any) => t.uniqueCode === manualCode.trim())) {
      return toast({ title: "Already Used", description: "This code has already been used", variant: "destructive" });
    }

    const userTickets = JSON.parse(localStorage.getItem("userTickets") || "[]");
    const codeParts = manualCode.trim().split("-");
    let foundTicket = null;

    if (codeParts.length === 3) {
      const [eventIdPart, ticketIdPart] = codeParts;
      foundTicket = userTickets.find((t: any) => t.id.startsWith(ticketIdPart) || t.eventId.startsWith(eventIdPart));
    }

    const ticketData: TicketData = foundTicket
      ? {
          ticketId: foundTicket.id,
          eventId: foundTicket.eventId,
          uniqueCode: manualCode.trim(),
          student: { name: foundTicket.attendeeName || "Student", email: foundTicket.attendeeEmail || "", studentId: foundTicket.attendeeStudentId || "" },
          timestamp: new Date().toISOString()
        }
      : {
          ticketId: `unknown-${Date.now()}`,
          eventId: "unknown",
          uniqueCode: manualCode.trim(),
          student: { name: "Unknown", email: "", studentId: "" },
          timestamp: new Date().toISOString()
        };

    handleScan(ticketData);
    setManualCode("");
  };

  const resetScan = () => {
    setScannedTicket(null);
    setValidationStatus(null);
    setScanning(true);
    setManualCode("");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isAdmin />
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-2">Scan Attendance</h1>
        <p className="text-muted-foreground mb-8">Scan ticket QR codes to validate attendance</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            {/* Scanner & Manual Entry Card */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Scan or Enter Ticket Code</CardTitle>
                <CardDescription>Validate attendee's tickets with QR code or manual entry</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "scanner" | "manual")}>
                  <TabsList className="mb-6">
                    <TabsTrigger value="scanner">QR Scanner</TabsTrigger>
                    <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                  </TabsList>

                  <TabsContent value="scanner">
                    {scanning ? <QRScanner onScan={handleScan} /> : (
                      <div className="text-center py-10">
                        <Button onClick={resetScan}><RefreshCw className="mr-2 h-4 w-4" /> Scan Another Ticket</Button>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="manual">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Input
                          placeholder="Enter ticket code..."
                          value={manualCode}
                          onChange={(e) => setManualCode(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()}
                        />
                        <Button onClick={handleManualSubmit}><Search className="mr-2 h-4 w-4" /> Verify</Button>
                      </div>
                      <div className="text-sm text-muted-foreground">Enter the unique code printed on the ticket</div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter>
                <div className="text-sm text-muted-foreground">
                  <p className="mb-2">Instructions:</p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Hold the ticket QR code in front of the camera</li>
                    <li>Ensure good lighting for better scanning</li>
                    <li>Keep the QR code steady until scanned</li>
                    <li>Verification results will appear on the right</li>
                    <li>If QR scanning fails, use manual code entry</li>
                  </ol>
                </div>
              </CardFooter>
            </Card>

            {/* Recent Scans */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Scans</CardTitle>
                <CardDescription>Most recent attendance verifications</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  {scannedHistory.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No scan history yet.</div>
                  ) : (
                    <div className="space-y-4">
                      {scannedHistory.map((scan, index) => (
                        <Card key={index} className="bg-muted/50">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="font-medium">{scan.studentName}</div>
                              <div className="text-xs text-muted-foreground">{new Date(scan.scannedAt).toLocaleTimeString()}</div>
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center"><Mail className="h-3 w-3 mr-1" /> {scan.studentEmail}</div>
                            <div className="text-sm text-muted-foreground flex items-center"><School className="h-3 w-3 mr-1" /> {scan.studentId}</div>
                            <div className="text-xs mt-2 text-primary">{scan.eventTitle}</div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Ticket Info / Waiting Card */}
          <div>
            {scannedTicket ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Ticket Information
                    {validationStatus === "valid" && <CheckCircle2 className="h-6 w-6 text-green-500" />}
                    {validationStatus === "invalid" && <XCircle className="h-6 w-6 text-red-500" />}
                  </CardTitle>
                  <CardDescription>
                    {validationStatus === "pending" && "Validating ticket..."}
                    {validationStatus === "valid" && "This ticket is valid and has been checked in"}
                    {validationStatus === "invalid" && "This ticket is invalid or has already been used"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const event = mockEvents.find(e => e.id === scannedTicket.eventId);
                    if (!event) {
                      return <Alert variant="destructive"><AlertTitle>Event Not Found</AlertTitle><AlertDescription>The event associated with this ticket could not be found.</AlertDescription></Alert>;
                    }
                    return (
                      <div className="space-y-6">
                        <Alert variant={validationStatus === "valid" ? "default" : validationStatus === "invalid" ? "destructive" : "default"}>
                          <AlertTitle>
                            {validationStatus === "valid" && "Successfully Checked In"}
                            {validationStatus === "invalid" && "Check-in Failed"}
                            {validationStatus === "pending" && "Verifying Ticket"}
                          </AlertTitle>
                          <AlertDescription>
                            Ticket ID: {scannedTicket.ticketId}
                            {scannedTicket.uniqueCode && <div className="mt-1">Code: {scannedTicket.uniqueCode}</div>}
                          </AlertDescription>
                        </Alert>

                        <div className="space-y-4">
                          <div>
                            <h3 className="text-lg font-medium">{event.title}</h3>
                            <div className="text-sm text-muted-foreground mt-1 flex items-center"><Calendar className="mr-1 h-4 w-4" /> {event.date}</div>
                            <div className="text-sm text-muted-foreground mt-1 flex items-center"><Clock className="mr-1 h-4 w-4" /> {event.time}</div>
                            <div className="text-sm text-muted-foreground mt-1 flex items-center"><MapPin className="mr-1 h-4 w-4" /> {event.location}</div>
                          </div>

                          {scannedTicket.student && (
                            <div className="bg-muted p-4 rounded-lg space-y-2">
                              <h4 className="font-medium flex items-center"><User className="mr-1 h-4 w-4" /> Student Information</h4>
                              <div className="text-sm">
                                <div><span className="font-medium">Name:</span> {scannedTicket.student.name}</div>
                                <div><span className="font-medium">Email:</span> {scannedTicket.student.email}</div>
                                <div><span className="font-medium">ID:</span> {scannedTicket.student.studentId}</div>
                              </div>
                            </div>
                          )}

                          <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between"><div className="text-sm font-medium">Ticket ID:</div><div className="text-sm">{scannedTicket.ticketId}</div></div>
                            <div className="flex justify-between"><div className="text-sm font-medium">Event ID:</div><div className="text-sm">{scannedTicket.eventId}</div></div>
                            <div className="flex justify-between"><div className="text-sm font-medium">Scanned At:</div><div className="text-sm">{new Date().toLocaleString()}</div></div>
                          </div>

                          <Button className="w-full" onClick={resetScan}><Camera className="mr-2 h-4 w-4" /> Scan Another Ticket</Button>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Waiting for Scan</CardTitle>
                  <CardDescription>Scan a ticket QR code or enter a ticket code to see the validation results here</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Ticket className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <p className="text-center text-muted-foreground">No ticket scanned yet. Use the scanner or enter a ticket code manually.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanAttendancePage;
