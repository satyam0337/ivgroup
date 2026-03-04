$( document ).ready(function() {
	setLabelOnFocus();
	getSubDomainName();
	loadError(CUSTOMER_ACCESS_URL_CONSTANT);
	$('#loginbtn').on('click',function(){
		if(validateLogin()){
			let $inputs = $('.formset :input');
			let jsonObject = new Object();
			$inputs.each(function (index){if($(this).val() != ""){jsonObject[$(this).attr('name')] = $.trim($(this).val());}});
			
			if(jsonObject['AccountGroupId'] == 0)
				jsonObject['AccountGroupId']	= localStorage.getItem("currentCorporateAccountGroupId");
			
			console.log(jsonObject);
			$.ajax({
				url: CUSTOMER_ACCESS_URL_CONSTANT + '/customerAccessWS/validateCustomerUsingJson.do',
				type: 'POST',
				contentType: 'application/x-www-form-urlencoded',
				data: {
					json: JSON.stringify(jsonObject)
				},
				success: function(data) {
					onSignIn(data);
				}
			});

		}
	})
});

function getSubDomainName(){
	$.urlParam = function(name){
	    let results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
	   
		if (results == null)
	       return null;

		return results[1] || 0;
	}
	
	setLogoForGroup($.urlParam('accountgroupId'));
}

function setLogoForGroup(sub) {
	let jsonObject = new Object();
	jsonObject[202] = {url : '/ivcargo/images/Logo/202_1.GIF', AccountGroupId : 202};
	jsonObject[270] = {url : '/ivcargo/images/Logo/270.GIF', AccountGroupId : 270};
	jsonObject[580] = {url : '/ivcargo/images/Logo/580.GIF', AccountGroupId : 580};
	jsonObject[619] = {url : '/ivcargo/images/Logo/619.png', AccountGroupId : 619};
	jsonObject[725] = {url : '/ivcargo/images/Logo/725.jpg', AccountGroupId : 725};
	jsonObject[669] = {url : '/ivcargo/images/Logo/669.png', AccountGroupId : 669};
	jsonObject[403] = {url : '/ivcargo/images/Logo/403.png', AccountGroupId : 403};
	jsonObject[768] = {url : '/ivcargo/images/Logo/768.jpeg', AccountGroupId : 768};
	jsonObject[609] = {url : '/ivcargo/images/Logo/609.png', AccountGroupId : 609};
	
	if (sub != null && jsonObject[sub] != undefined) {
		$(".groupLogo").attr("src", jsonObject[sub].url);
		$("#AccountGroupId").attr("value", jsonObject[sub].AccountGroupId);
	}
}

function onSignIn(data) {
	if(data.message != null && data.message != undefined) {
		showMessage('error',data.message.description);
		clearAllContent();
		$("#usernameEle").focus();
		setLabelOnFocus();
		return false;
	}
	
	localStorage.setItem("currentCorporateAccountId", data.CorporateAccountId);
	localStorage.setItem("currentCorporateAccountName", data.Name);
	localStorage.setItem("currentCorporateAccountGroupId", data.AccountGroupId);
	localStorage.setItem("currentUserId", data.userId);
	localStorage.setItem("currentExecutiveId", data.executiveId);
	localStorage.setItem("customerAccessId", data.customerAccessId);

	$("#loginform").prop("action", "/ivcustomeraccess/login/validate.do");
	$("#loginform").prop("CorporateAccountId", data.CorporateAccountId);
	$("#loginform").prop("AccountGroupId", data.AccountGroupId);
	$("#loginform").submit();
}

function clearAllContent() {
	$('.formset :input').each(function() {
		$(this).val('');
	});
	
	getSubDomainName();
}

function validateLogin(){
	let myNod = nod();
	myNod.configure({
		parentClass:'validation-message'
	});
	myNod.add({
		selector: '.form-control-label',
		validate: 'presence',
		errorMessage: 'Can\'t be empty'
	});

	myNod.performCheck();			

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
	let $formControl = $('.form-control-label');
	let values = {};
	let validate =    $formControl.each(function() {
		if($(this).val().length > 0){
			$(this).closest('.form-group-login').addClass('filled');
		}else{
			$(this).closest('.form-group-login').removeClass('filled');
		}
	});
	initialiseFocus();
	document.getElementById('usernameEle').focus();
}