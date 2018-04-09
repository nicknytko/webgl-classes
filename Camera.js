/** @file 3D Camera class.
 *  Taken from my MP2.
 *  @author Nicolas Nytko <nnytko2@illinois.edu>
 */

/** Class implementing a 3D Camera */
class Camera {
    constructor(origin, lookDirection) {
        this.eyePoint = vec3.clone(origin);
        this.up = vec3.fromValues(0.0, 1.0, 0.0);
        this.viewPoint = vec3.create();
        
        vec3.add(this.viewPoint, this.eyePoint, lookDirection);
        this.translation = vec3.create();
        this.rotation = quat.create();
        this.lookDirection = lookDirection;
        
        this.lookAtMatrix = mat4.create();
        mat4.lookAt(this.lookAtMatrix, this.eyePoint, this.viewPoint, this.up);
    }

    /**
     * Returns the view matrix for the given camera transformation.
     * Will automatically invert translations and rotations.
     *
     * @param {Matrix} outMatrix Matrix to store the result in.
     */
    getViewMatrix(outMatrix) {
        var rot = mat4.create();
        mat4.fromQuat(rot, this.rotation);
        var trans = mat4.create();
        mat4.fromTranslation(trans, this.translation);

        mat4.multiply(outMatrix, rot, trans);
        mat4.multiply(outMatrix, outMatrix, this.lookAtMatrix);
    }

    /**
     * Rotates a vector relative to the camera.
     * @param {number} x coordinate
     * @param {number} y coordinate
     * @param {number} z coordinate
     * @return {vec3} Rotated vector
     */
    getLocalVector(x, y, z) {
        var rotVec = vec3.fromValues(x, y, z);
        var conj = quat.create();
        quat.conjugate(conj, this.rotation);
        vec3.transformQuat(rotVec, rotVec, conj);

        return rotVec;
    }

    /**
     * Rotate the camera on the world X axis.
     * @param {number} degrees Angle to rotate by.
     */
    rotateX(degrees) {
        quat.rotateX(this.rotation, this.rotation, -degToRad(degrees));
    }

    /**
     * Rotate the camera on the world Y axis.
     * @param {number} degrees Angle to rotate by.
     */
    rotateY(degrees) {
        quat.rotateY(this.rotation, this.rotation, -degToRad(degrees));
    }

    /**
     * Rotate the camera on the world Z axis.
     * @param {number} degrees Angle to rotate by.
     */
    rotateZ(degrees) {
        quat.rotateZ(this.rotation, this.rotation, -degToRad(degrees));
    }

    /**
     * Rotate the camera on the local X axis.
     * @param {number} degrees Angle to rotate by.
     */
    rotateLocalX(degrees) {
        var rotQuat = quat.create();
        quat.setAxisAngle(rotQuat, this.getLocalVector(1.0, 0.0, 0.0), -degToRad(degrees));
        quat.multiply(this.rotation, this.rotation, rotQuat);
    }

    /**
     * Rotate the camera on the local Y axis.
     * @param {number} degrees Angle to rotate by.
     */
    rotateLocalY(degrees) {
        var rotQuat = quat.create();
        quat.setAxisAngle(rotQuat, this.getLocalVector(0.0, 1.0, 0.0), -degToRad(degrees));
        quat.multiply(this.rotation, this.rotation, rotQuat);   
    }

    /**
     * Rotate the camera on the local Z axis.
     * @param {number} degrees Angle to rotate by.
     */
    rotateLocalZ(degrees) {
        var rotQuat = quat.create();
        quat.setAxisAngle(rotQuat, this.getLocalVector(0.0, 0.0, 1.0), -degToRad(degrees));
        quat.multiply(this.rotation, this.rotation, rotQuat);
    }
    
    /**
     * Set the absolute camera position in world coordinates.
     * @param {number} x New x position of the camera.
     * @param {number} y New y position of the camera.
     * @param {number} z New z position of the camera.
     */
    setWorldPos(x, y, z) {
        this.translation[0] = x;
        this.translation[1] = y;
        this.translation[2] = z;
    }
    
    /**
     * Translate the camera in world coordinates
     * @param {number} x Units to translate on the x axis.
     * @param {number} y Units to translate on the y axis.
     * @param {number} z Units to translate on the z axis.
     */
    translate(x, y, z) {
        vec3.subtract(this.translation, this.translation, vec3.fromValues(x, y, z));
    }

    /**
     * Translate the camera in local camera coordinates.
     * @param {number} x Units to translate on the x axis.
     * @param {number} y Units to translate on the y axis.
     * @param {number} z Units to translate on the z axis.
     */
    translateLocal(x, y, z) {
        var amt = vec3.fromValues(x, y, z);
        var conj = quat.create();
        quat.conjugate(conj, this.rotation);
        vec3.transformQuat(amt, amt, conj);
        vec3.subtract(this.translation, this.translation, amt);        
    }
}
