import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";

export interface DateRange {
  from: Date;
  to: Date;
  preset: string;
}

type PresetKey = "today" | "yesterday" | "last_7_days" | "last_30_days" | "this_month" | "last_month" | "custom";

const presets: { key: PresetKey; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "last_7_days", label: "Last 7 days" },
  { key: "last_30_days", label: "Last 30 days" },
  { key: "this_month", label: "This month" },
  { key: "last_month", label: "Last month" },
  { key: "custom", label: "Custom" },
];

export function getDateRange(preset: PresetKey): DateRange {
  const now = new Date();
  
  switch (preset) {
    case "today":
      return { from: startOfDay(now), to: endOfDay(now), preset };
    case "yesterday":
      const yesterday = subDays(now, 1);
      return { from: startOfDay(yesterday), to: endOfDay(yesterday), preset };
    case "last_7_days":
      return { from: startOfDay(subDays(now, 6)), to: endOfDay(now), preset };
    case "last_30_days":
      return { from: startOfDay(subDays(now, 29)), to: endOfDay(now), preset };
    case "this_month":
      return { from: startOfMonth(now), to: endOfDay(now), preset };
    case "last_month":
      const lastMonth = subDays(startOfMonth(now), 1);
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth), preset };
    default:
      return { from: startOfDay(subDays(now, 29)), to: endOfDay(now), preset: "last_30_days" };
  }
}

interface DateRangeSelectorProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  const [isCustomOpen, setIsCustomOpen] = useState(false);

  const handlePresetChange = (preset: string) => {
    if (preset === "custom") {
      setIsCustomOpen(true);
    } else {
      onChange(getDateRange(preset as PresetKey));
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    // If no from date or both dates set, start new selection
    if (!value.from || (value.from && value.to)) {
      onChange({ from: startOfDay(date), to: endOfDay(date), preset: "custom" });
    } else {
      // Set the to date
      const newRange = date > value.from
        ? { from: value.from, to: endOfDay(date), preset: "custom" }
        : { from: startOfDay(date), to: value.to, preset: "custom" };
      onChange(newRange);
      setIsCustomOpen(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={value.preset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {presets.map((preset) => (
            <SelectItem key={preset.key} value={preset.key}>
              {preset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover open={isCustomOpen} onOpenChange={setIsCustomOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="min-w-[200px] justify-start">
            <CalendarIcon className="w-4 h-4 mr-2" />
            {format(value.from, "MMM d, yyyy")} - {format(value.to, "MMM d, yyyy")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value.from}
            onSelect={handleDateSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
