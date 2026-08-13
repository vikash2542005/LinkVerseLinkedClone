import { useRouter } from "next/router";
import styles from "../styles/Home.module.css";
import UserLayout from "@/layout/UserLayout";



export default function Home() {
  const router = useRouter();

  return (
    <UserLayout>
      <div className={styles.container}>
        <div className={styles.mainContainer}>
          <div className={styles.mainContainer_left}>
            <p>Connect With Friends Withought Exaggeration</p>
            <p>A True Social Media Plateform, With Stories no blufs ! </p>

            <button
              className={styles.buttonJoin}
              onClick={() => router.push("/login")}
            >
              Join Now
            </button>
          </div>

          <div className={styles.mainContainer_right}>
            <img src="/image/mainImg.jpg" alt="connectionImg_home" />
          </div>
        </div>
      </div>

    </UserLayout>
  )
}
