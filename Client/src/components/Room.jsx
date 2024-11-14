import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaServer, FaUsers, FaSpinner, FaPlus, FaTrash, FaNetworkWired } from 'react-icons/fa';
import { LazyLoadComponent } from 'react-lazy-load-image-component';
import { rooms, users, computers } from '../utils/api';
import { Link } from 'react-router-dom';
import { BsArrowRightShort } from "react-icons/bs";
import { HiServer, HiDesktopComputer, HiCollection } from 'react-icons/hi';
import { RiComputerLine } from 'react-icons/ri';

// Component for the header section
const RoomHeader = ({ room, user, onManageComputers, onManageUsers }) => (
  <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-lg p-8 mb-8">
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-white">{room.name}</h1>
        <p className="text-lg text-blue-100">{room.description}</p>
      </div>
      {user?.role === 'admin' && (
        <div className="flex space-x-4">
          <button
            onClick={onManageComputers}
            className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition duration-200"
          >
            <HiDesktopComputer className="text-xl" /> <span>Manage Computers</span>
          </button>
          <button
            onClick={onManageUsers}
            className="bg-blue-500 text-white hover:bg-blue-400 px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition duration-200"
          >
            <FaUsers /> <span>Manage Users</span>
          </button>
        </div>
      )}
    </div>
  </div>
);

// Enhanced computer card component
const ComputerCard = ({ computer, onRemove, user }) => (
  <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-800">{computer.hostname}</h3>
        <div className="p-3 bg-blue-50 rounded-full">
          <RiComputerLine className="text-2xl text-blue-600" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-gray-600">
          <FaNetworkWired />
          <span>{computer.ip_address}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <span className="font-medium">MAC:</span>
          <span>{computer.mac_address}</span>
        </div>
      </div>
    </div>
    <div className="p-4 bg-gray-50 rounded-b-xl space-y-3">
      <Link
        to={`/computers/${computer.id}`}
        className="btn-primary w-full flex items-center justify-center space-x-2"
      >
        <span>View Details</span>
        <BsArrowRightShort className="text-xl" />
      </Link>
      {user?.role === 'admin' && (
        <button
          onClick={() => onRemove(computer.id)}
          className="btn-danger w-full flex items-center justify-center space-x-2"
        >
          <FaTrash />
          <span>Remove</span>
        </button>
      )}
    </div>
  </div>
);

// Main component
const RoomDetails = ({ user }) => {
  const { id } = useParams();
  const [currentRoom, setRoom] = useState(null);
  const [computerList, setComputers] = useState([]);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userList, setUsers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [availableComputers, setAvailableComputers] = useState([]);
  const [selectedComputer, setSelectedComputer] = useState('');
  const [permissions, setPermissions] = useState({
    can_view: false,
    can_manage: false
  });

  const fetchRoomDetails = async () => {
    try {
      const response = await rooms.getComputers(id);
      setRoom(response.data.room);
      setComputers(response.data.computers);
    } catch (error) {
      console.error('Error fetching room details:', error);
    }
  };

  useEffect(() => {
    fetchRoomDetails();
  }, [id]);

  const fetchUsers = async () => {
    try {
      let available = await rooms.getUsers(id);
      let response = await users.getAll();
      // delete available users from the list
      response.data.users = response.data.users.filter(
        (user) => !available.data.users.some((u) => u.user_id === user.id)
      );
      setUsers(response.data.users);
      setAvailableUsers(available.data.users);
      
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    if (showUserModal) {
      fetchUsers();
    }
  }, [showUserModal]);

  const fetchAvailableComputers = async () => {
    try {
      const response = await computers.getAll();
      // Filter out computers that it's already in the room room_id !== null
      const available = response.data.computers.filter(
        (comp) => comp.room_id === null
      );
      setAvailableComputers(available);
    } catch (error) {
      console.error('Error fetching available computers:', error);
    }
  };

  useEffect(() => {
    if (showManageModal) {
      fetchAvailableComputers();
    }
  }, [showManageModal]);

  const handleAddComputer = async (e) => {
    e.preventDefault();
    if (!selectedComputer) return;
    try {
      const response = await computers.addToRoom(selectedComputer, id);
      setSelectedComputer('');
      fetchRoomDetails();
      fetchAvailableComputers();
    } catch (error) {
      console.error('Error adding computer:', error);
    }
  };

  const handleRemoveComputer = async (computerId) => {
    try {
      await computers.removeFromRoom(computerId);
      fetchRoomDetails();
      fetchAvailableComputers();
      setComputers(computerList.filter(comp => comp.id !== computerId));
      // reload the available computers
    } catch (error) {
      console.error('Error removing computer:', error);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!permissions.can_view && !permissions.can_manage) {
      alert('Please select at least one permission');
      return;
    }
    try {
      await rooms.addUser(id, selectedUser, permissions);
      setSelectedUser('');
      setPermissions({ can_view: false, can_manage: false });
      fetchUsers();
    } catch (error) {
      console.error('Error adding user to room:', error);
    }
  };

  const handleRemoveUser = async (userId) => {
    try {
      await rooms.removeUser(id, userId);
      fetchUsers();
    } catch (error) {
      console.error('Error removing user from room:', error);
    }
  };

  if (!currentRoom) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center space-y-4">
          <FaSpinner className="animate-spin text-5xl text-blue-500 mx-auto" />
          <p className="text-gray-600">Loading room details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <RoomHeader
        room={currentRoom}
        user={user}
        onManageComputers={() => setShowManageModal(!showManageModal)}
        onManageUsers={() => setShowUserModal(!showUserModal)}
      />

      {/* Modal for managing computers */}
      {showManageModal && (
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 space-y-6">
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <FaPlus className="text-blue-500" />
            <span>Add Computer to Room</span>
          </h2>
          <form onSubmit={handleAddComputer}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Select Computer</label>
              <select
                value={selectedComputer}
                onChange={(e) => setSelectedComputer(e.target.value)}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select a computer...</option>
                {availableComputers.map((computer) => (
                  <option key={computer.id} value={computer.id}>
                    {computer.hostname} ({computer.ip_address})
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              Add Computer
            </button>
          </form>
        </div>
      )}

      {/* Modal for managing users */}
      {showUserModal && (
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 space-y-6">
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <FaUsers className="text-green-500" />
            <span>Manage Room Users</span>
          </h2>
          <form onSubmit={handleAddUser} className="mb-6">
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Select User</label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select a new user to add...</option>
                {userList.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                  </option>
                ))}
              </select>
            </div>
            {selectedUser && (
              <>
              <div className="mb-4 p-4 bg-gray-50 rounded">
                <label className="block text-gray-700 mb-2">Permissions for selected user</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={permissions.can_view}
                      onChange={(e) => setPermissions({...permissions, can_view: e.target.checked})}
                      className="mr-2"
                    />
                    Can View
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={permissions.can_manage}
                      onChange={(e) => setPermissions({...permissions, can_manage: e.target.checked})}
                      className="mr-2"
                    />
                    Can Manage
                  </label>
                </div>
              </div>
              <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              Add User
            </button>
              </>
            )}

          </form>
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Current Room Users</h3>
            <div className="space-y-4">
              {availableUsers.map((user) => (
                <div key={user.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{user.username}</p>
                    <p className="text-sm text-gray-600">{user.full_name}</p>
                    <div className="text-xs text-gray-500 mt-1">
                      <span className={`mr-3 ${user.can_view ? 'text-green-600' : 'text-red-600'}`}>
                        View: {user.can_view ? '✓' : '✗'}
                      </span>
                      <span className={user.can_manage ? 'text-green-600' : 'text-red-600'}>
                        Manage: {user.can_manage ? '✓' : '✗'}
                      </span>
                    </div>
                  </div>
                    <button 
                      onClick={() => handleRemoveUser(user.user_id)} 
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                    >
                      Remove
                    </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center space-x-2">
          <FaServer className="text-blue-500" />
          <span>Computers in this room</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {computerList.map((computer) => (
            <LazyLoadComponent key={computer.id}>
              <ComputerCard
                computer={computer}
                onRemove={handleRemoveComputer}
                user={user}
              />
            </LazyLoadComponent>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;
