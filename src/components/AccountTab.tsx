import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Heart, MessageSquare, Users, Coins, Gift, Trophy, Settings, LogOut, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  display_name: string | null;
  avatar_url: string | null;
  discount_credits: number;
  referral_code: string | null;
}

interface AccountTabProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountTab = ({ isOpen, onClose }: AccountTabProps) => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [likedVendors, setLikedVendors] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);

  useEffect(() => {
    if (user && isOpen) {
      fetchProfile();
      fetchLikedVendors();
      fetchCommunities();
    }
  }, [user, isOpen]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();
    if (data) setProfile(data);
  };

  const fetchLikedVendors = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("vendor_likes")
      .select(`
        vendor:vendors(id, name, avatar_url, category, rating)
      `)
      .eq("user_id", user.id);
    if (data) setLikedVendors(data.map(d => d.vendor));
  };

  const fetchCommunities = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("community_members")
      .select(`
        community:communities(id, name, cover_image_url, member_count, is_verified)
      `)
      .eq("user_id", user.id);
    if (data) setCommunities(data.map(d => d.community));
  };

  const menuItems = [
    { icon: CreditCard, label: "Payment Methods", count: 2 },
    { icon: Heart, label: "Liked Vendors", count: likedVendors.length },
    { icon: MessageSquare, label: "Messages", count: 3, badge: true },
    { icon: Users, label: "Communities", count: communities.length },
    { icon: Gift, label: "Referral Program" },
    { icon: Settings, label: "Settings" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background z-50 overflow-y-auto"
        >
          <div className="min-h-screen pb-20">
            {/* Header */}
            <div className="relative h-48 bg-gradient-to-br from-gold via-gold-dark to-crimson">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute top-4 right-4 text-background hover:bg-background/20"
              >
                <X className="w-6 h-6" />
              </Button>
              
              {/* Profile Card */}
              <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-full max-w-md px-4">
                <Card className="bg-card border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-20 h-20 border-4 border-gold">
                        <AvatarImage src={profile?.avatar_url || undefined} />
                        <AvatarFallback className="bg-gold text-background text-2xl">
                          {profile?.display_name?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h2 className="text-xl font-serif font-bold">
                          {profile?.display_name || "Event Enthusiast"}
                        </h2>
                        <p className="text-muted-foreground text-sm">{user?.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className="bg-gold/20 text-gold border-gold">
                            <Coins className="w-3 h-3 mr-1" />
                            {profile?.discount_credits || 0} Credits
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Content */}
            <div className="mt-24 px-4 max-w-md mx-auto">
              {/* Discount Credits Card */}
              <Card className="mb-6 bg-gradient-to-r from-velvet to-crimson border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-[#FFC9B0]" />
                      <span className="text-white font-semibold">Discount Credits</span>
                    </div>
                    <span className="text-[#FFC9B0] font-bold text-2xl">{profile?.discount_credits || 0}</span>
                  </div>
                  <Progress value={(profile?.discount_credits || 0) * 10} className="h-2 bg-white/20" />
                  <p className="text-white/70 text-xs mt-2">
                    {10 - (profile?.discount_credits || 0)} more credits to unlock 10% max discount
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="secondary" className="flex-1">
                      <Gift className="w-4 h-4 mr-1" />
                      Refer Friends
                    </Button>
                    <Button size="sm" variant="secondary" className="flex-1">
                      <Coins className="w-4 h-4 mr-1" />
                      Play & Win
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs */}
              <Tabs defaultValue="menu" className="w-full">
                <TabsList className="w-full grid grid-cols-3 mb-4">
                  <TabsTrigger value="menu">Menu</TabsTrigger>
                  <TabsTrigger value="liked">Liked</TabsTrigger>
                  <TabsTrigger value="communities">Communities</TabsTrigger>
                </TabsList>

                <TabsContent value="menu">
                  <Card>
                    <CardContent className="p-0">
                      {menuItems.map((item, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ backgroundColor: "hsl(var(--muted))" }}
                          className="w-full flex items-center justify-between p-4 border-b border-border last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                              <item.icon className="w-5 h-5 text-gold" />
                            </div>
                            <span>{item.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.count !== undefined && (
                              <Badge variant={item.badge ? "default" : "secondary"}>
                                {item.count}
                              </Badge>
                            )}
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </motion.button>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="liked">
                  <div className="space-y-3">
                    {likedVendors.length > 0 ? (
                      likedVendors.map((vendor, index) => (
                        <Card key={index}>
                          <CardContent className="p-4 flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={vendor?.avatar_url} />
                              <AvatarFallback>{vendor?.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h4 className="font-semibold">{vendor?.name}</h4>
                              <p className="text-sm text-muted-foreground">{vendor?.category}</p>
                            </div>
                            <Badge variant="secondary">⭐ {vendor?.rating}</Badge>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground">No liked vendors yet</p>
                          <Button className="mt-4 bg-gold text-background">Explore Vendors</Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="communities">
                  <div className="space-y-3">
                    {communities.length > 0 ? (
                      communities.map((community, index) => (
                        <Card key={index}>
                          <CardContent className="p-4 flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gold to-crimson" />
                            <div className="flex-1">
                              <h4 className="font-semibold">{community?.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {community?.member_count} members
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground">No communities joined yet</p>
                          <Button className="mt-4 bg-gold text-background">Browse Communities</Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Sign Out */}
              <Button
                variant="outline"
                className="w-full mt-6 text-crimson border-crimson hover:bg-crimson hover:text-white"
                onClick={signOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>

              {/* Referral Code */}
              {profile?.referral_code && (
                <Card className="mt-4">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-2">Your Referral Code</p>
                    <code className="text-lg font-mono font-bold text-gold bg-muted px-4 py-2 rounded">
                      {profile.referral_code}
                    </code>
                    <p className="text-xs text-muted-foreground mt-2">
                      Share & earn 3 credits per referral!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
