const PARALLAX = 50;

var el_body = $('body');

var width = el_body.width(),
	height = el_body.height();
var middlex = width / 2,
	middley = height / 2;
var axisx = middlex,
	axisy = middley;
var axisx_fog = middlex,
	axisy_fog = middley;
var axisx_img = middlex,
	axisy_img = middley;

el_body.mousemove(function(evt) {
	var distx = evt.clientX - middlex;
	var disty = evt.clientY- middley;
	axisx = middlex + PARALLAX * (distx / middlex);
	axisy = middley + PARALLAX * (disty / middley);
	axisx_fog = middlex + (PARALLAX * 2.0) * (distx / middlex);
	axisy_fog = middley + (PARALLAX * 2.0) * (disty / middley);
	axisx_img = middlex + (PARALLAX * 3.5) * (distx / middlex);
	axisy_img = middley + (PARALLAX * 3.5) * (disty / middley);
});