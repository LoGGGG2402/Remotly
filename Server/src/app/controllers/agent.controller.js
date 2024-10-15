const { ComputerModel } = require('../models/Computer.model');

const agentController = {
  connect: async (req, res) => {
    try {
      const { hostname, ip_address, mac_address, os, os_version, memory, processor, storage } = req.body;

      if (!mac_address || !ip_address) {
        return res.status(400).json({ error: 'MAC address and IP address are required' });
      }

      let computer = await ComputerModel.findByMacAddress(mac_address);

      if (computer) {
        // Update existing computer
        computer = {
          ...computer,
          hostname,
          ip_address,
          os,
          os_version,
          memory,
          processor,
          storage,
          last_updated: new Date()
        };
        await ComputerModel.update(computer);
      } else {
        // Create new computer
        computer = {
          hostname,
          ip_address,
          mac_address,
          os,
          os_version,
          memory,
          processor,
          storage,
          last_updated: new Date()
        };
        const id = await ComputerModel.create(computer);
        computer.id = id;
      }

      console.log('Computer:', req.body);

      res.status(200).json({ message: 'Connection established', computer });
    } catch (error) {
      console.error('Error in computer connection:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  updateInfo: async (req, res) => {
    try {
      const { mac_address } = req.params;
      const { hostname, ip_address, os, os_version, memory, processor, storage } = req.body;

      const computer = await ComputerModel.findByMacAddress(mac_address);

      if (!computer) {
        return res.status(404).json({ error: 'Computer not found' });
      }

      const updatedComputer = {
        ...computer,
        hostname: hostname || computer.hostname,
        ip_address: ip_address || computer.ip_address,
        os: os || computer.os,
        os_version: os_version || computer.os_version,
        memory: memory || computer.memory,
        processor: processor || computer.processor,
        storage: storage || computer.storage,
        last_updated: new Date()
      };

      await ComputerModel.update(updatedComputer);

      console.log('Computer updated:', updatedComputer);

      res.status(200).json({ message: 'Computer info updated', computer: updatedComputer });
    } catch (error) {
      console.error('Error updating computer info:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = { agentController };