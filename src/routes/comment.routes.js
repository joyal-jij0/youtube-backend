import { Router } from "express"
import {addComment, deleteComment, delteComment, getVideoComments, updateComment} from "../controllers/comment.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

router.use(verifyJWT);

router.route(":/videoId").get(getVideoComments).post(addComment);
router.route("/c/:commentId").delete(delteComment).patch(updateComment);

export default router