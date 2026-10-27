/**
 * Shared vendor types. There is no sample vendor data in this app any more:
 * every vendor on the customer pages comes from Supabase (see src/lib/liveVedors.ts).
 */
export type PortfolioMediaType = "photo" | "video" | "story" | "reel";

export interface PortfolioItem {
  imageUrl?: string;
  image?: string;
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