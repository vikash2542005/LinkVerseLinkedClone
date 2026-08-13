import React, { useEffect, useState } from "react";
import UserLayout from "@/layout/UserLayout";
import style from "./loginStyle.module.css";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { loginUser, registerUser } from "@/config/redux/action/authAction";
import { empteyMessage } from "@/config/redux/reducer/authReducer";



const loginComponent = () => {
  const authState = useSelector((state) => state.auth);
  const router = useRouter();
  const dispath = useDispatch();

const [userLoginMethod, setUserLoginMethod] = useState(true);


  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (authState.loggedIn) {
      router.push("/dashboard");
    }
  }, [authState.loggedIn]);

  useEffect(()=>{
    dispath(empteyMessage());
  }, [userLoginMethod])

  useEffect(()=>{
    if(localStorage.getItem("token")){
      router.push("/dashboard");
    }
  })

  const handleRegister = () => {
    console.log("registering");
    dispath(registerUser({ username, password, email, name }));
  };

  const handleLogin = ()=>{
    console.log("login");
    dispath(loginUser({email, password}));
  }

  return (
    <UserLayout>
      <div className={style.container}>
        <div className={style.cardContainer}>
          <div className={style.cardContainer_left}>
            <p className={style.cardleft_heading}>
              {userLoginMethod ? "Login" : "SignUp"}
            </p>
            <p
              style={{
                color: authState.isError ? "red" : "green",
                marginTop: "5px",
              }}
            >
              {authState.message.message}
            </p>

            <div className={style.inputeContainers}>
              {!userLoginMethod && (
                <div className={style.inputRow}>
                  <input
                    onChange={(e) => {
                      setUsername(e.target.value);
                    }}
                    className={style.inputField}
                    type="text"
                    placeholder="Usernme"
                  />
                  <input
                    onChange={(e) => {
                      setName(e.target.value);
                    }}
                    className={style.inputField}
                    type="text"
                    placeholder="Name"
                  />
                </div>
              )}

              <input
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                className={style.inputField}
                type="text"
                placeholder="Email"
              />
              <input
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                className={style.inputField}
                type="password"
                placeholder="Password"
              />

              <div
                onClick={() => {
                  if (userLoginMethod) {
                    handleLogin();
                  } else {
                    handleRegister();
                  }
                }}
                className={style.buttonWithOutline}
              >
                {userLoginMethod ? "Login" : "SignUp"}
              </div>
            </div>
          </div>




          <div className={style.cardContainer_right}>
            

              {userLoginMethod ? <p>Don't Have an Account</p> : <p>Already Have an Account</p>}

              <div
                onClick={() => {
                  setUserLoginMethod(!userLoginMethod);
                }}
                style={{color : "black", textAlign : "center"}}
                className={style.buttonWithOutline}
              >
                {userLoginMethod ? "SignUp" : "Login"}
              </div>
            
          </div>







        </div>
      </div>
    </UserLayout>
  );
};

export default loginComponent;
