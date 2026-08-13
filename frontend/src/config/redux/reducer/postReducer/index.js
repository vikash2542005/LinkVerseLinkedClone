import { createSlice } from "@reduxjs/toolkit"
import { reset } from "../authReducer"
import { addComment, deleteComment, getAllComments, getAllPosts } from "../../action/postAction"






const initialState = {
    posts : [],
    isError : false,
    postFetched : false,
    isLoading : false,
    loggedIn : false,
    message : "",
    profileFetched : false,
    comments : [],
    postId : "",
}

const postslice = createSlice({
    name : "post",
    initialState ,
    reducers : {
        reset : ()=> initialState,
        resetPostId : (state) =>{
            state.postId = ""
        },
    },

    extraReducers : (builder) => {
        builder
        .addCase(getAllPosts.pending, (state)=>{
            state.isLoading = true
            state.message = "Fetching All the Posts..."
        })
        .addCase(getAllPosts.fulfilled, (state, action)=>{
            state.isLoading = false
            state.isError = false
            state.postFetched = true
            const data = action.payload?.posts ?? action.payload
            state.posts = Array.isArray(data) ? [...data].reverse() : []

        })
        .addCase(getAllPosts.rejected, (state,action)=>{
            state.isLoading = false
            state.isError = true
            state.message = action.payload
        })
        .addCase(getAllComments.pending, (state)=>{
            state.isLoading = true
            state.message = "Fetching comments..."
        })
        .addCase(getAllComments.fulfilled, (state, action)=>{
            state.isLoading = false
            state.isError = false
            state.postId = action.payload.post_id
            state.comments = action.payload.comments
        })
        .addCase(getAllComments.rejected, (state, action)=>{
            state.isLoading = false
            state.isError = true
            state.message = action.payload
        })
        .addCase(addComment.pending, (state)=>{
            state.isLoading = true
            state.message = "Adding comment..."
        })
        .addCase(addComment.fulfilled, (state, action)=>{
            state.isLoading = false
            state.isError = false
            state.message = action.payload.message
        })
        .addCase(addComment.rejected, (state, action)=>{
            state.isLoading = false
            state.isError = true
            state.message = action.payload
        })
        .addCase(deleteComment.pending, (state)=>{
            state.isLoading = true
            state.message = "Deleting comment..."
        })
        .addCase(deleteComment.fulfilled, (state, action)=>{
            state.isLoading = false
            state.isError = false
            state.message = action.payload.message
        })
        .addCase(deleteComment.rejected, (state, action)=>{
            state.isLoading = false
            state.isError = true
            state.message = action.payload
        })
    }

})

export default postslice.reducer