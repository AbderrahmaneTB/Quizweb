"use client";

"use client";
import React, { useState } from 'react';
import { useRouter } from "next/navigation"; 
import './login.css';
import axios from 'axios'

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
      });
      axios.defaults.withCredentials =true;
      const router = useRouter();
      const navigate = (to) => router.push(to);
      const handleSubmit = async (e) => {
        e.preventDefault();
        axios.post('http://localhost:3001/loginquiz',formData)
        .then(res => {
          if (res.data.status === "success")
          {
            navigate("/");    
          }
          else 
          { 
            alert(res.data.Error)
          }
        }) 
        .then(err =>console.log(err))
    };
  
    return (
      <div className="login-container">
        <div className="login-box">
          <h2>Welcome Back!</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => {
                    setFormData({
                      ...formData, 
                      email: e.target.value  
                    })
                  }}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => {
                    setFormData({
                      ...formData, 
                     password: e.target.value  
                    })
                  }}
                required
              />
            </div>
            <button type="submit" className="login-btn">
              Sign In
            </button>
          </form>
          <div className="additional-links">
            <a href="/forgot-password">Forgot Password?</a>
            <a href="/signup">Create Account</a>
          </div>
        </div>
      </div>
    );
  };
  
  export default Login;