/**
 * @file A shader class to wrap WebGL shader functionality in an object-oriented programming model.
 * @author Nicolas Nytko <nnytko2@illinois.edu>
 */

/* Helper functions */

/**
 * Loads a shader program from the DOM.
 * @param {String} elemName DOM element to pull shader source code from.
 * @return {String} Shader source code that was found.
 */
function loadDOMScriptSource(elemName) {
    var element = document.getElementById(elemName);
    var source = "";
    for (var i = 0; i < element.childNodes.length; i++) {
        if (element.childNodes[i].nodeType == 3) {
            source += element.childNodes[i].textContent;
        }
    }
    return source;
}

/**
 * Compile a single shader program.
 * @param {String} source The shader source code.
 * @param {gl.VERTEX_SHADER | gl.FRAGMENT_SHADER} type The type of shader.
 * @return {Shader} A compiled shader program on success, null on failure.
 */
function compileShader(source, type) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        let info = gl.getShaderInfoLog(shader);
        let typeName = null;
        
        switch (type) {
        case gl.VERTEX_SHADER:
            typeName = "vertex";
            break;
        case gl.FRAGMENT_SHADER:
            typeName = "fragment";
            break;
        default:
            typeName = "unknown";
        }
        
        alert("Failed to compile " + typeName + " shader!");
        console.log("Error compiling shader: " + info);
        return null;
    }
    return shader;
}

/**
 * Link two compiled shaders into a shader program.
 * @param {Shader} vertShader
 * @param {Shader} fragShader
 * @return {Shader Program} A linked shader program on success,
 * otherwise null on failure.
 */
function linkShaderProgram(vertShader, fragShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        let info = gl.getProgramInfoLog(program);
        alert("Failed to link shader!");
        console.log("Error linking shader: " + info);
        return null;
    }
    return program;
}

/**
 * Represents a shader.  Create by passing in an already made shader handle.
 */
class Shader {
    constructor(shaderProgramHandle) {
        this.program = shaderProgramHandle;
    }

    /**
     * Enables the use of a shader uniform as a Javascript object property.
     * @param {string} name Name of the GLSL uniform.  This will also be the property name.
     * @param {function} accessFunc Function that is used to set the uniform, ex: gl.uniform1fv.
     */
    enableUniform(name, accessFunc) {
        let uniformLocation = gl.getUniformLocation(this.program, name);
        
        Object.defineProperty(this, name, {
            configurable: true,
            enumerable: true,
            set: function(val) {
                if (accessFunc.name.startsWith("uniformMatrix")) {
                    gl[accessFunc.name](uniformLocation, false, val);
                } else {
                    gl[accessFunc.name](uniformLocation, val);
                }
            }
        });
    }

    /**
     * Enables the use of a shader attribute as a Javascript object property.
     * @param {string} name Name of the GLSL attribute.  This will also be the property name.
     * @param {GLenum} bufferType Type of buffer that will be passed to gl.bindBuffer.
     * @param {number} components Number of components per vertex attribute.
     * @param {GLenum} type Data type of each component.
     */
    enableAttribute(name, bufferType, components, type) {
        let attribLocation = gl.getAttribLocation(this.program, name);
        
        Object.defineProperty(this, name, {
            configurable: true,
            enumerable: true,
            set: function(val) {
                gl.bindBuffer(bufferType, val);
                gl.vertexAttribPointer(attribLocation, components, type, false, 0, 0);
                gl.enableVertexAttribArray(attribLocation);
            }
        });        
    }

    /**
     * Uses the shader program.
     */
    use() {
        gl.useProgram(this.program);
    }
    
    /**
     * Loads and compiles a full shader program from the DOM.
     * @param {string} vertElem DOM element for the vertex shader.
     * @param {string} fragElem DOM element for the fragment shader.
     * @return {Shader object} A fully linked shader program on success,
     * otherwise null on failure.
     */
    static fromDOM(vertElem, fragElem) {
        var vertShader =
            compileShader(loadDOMScriptSource(vertElem), gl.VERTEX_SHADER);
        var fragShader =
            compileShader(loadDOMScriptSource(fragElem), gl.FRAGMENT_SHADER);
        
        if (vertShader != null && fragShader != null) {
            return new Shader(linkShaderProgram(vertShader, fragShader));
        } else {
            return null;
        }       
    }
};
