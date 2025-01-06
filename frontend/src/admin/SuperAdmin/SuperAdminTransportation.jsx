import React, { useState, useEffect } from 'react';
import SuperAdminSidebar from './superadmincomponents/superadminsidebar';
import {
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Card, CardBody, useDisclosure,
} from '@nextui-org/react';
import { FaEdit, FaPlus, FaTrashAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axios from 'axios';
const BASE_URL = import.meta.env.VITE_BASE_URL;

const RouteInput = ({ label, value, onChange, type = 'text', required = false }) => (
  <Input
    label={label}
    value={value}
    onChange={onChange}
    type={type}
    fullWidth
    required={required}
  />
);

const TerminalInput = ({ label, value, onChange, type = 'text', required = false }) => (
  <Input
    label={label}
    value={value}
    onChange={onChange}
    type={type}
    fullWidth
    required={required}
  />
);

const SuperAdminTransportation = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [transportData, setTransportData] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isTerminalModalOpen, setIsTerminalModalOpen] = useState(false);
  const [isAddRouteModalOpen, setIsAddRouteModalOpen] = useState(false);
  const [currentRoute, setCurrentRoute] = useState(null);
  const [currentTerminalIndex, setCurrentTerminalIndex] = useState(null);
  const [currentRouteIndex, setCurrentRouteIndex] = useState(null);
  const [newTerminalName, setNewTerminalName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleEdit = (terminalIndex, routeIndex) => {
    setCurrentTerminalIndex(terminalIndex);
    setCurrentRouteIndex(routeIndex);
    setCurrentRoute({ ...transportData[terminalIndex].routes[routeIndex] });
    onOpen();
  };

  const fetchTransportData = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/get-transport-data`);
      setTransportData(response.data);
    } catch (error) {
      console.error('Error fetching transportation data:', error);
      Swal.fire('Error', 'Failed to fetch transportation data.', 'error');
    }
  };

  useEffect(() => {
    fetchTransportData();
  }, []);

  const handleSave = async () => {
    try {
      if (!currentRoute.origin || !currentRoute.destination || !currentRoute.schedule || currentRoute.fare <= 0) {
        Swal.fire('Validation Error', 'Please fill in all fields correctly.', 'error');
        return;
      }

      const { origin, destination, schedule, fare, mode } = currentRoute;
      const routeId = transportData[currentTerminalIndex].routes[currentRouteIndex].id; // Get the existing route id

      const response = await axios.put(`${BASE_URL}/edit-route/${routeId}`, {
        origin,
        destination,
        schedule,
        fare,
        mode,
      });

      const updatedData = [...transportData];
      updatedData[currentTerminalIndex].routes[currentRouteIndex] = currentRoute;
      setTransportData(updatedData);
      onClose();
      Swal.fire('Success', 'Route updated successfully!', 'success');
    } catch (error) {
      console.error('Error saving route:', error);
      Swal.fire('Error', 'Failed to save route.', 'error');
    }
  };

  const handleDelete = async (terminalIndex, routeIndex) => {
    try {
      console.log(transportData);
      const routeId = transportData[terminalIndex].routes[routeIndex].id;
      
      await axios.delete(`${BASE_URL}/delete-route/${routeId}`);

      const updatedData = [...transportData];
      updatedData[terminalIndex].routes.splice(routeIndex, 1);
      setTransportData(updatedData);
      Swal.fire('Deleted', 'Route deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting route:', error);
      Swal.fire('Error', 'Failed to delete route.', 'error');
    }
  };

  const handleAddRoute = (terminalIndex) => {
    setCurrentRoute({ origin: '', destination: '', schedule: '', fare: '', mode: '' });
    setCurrentTerminalIndex(terminalIndex);
    setCurrentRouteIndex(null);
    setIsAddRouteModalOpen(true);
  };

  const handleSaveNewRoute = async () => {
    try {
      if (!currentRoute.origin || !currentRoute.destination || !currentRoute.schedule || currentRoute.fare <= 0) {
        Swal.fire('Validation Error', 'Please fill in all fields correctly.', 'error');
        return;
      }

      const { origin, destination, schedule, fare, mode } = currentRoute;
      const terminalId = transportData[currentTerminalIndex].terminal_id;

      const response = await axios.post(`${BASE_URL}/add-route`, {
        terminal_id: terminalId,
        origin,
        destination,
        schedule,
        fare,
        mode,
      });

      const newRoute = { id: response.data.routeId, origin, destination, schedule, fare, mode };

      const updatedData = [...transportData];
      updatedData[currentTerminalIndex].routes.push(newRoute);
      setTransportData(updatedData);
      onClose();
      Swal.fire('Success', 'New route added successfully!', 'success');
    } catch (error) {
      console.error('Error adding route:', error);
      Swal.fire('Error', 'Failed to add route.', 'error');
    }
  };
  
  const handleAddTerminal = async () => {
    if (!newTerminalName) {
      Swal.fire('Validation Error', 'Please provide a terminal name.', 'error');
      return;
    }
  
    try {
      const response = await axios.post(`${BASE_URL}/add-terminal`, {
        terminal_name: newTerminalName, // Sending the terminal_name to the backend
      });
  
      // Construct the new terminal object using the data returned by the backend
      const newTerminal = {
        terminal_id: response.data.terminalId,  // ID returned from the backend
        terminal: response.data.terminalName,  // Name returned from the backend
        routes: [],  // Placeholder for routes
      };
  
      // Update the transport data with the newly added terminal
      setTransportData([...transportData, newTerminal]);
  
      // Close the terminal modal and reset the input field
      setIsTerminalModalOpen(false);
      setNewTerminalName('');
  
      // Show success message
      Swal.fire('Success', 'Terminal added successfully!', 'success');
    } catch (error) {
      console.error('Error adding terminal:', error);
      // Show error message in case of failure
      Swal.fire('Error', 'Failed to add terminal.', 'error');
    }
  };

  const handleDeleteTerminal = async (terminalIndex) => {
    try {
      const terminalId = transportData[terminalIndex].terminal_id;
  
      // Confirm deletion with the user
      const confirm = await Swal.fire({
        title: 'Are you sure?',
        text: 'This will delete the terminal and all its routes!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
      });
  
      if (confirm.isConfirmed) {
        // Send delete request to the backend
        await axios.delete(`${BASE_URL}/delete-terminal/${terminalId}`);
  
        // Update the state to remove the terminal
        const updatedData = [...transportData];
        updatedData.splice(terminalIndex, 1);
        setTransportData(updatedData);
  
        Swal.fire('Deleted!', 'Terminal has been deleted.', 'success');
      }
    } catch (error) {
      console.error('Error deleting terminal:', error);
      Swal.fire('Error', 'Failed to delete terminal.', 'error');
    }
  };
  
  
  const filteredData = transportData.map((terminal) => ({
    ...terminal,
    routes: terminal.routes.filter((route) =>
      route.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.destination.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  }));

  return (
    <div className="flex flex-col md:flex-row min-h-screen font-sans">
      <SuperAdminSidebar />

      <div className="flex-1 p-4 md:p-8 max-h-screen overflow-y-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-0">Transportation Management</h1>
          <Input
            placeholder="Search by origin or destination"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
          />
        </div>

        <Button
          auto
          className="bg-color1 text-white mb-6"
          icon={<FaPlus />}
          onClick={() => setIsTerminalModalOpen(true)}
        >
          Add New Terminal
        </Button>

        {filteredData.map((terminal, terminalIndex) => (
          <Card key={terminalIndex} className="mb-6 md:mb-8 shadow-xl rounded-lg">
            <CardBody className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3">
                <h2 className="text-xl md:text-2xl font-semibold mb-2 md:mb-0">{terminal.terminal}</h2>
                <div className="p-4">
                  <Button
                    auto
                    className="bg-color1 text-white mt-2 m-2 md:mt-0"
                    icon={<FaPlus />}
                    onClick={() => handleAddRoute(terminalIndex)}
                  >
                    Add New Route
                  </Button>
                  <Button
                    auto
                    color="danger"
                    className="mt-2 md:mt-0 m-2"
                    icon={<FaTrashAlt />}
                    onClick={() => handleDeleteTerminal(terminalIndex)}
                  >
                    Delete Terminal
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="text-xs md:text-sm">
                    <tr>
                      <th className="py-3 px-6 text-left font-medium">Origin</th>
                      <th className="py-3 px-6 text-left font-medium">Destination</th>
                      <th className="py-3 px-6 text-left font-medium">Schedule</th>
                      <th className="py-3 px-6 text-left font-medium">Fare</th>
                      <th className="py-3 px-6 text-left font-medium">Mode</th>
                      <th className="py-3 px-6 text-center font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs md:text-sm">
                    {terminal.routes.map((route, routeIndex) => (
                      <tr key={routeIndex} className="border-b hover:bg-blue-50 transition">
                        <td className="py-3 px-6">{route.origin}</td>
                        <td className="py-3 px-6">{route.destination}</td>
                        <td className="py-3 px-6">{route.schedule}</td>
                        <td className="py-3 px-6">{route.fare}</td>
                        <td className="py-3 px-6">{route.mode}</td>
                        <td className="py-3 px-6 flex justify-center space-x-2">
                          <Button auto className="bg-color1 text-white" icon={<FaEdit />} onClick={() => handleEdit(terminalIndex, routeIndex)}>Edit</Button>
                          <Button auto color="danger" icon={<FaTrashAlt />} onClick={() => handleDelete(terminalIndex, routeIndex)}>Delete</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        ))}

        <Modal isOpen={isTerminalModalOpen} onClose={() => setIsTerminalModalOpen(false)}>
          <ModalContent>
            <ModalHeader>Add New Terminal</ModalHeader>
            <ModalBody>
              <TerminalInput
                label="Terminal Name"
                value={newTerminalName}
                onChange={(e) => setNewTerminalName(e.target.value)}
                required
              />
            </ModalBody>
            <ModalFooter>
              <Button color="default" onClick={() => setIsTerminalModalOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-color1 text-white" onClick={handleAddTerminal}>
                Save Terminal
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalContent>
            <ModalHeader>Edit Route</ModalHeader>
            <ModalBody>
              <RouteInput
                label="Origin"
                value={currentRoute?.origin || ''}
                onChange={(e) => setCurrentRoute({ ...currentRoute, origin: e.target.value })}
                required
              />
              <RouteInput
                label="Destination"
                value={currentRoute?.destination || ''}
                onChange={(e) => setCurrentRoute({ ...currentRoute, destination: e.target.value })}
                required
              />
              <RouteInput
                label="Schedule"
                value={currentRoute?.schedule || ''}
                onChange={(e) => setCurrentRoute({ ...currentRoute, schedule: e.target.value })}
                required
              />
              <RouteInput
                label="Fare"
                value={currentRoute?.fare || ''}
                onChange={(e) => setCurrentRoute({ ...currentRoute, fare: e.target.value })}
                type="number"
                required
              />
              <RouteInput
                label="Mode"
                value={currentRoute?.mode || ''}
                onChange={(e) => setCurrentRoute({ ...currentRoute, mode: e.target.value })}
                required
              />
            </ModalBody>
            <ModalFooter>
              <Button color="default" onClick={onClose}>
                Cancel
              </Button>
              <Button className="bg-color1 text-white" onClick={handleSave}>
                Save Changes
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        <Modal isOpen={isAddRouteModalOpen} onClose={() => setIsAddRouteModalOpen(false)}>
          <ModalContent>
            <ModalHeader>Add New Route</ModalHeader>
            <ModalBody>
              <RouteInput
                label="Origin"
                value={currentRoute?.origin || ''}
                onChange={(e) => setCurrentRoute({ ...currentRoute, origin: e.target.value })}
              />
              <RouteInput
                label="Destination"
                value={currentRoute?.destination || ''}
                onChange={(e) => setCurrentRoute({ ...currentRoute, destination: e.target.value })}
              />
              <RouteInput
                label="Schedule"
                value={currentRoute?.schedule || ''}
                onChange={(e) => setCurrentRoute({ ...currentRoute, schedule: e.target.value })}
              />
              <RouteInput
                label="Fare"
                type="number"
                value={currentRoute?.fare || ''}
                onChange={(e) => setCurrentRoute({ ...currentRoute, fare: e.target.value })}
              />
              <RouteInput
                label="Mode"
                value={currentRoute?.mode || ''}
                onChange={(e) => setCurrentRoute({ ...currentRoute, mode: e.target.value })}
              />
            </ModalBody>
            <ModalFooter>
              <Button color="default" onnClick={() => setIsTerminalModalOpen(false)}>Cancel</Button>
              <Button className="bg-color1 text-white" onClick={handleSaveNewRoute}>Save Route</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
};

export default SuperAdminTransportation;
