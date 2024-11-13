import React, { useState, useEffect } from 'react';
import SuperAdminSidebar from './superadmincomponents/superadminsidebar';
import { Tabs, Tab, Card, CardBody } from '@nextui-org/react';
import SearchBar from './superadmincomponents/SearchBar'; // Import the SearchBar component

const SuperAdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/superAdmin-fetchAllUsers', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        console.error('Error fetching users:', data.message);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Filtered data based on search query
  const filteredData = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate counts for summary cards
  const touristCount = users.filter(user => user.type === 'Tourist').length;
  const businessCount = users.filter(user => user.type === 'Business Owner').length;
  const totalUsers = users.length;

  return (
    <div className="flex min-h-screen font-sans">
      {/* Sidebar */}
      <SuperAdminSidebar />

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-100 max-h-screen overflow-y-auto">
        <h1 className="text-3xl font-bold mb-4">Users</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6 text-center">
          <div className="bg-red-400 text-white p-4 rounded shadow-md">
            <h2 className="text-lg">Tourists</h2>
            <p className="text-2xl font-bold">{touristCount}</p>
          </div>
          <div className="bg-green-400 text-white p-4 rounded shadow-md">
            <h2 className="text-lg">Business Owners</h2>
            <p className="text-2xl font-bold">{businessCount}</p>
          </div>
          <div className="bg-purple-400 text-white p-4 rounded shadow-md">
            <h2 className="text-lg">Total Users</h2>
            <p className="text-2xl font-bold">{totalUsers}</p>
          </div>
        </div>

        {/* Search Bar */}
        <SearchBar placeholder="Search users..." onSearch={setSearchQuery} />

        {/* Tabs */}
        <Tabs
          aria-label="User Options"
          variant="underlined"
          className="border-b border-gray-200 mb-6"
        >
          <Tab key="all" title="All" className="hover:text-blue-500">
            <Card className="mt-4 shadow-lg rounded-lg">
              <CardBody className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white shadow-md rounded-lg">
                    <thead className='bg-gray-200 text-gray-600 uppercase text-sm leading-normal'>
                      <tr>
                        <th className="py-2 px-4 border-b">Name</th>
                        <th className="py-2 px-4 border-b">Email</th>
                        <th className="py-2 px-4 border-b">Type of Users</th>
                        <th className="py-2 px-4 border-b">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((user, index) => (
                        <tr key={index} className="hover:bg-gray-100 transition duration-300">
                          <td className="py-2 px-4 border-b">{user.name}</td>
                          <td className="py-2 px-4 border-b">{user.email}</td>
                          <td className="py-2 px-4 border-b">{user.type}</td>
                          <td className="py-2 px-4 border-b">
                            <button className="text-red-500 hover:text-red-700">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          </Tab>
          <Tab key="tourists" title="Tourists" className="hover:text-blue-500">
            <Card className="mt-4 shadow-lg rounded-lg">
              <CardBody className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white shadow-md rounded-lg">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 border-b">Name</th>
                        <th className="py-2 px-4 border-b">Email</th>
                        <th className="py-2 px-4 border-b">Type of Users</th>
                        <th className="py-2 px-4 border-b">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData
                        .filter(user => user.type === 'Tourist')
                        .map((user, index) => (
                          <tr key={index} className="hover:bg-gray-100 transition duration-300">
                            <td className="py-2 px-4 border-b">{user.name}</td>
                            <td className="py-2 px-4 border-b">{user.email}</td>
                            <td className="py-2 px-4 border-b">{user.type}</td>
                            <td className="py-2 px-4 border-b">
                              <button className="text-red-500 hover:text-red-700">Delete</button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          </Tab>
          <Tab key="business" title="Business Owner" className="hover:text-blue-500">
            <Card className="mt-4 shadow-lg rounded-lg">
              <CardBody className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white shadow-md rounded-lg">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 border-b">Name</th>
                        <th className="py-2 px-4 border-b">Email</th>
                        <th className="py-2 px-4 border-b">Type of Users</th>
                        <th className="py-2 px-4 border-b">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData
                        .filter(user => user.type === 'Business Owner')
                        .map((user, index) => (
                          <tr key={index} className="hover:bg-gray-100 transition duration-300">
                            <td className="py-2 px-4 border-b">{user.name}</td>
                            <td className="py-2 px-4 border-b">{user.email}</td>
                            <td className="py-2 px-4 border-b">{user.type}</td>
                            <td className="py-2 px-4 border-b">
                              <button className="text-red-500 hover:text-red-700">Delete</button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
};

export default SuperAdminUsers;