window.onload = function(){
	var chkClosingTags = document.getElementById("closing-tags"),
	    selPixelSize = document.getElementById("pixel-size"),
	    imgSrc = document.getElementById("image-to-placehold"),
	    taMarkup = document.getElementById("email-code"),
	    txtPlaceholderHtml = document.getElementById("placeholder-html");

	function convertImage(){
		if(!imgSrc.value) return;

		document.getElementById("preview").className = "";
		var callback = function(eip){
			var html = eip.getHtml();
			document.getElementById("preview").className = eip.success() ? "success" : "error";
			taMarkup.value = html;
			document.getElementById("content-length").value = html.length;
			document.getElementById("what-it-looks-like-blocked").innerHTML = eip.getHtml(false);
			document.getElementById("what-it-looks-like-enabled").innerHTML = html;
		};

		var eip;
		if(txtPlaceholderHtml.value)
			eip = new EmailImageHtmlPlaceholder(imgSrc.value, txtPlaceholderHtml.value, callback, 1.0)
		else{
			var pixelSize = parseInt(selPixelSize.options[selPixelSize.selectedIndex].value, 10);
			eip = new EmailImagePlaceholder(imgSrc.value, pixelSize, callback, chkClosingTags.checked, 1.0);
		}
		// nothing to do.  the magic is in the callback.
	};

	imgSrc.onblur = imgSrc.onchange = chkClosingTags.onchange = selPixelSize.onchange = txtPlaceholderHtml.onchange = function(){
		convertImage();
	};
	imgSrc.onclick = taMarkup.onclick = txtPlaceholderHtml.onclick = function() {
		this.select();
	};
}
