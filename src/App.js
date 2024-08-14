import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../src/css/global.css';
import Landing from './components/landing';
import Navbar from './components/navbar';
import Footer from './components/footer';
import SignUp from './components/sign-up';
import Login from './components/login-form';
import TwoFactorAuth from './components/twoFA';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-2fa" element={<TwoFactorAuth />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
