import { Router, type IRouter } from "express";
import healthRouter from "./health";
import boardpassphRouter from "./boardpassph";

const router: IRouter = Router();

router.use(healthRouter);
router.use(boardpassphRouter);

export default router;
