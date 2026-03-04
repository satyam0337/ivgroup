/**
 * 
 */

var PaymentTypeConstant							= null;
var bankPaymentOperationRequired				= false;
var ModuleIdentifierConstant					= null;
var moduleId									= 0;
var incomeExpenseModuleId						= 0;
var bankAccountNotMandatory						= false;
var toBankAccountAutocomplete					= false;
var transferType								= 0;
var GeneralConfiguration						= null;
var singleBranchId								= 0;
var branchName									= '';
var fundTransferProperty						= null;
var executiveBranchId							= 0;
var paymentTypeArr								= null;
var ALLOW_BACK_DATE_IN_FUND_TRANSFER			= false;
var TOKEN_KEY									= null;
var TOKEN_VALUE									= null;
var previousDate								= null;
var accountGroupDataList						= null;
var fundTransferId1								= 0;
var allowGroupToGroupFundTransfer				= false;
var isBlockSameRegionFundTransferAndReceive = false;
var regionsToBlockSameRegionFundTransferAndReceive = "";


var regionId = 0;
let selectedBranchData = {}; 

function loadFundTransferPaymentDetails() {
	showLayer();
	let jsonObject		= new Object();

	$.ajax({
				type		:	"POST",
				url			:	WEB_SERVICE_URL + '/fundTransferWS/getFundTransferInitialDetails.do',
				data		:	jsonObject,
				dataType	:	'json',
				success		:	function(data) {
					if(data.message != undefined) {
						let errorMessage = data.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						hideLayer();
						return;
					}
					
					if(typeof createVideoLink != 'undefined') createVideoLink(data);
					
					jsondata							= data;
					PaymentTypeConstant					= data.PaymentTypeConstant;
					bankPaymentOperationRequired		= data.BankPaymentOperationRequired;
					ModuleIdentifierConstant			= data.ModuleIdentifierConstant;
					moduleId							= data.moduleId;
					incomeExpenseModuleId				= data.incomeExpenseModuleId;
					GeneralConfiguration				= data.GeneralConfiguration;
					singleBranchId						= data.defaultBranchId;
					executiveBranchId					= data.executiveBranchId;
					regionId								= data.regionId;
					branchName							= data.branchName;
					fundTransferProperty				= data.fundTransferProperty;
					paymentTypeArr						= data.paymentTypeArr;
					bankAccountNotMandatory				= data.bankAccountNotMandatory;
					toBankAccountAutocomplete			= data.toBankAccountNumberAutocomplete;
					ALLOW_BACK_DATE_IN_FUND_TRANSFER	= data.ALLOW_BACK_DATE_IN_FUND_TRANSFER;
					TOKEN_KEY							= data.TOKEN_KEY;
					TOKEN_VALUE							= data.TOKEN_VALUE;
					previousDate						= data.previousDate;
					accountGroupDataList				= data.accountGroupDataList;
					allowGroupToGroupFundTransfer		= data.allowGroupToGroupFundTransfer;
					isBlockSameRegionFundTransferAndReceive 	   = data.isBlockSameRegionFundTransferAndReceive;
					regionsToBlockSameRegionFundTransferAndReceive = data.regionsToBlockSameRegionFundTransferAndReceive ;
					
					if(bankPaymentOperationRequired) {
						$("#bankPaymentOperationPanel").load( "/ivcargo/html/module/paymentTypeSelection/paymentTypeSelection.html", function() {
							setIssueBankAutocomplete();
							setAccountNoAutocomplete();
						
							$('#bankAccountId').val(0);
							
							if(toBankAccountAutocomplete)
								setReceivingAccountNoAutocomplete();
							
							if(data.toBankAccountNameAutocomplete)
								setReceivingBankAutocomplete();
								
							let issueBankAuto			= Object();
	
							issueBankAuto.url			= WEB_SERVICE_URL+'/autoCompleteWS/getBankAccountAutocomplete.do';
							issueBankAuto.primary_key	= 'bankAccountId';
							issueBankAuto.field			= 'bankAccountNumber';
							issueBankAuto.callBack		= callBackBank;
							issueBankAuto.keyupFunction = callBackBank;
							issueBankAuto.blurFunction	= callBackBank;
							$("#accountNumber").autocompleteCustom(issueBankAuto);

							function callBackBank() {
								$('#bankAccountId').val($('#accountNumber_primary_key').val());
							}
							
							$('#viewAddedPaymentDetailsDiv').removeClass('hide');
						});
						
						if(paymentTypeArr != undefined)
							setPaymentType(paymentTypeArr);
					} else {
						setPaymentTypeCash();
						
						$('#chequeDate').val(dateWithDateFormatForCalender(new Date(),"-"));
						$('#chequeDate').datepicker({
							maxDate		: new Date(),
							showAnim	: "fold",
							dateFormat	: 'dd-mm-yy'
						});
					}
					
					if(fundTransferProperty.showButtonForUserCashReport)
						$('#viewButtonForUserCashReport').removeClass('hide');
					else
						$('#viewButtonForUserCashReport').remove();
						
					if(ALLOW_BACK_DATE_IN_FUND_TRANSFER) {
						$('#backDateDiv').removeClass('hide');
						
						$( function() {
							$('#fromDate').datepicker({
								minDate		: previousDate,
								maxDate		: new Date(curDate),
								showAnim	: "fold",
								dateFormat	: 'dd-mm-yy'
							});
						});
					} else
						$('#backDateDiv').remove();
						
					$('#toBranchId').val(singleBranchId);
					
					if(singleBranchId > 0) {
						$('#searchBranch').val(branchName);
						$('.searchBranch').remove();
					} else {
						$('.searchBranchDefault').remove();
					}
					
					setFundTransferTypeList(data.fundTransferTypeList);
					if(allowGroupToGroupFundTransfer){
						$('#transferFromGroupDiv').removeClass('hide');
						setTransferToGroupList(accountGroupDataList)
					}else
						$('#transferFromGroupDiv').addClass('hide');
					
					if(!allowGroupToGroupFundTransfer)
						setDestBranchOption(executiveBranchId);
						
					setBranchUserSelection();
					setBankSelection();
					
					$("#transferType").bind("change keyup", function() {
						enableSearch();
						resetError(this);
						toogleElement('msg','none');
						enablePaymentMode(this);
						showHideBranch(this);
						showHideUser(this);
					});
					
					$("#userCashReport").bind("click", function() {
						openUserCashReport();
					});
					
					$("#paymentMode").bind("change", function() {
						removeError(this.id); toogleElement('error','none');
						showHideChequeDetails(this);
					});
					
					$("#saveButton").bind("click", function() {
						
						var tobranchid = $('#toBranchId').val();
						let toRegionId   = selectedBranchData.regionId || 0;

						if(isBlockSameRegionFundTransferAndReceive && regionId == toRegionId && regionsToBlockSameRegionFundTransferAndReceive.split(",").includes(regionId.toString())){
							showMessage('error','Fund cannot be transferred to a branch in the same region !');
							return false;
						}
						
					

						transferPayment();
					});
					
					$("#viewAddedPaymentDetails").bind("click", function() {
						openAddedPaymentTypeModel();
					});

					$("#transferToGroup").bind("change", function() {
						getBranchesByGroupId();
					});
					
					hideLayer();
				}
			});
}

function setFundTransferTypeList(fundTransferTypeList) {
	$('#transferType').find('option').remove().end();
	
	$('#transferType').append('<option value="' + 0 + '" id="' + 0 + '">-- Transfer To --</option>');
	
	if(!jQuery.isEmptyObject(fundTransferTypeList)) {
		for(let i = 0; i < fundTransferTypeList.length; i++) {
			$('#transferType').append('<option value="' + fundTransferTypeList[i].fundTransferTypeId + '" id="' + fundTransferTypeList[i].fundTransferTypeId + '">' + fundTransferTypeList[i].fundTransferTypeName + '</option>');
		}
	}	
}

function setTransferToGroupList(accountGroupDataList) {
	
	$('#transferToGroup').find('option').remove().end();
	$('#transferToGroup').append('<option value="' + 0 + '" id="' + 0 + '">-- Transfer To Group --</option>');
	
	if(!jQuery.isEmptyObject(accountGroupDataList))
		for(const element of accountGroupDataList)
			$('#transferToGroup').append('<option value="' + element.accountGroupId + '" id="' + element.accountGroupId + '">' + element.accountGroupName + '</option>');
}

function getBranchesByGroupId(){
	let transferToGroup = Number($('#transferToGroup').val());
	$('#searchBranch').val('');
	$('#toBranchId').val(0);
	$('#transferToAccountGroupId').val(0);
	$('#accountGroupServerIdentifier').val(0);
	if(transferToGroup > 0)
		setDestBranchOption(executiveBranchId);
}

function showHideChequeDetails(obj) {
	transferType = $("#transferType").val();
	
	if(bankPaymentOperationRequired) {
		if(obj.value != PAYMENT_TYPE_CASH_ID && obj.value != PAYMENT_TYPE_FUEL_CARD_ID) {
			hideShowBankPaymentTypeOptions(obj);
			$('#viewAddedPaymentDetails').removeClass('hide');
			
			$(".bankAccountSelect").addClass('hide');
			$("#accountNumber").val('');
			$('#accountNumber_primary_key').val(0);
		} else {
			$('#viewAddedPaymentDetails').addClass('hide');
			
			if(transferType == FUND_TRANSFER_TYPE_BANK || transferType == FUND_TRANSFER_TYPE_BANK_TO_BRANCH)
				$(".bankAccountSelect").removeClass('hide');
		}
	} else
		showHideChequeDetail(obj);
}

function setDestBranchOption(loginBranchId) {
	let transferToGroup = Number($('#transferToGroup').val());
	let accountGroupId = '';
	if(transferToGroup > 0){
		accountGroupId = '&accountGroupId=' + transferToGroup;
		$('#transferToAccountGroupId').val(transferToGroup);
	}
		
	if(singleBranchId <= 0) {
	$("#searchBranch").autocomplete({
		source: function (request, response) {
			$.getJSON(WEB_SERVICE_URL+'/autoCompleteWS/getBranchWiseDestinationByNameWithOutDeliveryPlace.do?term=' + request.term + accountGroupId + '&isOwnBranchRequired=true&branchType=3', function (data) {
				response($.map(data.result, function (item) {
				
				if(item.branchId  == loginBranchId && $('#transferType').val() == FUND_TRANSFER_TYPE_BRANCH)
					return;
				else
					return {
						label				: item.branchName,
						value				: item.branchName,
						toBranchId			: item.branchId ,
						toRegionId        	: item.regionId 
					};
				}));
			});
		}, select: function (e, u) {
			$('#toBranchId').val(u.item.toBranchId);
		},
		minLength	: 2,
		delay		: 20,
		autoFocus	: true
	});
  }
}

function setBranchUserSelection() {
	$("#searchUser").autocomplete({
		source: function (request, response) {
			$.getJSON(WEB_SERVICE_URL+'/autoCompleteWS/getExecutiveByBranch.do?term=' + request.term , function (data) {
				response($.map(data.result, function (item) {
					return {
						label				: item.executiveName,
						value				: item.executiveName,
						toUserId			: item.executiveId
					};
				}));
			});
		}, select: function (e, u) {
			$('#toUserId').val(u.item.toUserId);
		},
		minLength	: 2,
		delay		: 20,
		autoFocus	: true
	});
}

function setBankSelection() {
	$("#searchBank").autocomplete({
		source: function (request, response) {
			$.getJSON(WEB_SERVICE_URL+'/autoCompleteWS/getBankNameAutocomplete.do?term=' + request.term , function (data) {
				response($.map(data.result, function (item) {
					return {
						label			: item.bankName,
						value			: item.bankName,
						bankId			: item.bankId
					};
				}));
			});
		}, select: function (e, u) {
			$('#bankNameId').val(u.item.bankId);
		},
		minLength	: 2,
		delay		: 20,
		autoFocus	: true
	});
}

function transferPayment() {
	if(formValidation()) {
		document.FundTransferForm.filter.value = 1;
		document.FundTransferForm.status.value = FUNDTRANSFER_STATUS_TRANSFERING;
		document.FundTransferForm.token.value = TOKEN_VALUE;

		if($('#transferType').val() == FUND_TRANSFER_TYPE_BANK)
			$('#toBranchId').val(0);
	
		if($('#accountNumber').exists() && $('#accountNumber').is(":visible")) {
			if($('#accountNumber').val() == '') {
				showMessage('error','Please select account number!');
				hideLayer();
				$('#accountNumber').focus();
				return false;
			}
		
			let bankAccountId = $('#bankAccountId').val();
			
			if(bankAccountId == '' || bankAccountId == 0) {
				showMessage('error','Please Select Proper Bank Account Number !');
				hideLayer();
				$('#accountNumber').focus();
				return false;
			}
		}
	
		if(bankPaymentOperationRequired && $('#paymentMode').exists() && isValidPaymentMode($('#paymentMode').val())) {//Defined in paymentTypeSelection.js
			let trCount = $("#storedPaymentDetails	tr").length;
				
			if(trCount == 0) {
				showMessage('error','Please, Add Payment details for this Fund Transfer !');
				hideLayer();
				return false;
			}	
		}
	
		if (confirm('Are you sure you want to Transfer Amout ?')) {
//			disableButtons();
			//Disable page
			showLayer();
			//document.FundTransferForm.submit();
			fundTransferByNewFlow();
		}
	}
}

function disableButtons() {
	let saveButton		= document.getElementById("saveButton");
	
	if(saveButton != null) {
		saveButton.className	= 'btn_print_disabled';
		saveButton.disabled		= true;
		saveButton.style.display ='none';
	};
}

function resetError(el) {
	toogleElement('error','none');
	removeError(el.id);
};

function enableSearch() {
	  resetSearch();
	  enableReadonly();
	  
	if ($('#transferType').val() >= 1) {
		document.FundTransferForm.searchBranch.disabled = true;
		document.FundTransferForm.searchBank.disabled	= true;
		
		if ($('#transferType').val() == FUND_TRANSFER_TYPE_BRANCH) {
			if(singleBranchId <= 0)
				document.FundTransferForm.searchBranch.disabled = false;
			
			$('#toBranchId').val(singleBranchId);
			$('#searchBranch').val(branchName);
		} else if ($('#transferType').val() == FUND_TRANSFER_TYPE_BANK)
			document.FundTransferForm.searchBank.disabled = false;
		else if ($('#transferType').val() == FUND_TRANSFER_TYPE_BANK_TO_BANK)
			document.FundTransferForm.searchBank.disabled = false;
	} else {
		$('#searchBranch').val('');
		$('#searchBank').val('');
		document.FundTransferForm.searchBranch.disabled = true;
		document.FundTransferForm.searchBank.disabled = true;
	}

	removeError('searchBranch');
	removeError('searchBank');
}

function openUserCashReport(){
	childwin = window.open('Reports.do?pageId=340&eventId=3&modulename=userCashReport&flag='+true);
}

function resetSearch() {
	if (singleBranchId <= 0)
		$('#searchBranch').val('');
		
	$('#searchBank').val('');
	$('#searchUser').val('');
}

function enableReadonly(){
	if($('#transferType').val() > 0){
		document.getElementById("searchBranch").readOnly = false;
		document.getElementById("searchBank").readOnly = false;
		document.getElementById("searchUser").readOnly = false;
	}
}

function showHideUser(obj) {
	resetSearch();
	resetSelection(obj);
	
	if(obj.value == FUND_TRANSFER_TYPE_USER_TO_USER) {
		document.FundTransferForm.searchUser.disabled = false;
		$('#userSelection').removeClass('hide');
	} else {
		document.FundTransferForm.searchUser.disabled = true;
		$('#userSelection').addClass('hide');
	}
}

function showHideBranch(obj) {
	resetSearch();
	resetSelection(obj);
	
	if(obj.value == FUND_TRANSFER_TYPE_BANK || obj.value == '0') {
		document.FundTransferForm.searchBranch.disabled = true;
		document.FundTransferForm.searchBank.disabled = true;
		$('#toBranchId').val(0);
		$("#branchSelection").addClass('hide');
		
		if(bankPaymentOperationRequired && $('#paymentMode').val() == PAYMENT_TYPE_CASH_ID)
			$(".bankAccountSelect").removeClass('hide');
	} else if(obj.value == FUND_TRANSFER_TYPE_BANK_TO_BANK || obj.value == '0') {
		document.FundTransferForm.searchBranch.disabled = true;
		document.FundTransferForm.searchBank.disabled = true;
		$('#toBranchId').val(0);
		$("#branchSelection").addClass('hide');
		
		if(bankPaymentOperationRequired && $('#paymentMode').val() == PAYMENT_TYPE_CASH_ID)
			$(".bankAccountSelect").addClass('hide');
	}  else if(obj.value == FUND_TRANSFER_TYPE_USER_TO_USER || obj.value == '0'){
		document.FundTransferForm.searchBranch.disabled = true;
		document.FundTransferForm.searchBank.disabled = true;
		$('#toBranchId').val(0);
		$("#branchSelection").addClass('hide');
	}  else if(obj.value == FUND_TRANSFER_TYPE_BANK_TO_BRANCH || obj.value == '0') {
		if(fundTransferProperty.centralizeBankToBranchFundTransfer) {
			document.FundTransferForm.searchBranch.disabled = false;
			document.FundTransferForm.searchBank.disabled = false;
		} else {
			document.FundTransferForm.searchBranch.disabled = true;
			document.FundTransferForm.searchBank.disabled = true;
			$('#toBranchId').val(0);
		}
		
		if(bankPaymentOperationRequired && $('#paymentMode').val() == PAYMENT_TYPE_CASH_ID)
			$(".bankAccountSelect").removeClass('hide');
		
		if(fundTransferProperty.centralizeBankToBranchFundTransfer)
			$("#branchSelection").removeClass('hide');
		else
			$("#branchSelection").addClass('hide');
	} else {
		$("#branchSelection").removeClass('hide');
		
		if(bankPaymentOperationRequired) {
			$(".bankAccountSelect").addClass('hide');
			$("#accountNumber").val('');
			$('#accountNumber_primary_key').val(0);
		}
	}
}

function fillclearText(text,text1) {
	var textValue = text.value;
	if(textValue == '') {
		text.value = text1;
	} else {
		text.value = textValue;
	}
}

function formValidation() {
	if($('#transferToGroup').val() == 0) {
		showMessage('error', selectTransferToGroup);
		toogleElement('error','block');
		changeError1('transferToGroup','0','0');
		return false;
	}
	
	if($('#transferType').val() == 0) {
		showMessage('error',transferToErrMsg);
		toogleElement('error','block');
		changeError1('transferType','0','0');
		return false;
	}
	
	if($('#transferType').val() == FUND_TRANSFER_TYPE_BRANCH) {
		if(!validateElementForBranchAndBank('Branch'))
			return false;
	} else if($('#transferType').val() == FUND_TRANSFER_TYPE_USER_TO_USER) {
		if(!validateElementForUser('User'))
			return false;
	} else if(!bankPaymentOperationRequired && !validateElement('chequeNumber','Cheque Number'))
		return false;
	
	if(!validateElement('paymentMode','Payment Mode')){return false;}
	
	if($('#amount').val() == 0) {
		showMessage('info', amountGTZeroInfoMsg);
		toogleElement('error','block');
		changeError1('amount','0','0');
		return false;
	}
	
	if(fundTransferProperty.centralizeBankToBranchFundTransfer && $('#transferType').val() != FUND_TRANSFER_TYPE_BANK_TO_BRANCH
		&& $('#toBranchId').val() == executiveBranchId) {
		showMessage('info', sourceDestinationBranchNotBeSameInfoMsg);
		toogleElement('error','block');
		return false;
	}
	
	if(ALLOW_BACK_DATE_IN_FUND_TRANSFER) {
		if(!validateElement('fromDate','Date')){return false;}
		let selectedDate	= document.getElementById('fromDate').value;
		let prevDateStr		= previousDate.split("-");
		let prevDate		= new Date(prevDateStr[2], prevDateStr[1] - 1, prevDateStr[0]);
		selectedDate		= new Date(selectedDate.replace( /(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3"));
		
		if(selectedDate.getTime() < prevDate.getTime()) {
			showMessage('info', 'You Can not select Date More Than Back Date Allowed !');
			toogleElement('error','block');
			return false;
		}
	}
	
	if(!validateElement('remark','Remark')){return false;}
	
	return true; 
}

function resetAccountNumber(){
	 $('#bankAccountId').val(0);
 }

function validateElementForBranchAndBank(msg) {
	let place = (/branch/i.test(msg)) ? document.getElementById('searchBranch') : document.getElementById('searchBank');
	
	if(place != null) {
		if (place.length <= 0) {
			showMessage('error',"Please, Enter "+msg+' !');
			toogleElement('error','block');
			changeError1(place.id,'0','0');
			return false;
		} else {
			var bankOrBranch = (/branch/i.test(msg)) ? document.getElementById('toBranchId') : document.getElementById('bankNameId');
	
			if(bankOrBranch.value <= 0 ){
				showMessage('error',"Please, enter valid "+msg+' !');
				toogleElement('error','block');
				place.value='';
				changeError1(place.id,'0','0');
				return false;
			}
	
			toogleElement('error','none');
			removeError(place.id);
		}	
	}
		
	return true;
}

function validateElementForUser(msg) {
	if($('#toUserId').val() <= 0) {
		showMessage('error', "Please, enter valid "+msg+' !');
		toogleElement('error', 'block');
		document.getElementById('toUserId').value='';
		changeError1('toUserId','0','0');
		return false;
	}
	
	return true;
}

function validateElement(id,msg){
	var el = document.getElementById(id);
	var chkValue = 0;

	if($('#paymentMode').val() == PAYMENT_TYPE_CHEQUE_ID) {
		if(el.type == 'text' && el.value == 'Cheque No' ){
			var reg = /\s/g; //Match any white space including space, tab, form-feed, etc. 
			var str = el.value.replace(reg, '');
			chkValue = str.length;
			
			if (chkValue <= 0 || el.value == 'Cheque No') {
				showMessage('error',msg);
				toogleElement('error','block');
				changeError1(id,'0','0');
				return false;
			} else {
				toogleElement('error','none');
				removeError(id);
			}
		}
	}

	if(el.type == 'text' || el.type == 'textarea') {
		var reg = /\s/g; //Match any white space including space, tab, form-feed, etc. 
		var str = el.value.replace(reg, '');
		chkValue = str.length;
		msg = 'Please Enter '+msg+' !';
	} else if(el.type == 'select-one'){
		chkValue = el.value;
		msg = 'Please Select '+msg+' !';
	}

	if (chkValue <= 0) {
		showMessage('error',msg);
		toogleElement('error','block');
		changeError1(id,'0','0');
		return false;
	} else {
		toogleElement('error','none');
		removeError(id);
	}

	return true;
}

function resetSelection(place){
	var bankOrBranch = (/branch/i.test(place.id)) ? document.getElementById('toBranchId') : document.getElementById('bankNameId');

	if(bankOrBranch != null){
		bankOrBranch.value = 0;
		document.getElementById('amount').value = '0';
	} else
		alert('Branch not Found for reset!');

	$('#toUserId').val(0);
}

function showHideChequeDetail(obj) {
	if(!bankPaymentOperationRequired) {
		if(obj.value == PAYMENT_TYPE_CHEQUE_ID) {
			$('#chequeNumber').removeClass('hide');
			$('#chequeDate').removeClass('hide');
		} else {
			$('#chequeNumber').addClass('hide');
			$('#chequeDate').addClass('hide');
		}
	}
}

function setPaymentTypeCash() {
	let obj1 = document.getElementById('paymentMode');
	
	if(obj1 == null) return;
	
	obj1.options.length		= 0;
	obj1.options.length		= 2;
	obj1.options[0].text	= '- Select Mode -';
	obj1.options[0].value	= '0';
	obj1.options[1].text	= PAYMENT_TYPE_CASH_NAME;
	obj1.options[1].value	= PAYMENT_TYPE_CASH_ID;
}

function enablePaymentMode(obj) {
	transferType = obj.value;
	
	if(!bankPaymentOperationRequired) {
		if(transferType == FUND_TRANSFER_TYPE_BRANCH) { 
			setPaymentTypeCash();
			
			$('#chequeNumber').addClass('hide');
			$('#chequeDate').addClass('hide');
		} else {
			let obj1 = document.getElementById('paymentMode');
		
			if(fundTransferProperty.AllowChequePayment) {
				obj1.options.length	= 0;
				obj1.options.length	= 3;
			} else {
				obj1.options.length	= 0;
				obj1.options.length	= 2;
			}
		
			obj1.options[0].text		= '- Select Mode -';
			obj1.options[0].value		= '0';
			obj1.options[1].text		= PAYMENT_TYPE_CASH_NAME;
			obj1.options[1].value		= PAYMENT_TYPE_CASH_ID;
		
			if(fundTransferProperty.AllowChequePayment) {
				obj1.options[2].text	= PAYMENT_TYPE_CHEQUE_NAME;
				obj1.options[2].value	= PAYMENT_TYPE_CHEQUE_ID;
			}
		}
	} else if(paymentTypeArr != null) {
		let newPaymentTypeArr	= paymentTypeArr;
		
		$("#paymentMode").val(0);
		
		if(transferType == FUND_TRANSFER_TYPE_BANK_TO_BANK) {
			newPaymentTypeArr = paymentTypeArr.filter(function (el) {
				return el.paymentTypeId != PAYMENT_TYPE_FUEL_CARD_ID;
			});
		} else if(transferType == FUND_TRANSFER_TYPE_BRANCH) {
			if(fundTransferProperty.allowOnlyCashPaymentModeForBranchToBranch) {
				newPaymentTypeArr = paymentTypeArr.filter(function (el) {
					return el.paymentTypeId == PAYMENT_TYPE_CASH_ID;
				});
			} else {
				newPaymentTypeArr = paymentTypeArr.filter(function (el) {
					return el.paymentTypeId != PAYMENT_TYPE_FUEL_CARD_ID;
				});
			}
		} else if(transferType == FUND_TRANSFER_TYPE_BANK && !fundTransferProperty.allowAllPaymentModeForBranchToBank
			|| transferType == FUND_TRANSFER_TYPE_USER_TO_USER) {
			newPaymentTypeArr = paymentTypeArr.filter(function (el) {
				return el.paymentTypeId == PAYMENT_TYPE_CASH_ID;
			});
		} else if(transferType == FUND_TRANSFER_TYPE_BANK_TO_BRANCH) {
			newPaymentTypeArr = paymentTypeArr.filter(function (el) {
				return el.paymentTypeId == PAYMENT_TYPE_CASH_ID || fundTransferProperty.fuelCardPaymentOperationRequired && el.paymentTypeId == PAYMENT_TYPE_FUEL_CARD_ID;
			});
		}
		
		if(newPaymentTypeArr != null && newPaymentTypeArr != undefined)
			setPaymentType(newPaymentTypeArr);
	 }
}

function setPaymentType(paymentTypeArr) {
	$('#paymentMode').find('option').remove().end();
	
	$('#paymentMode').append('<option value="' + 0 + '" id="' + 0 + '">-- Select Mode --</option>');
	
	if(!jQuery.isEmptyObject(paymentTypeArr)) {
		for(let i = 0; i < paymentTypeArr.length; i++) {
			if(paymentTypeArr[i] != null)
				$('#paymentMode').append('<option value="' + paymentTypeArr[i].paymentTypeId + '" id="' + paymentTypeArr[i].paymentTypeId + '">' + paymentTypeArr[i].paymentTypeName + '</option>');
		}
	}
}

function backToFundTransfer(){
//	document.FundTransferForm.pageId.value="240";
//	document.FundTransferForm.eventId.value="1";
//	document.FundTransferForm.action="FundTransfer.do";
//	document.FundTransferForm.submit();
	location.reload(true);
}

function printFundTransfer(fundTransferId){
	if(fundTransferId <= 0)
		fundTransferId = fundTransferId1;
	newwindow=window.open('FundTransferPrint.do?pageId=340&eventId=10&modulename=fundTranferPrint&masterid='+fundTransferId+'&isReprint=true', 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function fundTransferByNewFlow(){
	let jsonObject		= new Object();
	jsonObject.txnAccountGroupId	= $('#transferToGroup').val();
	jsonObject.toBranchId			= $('#toBranchId').val();
	jsonObject.toUserId				= $('#toUserId').val();
	jsonObject.amount				= $('#amount').val();
	jsonObject.status				= FUNDTRANSFER_STATUS_TRANSFERING
	jsonObject.transferType			= $('#transferType').val();
	jsonObject.paymentMode			= $('#paymentMode').val();
	jsonObject.fromDate				= $('#fromDate').val();
	jsonObject.bankNameId			= $('#bankNameId').val();
	jsonObject.remark				= $('#remark').val();
	jsonObject.paymentCheckBox		= $('#paymentCheckBox').val();
	jsonObject.topaymentCheckBox	= $('#topaymentCheckBox').val();
	jsonObject.accountNumber_primary_key = $('#accountNumber_primary_key').val();
	jsonObject.token				= TOKEN_VALUE;
	
	$.ajax({
		type		:	"POST",
		url			:	WEB_SERVICE_URL + '/fundTransferWS/saveFundTransferData.do',
		data		:	jsonObject,
		dataType	:	'json',
		success		:	function(data) {
			if (data.message != undefined) {
				let errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				hideLayer();
				return;
			}
			disableButtons();
			TOKEN_VALUE	= data.TOKEN_VALUE;
			
			if (data.fundTransferId <= 0) {
				$('#fundTransferPanel').removeClass('hide');
				$('#fundTransferSuccessPanel').addClass('hide');
			} else {
				$('#fundTransferSuccessPanel').removeClass('hide');
				$('#fundTransferPanel').addClass('hide');
				$('#fundTransferNumber').text(data.fundTransferNumber);
							
				if(data.allowFundTranferPrint)
					$('#printButtonId').removeClass('hide');
				else
					$('#printButtonId').addClass('hide');
								
				fundTransferId1 = data.fundTransferId;
			}
			hideLayer();
		}
	});
}
