import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AccessibleMap from './components/AccessibleMap';
import SignUpForm from './components/SignUpForm';
import UserProfile from './components/UserProfile';
import LoginForm from './components/LoginForm';
// import Preferences from './components/Preferences';
// import Help from './components/Help';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/map" element={<AccessibleMap />} />
          <Route path="/signup" element={<SignUpForm />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/" element={<AccessibleMap />} />
        {/* <Route path="/preferences" element={<Preferences />} />
            <Route path="/help" element={<Help />} />
        */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;