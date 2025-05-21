import {Router} from 'express';
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
} from "../controllers/comment.controller.js";
import { verifyJWT } from '../middlewares/auth.middleware.js';
const router=Router();

router.use(verifyJWT,upload.none());

router.route("/:videoID").get(getVideoComments).post(addComment);
router.route("/c/:commentsID").delete(deleteComment).patch(updateComment);

export default router;


