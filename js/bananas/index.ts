import * as BABYLON from 'babylonjs'
import './src/pointIsInside.js'

import { create2DSineWaveOnSphere,  create2DSineWaveOnSphereWithRadialRing,  distanceBetweenPoints,  mapPointToSphere, sphericalToCartesian } from './src/sineWaves';
import { nLEDs, nSensors, sensorLayout } from './src/sensorLayout';
import { blueToRedGradient } from './src/util.js';

const radiusMM = 90; //mm, from average human head diameter of 18cm 

const voxelsizeMM = radiusMM/15; //controls voxel division, too high = takes forever to load, will implement caching.

// Map the points to the surface of a sphere
const sphereCenter = new BABYLON.Vector3(0, 0, 0);


// // Usage example (assuming you have a Babylon.js scene object)
// const gridPoints = createGridPoints(gridSize, gridSpacing);

// const spherePoints = mapPointsToSphere(gridPoints, sphereCenter, radius);



const numPointsPerLine = 50;
const frequency = 1/2;

const numRingPoints = 8;
const angleOffset = Math.PI/12;

 //test line
 ///////////
let s3 = sphericalToCartesian(radiusMM, 1.0, 1.4);
let e3 = sphericalToCartesian(radiusMM, 0, 1);
s3 = new BABYLON.Vector3(s3.x, s3.y, s3.z); 
e3 = new BABYLON.Vector3(e3.x, e3.y, e3.z);

const amplitude3 = e3.subtract(s3).length()/4;

const sineWavePoints3 = create2DSineWaveOnSphereWithRadialRing(
    s3, 
    e3, 
    sphereCenter, 
    amplitude3, 
    frequency, 
    numPointsPerLine, 
    numRingPoints,
    angleOffset
);
///////////////


/** Sensors (x) and LEDS (o)
 *     x      x      
 *  
 *  o     o      o      9x2 sets of LEDs, IR top, Red bottom, 8x2 sets of sensors (16)
 *  o     o      o
 * 
 *     x      x
 */

//intensity is the normalized intensity of that source->sink measurement based on all of our sensor readings' average/baseline strength
const sources = {
    //0:{intensity:1, path:sineWavePoints3},
    // 1:{intensity:1, path:spherePoints},
    // 2:{intensity:1, path:gridPoints}
} as any;


const sensorPoints = [] as any[];
const ledPoints = [] as any[];

let x = 0;

let sourceDistances = {};

let maxDistance = 0;

//map the sensor layout to a sphere to simulate a human head

for (const i of sensorLayout.leds) {
    let veci = new BABYLON.Vector3(i.x - 18.5*8/2, i.y, i.z+95);
    const start = mapPointToSphere(veci, sphereCenter, radiusMM);
    ledPoints.push(veci);
    sourceDistances[x] = {};
    
    let y = 0;
    for(const j of sensorLayout.sensors) {
        let vecj = new BABYLON.Vector3(j.x - 18.5*8/2, j.y, j.z+95);
        const end = mapPointToSphere(vecj, sphereCenter, radiusMM);
        sensorPoints.push(vecj);
        const amp = end.subtract(start).length()/4;
        //const magLine = createDipoleFieldLine(start, end, sphereCenter, amp, numPoints);
        const sineWave = create2DSineWaveOnSphereWithRadialRing(//create2DSineWaveOnSphere(
            start, 
            end, 
            sphereCenter, 
            amp, 
            frequency, 
            numPointsPerLine,
            numRingPoints,
            angleOffset
        );
        
        sourceDistances[x][y] = distanceBetweenPoints(start,end);
        if(maxDistance < sourceDistances[x][y]) maxDistance = sourceDistances[x][y];

        sources[`${x},${y}`] = {
            intensity:1, 
            path: sineWave, 
            isInfrared: x%2===0, 
            source:start, 
            sink:end, 
            distance: 
            sourceDistances[x][y]
        }; //even indices are infrared
    
        y++;
    }
    x++;
}

sources.leds = {intensity:1, path: ledPoints};
sources.sensors = {intensity:1, path: sensorPoints};



let voxels = {
    /**
     *  [voxelId]:{
     *      position:{}
     *      sources:{
     *          [sourceId]: {
     *                 proportion: nPointsInVoxel / numPoints //this will be the proportional value given to this voxel from a reading source/sink trajectory
     *                 intensity: number,
     *                 isInfrared: bool
     *           }
     *      },
     *      intensity:0 //this will accumulate the source reading proportions per frame to visualize a 3D heat map visualization
     *  }
     */
};

const sourceKeys = Object.keys(sources);



//set up babylon
const canvas = document.createElement("canvas"); // Get the canvas element

let node = document.createElement('div');
node.innerHTML = "PAGE LOADING. GENERATING VOXELS & OVERLAPS.";
document.body.appendChild(node);

const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine


const createScene = () => {
    // Creates a basic Babylon Scene object
    const scene = new BABYLON.Scene(engine);
    // Creates and positions a free camera
    const camera = new BABYLON.FreeCamera("camera1", 
        new BABYLON.Vector3(0, 5, -180), 
        scene);
    // Targets the camera to scene origin
    camera.setTarget(BABYLON.Vector3.Zero());
    // Attaches the camera to the canvas
    camera.attachControl(canvas, true);

    camera.speed = 2;
    // Creates a light, aiming 0,1,0
    const light = new BABYLON.HemisphericLight("light", 
        new BABYLON.Vector3(0, 1, 0), 
        scene);
    // Dim the light a small amount 0 - 1
    light.intensity = 0.7;
    // Built-in 'sphere' shape.
    const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", 
        {diameter: radiusMM*2, segments: 32}, 
        scene);

    let mat = new BABYLON.StandardMaterial('matdebug', scene);
    mat.diffuseColor = new BABYLON.Color3(1, 0.1, 1);
    mat.alpha = 0.25;
    sphere.material = mat;

    // Function to voxelize a sphere
    function voxelizeSphere(center, radius, voxelSize) {
        //const sphere = Mesh.CreateSphere("sphere", 16, radius * 2, scene);
        //sphere.isVisible = false;
    
        const numVoxelsPerAxis = Math.floor(radius * 2 / voxelSize);
        const halfSize = voxelSize / 2;
    
        let dvmat = new BABYLON.StandardMaterial('matdebug', scene);
        dvmat.diffuseColor = new BABYLON.Color3(0, 0.1, 1);
        dvmat.alpha = 0.05;

        let searching = {};
        sourceKeys.forEach((source) => {
            searching[source] = [...sources[source].path];
        });
        
        let nnVPA = -numVoxelsPerAxis / 2;
        let nVPA = numVoxelsPerAxis / 2;

        let totalPointsPerLine = sources[Object.keys(sources)[0]].path.length;

        for (let x = nnVPA; x < nVPA; x++) {
            for (let y = nnVPA; y < nVPA; y++) {
                for (let z = nnVPA; z < nVPA; z++) {
                    
                    const position = new BABYLON.Vector3(x * voxelSize + halfSize, y * voxelSize + halfSize, z * voxelSize + halfSize);
                    const distance = BABYLON.Vector3.Distance(position, center);
            
                    if (distance <= radius) {

                        let voxelId = `${x},${y},${z}`;

                        voxels[voxelId] = {
                            position:position,
                            red:1,
                            ir:1,
                            intensity:0,
                            x:x,
                            y:y,
                            z:z,
                            halfSize:halfSize
                        } as any;

                        sourceKeys.forEach((source) => {

                            let foundIdcs = [] as any;

                            searching[source] = searching[source].filter((point,i) => {
                                
                                if(point.x < position.x - halfSize || point.x > position.x + halfSize) {
                                    return true;
                                }
                                else if(point.y < position.y - halfSize || point.y > position.y + halfSize) {
                                    return true;
                                }
                                else if(point.z < position.z - halfSize || point.z > position.z + halfSize) {
                                    return true;
                                }
                                
                                if(!voxels[voxelId].sources) {
                                    voxels[voxelId].sources = {};
                                }
                                foundIdcs.push(i);
                                
                            });


                            if(voxels[voxelId].sources && foundIdcs.length > 0) {
                                const proportion = foundIdcs.length / totalPointsPerLine;
                                //reverse bias the proportion toward the center of the wave (about 90% should come from the primary depth achieved by each source/sink pair (??))
                                const percentTowardMidpoint = 1-Math.abs(1+Math.max(...foundIdcs) - totalPointsPerLine/2)/(totalPointsPerLine/2);

                                function springFactor(x) {
                                    // Use a power function to modify the line
                                    const power = Math.log(0.9) / Math.log(0.8);
                                    return Math.pow(x, power);
                                }

                                const biasedProportion = (1-proportion) * springFactor(percentTowardMidpoint);

                                voxels[voxelId].sources[source] = {proportion:biasedProportion, intensity:1, isInfrared:sources[source].isInfrared}; //proportion of this reading
                                voxels[voxelId].intensity = sources[source].intensity * (voxels[voxelId].intensity ? 
                                voxels[voxelId].intensity + biasedProportion/sourceKeys.length : biasedProportion/sourceKeys.length);
                            }
                        });

                        if(voxels[voxelId].sources) {
                            const voxel = BABYLON.MeshBuilder.CreateBox(voxelId, { size: voxelSize }, scene);
                            voxel.position = position;
                            voxels[voxelId].mesh = voxel;

                            let rgb = blueToRedGradient(voxels[voxelId].intensity * totalPointsPerLine); 
                            let vmat = new BABYLON.StandardMaterial('matdebug', scene);
                            vmat.diffuseColor = new BABYLON.Color3(rgb.r, rgb.g, rgb.b);
                            vmat.alpha = 0.2;
                            voxels[voxelId].mesh.material = vmat;
                        } else {
                            delete voxels[voxelId];
                        }

                    }
                }
            }
        }
    


        //sphere.isVisible = true;
        return voxels;
    }
  
    // Create a voxelized sphere
    const center = new BABYLON.Vector3(0, 0, 0);

    voxelizeSphere(center, radiusMM, voxelsizeMM); // - voxelSize*0.5

    


    // Built-in 'ground' shape.
    // const ground = BABYLON.MeshBuilder.CreateGround("ground", 
    //     {width: 6, height: 6}, 
    //     scene);


    const renderPoints = false;
    
    if(renderPoints) sourceKeys.forEach((source) => {

        let points = sources[source].path;

        var pcs= new BABYLON.PointsCloudSystem("pcs", 4, scene) 

        var pointcloud = function (particle, i, s) {
            particle.position = points[i];
            particle.color = new BABYLON.Color4(1, 1, 0, 1);
        };

        pcs.addPoints(points.length, pointcloud);
        pcs.buildMeshAsync();

    })

    return scene;
};






let flatProjection = true as any;

setTimeout(() => {

    const scene = createScene();

    node.remove();
    
    document.body.appendChild(canvas);
    engine.resize();

    
    let simLoop = () => {

        let readings = simulateReadings();
        mapReadingsToVoxels(readings);

        if(flatProjection) {
            flatProjection = voxelPlane2D(voxels, 'up', scene, typeof flatProjection === 'object' ? flatProjection : undefined, undefined);
        }
        console.log('updated readings')
        setTimeout(simLoop, 200);
    }

    simLoop();

    engine.runRenderLoop(function () {
        scene.render();
    });
    // Watch for browser/canvas resize events
    window.addEventListener("resize", function () {
        engine.resize();
    });

}, 100);

let newReadings = false;









function mapReadingsToVoxels(
    readings:{[key:string]:{[key:string]:number|number[]}}={
    //readings will come in as ADS131 readings + which LED was on, then we'll sort into sensor readings per LED
    0:{
        0:[5678,9012],
        1:[1234,5678]
    },
    1:{
        0:[1234,5678],
        1:[5678,9012]
    }
}) {
    newReadings = false;
    //the leds come in pairs so we need to combine every pair of readings for HBO2 etc with the red and infrared
    //even is IR, odd is red
    for(const x in readings) {
        for(const y in readings[x]) {
            let tag = `${x},${y}`;
            if(Array.isArray(readings[x][y])) {
                sources[tag].intensity = 0;
                (readings[x][y] as number[]).forEach((r) => {
                    sources[tag].intensity += r;
                });
                sources[tag].intensity /= (readings[x][y] as number[]).length;
            } else {
                sources[tag].intensity = readings[x][y];
            }
        }
    }

    let infrared = [] as any[];
    for(const key in voxels) {
        const voxel = voxels[key];
        voxel.red = 0;
        voxel.infrared = 0;
        for(const k in voxel.sources) {
            if(sources[k].isInfrared) {
                voxel.infrared += sources[k].intensity*voxel.sources[k].proportion;
            } else voxel.red += sources[k].intensity*voxel.sources[k].proportion;
        }
        
        voxel.intensity = voxel.red/voxel.infrared;//lets display the intensity as the proportion of red to infrared + 1
        infrared.push(voxel.infrared);
    }

    let magnitude = (arr) => {
        let sum = arr.reduce((ac, pr) => { return ac + pr*pr; });
        return Math.sqrt(sum/arr.length);
    }

    // let normalize = (arr) => {
    //     let mag = magnitude(arr);
    //     return arr.map(v => v/mag);
    // }

    
    let mag = magnitude(infrared);

    for(const key in voxels) {
        const voxel = voxels[key];
        let rgb = blueToRedGradient(voxel.infrared/mag);
        voxel.mesh.material.diffuseColor = new BABYLON.Color3(rgb.r, rgb.g, rgb.b);
    }

}

function simulateReadings() {
    let readings = {};
    for(let i = 0; i < nLEDs; i++) {
        readings[i] = {};
        let rand = Math.random();
        for(let j = 0; j < nSensors; j++) {
            let modmod = 1-Math.random()*0.5;
            let modifier = modmod*rand*(1000 / (sourceDistances[i][j]*sourceDistances[i][j])); //modify the readings relative to source/sink distance to simulate light diffusion
            readings[i][j] = 1000000*modifier;
        }
    }
    newReadings = true;
    return readings;
}









//by gpt4
function voxelPlane2D(
    voxels:any,
    face:'up'|'front'='up', 
    scene:BABYLON.Scene,
    meshInfo?:{mesh?:any, texture?:any},
    slice?:{x?:number,y?:number,z?:number}
) {
    // Create a 2D array to store the 2D representation of the voxels
    const plane = {} as any;

    let minX = Infinity;
    let minY = Infinity;
    let minZ = Infinity;
    let maxX = 0;
    let maxY = 0;
    let maxZ = 0;
    let halfSize;

    // Iterate through the unordered set of voxels and project their positions onto the selected face
    for (const voxelId in voxels) {
        const voxel = voxels[voxelId];
        const position = voxel.position;

        if(!halfSize) halfSize = voxel.halfSize;
        const y = face === 'up' ? position.z : position.y;
        
        if(slice) {
            if('x' in slice && position.x !== slice.x) continue;
            if('y' in slice && position.y !== slice.y) continue;
            if('z' in slice && position.z !== slice.z) continue;
        }

        if(position.x < minX) minX = position.x;
        if(position.y < minY) minY = position.y;
        if(position.z < minZ) minZ = position.z;
        if(position.x > maxX) maxX = position.x;
        if(position.x > maxY) maxY = position.y;
        if(position.z > maxZ) maxZ = position.z;
        // Get the color from the mesh's material
        const color = voxel.mesh.material.diffuseColor;

        if(!plane[position.x]) plane[position.x] = {} as any;

        // Add the color to the corresponding cell in the 2D array
        if (plane[position.x][y]) {
            plane[position.x][y].push(color);
        } else {
            plane[position.x][y] = [color];
        }
    }

    // Calculate the average color for each cell in the 2D array
    const averageColor = (colors) => {
        const sum = colors.reduce((acc, color) => acc.add(color), BABYLON.Color3.Black());
        return sum.scale(1 / colors.length);
    };

    let keys = Object.keys(plane);

    const averagedPlane = keys.map(row => {
        let cells = Object.keys(plane[row]);
        return cells.map(cell => averageColor(plane[row][cell]))
    });
    //console.log(plane, averagedPlane);
    // Create a 2D texture from the averaged colors
   // Create a plane mesh and apply the 2D texture to it

    let width = face === 'up' ? maxX - minX : maxZ - minZ;
    let height = face === 'up' ? maxZ - minZ : maxY-minY;

    if(!meshInfo?.texture) {
        meshInfo = createVoxelPlaneMesh(width, height, halfSize, scene);
        if(face === 'up') meshInfo.mesh.rotation.x = Math.PI/2;
        meshInfo.mesh.rotation.y = Math.PI;
    }

    //console.log(averagedPlane);

    const ctx = meshInfo.texture.getContext();
    for (let x = 0; x < keys.length; x++) {
        let nY = averagedPlane[x].length;
        let yKeys = Object.keys(plane[keys[x]]);
        for (let y = 0; y < nY; y++) {
            const color = averagedPlane[x][y];
            ctx.fillStyle = `rgb(${color.r * 255},${color.g * 255},${color.b * 255})`;
            //console.log((parseInt(keys[x])), parseInt(keys[y]))

            ctx.fillRect(
                (parseInt(keys[x]) - minX), 
                (parseInt(yKeys[y]) - (face === 'up' ? minZ : minY)), 
                2*halfSize, 
                2*halfSize
            );
        }
    }
    meshInfo.texture.update();

    return meshInfo;

}

function createVoxelPlaneMesh(width, height, halfSize, scene) {

    const texture = new BABYLON.DynamicTexture("dynamicTexture", {width:width+2*halfSize, height:height+2*halfSize}, scene, true);

    const planeMesh = BABYLON.MeshBuilder.CreatePlane("plane", {width:width+2*halfSize, height:height+2*halfSize}, scene);
    const planeMaterial = new BABYLON.StandardMaterial("planeMaterial", scene);
 
    planeMaterial.diffuseTexture = texture;
    planeMesh.material = planeMaterial;

    return {mesh:planeMesh, texture:texture};
}
