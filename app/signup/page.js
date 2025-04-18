// Signup.js
"use client";
import React, { useState } from 'react';
import { useRouter } from "next/navigation"; 
import './Signup.css';
import axios from 'axios'

const signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const router = useRouter();
  const navigate = (to) => router.push(to);
  const handleSubmit = async (e) => {
    e.preventDefault();
    axios.post('http://localhost:3001/signup',formData)
    .then(res => {
      if (res.data.status === "success") 
      {
        navigate("/loginquiz");   
      }
      else 
      { 
        alert("Error")
      }
    }) 
    .then(err =>console.log(err))
  };
  const handleChange = (e) => {
    setFormData({
      ...formData, 
      [e.target.name]: e.target.value  
    });
  };

  return (
    <div className="quiz-auth-container">
      <div className="quiz-auth-card">
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit} className="quiz-auth-form">
          <div className="quiz-input-group">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="quiz-input-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="quiz-input-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="quiz-primary-btn">
            Register
          </button>
        </form>
        <div className="quiz-auth-switch">
             Already have an account? <a href="/loginquiz">Sign In</a>
        </div>
      </div>
    </div>
  );
};

export default signup;