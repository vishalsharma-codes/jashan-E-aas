/**
 * Jashn-E-Aas event taxonomy (generated from "20-Category Event Taxonomy & Service Blueprint").
 *
 * Tier 1  category      -> TAXONOMY[i]
 * Tier 2  formats       -> .formats
 * Tier 3  sub-events    -> .subEvents
 * Tier 4  vendor services (in default display order) -> .services
 *
 * Put this file at src/lib/categoryTaxonomy.ts
 */

export interface TaxonomyCategory {
  id: string;        // "CAT-01"
  slug: string;      // "weddings"  (use in URLs / filters)
  name: string;      // full name from the sheet
  shortName: string; // label for overlay tiles, rename freely
  leadTime: string;
  scope: string;
  formats: string[];
  subEvents: string[];
  services: string[]; // vendor service types, in the order they appear inside the event
}

export const TAXONOMY: TaxonomyCategory[] = [
  {
    "id": "CAT-01",
    "slug": "weddings",
    "name": "Weddings & Pre-Wedding Ceremonies",
    "shortName": "Weddings",
    "leadTime": "1 Month to 18 Months",
    "scope": "Comprehensive marital nuptials, royal/destination galas, pre-wedding rituals, and celebratory receptions.",
    "formats": [
      "Theme-Based Weddings (Beach, Garden, Vintage, Royal, Rustic, Bohemian)",
      "Culture-Based Weddings (Hindu, Muslim, Sikh, Christian, Jain, Buddhist, Parsi, Inter-faith)",
      "Destination Weddings (International, Domestic Hill Stations, Beach, Heritage Forts)",
      "Luxury Weddings",
      "Budget / Intimate Weddings",
      "Eco-Friendly / Sustainable Weddings"
    ],
    "subEvents": [
      "Engagement Ceremonies (Sagai, Ring Ceremony, Roka)",
      "Mehandi & Henna Function",
      "Sangeet & Musical Night",
      "Haldi Ceremony",
      "Bachelor / Bachelorette Parties",
      "Bridal Shower",
      "Wedding Reception",
      "Cocktail Party",
      "Tilak / Shagun Ceremony",
      "Main Wedding Ceremony (Phera, Nikah, Anand Karaj, Mass)",
      "Bidaai Ceremony",
      "Post-Wedding Rituals (Griha Pravesh, Mu Dikhai)",
      "Anniversary Celebrations",
      "Vow Renewal Ceremonies"
    ],
    "services": [
      "Wedding Planners & Coordinators",
      "Venue Providers (Banquet Halls, Hotels, Resorts, Farmhouses, Destination)",
      "Decorators & Florists (Stage, Entry Gates, Theme Decor)",
      "Caterers & Food Services (Multi-cuisine, Live Counters, Desserts)",
      "Photographers & Videographers (Candid, Drone, Pre-wedding, Cinematic)",
      "Bridal Makeup Artists & Hair Stylists",
      "Groom Makeup & Styling",
      "Mehandi Artists (Traditional, Arabic, Indo-Western)",
      "Bridal Wear Designers & Boutiques",
      "Jewelry Designers & Rental",
      "Wedding Invitation Designers & Printers (Digital, Physical, Video)",
      "Choreographers (Sangeet, Couple Dance)",
      "DJs & Music Systems",
      "Live Bands & Musicians (Classical, Bollywood, Fusion)",
      "Sound & Lighting Technicians",
      "Anchor / Emcee Services",
      "Entertainment Artists (Singers, Dancers)",
      "Wedding Favors & Gift Services",
      "Trousseau Packers & Decorators",
      "Wedding Cake Designers",
      "Bartenders & Beverage Services",
      "Tent & Canopy Providers",
      "Furniture & Seating Arrangements",
      "Stage Setup & Backdrop Services",
      "Transportation Services (Luxury Cars, Vintage Cars, Baggi)",
      "Valet Parking Services",
      "Pandit / Priest / Officiant (Hindu, Muslim Qazi, Christian Pastor, Sikh Granthi)",
      "Wedding Stationery (Signage, Menu Cards)",
      "Fireworks & Special Effects",
      "Drone Services",
      "Photo Booth Services",
      "Henna Bar Setup",
      "Astrologers & Muhurat Services"
    ]
  },
  {
    "id": "CAT-02",
    "slug": "corporate-events",
    "name": "Corporate Events",
    "shortName": "Corporate Events",
    "leadTime": "1.5 Months to 6 Months",
    "scope": "Enterprise corporate summits, product reveals, B2B activations, team retreats, and annual shareholder meets.",
    "formats": [
      "Conferences & Seminars",
      "Business Meetings (Board Meetings, Shareholder Meetings, AGMs)",
      "Product Launches & Brand Activations",
      "Trade Shows & Exhibitions",
      "Corporate Parties & Celebrations",
      "Team Building Activities",
      "Training & Workshops",
      "Incentive Programs & Rewards",
      "Networking Events",
      "Corporate Retreats & Offsites",
      "Corporate Sports Events",
      "Press Conferences & Media Events",
      "Virtual / Hybrid Events & Webinars",
      "Corporate Hackathons",
      "Investor Meets & IPO Events"
    ],
    "subEvents": [
      "Annual General Meetings (AGM)",
      "Company Anniversaries & Milestones",
      "New Office Inaugurations",
      "Executive Retreats",
      "Sales Conferences",
      "Technology Summits",
      "Leadership Programs",
      "Dealer / Distributor Meets",
      "Customer Appreciation Events",
      "Year-End & Holiday Parties",
      "Retirement & Promotion Parties",
      "Press Conferences"
    ],
    "services": [
      "Event Planners & Management Companies",
      "Conference Venue Providers (Hotels, Convention Centers)",
      "Audio-Visual Equipment Providers",
      "Stage Setup & Backdrop Services",
      "Lighting Technicians (Stage, Ambient)",
      "Sound System Providers",
      "Projector & Screen Rental",
      "LED Wall & Display Services",
      "Registration & Check-in Services",
      "Badge Printing & RFID Systems",
      "Event Technology (Apps, Live Polling, Q&A)",
      "Professional Photographers & Videographers",
      "Live Streaming & Webcasting Services",
      "Simultaneous Translation Services",
      "Teleprompter Services",
      "Furniture Rental (Tables, Chairs, Podiums)",
      "Catering Services (Coffee Breaks, Lunch, Dinner)",
      "Bartending Services",
      "Keynote & Motivational Speakers",
      "Anchor / MC Services",
      "Promotional Staff & Hostesses",
      "Exhibition Stall Designers & Fabricators",
      "Corporate Gifts & Merchandise",
      "Team Building Activity Organizers",
      "Transportation & Logistics",
      "Security & Valet Services",
      "IT & Wi-Fi Support Services",
      "Power Backup Services"
    ]
  },
  {
    "id": "CAT-03",
    "slug": "social-parties",
    "name": "Social Celebrations & Private Parties",
    "shortName": "Social Parties",
    "leadTime": "1 Week to 1.5 Months",
    "scope": "Personal milestones, birthday galas, housewarmings, family reunions, and intimate social gatherings.",
    "formats": [
      "Birthday Parties (Kids, Teens, Adults, Milestones)",
      "Anniversary Celebrations",
      "Baby Showers & Gender Reveals",
      "Naming Ceremonies (Namkaran)",
      "Cradle Ceremonies",
      "Housewarming Parties (Griha Pravesh)",
      "Reunion Parties (School, College, Family)",
      "Retirement Parties",
      "Farewell Parties",
      "Theme Parties (Costume, Decade-themed, Movie-themed)",
      "Pool Parties",
      "Garden Parties",
      "Cocktail Parties"
    ],
    "subEvents": [
      "First Birthday Parties",
      "Sweet Sixteen & Quinceañera",
      "Coming of Age Ceremonies",
      "25th & 50th Anniversaries (Silver, Golden)",
      "Graduation Parties",
      "Promotion Celebrations",
      "House Parties & Intimate Gatherings",
      "Picnic Parties"
    ],
    "services": [
      "Party Planners",
      "Venue Providers (Party Halls, Outdoor Venues, Private Properties)",
      "Theme Decorators",
      "Balloon Decorators (Arches, Columns, Sculptures)",
      "Catering Services",
      "Cake Designers & Bakers",
      "Dessert Tables & Candy Bars",
      "Photographers & Videographers",
      "Entertainment Services (Magicians, Clowns, Puppeteers, Face Painters)",
      "DJ Services & Music Systems",
      "Games & Activity Organizers",
      "Bounce House & Inflatable Rentals",
      "Photo Booth Services",
      "Anchor / MC Services",
      "Invitation Design & Printing",
      "Return Gift & Favor Services",
      "Furniture & Seating Rental",
      "Lighting & Ambient Decor",
      "Sound System Setup",
      "Bartending Services",
      "Valet & Security Services",
      "Housekeeping Services"
    ]
  },
  {
    "id": "CAT-04",
    "slug": "educational-events",
    "name": "Educational Events",
    "shortName": "Educational Events",
    "leadTime": "3 Weeks to 3.5 Months",
    "scope": "University cultural fests, academic convocations, school annual functions, competitions, and alumni gatherings.",
    "formats": [
      "College Fests & Cultural Events",
      "School Annual Days",
      "Convocation Ceremonies",
      "Freshers' & Farewell Parties",
      "Sports Days & Athletic Meets",
      "Inter-College Competitions",
      "Alumni Meets",
      "Prize Distribution Ceremonies",
      "Educational Seminars & Workshops",
      "Science Fairs & Exhibitions"
    ],
    "subEvents": [
      "Technical Fests (Tech Symposiums)",
      "Cultural Festivals",
      "Literary Fests",
      "Model United Nations (MUN)",
      "Hackathons",
      "Quiz Competitions",
      "Art Exhibitions",
      "College Fashion Shows",
      "Drama & Theatre Events"
    ],
    "services": [
      "Event Management Companies",
      "Venue Arrangement",
      "Stage Setup & Design",
      "Sound System Providers",
      "Lighting Equipment",
      "LED Screens & Projectors",
      "Registration Services",
      "Security Personnel & Guard Squads",
      "Anchor / MC Services",
      "Judges & Coordinators",
      "Celebrity Guests & Chief Guests",
      "Entertainment Artists (Bands, DJs)",
      "Photographers & Videographers",
      "Food & Beverage Services",
      "Decoration Services",
      "Promotional Material Design",
      "Trophy & Certificate Providers",
      "Sponsorship Coordination",
      "Live Streaming Services",
      "Timing Systems & Scoreboards",
      "Transportation & Logistics",
      "First Aid & Medical Services"
    ]
  },
  {
    "id": "CAT-05",
    "slug": "concerts-and-shows",
    "name": "Concerts & Entertainment Shows",
    "shortName": "Concerts & Shows",
    "leadTime": "2 Weeks to 4 Months",
    "scope": "Ticketed arena concerts, stand-up comedy tours, theatrical plays, live dance shows, and celebrity star nights.",
    "formats": [
      "Music Concerts (Classical, Bollywood, Rock, Pop, EDM, Indie)",
      "Stand-up Comedy Shows",
      "Theatre Performances & Plays",
      "Dance Shows (Classical, Contemporary, Folk)",
      "Celebrity Appearances & Meet-and-Greets",
      "Film Premieres & Screenings",
      "Award Shows & Ceremonies",
      "Fashion Shows",
      "Talent Shows & Reality Show Recordings"
    ],
    "subEvents": [
      "Solo Artist Concerts",
      "Band Performances",
      "Orchestra Performances",
      "DJ Nights",
      "Open Mic Events",
      "Music Festivals",
      "Comedy Festivals",
      "Sufi & Ghazal Evenings",
      "Qawwali Nights",
      "Karaoke Nights"
    ],
    "services": [
      "Event Producers & Promoters",
      "Venue Providers (Stadiums, Arenas, Auditoriums)",
      "Stage Construction & Design",
      "Professional PA Sound Systems",
      "Stage Lighting (Intelligent Lights, Lasers)",
      "LED Walls & Video Screens",
      "Special Effects (Pyrotechnics, Confetti, Fog)",
      "Rigging & Trussing Services",
      "Power Distribution & Generators",
      "Artist Management & Booking",
      "Technical Crew (Sound Engineers, Lighting Directors)",
      "Security Services & Crowd Control",
      "Ticketing Platforms & Gate Scanners",
      "VIP Lounge & Backstage Setup",
      "Green Room Management",
      "Catering (Artist, Crew, Audience F&B)",
      "Medical Trauma Van & First Aid",
      "Artist Transportation & Hospitality",
      "PR, Media & Social Media Management",
      "Permits & Licensing Coordination"
    ]
  },
  {
    "id": "CAT-06",
    "slug": "religious-and-spiritual",
    "name": "Religious & Spiritual Events",
    "shortName": "Religious & Spiritual",
    "leadTime": "1 Month to 4 Months",
    "scope": "Devotional pujas, festival pandals, spiritual discourses, community langars, and sacred life-stage rituals.",
    "formats": [
      "Hindu Events (Pujas, Kirtans, Jagrans, Religious Discourses, Festivals, Yagnas)",
      "Muslim Events (Eid, Ramadan Iftars, Milad, Nikah, Walima, Aqiqah)",
      "Christian Events (Christmas, Easter, Baptism, First Communion, Carol Services)",
      "Sikh Events (Gurudwara Ceremonies, Langar, Akhand Path, Gurpurab, Anand Karaj)",
      "Other Religious Events (Buddhist, Jain, Parsi, Inter-faith, Spiritual Retreats, Yoga Camps)"
    ],
    "subEvents": [
      "Satyanarayan Puja & Griha Pravesh",
      "Bhajan & Kirtan Mandali",
      "Ramayan / Bhagwat Katha",
      "Navratri Garba & Durga Puja Pandal",
      "Ramadan Iftar & Eid Gathering",
      "Christmas Carol & Prayer Meet",
      "Gurpurab & Shabad Kirtan",
      "Yoga & Meditation Retreats"
    ],
    "services": [
      "Religious Officiants (Pandit, Qazi, Pastor, Granthi, Monk)",
      "Venue Providers (Community Halls, Open Grounds)",
      "Tent & Pandal Builders",
      "Decoration Services (Traditional, Floral, Rangoli)",
      "PA Sound Systems & Microphones",
      "Seating (Carpets, Mats, Chairs, Gaddi)",
      "Catering Services (Prasad, Langar, Satvik/Halal Food)",
      "Flower & Garland Vendors",
      "Incense & Religious Material Suppliers",
      "Lighting (Diyas, LED, Temple Illumination)",
      "Photography & Videography",
      "Donation Collection Management",
      "Religious Performance Groups (Bhajan, Qawwali, Choirs)",
      "Traditional Musicians (Tabla, Harmonium, Dhol)",
      "Idol Makers & Sculptors",
      "Pandal Craftsmen & Banner Makers",
      "Security & Crowd Control",
      "Housekeeping & Sanitation"
    ]
  },
  {
    "id": "CAT-07",
    "slug": "exhibitions-and-expos",
    "name": "Exhibitions & Trade Shows",
    "shortName": "Exhibitions & Expos",
    "leadTime": "3 Months to 12 Months",
    "scope": "Large-scale B2B industry trade fairs, B2C consumer expos, property fairs, and commercial product showcases.",
    "formats": [
      "Industry Expos (Auto, Tech, Healthcare, Real Estate)",
      "Art Exhibitions & Galleries",
      "Book Fairs & Literary Events",
      "Property Exhibitions",
      "Business Summits & Startup Expos",
      "Food & Beverage Expos",
      "Fashion & Lifestyle Exhibitions",
      "Wedding & Jewelry Expos",
      "Industrial Trade Fairs",
      "Education & Career Fairs"
    ],
    "subEvents": [
      "B2B Exhibitions",
      "B2C Consumer Fairs",
      "International Trade Shows",
      "Regional Trade Fairs",
      "Virtual & Hybrid Exhibitions"
    ],
    "services": [
      "Exhibition Organizers",
      "Venue Providers (Convention Centers, Arenas)",
      "Stall Design & Fabrication (Octanorm, Wooden)",
      "Booth Construction Services",
      "Display Systems & Panels",
      "Flooring & Carpet Services",
      "Furniture Rental",
      "Lighting & Electrical Infrastructure",
      "Audio-Visual & Video Walls",
      "Registration Badge Printing & RFID Systems",
      "Hostesses & Promotional Staff",
      "Security & CCTV Grid Setup",
      "Housekeeping & Waste Management",
      "On-Site Catering & Cafeteria",
      "Wi-Fi & Internet Networks",
      "Freight & Material Handling Logistics",
      "Signage & Branding Materials",
      "Photography & Video Coverage",
      "Lead Generation Tech"
    ]
  },
  {
    "id": "CAT-08",
    "slug": "sports-events",
    "name": "Sports Events & Competitions",
    "shortName": "Sports Events",
    "leadTime": "1.5 Months to 3 Months",
    "scope": "Citywide marathons, stadium tournaments, corporate sports leagues, e-sports meets, and athletic championships.",
    "formats": [
      "Tournaments (Cricket, Football, Tennis, Basketball, Badminton, Volleyball)",
      "Marathons & Running Events (5K, 10K, Half Marathon, Full Marathon)",
      "Sports Leagues (Corporate, Amateur, Professional)",
      "Adventure Sports Events (Trekking, Rafting, Paragliding)",
      "Fitness Competitions (CrossFit, Bodybuilding, Yoga, Zumba)",
      "E-Sports & Gaming Championships",
      "Cycling & Swimming Events",
      "Motorsports & Rallies",
      "School / College Sports Days"
    ],
    "subEvents": [
      "Inter-Company Sports Meets",
      "Charity & Celebrity Sports Events",
      "Sports Award Ceremonies",
      "Paralympic & Age-Group Tournaments",
      "Opening & Closing Ceremonies"
    ],
    "services": [
      "Sports Event Management Companies",
      "Venue Booking (Stadiums, Grounds, Indoor Courts)",
      "Ground Preparation & Maintenance",
      "Sport-Specific Equipment Rental",
      "Timing & Scoring Systems (RFID Mats)",
      "Referee & Umpire Services",
      "Commentators & Announcers",
      "Medical Services (Trauma Doctors, Ambulance, First Aid)",
      "Registration & Bib Distribution",
      "Medals, Trophies & Certificate Suppliers",
      "Photography & Drone Coverage",
      "Live Streaming & Scoreboard LED Walls",
      "Sound Systems & Night Lighting",
      "Bleachers & Seating Setup",
      "Hydration & Energy Drink Stations",
      "Sponsor Activation & Branding",
      "Crowd Control & Barricading",
      "Portable Toilets & Changing Facilities"
    ]
  },
  {
    "id": "CAT-09",
    "slug": "government-events",
    "name": "Government & Political Events",
    "shortName": "Government Events",
    "leadTime": "2 Weeks to 1 Month",
    "scope": "High-security political rallies, government inaugurations, state functions, diplomatic summits, and national parades.",
    "formats": [
      "Political Rallies & Public Meetings",
      "Election Campaigns",
      "Government Inaugurations & Foundation Laying",
      "National Day Celebrations (15 Aug, 26 Jan)",
      "State Functions & Official Ceremonies",
      "Public Awareness Campaigns",
      "Government Conferences & Summits",
      "Diplomatic Events & State Visits",
      "Municipal Events & Town Halls",
      "Military Parades & Police Events"
    ],
    "subEvents": [
      "Ministry Events",
      "Government Award Ceremonies",
      "Flag Hoisting Ceremonies",
      "Constitutional Day Events",
      "Voter Awareness & Scheme Launches"
    ],
    "services": [
      "Empanelled Government Event Management Vendors",
      "Public Ground & Venue Booking",
      "Stage Setup & Bulletproof Podium Services",
      "PA Sound Systems (High-Capacity Horn Trucks)",
      "Private & Government Security Coordination",
      "Barricading & Crowd Control Rigs",
      "VIP, VVIP & General Seating Arrangements",
      "Stage & Ambient Lighting",
      "LED Video Walls & Live Satellite OB Van Uplink",
      "Official Photography & Video Documentation",
      "Press Conference Setup & Media Desk",
      "VIP Protocol & Escort Services",
      "State Banquet Catering",
      "Emergency Ambulance & Fire Tender Deployment",
      "Walkie-Talkie & Satellite Comms",
      "Official Emblem & Signage Printing",
      "Helicopter Landing Pad Arrangements",
      "Metal Detectors & Scanning Gates"
    ]
  },
  {
    "id": "CAT-10",
    "slug": "charity-and-ngo-events",
    "name": "Charity & Fundraising Events",
    "shortName": "Charity & NGO Events",
    "leadTime": "1 Month to 2.5 Months",
    "scope": "HNI charity galas, donor auctions, benefit concerts, health awareness camps, and disaster relief drives.",
    "formats": [
      "NGO Fundraisers",
      "Charity Galas & Dinners",
      "Donation Drives",
      "Awareness Campaigns (Health, Environment, Education)",
      "Blood Donation & Medical Check-up Camps",
      "Social Cause Walkathons",
      "Charity Auctions",
      "Disaster Relief Events"
    ],
    "subEvents": [
      "Crowdfunding Events",
      "Benefit Concerts",
      "Art for Charity Auctions",
      "Food & Clothing Distribution Drives",
      "Orphanage & Old Age Home Support Events"
    ],
    "services": [
      "Non-Profit Event Planners",
      "Venue Providers (Sponsored / Donated)",
      "Registration & Donor Check-in",
      "Fundraising Platform & Payment Gateways",
      "Donation Collection Systems",
      "Volunteer Coordination Teams",
      "Pro-Bono Catering Services",
      "Photographers & Videographers",
      "Social Media & PR Coverage",
      "Sponsorship Coordination",
      "Celebrity Management for Appearances",
      "Auction Management Systems",
      "Audio-Visual Equipment",
      "Brochure & Banner Printing",
      "Tax Exemption (80G) Receipt Counter",
      "Medical & First Aid Stations"
    ]
  },
  {
    "id": "CAT-11",
    "slug": "fashion-and-lifestyle",
    "name": "Fashion & Lifestyle Events",
    "shortName": "Fashion & Lifestyle",
    "leadTime": "1.5 Months to 3 Months",
    "scope": "High-fashion couture runways, beauty pageants, model casting, luxury trunk shows, and brand launches.",
    "formats": [
      "Fashion Shows (Designer, Bridal, Seasonal)",
      "Beauty Pageants",
      "Model Auditions & Casting Calls",
      "Designer Showcases",
      "Lifestyle & Wellness Expos",
      "Spa & Salon Launches",
      "Fashion Week Events",
      "Trunk Shows & Pop-Up Events"
    ],
    "subEvents": [
      "Bridal Fashion Shows",
      "Kids & Plus-Size Fashion Shows",
      "Haute Couture Runway Displays",
      "Prêt-à-Porter Shows",
      "Jewelry & Accessories Showcase"
    ],
    "services": [
      "Fashion Event Producers",
      "Venue Providers (Hotels, Auditoriums, Galleries)",
      "Runway Stage & T-Walk Construction",
      "Fashion Spotlighting & Lighting Design",
      "Sound Systems & Music Directors",
      "Runway Choreographers",
      "Model Agency Casting & Coordinators",
      "Makeup Artists & Hair Stylists",
      "Backstage Dressers & Wardrobe Assistants",
      "Paparazzi & Fashion Photographers",
      "Live Streaming Services",
      "Emcee / Host Services",
      "VIP Front-Row Seating Management",
      "Red Carpet & Photobooth Setup",
      "Media PR & Influencer Management",
      "Cocktail After-Party Bartenders"
    ]
  },
  {
    "id": "CAT-12",
    "slug": "virtual-and-hybrid-events",
    "name": "Virtual & Hybrid Events",
    "shortName": "Virtual & Hybrid Events",
    "leadTime": "3 Weeks to 1.5 Months",
    "scope": "Global dual-format hybrid summits, virtual product reveals, metaverse events, and interactive webinars.",
    "formats": [
      "Virtual Conferences & Summits",
      "Webinars & Online Workshops",
      "Digital Product Launches",
      "Virtual Trade Shows & Expos",
      "Virtual Networking Events",
      "Hybrid Conferences (Physical + Virtual)",
      "Virtual Award Ceremonies",
      "Virtual Concerts & Performances"
    ],
    "subEvents": [
      "VR & AR Immersive Experiences",
      "Metaverse Brand Events",
      "Online Gaming Events",
      "Virtual Tours & Online Festivals"
    ],
    "services": [
      "Virtual Event Platform Software (Zoom, Hopin, Airmeet)",
      "Webinar & Video Streaming Tech",
      "Green Screen Studio Leasing",
      "Live Multi-Camera Stream Crew",
      "Virtual Event Producers & Tech Support",
      "3D Virtual Booth Designers",
      "Interactive Polling & Live Q&A Software",
      "Digital Content & Motion Graphics Creation",
      "Virtual Host / Emcee Services",
      "Recording & On-Demand Video Archiving",
      "High-Speed Redundant Fiber Internet",
      "Cybersecurity & Cloud Servers",
      "Virtual Gift & Digital Hamper Distribution",
      "Multi-Language Interpretation Services"
    ]
  },
  {
    "id": "CAT-13",
    "slug": "festivals-and-melas",
    "name": "Festivals & Seasonal Celebrations",
    "shortName": "Festivals & Melas",
    "leadTime": "1 Month to 2.5 Months",
    "scope": "Community festive melas, seasonal food/craft carnivals, garba nights, and traditional festival galas.",
    "formats": [
      "Religious Festivals (Diwali, Holi, Durga Puja, Eid, Christmas, Gurpurab)",
      "Harvest Festivals (Pongal, Onam, Baisakhi, Bihu)",
      "New Year Celebrations",
      "Seasonal Melas & Carnivals",
      "Food & Music Festivals",
      "Arts, Crafts & Film Festivals"
    ],
    "subEvents": [
      "Community Durga Puja Pandals",
      "Navratri Garba & Dandiya Nights",
      "Diwali Shopping Melas",
      "Christmas Carnivals",
      "Beach & Desert Festivals (Rann Utsav, Pushkar)"
    ],
    "services": [
      "Festival Organizers",
      "Pandal & Temporary Structure Builders",
      "Theme & LED Decoration Services",
      "Traditional Diyas & Decorative Lighting",
      "Sound Systems & Stage Setup",
      "Cultural Performers & Folk Dancers",
      "DJ Services",
      "Food Stalls & Regional Street Food Vendors",
      "Carnival Games & Rides",
      "Idol Makers & Craftsmen",
      "Security Bouncers & Crowd Control",
      "Sanitation & Portable Toilets",
      "Fire Safety Extinguishers & Clearances",
      "Live Streaming Services",
      "Trash Management & Cleaning Crew"
    ]
  },
  {
    "id": "CAT-14",
    "slug": "hospitality-and-travel",
    "name": "Hospitality & Travel Events",
    "shortName": "Hospitality & Travel",
    "leadTime": "1.5 Months to 3 Months",
    "scope": "Five-star hotel launches, restaurant inaugurations, gourmet tasting sessions, and travel promotion expos.",
    "formats": [
      "Hotel Openings & Launches",
      "Restaurant Launches",
      "Food Tasting Events",
      "Wine & Dine Evenings",
      "Chef's Table Experiences",
      "Culinary Competitions",
      "Tourism Promotion Events",
      "Travel Expos & Fairs"
    ],
    "subEvents": [
      "Pop-up Restaurant Events",
      "Food Truck Festivals",
      "Beer, Wine & Coffee Festivals",
      "Cooking Workshops & Mixology Battles"
    ],
    "services": [
      "Hospitality Event Planners",
      "Venue Management & Interior Theming",
      "Table Setting & Floral Styling",
      "Ambient & Mood Lighting",
      "Background Sound Systems",
      "Menu Design & Gourmet Catering",
      "Bartenders & Mixologists",
      "Sommelier Services",
      "Waitstaff & Hostesses",
      "Food Photographers & Videographers",
      "Media & Food Critic Coordination",
      "PR & Influencer Marketing",
      "Valet Parking & Escort Services",
      "Custom Invitation Boxes & Hampers"
    ]
  },
  {
    "id": "CAT-15",
    "slug": "film-and-media",
    "name": "Film & Media Events",
    "shortName": "Film & Media",
    "leadTime": "3 Weeks to 1.5 Months",
    "scope": "Celebrity film premieres, red carpet media events, trailer launches, film festivals, and award nights.",
    "formats": [
      "Film Premieres & Red Carpets",
      "Movie Screenings & Film Festivals",
      "Award Ceremonies",
      "Press Conferences & Media Meets",
      "Trailer & Music Launch Events",
      "Web Series & OTT Platform Launches"
    ],
    "subEvents": [
      "Independent Film Screenings",
      "Short Film Competitions",
      "Fan Meet-and-Greets",
      "Wrap-Up & Completion Parties"
    ],
    "services": [
      "Film Event Producers",
      "Multiplex Theater Leasing",
      "Red Carpet & Paparazzi Grid Setup",
      "Stage Design & Backdrops",
      "Lighting & Sound Systems",
      "4K Projection Equipment",
      "Celebrity Management & Security",
      "VIP Lounge Setup",
      "Priority Seating Management",
      "Press & Media Accreditation Desk",
      "Photographers & Paparazzi Grid",
      "Live Streaming Crew",
      "VIP Catering & Cocktails",
      "Luxury Car & Vanity Van Logistics",
      "PR & Social Media Marketing"
    ]
  },
  {
    "id": "CAT-16",
    "slug": "tech-and-innovation",
    "name": "Technology & Innovation Events",
    "shortName": "Tech & Innovation",
    "leadTime": "3 Weeks to 1.5 Months",
    "scope": "Overnight developer hackathons, startup pitch demo days, AI summits, gaming conventions, and tech reveals.",
    "formats": [
      "Tech Conferences & Summits",
      "Hackathons (24-48 Hours)",
      "Product Launches (Software, Apps, Hardware)",
      "Startup Pitch Events & Demo Days",
      "Developer Conferences",
      "Gaming Conventions & LAN Parties",
      "AI, Robotics & Cybersecurity Summits"
    ],
    "subEvents": [
      "Code Sprints & Bug Bounties",
      "Tech Meetups",
      "Accelerator Demo Days",
      "VR/AR Experience Zones"
    ],
    "services": [
      "Tech Event Management Agencies",
      "Co-Working / Tech Park Leasing",
      "Stage Setup & High-Tech AV Systems",
      "LED Video Walls",
      "High-Speed Redundant Fiber Internet (100+ Mbps)",
      "Continuous Power Drops & Charging Outlets",
      "Registration Software & RFID Badges",
      "Event Apps & Live Coding Rigs",
      "24/7 Technical Support Crew",
      "24/7 Catering (Healthy Snacks, Energy Drinks)",
      "Sleeping Pods & Relaxation Mats for Hackathons",
      "Mentor & Judge Panel Desks",
      "Swag Kit & Merchandise Distribution",
      "Security & Access Control"
    ]
  },
  {
    "id": "CAT-17",
    "slug": "health-and-wellness",
    "name": "Health & Wellness Events",
    "shortName": "Health & Wellness",
    "leadTime": "3 Weeks to 1.5 Months",
    "scope": "Holistic yoga retreats, medical diagnostic camps, corporate wellness drives, and fitness expos.",
    "formats": [
      "Health Camps & Medical Check-ups",
      "Yoga Retreats & Workshops",
      "Meditation & Mindfulness Sessions",
      "Fitness Challenges & Marathons",
      "Mental Health Awareness Events",
      "Wellness Expos",
      "Medical Conferences (CME)",
      "Blood Donation Drives"
    ],
    "subEvents": [
      "Corporate Wellness Programs",
      "Zumba & Fitness Events",
      "Alternative Medicine & Ayurveda Expos",
      "Diagnostic Screening Camps"
    ],
    "services": [
      "Health Event Organizers",
      "Medical Professionals (Doctors, Nurses, Paramedics)",
      "Venue Providers (Wellness Resorts, Parks)",
      "Registration & Health Data Portals",
      "Diagnostic Medical Equipment Rentals",
      "Yoga Instructors & Fitness Coaches",
      "Guided Meditation Sound Systems",
      "Seating & Yoga Mat Grid Distribution",
      "Organic Detox Catering & Juice Bars",
      "First Aid & Ambulance On-Site",
      "Health Education Pamphlets",
      "Sanitization & Waste Disposal"
    ]
  },
  {
    "id": "CAT-18",
    "slug": "community-events",
    "name": "Community & Neighborhood Events",
    "shortName": "Community Events",
    "leadTime": "2 Weeks to 1 Month",
    "scope": "Residential society annual days, neighborhood flea markets, block parties, RWA meets, and local talent fests.",
    "formats": [
      "Society Events & Annual Days",
      "Neighborhood Festivals",
      "Community Gatherings",
      "Resident Welfare Association (RWA) Events",
      "Clean-up & Tree Plantation Drives",
      "Local Talent Shows",
      "Flea Markets & Block Parties"
    ],
    "subEvents": [
      "Housing Society Festive Celebrations",
      "Children's & Senior Citizen Days",
      "Women's Day Celebrations",
      "Independence & Republic Day Society Functions"
    ],
    "services": [
      "Community Event Coordinators",
      "Venue Setup (Society Parks, Grounds)",
      "Simple Theme Decorators",
      "PA Sound Systems & Mics",
      "Local DJ & Emcee Hosts",
      "Inflatable Bounce Castles for Kids",
      "Buffet Dinner / Potluck Catering",
      "Trophy & Certificate Suppliers",
      "Event Photographers",
      "Security & Parking Management",
      "Trash Segregation & Waste Bins"
    ]
  },
  {
    "id": "CAT-19",
    "slug": "agricultural-and-rural",
    "name": "Agricultural & Rural Events",
    "shortName": "Agricultural & Rural",
    "leadTime": "1 Month to 2.5 Months",
    "scope": "Regional agricultural trade fairs, farmer melas, livestock shows, tractor demos, and rural machinery expos.",
    "formats": [
      "Agricultural Fairs (Krishi Melas)",
      "Farmers' Markets",
      "Livestock Shows & Competitions",
      "Agricultural Training Workshops",
      "Organic Farming Events",
      "Agricultural Equipment Expos",
      "Dairy & Poultry Expos"
    ],
    "subEvents": [
      "Kisan Diwas Celebrations",
      "Farm Produce Festivals",
      "Tractor & Machinery Demonstrations",
      "Rural Traditional Crafts Fairs"
    ],
    "services": [
      "Rural Event Specialists",
      "Venue Booking (Open Fields, Village Grounds)",
      "Tent & Canopy Builders",
      "Exhibition Stall Fabrication",
      "Heavy Machinery Display Ramps",
      "High-Power Horn PA Speakers",
      "Animal Pens & Fencing",
      "Bilingual Signage & Banners",
      "Regional Local Caterers",
      "Veterinary Doctors On-Site",
      "First Aid Stations",
      "Government Liaison Services"
    ]
  },
  {
    "id": "CAT-20",
    "slug": "automotive-events",
    "name": "Automotive Events",
    "shortName": "Automotive Events",
    "leadTime": "1.5 Months to 3 Months",
    "scope": "Automotive vehicle unveils, track test drive days, auto expos, vintage rallies, and EV technology shows.",
    "formats": [
      "Auto Expos & Motor Shows",
      "New Vehicle Launches",
      "Test Drive Events",
      "Car & Bike Rallies",
      "Racing & Track Days",
      "Vintage Car Shows",
      "Electric Vehicle (EV) Expos",
      "Auto Parts & Accessories Expos"
    ],
    "subEvents": [
      "Custom Car Shows",
      "Off-Road Vehicle Rallies",
      "Automotive Tech Conferences",
      "Track Driving Workshops"
    ],
    "services": [
      "Automotive Event Management Agencies",
      "Venue Booking (Exhibition Centers, Race Tracks)",
      "Vehicle Display Platforms & Turntables",
      "Car Unveil Silk Rigs",
      "High-CRI Spotlighting & LED Walls",
      "Test Drive Track Setup & Safety Cones",
      "Track Safety Marshals",
      "Emergency Trauma Ambulance",
      "Velvet Rope Stanchions & Lounges",
      "PR Media & Press Desk",
      "Photographers & Aerial Drone Operators",
      "Flatbed Vehicle Transporters"
    ]
  }
];


/* ------------------------------------------------------------------ */
/* Lookup                                                              */
/* ------------------------------------------------------------------ */

export const getCategory = (idOrSlug: string): TaxonomyCategory | undefined =>
  TAXONOMY.find((c) => c.id === idOrSlug || c.slug === idOrSlug);

/* ------------------------------------------------------------------ */
/* 1) CHANGE VENDOR POSITIONS HERE                                     */
/*                                                                     */
/* For each category, list keywords of the services you want FIRST,    */
/* in the order you want them. Everything else keeps the sheet order.  */
/* A keyword matches any service whose name contains it.               */
/* ------------------------------------------------------------------ */

export const SERVICE_PRIORITY: Record<string, string[]> = {
  "CAT-01": ["planner", "venue", "decor", "cater", "photograph", "makeup", "mehandi", "dj"],
  "CAT-02": ["event planners", "venue", "audio-visual", "stage", "catering"],
  "CAT-03": ["planner", "decor", "cater", "photograph", "dj"],
  // "CAT-05": ["sound", "lighting", "stage"],
};

const norm = (s: string) =>
  s.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim();

/** Services of a category with your priority keywords moved to the front. */
export function orderedServices(categoryId: string): string[] {
  const cat = getCategory(categoryId);
  if (!cat) return [];
  const wanted = (SERVICE_PRIORITY[cat.id] ?? []).map(norm);
  const pinned: string[] = [];
  for (const key of wanted) {
    const hit = cat.services.find((s) => !pinned.includes(s) && norm(s).includes(key));
    if (hit) pinned.push(hit);
  }
  return [...pinned, ...cat.services.filter((s) => !pinned.includes(s))];
}

/* ------------------------------------------------------------------ */
/* 2) MATCH A VENDOR'S OWN SERVICE LABEL TO A TAXONOMY SERVICE         */
/*    ("Photography" -> "Photographers & Videographers")              */
/* ------------------------------------------------------------------ */

const STOP = new Set(["and", "services", "service", "providers", "provider", "the", "of", "for", "a", "rental"]);
const stems = (s: string) =>
  norm(s)
    .split(" ")
    .filter((w) => w && !STOP.has(w))
    .map((w) => (w.length > 3 ? w.slice(0, 5) : w.replace(/s$/, ""))); // photographers / photography -> "photo", djs -> "dj"

/** Index of the best matching service in `services`, or -1. */
export function matchServiceIndex(services: string[], vendorService: string): number {
  const v = new Set(stems(vendorService));
  if (v.size === 0) return -1;
  let best = -1;
  let bestScore = 0;
  services.forEach((svc, i) => {
    let score = 0;
    for (const w of stems(svc)) if (v.has(w)) score++;
    if (score > bestScore) { best = i; bestScore = score; }
  });
  return best;
}

type ServiceGetter<T> = (vendor: T) => string | string[] | null | undefined;
const asList = (x: string | string[] | null | undefined) =>
  Array.isArray(x) ? x : x ? [x] : [];

/** Lowest position of any of the vendor's services inside this category (Infinity = not a fit). */
export function vendorPosition<T>(vendor: T, categoryId: string, getService: ServiceGetter<T>): number {
  const services = orderedServices(categoryId);
  let pos = Infinity;
  for (const label of asList(getService(vendor))) {
    const i = matchServiceIndex(services, label);
    if (i !== -1 && i < pos) pos = i;
  }
  return pos;
}

/* ------------------------------------------------------------------ */
/* 3) USE IT                                                           */
/* ------------------------------------------------------------------ */

/** Only vendors that fit the category, ordered by their position in it. */
export function vendorsForCategory<T>(vendors: T[], categoryId: string, getService: ServiceGetter<T>): T[] {
  return vendors
    .map((v, i) => ({ v, i, pos: vendorPosition(v, categoryId, getService) }))
    .filter((x) => x.pos !== Infinity)
    .sort((a, b) => a.pos - b.pos || a.i - b.i)
    .map((x) => x.v);
}

/** Same ordering but keeps unmatched vendors at the end instead of dropping them. */
export function sortVendorsForCategory<T>(vendors: T[], categoryId: string, getService: ServiceGetter<T>): T[] {
  return vendors
    .map((v, i) => ({ v, i, pos: vendorPosition(v, categoryId, getService) }))
    .sort((a, b) => a.pos - b.pos || a.i - b.i)
    .map((x) => x.v);
}

/** Sections for an event page: one group per service, in order, then "Other vendors". */
export function groupVendorsByService<T>(vendors: T[], categoryId: string, getService: ServiceGetter<T>) {
  const services = orderedServices(categoryId);
  const groups = services.map((service) => ({ service, vendors: [] as T[] }));
  const other: T[] = [];
  for (const v of vendors) {
    let placed = false;
    for (const label of asList(getService(v))) {
      const i = matchServiceIndex(services, label);
      if (i !== -1) { groups[i].vendors.push(v); placed = true; break; }
    }
    if (!placed) other.push(v);
  }
  const sections = groups.filter((g) => g.vendors.length > 0);
  if (other.length) sections.push({ service: "Other vendors", vendors: other });
  return sections;
}