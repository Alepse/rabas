import React, { useState, useEffect } from 'react';
import { MdDashboard } from "react-icons/md";
import { RiProfileFill } from "react-icons/ri";
import { CiBoxes } from "react-icons/ci";
import { IoPricetagsOutline } from "react-icons/io5";
import { Link, useLocation } from "react-router-dom";
import { Button } from '@nextui-org/react';
import { FaBars, FaTimes, FaCalendar } from 'react-icons/fa';
import { CgLogOut } from "react-icons/cg";
import { TbWorld } from "react-icons/tb";
import CryptoJS from 'crypto-js';
// Use the environment variable for the base URL
const BASE_URL = import.meta.env.VITE_BASE_URL; 

// Function to encrypt the business_id
const encryptId = (id) => {
  const secretKey = import.meta.env.VITE_SECRET_KEY;
  if (!secretKey) {
    console.error('Secret key is not defined');
    return null;
  }
  const ciphertext = CryptoJS.AES.encrypt(id.toString(), secretKey).toString();
  return encodeURIComponent(ciphertext);
};

const Sidebar = () => {
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false); // For mobile toggle
  const location = useLocation();
  const [businessID, setBusinessID] = useState(null);

  const navItems = [
    { icon: <MdDashboard className="text-2xl" />, label: 'Dashboard', path: '/businessdashboardadmin' },
    { icon: <RiProfileFill className="text-2xl" />, label: 'Business Profile', path: '/businessprofileadmin' },
    { icon: <CiBoxes className="text-2xl" />, label: 'Business Products', path: '/businessproductsadmin' },
    { icon: <IoPricetagsOutline className="text-2xl" />, label: 'Business Deals', path: '/businessdealsadmin' },
    { icon: <FaCalendar className="text-2xl" />, label: 'Business Bookings', path: '/businessbookingadmin' }
  ];

  useEffect(() => {
    const currentItem = navItems.find(item => item.path === location.pathname);
    if (currentItem) {
      setActiveNav(currentItem.label);
    }
  }, [location]);

  // Fetching business data from the backend and updating Redux
  const fetchBusinessData = async () => {
    try {
      const response = await fetch(`${BASE_URL}/get-businessData`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success && data.businessData.length > 0) {
        setBusinessID(data.businessData[0].business_id);
      }
    } catch (error) {
      console.error('Error fetching business data:', error);
    }
  };

  useEffect(() => {
    fetchBusinessData(); // Fetch business data on component mount
  }, []);

  return (
    <div className=''>
      {/* Mobile Toggle Button */}
      <div className="flex justify-between items-center bg-color1 p-4 lg:hidden">
        <h1 className="font-bold text-xl text-white">Business Management</h1>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white text-3xl">
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Sidebar for desktop and mobile */}
      <div
        className={`fixed lg:flex flex-col top-0 left-0 justify-between h-full bg-color1 p-6 w-[220px] transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:static z-50`}
      >
        <div>
          {/* Logo and title */}
          <div className="flex flex-col items-center mt-3">
            <h1 className="font-bold text-2xl lg:text-3xl text-white text-center">Business Management</h1>
            <div className="w-full flex justify-center mt-3">
              <div className="w-[150px] lg:w-[200px] mt-3 bg-slate-600 h-[2px]"></div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="mt-12 text-sm">
            <ul className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link to={item.path} key={item.label}>
                  <li
                    className={`flex items-center gap-2 p-2 rounded-md cursor-pointer ${
                      activeNav === item.label
                        ? 'bg-light text-black'
                        : 'text-white hover:bg-light hover:text-dark hover:scale-105'
                    } transition-transform duration-300`}
                    onClick={() => {
                      setActiveNav(item.label);
                      setSidebarOpen(false); // Close sidebar on mobile when a nav item is clicked
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </li>
                </Link>
              ))}
            </ul>
          </nav>
        </div>
        {/* Buttons */}
        <div className="flex flex-col gap-2 mt-9 items-center ">
          <Link to={businessID ? `/business/${encryptId(businessID)}` : '#'} target='_blank'>
            <Button className="bg-color3 text-black font-medium w-full flex items-center justify-center gap-2" disabled={!businessID}>
              <TbWorld /> Go to Business Page
            </Button>
          </Link>
          <Link to='/userprofile'>
            <Button className="bg-red-500 text-white font-medium w-full flex items-center justify-center gap-2">
              <CgLogOut /> Logout
            </Button>
          </Link>
        </div>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Sidebar;
