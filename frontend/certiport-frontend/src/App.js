import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import UniversityDashboard from './pages/UniversityDashboard';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PublicVerify from './pages/PublicVerify';
import Navbar from './components/Navbar';

function App(){
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage/>} />
        <Route path="/verify" element={<PublicVerify/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/university" element={<UniversityDashboard/>} />
        <Route path="/student" element={<StudentDashboard/>} />
        <Route path="/admin" element={<AdminDashboard/>} />
      </Routes>
    </>
  );
}
export default App;