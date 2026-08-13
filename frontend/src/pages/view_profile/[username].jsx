import React from "react";
import { useEffect, useState } from "react";
import { BASE_URL, clientServer } from "@/config";
import { DashboardLayout } from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import styles from "./viewProfileStyle.module.css";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import { getAllPosts } from "@/config/redux/action/postAction";
import {
  getConnectionsRequest,
  getIncomingConnectionRequests,
  sendConnectionRequest,
} from "@/config/redux/action/authAction";

const ViewProfilePage = ({ userProfile }) => {
  if (!userProfile) {
    return <div>Profile not found</div>;
  }

  const router = useRouter();

  const postReducer = useSelector((state) => state.postReducer);
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [userPosts, setUserPosts] = useState([]);
  const [isCurrentUserInConnections, setIsCurrentUserInConnections] =
    useState(false);
  const [isConnectionNull, setIsConnectionNull] = useState(true);

  const getUsersPost = async () => {
    try {
      await dispatch(getAllPosts());

      const token = localStorage.getItem("token");
      if (token) {
        await dispatch(getConnectionsRequest({ token }));
        await dispatch(getIncomingConnectionRequests({ token }));
      }
    } catch (err) {
      console.error("Error fetching profile activity:", err);
    }
  };

  useEffect(() => {
    if (userProfile?.userId?._id) {
      getUsersPost();
    }
  }, [userProfile?.userId?._id]);

  useEffect(() => {
    const posts = Array.isArray(postReducer.posts) ? postReducer.posts : [];
    const username = router.query.username || userProfile?.userId?.username;

    const filteredPosts = posts.filter((post) => {
      const postUsername = post.userId?.username;
      const postUserId = post.userId?._id?.toString();
      const profileUserId = userProfile?.userId?._id?.toString();
      return postUsername === username || postUserId === profileUserId;
    });

    setUserPosts(filteredPosts);
  }, [
    postReducer.posts,
    router.query.username,
    userProfile?.userId?.username,
    userProfile?.userId?._id,
  ]);

  useEffect(() => {
    const currentUserId = authState.user?.userId?._id || authState.user?._id;
    const profileUserId = userProfile.userId._id;

    const sentConnection = authState.connections.find(
      (user) => user.connectionId?._id === profileUserId,
    );
    const receivedConnection = authState.connectionRequest.find(
      (user) => user.userId?._id === profileUserId,
    );
    const connection = sentConnection || receivedConnection;

    const isSelfProfile = currentUserId && currentUserId === profileUserId;
    const hasPendingRequest = Boolean(connection);
    const isAccepted = connection?.status_accepted === true;

    setIsCurrentUserInConnections(isAccepted || hasPendingRequest);
    setIsConnectionNull(!isAccepted && hasPendingRequest);

    if (isSelfProfile) {
      setIsCurrentUserInConnections(true);
      setIsConnectionNull(false);
    }
  }, [
    authState.connections,
    authState.connectionRequest,
    authState.user,
    userProfile.userId._id,
  ]);

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.container}>
          <div className={styles.backDropContainer}>
            <img
              className={styles.profileImage}
              src={`${BASE_URL}/${userProfile.userId.profilePicture}`}
              alt=""
            />
          </div>

          <div className={styles.profileContainer_details}>
            <div className={styles.profileHeader}>
              <div className={styles.profileMain}>
                <div className={styles.profileIdentityRow}>
                  <h2>{userProfile.userId.name}</h2>
                  <p>{userProfile.userId.username}</p>
                </div>

                <div className={styles.profileActionRow}>
                  {authState.user?.userId?._id === userProfile.userId._id ||
                  authState.user?._id === userProfile.userId._id ? (
                    <button className={styles.connectedButton}>You</button>
                  ) : isCurrentUserInConnections ? (
                    <button className={styles.connectedButton}>
                      {isConnectionNull ? "Pending" : "Connected"}
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        try {
                          const actionResult = await dispatch(
                            sendConnectionRequest({
                              token: localStorage.getItem("token"),
                              user_id: userProfile.userId._id,
                            }),
                          );

                          if (
                            sendConnectionRequest.fulfilled.match(actionResult)
                          ) {
                            setIsCurrentUserInConnections(true);
                            setIsConnectionNull(true);

                            await dispatch(
                              getConnectionsRequest({
                                token: localStorage.getItem("token"),
                              }),
                            );
                          }
                        } catch (err) {
                          console.error("Connection request failed:", err);
                        }
                      }}
                      className={styles.connectButton}
                    >
                      Connect
                    </button>
                  )}

                  <div
                    onClick={async () => {
                      try {
                        const response = await clientServer.get(
                          `/user/download_resume?id=${userProfile.userId._id}`,
                        );
                        window.open(
                          `${BASE_URL}/${response.data.data}`,
                          "_blank",
                        );
                      } catch (err) {
                        console.error(
                          "Resume download failed:",
                          err?.response?.data || err.message,
                        );
                      }
                    }}
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <svg
                      style={{ width: "1.2em" }}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                      />
                    </svg>
                    <p style={{ fontSize: "14px" }}>Resume</p>
                  </div>
                </div>

                <div
                  style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}
                >
                  <p className={styles.profileBio}>{userProfile.bio}</p>
                </div>
              </div>

              <div className={styles.activityColumn}>
                <h3 className={styles.activityTitle}>Recent Activity</h3>
                {userPosts.length === 0 ? (
                  <p className={styles.activityEmpty}>
                    No recent activity yet.
                  </p>
                ) : (
                  userPosts.map((post) => {
                    return (
                      <div key={post._id} className={styles.postCard}>
                        <div className={styles.card}>
                          <div className={styles.card_profileContiner}>
                            {post.media !== "" ? (
                              <img
                                src={`${BASE_URL}/${post.media}`}
                                alt="Post media"
                              />
                            ) : (
                              <div
                                style={{ width: "3.4rem", height: "3.4rem" }}
                              ></div>
                            )}
                          </div>
                          <p>{post.body}</p>
                        </div>
                        <p>{post.content}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="workHistory">
            <h4 className={styles.workHistoryTitle}>Work History</h4>

            <div className={styles.workHistoryContainer}>
              {userProfile.pastwork.map((work, index) => {
                return (
                  <div key={index} className={styles.WorkHistoryCard}>
                    <p
                      style={{
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.8rem",
                      }}
                    >
                      {work.company}-{work.position}
                    </p>
                    <p>{work.years}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
};

export const getServerSideProps = async (context) => {
  const username = context.params?.username;

  if (!username) {
    return { notFound: true };
  }

  try {
    const response = await clientServer.get(
      "/user/get_profile_based_on_username",
      {
        params: { username },
      },
    );

    return {
      props: {
        userProfile: response.data.profile,
      },
    };
  } catch (err) {
    console.error(
      "view profile fetch error:",
      err?.response?.data || err.message,
    );
    return { notFound: true };
  }
};

export default ViewProfilePage;
