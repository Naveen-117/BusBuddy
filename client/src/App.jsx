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
function App() {
  return (
    <BrowserRouter>
    <Navbar/>
    <Routes>
    <Route path="/" element={<Login/>}></Route>
    <Route path="/signup" element={<Signup/>}></Route>
    <Route path="/home" element={<Home/>}></Route> 
    <Route path="/test" element={<Passenger/>}></Route> 
    <Route path="/data" element={<CsvUploader/>}></Route>
    <Route path="/graph" element={<Statistics/>}></Route>
    <Route path="/map" element={<Passenger/>}></Route>
    </Routes>
    </BrowserRouter>
  )
}

export default App
