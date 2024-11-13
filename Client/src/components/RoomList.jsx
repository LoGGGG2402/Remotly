import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rooms } from '../utils/api';
import { 
  Plus,
  X as XIcon,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import { 
  HiDesktopComputer, 
  HiCollection, 
  HiTerminal,
  HiCode,
  HiChip
} from 'react-icons/hi';
import { RiComputerLine, RiComputerFill, RiServerFill } from 'react-icons/ri';
import { BsMotherboard } from 'react-icons/bs';

const RoomList = ({ user }) => {
  const [roomList, setRooms] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: '', description: '' });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      setIsLoading(true);
      try {
        const response = await rooms.getAll();
        setRooms(response.data.rooms);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      const response = await rooms.create(newRoom);
      setRooms([...roomList, response.data.room]);
      setNewRoom({ name: '', description: '' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    try {
      await rooms.delete(roomId);
      setRooms(roomList.filter(room => room.id !== roomId));
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px]">
        <HiDesktopComputer className="h-16 w-16 text-blue-500 animate-pulse mb-4" />
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <HiChip className="h-12 w-12 text-blue-600" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              Computer Labs
            </h1>
            <p className="text-gray-500 mt-1">Monitor and manage computer workstations</p>
          </div>
        </div>
        {user?.role === 'admin' && (
          <button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium"
          >
            {showCreateForm ? (
              <>
                <XIcon className="h-5 w-5 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="h-5 w-5 mr-2" />
                New Computer Lab
              </>
            )}
          </button>
        )}
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateRoom} className="bg-white p-8 rounded-xl shadow-lg mb-8 border border-gray-100">
          <div className="space-y-6">
            <div>
              <label className="text-lg font-medium text-gray-700">Room Name</label>
              <input
                type="text"
                value={newRoom.name}
                onChange={(e) => setNewRoom({...newRoom, name: e.target.value})}
                className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                required
                placeholder="Enter room name..."
              />
            </div>
            <div>
              <label className="text-lg font-medium text-gray-700">Description</label>
              <textarea
                value={newRoom.description}
                onChange={(e) => setNewRoom({...newRoom, description: e.target.value})}
                className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                rows="4"
                placeholder="Enter room description..."
              />
            </div>
            <button 
              type="submit" 
              className="w-full inline-flex justify-center items-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Room
            </button>
          </div>
        </form>
      )}

      {roomList.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <HiDesktopComputer className="h-24 w-24 mx-auto text-gray-400 mb-4" />
          <p className="text-xl text-gray-500">No computer labs configured yet.</p>
          <p className="text-gray-400">Create a new lab to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {roomList.map((room) => (
            <div 
              key={room.id} 
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100"
            >
              <div className="h-48 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 flex items-center justify-center">
                  <div className="grid grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <HiDesktopComputer key={i} className="h-12 w-12 text-white" />
                    ))}
                  </div>
                </div>
                <div className="relative z-10 flex flex-col items-center">
                  <BsMotherboard className="h-16 w-16 text-white mb-2" />
                  <RiServerFill className="h-10 w-10 text-white opacity-50" />
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-3">
                  <HiTerminal className="h-5 w-5 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">{room.name}</h2>
                </div>
                <p className="text-gray-600 mb-6 line-clamp-3">{room.description}</p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => navigate(`/rooms/${room.id}`)} 
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    View Details
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </button>
                  {user?.role === 'admin' && (
                    <button 
                      onClick={() => handleDeleteRoom(room.id)} 
                      className="inline-flex justify-center items-center p-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                      title="Delete Room"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomList;
