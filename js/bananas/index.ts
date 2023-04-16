import * as BABYLON from 'babylonjs'
import { create2DSineWaveOnSphere,  distanceBetweenPoints,  mapPointToSphere, sphericalToCartesian } from './src/sineWaves';


BABYLON.Mesh.prototype.pointIsInside = function (point) {    
	var boundInfo = this.getBoundingInfo();
	var max = boundInfo.maximum;
	var min = boundInfo.minimum;
	//var diameter = 2 * boundInfo.boundingSphere.radius;

	if(point.x < min.x+this.position.x || point.x > max.x+this.position.x) {
		return false;
	}
	if(point.y < min.y+this.position.y || point.y > max.y+this.position.y) {
		return false;
	}
	if(point.z < min.z+this.position.z || point.z > max.z+this.position.z) {
		return false;
	}

    return true;

	// var pointFound = false;
	// var d = 0;
	// var hitCount = 0;
	// var gap = 0;
	// var distance = 0;
	// var ray = new BABYLON.Ray(BABYLON.Vector3.Zero(), BABYLON.Axis.X, diameter);;
	// var pickInfo;
	// var direction = point.clone();
    // var refPoint = point.clone();

	
	// hitCount = 0;
	// ray.origin = refPoint;
    // ray.direction = direction;
    // ray.distance = diameter;		
	// pickInfo = ray.intersectsMesh(this);
	// while (pickInfo.hit) {	
	// 	hitCount++;
	// 	pickInfo.pickedPoint.addToRef(direction.scale(0.00000001), refPoint);
	// 	ray.origin  = refPoint;
	// 	pickInfo = ray.intersectsMesh(this);
	// }	
	// if((hitCount % 2) === 1) {
	// 	pointFound = true;
	// }
	// return pointFound;
};


const radius = 90; //mm, from average human head diameter of 18cm 
const voxelsize = radius/15;

// Map the points to the surface of a sphere
const sphereCenter = new BABYLON.Vector3(0, 0, 0);

// // Usage example (assuming you have a Babylon.js scene object)
// const gridPoints = createGridPoints(gridSize, gridSpacing);

// const spherePoints = mapPointsToSphere(gridPoints, sphereCenter, radius);



const numPoints = 100;
const frequency = 1/2;

 
let s3 = sphericalToCartesian(radius, 1.0, 1.4);
let e3 = sphericalToCartesian(radius, 0, 1);
s3 = new BABYLON.Vector3(s3.x, s3.y, s3.z); 
e3 = new BABYLON.Vector3(e3.x, e3.y, e3.z);

const amplitude3 = e3.subtract(s3).length()/4;

const sineWavePoints3 = create2DSineWaveOnSphere(
    s3, 
    e3, 
    sphereCenter, 
    amplitude3, 
    frequency, 
    numPoints
);


/** Sensors (x) and LEDS (o)
 *     x      x
 *  
 *  o     o      o
 *  o     o      o
 * 
 *     x      x
 */

//intensity is the normalized intensity of that source->sink measurement based on all of our sensor readings' average/baseline strength
const sources = {
    0:{intensity:1, path:sineWavePoints3},
    // 1:{intensity:1, path:spherePoints},
    // 2:{intensity:1, path:gridPoints}
} as any;


const sensorLayout = {
    leds:[
        {x:0,           y:1.1,        z:0}, //led 0
        {x:0,           y:-1.1,       z:0},
        {x:18.5,        y:1.1,        z:0},
        {x:18.5,        y:-1.1,       z:0},
        {x:2*18.5,      y:1.1,        z:0},
        {x:2*18.5,      y:-1.1,       z:0},
        {x:3*18.5,      y:1.1,        z:0},
        {x:3*18.5,      y:-1.1,       z:0},
        {x:4*18.5,      y:1.1,        z:0},
        {x:4*18.5,      y:-1.1,       z:0},
        {x:5*18.5,     y:1.1,        z:0},
        {x:5*18.5,     y:-1.1,       z:0},
        {x:6*18.5,     y:1.1,        z:0},
        {x:6*18.5,     y:-1.1,       z:0},
        {x:7*18.5,     y:1.1,        z:0},
        {x:7*18.5,     y:-1.1,       z:0},
        {x:8*18.5,     y:1.1,        z:0},
        {x:8*18.5,     y:-1.1,       z:0} //led 17
    ],
    sensors:[
        {x:9.25,         y:12.1,     z:0}, //sensor 0
        {x:9.25,         y:-12.1,    z:0},
        {x:9.25+18.5,    y:12.1,     z:0},
        {x:9.25+18.5,    y:-12.1,    z:0},
        {x:9.25+2*18.5,  y:12.1,     z:0},
        {x:9.25+2*18.5,  y:-12.1,    z:0},
        {x:9.25+3*18.5,  y:12.1,     z:0},
        {x:9.25+3*18.5,  y:-12.1,    z:0},
        {x:9.25+4*18.5,  y:12.1,     z:0},
        {x:9.25+4*18.5,  y:-12.1,    z:0},
        {x:9.25+5*18.5, y:12.1,     z:0},
        {x:9.25+5*18.5, y:-12.1,    z:0},
        {x:9.25+6*18.5, y:12.1,     z:0},
        {x:9.25+6*18.5, y:-12.1,    z:0},
        {x:9.25+7*18.5, y:12.1,     z:0},
        {x:9.25+7*18.5, y:-12.1,    z:0}  //sensor 15
    ]
};

const nSensors = 16;
const nLEDs = 18;

const sensorPoints = [] as any[];
const ledPoints = [] as any[];

let x = 0;

let sourceDistances = {};

let maxDistance = 0;

for (const i of sensorLayout.leds) {
    let veci = new BABYLON.Vector3(i.x - 18.5*8/2, i.y, i.z+95);
    const start = mapPointToSphere(veci, sphereCenter, radius);
    ledPoints.push(veci);
    sourceDistances[x] = {};
    
    let y = 0;
    for(const j of sensorLayout.sensors) {
        let vecj = new BABYLON.Vector3(j.x - 18.5*8/2, j.y, j.z+95);
        const end = mapPointToSphere(vecj, sphereCenter, radius);
        sensorPoints.push(vecj);
        const amp = end.subtract(start).length()/4;
        //const magLine = createDipoleFieldLine(start, end, sphereCenter, amp, numPoints);
        const sineWave = create2DSineWaveOnSphere(
            start, 
            end, 
            sphereCenter, 
            amp, 
            frequency, 
            numPoints
        );
        
        sourceDistances[x][y] = distanceBetweenPoints(start,end);
        if(maxDistance < sourceDistances[x][y]) maxDistance = sourceDistances[x][y];

        sources[`${x},${y}`] = {intensity:1, path: sineWave, isInfrared: x%2===0, source:start, sink:end, distance: sourceDistances[x][y]}; //even indices are infrared
    
        y++;
    }
    x++;
}

sources.leds = {intensity:1, path: ledPoints};
sources.sensors = {intensity:1, path: sensorPoints};


const canvas = document.createElement("canvas"); // Get the canvas element

let node = document.createElement('div');
node.innerHTML = "PAGE LOADING. GENERATING VOXELS & OVERLAPS.";
document.body.appendChild(node);

const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine



let voxels = {
    /**
     *  [voxelId]:{
     *      position:{}
     *      sources:{
     *          [sourceId]: nPointsInVoxel / numPoints //this will be the proportional value given to this voxel from a reading source/sink trajectory
     *      },
     *      intensity:0 //this will accumulate the source reading proportions per frame to visualize a 3D heat map visualization
     *  }
     */
};

const sourceKeys = Object.keys(sources);

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
        {diameter: radius*2, segments: 32}, 
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
        })
        
        for (let x = -numVoxelsPerAxis / 2; x < numVoxelsPerAxis / 2; x++) {
            for (let y = -numVoxelsPerAxis / 2; y < numVoxelsPerAxis / 2; y++) {
                for (let z = -numVoxelsPerAxis / 2; z < numVoxelsPerAxis / 2; z++) {
                    
                    const position = new BABYLON.Vector3(x * voxelSize + halfSize, y * voxelSize + halfSize, z * voxelSize + halfSize);
                    const distance = BABYLON.Vector3.Distance(position, center);
            
                    if (distance <= radius) {

                        let voxelId = `${x},${y},${z}`;

                        voxels[voxelId] = {
                            position:position,
                            red:1,
                            ir:1,
                            intensity:0
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


                            if(voxels[voxelId].sources) {
                                const proportion = foundIdcs.length / numPoints;
                                voxels[voxelId].sources[source] = {proportion:proportion, intensity:1, isInfrared:sources[source].isInfrared}; //proportion of this reading
                                voxels[voxelId].intensity = sources[source].intensity * (voxels[voxelId].intensity ? 
                                voxels[voxelId].intensity + proportion/sourceKeys.length : proportion/sourceKeys.length);
                            }
                        });

                        if(voxels[voxelId].sources) {
                            const voxel = BABYLON.MeshBuilder.CreateBox(voxelId, { size: voxelSize }, scene);
                            voxel.position = position;
                            voxels[voxelId].mesh = voxel;

                            let rgb = blueToRedGradient(voxels[voxelId].intensity * numPoints); 
                            let vmat = new BABYLON.StandardMaterial('matdebug', scene);
                            vmat.diffuseColor = new BABYLON.Color3(rgb.r, rgb.g, rgb.b);
                            vmat.alpha = 0.3;
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

    voxelizeSphere(center, radius, voxelsize); // - voxelSize*0.5
  
    // Built-in 'ground' shape.
    // const ground = BABYLON.MeshBuilder.CreateGround("ground", 
    //     {width: 6, height: 6}, 
    //     scene);

    sourceKeys.forEach((source) => {

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

setTimeout(() => {

    const scene = createScene();

    node.remove();
    
    document.body.appendChild(canvas);
    engine.resize();

    
    let simLoop = () => {

        let readings = simulateReadings();
        mapReadingsToVoxels(readings);

        console.log('updated readings')
        setTimeout(simLoop, 100);
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


function mapReadingsToVoxels(readings:{[key:string]:{[key:string]:number|number[]}}={
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

    let normalize = (arr) => {

        let mag = magnitude(arr);
        return arr.map(v => v/mag);

    }

    
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




function hslToRgb(h, s, l) {
    function hueToRgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }
  
    if (s === 0) {
      return [l, l, l]; // achromatic
    }
  
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const r = hueToRgb(p, q, h + 1 / 3);
    const g = hueToRgb(p, q, h);
    const b = hueToRgb(p, q, h - 1 / 3);
  
    return [r, g, b];
  }
  
  function blueToRedGradient(value) {
    if(value > 1) value = 1;
    else if (value < 0) value = 0;
    const h = (1  - value) * (240 / 360); // hue value for blue-to-red gradient
    const s = 1;
    const l = 0.5;
    const [r, g, b] = hslToRgb(h, s, l);
  
    return {
      r,
      g,
      b,
    };
  }


export function pointIsInside(v: any) {
    throw new Error('Function not implemented.');
}

