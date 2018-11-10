const fitCameraToObject = function(camera, object, offset, controls) {
	offset = offset || 2;

	const boundingBox = new THREE.Box3();

	// get bounding box of object - this will be used to setup controls and camera
	boundingBox.setFromObject(object);

	const center = boundingBox.getCenter();
	const size = boundingBox.getSize();

	// get the max side of the bounding box (fits to width OR height as needed )
	const maxDim = Math.max(size.x, size.y, size.z);
	const fov = camera.fov * (Math.PI / 180);
	let cameraZ = Math.abs(maxDim / 2 * Math.tan(fov * 2));
	//let cameraZ = Math.abs(maxDim / 2 * Math.tan(fov * 2)); //Applied fifonik correction
	cameraZ *= offset; // zoom out a little so that objects don't fill the screen

	// <--- NEW CODE
	//Method 1 to get object's world position
	/*scene.updateMatrixWorld(); //Update world positions
	var objectWorldPosition = new THREE.Vector3();
	objectWorldPosition.setFromMatrixPosition(object.matrixWorld);*/

	//Method 2 to get object's world position
	objectWorldPosition = object.getWorldPosition();

	const directionVector = camera.position.sub(objectWorldPosition); 	//Get vector from camera to object
	const unitDirectionVector = directionVector.normalize(); // Convert to unit vector
	const newpos = unitDirectionVector.multiplyScalar(cameraZ);
	camera.position.set(newpos.x, newpos.y, newpos.z); //Multiply unit vector times cameraZ distance
	camera.lookAt(objectWorldPosition); //Look at object
	// --->

	const minZ = boundingBox.min.z;
	const cameraToFarEdge = (minZ < 0) ? -minZ + cameraZ : cameraZ - minZ;

	camera.far = cameraToFarEdge * 3;
	camera.updateProjectionMatrix();

	if(controls) {
		// set camera to rotate around center of loaded object
		controls.target = center;
		// prevent camera from zooming out far enough to create far plane cutoff
		controls.maxDistance = cameraToFarEdge * 2;
		controls.saveState();
	} else {
		camera.lookAt(center)
	}
}

function calcUV(geometry) {
	geometry.computeBoundingBox();

	var max = geometry.boundingBox.max,
		min = geometry.boundingBox.min;
	var offset = new THREE.Vector2(0 - min.x, 0 - min.y);
	var range = new THREE.Vector2(max.x - min.x, max.y - min.y);
	var faces = geometry.faces;

	geometry.faceVertexUvs[0] = [];

	for(var i = 0; i < faces.length; i++) {

		var v1 = geometry.vertices[faces[i].a],
			v2 = geometry.vertices[faces[i].b],
			v3 = geometry.vertices[faces[i].c];

		geometry.faceVertexUvs[0].push([
			new THREE.Vector2((v1.x + offset.x) / range.x, (v1.y + offset.y) / range.y),
			new THREE.Vector2((v2.x + offset.x) / range.x, (v2.y + offset.y) / range.y),
			new THREE.Vector2((v3.x + offset.x) / range.x, (v3.y + offset.y) / range.y)
		]);
	}
	geometry.uvsNeedUpdate = true;
}

function updateUVs(scope) {
	var copy = true;

	scope.computeBoundingBox();

	var max = scope.boundingBox.max;
	var min = scope.boundingBox.min;

	var offset = new THREE.Vector2(0 - min.x, 0 - min.y);
	var range = new THREE.Vector2(max.x - min.x, max.y - min.y);

	if(!copy) {
		scope.faceVertexUvs[0] = [];
	}
	var faces = scope.faces;

	for(i = 0; i < scope.faces.length; i++) {

		var v1 = scope.vertices[faces[i].a];
		var v2 = scope.vertices[faces[i].b];
		var v3 = scope.vertices[faces[i].c];

		var uv0 = new THREE.Vector2((v1.x + offset.x) / range.x, (v1.y + offset.y) / range.y);
		var uv1 = new THREE.Vector2((v2.x + offset.x) / range.x, (v2.y + offset.y) / range.y);
		var uv2 = new THREE.Vector2((v3.x + offset.x) / range.x, (v3.y + offset.y) / range.y);

		if(copy) {
			var uvs = scope.faceVertexUvs[0][i];
			uvs[0].copy(uv0);
			uvs[1].copy(uv1);
			uvs[2].copy(uv2);
		} else {
			scope.faceVertexUvs[0].push([uv0, uv1, uv2]);
		}
	}

	scope.uvsNeedUpdate = true;
}