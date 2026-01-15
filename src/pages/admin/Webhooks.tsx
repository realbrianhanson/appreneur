import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Plus, 
  Trash2, 
  Send, 
  Copy, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
} from "lucide-react";
import { ALL_WEBHOOK_EVENTS, WEBHOOK_EVENT_DESCRIPTIONS, WebhookEventType } from "@/lib/webhooks";

interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  secret: string | null;
  events: string[];
  is_active: boolean;
  created_at: string;
}

interface WebhookDelivery {
  id: string;
  webhook_endpoint_id: string;
  webhook_event_id: string;
  status: string;
  response_status: number | null;
  response_body: string | null;
  attempts: number;
  last_attempt_at: string;
  created_at: string;
}

interface WebhookEvent {
  id: string;
  event_type: string;
  payload: unknown;
  created_at: string;
}

export default function WebhooksAdmin() {
  const { toast } = useToast();
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<WebhookDelivery | null>(null);

  // New endpoint form
  const [newEndpoint, setNewEndpoint] = useState({
    name: "",
    url: "",
    events: [] as string[],
  });

  const fetchData = async () => {
    setLoading(true);
    const [endpointsRes, deliveriesRes, eventsRes] = await Promise.all([
      supabase.from('webhook_endpoints').select('*').order('created_at', { ascending: false }),
      supabase.from('webhook_deliveries').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('webhook_events').select('*').order('created_at', { ascending: false }).limit(50),
    ]);

    if (endpointsRes.data) setEndpoints(endpointsRes.data);
    if (deliveriesRes.data) setDeliveries(deliveriesRes.data);
    if (eventsRes.data) setEvents(eventsRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const generateSecret = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleAddEndpoint = async () => {
    if (!newEndpoint.name || !newEndpoint.url || newEndpoint.events.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!newEndpoint.url.startsWith('https://')) {
      toast({
        title: "Error",
        description: "Webhook URL must use HTTPS",
        variant: "destructive",
      });
      return;
    }

    const secret = generateSecret();

    const { error } = await supabase
      .from('webhook_endpoints')
      .insert({
        name: newEndpoint.name,
        url: newEndpoint.url,
        events: newEndpoint.events,
        secret,
        is_active: true,
      });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Webhook endpoint created",
      });
      setNewEndpoint({ name: "", url: "", events: [] });
      setIsAddOpen(false);
      fetchData();
    }
  };

  const toggleEndpoint = async (id: string, isActive: boolean) => {
    await supabase
      .from('webhook_endpoints')
      .update({ is_active: !isActive })
      .eq('id', id);
    
    setEndpoints(prev => 
      prev.map(e => e.id === id ? { ...e, is_active: !isActive } : e)
    );
  };

  const deleteEndpoint = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook endpoint?')) return;
    
    await supabase.from('webhook_endpoints').delete().eq('id', id);
    setEndpoints(prev => prev.filter(e => e.id !== id));
    
    toast({
      title: "Deleted",
      description: "Webhook endpoint removed",
    });
  };

  const testEndpoint = async (endpoint: WebhookEndpoint) => {
    toast({
      title: "Sending test...",
      description: "Testing webhook endpoint",
    });

    const { error } = await supabase.functions.invoke('fire-webhook', {
      body: {
        event_type: 'user.registered',
        payload: {
          user_id: 'test-user-id',
          email: 'test@example.com',
          first_name: 'Test',
          test: true,
        },
      },
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Test sent",
        description: "Check your endpoint for the test payload",
      });
      fetchData();
    }
  };

  const copySecret = (secret: string) => {
    navigator.clipboard.writeText(secret);
    toast({
      title: "Copied",
      description: "Secret copied to clipboard",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Delivered</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Failed</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getEndpointName = (id: string) => {
    return endpoints.find(e => e.id === id)?.name || 'Unknown';
  };

  const getEventType = (eventId: string) => {
    return events.find(e => e.id === eventId)?.event_type || 'Unknown';
  };

  if (loading) {
    return <div className="p-8 text-center">Loading webhooks...</div>;
  }

  return (
    <AdminLayout>
    <div className="max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Webhooks</h1>
          <p className="text-muted-foreground">Manage external integrations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" /> Add Endpoint</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Webhook Endpoint</DialogTitle>
                <DialogDescription>
                  Create a new webhook endpoint to receive event notifications.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="My Zapier Integration"
                    value={newEndpoint.name}
                    onChange={e => setNewEndpoint(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="url">Webhook URL (HTTPS only)</Label>
                  <Input
                    id="url"
                    placeholder="https://hooks.zapier.com/..."
                    value={newEndpoint.url}
                    onChange={e => setNewEndpoint(prev => ({ ...prev, url: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Subscribe to Events</Label>
                  <div className="grid grid-cols-1 gap-2 mt-2 max-h-48 overflow-y-auto">
                    {ALL_WEBHOOK_EVENTS.map(event => (
                      <div key={event} className="flex items-start space-x-2">
                        <Checkbox
                          id={event}
                          checked={newEndpoint.events.includes(event)}
                          onCheckedChange={(checked) => {
                            setNewEndpoint(prev => ({
                              ...prev,
                              events: checked
                                ? [...prev.events, event]
                                : prev.events.filter(e => e !== event),
                            }));
                          }}
                        />
                        <div className="grid gap-0.5 leading-none">
                          <label htmlFor={event} className="text-sm font-medium cursor-pointer">
                            {event}
                          </label>
                          <p className="text-xs text-muted-foreground">
                            {WEBHOOK_EVENT_DESCRIPTIONS[event]}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button onClick={handleAddEndpoint}>Create Endpoint</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="endpoints">
        <TabsList className="mb-4">
          <TabsTrigger value="endpoints">Endpoints ({endpoints.length})</TabsTrigger>
          <TabsTrigger value="deliveries">Deliveries ({deliveries.length})</TabsTrigger>
          <TabsTrigger value="events">Events ({events.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints">
          {endpoints.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">No webhook endpoints configured</p>
                <Button onClick={() => setIsAddOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Add Your First Endpoint
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {endpoints.map(endpoint => (
                <Card key={endpoint.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-lg">{endpoint.name}</CardTitle>
                        <Badge variant={endpoint.is_active ? "default" : "secondary"}>
                          {endpoint.is_active ? "Active" : "Paused"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={endpoint.is_active}
                          onCheckedChange={() => toggleEndpoint(endpoint.id, endpoint.is_active)}
                        />
                        <Button variant="outline" size="sm" onClick={() => testEndpoint(endpoint)}>
                          <Send className="w-4 h-4 mr-1" /> Test
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteEndpoint(endpoint.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription className="font-mono text-xs">{endpoint.url}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {endpoint.events.map(event => (
                        <Badge key={event} variant="outline">{event}</Badge>
                      ))}
                    </div>
                    {endpoint.secret && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Secret:</span>
                        <code className="bg-muted px-2 py-1 rounded text-xs">
                          {endpoint.secret.substring(0, 12)}...
                        </code>
                        <Button variant="ghost" size="sm" onClick={() => copySecret(endpoint.secret!)}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="deliveries">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Response</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveries.map(delivery => (
                  <TableRow key={delivery.id}>
                    <TableCell className="font-mono text-xs">
                      {getEventType(delivery.webhook_event_id)}
                    </TableCell>
                    <TableCell>{getEndpointName(delivery.webhook_endpoint_id)}</TableCell>
                    <TableCell>{getStatusBadge(delivery.status)}</TableCell>
                    <TableCell>{delivery.response_status || '-'}</TableCell>
                    <TableCell>{delivery.attempts}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(delivery.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedDelivery(delivery)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {deliveries.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No deliveries yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Type</TableHead>
                  <TableHead>Payload Preview</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map(event => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <Badge variant="outline">{event.event_type}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs max-w-md truncate">
                      {typeof event.payload === 'object' 
                        ? JSON.stringify(event.payload).substring(0, 100) + '...'
                        : String(event.payload)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(event.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
                {events.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      No events fired yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delivery Detail Dialog */}
      <Dialog open={!!selectedDelivery} onOpenChange={() => setSelectedDelivery(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delivery Details</DialogTitle>
          </DialogHeader>
          {selectedDelivery && (
            <div className="space-y-4">
              <div>
                <Label>Status</Label>
                <div className="mt-1">{getStatusBadge(selectedDelivery.status)}</div>
              </div>
              <div>
                <Label>Response Status</Label>
                <p>{selectedDelivery.response_status || 'N/A'}</p>
              </div>
              <div>
                <Label>Attempts</Label>
                <p>{selectedDelivery.attempts}</p>
              </div>
              <div>
                <Label>Response Body</Label>
                <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-48">
                  {selectedDelivery.response_body || 'No response body'}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </AdminLayout>
  );
}