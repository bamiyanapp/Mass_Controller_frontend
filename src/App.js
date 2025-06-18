import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Congestion from './Congestion';
import './App.css';

function App() {
  return (
    <Router basename="/Mass_Controller_frontend">
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/congestion/:areaName" element={<Congestion />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
