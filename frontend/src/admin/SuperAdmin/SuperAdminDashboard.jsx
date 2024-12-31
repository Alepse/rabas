import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import SuperAdminSidebar from './superadmincomponents/superadminsidebar';
import { useAsyncList } from '@react-stately/data';
import axios from 'axios';
// Use the environment variable for the base URL
const BASE_URL = import.meta.env.VITE_BASE_URL; 

// Register chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Utility function to safely access object properties
const getKeyValue = (obj, key) => {
  return obj[key];
};

const SuperAdminDashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const chartRef = useRef(null);
  const [page, setPage] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [pendingVerifications, setPendingVerifications] = useState(0);
  const [businessOwners, setBusinessOwners] = useState(0);
  const [tourists, setTourists] = useState(0);
  const [reports, setReports] = useState(0);
  const [tableData, setTableData] = React.useState([]);  // Updated data for the table
  
  const [businessOwnersData, setBusinessOwnersData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Business Owners Applications',
        data: [],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  });
  
  const [activeUsersData, setActiveUsersData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Active Users',
        data: [],
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1,
      },
    ],
  });

  // Fetching data from both APIs: business owners and active users
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetching business owners data
        const businessOwnersResponse = await axios.get(`${BASE_URL}/superAdmin-applicationReports`);
        if (businessOwnersResponse.data.success) {
          const allMonths = [
            "January", "February", "March", "April", "May", "June", "July", 
            "August", "September", "October", "November", "December"
          ];
          
          const businessOwnersData = new Array(12).fill(0);
          businessOwnersResponse.data.businessOwnersData.labels.forEach((month, index) => {
            const monthIndex = allMonths.indexOf(month);
            if (monthIndex !== -1) {
              businessOwnersData[monthIndex] = businessOwnersResponse.data.businessOwnersData.datasets[0].data[index];
            }
          });

          setBusinessOwnersData({
            labels: allMonths,
            datasets: [
              {
                label: 'Business Owners Applications',
                data: businessOwnersData,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
              },
            ],
          });
        }

        // Fetching active users data
        const activeUsersResponse = await axios.get(`${BASE_URL}/superAdmin-userReports`);
        if (activeUsersResponse.data.success) {
          const allMonths = [
            "January", "February", "March", "April", "May", "June", "July", 
            "August", "September", "October", "November", "December"
          ];
          
          const activeUsersData = new Array(12).fill(0);
          activeUsersResponse.data.activeUsersData.labels.forEach((month, index) => {
            const monthIndex = allMonths.indexOf(month);
            if (monthIndex !== -1) {
              activeUsersData[monthIndex] = activeUsersResponse.data.activeUsersData.datasets[0].data[index];
            }
          });

          setActiveUsersData({
            labels: allMonths,
            datasets: [
              {
                label: 'User Registrations Report',
                data: activeUsersData,
                backgroundColor: 'rgba(255, 206, 86, 0.2)',
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 1,
              },
            ],
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures it runs only once when component mounts

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Reports',
      },
    },
  };

  useEffect(() => {
    const chart = chartRef.current;

    return () => {
      if (chart && chart.destroy) {
        chart.destroy(); // Prevent "canvas already in use" issue
      }
    };
  }, []);

  
  let list = useAsyncList({
    async load({ signal, cursor }) {
      if (cursor) {
        setPage((prev) => prev + 1);
      }

      const res = await fetch(cursor || "https://swapi.py4e.com/api/people/?search=", { signal });
      let json = await res.json();

      if (!cursor) {
        setIsLoading(false);
      }

      return {
        items: json.results,
        cursor: json.next,
      };
    },
  });

  const hasMore = page < 9;

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

  useEffect(() => {
    const fetchBusinessOwners = async () => {
      if(isLoggedIn){
        try {
          const response = await fetch(`${BASE_URL}/superAdmin-fetchAllBusinessOwners`, {
            credentials: 'include'
          });

          if (!response.ok) {
            throw new Error('Failed to fetch business owners');
          }

          const data = await response.json();
          if (data.success) {
            setTableData(data.data);
          } else {
            console.error('Failed to fetch business owners:', data.message);
          }
        } catch (error) {
          console.error('Error fetching business owners:', error);
        }
      };
    }

    fetchBusinessOwners();
  }, [isLoggedIn]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/superAdmin-fetchAllData`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        if (data.success) {
          setPendingVerifications(data.pendingVerifications);
          setBusinessOwners(data.businessOwners);
          setTourists(data.tourists);
          setReports(data.reports);
        } else {
          console.error('Failed to fetch data:', data.message);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-screen font-sans">
      {/* Sidebar */}
      <SuperAdminSidebar />

      {/* Main Dashboard Content */}
      <div className="flex-1 p-4 md:p-6 bg-gray-100 max-h-screen overflow-y-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">Dashboard</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-center">
          <div className="bg-red-400 text-white p-4 rounded shadow-md">
            <h2 className="text-lg">Pending Verifications</h2>
            <p className="text-2xl font-bold">{pendingVerifications}</p>
          </div>
          <div className="bg-green-400 text-white p-4 rounded shadow-md">
            <h2 className="text-lg">Business Owners</h2>
            <p className="text-2xl font-bold">{businessOwners}</p>
          </div>
          <div className="bg-purple-400 text-white p-4 rounded shadow-md">
            <h2 className="text-lg">Tourists</h2>
            <p className="text-2xl font-bold">{tourists}</p>
          </div>
          <div className="bg-pink-400 text-white p-4 rounded shadow-md">
            <h2 className="text-lg">Reports</h2>
            <p className="text-2xl font-bold">{reports}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white shadow-md rounded-lg p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-4 text-center">Business Owners Application Reports</h2>
            <div className="h-[400px] md:h-[500px] w-full">
              <Bar 
                data={businessOwnersData} 
                options={{
                  ...options,
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    ...options.plugins,
                    legend: {
                      position: 'top',
                      labels: {
                        font: {
                          size: window.innerWidth < 768 ? 12 : 14
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        font: {
                          size: window.innerWidth < 768 ? 12 : 14
                        }
                      }
                    },
                    x: {
                      ticks: {
                        font: {
                          size: window.innerWidth < 768 ? 12 : 14
                        }
                      }
                    }
                  }
                }} 
              />
            </div>
          </div>
          <div className="bg-white shadow-md rounded-lg p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-4 text-center">Active Users Reports</h2>
            <div className="h-[400px] md:h-[500px] w-full">
              <Bar 
                data={activeUsersData} 
                options={{
                  ...options,
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    ...options.plugins,
                    legend: {
                      position: 'top',
                      labels: {
                        font: {
                          size: window.innerWidth < 768 ? 12 : 14
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        font: {
                          size: window.innerWidth < 768 ? 12 : 14
                        }
                      }
                    },
                    x: {
                      ticks: {
                        font: {
                          size: window.innerWidth < 768 ? 12 : 14
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Business Owners Table */}
        <div className="mt-6 overflow-x-auto">
          <h2 className="text-xl md:text-2xl font-bold mb-4">Business Owners</h2>
          <div className="min-w-full bg-white shadow-md rounded">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-200 text-gray-600 text-xs md:text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Name</th>
                  <th className="py-3 px-6 text-left">Type of Business Owner</th>
                  <th className="py-3 px-6 text-left">No. Products</th>
                  <th className="py-3 px-6 text-left">Location</th>
                  <th className="py-3 px-6 text-left">Status</th>
                  <th className="py-3 px-6 text-left">Ranking</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-xs md:text-sm">
                {tableData.map((item, index) => (
                  <tr key={item.name + index}>
                    <td className="py-3 px-6 text-left whitespace-nowrap">{item.name}</td>
                    <td className="py-3 px-6 text-left">{item.type}</td>
                    <td className="py-3 px-6 text-left">{item.products}</td>
                    <td className="py-3 px-6 text-left">{item.location}</td>
                    <td className={`py-3 px-6 text-left ${
                      item.status === 'Reported' ? 'text-red-500' : 'text-green-500'
                    }`}>
                      {item.status}
                    </td>
                    <td className="py-3 px-6 text-left">{item.ranking}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;