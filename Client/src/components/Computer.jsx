import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaSearch, FaSync, FaNetworkWired, FaMicrochip, FaPlusCircle, FaMinusCircle, FaExchangeAlt } from "react-icons/fa";
import { getComputerProcesses, getComputerNetwork, addComputerToRoom, removeComputerFromRoom, changeComputerRoom, getAllRooms } from "../utils/api";

const ComputerMonitor = ({ user }) => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("processes");
  const [processes, setProcesses] = useState([]);
  const [networkConnections, setNetworkConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("pid");
  const [sortOrder, setSortOrder] = useState("asc");
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");



  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const processesResponse = await getComputerProcesses(id);
        const networkResponse = await getComputerNetwork(id);
        if (user.role === "admin"){
          const roomsResponse = await getAllRooms();
          setRooms(Array.isArray(roomsResponse.data.rooms) ? roomsResponse.data.rooms : []);
        }
        console.log('Processes response:', processesResponse.data.processList);
        console.log('Network response:', networkResponse.data.networkConnections);
        setProcesses(Array.isArray(processesResponse.data.processList) ? processesResponse.data.processList : []);
        setNetworkConnections(Array.isArray(networkResponse.data.networkConnections) ? networkResponse.data.networkConnections : []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setProcesses([]);
        setNetworkConnections([]);
      }
      setLoading(false);
    };
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

  const renderProcesses = () => {
    const filteredProcesses = filterAndSortData(processes);
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th
                className="px-4 py-2 cursor-pointer"
                onClick={() => handleSort("pid")}
              >
                PID {sortBy === "pid" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="px-4 py-2 cursor-pointer"
                onClick={() => handleSort("name")}
              >
                Name {sortBy === "name" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="px-4 py-2 cursor-pointer"
                onClick={() => handleSort("username")}
              >
                Username{" "}
                {sortBy === "username" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredProcesses.map((process) => (
              <tr key={process.pid} className="border-t border-gray-300">
                <td className="px-4 py-2">{process.pid}</td>
                <td className="px-4 py-2">{process.name}</td>
                <td className="px-4 py-2">{process.username}</td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-block w-3 h-3 rounded-full ${process.status === "running" ? "bg-green-500" : "bg-gray-500"}`}
                    title={process.status}
                  ></span>
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
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th
                className="px-4 py-2 cursor-pointer"
                onClick={() => handleSort("fd")}
              >
                FD {sortBy === "fd" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="px-4 py-2 cursor-pointer"
                onClick={() => handleSort("family")}
              >
                Family {sortBy === "family" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="px-4 py-2 cursor-pointer"
                onClick={() => handleSort("type")}
              >
                Type {sortBy === "type" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th className="px-4 py-2">Local Address</th>
              <th className="px-4 py-2">Remote Address</th>
              <th
                className="px-4 py-2 cursor-pointer"
                onClick={() => handleSort("status")}
              >
                Status {sortBy === "status" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="px-4 py-2 cursor-pointer"
                onClick={() => handleSort("pid")}
              >
                PID {sortBy === "pid" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredConnections.map((connection, index) => (
              <tr key={index} className="border-t border-gray-300">
                <td className="px-4 py-2">{connection.fd}</td>
                <td className="px-4 py-2">{connection.family}</td>
                <td className="px-4 py-2">{connection.type}</td>
                <td className="px-4 py-2">
                  {connection.laddr ? `${connection.laddr.ip}:${connection.laddr.port}` : 'N/A'}
                </td>
                <td className="px-4 py-2">
                  {connection.raddr ? `${connection.raddr.ip}:${connection.raddr.port}` : 'N/A'}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-block px-2 py-1 rounded ${
                      connection.status === "ESTABLISHED" ? "bg-green-500 text-white" : "bg-yellow-500 text-black"
                    }`}
                  >
                    {connection.status}
                  </span>
                </td>
                <td className="px-4 py-2">{connection.pid}</td>
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
        await addComputerToRoom(id, selectedRoom);
        fetchData();
      } catch (error) {
        console.error("Error adding computer to room:", error);
      }
    }
  };

  const handleRemoveFromRoom = async () => {
    if (selectedRoom) {
      try {
        await removeComputerFromRoom(id, selectedRoom);
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
    <div className="container mx-auto p-4 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Computer Monitor
      </h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
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
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={handleSearch}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            <button
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
              onClick={handleRefresh}
              disabled={loading}
            >
              <FaSync className={`inline-block mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>
        {user && user.role === "admin" && (
          <div className="flex items-center space-x-4 mb-4">
            <select
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
            >
              <option value="">Select a room</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
            <button
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
              onClick={handleAddToRoom}
            >
              <FaPlusCircle className="inline-block mr-2" />
              Add to Room
            </button>
            <button
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              onClick={handleRemoveFromRoom}
            >
              <FaMinusCircle className="inline-block mr-2" />
              Remove from Room
            </button>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={handleChangeRoom}
            >
              <FaExchangeAlt className="inline-block mr-2" />
              Change Room
            </button>
          </div>
        )}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="transition-all duration-300 ease-in-out">
            {activeTab === "processes" ? renderProcesses() : renderNetworkConnections()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComputerMonitor;
