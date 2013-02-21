window.onload = function(){
	var chkClosingTags = document.getElementById("closing-tags"),
	    selPixelSize = document.getElementById("pixel-size"),
	    imgSrc = document.getElementById("image-to-placehold"),
	    taMarkup = document.getElementById("email-code");

	function convertImage(){
		if(!imgSrc.value) return;

		document.getElementById("what-it-looks-like").className = "";
		var eip = new EmailImagePlaceholder(
			imgSrc.value,
			parseInt(selPixelSize.options[selPixelSize.selectedIndex].value, 10),
			function(){
				var html = eip.getHtml();
				document.getElementById("what-it-looks-like").className = eip.success() ? "success" : "error";
				taMarkup.value = html;
				document.getElementById("content-length").value = html.length;
				document.getElementById("what-it-looks-like-blocked").innerHTML = eip.getHtml(false);
				document.getElementById("what-it-looks-like-enabled").innerHTML = html;
			},
			chkClosingTags.checked,
			1.0);
	};

	imgSrc.onblur = imgSrc.onchange = chkClosingTags.onchange = selPixelSize.onchange = function(){
		convertImage();
	};
	imgSrc.onclick = taMarkup.onclick = function() {
		this.select();
	};
}
