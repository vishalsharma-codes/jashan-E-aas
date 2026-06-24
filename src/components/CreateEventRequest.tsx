import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, DollarSign, FileText, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { eventCategories } from "@/lib/categoryData";
import { format, addDays } from "date-fns";
import { toast } from "sonner";

interface CreateEventRequestProps {
  onCreated?: (requestId: string) => void;
}

const CreateEventRequest = ({ onCreated }: CreateEventRequestProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState<Date>();
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [description, setDescription] = useState("");
  const [biddingHours, setBiddingHours] = useState("24");
  const [location, setLocation] = useState("");

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please sign in to create an event request");
      return;
    }

    if (!eventType || !eventDate || !budgetMin) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    const biddingDeadline = addDays(new Date(), parseInt(biddingHours) / 24);

    const { data, error } = await supabase
      .from("event_requests")
      .insert({
        user_id: user.id,
        event_type: eventType,
        event_date: format(eventDate, "yyyy-MM-dd"),
        budget_min: parseFloat(budgetMin),
        budget_max: budgetMax ? parseFloat(budgetMax) : null,
        description,
        location,
        bidding_deadline: biddingDeadline.toISOString(),
        is_bidding_open: true,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create event request");
      console.error(error);
    } else {
      toast.success("Event request created! Vendors can now bid.");
      setOpen(false);
      resetForm();
      if (onCreated && data) {
        onCreated(data.id);
      }
    }

    setLoading(false);
  };

  const resetForm = () => {
    setEventType("");
    setEventDate(undefined);
    setBudgetMin("");
    setBudgetMax("");
    setDescription("");
    setBiddingHours("24");
    setLocation("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
          <Sparkles className="w-4 h-4 mr-2" />
          Create Event Request
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Create Event Request
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Event Type */}
          <div>
            <label className="text-sm font-medium">Event Type *</label>
            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                {eventCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    <span className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      {cat.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Event Date */}
          <div>
            <label className="text-sm font-medium">Event Date *</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full mt-1 justify-start text-left font-normal">
                  <Calendar className="w-4 h-4 mr-2" />
                  {eventDate ? format(eventDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={eventDate}
                  onSelect={setEventDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Location */}
          <div>
            <label className="text-sm font-medium">Location</label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City or venue"
              className="mt-1"
            />
          </div>

          {/* Budget */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Min Budget (₹) *</label>
              <Input
                type="number"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                placeholder="50,000"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Max Budget (₹)</label>
              <Input
                type="number"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                placeholder="500,000"
                className="mt-1"
              />
            </div>
          </div>

          {/* Bidding Duration */}
          <div>
            <label className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Bidding Duration
            </label>
            <Select value={biddingHours} onValueChange={setBiddingHours}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12 Hours</SelectItem>
                <SelectItem value="24">24 Hours</SelectItem>
                <SelectItem value="48">48 Hours</SelectItem>
                <SelectItem value="72">72 Hours</SelectItem>
                <SelectItem value="168">1 Week</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your event requirements, preferences, guest count, etc."
              className="mt-1"
              rows={4}
            />
          </div>

          {/* Submit */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              className="w-full bg-primary text-primary-foreground"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                "Creating..."
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Receiving Bids
                </>
              )}
            </Button>
          </motion.div>

          <p className="text-xs text-muted-foreground text-center">
            Vendors will be notified and can submit their proposals. You'll see live bids as they come in!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventRequest;