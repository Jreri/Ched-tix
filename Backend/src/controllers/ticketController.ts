import { Request, Response } from "express";

let tickets: { id: number; title: string }[] = [
  { id: 1, title: "Concert A" },
  { id: 2, title: "Concert B" }
];

export const getTickets = (req: Request, res: Response) => {
  res.json(tickets);
};

export const createTicket = (req: Request, res: Response) => {
  const { title } = req.body;
  const newTicket = { id: tickets.length + 1, title };
  tickets.push(newTicket);
  res.status(201).json(newTicket);
};
