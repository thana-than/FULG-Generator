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
import { GenerateName, GenerateSlogan, GenerateTrait } from './GenerateText.js';


export const CARD_RES_X = 630;
export const CARD_RES_Y = 880;

export const CARD_SIZE_MULT = .003;
export const CARD_SCALE_WIDTH = CARD_RES_X * CARD_SIZE_MULT;
export const CARD_SCALE_HEIGHT = CARD_RES_Y * CARD_SIZE_MULT;

const INCLUDE_SLOGAN = false;

export default function Card({ onReady, onAnimationComplete }) {
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
    const font_slogan = 'Schoolbell';
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
    const [characterSlogan, setCharacterSlogan] = React.useState(GenerateSlogan())
    const [characterTraitGroup, setCharacterTraitGroup] = React.useState(GenerateTraitGroup())

    function GenerateTraitGroup() {
        const group = GenerateTrait().split(':')
        if (group.length == 1) {
            group.push(group[0]);
            group[0] = '';
        }
        group[0] = group[0].toUpperCase()
        return group;
    }

    const NAME_X_MARGIN = .085;
    const NAME_Y_MARGIN = .25;
    const NAME_Z_POPOUT = 0;

    const TRAIT_Y_MARGIN = .36;
    const SLOGAN_X_MARGIN = .085;
    const SLOGAN_Y = .55;
    const SLOGAN_BOTTOM_MARGIN = 0.025;
    const SLOGAN_Z_POPOUT = .01;

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

    function FrameBox({ position, size }) {
        return (
            <mesh renderOrder={99} depthWrite={false} position={position} >
                <boxGeometry args={size} />
                <meshBasicMaterial
                    color={color}
                    transparent={true}
                    colorWrite={true}
                    depthWrite={false}
                    depthTest={false}
                    stencilWrite={true}
                    stencilRef={1}
                    stencilFunc={THREE.EqualStencilFunc}
                    stencilZPass={THREE.ReplaceStencilOp}
                    side={THREE.BackSide}
                />
            </mesh>
        );
    }

    function TitleText({ text, font, position, size, maxWidth, align = 'left' }) {
        const textOptions = {
            font: font,
            size: size * CARD_SIZE_MULT,
            depth: .01,
            curveSegments: 12,
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

        return (
            <mesh renderOrder={1000} position={[position[0] + xOffset, position[1], position[2]]}>
                <textGeometry args={[text, textOptions]} />
                <meshBasicMaterial color={textColor}
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
        )
    }

    function SloganText({ text, font, fontSize, position = [0, 0, 0], size = [CARD_SCALE_WIDTH, CARD_SCALE_HEIGHT], align = 'left', lineHeight = 1.6, maxLines = 4 }) {
        const texture = React.useMemo(() => {
            const canvas = document.createElement('canvas');
            canvas.width = size[0] / CARD_SIZE_MULT;
            canvas.height = size[1] / CARD_SIZE_MULT;

            const context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.textAlign = 'center';
            context.textBaseline = "middle";
            context.font = `${fontSize}pt ${font}`;


            wrapText(context, text, canvas.width, 50, lineHeight);

            const texture = new THREE.CanvasTexture(canvas);
            texture.anisotropy = 16; //* For better texture quality
            return texture;

            function wrapText(ctx, text, maxWidth, margin, lineHeight) {
                const lines = [];
                let line = '';

                // Split paragraphs first
                const paragraphs = text.split('\n');

                paragraphs.forEach(paragraph => {
                    const words = paragraph.split(' ');
                    line = words[0];

                    for (let i = 1; i < words.length; i++) {
                        const testLine = line + ' ' + words[i];
                        const metrics = ctx.measureText(testLine);
                        if (metrics.width <= maxWidth - margin) {
                            line = testLine;
                        } else {
                            lines.push(line);
                            line = words[i];
                        }
                    }
                    lines.push(line);
                });

                const len = Math.min(lines.length, maxLines);
                for (let i = 0; i < len; i++) {
                    let x = margin;
                    if (align === 'center') x = maxWidth / 2;
                    if (align === 'right') x = maxWidth;

                    const y = canvas.height - (len - i) * lineHeight * fontSize;//yOffset + i * lineHeight * fontSize;

                    ctx.lineWidth = 2;
                    ctx.strokeStyle = '#000000';
                    ctx.strokeText(lines[i], x, y);

                    ctx.fillStyle = '#ffffff';
                    ctx.fillText(lines[i], x, y);
                }
            }
        }, [text]);

        return (
            <mesh position={[position[0], position[1] - size[1] / 2 + CARD_SCALE_HEIGHT / 2, position[2]]}>
                <planeGeometry args={size} />
                <meshBasicMaterial
                    map={texture}
                    side={THREE.FrontSide}
                    transparent
                    alphaTest={0.1}
                />
            </mesh>
        );
    }

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
                    <TitleText text={characterName.toUpperCase()} font={font_title_json} position={[-CARD_SCALE_WIDTH / 2 + NAME_X_MARGIN, CARD_SCALE_HEIGHT / 2 - NAME_Y_MARGIN, NAME_Z_POPOUT]} maxWidth={CARD_SCALE_WIDTH - NAME_X_MARGIN * 2} size={42} />
                    {/* <TitleText text={"FUCKED UP LITTLE GUY"} font={font_title_json} position={[CARD_SCALE_WIDTH / 2 - .98, -CARD_SCALE_HEIGHT / 2 + .11, NAME_Z_POPOUT]} maxWidth={CARD_SCALE_WIDTH - NAME_X_MARGIN * 2} size={24} /> */}
                    <TitleText text={CARD_SUBTITLE} font={font_title_json} position={[-CARD_SCALE_WIDTH / 2 + NAME_X_MARGIN + .01, CARD_SCALE_HEIGHT / 2 - TRAIT_Y_MARGIN, NAME_Z_POPOUT]} maxWidth={CARD_SCALE_WIDTH - NAME_X_MARGIN * 2} size={24} />
                    <TitleText text={characterTraitGroup[0]} font={font_title_json} position={[CARD_SCALE_WIDTH / 2 - NAME_X_MARGIN, -CARD_SCALE_HEIGHT / 2 + .245, NAME_Z_POPOUT]} maxWidth={CARD_SCALE_WIDTH - NAME_X_MARGIN * 2} size={24} align={'right'} />
                    <TitleText text={characterTraitGroup[1]} font={font_title_json} position={[CARD_SCALE_WIDTH / 2 - NAME_X_MARGIN * 1.5, -CARD_SCALE_HEIGHT / 2 + .11, NAME_Z_POPOUT]} maxWidth={CARD_SCALE_WIDTH - NAME_X_MARGIN * 3} size={32} align={'right'} />
                    {INCLUDE_SLOGAN && <SloganText text={characterSlogan} font={font_slogan} fontSize={24} position={[0, -CARD_SCALE_HEIGHT + SLOGAN_Y, SLOGAN_Z_POPOUT]} size={[CARD_SCALE_WIDTH - SLOGAN_X_MARGIN * 2, SLOGAN_Y - SLOGAN_BOTTOM_MARGIN]} align={'center'} />}
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