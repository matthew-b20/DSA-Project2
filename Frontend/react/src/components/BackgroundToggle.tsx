import { useContext } from 'react';
import { MapContext, type MapContextType } from './MapVariablesProvider.tsx';
import UseAnimations from "react-useanimations";
import toggle from 'react-useanimations/lib/toggle';

export default function BackgroundToggle(){
    const { style, setStyle } = useContext(MapContext) as MapContextType;
    const Animation = (UseAnimations as any).default || UseAnimations;
    const toggleAnimationData = (toggle as any).default || toggle;

    return(
        <button className = "absolute px-1 py-2 top-20 left-1 uk-btn uk-btn-default rounded-full flex items-center justify-center z-1"
                onClick={()=>{setStyle(!style)}}>
            <Animation animation={toggleAnimationData} reverse={style} size={32}/>
        </button>
    )
}