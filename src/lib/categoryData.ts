export interface SubCategory {
  name: string;
  services: string[];
}

export interface EventCategory {
  id: string;
  name: string;
  icon: string;
  gradient: string;
  subCategories: SubCategory[];
}

export const eventCategories: EventCategory[] = [
  {
    id: "wedding",
    name: "Weddings",
    icon: "💍",
    gradient: "from-rose-500 to-pink-700",
    subCategories: [
      {
        name: "Theme-Based Weddings",
        services: ["Beach Wedding", "Garden Wedding", "Vintage Wedding", "Royal Wedding", "Bohemian Wedding", "Rustic Wedding", "Modern Minimalist", "Forest Wedding", "Rooftop Wedding"],
      },
      {
        name: "Culture-Based Weddings",
        services: ["Hindu Wedding", "Muslim Nikah", "Sikh Anand Karaj", "Christian Wedding", "Jain Wedding", "Buddhist Wedding", "Parsi Wedding", "Inter-faith Wedding"],
      },
      {
        name: "Pre-Wedding Ceremonies",
        services: ["Engagement / Sagai", "Mehandi Ceremony", "Sangeet Night", "Haldi Ceremony", "Bachelor Party", "Bachelorette Party", "Bridal Shower", "Tilak / Shagun", "Roka Ceremony"],
      },
      {
        name: "Photography & Video",
        services: ["Candid Photographer", "Traditional Photographer", "Drone Photography", "Pre-Wedding Shoot", "Cinematic Videographer", "Photo Booth", "Wedding Reels", "Same-Day Edit"],
      },
      {
        name: "Décor & Florals",
        services: ["Stage Decoration", "Entry Gate Décor", "Floral Designer", "Mandap Designer", "Lighting Designer", "Theme Decorator", "Balloon Artist", "Rangoli Artist", "Tent & Canopy", "Backdrop Designer"],
      },
      {
        name: "Catering & Food",
        services: ["Wedding Caterer", "Multi-cuisine Catering", "Regional Cuisine", "Live Food Counters", "Dessert Bar", "Wedding Cake Designer", "Bartender", "Mehendi Caterer", "Prasad Preparation", "Chaat Station"],
      },
      {
        name: "Bridal & Grooming",
        services: ["Bridal Makeup Artist", "Groom Makeup & Styling", "Mehendi Artist", "Bridal Hair Stylist", "Bridal Wear Designer", "Groom Sherwani Designer", "Jewelry Designer", "Jewelry Rental", "Trousseau Packer"],
      },
      {
        name: "Entertainment & Artists",
        services: ["DJ", "Live Band", "Bollywood Artist", "Choreographer (Sangeet)", "Couple Dance Trainer", "Flash Mob Organizer", "Anchor / MC", "Stand-up Comedian", "Magician", "Folk Dancers"],
      },
      {
        name: "Venue & Logistics",
        services: ["Banquet Hall", "Hotel Ballroom", "Resort Venue", "Farmhouse", "Destination Venue", "Luxury Car Rental", "Vintage Car", "Horse & Baggi", "Valet Parking", "Wedding Planner"],
      },
      {
        name: "Priest & Rituals",
        services: ["Hindu Pandit", "Muslim Qazi / Maulvi", "Christian Pastor", "Sikh Granthi", "Jain Priest", "Buddhist Monk", "Parsi Mobed", "Astrologer / Muhurat", "Honeymoon Planner"],
      },
      {
        name: "Invitations & Stationery",
        services: ["Digital Invitation Designer", "Printed Card Designer", "Video Invitation Creator", "Seating Cards", "Menu Card Designer", "Welcome Board", "Signage & Wayfinding"],
      },
      {
        name: "Special Effects",
        services: ["Fireworks & Pyrotechnics", "Cold Spark Machine", "Fog Machine", "Confetti Cannon", "Drone Light Show", "LED Entry Effects", "Henna Bar Setup"],
      },
    ],
  },
  {
    id: "corporate",
    name: "Corporate Events",
    icon: "🏢",
    gradient: "from-blue-500 to-indigo-700",
    subCategories: [
      {
        name: "Conferences & Seminars",
        services: ["Conference Venue", "Stage Setup", "Podium & Lectern", "Keynote Speaker", "Panel Discussion Organizer", "Simultaneous Translation", "Teleprompter Services", "Registration Desk"],
      },
      {
        name: "Product Launches & Brand Activations",
        services: ["Launch Event Planner", "LED Wall Setup", "Brand Activation Team", "Promotional Staff / Hostesses", "Influencer Coordination", "PR Agency", "Media Management"],
      },
      {
        name: "Trade Shows & Exhibitions",
        services: ["Exhibition Stall Designer", "Booth Fabricator", "Display System Provider", "Modular Stall", "On-site Printing", "Lead Generation System"],
      },
      {
        name: "Team Building & Retreats",
        services: ["Team Building Organizer", "Outdoor Adventure Provider", "Corporate Retreat Planner", "Games Coordinator", "Motivational Speaker", "Workshop Facilitator"],
      },
      {
        name: "Audio Visual & Tech",
        services: ["PA System Provider", "LED Screen Rental", "Projector & Screen", "Live Streaming", "Sound Engineer", "Lighting Technician", "Event App Developer", "Live Polling System"],
      },
      {
        name: "Hospitality & Catering",
        services: ["Corporate Caterer", "Coffee Break Setup", "Gala Dinner Caterer", "Bartending Services", "Welcome Kits", "Corporate Gift Hampers", "Travel Desk"],
      },
      {
        name: "Virtual & Hybrid Events",
        services: ["Webinar Platform", "Hybrid Event Producer", "Virtual MC", "Recording & On-demand", "Online Networking Tool", "Closed Captioning"],
      },
      {
        name: "Awards & Celebrations",
        services: ["Award Ceremony MC", "Trophy & Certificate Provider", "Company Anniversary Planner", "Year-End Party Organizer", "Employee Recognition Setup"],
      },
    ],
  },
  {
    id: "social-party",
    name: "Social Parties",
    icon: "🎉",
    gradient: "from-amber-500 to-orange-600",
    subCategories: [
      {
        name: "Birthday Parties",
        services: ["Kids Party Planner", "Teen Party Organizer", "Adult Birthday Planner", "Milestone Birthday (18/21/30/50)", "Surprise Party Organizer", "Destination Birthday"],
      },
      {
        name: "Kids Party Specialists",
        services: ["Magician", "Clown Artist", "Bouncy Castle / Inflatable Rental", "Kids Entertainer", "Face Painter", "Puppet Show", "Return Gift Packer", "Ball Pit Setup"],
      },
      {
        name: "Party Essentials",
        services: ["Party Decorator", "Balloon Artist", "Cake Designer", "Photo Booth", "DJ", "Bartender", "Anchor / MC", "Catering", "Games Organizer"],
      },
      {
        name: "Baby & Family Events",
        services: ["Baby Shower Planner", "Gender Reveal Organizer", "Naming Ceremony (Namkaran)", "Cradle Ceremony", "First Birthday Specialist", "Housewarming Planner"],
      },
      {
        name: "Reunion & Milestone Events",
        services: ["School Reunion Organizer", "Family Reunion Planner", "Silver/Golden Anniversary Planner", "Graduation Party", "Retirement Party Organizer", "Welcome/Farewell Party"],
      },
      {
        name: "Theme & Concept Parties",
        services: ["Theme Party Designer", "Costume Party Organizer", "Pool Party Setup", "Garden Party Planner", "Cocktail Party Setup", "Decade-Themed Party", "Movie-Themed Party"],
      },
    ],
  },
  {
    id: "educational",
    name: "Educational Events",
    icon: "🎓",
    gradient: "from-emerald-500 to-teal-700",
    subCategories: [
      {
        name: "College Fests",
        services: ["Techfest Organizer", "Cultural Fest Planner", "Literary Fest", "Model United Nations (MUN)", "Hackathon Organizer", "Fashion Show (College)", "Drama & Theatre"],
      },
      {
        name: "School Events",
        services: ["Annual Day Organizer", "Sports Day Planner", "Science Fair Setup", "Talent Show Organizer", "Prize Distribution Ceremony", "Debate Competition Organizer"],
      },
      {
        name: "Convocation & Graduation",
        services: ["Convocation Planner", "Robe & Cap Supplier", "Stage & Backdrop", "Academic Photography", "Guest of Honour Management", "Livestream Service"],
      },
      {
        name: "Workshops & Seminars",
        services: ["Educational Seminar Organizer", "Workshop Facilitator", "Speaker Booking", "Registration Services", "Certificate Printing"],
      },
      {
        name: "Competitions",
        services: ["Quiz Competition Organizer", "Art Exhibition Setup", "Science Exhibition", "Robotics Competition", "Debate Competition", "Scoring & Timing Systems"],
      },
      {
        name: "Production & Tech",
        services: ["Stage Setup", "LED Screen & Projector", "Sound System", "Event Photographer", "Live Streaming", "Decoration Services", "Trophy Provider", "Security Personnel"],
      },
    ],
  },
  {
    id: "concert",
    name: "Concerts & Shows",
    icon: "🎤",
    gradient: "from-purple-500 to-violet-700",
    subCategories: [
      {
        name: "Concert Types",
        services: ["Classical Concert", "Bollywood Night", "Rock Concert", "Pop Show", "EDM / DJ Night", "Indie Music Festival", "Sufi Night", "Ghazal Evening", "Qawwali Night", "Karaoke Night"],
      },
      {
        name: "Comedy & Theatre",
        services: ["Stand-up Comedy Show", "Theatre Performance", "Drama Show", "Magic Show", "Circus Event", "Opera / Ballet", "Tribute Show", "Open Mic Event"],
      },
      {
        name: "Dance & Performance Shows",
        services: ["Classical Dance Show", "Contemporary Dance", "Folk Dance Performance", "Celebrity Dance Show", "Dance Competition"],
      },
      {
        name: "Stage Production",
        services: ["Stage Construction", "Professional Sound System (PA)", "Stage Lighting Designer", "LED Wall / Video Screen", "Rigging & Trussing", "Special Effects (Pyro / Fog / Laser)", "Power Distribution"],
      },
      {
        name: "Artist & Talent Management",
        services: ["Artist Booking Agency", "Celebrity Management", "Technical Crew", "Backstage Manager", "Green Room Setup", "VIP Lounge Setup"],
      },
      {
        name: "Event Operations",
        services: ["Ticketing Platform", "Entry Management", "Security & Crowd Control", "Medical / First Aid", "Live Streaming", "Broadcasting Services", "Merchandise Setup", "Parking Management"],
      },
    ],
  },
  {
    id: "religious",
    name: "Religious & Spiritual",
    icon: "🪔",
    gradient: "from-yellow-500 to-amber-700",
    subCategories: [
      {
        name: "Hindu Events",
        services: ["Satyanarayan Puja", "Griha Pravesh Puja", "Vastu Shanti", "Kirtan / Bhajan", "Jagran Organizer", "Ganesh Chaturthi Pandal", "Durga Puja", "Navratri Garba", "Yagna / Havan", "Bhagwat Katha"],
      },
      {
        name: "Muslim Events",
        services: ["Eid Celebration Organizer", "Ramadan Iftar Setup", "Milad-un-Nabi", "Nikah Ceremony", "Walima Reception", "Aqiqah Ceremony", "Mosque Inauguration"],
      },
      {
        name: "Christian Events",
        services: ["Christmas Celebration", "Easter Service", "Baptism Ceremony", "First Communion", "Church Gathering", "Carol Service", "Prayer Meeting Organizer"],
      },
      {
        name: "Sikh Events",
        services: ["Gurudwara Ceremony", "Langar Service", "Akhand Path", "Gurpurab Celebration", "Lohri Event", "Baisakhi Celebration", "Shabad Kirtan Group"],
      },
      {
        name: "Other Faiths",
        services: ["Buddhist Event Organizer", "Jain Paryushan Organizer", "Parsi Navroze", "Inter-faith Gathering", "Spiritual Retreat", "Meditation Camp", "Yoga Camp Organizer"],
      },
      {
        name: "Religious Services & Priests",
        services: ["Hindu Pandit / Purohit", "Muslim Qazi / Imam", "Christian Father / Pastor", "Sikh Granthi", "Jain Upadhyay", "Buddhist Monk", "Parsi Mobed", "Flower & Garland Vendor", "Pandal Artist", "Idol / Murti Maker"],
      },
    ],
  },
  {
    id: "exhibitions",
    name: "Exhibitions & Expos",
    icon: "🏛️",
    gradient: "from-cyan-500 to-blue-600",
    subCategories: [
      {
        name: "Industry Expos",
        services: ["Auto Expo Organizer", "Technology Exhibition", "Healthcare Expo", "Real Estate Exhibition", "Startup Expo", "Consumer Electronics Show", "Industrial Trade Fair"],
      },
      {
        name: "Art & Culture Fairs",
        services: ["Art Gallery Setup", "Book Fair Organizer", "Handicraft Exhibition", "Jewelry Exhibition", "Fashion Exhibition", "Heritage Exhibition"],
      },
      {
        name: "B2B / B2C Events",
        services: ["Wedding Exhibition Organizer", "Home Décor Exhibition", "Food & Beverage Expo", "Education & Career Fair", "Agricultural Fair", "Lifestyle Exhibition"],
      },
      {
        name: "Stall & Booth Design",
        services: ["Exhibition Stall Designer", "Booth Construction", "Modular Exhibition Stall", "Display System Provider", "Flooring Services", "Furniture Rental"],
      },
      {
        name: "Event Operations",
        services: ["Registration & Badge Printing", "RFID Systems", "Hostess & Promotional Staff", "Material Handling & Logistics", "On-site Printing", "Visitor Management System"],
      },
      {
        name: "Tech & AV",
        services: ["LED Screen & Video Wall", "Audio-Visual Equipment", "Wi-Fi & Internet", "Event App", "Lead Generation System", "Photography & Videography"],
      },
    ],
  },
  {
    id: "sports",
    name: "Sports Events",
    icon: "🏆",
    gradient: "from-green-500 to-emerald-700",
    subCategories: [
      {
        name: "Tournaments",
        services: ["Cricket Tournament", "Football League", "Basketball Tournament", "Badminton Tournament", "Tennis Championship", "Volleyball League", "Kabaddi Tournament", "Wrestling Championship"],
      },
      {
        name: "Marathons & Running Events",
        services: ["5K Run Organizer", "10K Run", "Half Marathon", "Full Marathon", "Walkathon Organizer", "Cycling Event", "Triathlon Organizer"],
      },
      {
        name: "Adventure & Fitness Events",
        services: ["Rock Climbing Event", "Trekking Camp", "Rafting Event", "Paragliding Event", "CrossFit Competition", "Yoga Championship", "Zumba Event", "Bodybuilding Competition"],
      },
      {
        name: "E-Sports & Gaming",
        services: ["E-Sports Tournament", "LAN Party Organizer", "Gaming Convention", "Online Gaming League"],
      },
      {
        name: "Sports Event Operations",
        services: ["Timing & Scoring System", "Referee / Umpire Services", "Commentator & Announcer", "Sports Medical Team", "Participant Kit Distribution", "Medal & Trophy Provider", "LED Scoreboard"],
      },
      {
        name: "Venue & Infrastructure",
        services: ["Stadium Booking", "Sports Complex", "Ground Preparation", "Seating Arrangements (Bleachers)", "Tents & Canopies", "VIP Lounge Setup", "Barricading & Crowd Control", "Portable Toilets"],
      },
    ],
  },
  {
    id: "government",
    name: "Government Events",
    icon: "🏛️",
    gradient: "from-slate-500 to-gray-700",
    subCategories: [
      {
        name: "National Celebrations",
        services: ["Independence Day Event", "Republic Day Celebration", "Gandhi Jayanti Event", "National Integration Program", "Flag Hoisting Ceremony", "Memorial Service"],
      },
      {
        name: "Political & Public Events",
        services: ["Political Rally Organizer", "Public Meeting Setup", "Election Campaign Manager", "Voter Awareness Program", "Town Hall Meeting Setup", "Government Scheme Launch"],
      },
      {
        name: "Government Functions",
        services: ["Inauguration Ceremony", "Foundation Laying Ceremony", "State Function", "Diplomatic Event", "Military Parade", "Award Ceremony"],
      },
      {
        name: "Production & Security",
        services: ["High-capacity PA System", "Stage & Podium Setup", "LED Screens & Video Walls", "VIP Protocol Services", "Security & Crowd Control", "Barricading Services", "Metal Detector Setup"],
      },
      {
        name: "Broadcast & Media",
        services: ["Photography (Official Documentation)", "Videography", "Broadcasting Services", "Press Conference Setup", "Media Management", "Live Streaming"],
      },
      {
        name: "Logistics & Support",
        services: ["Transportation & Logistics", "Accommodation Services", "Catering (State Banquets)", "Fireworks (National Days)", "Medical Services", "Power Backup", "Permits & Clearances"],
      },
    ],
  },
  {
    id: "charity",
    name: "Charity & NGO Events",
    icon: "❤️",
    gradient: "from-red-400 to-rose-600",
    subCategories: [
      {
        name: "Fundraising Events",
        services: ["NGO Fundraiser Organizer", "Charity Gala & Dinner", "Charity Auction", "Crowdfunding Event", "Benefit Concert Organizer", "Donation Drive Setup"],
      },
      {
        name: "Awareness Campaigns",
        services: ["Health Awareness Campaign", "Education Drive", "Environmental Campaign", "Social Cause Event", "Blood Donation Camp", "Vaccination Drive", "Tree Plantation Drive"],
      },
      {
        name: "Community Service",
        services: ["Walkathon for Cause", "Food Distribution Drive", "Clothing Donation Event", "Old Age Home Support", "Orphanage Support Event", "Animal Welfare Event", "Beach Clean-up"],
      },
      {
        name: "Celebrity & Art for Charity",
        services: ["Celebrity Appearance Booking", "Art for Charity Exhibition", "Celebrity Sports Event", "Charity Fashion Show"],
      },
      {
        name: "Health & Medical Camps",
        services: ["Medical Check-up Camp", "Eye Check-up Camp", "Dental Camp", "Health Screening Booth", "Medical Equipment Provider", "Diagnostics Services"],
      },
      {
        name: "Event Support Services",
        services: ["Event Planner (Non-profit)", "Fundraising Platform Setup", "Payment Gateway", "Volunteer Coordinator", "Legal & Compliance", "Tax Receipt Generation", "PR & Marketing"],
      },
    ],
  },
  {
    id: "fashion-lifestyle",
    name: "Fashion & Lifestyle",
    icon: "👗",
    gradient: "from-fuchsia-500 to-pink-600",
    subCategories: [
      {
        name: "Fashion Shows",
        services: ["Designer Fashion Show", "Bridal Fashion Show", "Kids Fashion Show", "Sustainable Fashion Event", "Haute Couture Show", "Prêt-à-Porter Show", "Accessories Show"],
      },
      {
        name: "Beauty & Pageants",
        services: ["Beauty Pageant Organizer", "Miss / Mr. Competition", "Model Audition", "Casting Call Organizer", "Model Coordinator"],
      },
      {
        name: "Lifestyle & Wellness",
        services: ["Spa & Salon Launch", "Wellness Expo", "Beauty & Wellness Expo", "Fitness Event", "Lifestyle Exhibition", "Pop-up Fashion Event"],
      },
      {
        name: "Fashion Show Production",
        services: ["Runway Stage Construction", "Fashion Lighting Designer", "Runway Choreographer", "Wardrobe Management", "Backstage Manager", "Changing Room Setup"],
      },
      {
        name: "Media & PR",
        services: ["Fashion PR Agency", "Influencer Management", "Social Media Coverage", "Red Carpet Setup", "Media Management", "After-party Planner", "Gift Bags & Hampers"],
      },
      {
        name: "Artist & Glam Services",
        services: ["Makeup Artist & Hair Stylist", "Music Director & DJ", "Anchor / MC", "Celebrity Guest Management", "Photographer & Videographer"],
      },
    ],
  },
  {
    id: "virtual",
    name: "Virtual & Hybrid Events",
    icon: "💻",
    gradient: "from-teal-500 to-cyan-700",
    subCategories: [
      {
        name: "Virtual Events",
        services: ["Virtual Conference Organizer", "Webinar Host", "Online Training Session", "Virtual Trade Show", "Digital Product Launch", "Online Workshop", "Virtual Career Fair"],
      },
      {
        name: "Hybrid Events",
        services: ["Hybrid Conference Producer", "Hybrid Event Manager", "Live Streaming Services", "Broadcast Setup", "Virtual + Physical Integration"],
      },
      {
        name: "Immersive Experiences",
        services: ["VR Event Setup", "AR Experience Designer", "Metaverse Event Organizer", "3D Virtual Environment Designer", "Online Gaming Event"],
      },
      {
        name: "Technology Platforms",
        services: ["Virtual Event Platform (Zoom/Hopin)", "Webinar Software", "Event App Developer", "Interactive Polling System", "Virtual Networking Tool", "Chat Moderation Service"],
      },
      {
        name: "Content & Production",
        services: ["Video Production & Editing", "Animation Services", "Digital Content Creator", "Graphic Designer", "Email Marketing", "Social Media Manager"],
      },
      {
        name: "Support Services",
        services: ["Technical Support (24/7)", "Cybersecurity Services", "Internet & Bandwidth Management", "Recording & On-demand", "Multi-language Interpretation", "Analytics & Reporting"],
      },
    ],
  },
  {
    id: "festivals",
    name: "Festivals & Melas",
    icon: "🎪",
    gradient: "from-orange-500 to-red-600",
    subCategories: [
      {
        name: "Hindu Festivals",
        services: ["Diwali Mela Organizer", "Holi Event Planner", "Durga Puja Pandal Setup", "Navratri Garba / Dandiya", "Ganesh Chaturthi Setup", "Janmashtami Event", "Dussehra Ramlila"],
      },
      {
        name: "Multi-Faith Festivals",
        services: ["Eid Mela Organizer", "Christmas Carnival", "Baisakhi Celebration", "Lohri Event", "Easter Event", "Buddha Purnima Event", "Navroze Celebration"],
      },
      {
        name: "Cultural & Harvest Festivals",
        services: ["Pongal Celebration", "Onam Onaasadya Setup", "Makar Sankranti", "Bihu Event", "Pushkar Mela Support", "Rann Utsav Setup", "Tribal Festival Organizer"],
      },
      {
        name: "Food & Music Festivals",
        services: ["Food Festival Organizer", "Street Food Stall Setup", "Music Festival Planner", "Beer & Wine Festival", "Food Truck Festival", "Arts & Crafts Festival"],
      },
      {
        name: "Pandal & Structure",
        services: ["Pandal / Temporary Structure Builder", "Durga / Ganesh Idol Maker", "Theme Decorator (Traditional)", "LED Decoration Setup", "Rangoli Artist", "Religious Material Supplier"],
      },
      {
        name: "Operations & Safety",
        services: ["Festival Security Services", "Crowd Management", "Waste Management", "Sanitation Services", "Fireworks (Where Permitted)", "Cultural Performers", "Folk Artists", "Game Stalls"],
      },
    ],
  },
  {
    id: "hospitality",
    name: "Hospitality & F&B",
    icon: "🍽️",
    gradient: "from-lime-500 to-green-600",
    subCategories: [
      {
        name: "Restaurant & Hotel Events",
        services: ["Restaurant Launch Planner", "Hotel Opening Event", "Chef's Table Experience", "Hotel Anniversary Planner", "Cruise Ship Event Organizer"],
      },
      {
        name: "Food & Culinary Events",
        services: ["Food Tasting Event", "Culinary Competition Organizer", "MasterChef Style Cook-off", "Wine & Dine Event", "Pop-up Restaurant Organizer"],
      },
      {
        name: "Food & Drink Festivals",
        services: ["Beer & Wine Festival", "Coffee & Tea Festival", "Chocolate Festival", "Street Food Festival", "Food Truck Festival", "Mixology Competition"],
      },
      {
        name: "F&B Services",
        services: ["Celebrity Chef Booking", "Sommelier Services", "Mixologist / Bartender", "Service Staff (Waiters, Butlers)", "Menu Design & Printing"],
      },
      {
        name: "Décor & Ambience",
        services: ["Table Setting & Floral", "Ambient Lighting Design", "Interior Decoration", "Background Music Setup", "Valet Services"],
      },
      {
        name: "PR & Media",
        services: ["Food Critics & Media Coordination", "PR & Marketing Services", "Social Media Coverage", "Photography & Videography", "Invitation Design"],
      },
    ],
  },
  {
    id: "film-media",
    name: "Film & Media Events",
    icon: "🎬",
    gradient: "from-rose-600 to-red-800",
    subCategories: [
      {
        name: "Film Premieres & Screenings",
        services: ["Film Premiere Organizer", "Movie Screening Setup", "Film Festival Organizer", "Documentary Screening", "Short Film Competition", "OTT Platform Launch"],
      },
      {
        name: "Awards & Press Events",
        services: ["Award Ceremony Organizer", "Press Conference Setup", "Trailer Launch Event", "Music Launch Event", "Web Series Launch"],
      },
      {
        name: "Fan Events & Appearances",
        services: ["Fan Meet & Greet Organizer", "Celebrity Appearance Management", "Behind-the-Scenes Event", "Film Completion Party", "Wrap-up Party Planner"],
      },
      {
        name: "Red Carpet Production",
        services: ["Red Carpet Setup", "Stage Design & Backdrop", "Celebrity Security", "VIP Lounge Setup", "Paparazzi Management", "Priority Seating Management"],
      },
      {
        name: "Media & Broadcast",
        services: ["Media Management", "Press Coordination", "Live Streaming", "Broadcasting Services", "Social Media Management", "PR & Marketing"],
      },
      {
        name: "Logistics & Hospitality",
        services: ["Luxury Car / Vanity Van", "Valet Services", "VIP Catering", "Invitation Design (Physical & Digital)", "Gift Bags & Hampers", "After-party Management", "Ticketing Services"],
      },
    ],
  },
  {
    id: "technology",
    name: "Tech & Innovation",
    icon: "💡",
    gradient: "from-sky-500 to-blue-700",
    subCategories: [
      {
        name: "Tech Conferences & Summits",
        services: ["Tech Conference Organizer", "AI & ML Summit", "Blockchain / Crypto Summit", "Cybersecurity Conference", "Data Science Conference", "Cloud Computing Event", "IoT Exhibition"],
      },
      {
        name: "Hackathons & Competitions",
        services: ["24-Hour Hackathon", "Weekend Hackathon", "Coding Sprint", "Bug Bounty Event", "Robotics Competition", "E-Sports Tournament", "Developer Bootcamp"],
      },
      {
        name: "Startups & Innovation",
        services: ["Startup Pitch Event", "Demo Day Organizer", "Accelerator Program", "Investor Meet", "Innovation Showcase", "Open Source Conference", "Tech Meetup"],
      },
      {
        name: "Product Launches",
        services: ["Tech Product Launch", "Software Launch Event", "App Launch", "Gaming Convention", "LAN Party Organizer", "Beta Testing Event"],
      },
      {
        name: "Tech Infrastructure",
        services: ["High-speed Internet (100+ Mbps)", "Power & Charging Stations", "Live Coding Environment", "VR / AR Experience Zone", "Gaming Zone Setup", "Technical Support (24/7)", "Demo Area Setup"],
      },
      {
        name: "Production & Media",
        services: ["Stage Setup", "Audio-Visual Equipment", "LED Wall & Video", "Registration & Badge Printing", "Event App Platform", "Photography & Videography", "Live Streaming", "Swag & Merchandise"],
      },
    ],
  },
  {
    id: "health-wellness",
    name: "Health & Wellness",
    icon: "🧘",
    gradient: "from-green-400 to-teal-600",
    subCategories: [
      {
        name: "Health Camps",
        services: ["Health Camp Organizer", "Blood Donation Camp", "Eye Check-up Camp", "Dental Camp", "Vaccination Drive", "Medical Check-up Organizer"],
      },
      {
        name: "Yoga & Meditation",
        services: ["Yoga Retreat Organizer", "Yoga Workshop", "Meditation Session", "Mindfulness Workshop", "Spiritual Retreat", "Ayurveda & Naturopathy Event"],
      },
      {
        name: "Fitness Events",
        services: ["Fitness Challenge Organizer", "Marathon Planner", "Zumba Event", "Dance Fitness Event", "CrossFit Competition", "Corporate Wellness Program"],
      },
      {
        name: "Wellness Expos",
        services: ["Wellness Expo Organizer", "Alternative Medicine Expo", "Holistic Healing Workshop", "Spa & Wellness Retreat", "Mental Health Awareness Event", "Nutrition Workshop"],
      },
      {
        name: "Medical Conferences",
        services: ["Medical Conference Organizer", "Pharmaceutical Launch", "Health Awareness Campaign", "Medical Professionals Booking", "Diagnostic Services"],
      },
      {
        name: "Event Support",
        services: ["Yoga Instructors", "Fitness Coaches", "Nutritionists & Dietitians", "Mental Health Counselors", "Seating & Mat Arrangements", "Healthy Catering", "Hydration Stations"],
      },
    ],
  },
  {
    id: "community",
    name: "Community Events",
    icon: "🏘️",
    gradient: "from-violet-500 to-purple-700",
    subCategories: [
      {
        name: "Society & Neighbourhood",
        services: ["Society Annual Day", "Neighbourhood Festival", "RWA Event Organizer", "Block Party Planner", "Community Gathering Organizer"],
      },
      {
        name: "Environmental Drives",
        services: ["Clean-up Drive", "Tree Plantation Drive", "Eco-friendly Initiative", "Beach Clean-up", "Environmental Awareness Campaign"],
      },
      {
        name: "Cultural Celebrations",
        services: ["Diwali Society Event", "Holi Event", "Children's Day", "Women's Day Celebration", "Independence Day", "Senior Citizens Event"],
      },
      {
        name: "Community Entertainment",
        services: ["Local Talent Show", "Street Play", "Community Sports Event", "Garage Sale / Flea Market", "Picnic Organizer"],
      },
      {
        name: "Event Support",
        services: ["Decoration Services", "PA Sound System", "Local DJ / Artist", "Games & Activities", "Catering Coordination", "Photography", "Security Coordination"],
      },
    ],
  },
  {
    id: "agricultural",
    name: "Agricultural & Rural Events",
    icon: "🌾",
    gradient: "from-yellow-600 to-lime-700",
    subCategories: [
      {
        name: "Agricultural Fairs",
        services: ["Krishi Mela Organizer", "Farmers' Market Setup", "Kisan Diwas Event", "Organic Farming Expo", "Horticulture Show", "Agricultural Equipment Exhibition"],
      },
      {
        name: "Livestock & Rural Shows",
        services: ["Livestock Show Organizer", "Dairy & Poultry Expo", "Traditional Crafts Exhibition", "Farm Produce Festival", "Rural Development Program", "Seed Distribution Event"],
      },
      {
        name: "Infrastructure & Support",
        services: ["Tent & Canopy Setup", "Exhibition Stall Setup", "Demonstration Area", "Bilingual Signage", "Local Food Catering", "Veterinary Services", "Accommodation for Visitors"],
      },
    ],
  },
  {
    id: "automotive",
    name: "Automotive Events",
    icon: "🏎️",
    gradient: "from-zinc-500 to-slate-700",
    subCategories: [
      {
        name: "Auto Shows & Launches",
        services: ["Auto Expo Organizer", "Vehicle Launch Event", "Test Drive Event Planner", "EV Expo Organizer", "Auto Parts Exhibition", "Automobile Awards Ceremony"],
      },
      {
        name: "Racing & Rallies",
        services: ["Car Rally Organizer", "Bike Rally Organizer", "Circuit Racing Event", "Drag Racing Event", "Off-road Event", "Go-Karting Competition", "Track Day Organizer"],
      },
      {
        name: "Specialty Shows",
        services: ["Vintage Car Show", "Custom Car Show", "Bike Festival", "Automotive Workshop", "Automotive Technology Conference"],
      },
      {
        name: "Event Production",
        services: ["Vehicle Display Setup", "Stage & Podium Setup", "Test Drive Track Setup", "Safety Equipment & Marshals", "LED Wall & Video", "Drone Videography"],
      },
      {
        name: "Hospitality & Media",
        services: ["Celebrity & Brand Ambassador", "Hostess Services", "VIP Lounge", "Catering Services", "Media Management", "PR & Marketing", "Promotional Material", "Branding & Signage"],
      },
    ],
  },
];
