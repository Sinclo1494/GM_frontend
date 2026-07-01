
import './App.css'
import Navbar from './components/NavBar'
import AnalyseQuantitative from './pages/AnalyseQuantitative'
import GrandMateriel from './pages/GrandMateriel'

function App() {


  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <AnalyseQuantitative />
      </main>
    </div>
  )
}

export default App
