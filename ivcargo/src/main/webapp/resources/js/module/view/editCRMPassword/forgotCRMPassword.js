/**
 * 
 */
define(['marionette'
	, 'JsonUtility'
	, 'messageUtility'
	, 'nodvalidation'
],
	function(Marionette) {
		'use strict';// this basically give strictness to this specific js
		let _this = '', otpNumber = 0, partyEmail = '';

		//this is used to get the access of key in onRender because this keyword is not found in onRender function
		return Marionette.LayoutView.extend({
			initialize: function() {
				//initialize is the first function called on call new view()
				_this = this;
			}, render: function() {
				let emailOtpModal = new $.Deferred();

				// Load the modal content
				$("#mainContent").load("/ivcargo/html/module/editCRMPassword/forgotCRMPassword.html", function() {
					emailOtpModal.resolve();
				});

				// Show the modal after ensuring it is loaded
				$.when(emailOtpModal).done(function() {
					$("#emailOtpModal").modal("show");

					$("#sendOtp").click(function() {
						_this.sendOtp();
					});
					
					$("#newPassword").keyup(function() {
						checkPasswordStrength($('#newPassword').val());
					});
					
					$("#resetPass").click(function() {
						_this.validatePasswordLength();
					});
					
					document.querySelectorAll(".otp-input").forEach((input, index, inputs) => {
						input.addEventListener("input", (e) => {
							if (e.target.value.length === 1) {
								if (index < inputs.length - 1) {
									inputs[index + 1].focus();
								} else {
									document.getElementById("verifyOtp").focus();
								}
							}
						});

						input.addEventListener("keydown", (e) => {
							if (e.key === "Enter") {
								if (index < inputs.length - 1) {
									inputs[index + 1].focus();
								} else {
									document.getElementById("verifyOtp").click();
								}
							}
						});

						input.addEventListener("keydown", (e) => {
							if (e.key === "Backspace" && !e.target.value && index > 0)
								inputs[index - 1].focus();
						});
					});

					var interval = setInterval(function() {
						const verifyOtpButton = document.getElementById("verifyOtp");
						
						if (verifyOtpButton) {
							clearInterval(interval);

							verifyOtpButton.addEventListener("click", function() {
								const otpInputs = document.querySelectorAll(".otp-input");
								const otpError = document.getElementById("otpError");
								let isValid = true;

								otpInputs.forEach((input) => {
									if (input.value.trim() === "") {
										isValid = false;
										input.style.borderColor = "red";
									} else {
										input.style.borderColor = "#ccc";
									}
								});

								if (!isValid) {
									otpError.style.display = "block";
								} else {
									otpError.style.display = "none";
									const otp = Array.from(otpInputs).map((input) => input.value).join("");
									
									if(otp == otpNumber) {
										otpError.style.display = "none";
										$("#otpVerificationModal").addClass("hide");
										$("#passwordResetModal").modal("show");
									} else {
										otpError.style.display = "block";
										otpInputs.forEach((input) => {
											input.value = "";
											input.style.borderColor = "#ccc";
										});
									
										otpInputs[0].focus();
									}
								}
							});
						}
					}, 100);

					$("#showPass").click(function() {
						_this.showPassword();
					});
				});
			}, sendOtp: function() {
				let jsonObject = new Object();
				jsonObject.EmailAddress		= $('#emailAddress').val();
				jsonObject.isCRMPage = true;
				showLayer();
				getJSON(jsonObject, CUSTOMER_ACCESS_URL_CONSTANT + "/customerAccessWS/sendOtpEmail.do?", _this.afterSendOtp, EXECUTE_WITHOUT_ERROR);
			}, afterSendOtp: function(response) {
				hideLayer();
				showMessage('success', 'OTP sent successfully to your email address.');
				$("#emailOtpModal").addClass("hide");
				$("#otpVerificationModal").modal("show");
				otpNumber = response.otpNumber; // Store the OTP number for later verification
				partyEmail = $('#emailAddress').val(); // Store the email address for potential use later')
			}, showPassword : function() {
				let newPwd 		= document.getElementById("newPassword"); 
				let confirmPwd 	= document.getElementById("reenterPassword"); 
				
				if (newPwd.type === "password" &&  confirmPwd.type === "password") { 
					newPwd.type = "text"; 
					confirmPwd.type = "text"; 
				} else { 
					newPwd.type = "password"; 
					confirmPwd.type = "password"; 
				} 
			}, validatePasswordLength : function() {
				const newPwd = $('#newPassword').val();
				const confirmPwd = $('#reenterPassword').val();

				if (!newPwd || !confirmPwd)
					showMessage('error', 'Password fields cannot be empty.');
				else if (newPwd.length < 6)
					showMessage('error', 'Please enter at least 6 characters.');
				else if (!/[a-z]/.test(newPwd) || !/[A-Z]/.test(newPwd) || !/\d/.test(newPwd))
					showMessage('error', 'Password should contain a combination of uppercase, lowercase, and numeric values.');
				else if (newPwd !== confirmPwd)
					showMessage('error', 'New Password and Confirm Password do not match.');
				else if (/(.)\1{2,}/.test(newPwd))
					showMessage('error', 'Password should not contain repeated characters.');
				else if (/1234?5?/.test(newPwd))
					showMessage('error', 'Password should not contain consecutive numbers.');
				else
					_this.updatePassword();
			}, updatePassword : function() {
				showLayer();
				
				let jsonObject = new Object();
				jsonObject["passWord"] = $("#newPassword").val();
				jsonObject["emailId"] = partyEmail;
				jsonObject.isCRMPage = true;
				getJSON(jsonObject, CUSTOMER_ACCESS_URL_CONSTANT + "/registerUserWS/updateCRMPassword.do?", _this.afterForgotPass, EXECUTE_WITHOUT_ERROR );	
			}, afterForgotPass : function(response) {
				if (response.success) {
					showMessage('success', 'Password Updated Successfully');
					toogleElement('error', 'none');
					$("#passwordResetModal").modal("hide");
				} else
					showMessage('success', 'Please try again !');
			}
		});
	});