import React from "react";
import { Route, Routes } from "react-router-dom";
import ProfilePage from "./components/profilePage";
import "./App.css";
function App() {
  return (
    <div>
      <Routes>
        <Route path="/profilePage" element={<ProfilePage />} />
      </Routes>
    </div>
  );
}

export default App;
