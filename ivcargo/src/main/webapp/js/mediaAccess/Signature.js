function loadDrawCanvas(canvasId) {
	// get the canvas element and its context
	var canvas = document.getElementById(canvasId);
	var context = canvas.getContext('2d');

	if (canvas.width > window.innerWidth) {
		canvas.width = window.innerWidth - 10;
	}

	// create a drawer which tracks touch movements
	var drawer = {
			isDrawing : false,
			touchstart : function(coors) {
				context.beginPath();
				context.moveTo(coors.x, coors.y);
				this.isDrawing = true;
			},
			touchmove : function(coors) {
				if (this.isDrawing) {
					context.lineTo(coors.x, coors.y);
					context.stroke();
				}
			},
			touchend : function(coors) {
				if (this.isDrawing) {
					this.touchmove(coors);
					this.isDrawing = false;
				}
			}
	};
	// create a function to pass touch events and coordinates to drawer
	function draw(event) {
		var type = null;
		// map mouse events to touch events
		switch (event.type) {
		case "mousedown":
			event.touches = [];
			event.touches[0] = {
					pageX : event.pageX,
					pageY : event.pageY
			};
			type = "touchstart";
			break;
		case "mousemove":
			event.touches = [];
			event.touches[0] = {
					pageX : event.pageX,
					pageY : event.pageY
			};
			type = "touchmove";
			break;
		case "mouseup":
			event.touches = [];
			event.touches[0] = {
					pageX : event.pageX,
					pageY : event.pageY
			};
			type = "touchend";
			break;
		case "mouseleave":
			event.touches = [];
			event.touches[0] = {
					pageX : event.pageX,
					pageY : event.pageY
			};
			type = "touchend";
			break;
		}

		// touchend clear the touches[0], so we need to use changedTouches[0]
		var coors;
		if (event.type === "touchend" || event.type === "touchleave") {
			coors = {
					x : event.changedTouches[0].pageX - ($(event.target).offset().left),
					y : event.changedTouches[0].pageY - ($(event.target).offset().top)
			};
		} else {
			// get the touch coordinates
			coors = {
					x : event.touches[0].pageX - ($(event.target).offset().left),
					y : event.touches[0].pageY - ($(event.target).offset().top)
			};
		}
		type = type || event.type
		// pass the coordinates to the appropriate handler
		drawer[type](coors);
	}

	// detect touch capabilities
	var touchAvailable = ('createTouch' in document)
	|| ('ontouchstart' in window);

	// attach the touchstart, touchmove, touchend event listeners.
	if (touchAvailable) {
		canvas.addEventListener('touchstart', draw, false);
		canvas.addEventListener('touchmove', draw, false);
		canvas.addEventListener('touchend', draw, false);
		canvas.addEventListener('touchleave', draw, false);
	}
	// attach the mousedown, mousemove, mouseup event listeners.
	else {
		canvas.addEventListener('mousedown', draw, false);
		canvas.addEventListener('mousemove', draw, false);
		canvas.addEventListener('mouseup', draw, false);
		canvas.addEventListener('mouseleave', draw, false);
	}

	// prevent elastic scrolling
	document.body.addEventListener('touchmove', function(event) {
		event.preventDefault();
	}, false); // end body.onTouchMove
}

function openSignatureModel() {
	
	if(!confirm("Do you want to take Signature ?")) {
		return;
	}
	
	$('#signatureModal').appendTo("body").modal('show');
	$('#signatureModal').on('shown.bs.modal', function () {
		$('#closeSignatureModal').focus();
	});
	$("#closeSignatureModal").one("click",function(){
		openConfirmBoxSignarute();
	})
}

function openConfirmBoxSignarute(){
	$('#confirmModalSignature').modal('show');
	$('#confirmModalSignature').on('shown.bs.modal', function () {
	    $('#yesButtonSignature').focus();
	});
	
	$('#yesButtonSignature').one('click', function () {
		$('.modal').modal('hide');
	})
}