$( document ).ready(function() {
	setLabelOnFocus();
	getSubDomainName();
	$('#loginbtn').on('click',function(){
		if(validateLogin()){
			var $inputs = $('.formset :input');
			var jsonObject = new Object();
			$inputs.each(function (index){if($(this).val() != ""){jsonObject[$(this).attr('name')] = $.trim($(this).val());}});
			console.log(jsonObject);
			$.getJSON(IVMASTER+'executiveWS/validateExecutiveUsingJson.do', {json:JSON.stringify(jsonObject)}, function(data) {
				onSignIn(data);
			});
		}
	})
});

function getSubDomainName(){
	var full = window.location.host
	//window.location.host is subdomain.domain.com
	var parts = full.split('.')
	var sub = parts[0]
	var domain = parts[1]
	var type = parts[2]
	console.log(sub);
	console.log(domain);
	console.log(type);
	setLogoForGroup();
}

function onSignIn(data){
	if(data.message != null && data.message != undefined ){
		showMessage('error',data.message.description);
		clearAllContent();
		$("#usernameEle").focus();
		setLabelOnFocus();
		return false;
	}
	if(typeof(Storage) === "undefined") {
		window.sessionStorage.setItem('currentExecutiveId', data.executiveId);
	} else {
		window.sessionStorage.currentExecutiveId	= data.executiveId;
	}
	window.location = "application.html#home";
}

function clearAllContent(){
	$('.formset :input').each(function() {
		$(this).val('');
	});
}

function validateLogin(){
	var myNod = nod();
	myNod.configure({
		parentClass:'validation-message'
	});
	myNod.add({
		selector: '.form-control-label',
		validate: 'presence',
		errorMessage: 'Can\'t be empty'
	});

	myNod.performCheck();			

	console.log(myNod.areAll('valid'));
	return myNod.areAll('valid');
}

function setLabelOnFocus(){

	$('.form-control-label').focusout(function() {
		$('.form-group-login').removeClass('focus');
	});
	$('.form-control-label').focus(function() {
		$(this).closest('.form-group-login').addClass('focus');
	});

	/// Input Kepress Filled  Focus
	$('.form-control-label').keyup(function() {
		if($(this).val().length > 0){
			$(this).closest('.form-group-login').addClass('filled');
		}else{
			$(this).closest('.form-group-login').removeClass('filled');
		}
	});

	/// Input Check Filled Focus
	var $formControl = $('.form-control-label');
	var values = {};
	var validate =    $formControl.each(function() {
		if($(this).val().length > 0){
			$(this).closest('.form-group-login').addClass('filled');
		}else{
			$(this).closest('.form-group-login').removeClass('filled');
		}
	});
	initialiseFocus();
	document.getElementById('usernameEle').focus();
}