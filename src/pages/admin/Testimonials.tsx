import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { showSuccess, showError } from "@/lib/toast-utils";
import {
  Search,
  Star,
  Check,
  X,
  Edit,
  Award,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

interface Testimonial {
  id: string;
  user_id: string | null;
  cohort_id: string | null;
  name: string;
  content: string;
  rating: number | null;
  app_name: string | null;
  app_screenshot_url: string | null;
  is_approved: boolean;
  is_featured: boolean;
  created_at: string;
  approved_at: string | null;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  featured: number;
}

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    approved: 0,
    featured: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "featured">("all");
  
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editAppName, setEditAppName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Screenshot preview
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchTestimonials();
  }, [statusFilter]);

  const fetchTestimonials = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter === "pending") {
        query = query.eq("is_approved", false);
      } else if (statusFilter === "approved") {
        query = query.eq("is_approved", true);
      } else if (statusFilter === "featured") {
        query = query.eq("is_featured", true);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Cast data to Testimonial type
      const typedData = (data || []) as unknown as Testimonial[];
      setTestimonials(typedData);

      // Calculate stats
      const { data: allData } = await supabase.from("testimonials").select("*");
      const allTypedData = (allData || []) as unknown as Testimonial[];
      setStats({
        total: allTypedData.length,
        pending: allTypedData.filter((t) => !t.is_approved).length,
        approved: allTypedData.filter((t) => t.is_approved).length,
        featured: allTypedData.filter((t) => t.is_featured).length,
      });
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      showError("Failed to load testimonials");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from("testimonials")
        .update({
          is_approved: true,
          approved_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
      showSuccess("Testimonial approved");
      fetchTestimonials();
    } catch (error) {
      console.error("Error approving testimonial:", error);
      showError("Failed to approve testimonial");
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from("testimonials")
        .delete()
        .eq("id", id);

      if (error) throw error;
      showSuccess("Testimonial rejected and removed");
      fetchTestimonials();
    } catch (error) {
      console.error("Error rejecting testimonial:", error);
      showError("Failed to reject testimonial");
    }
  };

  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from("testimonials")
        .update({ is_featured: !currentFeatured })
        .eq("id", id);

      if (error) throw error;
      showSuccess(currentFeatured ? "Removed from featured" : "Added to featured");
      fetchTestimonials();
    } catch (error) {
      console.error("Error toggling featured:", error);
      showError("Failed to update testimonial");
    }
  };

  const openEditDialog = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setEditContent(testimonial.content);
    setEditAppName(testimonial.app_name || "");
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingTestimonial) return;
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("testimonials")
        .update({
          content: editContent.trim(),
          app_name: editAppName.trim() || null,
        })
        .eq("id", editingTestimonial.id);

      if (error) throw error;
      showSuccess("Testimonial updated");
      setEditDialogOpen(false);
      fetchTestimonials();
    } catch (error) {
      console.error("Error updating testimonial:", error);
      showError("Failed to update testimonial");
    } finally {
      setIsSaving(false);
    }
  };

  // Filter by search
  const filteredTestimonials = testimonials.filter((t) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(query) ||
      t.content.toLowerCase().includes(query) ||
      (t.app_name && t.app_name.toLowerCase().includes(query))
    );
  });

  const statCards = [
    {
      label: "Total",
      value: stats.total,
      icon: <Star className="w-5 h-5 text-muted-foreground" />,
      color: "text-foreground",
    },
    {
      label: "Pending Review",
      value: stats.pending,
      icon: <Clock className="w-5 h-5 text-yellow-500" />,
      color: "text-yellow-500",
    },
    {
      label: "Approved",
      value: stats.approved,
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      color: "text-green-500",
    },
    {
      label: "Featured",
      value: stats.featured,
      icon: <Award className="w-5 h-5 text-primary" />,
      color: "text-primary",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Testimonials
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and manage user testimonials
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>
                      {stat.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Manage Testimonials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by name, content, or app name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                {(["all", "pending", "approved", "featured"] as const).map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                    className="capitalize"
                  >
                    {status}
                    {status === "pending" && stats.pending > 0 && (
                      <Badge variant="destructive" className="ml-2 h-5 min-w-5 text-xs">
                        {stats.pending}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredTestimonials.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No testimonials found
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>App</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTestimonials.map((testimonial) => (
                      <TableRow key={testimonial.id}>
                        <TableCell className="font-medium">
                          {testimonial.name}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="truncate text-sm text-muted-foreground">
                            {testimonial.content}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-0.5">
                            {Array.from({ length: testimonial.rating || 0 }).map((_, i) => (
                              <Star
                                key={i}
                                className="w-3 h-3 fill-yellow-400 text-yellow-400"
                              />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {testimonial.app_name || "—"}
                            {testimonial.app_screenshot_url && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => setPreviewUrl(testimonial.app_screenshot_url)}
                              >
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {testimonial.is_featured && (
                              <Badge variant="default" className="bg-primary">
                                Featured
                              </Badge>
                            )}
                            {testimonial.is_approved ? (
                              <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                                Approved
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-yellow-500 border-yellow-500/50">
                                Pending
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(testimonial.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {!testimonial.is_approved && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleApprove(testimonial.id)}
                                  className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-500/10"
                                  title="Approve"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleReject(testimonial.id)}
                                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  title="Reject"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(testimonial)}
                              className="h-8 w-8"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {testimonial.is_approved && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleToggleFeatured(testimonial.id, testimonial.is_featured)
                                }
                                className={`h-8 w-8 ${
                                  testimonial.is_featured
                                    ? "text-primary"
                                    : "text-muted-foreground"
                                }`}
                                title={testimonial.is_featured ? "Remove from featured" : "Feature"}
                              >
                                <Award className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Testimonial</DialogTitle>
              <DialogDescription>
                Make changes to this testimonial before approving.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">App Name</label>
                <Input
                  value={editAppName}
                  onChange={(e) => setEditAppName(e.target.value)}
                  placeholder="e.g., Habit Tracker Pro"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Screenshot Preview Dialog */}
        <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>App Screenshot</DialogTitle>
            </DialogHeader>
            {previewUrl && (
              <img
                src={previewUrl}
                alt="App screenshot"
                className="w-full rounded-lg"
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
