import { Event } from "@/types";

export const getEvents = (): Event[] => {
  const stored = localStorage.getItem("events");
  return stored ? JSON.parse(stored) : [];
};

export const saveEvents = (events: Event[]) => {
  localStorage.setItem("events", JSON.stringify(events));
};

export const findEventById = (id: string): Event | undefined => {
  return getEvents().find(e => e.id === id);
};

export const updateEvent = (updated: Event) => {
  const events = getEvents();
  const index = events.findIndex(e => e.id === updated.id);
  if (index >= 0) events[index] = updated;
  else events.push(updated);
  saveEvents(events);
};

export const deleteEvent = (id: string) => {
  const events = getEvents().filter(e => e.id !== id);
  saveEvents(events);
};
