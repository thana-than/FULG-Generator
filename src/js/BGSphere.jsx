import React from 'react';
import * as THREE from 'three';

export default function BGSphere({ color, renderOrder, stencilRef, map }) {
    return (<mesh renderOrder={renderOrder}>
        <sphereGeometry args={[100]} />
        <meshBasicMaterial
            color={color}
            transparent={true}
            depthWrite={false}
            depthTest={false}
            side={THREE.BackSide}
            stencilWrite={true}
            stencilRef={stencilRef}
            stencilFunc={THREE.EqualStencilFunc}
            stencilFail={THREE.KeepStencilOp}
            stencilZPass={THREE.KeepStencilOp}
            map={map}
        />
    </mesh>);
}