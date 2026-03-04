var PaymentTypeConstant				= null;
var moduleId						= 0;
var ModuleIdentifierConstant		= null;
var doneTheStuff					= false;
var GeneralConfiguration			= null;
var allowToShowPartySelectionType	= false;
define(
		[
			'selectizewrapper',
			PROJECT_IVUIRESOURCES +'/resources/js/populateautocomplete/selectoption.js',
			'JsonUtility',
			'messageUtility',
			'/ivcargo/resources/js/generic/urlparameter.js',
			'autocomplete',
			'autocompleteWrapper',
			'bootstrapSwitch',
			'nodvalidation',
			'focusnavigation',
			PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
			],function(Selectizewrapper, Selection) {
			'use strict';
			let jsonObject = new Object(), myNod, _this = null, bankPaymentOperationRequired = false,mobileNoToSendOTP = '',showOTPCheckboxForOTP = false,
			currentExecutiveId = null, otpCountdownInterval, TOKEN_KEY = null, TOKEN_VALUE = null;
			let otpSessionMap = {}; // executiveId → { otpNumber, validDateTime, resendCount }
			const MAX_RESEND_LIMIT = 3;
			return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
				},	render : function() {
					showLayer();
					getJSON(jsonObject, WEB_SERVICE_URL + '/creditDebitNoteWS/loadCreditDebitNoteDetails.do?', _this.loadEelements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, loadEelements : function(response) {
					let loadelement = new Array();
					let paymentHtml	= new $.Deferred();
					let baseHtml	= new $.Deferred();
					
					loadelement.push(baseHtml);
					
					PaymentTypeConstant					= response.PaymentTypeConstant;
					ModuleIdentifierConstant			= response.ModuleIdentifierConstant;
					moduleId							= response.moduleId;
					GeneralConfiguration				= response.GeneralConfiguration;
					bankPaymentOperationRequired		= GeneralConfiguration.BankPaymentOperationRequired;
					mobileNoToSendOTP					= response.mobileNoToSendOTP;
					showOTPCheckboxForOTP				= response.showOTPCheckboxForOTP;
					TOKEN_KEY							= response.TOKEN_KEY;
					TOKEN_VALUE							= response.TOKEN_VALUE;
					allowToShowPartySelectionType		= response.allowToShowPartySelectionType;
					
					$("#mainContent").load("/ivcargo/html/module/creditDebitNote/creditDebitNote.html", function() {
						baseHtml.resolve();
					});
					
					if(bankPaymentOperationRequired) {
						loadelement.push(paymentHtml);
						
						$("#bankPaymentOperationPanel").load("/ivcargo/html/module/paymentTypeSelection/paymentTypeSelection.html", function() {
							paymentHtml.resolve();
						});
					}
					
					$.when.apply($, loadelement).done(function() {
						initialiseFocus();
						hideLayer();
						
						$("#contentData").html("");
						$("#printTheExpense").css("display", "none");
						$("#viewAddedPaymentDetailsCreate").css("display", "block");
						
						$("#getPrepaidAmtSummary").click(function() {
							_this.getPrepaidAmtSummary();
						});
						
						$("#btSubmit").on("click" ,function() {		
							_this.settlePrepaidAmount();
						});
						
						let options						= new Object();
						let elementConfiguration		= new Object();
						
						if(allowToShowPartySelectionType){
							$('#bottom-border-boxshadow').addClass("hide");
							$("*[data-attribute=selectionType]").removeClass("hide");
							_this.setSelectionType();
							_this.setBillType();
							response.isSearchByAllParty		= true;
							response.partySelectionWithoutSelectize		= true;
							elementConfiguration.partyNameElement	= $("#partyNameEle");
						} else{
							$("*[data-attribute=branch]").removeClass("hide");
							$('#bottom-border-boxshadow').removeClass("hide");
						}
						
						options.minDate								= response.minDate;
						options.maxDate								= response.maxDate;
						response.isCalenderForSingleDate			= response.noOfDays != undefined;
						response.options							= options;
						
						elementConfiguration.singleDateElement		= $('#dateEle');
						response.elementConfiguration				= elementConfiguration;

						Selection.setSelectionToGetData(response);
						
						_this.setSelectType();
						
						$("#selectionTypeEle").change(function() {
							
							if(Number($("#selectionTypeEle_primary_key").val()) == 1){
								$('#bottom-border-boxshadow').removeClass("hide");
								$("*[data-attribute=branch]").removeClass("hide");
								$("*[data-attribute=partyName]").addClass("hide");
								$("*[data-attribute=billType]").addClass("hide");
								$("*[data-attribute=billNumber]").addClass("hide");
								$("*[data-attribute=search]").addClass("hide");
								
							} else {
								$('#bottom-border-boxshadow').addClass("hide");
								$("*[data-attribute=branch]").addClass("hide");
								$("*[data-attribute=partyName]").removeClass("hide");
								$("*[data-attribute=billType]").removeClass("hide");
								$("*[data-attribute=billNumber]").removeClass("hide");
								$("*[data-attribute=search]").removeClass("hide");
							}
							
							$('#selectTypeEle_primary_key').val(0);
							$('#selectTypeEle').val('');
							$('#amount').val('');
							var paymentSelect = $('#paymentType')[0].selectize;
							if (paymentSelect) {
							    paymentSelect.clear();
							    paymentSelect.setValue(0);
							}

							$('#remark').val('');
							$('#pendingDetailsCard').addClass("hide");
							$("#mainTable").empty();
							$('#partyNameEle_primary_key').val(0);
							$('#partyNameEle').val('');
							$('#billTypeEle_primary_key').val(0);
							$('#billTypeEle').val('');
							$('#billNumberEle').val('');
						});
						
						if(response.noOfDays != undefined)
							$('.dateFeild').removeClass('hide');
						else
							$('.dateFeild').remove();
						
						Selectizewrapper.setAutocomplete({
							jsonResultList	:	response.branchList,
							valueField		:	'branchId',
							labelField		:	'branchName',
							searchField		:	'branchName',
							elementId		:	'branchEle',
							create			:	false,
							maxItems		:	1,
							onChange		:	_this.onBranchSelect
						});
						
						if(!jQuery.isEmptyObject(response.paymentTypeArr)) {
							Selectizewrapper.setAutocomplete({
								jsonResultList	:	response.paymentTypeArr,
								valueField		:	'paymentTypeId',
								labelField		:	'paymentTypeName',
								searchField		:	'paymentTypeName',
								elementId		:	'paymentType',
								onChange		:	_this.onPaymentTypeSelect
							});
						}
						
						if(bankPaymentOperationRequired) {
							$("#viewPaymentDetails").click(function() {
								openAddedPaymentTypeModel();
							});
							
							$("#addedPayment").click(function() {
								$("#addedPaymentTypeModal").modal('hide');
							});
							
							setIssueBankAutocomplete();
							setAccountNoAutocomplete();
						}

						hideLayer();
						
						$("#saveBtn").click(function() {
							_this.onSave(_this);	
						});
						
						$('#sendOtpCheckbox').closest('.form-group').hide();
						
						myNod	= nod();
						
						addAutocompleteElementInNode(myNod, 'executiveEle', 'Select proper Executive !');
						
						$("#searchBtn").click(function() {
							myNod.performCheck();
							
							if(myNod.areAll('valid'))
								_this.onFind(0);	
						});

						if (showOTPCheckboxForOTP) {
							$('#branchEle, #selectTypeEle_primary_key, #amount, #paymentType, #remark').on('change keyup', function() {
								_this.checkFormFieldsAndToggleOtpCheckbox();
							});
						}

						_this.handleSendOtpCheckbox(); // initialize OTP checkbox behavior

						$('#otpInput').on('keypress', function(e) {
							const charCode = e.which ? e.which : e.keyCode;

							// Block non-digits
							if (charCode < 48 || charCode > 57)
								e.preventDefault();

							// Limit to 4 digits
							if (this.value.length >= 6)
								e.preventDefault();
						});
					});
					
					return _this;
				}, setSelectType : function() {
					_this.setSelectTypeAutocompleteInstance();
					
					let autoSelectType = $("#selectTypeEle").getInstance();
					
					let SelectTYPE = [
						{ "selectTypeId":8, "selectTypeName": "Credit Note" },
						{ "selectTypeId":9, "selectTypeName": "Debit Note" },
					]
					
					$( autoSelectType ).each(function() {
						this.option.source = SelectTYPE;
					})
				}, setSelectTypeAutocompleteInstance : function() {
					let autoSelectTypeName			= new Object();
					autoSelectTypeName.primary_key	= 'selectTypeId';
					autoSelectTypeName.field		= 'selectTypeName';

					$("#selectTypeEle").autocompleteCustom(autoSelectTypeName)
				}, setSelectionType : function(){
					_this.setSelectionTypeAutocompleteInstance();
					
					var autoSelectionType = $("#selectionTypeEle").getInstance();
					
					var SelectionTYPE = [
						{ "selectionTypeId":1, "selectionTypeName": "Branch wise" },
						{ "selectionTypeId":2, "selectionTypeName": "Creditor Wise" },
						]
					
					$( autoSelectionType ).each(function() {
						this.option.source = SelectionTYPE;
					})
				}, setSelectionTypeAutocompleteInstance : function() {
					let autoSelectTypeName 			= new Object();
					autoSelectTypeName.primary_key 	= 'selectionTypeId';
					autoSelectTypeName.field 		= 'selectionTypeName';
	
					$("#selectionTypeEle").autocompleteCustom(autoSelectTypeName)
				}, setBillType : function(){
					_this.setBillTypeAutocompleteInstance();
					
					let autoBillType = $("#billTypeEle").getInstance();
					
					let BillTYPE = [
						{ "billTypeId":1, "billTypeName": "TBB " },
						//{ "billTypeId":2, "billTypeName": "STBS" },
						]
					
					$( autoBillType ).each(function() {
						this.option.source = BillTYPE;
					})
				}, setBillTypeAutocompleteInstance : function() {
					let autoSelectTypeName 			= new Object();
					autoSelectTypeName.primary_key 	= 'billTypeId';
					autoSelectTypeName.field 		= 'billTypeName';
	
					$("#billTypeEle").autocompleteCustom(autoSelectTypeName)
				} ,onPaymentTypeSelect : function(_this){
					hideShowBankPaymentTypeOptions(document.getElementById("paymentType"));
				}, onFind : function(billId) {
					
					let selectionTypeId			= $('#selectionTypeEle_primary_key').val();
					let branchId				= $('#branchEle_primary_key').val();
					let partyMasterId			= $('#partyNameEle_primary_key').val();
					let billTypeId				= $('#billTypeEle_primary_key').val();
					let billNumber				= $('#billNumberEle').val();
					//let billId					= billId;
					
					if(allowToShowPartySelectionType && Number($("#selectionTypeEle_primary_key").val()) == 2){
						if(partyMasterId <= 0) {
							showAlertMessage('error', 'Please Select Party');
							$('#partyNameEle').focus();
							return;
						} else if(billTypeId <= 0) {
							showAlertMessage('error', 'Please Select Bill Type');
							$('#billTypeEle_primary_key').focus();
							return;
						} else if(billNumber == null || billNumber == '') {
							showAlertMessage('error', 'Please Enter Bill Number');
							$('#billNumber').focus();
							return;
						}
					}
					
					jsonObject	= new Object();
					
					jsonObject.selectionTypeId			= selectionTypeId;
					jsonObject.branchId					= branchId;
					jsonObject.partyMasterId			= partyMasterId;
					jsonObject.billTypeId				= billTypeId;
					jsonObject.billNumber				= billNumber;
					jsonObject.billId					= billId;
					
					showLayer();
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/creditDebitNoteWS/getBillDetailsForCreditDebitNote.do?', _this.setResponse, EXECUTE_WITH_ERROR);
					doneTheStuff = true;
				
				}, onSave : function() {
					let branchId		= $('#branchEle').val();
					let remark			= $('#remark').val();
					let paymentType		= $('#paymentType').val();
					let noteType		= $('#selectTypeEle_primary_key').val();
					let amount			= $('#amount').val();
					let finalAmount		= amount.replace(/,/g, "");
					let billIdWithType 	= $('#billId').val();
					let creditorId		= $('#partyMasterId').val();
					let billNumber 		= $('#billBillNumber').val();
					let billAmount 		= $('#billAmount').val();
					let billBranchId 	= $('#billBranchId').val();
					
					if(allowToShowPartySelectionType && Number($("#selectionTypeEle_primary_key").val()) == 2){
						branchId = billBranchId;
					}
					
					if(branchId <= 0) {
						showAlertMessage('error', 'Please Select Branch');
						$('#branchEle').focus();
						return;
					} else if(noteType <= 0) {
						showAlertMessage('error', 'Please Select Note');
						$('#selectTypeEle_primary_key').focus();
						return;
					} else if(amount <= 0) {
						showAlertMessage('error', 'Please Enter Amount');
						$('#amount').focus();
						return;
					} else if(paymentType <= 0) {
						showAlertMessage('error', 'Please Select Payment Type');
						$('#paymentType').focus();
						return;
					} else if(remark == undefined || remark == null || remark.length == 0) {
						showAlertMessage('error', 'Please Enter Remark');
						$('#remark').focus();
						return;
					}
					
					if ($('#sendOtpCheckbox').closest('.form-group').is(':visible') && !$('#sendOtpCheckbox').is(':checked')) {
						showAlertMessage('error', 'Please check "Send OTP" to continue.');
						return;
					}
					
					if ($('#sendOtpCheckbox').is(':checked') && !_this.validateEnteredOtp())
						return; // Stop form submission or save logic
					
					jsonObject	= new Object();
					
					if($("#dateEle").attr('data-date') != undefined)
						jsonObject["backDate"]	= $("#dateEle").attr('data-date'); 

					jsonObject.branchId				= branchId;
					jsonObject.amount				= finalAmount;
					jsonObject.remark				= remark;
					jsonObject.paymentType			= paymentType;
					jsonObject.noteType				= noteType;
					jsonObject.paymentValues		= $('#prepaidPaymentValCreditDebit').val();
					jsonObject.TOKEN_KEY			= TOKEN_KEY;
					jsonObject.TOKEN_VALUE			= TOKEN_VALUE;
					
					if(allowToShowPartySelectionType && Number($("#selectionTypeEle_primary_key").val()) == 2){
						jsonObject.billId				= billIdWithType.split('_')[0];
						jsonObject.billTypeId			= billIdWithType.split('_')[1];
						jsonObject.creditorId			= creditorId;
						jsonObject.billNumber			= billNumber;
						jsonObject.billGrandTotal		= billAmount;
					}
					
					doneTheStuff = true;

					let btModalConfirm = new Backbone.BootstrapModal({
						content		:	"Are you sure you want to continue ?",
						modalWidth	:	30,
						title		:	'Credit/Debit Note',
						okText		:	'YES',
						showFooter	:	true,
						okCloses	:	true
					}).open();

					btModalConfirm.on('ok', function() {
						showLayer();
						getJSON(jsonObject, WEB_SERVICE_URL	+ '/creditDebitNoteWS/insertCreditDebitNoteDetails.do?', _this.setSuccess, EXECUTE_WITH_NEW_ERROR);
						doneTheStuff = true;
					});

					btModalConfirm.on('cancel', function() {
						$("#saveBtn").removeClass('hide');
						$("#saveBtn").attr("disabled", false);
						doneTheStuff = false;
						hideLayer();
					});
				}, setSuccess :function(response) {
					hideLayer();
					
					TOKEN_KEY				= response.TOKEN_KEY;
					TOKEN_VALUE				= response.TOKEN_VALUE;
					
					if(response.creditDebitNoteId != undefined && response.creditDebitNoteId > 0) {
						setTimeout(function(){ location.reload()}, 1000)
					}
					
					if (response.message) {
						let errorMessage = response.message;
						
						if (errorMessage.type === MESSAGE_TYPE_SUCCESS)
							setTimeout(function() { location.reload() }, 1000)
					}
				}, handleSendOtpCheckbox: function () {
					const $checkbox = $('#sendOtpCheckbox');
					const $otpInput = $('#otpInput');
				
					$checkbox.change(function () {
						if (!$checkbox.is(':checked')) {
							if ($checkbox.data('locked')) {
								// Prevent unchecking if locked
								$checkbox.prop('checked', true);
								return;
							} else {
								// If not locked, allow unchecking and reset
								$otpInput.hide().val('');
								currentExecutiveId = null;
								clearInterval(otpCountdownInterval);
								$('#otpCountdownMsg').remove();
								$('#resendOtpBtn').remove();
								$('#otpAttemptsLeftMsg').hide(); // hide reattempt message

							}
						} else {
							$otpInput.show();
							$checkbox.data('locked', true);
							_this.sendOtpToWhatsapp(false);
						}
					});
				}, sendOtpToWhatsapp: function(isResendOTP) {
					if (!mobileNoToSendOTP || mobileNoToSendOTP == '') {
						showAlertMessage('error', 'Mobile number not configured.');
						return;
					}

					const jsonObject = {
						deliveredMobileNo: mobileNoToSendOTP,
						moduleId: CREDIT_DEBIT_NOTE,
						isResendOTP : isResendOTP
					};

					const queryString = $.param(jsonObject);

					const executiveIdKey = currentExecutiveId;

					if (!otpSessionMap[executiveIdKey]) {
						otpSessionMap[executiveIdKey] = {
							resendCount: 0
						};
					}

					const session = otpSessionMap[executiveIdKey];	

					if (session.resendCount >= MAX_RESEND_LIMIT) {
						showAlertMessage('warning', 'You have reached the maximum OTP resend limit.');
						return;
					}

					$.ajax({
						type: "POST",
						url: WEB_SERVICE_URL + '/lRSearchWS/resendOTPMessage.do?' + queryString,
						contentType: 'application/x-www-form-urlencoded',
						dataType: 'json',
						success: function(data) {
							if (data.otpNumber && data.validDateTimeForOTP && data.executiveId) {
								const executiveId	= data.executiveId;
								const otpNumber		= data.otpNumber;
								const validDateTime = data.validDateTimeForOTP;

								currentExecutiveId = executiveId;

								if (!otpSessionMap[executiveId]) {
									otpSessionMap[executiveId] = {
										resendCount: 0
									};
								}

								const session = otpSessionMap[executiveId];

								session.otpNumber = otpNumber;
								session.validDateTime = validDateTime;
								session.resendCount++;

								$('#otpInput').val('').prop('disabled', false);

								// Lock the checkbox from being unchecked
								$('#sendOtpCheckbox').data('locked', true);
									
								const attemptsLeft = MAX_RESEND_LIMIT - session.resendCount;
								$('#otpAttemptsLeftMsg').text(`Attempts left: ${attemptsLeft}`).show();
								_this.startOtpCountdown(executiveId);
							}
							
							showAlertMessage(data.message.typeName, data.message.description);

							hideLayer();
						}, error: function() {
							showAlertMessage('Error', 'Failed to send OTP');
							hideLayer();
						}
					});
				}, validateEnteredOtp: function() {
					const enteredOtp = $('#otpInput').val().trim();

					if (!currentExecutiveId || !otpSessionMap[currentExecutiveId]) {
						showAlertMessage('error', 'No OTP received from server.');
						return false;
					}

					const { otpNumber, validDateTime } = otpSessionMap[currentExecutiveId];

					if (enteredOtp === '') {
						showAlertMessage('error', 'Please enter the OTP.');
						return false;
					}

					if (Date.now() > validDateTime) {
						showAlertMessage('error', 'OTP has expired. Please resend OTP.');
						return false;
					}

					if (enteredOtp !== otpNumber.toString()) {
						showAlertMessage('error', 'Invalid OTP. Please try again.');
						return false;
					}

					return true;
				}, startOtpCountdown: function(executiveId) {
					clearInterval(otpCountdownInterval);
					$('#otpCountdownMsg').remove();
					$('#resendOtpBtn').remove();

					const otpData = otpSessionMap[executiveId];
					if (!otpData) return;

					const $inputField = $('#otpInput');
					const $countdown = $('<div id="otpCountdownMsg" style="margin-top:5px;color:#555;"></div>');
					const $resendBtn = $('<button id="resendOtpBtn" style="display:none;margin-top:5px;" class="btn btn-sm btn-primary">Resend OTP</button>');

					$resendBtn.click(() => {
						$resendBtn.prop('disabled', true);
						_this.sendOtpToWhatsapp(true);
					});

					$inputField.after($countdown).after($resendBtn);

					otpCountdownInterval = setInterval(() => {
						const now = Date.now();
						const remaining = otpData.validDateTime - now;

						if (remaining <= 0) {
							clearInterval(otpCountdownInterval);
							$countdown.text('OTP expired.');
							$resendBtn.show();
							$inputField.prop('disabled', true);
						} else {
							const seconds = Math.floor(remaining / 1000);
							$countdown.text(`OTP valid for ${seconds} seconds`);
						}
					}, 1000);
				}, checkFormFieldsAndToggleOtpCheckbox: function() {
					const branchId		= $('#branchEle').val();
					const noteType		= $('#selectTypeEle_primary_key').val();
					const amount		= $('#amount').val();
					const paymentType	= $('#paymentType').val();
					const remark		= $('#remark').val();

					const allFieldsFilled = branchId > 0 && noteType > 0 && amount && amount > 0 && paymentType > 0 && remark.trim().length > 0;

					if (allFieldsFilled) {
						$('#sendOtpCheckbox').closest('.form-group').show();
					} else {
						$('#sendOtpCheckbox').prop('checked', false).closest('.form-group').hide();
						$('#otpInput').hide().val('');
						$('#otpCountdownMsg').remove();
						$('#resendOtpBtn').remove();
					}
				}, setResponse : function(response) {
					hideLayer();

					if(response.message != undefined) {
						$('#pendingDetailsCard').addClass('hide');
						$('#bottom-border-boxshadow').addClass('hide');
						return;
					}
					
					var list = response.billList;
					var lengthFlag = list.length == 1;
					
					if(list.length > 0) {
						$('#mainTable').empty();
						let billTypeId	= $('#billTypeEle_primary_key').val();
						let headerColumnArray = new Array();
						headerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white"  >Bill Number</th>');
						
						if(lengthFlag) {
							headerColumnArray.push("<td style='display:none; text-align:center;vertical-align:middle;font-size:15px;'></td>");
							headerColumnArray.push("<td style='display:none; text-align:center;vertical-align:middle;font-size:15px;'></td>");
							headerColumnArray.push("<td style='display:none; text-align:center;vertical-align:middle;font-size:15px;'></td>");
							headerColumnArray.push("<td style='display:none; text-align:center;vertical-align:middle;font-size:15px;'></td>");
							headerColumnArray.push("<td style='display:none; text-align:center;vertical-align:middle;font-size:15px;'></td>");
						}
						
						headerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white"  >Bill Date</th>');
						headerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white"  >Party Name</th>');
						headerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white"  >Branch Name</th>');
						headerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white"  >Status</th>');
						headerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white" >Amount </th>');

						$('#mainTable').append('<tr>' + headerColumnArray.join(' ') +' </tr>');
						
						for(let i = 0; i < list.length; i++) {
							var data = list[i];
			
							let dataColumnArray = new Array();
							
							if(lengthFlag) {
								dataColumnArray.push("<td style='text-align: center;vertical-align:middle; font-size:15px;'>" +data.billNumber+ "</td>");
								dataColumnArray.push("<td style='display:none; text-align:center;vertical-align:middle;font-size:15px;'><input type='hidden' id='billAmount' value='" + data.billGrandTotal + "'></td>");
								dataColumnArray.push("<td style='display:none; text-align:center;vertical-align:middle;font-size:15px;'><input type='hidden' id='billBillNumber' value='" + data.billNumber + "'></td>");
								dataColumnArray.push("<td style='display:none; text-align:center;vertical-align:middle;font-size:15px;'><input type='hidden' id='partyMasterId' value='" + data.creditorId + "'></td>");
								dataColumnArray.push("<td style='display:none; text-align:center;vertical-align:middle;font-size:15px;'><input type='hidden' id='billId' value='" + data.billId + "_"+billTypeId+"'></td>");
								dataColumnArray.push("<td style='display:none; text-align:center;vertical-align:middle;font-size:15px;'><input type='hidden' id='billBranchId' value='" + data.branchId + "'></td>");
							} else
								dataColumnArray.push("<td style='text-align:center;vertical-align:middle;font-size:15px;'><a href='javascript:void(0)' onclick='_this.onFind(\""+data.billId+"\")'>" + data.billNumber + "</a></td>");

							dataColumnArray.push("<td style='text-align: center;vertical-align:middle; font-size:15px;'>" +data.creationDateTimeStampString+ "</td>");
							dataColumnArray.push("<td style='text-align: center;vertical-align:middle; font-size:15px;'>" +data.creditorName+ "</td>");
							dataColumnArray.push("<td style='text-align: center;vertical-align:middle; font-size:15px;'>" +data.branchName+ "</td>");
							dataColumnArray.push("<td style='text-align: center;vertical-align:middle; font-size:15px;'>" +data.billStatusString+ "</td>");
							dataColumnArray.push("<td style='text-align: center;vertical-align:middle; font-size:15px;'>" +data.billGrandTotal+ "</td>");

							$("#mainTable").append('<tr>' +dataColumnArray.join(' ')+ '</tr>');
						}	
						
						let totalArray = new Array();
						$("#mainTable").append('<tr>' +totalArray.join(' ')+ '</tr>');
					}
					
					if(lengthFlag) {
						$('#pendingDetailsCard').removeClass('hide');
						$('#bottom-border-boxshadow').removeClass('hide');
					}
				}
			});
		});