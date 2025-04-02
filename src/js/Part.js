import * as IMG from '../.generated/partIMG.js';
import * as THREE from 'three';

export default class Part {
    #img = null;
    #imgUrl = null; //* Track the URL separately for cleanup
    #texture = null;

    constructor(key, json) {
        this.key = key;
        this.type = json['type'];
        this.vibes = json['vibes'];
        this.joints = json['joints'];
    }

    /**
    * @returns {Promise<THREE.Texture | null>}
    */
    async getTexture() {
        if (this.#texture) return this.#texture;

        try {
            const importFn = IMG[this.type][this.key];
            const module = await importFn();
            this.#imgUrl = module.default;
            this.#img = await this.#loadImage(this.#imgUrl);

            this.#texture = new THREE.Texture(this.#img);
            this.#texture.needsUpdate = true

            return this.#texture;
        } catch (error) {
            console.error(`Failed to load texture for ${this.key}:`, error);
            return null;
        }
    }

    /**
    * @returns {Promise<HTMLImageElement>}
    */
    #loadImage(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = url;
        });
    }

    dispose() {
        if (this.#img) {
            this.#img.src = '';
            if (this.#img.parentNode) {
                this.#img.parentNode.removeChild(this.#img);
            }
        }

        if (this.#texture) {
            this.#texture.dispose();
        }

        this.#img = null;
        this.#imgUrl = null;
        this.#texture = null;
    }
}