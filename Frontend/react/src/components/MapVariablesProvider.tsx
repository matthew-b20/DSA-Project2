import { createContext, useState } from 'react';

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
}

export const MapContext = createContext<MapContextType | null>(null);

export default function MapVariablesProvider({children} : {children: React.ReactNode }) {
    const [billingPeriod, setBillingPeriod] = useState(1);
    const [num, setNum] = useState(5);
    const [variable, setVariable] = useState('Potable');
    const [method, setMethod] = useState('Min');
    const [style, setStyle] = useState(true);

    return(
        <MapContext.Provider value = {{
            billingPeriod, setBillingPeriod,
            num, setNum,
            variable, setVariable,
            method, setMethod,
            style, setStyle}}
        >
            {children}
        </MapContext.Provider>
    );
}