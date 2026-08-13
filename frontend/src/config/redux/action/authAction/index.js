import { createAsyncThunk } from "@reduxjs/toolkit";
import { clientServer } from "../../../";

export const loginUser = createAsyncThunk(
  "user/login",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post("/login", {
        email: user.email,
        password: user.password,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      } else {
        return thunkAPI.rejectWithValue({
          message: "token not provided",
        });
      }

      return thunkAPI.fulfillWithValue(response.data.token);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || { message: "Login failed" },
      );
    }
  },
);

export const registerUser = createAsyncThunk(
  "user/register",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post("/register", {
        name: user.name,
        username: user.username,
        email: user.email,
        password: user.password,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || { message: "Registration failed" },
      );
    }
  },
);

export const getAboutUser = createAsyncThunk(
  "user/getAboutUser",
  async (user, thunkAPI) => {
    try {
      const token = user?.token || localStorage.getItem("token");
      if (!token) {
        return thunkAPI.rejectWithValue({ message: "token is required" });
      }

      const response = await clientServer.get("/get_user_and_profile", {
        params: { token },
      });
      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || { message: "Failed to fetch profile" },
      );
    }
  },
);

export const getAllUsers = createAsyncThunk(
  "user/getAllUsers",
  async (_, thunkAPI) => {
    try {
      const response = await clientServer.get("/get_all_user_profiles");
      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || { message: "Failed to fetch profile" },
      );
    }
  },
);

export const sendConnectionRequest = createAsyncThunk(
  "user/sendConnectionRequest",
  async (payload, thunkAPI) => {
    try {
      const token = payload?.token || localStorage.getItem("token");
      const connectionId = payload?.user_id || payload?.connectionId;

      const response = await clientServer.post(
        "/user/send_connection_request",
        {
          token,
          connectionId,
        },
      );

thunkAPI.dispatch(getConnectionsRequest({ token }));
      thunkAPI.dispatch(getIncomingConnectionRequests({ token }));

      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || { message: "Failed to send connection request" },
      );
    }
  },
);

export const getConnectionsRequest = createAsyncThunk(
  "user/getConnectionsRequest",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.get("/user/get_connection_request", {
        params: {
          token: user.token || localStorage.getItem("token"),
        },
      });

      return thunkAPI.fulfillWithValue(response.data);

    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || {
          message: "Failed to fetch connection requests",
        },
      );
    }
  },
);

export const getIncomingConnectionRequests = createAsyncThunk(
  "user/getIncomingConnectionRequests",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.get(
        "/user/user_connection_request",
        {
          params: {
            token: user?.token || localStorage.getItem("token"),
          },
        },
      );

      return thunkAPI.fulfillWithValue(response.data);

    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || {
          message: "Failed to fetch incoming connection requests",
        },
      );
    }
  },
);

export const acceptConnectionRequest = createAsyncThunk(
  "user/acceptConnectionRequest",
  async (user, thunkAPI) => {
    try {
const token = user?.token || localStorage.getItem("token");
      const response = await clientServer.post(
        "/user/accept_connection_request",
        {
          token,
          requestId: user.connectionId,
          action_type: user.action_type,
        },
      );
      thunkAPI.dispatch(getConnectionsRequest({ token }));
      thunkAPI.dispatch(getIncomingConnectionRequests({ token }));
      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || {
          message: "Failed to accept connection request",
        },
      );
    }
  },
);
