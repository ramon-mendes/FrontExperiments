$.get("../assets/svg/icon-sprites.svg", function(data, textStatus, jqXHR) {
	console.log(123, data);
	$(data).appendTo(document.body);
}, "text");