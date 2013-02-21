(function() {
	RGBA = function(r, g, b, a){
		this.r = arguments.length >= 1 ? r : 255;
		this.g = arguments.length >= 2 ? g : 255;
		this.b = arguments.length >= 3 ? b : 255;
		this.a = arguments.length >= 4 ? a : 255;
	};

	RGBA.prototype.toHex = function(){
		var sR = this.r.toString(16),
		    sG = this.g.toString(16),
		    sB = this.b.toString(16);

		return (this.r < 0x10 ? '0' + sR : sR)
			   + (this.g < 0x10 ? '0' + sG : sG)
			   + (this.b < 0x10 ? '0' + sB : sB);
	};


	/* helper methods */
	var _getPixel = function(emailImage, x, y){
		if(!emailImage.colors) emailImage.getRgbArray(emailImage);

		return emailImage.colors[x][y];
	};

	var _emailImageMagic = function(url, width, height, placeholderHtml){
		return "<div style=\"width:0px;height:0px;overflow:visible;float:left;position:absolute;\"><table cellpadding=\"0\" cellspacing=\"0\"><tbody><tr><td background=\"" + url + "\"><div style=\"width:" + width + "px;height:" + height + "px\"></div></td></tr></tbody></table></div>" + placeholderHtml;
	}



	EmailImagePlaceholder = function(url, pixelSize, onImageLoad, closingTags, scale) {
		this.url = url;
		this.pixelSize = arguments.length >= 2 ? pixelSize : 10;
		this.emailImage = arguments.length >= 2 ? new EmailImage(this.url, this.pixelSize, onImageLoad) : null;
		this.closingTags = arguments.length >= 4 ? closingTags : true;
		this.scale = scale || 1.0;
		this.error = undefined;
	};

	EmailImagePlaceholder.prototype.success = function() {
		// this code should probably set errors so that this method doesn't always return true
		return !this.error;
	};

	EmailImagePlaceholder.prototype.error = function(msg){
		this.error = msg;
		return null;
	}

	EmailImagePlaceholder.prototype.getEmailImage = function(){
		return this.emailImage;
	}

	EmailImagePlaceholder.prototype.getHtml = function(useEmailWrapper) {
		useEmailWrapper = arguments.length >= 1 ? useEmailWrapper : true;

		if(!this.emailImage) return this.error("EmailImage has not been initialized");

		var dimensions = this.emailImage.getOriginalImageSize(),
		    pixelDimensions = this.emailImage.getImageSize();

		if(!dimensions || !pixelDimensions) return this.error("Could not get image dimensions");

		var html = "<table width=" + Math.round(this.scale * dimensions.w) + " height=" + Math.round(this.scale * dimensions.h) + " cellpadding=0 cellspacing=0>";

		var color = {};
		for(var r = 0; r < pixelDimensions.h; r++){
			html += "<tr>";
			for(var c = 0; c < pixelDimensions.w; c++){
				color = _getPixel(this.emailImage, r, c);
				if(color.a == 0)
					html += this.closingTags ? "<td><b></b></td>" : "<td/><b/>";
				else
					html += "<td bgcolor=\"#" + color.toHex() + "\"" +
						(this.closingTags ? "><b></b></td>" : "/><b/>");
			}
			if(this.closingTags) html += "</tr>";
		}

		html += "</table>";
		return useEmailWrapper ? _emailImageMagic(this.url, dimensions.w, dimensions.h, html) : html;
	};

	EmailImagePlaceholder.prototype.getBase64 = function(useEmailWrapper) {
		useEmailWrapper = arguments.length >= 1 ? useEmailWrapper : true;

		var dimensions = this.emailImage.getOriginalImageSize();

		var html = "<img src=\"" + this.emailImage.getCanvas().toDataURL("image/png") + "\" height=" + Math.round(this.scale * dimensions.h) + " />";
		return useEmailWrapper ? _emailImageMagic(this.url, dimensions.w, dimensions.h, html) : html;
	}

	/*
	 * A Class for the to wrap image,
	 * used for counting raw color pixels
	 */
	EmailImage = function(url, pixelSize, callback) {
		this.url = url;
		this.pixelSize = pixelSize || 10;
		this.canvas = undefined;
		this.colors = undefined;
		this.image = undefined;

		var _this = this;
		this.fetch(function(){
			_this.getRgbArray();

			if(callback){
				callback(this);
			}
		});
	};

	EmailImage.prototype.fetch = function(callback) {
		var that = this;

		this.image = new Image();

		this.image.onload = function() {
			if (callback) {
				callback(this);
			}
		};

		this.image.crossOrigin = 'anonymous';
		this.image.src = "http://www.corsproxy.com/" + this.url.replace(/^https?:\/\//i, "");
	};

	EmailImage.prototype.getImageSize = function(){
		if(!this.image) return null;

		return {
			w : Math.ceil(this.image.width / this.pixelSize),
			h : Math.ceil(this.image.height / this.pixelSize)
		};
	};

	EmailImage.prototype.getOriginalImageSize = function(){
		if(!this.image) return null;

		return {
			w : this.image.width,
			h : this.image.height
		};
	};

	EmailImage.prototype.getCanvas = function() {
		if (this.canvas) {
			return this.canvas;
		}

		var tempCanvas = document.createElement("canvas"),
		    tempContext = tempCanvas.getContext("2d"),
		    canvas = document.createElement("canvas"),
		    context = canvas.getContext("2d");

		var origDimensions = this.getOriginalImageSize(),
		    newDimensions = this.getImageSize();

		tempContext.drawImage(this.image, 0, 0, newDimensions.w, newDimensions.h);
		context.drawImage(tempCanvas, 0, 0);

		return (this.canvas = canvas);
	};

	EmailImage.prototype.getPixels = function() {
		var dimensions = this.getImageSize();
		return this.getCanvas().getContext("2d").getImageData(0, 0, dimensions.w, dimensions.h).data;
	};

	EmailImage.prototype.getRgbArray = function() {
		if (this.colors) {
			return this.colors;
		}

		var p, colors = [],
			pixels = this.getPixels(),
			dimensions = this.getImageSize(),
			i = 0;

		for (p = 0; p < pixels.length; p += 4) {
			if(!colors[Math.floor(i / dimensions.w)]) colors[Math.floor(i / dimensions.w)] = [];

			colors[Math.floor(i / dimensions.w)][i % dimensions.w]
				= new RGBA(pixels[p], pixels[p + 1], pixels[p + 2], pixels[p + 3]);

			i++;
		}

		return (this.colors = colors);
	};
}());
