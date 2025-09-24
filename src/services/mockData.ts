import { Event, Ticket, User } from "@/types";

// Generate a random date within a range
const getRandomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Generate mock events
export const mockEvents: Event[] = Array.from({ length: 15 }, (_, i) => {
  const id = `event-${i + 1}`;
  const capacity = Math.floor(Math.random() * 150) + 50;
  const availableTickets = Math.floor(Math.random() * (capacity / 2));
  const date = getRandomDate(new Date(2024, 0, 1), new Date());

  const categories = ["Music", "Sports", "Academic", "Cultural", "Workshop"];
  const category = categories[Math.floor(Math.random() * categories.length)];

  const locations = ["Main Auditorium", "Sports Complex", "Lecture Hall", "Open Field", "Conference Room"];
  const location = locations[Math.floor(Math.random() * locations.length)];

  return {
    id,
    title: `Event ${i + 1}`,
    descriptionShort: `Short description for event ${i + 1}`,
    descriptionLong: `This is a detailed description for event ${i + 1}. It contains all the important details about the event.`,
    description: `This is a detailed description for event ${i + 1}. It contains all the important details about the event.`,
    date: date.toISOString(),
    time: `${Math.floor(Math.random() * 12 + 1)}:00 ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
    location,
    imageUrl: `/placeholder.svg`,
    image: `/placeholder.svg`,
    availableTickets,
    capacity,
    price: (Math.floor(Math.random() * 10) + 1) * 500,
    organizer: `Organizer ${Math.floor(Math.random() * 5) + 1}`,
    category,
    currency: "NGN",
    isPublished: true,
    featured: Math.random() > 0.7,
    createdAt: new Date(date.getTime() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    updatedAt: new Date(date.getTime() - 1000 * 60 * 60 * 24 * 15).toISOString(),
  };
});

// Generate mock users (now called customers)
export const mockUsers: User[] = Array.from({ length: 20 }, (_, i) => {
  const id = `customer-${i + 1}`;
  const departments = ["Computer Science", "Engineering", "Law", "Business Admin", "Medicine", "Arts"];
  const role = i < 2 ? "admin" : "customer";

  return {
    id,
    name: `Customer ${i + 1}`,
    email: `customer${i + 1}@example.com`,
    department: departments[Math.floor(Math.random() * departments.length)],
    role: role as 'customer' | 'admin',
    customerId: `CUS${100000 + i}`,
    phone: `+2348${Math.floor(Math.random() * 100000000)}`,
    createdAt: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
  };
});

// Generate mock tickets ensuring seat uniqueness & capacity limits
export const mockTickets: Ticket[] = [];

mockEvents.forEach(event => {
  const ticketsForEvent = Math.floor(Math.random() * event.capacity); // ensure tickets ≤ capacity
  const assignedSeats = new Set<string>();

  for (let i = 0; i < ticketsForEvent; i++) {
    const user = mockUsers[Math.floor(Math.random() * mockUsers.length)];
    const ticketTypes = ["standard", "vip", "earlybird"];
    const ticketType = ticketTypes[Math.floor(Math.random() * ticketTypes.length)];

    // Generate a unique seat (optional)
    let seat: string | undefined;
    if (Math.random() > 0.3) {
      let attempts = 0;
      do {
        seat = `R${Math.floor(Math.random() * 10) + 1}S${Math.floor(Math.random() * 20) + 1}`;
        attempts++;
      } while (assignedSeats.has(seat) && attempts < 50);
      assignedSeats.add(seat);
    }

    // Random purchase date before event
    const purchaseDate = getRandomDate(
  new Date(new Date(event.date).setDate(new Date(event.date).getDate() - 14)),
  new Date(event.date)
);


    mockTickets.push({
      id: `ticket-${mockTickets.length + 1}`,
      eventId: event.id,
      userId: user.id,
      purchaseDate: purchaseDate.toISOString(),
      status: (["active", "used", "cancelled"] as const)[ Math.floor(Math.random() * 3)
],

      ticketType: ticketType as "standard" | "vip" | "earlybird",
      price: (event.price || 0) * (ticketType === "vip" ? 2 : ticketType === "earlybird" ? 0.8 : 1),
      seat,
    });
  }
});
