import './App.css'
import { Outlet } from 'react-router-dom'
import Navbar from './components/Navigation/NavBar'
import { ThemeProvider } from './context/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 bg-gray-50/30 dark:bg-dark-bg-primary">
          <Outlet />
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App
