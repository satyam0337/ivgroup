var branchWisePrepaidAmountList = new Array();
var moduleId=0;
var	ModuleIdentifierConstant 	= null;
var PaymentTypeConstant			= null;
var wayBillId;
var bankPaymentOperationRequired = false;
var branchIdObj = {};
var negotiatePaymentStatusId   = 4;
var	prepaidAmountId	= 0;
var	currentAmount	= 0;
var rechargeNoMap   = {};
var moduleIdentifier = 1;
var GeneralConfiguration          = null;
define([ 'marionette'
	,'JsonUtility'
	,'messageUtility'
	,'/ivcargo/resources/js/generic/urlparameter.js'
	,'jquerylingua'
	,'language'
	,'nodvalidation'
	,'focusnavigation'
	,'autocomplete'
	,'selectizewrapper'
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/branchcommissionmaster/branchCommissionMasterFilepath.js'
	,'/ivcargo/resources/js/module/redirectAfterUpdate.js',
	],
	function(Marionette, JsonUtility, MessageUtility, UrlParameter, jquerylingua, language, NodValidation, FocusNavigation,AutoComplete,Selectizewrapper,Selection,FilePath) {
	'use strict';// this basically give strictness to this specific js
	var jsonObject	= new Object(),
	myNod,
	_this = '', paymentTypeArr, myNod1, myNod2, myNod3, paymentStatusArrForSelection;
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(masterObj){
			//initialize is the first function called on call new view()
			_this = this;
		}, render : function() {
			_this.getIntialData();
			return _this;
		}, getIntialData : function() {
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL + '/PrepaidPendingPaymentAmtWS/getPrepaidAmountPendingAmountDetailsBllIntialDetails.do?', _this.setIntialData, EXECUTE_WITHOUT_ERROR);
		}, setIntialData: function(response) {
			var baseHtml 	= new $.Deferred();
			
			PaymentTypeConstant					= response.PaymentTypeConstant;
			ModuleIdentifierConstant			= response.ModuleIdentifierConstant;
			moduleId							= response.moduleId;
			paymentTypeArr						= response.paymentTypeArr;
			paymentStatusArrForSelection		= response.paymentStatusArrForSelection;
			GeneralConfiguration				= response.GeneralConfiguration;
			bankPaymentOperationRequired        = GeneralConfiguration.BankPaymentOperationRequired;

			var loadelement = new Array();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/prepaidAmountPendingPaymentDetails/prepaidAmountPendingPaymentDetails.html",
					function() {
				baseHtml.resolve();
			});
			
			if(bankPaymentOperationRequired) {
				var paymentHtml	= new $.Deferred();
				
				$("#bankPaymentOperationPanel").load("/ivcargo/html/module/paymentTypeSelection/paymentTypeSelection.html",
					function() {
					paymentHtml.resolve();
				});
	
				loadelement.push(paymentHtml);
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
				
				//$('#prePaidAmountRechargediv').css('display','block');
				$('#prePaidAmountPaymentForEditGetData').show();
				$('#firstScreen').hide();
				
				$("#viewPaymentDetails").click(function() {
					openAddedPaymentTypeModel();
				});
					
				$("#addedPayment").click(function() {
					$("#addedPaymentTypeModal").modal('hide');
				});

				$("#btSubmit").on("click" ,function() {		
					if(moduleIdentifier == 1)
						_this.settlePrepaidAmount();
					else
						_this.editPrepaidPayment();
				});
					
				$("#btSubmitForEditPayment").on("click" ,function() {		
					_this.editPrepaidPayment();
				});
					
				$("#btSubmitForCancelPrepaidRecharge").on("click" ,function() {		
					_this.cancelPrepaidPayment();
				});
					
				$("#btSubmitAll").on("click" ,function() {		
					$('#multiple-middle-border-boxshadow').removeClass('hide');
				});
					
				setIssueBankAutocomplete();
				setAccountNoAutocomplete();
				
				myNod 	= nod();
				myNod1 	= nod();
				myNod2	= nod();
				myNod3	= nod();
			
				myNod.configure({
					parentClass:'validation-message'
				});
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.branchList,
					valueField		:	'branchId',
					labelField		:	'branchName',
					searchField		:	'branchName',
					elementId		:	'branchEle',
					create			: 	false,
					maxItems		: 	1
				});
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.branchList,
					valueField		:	'branchId',
					labelField		:	'branchName',
					searchField		:	'branchName',
					elementId		:	'branchEleForEdit',
					create			: 	false,
					maxItems		: 	1
				});
				
				if(!jQuery.isEmptyObject(response.paymentTypeArr)) {
					Selectizewrapper.setAutocomplete({
						jsonResultList	: 	response.paymentTypeArr,
						valueField		:	'paymentTypeId',
						labelField		:	'paymentTypeName',
						searchField		:	'paymentTypeName',
						elementId		:	'prepaidPaymentType',
						create			: 	false,
						maxItems		: 	1,
						onChange		:   _this.onPaymentTypeTypeSelect
					});
				}
				/*
				$('#prepaidPaymentType').change(function() {
					_this.onPaymentTypeTypeSelect(response);
				});*/
				
				myNod1.add({
					selector: '#agentBranchesEle',
					validate: 'validateAutocomplete:#agentBranchesEle',
					errorMessage: 'Select proper Source Branch !'
				});

				myNod2.add({
					selector: '#rechargeAmountEle',
					validate: 'presence',
					errorMessage: 'Please Enter Amount'
				});

				myNod2.add({
					selector: '#agentBranchPrepaidEle',
					validate: 'validateAutocomplete:#agentBranchPrepaidEle',
					errorMessage: 'Select proper Source Branch !'
				});
				
				myNod3.add({
					selector: '#agentBranchPrepaidEle',
					validate: 'validateAutocomplete:#agentBranchPrepaidEle',
					errorMessage: 'Select proper Source Branch !'
				});

				$('#prePaidAmountRecharge').on('click',function() {
					moduleIdentifier = 2;
					$('#firstScreen').hide();
					$('#prePaidAmountPaymentForEditGetData').show();
					$('#prePaidAmountPayment').css('display','none');
					$('#prePaidAmountRechargediv').css('display','block');
					_this.viewAddBranchWisePrepaidAmount();
				});
				
				$('#add').on('click',function() {
					moduleIdentifier = 1;
					$('#firstScreen').show();
					$('#prePaidAmountPaymentForEditGetData').hide();
					$('#prePaidAmountPayment').css('display','block');
					$('#prePaidAmountRechargediv').css('display','none');
					$('#prePaidAmountPaymentForEdit').addClass('hide');
					$('#reportDetailsTableForEdit thead').empty();
					$('#reportDetailsTableForEdit tbody').empty();
					$('#reportDetailsTableForEdit tfoot').empty();
					//_this.getIntialData();
				});

				$("#saveBtnCA").click(function() {
					myNod2.performCheck();
					
					if(myNod2.areAll('valid')){
						_this.saveBranchWisePrepaidAmount(_this);
					}
				});

				$("#multipleClearanceModel").click(function() {
					openMultipleCLearanceModel();
				});

				$("#imageAdd").click(function() {
					myNod2.performCheck();
					
					if(myNod2.areAll('valid')) {
						if($("#amountToPayEle").val() > 0 && $("#prepaidPaymentType").val() <= 0)
							showMessage('error', "Please select Payment Type first!!!!");	
						else
							_this.addPrepaidAmount(_this);											
					}
				});
				
				$("#imageSub").click(function() {
					myNod2.performCheck();
					
					if(myNod2.areAll('valid')){
						if($("#rechargeAmountEle").val() <= currentAmount )
							_this.subPrepaidAmount(_this);											
						else
							showMessage('error', "Cannot deduct recharge Amount!!!!");	
					}
				});
				
				$("#deleteBtnCA").click(function() {
					myNod3.performCheck();
					
					if(myNod3.areAll('valid')){
						_this.deleteBranchWisePrepaidAmount(_this);											
					}
				});
				
				$("#addPaymentDetails").click(function() {
					_this.getPrepaidAmtSummaryFromRechrageModule();
				});
				
				$("#getPrepaidAmtEdit").click(function() {
					//for Edit Prepaid Recharge Amt
					_this.getPrepaidAmtEditDetails();
				});
			});
			
			return _this;
		}, getPrepaidAmtEditDetails: function() {
			if($('#branchEleForEdit').val() == ''){
				hideLayer();
				showMessage('error', "Please Select Branch");
				return;
			}
			
			var jsonObject = new Object();
			showLayer();
			var branchId = $('#branchEleForEdit').val()
			jsonObject["branchId"]       = branchId;
			getJSON(jsonObject, WEB_SERVICE_URL + "/PrepaidPendingPaymentAmtWS/getPrepaidAmountPendingAmountDetailsForEdit.do?", _this.setDataForEdit, EXECUTE_WITHOUT_ERROR );		
		},setDataForEdit : function(response) {
			//Edit Prepaid Recharge Amt
			setTimeout(function() {
				hideLayer();
				
				var branchWisePrepaidAmountList	= response.prepaidAmountPendingPaymentDetailsList;
				
				if(branchWisePrepaidAmountList == undefined) {
					$('#prePaidAmountPaymentForEdit').addClass('hide');
				} else {
					$('#left-border-boxshadow').hide();
					$('#prePaidAmountPaymentForEdit').removeClass('hide');
					$('#bottom-border-boxshadow').removeClass('hide');
					$('#top-border-boxshadow').removeClass('hide');
					$('#left-border-boxshadow').removeClass('hide');
				}
				
				$('#reportDetailsTableForEdit thead').empty();
				$('#reportDetailsTableForEdit tbody').empty();
				$('#reportDetailsTableForEdit tfoot').empty();
				
				if(branchWisePrepaidAmountList != undefined) {
					var columnHeadSubArray			= new Array();
					var columnArray					= new Array();
	
					columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Sr No.</th>");
					columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Select.</th>");
					columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Recharge No.</th>");
					columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Branch Name.</th>");
					columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Recharge Amt.</th>");
					columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Amount.</th>");
					columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Date.</th>");
					columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Remark.</th>");
	
					$('#reportDetailsTableForEdit thead').append('<tr id="reportDetailsTableHeader" class="text-success text-center">' + columnHeadSubArray.join(' ') + '</tr>');
					
					$("#btSubmitForEditPayment").show();
					
					for(var i = 0; i < branchWisePrepaidAmountList.length; i++) {
						var obj = branchWisePrepaidAmountList[i];
						branchIdObj[obj.prepaidAmountPendingPaymentDetailsId]   = obj.branchId;
						rechargeNoMap[obj.prepaidAmountPendingPaymentDetailsId] = obj.prepaidRechargeNumber;
							
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i + 1) + "</td>");
						columnArray.push("<td><input type='checkbox' id='singleCheckBox" + obj.prepaidAmountPendingPaymentDetailsId + "' name='singleCheckBox' class='form-control singleCheckBox' value='" + obj.prepaidAmountPendingPaymentDetailsId + "'/></td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>" + obj.prepaidRechargeNumber + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>" + obj.branchName + "</td>");
						columnArray.push("<td><input type='text' id='rechargeAmount" + obj.prepaidAmountPendingPaymentDetailsId + "' name='rechargeAmount' value='" + obj.rechargeAmount + "' maxlength='7' class='form-control' style='width: 120px; text-align: right;' onkeypress='return noNumbers(event);' readonly='readonly'/></td>");
						columnArray.push("<td><input type='text' id='amount" + obj.prepaidAmountPendingPaymentDetailsId + "' name='amount' placeholder='Amount' value='' maxlength='7' onkeypress='validateSetAmount("+obj.prepaidAmountPendingPaymentDetailsId+","+i+");' onkeyup='validateSetAmount("+obj.prepaidAmountPendingPaymentDetailsId+","+i+");' class='form-control' style='width: 120px; text-align: right;'/></td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>" + obj.txnDateString + "</td>");
						columnArray.push("<td><input type='text' id='remark" + obj.prepaidAmountPendingPaymentDetailsId + "' name='remark' placeholder='Remark' class='form-control' style='width: 200px; text-transform: uppercase;' maxlength='250'></input></td>");
						$('#reportDetailsTableForEdit tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
						columnArray = [];
					}
				}
					
				$('#bottom-border-boxshadow').removeClass('hide');
				$('#left-border-boxshadow').removeClass('hide');
				$('#prePaidAmountRechargediv').removeClass('hide');
				
				_this.getPreviousDataForBalance(response);
			},500);	
		},	onPaymentTypeTypeSelect : function() {
			moduleId	= ModuleIdentifierConstant.PREPAID_AMT_PAYMENT;
			
			if(bankPaymentOperationRequired) {
				hideShowBankPaymentTypeOptions(document.getElementById("prepaidPaymentType"));
			}
		}, getPrepaidAmtSummary: function() {
			if($('#branchEle').val() == '') {
				showMessage('error', "Please Select Branch");
				return;
			}
			
			var jsonObject = new Object();
			showLayer();
			var branchId = $('#branchEle').val()
			jsonObject["branchId"]       =branchId;
			getJSON(jsonObject, WEB_SERVICE_URL + "/PrepaidPendingPaymentAmtWS/getPrepaidAmountPendingAmountDetails.do?", _this.setData, EXECUTE_WITHOUT_ERROR );		
		}, 	getPrepaidAmtSummaryFromRechrageModule: function() {
		
			if($('#agentBranchPrepaidEle').val() == '') {
				showMessage('error', "Please Select Branch");
				return;
			}
			
			var jsonObject = new Object();
			showLayer();
			var branchId = $('#agentBranchPrepaidEle').val()
			jsonObject["branchId"]       =branchId;
			getJSON(jsonObject, WEB_SERVICE_URL + "/PrepaidPendingPaymentAmtWS/getPrepaidAmountPendingAmountDetails.do?", _this.setData, EXECUTE_WITHOUT_ERROR );		
		}, setData : function(response) {
			setTimeout(function() {
				hideLayer();

				if(response.message != undefined) {
					var errorMessage = response.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					$('#bottom-border-boxshadow').addClass('hide');
					$('#top-border-boxshadow').addClass('hide');
					$('#left-border-boxshadow').addClass('hide');
					return;
				}				

				$('#bottom-border-boxshadow').removeClass('hide');
				$('#top-border-boxshadow').removeClass('hide');
				$('#left-border-boxshadow').removeClass('hide');
				$('#prePaidAmountPayment').removeClass('hide');

				var branchWisePrepaidAmountList = response.prepaidAmountPendingPaymentDetailsList;

				$('#reportDetailsTable thead').empty();
				$('#reportDetailsTable tbody').empty();
				$('#reportDetailsTable tfoot').empty();

				var columnHeadSubArray			= new Array();
				var columnArray					= new Array();
				var	key							= null;

				columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Sr No.</th>");
				columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Select.</th>");
				columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Recharge No.</th>");
				columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Branch Name.</th>");
				columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Recharge Amt.</th>");
				columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Paid Amt.</th>");
				columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Balance Amount.</th>");
				columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Amount.</th>");
				columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Payment Type.</th>");
				columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Payment Mode.</th>");
				columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Date.</th>");
				columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Payment Status.</th>");
				columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Remark.</th>");

				$('#reportDetailsTable thead').append('<tr id="reportDetailsTableHeader" class="text-success text-center">' + columnHeadSubArray.join(' ') + '</tr>');
				
				if(branchWisePrepaidAmountList != null && branchWisePrepaidAmountList.length > 0) {
					$("#btSubmit").show();
				
					for(var i = 0; i < branchWisePrepaidAmountList.length; i++) {
						var obj = branchWisePrepaidAmountList[i];
						branchIdObj[obj.prepaidAmountPendingPaymentDetailsId]   = obj.branchId;
						rechargeNoMap[obj.prepaidAmountPendingPaymentDetailsId] = obj.prepaidRechargeNumber;
						
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i + 1) + "</td>");
						columnArray.push("<td><input type='checkbox' id='singleCheckBox" + obj.prepaidAmountPendingPaymentDetailsId + "' name='singleCheckBox' class='form-control singleCheckBox' value='" + obj.prepaidAmountPendingPaymentDetailsId + "'/></td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>" + obj.prepaidRechargeNumber + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>" + obj.branchName + "</td>");
						columnArray.push("<td><input type='text' id='rechargeAmount"+obj.prepaidAmountPendingPaymentDetailsId+"' name='rechargeAmount' value='" + obj.rechargeAmount + "' maxlength='7' class='form-control' style='width: 120px; text-align: right;' onkeypress='return noNumbers(event);' readonly='readonly'/></td>");
						columnArray.push("<td><input type='text' id='paidAmount"+obj.prepaidAmountPendingPaymentDetailsId+"' name='paidAmount' value='" + obj.paidAmount + "' maxlength='7' class='form-control' style='width: 120px; text-align: right;' onkeypress='return noNumbers(event);' readonly='readonly'/></td>");
						columnArray.push("<td><input type='text' id='balanceAmount"+obj.prepaidAmountPendingPaymentDetailsId+"' name='balanceAmount' value='" + obj.balanceAmount + "' maxlength='7' class='form-control' style='width: 120px; text-align: right; onkeypress='' readonly='readonly'/></td>");
						columnArray.push("<td><input type='text' id='amount"+obj.prepaidAmountPendingPaymentDetailsId+"' name='amount' placeholder='Amount' value='' maxlength='7' onkeypress='validateSetAmount(" + obj.prepaidAmountPendingPaymentDetailsId + "," + i + ");' onkeyup='validateSetAmount(" + obj.prepaidAmountPendingPaymentDetailsId + "," + i + ");' class='form-control' style='width: 120px; text-align: right;'/></td>");
						columnArray.push("<td class='paymentTypeSelection'><select style='' name='paymentType' id='paymentType" + obj.prepaidAmountPendingPaymentDetailsId + "' class='form-control width-150px' onchange='onPaymenStatusSelect(" + obj.prepaidAmountPendingPaymentDetailsId + "," + i + ")'onfocus='' ></select></td>");
						columnArray.push("<td class='paymentModeSelection'><select style='' name='paymentMode' id='paymentMode" + obj.prepaidAmountPendingPaymentDetailsId + "' onchange='onPaymentModeSelect("+obj.prepaidAmountPendingPaymentDetailsId + ",this);' class='form-control width-150px' onchange=''onfocus='' ></select></td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>" + obj.txnDateString + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><a style='cursor:pointer;' onclick='viewStatusDetails("+obj.prepaidAmountPendingPaymentDetailsId+");' id='paymentTypeName_" + obj.prepaidAmountPendingPaymentDetailsId +"><b style='font-size: 14px; color: #1d7596'>" + obj.paymentTypeName + "</a></td>");
						columnArray.push("<td><input type='text' id='remark" + obj.prepaidAmountPendingPaymentDetailsId + "' name='remark' placeholder='Remark' class='form-control' style='width: 200px; text-transform: uppercase;' maxlength='250'></input></td>");
						
						$('#reportDetailsTable tbody').append('<tr>' + columnArray.join(' ') + '</tr>');

						$(paymentTypeArr).each(function() {
							$('#paymentMode' + obj.prepaidAmountPendingPaymentDetailsId).append($("<option>").attr('value', this.paymentTypeId).text(this.paymentStatusString));
						});
						
						$("#paymentTypeName_" + obj.prepaidAmountPendingPaymentDetailsId).bind("click", function() {
							var elementId		= $(this).attr('id');
							var prepaidAmountPendingPaymentDetailsId		= elementId.split('_')[1];
							_this.viewStatusDetails(prepaidAmountPendingPaymentDetailsId);
						});

						$(".paymentTypeSelection").removeClass("hide");
						$('#paymentType' + obj.prepaidAmountPendingPaymentDetailsId+' option[value]').remove();
						$('#paymentType' + obj.prepaidAmountPendingPaymentDetailsId).append($("<option>").attr('value', 0).text("-- Please Select-----"));
						$('#paymentMode' + obj.prepaidAmountPendingPaymentDetailsId + ' option[value]').remove();
						$('#paymentMode' + obj.prepaidAmountPendingPaymentDetailsId).append($("<option>").attr('value', 0).text("-- Please Select-----"));

						for(key in paymentStatusArrForSelection) {
							$('#paymentType'+obj.prepaidAmountPendingPaymentDetailsId).append($("<option>").attr('value', key).text(paymentStatusArrForSelection[key]));
						}
						
						$(paymentTypeArr).each(function() {
							$('#paymentMode'+obj.prepaidAmountPendingPaymentDetailsId).append($("<option>").attr('value', this.paymentTypeId).text(this.paymentTypeName));
						});
						
						columnArray = [];
					}
				}
			},500);	
		}, showResponseAfterUpdate : function(response){
			branchIdObj   = {};
			rechargeNoMap = {};
			hideLayer();
			
			if(response != null && response.sucessFullyPaymentDone!= null && response.sucessFullyPaymentDone!= undefined && response.sucessFullyPaymentDone) {
				$('#reportDetailsTable thead').empty();
				$('#reportDetailsTable tbody').empty();
				$('#reportDetailsTable tfoot').empty();
				$('#reportDetailsTable thead').empty();
				$('#reportDetailsTable tbody').empty();
				$('#reportDetailsTable tfoot').empty();
				$('#bottom-border-boxshadow').addClass('hide');
				$('#left-border-boxshadow').addClass('hide');
				$('#viewAddedPaymentDetailsCreate').hide();
				showMessage('success', "Payment Successfull!"); 
			} else {
				showMessage('error', "Payment Failed!"); 
			}
		}, setDataAfterEditRecharge : function(response){
			hideLayer()

			if(response != null && response != undefined && response.sucessFullyRechargeEdited != undefined  && response.sucessFullyRechargeEdited)
				_this.getPrepaidAmtEditDetails();
			else
				showMessage('error', "Failed to Save Prepaid Recharge !"); 
		}, setDataAfterCancellationRecharge : function(response){
			hideLayer();
			
			if(response!= null && response!= undefined && response.sucessFullyCancelled!= undefined  && response.sucessFullyCancelled)
				_this.getPrepaidAmtEditDetails();
			else
				showMessage('error', "Failed to Cancel Prepaid Recharge !"); 
		}, settlePrepaidAmount : function() {
			var _this				    = this;
			var prepaidPaymentData		= new Array();

			var checkBoxArray	= getAllCheckBoxSelectValue('singleCheckBox');
			
			if(checkBoxArray.length == 0) {
				showMessage('error', 'Please Select At least One Record !');
				hideLayer();
				return;
			}
			
			for (let i = 0; i < checkBoxArray.length; i++) {
				let prepaidAmountPendingPaymentDetailsId = 	Number(checkBoxArray[i]);
				let amt                       =  $('#amount' + prepaidAmountPendingPaymentDetailsId).val();
				let rechargeAmt               =  $('#rechargeAmount' + prepaidAmountPendingPaymentDetailsId).val();
					
				if(!_this.validateSettlePrepaidAmount(prepaidAmountPendingPaymentDetailsId, amt, rechargeAmt))
					return false;
				
				var paymentDetailsObject  = new Object();

				paymentDetailsObject.prepaidAmountDetailsId    		= prepaidAmountPendingPaymentDetailsId;
				paymentDetailsObject.balanceAmount				    = $('#balanceAmount' + prepaidAmountPendingPaymentDetailsId).val();
				paymentDetailsObject.amount							= amt;
				paymentDetailsObject.rechargeAmount					= rechargeAmt;
				paymentDetailsObject.remark							= $('#remark' + prepaidAmountPendingPaymentDetailsId).val();
				paymentDetailsObject.paymentType					= $('#paymentMode' + prepaidAmountPendingPaymentDetailsId).val();
				paymentDetailsObject.paymentStatus					= $('#paymentType' + prepaidAmountPendingPaymentDetailsId).val();
				paymentDetailsObject.branchId						= branchIdObj[prepaidAmountPendingPaymentDetailsId];
				paymentDetailsObject.rechargeNumber					= rechargeNoMap[prepaidAmountPendingPaymentDetailsId];
				prepaidPaymentData.push(paymentDetailsObject);
			}
			
			$("#btSubmit").hide();
			
			var jsonObject		= new Object();
			
			jsonObject["prepaidPaymentData"]			= JSON.stringify(prepaidPaymentData);
			jsonObject["prepaidPaymentIdArray"]			= checkBoxArray.join(',');
			
			var paymentValues		  = new Array();
			
			$('input[name=singleCheckBox]:checked').each(function() {
				let prepaidAmountPendingPaymentDetailsId = this.value;
				
				if($("#paymentDataTr_" + prepaidAmountPendingPaymentDetailsId +' #paymentCheckBox').val() != undefined) {
					paymentValues.push($("#paymentDataTr_" + prepaidAmountPendingPaymentDetailsId +' #paymentCheckBox').val());
				}
			});
			
			jsonObject["paymentValues"]						= paymentValues.join(',');
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL + '/PrepaidPendingPaymentAmtWS/savePrepaidAmountPendingPaymentDetails.do', _this.showResponseAfterUpdate, EXECUTE_WITH_ERROR);
		}, validateSettlePrepaidAmount : function(prepaidAmountPendingPaymentDetailsId, amt, rechargeAmt) {
			if(!validateInputTextFeild(1, 'amount' + prepaidAmountPendingPaymentDetailsId, 'amount' + prepaidAmountPendingPaymentDetailsId, 'error', amountEnterErrMsg))
				return false;
					
			if(!validateInputTextFeild(1, 'paymentType' + prepaidAmountPendingPaymentDetailsId, 'paymentType' + prepaidAmountPendingPaymentDetailsId, 'error', paymentTypeErrMsg))
				return false;
					
			if(!validateInputTextFeild(1, 'paymentMode' + prepaidAmountPendingPaymentDetailsId, 'paymentMode' + prepaidAmountPendingPaymentDetailsId, 'error', paymentModeErrMsg))
				return false;
					
			if(!validateInputTextFeild(1, 'remark' + prepaidAmountPendingPaymentDetailsId, 'remark' + prepaidAmountPendingPaymentDetailsId, 'error', ramarkErrMsg))
				return false;
					
			if(parseInt(amt) > parseInt(rechargeAmt)) {
				$("#rechargeAmount" + prepaidAmountPendingPaymentDetailsId).focus();
				showMessage('error', ' Amount Cannot Be Grater Than '+ $('#rechargeAmount' + prepaidAmountPendingPaymentDetailsId).val());
				return false;
			}
					
			return true;
		}, viewAddBranchWisePrepaidAmount : function(){
			getJSON(jsonObject, WEB_SERVICE_URL + '/selectOptionsWS/getAgentBranchAutoComplete.do?', _this.addBranchWisePrepaidAmount, EXECUTE_WITHOUT_ERROR);

		},addBranchWisePrepaidAmount : function (response){
			$("#right-border-boxshadow").toggle(900);
			
			if($("#bottom-border-boxshadow").css('display') != 'none'){
				$("#bottom-border-boxshadow").toggle(900);
			}
			
			if($("#left-border-boxshadow").css('display') != 'none'){
				$("#left-border-boxshadow").toggle(900);
			}
		}, getPreviousDataForBalance : function(response) {
			hideLayer();
			prepaidAmountId	= response.prepaidAmountId;
			currentAmount	= response.rechargeAmount;
			
			if(currentAmount == undefined)
				currentAmount	= 0;
			
			$("#currentAmountEle").html(currentAmount);
			
			if(prepaidAmountId > 0 && prepaidAmountId != undefined) {
				$('#imageAdd').show();
				$('#imageSub').show();
				
				//$("#saveBtnCA").html("Update");
				$("#saveBtnCA").css('display','none');
			} else if(response.message != undefined){
				$("#saveBtnCA").css('display','inline');
				$("#imageSub").css('display','none');
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
			}
		},saveBranchWisePrepaidAmount : function () {
			showLayer();
			
			var jsonObject = new Object();
			jsonObject.agentBranchPrepaid		 = $('#agentBranchPrepaidEle').val();
			jsonObject.rechargeAmount 			 = $('#rechargeAmountEle').val();
			jsonObject.operationType 			 = 1;

			if (confirm('Are you sure you want to Save?')) {
				getJSON(jsonObject, WEB_SERVICE_URL+'/BranchWisePrepaidAmountWS/insertBranchWisePrepaidAmount.do', _this.branchWisePrepaidAmountResposne, EXECUTE_WITH_ERROR);
			} else {
				hideLayer();
			}
		}, branchWisePrepaidAmountResposne : function (response) {
			if(response.message != undefined) {
				hideLayer();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
				$('#currentAmountEle').html(" ");
				$('#addPaymentDetails').show();
				return;
			}
		}, addPrepaidAmount : function () {
			var rechAmt     =  Number($('#rechargeAmountEle').val());
			var amountToPay =  Number($('#amountToPayEle').val());
			var paymentType =  Number($('#prepaidPaymentType').val());
			
			if(isNaN(rechAmt)) {
				showMessage('error', "Please Inter Valid Amount !");
				return 
			}

			if(amountToPay > 0 && paymentType == 0) {
				showMessage('error', "Please Select Payment Type");
				return 
			}
			
			if(amountToPay > rechAmt) {
				showMessage('error', "Amount ToPay can not be greater than Recharge Amount !");
				return 
			}
			
			if(paymentType > 0 && amountToPay <= 0) {
				showMessage('error', "Please Enter Amount To Pay");
				return;
			}
			
			showLayer();
			var jsonObject = new Object();

			jsonObject.filter					 = 2;
			jsonObject.prepaidAmountId			 = prepaidAmountId;
			jsonObject.amountToPay			 	 = $('#amountToPayEle').val();
			jsonObject.paymentType			 	 = $('#prepaidPaymentType').val();
			jsonObject.rechargeAmount 			 = $('#rechargeAmountEle').val();
			jsonObject.paymentValues 			 = $('#paymentCheckBox').val();
			jsonObject.operationType 			 = 2;
			jsonObject.agentBranchPrepaid		 = $('#branchEleForEdit').val();
			jsonObject['prepaidPaymentIdentifier']	= 2;
		
			if (confirm('Are you sure you want to Add ?')) {
				getJSON(jsonObject, WEB_SERVICE_URL+'/BranchWisePrepaidAmountWS/updatePrepaidAmountByPrepaidAmountIdFromMaster.do', _this.addBranchWisePrepaidAmountResposne,EXECUTE_WITH_ERROR);
			} else {
				hideLayer();
			}
		},addBranchWisePrepaidAmountResposne : function(response) {
			if(response.prepaidAmountPendingPaymentDetailsId != undefined && response.prepaidRechargeNumber != undefined && response.prepaidAmountPendingPaymentDetailsId > 0){
				var number = response.prepaidRechargeNumber;
				hideLayer();
				showMessage('success', 'Prepaid Recharge No : ' + number);
				$('#amountToPayEle').val('');
				$('#prepaidPaymentType').val(0);
				$('#rechargeAmountEle').val('');
				$('#currentAmountEle').html(" ");
				setTimeout(function(){ location.reload()}, 1000);
			} else {
				$('#agentBranchPrepaidEle').val('');
				$('#rechargeAmountEle').val('');
				hideLayer();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
				$('#currentAmountEle').html(" ");
				return;
			}
		}, subPrepaidAmount : function () {
			showLayer();
			var jsonObject = new Object();
			jsonObject.filter					 = 1;
			jsonObject.prepaidAmountId			 = prepaidAmountId;
			jsonObject.rechargeAmount 			 = $('#rechargeAmountEle').val();
			jsonObject.agentBranchPrepaid		 = $('#agentBranchPrepaidEle').val();
			jsonObject.operationType 			 = 3;

			if (confirm('Are you sure you want to reduce ?')) {
				getJSON(jsonObject, WEB_SERVICE_URL+'/BranchWisePrepaidAmountWS/updatePrepaidAmountByPrepaidAmountIdFromMaster.do', _this.subBranchWisePrepaidAmountResposne, EXECUTE_WITH_ERROR);
			} else {
				hideLayer();
			}

		}, subBranchWisePrepaidAmountResposne : function(response) {
			if(response.message != undefined) {
				$('#agentBranchPrepaidEle').val('');
				$('#rechargeAmountEle').val('');
				hideLayer();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
				$('#currentAmountEle').html(" ");
				return;
			}
		}, overRidePrepaidAmount : function () {
			var jsonObject = new Object();
			jsonObject.filter					 = 3;
			jsonObject.prepaidAmountId			 = prepaidAmountId;
			jsonObject.rechargeAmount 			 = $('#rechargeAmountEle').val();
			jsonObject.agentBranchPrepaid		 = $('#agentBranchPrepaidEle').val();
			jsonObject.operationType 			 = 4;

			showLayer();

			if (confirm('Are you sure you want to Update ?')) {
				getJSON(jsonObject, WEB_SERVICE_URL+'/BranchWisePrepaidAmountWS/updatePrepaidAmountByPrepaidAmountIdFromMaster.do', _this.subBranchWisePrepaidAmountResposne, EXECUTE_WITH_ERROR);
			} else {
				hideLayer();
			}
		}, deleteBranchWisePrepaidAmount : function () {
			showLayer();
			var jsonObject = new Object();
			jsonObject.prepaidAmountId			 = prepaidAmountId;
			jsonObject.agentBranchPrepaid		 = $('#agentBranchPrepaidEle').val();
			jsonObject.rechargeAmount 			 = currentAmount;
			jsonObject.operationType 			 = 5;

			if (confirm('Are you sure you want to Delete ?')) {
				getJSON(jsonObject, WEB_SERVICE_URL+'/BranchWisePrepaidAmountWS/deletePrepaidAmount.do', _this.subBranchWisePrepaidAmountResposne, EXECUTE_WITH_ERROR);
			} else {
				hideLayer();
			}
		}, editPrepaidPayment : function() {
			var _this				    = this;
			var prepaidPaymentData		= new Array();
			var jsonObject				= new Object();
			var checkBoxArray			= getAllCheckBoxSelectValue('singleCheckBox');
			
			if(checkBoxArray.length == 0) {
				showMessage('error', 'Please Select At least One Record !');
				hideLayer();
				return;
			}
			
			for (let i = 0; i < checkBoxArray.length; i++) {
				var prepaidAmountPendingPaymentDetailsId = 	Number(checkBoxArray[i]);
					
				if(!validateInputTextFeild(1, 'amount' + prepaidAmountPendingPaymentDetailsId, 'amount' + prepaidAmountPendingPaymentDetailsId, 'error', amountEnterErrMsg))
					return false;
					
				if(!validateInputTextFeild(1, 'remark' + prepaidAmountPendingPaymentDetailsId, 'remark' + prepaidAmountPendingPaymentDetailsId, 'error', ramarkErrMsg))
					return false;
					
				var paymentDetailsObject  = new Object();

				paymentDetailsObject.prepaidAmountDetailsId    		= prepaidAmountPendingPaymentDetailsId;
				paymentDetailsObject.amount							= $('#amount' + prepaidAmountPendingPaymentDetailsId).val();
				paymentDetailsObject.rechargeAmount					= $('#rechargeAmount' + prepaidAmountPendingPaymentDetailsId).val();
				paymentDetailsObject.remark							= $('#remark' + prepaidAmountPendingPaymentDetailsId).val();
				paymentDetailsObject.branchId						= branchIdObj[prepaidAmountPendingPaymentDetailsId];
				paymentDetailsObject.rechargeNumber					= rechargeNoMap[prepaidAmountPendingPaymentDetailsId];
				prepaidPaymentData.push(paymentDetailsObject);
			}
			
			$("#btSubmit").hide();
			jsonObject["prepaidPaymentData"]			= JSON.stringify(prepaidPaymentData);
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL + '/PrepaidPendingPaymentAmtWS/editPrepaidAmountPendingPaymentDetails.do', _this.setDataAfterEditRecharge, EXECUTE_WITH_ERROR);
		}, cancelPrepaidPayment : function(){
			var _this				    = this;
			var prepaidPaymentData		= new Array();
			var jsonObject				= new Object();
			var checkBoxArray			= getAllCheckBoxSelectValue('singleCheckBox');
			
			if(checkBoxArray.length == 0) {
				showMessage('error', 'Please Select At least One Record !');
				hideLayer();
				return;
			}
			
			for (let i = 0; i < checkBoxArray.length; i++) {
				var prepaidAmountPendingPaymentDetailsId = Number(checkBoxArray[i]);
					
				if(!validateInputTextFeild(1, 'remark' + prepaidAmountPendingPaymentDetailsId, 'remark' + prepaidAmountPendingPaymentDetailsId, 'error', ramarkErrMsg))
					return false;
					
				var paymentDetailsObject 							= new Object();
					
				paymentDetailsObject.prepaidAmountDetailsId    		= prepaidAmountPendingPaymentDetailsId;
				paymentDetailsObject.amount							= $('#amount' + prepaidAmountPendingPaymentDetailsId).val();
				paymentDetailsObject.rechargeAmount					= $('#rechargeAmount' + prepaidAmountPendingPaymentDetailsId).val();
				paymentDetailsObject.remark							= $('#remark' + prepaidAmountPendingPaymentDetailsId).val();
				paymentDetailsObject.branchId						= branchIdObj[prepaidAmountPendingPaymentDetailsId];
				paymentDetailsObject.rechargeNumber					= rechargeNoMap[prepaidAmountPendingPaymentDetailsId];
				prepaidPaymentData.push(paymentDetailsObject);
			}
			
			$("#btSubmit").hide();
			jsonObject["prepaidPaymentData"]			= JSON.stringify(prepaidPaymentData);
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL + '/PrepaidPendingPaymentAmtWS/cancelPrepaidAmountPendingPaymentDetails.do', _this.setDataAfterCancellationRecharge, EXECUTE_WITH_ERROR);
		}
	});
});

function onPaymentModeSelect(billId, obj) {
	$('#uniqueWayBillId').val(billId);
	$('#uniqueWayBillNumber').val($('#DDMNumber' + billId).val());
	$('#uniquePaymentType').val($('#paymentMode' + billId).val());
	$('#uniquePaymentTypeName').val($("#paymentMode" + billId + " option:selected").text());
	hideShowBankPaymentTypeOptions(obj);
}

function onPaymenStatusSelect(id, index) {
	negotiatePaymentStatusId
	var selectedPaymentStatus = $('#paymentType' + id).val();
	var obj = branchWisePrepaidAmountList[index];
	var amt                                      =  $('#amount' + obj.prepaidAmountPendingPaymentDetailsId).val()
	var balAmt                                   =  obj.balanceAmount;
	var remainingBalance                         =  balAmt - amt;

	if(parseInt(remainingBalance) == 0) {
		$('#paymentType' + obj.prepaidAmountPendingPaymentDetailsId).val('2');
	} else if(negotiatePaymentStatusId != parseInt(selectedPaymentStatus) && parseInt($('#amount'+obj.prepaidAmountPendingPaymentDetailsId).val()) != parseInt(obj.rechargeAmount)){
		$('#paymentType' + obj.prepaidAmountPendingPaymentDetailsId).val('3');
	} else if(negotiatePaymentStatusId == parseInt(selectedPaymentStatus)) {
		$('#paymentType' + obj.prepaidAmountPendingPaymentDetailsId).val('4');
	}
}

function viewStatusDetails (prepaidAmountPendingPaymentDetailsId){
	window.open ('viewPrepaidRechargeStatusDetails.do?pageId=340&eventId=2&modulename=viewPrepaidRechargeStatusDetails&prepaidAmountPendingPaymentDetailsId=' + prepaidAmountPendingPaymentDetailsId,'newwindow', config='left=200,top=130,width=1055,height=490, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function selectAllCheckbox(param){
	if(param == true){
		$(".singleCheckBox").prop('checked',true)
	}else if(param == false){
		$(".singleCheckBox").prop('checked',false)
	}
}

function validateSetAmount(id, index) {
	var obj 	= branchWisePrepaidAmountList[index];
	var table 	= $("#reportDetailsTable");
	var count 	= parseFloat(table[0].rows.length-1);

	for (var row = count; row > 0; row--){
		var amt                            	= $('#amount' + obj.prepaidAmountPendingPaymentDetailsId).val();
		var rechargeAmt                    	= $('#rechargeAmount' + obj.prepaidAmountPendingPaymentDetailsId).val();
		var balAmt                         	= obj.balanceAmount;
		var remainingBalance              	= balAmt - amt;
		
		if(remainingBalance < 0) {
			showMessage('error', ' Amount Cannot Be Grater Than '+ balAmt);
			$('#amount' + obj.prepaidAmountPendingPaymentDetailsId).val(0);
			$('#balanceAmount' + obj.prepaidAmountPendingPaymentDetailsId).val(balAmt);
		}
		
		if(parseInt(remainingBalance) == 0)
			$('#paymentType' + obj.prepaidAmountPendingPaymentDetailsId).val('2');
		else if(parseInt($('#amount' + obj.prepaidAmountPendingPaymentDetailsId).val()) != parseInt(obj.rechargeAmount))
			$('#paymentType' + obj.prepaidAmountPendingPaymentDetailsId).val('3');
		
		var res = Number(obj.rechargeAmount) - $('#amount' + obj.prepaidAmountPendingPaymentDetailsId).val();
		
		if(res < 0) {
			showMessage('error', ' Amount Cannot Be Grater Than ' + rechargeAmt);
			$('#amount' + obj.prepaidAmountPendingPaymentDetailsId).val('');
			$('#balanceAmount' + obj.prepaidAmountPendingPaymentDetailsId).val(balAmt);
			return;
		}
		
		if(remainingBalance >= 0)
			$('#balanceAmount' + obj.prepaidAmountPendingPaymentDetailsId).val(remainingBalance);
	}
}