import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaSearch, FaSync, FaNetworkWired, FaMicrochip, FaPlusCircle, FaMinusCircle, FaExchangeAlt } from "react-icons/fa";
import { computers, rooms } from '../utils/api';

const ComputerMonitor = ({ user }) => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("processes");
  const [processes, setProcesses] = useState([]);
  const [networkConnections, setNetworkConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("pid");
  const [sortOrder, setSortOrder] = useState("asc");
  const [roomList, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const processesResponse = await computers.getProcesses(id);
      const networkResponse = await computers.getNetwork(id);
      if (user.role === "admin") {
        const roomsResponse = await rooms.getAll();
        setRooms(Array.isArray(roomsResponse.data.rooms) ? roomsResponse.data.rooms : []);
      }
      setProcesses(Array.isArray(processesResponse.data.processList) ? processesResponse.data.processList : []);
      setNetworkConnections(Array.isArray(networkResponse.data.networkConnections) ? networkResponse.data.networkConnections : []);
    } catch (error) {
      setProcesses([]);
      setNetworkConnections([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleRefresh = () => {
    fetchData();
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  const filterAndSortData = (data) => {
    if (!Array.isArray(data)) {
      console.error("Expected an array, but received:", data);
      return [];
    }
    return data
      .filter((item) =>
        Object.values(item).some(
          (value) =>
            value &&
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
      .sort((a, b) => {
        if (a[sortBy] < b[sortBy]) return sortOrder === "asc" ? -1 : 1;
        if (a[sortBy] > b[sortBy]) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  };

  const tableStyles = {
    header: "sticky top-0 px-6 py-3 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors",
    cell: "px-6 py-4 whitespace-nowrap text-sm text-gray-900",
    row: "hover:bg-gray-50 transition-colors"
  };

  const buttonStyles = {
    primary: "px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors",
    secondary: "px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors",
    danger: "px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
  };

  const renderTableHeader = (label, key) => (
    <th className={tableStyles.header} onClick={() => handleSort(key)}>
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        {sortBy === key && (
          <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
        )}
      </div>
    </th>
  );

  const renderProcesses = () => {
    const filteredProcesses = filterAndSortData(processes);
    return (
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {renderTableHeader("PID", "pid")}
              {renderTableHeader("Name", "name")}
              {renderTableHeader("Username", "username")}
              {renderTableHeader("Status", "status")}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProcesses.map((process) => (
              <tr key={process.pid} className={tableStyles.row}>
                <td className={tableStyles.cell}>{process.pid}</td>
                <td className={tableStyles.cell}>{process.name}</td>
                <td className={tableStyles.cell}>{process.username}</td>
                <td className={tableStyles.cell}>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full
                    ${process.status === "running" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-gray-100 text-gray-800"}`}>
                    {process.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderNetworkConnections = () => {
    const filteredConnections = filterAndSortData(networkConnections);
    return (
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {renderTableHeader("PID", "pid")}
              {renderTableHeader("Type", "type")}
              {renderTableHeader("Local Address", "laddr")}
              {renderTableHeader("Remote Address", "raddr")}
              {renderTableHeader("Status", "status")}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredConnections.map((connection, index) => (
              <tr key={index} className={tableStyles.row}>
                <td className={tableStyles.cell}>{connection.pid}</td>
                <td className={tableStyles.cell}>{connection.type}</td>
                <td className={tableStyles.cell}>
                  {connection.laddr ? `${connection.laddr.ip}:${connection.laddr.port}` : 'N/A'}
                </td>
                <td className={tableStyles.cell}>
                  {connection.raddr ? `${connection.raddr.ip}:${connection.raddr.port}` : 'N/A'}
                </td>
                <td className={tableStyles.cell}>
                  <span
                    className={`inline-block px-2 py-1 rounded ${
                      connection.status === "ESTABLISHED" ? "bg-green-500 text-white" : "bg-yellow-500 text-black"
                    }`}
                  >
                    {connection.status}
                  </span>
                </td>
                
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const handleAddToRoom = async () => {
    if (selectedRoom) {
      try {
        await computers.addToRoom(id, selectedRoom);
        fetchData();
      } catch (error) {
        console.error("Error adding computer to room:", error);
      }
    }
  };

  const handleRemoveFromRoom = async () => {
    if (selectedRoom) {
      try {
        await computers.removeFromRoom(id);
        fetchData();
      } catch (error) {
        console.error("Error removing computer from room:", error);
      }
    }
  };

  const handleChangeRoom = async () => {
    if (selectedRoom) {
      try {
        await changeComputerRoom(id, selectedRoom);
        fetchData();
      } catch (error) {
        console.error("Error changing computer room:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Computer Monitor</h1>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <button
                  className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${activeTab === "processes" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
                  onClick={() => setActiveTab("processes")}
                >
                  <FaMicrochip className="inline-block mr-2" />
                  Processes
                </button>
                <button
                  className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${activeTab === "network" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
                  onClick={() => setActiveTab("network")}
                >
                  <FaNetworkWired className="inline-block mr-2" />
                  Network Connections
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                </div>
                <button
                  className={buttonStyles.primary}
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  <FaSync className={`inline-block mr-2 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>
            </div>
            {user && user.role === "admin" && (
              <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
                <select
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                >
                  <option value="">Select a room</option>
                  {roomList.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
                <button
                  className={buttonStyles.primary}
                  onClick={handleAddToRoom}
                >
                  <FaPlusCircle className="inline-block mr-2" />
                  Add to Room
                </button>
                <button
                  className={buttonStyles.danger}
                  onClick={handleRemoveFromRoom}
                >
                  <FaMinusCircle className="inline-block mr-2" />
                  Remove from Room
                </button>
                <button
                  className={buttonStyles.secondary}
                  onClick={handleChangeRoom}
                >
                  <FaExchangeAlt className="inline-block mr-2" />
                  Change Room
                </button>
              </div>
            )}
          </div>
          <div className="px-6 pb-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <div className="transition-all duration-300 ease-in-out">
                {activeTab === "processes" ? renderProcesses() : renderNetworkConnections()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComputerMonitor;
