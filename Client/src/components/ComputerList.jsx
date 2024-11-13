import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaSpinner, FaWindows, FaLaptop, FaDesktop, FaInfoCircle } from "react-icons/fa";
import { BsArrowRightShort } from "react-icons/bs";
import { LazyLoadComponent } from "react-lazy-load-image-component";
import { computers } from "../utils/api";

const ComputerList = () => {
  const [computerList, setComputers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComputers = async () => {
      try {
        const { data } = await computers.getAll();
        setComputers(data.computers);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    fetchComputers();
  }, []);

  const filteredComputers = computerList.filter((computer) =>
    Object.values(computer).some((value) => {
      if (value === null) {
        return false;
      }
      return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
    })
  );

  const ComputerCard = ({ computer }) => {
    const [isHovered, setIsHovered] = useState(false);
  
    if (!computer || !computer.os || !computer.os.toLowerCase().includes("windows")) {
      return null;
    }

    // computer status off if computer.last_seen is more than 10 minutes ago
    const tenMinutesAgo = new Date().getTime() - 10 * 60 * 1000;
    const lastSeen = new Date(computer.last_updated).getTime();
    const isOffline = lastSeen < tenMinutesAgo;
    const status = isOffline ? "OFF" : "ON";
  
    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);
  
    return (
      <div
        className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ${isHovered ? 'transform hover:-translate-y-2 hover:shadow-xl' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        tabIndex={0}
        aria-label={`Computer Card for ${computer.name}`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">{computer.hostname || "Unknown Computer"}</h2>
            <FaWindows className="text-3xl text-blue-500" aria-label="Windows OS" />
          </div>
          <ul className="space-y-2">
            <li className="flex items-center">
              <FaLaptop className="mr-2"/>
              <span className="text-gray-700">{computer.os || "Unknown Type"}</span>
            </li>
            <li className="flex items-center"> 
                <FaWindows className="mr-2"/>
                <span className="text-gray-700">{computer.os_version || "Unknown Version"}</span>
            </li>
            {/* ip address */}
            <li className="flex items-center">
              <span className="font-semibold mr-2">IP Address:</span>
              <span className="text-gray-700">{computer.ip_address || "Unknown"}</span>
            </li>
            {/* ON or OFF */}
            <li className="flex items-center">
              <span className="font-semibold mr-2">Status:</span>
              <span className="text-gray-700">{status || "Unknown"}</span>
            </li>
            {/* CPU */}
            <li className="flex items-center">
              <span className="font-semibold mr-2">CPU:</span>
              <span className="text-gray-700">{computer.processor || "Unknown"}</span>
            </li>
            {/* RAM */}
            <li className="flex items-center">
              <span className="font-semibold mr-2">RAM:</span>
              <span className="text-gray-700">{computer.memory || "Unknown"}</span>
            </li>
            {/* Storage */}
            <li className="flex items-center">
              <span className="font-semibold mr-2">Storage:</span>
              <span className="text-gray-700">{computer.storage || "Unknown"}</span>
            </li>
          </ul>
        </div>
        <div className="bg-gray-100 px-6 py-4">
          <Link
            to={`/computers/${computer.id}`}
            className="flex items-center justify-center w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-300"
            aria-label="View more details"
          >
            View Details
            <BsArrowRightShort className="ml-2" />
          </Link>
        </div>
        {isHovered && (
          <div className="absolute top-0 right-0 m-2">
            <div className="relative group">
              <FaInfoCircle className="text-blue-500 cursor-pointer" />
              <div className="absolute right-0 w-48 p-2 mt-2 text-sm text-gray-600 bg-white rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Click 'View Details' for more information about this Windows computer.
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Computers</h1>
      <div className="mb-6 relative">
        <input
          type="text"
          placeholder="Search computers..."
          className="w-full p-3 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-4xl text-blue-500" />
        </div>
      ) : filteredComputers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComputers.map((computer) => (
            <LazyLoadComponent key={computer.id}>
              <ComputerCard computer={computer} />
            </LazyLoadComponent>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600">No computers found matching your search.</p>
      )}
    </div>
  );
};

export default ComputerList;
