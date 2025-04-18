"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Quiz() {
  const [auth, Setauth] = useState(false);
  const [mess, setMess] = useState("");
  const [name, setName] = useState("");

  axios.defaults.withCredentials = true;

  useEffect(() => {
    axios
      .get("http://localhost:3001")
      .then((res) => {
        if (res.data.status === "success") {
          Setauth(true);
          setName(res.data.name);
        } else {
          Setauth(false);
          setMess(res.data.Error);
          window.location.href = "/loginquiz";
        }
      })
      .catch((err) => console.log(err));
  }, []);

  const handllogout = () => {
    axios
      .get("http://localhost:3001/logout")
      .then(() => {
        location.reload(true);
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="main">
      <h1 className="welcom">Welcome To Quiz Game</h1>

      <Link href="/quizgame">
        <button className="star">Get Started</button>
      </Link>

      <Link href="/signup">
        <button className="star">Signup</button>
      </Link>

      {auth ? (
        <div>
          <button className="star" onClick={handllogout}>
            Logout
          </button>
        </div>
      ) : (
        <div>
          <Link href="/loginquiz">
            <button className="star">Login</button>
          </Link>
        </div>
      )}
    </div>
  );
}
