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
}

export const MapContext = createContext<MapContextType | null>(null);

export function MapVariablesProvider({children} : {children: React.ReactNode }) {
    const [billingPeriod, setBillingPeriod] = useState(1);
    const [num, setNum] = useState(5);
    const [variable, setVariable] = useState('potable usage');
    const [method, setMethod] = useState('max');

    return(
        <MapContext.Provider value = {{billingPeriod, setBillingPeriod, num, setNum, variable, setVariable, method, setMethod}}>
            {children}
        </MapContext.Provider>
    );
}