import { clientServer } from "@/config";
import { createAsyncThunk } from "@reduxjs/toolkit";


export const getAllPosts = createAsyncThunk(
    "post/getAllPosts",
    async (_,thunkAPI) =>{
        try{
            const response = await clientServer.get('/get_all_post');

            return thunkAPI.fulfillWithValue(response.data);

        }catch(err){
            return thunkAPI.rejectWithValue(err.response.data);
        }
    }
)

export const createPost = createAsyncThunk(
    "post/createPost",
    async(userData, thunkAPI) => {
        const {file, body} = userData;
        try{

            const formData = new FormData();
            formData.append('token', localStorage.getItem('token'));
            formData.append('body', body);
            formData.append('media', file);


            const response = await clientServer.post("/post", formData, {
                headers : {
                    'Content-Type' : 'multipart/form-data'
                }
            });

            if(response.status === 200){
                return thunkAPI.fulfillWithValue("Post Uploaded Successfully");
            }else{
                return thunkAPI.rejectWithValue("Post Not Uploaded");

            }

        }catch(err){
            return thunkAPI.rejectWithValue(err.response.data);
        }
    }
)

export const deletePost = createAsyncThunk(
    "post/deletePost",
    async (post_id, thunkAPI) =>{
        try{
            const response = await clientServer.post("/delete_post", {
                token : localStorage.getItem("token"),
                post_id : post_id.post_id
            });

                return thunkAPI.fulfillWithValue(response.data);

        }catch(err){
            return thunkAPI.rejectWithValue(err.response.data);
          
        }
    }
)

export const  incrementLike = createAsyncThunk(
    "post/incrementPostLike",
    async (user, thunkAPI) => {

       try{
         const response = await clientServer.post("/increment_likes", {
            token : localStorage.getItem("token"),
            post_id : user.post_id
        });
            return thunkAPI.fulfillWithValue(response.data);
       }
       catch(err){
        return thunkAPI.rejectWithValue(err.response.data);
       }
        
    }
);

export const addComment = createAsyncThunk(
    "post/addComment",
    async (commentData, thunkAPI) => {
        try{
            const response = await clientServer.post("/comment_post", {
                token : localStorage.getItem("token"),
                post_id : commentData?.post_id,
                comment : commentData?.comment
            });

            return thunkAPI.fulfillWithValue({
                post_id : commentData?.post_id,
                message : response.data?.message ?? "Comment added"
            });

        }
        catch(err){
            return thunkAPI.rejectWithValue(err.response?.data ?? err.message);
        }
    }
)

export const deleteComment = createAsyncThunk(
    "post/deleteComment",
    async (commentData, thunkAPI) => {
        try{
            const response = await clientServer.delete("/delete_comment_of_user", {
                data : {
                    token : localStorage.getItem("token"),
                    post_id : commentData?.post_id,
                    comment_id : commentData?.comment_id
                }
            });

            return thunkAPI.fulfillWithValue({
                post_id : commentData?.post_id,
                comment_id : commentData?.comment_id,
                message : response.data?.message ?? "Comment deleted"
            });

        }
        catch(err){
            return thunkAPI.rejectWithValue(err.response?.data ?? err.message);
        }
    }
)

export const getAllComments = createAsyncThunk(
    "post/getAllComments",
    async (postData, thunkAPI) => {
        try{
            const response = await clientServer.get("/get_comment_by_post", {
                params : {
                    post_id : postData?.post_id
                }
            });

            return thunkAPI.fulfillWithValue({
                post_id : postData?.post_id,
                comments : response.data?.comments ?? []
            });

        }
        catch(err){
            return thunkAPI.rejectWithValue(err.response?.data ?? err.message);
        }
    }
)