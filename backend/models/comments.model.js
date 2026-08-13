import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
    postId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Post",
    },

    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
    },

    body : {
        type : String,
        required : true
    },

});

const Comment = mongoose.model("Comment", CommentSchema);

export default Comment;