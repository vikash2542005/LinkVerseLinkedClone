import {Router} from "express";
import { activeCheck , commentPost, createPost, deleteCommentOfUser, deletePost, getAllPosts, getCommentByPost, incrementLikes} from "../controllers/posts.controller.js";
import multer from "multer";

const router = Router();

const storage = multer.diskStorage({
    destination : (req, file, cb) =>{
        cb(null, 'uploads/')
    },
    filename : (req, file, cb)=>{
        cb(null, file.originalname)
    },
});

const upload = multer({storage : storage});

router.route("/").get(activeCheck);
router.route("/post").post(upload.single('media'), createPost);
router.route("/get_all_post").get(getAllPosts);
router.route("/delete_post").post(deletePost);
router.route("/comment_post").post(commentPost);
router.route("/get_comment_by_post").get(getCommentByPost);
router.route("/delete_comment_of_user").delete(deleteCommentOfUser);
router.route("/increment_likes").post(incrementLikes);


export default router;