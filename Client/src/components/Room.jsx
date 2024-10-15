import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getComputersInRoom, manageRoom } from '../utils/api';

const RoomDetails = () => {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [computers, setComputers] = useState([]);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const response = await getComputersInRoom(id);
        setRoom(response.data.room);
        setComputers(response.data.computers);
      } catch (error) {
        console.error('Error fetching room details:', error);
      }
    };

    fetchRoomDetails();
  }, [id]);

  if (!room) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{room.name}</h1>
      <p className="text-gray-600 mb-6">{room.description}</p>
      <h2 className="text-2xl font-bold mb-4">Computers in this room:</h2>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {computers.map((computer) => (
          <li key={computer.id} className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-bold">{computer.hostname}</h3>
            <p>IP: {computer.ip_address}</p>
            <p>MAC: {computer.mac_address}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoomDetails;
