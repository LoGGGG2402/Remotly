import React, { useState, useEffect } from "react";
import {
	FaHome,
	FaDesktop,
	FaDoorOpen,
	FaCog,
	FaSignOutAlt,
	FaSignInAlt
} from "react-icons/fa";
import { Link } from 'react-router-dom';
import { getNumberOfRooms, getNumberOfComputers, logout } from "../utils/api";

const MenuBar = ({ user }) => {
	const [roomCount, setRoomCount] = useState(0);
	const [computerCount, setComputerCount] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [activeMenuItem, setActiveMenuItem] = useState(null);
	const [onMenuItemClick, setOnMenuItemClick] = useState(null);

	useEffect(() => {
		const fetchData = async () => {
      try {
        console.log('user', user);
        if (user){
          const rooms = await getNumberOfRooms();
          setRoomCount(rooms.data.numberOfRooms);
          if (user.role === "admin") {
            const computers = await getNumberOfComputers();
            console.log('computers', computers.data.numberOfComputers);
            setComputerCount(computers.data.numberOfComputers);
            }
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setLoading(false);
      }
		};

		fetchData();
	}, [user]);

	const menuItems = user ? [
		{ name: "Dashboard", icon: FaHome, key: "dashboard" },
		{ name: "Rooms", icon: FaDoorOpen, key: "rooms", count: roomCount },
		(user.role === "admin" && {
			name: "Computers",
			icon: FaDesktop,
			key: "computers",
			count: computerCount,
		}),
		{ name: "Settings", icon: FaCog, key: "settings" },
		{ name: "Logout", icon: FaSignOutAlt, key: "logout" },
	] : [
		{ name: "Login", icon: FaSignInAlt, key: "login" }
	];

	const handleMenuItemClick = (key) => {
		if (typeof setActiveMenuItem === 'function') {
			setActiveMenuItem(key);
		}
		if (typeof onMenuItemClick === 'function') {
			onMenuItemClick(key);
		}
    console.log(`Clicked menu item: ${key}`);
	};

  const handleLogout = async () => {
    console.log('Logging out');
    await logout();
    window.location.href = "/login";
  }

	if (loading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="text-red-500 text-xl font-semibold">
					{error}
				</div>
			</div>
		);
	}

	return (
		<div className="bg-gray-800 text-white h-screen w-64 fixed left-0 top-0 overflow-y-auto">
			<div className="p-4">
				<h1 className="text-2xl font-bold mb-8">Admin Panel</h1>
				<nav>
					<ul>
						{menuItems.map((item) => (
							<li key={item.key} className="mb-4">
								<Link
									to={`/${item.key}`}
									onClick={() => handleMenuItemClick(item.key)}
									className={`flex items-center w-full p-2 rounded-md transition-colors duration-200 ${
										activeMenuItem === item.key
											? "bg-blue-600 text-white"
											: "text-gray-300 hover:bg-gray-700"
									}`}
								>
									<item.icon className="mr-3" />
									<span>{item.name}</span>
									{item.count !== undefined && (
										<span className="ml-auto bg-blue-500 text-white rounded-full px-2 py-1 text-xs">
											{item.count}
										</span>
									)}
								</Link>
							</li>
						))}
					</ul>
				</nav>
			</div>
		</div>
	);
};

export default MenuBar;
