import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllRooms, createRoom } from '../utils/api';

const RoomList = ({ user }) => {
  const [rooms, setRooms] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: '', description: '' });

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

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      const response = await createRoom(newRoom);
      setRooms([...rooms, response.data.room]);
      setNewRoom({ name: '', description: '' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Rooms</h1>
        {user?.role === 'admin' && (
          <button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {showCreateForm ? 'Cancel' : 'Create Room'}
          </button>
        )}
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateRoom} className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Room Name</label>
            <input
              type="text"
              value={newRoom.name}
              onChange={(e) => setNewRoom({...newRoom, name: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Description</label>
            <textarea
              value={newRoom.description}
              onChange={(e) => setNewRoom({...newRoom, description: e.target.value})}
              className="w-full p-2 border rounded"
            />
          </div>
          <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Create
          </button>
        </form>
      )}

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
