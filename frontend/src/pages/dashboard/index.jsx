import React, { useEffect, useState } from "react";
import styles from "./dashboardStyle.module.css";
import UserLayout from "@/layout/UserLayout";
import { useDispatch, useSelector } from "react-redux";
import {
  addComment,
  deleteComment,
  deletePost,
  getAllComments,
  getAllPosts,
  incrementLike,
} from "@/config/redux/action/postAction";
import { getAboutUser } from "@/config/redux/action/authAction";
import { DashboardLayout } from "@/layout/DashboardLayout";
import { BASE_URL } from "@/config";
import { createPost } from "@/config/redux/action/postAction";

const Dashboard = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const postState = useSelector((state) => state.postReducer);
  const posts = postState.posts ?? [];

  useEffect(() => {
    if (authState.isTokenThere) {
      dispatch(getAllPosts());
      dispatch(getAboutUser({ token: localStorage.getItem("token") }));
    }
  }, [authState.isTokenThere]);

  const [postContent, setPostContent] = useState("");
  const [fileContent, setFileContent] = useState();
  const [openCommentPostId, setOpenCommentPostId] = useState(null);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [expandedPosts, setExpandedPosts] = useState({});

  const handleCommentFetch = async (postId) => {
    if (openCommentPostId === postId) {
      setOpenCommentPostId(null);
      return;
    }

    setOpenCommentPostId(postId);
    await dispatch(getAllComments({ post_id: postId }));
  };

  const handleAddComment = async (postId) => {
    const comment = commentDrafts[postId]?.trim();

    if (!comment) return;

    await dispatch(addComment({ post_id: postId, comment }));
    setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
    await dispatch(getAllComments({ post_id: postId }));
  };

  const handleDeleteComment = async (commentId, postId) => {
    await dispatch(deleteComment({ post_id: postId, comment_id: commentId }));
    await dispatch(getAllComments({ post_id: postId }));
  };

  const handleUpload = async () => {
    await dispatch(createPost({ file: fileContent, body: postContent }));
    setPostContent("");
    setFileContent(null);
    dispatch(getAllPosts());
  };

  const handleDelete = async (postId) => {
    await dispatch(
      deletePost({ token: localStorage.getItem("token"), post_id: postId }),
    );
    dispatch(getAllPosts());
  };

  const handleRetry = () => {
    dispatch(getAllPosts());
    dispatch(getAboutUser({ token: localStorage.getItem("token") }));
  };

  const isPostLiked = (post) =>
    post.likedBy?.some(
      (id) => id?.toString() === authState?.user?.userId?._id?.toString(),
    );

  if (authState.user) {
    return (
      <UserLayout>
        <DashboardLayout>
          <div className={styles.homeComponent}>
            <div className={styles.wraper}>
              <div className={styles.createPostContainer}>
                <img
                  className={styles.userProfile}
                  src={`${BASE_URL}/${authState?.user?.userId?.profilePicture ?? authState?.userId?.profilePicture ?? "default.jpg"}`}
                  alt="abcd"
                />
                <textarea
                  onChange={(e) => {
                    setPostContent(e.target.value);
                  }}
                  value={postContent}
                  placeholder="Share Your Thoughts Here..."
                  className={styles.textareaContent}
                  name=""
                  id=""
                ></textarea>

                <label htmlFor="fileUpload">
                  <div className={styles.Fab}>
                    <svg
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
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                  </div>
                </label>
                <input
                  onChange={(e) => setFileContent(e.target.files[0])}
                  type="file"
                  hidden
                  id="fileUpload"
                />
                {postContent.length > 0 && (
                  <button
                    onClick={handleUpload}
                    className={styles.uploadButton}
                  >
                    Post
                  </button>
                )}
              </div>

              <div className={styles.postContainer}>
                {posts.map((post) => {
                  return (
                    <div key={post._id} className={styles.singleCard}>
                      <div className={styles.singleCard_profileContainer}>
                        <img
                          className={styles.userProfile}
                          src={`${BASE_URL}/${post.userId?.profilePicture ?? "default.jpg"}`}
                          alt={post.userId?.name || "user"}
                        />

                        <div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <p style={{ fontWeight: "bold" }}>
                              {post.userId.name}
                            </p>
                            {post.userId._id === authState.user.userId._id && (
                              <div style={{ cursor: "pointer" }}>
                                <div
                                  onClick={() => {
                                    handleDelete(post._id);
                                  }}
                                >
                                  <svg
                                    style={{ height: "1.4rem", color: "red" }}
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
                                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                    />
                                  </svg>
                                </div>
                              </div>
                            )}
                          </div>

                          <p style={{ color: "gray" }}>
                            @{post.userId.username}
                          </p>

                          {post.body.length > 60 ? (
                            <>
                              <p
                                className={
                                  !expandedPosts[post._id] ? styles.clamped : ""
                                }
                                style={{ paddingTop: "1.3rem" }}
                              >
                                {post.body}
                              </p>
                              <button
                                onClick={() =>
                                  setExpandedPosts((prev) => ({
                                    ...prev,
                                    [post._id]: !prev[post._id],
                                  }))
                                }
                                className={styles.readMoreButton}
                              >
                                {expandedPosts[post._id]
                                  ? "Read less"
                                  : "Read more"}
                              </button>
                            </>
                          ) : (
                            <p style={{ paddingTop: "1.3rem" }}>{post.body}</p>
                          )}

                          <div className={styles.singleCard_img}>
                            <img src={`${BASE_URL}/${post.media}`} alt="" />
                          </div>

                          <div className={styles.optionContainer}>
                            <div
                              onClick={async () => {
                                await dispatch(
                                  incrementLike({ post_id: post._id }),
                                );
                                dispatch(getAllPosts());
                              }}
                              className={styles.singleOption_container}
                              style={{
                                color: isPostLiked(post)
                                  ? "#2f7bf6"
                                  : "currentColor",
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill={
                                  isPostLiked(post) ? "currentColor" : "none"
                                }
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="size-6"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
                                />
                              </svg>
                              <p>{post.likes}</p>
                            </div>

                            <div
                              onClick={() => handleCommentFetch(post._id)}
                              className={styles.singleOption_container}
                            >
                              <svg
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
                                  d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
                                />
                              </svg>
                              <p>{post.comment}</p>
                            </div>

                            <div className={styles.singleOption_container}>
                              <svg
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
                                  d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
                                />
                              </svg>
                            </div>
                          </div>

                          {openCommentPostId === post._id && (
                            <div className={styles.commentPanel}>
                              <div className={styles.commentInputRow}>
                                <input
                                  type="text"
                                  value={commentDrafts[post._id] ?? ""}
                                  onChange={(e) =>
                                    setCommentDrafts((prev) => ({
                                      ...prev,
                                      [post._id]: e.target.value,
                                    }))
                                  }
                                  placeholder="Write a comment..."
                                  className={styles.commentInput}
                                />
                                <button
                                  onClick={() => handleAddComment(post._id)}
                                  className={styles.commentButton}
                                >
                                  Comment
                                </button>
                              </div>

                              {postState.isLoading ? (
                                <p className={styles.commentStatus}>
                                  Loading comments...
                                </p>
                              ) : postState.comments.length > 0 ? (
                                postState.comments.map((comment) => (
                                  <div
                                    key={comment._id}
                                    className={styles.commentItem}
                                  >
                                    <div className={styles.commentMetaRow}>
                                      <div>
                                        <img
                                          style={{
                                            height: "32px",
                                            width: "32px",
                                            borderRadius: "50%",
                                          }}
                                          src={`${BASE_URL}/${comment.userId?.profilePicture ?? "default.jpg"}`}
                                          alt={comment.userId?.name || "user"}
                                        />

                                        <p
                                          className={styles.commentText}
                                          style={{ display: "felx" }}
                                        >
                                          <strong>
                                            {comment.userId?.name ?? "User"}
                                          </strong>
                                          : {comment.body}
                                        </p>
                                      </div>
                                      {comment.userId?._id ===
                                        authState.user?.userId?._id && (
                                        <button
                                          onClick={() =>
                                            handleDeleteComment(
                                              comment._id,
                                              post._id,
                                            )
                                          }
                                          className={styles.deleteCommentButton}
                                        >
                                          Delete
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className={styles.commentStatus}>
                                  No comments yet.
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </DashboardLayout>
      </UserLayout>
    );
  } else if (authState.isError) {
    return (
      <UserLayout>
        <DashboardLayout>
          <div className={styles.errorContainer}>
            <h2>Something went wrong while loading your dashboard</h2>
            <p>
              {typeof authState.message === "string"
                ? authState.message
                : "Please try again."}
            </p>
            <button onClick={handleRetry} className={styles.retryButton}>
              Retry
            </button>
          </div>
        </DashboardLayout>
      </UserLayout>
    );
  } else {
    return (
      <UserLayout>
        <DashboardLayout>
          <h2>Loading......</h2>
        </DashboardLayout>
      </UserLayout>
    );
  }
};

export default Dashboard;
