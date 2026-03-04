var doneTheStuff				= false;
var moduleId 					= 0;
var	ModuleIdentifierConstant 	= null;
var PaymentTypeConstant			= null;
var	incomeExpenseModuleId		= 0;
var generalConfiguration		= null;
var minDate						= null;
define(
		[
			'JsonUtility',
			'messageUtility',
			PROJECT_IVUIRESOURCES + '/resources/js/module/view/chequebounce/chequebouncefilepath.js',
			'jquerylingua',
			'language',
			'autocomplete',
			'autocompleteWrapper',
			'bootstrapSwitch',
			'nodvalidation',
			'focusnavigation',
			PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
			'/ivcargo/resources/js/generic/urlparameter.js',
			PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js',
			'selectizewrapper',
			'/ivcargo/resources/js/module/redirectAfterUpdate.js',
			'/ivcargo/resources/js/validation/regexvalidation.js',
			,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
			,PROJECT_IVUIRESOURCES + '/resources/js/common/VariableForErrorMsg.js',
			],
			
			function(JsonUtility, MessageUtility, FilePath, Lingua, Language, AutoComplete, AutoCompleteWrapper, BootstrapSwitch, NodValidation, FocusNavigation,
					BootstrapModal,UrlParameter,Selection,Selectizewrapper,datePickerUI,VariableForErrorMsg) {
			'use strict';
			var 
			myNod, 
			_this = '',
			masterLangObj,
			chequeBounceDetailsList,
			chequeBounceArrCount = new Array(),
			tempChequeBounceArrCount = new Array();
			
			return Marionette.LayoutView.extend({
				initialize : function(masterObj) {
					_this = this;
				}, render : function() {
					getJSON(null, WEB_SERVICE_URL	+ '/chequeBounceSettlementWS/getChequeBounceElement.do?',_this.renderChequeBounceElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, renderChequeBounceElements : function(response) {
					showLayer();
					var loadelement			= new Array();
					var baseHtml 			= new $.Deferred();
					loadelement.push(baseHtml);

					generalConfiguration		= response.generalConfiguration;
					moduleId					= response.moduleId;
					
					$("#mainContent").load("/ivcargo/html/module/chequebounce/chequebouncesettlement/chequeBounceSettlement.html",
							function() {
						baseHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						hideLayer();

						masterLangObj 		= FilePath.loadLanguage();
						loadLanguageWithParams(masterLangObj);

						response.executiveTypeWiseBranch	= true;

						var elementConfiguration	= new Object();

						elementConfiguration.branchElement		= $('#branchEle');

						response.elementConfiguration	= elementConfiguration;

						Selection.setSelectionToGetData(response);
						myNod = nod();
						myNod.configure({
							parentClass:'validation-message'
						});
						
						myNod.add({
							selector		: '#numberEle',
							validate		: 'presence',
							errorMessage	: 'Enter Number !'
						});
						
						myNod.add({
							selector		: '#searchType',
							validate		: 'presence',
							errorMessage	: 'Select Type !'
						});

						$("#findBtn").click(function() {
							myNod.performCheck();
							
							if(myNod.areAll('valid'))
								_this.chequeBounceDetails();
						});
						
						$("#searchType").change (function(){
							chequeBounceArrCount = [];
							tempChequeBounceArrCount = [];
							initialiseFocus();
							_this.showHideBranchSelection();
							$('#numberEle').val('');
							$('#chequeBounceSelection input[type="text"]').val('');
							refreshAndHidePartOfPage('middle-border-boxshadow', 'hide');
							refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
							refreshAndHidePartOfPage('chequeBounceDetailsBtn', 'hide');
							$('#chequeBounceDetailsTable1 tbody').empty();
							$('#reportTable tbody').empty();
						});
						
						var bankPaymentOperationModel		= new $.Deferred();	//
						
						if(generalConfiguration.BankPaymentOperationRequired || generalConfiguration.BankPaymentOperationRequired == 'true' ){
							$("#bankPaymentOperationPanel").load("/ivcargo/html/module/paymentTypeSelection/paymentTypeSelection.html",function() {
								bankPaymentOperationModel.resolve();
							});

							loadelement.push(bankPaymentOperationModel);

							$.when.apply($, loadelement).done(function(){
								setIssueBankAutocomplete();
								setAccountNoAutocomplete();
							}).fail(function() {
								console.log("Some error occured");
							});
							
							$("#viewAddedPaymentDetailsCreate").css("display", "block");
						}
					});
				}, chequeBounceDetails : function() {
					showLayer();
					var jsonObject = new Object();

					var numberEle					= $('#numberEle').val();
					jsonObject["number"]			= numberEle.replace(/\s+/g, "");
					
					jsonObject["searchType"] 		= $('#searchType').val();
					jsonObject["branchId"] 			= $('#branchEle_primary_key').val();
					
					getJSON(jsonObject, WEB_SERVICE_URL+'/chequeBounceSettlementWS/getchequeBounceDetails.do?', _this.setChequeBounceDetailsResponse, EXECUTE_WITH_ERROR);
				}, setChequeBounceDetailsResponse : function(response){
					hideLayer();
					chequeBounceDetailsList			= response.chequeBounceDetailsList;
					var paymentTypeArr				= response.paymentTypeArr;
					var paymentStatusArr			= response.paymentStatusArr;
					ModuleIdentifierConstant 		= response.ModuleIdentifierConstant;
					PaymentTypeConstant 			= response.PaymentTypeConstant;
					incomeExpenseModuleId			= response.incomeExpenseModuleId;
					minDate							= response.minDate;
					var columnArray					= new Array();
					var searchType					= $('#searchType').val();
					
					if(response.message != undefined) {
						hideLayer();
						refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('middle-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('chequeBounceDetailsBtn', 'hide');

						return;
					}
					
					setTimeout(function() { 
						$("#chequeBounceDetailsBtn").css('display','block');
					}, 500);
					
					$("#chequeBounceDetailsBtn").css('display','block');
					$("#chequeBounceDetailsBtn").removeClass('hide');
					
					showPartOfPage('bottom-border-boxshadow');
					showPartOfPage('chequeBounceDetailsBtn');
					
					if(chequeBounceDetailsList.length > 0) {
						$("#bottom-border-boxshadow").removeClass('hide');
						$("#middle-border-boxshadow").removeClass('hide');
						$("#chequeBounceSummaryTableDiv").removeClass('hide');
					}

					$("#chequeBounceDetailsBtn").bind("click", function() {
						$('#middle-border-boxshadow').toggle(1000);
					});
					
					for (var i = 0; i < chequeBounceDetailsList.length; i++) {
						var obj			= chequeBounceDetailsList[i];
						var billId		= obj.billId;
						
						if(isValueExistInArray(tempChequeBounceArrCount, billId)) {
							if(searchType == BILL_PAYMENT)
								showMessage('info', 'Bill No Already Added, Please Reload (F5) !');
							else
								showMessage('info', 'LR No Already Added, Please Reload (F5) !');
							
							return false;
						}
					}
					
					_this.setChequeBounceDetails(chequeBounceDetailsList);
					
					if(generalConfiguration.BankPaymentOperationRequired == false || generalConfiguration.BankPaymentOperationRequired == 'false')
						$("#viewAddedPaymentDetailsCreate").addClass('hide');
					else
						$("#viewAddedPaymentDetailsCreate").removeClass('hide');
					
					for (var i = 0; i < chequeBounceDetailsList.length; i++) {
						var obj		= chequeBounceDetailsList[i];
						var billId 	= obj.billId;
						
						if(isValueExistInArray(chequeBounceArrCount, billId))
							continue;
						
						chequeBounceArrCount.push(billId);
						
						columnArray.push("<td><input type='checkbox' id='singleCheckBox_" + obj.billId + "'style='align: -moz-center'; name='singleCheckBox' style='width:  1px'; class='form-control singleCheckBox' value='" + obj.billId + "'/></td>");
						columnArray.push("<td><input type='text' id='wayBillNumber_"+obj.billId + "'style='align: -moz-center'; name='wayBillNumber' class='form-control' value='"+obj.wayBillNumber + "' style='width:  130px; text-align: center;' onkeypress='return noNumbers(event);' readonly='readonly' /></td> ");
						columnArray.push("<td class='hide'><input type='hidden' id='creationDateTime_"+obj.billId+"' name='creationDateTime' value='" + obj.creationDateTime + "' maxlength='7' class='form-control' style='width: 130px; text-align: right;' onkeypress='return noNumbers(event);' readonly='readonly'/></td>");
						columnArray.push("<td class='hide'><input type='hidden' id='sourceBranchId_"+obj.billId+"' name='sourceBranchId' value='" + obj.sourceBranchId + "' class='form-control' style='width: 130px; text-align: right;' onkeypress='return noNumbers(event);' readonly='readonly'/></td>");
						columnArray.push("<td class='hide'><input type='hidden' id='destinationBranchId_"+obj.billId+"' name='destinationBranchId' value='" + obj.destinationBranchId + "'  class='form-control' style='width: 130px; text-align: right;' onkeypress='return noNumbers(event);' readonly='readonly'/></td>");
						columnArray.push("<td class='hide'><input type='hidden' id='branchId_"+obj.billId+"' name='branchId' value='" + obj.branchId + "'  class='form-control' style='width: 130px; text-align: right;' onkeypress='return noNumbers(event);' readonly='readonly'/></td>");
						columnArray.push("<td><input type='text' id='partyName_"+obj.billId + "' style='align: -moz-center'; name='wayBillNumber' class='form-control' value='"+obj.partyName + "' style='width:  150px; text-align: center;' onkeypress='return noNumbers(event);' readonly='readonly' /></td> ");
						columnArray.push("<td><input type='text' id='chequeAmount_"+obj.billId+"' style='align: -moz-center'; name='chequeAmount' value='"+ obj.chequeAmount + "' class='form-control' maxlength='7'  style='width:  110px; text-align: right;' onkeypress='return noNumbers(event);' readonly='readonly'/></td>");
						columnArray.push("<td><input type='text' id='bankCharges_"+obj.billId+"' onkeypress='return allowOnlyNumeric(event);' style='align: -moz-center'; name='bankCharges' class='form-control' maxlength='7'  style='width:  110px; text-align: right;'/></td>");
						columnArray.push("<td class='paymentModeSelection'><select style='' name='paymentMode' id='paymentMode_"+obj.billId+"' class='form-control width-100px' onchange='onPaymentModeSelect("+obj.billId+",this)'onfocus='' ></select></td>");
						columnArray.push('<td id="ChequeBlockInnerTblCLs_'+obj.billId+'"class= "ChequeBlockInnerTblCLs"><input align="right" style="display :none;" name="chequeNoInnerTbl_' + billId + '" id="chequeNoInnerTbl_' + billId + '" type="text" class = "form-control ChequeInnerTblClass" placeholder="Cheque No/ Txn. ID" /></br><input align="right" name="chequeDateInnerTbl_' + billId + '" id="chequeDateInnerTbl_' + billId + '" placeholder="Cheque Date" type="text" onkeyup="setMonthYear(this);" onkeypress="return noNumbers(event);if(event.altKey==1){return false;}"; style="display :none;" class = "chequeDate form-control ChequeDateInnerTblClass" readonly="readonly" /></br><input align="right" name="bankNameInnerTbl_' + billId+'" id="bankNameInnerTbl_' + billId + '" type="text" style="display :none;text-transform: uppercase;" class = "form-control bankNameInnerTblClass" placeholder="Bank Name" /></td>');
						columnArray.push("<td><input type='text' id='date_"+obj.billId+"' name='date' placeholder='Date' value='' class='form-control backDate' placeholder='Date' onkeyup='setMonthYear(this);' readonly='readonly' /></td>");
						columnArray.push("<td><input type='text' id='remark_"+obj.billId+"'style='align: -moz-center'; name='remark' placeholder='Remark' class='form-control' style='width: 100px; text-transform: uppercase;' maxlength='250'></input></td>");
						
						$('#reportTable tbody').append("<tr id=billDetails'"+obj.billId+"'>" + columnArray.join(' ') + '</tr>');
						columnArray	= [];
						
						$('#paymentType_' + obj.billId).append($("<option>").attr('value', 0).text("-- Please Select--"));
						
						$(paymentStatusArr).each(function() {
							$('#paymentType_' + obj.billId).append($("<option>").attr('value', this.paymentStatusId).text(this.paymentStatusName));
						});
						
						$('#paymentMode_' + obj.billId).append($("<option>").attr('value', 0).text("-- Please Select--"));
						
						$(paymentTypeArr).each(function() {
							$('#paymentMode_' + obj.billId).append($("<option>").attr('value', this.paymentTypeId).text(this.paymentTypeName));
						});
					}
					
					$(function() {
						$('.backDate').val(dateWithDateFormatForCalender(curDate, "-"));
						$('.backDate').datepicker({
							maxDate		: curDate,
							minDate		: minDate,
							showAnim	: "fold",
							dateFormat	: 'dd-mm-yy'
						});
					});
					
					$(function() {
						$('.chequeDate').val(dateWithDateFormatForCalender(curDate, "-"));
						$('.chequeDate').datepicker({
							maxDate		: curDate,
							//minDate		: minDate,
							showAnim	: "fold",
							dateFormat	: 'dd-mm-yy'
						});
					});
					
					$('#selectAll').bind("click", function() {
						_this.selectAllCheckBox(this.checked);
					});
					
					$("#btSubmit").click(function() {
						_this.submitData();
					});

					hideLayer();
				}, getBillIdWiseData : function(checkBoxArray) {
					var totalBillArr		= new Array();

					for(var i = 0; i < checkBoxArray.length; i++) {
						var billId				= checkBoxArray[i];
						var billDetailsObj		= new Object();

						billDetailsObj.type						= $('#searchType').val();
						billDetailsObj.billId					= billId;
						billDetailsObj.sourceBranchId			= $('#sourceBranchId_' + billId).val();
						billDetailsObj.corporateAccountId		= $('#corporateAccountId_' + billId).val();
						billDetailsObj.chequeNumber				= $('#chequeNumber_' + billId).val();
						billDetailsObj.chequeAmount				= $('#chequeAmount_' + billId).val();
						billDetailsObj.bankCharges				= $('#bankCharges_' + billId).val();
						billDetailsObj.amount					= $('#amount_' + billId).val();
						billDetailsObj.balanceAmount			= $('#balanceAmount_' + billId).val();
						billDetailsObj.remark					= $('#remark_' + billId).val();
						billDetailsObj.paymentType				= $('#paymentType_' + billId).val();
						billDetailsObj.paymentMode				= $('#paymentMode_' + billId).val();
						billDetailsObj.chequeNumber				= $('#chequeNoInnerTbl_' + billId).val();
						billDetailsObj.chequeDate				= $('#chequeDateInnerTbl_' + billId).val();
						billDetailsObj.bankName					= $('#bankNameInnerTbl_' + billId).val();
						billDetailsObj.settlementDate			= $('#date_' + billId).val();
						billDetailsObj.wayBillNumber			= $('#wayBillNumber_' + billId).val();
						billDetailsObj.destinationBranchId		= $('#destinationBranchId_' + billId).val();
						billDetailsObj.branchId					= $('#branchId_' + billId).val();
						
						if($('#searchType').val() == 12)
							billDetailsObj.billClearnceId		= $('#billId_' + billId).val();
						
						totalBillArr.push(billDetailsObj);
					}

					return totalBillArr;
				}, submitData : function() {
					var checkBoxArray	= getAllCheckBoxSelectValue('singleCheckBox');
					
					if(checkBoxArray.length == 0) {
						showMessage('error', 'Please Select At least One LR!');
						hideLayer();
						return;
					}
					
					for(var i = 0; i < checkBoxArray.length; i++) {
						var billId			= checkBoxArray[i];
						
						if(!validateInputTextFeild(1, 'amount_' + billId, 'amount_' + billId, 'error', amountEnterErrMsg))
							return false;

						if($('#paymentMode_' + billId).val() == 0) {
							$("#paymentMode_" + billId).focus();
							showMessage('error', ' Please Select Payment Type');
							return false
						}
						
						if(generalConfiguration.BankPaymentOperationRequired == false || generalConfiguration.BankPaymentOperationRequired == 'false') {
							var payMode 	= $("#paymentMode_" + billId + " option:selected").val();
							
							if(payMode == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID || payMode == PaymentTypeConstant.PAYMENT_TYPE_ONLINE_RTGS_ID || payMode == PaymentTypeConstant.PAYMENT_TYPE_ONLINE_NEFT_ID) {
								var chequeNumber		= $("#chequeNoInnerTbl_" + billId).val();
								
								if(chequeNumber == '') {
									showMessage('error', selectChecqueNoOrTXNNoErrMsg);
									$("#chequeNoInnerTbl_" + billId).focus();
									changeError($("#chequeNoInnerTbl_" + billId), '0', '0');
									return false;
								} 
								
								var chequedate		= $("#chequeDateInnerTbl_" + billId).val();
								
								if(chequedate == "") {
									showMessage('error', dateErrMsg);
									$("#chequeDateInnerTbl_" + billId).focus();
									changeError($("#chequeDateInnerTbl_" + billId), '0', '0');
									return false;
								}
								
								var bankName	= $("#bankNameInnerTbl_" + billId).val();
								
								if(bankName == "") {
									showMessage('error', bankNameErrMsg);
									$("#bankNameInnerTbl_" + billId).focus();
									changeError($("#bankNameInnerTbl_" + billId), '0', '0');
									return false;
								}
							}
						}
						
						var date				= $("#date_" + billId).val();
						var billCreationDate	= Number($("#creationDateTime_" + billId).val());
						
						if(date != '' && date != undefined && date != "undefined") {
							var dateParts				= date.split('-');
							var currentDate 			= new Date();
							var newBillCreationDate 	= new Date(billCreationDate);
							var billPaymentDate 		= new Date(dateParts[2], dateParts[1] - 1, dateParts[0], currentDate.getHours(), currentDate.getMinutes(), currentDate.getSeconds(), currentDate.getMilliseconds());
							
							if(newBillCreationDate != undefined && newBillCreationDate != "undefined")
								newBillCreationDate.setHours(0, 0, 0, 0);
							
							if(billPaymentDate.getTime() <= newBillCreationDate.getTime()) {
								showMessage('error', "Back Date Should Not Be Less Than Bill Creation Date ");
								$("#date_" + billId).css('border-color', 'red');
								return false;
							} else
								$("#date_" + billId).css('border-color', 'gray');
						}
					}
					
					setTimeout(function() {
						var jsonObject			= new Object();
						jsonObject["type"]					= $('#searchType').val();
						jsonObject["BillDataArr"]			= JSON.stringify(_this.getBillIdWiseData(checkBoxArray));
						jsonObject.billIds					= checkBoxArray.join(',');
							
						var rowCount 		= $('#storedPaymentDetails tr').length;

						if(!$('#storedPaymentDetails').is(':empty') && rowCount > 0) {
							var paymentCheckBoxArr		= getAllCheckBoxSelectValue('paymentCheckBox');
							jsonObject.paymentValues	= paymentCheckBoxArr.join(',');
						}
							
						if(!doneTheStuff) {
							doneTheStuff = true;
							var btModalConfirm = new Backbone.BootstrapModal({
								content		: 	'Are you sure you want to Save ?',
								modalWidth 	: 	30,
								title		:	'Save Cheque Bounce Settlement',
								okText		:	'YES',
								showFooter 	: 	true,
								okCloses	:	true
							}).open();
								
							btModalConfirm.on('ok', function() {
								getJSON(jsonObject, WEB_SERVICE_URL+'/chequeBounceSettlementWS/settleChequeBounceDetails.do?', _this.responseAfter, EXECUTE_WITH_ERROR);
									
								doneTheStuff = false;
								btModalConfirm.close();
								showLayer();
							});
								
							btModalConfirm.on('cancel', function() {
								doneTheStuff = false;
							});
						}
					},100);
				}, responseAfter : function(response) {
					hideLayer();
					
					if(response.message != undefined) {
						var errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					}
					
					$("#chequeBounceDetailsBtn").addClass('hide');
					$("#middle-border-boxshadow").addClass('hide');
					$("#bottom-border-boxshadow").addClass('hide');
					$("#searchBy").addClass('hide');
					
					$("#bottom-border-boxshadow").css("display", "none");
					$('#bottom-border-boxshadow').addClass('hide');
					
					$("#searchType").val(0);
					$('#chequeBounceSelection input[type="text"]').val('');
					$('#chequeBounceDetailsTable1 tbody').empty();
					
					$("#selectAll").prop("checked", false);
					chequeBounceArrCount 		= new Array();
					tempChequeBounceArrCount 	= new Array();
				}, selectAllCheckBox : function(param) {
					var table 		 	= document.getElementById('reportTable');
						
					for(var row = 1 ; row < table.rows.length; row++) {
						if(table.rows[row].cells[0].firstChild != null)
							table.rows[row].cells[0].firstChild.checked = param;
					}
				}, setChequeBounceDetails : function(chequeBounceDetailsList) {
					var columnArray				= new Array();
					var searchType				= $('#searchType').val();

					for (var i = 0; i < chequeBounceDetailsList.length; i++) {
						var obj			= chequeBounceDetailsList[i];
						var billId		= obj.billId;
						
						if(searchType == ModuleIdentifierConstant.GENERATE_CR)
							$('.moduleWiseNumber').html('CR No');
						else if(searchType == ModuleIdentifierConstant.BOOKING || moduleId == ModuleIdentifierConstant.SHORT_CREDIT_PAYMENT)
							$('.moduleWiseNumber').html('LR No');
						else if(searchType == ModuleIdentifierConstant.BILL_PAYMENT)
							$(".moduleWiseNumber").html('Bill No');
						
						tempChequeBounceArrCount.push(billId);
						
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.wayBillNumber + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.sourceBranchName + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.partyName + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.chequeDateString + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.chequeNumber + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.chequeAmount + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.bankName + "</td>");
						
						$('#chequeBounceDetailsTable1 tbody').append('<tr>' + columnArray.join(' ') + '</tr>');

						columnArray	= [];
					}
				}, validateReceiveAmount : function(obj) {
					if(Number($('#chequeAmount_' + obj.billId).val()) == Number($('#balanceAmount1_' + obj.billId).val())) {
						if(parseInt($('#amount_' + obj.billId).val()) > parseInt($('#chequeAmount_' + obj.billId).val())) {
							showMessage('info', 'You can not enter greater value than ' + Number($('#chequeAmount_' + obj.billId).val()));
							return false;
						}

						$('#balanceAmount_' + obj.billId).val(Number($('#chequeAmount_' + obj.billId).val()) - Number($('#amount_' + obj.billId).val()));
					} else if(Number($('#chequeAmount_' + obj.billId).val()) > Number($('#balanceAmount1_' + obj.billId).val())) {
						if(Number($('#amount_' + obj.billId).val()) > Number($('#balanceAmount1_' + obj.billId).val())) {
							showMessage('info', 'You can not enter greater value than ' + Number($('#balanceAmount1_' + obj.billId).val()));
							return false;
						}

						$('#balanceAmount_' + obj.billId).val(Number($('#balanceAmount1_' + obj.billId).val()) - Number($('#amount_' + obj.billId).val()));
					}
				}, showHideBranchSelection : function(){
					var searchType	= $('#searchType').val();
					
					if(searchType == 6)
						$("*[data-attribute='branch']").hide();
					else
						$("*[data-attribute='branch']").show();
				}
			});
		});
		
function onPaymentModeSelect(billId,obj){
	if(generalConfiguration.BankPaymentOperationRequired == true || generalConfiguration.BankPaymentOperationRequired == 'true'){
		$('#uniqueWayBillId').val(billId);
		$('#uniqueWayBillNumber').val($('#wayBillNumber_' + billId).val());
		$('#uniquePaymentType').val($('#paymentMode_' + billId).val());
		$('#uniquePaymentTypeName').val($("#paymentMode_" + billId + " option:selected").text());
		
		hideShowBankPaymentTypeOptions(obj);
	} else if($("#paymentMode_" + billId + " option:selected").val() == PaymentTypeConstant.PAYMENT_TYPE_CHEQUE_ID 
			|| $("#paymentMode_" + billId + " option:selected").val() == PaymentTypeConstant.PAYMENT_TYPE_ONLINE_RTGS_ID 
			|| $("#paymentMode_" + billId + " option:selected").val() == PaymentTypeConstant.PAYMENT_TYPE_ONLINE_NEFT_ID){
		$("#chequeDateInnerTbl_" + billId).show();
		$("#bankNameInnerTbl_" + billId).show();
		$("#chequeNoInnerTbl_" + billId).show();
	} else {
		$("#chequeDateInnerTbl_" + billId).hide();
		$("#bankNameInnerTbl_" + billId).hide();
		$("#chequeNoInnerTbl_" + billId).hide();
	}
}

function onPaymentTypeSelect(billId, obj) {
	if($("#paymentType_" + billId + " option:selected").val() == PaymentTypeConstant.PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID) {
		$("#balanceAmount_" + billId).val(0);
		$("#amount_" + billId).val($("#chequeAmount_" + billId).val());
	} else {
		$("#balanceAmount_" + billId).val($("#chequeAmount_" + billId).val());
		$("#amount_" + billId).val(0);
	}
}