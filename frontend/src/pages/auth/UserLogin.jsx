import React from 'react';
import '../../styles/auth-shared.css';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const UserLogin = () => {

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/user/login`, {
      email,
      password
    }, { withCredentials: true });

    console.log(response.data);
    localStorage.setItem("userType", "user");
    navigate("/"); // Redirect to home after login

  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card" role="region" aria-labelledby="user-login-title">
        <header>
          <h1 id="user-login-title" className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to continue your food journey.</p>
        </header>

        <nav className="auth-nav">
          <span>Sign in as:</span>
          <Link to="/user/login" className="auth-nav-link active">User</Link>
          <span>•</span>
          <Link to="/food-partner/login" className="auth-nav-link">Partner</Link>
          <span>•</span>
          <Link to="/admin/login" className="auth-nav-link">Admin</Link>
        </nav>
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="field-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="you@example.com" autoComplete="email" />
          </div>
          <div className="field-group">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" placeholder="••••••••" autoComplete="current-password" />
          </div>
          <button className="auth-submit" type="submit">Sign In</button>
        </form>
        <div className="auth-alt-action">
          New here? <Link to="/user/register">Create account</Link>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;