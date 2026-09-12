import { Router, type IRouter } from "express";
import healthRouter from "./health";
import stripsRouter from "./strips";

const router: IRouter = Router();

router.use(healthRouter);
router.use(stripsRouter);

export default router;
