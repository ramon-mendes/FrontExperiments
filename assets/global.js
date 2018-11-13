$.get("../assets/svg/icon-sprites.svg", function(data, textStatus, jqXHR) {
	$(data).appendTo(document.body);
}, "text");