
import './App.css'
import { Outlet } from 'react-router-dom'
import Navbar from './components/NavBar'

function App() {


  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}

export default App
