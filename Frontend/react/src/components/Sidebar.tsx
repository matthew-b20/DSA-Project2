//This file will hold all the Sidebar components that filter & control the map, once those components are made
import { useState } from 'react';
import RequestButton from  './RequestButton.tsx'
import UseAnimations from "react-useanimations";
import menu2 from 'react-useanimations/lib/menu2';

export default function Sidebar() {
    //console.log() is showing that they're objects w/ a default property so it has to be extracted???
    const Animation = (UseAnimations as any).default || UseAnimations;
    const menuAnimationData = (menu2 as any).default || menu2;

    const [isOpen, setIsOpen] = useState(false);

    return(
        <>
            { /* the menu icon isn't animating -- IDK why */ }
            <Animation animation={menuAnimationData}
               onClick = {()=>{setIsOpen(!isOpen)}}
               reverse={isOpen}
               size={32}
               speed={1.5}
               render={(eventProps: any, animationProps: any) => (
                   <button className = "absolute top-4 left-0 px-2 py-6 rounded-l-none uk-btn uk-btn-primary z-1"
                           type="button"
                           data-uk-toggle="target: #sidebar-container"
                           {...eventProps}
                   >
                       <div {...animationProps}/>
                   </button>
               )}
            />
            <div id = "sidebar-container" className="uk-offcanvas !visible" data-uk-offcanvas="bg-close: false; mode: push">

                <div className = "uk-offcanvas-bar !overflow-visible px-6 py-6 z-1">
                    <h1 className = "uk-h1 text-primary mb-4">The Oviedo Water Atlas</h1>
                    <RequestButton
                        num={10}
                        billing_period={1}
                        method="max"
                        variable="potable usage"
                    />
                </div>
            </div>
        </>
    )
}