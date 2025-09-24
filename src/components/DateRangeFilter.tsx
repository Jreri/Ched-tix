import React, { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DateRangeFilterProps {
  onFilterChange: (startDate: Date | undefined, endDate: Date | undefined) => void;
}

// Preset options configurable
const DATE_PRESETS = [
  { value: "last7days", label: "Last 7 days", days: 7 },
  { value: "last30days", label: "Last 30 days", days: 30 },
  { value: "last3months", label: "Last 3 months", months: 3 },
  { value: "last12months", label: "Last 12 months", years: 1 },
  { value: "custom", label: "Custom range" },
];

export function DateRangeFilter({ onFilterChange }: DateRangeFilterProps) {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [preset, setPreset] = useState<string>("");

  const handlePresetChange = (value: string) => {
    setPreset(value);
    
    const today = new Date();
    let calculatedStartDate: Date | undefined;
    let calculatedEndDate: Date | undefined = today;
    
    switch (value) {
      case "last7days":
        calculatedStartDate = new Date();
        calculatedStartDate.setDate(today.getDate() - 7);
        break;
      case "last30days":
        calculatedStartDate = new Date();
        calculatedStartDate.setDate(today.getDate() - 30);
        break;
      case "last3months":
        calculatedStartDate = new Date();
        calculatedStartDate.setMonth(today.getMonth() - 3);
        break;
      case "last12months":
        calculatedStartDate = new Date();
        calculatedStartDate.setFullYear(today.getFullYear() - 1);
        break;
      case "custom":
        calculatedStartDate = startDate;
        calculatedEndDate = endDate;
        break;
      default:
        calculatedStartDate = undefined;
        calculatedEndDate = undefined;
    }
    
    setStartDate(calculatedStartDate);
    setEndDate(calculatedEndDate);
    onFilterChange(calculatedStartDate, calculatedEndDate);
  };

  const handleDateChange = (type: "start" | "end", date: Date | undefined) => {
    if (type === "start") {
      setStartDate(date);
      if (preset !== "custom") setPreset("custom");
    } else {
      setEndDate(date);
      if (preset !== "custom") setPreset("custom");
    }
    
    if (type === "start" && (endDate || date)) {
      onFilterChange(date, endDate);
    } else if (type === "end" && (startDate || date)) {
      onFilterChange(startDate, date);
    }
  };

  const handleClear = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setPreset("");
    onFilterChange(undefined, undefined);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
      <Select value={preset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select time period" />
        </SelectTrigger>
        <SelectContent>
          {DATE_PRESETS.map(p => (
            <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[140px] justify-start text-left font-normal",
                !startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "PPP") : "Start date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(date) => handleDateChange("start", date)}
              disabled={(date) => (endDate ? date > endDate : false) || date > new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[140px] justify-start text-left font-normal",
                !endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, "PPP") : "End date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={(date) => handleDateChange("end", date)}
              disabled={(date) => (startDate ? date < startDate : false) || date > new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        
        <Button variant="ghost" size="icon" onClick={handleClear}>
          <X className="h-4 w-4" />
          <span className="sr-only">Clear dates</span>
        </Button>
      </div>
    </div>
  );
}
