$('.box-btn').click(function() {
	$(this).toggleClass('active');
});

$('#btn-forkme').click(function() {
	$('#forkme').toggleClass('show');
});

$('#btn-round').click(function() {
	$('#iwrap').toggleClass('round');
});

$('#btn-border').click(function() {
	$('#iwrap').toggleClass('noborder');
});

$('#btn-saymyname').click(function() {
	$('#tail').toggleClass('show');
	$('#tail-arm').toggleClass('show');
	$('#tail-midi').toggleClass('show');
});

$('#btn-kofi').click(function() {
	$('#area-stats').toggleClass('show');
	$('#area-substats').toggleClass('show');
});

