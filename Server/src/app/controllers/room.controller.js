const RoomModel = require("../models/Room.model");
const { ComputerModel } = require("../models/Computer.model");
const { PermissionModel } = require("../models/Permission.model");

const roomController = {
	createRoom: async (req, res) => {
		try {
			const { name, description } = req.body;

			if (!name) {
				return res.status(400).json({ error: "Room name is required" });
			}

			const roomId = await RoomModel.create({ name, description });
			const room = await RoomModel.findById(roomId);

			res.status(201).json({
				message: "Room created successfully",
				room,
			});
		} catch (error) {
			console.error("Error creating room:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	},

	viewAllRooms: async (req, res) => {
		try {
			const rooms = await RoomModel.findAll();
			res.status(200).json({ rooms });
		} catch (error) {
			console.error("Error getting all rooms:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	},

	getNumberOfRooms: async (req, res) => {
		try {
			if (req.user.role == "admin") {
				const Rooms = await RoomModel.findAll();
				const numberOfRooms = Rooms.length;
				res.status(200).json({ numberOfRooms });
			} else {
				// Get the number of rooms the user has access to
				const rooms = await PermissionModel.findByUser(req.user.id);
				const numberOfRooms = rooms.length;
				res.status(200).json({ numberOfRooms });
			}
		} catch (error) {
			console.error("Error getting number of rooms:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	},

	deleteRoom: async (req, res) => {
		try {
			const { id } = req.params;

			const existingRoom = await RoomModel.findById(id);
			if (!existingRoom) {
				return res.status(404).json({ error: "Room not found" });
			}

			// Check if there are any computers in the room
			const computersInRoom = await ComputerModel.findByRoomId(id);
			if (computersInRoom.length > 0) {
				return res
					.status(400)
					.json({
						error: "Cannot delete room with assigned computers",
					});
			}

			await RoomModel.delete(id);
			res.status(200).json({ message: "Room deleted successfully" });
		} catch (error) {
			console.error("Error deleting room:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	},

	viewComputersInRoom: async (req, res) => {
		try {
			const { id } = req.params;

			const room = await RoomModel.findById(id);
			if (!room) {
				return res.status(404).json({ error: "Room not found" });
			}

			const computers = await ComputerModel.findByRoomId(id);
			res.status(200).json({ computers });
		} catch (error) {
			console.error("Error getting computers in room:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	},

	manageComputersInRoom: async (req, res) => {
		try {
			const { id } = req.params;
			const { name, description } = req.body;

			const room = await RoomModel.findById(id);
			if (!room) {
				return res.status(404).json({ error: "Room not found" });
			}

			const updatedRoom = {
				...room,
				name: name || room.name,
				description: description || room.description,
			};

			await RoomModel.update(updatedRoom);
			res.status(200).json({
				message: "Room updated successfully",
				room: updatedRoom,
			});
		} catch (error) {
			console.error("Error updating room:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	},

	// Admin
	addMultipleComputersToRoom: async (req, res) => {
		try {
			const { roomId } = req.params;
			const { computerIds } = req.body;

			const room = await RoomModel.findById(roomId);
			if (!room) {
				return res.status(404).json({ error: "Room not found" });
			}

			const computers = await Promise.all(
				computerIds.map((id) => ComputerModel.findById(id))
			);
			if (computers.some((computer) => !computer)) {
				return res
					.status(404)
					.json({ error: "Some computers not found" });
			}

			let successList = [];
			let errorList = [];

			for (const computer of computers) {
				try {
					await ComputerModel.update({
						...computer,
						room_id: roomId,
					});
					successList.push(computer.id);
				} catch (error) {
					errorList.push(computer.id);
				}
			}

			res.status(200).json({
				message: "Computers added to room successfully",
				success: successList,
				error: errorList,
			});
		} catch (error) {
			console.error("Error adding computers to room:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	},

	addUserToRoom: async (req, res) => {
		try {
			if (!req.user || !req.user.id) {
				return res.status(401).json({ error: "Unauthorized" });
			}

			if (req.user.role !== "admin") {
				return res.status(403).json({ error: "Forbidden" });
			}

			const { roomId } = req.params;
			const { userId } = req.body;

			const room = await RoomModel.findById(roomId);
			if (!room) {
				return res.status(404).json({ error: "Room not found" });
			}

			const user = await UserModel.findById(userId);
			if (!user) {
				return res.status(404).json({ error: "User not found" });
			}

			const updatedRoom = {
				...room,
				users: [...room.users, userId],
			};

			await RoomModel.update(updatedRoom);
			res.status(200).json({
				message: "User added to room successfully",
				room: updatedRoom,
			});
		} catch (error) {
			console.error("Error adding user to room:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	},

	removeUserFromRoom: async (req, res) => {
		try {
			const { roomId } = req.params;
			const { userId } = req.body;

			const room = await RoomModel.findById(roomId);
			if (!room) {
				return res.status(404).json({ error: "Room not found" });
			}

			const user = await UserModel.findById(userId);
			if (!user) {
				return res.status(404).json({ error: "User not found" });
			}

			const updatedRoom = {
				...room,
				users: room.users.filter((id) => id !== userId),
			};

			await RoomModel.update(updatedRoom);
			res.status(200).json({
				message: "User removed from room successfully",
				room: updatedRoom,
			});
		} catch (error) {
			console.error("Error removing user from room:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	},


};

module.exports = { roomController };
