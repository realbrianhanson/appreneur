import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Calendar, Eye, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import type { Cohort } from "@/pages/admin/Cohorts";

interface ActiveCohortCardProps {
  cohort: Cohort;
  onToggleRegistrations: (isAccepting: boolean) => void;
  onViewDetails: () => void;
}

export function ActiveCohortCard({
  cohort,
  onToggleRegistrations,
  onViewDetails,
}: ActiveCohortCardProps) {
  const spotsRemaining = cohort.max_participants - cohort.spots_taken;
  const fillPercentage = (cohort.spots_taken / cohort.max_participants) * 100;
  const isAlmostFull = fillPercentage >= 90;
  const isFull = spotsRemaining <= 0;

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
              Active
            </Badge>
            <CardTitle className="text-xl text-foreground">{cohort.name}</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={onViewDetails}>
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Spots Display */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Registration Capacity</span>
              <span className="text-sm font-medium text-foreground">
                {cohort.spots_taken} / {cohort.max_participants}
              </span>
            </div>
            <Progress 
              value={fillPercentage} 
              className={`h-4 ${isAlmostFull ? "[&>div]:bg-orange-500" : ""} ${isFull ? "[&>div]:bg-destructive" : ""}`}
            />
            <div className="mt-3 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-2xl font-bold text-foreground">{spotsRemaining}</span>
                <span className="text-muted-foreground">spots remaining</span>
              </div>
              {isAlmostFull && !isFull && (
                <Badge variant="outline" className="text-orange-500 border-orange-500/30">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Almost Full
                </Badge>
              )}
              {isFull && (
                <Badge variant="destructive">
                  Full
                </Badge>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
              <div>
                <p className="text-sm font-medium text-foreground">Accepting Registrations</p>
                <p className="text-xs text-muted-foreground">
                  {cohort.is_accepting_registrations ? "New users can register" : "Registrations paused"}
                </p>
              </div>
              <Switch
                checked={cohort.is_accepting_registrations}
                onCheckedChange={onToggleRegistrations}
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                {format(new Date(cohort.start_date), "MMM d")} -{" "}
                {cohort.end_date ? format(new Date(cohort.end_date), "MMM d, yyyy") : "Ongoing"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
