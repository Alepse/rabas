import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TbWorld } from 'react-icons/tb';
import { CgLogOut } from 'react-icons/cg';
import { MdDashboard } from 'react-icons/md';
import { RiUserLine } from 'react-icons/ri';
import { IoMdRibbon } from 'react-icons/io';
import { FaBox, FaCar, FaBars, FaTimes } from 'react-icons/fa';
import { Button } from '@nextui-org/react';
import { MdDomainVerification } from "react-icons/md";
import { TbReport } from "react-icons/tb";

const SuperAdminSidebar = () => {
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile toggle state
  const location = useLocation();

  // Define nav items with icons, labels, and paths
  const navItems = [
    { icon: <MdDashboard className="text-2xl" />, label: 'Dashboard', path: '/superadmindashboard' },
    { icon: <RiUserLine className="text-2xl" />, label: 'Users', path: '/superadminusers' },
    { icon: <FaBox className="text-2xl" />, label: 'Products', path: '/superadminproducts' },
    { icon: <FaCar className="text-2xl" />, label: 'Transportation', path: '/superadmintransportation' },
    { icon: <MdDomainVerification  className="text-2xl" />, label: 'Verification', path: '/superadminverification' },
    { icon: <TbReport className="text-2xl" />, label: 'Reports', path: '/superadminreports' },
  ];

  // Update active navigation item based on current route
  useEffect(() => {
    const currentItem = navItems.find(item => item.path === location.pathname);
    if (currentItem) {
      setActiveNav(currentItem.label);
    }
  }, [location]);

  return (
    <div className="">
      {/* Mobile Toggle Button */}
      <div className="flex justify-between items-center bg-color1 p-4 lg:hidden">
        <h1 className="font-bold text-xl text-white">Super Admin Panel</h1>
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
            <h1 className="font-bold text-xl lg:text-2xl text-white text-center">RabaSorsogon</h1>
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

export default SuperAdminSidebar;
