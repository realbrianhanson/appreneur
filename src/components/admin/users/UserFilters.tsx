import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Filter, X } from "lucide-react";

export interface UserFiltersState {
  progressStatus: "all" | "not_started" | "in_progress" | "completed";
  dateFrom: string;
  dateTo: string;
}

interface UserFiltersProps {
  filters: UserFiltersState;
  onFiltersChange: (filters: UserFiltersState) => void;
}

export function UserFilters({ filters, onFiltersChange }: UserFiltersProps) {
  const activeFiltersCount = [
    filters.progressStatus !== "all",
    filters.dateFrom,
    filters.dateTo,
  ].filter(Boolean).length;

  const clearFilters = () =>
    onFiltersChange({ progressStatus: "all", dateFrom: "", dateTo: "" });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground">Filters</h4>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="progress-filter">Progress</Label>
            <Select
              value={filters.progressStatus}
              onValueChange={(value: UserFiltersState["progressStatus"]) =>
                onFiltersChange({ ...filters, progressStatus: value })
              }
            >
              <SelectTrigger id="progress-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="not_started">Not started</SelectItem>
                <SelectItem value="in_progress">In progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Registered between</Label>
            <div className="flex gap-2">
              <Input
                type="date"
                aria-label="Registered from"
                value={filters.dateFrom}
                onChange={(e) =>
                  onFiltersChange({ ...filters, dateFrom: e.target.value })
                }
                className="flex-1"
              />
              <Input
                type="date"
                aria-label="Registered to"
                value={filters.dateTo}
                onChange={(e) =>
                  onFiltersChange({ ...filters, dateTo: e.target.value })
                }
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}