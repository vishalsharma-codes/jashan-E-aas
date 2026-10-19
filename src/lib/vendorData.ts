  export type PortfolioMediaType = "photo" | "video" | "story" | "reel";

  export interface PortfolioItem {
    id: string;
    title: string;
    gradient: string;
    emoji: string;
    category: string;
    eventType: string;
    type?: PortfolioMediaType;
    likes?: number;
    views?: number;
    duration?: string;
  }

  export interface Vendor {
    id: string;
    name: string;
    category: string;
    categoryId: string;
    subcategory: string;
    rating: number;
    reviews: number;
    location: string;
    cities: string[];
    price: string;
    priceMin: number;
    priceMax: number;
    initials: string;
    gradient: string;
    tags: string[];
    description: string;
    portfolio: PortfolioItem[];
    isVerified: boolean;
    yearsExperience: number;
    eventsCompleted: number;
    responseTime: string;
    specialties: string[];
  }

  export interface DummyReel {
    id: string;
    title: string;
    description: string;
    gradient: string;
    emoji: string;
    views: number;
    likes: number;
    comments: number;
    vendorName: string;
    vendorInitials: string;
    isVerified: boolean;
    eventType: string;
    videoUrl?: string;
  }

  export const dummyReels: DummyReel[] = [
    { id: "r1", title: "Dream Wedding Setup 💍", description: "Beachside ceremony with 500 candles & floral arches", gradient: "from-rose-900 via-rose-800 to-pink-900", emoji: "💍", views: 42800, likes: 3200, comments: 187, vendorName: "Royal Celebrations", vendorInitials: "RC", isVerified: true, eventType: "Wedding" },
    { id: "r2", title: "Corporate Gala Night ✨", description: "Exclusive black-tie event for 1000 guests at Taj Delhi", gradient: "from-blue-950 via-indigo-900 to-blue-900", emoji: "🏢", views: 28400, likes: 1840, comments: 93, vendorName: "Elite Events Co", vendorInitials: "EE", isVerified: true, eventType: "Corporate" },
    { id: "r3", title: "DJ Night at College Fest 🎧", description: "Epic Techno night with 3000 students going wild", gradient: "from-violet-950 via-purple-900 to-fuchsia-900", emoji: "🎧", views: 91200, likes: 8900, comments: 412, vendorName: "Sound & Fury DJ", vendorInitials: "SF", isVerified: false, eventType: "College Fest" },
    { id: "r4", title: "Bollywood Concert Night 🎤", description: "Live performance by top artists at Mumbai's iconic venue", gradient: "from-amber-950 via-orange-900 to-red-900", emoji: "🎤", views: 134000, likes: 15600, comments: 891, vendorName: "Star Shows India", vendorInitials: "SS", isVerified: true, eventType: "Concert" },
    { id: "r5", title: "Fairy-tale Birthday Bash 🎂", description: "Princess themed party with custom cake tower & fireworks", gradient: "from-pink-950 via-rose-900 to-fuchsia-900", emoji: "🎂", views: 19700, likes: 2100, comments: 156, vendorName: "Fairy Tale Events", vendorInitials: "FT", isVerified: false, eventType: "Birthday" },
    { id: "r6", title: "Traditional Mehendi Night 🪔", description: "Authentic Rajasthani decor & top mehendi artists from Jaipur", gradient: "from-yellow-950 via-amber-900 to-orange-900", emoji: "🪔", views: 33400, likes: 4700, comments: 228, vendorName: "Heritage Decors", vendorInitials: "HD", isVerified: true, eventType: "Wedding" },
    { id: "r7", title: "Navratri Garba Night 🎵", description: "10,000 dancers, laser lights & live garba orchestra", gradient: "from-orange-950 via-red-900 to-rose-900", emoji: "🎵", views: 287000, likes: 34200, comments: 1893, vendorName: "Sankalp Events", vendorInitials: "SE", isVerified: true, eventType: "Festival" },
    { id: "r8", title: "Destination Wedding Goa 🌊", description: "Sunset cliff ceremony with 200 guests & fireworks finale", gradient: "from-cyan-950 via-teal-900 to-blue-900", emoji: "🌊", views: 67000, likes: 8300, comments: 421, vendorName: "The Wedding Co", vendorInitials: "TW", isVerified: true, eventType: "Destination Wedding" },
    { id: "r9", title: "Fashion Week Finale 👗", description: "15 designers, 200+ models, red carpet show", gradient: "from-fuchsia-950 via-pink-900 to-purple-900", emoji: "👗", views: 445000, likes: 51200, comments: 3240, vendorName: "Style & Runway", vendorInitials: "SR", isVerified: true, eventType: "Fashion Show" },
    { id: "r10", title: "Startup Demo Day 🚀", description: "60 startups, 500 investors, India's biggest pitch fest", gradient: "from-sky-950 via-blue-900 to-indigo-900", emoji: "🚀", views: 23600, likes: 2800, comments: 198, vendorName: "TechVault Events", vendorInitials: "TV", isVerified: true, eventType: "Tech Event" },
    { id: "r11", title: "Sufi Night Under Stars ✨", description: "Open-air Sufi concert with 5,000 attendees at Mehrangarh Fort", gradient: "from-violet-950 via-indigo-900 to-blue-900", emoji: "✨", views: 89000, likes: 11200, comments: 734, vendorName: "The Grand Band Project", vendorInitials: "GB", isVerified: true, eventType: "Concert" },
    { id: "r12", title: "Kids Jungle Party 🦁", description: "Wild jungle theme with real animals, jungle trek & safari cake", gradient: "from-green-950 via-emerald-900 to-teal-900", emoji: "🦁", views: 14200, likes: 1890, comments: 167, vendorName: "Fairy Tale Events", vendorInitials: "FT", isVerified: false, eventType: "Birthday" },
    { id: "r13", title: "Royal Rajasthani Baraat 🐴", description: "Grand baraat procession with 50 horses, dhol, and fireworks", gradient: "from-amber-950 via-yellow-900 to-orange-900", emoji: "🐴", views: 78000, likes: 9400, comments: 512, vendorName: "Heritage Events", vendorInitials: "HE", isVerified: true, eventType: "Wedding" },
    { id: "r14", title: "Open Mic Night 🎙️", description: "100+ performers, sold-out venue, electric atmosphere in Bandra", gradient: "from-indigo-950 via-violet-900 to-purple-900", emoji: "🎙️", views: 18900, likes: 2200, comments: 143, vendorName: "Stage & Spotlight", vendorInitials: "SS", isVerified: false, eventType: "Live Event" },
    { id: "r15", title: "Sangeet Night Extravaganza 💃", description: "Choreographed dances, celebrity DJ, 400 guests dancing all night", gradient: "from-fuchsia-950 via-rose-900 to-pink-900", emoji: "💃", views: 52000, likes: 6800, comments: 387, vendorName: "Royal Celebrations", vendorInitials: "RC", isVerified: true, eventType: "Wedding" },
    { id: "r16", title: "Marathon Finishers Ceremony 🏃", description: "5000 runners, medal ceremony, podium lighting and crowd hype", gradient: "from-lime-950 via-green-900 to-emerald-900", emoji: "🏃", views: 33700, likes: 4100, comments: 219, vendorName: "SportsFest India", vendorInitials: "SP", isVerified: true, eventType: "Sports" },
    { id: "r17", title: "Product Launch Spectacle 🚀", description: "Drone light show + holographic reveal for major brand launch", gradient: "from-sky-950 via-cyan-900 to-blue-900", emoji: "🚀", views: 104000, likes: 12800, comments: 690, vendorName: "TechVault Events", vendorInitials: "TV", isVerified: true, eventType: "Corporate" },
    { id: "r18", title: "Mehndi Masterclass 🌿", description: "Live mehndi demo by national champion, 300-person workshop", gradient: "from-lime-950 via-yellow-900 to-amber-900", emoji: "🌿", views: 29300, likes: 3700, comments: 211, vendorName: "Artisan Mehndi House", vendorInitials: "AM", isVerified: true, eventType: "Workshop" },
    { id: "r19", title: "Heritage Haveli Wedding 🏯", description: "Intimate 80-guest wedding inside a 200-year-old Rajasthani haveli", gradient: "from-rose-950 via-amber-900 to-orange-900", emoji: "🏯", views: 41200, likes: 5900, comments: 328, vendorName: "The Wedding Co", vendorInitials: "TW", isVerified: true, eventType: "Destination Wedding" },
    { id: "r20", title: "Tech Hackathon Night 💻", description: "36-hour hackathon, 800 coders, live leaderboard & epic afterparty", gradient: "from-blue-950 via-cyan-900 to-indigo-900", emoji: "💻", views: 22100, likes: 2600, comments: 178, vendorName: "TechVault Events", vendorInitials: "TV", isVerified: true, eventType: "Tech Event" },
    { id: "r21", title: "Ganesh Utsav Procession 🪘", description: "5km procession, 20,000 devotees, 15 dhol tasha groups", gradient: "from-orange-950 via-amber-900 to-yellow-900", emoji: "🪘", views: 512000, likes: 67000, comments: 4120, vendorName: "Sankalp Events", vendorInitials: "SE", isVerified: true, eventType: "Festival" },
    { id: "r22", title: "Beach Sundowner Party 🌅", description: "Sunset party for 500 guests, bonfire, live acoustic set & cocktails", gradient: "from-orange-950 via-rose-900 to-pink-900", emoji: "🌅", views: 35800, likes: 4800, comments: 267, vendorName: "Goa Events Co", vendorInitials: "GE", isVerified: false, eventType: "Social" },
    { id: "r23", title: "Classical Carnatic Concert 🎻", description: "Maestro's farewell tour — 3000-seat hall sold out, standing ovation", gradient: "from-amber-950 via-yellow-900 to-gold-900", emoji: "🎻", views: 28700, likes: 3100, comments: 192, vendorName: "The Grand Band Project", vendorInitials: "GB", isVerified: true, eventType: "Concert" },
    { id: "r24", title: "Influencer Summit 📱", description: "India's top 200 creators, panel talks, brand deals and content creation", gradient: "from-pink-950 via-fuchsia-900 to-rose-900", emoji: "📱", views: 187000, likes: 24000, comments: 1560, vendorName: "Style & Runway", vendorInitials: "SR", isVerified: true, eventType: "Conference" },
    { id: "r25", title: "Saree Draping Championship 👘", description: "50 contestants, 12 styles, live judging by fashion icons", gradient: "from-rose-950 via-pink-900 to-fuchsia-900", emoji: "👘", views: 43000, likes: 5700, comments: 344, vendorName: "Style & Runway", vendorInitials: "SR", isVerified: true, eventType: "Fashion Show" },
    { id: "r26", title: "IPL Watch Party ⚡", description: "1200-person watch party, giant screens, cheerleaders & live commentary", gradient: "from-blue-950 via-indigo-900 to-violet-900", emoji: "⚡", views: 91800, likes: 11400, comments: 789, vendorName: "SportsFest India", vendorInitials: "SP", isVerified: true, eventType: "Sports" },
    { id: "r27", title: "Holi Celebration 2026 🌈", description: "Organic colours, DJ, 3000 revellers at MMRDA grounds Mumbai", gradient: "from-red-950 via-orange-900 to-yellow-900", emoji: "🌈", views: 234000, likes: 28500, comments: 1840, vendorName: "Sankalp Events", vendorInitials: "SE", isVerified: true, eventType: "Festival" },
    { id: "r28", title: "Award Night: Best Startup 🏆", description: "Red carpet, trophies, investor networking & after-party for 600", gradient: "from-amber-950 via-gold-900 to-yellow-900", emoji: "🏆", views: 47000, likes: 5900, comments: 341, vendorName: "EventCraft Corporate", vendorInitials: "EC", isVerified: true, eventType: "Corporate" },
    { id: "r29", title: "Luxury Candle-light Dinner 🕯️", description: "20-table private dining experience, 7-course menu, string quartet", gradient: "from-stone-950 via-zinc-900 to-neutral-900", emoji: "🕯️", views: 16400, likes: 2400, comments: 168, vendorName: "Spice Route Catering", vendorInitials: "SR2", isVerified: true, eventType: "Dining" },
    { id: "r30", title: "Retirement Party Gold Theme 👴", description: "Surprise party for 40-year career — golden decor, speeches & tears of joy", gradient: "from-yellow-950 via-amber-900 to-gold-900", emoji: "👴", views: 8900, likes: 1120, comments: 94, vendorName: "Fairy Tale Events", vendorInitials: "FT", isVerified: false, eventType: "Social" },
    { id: "r31", title: "Bride-to-be Brunch 🥂", description: "Bridal brunch for 40 guests, mimosas, photobooth & gifting session", gradient: "from-pink-950 via-rose-900 to-rose-800", emoji: "🥂", views: 12800, likes: 1890, comments: 132, vendorName: "Lens & Light Studio", vendorInitials: "LL", isVerified: true, eventType: "Wedding" },
    { id: "r32", title: "Night of Ghazals 🌙", description: "Ustad Rashid Khan live — intimate 500-seat venue with full orchestra", gradient: "from-indigo-950 via-blue-900 to-violet-900", emoji: "🌙", views: 54000, likes: 7200, comments: 423, vendorName: "The Grand Band Project", vendorInitials: "GB", isVerified: true, eventType: "Concert" },
    { id: "r33", title: "Cake Smash Session 🎂", description: "Adorable first-birthday special — 50 portraits, confetti & balloon wall", gradient: "from-sky-950 via-blue-900 to-indigo-900", emoji: "🎂", views: 9300, likes: 1500, comments: 127, vendorName: "Pixel Perfect Studios", vendorInitials: "PP", isVerified: true, eventType: "Birthday" },
    { id: "r34", title: "NGO Fundraiser Gala 🌟", description: "₹2 crore raised in one night for education — emotional performances", gradient: "from-teal-950 via-emerald-900 to-green-900", emoji: "🌟", views: 19700, likes: 2800, comments: 218, vendorName: "EventCraft Corporate", vendorInitials: "EC", isVerified: true, eventType: "Charity" },
    { id: "r35", title: "Pre-Wedding Forest Shoot 🌲", description: "Romantic golden hour shoot in Coorg coffee estate — 400 frames", gradient: "from-green-950 via-teal-900 to-emerald-900", emoji: "🌲", views: 27600, likes: 3900, comments: 241, vendorName: "Moments That Last", vendorInitials: "ML", isVerified: true, eventType: "Pre-Wedding" },
    { id: "r36", title: "Retro Bollywood Night 🎬", description: "70s-80s Bollywood theme, vintage costumes contest & classic film songs", gradient: "from-amber-950 via-red-900 to-rose-900", emoji: "🎬", views: 44500, likes: 5800, comments: 367, vendorName: "Star Shows India", vendorInitials: "SS", isVerified: true, eventType: "Entertainment" },
    { id: "r37", title: "Diwali Starlit Terrace 🪔", description: "Rooftop Diwali party with 5000 diyas, fireworks view & live band", gradient: "from-orange-950 via-amber-900 to-yellow-900", emoji: "🪔", views: 138000, likes: 16900, comments: 1023, vendorName: "Heritage Decors", vendorInitials: "HD", isVerified: true, eventType: "Festival" },
    { id: "r38", title: "Drone Light Show 🚁", description: "100 drones spell out couple's name at engagement ceremony", gradient: "from-blue-950 via-indigo-900 to-sky-900", emoji: "🚁", views: 312000, likes: 42000, comments: 2870, vendorName: "Lumiere Light Design", vendorInitials: "LM", isVerified: true, eventType: "Wedding" },
    { id: "r39", title: "Luxury Spa & Wellness Retreat 🧘", description: "Corporate wellness day for 300 employees — yoga, spa & healthy gourmet", gradient: "from-teal-950 via-green-900 to-emerald-900", emoji: "🧘", views: 11400, likes: 1600, comments: 98, vendorName: "Zenith Wellness", vendorInitials: "ZW", isVerified: false, eventType: "Wellness" },
    { id: "r40", title: "New Year's Eve Countdown 🎆", description: "Hotel terrace party for 1500 guests — 10 DJs, 12-hour celebration", gradient: "from-violet-950 via-purple-900 to-fuchsia-900", emoji: "🎆", views: 198000, likes: 23400, comments: 1540, vendorName: "Sound & Fury DJ", vendorInitials: "SF", isVerified: false, eventType: "Celebration" },
    { id: "r41", title: "Candid Wedding Reel ❤️", description: "Emotional highlights — from mehendi to vidaai, unstaged moments", gradient: "from-rose-950 via-pink-900 to-rose-900", emoji: "❤️", views: 86000, likes: 10700, comments: 634, vendorName: "Royal Frames Studio", vendorInitials: "RF", isVerified: true, eventType: "Wedding" },
    { id: "r42", title: "Street Food Festival 🌮", description: "100 stalls, 8000 food lovers, 3-day flavour fiesta across Hyderabad", gradient: "from-orange-950 via-amber-900 to-red-900", emoji: "🌮", views: 67400, likes: 8200, comments: 497, vendorName: "Spice Route Catering", vendorInitials: "SR2", isVerified: true, eventType: "Food Festival" },
    { id: "r43", title: "Graduation Day Celebration 🎓", description: "500 graduates, proud families, spectacular stage and fireworks finale", gradient: "from-blue-950 via-indigo-900 to-blue-900", emoji: "🎓", views: 21600, likes: 2900, comments: 189, vendorName: "EventCraft Corporate", vendorInitials: "EC", isVerified: true, eventType: "Academic" },
    { id: "r44", title: "Maternity Boudoir Shoot 🌸", description: "Intimate, artistic maternity portraits in studio — timeless elegance", gradient: "from-pink-950 via-rose-900 to-fuchsia-900", emoji: "🌸", views: 14800, likes: 2300, comments: 178, vendorName: "Lens & Light Studio", vendorInitials: "LL", isVerified: true, eventType: "Maternity" },
    { id: "r45", title: "Punjabi Dhol + Bhangra Flash Mob 🥁", description: "100 bhangra dancers surprise shoppers at a Delhi mall", gradient: "from-orange-950 via-yellow-900 to-amber-900", emoji: "🥁", views: 421000, likes: 55000, comments: 3420, vendorName: "Sankalp Events", vendorInitials: "SE", isVerified: true, eventType: "Flash Mob" },
    { id: "r46", title: "Corporate Team Outing 🏕️", description: "Adventure retreat for 250 employees — zipline, cooking contest & bonfire", gradient: "from-green-950 via-emerald-900 to-teal-900", emoji: "🏕️", views: 13200, likes: 1800, comments: 112, vendorName: "EventCraft Corporate", vendorInitials: "EC", isVerified: true, eventType: "Corporate" },
    { id: "r47", title: "Sikh Anand Karaj Ceremony 🙏", description: "Sacred ceremony at Golden Temple — 200 guests, majestic & moving", gradient: "from-amber-950 via-gold-900 to-orange-900", emoji: "🙏", views: 38900, likes: 5100, comments: 312, vendorName: "Heritage Events", vendorInitials: "HE", isVerified: true, eventType: "Wedding" },
    { id: "r48", title: "Baby Shower Bliss 👶", description: "Pastel-themed baby shower with neon signs, dessert table & games", gradient: "from-sky-950 via-blue-900 to-cyan-900", emoji: "👶", views: 10700, likes: 1560, comments: 108, vendorName: "Fairy Tale Events", vendorInitials: "FT", isVerified: false, eventType: "Celebration" },
    { id: "r49", title: "Rock Concert Mosh Pit 🎸", description: "Sold-out arena show — 8000 fans, pyrotechnics & crowd surfing", gradient: "from-zinc-950 via-slate-900 to-gray-900", emoji: "🎸", views: 289000, likes: 38000, comments: 2640, vendorName: "Star Shows India", vendorInitials: "SS", isVerified: true, eventType: "Concert" },
    { id: "r50", title: "Wedding Anniversary Surprise 🎊", description: "Secret 25th anniversary party — golden theme, all family flying in", gradient: "from-yellow-950 via-amber-900 to-gold-900", emoji: "🎊", views: 7600, likes: 1240, comments: 97, vendorName: "Royal Celebrations", vendorInitials: "RC", isVerified: true, eventType: "Anniversary" },
  ];

  const REEL_VIDEOS: Record<string, string> = {
  r1: "/reels/Palace_wedding.mp4",           // Dream Wedding Setup
  r2: "/reels/Corporate_conference.mp4",     // Corporate Gala Night
  r4: "/reels/Musicians_performing.mp4",     // Bollywood Concert Night
  r8: "/reels/beach.mp4",
   r10:"/reels/attending_luxury.mp4",                    // Destination Wedding Goa
};

dummyReels.forEach((reel) => {
  if (REEL_VIDEOS[reel.id]) reel.videoUrl = REEL_VIDEOS[reel.id];
});

  export const vendors: Vendor[] = [
    // ─── WEDDING ──────────────────────────────────────────────────────────────
    {
      id: "v1", name: "Royal Celebrations", category: "Wedding Planner", categoryId: "wedding", subcategory: "Full Planning",
      rating: 4.9, reviews: 312, location: "Mumbai", cities: ["Mumbai", "Pune", "Goa"],
      price: "₹3L – ₹20L", priceMin: 300000, priceMax: 2000000,
      initials: "RC", gradient: "from-rose-600 to-pink-700",
      tags: ["Luxury", "Destination", "Outdoor"],
      description: "India's most awarded wedding planning firm with 15 years of crafting unforgettable celebrations. Specializing in luxury beach & destination weddings.",
      isVerified: true, yearsExperience: 15, eventsCompleted: 842, responseTime: "< 2 hrs",
      specialties: ["Destination Weddings", "Beach Ceremonies", "Luxury Décor", "Celebrity Events"],
      portfolio: [
        { id: "p1", title: "Udaipur Palace Wedding", gradient: "from-rose-800 to-pink-900", emoji: "🏰", category: "Wedding", eventType: "Destination Wedding" },
        { id: "p2", title: "Goa Beachside Ceremony", gradient: "from-cyan-800 to-blue-900", emoji: "🌊", category: "Wedding", eventType: "Beach Wedding" },
        { id: "p3", title: "Delhi Farmhouse Affair", gradient: "from-green-800 to-emerald-900", emoji: "🌿", category: "Wedding", eventType: "Garden Wedding" },
        { id: "p4", title: "Mumbai Rooftop Vows", gradient: "from-violet-800 to-purple-900", emoji: "🌃", category: "Wedding", eventType: "City Wedding" },
      ],
    },
    {
      id: "v2", name: "Bloom & Blossom Florals", category: "Floral Designer", categoryId: "wedding", subcategory: "Décor & Florals",
      rating: 4.9, reviews: 198, location: "Delhi", cities: ["Delhi", "Noida", "Gurugram"],
      price: "₹80K – ₹5L", priceMin: 80000, priceMax: 500000,
      initials: "BB", gradient: "from-pink-600 to-rose-700",
      tags: ["Luxury", "Florals", "Mandap Design"],
      description: "Award-winning floral design studio specializing in immersive floral experiences. From intimate mandaps to grand stage setups with 10,000+ flowers.",
      isVerified: true, yearsExperience: 11, eventsCompleted: 534, responseTime: "< 4 hrs",
      specialties: ["Mandap Design", "Floral Arches", "Centrepieces", "Stage Décor"],
      portfolio: [
        { id: "p5", title: "Grand Floral Mandap", gradient: "from-pink-700 to-rose-900", emoji: "🌸", category: "Décor", eventType: "Wedding" },
        { id: "p6", title: "10K Rose Arch Entrance", gradient: "from-red-700 to-rose-900", emoji: "🌹", category: "Décor", eventType: "Wedding" },
        { id: "p7", title: "Moonlit Table Settings", gradient: "from-indigo-700 to-violet-900", emoji: "🌙", category: "Décor", eventType: "Reception" },
        { id: "p8", title: "Marigold Festival Theme", gradient: "from-yellow-700 to-amber-900", emoji: "🌼", category: "Décor", eventType: "Mehendi" },
      ],
    },
    {
      id: "v3", name: "Pixel Perfect Studios", category: "Photographer", categoryId: "wedding", subcategory: "Photography & Video",
      rating: 4.8, reviews: 267, location: "Bangalore", cities: ["Bangalore", "Mysore", "Coorg"],
      price: "₹60K – ₹2.5L", priceMin: 60000, priceMax: 250000,
      initials: "PP", gradient: "from-indigo-600 to-blue-700",
      tags: ["Candid", "Cinematic", "Pre-Wedding"],
      description: "Team of 12 photographers & videographers capturing your story in the most cinematic way possible. 50+ international awards & features in Vogue India.",
      isVerified: true, yearsExperience: 9, eventsCompleted: 623, responseTime: "< 1 hr",
      specialties: ["Cinematic Films", "Drone Coverage", "Candid Photography", "Same-Day Edits"],
      portfolio: [
        { id: "p9", title: "Cinematic Highlight Reel", gradient: "from-slate-700 to-gray-900", emoji: "🎬", category: "Photo/Video", eventType: "Wedding" },
        { id: "p10", title: "Coorg Hills Pre-Wedding", gradient: "from-green-700 to-teal-900", emoji: "🏔️", category: "Photo/Video", eventType: "Pre-Wedding" },
        { id: "p11", title: "Desert Gold Sunset Shoot", gradient: "from-amber-700 to-orange-900", emoji: "🏜️", category: "Photo/Video", eventType: "Pre-Wedding" },
        { id: "p12", title: "Candid Emotion Capture", gradient: "from-rose-700 to-pink-900", emoji: "📸", category: "Photo/Video", eventType: "Wedding" },
      ],
    },
    {
      id: "v15", name: "The Wedding Co — Mumbai", category: "Wedding Planner", categoryId: "wedding", subcategory: "Full Planning",
      rating: 4.8, reviews: 241, location: "Mumbai", cities: ["Mumbai", "Alibaug", "Goa", "Lonavala"],
      price: "₹5L – ₹40L", priceMin: 500000, priceMax: 4000000,
      initials: "TW", gradient: "from-amber-600 to-yellow-700",
      tags: ["Ultra Luxury", "Celebrity", "Destination"],
      description: "Curators of India's most Instagrammable weddings. Official wedding partners of 4 Bollywood stars. Every event is a masterpiece.",
      isVerified: true, yearsExperience: 13, eventsCompleted: 389, responseTime: "< 1 hr",
      specialties: ["Celebrity Weddings", "Cinematic Productions", "Bespoke Experiences", "International Venues"],
      portfolio: [
        { id: "p-tw1", title: "Alibaug Cliff Ceremony", gradient: "from-sky-700 to-blue-900", emoji: "🌅", category: "Wedding", eventType: "Destination Wedding" },
        { id: "p-tw2", title: "Bollywood Star Wedding", gradient: "from-amber-700 to-yellow-900", emoji: "⭐", category: "Wedding", eventType: "Celebrity Wedding" },
        { id: "p-tw3", title: "Bali Poolside Vows", gradient: "from-teal-700 to-cyan-900", emoji: "🏝️", category: "Wedding", eventType: "International" },
        { id: "p-tw4", title: "Palace Night Reception", gradient: "from-violet-700 to-purple-900", emoji: "🏯", category: "Wedding", eventType: "Reception" },
      ],
    },
    {
      id: "v16", name: "Mehendi Masters", category: "Mehendi Artist", categoryId: "wedding", subcategory: "Bridal",
      rating: 4.9, reviews: 456, location: "Jaipur", cities: ["Jaipur", "Delhi", "Mumbai", "Ahmedabad"],
      price: "₹8K – ₹50K", priceMin: 8000, priceMax: 50000,
      initials: "MM", gradient: "from-green-600 to-emerald-700",
      tags: ["Bridal Mehendi", "Arabic Art", "Rajasthani"],
      description: "Rajasthan's finest mehendi artists. Team of 15 artists specializing in Arabic, Rajasthani, and fusion mehendi for brides & their families.",
      isVerified: true, yearsExperience: 14, eventsCompleted: 2834, responseTime: "< 2 hrs",
      specialties: ["Bridal Full Set", "Arabic Mehendi", "Fusion Designs", "Group Mehendi"],
      portfolio: [
        { id: "p-mm1", title: "Royal Rajasthani Bridal", gradient: "from-amber-700 to-orange-900", emoji: "🪷", category: "Bridal", eventType: "Wedding" },
        { id: "p-mm2", title: "Arabic Mandala Art", gradient: "from-green-700 to-teal-900", emoji: "🌿", category: "Bridal", eventType: "Mehendi" },
        { id: "p-mm3", title: "Fusion Glitter Mehendi", gradient: "from-pink-700 to-rose-900", emoji: "✨", category: "Bridal", eventType: "Wedding" },
        { id: "p-mm4", title: "Family Group Mehendi", gradient: "from-yellow-700 to-amber-900", emoji: "👪", category: "Bridal", eventType: "Mehendi" },
      ],
    },
    {
      id: "v17", name: "Shaadi Shehnai Band", category: "Band & Shehnai", categoryId: "wedding", subcategory: "Entertainment",
      rating: 4.7, reviews: 189, location: "Varanasi", cities: ["Varanasi", "Delhi", "Lucknow", "Allahabad"],
      price: "₹40K – ₹2L", priceMin: 40000, priceMax: 200000,
      initials: "SS", gradient: "from-orange-600 to-amber-700",
      tags: ["Traditional", "Baraat", "Shehnai"],
      description: "Authentic wedding bands playing Shehnai, Nadaswaram & traditional wedding compositions for over 22 years. Perfect for baraat processions.",
      isVerified: false, yearsExperience: 22, eventsCompleted: 1893, responseTime: "< 6 hrs",
      specialties: ["Baraat Band", "Shehnai", "Nadaswaram", "Tashe"],
      portfolio: [
        { id: "p-ssb1", title: "Grand Baraat Procession", gradient: "from-orange-700 to-red-900", emoji: "🎺", category: "Wedding", eventType: "Baraat" },
        { id: "p-ssb2", title: "Temple Wedding Music", gradient: "from-yellow-700 to-amber-900", emoji: "🛕", category: "Wedding", eventType: "Wedding" },
        { id: "p-ssb3", title: "North Indian Sangeet", gradient: "from-rose-700 to-pink-900", emoji: "🎵", category: "Wedding", eventType: "Sangeet" },
        { id: "p-ssb4", title: "Dhol Tasha Night", gradient: "from-amber-700 to-orange-900", emoji: "🥁", category: "Wedding", eventType: "Baraat" },
      ],
    },
    {
      id: "v18", name: "Saptapadi Choreography", category: "Choreographer", categoryId: "wedding", subcategory: "Entertainment",
      rating: 4.8, reviews: 321, location: "Mumbai", cities: ["Mumbai", "Pune", "Delhi", "Bangalore"],
      price: "₹30K – ₹1.5L", priceMin: 30000, priceMax: 150000,
      initials: "SC", gradient: "from-fuchsia-600 to-purple-700",
      tags: ["Sangeet", "Group Dance", "Bollywood"],
      description: "Sangeet choreography specialists who train families & friends for the perfect performance. 500+ groups choreographed across India.",
      isVerified: true, yearsExperience: 10, eventsCompleted: 512, responseTime: "< 3 hrs",
      specialties: ["Sangeet Choreography", "Group Numbers", "Couple Acts", "Flash Mob"],
      portfolio: [
        { id: "p-sc1", title: "Bride-Side Flash Mob", gradient: "from-fuchsia-700 to-pink-900", emoji: "💃", category: "Wedding", eventType: "Sangeet" },
        { id: "p-sc2", title: "Family Medley Bollywood", gradient: "from-violet-700 to-purple-900", emoji: "🎶", category: "Wedding", eventType: "Sangeet" },
        { id: "p-sc3", title: "Kids Dance Performance", gradient: "from-yellow-700 to-orange-900", emoji: "👧", category: "Wedding", eventType: "Sangeet" },
        { id: "p-sc4", title: "Couple Dance Surprise", gradient: "from-rose-700 to-red-900", emoji: "❤️", category: "Wedding", eventType: "Reception" },
      ],
    },

    // ─── CORPORATE ────────────────────────────────────────────────────────────
    {
      id: "v4", name: "Prestige AV Solutions", category: "AV & Production", categoryId: "corporate", subcategory: "Audio Visual",
      rating: 4.8, reviews: 143, location: "Hyderabad", cities: ["Hyderabad", "Bangalore", "Chennai"],
      price: "₹1L – ₹8L", priceMin: 100000, priceMax: 800000,
      initials: "PA", gradient: "from-blue-600 to-indigo-700",
      tags: ["LED Walls", "Live Stream", "Corporate"],
      description: "India's premier AV solutions provider trusted by Fortune 500 companies. 200+ LED panels, 4K live streaming capabilities, and end-to-end production.",
      isVerified: true, yearsExperience: 13, eventsCompleted: 1247, responseTime: "< 3 hrs",
      specialties: ["LED Walls", "4K Streaming", "Stage Design", "Sound Engineering"],
      portfolio: [
        { id: "p13", title: "Infosys Annual Summit", gradient: "from-blue-700 to-indigo-900", emoji: "💻", category: "Corporate", eventType: "Conference" },
        { id: "p14", title: "Product Launch Experience", gradient: "from-cyan-700 to-blue-900", emoji: "🚀", category: "Corporate", eventType: "Launch Event" },
        { id: "p15", title: "Award Ceremony Night", gradient: "from-amber-700 to-yellow-900", emoji: "🏆", category: "Corporate", eventType: "Awards" },
        { id: "p16", title: "360° Stage Production", gradient: "from-violet-700 to-purple-900", emoji: "🎭", category: "Corporate", eventType: "Conference" },
      ],
    },
    {
      id: "v19", name: "EventCraft Corporate", category: "Event Manager", categoryId: "corporate", subcategory: "Full Management",
      rating: 4.7, reviews: 178, location: "Bangalore", cities: ["Bangalore", "Hyderabad", "Pune", "Chennai"],
      price: "₹2L – ₹25L", priceMin: 200000, priceMax: 2500000,
      initials: "EC", gradient: "from-sky-600 to-blue-700",
      tags: ["Corporate", "Annual Day", "Team Building"],
      description: "Bangalore's leading corporate event management company. End-to-end corporate event solutions for annual days, product launches, and conferences.",
      isVerified: true, yearsExperience: 9, eventsCompleted: 734, responseTime: "< 2 hrs",
      specialties: ["Annual Days", "Product Launches", "Team Building", "Hybrid Events"],
      portfolio: [
        { id: "p-ec1", title: "Wipro Annual Meet 2024", gradient: "from-blue-700 to-indigo-900", emoji: "🏢", category: "Corporate", eventType: "Annual Day" },
        { id: "p-ec2", title: "EV Car Launch Event", gradient: "from-green-700 to-teal-900", emoji: "🚗", category: "Corporate", eventType: "Product Launch" },
        { id: "p-ec3", title: "Leadership Summit", gradient: "from-slate-700 to-gray-900", emoji: "📊", category: "Corporate", eventType: "Conference" },
        { id: "p-ec4", title: "Outdoor Team Retreat", gradient: "from-emerald-700 to-green-900", emoji: "⛺", category: "Corporate", eventType: "Team Building" },
      ],
    },
    {
      id: "v20", name: "Apex Exhibition Builders", category: "Exhibition Stall Designer", categoryId: "corporate", subcategory: "Trade Shows & Exhibitions",
      rating: 4.6, reviews: 89, location: "Ahmedabad", cities: ["Ahmedabad", "Mumbai", "Delhi", "Surat"],
      price: "₹80K – ₹15L", priceMin: 80000, priceMax: 1500000,
      initials: "AE", gradient: "from-teal-600 to-cyan-700",
      tags: ["Exhibition", "Stall Design", "Trade Show"],
      description: "Leading exhibition stall designers with 500+ custom stall executions at India's biggest trade shows — AutoExpo, CES India, and GITEX.",
      isVerified: true, yearsExperience: 12, eventsCompleted: 562, responseTime: "< 4 hrs",
      specialties: ["Custom Stalls", "Modular Designs", "3D Visualization", "On-site Execution"],
      portfolio: [
        { id: "p-ae1", title: "AutoExpo 2024 Stall", gradient: "from-teal-700 to-cyan-900", emoji: "🚗", category: "Exhibition", eventType: "Trade Show" },
        { id: "p-ae2", title: "Tech Summit Booth", gradient: "from-blue-700 to-indigo-900", emoji: "💡", category: "Exhibition", eventType: "Tech Show" },
        { id: "p-ae3", title: "Pharma Expo Stall", gradient: "from-green-700 to-emerald-900", emoji: "💊", category: "Exhibition", eventType: "Trade Show" },
        { id: "p-ae4", title: "Jewelry Show Display", gradient: "from-amber-700 to-yellow-900", emoji: "💍", category: "Exhibition", eventType: "Lifestyle Show" },
      ],
    },
    {
      id: "v21", name: "Summit Speakers Bureau", category: "Keynote Speaker", categoryId: "corporate", subcategory: "Conferences & Summits",
      rating: 4.9, reviews: 67, location: "Delhi", cities: ["Delhi", "Mumbai", "Bangalore", "Pan-India"],
      price: "₹50K – ₹5L", priceMin: 50000, priceMax: 500000,
      initials: "SB", gradient: "from-violet-600 to-purple-700",
      tags: ["Keynote", "Leadership", "Motivational"],
      description: "India's largest speakers bureau with 200+ verified keynote speakers across business, technology, sports, film, and social sectors.",
      isVerified: true, yearsExperience: 8, eventsCompleted: 1834, responseTime: "< 3 hrs",
      specialties: ["Keynote Addresses", "Panel Moderators", "Motivational Talks", "TEDx Speakers"],
      portfolio: [
        { id: "p-sb1", title: "Global Leadership Summit", gradient: "from-violet-700 to-purple-900", emoji: "🎙️", category: "Corporate", eventType: "Conference" },
        { id: "p-sb2", title: "Startup Ecosystem Day", gradient: "from-sky-700 to-blue-900", emoji: "🚀", category: "Corporate", eventType: "Summit" },
        { id: "p-sb3", title: "Women in Tech Forum", gradient: "from-pink-700 to-rose-900", emoji: "👩‍💻", category: "Corporate", eventType: "Forum" },
        { id: "p-sb4", title: "Cricket Legend Keynote", gradient: "from-green-700 to-emerald-900", emoji: "🏏", category: "Corporate", eventType: "Annual Day" },
      ],
    },

    // ─── CATERING ─────────────────────────────────────────────────────────────
    {
      id: "v5", name: "Spice Route Catering", category: "Caterer", categoryId: "wedding", subcategory: "Catering",
      rating: 4.7, reviews: 428, location: "Mumbai", cities: ["Mumbai", "Pune", "Nashik"],
      price: "₹600 – ₹2,200/plate", priceMin: 600, priceMax: 2200,
      initials: "SR", gradient: "from-orange-600 to-red-700",
      tags: ["Multi-cuisine", "Live Stations", "Hygiene Certified"],
      description: "FSSAI-certified premium catering with 200+ culinary artists. Specializing in multi-cuisine menus for 50 to 5,000 guests with live cooking stations.",
      isVerified: true, yearsExperience: 18, eventsCompleted: 2840, responseTime: "< 2 hrs",
      specialties: ["Live Stations", "Continental", "South Indian", "Mughlai"],
      portfolio: [
        { id: "p17", title: "Royal Mughlai Feast", gradient: "from-amber-700 to-red-900", emoji: "🍛", category: "Catering", eventType: "Wedding" },
        { id: "p18", title: "Italian Live Counter", gradient: "from-green-700 to-emerald-900", emoji: "🍝", category: "Catering", eventType: "Corporate" },
        { id: "p19", title: "Dessert Wonderland Setup", gradient: "from-pink-700 to-rose-900", emoji: "🍰", category: "Catering", eventType: "Birthday" },
        { id: "p20", title: "BBQ & Grill Night", gradient: "from-orange-700 to-red-900", emoji: "🔥", category: "Catering", eventType: "Party" },
      ],
    },
    {
      id: "v22", name: "Zaika Grand Caterers", category: "Caterer", categoryId: "social-party", subcategory: "Catering",
      rating: 4.8, reviews: 534, location: "Delhi", cities: ["Delhi", "Noida", "Gurugram", "Faridabad"],
      price: "₹500 – ₹1,800/plate", priceMin: 500, priceMax: 1800,
      initials: "ZG", gradient: "from-red-600 to-orange-700",
      tags: ["North Indian", "Mughlai", "Jain Menu"],
      description: "Delhi NCR's favourite caterers for weddings and social events. Serving authentic North Indian, Mughlai, and Jain menus since 1998.",
      isVerified: true, yearsExperience: 26, eventsCompleted: 4200, responseTime: "< 1 hr",
      specialties: ["Mughlai Biryani", "Jain Special Menu", "Gujrati Thali", "Live Pav Bhaji"],
      portfolio: [
        { id: "p-zg1", title: "500-Guest Wedding Feast", gradient: "from-red-700 to-orange-900", emoji: "🍽️", category: "Catering", eventType: "Wedding" },
        { id: "p-zg2", title: "Corporate Lunch Buffet", gradient: "from-orange-700 to-amber-900", emoji: "🏢", category: "Catering", eventType: "Corporate" },
        { id: "p-zg3", title: "Holi Festival Sweets", gradient: "from-pink-700 to-fuchsia-900", emoji: "🎨", category: "Catering", eventType: "Festival" },
        { id: "p-zg4", title: "Ramadan Special Iftar", gradient: "from-indigo-700 to-blue-900", emoji: "🌙", category: "Catering", eventType: "Religious" },
      ],
    },
    {
      id: "v23", name: "South Spice Events", category: "Caterer", categoryId: "wedding", subcategory: "Catering",
      rating: 4.7, reviews: 289, location: "Chennai", cities: ["Chennai", "Bangalore", "Hyderabad", "Kochi"],
      price: "₹400 – ₹1,400/plate", priceMin: 400, priceMax: 1400,
      initials: "SS", gradient: "from-yellow-600 to-green-700",
      tags: ["South Indian", "Banana Leaf", "Sadhya"],
      description: "Authentic South Indian catering specialists. Traditional banana leaf meals, Kerala Sadhya, Tamil Nadu Virundhu, and Andhra Sadya.",
      isVerified: true, yearsExperience: 15, eventsCompleted: 1678, responseTime: "< 2 hrs",
      specialties: ["Banana Leaf Meal", "Kerala Sadhya", "Chettinad Cuisine", "Traditional Payasam"],
      portfolio: [
        { id: "p-ss1", title: "1000-Leaf Sadhya Feast", gradient: "from-yellow-700 to-green-900", emoji: "🍌", category: "Catering", eventType: "Wedding" },
        { id: "p-ss2", title: "Onam Onaasadya Setup", gradient: "from-green-700 to-emerald-900", emoji: "🌺", category: "Catering", eventType: "Festival" },
        { id: "p-ss3", title: "Authentic Tamil Virundhu", gradient: "from-amber-700 to-yellow-900", emoji: "🍛", category: "Catering", eventType: "Wedding" },
        { id: "p-ss4", title: "Payasam Bar Setup", gradient: "from-orange-700 to-amber-900", emoji: "🍮", category: "Catering", eventType: "Reception" },
      ],
    },

    // ─── DJ / MUSIC ───────────────────────────────────────────────────────────
    {
      id: "v6", name: "Sound & Fury Entertainment", category: "DJ Services", categoryId: "concert", subcategory: "Entertainment",
      rating: 4.8, reviews: 189, location: "Goa", cities: ["Goa", "Mumbai", "Hyderabad"],
      price: "₹25K – ₹1.2L", priceMin: 25000, priceMax: 120000,
      initials: "SF", gradient: "from-violet-600 to-purple-700",
      tags: ["Weddings", "Parties", "Bollywood"],
      description: "India's most sought-after DJ duo with over 1000 performances across 28 cities. Specializing in Bollywood retro, EDM fusion & live dhol mashups.",
      isVerified: true, yearsExperience: 8, eventsCompleted: 1034, responseTime: "< 1 hr",
      specialties: ["Bollywood Fusion", "EDM", "Live Dhol", "Wedding DJ"],
      portfolio: [
        { id: "p21", title: "Goa Beach Party Set", gradient: "from-cyan-700 to-blue-900", emoji: "🌊", category: "Music", eventType: "Party" },
        { id: "p22", title: "Mumbai Wedding Reception", gradient: "from-violet-700 to-purple-900", emoji: "🎧", category: "Music", eventType: "Wedding" },
        { id: "p23", title: "College Fest EDM Night", gradient: "from-fuchsia-700 to-pink-900", emoji: "⚡", category: "Music", eventType: "College Fest" },
        { id: "p24", title: "Bollywood Retro Evening", gradient: "from-amber-700 to-orange-900", emoji: "🎵", category: "Music", eventType: "Party" },
      ],
    },
    {
      id: "v7", name: "The Grand Band Project", category: "Live Band", categoryId: "concert", subcategory: "Entertainment",
      rating: 4.9, reviews: 112, location: "Chennai", cities: ["Chennai", "Bangalore", "Hyderabad"],
      price: "₹1.5L – ₹5L", priceMin: 150000, priceMax: 500000,
      initials: "GB", gradient: "from-amber-600 to-yellow-700",
      tags: ["Live Music", "Jazz", "Bollywood"],
      description: "Award-winning 8-piece band performing Jazz, Bollywood classics & modern fusion. Perfect for upscale weddings, corporate galas & brand launches.",
      isVerified: true, yearsExperience: 12, eventsCompleted: 478, responseTime: "< 4 hrs",
      specialties: ["Jazz Fusion", "Bollywood", "Sufi Music", "Corporate Entertainment"],
      portfolio: [
        { id: "p25", title: "Jazz Brunch Performance", gradient: "from-amber-700 to-yellow-900", emoji: "🎺", category: "Music", eventType: "Corporate" },
        { id: "p26", title: "Wedding Sangeet Night", gradient: "from-rose-700 to-pink-900", emoji: "🎶", category: "Music", eventType: "Wedding" },
        { id: "p27", title: "Sufi Night Concert", gradient: "from-teal-700 to-cyan-900", emoji: "🎸", category: "Music", eventType: "Concert" },
        { id: "p28", title: "Bollywood Medley Show", gradient: "from-indigo-700 to-blue-900", emoji: "🎤", category: "Music", eventType: "Party" },
      ],
    },
    {
      id: "v24", name: "Dhol Masters India", category: "Dhol Players", categoryId: "wedding", subcategory: "Entertainment",
      rating: 4.8, reviews: 445, location: "Amritsar", cities: ["Amritsar", "Delhi", "Chandigarh", "Mumbai"],
      price: "₹8K – ₹50K", priceMin: 8000, priceMax: 50000,
      initials: "DM", gradient: "from-orange-600 to-red-700",
      tags: ["Dhol", "Baraat", "Bhangra"],
      description: "Professional dhol group with 25 years of Punjabi wedding culture experience. Energize every baraat, sangeet, and reception with authentic Punjabi beats.",
      isVerified: true, yearsExperience: 25, eventsCompleted: 3400, responseTime: "< 2 hrs",
      specialties: ["Baraat Dhol", "Bhangra Beats", "LED Dhol", "Fireworks Synced Dhol"],
      portfolio: [
        { id: "p-dm1", title: "LED Dhol Baraat", gradient: "from-orange-700 to-red-900", emoji: "🥁", category: "Music", eventType: "Baraat" },
        { id: "p-dm2", title: "Bhangra Flash Mob", gradient: "from-yellow-700 to-amber-900", emoji: "🕺", category: "Music", eventType: "Sangeet" },
        { id: "p-dm3", title: "Stadium Dhol Group", gradient: "from-blue-700 to-indigo-900", emoji: "🏟️", category: "Music", eventType: "Sports" },
        { id: "p-dm4", title: "Sunrise Pheras Dhol", gradient: "from-pink-700 to-rose-900", emoji: "🌅", category: "Music", eventType: "Wedding" },
      ],
    },
    {
      id: "v25", name: "Groove Station DJ", category: "DJ Services", categoryId: "social-party", subcategory: "Entertainment",
      rating: 4.7, reviews: 234, location: "Pune", cities: ["Pune", "Mumbai", "Nashik"],
      price: "₹15K – ₹80K", priceMin: 15000, priceMax: 80000,
      initials: "GS", gradient: "from-cyan-600 to-teal-700",
      tags: ["House", "Techno", "Pub"],
      description: "Pune's hottest DJ collective specializing in House, Techno, and commercial Bollywood for parties, clubs, and college events.",
      isVerified: false, yearsExperience: 5, eventsCompleted: 678, responseTime: "< 2 hrs",
      specialties: ["House Music", "Commercial Bollywood", "B2B Sets", "Live Mashups"],
      portfolio: [
        { id: "p-gs1", title: "NYE Countdown Set", gradient: "from-cyan-700 to-blue-900", emoji: "🎆", category: "Music", eventType: "Party" },
        { id: "p-gs2", title: "College Annual DJ Night", gradient: "from-violet-700 to-purple-900", emoji: "🎓", category: "Music", eventType: "College Fest" },
        { id: "p-gs3", title: "Corporate Afterparty", gradient: "from-sky-700 to-indigo-900", emoji: "🏢", category: "Music", eventType: "Corporate" },
        { id: "p-gs4", title: "Beach House Party Goa", gradient: "from-teal-700 to-cyan-900", emoji: "🏖️", category: "Music", eventType: "Party" },
      ],
    },

    // ─── BIRTHDAY / PARTIES ───────────────────────────────────────────────────
    {
      id: "v8", name: "Fairy Tale Events", category: "Party Decorator", categoryId: "birthday", subcategory: "Décor",
      rating: 4.7, reviews: 234, location: "Pune", cities: ["Pune", "Mumbai", "Nashik"],
      price: "₹30K – ₹1.5L", priceMin: 30000, priceMax: 150000,
      initials: "FT", gradient: "from-pink-600 to-fuchsia-700",
      tags: ["Kids Parties", "Themed", "Birthday"],
      description: "Transforming ordinary spaces into magical experiences. Specializing in themed birthday parties for kids & adults with custom props & installations.",
      isVerified: false, yearsExperience: 6, eventsCompleted: 892, responseTime: "< 3 hrs",
      specialties: ["Theme Parties", "Kids Entertainment", "Balloon Art", "Surprise Planning"],
      portfolio: [
        { id: "p29", title: "Jungle Theme Kiddie Party", gradient: "from-green-700 to-emerald-900", emoji: "🦁", category: "Décor", eventType: "Birthday" },
        { id: "p30", title: "Unicorn Wonderland Setup", gradient: "from-pink-700 to-fuchsia-900", emoji: "🦄", category: "Décor", eventType: "Birthday" },
        { id: "p31", title: "Starry Night Adult Party", gradient: "from-indigo-700 to-blue-900", emoji: "✨", category: "Décor", eventType: "Birthday" },
        { id: "p32", title: "Superhero Adventure Zone", gradient: "from-red-700 to-orange-900", emoji: "🦸", category: "Décor", eventType: "Birthday" },
      ],
    },
    {
      id: "v26", name: "Sweet Memories Bakery", category: "Cake Designer", categoryId: "birthday", subcategory: "Party Essentials",
      rating: 4.9, reviews: 678, location: "Bangalore", cities: ["Bangalore", "Mysore", "Mangalore"],
      price: "₹2,500 – ₹50K", priceMin: 2500, priceMax: 50000,
      initials: "SM", gradient: "from-pink-600 to-rose-700",
      tags: ["Custom Cakes", "Fondant Art", "3D Cakes"],
      description: "Bangalore's most celebrated cake design studio. Custom wedding cakes, tiered birthday cakes, and edible art installations for all occasions.",
      isVerified: true, yearsExperience: 7, eventsCompleted: 3280, responseTime: "< 1 hr",
      specialties: ["Fondant Sculpting", "3D Character Cakes", "Floral Cakes", "Cake Towers"],
      portfolio: [
        { id: "p-smb1", title: "7-Tier Wedding Cake", gradient: "from-pink-700 to-rose-900", emoji: "🎂", category: "Cake", eventType: "Wedding" },
        { id: "p-smb2", title: "Avengers Theme Kids Cake", gradient: "from-red-700 to-orange-900", emoji: "🦸", category: "Cake", eventType: "Birthday" },
        { id: "p-smb3", title: "Gold Drip Anniversary Cake", gradient: "from-amber-700 to-yellow-900", emoji: "✨", category: "Cake", eventType: "Anniversary" },
        { id: "p-smb4", title: "Floral Garden Cake Tower", gradient: "from-green-700 to-teal-900", emoji: "🌸", category: "Cake", eventType: "Birthday" },
      ],
    },
    {
      id: "v27", name: "Wonder Kidz Entertainment", category: "Kids Entertainer", categoryId: "birthday", subcategory: "Kids Party Specialists",
      rating: 4.8, reviews: 312, location: "Delhi", cities: ["Delhi", "Noida", "Gurugram", "Faridabad"],
      price: "₹10K – ₹60K", priceMin: 10000, priceMax: 60000,
      initials: "WK", gradient: "from-yellow-600 to-orange-700",
      tags: ["Magic Show", "Puppets", "Face Painting"],
      description: "Professional kids entertainment troupe with 8 specialized artists. Magic shows, puppet performances, face painting & interactive games.",
      isVerified: true, yearsExperience: 9, eventsCompleted: 1430, responseTime: "< 2 hrs",
      specialties: ["Magic Shows", "Puppet Shows", "Face Painting", "Balloon Twisting"],
      portfolio: [
        { id: "p-wk1", title: "Grand Magic Extravaganza", gradient: "from-yellow-700 to-orange-900", emoji: "🎩", category: "Entertainment", eventType: "Birthday" },
        { id: "p-wk2", title: "Puppet Theatre Show", gradient: "from-pink-700 to-fuchsia-900", emoji: "🎭", category: "Entertainment", eventType: "Birthday" },
        { id: "p-wk3", title: "Face Paint Carnival", gradient: "from-teal-700 to-cyan-900", emoji: "🎨", category: "Entertainment", eventType: "Kids Party" },
        { id: "p-wk4", title: "Balloon Sculpture Zone", gradient: "from-blue-700 to-indigo-900", emoji: "🎈", category: "Entertainment", eventType: "Birthday" },
      ],
    },

    // ─── LIGHTING ─────────────────────────────────────────────────────────────
    {
      id: "v9", name: "Lumiere Light Design", category: "Lighting Designer", categoryId: "wedding", subcategory: "Lighting",
      rating: 4.8, reviews: 156, location: "Delhi", cities: ["Delhi", "Agra", "Jaipur"],
      price: "₹80K – ₹6L", priceMin: 80000, priceMax: 600000,
      initials: "LL", gradient: "from-yellow-600 to-amber-700",
      tags: ["Luxury Lighting", "LED", "Ambience"],
      description: "Pioneers of experiential lighting in India. Creating immersive light environments with 50,000+ LED nodes, laser shows & dynamic color choreography.",
      isVerified: true, yearsExperience: 14, eventsCompleted: 713, responseTime: "< 2 hrs",
      specialties: ["Dynamic LED", "Laser Shows", "Ambient Lighting", "Mapping"],
      portfolio: [
        { id: "p33", title: "Palace Laser Mapping", gradient: "from-yellow-700 to-amber-900", emoji: "✨", category: "Lighting", eventType: "Wedding" },
        { id: "p34", title: "Golden Hour Reception", gradient: "from-orange-700 to-amber-900", emoji: "🌅", category: "Lighting", eventType: "Wedding" },
        { id: "p35", title: "Neon Concert Stage", gradient: "from-fuchsia-700 to-pink-900", emoji: "💡", category: "Lighting", eventType: "Concert" },
        { id: "p36", title: "Corporate Blue Hour", gradient: "from-blue-700 to-indigo-900", emoji: "🔷", category: "Lighting", eventType: "Corporate" },
      ],
    },
    {
      id: "v28", name: "NeonGlow FX", category: "Lighting Designer", categoryId: "concert", subcategory: "Stage Production",
      rating: 4.7, reviews: 134, location: "Mumbai", cities: ["Mumbai", "Pune", "Hyderabad", "Goa"],
      price: "₹1.2L – ₹12L", priceMin: 120000, priceMax: 1200000,
      initials: "NG", gradient: "from-violet-600 to-fuchsia-700",
      tags: ["Concert Lighting", "Pyrotechnics", "LED Walls"],
      description: "Specialist concert & events lighting company. From intimate shows to stadium productions. Authorized pyrotechnics & special effects operator.",
      isVerified: true, yearsExperience: 11, eventsCompleted: 423, responseTime: "< 3 hrs",
      specialties: ["Concert Lighting", "Pyrotechnics", "Fog & Haze", "Moving Head Rigs"],
      portfolio: [
        { id: "p-ng1", title: "Bollywood Tour Lighting", gradient: "from-violet-700 to-purple-900", emoji: "🎸", category: "Lighting", eventType: "Concert" },
        { id: "p-ng2", title: "NYE Fireworks Sync", gradient: "from-amber-700 to-red-900", emoji: "🎆", category: "Lighting", eventType: "NYE Party" },
        { id: "p-ng3", title: "Tomorrowland Setup India", gradient: "from-cyan-700 to-blue-900", emoji: "💥", category: "Lighting", eventType: "EDM Festival" },
        { id: "p-ng4", title: "Film Premiere Red Carpet", gradient: "from-red-700 to-rose-900", emoji: "🎬", category: "Lighting", eventType: "Film Event" },
      ],
    },

    // ─── BRIDAL ───────────────────────────────────────────────────────────────
    {
      id: "v10", name: "Aarav Bridal Studio", category: "Bridal Makeup", categoryId: "wedding", subcategory: "Bridal",
      rating: 4.9, reviews: 341, location: "Mumbai", cities: ["Mumbai", "Pune", "Surat"],
      price: "₹25K – ₹80K", priceMin: 25000, priceMax: 80000,
      initials: "AB", gradient: "from-rose-600 to-red-700",
      tags: ["Bridal", "HD Makeup", "Airbrush"],
      description: "Mumbai's most sought-after bridal artist. Features in Harper's Bazaar, Vogue India & Femina. Specializing in airbrush bridal makeup with a natural glow.",
      isVerified: true, yearsExperience: 10, eventsCompleted: 1128, responseTime: "< 1 hr",
      specialties: ["Airbrush Bridal", "HD Makeup", "Saree Draping", "Engagement Looks"],
      portfolio: [
        { id: "p37", title: "South Indian Bridal Look", gradient: "from-red-700 to-rose-900", emoji: "👰", category: "Bridal", eventType: "Wedding" },
        { id: "p38", title: "Minimalist Glow Bridal", gradient: "from-pink-700 to-rose-900", emoji: "✨", category: "Bridal", eventType: "Wedding" },
        { id: "p39", title: "Rajasthani Bridal Art", gradient: "from-amber-700 to-orange-900", emoji: "🎨", category: "Bridal", eventType: "Wedding" },
        { id: "p40", title: "Mehendi Bridal Package", gradient: "from-green-700 to-teal-900", emoji: "🪷", category: "Bridal", eventType: "Mehendi" },
      ],
    },
    {
      id: "v29", name: "Glam by Nandita", category: "Bridal Makeup", categoryId: "wedding", subcategory: "Bridal",
      rating: 4.8, reviews: 278, location: "Hyderabad", cities: ["Hyderabad", "Chennai", "Bangalore"],
      price: "₹20K – ₹60K", priceMin: 20000, priceMax: 60000,
      initials: "GN", gradient: "from-fuchsia-600 to-pink-700",
      tags: ["South Indian Bridal", "Kanjivaram", "HD Makeup"],
      description: "Telangana's leading bridal makeup artist specializing in traditional South Indian bridal looks. 800+ brides across Telugu, Tamil, and Kannadiga traditions.",
      isVerified: true, yearsExperience: 8, eventsCompleted: 892, responseTime: "< 2 hrs",
      specialties: ["Telugu Bridal Look", "Nauvari Saree Draping", "Silk Saree Draping", "Bun Styling"],
      portfolio: [
        { id: "p-gn1", title: "Telugu Traditional Bridal", gradient: "from-red-700 to-rose-900", emoji: "👰", category: "Bridal", eventType: "Wedding" },
        { id: "p-gn2", title: "Kanjivaram Draping Art", gradient: "from-orange-700 to-red-900", emoji: "🪭", category: "Bridal", eventType: "Wedding" },
        { id: "p-gn3", title: "Engagement Dewy Look", gradient: "from-pink-700 to-fuchsia-900", emoji: "💍", category: "Bridal", eventType: "Engagement" },
        { id: "p-gn4", title: "Gold Jewellery Shoot", gradient: "from-amber-700 to-yellow-900", emoji: "💛", category: "Bridal", eventType: "Shoot" },
      ],
    },

    // ─── COLLEGE ──────────────────────────────────────────────────────────────
    {
      id: "v11", name: "Campus Vibe Productions", category: "Event Manager", categoryId: "educational", subcategory: "College Fests",
      rating: 4.6, reviews: 87, location: "Bangalore", cities: ["Bangalore", "Manipal", "Vellore"],
      price: "₹2L – ₹15L", priceMin: 200000, priceMax: 1500000,
      initials: "CV", gradient: "from-emerald-600 to-teal-700",
      tags: ["College Fests", "Budget-Friendly", "Fun"],
      description: "Specialists in college events & fests. Managed 200+ college fests including IIT Techfest, BITS Pilani Oasis & Christ University events. Big on budget, bigger on fun.",
      isVerified: false, yearsExperience: 7, eventsCompleted: 214, responseTime: "< 6 hrs",
      specialties: ["College Fests", "Battle of Bands", "Gaming Tourneys", "Flash Mobs"],
      portfolio: [
        { id: "p41", title: "IIT Techfest 2024", gradient: "from-blue-700 to-indigo-900", emoji: "🎓", category: "College", eventType: "Tech Fest" },
        { id: "p42", title: "BITS Oasis Music Night", gradient: "from-violet-700 to-purple-900", emoji: "🎸", category: "College", eventType: "Cultural Fest" },
        { id: "p43", title: "Gaming Tournament Setup", gradient: "from-green-700 to-emerald-900", emoji: "🎮", category: "College", eventType: "Sports Fest" },
        { id: "p44", title: "200+ Crowd Flash Mob", gradient: "from-pink-700 to-rose-900", emoji: "💃", category: "College", eventType: "Flash Mob" },
      ],
    },
    {
      id: "v30", name: "Techfest Pro Events", category: "Tech Fest Organizer", categoryId: "educational", subcategory: "Competitions",
      rating: 4.7, reviews: 62, location: "Chennai", cities: ["Chennai", "Bangalore", "Hyderabad", "Vellore"],
      price: "₹1L – ₹12L", priceMin: 100000, priceMax: 1200000,
      initials: "TP", gradient: "from-sky-600 to-blue-700",
      tags: ["Hackathons", "Robotics", "Techfest"],
      description: "Techfest planning specialists for engineering colleges. From hackathon setups to robotics competitions — full end-to-end management.",
      isVerified: true, yearsExperience: 6, eventsCompleted: 89, responseTime: "< 4 hrs",
      specialties: ["Hackathons", "Robotics Events", "Coding Competitions", "Startup Pitches"],
      portfolio: [
        { id: "p-tp1", title: "48hr Hackathon Setup", gradient: "from-sky-700 to-blue-900", emoji: "💻", category: "Education", eventType: "Hackathon" },
        { id: "p-tp2", title: "Robotics War Arena", gradient: "from-gray-700 to-slate-900", emoji: "🤖", category: "Education", eventType: "Competition" },
        { id: "p-tp3", title: "NIT Techfest 2023", gradient: "from-indigo-700 to-violet-900", emoji: "🎓", category: "Education", eventType: "Tech Fest" },
        { id: "p-tp4", title: "Startup Pitch Day", gradient: "from-green-700 to-teal-900", emoji: "🚀", category: "Education", eventType: "Startup" },
      ],
    },

    // ─── VENUE ────────────────────────────────────────────────────────────────
    {
      id: "v12", name: "Heritage Grand Venues", category: "Venue", categoryId: "wedding", subcategory: "Venue & Logistics",
      rating: 4.8, reviews: 209, location: "Jaipur", cities: ["Jaipur", "Udaipur", "Jodhpur"],
      price: "₹2L – ₹25L/day", priceMin: 200000, priceMax: 2500000,
      initials: "HG", gradient: "from-amber-600 to-yellow-700",
      tags: ["Heritage", "Palace", "Outdoor"],
      description: "Curators of India's most iconic heritage venues — royal palaces, lakeside havelis & fort properties. Exclusive tie-ups with 40+ premium properties.",
      isVerified: true, yearsExperience: 20, eventsCompleted: 389, responseTime: "< 5 hrs",
      specialties: ["Royal Palaces", "Lakeside Venues", "Fort Properties", "Destination Weddings"],
      portfolio: [
        { id: "p45", title: "Amber Fort Wedding", gradient: "from-amber-700 to-yellow-900", emoji: "🏯", category: "Venue", eventType: "Wedding" },
        { id: "p46", title: "Pichola Lakeside Ceremony", gradient: "from-cyan-700 to-blue-900", emoji: "🏞️", category: "Venue", eventType: "Wedding" },
        { id: "p47", title: "Mehrangarh Fort Event", gradient: "from-orange-700 to-red-900", emoji: "🌅", category: "Venue", eventType: "Corporate" },
        { id: "p48", title: "Rambagh Palace Gala", gradient: "from-rose-700 to-pink-900", emoji: "👑", category: "Venue", eventType: "Wedding" },
      ],
    },
    {
      id: "v31", name: "Urban Rooftop Venues", category: "Venue", categoryId: "social-party", subcategory: "Theme & Concept Parties",
      rating: 4.7, reviews: 143, location: "Mumbai", cities: ["Mumbai", "Bangalore", "Delhi"],
      price: "₹80K – ₹5L/day", priceMin: 80000, priceMax: 500000,
      initials: "UR", gradient: "from-sky-600 to-indigo-700",
      tags: ["Rooftop", "City View", "Intimate"],
      description: "Curated collection of premium rooftop venue spaces across metro cities. Perfect for intimate weddings, parties, and corporate events with skyline views.",
      isVerified: true, yearsExperience: 5, eventsCompleted: 289, responseTime: "< 3 hrs",
      specialties: ["Rooftop Ceremonies", "Skyline Events", "Intimate Gatherings", "Cocktail Parties"],
      portfolio: [
        { id: "p-ur1", title: "Bandra Skyline Event", gradient: "from-sky-700 to-blue-900", emoji: "🌃", category: "Venue", eventType: "Party" },
        { id: "p-ur2", title: "Marine Drive Rooftop", gradient: "from-indigo-700 to-violet-900", emoji: "🌊", category: "Venue", eventType: "Wedding" },
        { id: "p-ur3", title: "Delhi Ridge Rooftop", gradient: "from-green-700 to-teal-900", emoji: "🏙️", category: "Venue", eventType: "Corporate" },
        { id: "p-ur4", title: "Sunset Cocktail Setup", gradient: "from-orange-700 to-amber-900", emoji: "🍹", category: "Venue", eventType: "Party" },
      ],
    },
    {
      id: "v32", name: "Greenscape Farmhouses", category: "Venue", categoryId: "wedding", subcategory: "Venue & Logistics",
      rating: 4.6, reviews: 167, location: "Delhi", cities: ["Delhi", "Noida", "Gurugram", "Manesar"],
      price: "₹1.5L – ₹10L/day", priceMin: 150000, priceMax: 1000000,
      initials: "GF", gradient: "from-green-600 to-emerald-700",
      tags: ["Farmhouse", "Garden", "Outdoor"],
      description: "NCR's premier farmhouse venue collection for weddings and parties. 15 exclusive properties ranging from 1 to 10 acres with lush green settings.",
      isVerified: true, yearsExperience: 10, eventsCompleted: 423, responseTime: "< 4 hrs",
      specialties: ["Outdoor Ceremonies", "Garden Receptions", "Tent Setups", "Weekend Getaways"],
      portfolio: [
        { id: "p-gf1", title: "3-Acre Garden Wedding", gradient: "from-green-700 to-emerald-900", emoji: "🌳", category: "Venue", eventType: "Wedding" },
        { id: "p-gf2", title: "Pool Party Farmhouse", gradient: "from-cyan-700 to-teal-900", emoji: "🏊", category: "Venue", eventType: "Party" },
        { id: "p-gf3", title: "Harvest Festival Setup", gradient: "from-amber-700 to-orange-900", emoji: "🌾", category: "Venue", eventType: "Festival" },
        { id: "p-gf4", title: "Corporate Retreat Villa", gradient: "from-slate-700 to-gray-900", emoji: "🏡", category: "Venue", eventType: "Corporate" },
      ],
    },

    // ─── ANCHOR / MC ──────────────────────────────────────────────────────────
    {
      id: "v13", name: "Rohan Mehra — MC & Host", category: "Anchor / MC", categoryId: "corporate", subcategory: "Entertainment",
      rating: 4.7, reviews: 174, location: "Mumbai", cities: ["Mumbai", "Delhi", "Bangalore", "Pan-India"],
      price: "₹40K – ₹2.5L", priceMin: 40000, priceMax: 250000,
      initials: "RM", gradient: "from-sky-600 to-blue-700",
      tags: ["Bilingual", "Corporate", "Wedding Host"],
      description: "India's top bilingual anchor with 800+ events. Former MTV VJ & TEDx speaker. Specializes in corporate conclaves, award nights & high-energy wedding receptions.",
      isVerified: true, yearsExperience: 11, eventsCompleted: 834, responseTime: "< 2 hrs",
      specialties: ["Corporate Conclaves", "Award Ceremonies", "Wedding Reception", "TEDx Events"],
      portfolio: [
        { id: "p49", title: "TED Conference Host", gradient: "from-red-700 to-rose-900", emoji: "🎙️", category: "Hosting", eventType: "Conference" },
        { id: "p50", title: "Filmfare Awards MC", gradient: "from-amber-700 to-yellow-900", emoji: "🏆", category: "Hosting", eventType: "Awards" },
        { id: "p51", title: "Grand Wedding Reception", gradient: "from-violet-700 to-purple-900", emoji: "🎊", category: "Hosting", eventType: "Wedding" },
        { id: "p52", title: "Product Launch Emcee", gradient: "from-blue-700 to-indigo-900", emoji: "🚀", category: "Hosting", eventType: "Launch" },
      ],
    },
    {
      id: "v33", name: "Priya Sharma — Celebrity Host", category: "Anchor / MC", categoryId: "corporate", subcategory: "Entertainment",
      rating: 4.9, reviews: 212, location: "Delhi", cities: ["Delhi", "Mumbai", "Bangalore", "Pan-India"],
      price: "₹60K – ₹4L", priceMin: 60000, priceMax: 400000,
      initials: "PS", gradient: "from-rose-600 to-pink-700",
      tags: ["Trilingual", "Awards", "Fashion Events"],
      description: "Former Zee TV anchor turned India's most in-demand event host. Trilingual (Hindi, English, Punjabi). Known for energy, wit, and crowd command.",
      isVerified: true, yearsExperience: 12, eventsCompleted: 1034, responseTime: "< 2 hrs",
      specialties: ["Award Nights", "Fashion Weeks", "Political Events", "Brand Launches"],
      portfolio: [
        { id: "p-ps1", title: "IIFA Awards Host", gradient: "from-gold-700 to-amber-900", emoji: "🎬", category: "Hosting", eventType: "Awards" },
        { id: "p-ps2", title: "FDCI Fashion Week MC", gradient: "from-fuchsia-700 to-pink-900", emoji: "👗", category: "Hosting", eventType: "Fashion" },
        { id: "p-ps3", title: "PM Event Host", gradient: "from-slate-700 to-gray-900", emoji: "🏛️", category: "Hosting", eventType: "Government" },
        { id: "p-ps4", title: "Brand Diwali Launch", gradient: "from-orange-700 to-amber-900", emoji: "🪔", category: "Hosting", eventType: "Corporate" },
      ],
    },

    // ─── TRANSPORT ────────────────────────────────────────────────────────────
    {
      id: "v14", name: "Regal Wheels Event Transport", category: "Transport & Logistics", categoryId: "wedding", subcategory: "Venue & Logistics",
      rating: 4.6, reviews: 98, location: "Delhi", cities: ["Delhi", "Noida", "Gurugram", "Jaipur"],
      price: "₹15K – ₹3L", priceMin: 15000, priceMax: 300000,
      initials: "RW", gradient: "from-zinc-600 to-gray-700",
      tags: ["Luxury Cars", "Baraat", "Guest Transport"],
      description: "Premium event transportation — vintage cars, vintage horses, luxury buses & decorated baraat vehicles. Fleet of 200+ vehicles across North India.",
      isVerified: true, yearsExperience: 9, eventsCompleted: 1563, responseTime: "< 3 hrs",
      specialties: ["Baraat Vehicles", "Vintage Cars", "Guest Shuttles", "Airport Transfers"],
      portfolio: [
        { id: "p53", title: "Royal Baraat Procession", gradient: "from-amber-700 to-orange-900", emoji: "🐎", category: "Transport", eventType: "Wedding" },
        { id: "p54", title: "Vintage Car Getaway", gradient: "from-zinc-700 to-gray-900", emoji: "🚗", category: "Transport", eventType: "Wedding" },
        { id: "p55", title: "Corporate Fleet Service", gradient: "from-blue-700 to-indigo-900", emoji: "🚌", category: "Transport", eventType: "Corporate" },
        { id: "p56", title: "Rath Chariot Setup", gradient: "from-yellow-700 to-amber-900", emoji: "🏆", category: "Transport", eventType: "Wedding" },
      ],
    },

    // ─── PHOTOGRAPHY ──────────────────────────────────────────────────────────
    {
      id: "v34", name: "Frame Theory Photography", category: "Photographer", categoryId: "corporate", subcategory: "Photography & Videography",
      rating: 4.8, reviews: 198, location: "Hyderabad", cities: ["Hyderabad", "Chennai", "Bangalore"],
      price: "₹40K – ₹2L", priceMin: 40000, priceMax: 200000,
      initials: "FT", gradient: "from-slate-600 to-gray-700",
      tags: ["Corporate", "Commercial", "Drone"],
      description: "Commercial photography & videography specialists for corporate events. 8K video production, drone shots, and same-day reels.",
      isVerified: true, yearsExperience: 8, eventsCompleted: 467, responseTime: "< 2 hrs",
      specialties: ["8K Production", "Corporate Headshots", "Drone Reels", "Social Media Cuts"],
      portfolio: [
        { id: "p-ft1", title: "TATA Steel Summit Film", gradient: "from-slate-700 to-gray-900", emoji: "📹", category: "Corporate", eventType: "Conference" },
        { id: "p-ft2", title: "Drone Product Launch", gradient: "from-sky-700 to-blue-900", emoji: "🚁", category: "Corporate", eventType: "Launch" },
        { id: "p-ft3", title: "CEO Portrait Shoot", gradient: "from-indigo-700 to-violet-900", emoji: "📸", category: "Corporate", eventType: "Branding" },
        { id: "p-ft4", title: "Live Event Social Reel", gradient: "from-rose-700 to-pink-900", emoji: "🎬", category: "Corporate", eventType: "Conference" },
      ],
    },
    {
      id: "v35", name: "Moments That Last", category: "Photographer", categoryId: "wedding", subcategory: "Photography & Video",
      rating: 4.9, reviews: 389, location: "Jaipur", cities: ["Jaipur", "Udaipur", "Jodhpur", "Delhi"],
      price: "₹80K – ₹4L", priceMin: 80000, priceMax: 400000,
      initials: "MT", gradient: "from-rose-600 to-amber-700",
      tags: ["Fine Art", "Destination", "Cinematic"],
      description: "India's most awarded destination wedding photographer. Fine art wedding photography in palaces, forts, and lakeside venues of Rajasthan.",
      isVerified: true, yearsExperience: 13, eventsCompleted: 512, responseTime: "< 2 hrs",
      specialties: ["Fine Art Photography", "Palace Weddings", "Film Look", "Album Design"],
      portfolio: [
        { id: "p-mtl1", title: "Jaisalmer Fort Wedding", gradient: "from-amber-700 to-yellow-900", emoji: "🏯", category: "Photography", eventType: "Destination Wedding" },
        { id: "p-mtl2", title: "Pichola Lake Vows", gradient: "from-cyan-700 to-blue-900", emoji: "🌊", category: "Photography", eventType: "Wedding" },
        { id: "p-mtl3", title: "Poppy Field Pre-Wedding", gradient: "from-red-700 to-rose-900", emoji: "🌺", category: "Photography", eventType: "Pre-Wedding" },
        { id: "p-mtl4", title: "Blue City Portraits", gradient: "from-blue-700 to-indigo-900", emoji: "📸", category: "Photography", eventType: "Jodhpur Wedding" },
      ],
    },

    // ─── RELIGIOUS / SPIRITUAL ────────────────────────────────────────────────
    {
      id: "v36", name: "Sacred Threads Pandit Services", category: "Hindu Pandit", categoryId: "religious", subcategory: "Hindu Events",
      rating: 4.9, reviews: 1234, location: "Varanasi", cities: ["Varanasi", "Delhi", "Mumbai", "Pan-India"],
      price: "₹5K – ₹50K", priceMin: 5000, priceMax: 50000,
      initials: "ST", gradient: "from-orange-600 to-amber-700",
      tags: ["Vedic Pandits", "Multilingual", "All Occasions"],
      description: "Network of 200+ qualified Vedic pandits available across India. Specializing in all Hindu ceremonies from Satyanarayan Puja to grand Vivah Samskars.",
      isVerified: true, yearsExperience: 20, eventsCompleted: 15000, responseTime: "< 1 hr",
      specialties: ["Vivah (Wedding)", "Griha Pravesh", "Satyanarayan", "Havan / Yagna"],
      portfolio: [
        { id: "p-stp1", title: "Vedic Wedding Ceremony", gradient: "from-orange-700 to-amber-900", emoji: "🛕", category: "Religious", eventType: "Wedding" },
        { id: "p-stp2", title: "Grand Griha Pravesh", gradient: "from-yellow-700 to-orange-900", emoji: "🏠", category: "Religious", eventType: "Housewarming" },
        { id: "p-stp3", title: "Satyanarayan Puja", gradient: "from-red-700 to-rose-900", emoji: "🪔", category: "Religious", eventType: "Puja" },
        { id: "p-stp4", title: "Yagna & Homam Setup", gradient: "from-amber-700 to-yellow-900", emoji: "🔥", category: "Religious", eventType: "Religious" },
      ],
    },
    {
      id: "v37", name: "Al-Noor Event Services", category: "Nikah Ceremony Organizer", categoryId: "religious", subcategory: "Muslim Events",
      rating: 4.8, reviews: 312, location: "Lucknow", cities: ["Lucknow", "Hyderabad", "Mumbai", "Delhi"],
      price: "₹30K – ₹3L", priceMin: 30000, priceMax: 300000,
      initials: "AN", gradient: "from-green-600 to-teal-700",
      tags: ["Nikah", "Walima", "Muslim Wedding"],
      description: "Full-service Islamic wedding event management. Nikah ceremonies, Walima receptions, and Aqiqah celebrations with authentic decoration and catering.",
      isVerified: true, yearsExperience: 12, eventsCompleted: 678, responseTime: "< 2 hrs",
      specialties: ["Nikah Ceremony", "Walima Setup", "Halal Catering", "Islamic Décor"],
      portfolio: [
        { id: "p-an1", title: "Grand Nikah Ceremony", gradient: "from-green-700 to-teal-900", emoji: "🌙", category: "Religious", eventType: "Nikah" },
        { id: "p-an2", title: "Lucknow Walima Feast", gradient: "from-emerald-700 to-green-900", emoji: "🍽️", category: "Religious", eventType: "Walima" },
        { id: "p-an3", title: "Eid Mela Decoration", gradient: "from-yellow-700 to-amber-900", emoji: "🌙", category: "Religious", eventType: "Festival" },
        { id: "p-an4", title: "Ramadan Iftar Setup", gradient: "from-indigo-700 to-blue-900", emoji: "🕌", category: "Religious", eventType: "Ramadan" },
      ],
    },
    {
      id: "v38", name: "Kirtan & Bhajan Group", category: "Shabad Kirtan Group", categoryId: "religious", subcategory: "Sikh Events",
      rating: 4.9, reviews: 567, location: "Amritsar", cities: ["Amritsar", "Ludhiana", "Delhi", "Mumbai"],
      price: "₹15K – ₹1.5L", priceMin: 15000, priceMax: 150000,
      initials: "KB", gradient: "from-yellow-600 to-orange-700",
      tags: ["Kirtan", "Bhajan", "Shabad"],
      description: "Professional kirtan and bhajan groups serving across all faiths. Ragi jathas, bhajan mandalis, and shabad kirtan for gurudwara events and home ceremonies.",
      isVerified: true, yearsExperience: 30, eventsCompleted: 8000, responseTime: "< 4 hrs",
      specialties: ["Shabad Kirtan", "Akhand Path", "Bhajan Mandali", "Gurpurab"],
      portfolio: [
        { id: "p-kb1", title: "Gurpurab Celebration", gradient: "from-yellow-700 to-orange-900", emoji: "🙏", category: "Religious", eventType: "Gurpurab" },
        { id: "p-kb2", title: "Akhand Path Setup", gradient: "from-amber-700 to-yellow-900", emoji: "📖", category: "Religious", eventType: "Religious" },
        { id: "p-kb3", title: "Wedding Anand Karaj", gradient: "from-orange-700 to-red-900", emoji: "💑", category: "Religious", eventType: "Wedding" },
        { id: "p-kb4", title: "Navratri Bhajan Night", gradient: "from-rose-700 to-pink-900", emoji: "🪔", category: "Religious", eventType: "Festival" },
      ],
    },

    // ─── SPORTS EVENTS ────────────────────────────────────────────────────────
    {
      id: "v39", name: "RunIndia Events", category: "Marathon Planner", categoryId: "sports", subcategory: "Marathons & Running Events",
      rating: 4.7, reviews: 134, location: "Mumbai", cities: ["Mumbai", "Delhi", "Hyderabad", "Bangalore"],
      price: "₹3L – ₹40L", priceMin: 300000, priceMax: 4000000,
      initials: "RI", gradient: "from-green-600 to-emerald-700",
      tags: ["Marathons", "5K/10K", "Walkathon"],
      description: "India's leading sports event management company. Organized 100+ marathons and running events including 30,000+ participant mega-runs in Mumbai.",
      isVerified: true, yearsExperience: 11, eventsCompleted: 234, responseTime: "< 4 hrs",
      specialties: ["Full Marathons", "City Runs", "Corporate Runs", "Charity Walkathons"],
      portfolio: [
        { id: "p-ri1", title: "Mumbai Half Marathon 2024", gradient: "from-green-700 to-emerald-900", emoji: "🏃", category: "Sports", eventType: "Marathon" },
        { id: "p-ri2", title: "Corporate 5K Run", gradient: "from-blue-700 to-indigo-900", emoji: "🏅", category: "Sports", eventType: "Corporate Run" },
        { id: "p-ri3", title: "Charity Walkathon Delhi", gradient: "from-pink-700 to-rose-900", emoji: "❤️", category: "Sports", eventType: "Charity" },
        { id: "p-ri4", title: "Neon Night Run Bangalore", gradient: "from-violet-700 to-purple-900", emoji: "💡", category: "Sports", eventType: "Night Run" },
      ],
    },
    {
      id: "v40", name: "PlaySports Tournaments", category: "Tournament Organizer", categoryId: "sports", subcategory: "Tournaments",
      rating: 4.6, reviews: 89, location: "Bangalore", cities: ["Bangalore", "Hyderabad", "Chennai", "Pune"],
      price: "₹50K – ₹10L", priceMin: 50000, priceMax: 1000000,
      initials: "PS", gradient: "from-blue-600 to-indigo-700",
      tags: ["Cricket", "Football", "Corporate League"],
      description: "Corporate and amateur sports tournament organizers. Full management including venue, referees, live scoring, trophies, and medical support.",
      isVerified: false, yearsExperience: 5, eventsCompleted: 123, responseTime: "< 6 hrs",
      specialties: ["Cricket Leagues", "Football Tournaments", "Badminton Competitions", "Esports"],
      portfolio: [
        { id: "p-pst1", title: "Corporate Cricket IPL", gradient: "from-blue-700 to-indigo-900", emoji: "🏏", category: "Sports", eventType: "Cricket" },
        { id: "p-pst2", title: "Futsal Football League", gradient: "from-green-700 to-teal-900", emoji: "⚽", category: "Sports", eventType: "Football" },
        { id: "p-pst3", title: "Badminton Championship", gradient: "from-yellow-700 to-amber-900", emoji: "🏸", category: "Sports", eventType: "Badminton" },
        { id: "p-pst4", title: "Esports LAN Party", gradient: "from-violet-700 to-purple-900", emoji: "🎮", category: "Sports", eventType: "Gaming" },
      ],
    },

    // ─── FASHION & LIFESTYLE ──────────────────────────────────────────────────
    {
      id: "v41", name: "Runway Productions India", category: "Fashion Show Organizer", categoryId: "fashion-lifestyle", subcategory: "Fashion Shows",
      rating: 4.8, reviews: 67, location: "Mumbai", cities: ["Mumbai", "Delhi", "Bangalore"],
      price: "₹5L – ₹50L", priceMin: 500000, priceMax: 5000000,
      initials: "RP", gradient: "from-fuchsia-600 to-pink-700",
      tags: ["Fashion Week", "Runway", "Designer Shows"],
      description: "India's premier fashion show production company. Working with top Indian and international designers to produce flawless runway events.",
      isVerified: true, yearsExperience: 14, eventsCompleted: 156, responseTime: "< 3 hrs",
      specialties: ["Designer Showcases", "Bridal Fashion Shows", "Runway Construction", "Model Coordination"],
      portfolio: [
        { id: "p-rpi1", title: "Lakme Fashion Week Show", gradient: "from-fuchsia-700 to-pink-900", emoji: "👗", category: "Fashion", eventType: "Fashion Week" },
        { id: "p-rpi2", title: "Manish Malhotra Showcase", gradient: "from-gold-700 to-amber-900", emoji: "✨", category: "Fashion", eventType: "Designer Show" },
        { id: "p-rpi3", title: "FDCI Couture Week", gradient: "from-violet-700 to-purple-900", emoji: "👑", category: "Fashion", eventType: "Fashion Week" },
        { id: "p-rpi4", title: "Bridal Fashion Show", gradient: "from-rose-700 to-pink-900", emoji: "💍", category: "Fashion", eventType: "Bridal Show" },
      ],
    },
    {
      id: "v42", name: "Beauty Pageant Masters", category: "Pageant Organizer", categoryId: "fashion-lifestyle", subcategory: "Beauty & Pageants",
      rating: 4.7, reviews: 45, location: "Bangalore", cities: ["Bangalore", "Chennai", "Hyderabad"],
      price: "₹2L – ₹15L", priceMin: 200000, priceMax: 1500000,
      initials: "BP", gradient: "from-rose-600 to-red-700",
      tags: ["Beauty Pageant", "Miss Contest", "Grooming"],
      description: "South India's leading beauty pageant management company. Organizing college beauty contests, state level pageants, and corporate beauty events.",
      isVerified: true, yearsExperience: 8, eventsCompleted: 78, responseTime: "< 4 hrs",
      specialties: ["College Beauty Contests", "State Pageants", "Grooming Workshops", "Personality Development"],
      portfolio: [
        { id: "p-bpm1", title: "Miss Karnataka 2024", gradient: "from-rose-700 to-pink-900", emoji: "👸", category: "Fashion", eventType: "Pageant" },
        { id: "p-bpm2", title: "VIT University Beauty", gradient: "from-violet-700 to-purple-900", emoji: "🌸", category: "Fashion", eventType: "College" },
        { id: "p-bpm3", title: "Corporate Mrs India", gradient: "from-amber-700 to-orange-900", emoji: "💃", category: "Fashion", eventType: "Corporate" },
        { id: "p-bpm4", title: "Junior Fashion Week", gradient: "from-pink-700 to-fuchsia-900", emoji: "👧", category: "Fashion", eventType: "Kids Fashion" },
      ],
    },

    // ─── TECHNOLOGY EVENTS ────────────────────────────────────────────────────
    {
      id: "v43", name: "TechVault Events", category: "Tech Event Organizer", categoryId: "technology", subcategory: "Tech Conferences & Summits",
      rating: 4.8, reviews: 89, location: "Bangalore", cities: ["Bangalore", "Delhi", "Hyderabad", "Pune"],
      price: "₹3L – ₹30L", priceMin: 300000, priceMax: 3000000,
      initials: "TV", gradient: "from-sky-600 to-blue-700",
      tags: ["Tech Conferences", "Hackathons", "Startup Events"],
      description: "Bangalore's premier tech event management company. From intimate startup meetups to 5000-person conferences. Powered by cutting-edge event technology.",
      isVerified: true, yearsExperience: 7, eventsCompleted: 234, responseTime: "< 2 hrs",
      specialties: ["Tech Conferences", "Hackathons", "Demo Days", "Startup Pitch Events"],
      portfolio: [
        { id: "p-tv1", title: "BangaloreTech Summit 2024", gradient: "from-sky-700 to-blue-900", emoji: "💻", category: "Technology", eventType: "Conference" },
        { id: "p-tv2", title: "72hr Hackathon India", gradient: "from-green-700 to-teal-900", emoji: "⌨️", category: "Technology", eventType: "Hackathon" },
        { id: "p-tv3", title: "AI/ML Summit 2023", gradient: "from-violet-700 to-purple-900", emoji: "🤖", category: "Technology", eventType: "Summit" },
        { id: "p-tv4", title: "Startup Demo Day", gradient: "from-amber-700 to-orange-900", emoji: "🚀", category: "Technology", eventType: "Demo Day" },
      ],
    },
    {
      id: "v44", name: "Nexgen Hackathon Co.", category: "Hackathon Organizer", categoryId: "technology", subcategory: "Hackathons & Competitions",
      rating: 4.6, reviews: 56, location: "Pune", cities: ["Pune", "Mumbai", "Bangalore"],
      price: "₹1L – ₹8L", priceMin: 100000, priceMax: 800000,
      initials: "NH", gradient: "from-violet-600 to-purple-700",
      tags: ["Hackathons", "Coding", "Innovation"],
      description: "End-to-end hackathon management from participant registration to prize distribution. Built 40+ hackathon platforms and managed 15,000+ participants.",
      isVerified: true, yearsExperience: 5, eventsCompleted: 67, responseTime: "< 4 hrs",
      specialties: ["Platform Setup", "Judging Systems", "Mentorship Programs", "Live Leaderboards"],
      portfolio: [
        { id: "p-nhc1", title: "HackCITIZEN 2024", gradient: "from-violet-700 to-purple-900", emoji: "💡", category: "Technology", eventType: "Hackathon" },
        { id: "p-nhc2", title: "National AI Hackathon", gradient: "from-blue-700 to-indigo-900", emoji: "🤖", category: "Technology", eventType: "Hackathon" },
        { id: "p-nhc3", title: "BlockChain Spring Sprint", gradient: "from-teal-700 to-cyan-900", emoji: "⛓️", category: "Technology", eventType: "Hackathon" },
        { id: "p-nhc4", title: "College Code Rush", gradient: "from-green-700 to-emerald-900", emoji: "🎓", category: "Technology", eventType: "College" },
      ],
    },

    // ─── CHARITY / NGO ────────────────────────────────────────────────────────
    {
      id: "v45", name: "GiveCause Event Planners", category: "NGO Fundraiser Organizer", categoryId: "charity", subcategory: "Fundraising Events",
      rating: 4.8, reviews: 67, location: "Delhi", cities: ["Delhi", "Mumbai", "Bangalore", "Hyderabad"],
      price: "₹50K – ₹5L", priceMin: 50000, priceMax: 500000,
      initials: "GC", gradient: "from-red-600 to-rose-700",
      tags: ["Fundraiser", "Charity Gala", "NGO"],
      description: "India's most trusted NGO event management company. Helping social organizations raise ₹50 Cr+ through galas, auctions, and awareness campaigns.",
      isVerified: true, yearsExperience: 9, eventsCompleted: 167, responseTime: "< 3 hrs",
      specialties: ["Gala Dinners", "Charity Auctions", "Awareness Campaigns", "Volunteer Coordination"],
      portfolio: [
        { id: "p-gc1", title: "Cry for Cry Gala 2024", gradient: "from-red-700 to-rose-900", emoji: "❤️", category: "Charity", eventType: "Fundraiser" },
        { id: "p-gc2", title: "Cancer Awareness Walk", gradient: "from-orange-700 to-red-900", emoji: "🎗️", category: "Charity", eventType: "Awareness" },
        { id: "p-gc3", title: "Art for Cause Auction", gradient: "from-violet-700 to-purple-900", emoji: "🎨", category: "Charity", eventType: "Auction" },
        { id: "p-gc4", title: "Food Drive Walkathon", gradient: "from-green-700 to-teal-900", emoji: "🥗", category: "Charity", eventType: "Community" },
      ],
    },

    // ─── FESTIVALS ────────────────────────────────────────────────────────────
    {
      id: "v46", name: "Sankalp Cultural Events", category: "Festival Organizer", categoryId: "festivals", subcategory: "Hindu Festivals",
      rating: 4.8, reviews: 234, location: "Ahmedabad", cities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
      price: "₹2L – ₹25L", priceMin: 200000, priceMax: 2500000,
      initials: "SK", gradient: "from-orange-600 to-red-700",
      tags: ["Navratri", "Diwali Mela", "Garba"],
      description: "Gujarat's leading cultural event management company. Organizers of the 15,000-person Navratri at GMDC Grounds with 15 nights of traditional Garba.",
      isVerified: true, yearsExperience: 18, eventsCompleted: 267, responseTime: "< 3 hrs",
      specialties: ["Navratri Garba", "Diwali Mela", "Cultural Festivals", "Dandiya Night"],
      portfolio: [
        { id: "p-sk1", title: "GMDC Navratri 2024", gradient: "from-orange-700 to-red-900", emoji: "🎵", category: "Festival", eventType: "Navratri" },
        { id: "p-sk2", title: "Diwali Mela Ahmedabad", gradient: "from-amber-700 to-orange-900", emoji: "🪔", category: "Festival", eventType: "Diwali" },
        { id: "p-sk3", title: "International Kite Festival", gradient: "from-sky-700 to-blue-900", emoji: "🪁", category: "Festival", eventType: "Cultural" },
        { id: "p-sk4", title: "Holi Rang Mahotsav", gradient: "from-pink-700 to-fuchsia-900", emoji: "🎨", category: "Festival", eventType: "Holi" },
      ],
    },
    {
      id: "v47", name: "Pandal Art Builders", category: "Pandal Artist", categoryId: "festivals", subcategory: "Pandal & Structure",
      rating: 4.7, reviews: 156, location: "Kolkata", cities: ["Kolkata", "Patna", "Bhubaneswar", "Guwahati"],
      price: "₹3L – ₹30L", priceMin: 300000, priceMax: 3000000,
      initials: "PA", gradient: "from-yellow-600 to-amber-700",
      tags: ["Durga Puja", "Pandal", "Traditional"],
      description: "Kolkata's finest pandal builders and Durga/Ganesh idol makers. Award-winning pandal architecture for Durga Puja, Ganesh Chaturthi, and Saraswati Puja.",
      isVerified: true, yearsExperience: 22, eventsCompleted: 312, responseTime: "< 12 hrs",
      specialties: ["Durga Puja Pandal", "Ganesh Chaturthi Pandal", "Idol Making", "LED Decoration"],
      portfolio: [
        { id: "p-pab1", title: "Award Pandal Durga Puja", gradient: "from-yellow-700 to-amber-900", emoji: "🙏", category: "Festival", eventType: "Durga Puja" },
        { id: "p-pab2", title: "Heritage Theme Pandal", gradient: "from-orange-700 to-red-900", emoji: "🏛️", category: "Festival", eventType: "Festival" },
        { id: "p-pab3", title: "Eco-Ganesh Mandap", gradient: "from-green-700 to-teal-900", emoji: "🌿", category: "Festival", eventType: "Ganesh Chaturthi" },
        { id: "p-pab4", title: "Saraswati Puja Décor", gradient: "from-yellow-700 to-orange-900", emoji: "📚", category: "Festival", eventType: "Saraswati Puja" },
      ],
    },

    // ─── VIRTUAL / HYBRID ─────────────────────────────────────────────────────
    {
      id: "v48", name: "HybridX Productions", category: "Hybrid Event Producer", categoryId: "virtual", subcategory: "Hybrid Events",
      rating: 4.7, reviews: 78, location: "Bangalore", cities: ["Bangalore", "Mumbai", "Delhi", "Pan-India"],
      price: "₹1.5L – ₹20L", priceMin: 150000, priceMax: 2000000,
      initials: "HX", gradient: "from-teal-600 to-cyan-700",
      tags: ["Virtual Events", "Hybrid", "Live Streaming"],
      description: "End-to-end virtual and hybrid event management. 8K live streaming, interactive virtual environments, and seamless physical-digital integration.",
      isVerified: true, yearsExperience: 6, eventsCompleted: 189, responseTime: "< 2 hrs",
      specialties: ["Live Streaming", "Virtual Conferences", "Hybrid Events", "Interactive Platforms"],
      portfolio: [
        { id: "p-hx1", title: "10,000 Attendee Virtual Con", gradient: "from-teal-700 to-cyan-900", emoji: "💻", category: "Virtual", eventType: "Conference" },
        { id: "p-hx2", title: "Hybrid Product Launch", gradient: "from-blue-700 to-indigo-900", emoji: "🚀", category: "Virtual", eventType: "Launch" },
        { id: "p-hx3", title: "Global Webinar Series", gradient: "from-violet-700 to-purple-900", emoji: "🌍", category: "Virtual", eventType: "Webinar" },
        { id: "p-hx4", title: "Metaverse Expo India", gradient: "from-fuchsia-700 to-pink-900", emoji: "🥽", category: "Virtual", eventType: "Metaverse" },
      ],
    },

    // ─── HOSPITALITY ──────────────────────────────────────────────────────────
    {
      id: "v49", name: "Gourmet Affairs India", category: "Celebrity Chef Booking", categoryId: "hospitality", subcategory: "F&B Services",
      rating: 4.9, reviews: 112, location: "Mumbai", cities: ["Mumbai", "Delhi", "Bangalore", "Goa"],
      price: "₹1L – ₹10L", priceMin: 100000, priceMax: 1000000,
      initials: "GA", gradient: "from-amber-600 to-red-700",
      tags: ["Celebrity Chef", "Pop-up Dining", "Live Cooking"],
      description: "Curating India's finest celebrity chef experiences for private events, corporate dinners, and brand activations. Network of 50+ celebrity and Michelin-trained chefs.",
      isVerified: true, yearsExperience: 8, eventsCompleted: 234, responseTime: "< 2 hrs",
      specialties: ["Celebrity Chef Dinner", "Live Cooking Stations", "Masterclass", "Brand Collaborations"],
      portfolio: [
        { id: "p-gai1", title: "Ranveer Brar Private Dinner", gradient: "from-amber-700 to-red-900", emoji: "👨‍🍳", category: "Hospitality", eventType: "Private Dining" },
        { id: "p-gai2", title: "Sushi Masterclass", gradient: "from-red-700 to-rose-900", emoji: "🍣", category: "Hospitality", eventType: "Masterclass" },
        { id: "p-gai3", title: "Tasting Menu Corporate", gradient: "from-slate-700 to-gray-900", emoji: "🍽️", category: "Hospitality", eventType: "Corporate" },
        { id: "p-gai4", title: "Food Festival Curation", gradient: "from-orange-700 to-amber-900", emoji: "🎪", category: "Hospitality", eventType: "Festival" },
      ],
    },
    {
      id: "v50", name: "Bar Masters India", category: "Bartending Services", categoryId: "hospitality", subcategory: "F&B Services",
      rating: 4.8, reviews: 189, location: "Goa", cities: ["Goa", "Mumbai", "Bangalore", "Delhi"],
      price: "₹15K – ₹1.5L", priceMin: 15000, priceMax: 150000,
      initials: "BM", gradient: "from-amber-600 to-yellow-700",
      tags: ["Flair Bartending", "Craft Cocktails", "Open Bar"],
      description: "Professional flair bartenders and mixologists for events of all sizes. Custom cocktail menus, bar setups, and signature drink experiences.",
      isVerified: true, yearsExperience: 9, eventsCompleted: 678, responseTime: "< 2 hrs",
      specialties: ["Flair Bartending", "Cocktail Masterclass", "Mocktail Bar", "Open Bar Management"],
      portfolio: [
        { id: "p-bmi1", title: "Wedding Cocktail Bar", gradient: "from-amber-700 to-yellow-900", emoji: "🍹", category: "Hospitality", eventType: "Wedding" },
        { id: "p-bmi2", title: "Corporate Mocktail Setup", gradient: "from-teal-700 to-cyan-900", emoji: "🥤", category: "Hospitality", eventType: "Corporate" },
        { id: "p-bmi3", title: "Flair Show Goa Beach", gradient: "from-orange-700 to-red-900", emoji: "🔥", category: "Hospitality", eventType: "Party" },
        { id: "p-bmi4", title: "NYE Open Bar Setup", gradient: "from-violet-700 to-purple-900", emoji: "🎆", category: "Hospitality", eventType: "NYE Party" },
      ],
    },

    // ─── FILM & MEDIA ─────────────────────────────────────────────────────────
    {
      id: "v51", name: "Silver Screen Events", category: "Film Premiere Organizer", categoryId: "film-media", subcategory: "Film Premieres & Screenings",
      rating: 4.8, reviews: 78, location: "Mumbai", cities: ["Mumbai", "Delhi", "Bangalore"],
      price: "₹5L – ₹40L", priceMin: 500000, priceMax: 4000000,
      initials: "SS", gradient: "from-rose-600 to-red-700",
      tags: ["Film Premiere", "Red Carpet", "Celebrity"],
      description: "Mumbai's premier film premiere and media event management company. Red carpet production, VIP management, and live media broadcasting for major releases.",
      isVerified: true, yearsExperience: 12, eventsCompleted: 167, responseTime: "< 2 hrs",
      specialties: ["Film Premieres", "Red Carpet Setup", "Celebrity Management", "Press Junkets"],
      portfolio: [
        { id: "p-sse1", title: "Bollywood A-List Premiere", gradient: "from-rose-700 to-red-900", emoji: "🎬", category: "Film", eventType: "Film Premiere" },
        { id: "p-sse2", title: "Netflix Series Launch", gradient: "from-red-700 to-rose-900", emoji: "📺", category: "Film", eventType: "OTT Launch" },
        { id: "p-sse3", title: "MAMI Film Festival", gradient: "from-amber-700 to-orange-900", emoji: "🎞️", category: "Film", eventType: "Film Festival" },
        { id: "p-sse4", title: "Music Album Drop Event", gradient: "from-violet-700 to-purple-900", emoji: "🎵", category: "Film", eventType: "Music Launch" },
      ],
    },

    // ─── HEALTH & WELLNESS ────────────────────────────────────────────────────
    {
      id: "v52", name: "Pranic Life Events", category: "Yoga Retreat Organizer", categoryId: "health-wellness", subcategory: "Yoga & Meditation",
      rating: 4.9, reviews: 134, location: "Rishikesh", cities: ["Rishikesh", "Goa", "Coorg", "Manali"],
      price: "₹30K – ₹3L", priceMin: 30000, priceMax: 300000,
      initials: "PL", gradient: "from-teal-600 to-green-700",
      tags: ["Yoga Retreat", "Meditation", "Wellness"],
      description: "India's leading yoga and meditation retreat organizers. Partnered with 100+ certified yoga masters for corporate, group, and destination wellness retreats.",
      isVerified: true, yearsExperience: 10, eventsCompleted: 312, responseTime: "< 3 hrs",
      specialties: ["Corporate Wellness", "Yoga Retreats", "Silent Meditation", "Ayurveda Camps"],
      portfolio: [
        { id: "p-ple1", title: "Himalayas Yoga Retreat", gradient: "from-teal-700 to-cyan-900", emoji: "🏔️", category: "Wellness", eventType: "Retreat" },
        { id: "p-ple2", title: "Corporate Mindfulness Day", gradient: "from-green-700 to-emerald-900", emoji: "🧘", category: "Wellness", eventType: "Corporate" },
        { id: "p-ple3", title: "Goa Sunrise Yoga Camp", gradient: "from-amber-700 to-orange-900", emoji: "🌅", category: "Wellness", eventType: "Yoga Camp" },
        { id: "p-ple4", title: "Silent Vipassana Retreat", gradient: "from-indigo-700 to-blue-900", emoji: "🕯️", category: "Wellness", eventType: "Meditation" },
      ],
    },

    // ─── DÉCOR ────────────────────────────────────────────────────────────────
    {
      id: "v53", name: "The Decor Studio", category: "Event Decorator", categoryId: "social-party", subcategory: "Party Essentials",
      rating: 4.7, reviews: 312, location: "Bangalore", cities: ["Bangalore", "Chennai", "Hyderabad"],
      price: "₹40K – ₹3L", priceMin: 40000, priceMax: 300000,
      initials: "DS", gradient: "from-violet-600 to-purple-700",
      tags: ["Aesthetic Décor", "Balloon Art", "Photo Walls"],
      description: "Bangalore's trendiest event decoration studio. Known for Instagram-worthy setups, intricate balloon art, and cinematic photo wall installations.",
      isVerified: true, yearsExperience: 6, eventsCompleted: 567, responseTime: "< 3 hrs",
      specialties: ["Balloon Installations", "Photo Walls", "Neon Signs", "Floral Backdrops"],
      portfolio: [
        { id: "p-tds1", title: "Pink Ombre Balloon Wall", gradient: "from-pink-700 to-rose-900", emoji: "🎈", category: "Décor", eventType: "Birthday" },
        { id: "p-tds2", title: "Neon Sign Wedding", gradient: "from-violet-700 to-purple-900", emoji: "💡", category: "Décor", eventType: "Wedding" },
        { id: "p-tds3", title: "Engagement Photo Wall", gradient: "from-rose-700 to-pink-900", emoji: "💍", category: "Décor", eventType: "Engagement" },
        { id: "p-tds4", title: "Corporate Brand Setup", gradient: "from-blue-700 to-indigo-900", emoji: "🏢", category: "Décor", eventType: "Corporate" },
      ],
    },
    {
      id: "v54", name: "Raj Mandap Décor", category: "Mandap Decorator", categoryId: "wedding", subcategory: "Décor & Florals",
      rating: 4.8, reviews: 278, location: "Ahmedabad", cities: ["Ahmedabad", "Surat", "Rajkot", "Jaipur"],
      price: "₹1L – ₹8L", priceMin: 100000, priceMax: 800000,
      initials: "RD", gradient: "from-amber-600 to-red-700",
      tags: ["Mandap", "Traditional", "Hindu Wedding"],
      description: "Gujarat's most celebrated mandap decoration company. Traditional Gujarati and Rajasthani mandap designs with handcrafted woodwork, silks, and gold accents.",
      isVerified: true, yearsExperience: 16, eventsCompleted: 892, responseTime: "< 4 hrs",
      specialties: ["Traditional Mandap", "South Indian Mandap", "Phoolon ki Chaadar", "Stage Décor"],
      portfolio: [
        { id: "p-rmd1", title: "Royal Gold Mandap", gradient: "from-amber-700 to-yellow-900", emoji: "👑", category: "Décor", eventType: "Wedding" },
        { id: "p-rmd2", title: "Phoolon ki Chaadar Walk", gradient: "from-pink-700 to-rose-900", emoji: "🌸", category: "Décor", eventType: "Wedding" },
        { id: "p-rmd3", title: "South Indian Nadanmadam", gradient: "from-green-700 to-teal-900", emoji: "🌿", category: "Décor", eventType: "Wedding" },
        { id: "p-rmd4", title: "Maharashtrian Sakharpuda", gradient: "from-orange-700 to-amber-900", emoji: "🍯", category: "Décor", eventType: "Engagement" },
      ],
    },
    {
      id: "v55", name: "Stars & Drapes", category: "Tent & Draping Specialist", categoryId: "wedding", subcategory: "Décor & Florals",
      rating: 4.7, reviews: 198, location: "Delhi", cities: ["Delhi", "Noida", "Gurugram", "Agra"],
      price: "₹50K – ₹4L", priceMin: 50000, priceMax: 400000,
      initials: "SD", gradient: "from-indigo-600 to-violet-700",
      tags: ["Draping", "Tent Canopy", "Fabric Art"],
      description: "Premium tent and draping solutions for outdoor events. Known for starlit ceiling canopies, luxury draping, and custom tent structures.",
      isVerified: false, yearsExperience: 8, eventsCompleted: 423, responseTime: "< 3 hrs",
      specialties: ["Starlit Ceilings", "Fabric Draping", "Tent Structures", "Canopy Setups"],
      portfolio: [
        { id: "p-snd1", title: "Starlit Garden Reception", gradient: "from-indigo-700 to-blue-900", emoji: "⭐", category: "Décor", eventType: "Wedding" },
        { id: "p-snd2", title: "Velvet Draping Mandap", gradient: "from-violet-700 to-purple-900", emoji: "🪭", category: "Décor", eventType: "Wedding" },
        { id: "p-snd3", title: "Royal Tent Structure", gradient: "from-amber-700 to-orange-900", emoji: "⛺", category: "Décor", eventType: "Outdoor" },
        { id: "p-snd4", title: "Corporate Canopy Event", gradient: "from-blue-700 to-indigo-900", emoji: "🏢", category: "Décor", eventType: "Corporate" },
      ],
    },

    // ─── MORE WEDDING ─────────────────────────────────────────────────────────
    {
      id: "v56", name: "Vidaai Film Productions", category: "Videographer", categoryId: "wedding", subcategory: "Photography & Video",
      rating: 4.8, reviews: 312, location: "Mumbai", cities: ["Mumbai", "Delhi", "Bangalore", "Goa"],
      price: "₹80K – ₹5L", priceMin: 80000, priceMax: 500000,
      initials: "VF", gradient: "from-slate-600 to-gray-700",
      tags: ["Cinematic", "Documentary", "Drone"],
      description: "Cinematic wedding film makers crafting 15–30 min wedding films that feel like real Bollywood productions. 8K cameras, 4 drone units, same-day edits.",
      isVerified: true, yearsExperience: 10, eventsCompleted: 456, responseTime: "< 2 hrs",
      specialties: ["Wedding Films", "Same-Day Edits", "Drone Cinematography", "Highlight Reels"],
      portfolio: [
        { id: "p-vfp1", title: "Bollywood-Style Wedding Film", gradient: "from-slate-700 to-gray-900", emoji: "🎬", category: "Video", eventType: "Wedding" },
        { id: "p-vfp2", title: "Cinematic Pre-Wedding", gradient: "from-teal-700 to-cyan-900", emoji: "🎥", category: "Video", eventType: "Pre-Wedding" },
        { id: "p-vfp3", title: "Same-Day Edit Reel", gradient: "from-amber-700 to-orange-900", emoji: "⚡", category: "Video", eventType: "Wedding" },
        { id: "p-vfp4", title: "4K Drone Coverage", gradient: "from-sky-700 to-blue-900", emoji: "🚁", category: "Video", eventType: "Destination Wedding" },
      ],
    },
    {
      id: "v57", name: "Shaadi Invitation House", category: "Invitation Designer", categoryId: "wedding", subcategory: "Printing & Stationery",
      rating: 4.7, reviews: 534, location: "Surat", cities: ["Surat", "Ahmedabad", "Mumbai", "Delhi"],
      price: "₹50 – ₹500/card", priceMin: 50, priceMax: 500,
      initials: "SI", gradient: "from-rose-600 to-pink-700",
      tags: ["Luxury Invites", "Digital Cards", "Box Invites"],
      description: "India's largest wedding invitation manufacturer. Traditional printed cards, luxury box invitations, and custom digital invitations for every style and budget.",
      isVerified: true, yearsExperience: 15, eventsCompleted: 12000, responseTime: "< 2 hrs",
      specialties: ["Luxury Box Invites", "Digital Cards", "Foil Print", "Custom Packaging"],
      portfolio: [
        { id: "p-sih1", title: "Gold Foil Box Invite", gradient: "from-amber-700 to-yellow-900", emoji: "💌", category: "Stationery", eventType: "Wedding" },
        { id: "p-sih2", title: "Digital Wedding Card", gradient: "from-rose-700 to-pink-900", emoji: "📱", category: "Stationery", eventType: "Wedding" },
        { id: "p-sih3", title: "Wooden Scroll Invite", gradient: "from-amber-700 to-brown-900", emoji: "📜", category: "Stationery", eventType: "Wedding" },
        { id: "p-sih4", title: "Rajasthani Theme Card", gradient: "from-orange-700 to-red-900", emoji: "🎨", category: "Stationery", eventType: "Wedding" },
      ],
    },
    {
      id: "v58", name: "Noor Trousseau", category: "Trousseau Packing", categoryId: "wedding", subcategory: "Bridal",
      rating: 4.6, reviews: 389, location: "Delhi", cities: ["Delhi", "Lucknow", "Jaipur", "Mumbai"],
      price: "₹20K – ₹2L", priceMin: 20000, priceMax: 200000,
      initials: "NT", gradient: "from-rose-600 to-fuchsia-700",
      tags: ["Trousseau", "Gifting", "Hampers"],
      description: "Delhi's most popular bridal trousseau and gifting service. Custom hampers, trousseau packing, and guest gifting solutions for weddings.",
      isVerified: false, yearsExperience: 7, eventsCompleted: 678, responseTime: "< 4 hrs",
      specialties: ["Bridal Trousseau", "Wedding Hampers", "Baraat Gifts", "Guest Favors"],
      portfolio: [
        { id: "p-ntr1", title: "Luxury Bridal Trousseau", gradient: "from-rose-700 to-fuchsia-900", emoji: "🧧", category: "Gifting", eventType: "Wedding" },
        { id: "p-ntr2", title: "Corporate Diwali Hamper", gradient: "from-amber-700 to-orange-900", emoji: "🎁", category: "Gifting", eventType: "Corporate" },
        { id: "p-ntr3", title: "Return Gift Pack", gradient: "from-pink-700 to-rose-900", emoji: "💝", category: "Gifting", eventType: "Wedding" },
        { id: "p-ntr4", title: "Bride Entry Hamper", gradient: "from-violet-700 to-purple-900", emoji: "💍", category: "Gifting", eventType: "Wedding" },
      ],
    },
    {
      id: "v59", name: "Event Sutra Delhi", category: "Wedding Planner", categoryId: "wedding", subcategory: "Full Planning",
      rating: 4.7, reviews: 189, location: "Delhi", cities: ["Delhi", "Noida", "Chandigarh", "Jaipur"],
      price: "₹2L – ₹15L", priceMin: 200000, priceMax: 1500000,
      initials: "ES", gradient: "from-orange-600 to-amber-700",
      tags: ["North Indian", "Punjabi Wedding", "Intimate"],
      description: "Delhi NCR's trusted wedding planning firm for Punjabi, Sindhi, and Hindu weddings. Budget-conscious luxury planning that doesn't compromise on grandeur.",
      isVerified: true, yearsExperience: 8, eventsCompleted: 267, responseTime: "< 2 hrs",
      specialties: ["Punjabi Weddings", "Sindhi Ceremonies", "Budget Luxury", "Intimate Weddings"],
      portfolio: [
        { id: "p-esd1", title: "Grand Punjabi Wedding", gradient: "from-orange-700 to-amber-900", emoji: "💑", category: "Wedding", eventType: "Wedding" },
        { id: "p-esd2", title: "Intimate Garden Wedding", gradient: "from-green-700 to-teal-900", emoji: "🌿", category: "Wedding", eventType: "Intimate" },
        { id: "p-esd3", title: "Chandigarh Farmhouse", gradient: "from-amber-700 to-yellow-900", emoji: "🏡", category: "Wedding", eventType: "Wedding" },
        { id: "p-esd4", title: "Pink City Destination", gradient: "from-rose-700 to-pink-900", emoji: "🏯", category: "Wedding", eventType: "Destination" },
      ],
    },
    {
      id: "v60", name: "Floral Fantasy Studio", category: "Floral Designer", categoryId: "social-party", subcategory: "Party Essentials",
      rating: 4.7, reviews: 234, location: "Bangalore", cities: ["Bangalore", "Mysore", "Ooty"],
      price: "₹15K – ₹2L", priceMin: 15000, priceMax: 200000,
      initials: "FF", gradient: "from-pink-600 to-rose-700",
      tags: ["Fresh Florals", "Floral Walls", "Centrepieces"],
      description: "Bangalore's premier floral studio known for lush floral walls, centrepieces, and sustainable floristry using locally sourced blooms.",
      isVerified: false, yearsExperience: 5, eventsCompleted: 389, responseTime: "< 3 hrs",
      specialties: ["Floral Walls", "Table Centrepieces", "Floral Hoops", "Sustainable Floristry"],
      portfolio: [
        { id: "p-ffs1", title: "Lush Floral Wall", gradient: "from-pink-700 to-rose-900", emoji: "🌸", category: "Décor", eventType: "Wedding" },
        { id: "p-ffs2", title: "Hoop Ceremony Setup", gradient: "from-rose-700 to-pink-900", emoji: "🌺", category: "Décor", eventType: "Wedding" },
        { id: "p-ffs3", title: "Birthday Floral Arch", gradient: "from-fuchsia-700 to-pink-900", emoji: "🎂", category: "Décor", eventType: "Birthday" },
        { id: "p-ffs4", title: "Pastel Table Settings", gradient: "from-yellow-700 to-amber-900", emoji: "🌼", category: "Décor", eventType: "Corporate" },
      ],
    },
  ];

  export const getFeaturedVendors = () => vendors.slice(0, 6);
  export const getVendorsByCategory = (categoryId: string) => vendors.filter(v => v.categoryId === categoryId);
  export const getTopRatedVendors = () => [...vendors].sort((a, b) => b.rating - a.rating).slice(0, 8);
  export const getVendorsByCity = (city: string) => vendors.filter(v => v.cities.includes(city));
  export const searchVendors = (query: string) => {
    const q = query.toLowerCase();
    return vendors.filter(v =>
      v.name.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q) ||
      v.tags.some(t => t.toLowerCase().includes(q)) ||
      v.specialties.some(s => s.toLowerCase().includes(q)) ||
      v.location.toLowerCase().includes(q)
    );
  };

  const PHOTO_TEMPLATES: Array<Omit<PortfolioItem, "id">> = [
    { title: "Golden Hour Portrait",    gradient: "from-amber-700 to-orange-900",  emoji: "🌅", category: "Photography", eventType: "Pre-Wedding",      type: "photo",  likes: 1240, views: 8700 },
    { title: "Candid Reception Moment", gradient: "from-rose-700 to-pink-900",     emoji: "💃", category: "Photography", eventType: "Wedding",           type: "photo",  likes: 980,  views: 6400 },
    { title: "Bridal Portrait Series",  gradient: "from-violet-700 to-purple-900", emoji: "👰", category: "Photography", eventType: "Bridal",            type: "photo",  likes: 1580, views: 11200 },
    { title: "Group Family Frame",       gradient: "from-emerald-700 to-green-900", emoji: "👨‍👩‍👧‍👦", category: "Photography", eventType: "Family",          type: "photo",  likes: 670,  views: 4300 },
    { title: "Detail & Décor Shot",      gradient: "from-gold-700 to-amber-900",   emoji: "🌸", category: "Photography", eventType: "Decor",             type: "photo",  likes: 890,  views: 5800 },
    { title: "Night Sky Stars Shoot",    gradient: "from-indigo-700 to-blue-900",  emoji: "🌙", category: "Photography", eventType: "Fine Art",          type: "photo",  likes: 2100, views: 14800 },
    { title: "Mehendi Close-Up",         gradient: "from-yellow-700 to-amber-900", emoji: "🪔", category: "Photography", eventType: "Mehendi",           type: "photo",  likes: 760,  views: 5100 },
    { title: "Venue Wide-Angle",         gradient: "from-cyan-700 to-teal-900",    emoji: "🏛️", category: "Photography", eventType: "Venue",             type: "photo",  likes: 540,  views: 3600 },
  ];

  const VIDEO_TEMPLATES: Array<Omit<PortfolioItem, "id">> = [
    { title: "Highlight Film 5 Min",     gradient: "from-red-800 to-rose-900",     emoji: "🎬", category: "Videography", eventType: "Wedding",           type: "video",  likes: 3200, views: 28400, duration: "5:00" },
    { title: "Ceremony Cinematic",       gradient: "from-amber-800 to-orange-900", emoji: "🎥", category: "Videography", eventType: "Ceremony",          type: "video",  likes: 2100, views: 18700, duration: "8:30" },
    { title: "Day-in-the-Life Vlog",     gradient: "from-blue-800 to-indigo-900",  emoji: "📹", category: "Videography", eventType: "Corporate",         type: "video",  likes: 890,  views: 7200,  duration: "3:45" },
    { title: "Drone Aerial Showcase",    gradient: "from-sky-800 to-cyan-900",     emoji: "🚁", category: "Videography", eventType: "Destination",       type: "video",  likes: 4500, views: 38000, duration: "2:15" },
    { title: "Same-Day Edit Film",       gradient: "from-rose-800 to-pink-900",    emoji: "⚡", category: "Videography", eventType: "Wedding",           type: "video",  likes: 1780, views: 15400, duration: "6:00" },
    { title: "Guest Messages Reel",      gradient: "from-green-800 to-emerald-900",emoji: "💌", category: "Videography", eventType: "Celebration",       type: "video",  likes: 920,  views: 7800,  duration: "4:20" },
  ];

  const STORY_TEMPLATES: Array<Omit<PortfolioItem, "id">> = [
    { title: "Getting Ready Story",      gradient: "from-pink-800 to-fuchsia-900", emoji: "🪞", category: "Stories",     eventType: "Bridal",            type: "story",  likes: 780,  views: 5400 },
    { title: "Baraat Energy Story",      gradient: "from-orange-800 to-red-900",   emoji: "🥁", category: "Stories",     eventType: "Wedding",           type: "story",  likes: 1200, views: 8900 },
    { title: "Reception Highlights",     gradient: "from-violet-800 to-purple-900",emoji: "✨", category: "Stories",     eventType: "Reception",         type: "story",  likes: 650,  views: 4700 },
    { title: "Behind-the-Scenes Story",  gradient: "from-slate-700 to-gray-900",   emoji: "🎭", category: "Stories",     eventType: "Production",        type: "story",  likes: 430,  views: 3100 },
    { title: "Decoration Reveal",        gradient: "from-teal-800 to-cyan-900",    emoji: "🌺", category: "Stories",     eventType: "Decor",             type: "story",  likes: 870,  views: 6200 },
  ];

  const REEL_TEMPLATES: Array<Omit<PortfolioItem, "id">> = [
    { title: "60-sec Wedding Reel",      gradient: "from-rose-900 to-pink-950",    emoji: "❤️", category: "Reels",       eventType: "Wedding",           type: "reel",   likes: 8700, views: 91000, duration: "0:60" },
    { title: "Transition Magic Reel",    gradient: "from-purple-900 to-fuchsia-950",emoji: "🌀", category: "Reels",      eventType: "Fashion",           type: "reel",   likes: 12400, views: 134000, duration: "0:30" },
    { title: "Corporate Brand Reel",     gradient: "from-blue-900 to-indigo-950",  emoji: "🏢", category: "Reels",       eventType: "Corporate",         type: "reel",   likes: 3200, views: 28000, duration: "0:45" },
    { title: "Festival Vibes Reel",      gradient: "from-amber-900 to-orange-950", emoji: "🎊", category: "Reels",       eventType: "Festival",          type: "reel",   likes: 19800, views: 212000, duration: "0:30" },
    { title: "Drone + Edit Reel",        gradient: "from-sky-900 to-cyan-950",     emoji: "🚁", category: "Reels",       eventType: "Aerial",            type: "reel",   likes: 5600, views: 62000, duration: "0:45" },
  ];

  export const generateVendorPortfolio = (vendorId: string, count = 24): PortfolioItem[] => {
    const all = [
      ...PHOTO_TEMPLATES.map((t, i) => ({ ...t, id: `${vendorId}-ph${i}` })),
      ...VIDEO_TEMPLATES.map((t, i) => ({ ...t, id: `${vendorId}-vi${i}` })),
      ...STORY_TEMPLATES.map((t, i) => ({ ...t, id: `${vendorId}-st${i}` })),
      ...REEL_TEMPLATES.map((t, i) => ({ ...t, id: `${vendorId}-rl${i}` })),
    ];
    const result: PortfolioItem[] = [];
    for (let i = 0; i < count; i++) result.push(all[i % all.length]);
    return result;
  };

  export const getFullPortfolio = (vendor: Vendor, extended = false): PortfolioItem[] => {
    const base = vendor.portfolio;
    if (!extended) return base;
    const extra = generateVendorPortfolio(vendor.id, 28);
    return [...base, ...extra.filter(e => !base.find(b => b.id === e.id))];
  };
