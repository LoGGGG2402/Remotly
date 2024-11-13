import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaServer, FaUsers, FaSpinner, FaPlus, FaTrash, FaNetworkWired } from 'react-icons/fa';
import { LazyLoadComponent } from 'react-lazy-load-image-component';
import { rooms, users, computers} from '../utils/api';

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
      const response = await computerList.getAll();
      console.log(response.data.computers);
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
      setComputers([...computerList, response.data.computer]);
      setSelectedComputer('');
    } catch (error) {
      console.error('Error adding computer:', error);
    }
  };

  const handleRemoveComputer = async (computerId) => {
    try {
      await computers.removeFromRoom(computerId);
      setComputers(computerList.filter(comp => comp.id !== computerId));
      // reload the available computers
      fetchAvailableComputers();
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

  const ComputerCard = ({ computer, onRemove }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    return (
      <div
        className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ${
          isHovered ? 'transform hover:-translate-y-2 hover:shadow-xl' : ''
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">{computer.hostname}</h3>
            <FaServer className="text-2xl text-blue-500" />
          </div>
          <ul className="space-y-2">
            <li className="flex items-center">
              <FaNetworkWired className="mr-2 text-gray-600" />
              <span className="text-gray-700">IP: {computer.ip_address}</span>
            </li>
            <li className="flex items-center">
              <span className="font-semibold mr-2">MAC:</span>
              <span className="text-gray-700">{computer.mac_address}</span>
            </li>
          </ul>
          {user?.role === 'admin' && (
            <button
              onClick={() => onRemove(computer.id)}
              className="mt-4 w-full flex items-center justify-center bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors duration-300"
            >
              <FaTrash className="mr-2" /> Remove
            </button>
          )}
        </div>
      </div>
    );
  };

  if (!currentRoom) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{currentRoom.name}</h1>
          <p className="text-gray-600 mt-2">{currentRoom.description}</p>
        </div>
        {user?.role === 'admin' && (
          <div className="flex space-x-4">
            <button
              onClick={() => setShowManageModal(!showManageModal)}
              className="flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-300"
            >
              <FaServer className="mr-2" /> Manage Computers
            </button>
            <button
              onClick={() => setShowUserModal(!showUserModal)}
              className="flex items-center bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors duration-300"
            >
              <FaUsers className="mr-2" /> Manage Users
            </button>
          </div>
        )}
      </div>

      {showManageModal && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <FaPlus className="mr-2 text-blue-500" /> Add Computer to Room
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

      {showUserModal && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <FaUsers className="mr-2 text-green-500" /> Add User to Room
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
                  {user?.role === 'admin' && (
                    <button 
                      onClick={() => handleRemoveUser(user.user_id)} 
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <FaServer className="mr-2 text-blue-500" /> Computers in this room
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {computerList.map((computer) => (
          <LazyLoadComponent key={computer.id}>
            <ComputerCard
              computer={computer}
              onRemove={handleRemoveComputer}
            />
          </LazyLoadComponent>
        ))}
      </div>
    </div>
  );
};

export default RoomDetails;
