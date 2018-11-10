(function() {
	const canvas = document.getElementById("c2");
	const width = canvas.clientWidth;
	const height = canvas.clientHeight;
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d");

	// -------------------------------------------------------------------------------------
	const ANIM_SPEED = 35;
	const TURN_DURATION = 3000000.0;
	const TURN_TICK_ANGLE = 360.0 / (TURN_DURATION / ANIM_SPEED);
	const PARALLAX = 40;

	var img_rune;
	var rune_halfx;
	var rune_halfy;
	var angle = 0;

	var img;
	var load_image = new Image();
	load_image.src = "rune2.png";
	load_image.onload = function() {
		img = load_image;
	};

	setInterval(function() {
		angle += TURN_TICK_ANGLE;
	}, 1000 / 40);


	function paint() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		const ELLIPSE_SIZE = 1000;
		const ELLIPSE_SIZE_H = ELLIPSE_SIZE / 2;
		var grd = ctx.createRadialGradient(0, 0, 0, 0, 0, ELLIPSE_SIZE_H);
		grd.addColorStop(0, "rgba(25,28,57,0.8)");
		grd.addColorStop(1, "rgba(25,28,57,0.0)");

		const FACTOR = 0.5;
		ctx.save();
		ctx.translate(axisx_fog, axisy_fog);
		ctx.rotate(-angle * 6);
		ctx.scale(1, FACTOR);
		ctx.fillStyle = grd;
		ctx.strokeStyle = 'red';
		ctx.fillRect(-ELLIPSE_SIZE_H, -ELLIPSE_SIZE_H, ELLIPSE_SIZE, ELLIPSE_SIZE);
		//ctx.strokeRect(-ELLIPSE_SIZE_H, -ELLIPSE_SIZE_H, ELLIPSE_SIZE, ELLIPSE_SIZE);
		ctx.restore();

		if(img) {
			ctx.save();
			ctx.translate(axisx_img, axisy_img);
			//ctx.globalAlpha = Math.abs(Math.cos(angle*7));
			ctx.rotate(angle * 1.5);
			ctx.drawImage(img, -img.width / 2, -img.height / 2);
			ctx.restore();
		}

		requestAnimationFrame(paint);
	}
	requestAnimationFrame(paint);
})();