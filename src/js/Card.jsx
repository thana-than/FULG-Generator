import React from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { gsap } from 'gsap';
import * as THREE from 'three';
import '../css/card.css'
import GenerateCharacter from './CharacterImageGenerator.jsx'
import GenerateBackground from './BackgroundImageGenerator.jsx';
import BGSphere from './BGSphere.jsx';
import { hsvToRgb, rgbToHex } from './colorutil.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { extend } from '@react-three/fiber'
extend({ TextGeometry })
import { GenerateName, GenerateTrait } from './GenerateText.js';


export const CARD_RES_X = 630;
export const CARD_RES_Y = 880;

export const CARD_SIZE_MULT = .003;
export const CARD_SCALE_WIDTH = CARD_RES_X * CARD_SIZE_MULT;
export const CARD_SCALE_HEIGHT = CARD_RES_Y * CARD_SIZE_MULT;

export default function Card({ cardID, onReady, onAnimationComplete, onCardCreated }) {
    // Load textures
    const [cardFrameTexture, cardOutlineTexture, cardBackLogoTexture, cardBackOutlineTexture, cardBackBGTexture, cardMaskTexture, cardGradientTexture] = useTexture([
        'assets/card_frame.png',
        'assets/card_outline.png',
        'assets/card_back_logo.png',
        'assets/card_back_lines.png',
        'assets/card_back_bg.png',
        'assets/card_mask.png',
        'assets/card_gradient.png'
    ]);

    const fontLoader = new FontLoader();
    const font_title_json = fontLoader.parse(require('../fonts/Schoolbell.json'));
    const fontBold_title_json = fontLoader.parse(require('../fonts/Schoolbell_Bold.json'));
    const CARD_SUBTITLE = "Fucked Up Little Guy";

    const cardGroup = React.useRef();
    const cardFace = React.useRef();
    const cardBack = React.useRef();
    const [color, setColor] = React.useState(getRandomColor());
    const [textColor, setTextColor] = React.useState(0xffffff);
    const [isCharacterLoaded, setCharacterLoaded] = React.useState(false);
    const [isBackgroundLoaded, setBackgroundLoaded] = React.useState(false);
    const [isReady, setIsReady] = React.useState(false);
    const [isAnimationComplete, setIsAnimationComplete] = React.useState(false);
    const [characterName, setCharacterName] = React.useState(GenerateName())
    const [characterTraitGroup, setCharacterTraitGroup] = React.useState(GenerateTraitGroup())

    function GenerateTraitGroup() {
        const trait = GenerateTrait();
        const group = trait.split(/:(.*)/s, 2)
        if (group.length == 1) {
            group.push(group[0]);
            group[0] = '';
        }
        group[0] = group[0].trim()
        group[1] = group[1].trim()
        return group;
    }

    const NAME_X_MARGIN = .085;
    const NAME_Y_MARGIN = .25;
    const NAME_Z_POPOUT = 0;

    const TRAIT_Y_MARGIN = .36;

    function getRandomColor() {
        const rgb = hsvToRgb(Math.random(), 1, .4);
        const hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
        return hex;
    }

    React.useEffect(() => {
        if (isCharacterLoaded && isBackgroundLoaded) {
            setIsReady(true);
        }
    }, [isCharacterLoaded, isBackgroundLoaded]);

    React.useEffect(() => {
        if (!isReady || !cardGroup.current) return;
        // Set initial scale
        cardGroup.current.scale.set(0.01, 0.01, 0.01);

        cardGroup.current.rotation.set(0, -Math.PI * 2, 0);

        onReady();

        gsap.to(cardGroup.current.rotation, {
            x: 0,
            y: 0,
            z: 0,
            duration: 0.5,
            ease: "linear"
        })

        gsap.to(cardGroup.current.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: 1,
            ease: "back.out(1.7)",
            onComplete() {
                setIsAnimationComplete(true);
                onAnimationComplete();
            }
        });

    }, [isReady]);

    function TitleText({ text, position, size, maxWidth, align = 'left' }) {
        const textOptions = {
            font: font_title_json,
            size: size * CARD_SIZE_MULT,
            depth: .01,
            curveSegments: 1,
        }

        const tempGeometry = new TextGeometry(text, textOptions);
        tempGeometry.computeBoundingBox();
        const textWidth = tempGeometry.boundingBox.max.x - tempGeometry.boundingBox.min.x;

        const scaleMod = maxWidth ? Math.min(1, maxWidth / textWidth) : 1;
        textOptions['size'] *= scaleMod
        const finalWidth = textWidth * scaleMod;

        let xOffset = 0;
        if (align === 'center') {
            xOffset = -finalWidth / 2;
        } else if (align === 'right') {
            xOffset = -finalWidth;
        }

        const positionWithOffset = [position[0] + xOffset, position[1], position[2]];

        const outlineOptions = {
            ...textOptions,
            font: fontBold_title_json,
            depth: 0,
        }

        function TextMesh({ renderOrder, color, options }) {
            return (
                <mesh renderOrder={renderOrder} position={positionWithOffset}>
                    <textGeometry args={[text, options]} />
                    <meshBasicMaterial color={color}
                        transparent={true}
                        colorWrite={true}
                        depthWrite={false}
                        depthTest={false}
                        stencilWrite={true}
                        stencilRef={1}
                        stencilFunc={THREE.EqualStencilFunc}
                        stencilZPass={THREE.ReplaceStencilOp}
                        side={THREE.BackSide} />
                </mesh>
            );
        }

        return (
            <>
                <TextMesh renderOrder={999} color={'black'} options={outlineOptions} />
                <TextMesh renderOrder={1000} color={textColor} options={textOptions} />
            </>
        )
    }

    React.useEffect(() => {
        if (onCardCreated) {
            const cardParams = {
                cardID: cardID,
                characterName: characterName,
                traitTitle: characterTraitGroup[0],
                traitContent: characterTraitGroup[1]
            }
            onCardCreated(cardParams);
        }
    }, []);

    return (
        <>
            <group ref={cardGroup} scale={[0, 0, 0]}>

                {/* Mask plane - this will define the visible area */}
                <mesh renderOrder={-10000}>
                    <planeGeometry args={[CARD_SCALE_WIDTH, CARD_SCALE_HEIGHT]} />
                    <meshStandardMaterial
                        map={cardMaskTexture}
                        alphaTest={0.5}
                        transparent={true}
                        colorWrite={false}
                        depthWrite={false}
                        depthTest={false}
                        stencilWrite={true}
                        stencilRef={1}
                        stencilFunc={THREE.AlwaysStencilFunc}
                        stencilZPass={THREE.ReplaceStencilOp}
                    />
                </mesh>

                {/* Front side */}
                <group ref={cardFace}>
                    <GenerateBackground onLoad={() => setBackgroundLoaded(true)} />

                    {/* maxWidth={CARD_SCALE_WIDTH - SLOGAN_X_MARGIN * 2}  */}

                    <mesh renderOrder={100}>
                        <planeGeometry args={[CARD_SCALE_WIDTH, CARD_SCALE_HEIGHT]} />
                        <meshStandardMaterial map={cardOutlineTexture} color={color} transparent={true} opacity={.66} side={THREE.FrontSide} />
                    </mesh>
                    <TitleText text={characterName.toUpperCase()} position={[-CARD_SCALE_WIDTH / 2 + NAME_X_MARGIN, CARD_SCALE_HEIGHT / 2 - NAME_Y_MARGIN, NAME_Z_POPOUT]} maxWidth={CARD_SCALE_WIDTH - NAME_X_MARGIN * 2} size={42} />
                    <TitleText text={CARD_SUBTITLE} font={font_title_json} position={[-CARD_SCALE_WIDTH / 2 + NAME_X_MARGIN + .01, CARD_SCALE_HEIGHT / 2 - TRAIT_Y_MARGIN, NAME_Z_POPOUT]} maxWidth={CARD_SCALE_WIDTH - NAME_X_MARGIN * 2} size={24} />
                    <TitleText text={characterTraitGroup[0].toUpperCase()} position={[CARD_SCALE_WIDTH / 2 - NAME_X_MARGIN, -CARD_SCALE_HEIGHT / 2 + .245, NAME_Z_POPOUT]} maxWidth={CARD_SCALE_WIDTH - NAME_X_MARGIN * 2} size={24} align={'right'} />
                    <TitleText text={characterTraitGroup[1]} position={[CARD_SCALE_WIDTH / 2 - NAME_X_MARGIN, -CARD_SCALE_HEIGHT / 2 + .11, NAME_Z_POPOUT]} maxWidth={CARD_SCALE_WIDTH - NAME_X_MARGIN * 2} size={32} align={'right'} />
                    <GenerateCharacter onLoad={() => setCharacterLoaded(true)} />
                </group>

                <mesh renderOrder={90} rotation={[0, Math.PI, 0]}>
                    <planeGeometry args={[CARD_SCALE_WIDTH, CARD_SCALE_HEIGHT]} />
                    <meshStandardMaterial
                        map={cardMaskTexture}
                        alphaTest={0.5}
                        transparent={true}
                        colorWrite={false}
                        depthWrite={false}
                        depthTest={false}
                        stencilWrite={true}
                        stencilRef={2}
                        stencilFunc={THREE.AlwaysStencilFunc}
                        stencilZPass={THREE.ReplaceStencilOp}
                        side={THREE.FrontSide}
                    />
                </mesh>

                {/* Back side (flipped) */}
                <group ref={cardBack}>
                    <mesh renderOrder={100} rotation={[0, Math.PI, 0]}>
                        <planeGeometry args={[CARD_SCALE_WIDTH, CARD_SCALE_HEIGHT]} />
                        <meshStandardMaterial map={cardBackLogoTexture} transparent={true} side={THREE.FrontSide} />
                    </mesh>
                    <mesh renderOrder={99} position={[0, 0, .02]} rotation={[0, Math.PI, 0]}>
                        <planeGeometry args={[CARD_SCALE_WIDTH, CARD_SCALE_HEIGHT]} />
                        <meshStandardMaterial map={cardBackOutlineTexture} transparent={true} side={THREE.FrontSide}
                            depthWrite={true}
                            depthTest={false}
                            stencilWrite={true}
                            stencilRef={2}
                            stencilFunc={THREE.EqualStencilFunc}
                            stencilFail={THREE.KeepStencilOp}
                            stencilZPass={THREE.KeepStencilOp} />
                    </mesh>
                    <mesh renderOrder={98} position={[0, 0, .03]} rotation={[0, Math.PI, 0]}>
                        <planeGeometry args={[CARD_SCALE_WIDTH, CARD_SCALE_HEIGHT]} />
                        <meshStandardMaterial map={cardBackOutlineTexture} transparent={true} side={THREE.FrontSide}
                            depthWrite={true}
                            depthTest={false}
                            stencilWrite={true}
                            stencilRef={2}
                            stencilFunc={THREE.EqualStencilFunc}
                            stencilFail={THREE.KeepStencilOp}
                            stencilZPass={THREE.KeepStencilOp} />
                    </mesh>

                    <mesh renderOrder={96} position={[0, 0, .05]} rotation={[0, Math.PI, 0]}>
                        <planeGeometry args={[cardBackBGTexture.image.width * CARD_SIZE_MULT, cardBackBGTexture.image.height * CARD_SIZE_MULT]} />
                        <meshStandardMaterial map={cardBackBGTexture} transparent={true} side={THREE.FrontSide}
                            depthWrite={true}
                            depthTest={false}
                            stencilWrite={true}
                            stencilRef={2}
                            stencilFunc={THREE.EqualStencilFunc}
                            stencilFail={THREE.KeepStencilOp}
                            stencilZPass={THREE.KeepStencilOp} />
                    </mesh>
                </group>
            </group>

            <BGSphere color={0x292929} renderOrder={95} stencilRef={2} />
        </>
    );
}