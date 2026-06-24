import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, 
  DollarSign, 
  User, 
  Star, 
  Verified, 
  ChevronDown, 
  ChevronUp,
  Gavel,
  Sparkles,
  TrendingDown,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Bid {
  id: string;
  amount: number;
  proposal_text: string;
  estimated_days: number | null;
  is_featured: boolean;
  status: string;
  created_at: string;
  vendor: {
    id: string;
    name: string;
    rating: number | null;
    is_verified: boolean | null;
    avatar_url: string | null;
  };
}

interface EventRequest {
  id: string;
  event_type: string;
  event_date: string;
  budget?: number | null;
  budget_min?: number | null;
  budget_max?: number | null;
  description: string | null;
  bidding_deadline: string | null;
  is_bidding_open: boolean;
}

interface LiveBiddingProps {
  eventRequestId: string;
  isVendor?: boolean;
  vendorId?: string;
}

const LiveBidding = ({ eventRequestId, isVendor = false, vendorId }: LiveBiddingProps) => {
  const { user } = useAuth();
  const [bids, setBids] = useState<Bid[]>([]);
  const [eventRequest, setEventRequest] = useState<EventRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const [showAllBids, setShowAllBids] = useState(false);
  const [showBidDialog, setShowBidDialog] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [bidProposal, setBidProposal] = useState("");
  const [estimatedDays, setEstimatedDays] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchEventRequest();
    fetchBids();
    
    // Subscribe to real-time bid updates
    const channel = supabase
      .channel(`live-bids-${eventRequestId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_bids',
          filter: `event_request_id=eq.${eventRequestId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            fetchBidWithVendor(payload.new.id);
          } else if (payload.eventType === 'UPDATE') {
            setBids(prev => prev.map(b => 
              b.id === payload.new.id ? { ...b, ...payload.new } : b
            ));
          } else if (payload.eventType === 'DELETE') {
            setBids(prev => prev.filter(b => b.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventRequestId]);

  // Countdown timer
  useEffect(() => {
    if (!eventRequest?.bidding_deadline) return;

    const updateTimer = () => {
      const deadline = new Date(eventRequest.bidding_deadline!);
      const now = new Date();
      const diff = deadline.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [eventRequest?.bidding_deadline]);

  const fetchEventRequest = async () => {
    const { data, error } = await supabase
      .from("event_requests")
      .select("*")
      .eq("id", eventRequestId)
      .single();

    if (data) setEventRequest(data);
    if (error) console.error(error);
  };

  const fetchBids = async () => {
    const { data, error } = await supabase
      .from("live_bids")
      .select(`
        *,
        vendor:vendors(id, name, rating, is_verified, avatar_url)
      `)
      .eq("event_request_id", eventRequestId)
      .eq("status", "active")
      .order("amount", { ascending: true });

    if (data) {
      // Transform the data to match our interface
      const transformedBids = data.map(bid => ({
        ...bid,
        vendor: bid.vendor as unknown as Bid['vendor']
      }));
      setBids(transformedBids);
    }
    if (error) console.error(error);
    setLoading(false);
  };

  const fetchBidWithVendor = async (bidId: string) => {
    const { data, error } = await supabase
      .from("live_bids")
      .select(`
        *,
        vendor:vendors(id, name, rating, is_verified, avatar_url)
      `)
      .eq("id", bidId)
      .single();

    if (data) {
      const transformedBid = {
        ...data,
        vendor: data.vendor as unknown as Bid['vendor']
      };
      setBids(prev => [...prev, transformedBid].sort((a, b) => a.amount - b.amount));
    }
  };

  const submitBid = async () => {
    if (!vendorId || !user) return;
    
    setSubmitting(true);
    
    const { error } = await supabase
      .from("live_bids")
      .upsert({
        event_request_id: eventRequestId,
        vendor_id: vendorId,
        amount: parseFloat(bidAmount),
        proposal_text: bidProposal,
        estimated_days: estimatedDays ? parseInt(estimatedDays) : null,
        status: 'active',
      });

    if (error) {
      console.error(error);
    } else {
      setShowBidDialog(false);
      setBidAmount("");
      setBidProposal("");
      setEstimatedDays("");
    }
    
    setSubmitting(false);
  };

  const acceptBid = async (bidId: string) => {
    const { error } = await supabase
      .from("live_bids")
      .update({ status: 'accepted' })
      .eq("id", bidId);

    if (!error) {
      // Mark other bids as rejected
      await supabase
        .from("live_bids")
        .update({ status: 'rejected' })
        .eq("event_request_id", eventRequestId)
        .neq("id", bidId);
    }
  };

  const lowestBid = bids.length > 0 ? bids[0] : null;
  const displayedBids = showAllBids ? bids : bids.slice(0, 3);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="h-48" />
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 overflow-hidden">
      {/* Animated header background */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20" />
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(circle at 0% 50%, hsl(var(--primary) / 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 100% 50%, hsl(var(--primary) / 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 0% 50%, hsl(var(--primary) / 0.3) 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Gavel className="w-5 h-5 text-primary" />
              Live Bidding
              <motion.div
                className="w-2 h-2 rounded-full bg-green-500"
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </CardTitle>
            
            {/* Countdown Timer */}
            {timeLeft && eventRequest?.is_bidding_open && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-accent" />
                <div className="flex gap-1 font-mono">
                  <span className="bg-card px-2 py-1 rounded">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span>:</span>
                  <span className="bg-card px-2 py-1 rounded">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span>:</span>
                  <span className="bg-card px-2 py-1 rounded">{String(timeLeft.seconds).padStart(2, '0')}</span>
                </div>
              </div>
            )}

            {!eventRequest?.is_bidding_open && (
              <Badge variant="secondary">Bidding Closed</Badge>
            )}
          </div>
        </CardHeader>
      </div>

      <CardContent className="space-y-4">
        {/* Event Details Summary */}
        {eventRequest && (
          <div className="p-3 rounded-lg bg-muted/50 text-sm">
            <p className="font-medium">{eventRequest.event_type}</p>
            <p className="text-muted-foreground">
              Budget: ₹{eventRequest.budget_min?.toLocaleString()} - ₹{eventRequest.budget_max?.toLocaleString()}
            </p>
          </div>
        )}

        {/* Lowest Bid Highlight */}
        {lowestBid && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative p-4 rounded-lg border-2 border-primary bg-primary/5"
          >
            <div className="absolute -top-3 left-4">
              <Badge className="bg-primary text-primary-foreground">
                <TrendingDown className="w-3 h-3 mr-1" />
                Lowest Bid
              </Badge>
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  {lowestBid.vendor.avatar_url ? (
                    <img src={lowestBid.vendor.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-primary-foreground" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{lowestBid.vendor.name}</p>
                    {lowestBid.vendor.is_verified && (
                      <Verified className="w-4 h-4 text-primary" fill="currentColor" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="w-3 h-3 text-primary" fill="currentColor" />
                    {lowestBid.vendor.rating || "New"}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <motion.p
                  key={lowestBid.amount}
                  initial={{ scale: 1.2, color: "hsl(var(--primary))" }}
                  animate={{ scale: 1, color: "hsl(var(--foreground))" }}
                  className="text-2xl font-bold"
                >
                  ₹{lowestBid.amount.toLocaleString()}
                </motion.p>
                {lowestBid.estimated_days && (
                  <p className="text-sm text-muted-foreground">{lowestBid.estimated_days} days delivery</p>
                )}
              </div>
            </div>
            
            {!isVendor && (
              <Button 
                className="w-full mt-3 bg-primary text-primary-foreground"
                onClick={() => acceptBid(lowestBid.id)}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Accept This Bid
              </Button>
            )}
          </motion.div>
        )}

        {/* All Bids List */}
        <div className="space-y-2">
          <AnimatePresence>
            {displayedBids.slice(lowestBid ? 1 : 0).map((bid, index) => (
              <motion.div
                key={bid.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    {bid.vendor.avatar_url ? (
                      <img src={bid.vendor.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-medium">{bid.vendor.name}</p>
                      {bid.vendor.is_verified && (
                        <Verified className="w-3 h-3 text-primary" fill="currentColor" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{bid.proposal_text}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold">₹{bid.amount.toLocaleString()}</p>
                  {!isVendor && (
                    <Button size="sm" variant="ghost" onClick={() => acceptBid(bid.id)}>
                      Accept
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Show More/Less */}
        {bids.length > 3 && (
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => setShowAllBids(!showAllBids)}
          >
            {showAllBids ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Show All {bids.length} Bids
              </>
            )}
          </Button>
        )}

        {/* Empty State */}
        {bids.length === 0 && (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No bids yet. Be the first to bid!</p>
          </div>
        )}

        {/* Vendor Submit Bid */}
        {isVendor && eventRequest?.is_bidding_open && (
          <Dialog open={showBidDialog} onOpenChange={setShowBidDialog}>
            <DialogTrigger asChild>
              <Button className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground">
                <DollarSign className="w-4 h-4 mr-2" />
                Submit Your Bid
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Your Proposal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium">Your Bid Amount (₹)</label>
                  <Input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder="Enter your bid amount"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Estimated Delivery (Days)</label>
                  <Input
                    type="number"
                    value={estimatedDays}
                    onChange={(e) => setEstimatedDays(e.target.value)}
                    placeholder="How many days to deliver?"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Your Proposal</label>
                  <Textarea
                    value={bidProposal}
                    onChange={(e) => setBidProposal(e.target.value)}
                    placeholder="Describe why you're the best choice for this event..."
                    className="mt-1"
                    rows={4}
                  />
                </div>
                <Button 
                  className="w-full bg-primary text-primary-foreground"
                  onClick={submitBid}
                  disabled={submitting || !bidAmount || !bidProposal}
                >
                  {submitting ? "Submitting..." : "Submit Bid"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveBidding;