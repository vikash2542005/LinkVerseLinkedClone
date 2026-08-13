import { createSlice } from "@reduxjs/toolkit"
import {
    getAboutUser,
    getAllUsers,
    loginUser,
    registerUser,
    sendConnectionRequest,
    getConnectionsRequest,
    getIncomingConnectionRequests,
    acceptConnectionRequest,
} from "../../action/authAction/index.js"



const initialState = {
    user : undefined,
    isError : false,
    isSuccess : false,
    isLoading : false,
    loggedIn : false,
    isTokenThere : false,
    message : "",
    profileFetched : false,
    connections : [],
    connectionRequest : [],
    all_users : [],
    all_profiles_fetched: false
}

const authSlice = createSlice({
    name : "auth",
    initialState,
    reducers : {
        reset : () =>initialState,
        handleLoginUser : (state)=>{
            state.message = "hello"
        },
        empteyMessage : (state)=>{
            state.message = ""
        },
        setTokenIsThere : (state)=>{
            state.isTokenThere =true
        },
        setTokenIsNotThere : (state) =>{
            state.isTokenThere = false
        }
    },

    extraReducers : (builder) => {
        builder
        .addCase(loginUser.pending, (state) => {
            state.isLoading = true,
            state.message ="knocking the door..."
        })
        .addCase(loginUser.fulfilled, (state, action)=>{
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = true;
            state.loggedIn = true;
            state.message = "Login is successful";
        })
        .addCase(loginUser.rejected, (state, action)=>{
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload;
        })

        .addCase(registerUser.pending, (state)=>{
            state.isLoading = true,
            state.message ="Registering you..."
        })
        .addCase(registerUser.fulfilled, (state, action)=>{
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = true;
            state.loggedIn = false;
            state.message = {
                message : "Register is successful, Please Login"
            }
        })
        .addCase(registerUser.rejected, (state, action)=>{
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload;
        })
        .addCase(getAboutUser.pending, (state)=>{
            state.isLoading = true,
            state.isError = false,
            state.profileFetched = false
        })
        .addCase(getAboutUser.fulfilled, (state, action)=>{
            state.isLoading = false,
            state.isError = false,
            state.profileFetched = true,
            state.user = action.payload?.profile || null,
            state.message = "";

        })
        .addCase(getAboutUser.rejected, (state, action)=>{
            state.isLoading = false,
            state.isError = true,
            state.profileFetched = false,
            state.user = undefined,
            state.message = action.payload?.message || "Failed to load your profile";
        })
        .addCase(getAllUsers.fulfilled, (state, action)=>{
            state.isLoading = false,
            state.isError = false,
            state.all_profiles_fetched = true,
            state.all_users = action.payload.profiles
        })
        .addCase(getConnectionsRequest.fulfilled, (state, action)=>{
            state.isLoading = false;
            state.isError = false;
            const payload = Array.isArray(action.payload)
                ? action.payload
                : action.payload?.connections || action.payload?.connectionRequest || [];
            state.connections = payload;
            state.connectionRequest = payload;
        })
.addCase(getConnectionsRequest.rejected, (state, action)=>{
            state.isLoading = false,
            state.isError = true,
            state.connections = [],
            state.message = action.payload?.message || "Failed to fetch connections",
            state.connectionRequest = []
        })
        .addCase(getIncomingConnectionRequests.fulfilled, (state, action)=>{
            state.isLoading = false;
            state.isError = false;
            const payload = Array.isArray(action.payload)
                ? action.payload
                : action.payload?.connections || action.payload?.connectionRequest || [];
            state.connectionRequest = payload;
        })
        .addCase(getIncomingConnectionRequests.rejected, (state, action)=>{
            state.isLoading = false,
            state.isError = true,
            state.connectionRequest = [],
            state.message = action.payload?.message || "Failed to fetch incoming connection requests"
        })
.addCase(acceptConnectionRequest.fulfilled, (state, action)=>{
            state.isLoading = false;
            state.isError = false;
            state.message = action.payload?.message || "Request updated";
        })
        .addCase(acceptConnectionRequest.rejected, (state, action)=>{
            state.isLoading = false,
            state.isError = true,
            state.message = action.payload?.message || "Failed to fetch connection requests"
        })

    }
})

export const {reset, empteyMessage, setTokenIsThere, setTokenIsNotThere} =authSlice.actions

export default authSlice.reducer