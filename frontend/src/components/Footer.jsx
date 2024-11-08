import React from 'react';
import Logo from '../assets/rabas.png';


const Footer = () => {
  return (
    <footer className="bg-color1 text-color3  py-10 h-full ">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column */}
          <div>
            <ul className="space-y-2 text-sm">
             
            <li><a href="/" className="hover:underline">Home</a></li>
            <li><a href="/destinations" className="hover:underline">Destinations</a></li>
            <li><a href="/trip" className="hover:underline">Trip</a></li>
            <li><a href="/transportation" className="hover:underline">Transportations</a></li>
            <li><a href="/about" className="hover:underline">About</a></li>
            </ul>
          </div>

          {/* Middle Column */}
          <div>
            <ul className="space-y-2 text-sm">
              <li><a href="/activities" className="hover:underline">Activities</a></li>
              <li><a href="/accomodations" className="hover:underline">Accommodations</a></li>
              <li><a href="/foodplaces" className="hover:underline">Food places</a></li>
              <li><a href="/shops" className="hover:underline">Shops</a></li>
           
            </ul>
          </div>

          {/* Right Column */}
          <div>
            <h2 className="text-lg font-bold mb-4">Reach Us Out Here</h2>
            <form className="flex mb-4">
              <input
                type="email"
                placeholder="Email"
                className="border-b-2 border-gray-300 focus:border-light flex-grow px-2 py-1 text-black placeholder-gray-500 transition duration-300"
              />
              <button
                type="submit"
                className="ml-2 text-light font-bold"
              >
                ➔
              </button>
            </form>
           
          </div>
        </div>

        <div className="border-t border-gray-500 mt-10 pt-4 text-center">
          <div className="flex justify-center items-center space-x-2">
            <img src={Logo} alt="Logo" className="h-16 w-16" />
            <span className="text-sm">© 2024 RabaSorsogon, Inc.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
