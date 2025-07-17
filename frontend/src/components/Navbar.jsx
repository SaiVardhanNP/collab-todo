import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '/src/context/AuthContext.jsx'; // Absolute path
import '/src/styles/navbar.css'; // Absolute path

const Navbar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <h1 className="navbar-title">TaskSync</h1>
        <button className="navbar-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;