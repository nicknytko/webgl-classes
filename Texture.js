/**
 * @fileoverview Texture - WebGL Texture class.
 * @author Nicolas NYtko
 */

/** Class implementing a GL texture */
class Texture {
    constructor() {
        this.texture = gl.createTexture();
        this.textureType = 0;
    }

    /**
     * Activates the texture unit and binds the data.
     * @param {GLEnum} number Texture unit to bind to.
     */
    bind(number) {
        if (!number) {
            number = gl.TEXTURE0;
        }
        gl.activeTexture(number);
        gl.bindTexture(this.textureType, this.texture);
    }

    /**
     * Creates a cubemap texture from 6 image sides.
     * @param {string} negX Url for the -X face.
     * @param {string} negY Url for the -Y face.
     * @param {string} negZ Url for the -Z face.
     * @param {string} posX Url for the +X face.
     * @param {string} posY Url for the +Y face.
     * @param {string} posZ Url for the +Z face.
     * @return {promise} Promise that when resolved will have a texture object.
     */

    static cubemapFromUrl(negX, negY, negZ, posX, posY, posZ) {
        let promises = [];
        promises.push(
            Texture.imageFromUrl(negX, { face: gl.TEXTURE_CUBE_MAP_NEGATIVE_X }));
        promises.push(
            Texture.imageFromUrl(negY, { face: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y }));
        promises.push(
            Texture.imageFromUrl(negZ, { face: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z }));
        promises.push(
            Texture.imageFromUrl(posX, { face: gl.TEXTURE_CUBE_MAP_POSITIVE_X }));
        promises.push(
            Texture.imageFromUrl(posY, { face: gl.TEXTURE_CUBE_MAP_POSITIVE_Y }));
        promises.push(
            Texture.imageFromUrl(posZ, { face: gl.TEXTURE_CUBE_MAP_POSITIVE_Z }));

        return new Promise((resolve, reject) => {
            Promise.all(promises).then((values) => {
                let tex = new Texture();
                tex.textureType = gl.TEXTURE_CUBE_MAP;
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, tex.texture);
                
                for (let i = 0; i < values.length; i++) {
                    console.log(values[i]);
                    gl.texImage2D(values[i].extra.face, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, values[i]);
                }

                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

                resolve(tex);
            })
        });
    }

    /**
     * Loads a image from a url as as a javascript image.
     * @param {string} url Url to load the image from.
     * @param {object} extra Any extra data to be saved in the returned
     * image object. Useful for storing for example the image id or face id, etc.
     * @return Promise to a JS image.
     */
    static imageFromUrl(url, extra) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => {
                resolve(image);
            }
            image.src = url;
            if (extra) {
                image.extra = extra;
            }
        });
    }
}
