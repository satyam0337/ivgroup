var PaymentTypeConstant 			= null;
var moduleId 						= 0;
var incomeExpenseModuleId 			= 0;
var ModuleIdentifierConstant		= null;
var BillClearanceStatusConstant		= null;
var GeneralConfiguration			= null;
var BankPaymentOperationRequired	= false;
var bankAccountNotMandatory			= false;
var cardNumberNotMandatory			= false;
var blhpvIdArrlist					= null;
var tdsConfiguration				= null;
var tdsChargeList					= null;
var isBalanceAmountValidation		= false;
var discountInPercent				= 0;
var allowBLHPVCreditPaymentInAnyBrnach =false;
var debitToBranchArr = null;

define([
        'marionette'
        ,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'//PopulateAutocomplete
        ,PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
        ,'errorshow'
        ,'JsonUtility'
        ,'messageUtility'
        ,'nodvalidation'
        ,'validation'
        ,'autocompleteWrapper'
        ,'focusnavigation'
        ,'/ivcargo/resources/js/backbone/backbone.bootstrap-modal.js'
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/creditpayment/setBlhpvDataForClearPayment.js'
        ], function(Marionette, Selection, UrlParameter) {
	'use strict'; 
	let myNod,
	paymentTypeConstantsList,
	paymentStatusConstants,
	BLHPVCreditSelectionConstant,
	isRegion = false, isSubregion = false, isBranch = false, downLoadToExcel = false, showPlainPrint = false, childwin = null,
	blhpvId	= 0,
	doneTheStuff = false,
	_this;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
			blhpvId 		= UrlParameter.getModuleNameFromParam("blhpvId")
		}, render : function() {
			getJSON(null, WEB_SERVICE_URL + '/blhpvCreditPaymentWS/getBlhpvCreditPaymentElementConfiguration.do?',	_this.setElements, EXECUTE_WITH_NEW_ERROR);
			return _this;
		}, setElements: function(response) {
			GeneralConfiguration			= response.GeneralConfiguration;
			BankPaymentOperationRequired	= GeneralConfiguration.BankPaymentOperationRequired;
			tdsConfiguration				= response.BLHPVShortCreditTdsProperty;
			tdsChargeList					= response.tdsChargeList;
			debitToBranchArr				= response.debitToBranchArr;
			
			let loadelement 	= new Array();
			let baseHtml 		= new $.Deferred();
			let paymentHtml		= new $.Deferred();
			
			loadelement.push(baseHtml);
			
			if(BankPaymentOperationRequired) {
				loadelement.push(paymentHtml);
			}
		
			$("#mainContent").load("/ivcargo/html/module/creditpayment/blhpvCreditPaymentModule.html",
					function() {
						baseHtml.resolve();
			});
			
			if(BankPaymentOperationRequired) {
				$("#bankPaymentOperationPanel").load("/ivcargo/html/module/paymentTypeSelection/paymentTypeSelection.html",
						function() {
						paymentHtml.resolve();
				});
			}
			
			paymentTypeConstantsList		= response.paymentTypeArr;
			paymentStatusConstants			= response.paymentStatusConstants;
			PaymentTypeConstant				= response.PaymentTypeConstant;
			moduleId						= response.moduleId;
			incomeExpenseModuleId			= response.incomeExpenseModuleId;
			ModuleIdentifierConstant		= response.ModuleIdentifierConstant;
			BillClearanceStatusConstant		= response.BillClearanceStatusConstant;
			bankAccountNotMandatory			= GeneralConfiguration.bankAccountNotMandatory;
			cardNumberNotMandatory			= GeneralConfiguration.cardNumberNotMandatory;
			BLHPVCreditSelectionConstant	= response.BLHPVCreditSelectionConstant;
			let isVehicleNumber				= false;
			let isVehicleAgent				= false;
			let operationSelection			= false;
			let isblhpvNumber				= false;
			downLoadToExcel					= response.downLoadToExcel;
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				let keyObject 		= Object.keys(response);
				
				for (let i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]] == false) {
						$("*[data-attribute="+ keyObject[i]+ "]").addClass("hide");
					}
				}
				
				operationSelection		= response['operationSelection'];
				isRegion				= response['region'];
				isSubregion				= response['subRegion'];
				isBranch				= response['branch'];
				isVehicleNumber			= response['vehicleNumberSearch'];
				isVehicleAgent			= response['vehicleAgentSearch'];
				isblhpvNumber			= response['blhpvNumberSearch'];
				
				response.sourceAreaSelection	= true;
				response.vehicleSelection		= true;
				response.vehicleAgentSelection	= true;
				response.viewAllVehicle			= response.AllOptionInVehicleNumber;
				
				let elementConfiguration	= new Object();
				
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
				elementConfiguration.vehicleElement		= $('#vehicleNumberEle');
				
				response.elementConfiguration			= elementConfiguration;
				
				isBalanceAmountValidation				= response.isBalanceAmountValidation;
				showPlainPrint							= response.showPlainPrint;
				allowBLHPVCreditPaymentInAnyBrnach		= response.allowBLHPVCreditPaymentInAnyBrnach;
				
				Selection.setSelectionToGetData(response);
				
				if(response.PaymentTypeAllSelection && response.PaymentStatusAllSelection) {
					if(!jQuery.isEmptyObject(paymentTypeConstantsList)) {
						$("#paymentType").append($("<option>").attr('value', 0).text('---Select Mode---'));
						let paymentTypeArr	= paymentTypeConstantsList;
						
						for(let i = 0; i < paymentTypeArr.length; i++) {
							$("#paymentType").append($("<option>").attr('value', paymentTypeArr[i].paymentTypeId).text(paymentTypeArr[i].paymentTypeName));
						}
					}
					
					if(!jQuery.isEmptyObject(response.paymentStatusConstants)) {
						$("#paymentStatus").append($("<option>").attr('value', 0).text('---Select Type---'));
						let paymentStatusArr	= response.paymentStatusConstants;
					
						for(let i = 0; i < paymentStatusArr.length; i++) {
							$("#paymentStatus").append($("<option>").attr('value', paymentStatusArr[i].paymentStatusId).text(paymentStatusArr[i].paymentStatusName));
						}
					}
				} else {
					$('#paymentTypeAndPaymentStatusSelection').remove();
				}
				
				if(BankPaymentOperationRequired) {
					$("#viewPaymentDetails").click(function() {
						openAddedPaymentTypeModel();
					});
					
					setIssueBankAutocomplete();
					setAccountNoAutocomplete();
				}
				
				if(!BankPaymentOperationRequired)
					$('#viewPaymentDetails').hide();
				
				if(operationSelection) {
					$("*[data-attribute='vehicleNumberSearch']").addClass("hide");
					$("*[data-attribute='vehicleAgentSearch']").addClass("hide");
					$("*[data-attribute='blhpvNumberSearch']").addClass("hide");
					$("*[data-attribute='blhpvBranch']").addClass("hide");

					let autoSelectionName 			= new Object();
					autoSelectionName.primary_key 	= 'selectionId';
					autoSelectionName.field 		= 'selectionName';
					autoSelectionName.callBack 		= _this.changeToGetData;
					$("#operationSelectionEle").autocompleteCustom(autoSelectionName);
					
					let autoSelectionNameInstance 	= $("#operationSelectionEle").getInstance();

					$(autoSelectionNameInstance).each(function() {
						this.option.source 			= response.selectionArr;
					});
					
					myNod = nod();
					myNod.configure({
						parentClass:'validation-message'
					});
					
					addAutocompleteElementInNode(myNod, 'operationSelectionEle', 'Select Operation !');
				} else{
					$("*[data-attribute='branchSelection']").addClass("show");
				}
				
				if(!operationSelection) {
					myNod = Selection.setNodElementForValidation(response);
					
					if(isRegion)
						addAutocompleteElementInNode(myNod, 'regionEle', 'Select Region !');
					
					if(isSubregion)
						addAutocompleteElementInNode(myNod, 'subRegionEle', 'Select Sub-Region !');
					
					if(isBranch)
						addAutocompleteElementInNode(myNod, 'branchEle', 'Select Branch !');
						
					if(isVehicleNumber)
						addAutocompleteElementInNode(myNod, 'vehicleNumberEle', 'Enter Vehicle No. !');
						
					if(isVehicleAgent)
						addAutocompleteElementInNode1(myNod, 'vehicleAgentEle', 'Select Vehicle Agent. !');
				}
				
				$('#limitMessage').html('Only top ' + response.noOfBlhpvForPayment + ' BLHPV will be allow for Payment !');

				$("#findBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid')) {
						_this.getDetails();
					}
				});
				
				$(".saveBtn").click(function() {
					_this.createBill(_this);
				});
				
				$(".UpPlainPrint").click(function() {
					_this.printPlainData();
				});
				
				$(".UpExcelDownLoadLink").click(function() {
					downloadToExcel(this,'reportData2','reportName','_FromSubBranch_');
				});
				
				if(blhpvId > 0 && !doneTheStuff) {
					showLayer();
					
					let jsonObject		= new Object();
					jsonObject.blhpvId = blhpvId;
					getJSON(jsonObject, WEB_SERVICE_URL+'/blhpvCreditPaymentWS/getBlhpvDetailsForClearPayment.do', _this.setForEdit, EXECUTE_WITH_ERROR);
				}
				
				hideLayer();
			});
		}, changeToGetData : function() {
			let selectionId			= $("#" + $(this).attr("id") + "_primary_key").val();
			
			myNod = nod();
				
			myNod.configure({
				parentClass:'validation-message'
			});
			
			if(parseInt(selectionId) == BLHPVCreditSelectionConstant.BRANCH_SELECTION) {//for Branch
				$("*[data-attribute='branchSelection']").addClass("show");
				$("*[data-attribute='vehicleNumberSearch']").removeClass("show");
				$("*[data-attribute='vehicleAgentSearch']").removeClass("show");
				$('#vehicleNumberEle').val('');
				$('#vehicleAgentEle').val('');
				$('#blhpvNumberEle').val('');
				$('#blhpvBranchEle').val('');
			    $("*[data-attribute='blhpvNumberSearch']").removeClass("show");
				$("*[data-attribute='blhpvBranch']").removeClass("show");

				if(isRegion)
					addAutocompleteElementInNode(myNod, 'regionEle', 'Select Region !');
					
				if(isSubregion)
					addAutocompleteElementInNode(myNod, 'subRegionEle', 'Select Sub-Region !');
					
				if(isBranch)
					addAutocompleteElementInNode(myNod, 'branchEle', 'Select Branch !');
			} else if(selectionId == BLHPVCreditSelectionConstant.VEHICLE_NUMBER_SELECTION) { //for LR
				addAutocompleteElementInNode(myNod, 'vehicleNumberEle', 'Enter Vehicle No. !');
				$('#blhpvNumberEle').val('');
				$('#blhpvBranchEle').val('');
				$('#branchEle').val('');
				$('#vehicleAgentEle').val('');
				$("*[data-attribute='vehicleNumberSearch']").addClass("show");
				$("*[data-attribute='branchSelection']").removeClass("show");
				$("*[data-attribute='vehicleAgentSearch']").removeClass("show");
				$("*[data-attribute='blhpvNumberSearch']").removeClass("show");
				$("*[data-attribute='blhpvBranch']").removeClass("show");
			} else if(selectionId == BLHPVCreditSelectionConstant.VEHICLE_AGENT_SELECTION) { //for LR
				addAutocompleteElementInNode1(myNod, 'vehicleAgentEle', 'Select Vehicle Agent. !');
				$('#blhpvNumberEle').val('');
				$('#blhpvBranchEle').val('');
				$('#vehicleNumberEle').val('');
				$('#branchEle').val('');
				$("*[data-attribute='vehicleAgentSearch']").addClass("show");
				$("*[data-attribute='vehicleNumberSearch']").removeClass("show");
				$("*[data-attribute='branchSelection']").removeClass("show");
				$("*[data-attribute='blhpvNumberSearch']").removeClass("show");
				$("*[data-attribute='blhpvBranch']").removeClass("show");
			} else if (selectionId == BLHPVCreditSelectionConstant.BLHPV_NUMBER_SELECTION) {
				addAutocompleteElementInNode(myNod, 'blhpvBranchEle', 'Select Branch !');
				$('#blhpvNumberEle').val('');
				$('#blhpvBranchEle').val('');
				$('#vehicleNumberEle').val('');
				$('#vehicleAgentEle').val('');
				$("*[data-attribute='vehicleNumberSearch']").removeClass("show");
				$("*[data-attribute='vehicleAgentSearch']").removeClass("show");
				$("*[data-attribute='branchSelection']").removeClass("show");
				$("*[data-attribute='blhpvNumberSearch']").addClass("show");
				$("*[data-attribute='blhpvBranch']").addClass("show");

				let blhpvBranchInstance = $("#blhpvBranchEle").getInstance();
				
				if (!blhpvBranchInstance || blhpvBranchInstance.length === 0) {
					getJSON(null, WEB_SERVICE_URL + '/selectOptionsWS/getAllPhysicalBranchOptionByAccountGroupId.do',
						function(response) {
							let blhpvBranchInstance = $("#blhpvBranchEle").getInstance();
							$(blhpvBranchInstance).each(function() {
								this.option.source = response.sourceBranch; 
							});
						},
						EXECUTE_WITHOUT_ERROR
					);

					let blhpvBranchAuto = {
						primary_key: 'branchId',
						field: 'branchName'
					};
					$("#blhpvBranchEle").autocompleteCustom(blhpvBranchAuto);
				}

				myNod.add({
					selector: '#blhpvNumberEle',
					validate: function(cb) {
						cb($('#blhpvNumberEle').val().trim() !== '');
					},
					errorMessage: 'Enter BLHPV Number !'
				});
			}
			
			refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
		}, getDetails : function () {
			let jsonObject	= Selection.getElementData();
			jsonObject.blhpvNumber= $('#blhpvNumberEle').val();
			jsonObject.blhpvBranchId= $('#blhpvBranchEle_primary_key').val();
			getJSON(jsonObject, WEB_SERVICE_URL+'/blhpvCreditPaymentWS/getBlhpvDetailsForClearPayment.do', _this.setForEdit, EXECUTE_WITH_ERROR);
			showLayer();
		}, setForEdit : function (response) {
			
			if (response.message != undefined) {
				hideLayer();
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
				return;
			}

			hideLayer();
			$('#bottom-border-boxshadow').show();
			$('#bottom-border-boxshadow').removeClass('hide');
			
			response.paymentTypeConstantsList	= paymentTypeConstantsList;
			response.paymentStatusConstants		= paymentStatusConstants;
			
			$('#storedPaymentDetails').empty();
			$('#paymentType').val(0);
			$('#paymentStatus').val(0);
			
			if(!downLoadToExcel)
				$('.ExcelDownLoad').remove();
			
			if(!showPlainPrint)
				$('.UpPlainPrint').remove();
			
			if(response.discountInPercent != undefined)
				discountInPercent = response.discountInPercent;
			
			setBlhpvDataForClearPayment(response);
			
			hideLayer();
		}, createBill : function() {
			let isAllowFlag	= false;
			
			for(let i = 0; i < blhpvIdArrlist.length; i++) {
				if(parseInt($('#receiveAmt_' + blhpvIdArrlist[i]).val()) > 0) {
					if(!validateBeforeSave(document.getElementById('receiveAmt_' + blhpvIdArrlist[i])))
						return false;
					
					isAllowFlag	= true;
				} else if(parseInt($('#receiveAmt_' + blhpvIdArrlist[i]).val()) < 0
						&& parseInt($('#grandTotal_' + blhpvIdArrlist[i]).val()) < 0) {
				
					if(!validateBeforeSave(document.getElementById('receiveAmt_' + blhpvIdArrlist[i])))
						return false;
					
					isAllowFlag	= true;
				}
				
				if($('#paymentStatus_' + blhpvIdArrlist[i]).val() == PAYMENT_TYPE_STATUS_NEGOTIATED_ID) {
					if(!validateDiscountLimit(discountInPercent, parseInt($('#grandTotal_' + blhpvIdArrlist[i]).val() - $('#receivedAmt_' + blhpvIdArrlist[i]).val()), parseInt($('#balanceAmt_' + blhpvIdArrlist[i]).val()), $('#receiveAmt_' + blhpvIdArrlist[i])))
						return false;
				}
			}
			
			if(!isAllowFlag) {
				showMessage('error', billAmountForReceiveErrMsg);
				return false;
			}
			
			$("#UpSaveButton").addClass('hide');
			$("#DownSaveButton").addClass('hide');

			let btModalConfirm = new Backbone.BootstrapModal({
				content		: 	"Are you sure you want to clear these Bills ?",
				modalWidth 	: 	30,
				title		:	'BLHPV Payment',
				okText		:	'YES',
				showFooter 	: 	true,
				okCloses	:	true
			}).open();

			btModalConfirm.on('ok', function() {
				let billData		= null;

				let totalBillArr		= new Array();
				let branchWiseLhpvAmountIdArr	= [];
				let blhpvIdArr			= [];

				for(let i = 0; i < blhpvIdArrlist.length; i++) {
					let receiveAmt			= $('#receiveAmt_' + blhpvIdArrlist[i]).val();

					if(receiveAmt > 0) {
						billData				= new Object();
						
						let blhpvId		= blhpvIdArrlist[i];

						billData.blhpvId				= blhpvId;
						billData.blhpvNumber			= $('#billNumber_' + blhpvIdArrlist[i]).val();
						billData.driverMasterId			= $('#driver1Id_' + blhpvIdArrlist[i]).val();
						billData.MobileNumber			= $('#driver1MobileNumber1_' + blhpvIdArrlist[i]).val();
						billData.grandTotal				= $('#grandTotal_' + blhpvIdArrlist[i]).val();
						billData.totalReceivedAmount	= receiveAmt;
						billData.balanceAmount			= $('#balanceAmt_' + blhpvIdArrlist[i]).val();
						billData.paymentStatus			= $('#paymentStatus_' + blhpvIdArrlist[i]).val();
						billData.paymentMode			= $('#paymentMode_' + blhpvIdArrlist[i]).val();
						billData.chequeDate				= $('#chequeDate_' + blhpvIdArrlist[i]).val();
						billData.chequeNumber			= $('#chequeNumber_' + blhpvIdArrlist[i]).val();
						billData.bankName				= $('#bankName_' + blhpvIdArrlist[i]).val();
						billData.remark					= $('#remark_' + blhpvIdArrlist[i]).val();
						billData.tdsAmount				= $('#tdsAmt_' + blhpvIdArrlist[i]).val();
						billData.tdsRate				= $('#tdsRate_' + blhpvIdArrlist[i]).val();
						billData.PanNumber				= $('#panNumber_' + blhpvIdArrlist[i]).val();
						billData.TanNumber				= $('#tanNumber_' + blhpvIdArrlist[i]).val();
						billData.debitToBranchId		= $('#debitToBranchSelection_' + blhpvIdArrlist[i]).val();
						billData.paymentDate			= $('#paymentDate_' + blhpvIdArrlist[i]).val();
						billData.actualBalanceAmountTaken	= $('#actualBalanceAmountTaken_' + blhpvIdArrlist[i]).val();
//						billData.grandTotal				= $('#cdcd' + blhpvIdArrlist[i]).val();
						
						let branchWiseLhpvAmountId		= $('#branchWiseLhpvAmountId_' + blhpvIdArrlist[i]).val();
						
						if(branchWiseLhpvAmountId > 0) {
							branchWiseLhpvAmountIdArr.push(branchWiseLhpvAmountId);
							blhpvIdArr.push(blhpvId);
						}
						
						billData.branchWiseLhpvAmountId	= branchWiseLhpvAmountId;
						
						totalBillArr.push(billData);
					}
				}

				let jsonObjectData		= new Object();

				jsonObjectData.BillDataArr				= JSON.stringify(totalBillArr);
				jsonObjectData.branchWiseLhpvAmountIds	= branchWiseLhpvAmountIdArr.join(',');
				jsonObjectData.blhpvIds					= blhpvIdArr.join(',');
				jsonObjectData.paymentType				= $('#paymentType').val();

				let rowCount 		= $('#storedPaymentDetails tr').length;

				if(!$('#storedPaymentDetails').is(':empty') && rowCount > 0) {
					let paymentCheckBoxArr			= getAllCheckBoxSelectValue('paymentCheckBox');
					jsonObjectData.paymentValues	= paymentCheckBoxArr.join(',');
				}

				getJSON(jsonObjectData, WEB_SERVICE_URL + '/blhpvCreditPaymentWS/receiveCreditPaymentAmount.do', _this.getResponseData, EXECUTE_WITH_ERROR);
				showLayer();
			});

			btModalConfirm.on('cancel', function() {
				$("#UpSaveButton").removeClass('hide');
				$("#DownSaveButton").removeClass('hide');
				hideLayer();
			});
		}, getResponseData : function(response) {
			if(response.message != undefined) {
				let errorMessage	= response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
				$("#UpSaveButton").removeClass('hide');
				$("#DownSaveButton").removeClass('hide');
				doneTheStuff = true;
				//setTimeout(function(){ location.reload(); }, 1000);
				hideLayer();
				return;
			}
			
			hideLayer();
		}, printPlainData : function() {
			childwin = window.open ('jsp/printData.jsp?accountGroupName='+$('#accountGroupName').val()+'&branchAddress='+$('#branchAddress').val()+'&branchPhoneNo='+$('#branchPhoneNo').val()+'&detailHeader='+'BLHPV Credit Details' , 'newwindow', 'config=height=425,width=840, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
			window.setTimeout(_this.waitForPlainDelay, 500);
		}, waitForPlainDelay : function () {
			childwin.document.getElementById('data').innerHTML= document.getElementById('reportData2').innerHTML;
			childwin.print();
		}
	});
});
