import React from 'react';
import { parts } from './metadata.js'
import * as THREE from 'three';

const CHAR_SIZE_MULT = .003;

function GetPart(type) {
    if (!(type in parts))
        return null;
    return parts[type][Math.floor(Math.random() * parts[type].length)];
};

const buildPartMesh = (img) => {
    const texture = new THREE.TextureLoader().load(img.src);

    const geometry = new THREE.PlaneGeometry(
        img.width * CHAR_SIZE_MULT,
        img.height * CHAR_SIZE_MULT
    );
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        color: 0xffffff,
        transparent: true,
        side: THREE.FrontSide,
        depthWrite: false,
        depthTest: false
    });
    const mesh = new THREE.Mesh(geometry, material);

    return mesh;
};

const PartMesh = ({ partData, renderOrder }) => {
    const [mesh, setMesh] = React.useState(null);
    const part = partData['part'];
    const position = partData['position'];
    const img = partData['img'];

    React.useEffect(() => {
        let mounted = true;

        const getMesh = () => {
            const plane = buildPartMesh(img);
            plane.renderOrder = renderOrder;
            if (mounted) setMesh(plane);
        };

        getMesh();

        return () => {
            mounted = false;
            if (mesh) {
                mesh.geometry.dispose();
                mesh.material.dispose();
            }
        };
    }, [part]);

    if (!mesh) return null;
    return <primitive object={mesh} position={position} />;
};

function GetPosition(pixel, img) {
    let jointX = pixel[0];
    let jointY = img.height - pixel[1];

    let x = (img.width / 2) - jointX;
    let y = (img.height / 2) - jointY;

    return [x * CHAR_SIZE_MULT, y * CHAR_SIZE_MULT, 0];
}

async function loadPartData(part, offset) {
    if (offset == undefined)
        offset = [0, 0, 0];

    const img = await part.getPNG();
    let pixel = [img.width / 2, img.height / 2]
    if ('root' in part.joints) {
        pixel[0] = part.joints['root']['x']
        pixel[1] = part.joints['root']['y']
    }

    const position = GetPosition(pixel, img);
    position[0] += offset[0];
    position[1] += offset[1];
    position[2] += offset[2];

    const partData = {
        'part': part,
        'position': position,
        'img': img
    }

    return partData;
}

var connectionQueue = [];

async function createConnectionParts(partData) {
    const parentPart = partData['part'];

    for (var joint in parentPart.joints) {
        const p = GetPart(joint);

        if (p == undefined)
            continue;

        const jointPixel = parentPart['joints'][joint];
        const jointOffset = GetPosition([jointPixel['x'], jointPixel['y']], partData['img']);
        const offset = [
            partData['position'][0] - jointOffset[0],
            partData['position'][1] - jointOffset[1],
            partData['position'][2] - jointOffset[2],
        ];
        const newData = await loadPartData(p, offset);
        connectionQueue.push(newData);
    }

    return partData;
}

function CharacterContent() {
    const [characterParts, setCharacterParts] = React.useState([]);

    React.useEffect(() => {
        async function processQueue() {
            const sourcePart = await loadPartData(GetPart('torso'), [0, 0, 0]);
            connectionQueue = [sourcePart];

            for (let i = 0; i < connectionQueue.length; i++) {
                createConnectionParts(connectionQueue[i]);
            }

            setCharacterParts(connectionQueue);
        }
        processQueue();
    }, []);

    return (
        <group>
            {characterParts.map((partData, index) => (
                <PartMesh key={`part-${index}`} partData={partData} renderOrder={10 + index} />
            ))}
        </group>
    );
};

export default function GenerateCharacter() {
    return <CharacterContent />;
}