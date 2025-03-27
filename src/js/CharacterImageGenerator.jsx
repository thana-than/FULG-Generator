import React from 'react';
import { parts } from './metadata.js'
import Part from './Part.js';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';

const CHAR_SIZE_MULT = .003;

const buildPartMesh = async (part, renderOrder) => {
    const img = await part.getPNG();
    const texture = new THREE.TextureLoader().load(img.src);

    const geometry = new THREE.PlaneGeometry(
        img.width * CHAR_SIZE_MULT,
        img.height * CHAR_SIZE_MULT
    );
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        color: 0xffff00,
        transparent: true,
        side: THREE.FrontSide
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.renderOrder = renderOrder;
    material.depthWrite = false;
    material.depthTest = false;
    return mesh;
};

const PartMesh = ({ part, renderOrder }) => {
    const [mesh, setMesh] = React.useState(null);

    React.useEffect(() => {
        let mounted = true;

        const loadMesh = async () => {
            const plane = await buildPartMesh(part, renderOrder);
            if (mounted) setMesh(plane);
        };

        loadMesh();

        return () => {
            mounted = false;
            if (mesh) {
                mesh.geometry.dispose();
                mesh.material.dispose();
            }
        };
    }, [part]);

    if (!mesh) return null;

    return <primitive object={mesh} position={[0, 0, 0]} />;
};

function CharacterContent() {
    const [characterParts, setCharacterParts] = React.useState([]);

    const getRandomPart = (partList) => {
        return partList[Math.floor(Math.random() * partList.length)];
    };


    React.useEffect(() => {
        const torso = getRandomPart(parts.torsos);
        const head = getRandomPart(parts.heads);
        setCharacterParts([torso, head]);
    }, []);

    return (
        <group>
            {characterParts.map((part, index) => (
                <PartMesh key={`part-${index}`} part={part} renderOrder={10 + index} />
            ))}
        </group>
    );
};

// Export with Canvas wrapper
export default function GenerateCharacter() {
    return <CharacterContent />;
}