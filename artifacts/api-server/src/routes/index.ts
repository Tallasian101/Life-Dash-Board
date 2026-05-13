import { Router, type IRouter } from "express";
import healthRouter from "./health";
import weatherRouter from "./weather";
import newsRouter from "./news";
import todosRouter from "./todos";
import quoteRouter from "./quote";

const router: IRouter = Router();

router.use(healthRouter);
router.use(weatherRouter);
router.use(newsRouter);
router.use(todosRouter);
router.use(quoteRouter);

export default router;
