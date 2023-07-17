class VoxelGrid {
    grid:number[];
    sizeX:number; sizeY:number; sizeZ:number;
    numVoxelsX:number; numVoxelsY:number; numVoxelsZ:number;
    numVoxels;
    
    constructor(sizeX, sizeY, sizeZ, numVoxelsX, numVoxelsY, numVoxelsZ) {
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.sizeZ = sizeZ;
        this.numVoxelsX = numVoxelsX;
        this.numVoxelsY = numVoxelsY;
        this.numVoxelsZ = numVoxelsZ;
        this.numVoxels = numVoxelsX * numVoxelsY * numVoxelsZ;
        this.grid = new Array(numVoxelsX * numVoxelsY * numVoxelsZ).fill(0);
    }

    getPos(x,y,z) {
        return {
           x: x * this.sizeX / this.numVoxelsX,
           y: y * this.sizeY / this.numVoxelsY,
           z: z * this.sizeZ / this.numVoxelsZ
        }
    }

    getIndex(x, y, z) {
        return x + y * this.numVoxelsX + z * this.numVoxelsX * this.numVoxelsY;
    }

    getFloatIndex(posX, posY, posZ) {
        // Convert the floating point coordinates to integer indices.
        let ix = Math.floor(posX * this.numVoxelsX / this.sizeX);
        let iy = Math.floor(posY * this.numVoxelsY / this.sizeY);
        let iz = Math.floor(posZ * this.numVoxelsZ / this.sizeZ);
        return ix + iy * this.numVoxelsX + iz * this.numVoxelsX * this.numVoxelsY;
    }

    get(x, y, z) {
        return this.grid[this.getFloatIndex(x, y, z)];
    }

    set(x, y, z, value) {
        this.grid[this.getFloatIndex(x, y, z)] += value;
    }
}

class Point {
    x:number;
    y:number;
    z:number;
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

class LightSource {
    position:Point;
    intensity:number;
    constructor(position, intensity) {
        this.position = position;
        this.intensity = intensity;
    }
}

class GasCloud {
    voxelGrid:VoxelGrid;
    scatteringCoefficient:number;

    constructor(voxelGrid, scatteringCoefficient) {
        this.voxelGrid = voxelGrid;
        this.scatteringCoefficient = scatteringCoefficient;
    }

    scatterLight(lightSource, point) {
        let dx = point.x - lightSource.position.x;
        let dy = point.y - lightSource.position.y;
        let dz = point.z - lightSource.position.z;

        let distanceSquared = dx * dx + dy * dy + dz * dz;
        let intensity = lightSource.intensity / (4 * Math.PI * distanceSquared);

        let scatteringFactor = Math.exp(-this.scatteringCoefficient * Math.sqrt(distanceSquared));
        let scatteredLight = intensity * scatteringFactor;

        // Sum up the scattersed light intensity in the voxel grid.
        let existingLight = this.voxelGrid.get(point.x, point.y, point.z) || 0;
        console.log('existinglight');
        this.voxelGrid.set(point.x, point.y, point.z, existingLight + scatteredLight);
    }

    generateScatteredPoints(lightSource, center, radius, numPoints) {
        let points = [] as any[];

        for (let i = 0; i < numPoints; i++) {
            // Generate a random point in the unit sphere using spherical coordinates.
            let theta = 2 * Math.PI * Math.random();  // azimuthal angle
            let phi = Math.acos(2 * Math.random() - 1);  // polar angle
            let r = Math.cbrt(Math.random());  // radius

            // Convert to Cartesian coordinates.
            let x = r * Math.sin(phi) * Math.cos(theta);
            let y = r * Math.sin(phi) * Math.sin(theta);
            let z = r * Math.cos(phi);

            // Scale and translate the point to the desired sphere.
            x = center.x + radius * x;
            y = center.y + radius * y;
            z = center.z + radius * z;

            // Adjust the radius of the point according to the scattering factor.
            let dx = x - center.x;
            let dy = y - center.y;
            let dz = z - center.z;
            let distanceSquared = dx * dx + dy * dy + dz * dz;
            let scatteringFactor = Math.exp(-this.scatteringCoefficient * Math.sqrt(distanceSquared));

            // If the scattering factor is less than a random number, move the point closer to the center.
            if (Math.random() > scatteringFactor) {
                let scale = Math.random() * scatteringFactor;
                x = center.x + scale * dx;
                y = center.y + scale * dy;
                z = center.z + scale * dz;
            }

            points.push(new Point(x, y, z));
            this.scatterLight(lightSource, new Point(x, y, z));
        }

        return points;
    }

    scatterLightFromPoints(lightSource, points) {
        for (let point of points) {
            this.scatterLight(lightSource, point);
        }
    }
}

function computeScatteringCoefficient(wavelength, refractiveIndex, particleDensity) {
    // Convert the wavelength to meters.
    let wavelengthMeters = wavelength * 1e-9;

    // Compute the scattering coefficient.
    let scatteringCoefficient = (8 * Math.PI**3 * (refractiveIndex**2 - 1)**2) /
        (3 * particleDensity * wavelengthMeters**4);

    return scatteringCoefficient;
}

// Compute the scattering coefficient for blue light in air.
let wavelength1 = 660;  // Wavelength of red light
let wavelength2 = 850;  // Wavelengt of infrared light
// Use these classes as follows:
let voxelGrid = new VoxelGrid(.2, .2, .2, 10, 10, 10); // 10cm x 10cm x 10cm voxel grid

let wavelength = 850;  // Wavelength of near-infrared light in nm
let refractiveIndex = 1.38;  // Approximate refractive index of brain tissue
let particleDensity = 3.34e28;  // Approximate density of brain tissue in m^-3

let scatteringCoefficient = computeScatteringCoefficient(wavelength, refractiveIndex, particleDensity);

// Instantiate a GasCloud with the computed scattering coefficient.
let gasCloud = new GasCloud(voxelGrid, scatteringCoefficient);

// Define a light source.
let lightSource = new LightSource(new Point(0, 0, 0), 1);

// Generate a point 3 cm away from the light source.
let center = new Point(0.03, 0, 0);  // 3 cm away in the x direction
let radius = 0.1;  // A small radius to generate a point near the center
let numPoints = 100;  // Generate scattered points

let points = gasCloud.generateScatteredPoints(lightSource, center, radius, numPoints);
//gasCloud.scatterLightFromPoints(lightSource, points);

// Assuming you have a canvas with id 'renderCanvas' in your HTML
let canvas = document.createElement('canvas') as HTMLCanvasElement;
canvas.width = 500;
canvas.height = 500;
canvas.style.width = '500px';
canvas.style.height = '500px';
document.body.appendChild(canvas);

import * as BABYLON from 'babylonjs'

// Initialize Babylon.js engine and scene
let engine = new BABYLON.Engine(canvas, true);
let scene = new BABYLON.Scene(engine);

// Create a camera and a light
let camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, BABYLON.Vector3.Zero(), scene);
camera.attachControl(canvas, true);
camera.position = new BABYLON.Vector3(lightSource.position.x,lightSource.position.y,lightSource.position.z);

let light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);

// Create a voxel mesh for each voxel in the voxel grid
for (let x = 0; x < gasCloud.voxelGrid.numVoxelsX; x++) {
    for (let y = 0; y < gasCloud.voxelGrid.numVoxelsY; y++) {
        for (let z = 0; z < gasCloud.voxelGrid.numVoxelsZ; z++) {
            let pos = gasCloud.voxelGrid.getPos(x,y,z);
            let intensity = gasCloud.voxelGrid.grid[gasCloud.voxelGrid.getIndex(x,y,z)] / 5;
            if (intensity > 0) {
                let voxelSize = gasCloud.voxelGrid.sizeX * 10;  // Assuming the grid is cubic, multiplied by 100
                
                let voxel = BABYLON.MeshBuilder.CreateBox('voxel', { size: voxelSize }, scene);
                
                // Convert the voxel index to physical coordinates
                let voxelPosition = new BABYLON.Vector3(pos.x*100, pos.y*100, pos.z*100);
                // Center the grid around the origin
                voxelPosition.subtractInPlace(new BABYLON.Vector3(gasCloud.voxelGrid.sizeX / 2 * voxelSize, gasCloud.voxelGrid.sizeY / 2 * voxelSize, gasCloud.voxelGrid.sizeZ / 2 * voxelSize));
                voxel.position = voxelPosition;

                let material = new BABYLON.StandardMaterial('voxelMaterial', scene);
                material.diffuseColor = new BABYLON.Color3(intensity, intensity, intensity);  // Set the color based on the intensity
                material.alpha = 0.25*intensity;  // Set the opacity based on the intensity
                voxel.material = material;
            }
        }
    }
}

let lightSourceCenter = new BABYLON.Vector3(center.x * 100, center.y * 100, center.z * 100);  // Convert light source center from m to cm

// Create a sphere mesh for each scattered point
for (let point of points) {
    let sphere = BABYLON.MeshBuilder.CreateSphere('sphere', { diameter: 1 }, scene);  // Each sphere is 2 cm in diameter
    let scaledPosition = new BABYLON.Vector3(point.x * 100, point.y * 100, point.z * 100);  // Convert from m to cm
    sphere.position = scaledPosition.add(lightSourceCenter);  // Adjust position based on light source and center
}

// Render the scene
engine.runRenderLoop(function () {
    scene.render();
});

window.addEventListener('resize', function () {
    engine.resize();
});