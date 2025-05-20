
import Home from './pages/Home'
import Navbar from './components/Navbar'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import CsvUploader from './pages/CsvUploader'
import Statistics from './pages/Statistics'
import StatisticsPage from './pages/StatisticsPage'
import StopsStats from './pages/StopsStats'
import TripsStats from './pages/TripsStats'
import RoutesStats from './pages/RoutesStats'
import Real from './pages/Real'
import AboutPage from './components/About'
import Platform from './pages/Platform'
import Planning from './pages/Planning'
import DriverManagement from './pages/DriverManagement'
import Live from './pages/Live'
import DashboardLayout from './components/DashboardLayout'
import Overview from './pages/Overview'
import RouteStatistics from './pages/RouteStatistics'
import GeospatialView from './pages/GeospatialView'
import TripTimes from './pages/TripTimes'
import Prediction from './components/Prediction'

function App() {
  return (
    <BrowserRouter>
    <Navbar/>
    <Routes>
    <Route path="/" element={<Login/>}></Route>
    <Route path="/signup" element={<Signup/>}></Route>
    <Route path="/home" element={<Home/>}></Route> 
    <Route path="/data" element={<CsvUploader/>}></Route>
    <Route path="/graph" element={<Statistics/>}></Route>
    <Route path="/planning" element={<Planning/>}></Route>
    <Route path="/statistics" element={<StatisticsPage />} />
    <Route path="/stops-stats" element={<StopsStats />} />
    <Route path="/trips-stats" element={<TripsStats />} />
    <Route path="/routes-stats" element={<RoutesStats />} />
    <Route path="/real" element={<Real />} />
    <Route path="/platform" element={<Platform />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/live" element={<Live />} />
    <Route path="/prediction" element={<Prediction />} />

    <Route path="/driver" element={<DriverManagement />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Overview />} />
              <Route path="routes" element={<RouteStatistics />} />
              <Route path="map" element={<GeospatialView />} />
              <Route path="times" element={<TripTimes />} />
        </Route>
    </Routes>
    </BrowserRouter>
  )
}

export default App
