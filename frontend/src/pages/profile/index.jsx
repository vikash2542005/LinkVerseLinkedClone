import React, { useState, useEffect } from "react";
import UserLayout from "@/layout/UserLayout";
import { DashboardLayout } from "@/layout/DashboardLayout";
import styles from "./profileStyle.module.css";
import { BASE_URL, clientServer } from "@/config";
import { useDispatch, useSelector } from "react-redux";
import { getAboutUser } from "@/config/redux/action/authAction";
import { getAllPosts } from "@/config/redux/action/postAction";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const postState = useSelector((state) => state.postReducer);

  const [userProfile, setUserProfile] = useState(authState.user);
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [bioInput, setBioInput] = useState("");
  const [workInput, setWorkInput] = useState([]);


  
  const allPosts = postState.posts ?? [];
  const currentUserId =
    userProfile?.userId?._id ?? userProfile?._id;

  const userPosts = allPosts.filter((post) => {
    const postUserId = post.userId?._id?.toString();
    return postUserId === currentUserId?.toString();
  });

useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(getAboutUser({ token }));
    }
  }, []);

  useEffect(() => {
    setUserProfile(authState.user);
    const nameVal = authState.user?.userId?.name ?? authState.user?.name ?? "";
    setNameInput(nameVal);
    setBioInput(authState.user?.bio ?? "");
    const existingWork = authState.user?.pastwork ?? authState.user?.pastWork ?? [];
    setWorkInput(Array.isArray(existingWork) ? existingWork : []);
  }, [authState.user]);

  useEffect(() => {
    if (authState.isTokenThere) {
      dispatch(getAllPosts());
    }
  }, [authState.isTokenThere]);



  const profilePictureUpdate = async (file)=>{
      const formData = new FormData();
      formData.append("profile_picture", file);
      formData.append("token", localStorage.getItem("token"));

      const response = await clientServer.post("/update_profile_picture", formData,{
        headers : {
          "Content-Type" : "multipart/form-data",
        },
      });


      dispatch(getAboutUser({token : localStorage.getItem("token")}));

  }

  const addWorkEntry = () => {
    setWorkInput((prev) => [...prev, { company: "", position: "", years: "" }]);
  };

  const updateWorkField = (idx, field, value) => {
    setWorkInput((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const removeWorkEntry = (idx) => {
    setWorkInput((prev) => prev.filter((_, i) => i !== idx));
  };




  if (authState.isLoading && !userProfile) {
    return (
      <UserLayout>
        <DashboardLayout>
          <h2>Loading......</h2>
        </DashboardLayout>
      </UserLayout>
    );
  }

  if (authState.isError && !userProfile) {
    return (
      <UserLayout>
        <DashboardLayout>
          <div className={styles.errorContainer}>
            <h2>Something went wrong while loading your profile</h2>
            <p>
              {typeof authState.message === "string"
                ? authState.message
                : "Please try again."}
            </p>
          </div>
        </DashboardLayout>
      </UserLayout>
    );
  }

  if (!userProfile) {
    return (
      <UserLayout>
        <DashboardLayout>
          <h2>Loading......</h2>
        </DashboardLayout>
      </UserLayout>
    );
  }

const profilePicture =
    userProfile?.userId?.profilePicture ??
    userProfile?.profilePicture ??
    "default.jpg";

  const workHistory =
    userProfile?.pastwork ?? userProfile?.pastWork ?? [];

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.container}>
          <div className={styles.backDropContainer}>
    
            <label htmlFor="profilePictureUpdate" className={styles.backDrop_overlay}><p>Edit</p></label>
            <input onChange={(e)=>{profilePictureUpdate(e.target.files[0])}} style={{display : "none"}} type="file" id="profilePictureUpdate" />
            <img
              className={styles.profileImage}
              src={`${BASE_URL}/${profilePicture}`}
              alt=""
            />
          </div>

          <div className={styles.profileContainer_details}>
            <div className={styles.profileHeader}>
              <div className={styles.profileMain}>
                <div className={styles.profileIdentityRow} style={{margin : "2rem"}}>
                  {!isEditing ? (
                    <>
                      <h2>{userProfile.userId?.name ?? userProfile.name}</h2>
                      <p>{userProfile.userId?.username ?? userProfile.username}</p>
                                       
                      <button
                        className={styles.editButton}
                        onClick={() => setIsEditing(true)}
                      >
                        Edit
                      </button>
                    </>
                  ) : (
                    <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
                      <input
                        className={styles.nameEdit}
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                      />
                      <button className={`${styles.btn} ${styles.saveButton}`} onClick={async () => {
                        const token = localStorage.getItem("token");
                        try {
                          await clientServer.post("/user_update", { token, name: nameInput });
                          await clientServer.post("/update_profile_data", { token, pastWork: workInput, bio: bioInput });
                          dispatch(getAboutUser({ token }));
                          setIsEditing(false);
                        } catch (err) {
                          console.error("Failed to update profile:", err?.response?.data || err.message);
                          alert("Failed to update profile. See console for details.");
                        }
                      }}>Save</button>
                      <button className={`${styles.btn} ${styles.cancelButton}`} onClick={() => {
                        setIsEditing(false);
                        setNameInput(userProfile.userId?.name ?? userProfile.name ?? "");
                        setBioInput(userProfile?.bio ?? "");
                        setWorkInput(userProfile?.pastwork ?? userProfile?.pastWork ?? []);
                      }}>Cancel</button>
                    </div>
                  )}
                </div>

                <div
                  style={{ display: "flex", gap: "1rem", marginTop: "1rem", flexDirection: "column" }}
                >
                  {isEditing ? (
                    <textarea 
                      placeholder="Write your bio"
                      className={styles.bioEdit}
                      value={bioInput}
                      rows={4}
                      onChange={(e) => setBioInput(e.target.value)}
                    />
                  ) : (
                    <p className={styles.profileBio}>{userProfile.bio}</p>
                  )}
                </div>
              </div>

              
            </div>

            <div className={styles.activityColumn}>
                <h3 className={styles.activityTitle}>Recent Activity</h3>
                {userPosts.length === 0 ? (
                  <p className={styles.activityEmpty}>No recent activity yet.</p>
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

          <div className={styles.workHistory}>
            <h4 className={styles.workHistoryTitle}>Work History</h4>

            <div className={styles.workHistoryContainer}>
              {isEditing ? (
                <div>
                  {workInput.length === 0 && (
                    <p className={styles.activityEmpty}>No work history yet.</p>
                  )}
                  {workInput.map((work, idx) => (
                    <div key={idx} className={styles.WorkHistoryCard} style={{ marginBottom: "0.6rem" }}>
                      <input
                        className={styles.workField}
                        placeholder="Company"
                        value={work.company}
                        onChange={(e) => updateWorkField(idx, "company", e.target.value)}
                      />
                      <input
                        className={styles.workField}
                        placeholder="Position"
                        value={work.position}
                        onChange={(e) => updateWorkField(idx, "position", e.target.value)}
                      />
                      <input
                        className={styles.workField}
                        placeholder="Years"
                        value={work.years}
                        onChange={(e) => updateWorkField(idx, "years", e.target.value)}
                      />
                      <div className={styles.smallControls}>
                        <button className={styles.removeButton} onClick={() => removeWorkEntry(idx)}>Remove</button>
                      </div>
                    </div>
                  ))}

                  <button className={styles.addWorkButton} onClick={addWorkEntry}>Add Work</button>
                </div>
              ) : (
                workHistory.length === 0 ? (
                  <p className={styles.activityEmpty}>No work history yet.</p>
                ) : (
                  workHistory.map((work, index) => {
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
                  })
                )
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
};

export default ProfilePage;
