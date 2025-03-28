import React from 'react';
import { parts } from './metadata.js'
import * as THREE from 'three';

const RENDER_ORDER = -1000;
const BG_RADIUS = 2

function GetBackground() {
    const type = 'background'
    return parts[type][Math.floor(Math.random() * parts[type].length)];
};

const BGSphere = ({ texture }) => {
    const modifiedTexture = React.useMemo(() => {
        if (!texture) return null;
        const newTexture = texture.clone(); //* Clone the texture to avoid global changes
        newTexture.wrapS = newTexture.wrapT = THREE.RepeatWrapping;
        const aspectRatio = texture.image.height / texture.image.width;
        const repeatX = -2.5;
        const repeatY = 1.25 / aspectRatio;
        newTexture.repeat.set(repeatX, repeatY);
        const offsetX = 0.125 - repeatX / 2;
        const offsetY = 0.5 - repeatY / 2;
        newTexture.offset.set(offsetX, offsetY);
        return newTexture;
    }, [texture]);

    if (!modifiedTexture) return null;

    return (
        <mesh renderOrder={RENDER_ORDER - 1} position={[0, 0, .15]} scale={[1, 1, .2]}>
            <sphereGeometry args={[BG_RADIUS]} />
            <meshBasicMaterial
                map={modifiedTexture}
                side={THREE.BackSide}
                transparent={true}
                depthWrite={false}
                depthTest={false}
                stencilWrite={true}
                stencilRef={1}
                stencilFunc={THREE.EqualStencilFunc}
                stencilFail={THREE.KeepStencilOp}
                stencilZPass={THREE.KeepStencilOp}
            />
        </mesh>
    );
}

function BackgroundContent() {
    const [texture, setTexture] = React.useState(null);

    React.useEffect(() => {
        async function loadBG() {
            const bg = GetBackground();
            const tex = await bg.getTexture();
            setTexture(tex);
        }
        loadBG();
    }, []);

    return <BGSphere texture={texture} />
}

export default function GenerateBackground() {
    return (
        <BackgroundContent />
    );
}