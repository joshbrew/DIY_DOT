
export function sphericalToCartesian(r, theta, phi) {
    return {
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi),
    };
}

export function distanceBetweenPoints(p1, p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2) + Math.pow(p2.z - p1.z, 2));
}

export function create3DSineWave(p1, p2, radius, numPoints) {
    const points = [];
    const distance = distanceBetweenPoints(p1, p2);
    const step = distance / numPoints;

    for (let i = 0; i < numPoints; i++) {
        const t = i / (numPoints-1);
        const theta = t * Math.PI;
        const phi = 2 * Math.PI * Math.sin(theta);
        const r = radius + step * i;

        const point = sphericalToCartesian(r, theta, phi);
        points.push(point);
    }

    return points;
}
//BABYLON.Vector3.Dot(normal,startToCenter)


export function create2DSineWaveOnSphere(start, end, sphereCenter, amplitude, frequency, numPoints) {
    const points = [];
    const dir = end.subtract(start);
    const length = dir.length();
    const normalizedDir = dir.normalize();
    //const startToEnd = end.subtract(start).normalize();
    //const startToCenter = sphereCenter.subtract(start).normalize();
    //const normal = startToEnd.cross(startToCenter).normalize();
  
    for (let i = 0; i < numPoints; i++) {
      const t = i / (numPoints-1);
      const alongPath = start.add(normalizedDir.scale(length * t));
      const towardsCenter = alongPath.subtract(sphereCenter).normalize();
      
      //const percentFromMidpoint = Math.abs(1+i - numPoints/2)/(numPoints/2);
      
      let displacement = amplitude * Math.sin(2 * Math.PI * frequency * t);  //amplitude * (1 - Math.pow(2 * t - 1, 2));// 
      // Adjust displacement for the beginning and end of the sine wave
      //const adjustedDisplacement = displacement * Math.sin(Math.PI * t);
      //const displacementFactor = (1 - Math.cos(Math.PI * t)) / 2;
      const point = alongPath.subtract(towardsCenter.scale(displacement));
      
      points.push(point);
    }
  
    return points;
}



export function create2DSineWaveLine(start, direction, length, amplitude, frequency, rotation, numPoints) {
    const points = [];
    const step = length / numPoints;
  
    // Normalize direction vector
    const dirLength = Math.sqrt(direction.x * direction.x + direction.y * direction.y + direction.z * direction.z);
    const normalizedDirection = {
      x: direction.x / dirLength,
      y: direction.y / dirLength,
      z: direction.z / dirLength,
    };
  
    // Compute orthogonal vectors for sine wave plane
    const rotAxis1 = {
      x: normalizedDirection.y,
      y: -normalizedDirection.x,
      z: 0,
    };
  
    const rotAxis2 = {
      x: -normalizedDirection.z * normalizedDirection.y,
      y: normalizedDirection.z * normalizedDirection.x,
      z: normalizedDirection.x * normalizedDirection.x + normalizedDirection.y * normalizedDirection.y,
    };
  
    // Rotate orthogonal vectors
    const cosRot = Math.cos(rotation);
    const sinRot = Math.sin(rotation);
  
    const rotatedAxis1 = {
      x: cosRot * rotAxis1.x + sinRot * rotAxis2.x,
      y: cosRot * rotAxis1.y + sinRot * rotAxis2.y,
      z: cosRot * rotAxis1.z + sinRot * rotAxis2.z,
    };
  
    for (let i = 0; i < numPoints; i++) {
      const t = i / (numPoints-1);
      const displacement = amplitude * Math.sin(2 * Math.PI * frequency * t);
      
      const point = new BABYLON.Vector3(
         start.x + t * length * normalizedDirection.x + displacement * rotatedAxis1.x,
         start.y + t * length * normalizedDirection.y + displacement * rotatedAxis1.y,
         start.z + t * length * normalizedDirection.z + displacement * rotatedAxis1.z,
      );
  
      points.push(point);
    }
  
    return points;
}

// Create a flat plane of 34 points (in this example, a 6x6 grid with 2 points missing)
// const gridSize = 6;
// const gridSpacing = 0.1;

export function mapPointToSphere(point, sphereCenter, radius) {
    const direction = point.subtract(sphereCenter).normalize();
    return sphereCenter.add(direction.scale(radius));
}

export function mapPointsToSphere(points, sphereCenter, radius){//, scene) {
    const spherePoints = points.map(point => {

    const spherePoint = mapPointToSphere(point, sphereCenter, radius);
      
    //   // Create a sphere mesh for each point on the sphere
    //   const pointMesh = MeshBuilder.CreateSphere(`sphere_point_${point.x}_${point.y}`, { diameter: 0.2 }, scene);
    //   pointMesh.position = spherePoint;
    //   pointMesh.material = new StandardMaterial(`pointMaterial_${point.x}_${point.y}`, scene);
    //   pointMesh.material.diffuseColor = new Color3(0.8, 0.1, 0.1);
  
      return spherePoint;
    });
  
    return spherePoints;
}
  
export function createGridPoints(gridSize, gridSpacing) {
    const points = [];

    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            points.push(new BABYLON.Vector3(x * gridSpacing, y * gridSpacing, -1));
        }
    }

    return points;
}
  