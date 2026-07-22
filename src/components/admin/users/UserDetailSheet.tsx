import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { User, Mail, Calendar, CheckCircle, Circle, Lock } from "lucide-react";
import type { UserRow } from "@/pages/admin/Users";

interface UserProgress {
  day_number: number;
  is_unlocked: boolean;
  is_completed: boolean;
  completed_at: string | null;
  time_spent_seconds: number;
}

interface UserDetailSheetProps {
  userId: string | null;
  user: UserRow | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailSheet({ userId, user, open, onOpenChange }: UserDetailSheetProps) {
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!userId || !open) return;
    let cancelled = false;
    setIsLoading(true);
    (async () => {
      const { data } = await supabase
        .from("user_progress")
        .select("day_number,is_unlocked,is_completed,completed_at,time_spent_seconds")
        .eq("user_id", userId)
        .order("day_number");
      if (!cancelled) {
        setProgress((data as UserProgress[]) ?? []);
        setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, open]);

  if (!user) return null;

  const icon = (p: UserProgress) =>
    p.is_completed ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : p.is_unlocked ? (
      <Circle className="w-4 h-4 text-primary" />
    ) : (
      <Lock className="w-4 h-4 text-muted-foreground" />
    );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-hidden flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-semibold">
                {(user.first_name || user.email).charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-foreground">{user.first_name || user.email}</span>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <Tabs defaultValue="profile" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4 mt-4">
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Row icon={<User className="w-4 h-4 text-muted-foreground" />}>
                    {user.first_name || "—"}
                  </Row>
                  <Row icon={<Mail className="w-4 h-4 text-muted-foreground" />}>
                    {user.email}
                  </Row>
                  <Row icon={<Calendar className="w-4 h-4 text-muted-foreground" />}>
                    Registered {format(new Date(user.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </Row>
                </CardContent>
              </Card>

              {(user.utm_source || user.utm_medium || user.utm_campaign) && (
                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      UTM attribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <KV k="Source" v={user.utm_source} />
                    <KV k="Medium" v={user.utm_medium} />
                    <KV k="Campaign" v={user.utm_campaign} />
                  </CardContent>
                </Card>
              )}

              {(user.fb_campaign_id || user.fb_adset_id || user.fb_ad_id) && (
                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Facebook attribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <KV k="Campaign ID" v={user.fb_campaign_id} mono />
                    <KV k="Adset ID" v={user.fb_adset_id} mono />
                    <KV k="Ad ID" v={user.fb_ad_id} mono />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="progress" className="mt-4">
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Challenge progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-10 bg-muted rounded animate-pulse" />
                      ))}
                    </div>
                  ) : progress.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Progress is initialized when the learner first opens the dashboard.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {progress.map((p) => (
                        <div
                          key={p.day_number}
                          className={`flex items-center gap-3 p-3 rounded-lg ${
                            p.is_completed ? "bg-green-500/10" : "bg-muted/30"
                          }`}
                        >
                          {icon(p)}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">
                              Day {p.day_number}
                            </p>
                            {p.is_completed && p.completed_at ? (
                              <p className="text-xs text-muted-foreground">
                                Completed {format(new Date(p.completed_at), "MMM d, yyyy")}
                              </p>
                            ) : p.is_unlocked ? (
                              <p className="text-xs text-muted-foreground">Unlocked</p>
                            ) : (
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
          </Tabs>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function Row({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <span className="text-foreground">{children}</span>
    </div>
  );
}

function KV({ k, v, mono }: { k: string; v: string | null; mono?: boolean }) {
  if (!v) return null;
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{k}</span>
      <span className={mono ? "text-foreground font-mono" : "text-foreground"}>{v}</span>
    </div>
  );
}