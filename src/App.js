import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../src/css/global.css';
//import Landing from './components/landing';
import Navbar from './components/navbar';
import Footer from './components/footer';
import SignUp from './components/sign-up';
import Login from './components/login-form';

function App() {

  return (
    <div>
      <Navbar />
      <Login />
      <Footer />
    </div>
  );
}

export default App;