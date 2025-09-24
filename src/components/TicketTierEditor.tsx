import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus } from "lucide-react";
import { TicketTier } from "@/types";

// Configurable defaults
const DEFAULT_TICKET_CAPACITY = 100;
const DEFAULT_TICKET_AVAILABLE = 100;

interface TicketTierEditorProps {
  initialTiers?: TicketTier[];
  onChange: (tiers: TicketTier[]) => void;
}

const TicketTierEditor = ({ initialTiers = [], onChange }: TicketTierEditorProps) => {
  const [tiers, setTiers] = useState<TicketTier[]>(initialTiers.length > 0 ? initialTiers : [
    {
      id: `tier-${Date.now()}`,
      name: "Standard",
      price: 0,
      description: "Regular admission",
      capacity: DEFAULT_TICKET_CAPACITY,
      availableCount: DEFAULT_TICKET_AVAILABLE
    }
  ]);

  const handleAddTier = () => {
    const newTier: TicketTier = {
      id: `tier-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: "",
      price: 0,
      description: "",
      capacity: DEFAULT_TICKET_CAPACITY / 2, // new tiers can start smaller
      availableCount: DEFAULT_TICKET_AVAILABLE / 2
    };
    const updatedTiers = [...tiers, newTier];
    setTiers(updatedTiers);
    onChange(updatedTiers);
  };

  const handleRemoveTier = (index: number) => {
    if (tiers.length <= 1) return; // Keep at least one tier
    const updatedTiers = tiers.filter((_, i) => i !== index);
    setTiers(updatedTiers);
    onChange(updatedTiers);
  };

  const handleTierChange = (index: number, field: keyof TicketTier, value: string | number) => {
    const updatedTiers = [...tiers];
    updatedTiers[index] = { ...updatedTiers[index], [field]: value };

    if (field === 'capacity') {
      const capacity = Number(value);
      if (updatedTiers[index].availableCount && updatedTiers[index].availableCount > capacity) {
        updatedTiers[index].availableCount = capacity;
      }
    }

    setTiers(updatedTiers);
    onChange(updatedTiers);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Ticket Options</h3>
        <Button 
          type="button"
          onClick={handleAddTier} 
          variant="outline" 
          size="sm" 
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          Add Ticket Type
        </Button>
      </div>

      {tiers.map((tier, index) => (
        <Card key={tier.id} className="border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex justify-between">
              <span>Ticket Option {index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveTier(index)}
                disabled={tiers.length <= 1}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor={`tier-name-${index}`}>Ticket Name</Label>
                <Input
                  id={`tier-name-${index}`}
                  value={tier.name}
                  onChange={(e) => handleTierChange(index, 'name', e.target.value)}
                  placeholder="e.g., Standard, VIP, VVIP"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`tier-price-${index}`}>Price (₦)</Label>
                <Input
                  id={`tier-price-${index}`}
                  type="number"
                  min="0"
                  value={tier.price}
                  onChange={(e) => handleTierChange(index, 'price', Number(e.target.value))}
                  required
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor={`tier-desc-${index}`}>Description</Label>
              <Textarea
                id={`tier-desc-${index}`}
                value={tier.description || ""}
                onChange={(e) => handleTierChange(index, 'description', e.target.value)}
                placeholder="Describe what's included with this ticket"
                className="resize-none h-20"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor={`tier-capacity-${index}`}>Capacity</Label>
                <Input
                  id={`tier-capacity-${index}`}
                  type="number"
                  min="1"
                  value={tier.capacity || 0}
                  onChange={(e) => handleTierChange(index, 'capacity', Number(e.target.value))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`tier-available-${index}`}>Available Tickets</Label>
                <Input
                  id={`tier-available-${index}`}
                  type="number"
                  min="0"
                  max={tier.capacity || DEFAULT_TICKET_CAPACITY}
                  value={tier.availableCount || 0}
                  onChange={(e) => handleTierChange(index, 'availableCount', Number(e.target.value))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TicketTierEditor;
