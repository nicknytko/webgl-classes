/**
 * @fileoverview Mesh - A simple 3D surface mesh for use with WebGL
 * @author Eric Shaffer, Nicolas Nytko
 * Extended from Eric Shaffer's lab code.
 */

/** Class implementing triangle surface mesh. */
class Mesh {   
    /**
     * Initialize members of a TriMesh object
     */
    constructor() {
        /* Allocate buffers */
        this.vertices = [];
        this.faces = [];
        this.normals = [];

        this.numFaces=0;
        this.numVertices=0;
        
        /* AABB properties */
        this.minXYZ = [0,0,0];
        this.maxXYZ = [0,0,0];
        
        /* Get extension for 4 byte integer indices for drawElements */
        if (gl.getExtension('OES_element_index_uint') == null) {
            alert("OES_element_index_uint is unsupported by your browser!");
        } 
    }
    
    /**
     * Find a box defined by min and max XYZ coordinates
     */
    computeAABB() {
        for (let i = 0; i < this.vertices.length; i += 3) {
            for (let j = 0; j < 3; j++) {
                if (this.vertices[i + j] < this.minXYZ[j]) {
                    this.minXYZ[j] = this.vertices[i + j];
                }
                if (this.vertices[i + j] > this.maxXYZ[j]) {
                    this.maxXYZ[j] = this.vertices[i + j];
                }
            }
        }
    }
    
    /**
     * Return an axis-aligned bounding box
     */
    getAABB() {
        return {
            min: this.minXYZ,
            max: this.maxXYZ
        };
    }

    /**
     * Gets the absolute size of the mesh as a 3D vector
     * i.e. maxXYZ - minXYZ.
     * @return {vec3} Absolute mesh size
     */
    getSize() {
        var size = vec3.create();
        vec3.subtract(size, this.maxXYZ, this.minXYZ);
        return size;
    }

    /**
     * Draws the model using the face index buffer. Assumes that
     * vertex data has already been sent to the shader.
     */
    draw() {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(gl.TRIANGLES, this.indexBuffer.numItems, gl.UNSIGNED_INT, 0);
    }
    
    /**
     * Load a mesh from OBJ file data.
     * @param {string} text of an OBJ file
     * @return {Mesh} Mesh object created from the OBJ.
     */
    static fromObj(fileText) {
        let mesh = new Mesh();
        let lines = fileText.split("\n");
        let vertex = 0;
        let face = 0;
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            if (line[0] == '#') {
                /* Skip comments in the file */
                continue;
            }

            let split = line.split(/ +/);
            if (split[0] == 'v') {
                mesh.vertices.push(parseFloat(split[1]),
                                  parseFloat(split[2]),
                                  parseFloat(split[3]));
            } else if (split[0] == 'f') {
                mesh.faces.push(parseInt(split[1]) - 1,
                                  parseInt(split[2]) - 1,
                                  parseInt(split[3]) - 1);                
            }
        }

        mesh.numVertices = mesh.vertices.length / 3;
        mesh.numFaces = mesh.faces.length / 3;
        mesh.computeAABB();
        
        mesh.generateNormals();
        mesh.generateBuffers();
        
        return mesh;
    }
    
    /**
     * Generates a plane of size 2 along a given axis.
     * @param {string} axis "x" || "y" || "z"
     * @return {Mesh} The plane as a mesh object.
     */
    static fromPlane(axis) {
        let mesh = new Mesh();

        if (axis == "z" || axis == "Z") {
            mesh.vertices.push(-1.0, -1.0, 0.0);
            mesh.vertices.push(1.0, -1.0, 0.0);
            mesh.vertices.push(1.0, 1.0, 0.0);
            mesh.vertices.push(-1.0, 1.0, 0.0);

            mesh.normals.push(0.0, 0.0, 1.0);
            mesh.normals.push(0.0, 0.0, 1.0);
            mesh.normals.push(0.0, 0.0, 1.0);
            mesh.normals.push(0.0, 0.0, 1.0);
        } else if (axis == "x" || axis == "X") {
            mesh.vertices.push(0.0, -1.0, -1.0);
            mesh.vertices.push(0.0, -1.0, 1.0);
            mesh.vertices.push(0.0, 1.0, 1.0);
            mesh.vertices.push(0.0, 1.0, -1.0);

            mesh.normals.push(1.0, 0.0, 0.0);
            mesh.normals.push(1.0, 0.0, 0.0);
            mesh.normals.push(1.0, 0.0, 0.0);
            mesh.normals.push(1.0, 0.0, 0.0);
        } else if (axis == "y" || axis == "Y") {
            mesh.vertices.push(-1.0, 0.0, -1.0);
            mesh.vertices.push(1.0, 0.0, -1.0);
            mesh.vertices.push(1.0, 0.0, 1.0);
            mesh.vertices.push(-1.0, 0.0, 1.0);

            mesh.normals.push(0.0, 1.0, 0.0);
            mesh.normals.push(0.0, 1.0, 0.0);
            mesh.normals.push(0.0, 1.0, 0.0);
            mesh.normals.push(0.0, 1.0, 0.0);
        }

        mesh.faces.push(0, 1, 2);
        mesh.faces.push(0, 2, 3);
        
        mesh.numVertices = 4;
        mesh.numFaces = 2;
        mesh.computeAABB();
        
        mesh.generateNormals();
        mesh.generateBuffers();

        return mesh;
    }

    /**
     * Generates a cube mesh
     * @param {number} size Size of the cube.  Coordinates will range from -number/2 to number/2.
     * @return {Mesh} The cube as a mesh object.
     */
    static fromCube(size) {
        let mesh = new Mesh();
        mesh.vertices.push(-0.5,  0.5, -0.5);
        mesh.vertices.push( 0.5,  0.5, -0.5);
        mesh.vertices.push( 0.5,  0.5,  0.5);
        mesh.vertices.push(-0.5,  0.5,  0.5);
        mesh.vertices.push(-0.5, -0.5, -0.5);
        mesh.vertices.push( 0.5, -0.5, -0.5);
        mesh.vertices.push( 0.5, -0.5,  0.5);
        mesh.vertices.push(-0.5, -0.5,  0.5);

        for (let i = 0; i < mesh.vertices.length; i++) {
            mesh.vertices[i] *= size;
        }
        
        mesh.faces.push(0, 1, 2, 0, 2, 3);
        mesh.faces.push(3, 2, 6, 3, 6, 7);
        mesh.faces.push(5, 4, 6, 4, 7, 6);
        mesh.faces.push(1, 0, 5, 0, 4, 5);
        mesh.faces.push(2, 1, 5, 2, 5, 6);
        mesh.faces.push(0, 3, 7, 0, 7, 4);

        mesh.numVertices = 8;
        mesh.numFaces = 12;
        mesh.computeAABB();

        mesh.generateNormals();
        mesh.generateBuffers();

        return mesh;
    }
    
    /**
     * Send the buffer objects to WebGL for rendering 
     */
    generateBuffers() {
        /* Specify the vertex coordinates */
        this.vertexBuffer = gl.createBuffer();
        this.vertexBuffer.numItems = this.numVertices;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);      
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
        
        /* Specify normals to be able to do lighting calculations */
        this.normalBuffer = gl.createBuffer();
        this.normalBuffer.numItems = this.numVertices;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);
        
        /* Specify faces of the mesh */
        this.indexBuffer = gl.createBuffer();
        this.indexBuffer.numItems = this.numFaces * 3;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.faces), gl.STATIC_DRAW);
    }
            
    /**
     * Return the x,y,z coords of a vertex at location id
     * @param {number} the index of the vertex to return
     * @return {vec3} Vertex returned as a glmatrix vector.
     */    
    getVertex(id) {
        var vid = 3 * id;
        return vec3.fromValues(this.vertices[vid + 0], this.vertices[vid + 1], this.vertices[vid + 2]);
    }

    /**
     * Compute per-vertex normals for a mesh
     */   
    generateNormals() {
        /* Per vertex normals */
        this.numNormals = this.numVertices;
        this.normals = new Array(this.numNormals * 3);
        
        for (let i=0; i < this.normals.length; i++) {
            this.normals[i]=0;
        }
        
        for (let i=0; i < this.numFaces; i++) {
            /* Get vertex coordinates */
            let v1 = this.faces[3 * i],
                v2 = this.faces[3 * i + 1],
                v3 = this.faces[3 * i + 2]; 
            let v1Vec = this.getVertex(v1), v2Vec = this.getVertex(v2), v3Vec = this.getVertex(v3);
            
            /* Create edge vectors */
            let e1=vec3.create();
            let e2=vec3.create();
            vec3.subtract(e1, v2Vec, v1Vec);
            vec3.subtract(e2, v3Vec, v1Vec);
            
            /* Compute normal */
            let n = vec3.fromValues(0, 0, 0);
            vec3.cross(n, e1, e2);
            
            /* Accumulate */
            for (let j = 0; j < 3; j++) {
                this.normals[3 * v1 + j] += n[j];
                this.normals[3 * v2 + j] += n[j];
                this.normals[3 * v3 + j] += n[j];
            }         
        }
        
        for (let i = 0; i < this.numNormals; i++) {
            let n = vec3.fromValues(this.normals[3 * i],
                                    this.normals[3 * i + 1],
                                    this.normals[3 * i + 2]);
            vec3.normalize(n, n);
            this.normals[3 * i] = n[0];
            this.normals[3 * i + 1] = n[1];
            this.normals[3 * i + 2] = n[2];  
        }
    }    
}
