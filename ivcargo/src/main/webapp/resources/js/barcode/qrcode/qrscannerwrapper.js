define([,PROJECT_IVUIRESOURCES+'/resources/js/barcode/qrcode/webcodecamjs.js'
        ,PROJECT_IVUIRESOURCES+'/resources/js/barcode/qrcode/qrcodelib.js'],function(WebcamJs,QRCodeLib) {
	return {
		//function returns array oject of tab URLs
		initializeQrCodeScanning:function(inObject){
			var _this = this;
			var grabImg = this.checkEle("#grab-img"),
			txt = "innerText" in HTMLElement.prototype ? "innerText" : "textContent",
					scannedImg = this.checkEle("#scanned-img"),
					scannedQR = this.checkEle("#scanned-QR"),
					scannerLaser = this.checkEle(".scanner-laser");
			var args = {
					autoBrightnessValue: 100,
					contrast: 10,
					resultFunction: function(res) {
						[].forEach.call(scannerLaser, function(el) {
							_this.fadeOut(el, 0.5);
							setTimeout(function() {
								_this.fadeIn(el, 0.5);
							}, 300);
						});
						scannedImg.src = res.imgData;
						scannedQR[txt] = res.format + ": " + res.code;
						inObject.cllbackFun(res);
					},
					getDevicesError: function(error) {
						var p, message = "Error detected with the following parameters:\n";
						console.log(error);
						for (p in error) {
							message += p + ": " + error[p] + "\n";
						}
						console.log(message);
					},
					getUserMediaError: function(error) {
						var p, message = "Error detected with the following parameters:\n";
						console.log(error);
						for (p in error) {
							message += p + ": " + error[p] + "\n";
						}
						console.log(message);
					},
					cameraError: function(error) {
						var p, message = "Error detected with the following parameters:\n";
						console.log(error);
						if (error.name == "NotSupportedError") {
							var ans = confirm("Your browser does not support getUserMedia via HTTP!\n(see: https:goo.gl/Y0ZkNV).\n You want to see github demo page in a new window?");
							if (ans) {
								window.open("https://andrastoth.github.io/webcodecamjs/");
							}
						} else {
							for (p in error) {
								message += p + ": " + error[p] + "\n";
							}
							console.log(message);
						}
					},
					cameraSuccess: function() {
						grabImg.classList.remove("disabled");
					}
			};
			decoder = new WebCodeCamJS("#webcodecam-canvas").buildSelectMenu("#camera-select", "environment|back").init(args);
			return decoder;
		},checkEle:function(el) {
			if (typeof el === "string") {
				var els = document.querySelectorAll(el);
				return typeof els === "undefined" ? undefined : els.length > 1 ? els : els[0];
			}
			return el;
		},fadeOut:function(el, v){
			el.style.opacity = 1;
			(function fade() {
				if ((el.style.opacity -= 0.1) < v) {
					el.style.display = "none";
					el.classList.add("is-hidden");
				} else {
					requestAnimationFrame(fade);
				}
			})();
		},fadeIn:function(el, v, display){
			if (el.classList.contains("is-hidden")) {
				el.classList.remove("is-hidden");
			}
			el.style.opacity = 0;
			el.style.display = display || "block";
			(function fade() {
				var val = parseFloat(el.style.opacity);
				if (!((val += 0.1) > v)) {
					el.style.opacity = val;
					requestAnimationFrame(fade);
				}
			})();
		}
	}
})