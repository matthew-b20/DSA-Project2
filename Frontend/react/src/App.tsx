import BackgroundToggle from  './components/BackgroundToggle.tsx';
import BarChartPopup from './components/BarChartPopup.tsx';
import Sidebar from  './components/Sidebar.tsx';
import Legend from './components/Legend.tsx';
import Searchbar from './components/Searchbar.tsx';
import MapBackground from './components/MapBackground.tsx';
import MapVariablesProvider from './components/MapVariablesProvider.tsx'
import { MapProvider } from 'react-map-gl/maplibre';

export default function App() {
    return (
      <MapProvider> {/*react-map-gl map provider*/}
          <MapVariablesProvider>  {/*custom map provider for communication between sidebar, map, and backend*/}
              {/*sibling components should now be able to read the same state*/}
              <MapBackground/>
              <BarChartPopup/>
              <BackgroundToggle/>
              <Sidebar/>
              <Legend/>
              <Searchbar/>
          </MapVariablesProvider>
      </MapProvider>
  )
}
