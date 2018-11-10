// get dimensions of window and resize the canvas to fit
var width = window.innerWidth,
	height = window.innerHeight,
	canvas = document.getElementById("c");
canvas.width = width;
canvas.height = height;

// get 2d graphics context and set global alpha
var G = canvas.getContext("2d");

// setup aliases
var Rnd = Math.random,
	Sin = Math.sin,
	Floor = Math.floor;

// constants and storage for objects that represent star positions
var warpZ = 12,
	units = 900,
	stars = [],
	cycle = 0,
	Z = (1/40 * 2);

// function to reset a star object
function resetstar(a) {
	a.x = (Rnd() * width - (width * 0.5)) * warpZ;
	a.y = (Rnd() * height - (height * 0.5)) * warpZ;
	a.z = warpZ;
	a.px = 0;
	a.py = 0;
}

// initial star setup
for(var i = 0, n; i < units; i++) {
	n = {};
	resetstar(n);
	stars.push(n);
}

// star rendering anim function
function paint() {
	// clear background
	G.clearRect(0, 0, width, height);

	var grd = G.createRadialGradient(axisx, axisy, 0, axisx, axisy, 900);
	grd.addColorStop(0.3, "rgb(0,0,0)");
	grd.addColorStop(1, "rgb(28,23,29)");
	G.fillStyle = grd;
	G.globalAlpha = 1;
	G.fillRect(0, 0, width, height);
	G.globalAlpha = 0.25;

	// mouse position to head towards
	var cx = (axisx - width / 2) + (width / 2),
		cy = (axisy - height / 2) + (height / 2);

	// update all stars
	var sat = Floor(Z * 500);       // Z range 0.01 -> 0.5
	if(sat > 100) sat = 100;
	for(var i = 0; i < units; i++) {
		var n = stars[i],            // the star
			xx = n.x / n.z,          // star position
			yy = n.y / n.z,
			e = (1.0 / n.z + 1) * 2;   // size i.e. z

		if(n.px !== 0) {
			// hsl colour from a sine wave
			G.strokeStyle = "hsl(" + ((cycle * i) % 360) + "," + sat + "%,80%)";
			G.lineWidth = e;
			G.beginPath();
			G.moveTo(xx + cx, yy + cy);
			G.lineTo(n.px + cx, n.py + cy);
			G.stroke();
		}

		// update star position values with new settings
		n.px = xx;
		n.py = yy;
		n.z -= Z;

		// reset when star is out of the view field
		if(n.z < Z || n.px > width || n.py > height) {
			// reset star
			resetstar(n);
		}
	}

	// colour cycle sinewave rotation
	cycle += 0.001;
};
var rf = function() {
	paint();
	requestAnimationFrame(rf);
}
requestAnimationFrame(rf);

//for(var j = 0; j < 50; j++)
//	paint(true);