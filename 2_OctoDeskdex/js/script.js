tippy(document.querySelectorAll('.tooltiped'), {
	hideOnClick: false
});

/*$('#about').click(function() {
	$(this).remove();
	$('body').addClass('show-about');
});*/

setTimeout(function() {
	$('body').addClass('show-about');
}, 300);

function preload() {
	for (i = 0; i < preload.arguments.length; i++) {
		var img = new Image()
		img.src = preload.arguments[i]
	}
}
preload(
	"https://octodeskdex.azurewebsites.net/img/btn_close_h.png",
	"https://octodeskdex.azurewebsites.net/img/btn_open_h.png",
)

$('#f-open-dex').click(function() {
	$('#f-loader').addClass('show');
	$('#front').addClass('intrans-hide1');

	LoadList(function() {
		setTimeout(function() {
			$('#front').addClass('intrans-show2');
			$('#f-loader').removeClass('show');

			setTimeout(function() {
				$('#front').addClass('intrans-hide2');

				setTimeout(function() {
					$('body').addClass('show-inner');
				}, 1200);
			}, 1200);
		}, 1200);
	});
});

$('#btn-close-dex').click(function() {
	$('body').removeClass('show-inner');

	setTimeout(function() {
		$('#front').removeClass('intrans-hide2');
		$('#front').removeClass('intrans-show2');

		setTimeout(function() {
			$('#front').removeClass('intrans-hide1');
		}, 1000);
	}, 1500);
});

function LoadList(cbk_done) {
	$.getJSON("https://octodexlist.azurewebsites.net/api/Function1?code=dgSQZI4JPKMQ1t6BetMq1jl99qaITkiwFvuPh7Vnw7mrQouWo2IQbA==")
		.done(function(data) {
			FillList(data);
			cbk_done();
		})
		.fail(function(data) {
			console.log(data);
			console.log("Failed to load JSON data. Check your internet connection!");
		});
}

function FillList(data) {
	var el_sel = $('#select');
	data.forEach(function(item, index) {
		var el = $(`<div class="option" value="${index}">${item.number} - ${item.name}</div>`).prependTo(el_sel);
		el.data('item', item);
	});

	var rnd = Math.floor(Math.random() * data.length);
	var opt = $('.option')[rnd];
	opt.click();
	opt.scrollIntoView();
}

var g_imgurl;

$('#select').on('click', '.option', function() {
	$('#select .active').removeClass('active');
	$(this).addClass('active');
	$('#descwrap').removeClass('show');
	$('#iwrap div').addClass('loading');
	$('#iloader').addClass('loading');

	// LoadImage
	var item = $(this).data('item');
	var prom1 = new Promise(function(resolve, reject) {
		var img = new Image;
		img.onload = function() {
			resolve()
		};
		g_imgurl = img.src = "https://octodex.github.com" + item.image;
	});

	var prom2 = new Promise(function(resolve, reject) {
		setTimeout(function() {
			resolve();
		}, 1500)
	});

	Promise.all([prom1, prom2])
		.then(function(values) {
			$('#iloader').removeClass('loading');
			$('#iwrap div').removeClass('loading');
			ChangeImage(item);
		});
});

function ChangeImage(item) {
	$('#iwrap div').css('background-image', 'url(' + g_imgurl + ')');

	// update author
	$('#name span').text(item.name);
	$('#avatar').attr('src', item.authorAvatar);
	$('#descwrap').addClass('show');
}