import { createContext, useState } from 'react';
import maplibregl from "maplibre-gl";

interface User {
    Address: string;
    LocationCode: string;
    Consump: number;
    Coordinates: number[];
}
interface ReturnJSON{
    DataStructure: string;
    BillingPeriod: number;
    Number: number;
    VariableOfInterest: string;
    Method: string;
    Time: number;
    MinUsers?: User[];
    MaxUsers?: User[];
}

interface popupInfo {
    lngLat: maplibregl.LngLat;
    Address: string;
    LocationCode: string;
    PropertyType: string;
    PropertyCat: string;
    properties: string[];
    Bill: number;
}

export interface MapContextType {
    billingPeriod: number;
    setBillingPeriod: (val: number) => void;

    num: number;
    setNum: (val: number) => void;

    variable: string;
    setVariable: (val: string) => void;

    method: string;
    setMethod: (val: string) => void;

    style: boolean;
    setStyle: (val: boolean) => void;

    popup: popupInfo;
    setPopup: (val: popupInfo) => void;

    returnJSON: ReturnJSON[]
    setReturnJSON: (val: ReturnJSON[]) => void;

    parcelLayer: boolean;
    setParcelLayer: (val: boolean) => void;

    meterLayer: boolean;
    setMeterLayer: (val: boolean) => void;

    excludeZeroes: boolean;
    setExcludeZeroes: (val: boolean) => void;

    propertyCat: string;
    setPropertyCat: (val: string) => void;

    subdiv: string;
    setSubdiv: (val: string) => void;
}

export const MapContext = createContext<MapContextType | null>(null);

export default function MapVariablesProvider({children} : {children: React.ReactNode }) {
    const [billingPeriod, setBillingPeriod] = useState(1);
    const [num, setNum] = useState(5);
    const [variable, setVariable] = useState('Potable');
    const [method, setMethod] = useState('Min');
    const [style, setStyle] = useState(true);
    const [popup, setPopup] = useState<popupInfo | null>(null);
    const [returnJSON, setReturnJSON] = useState<ReturnJSON[] | null>(null);
    const [parcelLayer, setParcelLayer] = useState<boolean>(true);
    const [meterLayer, setMeterLayer] = useState<boolean>(true);
    const [excludeZeroes, setExcludeZeroes] = useState<boolean>(true);
    const [propertyCat, setPropertyCat] = useState<string>("All");
    const [subdiv, setSubdiv] = useState<string>("All");

    return(
        <MapContext.Provider value = {{
            billingPeriod, setBillingPeriod,
            num, setNum,
            variable, setVariable,
            method, setMethod,
            style, setStyle,
            popup, setPopup,
            returnJSON, setReturnJSON,
            parcelLayer, setParcelLayer,
            meterLayer, setMeterLayer,
            excludeZeroes, setExcludeZeroes,
            propertyCat, setPropertyCat,
            subdiv, setSubdiv
        }}
        >
            {children}
        </MapContext.Provider>
    );
}