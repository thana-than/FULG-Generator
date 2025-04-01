import Global from './Global.js'
import React from 'react';
import { parts } from './metadata.js'
import * as THREE from 'three';

const CHAR_SIZE_MULT = .003;
const CHAR_POSITION_OFFSET = [0, -.1, -.1]
const CHAR_BASE_RENDER_OFFSET = -100

const TYPE_RENDER_ORDER = {
    'head': 15,
    'l_arm': 10,
    'r_arm': 10,
    'legs': 5,
    'torso': 0,
}

var arm_index = -1
var testjson = {}
if (Global.TEST_MODE) {
    try {
        testjson = await import('/testparts.json');
    } catch (e) {
        console.log("testparts.json does not exist.")
    }
}

function resetGenerator() {
    arm_index = -1
}


function isArmType(type) {
    return type == 'l_arm' || type == 'r_arm';
}

function GetPart(type) {
    if (!(type in parts))
        return null;

    let index = -1

    if (Global.TEST_MODE && type in testjson) {

        console.log("Searching test requirement for " + type + ": " + testjson[type])
        index = parts[type].findIndex((element) => element.key.includes(testjson[type]))
    }
    else if (isArmType(type) && arm_index >= 0) {
        index = arm_index;
        console.log("Selected cached arm index for " + type + ": " + index)
    }

    if (index < 0)
        index = Math.floor(Math.random() * parts[type].length);

    if (isArmType(type))
        arm_index = index;

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

    let renderOrder = CHAR_BASE_RENDER_OFFSET
    if (part['type'] in TYPE_RENDER_ORDER) {
        renderOrder += TYPE_RENDER_ORDER[part['type']]
    }

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

export default function GenerateCharacter() {
    return <CharacterContent />;
}