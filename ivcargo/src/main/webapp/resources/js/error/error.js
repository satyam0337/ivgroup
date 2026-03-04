var myMessages = [ 'info', 'warning', 'error', 'success' ]; // define the messages types

function loadError(webserviceConstant) {
	var urlConst = webserviceConstant;
	if(typeof urlConst == "undefined"){
		urlConst = WEB_SERVICE_URL_CONSTANT;
	}
	$( "#errorContent" ).load( urlConst + '/error/error.do',crossDomain= true, function( response, status, xhr ) {
		if ( status == "error" ) {
			console.log( 'errorContent : ' + xhr.status + " " + xhr.statusText );
		} else {
			console.log("Error loaded");
		}
		onclickHideMessage();
	});

}
//When message is clicked, hide it
function onclickHideMessage() {
	$('.message').click(function() {
		animateMessage();
	});
}

function animateMessage() {
	$('.message').animate({
		top : -$(this).outerHeight()
	}, 500);
}

function hideAllMessages() {
	var messagesHeights = new Array(); // this array will store height for each
	
	for (var i = 0; i < myMessages.length; i++) {
		messagesHeights[i] = $('.' + myMessages[i]).outerHeight();
		$('.' + myMessages[i]).css('top', -messagesHeights[i]); //move element outside view port

		$('.' + myMessages[i]).addClass("hideElemnt");
		$('.' + myMessages[i]).removeClass("showElemnt");
	}
}

function showMessage(type, msg) {
	setTimeout(function() {
		hideAllMessages();
	},5000);

	$('.' + type).addClass("showElemnt");
	$('.' + type).removeClass("hideElemnt");
	$('.' + type).html('<h2>'+msg+'<span style="padding-left: 100px;"><span onclick="hideAllMessages()" >[X] Close</span></span></h2>');
	$('.' + type).animate({
		top : "0"
	}, 400);
	
	if(type == "success") {
		setTimeout(function() {
			animateMessage();
		}, 5000)
	}
}

$( document ).ready(function() {
	//loadError();
	// Initially, hide them all
	hideAllMessages();
	// When message is clicked, hide it
	onclickHideMessage();
});

function showLargeMessage(type, msg) {
	setTimeout(function(){
		hideAllMessages();
	},5000);

	$('.' + type).addClass("showElemnt");
	$('.' + type).removeClass("hideElemnt");
	$('.' + type).html('<h4>'+msg+'<span style="padding-left: 100px;"><span onclick="hideAllMessages()" >[X] Close</span></span></h4>');
	$('.' + type).animate({
		top : "0"
	}, 400);
	
	if(type == "success") {
		setTimeout(function() {
			animateMessage();
		}, 5000)
	}
}