import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import GraphComponent from './Components/graph'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Navbar from './Components/Navbar'
import Traversal from './Components/Traversal'
import Djikstra from './Components/Djikstra'
import Bellman from './Components/Bellman'
import SCC from './Components/SCC'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Router>
        <Navbar/>
        <Routes>
          <Route path="/" element={<GraphComponent />} />
          <Route path="/traversal" element={<Traversal/>} />
          <Route path="/algorithms/djikstra" element={<Djikstra />} />
          <Route path="/algorithms/bellman" element={<Bellman />} />
          <Route path="/conn/scc" element={<SCC />} />
          {/* Add more routes as needed */}
        </Routes>
      </Router>
    
    </>
  )
}

export default App
