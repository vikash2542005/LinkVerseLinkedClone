import React, { useEffect } from "react";
import UserLayout from "@/layout/UserLayout";
import { DashboardLayout } from "@/layout/DashboardLayout";
import styles from "./my_connectionsStyle.module.css";
import { useDispatch, useSelector } from "react-redux";
import { acceptConnectionRequest, getConnectionsRequest, getIncomingConnectionRequests } from "@/config/redux/action/authAction/index.js";
import { BASE_URL } from "@/config/index.jsx";
import { useRouter } from "next/router";

const MyConnectionsPage = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    dispatch(getIncomingConnectionRequests({ token }));
    dispatch(getConnectionsRequest({ token }));
  }, []);

  useEffect(() => {
    console.log(
      "[MyConnections] connectionRequest =",
      authState.connectionRequest,
    );
  }, [authState.connectionRequest]);

  useEffect(() => {
    if (authState.connectionRequest?.length > 0) {
      console.log("[MyConnections] has requests:", authState.connectionRequest);
    }
  }, [authState.connectionRequest]);

  useEffect(() => {
    if (authState.isError) {
      console.log("[MyConnections] auth error:", authState.message);
    }
  }, [authState.isError, authState.message]);

  useEffect(() => {
    console.log("[MyConnections] authState keys:", Object.keys(authState));
  }, []);

  const incomingRequests = authState.connectionRequest ?? [];
  const outgoingRequests = authState.connections ?? [];

  const pendingRequests = incomingRequests.filter(
    (connection) => connection.status_accepted === null,
  );

  const acceptedIncoming = incomingRequests.filter(
    (connection) => connection.status_accepted === true,
  );
  const acceptedOutgoing = outgoingRequests.filter(
    (connection) => connection.status_accepted === true,
  );

  const networkItems = [
    ...acceptedIncoming.map((connection) => ({
      user: connection.userId,
      key: connection._id,
    })),
    ...acceptedOutgoing.map((connection) => ({
      user: connection.connectionId,
      key: connection._id,
    })),
  ];

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.Container}>
          <h1>My Connections</h1>

          {pendingRequests.length > 0 ? (
            pendingRequests.map((user) => (
              <div
                onClick={() => {
                  router.push(`/view_profile/${user.userId.username}`);
                }}
                key={user._id}
                className={styles.userCard}
              >
                <img
                  src={`${BASE_URL}/${user.userId?.profilePicture}`}
                  alt=""
                />

                <div className={styles.userInfo}>
                  <p>
                    {user.userId?.name ||
                      user.connectionId?.name ||
                      "Unknown user"}
                  </p>
                  <p>
                    {user.userId?.username || user.connectionId?.username || ""}
                  </p>
                </div>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className={styles.userActions}
                >
                  <button onClick={()=>{
                    dispatch(acceptConnectionRequest({
                      connectionId : user._id,
                      token : localStorage.getItem("token"),
                      action_type : "accept"
                    }))
                    }} className={styles.acceptButton}>Accept</button>
                  <button className={styles.rejectButton}>Reject</button>
                </div>
              </div>
            ))
          ) : (
            <p>No connection requests yet.</p>
          )}
        </div>


        <div className={styles.Container}>
          <h1>My NetWork</h1>

          {networkItems.length > 0 ? (
            networkItems.map((item) => {
              const user = item.user;
              return (
                <div
                onClick={() => {
                  router.push(`/view_profile/${user.username}`);
                }}
                key={item.key}
                className={styles.userCard}
              >
                <img
                  src={`${BASE_URL}/${user?.profilePicture}`}
                  alt=""
                />

                <div className={styles.userInfo}>
                  <p>{user?.name || "Unknown user"}</p>
                  <p>{user?.username || ""}</p>
                </div>
              </div>
            );
          })
        ) : (
          <p>No Network yet.</p>
        )}
        </div>


      </DashboardLayout>
    </UserLayout>
  );
};

export default MyConnectionsPage;
