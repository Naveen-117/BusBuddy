import { useState } from 'react'
import Home from './pages/Home'
import Map from './components/Map'
import Navbar from './components/Navbar'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import CsvUploader from './pages/CsvUploader'
import Passenger from './components/Passenger'
import Statistics from './pages/Statistics'
import StatisticsPage from './pages/StatisticsPage'
import Dashboard from './pages/Dashboard'
import StopsStats from './pages/StopsStats'
import TripsStats from './pages/TripsStats'
import RoutesStats from './pages/RoutesStats'
import Real from './pages/Real'
import AboutPage from './components/About'
import Profile from './components/Profile'
import Platform from './pages/Platform'
import WeeklySchedule from './pages/WeeklySchedule'
import TransitStopForm from './pages/TransitStopForm'
import DriverManagement from './pages/DriverManagement'
function App() {
  return (
    <BrowserRouter>
    <Routes>
    <Route path="/" element={<Login/>}></Route>
    <Route path="/signup" element={<Signup/>}></Route>
    </Routes>
    <Navbar/>
    <Routes>
    <Route path="/home" element={<Home/>}></Route> 
    <Route path="/test" element={<Passenger/>}></Route> 
    <Route path="/upload" element={<TransitStopForm/>}></Route>
    <Route path="/graph" element={<Statistics/>}></Route>
    <Route path="/map" element={<Passenger/>}></Route>
    <Route path="/statistics" element={<StatisticsPage />} />
    <Route path="/Dash" element={<Dashboard />} />
    <Route path="/stops-stats" element={<StopsStats />} />
    <Route path="/trips-stats" element={<TripsStats />} />
    <Route path="/routes-stats" element={<RoutesStats />} />
    <Route path="/real" element={<Real />} />
    <Route path="/platform" element={<Platform />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/Roaster" element={<WeeklySchedule />} />
    <Route path="/driver" element={<DriverManagement />} />
    </Routes>
    </BrowserRouter>
  )
}

export default App
