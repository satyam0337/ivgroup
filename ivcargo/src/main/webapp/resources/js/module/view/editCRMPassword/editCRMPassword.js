define([ 'marionette'
	,'JsonUtility'
	,'messageUtility'
	,'nodvalidation'
	],
	function(Marionette) {
	'use strict';// this basically give strictness to this specific js
	let myNod,_this = '', partyData = null;
	
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(){
			//initialize is the first function called on call new view()
			_this = this;
		}, render: function() {
			showLayer();
			let jsonObject	= new Object();
			jsonObject.isCRMPage = true;
			getJSON(jsonObject, CUSTOMER_ACCESS_URL_CONSTANT + '/customerAccessWS/getCustomerAccessDetailsToUpdatePassword.do?', _this.renderEditPassword, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, renderEditPassword : function(response) {
			partyData = response.CustomerAccess;

			let loadelement = new Array();
			let baseHtml	= new $.Deferred();

			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/editCRMPassword/editCRMPassword.html", function() {
				baseHtml.resolve();
			});
			
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
				
				$('#oldPassword').val('');

				$("#newPassword").keyup(function() {
					checkPasswordStrength($('#newPassword').val());
				});

				$("#showPass").click(function() {
					_this.showPassword();
				});

				$("#SubmitPassword").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.validatePasswordLength();
				});
			});
		}, showPassword : function() {
			let oldPwd = document.getElementById("oldPassword");
			let newPwd = document.getElementById("newPassword"); 
			let confirmPwd = document.getElementById("retypePssword"); 

			let toggleType = oldPwd.type === "password" ? "text" : "password";

			oldPwd.type = toggleType;
			newPwd.type = toggleType;
			confirmPwd.type = toggleType;
		}, validatePasswordLength :function() {
			let oldPwd		= $('#oldPassword').val();
			let newPwd		= $('#newPassword').val();
			let confirmPwd	= $('#retypePssword').val();
			let pwdLength	= newPwd.length; 
			
			// Utility to show and toggle error message
			function showError(msg) {
				showMessage('error', msg);
				toogleElement('error', 'block');
			}

			// 1. Minimum length check
			if (pwdLength > 0 && pwdLength < 6) {
				showError('Please enter at least 6 characters.');
				$('#newPassword').focus();
			}
			else if (pwdLength < 6) // 2. Recheck length
				showError('Please enter at least 6 characters.');
			// 3. Check for at least one lowercase, one uppercase, and one number
			else if (!/[a-z]/.test(newPwd) || !/[A-Z]/.test(newPwd) || !/\d/.test(newPwd))
				showError('Password should contain a combination of uppercase, lowercase, and numeric characters.');
			// 4. Check for matching confirm password
			else if (newPwd !== confirmPwd)
				showError('New Password and Confirm Password do not match.');
			// 5. Prevent reuse of old password
			else if (oldPwd === newPwd)
				showError('Old Password and New Password cannot be the same.');
			// 6. Check old password (assuming response.passWord is the current password)
			else if (oldPwd !== partyData.customerAccessPassword)
				showError('Old Password is incorrect.');
			// 7. Repeating characters check
			else if (/a{2,}/i.test(newPwd))
				showError('Password should not contain repeated characters.');
			// 8. Sequential numbers like 12345
			else if (/1234|12345|01234/.test(newPwd))
				showError('Password should not contain sequential numbers.');
			// ✅ If all checks pass
			else {
				_this.updatePassword();
				toogleElement('error', 'none');
			}
		}, updatePassword : function() {
			let jsonObject = new Object();
			showLayer();
			jsonObject["emailId"]	= partyData.emailId;
			jsonObject["passWord"]	= $("#newPassword").val();
			jsonObject.isCRMPage = true;
			getJSON(jsonObject, CUSTOMER_ACCESS_URL_CONSTANT + "/customerAccessWS/updateCustomerAccessPassword.do?", _this.afterUpdate, EXECUTE_WITHOUT_ERROR );	
		}, afterUpdate : function(response) {
			hideLayer();
			
			if (response.success) {
				showMessage('success', 'Password Updated Successfully');
				toogleElement('error', 'none');
				_this.clearTextfieldData();
			} else
				showMessage('success', 'Please try again !');
		}, clearTextfieldData:function() {
			$('#oldPassword').val('');
			$('#newPassword').val('');
			$('#retypePssword').val('');
			$('#password-strength-meter').val(0);
		}
	});
});