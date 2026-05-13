import { Router, type IRouter } from "express";
import healthRouter from "./health";
import weatherRouter from "./weather";
import newsRouter from "./news";
import todosRouter from "./todos";
import quoteRouter from "./quote";
import focusRouter from "./focus";
import budgetRouter from "./budget";

const router: IRouter = Router();

router.use(healthRouter);
router.use(weatherRouter);
router.use(newsRouter);
router.use(todosRouter);
router.use(quoteRouter);
router.use(focusRouter);
router.use(budgetRouter);

export default router;
