const height_ref = document.querySelector('#view-3js');
const container = document.querySelector('#canvas-wrap');
const styles = getComputedStyle(container);
console.assert(height_ref && container && styles);

const BG_COLOR = styles.getPropertyValue('--viewerbg').trim();
const BG_TEXTURE = "/img/grain_stardust.png";
const FOG_COLOR = 0x72645b;
const MAT_COLOR = 0xAA00AA;
const MAT_SPEC = 0x111111;
const MAT_SHINE = 200;
const MATERIAL = new THREE.MeshPhongMaterial({
	color: 0xAAAAAA,
	specular: MAT_SPEC,
	shininess: MAT_SHINE
});

//if(!Detector.webgl)
//	Detector.addGetWebGLMessage();

var camera, scene, renderer, controls;
var geometry;
var loaded = false;

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


function init(path, adjust_y, cbk) {
	if(loaded) {
		controls.autoRotate = true;
		controls.reset();

		while(scene.children.length > 0) {
			scene.remove(scene.children[0]);
		}

		geometry.dispose();
	}

	if(!loaded) {
		camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 1, 15);
		camera.position.set(3, 2, 2);

		scene = new THREE.Scene();
		//scene.background = new THREE.Color(BG_COLOR);
		//scene.fog = new THREE.Fog(FOG_COLOR, 2, 15);

		if(false) {
			var texture = new THREE.TextureLoader().load(BG_TEXTURE);
			texture.wrapS = THREE.RepeatWrapping;
			texture.wrapT = THREE.RepeatWrapping;
			texture.repeat.set(3, 2);
			scene.background = texture;
		}

		// Controls
		controls = new THREE.OrbitControls(camera, container);
		controls.rotateSpeed = 0.6;
		controls.zoomSpeed = 0.6;
		controls.panSpeed = 0.6;
		controls.enableDamping = true;
		controls.dynamicDampingFactor = 0.3;
		controls.keys = [65, 83, 68];
		controls.autoRotate = true;
		controls.autoRotateSpeed = 0.5;
		controls.saveState();

		// renderer
		renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(container.clientWidth, container.clientHeight);

		renderer.gammaInput = true;
		renderer.gammaOutput = true;
		renderer.shadowMap.enabled = true;

		container.appendChild(renderer.domElement);

		window.addEventListener('resize', onWindowResize, false);
		if(false) {
			container.addEventListener('mousedown', function() {
				controls.autoRotate = false;
			}, false);
		}
	}


	// Lights
	scene.add(new THREE.HemisphereLight(0x443333, 0x111122));

	addShadowedLight(1, 1, 1, 0xffffff, 1.35);
	//addShadowedLight(0.5, 1, -1, 0xffffff, 1);


	// Binary files
	var loader = new THREE.STLLoader();
	loader.load(path, function(bufferGeometry) {
		try {
			geometry = new THREE.Geometry().fromBufferGeometry(bufferGeometry);

			// size
			var boxv3 = new THREE.Vector3();
			geometry.computeBoundingBox();
			geometry.boundingBox.getSize(boxv3);

			// Save to STL_INFO
			/*const STL_INFO = {};
			STL_INFO.volume = GeoVolume(geometry);
			STL_INFO.x = boxv3.x;
			STL_INFO.y = boxv3.y;
			STL_INFO.z = boxv3.z;
			console.log('STL_INFO ', STL_INFO);
			OnStlLoaded(STL_INFO);*/


			// translate z to 0 so it touches the ground
			geometry.center();
			geometry.translate(0, 0, boxv3.z / 2);

			var mesh = new THREE.Mesh(geometry, MATERIAL);
			mesh.rotation.set(-Math.PI / 2, 0, 0);
			mesh.castShadow = true;
			//mesh.receiveShadow = true;
			scene.add(mesh);

			var sizer = new THREE.Box3().setFromObject(mesh);

			// wireframe
			if(false) {
				var wireframe = new THREE.WireframeGeometry(geometry);

				var line = new THREE.LineSegments(wireframe);
				line.material.depthTest = false;
				line.material.opacity = 0.25;
				line.material.transparent = true;
				//scene.add(line);
			}

			if(true) {
				// grid and boxhelper
				var gsize = Math.max(boxv3.x, boxv3.y, boxv3.z);
				var grid = new THREE.GridHelper(gsize + gsize * 0.3, 10);//, 0x0000ff, 0x808080
				scene.add(grid);
				scene.add(new THREE.BoxHelper(mesh));
			}

			// axes
			if(false) {
				var axesHelper = new THREE.AxesHelper(99999);
				scene.add(axesHelper);
			}

			fitCameraToObject(camera, mesh);

			// Adjust Y
			controls.target = new THREE.Vector3(0, adjust_y, 0);
			//camera.far = camera.far + 2400;
		} catch(e) {
			console.error(e)
		}

		cbk();
	});
}

function GeoVolume(geometry) {
	function signedVolumeOfTriangle(p1, p2, p3) {
		let v321 = p3.x * p2.y * p1.z;
		let v231 = p2.x * p3.y * p1.z;
		let v312 = p3.x * p1.y * p2.z;
		let v132 = p1.x * p3.y * p2.z;
		let v213 = p2.x * p1.y * p3.z;
		let v123 = p1.x * p2.y * p3.z;
		return (-v321 + v231 + v312 - v132 - v213 + v123) / 6;
	}

	let volumes = 0;
	for(var i = 0; i < geometry.faces.length; i++) {
		let Pi = geometry.faces[i].a;
		let Qi = geometry.faces[i].b;
		let Ri = geometry.faces[i].c;

		let P = new THREE.Vector3(geometry.vertices[Pi].x, geometry.vertices[Pi].y, geometry.vertices[Pi].z);
		let Q = new THREE.Vector3(geometry.vertices[Qi].x, geometry.vertices[Qi].y, geometry.vertices[Qi].z);
		let R = new THREE.Vector3(geometry.vertices[Ri].x, geometry.vertices[Ri].y, geometry.vertices[Ri].z);
		volumes += signedVolumeOfTriangle(P, Q, R);
	}

	return volumes;
}

function addShadowedLight(x, y, z, color, intensity) {

	var directionalLight = new THREE.DirectionalLight(color, intensity);
	directionalLight.position.set(x, y, z);
	scene.add(directionalLight);

	directionalLight.castShadow = true;

	var d = 1;
	directionalLight.shadow.camera.left = -d;
	directionalLight.shadow.camera.right = d;
	directionalLight.shadow.camera.top = d;
	directionalLight.shadow.camera.bottom = -d;

	directionalLight.shadow.camera.near = 1;
	directionalLight.shadow.camera.far = 4;

	directionalLight.shadow.mapSize.width = 1024;
	directionalLight.shadow.mapSize.height = 1024;

	directionalLight.shadow.bias = -0.002;
}

function onWindowResize() {
	camera.aspect = container.offsetWidth / height_ref.offsetHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(container.offsetWidth, height_ref.offsetHeight);
}

function animate() {
	requestAnimationFrame(animate);
	controls.update();
	render();
}

function render() {
	if(DGData) {
		data.x = camera.rotation.x;
		data.y = camera.rotation.y;
		data.z = camera.rotation.z;
	}

	renderer.render(scene, camera);

	//if(stats)
	//	stats.update();
}


function LoadFeatured(path, adjust_y, cbk) {
	init(path, adjust_y, cbk);
	if(!loaded)
		animate();
	loaded = true;
}

function LoadSTL(path, cbk) {
	init(path, 0, cbk);
	if(!loaded)
		animate();
	loaded = true;
}



if(false) {
	var DGData = function() {
		this.x = '1';
		this.y = '2';
		this.z = '3';
		this.color1 = '#FF0000';
	};
	var data = new DGData();

	window.onload = function() {
		var gui = new dat.GUI();
		gui.add(data, 'x').listen();
		gui.add(data, 'y').listen();
		gui.add(data, 'z').listen();
		gui.addColor(data, 'color1');
	};
}