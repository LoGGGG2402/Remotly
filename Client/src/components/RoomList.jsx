import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllRooms } from '../utils/api';

const RoomList = () => {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await getAllRooms();
        setRooms(response.data.rooms);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };

    fetchRooms();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Rooms</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <Link key={room.id} to={`/rooms/${room.id}`} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-bold mb-2">{room.name}</h2>
            <p className="text-gray-600">{room.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RoomList;
