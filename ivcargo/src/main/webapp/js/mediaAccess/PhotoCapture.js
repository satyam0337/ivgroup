//The width and height of the captured photo. We will set the
//width to the value defined here, but the height will be
//calculated based on the aspect ratio of the input stream.

var picWidth = 320;    // We will scale the photo width to this
var picHeight = 0;     // This will be computed based on the input stream

//The various HTML elements we need to configure or control. These
//will be set by the startup() function.

var video 				= null;
var streaming 			= false;
var permissionPhotoFlag = false;
var anotherPicture		= false;

function startWebCam(videoId, canvasId, buttonId) {
	video 				= document.getElementById(videoId);
	var canvas 			= document.getElementById(canvasId);
	var startbutton 	= document.getElementById(buttonId);
	mediaDevices1();

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
			video.setAttribute('data-video', "true");
			canvas.setAttribute('width', picWidth);
			canvas.setAttribute('height', picHeight);
			streaming = true;
		}
	}, false);

	startbutton.addEventListener('click', function(ev){
		takepicture(canvasId, videoId);
		ev.preventDefault();
		openConfirmBox();
	}, false);

	//clearCanvas(canvasId);
}

function mediaDevices() {
	try {
		if (navigator.mediaDevices === undefined)
			navigator.mediaDevices = {};
		
		navigator.mediaDevices.getUserMedia({
				video: true,
				audio: false
			},
			successCallback,
			errorCallback
		);
	} catch(err) {
		console.log(err)
	}
}

function mediaDevices1() {
	// |streaming| indicates whether or not we're currently streaming
	// video from the camera. Obviously, we start at false.
	navigator.getMedia = ( navigator.getUserMedia ||
			navigator.webkitGetUserMedia ||
			navigator.mozGetUserMedia ||
			navigator.msGetUserMedia);

	try {
		navigator.getMedia({
				video: true,
				audio: false
			},
			successCallback,
			errorCallback
		);
	} catch(err) {
		console.log(err)
		mediaDevices();
	}
}

function successCallback(stream) {
    // Set the source of the video element with the stream from the camera
    if (video.mozSrcObject !== undefined)
        video.mozSrcObject = stream;
    else if(video.srcObject !== undefined)
    	video.srcObject = stream;
    else
    	video.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
    
    video.play();
    permissionPhotoFlag = true;
}

function errorCallback(error) {
	//alert('Web cam not detected. Please check and Reload the page.');
	showMessage('error', 'Web cam not detected !');
	console.log("An error occured! " + error);
}

function openConfirmBox() {
	$('#confirmModal').modal('show');
	
	$('#confirmModal').on('shown.bs.modal', function () {
		$('#yesButton').focus();
	});
	
	setTimeout(function() { 
		$('#yesButton').focus();
	}, 200);
	
	$('#yesButton').one('click', function () {
		$('#photoModal').modal('hide');
		switchHtmlTagClass('photoCaptureSuccess', 'show', 'hide');
		
		next	= 'deliver';
		
		if (!isCanvasBlank('pictureCanvas'))
			imageArr.push(getCanvasImage('pictureCanvas'));
			
		$('#photoCount').html(imageCount);
			
		setTimeout(() => {
			if(imageCount < configuration.photoAllowCount && configuration.multiplePhotoAllow == 'true') {
				if(confirm("Do you want to take Another picture ?")) {
					anotherPicture	= true;
					
					setTimeout(() => {
						openPhotoModel();
					}, 100);
				} else {
					anotherPicture	= false;
					next	= 'save';
				}
			} else
				next	= 'save';
		}, 100);
	})
}

function openPhotoModel() {
	if(configuration.multiplePhotoAllow == 'true' && imageCount >= configuration.photoAllowCount)
		return;
	
	if (!permissionPhotoFlag)
		mediaDevices1();
	
	if (permissionPhotoFlag) {
		imageCount++;
		
		if(configuration.PhotoServiceValidate == 'true' || anotherPicture || confirm("Do you want to take Picture ?"))
			$('#takePicture').focus();
		else
			return;
			
		 if (isPhotoAvailable() && configuration.multiplePhotoAllow == 'false') {
			switchHtmlTagClass('pictureCanvasDiv', 'show', 'hide');
			switchHtmlTagClass('clickedphoto', 'show', 'hide');
		} else {
			switchHtmlTagClass('pictureCanvasDiv', 'hide', 'show');
			switchHtmlTagClass('clickedphoto', 'hide', 'show');
		}	
	
		anotherPicture	= false;
		
		setTimeout(function() {
			$('#photoModal').on('shown.bs.modal', function () {
				$('#takePicture').focus();
			});
			
			$('#photoModal').modal('show');
		}, 200);
	}
}

//To stop web cam streaming
function stopWebCam() {
	if (navigator.mozGetUserMedia) {
		if (video != null) {
			video.pause();
			video.mozSrcObject=null;
		}
	} else if (video != null) {
		video.pause();
		video.src="";
	}
}

//Capture a photo by fetching the current contents of the video
//and drawing it into a canvas, then converting that to a PNG
//format data URL. By drawing it on an offscreen canvas and then
//drawing that to the screen, we can change its size and/or apply
//other changes before drawing it.

function takepicture(pictureCanvasId, videoId) {
	var canvas 	= document.getElementById(pictureCanvasId);
	var context = canvas.getContext('2d');
	var video 	= document.getElementById(videoId);
	
	$('#cacelButton').click(function() {
		clearCanvas(pictureCanvasId);
		$('.modal').modal('hide');
		switchHtmlTagClass('photoCaptureSuccess', 'hide', 'show');
		$('.modal-backdrop').css('display','none');
		return false;
	})
	
	if (picWidth && picHeight) {
		canvas.width 	= picWidth;
		canvas.height 	= picHeight;
		context.drawImage(video, 0, 0, picWidth, picHeight);
		
		switchHtmlTagClass('pictureCanvasDiv', 'show', 'hide');
		switchHtmlTagClass('clickedphoto', 'show', 'hide');
	} else {
		clearCanvas(pictureCanvasId);
		
		switchHtmlTagClass('pictureCanvasDiv', 'hide', 'show');
		switchHtmlTagClass('clickedphoto', 'hide', 'show');
	}
}


function isPhotoAvailable() {
	var canvas = document.getElementById('pictureCanvas');
	var context = canvas.getContext('2d');
	var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
	var data = imageData.data;
	
	for (var i = 0; i < data.length; i += 4) {
		if (data[i + 3] !== 0)
			return true;
	}
	
	return false;
}