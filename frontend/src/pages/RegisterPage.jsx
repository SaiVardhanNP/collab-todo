import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '/src/context/AuthContext.jsx';
import '/src/styles/auth.css';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError("Username and password are required.");
      return;
    }

    try {
      await register(username, password);
      navigate('/login', { state: { message: 'Registration successful! Please log in.' } });

    } catch (err) {
      // --- Improved Error Handling Logic ---
      if (err.response) {
        // The server responded with an error (e.g., "User already exists")
        console.error("Server Response Error:", err.response.data);
        setError(err.response.data.msg || 'An error occurred on the server.');
      } else if (err.request) {
        // The request was made, but no response was received (network error)
        console.error("No Server Response:", err.request);
        setError('Cannot connect to the server. Please ensure the backend is running.');
      } else {
        // Something else went wrong in setting up the request
        console.error('Request Setup Error:', err.message);
        setError('An unexpected error occurred. Please check the console.');
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-form-container">
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {error && <p className="auth-error">{error}</p>}
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Register</button>
        </form>
        <p className="switch-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;