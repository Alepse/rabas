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
import UserProfile from './user/userprofile'
import Booking from '@/admin/businessbooking'
import SuperAdminDashboard from '@/admin/SuperAdmin/SuperAdminDashboard'
import SuperAdminUsers from './admin/SuperAdmin/SuperAdminUsers';
import SuperAdminProducts from './admin/SuperAdmin/SuperAdminProducts';
import SuperAdminVerification from './admin/SuperAdmin/SuperAdminVerification';
import SuperAdminReports from './admin/SuperAdmin/SuperAdminReports';
import SuperAdminTransportation from './admin/SuperAdmin/SuperAdminTransportation';
import Discover from './Mainpages/Discover';
import Trip from './Mainpages/Trip';
import Transportation from './Mainpages/Transportation';
import About from './Mainpages/About'
import ResetPW from './auth/ResetLink/ResetPW';
import AdminLogin from '@/admin/SuperAdmin/SuperAdminLogin'


function App() {
  return (
    <Router>
     
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/destinations' element={<Destinations />} />
          <Route path='/activities' element={<Activity />} />
          <Route path='/accommodations' element={<Accomodation />} />
          <Route path='/foodplaces' element={<Food />} />
          <Route path='/shops' element={<Shop />} />
          <Route path='/business/:businessId' element={<Business />} />
          <Route path='/businessdashboardadmin' element={<Dashboard />} />
          <Route path='/businessprofileadmin' element={<Profile />} />
          <Route path='/businessproductsadmin' element={<Product />} />
          <Route path='/businessdealsadmin' element={<Deals />} />
          <Route path='/maps' element={<Maps />} />
          <Route path='/userprofile' element={<UserProfile />} />
          <Route path='/businessbookingadmin' element={<Booking />} />
          <Route path='/superadmindashboard' element={<SuperAdminDashboard />} />
          <Route path='/superadminusers' element={<SuperAdminUsers />} />
          <Route path='/superadminproducts' element={<SuperAdminProducts />} />
          <Route path='/superadminverification' element={<SuperAdminVerification />} />
          <Route path='/superadminreports' element={<SuperAdminReports />} />
          <Route path='/superadmintransportation' element={<SuperAdminTransportation />} />
          <Route path='/discover' element={<Discover/>}/>
          <Route path='/trip' element={<Trip/>}/>
          <Route path='/transportation' element={<Transportation/>}/>
          <Route path='/about' element={<About/>}/>
          <Route path='/resetpassword' element={<ResetPW/>}/>
          <Route path='/superadminlogin' element={<AdminLogin/>}/>
        
  
    
        </Routes>
     
    </Router>
  )
}

export default App