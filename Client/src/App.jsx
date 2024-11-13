import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import RoomList from './components/RoomList';
import RoomDetails from './components/Room';
import ComputerList from './components/ComputerList';
import ComputerMonitor from './components/Computer';
import MenuBar from './components/MenuBar';
import { getCookie } from './utils/cookies';
import Users from './components/Users';
function App() {
  let [user, setUser] = useState(null);

  useEffect(() => {
    const data = decodeURIComponent(getCookie("user"));
    try {
      const user = JSON.parse(data.slice(2));
      setUser(user);
    } catch (error) {
      res.status(500).json({ error: 'Error parsing user data' });
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex">
        <MenuBar user={user} />
        <div className="flex-grow ml-64">
          <div className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={user?.role === 'admin' ? <Users user = {user} /> : <RoomList user={user} />} />
              <Route path="/login" element={<Login />} />
              <Route path="/users" element={<Users user={user} />} />
              <Route path="/rooms" element={<RoomList user={user} />} />
              <Route path="/rooms/:id" element={<RoomDetails user={user} />} />
              <Route path="/computers" element={<ComputerList />} />
              <Route path="/computers/:id" element={<ComputerMonitor user={user} />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
