import './App.css'
import { Outlet } from 'react-router-dom'
import Navbar from './components/Navigation/NavBar'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50/30">
        <Outlet />
      </main>
    </div>
  )
}

export default App
