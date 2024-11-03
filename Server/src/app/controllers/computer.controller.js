const { ComputerModel } = require("../models/Computer.model");
const RoomModel = require("../models/Room.model");
const {
	sendCommandToComputer,
	receiveComputerInfo,
} = require("../utils/agentCommunication");

const computerController = {
	getNumberOfComputers: async (req, res) => {
		try {
			if (req.user.role !== "admin") {
				res.status(403).json({ error: "Forbidden" });
			}
			const computers = await ComputerModel.findAll();
			const numberOfComputers = computers.length;
			res.status(200).json({ numberOfComputers });
		} catch (error) {
			console.error("Error getting number of computers:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	},

	viewAllComputers: async (req, res) => {
		try {
			const computers = await ComputerModel.findAll();
			res.status(200).json({ computers });
		} catch (error) {
			console.error("Error viewing all computers:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	},

	viewComputersInRoom: async (req, res) => {
		try {
			const { roomId } = req.params;
			const computers = await ComputerModel.findByRoomId(roomId);
			res.status(200).json({ computers });
		} catch (error) {
			console.error("Error viewing computers in room:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	},

	viewComputerProcesses: async (req, res) => {
		try {
			const { id } = req.params;
			const computer = await ComputerModel.findById(id);
			if (!computer) {
				return res.status(404).json({ error: "Computer not found" });
			}

			const command = "get_process_list";
			const processList = await sendCommandToComputer(
				computer.ip_address,
				command
			);

			if (!processList) {
				return res
					.status(503)
					.json({
						error: "Unable to retrieve process list from the computer",
					});
			}

			res.status(200).json({ processList });
		} catch (error) {
			console.error("Error viewing computer processes:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	},

	viewComputerNetwork: async (req, res) => {
		try {
			const { id } = req.params;
			const computer = await ComputerModel.findById(id);
			if (!computer) {
				return res.status(404).json({ error: "Computer not found" });
			}

			const command = "get_network_connections";
			const networkConnections = await sendCommandToComputer(
				computer.ip_address,
				command
			);

			if (!networkConnections) {
				return res
					.status(503)
					.json({
						error: "Unable to retrieve network connections from the computer",
					});
			}

			res.status(200).json({ networkConnections });
		} catch (error) {
			console.error("Error viewing computer network:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	},

	addToRoom: async (req, res) => {
		try {
			const { id } = req.params;
			const { roomId } = req.body;
			const computer = await ComputerModel.findById(id);
			if (!computer) {
				return res.status(404).json({ error: "Computer not found" });
			}

			const updatedComputer = {
				...computer,
				room_id: roomId,
			};


			await ComputerModel.update(updatedComputer);
			res.status(200).json({
				message: "Computer updated successfully",
				computer: updatedComputer,
			});
		} catch (error) {
			console.error("Error managing computer:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	},

	removeFromRoom: async (req, res) => {
		try {
			const { id } = req.params;
			const computer = await ComputerModel.findById(id);
			if (!computer) {
				return res.status(404).json({ error: "Computer not found" });
			}

			const updatedComputer = {
				...computer,
				room_id: null,
			};

			await ComputerModel.update(updatedComputer);
			res.status(200).json({
				message: "Computer removed from room successfully",
				computer: updatedComputer,
			});
		} catch (error) {
			console.error("Error removing computer from room:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	},

	changeRoom: async (req, res) => {
		try {
			const { id } = req.params;
			const { roomId } = req.body;

			const computer = await ComputerModel.findById(id);
			if (!computer) {
				return res.status(404).json({ error: "Computer not found" });
			}
			const room = await RoomModel.findById(roomId);
			if (!room) {
				return res.status(404).json({ error: "Room not found" });
			}

			const updatedComputer = {
				...computer,
				room_id: roomId,
			};

			await ComputerModel.update(updatedComputer);
			res.status(200).json({
				message: "Computer moved to room successfully",
				computer: updatedComputer,
			});
		} catch (error) {
			console.error("Error changing room for computer:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	},
};

module.exports = { computerController };
