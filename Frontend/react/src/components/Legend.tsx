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
            colormap="turbo"
            vmin={0}
            vmax={50000}
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