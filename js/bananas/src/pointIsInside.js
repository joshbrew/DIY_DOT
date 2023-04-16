import * as BABYLON from 'babylonjs'

//from babylonjs tutorial docs
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
