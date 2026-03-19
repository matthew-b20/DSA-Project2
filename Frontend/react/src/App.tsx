import Sidebar from  './components/Sidebar.tsx'
import Legend from './components/Legend.tsx'
import Searchbar from './components/Searchbar.tsx'
import MapBackground from './components/MapBackground.tsx'

export default function App() {
  return (
      <>
          <MapBackground/>
          <Sidebar/>
          <Legend/>
          <Searchbar/>
      </>
  )
}
