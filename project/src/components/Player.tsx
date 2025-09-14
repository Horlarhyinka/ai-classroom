import H5AudioPlayer from "react-h5-audio-player";
import 'react-h5-audio-player/lib/styles.css';

interface Prop{
    href: string | undefined;
    autoplay: boolean;
}


export const Player = (prop: Prop)=>{
    return <H5AudioPlayer
        autoPlay={prop.autoplay}
        src={prop.href}
        className=""
    />
} 