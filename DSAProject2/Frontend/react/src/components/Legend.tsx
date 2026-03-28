import { ColorbarReact } from 'maplibre-gl-components/react';
import { useMap } from 'react-map-gl/maplibre';

export default function Legend(){
    const { map } = useMap();

    return(
        <>
        {/*
        <div className="uk-card uk-card-body x-6 py-6 fixed bottom-4 right-4 z-1">
            <h2 className="uk-card-title">
                Legend Title Here
            </h2>
            <p className="mt-4">
                Some legend icons and things <br/>
                Some legend icons and things <br/>
                Some legend icons and things <br/>
                Some legend icons and things <br/>
            </p>
        </div>

        */}

        <ColorbarReact
            map={map}
            colormap={["#30123b", "#4145ab", "#39a2fc", "#1bcfd4", "#24efa2", "#a2fc3c", "#e1dc27", "#f8910b", "#e22f05", "#7a0403"]}
            vmin={0}
            vmax={50000}
            ticks={{ values: [0, 2, 5, 10, 20, 35, 50, 75, 100, 150],
                format: (value) => value >= 150 ? `${value}+` : value}} // Updated line
            label="Usage (KGal)"
            units=""
            orientation="vertical"
            backgroundColor="#FFFFFF"
            fontColor="#000000"
            opacity={1}
        />
        </>
    )
}