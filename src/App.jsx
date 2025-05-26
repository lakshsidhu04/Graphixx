import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import GraphComponent from './Components/graph'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <GraphComponent />
    </>
  )
}

export default App
