import Sidebar from  './components/Sidebar.tsx';
import Legend from './components/Legend.tsx';
import Searchbar from './components/Searchbar.tsx';
import { MapProvider } from 'react-map-gl/maplibre';
import MapBackground from './components/MapBackground.tsx';
export default function App() {
    return (
      <MapProvider>
          <MapBackground/>
          <Sidebar/>
          <Legend/>
          <Searchbar/>
      </MapProvider>
  )
}
