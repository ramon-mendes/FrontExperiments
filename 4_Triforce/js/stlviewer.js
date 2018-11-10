const container = document.querySelector('#view-3d');
const styles = getComputedStyle(container);

function LoadSTL(path) {
	var texture = new THREE.TextureLoader().load('img/texture.jpg');
	texture.repeat.set(0.1, 0.1);
	var material = new THREE.MeshPhongMaterial({
		map: texture
	});

	var loader = new THREE.STLLoader();
	loader.load(path, function(bufferGeometry) {
		geometry = new THREE.Geometry().fromBufferGeometry(bufferGeometry);

		if(false) {
			const RADIUS = 50;
			const SEGMENTS = 16;
			const RINGS = 16;

			// Create a new mesh with
			// sphere geometry - we will cover
			// the sphereMaterial next!
			geometry = new THREE.SphereGeometry(
				RADIUS,
				SEGMENTS,
				RINGS);
		}

		// size
		var boxv3 = new THREE.Vector3();
		geometry.computeBoundingBox();
		geometry.boundingBox.getSize(boxv3);

		// translate z to 0 so it touches the ground
		calcUV(geometry);
		geometry.center();
		//geometry.translate(0, boxv3.y / 2, 0);

		var mesh = new THREE.Mesh(geometry, material);
		var scale = 0.5;
		mesh.scale.set(scale, scale, 0.25);
		scene.add(mesh);
	});

	init();
}

function init() {
	var w = container.clientWidth,
		h = container.clientHeight;

	const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(w, h);
	renderer.gammaInput = true;
	renderer.gammaOutput = true;

	const VIEW_ANGLE = 45;
	const ASPECT = w / h;
	const NEAR = 1;
	const FAR = 2500;

	const camera =
		new THREE.PerspectiveCamera(
			VIEW_ANGLE,
			ASPECT,
			NEAR,
			FAR
		);
	camera.position.z = 390;
	cameraTarget = new THREE.Vector3(0, 0, 0);
	camera.lookAt(cameraTarget);


	scene = new THREE.Scene();

	// Add the camera to the scene.
	scene.add(camera);

	// Attach the renderer-supplied
	// DOM element.
	container.appendChild(renderer.domElement);

	window.addEventListener('resize', function() {
		w = container.clientWidth,
		h = container.clientHeight;

		camera.aspect = w / h;
		camera.updateProjectionMatrix();

		renderer.setSize(w, h);
	}, false);


	var mousePosition = {
		x: 0.5,
		y: 0.5,
	};

	function handleTouchMove(e) {
		var touch = e.touches[0];
		mousePosition.x = touch.pageX / w;
		mousePosition.y = touch.pageY / h;
	}

	function handleMouseMove(e) {
		mousePosition.x = e.pageX / w;
		mousePosition.y = e.pageY / h;
	}

	if('ontouchstart' in window) {
		document.body.addEventListener('touchmove', handleTouchMove);
	} else {
		document.body.addEventListener('mousemove', handleMouseMove);
	}
	
	// create light
	const pointLight = new THREE.PointLight(0xFFFFFF);
	pointLight.position.x = 10;
	pointLight.position.y = 50;
	pointLight.position.z = 130;
	scene.add(pointLight);

	var light2 = new THREE.AmbientLight(0x444444);
	scene.add(light2);

	// axes
	if(false) {
		var axesHelper = new THREE.AxesHelper(99999);
		scene.add(axesHelper);
	}

	effect = new THREE.OutlineEffect(renderer, {
		defaultThickNess: 1260,
		defaultColor: [255, 255, 0],
		defaultAlpha: 0.8,
	});

	function update() {
		if(false)
		{
			// rotate
			var timer = Date.now() * 0.0008;
			camera.position.x = Math.cos(timer) * 200;
			camera.position.z = Math.sin(timer) * 200;
			camera.lookAt(cameraTarget);
		}

		const DIST = 350;
		var camX =
			((mousePosition.x - 0.5) * DIST -
				camera.position.x) *
			0.05;
		var camY =
			((mousePosition.y - 0.5) * DIST -
				camera.position.y) *
			0.05;

		camera.position.x += camX;
		camera.position.y += camY;
		camera.position.z += camY / 2;
		camera.lookAt(cameraTarget);

		effect.render(scene, camera);
		requestAnimationFrame(update);
	}

	requestAnimationFrame(update);
}