import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from '/src/context/AuthContext.jsx'; // Absolute path

import LoginPage from '/src/pages/LoginPage.jsx'; // Absolute path
import RegisterPage from '/src/pages/RegisterPage.jsx'; // Absolute path
import BoardPage from '/src/pages/BoardPage.jsx'; // Absolute path
import Navbar from '/src/components/Navbar.jsx'; // Absolute path

const AppContent = () => {
  const { token } = useContext(AuthContext);

  return (
    <>
      {token && <Navbar />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route 
          path="/board" 
          element={
            <PrivateRoute>
              <BoardPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/" 
          element={<Navigate to={token ? "/board" : "/login"} />} 
        />
      </Routes>
    </>
  );
};

const PrivateRoute = ({ children }) => {
  const { token } = useContext(AuthContext);
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;