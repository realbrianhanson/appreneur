import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Users,
  Trophy,
  DollarSign,
  TrendingUp,
  UserPlus,
  Loader2,
} from "lucide-react";
import type { Cohort } from "@/pages/admin/Cohorts";

interface CohortStats {
  totalRegistered: number;
  completionsByDay: number[];
  otoConversionRate: number;
  revenueGenerated: number;
}

interface WaitlistEntry {
  id: string;
  email: string;
  first_name: string | null;
  phone: string | null;
  created_at: string;
}

interface CohortUser {
  id: string;
  first_name: string;
  email: string;
  days_completed: number;
  is_vip: boolean;
}

interface CohortDetailSheetProps {
  cohort: Cohort | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCohortUpdated: () => void;
}

export function CohortDetailSheet({
  cohort,
  open,
  onOpenChange,
  onCohortUpdated,
}: CohortDetailSheetProps) {
  const [stats, setStats] = useState<CohortStats | null>(null);
  const [users, setUsers] = useState<CohortUser[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  useEffect(() => {
    if (cohort && open) {
      fetchCohortData();
    }
  }, [cohort, open]);

  const fetchCohortData = async () => {
    if (!cohort) return;
    setIsLoading(true);

    try {
      // Fetch users in this cohort
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, first_name, email, is_vip")
        .eq("cohort_id", cohort.id);

      // Fetch progress for cohort users
      const userIds = profiles?.map((p) => p.id) || [];
      let progressData: { user_id: string; day_number: number; is_completed: boolean }[] = [];
      
      if (userIds.length > 0) {
        const { data } = await supabase
          .from("user_progress")
          .select("user_id, day_number, is_completed")
          .in("user_id", userIds);
        progressData = data || [];
      }

      // Build users with progress
      const usersWithProgress: CohortUser[] = (profiles || []).map((p) => {
        const userProgress = progressData.filter((pr) => pr.user_id === p.id);
        const daysCompleted = userProgress.filter((pr) => pr.is_completed).length;
        return {
          id: p.id,
          first_name: p.first_name,
          email: p.email,
          days_completed: daysCompleted,
          is_vip: p.is_vip,
        };
      });
      setUsers(usersWithProgress);

      // Calculate stats
      const totalRegistered = profiles?.length || 0;
      const completionsByDay = [1, 2, 3, 4, 5, 6, 7].map(
        (day) => progressData.filter((p) => p.day_number === day && p.is_completed).length
      );

      // Fetch purchases for this cohort
      const { data: purchases } = await supabase
        .from("purchases")
        .select("amount_cents, product_type, user_id")
        .eq("status", "completed")
        .in("user_id", userIds);

      const vipPurchases = purchases?.filter((p) => p.product_type === "vip_bundle").length || 0;
      const otoRate = totalRegistered > 0 ? (vipPurchases / totalRegistered) * 100 : 0;
      const totalRevenue = purchases?.reduce((sum, p) => sum + p.amount_cents, 0) || 0;

      setStats({
        totalRegistered,
        completionsByDay,
        otoConversionRate: Math.round(otoRate * 10) / 10,
        revenueGenerated: totalRevenue / 100,
      });

      // Fetch waitlist for this cohort
      const { data: waitlistData } = await supabase
        .from("waitlist")
        .select("*")
        .eq("target_cohort_id", cohort.id)
        .is("converted_at", null)
        .order("created_at", { ascending: false });

      setWaitlist(waitlistData || []);
    } catch (error) {
      console.error("Error fetching cohort data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConvertWaitlist = async () => {
    if (!cohort || waitlist.length === 0) return;
    setIsConverting(true);

    try {
      // For now, just mark them as converted
      // In production, this would also trigger email sending
      const { error } = await supabase
        .from("waitlist")
        .update({ converted_at: new Date().toISOString() })
        .eq("target_cohort_id", cohort.id)
        .is("converted_at", null);

      if (error) throw error;

      toast.success(`Converted ${waitlist.length} waitlist entries`);
      fetchCohortData();
      onCohortUpdated();
    } catch (error) {
      console.error("Error converting waitlist:", error);
      toast.error("Failed to convert waitlist");
    } finally {
      setIsConverting(false);
    }
  };

  if (!cohort) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-hidden flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <span className="text-foreground">{cohort.name}</span>
            {cohort.is_active && (
              <Badge className="bg-green-500/20 text-green-500">Active</Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Tabs defaultValue="stats" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="stats">Stats</TabsTrigger>
                <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
                <TabsTrigger value="waitlist">Waitlist ({waitlist.length})</TabsTrigger>
              </TabsList>

              {/* Stats Tab */}
              <TabsContent value="stats" className="space-y-4 mt-4">
                {/* Stat Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-card border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Users className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-foreground">
                            {stats?.totalRegistered || 0}
                          </p>
                          <p className="text-xs text-muted-foreground">Total Registered</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-accent/10">
                          <Trophy className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-foreground">
                            {stats?.completionsByDay[6] || 0}
                          </p>
                          <p className="text-xs text-muted-foreground">Completions</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-secondary/10">
                          <TrendingUp className="w-4 h-4 text-secondary" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-foreground">
                            {stats?.otoConversionRate || 0}%
                          </p>
                          <p className="text-xs text-muted-foreground">OTO Rate</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-500/10">
                          <DollarSign className="w-4 h-4 text-green-500" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-foreground">
                            ${stats?.revenueGenerated.toLocaleString() || 0}
                          </p>
                          <p className="text-xs text-muted-foreground">Revenue</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Completion by Day */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Completion by Day
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                        const completed = stats?.completionsByDay[day - 1] || 0;
                        const total = stats?.totalRegistered || 1;
                        const percentage = (completed / total) * 100;
                        return (
                          <div key={day} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-foreground">Day {day}</span>
                              <span className="text-muted-foreground">
                                {completed} ({Math.round(percentage)}%)
                              </span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users" className="mt-4">
                <Card className="bg-card border-border">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Progress</TableHead>
                          <TableHead>VIP</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                              No users in this cohort
                            </TableCell>
                          </TableRow>
                        ) : (
                          users.slice(0, 50).map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium text-foreground">
                                {user.first_name}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {user.email}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Progress
                                    value={(user.days_completed / 7) * 100}
                                    className="w-16 h-2"
                                  />
                                  <span className="text-xs text-muted-foreground">
                                    {user.days_completed}/7
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {user.is_vip ? (
                                  <Badge className="bg-accent/20 text-accent text-xs">VIP</Badge>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                    {users.length > 50 && (
                      <div className="p-4 text-center text-sm text-muted-foreground border-t border-border">
                        Showing 50 of {users.length} users
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Waitlist Tab */}
              <TabsContent value="waitlist" className="mt-4 space-y-4">
                {waitlist.length > 0 && (
                  <div className="flex justify-end">
                    <Button onClick={handleConvertWaitlist} disabled={isConverting}>
                      {isConverting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <UserPlus className="w-4 h-4 mr-2" />
                      )}
                      Convert All ({waitlist.length})
                    </Button>
                  </div>
                )}

                <Card className="bg-card border-border">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Joined</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {waitlist.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                              No one on the waitlist
                            </TableCell>
                          </TableRow>
                        ) : (
                          waitlist.map((entry) => (
                            <TableRow key={entry.id}>
                              <TableCell className="font-medium text-foreground">
                                {entry.first_name || "—"}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {entry.email}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {entry.phone || "—"}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {format(new Date(entry.created_at), "MMM d, yyyy")}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
