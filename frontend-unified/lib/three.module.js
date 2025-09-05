// Basic Three.js components as ES modules
class WebGLRenderer {
    constructor(options = {}) {
        this.domElement = document.createElement('canvas');
        this.setSize(options.width || 800, options.height || 600);
    }
    setSize(width, height) {
        this.domElement.width = width;
        this.domElement.height = height;
    }
    render(scene, camera) {
        // Basic render implementation
    }
}

class Scene {
    constructor() {
        this.children = [];
    }
    add(object) {
        this.children.push(object);
    }
}

class PerspectiveCamera {
    constructor(fov, aspect, near, far) {
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
        this.position = { x: 0, y: 0, z: 0 };
    }
    updateProjectionMatrix() {}
}

class BoxGeometry {
    constructor(width, height, depth) {
        this.width = width;
        this.height = height;
        this.depth = depth;
    }
}

class MeshBasicMaterial {
    constructor(parameters = {}) {
        this.color = parameters.color;
        this.wireframe = parameters.wireframe || false;
    }
}

class Mesh {
    constructor(geometry, material) {
        this.geometry = geometry;
        this.material = material;
        this.rotation = { x: 0, y: 0, z: 0 };
        this.scale = { x: 1, y: 1, z: 1 };
    }
}

export { WebGLRenderer, Scene, PerspectiveCamera, BoxGeometry, MeshBasicMaterial, Mesh };
