import React, { useState, useEffect } from "react";
import { FaSearch, FaSpinner } from "react-icons/fa";
import { LazyLoadComponent } from "react-lazy-load-image-component";
import { computers } from "../utils/api";
import ComputerCard from "./ComputerCard";

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

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          Computer Management
        </h1>
        
        <div className="mb-8 relative">
          <input
            type="text"
            placeholder="Search computers by name, IP, or specifications..."
            className="w-full p-4 pl-12 pr-4 rounded-lg border border-gray-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              shadow-sm text-gray-600 placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="space-y-3">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="h-4 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
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
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No computers found matching your search.</p>
            <p className="text-gray-400 mt-2">Try adjusting your search terms</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComputerList;
