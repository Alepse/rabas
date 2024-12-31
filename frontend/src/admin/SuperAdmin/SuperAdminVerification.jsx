import React, { useState, useEffect, useCallback } from 'react';
import { Modal, ModalBody, ModalFooter, ModalHeader, Button, Tooltip, ModalContent, useDisclosure } from '@nextui-org/react';
import Swal from 'sweetalert2';
import { FaEye, FaCheck, FaTimes } from 'react-icons/fa';
import SuperAdminSidebar from './superadmincomponents/superadminsidebar';
import SearchBar from './superadmincomponents/SearchBar'; // Import the SearchBar component
// Use the environment variable for the base URL
const BASE_URL = import.meta.env.VITE_BASE_URL; 

const SummaryCard = ({ title, count, color }) => (
  <div className={`${color} text-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow`}>
    <h2 className="text-lg mb-2 font-semibold">{title}</h2>
    <p className="text-4xl font-bold">{count}</p>
  </div>
);

// Reusable component for displaying status
const StatusBadge = ({ status }) => {
  const statusColors = {
    Pending: 'bg-yellow-400',
    Approved: 'bg-green-400',
    Rejected: 'bg-red-400',
  };
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm ${statusColors[status]} text-white`}>
      {status}
    </span>
  );
};

// Reusable component for action buttons
const ActionButton = ({ icon, tooltip, onClick, color }) => (
  <Tooltip content={tooltip}>
    <button className={`text-${color}-500 hover:text-${color}-700 mr-4`} onClick={onClick}>
      {icon}
    </button>
  </Tooltip>
);

// Remove the Highlight import and add this custom component
const Highlight = ({ content, match }) => {
  if (!match || !match.trim() || !content) return <span>{content}</span>;

  const parts = content.toString().split(new RegExp(`(${match})`, 'gi'));
  
  return (
    <span>
      {parts.map((part, i) => 
        part.toLowerCase() === match.toLowerCase() ? (
          <span key={i} className="bg-yellow-200 text-black px-1 rounded">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  );
};

const VerificationTable = ({ data, title, onUpdateStatus, searchTerm }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedItem, setSelectedItem] = useState(null);

  const handleViewClick = (item) => {
    setSelectedItem(item);
    onOpen();
  };

  const updateStatus = async (item, newStatus) => {
    try {
      const response = await fetch(`${BASE_URL}/updateStatus-businessApplications/${item.application_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log('Status updated:', data.message);
        return true;
      } else {
        console.error('Error updating status:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Error sending request:', error);
      return false;
    }
  };

  const handleApprove = (item) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You want to approve this application!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, approve it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const updateSuccessful = await updateStatus(item, 1);
        if (updateSuccessful) {
          Swal.fire({
            title: 'Approved!',
            text: 'The application has been approved.',
            icon: 'success',
            confirmButtonColor: '#0BDA51',
          });
          onUpdateStatus(item, 'Approved');
        } else {
          Swal.fire({
            title: 'Error!',
            text: 'Failed to update the status. Please try again later.',
            icon: 'error',
            confirmButtonColor: '#d33',
          });
        }
      }
    });
  };

  const handleReject = (item) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You want to reject this application!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, reject it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const updateSuccessful = await updateStatus(item, -1);
        if (updateSuccessful) {
          Swal.fire({
            title: 'Rejected!',
            text: 'The application has been rejected.',
            icon: 'success',
            confirmButtonColor: '#0BDA51',
          });
          onUpdateStatus(item, 'Rejected');
        } else {
          Swal.fire({
            title: 'Error!',
            text: 'Failed to update the status. Please try again later.',
            icon: 'error',
            confirmButtonColor: '#d33',
          });
        }
      }
    });
  };

  return (
    <div className="overflow-x-auto mb-8">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <table className="min-w-full bg-white shadow-md rounded-lg">
        <thead className="bg-gray-200">
          <tr>
            <th className="py-3 px-6 text-left">Business Name</th>
            <th className="py-3 px-6 text-left">Owner</th>
            <th className="py-3 px-6 text-left">Business Type</th>
            <th className="py-3 px-6 text-left">Category</th>
            <th className="py-3 px-6 text-left">Certificate No</th>
            <th className="py-3 px-6 text-left">Business Scope</th>
            <th className="py-3 px-6 text-left">Complete Address</th>
            <th className="py-3 px-6 text-left">Submission Date</th>
            <th className="py-3 px-6 text-left">Status</th>
            <th className="py-3 px-6 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="border-b hover:bg-gray-100 transition duration-300">
              <td className="py-3 px-6">
                {item.updatedBusinessName && item.updatedBusinessName !== item.businessName ? (
                  <div>
                    <span className="line-through text-gray-500">
                      <Highlight
                        content={item.businessName}
                        match={searchTerm}
                      />  
                    </span>
                    <div className="text-blue-600 font-semibold">
                      {'Updated: '}
                      <Highlight
                        content={item.updatedBusinessName}
                        match={searchTerm}
                      />
                    </div>
                  </div>
                ) : (
                  <Highlight
                    content={item.businessName}
                    match={searchTerm}
                  />
                )}
              </td>
              <td className="py-3 px-6">
                <Highlight
                  content={`${item.firstName} ${item.lastName}`}
                  match={searchTerm}
                />
              </td>
              <td className="py-3 px-6">
                <Highlight
                  content={item.businessType}
                  match={searchTerm}
                />
              </td>
              <td className="py-3 px-6">
                <Highlight
                  content={Array.isArray(item.category) ? item.category.join(', ') : item.category}
                  match={searchTerm}
                />
              </td>
              <td className="py-3 px-6">
                <Highlight
                  content={item.certNumber}
                  match={searchTerm}
                />
              </td>
              <td className="py-3 px-6">
                <Highlight
                  content={item.businessScope}
                  match={searchTerm}
                />
              </td>
              <td className="py-3 px-6">
                <Highlight
                  content={item.completeAddress}
                  match={searchTerm}
                />
              </td>
              <td className="py-3 px-6">
                {new Date(item.application_date).toISOString().split('T')[0]}
              </td>
              <td className="py-3 px-6">
                <StatusBadge 
                  status={
                    item.status === 1 
                      ? 'Approved' 
                      : item.status === -1 
                      ? 'Rejected' 
                      : 'Pending'
                  } 
                />
              </td>
              <td className="py-3 px-6 flex gap-2">
                <ActionButton 
                  icon={<FaEye />} 
                  tooltip="View Details" 
                  onClick={() => handleViewClick(item)} 
                  color="blue" 
                />
                {item.status === 0 && (
                  <>
                    <ActionButton 
                      icon={<FaCheck />} 
                      tooltip="Approve" 
                      onClick={() => handleApprove(item)} 
                      color="green" 
                    />
                    <ActionButton 
                      icon={<FaTimes />} 
                      tooltip="Reject" 
                      onClick={() => handleReject(item)} 
                      color="red" 
                    />
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={false} isKeyboardDismissDisabled={true}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Application Details</ModalHeader>
              <ModalBody>
                {selectedItem && (
                  <div className="space-y-4">
                    <p><strong>Business Name:</strong> {selectedItem.businessName}</p>
                    <p><strong>Owner:</strong> {`${selectedItem.firstName} ${selectedItem.lastName}`}</p>
                    <p><strong>Business Type:</strong> {selectedItem.businessType}</p>
                    <p><strong>Category:</strong> {Array.isArray(selectedItem.category) ? selectedItem.category.join(', ') : selectedItem.category}</p>
                    <p><strong>Certificate No:</strong> {selectedItem.certNumber}</p>
                    <p><strong>Business Scope:</strong> {selectedItem.businessScope}</p>
                    <p><strong>Complete Address:</strong> {selectedItem.completeAddress}</p>
                    <p><strong>Submission Date:</strong> 
                      {selectedItem.application_date 
                      ? new Date(selectedItem.application_date).toISOString().split('T')[0] 
                      : 'N/A'}
                    </p>
                    <p><strong>Status:</strong> <StatusBadge 
                      status={
                        selectedItem.status === 1 
                          ? 'Approved' 
                          : selectedItem.status === -1 
                          ? 'Rejected' 
                          : 'Pending'
                      } 
                    /></p>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

const SuperAdminVerification = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [verificationData, setVerificationData] = useState([]);
  const [searchTermAll, setSearchTermAll] = useState('');
  const [searchTermPending, setSearchTermPending] = useState('');
  const [searchTermApproved, setSearchTermApproved] = useState('');
  const [searchTermRejected, setSearchTermRejected] = useState('');
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedItem, setSelectedItem] = useState(null);

  const handleViewClick = (item) => {
    setSelectedItem(item);
    onOpen();
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
  
    // Simulate data fetching
  const fetchData = async () => {
    try {
      const response = await fetch(`${BASE_URL}/superAdmin-businessApplications`, {
        method: 'GET',
        credentials: 'include'
      });
      const data = await response.json();

      if (response.ok) {
        setVerificationData(data.businessApplications);
      } else {
        console.error('Error fetching business applications:', data.message);
      }
    } catch (error) {
      console.error('Error fetching Super Admin Business Applications: ', error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn]);

  const updateStatus = (item, newStatus) => {
    setVerificationData((prevData) =>
      prevData.map((dataItem) =>
        dataItem.certificateNo === item.certificateNo
          ? { ...dataItem, status: newStatus }
          : dataItem
      )
    );
  };

  const submitUpdateStatus = async (item, newStatus) => {
    try {
      const response = await fetch(`${BASE_URL}/updateStatus-businessApplications/${item.application_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log('Status updated:', data.message);
        return true;
      } else {
        console.error('Error updating status:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Error sending request:', error);
      return false;
    }
  };

  const handleApprove = (item) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You want to approve this application!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, approve it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const updateSuccessful = await submitUpdateStatus(item, 1);
        if (updateSuccessful) {
          Swal.fire({
            title: 'Approved!',
            text: 'The application has been approved.',
            icon: 'success',
            confirmButtonColor: '#0BDA51',
          });
          updateStatus(item, 'Approved');
        } else {
          Swal.fire({
            title: 'Error!',
            text: 'Failed to update the status. Please try again later.',
            icon: 'error',
            confirmButtonColor: '#d33',
          });
        }
      }
    });
  };

  const handleReject = (item) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You want to reject this application!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, reject it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const updateSuccessful = await submitUpdateStatus(item, -1);
        if (updateSuccessful) {
          Swal.fire({
            title: 'Rejected!',
            text: 'The application has been rejected.',
            icon: 'success',
            confirmButtonColor: '#0BDA51',
          });
          updateStatus(item, 'Rejected');
        } else {
          Swal.fire({
            title: 'Error!',
            text: 'Failed to update the status. Please try again later.',
            icon: 'error',
            confirmButtonColor: '#d33',
          });
        }
      }
    });
  };

  // Derived counts
  const appliedAttractions = verificationData.filter(item => item.businessType === ('attraction' || 'activity')).length;
  const appliedAccommodations = verificationData.filter(item => item.businessType === 'accommodation').length;
  const appliedFoods = verificationData.filter(item => item.businessType === 'food').length;
  const appliedShops = verificationData.filter(item => item.businessType === 'shop').length;
  const totalPending = verificationData.filter(item => item.status === 0).length;

  // Filter function
  const filterData = (data, searchTerm) => {
    return data.filter(item =>
      item.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.updatedBusinessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${item.firstName} ${item.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.businessType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (Array.isArray(item.category) ? item.category.join(', ').toLowerCase().includes(searchTerm.toLowerCase()) : item.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.certNumber.includes(searchTerm) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Memoized filtered data
  const filteredDataAll = filterData(verificationData, searchTermAll);
  const filteredDataPending = filterData(verificationData.filter(item => item.status === 0), searchTermPending);
  const filteredDataApproved = filterData(verificationData.filter(item => item.status === 1), searchTermApproved);
  const filteredDataRejected = filterData(verificationData.filter(item => item.status === -1), searchTermRejected);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <SuperAdminSidebar />

      <div className="flex-1 p-4 md:p-8 max-h-screen overflow-y-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Verification</h1>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 mb-6 md:mb-8 text-center">
          <SummaryCard title="Applied for Attraction" count={appliedAttractions} color="bg-red-400" />
          <SummaryCard title="Applied for Accommodation" count={appliedAccommodations} color="bg-teal-400" />
          <SummaryCard title="Applied for Food Places" count={appliedFoods} color="bg-purple-400" />
          <SummaryCard title="Applied for Shops" count={appliedShops} color="bg-blue-400" />
          <SummaryCard title="Pending Verification" count={totalPending} color="bg-pink-400" />
        </div>

        <div className="overflow-x-auto">
          <h2 className="text-xl md:text-2xl font-bold mb-4">All Applications</h2>
          <SearchBar placeholder="Search all applications..." onSearch={setSearchTermAll} />
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="text-xs md:text-sm">
                <tr>
                  <th className="py-3 px-6 text-left">Business Name</th>
                  <th className="py-3 px-6 text-left">Owner</th>
                  <th className="py-3 px-6 text-left">Business Type</th>
                  <th className="py-3 px-6 text-left">Category</th>
                  <th className="py-3 px-6 text-left">Certificate No</th>
                  <th className="py-3 px-6 text-left">Business Scope</th>
                  <th className="py-3 px-6 text-left">Complete Address</th>
                  <th className="py-3 px-6 text-left">Submission Date</th>
                  <th className="py-3 px-6 text-left">Status</th>
                  <th className="py-3 px-6 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs md:text-sm">
                {filteredDataAll.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-100 transition duration-300">
                    <td className="py-3 px-6">
                      {item.updatedBusinessName && item.updatedBusinessName !== item.businessName ? (
                        <div>
                          <span className="line-through text-gray-500">
                            <Highlight
                              content={item.businessName}
                              match={searchTermAll}
                            />  
                          </span>
                          <div className="text-blue-600 font-semibold">
                            {'Updated: '}
                            <Highlight
                              content={item.updatedBusinessName}
                              match={searchTermAll}
                            />
                          </div>
                        </div>
                      ) : (
                        <Highlight
                          content={item.businessName}
                          match={searchTermAll}
                        />
                      )}
                    </td>
                    <td className="py-3 px-6">
                      <Highlight
                        content={`${item.firstName} ${item.lastName}`}
                        match={searchTermAll}
                      />
                    </td>
                    <td className="py-3 px-6">
                      <Highlight
                        content={item.businessType}
                        match={searchTermAll}
                      />
                    </td>
                    <td className="py-3 px-6">
                      <Highlight
                        content={Array.isArray(item.category) ? item.category.join(', ') : item.category}
                        match={searchTermAll}
                      />
                    </td>
                    <td className="py-3 px-6">
                      <Highlight
                        content={item.certNumber}
                        match={searchTermAll}
                      />
                    </td>
                    <td className="py-3 px-6">
                      <Highlight
                        content={item.businessScope}
                        match={searchTermAll}
                      />
                    </td>
                    <td className="py-3 px-6">
                      <Highlight
                        content={item.completeAddress}
                        match={searchTermAll}
                      />
                    </td>
                    <td className="py-3 px-6">
                      {new Date(item.application_date).toISOString().split('T')[0]}
                    </td>
                    <td className="py-3 px-6">
                      <StatusBadge 
                        status={
                          item.status === 1 
                            ? 'Approved' 
                            : item.status === -1 
                            ? 'Rejected' 
                            : 'Pending'
                        } 
                      />
                    </td>
                    <td className="py-3 px-6 flex gap-2">
                      <ActionButton 
                        icon={<FaEye />} 
                        tooltip="View Details" 
                        onClick={() => handleViewClick(item)} 
                        color="blue" 
                      />
                      {item.status === 0 && (
                        <>
                          <ActionButton 
                            icon={<FaCheck />} 
                            tooltip="Approve" 
                            onClick={() => handleApprove(item)} 
                            color="green" 
                          />
                          <ActionButton 
                            icon={<FaTimes />} 
                            tooltip="Reject" 
                            onClick={() => handleReject(item)} 
                            color="red" 
                          />
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Modal isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={false} isKeyboardDismissDisabled={true}>
              <ModalContent>
                {(onClose) => (
                  <>
                    <ModalHeader className="flex flex-col gap-1">Application Details</ModalHeader>
                    <ModalBody>
                      {selectedItem && (
                        <div className="space-y-4">
                          <p><strong>Business Name:</strong> {selectedItem.businessName}</p>
                          <p><strong>Owner:</strong> {`${selectedItem.firstName} ${selectedItem.lastName}`}</p>
                          <p><strong>Business Type:</strong> {selectedItem.businessType}</p>
                          <p><strong>Category:</strong> {Array.isArray(selectedItem.category) ? selectedItem.category.join(', ') : selectedItem.category}</p>
                          <p><strong>Certificate No:</strong> {selectedItem.certNumber}</p>
                          <p><strong>Business Scope:</strong> {selectedItem.businessScope}</p>
                          <p><strong>Complete Address:</strong> {selectedItem.completeAddress}</p>
                          <p><strong>Submission Date:</strong> 
                            {selectedItem.application_date 
                            ? new Date(selectedItem.application_date).toISOString().split('T')[0] 
                            : 'N/A'}
                          </p>
                          <p><strong>Status:</strong> <StatusBadge 
                            status={
                              selectedItem.status === 1 
                                ? 'Approved' 
                                : selectedItem.status === -1 
                                ? 'Rejected' 
                                : 'Pending'
                            } 
                          /></p>
                        </div>
                      )}
                    </ModalBody>
                    <ModalFooter>
                      <Button color="danger" variant="light" onPress={onClose}>
                        Close
                      </Button>
                    </ModalFooter>
                  </>
                )}
              </ModalContent>
            </Modal>

          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4">Pending Applications</h2>
        <SearchBar placeholder="Search pending applications..." onSearch={setSearchTermPending} />
        <VerificationTable 
          data={filteredDataPending} 
          onUpdateStatus={updateStatus} 
          searchTerm={searchTermPending} 
        />

        <h2 className="text-2xl font-bold mb-4">Approved Applications</h2>
        <SearchBar placeholder="Search approved applications..." onSearch={setSearchTermApproved} />
        <VerificationTable 
          data={filteredDataApproved} 
          onUpdateStatus={updateStatus} 
          searchTerm={searchTermApproved} 
        />

        <h2 className="text-2xl font-bold mb-4">Rejected Applications</h2>
        <SearchBar placeholder="Search rejected applications..." onSearch={setSearchTermRejected} />
        <VerificationTable 
          data={filteredDataRejected} 
          onUpdateStatus={updateStatus} 
          searchTerm={searchTermRejected} 
        />
      </div>
    </div>
  );
};

export default SuperAdminVerification;
