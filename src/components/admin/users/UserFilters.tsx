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
import type { UserFiltersState } from "@/pages/admin/Users";

interface UserFiltersProps {
  filters: UserFiltersState;
  onFiltersChange: (filters: UserFiltersState) => void;
  cohorts: { id: string; name: string }[];
}

export function UserFilters({ filters, onFiltersChange, cohorts }: UserFiltersProps) {
  const activeFiltersCount = [
    filters.cohortId !== "all",
    filters.vipStatus !== "all",
    filters.progressStatus !== "all",
    filters.dateFrom,
    filters.dateTo,
  ].filter(Boolean).length;

  const clearFilters = () => {
    onFiltersChange({
      cohortId: "all",
      vipStatus: "all",
      progressStatus: "all",
      dateFrom: "",
      dateTo: "",
    });
  };

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

          {/* Cohort Filter */}
          <div className="space-y-2">
            <Label>Cohort</Label>
            <Select
              value={filters.cohortId}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, cohortId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All cohorts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All cohorts</SelectItem>
                {cohorts.map((cohort) => (
                  <SelectItem key={cohort.id} value={cohort.id}>
                    {cohort.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* VIP Status Filter */}
          <div className="space-y-2">
            <Label>VIP Status</Label>
            <Select
              value={filters.vipStatus}
              onValueChange={(value: "all" | "yes" | "no") =>
                onFiltersChange({ ...filters, vipStatus: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="yes">VIP Only</SelectItem>
                <SelectItem value="no">Non-VIP Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Progress Status Filter */}
          <div className="space-y-2">
            <Label>Progress</Label>
            <Select
              value={filters.progressStatus}
              onValueChange={(value: "all" | "not_started" | "in_progress" | "completed") =>
                onFiltersChange({ ...filters, progressStatus: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="not_started">Not Started</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-2">
            <Label>Registered Between</Label>
            <div className="flex gap-2">
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) =>
                  onFiltersChange({ ...filters, dateFrom: e.target.value })
                }
                className="flex-1"
              />
              <Input
                type="date"
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
