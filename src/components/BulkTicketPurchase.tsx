import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Users, Upload, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface BulkTicketPurchaseProps {
  eventId: string;
  eventTitle: string;
  ticketPrice: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Configurable constants
const MIN_TICKETS = 5;
const MAX_TICKETS = 50;
const DISCOUNT_THRESHOLD = 10;
const DISCOUNT_RATE = 0.1;
const DEPARTMENTS = [
  { value: "computerScience", label: "Computer Science" },
  { value: "business", label: "Business Administration" },
  { value: "engineering", label: "Engineering" },
  { value: "law", label: "Law" },
  { value: "medicine", label: "Medicine" },
];

const BulkTicketPurchase = ({ 
  eventId, 
  eventTitle, 
  ticketPrice, 
  onSuccess, 
  onCancel 
}: BulkTicketPurchaseProps) => {
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(MIN_TICKETS);
  const [customerIds, setCustomerIds] = useState("");
  const [department, setDepartment] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadMode, setUploadMode] = useState<"manual" | "file">("manual");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!department) {
      toast({
        title: "Department is required",
        description: "Please select a department before proceeding",
        variant: "destructive",
      });
      return;
    }
    
    if (uploadMode === "manual") {
      const idList = customerIds
        .split("\n")
        .map(id => id.trim())
        .filter(id => id.length > 0);
      
      if (idList.length !== quantity) {
        toast({
          title: "Invalid customer IDs",
          description: `You need to provide exactly ${quantity} customer IDs. Currently you have ${idList.length}.`,
          variant: "destructive",
        });
        return;
      }
    }
    
    setIsLoading(true);
    setTimeout(() => {
      toast({
        title: "Bulk Purchase Successful",
        description: `You have successfully purchased ${quantity} tickets for ${eventTitle}`,
      });
      
      setIsLoading(false);
      if (onSuccess) onSuccess();
    }, 2000);
  };
  
  const subtotal = ticketPrice * quantity;
  const discount = quantity >= DISCOUNT_THRESHOLD ? Math.round(subtotal * DISCOUNT_RATE) : 0;
  const total = subtotal - discount;
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Bulk Ticket Purchase
        </CardTitle>
        <CardDescription>Purchase multiple tickets for a group of customers</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map(dep => (
                    <SelectItem key={dep.value} value={dep.value}>{dep.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">Contact Person</Label>
                <Input 
                  id="contactName" 
                  placeholder="Name of group coordinator"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input 
                  id="contactEmail" 
                  type="email"
                  placeholder="Email of group coordinator"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="quantity">Number of Tickets</Label>
              <div className="text-sm text-muted-foreground">
                ₦{ticketPrice.toLocaleString()} each 
                {quantity >= DISCOUNT_THRESHOLD && <span className="text-green-600 ml-2">{DISCOUNT_RATE * 100}% discount applies</span>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                disabled={quantity <= MIN_TICKETS}
                onClick={() => setQuantity(prev => Math.max(MIN_TICKETS, prev - 1))}
              >
                -
              </Button>
              <Input
                id="quantity"
                type="number"
                min={MIN_TICKETS}
                max={MAX_TICKETS}
                value={quantity}
                onChange={(e) => setQuantity(Math.min(MAX_TICKETS, Math.max(MIN_TICKETS, parseInt(e.target.value) || MIN_TICKETS)))}
                className="text-center w-20"
              />
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                disabled={quantity >= MAX_TICKETS}
                onClick={() => setQuantity(prev => Math.min(MAX_TICKETS, prev + 1))}
              >
                +
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>Customer Information</Label>
              <div className="flex items-center gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  className={uploadMode === "manual" ? "bg-primary/10" : ""}
                  onClick={() => setUploadMode("manual")}
                >
                  Manual Entry
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  className={uploadMode === "file" ? "bg-primary/10" : ""}
                  onClick={() => setUploadMode("file")}
                >
                  Upload CSV
                </Button>
              </div>
            </div>
            
            {uploadMode === "manual" ? (
              <div className="space-y-2">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Customer IDs Required</AlertTitle>
                  <AlertDescription>
                    Enter exactly {quantity} customer IDs, one per line
                  </AlertDescription>
                </Alert>
                <Textarea 
                  placeholder={`Enter customer IDs, one per line`}
                  rows={6}
                  value={customerIds}
                  onChange={(e) => setCustomerIds(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {customerIds.split("\n").filter(id => id.trim().length > 0).length} of {quantity} customer IDs entered
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <Alert>
                  <Upload className="h-4 w-4" />
                  <AlertTitle>CSV File Format</AlertTitle>
                  <AlertDescription>
                    Upload a CSV file with the customer IDs in the first column
                  </AlertDescription>
                </Alert>
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag and drop your CSV file here, or click to browse
                  </p>
                  <Input id="csvUpload" type="file" className="w-full max-w-xs" />
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-2 pt-4 border-t">
            <div className="font-medium">Order Summary</div>
            <div className="text-sm">
              <div className="flex justify-between py-1">
                <span>Subtotal ({quantity} tickets)</span>
                <span>₦{subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between py-1 text-green-600">
                  <span>Bulk Discount ({DISCOUNT_RATE * 100}%)</span>
                  <span>-₦{discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between py-1 font-medium">
                <span>Total</span>
                <span>₦{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <Alert variant="default">
            <AlertTitle>Payment Information</AlertTitle>
            <AlertDescription>
              For bulk purchases over ₦50,000, an invoice can be generated and sent to your department for processing.
              Contact the finance office for more details.
            </AlertDescription>
          </Alert>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-2">
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : `Complete Purchase`}
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default BulkTicketPurchase;
