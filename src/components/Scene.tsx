import { Canvas } from "@react-three/fiber"
import PanoramaViewer from "./PanoramaViewer"
import Camera from "./Camera";

//three.js scene

const Scene = () => {
    return <Canvas>
        <Camera />
        <PanoramaViewer />
    </Canvas>
}

export default Scene;