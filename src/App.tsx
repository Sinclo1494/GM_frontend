import './App.css'
import { Outlet } from 'react-router-dom'
import Navbar from './components/Navigation/NavBar'
import { ThemeProvider } from './context/ThemeContext'
import { usePermissions } from './auth/PermissionContext'

function AppContent() {
  const { loading } = usePermissions();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-gray-50/30 dark:bg-dark-bg-primary">
        <Outlet />
      </main>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col">
        <AppContent />
      </div>
    </ThemeProvider>
  )
}

export default App
