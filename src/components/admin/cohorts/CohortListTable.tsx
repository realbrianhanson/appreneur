import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Eye, Power } from "lucide-react";
import { format } from "date-fns";
import type { Cohort, CohortStatus } from "@/pages/admin/Cohorts";
import { getCohortStatus } from "@/pages/admin/Cohorts";

interface CohortListTableProps {
  cohorts: Cohort[];
  isLoading: boolean;
  onEdit: (cohort: Cohort) => void;
  onToggleRegistrations: (cohortId: string, isAccepting: boolean) => void;
  onToggleActive: (cohortId: string, isActive: boolean) => void;
  onViewDetails: (cohortId: string) => void;
}

export function CohortListTable({
  cohorts,
  isLoading,
  onEdit,
  onToggleRegistrations,
  onToggleActive,
  onViewDetails,
}: CohortListTableProps) {
  const getStatusBadge = (status: CohortStatus, isActive: boolean) => {
    if (isActive) {
      return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Active</Badge>;
    }
    switch (status) {
      case "upcoming":
        return <Badge variant="outline" className="text-primary border-primary/30">Upcoming</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge variant="outline">Inactive</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Spots</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Registrations</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="text-foreground">Name</TableHead>
            <TableHead className="text-foreground">Dates</TableHead>
            <TableHead className="text-foreground">Spots</TableHead>
            <TableHead className="text-foreground">Status</TableHead>
            <TableHead className="text-foreground">Registrations</TableHead>
            <TableHead className="w-[80px] text-foreground">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cohorts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No cohorts found. Create your first cohort to get started.
              </TableCell>
            </TableRow>
          ) : (
            cohorts.map((cohort) => {
              const status = getCohortStatus(cohort);
              return (
                <TableRow
                  key={cohort.id}
                  className="cursor-pointer hover:bg-muted/30"
                  onClick={() => onViewDetails(cohort.id)}
                >
                  <TableCell className="font-medium text-foreground">
                    {cohort.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(cohort.start_date), "MMM d")} -{" "}
                    {cohort.end_date
                      ? format(new Date(cohort.end_date), "MMM d, yyyy")
                      : "Ongoing"}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-foreground">{cohort.spots_taken}</span>
                    <span className="text-muted-foreground"> / {cohort.max_participants}</span>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(status, cohort.is_active)}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Switch
                      checked={cohort.is_accepting_registrations}
                      onCheckedChange={(checked) =>
                        onToggleRegistrations(cohort.id, checked)
                      }
                    />
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewDetails(cohort.id)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(cohort)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onToggleActive(cohort.id, !cohort.is_active)}
                        >
                          <Power className="w-4 h-4 mr-2" />
                          {cohort.is_active ? "Deactivate" : "Set as Active"}
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
    </div>
  );
}
