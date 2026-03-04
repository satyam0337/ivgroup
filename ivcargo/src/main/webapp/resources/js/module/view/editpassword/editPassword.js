define([ 'marionette'
	,'JsonUtility'
	,'messageUtility'
	,'/ivcargo/resources/js/generic/urlparameter.js'
	,'jquerylingua'
	,'language'
	,'nodvalidation'
	,'focusnavigation'
	,'/ivcargo/resources/js/module/redirectAfterUpdate.js',
	],
	function(Marionette, JsonUtility, MessageUtility, UrlParameter, jquerylingua, language, NodValidation, FocusNavigation) {
	'use strict';// this basically give strictness to this specific js
	var jsonObject	= new Object(),
	wayBillId,
	myNod,
	_this = '',
	redirectFilter = 0;
	var execId='';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(masterObj){
			//initialize is the first function called on call new view()
			_this = this;
		},
		render: function() {
			var jsonObject	= new Object();
			getJSON(jsonObject, WEB_SERVICE_URL + '/executiveWS/getExistingData.do?', _this.renderEditPassword, EXECUTE_WITHOUT_ERROR);
			return _this;
		},
		renderEditPassword : function(response) {
			execId =response.executiveId;
			var loadelement = new Array();
			var baseHtml 	= new $.Deferred();

			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/module/editpassword/editPassword.html",
					function() {
				baseHtml.resolve();
			});
			setTimeout(function() { 
				$('#oldPassword').val(''); // for firefox
			}, 200);
			$.when.apply($, loadelement).done(function() {
				hideLayer();

				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector		: '#oldPassword',
					validate		: 'presence',
					errorMessage	: 'Enter Old Password !'
				});
				myNod.add({
					selector		: '#newPassword',
					validate		: 'presence',
					errorMessage	: 'Enter New Password !'
				});
				myNod.add({
					selector		: '#retypePssword',
					validate		: 'presence',
					errorMessage	: 'Enter Confirm Password !'
				});

				$("#newPassword").keyup(function() {
					_this.CheckPasswordStrength();

				});
				$("#showPass").click(function() {
					_this.showPassword();
				});

				$("#SubmitPassword").click(function() {
					myNod.performCheck();
					if(myNod.areAll('valid')) {
						_this.validatePasswordLength(response);
					}
				});
			});
		}, 

		showPassword:function()
		{
			{
				var oldPwd = document.getElementById("oldPassword");
				var newPwd = document.getElementById("newPassword"); 
				var confirmPwd = document.getElementById("retypePssword"); 
				if (oldPwd.type === "password" && newPwd.type === "password" &&  confirmPwd.type === "password") { 
					oldPwd.type = "text"; 
					newPwd.type = "text"; 
					confirmPwd.type = "text"; 
				} 
				else { 
					oldPwd.type = "password"; 
					newPwd.type = "password"; 
					confirmPwd.type = "password"; 
				} 
			}
		}
		,
		validatePasswordLength :function(response){

			var oldPwd=$('#oldPassword').val();
			var newPwd=$('#newPassword').val();
			var confirmPwd=$('#retypePssword').val();
			var pwdLength = newPwd.length; 
			if( pwdLength > 0 && pwdLength < 6){
				showMessage('error','Please enter at least 6 characters.');
				toogleElement('error','block');
				newPassword.focus();
				//return false;
			}
			else if(newPwd.length<6)
			{
				showMessage('error','Please enter at least 6 characters.');
			}
			else if(!(newPwd.match(/[a-z]/) ) || !(newPwd.match(/[A-Z]/) ) && !(newPwd.match(/\d+/)))
			{
				showMessage('error','Password should contain combination of both numeric and alaphabet values');
			}
			else if(newPwd!=confirmPwd)
			{
				showMessage('error','New Password and Confirm Password Not Matched');
			}
			else if(oldPwd==newPwd)
			{
				showMessage('error','Old Password and New Password Cannot be Same');
			}
			else if(oldPwd!=response.password)
			{
				showMessage('error','Old Password Incorrect');
			}
			else if(newPwd.includes('aa')||newPwd.includes('aaa')||newPwd.includes('aaa')||newPwd.includes('aaaa')||newPwd.includes('aaaaa'))
			{
				showMessage('error','Password should not contain Repeacted characters');
			}
			else if(newPwd===('12') ||newPwd===('123')||newPwd===('1234') ||newPwd===('12345'))
			{
				showMessage('error','Password should not contain continue numbers');
			}
			else{
				_this.UpdatePassword(response);
				toogleElement('error','none');
			}
		}, 
		CheckPasswordStrength:function()
		{
			var newPwd=$('#newPassword').val();

			var metervalue=$('#password-strength-meter').val(22);
			(newPwd.length<=0)
			{
				var metervalue=$('#password-strength-meter').val(0);
			}

			if(newPwd.length>=1 && newPwd.length<=2)
			{
				var metervalue=$('#password-strength-meter').val(5);
			}
			if(newPwd.length>=2 && newPwd.length<4)
			{
				var metervalue=$('#password-strength-meter').val(10);
			}
			if(newPwd.length>4)
			{
				var metervalue=$('#password-strength-meter').val(20);
			}
			if(newPwd.length>=6)
			{
				var metervalue=$('#password-strength-meter').val(40);
			}
			if(( newPwd.length>=6 && newPwd.match(/[a-z]/) )  && (newPwd.match(/\d+/)) || (newPwd.match(/[A-Z]/) ) && (newPwd.match(/\d+/)))
			{
				var metervalue=$('#password-strength-meter').val(100);
			}

			if(newPwd===('123') ||newPwd===('1234')||newPwd===('12345'))
			{
				var metervalue=$('#password-strength-meter').val(40);
			}

		}
		,

		UpdatePassword : function(response){
			var jsonObject = new Object();
			showLayer();
			jsonObject["executiveId"] = response.executiveId;
			jsonObject["oldPassword"] = $("#oldPassword").val();
			jsonObject["newPassword"] = $("#newPassword").val();
			getJSON(jsonObject, WEB_SERVICE_URL + "/executiveWS/editExecutivePassword.do?", _this.afterUpdate, EXECUTE_WITHOUT_ERROR );	
		}, afterUpdate : function(response){
			hideLayer();
			if (!response || jQuery.isEmptyObject(response)) {
				_this.clearTextfieldData();
				showMessage('error', "System error"); // show message to show system processing error massage on top of the window.
				hideLayer();
			} else {
				if(response.response!=null )
				{
					_this.clearTextfieldData();
					showMessage('success',response.response.htData.message.description);
				}
				else
				{
					_this.clearTextfieldData();
					showMessage('success', response.message.description)
				}
			} 
		},

		clearTextfieldData:function(){
			$('#oldPassword').val('');
			$('#newPassword').val('');
			$('#retypePssword').val('');
			var metervalue=$('#password-strength-meter').val(0);
		},


		/*,redirectToPage : function(response) {
			redirectToAfterUpdate(response);
			hideLayer();
		}*/
	});
});



