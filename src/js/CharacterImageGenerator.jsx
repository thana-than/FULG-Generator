import React from 'react';
import { parts } from './metadata.js'
import * as THREE from 'three';

const CHAR_SIZE_MULT = .0025;
const CHAR_POSITION_OFFSET = [0, -.15, -.1]
const CHAR_BASE_RENDER_OFFSET = -100

const TYPE_RENDER_ORDER = {
    'head': 15,
    'l_arm': 11,
    'r_arm': 10,
    'legs': 5,
    'torso': 0,
}

var cached_partIndexes = {};
var testjson = {}
if (process.env.TESTMODE === 'true') {
    testjson = require("/testparts.json");
}

function resetGenerator() {
    cached_partIndexes = {};
}

function getTypeCacheKey(type) {
    const arr = type.split('.')[0].split('_');
    type = arr[arr.length - 1] //* Get the last of the '_' split
    console.log(type);
    return type;
}

function GetPart(type) {
    if (!(type in parts))
        return null;

    let index = -1

    const cacheKey = getTypeCacheKey(type);
    if (process.env.TESTMODE === 'true' && type in testjson) {
        console.log("Searching test requirement for " + type + ": " + testjson[type])
        index = parts[type].findIndex((element) => element.key.includes(testjson[type]))
    } else if (cached_partIndexes[cacheKey] !== undefined) {
        index = cached_partIndexes[cacheKey];
    }

    if (index < 0)
        index = Math.floor(Math.random() * parts[type].length);

    cached_partIndexes[cacheKey] = index;

    return parts[type][index];
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

async function loadPartData(part, offset, sortFudge = 0) {
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

    const type = part['type'].split('.')[0]

    let renderOrder = CHAR_BASE_RENDER_OFFSET
    if (part.sort !== undefined)
        renderOrder += part.sort;
    else if (type in TYPE_RENDER_ORDER) {
        renderOrder += TYPE_RENDER_ORDER[type]
    }
    renderOrder += sortFudge

    const partData = {
        'part': part,
        'position': position,
        'texture': texture,
        'renderOrder': renderOrder
    }

    return partData;
}

async function createConnectionParts(partData) {
    const parentPart = partData['part'];
    const newParts = [];

    for (var joint in parentPart.joints) {
        const jointID = joint.split('.')
        const jType = jointID[0] //*Ensures we get the right type even if it's indexed
        const sortFudge = jointID.length > 1 ? parseInt(jointID[1]) || 0 : 0;
        const p = GetPart(jType);

        if (p == undefined)
            continue;

        const jointPixel = parentPart['joints'][joint];
        const jointOffset = GetPosition([jointPixel['x'], jointPixel['y']], partData['texture']);
        const offset = [
            partData['position'][0] - jointOffset[0],
            partData['position'][1] - jointOffset[1],
            partData['position'][2] - jointOffset[2],
        ];
        const newData = await loadPartData(p, offset, sortFudge);
        newParts.push(newData);
    }

    return newParts;
}

function CharacterContent({ onLoad }) {
    const [characterParts, setCharacterParts] = React.useState([]);

    React.useEffect(() => {
        resetGenerator()

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
            onLoad();
        }
        buildCharacter();
    }, []);

    return (
        <group>
            {characterParts.map((partData, index) => (
                <PartMesh key={`part-${index}`} partData={partData} renderOrder={partData['renderOrder']} />
            ))}
        </group>
    );
};

export default function GenerateCharacter({ onLoad }) {
    return <CharacterContent onLoad={onLoad} />;
}