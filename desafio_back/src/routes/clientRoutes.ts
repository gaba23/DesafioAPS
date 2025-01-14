import { Router } from "express";
import validate from "../middlewares/validate";
import { clientSchema } from "../schemas/clientSchema";
import { getClients, createClient, updateClient, deleteClient } from "../controllers/clientController";

const router = Router();

router.get("/", getClients);
router.post("/", validate(clientSchema), createClient);
router.put("/:id", validate(clientSchema), updateClient);
router.delete("/:id", deleteClient);

export default router;
