import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom';

import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import Home from './pages/Home/Home';
import Alerts from './pages/Alerts/Alerts';
import Dashboard from './pages/Dashboard/Dashboard';
import Tree from './pages/Tree/Tree';


import Navbar from './components/custom/Navbar/Navbar';
import Footer from './components/custom/Footer/Footer';


import { ApplicationLayout } from './components/application-layout'


function App() {
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    
    <div className="App">
      {/* <Navbar/> */}
        <ApplicationLayout showSidebar={showSidebar} setShowSidebar={setShowSidebar}>

          <div className="content">
            <Routes>
              <>
                <Route path="/" element= {<Home />}/>
                <Route path="/alerts" element= {<Alerts />}/>
                <Route path="/dashboard" element= {<Dashboard />}/>
                <Route path="/tree" element= {<Tree />}/>
              </>
            </Routes>
          </div>
        </ApplicationLayout>
      {/* <Footer/> */}
    </div>
  )
}

export default App

