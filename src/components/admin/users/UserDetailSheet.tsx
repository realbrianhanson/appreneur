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
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Crown,
  CheckCircle,
  Circle,
  Lock,
  RefreshCw,
  Gift,
  Users,
} from "lucide-react";
import type { UserWithProgress } from "@/pages/admin/Users";
import { UserActionsDialog } from "./UserActionsDialog";

interface UserProgress {
  day_number: number;
  is_unlocked: boolean;
  is_completed: boolean;
  completed_at: string | null;
  time_spent_seconds: number;
}

interface UserPurchase {
  id: string;
  product_type: string;
  amount_cents: number;
  status: string;
  created_at: string;
  stripe_payment_intent_id: string | null;
}

interface UserSMS {
  id: string;
  message_type: string;
  message_body: string;
  status: string;
  sent_at: string | null;
  created_at: string;
}

interface UserDetailSheetProps {
  userId: string | null;
  user: UserWithProgress | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: () => void;
}

export function UserDetailSheet({
  userId,
  user,
  open,
  onOpenChange,
  onUserUpdated,
}: UserDetailSheetProps) {
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [purchases, setPurchases] = useState<UserPurchase[]>([]);
  const [smsHistory, setSmsHistory] = useState<UserSMS[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"grant_vip" | "move_cohort" | "reset_password" | null>(null);

  useEffect(() => {
    if (userId && open) {
      fetchUserDetails();
    }
  }, [userId, open]);

  const fetchUserDetails = async () => {
    if (!userId) return;
    setIsLoading(true);

    try {
      const [progressRes, purchasesRes, smsRes] = await Promise.all([
        supabase
          .from("user_progress")
          .select("*")
          .eq("user_id", userId)
          .order("day_number"),
        supabase
          .from("purchases")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),
        supabase
          .from("sms_logs")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),
      ]);

      if (progressRes.data) setProgress(progressRes.data);
      if (purchasesRes.data) setPurchases(purchasesRes.data);
      if (smsRes.data) setSmsHistory(smsRes.data);
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (action: "grant_vip" | "move_cohort" | "reset_password") => {
    setActionType(action);
    setActionDialogOpen(true);
  };

  if (!user) return null;

  const getProgressIcon = (p: UserProgress) => {
    if (p.is_completed) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (p.is_unlocked) return <Circle className="w-4 h-4 text-primary" />;
    return <Lock className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-xl overflow-hidden flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-semibold">
                  {user.first_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <span className="text-foreground">{user.first_name}</span>
                {user.is_vip && (
                  <Badge className="ml-2 bg-accent/20 text-accent">VIP</Badge>
                )}
              </div>
            </SheetTitle>
          </SheetHeader>

          <ScrollArea className="flex-1 -mx-6 px-6">
            <Tabs defaultValue="profile" className="mt-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="progress">Progress</TabsTrigger>
                <TabsTrigger value="purchases">Purchases</TabsTrigger>
                <TabsTrigger value="sms">SMS</TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-4 mt-4">
                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{user.first_name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{user.phone || "Not provided"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">
                        Registered {format(new Date(user.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* UTM Data */}
                {(user.utm_source || user.utm_medium || user.utm_campaign) && (
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        UTM Attribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {user.utm_source && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Source</span>
                          <span className="text-foreground">{user.utm_source}</span>
                        </div>
                      )}
                      {user.utm_medium && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Medium</span>
                          <span className="text-foreground">{user.utm_medium}</span>
                        </div>
                      )}
                      {user.utm_campaign && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Campaign</span>
                          <span className="text-foreground">{user.utm_campaign}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* FB Attribution */}
                {(user.fb_campaign_id || user.fb_adset_id || user.fb_ad_id) && (
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Facebook Attribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {user.fb_campaign_id && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Campaign ID</span>
                          <span className="text-foreground font-mono text-sm">{user.fb_campaign_id}</span>
                        </div>
                      )}
                      {user.fb_adset_id && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Adset ID</span>
                          <span className="text-foreground font-mono text-sm">{user.fb_adset_id}</span>
                        </div>
                      )}
                      {user.fb_ad_id && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Ad ID</span>
                          <span className="text-foreground font-mono text-sm">{user.fb_ad_id}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Actions */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAction("reset_password")}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reset Password
                    </Button>
                    {!user.is_vip && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction("grant_vip")}
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Grant VIP
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAction("move_cohort")}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Move Cohort
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Progress Tab */}
              <TabsContent value="progress" className="mt-4">
                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Challenge Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-3">
                        {[...Array(7)].map((_, i) => (
                          <div key={i} className="h-10 bg-muted rounded animate-pulse" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">Registration</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(user.created_at), "MMM d, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                        </div>

                        {progress.map((p) => (
                          <div
                            key={p.day_number}
                            className={`flex items-center gap-3 p-3 rounded-lg ${
                              p.is_completed ? "bg-green-500/10" : "bg-muted/30"
                            }`}
                          >
                            {getProgressIcon(p)}
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">
                                Day {p.day_number}
                              </p>
                              {p.is_completed && p.completed_at && (
                                <p className="text-xs text-muted-foreground">
                                  Completed {format(new Date(p.completed_at), "MMM d, yyyy 'at' h:mm a")}
                                </p>
                              )}
                              {!p.is_completed && p.is_unlocked && (
                                <p className="text-xs text-muted-foreground">In progress</p>
                              )}
                              {!p.is_unlocked && (
                                <p className="text-xs text-muted-foreground">Locked</p>
                              )}
                            </div>
                            {p.time_spent_seconds > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {Math.round(p.time_spent_seconds / 60)}m
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Purchases Tab */}
              <TabsContent value="purchases" className="mt-4">
                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Purchase History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                        ))}
                      </div>
                    ) : purchases.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No purchases
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {purchases.map((purchase) => (
                          <div
                            key={purchase.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                          >
                            <div className="flex items-center gap-3">
                              <Gift className="w-4 h-4 text-primary" />
                              <div>
                                <p className="text-sm font-medium text-foreground capitalize">
                                  {purchase.product_type.replace("_", " ")}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(purchase.created_at), "MMM d, yyyy")}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-foreground">
                                ${(purchase.amount_cents / 100).toFixed(2)}
                              </p>
                              <Badge
                                variant={purchase.status === "completed" ? "default" : "outline"}
                                className="text-xs"
                              >
                                {purchase.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* SMS Tab */}
              <TabsContent value="sms" className="mt-4">
                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      SMS History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                        ))}
                      </div>
                    ) : smsHistory.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No SMS sent
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {smsHistory.map((sms) => (
                          <div
                            key={sms.id}
                            className="p-3 rounded-lg bg-muted/30 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="capitalize">
                                {sms.message_type.replace("_", " ")}
                              </Badge>
                              <Badge
                                variant={
                                  sms.status === "delivered"
                                    ? "default"
                                    : sms.status === "failed"
                                    ? "destructive"
                                    : "outline"
                                }
                              >
                                {sms.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-foreground line-clamp-2">
                              {sms.message_body}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(sms.created_at), "MMM d, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <UserActionsDialog
        userId={userId}
        user={user}
        open={actionDialogOpen}
        onOpenChange={setActionDialogOpen}
        actionType={actionType}
        onSuccess={() => {
          onUserUpdated();
          setActionDialogOpen(false);
        }}
      />
    </>
  );
}
