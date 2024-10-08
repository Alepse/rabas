import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Mainpages/home'
import Destinations from './Mainpages/Destinations';
import Activity from './Mainpages/Activities';
import Accomodation from './Mainpages/Accomodation';
import Food from './Mainpages/Food';
import Shop from './Mainpages/Shop';
import Business from '../src/businesspage/businesspage'
import Dashboard from './admin/businessdashboard'
import Profile from './admin/businessprofile'
import Product from './admin/businessproducts'
import Deals from './admin/businessdeals'
import Maps from './components/map-picker'
import UserProfile from './user/userprofile';
import Booking from '@/admin/businessbooking'


function App() {
  return (
    <Router>
     
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/destination' element={<Destinations />} />
          <Route path='/activities' element={<Activity />} />
          <Route path='/accomodation' element={<Accomodation />} />
          <Route path='/food' element={<Food />} />
          <Route path='/shop' element={<Shop />} />
          <Route path='/business' element={<Business />} />
          <Route path='/admin' element={<Dashboard />} />
          <Route path='/profileadmin' element={<Profile />} />
          <Route path='/productsadmin' element={<Product />} />
          <Route path='/dealsadmin' element={<Deals />} />
          <Route path='/maps' element={<Maps />} />
          <Route path='/userprofile' element={<UserProfile />} />
          <Route path='/bookingadmin' element={<Booking />} />
        </Routes>
     
    </Router>
  )
}

export default App