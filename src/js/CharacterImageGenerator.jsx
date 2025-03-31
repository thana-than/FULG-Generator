import React from 'react';
import { parts } from './metadata.js'
import * as THREE from 'three';

const CHAR_SIZE_MULT = .003;
const CHAR_POSITION_OFFSET = [0, -.1, -.1]
const CHAR_BASE_RENDER_OFFSET = -100

function GetPart(type) {
    if (!(type in parts))
        return null;

    //TODO allow pull from a custom part type dictionary that allows us to continuously preview a specific part type
    //TODO ensure the above TODO is only available in dev (GOD_MODE?)

    let randomIndex = Math.floor(Math.random() * parts[type].length);
    return parts[type][randomIndex];
};

const PartMesh = ({ partData, renderOrder }) => {
    const [mesh, setMesh] = React.useState(null);
    const part = partData['part'];
    const position = partData['position'];
    const texture = partData['texture'];

    React.useEffect(() => {
        let mounted = true;

        const getMesh = () => {
            if (!mounted) return;

            const geometry = new THREE.PlaneGeometry(
                texture.image.width * CHAR_SIZE_MULT,
                texture.image.height * CHAR_SIZE_MULT
            );
            const material = new THREE.MeshBasicMaterial({
                map: texture,
                color: 0xffffff,
                transparent: true,
                side: THREE.FrontSide,
                depthWrite: false,
                depthTest: false,
                stencilWrite: true,
                stencilRef: 1,
                stencilFunc: THREE.EqualStencilFunc,
                stencilFail: THREE.KeepStencilOp,
                stencilZPass: THREE.KeepStencilOp
            });
            const plane = new THREE.Mesh(geometry, material);
            plane.renderOrder = renderOrder;

            setMesh(plane);
        };

        getMesh();

        return () => {
            mounted = false;
            if (mesh) {
                mesh.geometry.dispose();
                if (mesh.material.map) mesh.material.map.dispose();
                mesh.material.dispose();
            }
        };
    }, [part]);

    if (!mesh) return null;
    return <primitive object={mesh} position={position} />;
};

function GetPosition(pixel, texture) {
    let jointX = pixel[0];
    let jointY = texture.image.height - pixel[1];

    let x = (texture.image.width / 2) - jointX;
    let y = (texture.image.height / 2) - jointY;

    return [x * CHAR_SIZE_MULT, y * CHAR_SIZE_MULT, 0];
}

async function loadPartData(part, offset) {
    if (offset == undefined)
        offset = [0, 0, 0];

    const texture = await part.getTexture();
    let pixel = [texture.image.width / 2, texture.image.height / 2]
    if ('root' in part.joints) {
        pixel[0] = part.joints['root']['x']
        pixel[1] = part.joints['root']['y']
    }

    const position = GetPosition(pixel, texture);
    position[0] += offset[0];
    position[1] += offset[1];
    position[2] += offset[2];


    const partData = {
        'part': part,
        'position': position,
        'texture': texture,
        'renderOrder': CHAR_BASE_RENDER_OFFSET //TODO customize per type
    }

    return partData;
}

async function createConnectionParts(partData) {
    const parentPart = partData['part'];
    const newParts = [];

    for (var joint in parentPart.joints) {
        const p = GetPart(joint);

        if (p == undefined)
            continue;

        const jointPixel = parentPart['joints'][joint];
        const jointOffset = GetPosition([jointPixel['x'], jointPixel['y']], partData['texture']);
        const offset = [
            partData['position'][0] - jointOffset[0],
            partData['position'][1] - jointOffset[1],
            partData['position'][2] - jointOffset[2],
        ];
        const newData = await loadPartData(p, offset);
        newParts.push(newData);
    }

    return newParts;
}

function CharacterContent() {
    const [characterParts, setCharacterParts] = React.useState([]);

    React.useEffect(() => {
        async function buildCharacter() {
            const sourcePart = await loadPartData(GetPart('torso'), CHAR_POSITION_OFFSET);
            let allParts = [sourcePart];
            let queue = [sourcePart];
            let max = 50;
            let increment = 0;
            //TODO some sort of validation in case something goes awry (ie. torso mapped instead of root for a part)
            while (queue.length > 0 && increment < max) {
                const currentPart = queue.shift();
                const connectedParts = await createConnectionParts(currentPart);
                allParts = [...allParts, ...connectedParts];
                queue = [...queue, ...connectedParts];
                increment++;
            }

            setCharacterParts(allParts);
        }
        buildCharacter();
    }, []);

    return (
        <group>
            {characterParts.map((partData, index) => (
                <PartMesh key={`part-${index}`} partData={partData} renderOrder={partData['renderOrder'] + index} />
            ))}
        </group>
    );
};

export default function GenerateCharacter() {
    return <CharacterContent />;
}