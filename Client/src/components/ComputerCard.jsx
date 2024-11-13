
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaWindows, FaLaptop, FaInfoCircle } from 'react-icons/fa';
import { BsArrowRightShort } from 'react-icons/bs';

const ComputerCard = ({ computer }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!computer?.os?.toLowerCase().includes('windows')) return null;

  const tenMinutesAgo = new Date().getTime() - 10 * 60 * 1000;
  const lastSeen = new Date(computer.last_updated).getTime();
  const isOffline = lastSeen < tenMinutesAgo;
  const status = isOffline ? 'OFF' : 'ON';

  const statusColor = isOffline ? 'text-red-500' : 'text-green-500';

  return (
    <div
      className={`
        bg-white rounded-lg shadow-md overflow-hidden
        transition-all duration-300 hover:shadow-2xl
        transform hover:-translate-y-2
        border border-gray-100
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 truncate">
            {computer.hostname || "Unknown Computer"}
          </h2>
          <div className="flex items-center space-x-2">
            <FaWindows className="text-2xl text-blue-500" />
            <span className={`font-bold ${statusColor}`}>{status}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'OS', value: computer.os, icon: FaLaptop },
            { label: 'Version', value: computer.os_version, icon: FaWindows },
            { label: 'IP', value: computer.ip_address },
            { label: 'CPU', value: computer.processor },
            { label: 'RAM', value: computer.memory },
            { label: 'Storage', value: computer.storage }
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center space-x-2">
              {Icon && <Icon className="text-gray-400" />}
              <span className="text-sm text-gray-600">{value || 'Unknown'}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <Link
          to={`/computers/${computer.id}`}
          className="flex items-center justify-center w-full bg-blue-500 text-white py-2 px-4 rounded-md
            hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
            transition-colors duration-300"
        >
          View Details
          <BsArrowRightShort className="ml-2" />
        </Link>
      </div>

      {isHovered && (
        <div className="absolute top-2 right-2">
          <div className="relative group">
            <FaInfoCircle className="text-blue-500" />
            <div className="absolute right-0 w-48 p-2 mt-2 text-sm bg-white rounded-md shadow-xl
              opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Click for more details about this computer
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComputerCard;