// Bananas.js (GPLv3 License)

class Bananas {
    constructor() {
        this.head = [];
        this.bananas = []; 
        this.sources = []; //list of {LEDn, x, y, z} coordinates
        this.detectors = []; // list of {CHn, x, y, z} coordinates
        this.readings = []; // list of channels and their readings
    }


    //create a spherical head of voxels
    computeVoxelHead(radius=9, scalar=1) {
        let sphereRadius = radius;

        let cubePrimitive = {
            position:{x:0,y:0,z:0},
            size:{x:scalar,y:scalar,z:scalar}
        };

        let voxels = [];

        for(let x = 0; x < sphereRadius, x++) {
            for(let y = 0; y < sphereRadius, y++) {
                for(let z = 0; z < sphereRadius, z++) {
                    let voxel = JSON.parse(JSON.stringify(cubePrimitive));
                    voxel.position.x = x*scalar;
                    voxel.position.y = y*scalar;
                    voxel.position.z = z*scalar;

                    voxels.push(voxel);
                }
            }
        }

        return voxels;
    
    }

    //compute the volumes of the light
    computeBananas(sources,detectors) {
        let bananaPrimitive = {
            position:{x:0,y:0,z:0},
        };

        let bananas = [];

        for(let i = 0; i < sources.length; i++) {
            for(let j = 0; j < detectors.length; j++) {
                let banana = JSON.parse(JSON.stringify(bananaPrimitive));
                banana.position.x = (sources[i].x-detectors[j].x);
                banana.position.y = (sources[i].y-detectors[j].y);
                banana.position.z = (sources[i].z-detectors[j].z);

                bananas.push(banana);
            }
        }
    }

    //input source and detector location arrays, returns the elliptical path information for integrating
    computeTrajectory(sources, detectors) { 
        for(let i = 0; i < sources.length; i++) {
            for(let j = 0; j < detectors.length; j++) {
                //trajectory
            }
        }
    }

    //input distance and height of light path (meters)
    computeEllipticalDistance(d=0.06,h=0.04) {
        //half elliptical perimeter
        return 0.5 * Math.pi * (3 * (a+b) * Math.sqrt((3*a+b)*(a+3*b)));
    }

}

