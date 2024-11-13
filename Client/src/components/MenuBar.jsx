import React, { useState, useEffect } from "react";
import {
	FaHome,
	FaDesktop,
	FaDoorOpen,
	FaCog,
	FaSignOutAlt,
	FaSignInAlt,
	FaUsers  // Add this import
} from "react-icons/fa";
import { Link } from 'react-router-dom';
import { auth, users, computers, rooms  } from "../utils/api";

const MenuBar = ({ user }) => {
	const [roomCount, setRoomCount] = useState(0);
	const [computerCount, setComputerCount] = useState(0);
	const [userCount, setUserCount] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [activeMenuItem, setActiveMenuItem] = useState(null);
	const [onMenuItemClick, setOnMenuItemClick] = useState(null);

	useEffect(() => {
		const fetchData = async () => {
      try {
        if (user){
          const roomsList = await rooms.getCount();
          setRoomCount(roomsList.data.numberOfRooms);
          if (user.role === "admin") {
            const computersList = await computers.getCount();
            setComputerCount(computersList.data.numberOfComputers);
            const usersList = await users.getCount();
            setUserCount(usersList.data.numberOfUsers);
          }
        }
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
		};

		fetchData();
	}, [user]);

	const menuItems = user ? [
		// { name: "Dashboard", icon: FaHome, key: "dashboard" },
		{ name: "Rooms", icon: FaDoorOpen, key: "rooms", count: roomCount },
		(user.role === "admin" && {
			name: "Computers",
			icon: FaDesktop,
			key: "computers",
			count: computerCount,
		}),
		(user.role === "admin" && {
			name: "Users",
			icon: FaUsers,
			key: "users",
			count: userCount,
		}),
		// { name: "Settings", icon: FaCog, key: "settings" },
		{ name: "Logout", icon: FaSignOutAlt, key: "logout" },
	] : [
		{ name: "Login", icon: FaSignInAlt, key: "login" }
	];

	const handleMenuItemClick = async (key) => {
		if (key === 'logout') {
			await handleLogout();
			return;
		}
		
		if (typeof setActiveMenuItem === 'function') {
			setActiveMenuItem(key);
		}
		if (typeof onMenuItemClick === 'function') {
			onMenuItemClick(key);
		}
	};

	const handleLogout = async () => {
		try {
			await auth.logout();
			// Clear any stored user data/tokens
			localStorage.removeItem('token');
			document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
			// Force page refresh to clear React state
			window.location.href = "/login";
		} catch (error) {
			setError('Logout failed. Please try again.');
		}
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
