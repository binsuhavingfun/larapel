import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import stripsRouter from "./strips.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(stripsRouter);

export default router;
