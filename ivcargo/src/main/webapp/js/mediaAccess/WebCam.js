
$( document ).ready(function() {
	startup();
});

//The width and height of the captured photo. We will set the
//width to the value defined here, but the height will be
//calculated based on the aspect ratio of the input stream.

var picWidth = 320;    // We will scale the photo width to this
var picHeight = 0;     // This will be computed based on the input stream

//The various HTML elements we need to configure or control. These
//will be set by the startup() function.

function startup() {
	var video = document.getElementById('picVideo');
	var canvas = document.getElementById('pictureCanvas');
	var startbutton = document.getElementById('takePicture');

	// |streaming| indicates whether or not we're currently streaming
	// video from the camera. Obviously, we start at false.
	var streaming = false;

	navigator.getMedia = ( navigator.getUserMedia ||
			navigator.webkitGetUserMedia ||
			navigator.mozGetUserMedia ||
			navigator.msGetUserMedia);

	navigator.getMedia(
			{
				video: true,
				audio: false
			},
			function(stream) {
				if (navigator.mozGetUserMedia) {
					video.mozSrcObject = stream;
				} else {
					var vendorURL = window.URL || window.webkitURL;
					video.src = vendorURL.createObjectURL(stream);
				}
				video.play();
			},
			function(err) {
				console.log("An error occured! " + err);
			}
	);

	video.addEventListener('canplay', function(ev){
		if (!streaming) {
			picHeight = video.videoHeight / (video.videoWidth/picWidth);

			// Firefox currently has a bug where the height can't be read from
			// the video, so we will make assumptions if this happens.

			if (isNaN(picHeight)) {
				picHeight = picWidth / (4/3);
			}

			video.setAttribute('width', picWidth);
			video.setAttribute('height', picHeight);
			canvas.setAttribute('width', picWidth);
			canvas.setAttribute('height', picHeight);
			streaming = true;
		}
	}, false);

	startbutton.addEventListener('click', function(ev){
		takepicture('pictureCanvas', 'picVideo');
		ev.preventDefault();
	}, false);

	clearCanvas('pictureCanvas');
}

/*// Fill the photo with an indication that none has been
// captured.

function clearphoto() {
	var context = canvas.getContext('2d');
	context.fillStyle = "#AAA";
	context.fillRect(0, 0, canvas.width, canvas.height);

	var data = canvas.toDataURL('image/png');
	photo.setAttribute('src', data);
}*/

//Capture a photo by fetching the current contents of the video
//and drawing it into a canvas, then converting that to a PNG
//format data URL. By drawing it on an offscreen canvas and then
//drawing that to the screen, we can change its size and/or apply
//other changes before drawing it.

function takepicture(pictureCanvasId, videoId) {
	var canvas = document.getElementById(pictureCanvasId);
	var context = canvas.getContext('2d');
	var video = document.getElementById('picVideo');
	if (picWidth && picHeight) {
		canvas.width = picWidth;
		canvas.height = picHeight;
		context.drawImage(video, 0, 0, picWidth, picHeight);
	} else {
		clearCanvas('pictureCanvas');
	}
}
