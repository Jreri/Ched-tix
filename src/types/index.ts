export interface TicketTier {
  id: string;
  name: string;
  price: number;
  description?: string;
  capacity?: number | null;
  availableCount?: number | null;
}

export interface Event {
  id: string;
  title: string;
  date: string | null;
  time: string | null;
  location: string | null;
  imageUrl: string | null;
  price: number | null;
  capacity: number | null;
  availableTickets: number | null;
  descriptionShort: string | null;
  descriptionLong: string | null;
  isPublished: boolean;
  category: string | null;
  currency: string | null;
  ticketTiers?: TicketTier[] | null;
  organizer?: string;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
  image?: string;
  description?: string;
}

export interface Ticket {
  id: string;
  eventId: string;
  userId: string;
  purchaseDate: string | null;
  status: 'active' | 'used' | 'cancelled';
  price: number | null;
  ticketType: string | null;
  qrCode?: string | null;
  tierName?: string | null;
  seat?: string;
}

export interface User {
  id: string;
  email: string | null;
  name: string | null;
  role: 'customer' | 'admin' | null;
  createdAt: string | null;
  phone?: string | null;
  ticketType?: string | null;
  department?: string | null;
  customerId?: string | null;
}
