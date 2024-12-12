import React, { useState } from 'react';
import SuperAdminSidebar from './superadmincomponents/superadminsidebar';
import SearchBar from './superadmincomponents/SearchBar';
import { Bar } from 'react-chartjs-2';
import Swal from 'sweetalert2';
import { Modal, ModalBody, ModalFooter, ModalHeader, Button, Tooltip, ModalContent, useDisclosure } from '@nextui-org/react';
import { FaEye, FaTrashAlt } from 'react-icons/fa';

// Summary Card Component
const SummaryCard = ({ title, count, color }) => (
  <div className={`${color} text-white p-4 md:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow`}>
    <h2 className="text-base md:text-lg mb-2 font-semibold">{title}</h2>
    <p className="text-2xl md:text-4xl font-bold">{count}</p>
  </div>
);

// Table Component with Action Column
const Table = ({ title, headers, data, requestSort, handleSearch, onViewDetails, onForceDelete }) => {
  return (
    <div className="mb-8 overflow-x-auto">
      <h2 className="text-xl md:text-2xl font-bold mb-4 text-left">{title}</h2>
      <SearchBar placeholder="Search by name..." onSearch={handleSearch} />
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead className="bg-gray-200">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="py-2 md:py-3 px-3 md:px-6 text-center text-sm md:text-base cursor-pointer hover:bg-gray-300 transition"
                  onClick={() => requestSort(index)}
                >
                  {header}
                </th>
              ))}
              <th className="py-2 md:py-3 px-3 md:px-6 text-center text-sm md:text-base">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className="border-b hover:bg-gray-100 transition duration-300">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="py-2 md:py-3 px-3 md:px-6 text-center text-sm md:text-base">
                    {cell}
                  </td>
                ))}
                <td className="py-2 md:py-3 px-3 md:px-6 flex justify-center space-x-2">
                  <Tooltip content="View Details">
                    <button className="text-blue-500 p-2 rounded" onClick={() => onViewDetails(row)}>
                      <FaEye className="text-sm md:text-base" />
                    </button>
                  </Tooltip>
                  <Tooltip content="Force Delete">
                    <button className="text-red-500 p-2 rounded" onClick={() => onForceDelete(row)}>
                      <FaTrashAlt className="text-sm md:text-base" />
                    </button>
                  </Tooltip>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Super Admin Reports Component
const SuperAdminReports = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedReport, setSelectedReport] = useState(null);
  const [deletedAccounts, setDeletedAccounts] = useState([]);

  // Summary Data
  const summaryData = [
    { title: 'Deactivated Accounts', count: 1, color: 'bg-red-400' },
    { title: 'Reported Tourist', count: 0, color: 'bg-teal-400' },
    { title: 'Reported Business Owner', count: 3, color: 'bg-purple-400' },
    { title: 'Total Reports', count: 3, color: 'bg-pink-400' },
  ];

  // Data for Pending Reports and Deactivated Accounts
  const pendingReportsHeaders = ['Name', 'Type of Users', 'No. Reports'];
  const pendingReportsData = [
    ['Lorem Ipsum', 'Business Owner', 10],
    ['Lorem Ipsum', 'Business Owner', 9],
    ['Lorem Ipsum', 'Business Owner', 8],
  ];

  const deactivatedAccountsHeaders = ['Name', 'Type of Users', 'Days Deactivated'];
  const deactivatedAccountsData = [
    ['Lorem Ipsum', 'Tourists', '0 days ago'],
  ];

  // Sorting logic
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = (data) => {
    if (!sortConfig.key) return data;
    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Search Functionality
  const handleSearch = (value) => {
    setSearchTerm(value.toLowerCase());
  };

  const filteredData = (data) => data.filter((row) => row[0].toLowerCase().includes(searchTerm));

  // Graph Data for Summary
  const barData = {
    labels: ['Deactivated Accounts', 'Reported Tourists', 'Reported Business Owners', 'Total Reports'],
    datasets: [{
      label: 'Number of Reports',
      data: [1, 0, 3, 3],
      backgroundColor: [
        'rgba(248, 113, 113, 0.8)', // red-400 with opacity
        'rgba(45, 212, 191, 0.8)',  // teal-400 with opacity
        'rgba(167, 139, 250, 0.8)', // purple-400 with opacity
        'rgba(244, 114, 182, 0.8)'  // pink-400 with opacity
      ],
      borderColor: [
        'rgb(248, 113, 113)', // red-400
        'rgb(45, 212, 191)',  // teal-400
        'rgb(167, 139, 250)', // purple-400
        'rgb(244, 114, 182)'  // pink-400
      ],
      borderWidth: 2,
      borderRadius: 6,
      hoverBackgroundColor: [
        'rgba(248, 113, 113, 1)', // full opacity on hover
        'rgba(45, 212, 191, 1)',
        'rgba(167, 139, 250, 1)',
        'rgba(244, 114, 182, 1)'
      ],
    }]
  };

  const handleViewDetails = (report) => {
    setSelectedReport({
      id: report[0], // Assuming the first column is ID
      name: report[1], // Assuming the second column is Name
      status: report[2], // Assuming the third column is Status
      description: "Sample description for the report", // Add more details as needed
      reportType: "Sample Report Type" // Add report type details
    });
    onOpen();
  };

  const handleForceDelete = (report) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "This action will permanently delete the account!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0BDA51',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setDeletedAccounts((prevDeletedAccounts) => [...prevDeletedAccounts, report]);

        Swal.fire({
          title: 'Deleted!',
          text: 'The account has been deleted.',
          icon: 'success',
          confirmButtonColor: '#0BDA51',
        });
        // Implement the deletion logic here
      }
    });
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100"> 
      <SuperAdminSidebar />

      <div className="flex-1 p-4 md:p-8 max-h-screen overflow-y-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Reports</h1>

        {/* Summary Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8 text-center">
          {summaryData.map((item, index) => (
            <SummaryCard key={index} title={item.title} count={item.count} color={item.color} />
          ))}
        </div>

        {/* Graphical Representation */}
        <div className="mb-6 md:mb-8 container max-h-[500px] md:max-h-[600px] flex justify-center flex-col items-center">
          <h2 className="text-xl md:text-2xl font-bold mb-4">Reports Summary</h2>
          <div className="w-full max-w-4xl h-[400px] md:h-[500px]">
            <Bar 
              data={barData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    position: 'top',
                    labels: {
                      font: {
                        size: window.innerWidth < 768 ? 12 : 14,
                        weight: 'bold'
                      },
                      padding: 20
                    }
                  },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                      size: 14,
                      weight: 'bold'
                    },
                    bodyFont: {
                      size: 13
                    },
                    displayColors: true,
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(0, 0, 0, 0.1)',
                      drawBorder: false
                    },
                    ticks: {
                      font: {
                        size: window.innerWidth < 768 ? 12 : 14
                      },
                      padding: 8,
                      stepSize: 1
                    }
                  },
                  x: {
                    grid: {
                      display: false
                    },
                    ticks: {
                      font: {
                        size: window.innerWidth < 768 ? 12 : 14
                      },
                      padding: 8
                    }
                  }
                },
                animation: {
                  duration: 1500,
                  easing: 'easeInOutQuart'
                },
                layout: {
                  padding: {
                    top: 20,
                    right: 20,
                    bottom: 20,
                    left: 20
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Pending Reports Table */}
        <Table
          title="Pending Reports"
          headers={pendingReportsHeaders}
          data={sortedData(filteredData(pendingReportsData))}
          requestSort={requestSort}
          handleSearch={handleSearch}
          onViewDetails={handleViewDetails}
          onForceDelete={handleForceDelete}
        />

        {/* Deactivated Accounts Table */}
        <Table
          title="Deactivated Accounts"
          headers={deactivatedAccountsHeaders}
          data={sortedData(filteredData(deactivatedAccountsData))}
          requestSort={requestSort}
          handleSearch={handleSearch}
          onViewDetails={handleViewDetails}
          onForceDelete={handleForceDelete}
        />

        {/* Deleted Accounts Table */}
        <Table
          title="Deleted Accounts"
          headers={deactivatedAccountsHeaders}
          data={sortedData(filteredData(deletedAccounts))}
          requestSort={requestSort}
          handleSearch={handleSearch}
          onViewDetails={handleViewDetails}
          onForceDelete={() => {}} // No further deletion needed
        />

        {/* Modal for Viewing Details */}
        <Modal 
          isOpen={isOpen} 
          onOpenChange={onOpenChange} 
          isDismissable={false} 
          isKeyboardDismissDisabled={true}
          className="max-w-[90%] md:max-w-[500px] mx-auto"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1 text-lg md:text-xl">
                  Report Details
                </ModalHeader>
                <ModalBody>
                  {selectedReport && (
                    <div className="space-y-3 md:space-y-4 text-sm md:text-base">
                      <p><strong>ID:</strong> {selectedReport.id}</p>
                      <p><strong>Name:</strong> {selectedReport.name}</p>
                      <p><strong>Status:</strong> {selectedReport.status}</p>
                      <p><strong>Description:</strong> {selectedReport.description}</p>
                      <p><strong>Report Type:</strong> {selectedReport.reportType}</p>
                    </div>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button 
                    color="danger" 
                    variant="light" 
                    onPress={onClose}
                    className="text-sm md:text-base"
                  >
                    Close
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
};

export default SuperAdminReports;
