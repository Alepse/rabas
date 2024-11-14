import React, { useEffect, useRef, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import SuperAdminSidebar from './superadmincomponents/superadminsidebar';
import { useAsyncList } from '@react-stately/data';

// Register chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Utility function to safely access object properties
const getKeyValue = (obj, key) => {
  return obj[key];
};

const SuperAdminDashboard = () => {
  const chartRef = useRef(null);

  // Sample data for the charts
  const businessOwnersData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
      {
        label: 'Business Owners Applications',
        data: [10, 25, 30, 40, 50, 60, 70],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const activeUsersData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
      {
        label: 'Active Users',
        data: [45, 60, 70, 80, 90, 100, 110],
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1,
      },
    ],
  };

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

  const [page, setPage] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);

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

  // Updated data for the table
  const [tableData, setTableData] = React.useState([]);

  useEffect(() => {
    const fetchBusinessOwners = async () => {
      try {
        const response = await fetch('http://localhost:5000/superAdmin-fetchAllBusinessOwners', {
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

    fetchBusinessOwners();
  }, []);

  const [pendingVerifications, setPendingVerifications] = useState(0);
  const [businessOwners, setBusinessOwners] = useState(0);
  const [tourists, setTourists] = useState(0);
  const [reports, setReports] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/superAdmin-fetchAllData', {
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
    <div className="flex min-h-screen font-sans">
      {/* Sidebar */}
      <SuperAdminSidebar />

      {/* Main Dashboard Content */}
      <div className="flex-1 p-6 bg-gray-100 max-h-screen overflow-y-auto">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6 text-center">
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
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white shadow-md rounded p-4 flex justify-center items-center flex-col">
            <h2 className="text-xl font-semibold mb-2">Business Owners Application Reports</h2>
            <div className="h-40 ">
              <Bar data={businessOwnersData} options={options} ref={chartRef} />
            </div>
          </div>
          <div className="bg-white shadow-md rounded p-4 flex justify-center items-center flex-col">
            <h2 className="text-xl font-semibold mb-2">Active Users Reports</h2>
            <div className="h-40">
              <Bar data={activeUsersData} options={options} ref={chartRef} />
            </div>
          </div>
        </div>

        {/* Business Owners Table */}
        <div className="mt-6">
          <h2 className="text-2xl font-bold mb-4">Business Owners</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded">
              <thead>
                <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Name</th>
                  <th className="py-3 px-6 text-left">Type of Business Owner</th>
                  <th className="py-3 px-6 text-left">No. Products</th>
                  <th className="py-3 px-6 text-left">Location</th>
                  <th className="py-3 px-6 text-left">Status</th>
                  <th className="py-3 px-6 text-left">Ranking</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm font-light">
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