import { Router } from "express";
import { getTickets, createTicket } from "../controllers/ticketController";
import { protect } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/roleMiddleware";

const router = Router();

router.get("/", protect, getTickets);
router.post("/", protect, requireRole("admin"), createTicket);

export default router;
