
import './App.css'
import Navbar from './components/NavBar'
import GrandMateriel from './pages/GrandMateriel'

function App() {


  return (
    <div className="min-h-screen flex flex-col .app">
      <Navbar />
      <main className="flex-1">
        <GrandMateriel />
      </main>
    </div>
  )
}

export default App
