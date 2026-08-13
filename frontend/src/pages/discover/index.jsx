import React, { useEffect } from 'react'
import UserLayout from '@/layout/UserLayout'
import { DashboardLayout } from '@/layout/DashboardLayout'
import { getAllUsers } from '@/config/redux/action/authAction'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import styles from './discoverStyle.module.css'
import { BASE_URL } from '@/config'
import { useRouter } from 'next/router'

function DiscoverPage() {
  const dispatch = useDispatch();
  const authState = useSelector((state) =>state.auth);
  const router = useRouter();
  useEffect(()=>{
    if(!authState.all_profiles_fetched){
      dispatch(getAllUsers());
    }
  },[])


  return (
        <UserLayout>
          <DashboardLayout>

            <div className={styles.discoverContainer}>
              <h1>Discover</h1>

              <div key={1} className={styles.allUserProfile}>
                {authState.all_profiles_fetched && authState.all_users.map((user)=>{
                  return (
                    <div onClick={() => {
                      router.push(`/view_profile/${user.userId.username}`)
                    }} key={user._id} className={styles.userCard}>
                      <img className={styles.userCard_img} src={`${BASE_URL}/${user.userId.profilePicture}`} alt="profile" />
                      <div>
                        <h3>{user.userId.name}</h3>
                        <p>{user.userId.email}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

          </DashboardLayout>
        </UserLayout>
  )
}

export default DiscoverPage