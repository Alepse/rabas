import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Logo from '../assets/rabas.png';
import Logo2 from '../assets/Rabasorso.png';
import { Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Badge } from "@nextui-org/react";
import { CiSquareInfo } from "react-icons/ci";
import { TbNotes } from "react-icons/tb";
import LoginSignup from '@/auth/LoginSignup';
import { PiJeep } from "react-icons/pi";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { FaHome, FaBars, FaTimes, FaSearch, FaMapMarkerAlt } from 'react-icons/fa';
import { GiPositionMarker } from "react-icons/gi";
import { FaRegCircleUser } from "react-icons/fa6";
import { FaPersonWalking } from "react-icons/fa6";
import { Modal, ModalContent, ModalBody, useDisclosure } from "@nextui-org/react";
import { Link, useLocation } from 'react-router-dom';
import UserChatModal from '@/user/userChatSystem/UserChatModal';
import axios from 'axios';
import { Skeleton } from "@nextui-org/skeleton";


const Nav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('');
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  // Use the environment variable for the base URL
const BASE_URL = import.meta.env.VITE_BASE_URL; 

  const sampleData = {
    activities: [
      { name: 'Hiking Adventure', destination: 'Bulusan', image: 'https://via.placeholder.com/50' },
    ],
    accommodations: [
      { name: 'Luxury Hotel', destination: 'Sorsogon City', image: 'https://via.placeholder.com/50' },
    ],
    foodPlaces: [
      { name: 'Mountain View Dining', destination: 'Sorsogon City', image: 'https://via.placeholder.com/50' },
    ],
    shops: [
      { name: 'Sample Souvenir Shop', destination: 'Sorsogon City', image: 'https://via.placeholder.com/50' },
    ],
    locations: [
      { name: 'Bulusan' },
      { name: 'Bulan' },
      { name: 'Barcelona' },
    ],
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleScroll = () => {
    if (window.scrollY > 500) {
      setShowSearchBar(true);
    } else {
      setShowSearchBar(false);
    }
  };

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.length > 0) {
      performSearch(value);
    } else {
      setSearchResults([]);
    }
  };

  const performSearch = (query) => {
    let results = [];
    const firstLetter = query.charAt(0).toLowerCase();

    const matchesFirstLetter = (str) => str.charAt(0).toLowerCase() === firstLetter;

    switch (activeTab) {
      case 'all':
        results = [
          ...sampleData.activities.filter((activity) => matchesFirstLetter(activity.name)),
          ...sampleData.accommodations.filter((accommodation) => matchesFirstLetter(accommodation.name)),
          ...sampleData.foodPlaces.filter((food) => matchesFirstLetter(food.name)),
          ...sampleData.shops.filter((shop) => matchesFirstLetter(shop.name)),
          ...sampleData.locations.filter((location) => matchesFirstLetter(location.name)),
        ];
        break;
      case 'activities':
        results = sampleData.activities.filter((activity) => matchesFirstLetter(activity.name));
        break;
      case 'accommodation':
        results = sampleData.accommodations.filter((accommodation) => matchesFirstLetter(accommodation.name));
        break;
      case 'food':
        results = sampleData.foodPlaces.filter((food) => matchesFirstLetter(food.name));
        break;
      case 'shops':
        results = sampleData.shops.filter((shop) => matchesFirstLetter(shop.name));
        break;
      default:
        break;
    }

    setSearchResults(results);
  };

  const clearSearchField = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    setSearchQuery('');
    setSearchResults([]);
  };

  const openSearch = () => {
    setIsSearchOpen(true);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    clearSearchField();
  };

  const handleLogout = (e) => {
    e.preventDefault();
    axios.post(`${BASE_URL}/logout`, {}, { withCredentials: true })
      .then(response => {
        if (response.status === 200) {
          console.log('Logout successful');
          window.location.href = '/';
        } else {
          console.error('Logout failed');
        }
      })
      .catch(error => {
        console.error('Error logging out:', error.response ? error.response.data.message : 'An unknown error occurred');
      });
  };

  const fetchUserData = () => {
    axios
      .get(`${BASE_URL}/check-login`, { withCredentials: true })
      .then(response => {
        if (response.status === 200 && response.data.isLoggedIn) {
          setIsLoggedIn(true);
          // Fetch user data if logged in
          return axios.get(`${BASE_URL}/get-userData`, { withCredentials: true });
        } else {
          setIsLoggedIn(false);
        }
      })
      .then(response => {
        setUserData(response.data.userData);
      })
      .catch(error => {
        console.error(
          'Error:',
          error.response ? error.response.data.message : error.message || 'An unknown error occurred'
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
  useEffect(() => {
    fetchUserData();
  }, []);
  

  const firstLetter = userData?.username?.charAt(0).toUpperCase() || '';

  const openChatModal = () => {
    setIsChatModalOpen(true);
  };

  const closeChatModal = () => {
    setIsChatModalOpen(false);
  };

  const openSearchOverlay = () => {
    setIsSearchOverlayOpen(true);
  };

  const closeSearchOverlay = () => {
    setIsSearchOverlayOpen(false);
    clearSearchField();
  };

  const handleLinkClick = (link) => {
    setActiveLink(link);
  };

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location.pathname]);

  return (
    <div className={` bg-gradient-to-r from-color1 to-color2 flex justify-center fixed top-0 z-50 w-full shadow-lg`}>
      {loading ? (
        <div className="flex justify-between items-center w-full container mx-auto h-[4rem] p-4">
          {/* Logo Skeleton */}
          <div className="flex items-center space-x-2">
            <Skeleton className="h-[3rem] w-[3rem] rounded-full" />
            <Skeleton className="h-[1.5rem] w-[8rem] rounded-md" />
          </div>

          {/* Right-side Skeleton */}
          <div className="flex items-center space-x-4">
            {/* Search Bar Skeleton */}
            <div className="hidden xl:flex h-[2rem] w-[12rem] bg-gray-300 rounded-full"></div>
            {/* Nav Items Skeleton */}
            <div className="hidden xl:flex space-x-6">
              <Skeleton className="h-[1.5rem] w-[4rem] rounded-md" />
              <Skeleton className="h-[1.5rem] w-[6rem] rounded-md" />
              <Skeleton className="h-[1.5rem] w-[6rem] rounded-md" />
              <Skeleton className="h-[1.5rem] w-[5rem] rounded-md" />
              <Skeleton className="h-[1.5rem] w-[6rem] rounded-md" />
            </div>
            {/* Avatar/Dropdown Skeleton */}
            <Skeleton className="h-[2.5rem] w-[2.5rem] rounded-full" />
            {/* Hamburger Menu Skeleton */}
            <Skeleton className="h-[2rem] w-[2rem] rounded-md xl:hidden" />
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center w-full container  mx-auto h-[4rem] p-4">
          <a
            className='flex items-center hover:scale-105 duration-500'
            href='/'
            onClick={() => handleLinkClick('/')}
          >
            <img className="lg:h-[3rem] max-h-[3rem] lg:w-[3rem] max-w-[3rem]" src={Logo} alt="Logo" />
            <div className='text-white ml-2 text-lg font-mono '>RabaSorsogon</div>
          </a>
        
          <div className="flex items-center gap-3 xl:hidden">
            {isLoggedIn ? (
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <div className="cursor-pointer ml-6">
                    <Avatar
                      className='text-lg bg-color1 text-white duration-300'
                      src={userData?.image_path
                        ? `${BASE_URL}/${userData.image_path}`
                        : userData?.google_id
                          ? userData.image
                          : `https://ui-avatars.com/api/?name=${firstLetter}`
                      }
                    />
                  </div>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem key="profile">
                    <Link to='/userprofile' className="block w-full text-left p-2">
                      Profile
                    </Link>
                  </DropdownItem>
                  <DropdownItem key="messages" onClick={openChatModal}>
                    <div className='flex items-center gap-4 p-2'>
                      Messages
                      <Badge color='danger' placement='top-right' content='2' />
                    </div>
                  </DropdownItem>
                  <DropdownItem key="Bookings">
                    <Link to='/userprofile#myBookings' className="block w-full text-left p-2">Bookings</Link>
                  </DropdownItem>
                  <DropdownItem key="logout" onClick={handleLogout}>
                    <div className="block w-full text-left p-2">Logout</div>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            ) : (
              <div className="text-white hover:bg-color1 rounded-full cursor-pointer" onClick={onOpen}>
                <FaRegCircleUser className="text-3xl" />
              </div>
            )}

            <button onClick={toggleMenu} className=" text-2xl z-50 p-2">
              {isMenuOpen ? <FaTimes className='text-xl mb-3'/> : <FaBars className='text-white ' />}
            </button>
          </div>

          <div className="hidden xl:flex items-center gap-6">
            <div className="flex space-x-8 items-center text-color1">
            <div className="relative">
                <input
                  type="text"
                  placeholder={`Search for ${activeTab}`}
                  value={searchQuery}
                  onFocus={openSearchOverlay}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-full p-1 pl-8 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-color1 transition-all duration-300"
                />
                <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
                {searchQuery && (
                  <FaTimes
                    onClick={clearSearchField}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                  />
                )}
              </div>
              <div
                className={`cursor-pointer text text-white hover:font-semibold duration-100 text-lg font-light flex items-center gap-1 ${activeLink === '/' ? ' border-light border-b-1 p-1 font-semibold  ' : ''}`}
                onClick={() => setActiveLink('/')}
              >
                <FaHome /> <a href='/'>Home</a>
              </div>

              <NavigationMenu className='z-50'>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className={`cursor-pointer rounded-none text-white hover:font-semibold duration-100 text-lg font-light flex items-center gap-1  ${activeLink === '/destinations' ? 'font-semibold border-b-1 border-light p-1' : ''}`}>
                      <GiPositionMarker />
                      <a href='/destinations'> Destinations</a>
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <NavigationMenuLink>
                        <div className="py-2 px-1 w-max bg-light shadow-md">
                          <ul className="space-y-2 text-dark text-md ">
                            <Link to='/destinations?name=Barcelona'><li className=' py-1 px-10 hover:bg-gray-300 duration-100 cursor-pointer rounded-lg'>Barcelona</li></Link>
                            <Link to='/destinations?name=Bulan'><li className='py-1 px-10 hover:bg-gray-300 duration-100 cursor-pointer rounded-lg'>Bulan</li></Link>
                            <Link to='/destinations?name=Bulusan'><li className='py-1 px-10 hover:bg-gray-300 duration-100 cursor-pointer rounded-lg'>Bulusan</li></Link>
                            <Link to='/destinations?name=Casiguran'><li className='py-1 px-10 hover:bg-gray-300 duration-100 cursor-pointer rounded-lg'>Casiguran</li></Link>
                            <Link to='/destinations?name=Castilla'><li className='py-1 px-10 hover:bg-gray-300 duration-100 cursor-pointer rounded-lg'>Castilla</li></Link>
                            <Link to='/destinations?name=Donsol'><li className='py-1 px-10 hover:bg-gray-300 duration-100 cursor-pointer rounded-lg'>Donsol</li></Link>
                            <Link to='/destinations?name=Gubat'><li className='py-1 px-10 hover:bg-gray-300 duration-100 cursor-pointer rounded-lg'>Gubat</li></Link>
                            <Link to='/destinations?name=Irosin'><li className='py-1 px-10 hover:bg-gray-300 duration-100 cursor-pointer rounded-lg'>Irosin</li></Link>
                            <Link to='/destinations?name=Juban'><li className='py-1 px-10 hover:bg-gray-300 duration-100 cursor-pointer rounded-lg'>Juban</li></Link>
                            <Link to='/destinations?name=Magallanes'><li className='py-1 px-10 hover:bg-gray-300 duration-100 cursor-pointer rounded-lg'>Magallanes</li></Link>
                            <Link to='/destinations?name=Matnog'><li className='py-1 px-10 hover:bg-gray-300 duration-100 cursor-pointer rounded-lg'>Matnog</li></Link>
                            <Link to='/destinations?name=Pilar'><li className='py-1 px-10 hover:bg-gray-300 duration-100 cursor-pointer rounded-lg'>Pilar</li></Link>
                            <Link to='/destinations?name=PrietoDiaz'><li className='py-1 px-10 hover:bg-gray-300 duration-100 cursor-pointer rounded-lg'>Prieto Diaz</li></Link>
                            <Link to='/destinations?name=StaMagdalena'><li className='py-1 px-10 hover:bg-gray-300 duration-100 cursor-pointer rounded-lg'>Sta. Magdalena</li></Link>
                            <Link to='/destinations?name=Sorsogon'><li className='py-1 px-10 hover:bg-gray-300 duration-100 cursor-pointer rounded-lg'>Sorsogon City</li></Link>
                          </ul>
                        </div>
                      </NavigationMenuLink>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>

              <NavigationMenu className='z-40 '>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className={`cursor-pointer rounded-none text-white hover:font-semibold duration-100 text-lg font-light flex items-center gap-1   ${activeLink === '/Discover' ? 'font-semibold border-b-1 border-light p-1' : ''}`}>
                      <FaPersonWalking />
                      <a href='/Discover'> Discover </a>
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <NavigationMenuLink>
                        <div className="py-2 px-1 w-max bg-light">
                          <ul className="text-dark text-md space-y-3">
                            <a href='/activities'><li className='py-1 px-10 hover:bg-gray-300 duration-100 cursor-pointer rounded-lg'>Activities</li></a>
                            <a href='/accommodations'><li className='py-1 px-10 hover:bg-gray-300 duration-100 cursor-pointer rounded-lg'>Accommodations</li></a>
                            <a href='/foodplaces'><li className='py-1 px-10 hover:bg-gray-300 duration-100 cursor-pointer rounded-lg'>Food Places</li></a>
                            <a href='/shops'><li className='py-1 px-10 hover:bg-gray-300 duration-100 cursor-pointer rounded-lg'>Shops</li></a>
                          </ul>
                        </div>
                      </NavigationMenuLink>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>

              {isLoggedIn && (
                <div
                  className={`cursor-pointer text-white hover:font-semibold duration-100 text-lg font-light flex items-center gap-1 ${activeLink === '/trip' ? ' border-b-1 border-light p-1 font-semibold ' : ''}`}
                  onClick={() => setActiveLink('/trip')}
                >
                  <TbNotes /> <a href='/trip'>Trip</a>
                </div>
              )}

              <div
                className={`cursor-pointer text-white hover:font-semibold duration-100 text-lg font-light flex items-center gap-1 ${activeLink === '/transportation' ? ' border-b-1 border-light p-1 font-semibold ': ''}`}
                onClick={() => setActiveLink('/transportation')}
              >
                <PiJeep /> <a href='/transportation'>Transportation</a>
              </div>

              <div  className={`cursor-pointer text-white hover:font-semibold duration-100 text-lg font-light flex items-center gap-1 ${activeLink === '/about' ? 'border-b-1 border-light p-1 font-semibold ': ''}`}
              onClick={() => setActiveLink('/about')}>
                <CiSquareInfo /> <a href='/about'>About</a>
              </div>
            </div>
            {isLoggedIn ? (
              <Dropdown className='bg-light' placement="bottom-end">
                <DropdownTrigger>
                  <div className="cursor-pointer ml-6">
                    <Avatar
                      className='text-lg bg-color1 text-light hover:bg-color2/80 transition-colors duration-300'
                      src={userData?.image_path
                        ? `${BASE_URL}/${userData.image_path}`
                        : userData?.google_id
                          ? userData.image
                          : `https://ui-avatars.com/api/?name=${firstLetter}`
                      }
                    />
                  </div>
                </DropdownTrigger>
                <DropdownMenu  >
                  <DropdownItem key="profile">
                    <Link to='/userprofile' className="block w-full text-left text-md p-1">
                      Profile
                    </Link>
                  </DropdownItem>
                  <DropdownItem key="messages" onClick={openChatModal}>
                    <div className='flex items-center gap-4 text-md  p-1'>
                      Messages
                      <Badge color='danger' placement='top-right' content='2' />
                    </div>
                  </DropdownItem>
                  <DropdownItem key="Bookings">
                    <Link to='/userprofile#myBookings' className="block w-full text-left p-1">Bookings</Link>
                  </DropdownItem>
                  <DropdownItem key="logout" onClick={handleLogout}>
                    <div className="block w-full text-left p-1">Logout</div>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            ) : (
              <div className="text-white cursor-pointer ml-6" onClick={onOpen}>
                <FaRegCircleUser className="text-3xl hover:bg-color1 hover:text-light text-white duration-300 rounded-full" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Results Popup for Desktop */}
      {!isMobile && searchResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute top-[8rem] left-0 right-0 bg-white shadow-lg p-4 z-50 max-h-[300px] overflow-y-auto rounded-lg mx-4"
        >
          {searchResults.map((result, index) => (
            <div key={index} className="flex items-center p-2 hover:bg-gray-200 cursor-pointer">
              {result.image ? (
                <img src={result.image} alt={result.name} className="w-12 h-12 rounded-full mr-3" />
              ) : (
                <FaMapMarkerAlt className="w-12 h-12 text-gray-500 mr-3" />
              )}
              <div>
                <h3 className="text-md font-semibold">{result.name}</h3>
                {result.destination && <p className="text-sm text-gray-500">{result.destination}</p>}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Full-Screen Search Overlay */}
      {isSearchOverlayOpen && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col p-4">
          <div className="flex items-center justify-between mb-4">
            <input
              type="text"
              placeholder={`Search for ${activeTab}`}
              value={searchQuery}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-full p-2 pl-10 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-color1 transition-all duration-300"
            />
                <FaSearch className="absolute left-8 top-[2.2rem]  transform -translate-y-1/2 text-gray-500" />
            <FaTimes
              onClick={closeSearchOverlay}
              className="text-gray-500 cursor-pointer ml-2"
            />
          </div>

          {searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-grow overflow-y-auto"
            >
              {searchResults.map((result, index) => (
                <div key={index} className="flex items-center p-2 hover:bg-gray-200 cursor-pointer">
                  {result.image ? (
                    <img src={result.image} alt={result.name} className="w-12 h-12 rounded-full mr-3" />
                  ) : (
                    <FaMapMarkerAlt className="w-12 h-12 text-gray-500 mr-3" />
                  )}
                  <div>
                    <h3 className="text-md font-semibold">{result.name}</h3>
                    {result.destination && <p className="text-sm text-gray-500">{result.destination}</p>}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      )}

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="xl:hidden fixed right-0 w-auto h-auto bg-light z-40 flex flex-col items-center p-4 m-2 rounded-large">
          <div className="flex flex-col space-y-1 w-full m-4">
            <div className="relative w-full mt-4 max-w-md mb-4">
              <input
                type="text"
                placeholder={`Search for ${activeTab}`}
                value={searchQuery}
                onFocus={openSearchOverlay}
                className="w-full border border-gray-300 rounded-full p-2 pl-10 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-color1 transition-all duration-300"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              {searchQuery && (
                <FaTimes
                  onClick={clearSearchField}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                />
              )}
            </div>
            <div className="hover:text-gray-700 hover:bg-gray-300 cursor-pointer duration-100 text-lg font-light flex items-center gap-2 p-1 rounded-large">
              <FaHome className='m-2' /> <a href='/' className='m-2'>Home</a>
            </div>
            <div className="hover:text-gray-700 hover:bg-gray-300 cursor-pointer duration-100 text-lg font-light flex items-center gap-2 p-1 rounded-large">
              <NavigationMenu className=''>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="flex gap-9 text-color1 hover:text-gray-700 text-lg cursor-pointer hover:font-semibold duration-100 font-light">
                      <div className="hover:text-gray-700 hover:bg-gray-300 cursor-pointer duration-100 text-lg font-light flex items-center gap-2">
                        <GiPositionMarker className='m-2' /> <a href='/destinations' className='m-2'> Destinations</a>
                      </div>
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <NavigationMenuLink className='z-1'>
                        <div className="py-2 px-1 h-max w-max max-h-[190px] overflow-y-auto bg-light shadow-md rounded-large">
                          <ul className="space-y-2 text-dark text-sm">
                            <Link to='/destinations?name=Barcelona'><li className='py-1 px-14 hover:bg-gray-300 duration-100 cursor-pointer rounded-lg'>Barcelona</li></Link>
                            <Link to='/destinations?name=Bulan'><li className='py-1 px-14 hover:bg-gray-300 duration-100 cursor-pointer rounded-lg'>Bulan</li></Link>
                            <Link to='/destinations?name=Bulusan'><li className='py-1 px-14 hover:bg-gray-300 duration-100 cursor-pointer rounded-lg'>Bulusan</li></Link>
                            <Link to='/destinations?name=Casiguran'><li className='py-1 px-14 hover:bg-gray-300 duration-100 cursor-pointer rounded-lg'>Casiguran</li></Link>
                            <Link to='/destinations?name=Castilla'><li className='py-1 px-14 hover:bg-gray-300 duration-100 cursor-pointer rounded-lg'>Castilla</li></Link>
                            <Link to='/destinations?name=Donsol'><li className='py-1 px-14 hover:bg-gray-300 duration-100 cursor-pointer rounded-lg'>Donsol</li></Link>
                            <Link to='/destinations?name=Gubat'><li className='py-1 px-14 hover:bg-gray-300 duration-100 cursor-pointer rounded-lg'>Gubat</li></Link>
                            <Link to='/destinations?name=Irosin'><li className='py-1 px-14 hover:bg-gray-300 duration-100 cursor-pointer rounded-lg'>Irosin</li></Link>
                            <Link to='/destinations?name=Juban'><li className='py-1 px-14 hover:bg-gray-300 duration-100 cursor-pointer rounded-lg'>Juban</li></Link>
                            <Link to='/destinations?name=Magallanes'><li className='py-1 px-14 hover:bg-gray-300 duration-100 cursor-pointer rounded-lg'>Magallanes</li></Link>
                            <Link to='/destinations?name=Matnog'><li className='py-1 px-14 hover:bg-gray-300 duration-100 cursor-pointer rounded-lg'>Matnog</li></Link>
                            <Link to='/destinations?name=Pilar'><li className='py-1 px-14 hover:bg-gray-300 duration-100 cursor-pointer rounded-lg'>Pilar</li></Link>
                            <Link to='/destinations?name=PrietoDiaz'><li className='py-1 px-14 hover:bg-gray-300 duration-100 cursor-pointer rounded-lg'>Prieto Diaz</li></Link>
                            <Link to='/destinations?name=StaMagdalena'><li className='py-1 px-14 hover:bg-gray-300 duration-100 cursor-pointer rounded-lg'>Sta. Magdalena</li></Link>
                            <Link to='/destinations?name=Sorsogon'><li className='py-1 px-14 hover:bg-gray-300 duration-100 cursor-pointer rounded-lg'>Sorsogon City</li></Link>
                          </ul>
                        </div>
                      </NavigationMenuLink>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
            <div className="hover:text-gray-700 hover:bg-gray-300 cursor-pointer duration-100 text-lg font-light flex items-center gap-2 p-1 rounded-large">
              <NavigationMenu className='z-1'>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="flex gap-16 text-color1 hover:text-gray-700 text-lg cursor-pointer hover:font-semibold duration-100 font-light">
                      <div className="hover:text-gray-700 hover:bg-gray-300 cursor-pointer duration-100 text-lg font-light flex items-center gap-2">
                        <FaPersonWalking className='m-2' /> <a href='/Discover' className='m-2' > Discover </a>
                      </div>
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <NavigationMenuLink>
                        <div className="py-4 px-2 w-max bg-light shadow-md">
                          <ul className="space-y-2 text-dark text-sm">
                            <Link to='/activities'><li className='py-1 px-14 hover:bg-gray-300 duration-100 cursor-pointer rounded-lg'>Activities</li></Link>
                            <Link to='/accommodations'><li className='py-1 px-14 duration-100 hover:bg-gray-300 cursor-pointer rounded-lg'>Accommodations</li></Link>
                            <Link to='/foodplaces'><li className='py-1 px-14 duration-100 hover:bg-gray-300 cursor-pointer rounded-lg'>Food Places</li></Link>
                            <Link to='/shops'><li className='py-1 px-14 duration-100 hover:bg-gray-300 cursor-pointer rounded-lg'>Shops</li></Link>
                          </ul>
                        </div>
                      </NavigationMenuLink>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
            {isLoggedIn && (
              <div
                className={`cursor-pointer  hover:bg-gray-300 duration-100 text-lg font-light flex items-center gap-2 p-1 rounded-large ${activeLink === '/trip' ? ' border-b-1 border-light p-1 font-semibold ' : ''}`}
                onClick={() => setActiveLink('/trip')}
              >
                <TbNotes className='m-2' /> <a href='/trip' className='m-2' >Trip</a>
              </div>
            )}
            <div className="hover:text-gray-700 hover:bg-gray-300 cursor-pointer duration-100 text-lg font-light flex items-center gap-2 p-1 rounded-large">
              <PiJeep className='m-2' /> <a href='/transportation' className='m-2' >Transportation</a>
            </div>
            <div className="hover:text-gray-700 hover:bg-gray-300 cursor-pointer duration-100 text-lg font-light flex items-center gap-2 p-1 rounded-large">
              <CiSquareInfo className='m-2' /> <a href='/about' className='m-2'>About</a>
            </div>

          </div>
        </div>
      )}

      <Modal
        backdrop="opaque"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        isDismissable={false}
        className='max-h-full w-full max-w-[600px] overflow-auto scrollbar-custom'
      >
        <ModalContent>
          {() => (
            <>
              <ModalBody>
                <LoginSignup />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      <UserChatModal isOpen={isChatModalOpen} onClose={closeChatModal} />
      
    </div>
  );
};

export default Nav;