//This file will hold all the Sidebar components that filter & control the map, once those components are made
import { useState, useContext } from 'react';
import { MapContext, type MapContextType } from './MapVariablesProvider.tsx';
import RequestButton from  './RequestButton.tsx';
import NumberChooser from  './NumberChooser.tsx';
import WaterChooser from  './WaterChooser.tsx';
import MinMaxChooser from  './MinMaxChooser.tsx';
import Slider from './Slider.tsx';
import UseAnimations from "react-useanimations";
import menu2 from 'react-useanimations/lib/menu2';

export default function Sidebar() {
    const { billingPeriod, num, variable, method } = useContext(MapContext) as MapContextType;

    //console.log() is showing that they're objects w/ a default property so it has to be extracted???
    const Animation = (UseAnimations as any).default || UseAnimations;
    const menuAnimationData = (menu2 as any).default || menu2;

    const [isOpen, setIsOpen] = useState(false);

    return(
        <>
            { /* the menu icon isn't animating -- IDK why */ }
           <button className = "absolute uk-btn uk-btn-primary top-4 left-0 px-2 py-6 rounded-l-none z-1"
                   style={{ '--uk-btn-primary-hover-bg': 'hsl(var(--primary))' } as React.CSSProperties} //stops button from turning translucent on hover
                   type="button"
                   data-uk-toggle="target: #sidebar-container"
                   onClick = {()=>{setIsOpen(!isOpen)}}
           >
               <Animation animation={menuAnimationData}
                          reverse={isOpen}
                          size={32}
                          speed={1.5}
               />
           </button>
            <div id = "sidebar-container" className="uk-offcanvas !visible" data-uk-offcanvas="bg-close: false; mode: push">



                <div className = "uk-offcanvas-bar !overflow-visible px-6 py-6 z-1">
                    {/*HEADER*/}
                    <h1 className = "uk-h1 text-primary mb-4">The Oviedo Water Atlas</h1>

                    {/*INPUT COMPONENTS*/}
                    <NumberChooser/>
                    <br/>

                    <Slider/>
                    <br/>

                    <WaterChooser/>
                    <br/>

                    <MinMaxChooser/>
                    <br/>

                    <RequestButton
                        billing_period={billingPeriod}
                        num={num}
                        variable={variable}
                        method={method}
                    />
                </div>
            </div>
        </>
    )
}