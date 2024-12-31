import React, { useState, useEffect, useCallback } from 'react';
import SuperAdminSidebar from './superadmincomponents/superadminsidebar';
import {
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Card, CardBody, useDisclosure,
} from '@nextui-org/react';
import { FaEdit, FaPlus, FaTrashAlt } from 'react-icons/fa';
import Swal from 'sweetalert2'; // Import SweetAlert2
// Use the environment variable for the base URL
const BASE_URL = import.meta.env.VITE_BASE_URL; 

const SuperAdminTransportation = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [transportData, setTransportData] = useState([
    {
      terminal: 'Legazpi Terminal',
      routes: [
        { origin: 'Legazpi City', destination: 'Bulan', schedule: '5:30 AM - 7:00 PM', fare: '₱170', mode: 'Bus' },
        { origin: 'Legazpi City', destination: 'Bulan', schedule: '5:30 AM - 7:00 PM', fare: '₱230', mode: 'Van' },
        { origin: 'Legazpi City', destination: 'Donsol', schedule: '5:30 AM - 7:00 PM', fare: '₱150', mode: 'Van' },
        { origin: 'Legazpi City', destination: 'Pilar', schedule: '5:30 AM - 7:00 PM', fare: '₱100', mode: 'Van' },
        { origin: 'Legazpi City', destination: 'Sorsogon City', schedule: '5:30 AM - 7:00 PM', fare: '₱140', mode: 'Van' },
      ],
    },
    {
      terminal: 'SITEX - Sorsogon Integrated Terminal',
      routes: [
        { origin: 'Sorsogon City', destination: 'Bulan', schedule: '7:00 AM - 8:00 PM', fare: '₱144', mode: 'Modern Jeep' },
        { origin: 'Sorsogon City', destination: 'Bulusan', schedule: '7:00 AM - 8:00 PM', fare: '₱102', mode: 'Modern Jeep' },
        { origin: 'Sorsogon City', destination: 'Castilla', schedule: '7:00 AM - 8:00 PM', fare: '₱50', mode: 'Jeep' },
        { origin: 'Sorsogon City', destination: 'Gubat', schedule: '7:00 AM - 8:00 PM', fare: '₱47', mode: 'Jeep' },
        { origin: 'Sorsogon City', destination: 'Irosin', schedule: '7:00 AM - 8:00 PM', fare: '₱80', mode: 'Modern Jeep' },
        { origin: 'Sorsogon City', destination: 'Juban', schedule: '7:00 AM - 8:00 PM', fare: '₱140', mode: 'Van' },
        { origin: 'Sorsogon City', destination: 'Magallanes', schedule: '7:00 AM - 8:00 PM', fare: '₱110', mode: 'Modern Jeep' },
        { origin: 'Sorsogon City', destination: 'Prieto Diaz', schedule: '7:00 AM - 8:00 PM', fare: '₱78', mode: 'Modern Jeep' },
        { origin: 'Sorsogon City', destination: 'Sta. Magdalena', schedule: '7:00 AM - 8:00 PM', fare: '₱80', mode: 'Jeep' },
      ],
    },
  ]);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentRoute, setCurrentRoute] = useState(null);
  const [currentTerminalIndex, setCurrentTerminalIndex] = useState(null);
  const [currentRouteIndex, setCurrentRouteIndex] = useState(null);

  const handleEdit = (terminalIndex, routeIndex) => {
    setCurrentTerminalIndex(terminalIndex);
    setCurrentRouteIndex(routeIndex);
    setCurrentRoute({ ...transportData[terminalIndex].routes[routeIndex] });
    onOpen();
  };

  const handleSave = () => {
    const updatedData = [...transportData];
    updatedData[currentTerminalIndex].routes[currentRouteIndex] = currentRoute;
    setTransportData(updatedData);
    onClose();
    Swal.fire({
      title: 'Success',
      text: 'Route updated successfully!',
      icon: 'success',
      confirmButtonColor: '#0BDA51',
      cancelButtonColor: '#D33736',
    });
  };

  const handleDelete = (terminalIndex, routeIndex) => {
    const updatedData = [...transportData];
    updatedData[terminalIndex].routes.splice(routeIndex, 1);
    setTransportData(updatedData);
    Swal.fire({
      title: 'Deleted',
      text: 'Route deleted successfully!',
      icon: 'error',
      confirmButtonColor: '#0BDA51',
      cancelButtonColor: '#D33736',
    });
  };

  const handleAddRoute = (terminalIndex) => {
    setCurrentRoute({ origin: '', destination: '', schedule: '', fare: '', mode: '' });
    setCurrentTerminalIndex(terminalIndex);
    setCurrentRouteIndex(null);
    onOpen();
  };

  const handleSaveNewRoute = () => {
    const updatedData = [...transportData];
    updatedData[currentTerminalIndex].routes.push(currentRoute);
    setTransportData(updatedData);
    onClose();
    Swal.fire({
      title: 'Success',
      text: 'New route added successfully!',
      icon: 'success',
      confirmButtonColor: '#0BDA51',
      cancelButtonColor: '#D33736',
    });
  };

  // Function to check login status
  const checkLoginStatus = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/superadmin/check-login`, {
        method: 'GET',
        credentials: 'include', // Include cookies
      });
      if (response.ok) {
        const data = await response.json();
        setIsLoggedIn(data.isLoggedIn); // Set login status

        if (!data.isLoggedIn) {
          window.location.href = '/superadminlogin';
        }
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    }
  }, []);

  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);  

  return (
    <div className="flex flex-col md:flex-row min-h-screen font-sans">
      <SuperAdminSidebar />

      <div className="flex-1 p-4 md:p-8 max-h-screen overflow-y-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-0">Transportation Management</h1>
        </div>

        {transportData.map((terminal, terminalIndex) => (
          <Card key={terminalIndex} className="mb-6 md:mb-8 shadow-xl rounded-lg">
            <CardBody className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3">
                <h2 className="text-xl md:text-2xl font-semibold mb-2 md:mb-0">{terminal.terminal}</h2>
                <Button
                  auto
                  className="bg-color1 text-white mt-2 md:mt-0"
                  icon={<FaPlus />}
                  onClick={() => handleAddRoute(terminalIndex)}
                >
                  Add New Route
                </Button>
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
                          <Button auto className='bg-color1 text-white' icon={<FaEdit />} onClick={() => handleEdit(terminalIndex, routeIndex)}>Edit</Button>
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

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalContent>
            <ModalHeader>{currentRouteIndex !== null ? 'Edit Route' : 'Add New Route'}</ModalHeader>
            <ModalBody>
              <Input
                label="Origin"
                value={currentRoute?.origin || ''}
                onChange={(e) => setCurrentRoute({ ...currentRoute, origin: e.target.value })}
                fullWidth
                required
              />
              <Input
                label="Destination"
                value={currentRoute?.destination || ''}
                onChange={(e) => setCurrentRoute({ ...currentRoute, destination: e.target.value })}
                fullWidth
                required
              />
              <Input
                label="Schedule"
                value={currentRoute?.schedule || ''}
                onChange={(e) => setCurrentRoute({ ...currentRoute, schedule: e.target.value })}
                fullWidth
                required
              />
              <Input
                label="Fare"
                type="number"
                value={currentRoute?.fare || ''}
                onChange={(e) => setCurrentRoute({ ...currentRoute, fare: e.target.value })}
                fullWidth
                required
              />
              <Input
                label="Mode"
                value={currentRoute?.mode || ''}
                onChange={(e) => setCurrentRoute({ ...currentRoute, mode: e.target.value })}
                fullWidth
                required
              />
            </ModalBody>
            <ModalFooter>
              <Button
                color="success"
                className="text-white"
                onClick={currentRouteIndex !== null ? handleSave : handleSaveNewRoute}
              >
                Save
              </Button>
              <Button color="danger" onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
};

export default SuperAdminTransportation;
