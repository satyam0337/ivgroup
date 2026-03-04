var LR_SEARCH_TYPE_ID					= 1;
var destinationBranchId					= 0;
var jsondata							= null;
var lrReturnBookingConfig		  		= null;
var TaxPaidByConstant		  			= null;
var formTypeMastersArrList		  		= null;
var isDiscountPercent					= false;
var taxes								= null;
var bookingCharges						= null;
var doneTheStuff						= false;
var APPLY_TAX_YES				= 1;
var APPLY_TAX_NO				= 2;
var billSelectionId				= 0;
var allowToEditAllFeild			= false;

define(['JsonUtility'
	,'messageUtility'
	,'/ivcargo/resources/js/generic/urlparameter.js'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/waybill/filepath/tokenGenerateWayBillFilePath.js'
	,'jquerylingua'
	,'language'
	,'autocomplete'
	,'autocompleteWrapper'
	,'nodvalidation'
	,'focusnavigation'//import in require.config
	,'selectizewrapper'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'/ivcargo/resources/js/module/redirectAfterUpdate.js'
	,'/ivcargo/resources/js/validation/regexvalidation.js'
	,'/ivcargo/resources/js/datepicker/moment.js',
	],function(JsonUtility, MessageUtility, UrlParameter, FilePath,Lingua, Language, AutoComplete, AutoCompleteWrapper,
			NodValidation,ElementFocusNavigation,Selectizewrapper,BootstrapModal,RedirectAfterUpdate,RegexValidation,Moment){
	'use strict';
	var jsonObject = new Object(),wayBillId =0, _this = '',  executive,  wayBillTypeList, bookingTypeList, idNum = 0, btModalConfirm, 
			isDuplicateLR = false, isTBBPartyInConsignorName = false,wayBill = null, newFreightAmount = 0,weightFreightRate = 0,qtyTypeWiseRateHM = null;
	return Marionette.LayoutView.extend({
		initialize : function(masterObj){
			_this = this;
			wayBillId 				= UrlParameter.getModuleNameFromParam('wayBillId');
			jsonObject.waybillId	= wayBillId; 
			this.$el.html(this.template);
		},render : function(){
			getJSON(jsonObject, WEB_SERVICE_URL + '/wayBillWS/lrReturnBooking.do?', _this.renderElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		},renderElements : function(response){
			showLayer();
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/template/returnLrBooking/returnLrBooking.html",
					function() {
				baseHtml.resolve();
			});
			hideLayer();

			$.when.apply($, loadelement).done(function() {
				jsondata							= response;
				executive							= response.executive;
				bookingTypeList						= response.bookingTypeList;
				lrReturnBookingConfig				= response.lrReturnBookingConfig;
				wayBillTypeList						= response.wayBillTypeList;
				formTypeMastersArrList				= response.formTypeMastersArrList;
				bookingCharges						= response.bookingCharges;
				taxes								= response.taxes;
				wayBill								= response.wayBill;
				newFreightAmount					= response.freightAmount;
				weightFreightRate					= response.weightFreightRate;
				qtyTypeWiseRateHM					= response.qtyTypeWiseRateHM;
				allowToEditAllFeild					= lrReturnBookingConfig.allowToEditAllFeild;
				
				if(typeof bookingTypeList !== 'undefined') {
						bookingTypeList.forEach(function(booingType) {
							$('#bookingType').append("<option value='"+ booingType.bookingTypeId +"'>" + booingType.bookingTypeName + "</option>");
						});
				}
				
				if(typeof wayBillTypeList !== 'undefined') {
					wayBillTypeList.forEach(function(wayBillType) {
						$('#lrType').append("<option value='"+ wayBillType.wayBillTypeId +"'>" + wayBillType.wayBillType + "</option>");
						_this.changeWayBillType(wayBill.wayBillTypeId, response)
					});
				}
				
				$("#singleFormTypes").bind("change", function() {
					_this.singleSelectFormType(this);
				});
				
				$("#STPaidBy").bind("change", function() {
					calculateGSTTaxes();
				});
				
				$("#addMutipleEwayBill").bind("click", function() {
					_this.addMultipleEwayBillNo();
				});
				
				$("#viewEwayBill").bind("click", function() {
					_this.viewEwayBillNo();
				});
				
				if(lrReturnBookingConfig.showManualLrNumberFieldInReturnBooking) {
					$('#newManualLrNumberPanel').removeClass('hide');
					
					if(lrReturnBookingConfig.allowedLenghtForManualLR > 0) {
						$('#newManualLrNumberPanel').keyup(function() {
							var lrNumber = $('#newManualLrNumber').val();
							
							if(lrNumber.length != Number(lrReturnBookingConfig.allowedLenghtForManualLR)){
								showMessage('error', 'LR Number length should  be Equal to  '+Number(lrReturnBookingConfig.allowedLenghtForManualLR)+' !');
								changeTextFieldColor('newManualLrNumber', '', '', 'red');
								return false;
							}
							return true;
						});
					}
				}
				
				_this.createOptionForSTPaidBy();
				_this.createOptionForDeliveryTo(response.deliveryToAarray);
				_this.createOptionFormType();
				_this.createOptionPaymentType(response);
				
				_this.setPreviousValue(response);
				_this.setPreviousConsignorDetails(response);
				_this.setPreviousConsigneeDetails(response);
				_this.setPreviousBillingPartyDetails(response);
				_this.setPreviousDestinationDetails(response);
				_this.setPreviousSourceBranchDetails(response);
				_this.addConsignment(response);
				_this.setWayBillBookingChargesData(response);
				_this.createOptionForPodRequiredField();
				
				if(allowToEditAllFeild)
					_this.allowToEditAllInput(response);
				
				initialiseFocus();
				
				$("#sourceBranch").autocomplete({
					source: "Ajax.do?pageId=9&eventId=13&filter=24&branchType=2&responseFilter="+lrReturnBookingConfig.sourceBranchAutocompleteFlavour,
					minLength: 2,
					delay: 10,
					autoFocus: true,
					select: function(e, u) {
						if(u.item.id != 0) {
							var selectedSource = u.item.id;
							
							var srcData = new Array();
							srcData = selectedSource.split("_");
							
							var sourceBranchId		= parseInt(srcData[0]);
							var sourceStateId		= parseInt(srcData[2]);
							var sourceRegionId		= parseInt(srcData[2]);
							var sourceSubRegionId	= parseInt(srcData[2]);
							
							$('#srcBranchId').val(sourceBranchId);
					    	$('#sourceBranchId').val(sourceBranchId);
					    	$('#sourceStateId').val(sourceStateId);
					    	$('#sourceRegionId').val(sourceRegionId);
					    	$('#sourceSubRegionId').val(sourceSubRegionId);
						}
					},
				});
				
				if(lrReturnBookingConfig.allowEditDestination) {
					$("#destination").autocomplete({
						source: "DestinationBranchAutoCompleteForAjaxAction.do?pageId=9&eventId=27&branchType=2&isOwnBranchRequired="+lrReturnBookingConfig.isOwnBranchRequired+"&isOwnBranchWithLocationsRequired="+lrReturnBookingConfig.OwnBranchLocationsRequired+"&locationId="+executive.branchId+"&responseFilter="+lrReturnBookingConfig.BookingDestinationutocompleteResponse+"&deliveryDestinationBy="+lrReturnBookingConfig.DeliveryDestinationBy+"&branchNetworkConfiguration="+lrReturnBookingConfig.BranchNetworkConfiguration,
						minLength: 2,
						delay: 10,
						autoFocus: true,
						select: function(e, u) {
							if(u.item.id != 0) {
								var destData = (u.item.id).split("_");
								
								var destinationBranchId		= parseInt(destData[0]);
								var destinationStateId		= parseInt(destData[2]);
								var destinationSubRegionId	= parseInt(destData[6]);
								var destinationRegionId		= parseInt(destData[8]);
								
								$('#destBranchId').val(destinationBranchId);
						    	$('#destinationBranchId').val(destinationBranchId);
						    	$('#destinationStateId').val(destinationStateId);
						    	$('#destinationRegionId').val(destinationRegionId);
						    	$('#destinationSubRegionId').val(destinationSubRegionId);
						    	
						    	_this.setConsigneeAutoComplete(destinationBranchId);
							}
						},
					});
				}		
				destinationBranchId = $('#destinationBranchId').val();
				
				if(lrReturnBookingConfig.allowEditConsignor) {
					$("#consignorName").autocomplete({
						source: "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18&partyType=1,3&customerType=1&responseFilter="+lrReturnBookingConfig.BookingConsignorNameAutocompleteResponse+"&isBlackListPartyCheckingAllow="+lrReturnBookingConfig.isBlackListPartyCheckingAllow+"&moduleFilterForBlackListPartyChecking=1",
						minLength: 2,
						delay: 250,
						autoFocus: true,
						select: function(e, u) {
	
							$('#consignorCorpId').val(u.item.id);
							$('#consignorId').val(u.item.id);
							$('#partyMasterId').val(u.item.id);
	
							var consignorId = u.item.id;
							
							if(consignorId > 0) {
								var jsonObject					= new Object();
	
								jsonObject.filter				= 2;
								jsonObject.getCharge			= 1;
								jsonObject.partyId				= consignorId;
								jsonObject.partyPanelType		= 1;
								jsonObject.partyType			= 3;
	
								var jsonStr = JSON.stringify(jsonObject);
	
								$.getJSON("Ajax.do?pageId=9&eventId=16",
										{json:jsonStr}, function(data) {
											if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
												showMessage('error', data.errorDescription);
											} else {
												if(!data.partyDetails) {
													return;
												}
												var party = data.partyDetails;
	
												_this.setConsignorDetails(party);
											}
										});
							}
						},
					});
				}
				
				if(lrReturnBookingConfig.allowEditTBBParty) {
					$("#billingPartyName").autocomplete({
						source: "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18&billing=4&customerType=1&responseFilter=2&showRateConfiguredSignInPartyName=true",
						minLength: 2,
						delay: 250,
						autoFocus: true,
						select: function(e, u) {
	
							$('#billingPartyId').val(u.item.id);
							$('#partyOrCreditorId').val(u.item.id);
	
							var tbbPartyId = u.item.id;
	
							if(tbbPartyId > 0) {
								var jsonObject  = new Object();
	
								jsonObject.filter				= 2;
								jsonObject.getCharge			= 1;
								jsonObject.partyId				= tbbPartyId;
								jsonObject.partyPanelType		= 1;
								jsonObject.partyType			= 3;
	
								var jsonStr = JSON.stringify(jsonObject);
	
								$.getJSON("Ajax.do?pageId=9&eventId=16",
										{json:jsonStr}, function(data) {
											if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
												showMessage('error', data.errorDescription);
											} else {
												if(!data.partyDetails) {
													return;
												}
												var party = data.partyDetails;
												$('#consignorGstn').val(party.gstn);
													
												//_this.setTbbPartyDetails(party);
											}
									});
							}
						},
					});
				}
							
				$("#lrType").bind("change", function() {
					if(!_this.changeWayBillType(this.value, response)) {
						_this.changeWayBillType(wayBill.wayBillTypeId, response)
					}
				});
								
				$('#sourceBranch').keydown(function(event) {
					if(getKeyCode(event) == 13) {
						if (!validateInputTextFeild(1, 'sourceBranch', 'sourceBranch', 'error', sourceBranchErrMsg)) {
							return false;
						}
						return true;
					}
				});
				
				$('#destination').keydown(function(event) {
					if(getKeyCode(event) == 13) {
						if(!validateInputTextFeild(1, 'destination', 'destination', 'error', destinationErrMsg)) {
							return false;
						}
						return true;
					}
				});
				
				$('#destination').keyup(function(event) {
					if(event.keyCode != undefined && (event.keyCode === 8 || event.keyCode === 46)) {
						_this.resetDestinationPointData();
					}
				});
				
				$('#consignorName').keydown(function(event) {
					if(getKeyCode(event) == 13) {
						if(!validateInputTextFeild(1, 'consignorName', 'consignorName', 'error', consinorNameErrMsg)) {
							return false;
						}
						return true;
					}
				});
				
				$('#consigneeName').keydown(function(event) {
					if(getKeyCode(event) == 13) {
						if(!validateInputTextFeild(1, 'consigneeName', 'consigneeName', 'error', consineeNameErrMsg)) {
							return false;
						}
						return true;
					}
				});
				
				$('#consigneeName').keyup(function() {
					var consigneeName = $('#consigneeName').val();
					if(consigneeName.length > 0 && $('#destinationBranchId').val() <= 0) {
						$('#consigneeName').prop("autocomplete", "off");
						showMessage('error', " Please Select Destination !");	
						changeTextFieldColor('consigneeName', '', '', 'red');
						return false;
					}
					return true;
				});
				
				$('#consignorName').blur(function() {
					var consignorName = $('#consignorName').val();
					
					if (lrReturnBookingConfig.ConsignorNameAutocomplete && consignorName.length > 0) {
						if(Number($('#partyMasterId').val()) == 0) {
							setTimeout(function(){ 
								$('#consignorName').focus(); 
								showMessage('error', " Please Select Party From Suggestion !");	
								$('#consignorName').val('');
								changeTextFieldColor('consignorName', '', '', 'red');
							}, 200);

							return false;
						}
					}
					return true;
				});
				
				$('#consigneeName').blur(function() {
					var consigneeName = $('#consigneeName').val();
					
					if (lrReturnBookingConfig.ConsigneeNameAutocomplete && consigneeName.length > 0) {
						if(Number($('#consigneePartyMasterId').val()) == 0) {
							setTimeout(function(){ 
								$('#consigneeName').focus(); 
								showMessage('error', " Please Select Party From Suggestion !");	
								$('#consigneeName').val('');
								changeTextFieldColor('consigneeName', '', '', 'red');
							}, 200);

							return false;
						}
					}
					return true;
				});
				
				$('#billingPartyName').blur(function() {
					var billingPartyName = $('#billingPartyName').val();
					
					if (lrReturnBookingConfig.BillingPartyNameAutocomplete && billingPartyName.length > 0) {
						if(Number($('#partyOrCreditorId').val()) == 0) {
							setTimeout(function(){ 
								$('#billingPartyName').focus(); 
								showMessage('error', " Please Select Party From Suggestion !");	
								$('#billingPartyName').val('');
								changeTextFieldColor('billingPartyName', '', '', 'red');
							}, 300);
							return false;
						}
					}
					return true;
				});
				
				$('#save').mouseup(function() {
					if(_this.validateAddArticle()) {
						_this.processReturnBooking();	
					}
					
				}).keydown(function(event) {
					if(event.keyCode != undefined && event.keyCode === 13) {
						if(_this.validateAddArticle()) {
							_this.processReturnBooking();	
						}
					}
				});
			});
		},setPreviousValue : function(response) {
			var consignmentSummary	= response.consignmentSummary;
			var bankPayment 		= response.BankPayment;
			
			billSelectionId			= consignmentSummary.consignmentSummaryBillSelectionId;
			
			//setting LR Details
			$('#lrNumberManual').val(wayBill.wayBillNumber);
			$('#previusLRDate').val(wayBill.wayBillBookingDateTimeStr);
			
			if(lrReturnBookingConfig.isShowByDefaultRemarkGroupWise)
				$('#remark').val(lrReturnBookingConfig.groupWiseRemark);
			else
				$('#remark').val(wayBill.wayBillRemark);
			
			$('#wayBillType').val(wayBill.wayBillBookingTypeId);
			
			_this.changeWayBillType(wayBill.wayBillTypeId, response);
					
			if(wayBill.wayBillTypeId == WAYBILL_TYPE_PAID) {
				$("#lrType").prop( "disabled", true );
				$("#paymentTypeDiv").removeClass( "hide");
				$("#paymentType").prop( "disabled",true);
				$("#paymentType").val(consignmentSummary.consignmentSummaryPaymentType);
				$("#deliveryTo").prop( "disabled", true );
				$("#STPaidBy").prop( "disabled", true );
			}
			
			$('#bookingType').val(wayBill.wayBillBookingTypeId)
			$("#bookingType ").prop( "disabled", true )
			
			$('#actualWeight').val(consignmentSummary.consignmentSummaryActualWeight);
			$('#chargedWeight').val(consignmentSummary.consignmentSummaryChargeWeight);
			$('#chargeType').val(consignmentSummary.consignmentSummaryChargeTypeId);
			$('#declaredValue').val(consignmentSummary.consignmentSummaryDeclaredValue);
			$('#STPaidBy').val(consignmentSummary.consignmentSummaryTaxBy);
			$('#deliveryTo').val(consignmentSummary.consignmentSummaryDeliveryTo);
			$('#invoiceNo').val(consignmentSummary.consignmentSummaryInvoiceNo);
			
			if(consignmentSummary.consignmentSummaryChargeTypeId == CHARGETYPE_ID_WEIGHT && wayBill.wayBillTypeId != WAYBILL_TYPE_FOC) {
				
				if(weightFreightRate > 0) {
					$('#weightRate').val(weightFreightRate);
				} else {
					$('#weightRate').val(consignmentSummary.consignmentSummaryWeightFreightRate);
				}
			}
			
			
			if(typeof bankPayment != 'undefined') {
				$('#chequeDate').val(bankPayment.chequeDate);           
				$('#chequeNo').val(bankPayment.chequeNumber);             
				$('#chequeAmount').val(bankPayment.chequeAmount);         
				$('#payerName').val(bankPayment.payerName);            
				$('#bankName').val(bankPayment.issueBank);             
				$('#bankName_primary_key').val(bankPayment.issueBankId); 
				$('#accountNo').val(bankPayment.chequeNumber);            
				$('#accountNo_primary_key').val(bankPayment.bankAccountId);
			}  else if(consignmentSummary.consignmentSummaryPaymentType == PAYMENT_TYPE_CHEQUE_ID) {
				$('#chequeDate').val(consignmentSummary.chequeDateString);           
				$('#chequeNo').val(consignmentSummary.consignmentSummaryChequeNumber);             
				$('#chequeAmount').val(wayBill.wayBillGrandTotal);         
				$('#payerName').val("");            
				$('#bankName').val(consignmentSummary.consignmentSummaryBankName);             
				$('#bankName_primary_key').val(0); 
				$('#accountNo').val(0);            
				$('#accountNo_primary_key').val(0);
			}
					
		},setPreviousConsignorDetails:function(response){
			var consigneeDetails				= response.ConsigneeDetails;
			
			//setting consignor Details
			
			$('#consignorName').val(consigneeDetails.consigneeName);
			$('#consignorPhn').val(consigneeDetails.customerDetailsMobileNumber);
			$('#consignorGstn').val(consigneeDetails.gstn);
			$('#consignorAddress').val(consigneeDetails.customerDetailsAddress);
			$('#consignorId').val(consigneeDetails.corporateAccountId);
			$('#partyMasterId').val(consigneeDetails.corporateAccountId);
			$('#partyOrCreditorId').val(consigneeDetails.corporateAccountId);
			$('#consignorCorpId').val(consigneeDetails.corporateAccountId);
		},setPreviousConsigneeDetails : function(response){
			var consignorDetails				= response.ConsignorDetails;
			
			//setting consignee Details
			
			$('#consigneeName').val(consignorDetails.consignorName);
			$('#consigneePhn').val(consignorDetails.customerDetailsMobileNumber);
			$('#consigneeGstn').val(consignorDetails.gstn);
			$('#consigneeAddress').val(consignorDetails.customerDetailsAddress);
			$('#consigneeCorpId').val(consignorDetails.corporateAccountId);
			$('#consigneeId').val(consignorDetails.corporateAccountId);
			$('#consigneePartyMasterId').val(consignorDetails.corporateAccountId);
			
		},setPreviousBillingPartyDetails :function(response){
			var billingPartyDetails				= response.BillingPartyDetails;
			
			if(billingPartyDetails != null && wayBill.wayBillTypeId == WAYBILL_TYPE_CREDIT) {
				//setting BillingParty Details
				$('#billingPartyId').val(billingPartyDetails.corporateAccountId);
				$('#billingPartyName').val(billingPartyDetails.customerDetailsName);
				$('#billingPartyCreditorId').val(billingPartyDetails.corporateAccountId);
				
				if($('#consignorGstn').val() == '') {
					$('#consignorGstn').val(billingPartyDetails.gstn);
				}
			}
			
		},setPreviousDestinationDetails : function(response){
			var sourceBranch					= response.sourceBranch;
			//setting destination Branch Details
	    	$('#destination').val(wayBill.wayBillSourceBranchName);
			$('#destBranchId').val(wayBill.wayBillSourceBranchId);
			$('#destinationBranchId').val(wayBill.wayBillSourceBranchId);
			$('#destinationStateId').val(sourceBranch.branchAddressStateId);
			$('#destinationRegionId').val(sourceBranch.regionId);
			$('#destinationSubRegionId').val(sourceBranch.subRegionId);
			
			_this.setConsigneeAutoComplete(wayBill.wayBillSourceBranchId);
		},setPreviousSourceBranchDetails :function(response){
			var destinationBranch				= response.destinationBranch;
			//setting sourceBranch Details
			$('#sourceBranch').val(wayBill.wayBillDestinationBranchName);
			$('#srcBranchId').val(wayBill.wayBillDestinationBranchId);
			$('#sourceBranchId').val(wayBill.wayBillDestinationBranchId);
	    	$('#sourceStateId').val(destinationBranch.branchAddressStateId);
			$('#sourceRegionId').val(destinationBranch.regionId);
	    	$('#sourceSubRegionId').val(destinationBranch.subRegionId);
	    	
		},setWayBillBookingChargesData : function(response){
			var container 		= $('#charges');
			var wbChrg			= null;
			
			$('#charges').empty();
			
			var wayBillBookingChargesColl	= response.wayBillBookingChargesColl;
			var wayBillTaxTxnHm				= response.wayBillTaxTxnHm;
			
			if(bookingCharges != null) {
				bookingCharges.forEach(function(charges) {
					var tr 		= $('<tr>');
					wbChrg		= null;
					var wayBillBookingChargeChargeAmount	= 0;
					var chargeAmount						= 0;
					tr.append('<td><b>' + charges['displayName'] + '</b></td>');
							
					if(typeof wayBillBookingChargesColl != 'undefined') {
						if(wayBillBookingChargesColl.hasOwnProperty(charges.chargeTypeMasterId)) {
							wbChrg			= wayBillBookingChargesColl[charges.chargeTypeMasterId];
							wayBillBookingChargeChargeAmount	= wbChrg.wayBillBookingChargeChargeAmount;
						}
					}
					
					if(charges.chargeTypeMasterId == FREIGHT) {
						var readonly	= true;
						
						if(lrReturnBookingConfig.allowToEditFreightAmount)
							readonly	= false;
						
						if(newFreightAmount > 0) 
							chargeAmount	= newFreightAmount;
						else if (lrReturnBookingConfig.bookingTotalInFreightCharge)
							chargeAmount	= wayBill.bookingTotal;
						else
							chargeAmount	= wayBillBookingChargeChargeAmount;
					} else if(lrReturnBookingConfig.displayTotalAmountInOtherCharge && charges.chargeTypeMasterId == OTHER_BOOKING)
						chargeAmount	= wayBill.bookingTotal;
					else {
						var readonly = false;

						if(lrReturnBookingConfig.addDeliveredLrAmountInLrReturnCharge) {
							if(Number($('#lrType').val()) == WAYBILL_TYPE_TO_PAY && charges.chargeTypeMasterId == RETURN_CHARGE) {
								readonly	= true;
								chargeAmount	= wayBill.bookingTotal;
							} else 
								chargeAmount	= wayBillBookingChargeChargeAmount;
						} else if(lrReturnBookingConfig.bookingTotalInFreightCharge)
							chargeAmount	= 0;
						else
							chargeAmount	= wayBillBookingChargeChargeAmount;
					}
					tr.append('<td><input type="text" name="charge' + charges['chargeTypeMasterId'] + '" id="charge' + charges['chargeTypeMasterId'] + '" value="' + chargeAmount + '" class="form-control text-right" data-tooltip = "' + charges['displayName'] + '" onfocus="setBlankAmount(this);" onkeypress="return allowNumbersOnly(event);" onkeyup="setFocusForBookingCharges(event);" onblur="getChargesTotal();calcGrandtotal();calculateGSTTaxes();"/></td>');
		
					container.append(tr);
					
					if(readonly)
						$('#charge' + charges['chargeTypeMasterId']).attr("readonly","readonly");
				});
			}
			
			setTimeout(() => {
				$("#charge"+RETURN_CHARGE).trigger("blur");
			}, 100);
			
			setTimeout(() => {
				$("#charge"+OTHER_BOOKING).trigger("blur");
			}, 100);
			
			var tr = $('<tr id="totalAmountPanel">');
			tr.append('<td><b>Total</b></td>');
			tr.append('<td><input type="text" name="totalAmt" id="totalAmt" value="' + wayBill.bookingTotal+ '" readonly="readonly" class="form-control text-right" data-tooltip = "Total Amount"/></td>');
			container.append(tr);
			
			if(taxes != null) {
				taxes.forEach(function(tax) {
					var tr 			= $('<tr>');
					var taxChrg		= null;
					var taxAmount 	= 0 ;
					tr.append('<td><b>' + tax['taxName'] + ' ' + tax['taxAmount'].toFixed(2) + ' %</b></td>');
					if(typeof wayBillTaxTxnHm != 'undefined') {
						if(wayBillTaxTxnHm.hasOwnProperty(tax.taxMasterId)) {
							taxChrg			= wayBillTaxTxnHm[tax.taxMasterId]; 
						}
					}
					
					if(taxChrg != null) {
						taxAmount =  taxChrg.taxAmount;
					}
					
					if (tax.taxPercentage) {
						
						tr.append('<td><input type="text" name="tax' + tax['taxMasterId'] + '" id="tax' + tax['taxMasterId'] + '" value = "' + taxAmount + '"'
								 + 'class="form-control text-right" data-tooltip = "' + tax['taxName'] + '" readonly= "readonly"/>'
								 + '<input type="checkbox" id="Perctax' + tax['taxMasterId'] + '" name="Perctax' + tax['taxMasterId'] + '" value="' + tax['taxAmount'].toFixed(2) + '" class="hide" checked="checked"></td>');
					} else {
						tr.append('<td><input type="text" name="tax' + tax['taxMasterId'] + '" id="tax' + tax['taxMasterId'] + '" value = "' + tax['taxAmount'].toFixed(2) + '"'
							 + 'class="form-control text-right" data-tooltip = "' + tax['taxName'] + '" readonly= "readonly"/>'
							 + '<input type="checkbox" id="Perctax' + tax['taxMasterId'] + '" name="Perctax' + tax['taxMasterId'] + '" value="' + tax['taxAmount'].toFixed(2) + '" class="hide" readonly="readonly"></td>');
					}
				  		
					container.append(tr);
				});
			}
			
			var tr = $('<tr id="grandTotalPanel">');
			tr.append('<td><b>Grand Total</b></td>');
			tr.append('<td><input type="text" name="grandTotal" id="grandTotal" value="' + wayBill.wayBillGrandTotal+ '" readonly="readonly" class="form-control text-right" data-tooltip = "Grand Amount"/></td>');
			
			container.append(tr);
			
		},createOptionForSTPaidBy: function(){
			if(lrReturnBookingConfig.showStPaidByNotApplicable) {
				$('#STPaidBy').append("<option value='"+ TAX_PAID_BY_NOT_APPLICABLE_ID +"'>" + TAX_PAID_BY_NOT_APPLICABLE_NAME + "</option>");
			}
			
			if(lrReturnBookingConfig.showStPaidByConsignor) {
				$('#STPaidBy').append("<option value='"+ TAX_PAID_BY_CONSINGOR_ID +"'>" + TAX_PAID_BY_CONSINGOR_NAME + "</option>");
			}
			if(lrReturnBookingConfig.showStPaidByConsignee) {
				$('#STPaidBy').append("<option value='"+ TAX_PAID_BY_CONSINGEE_ID +"'>" + TAX_PAID_BY_CONSINGEE_NAME + "</option>");
			}
			if(lrReturnBookingConfig.showStPaidByTransporter) {
				$('#STPaidBy').append("<option value='"+ TAX_PAID_BY_TRANSPORTER_ID+"'>" + TAX_PAID_BY_TRANSPORTER_NAME + "</option>");
			}
			if(lrReturnBookingConfig.showStPaidByExempted) {
				$('#STPaidBy').append("<option value='"+ TAX_PAID_BY_EXEMPTED_ID +"'>" + TAX_PAID_BY_EXEMPTED_NAME + "</option>");
			}
			
			
		},createOptionForDeliveryTo : function(deliveryToAarray){
			for(var i=0; i < deliveryToAarray.length; i++){
				$('#deliveryTo').append("<option value='"+ deliveryToAarray[i].deliveryAtId +"'>" + deliveryToAarray[i].deliveryAtName + "</option>");
			}
			
		}, createOptionForPodRequiredField: function() {
			if (lrReturnBookingConfig.showPODRequiredFieldAtReturnBooking) {
				$("#podRequiredPanel").load("/ivcargo/jsp/createWayBill/includes/PODRequired.html", function() {
					if (lrReturnBookingConfig.defaultPODRequiredToYes) {
						$('#podRequiredStatus').val('2');
						$('#podRequiredStatus').prop('disabled', true);
					}
					loadPODRequired.resolve();
				});
			} else {
				$("#podRequiredPanel").remove();
			}
		}, createOptionFormType: function() {
			var formTypeArr =(lrReturnBookingConfig.FormTypeIds).split(",");
			
			$('#singleFormTypes').append("<option value='0'>Form Type </option>");
			
			for(var i = 0; i < formTypeMastersArrList.length; i++) {
				if(isValueExistInArray(formTypeArr, formTypeMastersArrList[i].formTypeMasterId)) {
					$('#singleFormTypes').append("<option value='"+ formTypeMastersArrList[i].formTypeMasterId +"'>" + formTypeMastersArrList[i].formTypeName + "</option>");
				}
			}
		},createOptionPaymentType : function(response){
			var PaymentTypeArr =  response.PaymentTypeArr;
						
			for(var i=0; i < PaymentTypeArr.length; i++){
				$('#paymentType').append("<option value='"+ PaymentTypeArr[i].paymentTypeId +"'>" +PaymentTypeArr[i].paymentTypeName + "</option>");
			}
			
		},singleSelectFormType : function(obj){
			
			if(obj.value == E_WAYBILL_ID) {
				$('#eWayBillNumberDiv').removeClass('hide');
			}else {
				$( "#eWayBillNumberDiv").addClass('hide');
			}
			
		},addMultipleEwayBillNo : function(){
			$('.modal-backdrop').show();
			$("#addEwayBillModal").modal({
				backdrop: 'static',
				focus	: this,
				keyboard: false
			});
			
		},viewEwayBillNo : function(){
			
		}, setConsigneeAutoComplete : function(destBranchId) {
			if(lrReturnBookingConfig.allowEditConsignee) {
				$("#consigneeName").autocomplete({
					source: "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18&partyType=2,3&customerType=2&destinationId="+destBranchId+"&responseFilter="+lrReturnBookingConfig.BookingConsigneeNameAutocompleteResponse,
					minLength: 3,
					delay: 20,
					autoFocus: true,
					select: function(e, u) {
	
						$('#consigneeCorpId').val(u.item.id);
						$('#consigneeId').val(u.item.id);
						$('#consigneePartyMasterId').val(u.item.id);
	
						var consigneeId = u.item.id;
	
						if(consigneeId > 0) {
							var jsonObject  = new Object();
	
							jsonObject.filter				= 2;
							jsonObject.getCharge			= 1;
							jsonObject.partyId				= consigneeId;
							jsonObject.partyPanelType		= 1;
							jsonObject.partyType			= 3;
	
							var jsonStr = JSON.stringify(jsonObject);
	
							$.getJSON("Ajax.do?pageId=9&eventId=16",
									{json:jsonStr}, function(data) {
										if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
											showMessage('error', data.errorDescription);
										} else {
											if(!data.partyDetails) {
												return;
											}
											var party = data.partyDetails;
	
											_this.setConsigneeDetails(party);
										}
									});
						}
					},
				});
			}
			

		}, changeWayBillType : function(lrTypeId,response) {
			
			if(lrTypeId == WAYBILL_TYPE_PAID) {
				
				$("*[data-selector='lrType'").html(WAYBILL_TYPE_NAME_PAID);
				$('#DisplayWayBillType').removeClass();
				$('#DisplayWayBillType').addClass('panel-primary');
				$('#wayBillType').val(WAYBILL_TYPE_PAID);
				$('#lrType').val(WAYBILL_TYPE_PAID);
				$('#BillingPartyDetailsConsignor').removeClass("hide").addClass("hide");
				$('.panel-heading').attr('style','background-color :#337ab7;')
				_this.enableDisableCharges(lrTypeId);
				
				if(lrTypeId != wayBill.wayBillTypeId) {
					if(allowToEditAllFeild){
						$("#paymentTypeDiv").removeClass( "hide");
						$("#paymentType").prop( "disabled",false);
						$("#paymentType").val(PAYMENT_TYPE_CASH_ID);
					} else {
						showMessage('error', "You can not change to Paid Lr !");
						return false;
					}
				}	
				
			} else if(lrTypeId == WAYBILL_TYPE_TO_PAY) {
				$("*[data-selector='lrType'").html(WAYBILL_TYPE_NAME_TOPAY);
				$('#DisplayWayBillType').removeClass();
				$('#DisplayWayBillType').addClass('panel-danger');
				$('#wayBillType').val(WAYBILL_TYPE_TO_PAY);
				$('#lrType').val(WAYBILL_TYPE_TO_PAY);
				$('#BillingPartyDetailsConsignor').removeClass("hide").addClass("hide");
				$('.panel-heading').attr('style','background-color :#e32b2b;');
				$('.panel-heading').css({"color" : "white"});
				
				_this.enableDisableCharges(lrTypeId);
				_this.setWayBillBookingChargesData(response);
				
			} else if(lrTypeId == WAYBILL_TYPE_CREDIT) {
				
				$("*[data-selector='lrType'").html(WAYBILL_TYPE_NAME_CREDITOR);
				$('#DisplayWayBillType').removeClass();
				$('#DisplayWayBillType').addClass('panel-info');
				$('#wayBillType').val(WAYBILL_TYPE_CREDIT);
				$('#lrType').val(WAYBILL_TYPE_CREDIT);
				$('#BillingPartyDetailsConsignor').removeClass('hide');
				$('.panel-heading').attr('style','background-color :#4baad9;');
				$('.panel-heading').css({"color" : "white"});
				
				_this.enableDisableCharges(lrTypeId);
				_this.setWayBillBookingChargesData(response);
				
			} else if(lrTypeId == WAYBILL_TYPE_FOC) {
				
				$("*[data-selector='lrType'").html(WAYBILL_TYPE_NAME_FOC);
				$('#DisplayWayBillType').switchClass('panel-info', 'panel-success');
				$('#wayBillType').val(WAYBILL_TYPE_FOC);
				$('#lrType').val(WAYBILL_TYPE_FOC);
				$('#BillingPartyDetailsConsignor').removeClass("hide").addClass("hide");
				$('.panel-heading').attr('style','background-color :#4ebb21;');
				$('.panel-heading').css({"color" : "white"});
				$('#discount').val('0');
				$('#totalAmt').val('0');
				$('#grandTotal').val('0');
				
				_this.enableDisableCharges(lrTypeId);
			}
			
			if(lrTypeId != WAYBILL_TYPE_PAID && allowToEditAllFeild){
				$("#paymentTypeDiv").addClass( "hide");
				$("#paymentType").val(0);
			}
			
			return true;
		}, enableDisableCharges : function(lrTypeId) {
			
			var charges	= jsondata.bookingCharges;
			
			for ( var i = 0; i < charges.length; i++) {
				if(lrTypeId == WAYBILL_TYPE_FOC) {
					$('#charge'+charges[i].chargeTypeMasterId).attr("disabled", true);
					$('#charge'+charges[i].chargeTypeMasterId).val(0);
				} else {
					$('#charge'+charges[i].chargeTypeMasterId).attr("disabled", false);
				}
			}
			
			if(lrTypeId == WAYBILL_TYPE_FOC) {
				$('#fixAmount').attr("disabled", true);
				$('#discount').attr("disabled", true);
				$('#isDiscountPercent').attr("disabled", true);
				$('#discountTypes').attr("disabled", true);
			} else {
				$('#fixAmount').attr("disabled", false);
				$('#discount').attr("disabled", false);
				$('#isDiscountPercent').attr("disabled", false);
				$('#discountTypes').attr("disabled", false);
			}
			
		},setConsignorDetails : function(partyDetails) {

			if(partyDetails != undefined) {

				$('#consignorPhn').val(partyDetails.mobileNumber);
				$('#consignorGstn').val(partyDetails.gstn);
				$('#consignorAddress').val(partyDetails.address);

				isTBBPartyInConsignorName = partyDetails.tBBParty;

				if(isTBBPartyInConsignorName) {
					$('#billingPartyName').val(partyDetails.displayName);
					$('#billingPartyId').val(partyDetails.corporateAccountId);
					$('#partyOrCreditorId').val(partyDetails.corporateAccountId);
				}
			}

		}, setConsigneeDetails : function(partyDetails) {
			
			if(partyDetails != undefined) {
				
				$('#consigneePhn').val(partyDetails.mobileNumber);
				$('#consigneeGstn').val(partyDetails.gstn);
				$('#consigneeAddress').val(partyDetails.address);
			}
			
		}, setTbbPartyDetails : function(partyDetails) {
			
			if(partyDetails != undefined) {
				
			}
			
		}, validateAddArticle : function() {
			
			var consignorName 	 = $('#consignorName').val();
			var consigneeName 	 = $('#consigneeName').val();
			var billingPartyName = $('#billingPartyName').val();
			
			if ((lrReturnBookingConfig.ConsignorNameAutocomplete  || lrReturnBookingConfig.ConsignorNameAutocomplete == 'true') 
					&& consignorName.trim().length == 0) {
				if(Number($('#partyMasterId').val()) == 0) {
					setTimeout(function(){ 
						$('#consignorName').focus(); 
						showMessage('error', " Please Select Party From Suggestion !");	
						$('#consignorName').val('');
						changeTextFieldColor('consignorName', '', '', 'red');
					}, 200);

					return false;
				}
			}
			
			if ((lrReturnBookingConfig.ConsigneeNameAutocomplete || lrReturnBookingConfig.ConsigneeNameAutocomplete == 'true') 
					&& consigneeName.trim().length == 0) {
				if(Number($('#consigneePartyMasterId').val()) == 0) {
					setTimeout(function(){ 
						$('#consigneeName').focus(); 
						showMessage('error', " Please Select Party From Suggestion !");	
						$('#consigneeName').val('');
						changeTextFieldColor('consigneeName', '', '', 'red');
					}, 200);

					return false;
				}
			}
			
			var waybillTypeId		= Number($('#lrType').val());
			
			if(waybillTypeId == WAYBILL_TYPE_CREDIT) {
				
				if ((lrReturnBookingConfig.BillingPartyNameAutocomplete || lrReturnBookingConfig.BillingPartyNameAutocomplete =='true' ) 
						&& billingPartyName.trim().length == 0) {
					if(Number($('#billingPartyId').val()) == 0) {
						
						setTimeout(function(){ 
							$('#billingPartyName').focus(); 
							showMessage('error', " Please Select Party From Suggestion !");	
							$('#billingPartyName').val('');
							changeTextFieldColor('billingPartyName', '', '', 'red');
						}, 200);
						return false;
					}
				}
			}

			
			return true;
		}, resetDestinationPointData : function() {
			$('#destinationBranchId').val(0);
			$('#destinationStateId').val("0");
			$('#typeOfLocation').val("0");
		},resetConsignor : function() {
			$('#consignorName').val("");
			$('#consignorPhn').val("");
			$('#consignorGstn').val("");
			$('#consignorAddress').val("");
			$('#consignorPin').val("");
			$('#consignorContactPerson').val("");
			$('#consignorEmail').val("");
			$('#consignorDept').val("");
			$('#consignorFax').val("");
			$('#consignorCorpId').val(0);
			$('#partyMasterId').val("0");
			$('#partyOrCreditorId').val("0");
			$('#consignorPincode').val("");
			$('#consignorTin').val('');
		}, resetConsignee : function() {
			$('#consigneeName').val("");
			$('#consigneePhn').val("");
			$('#consigneeGstn').val("");
			$('#consigneeAddress').val("");
			$('#consigneePin').val("");
			$('#consigneeContactPerson').val("");
			$('#consigneeEmail').val("");
			$('#consigneeDept').val("");
			$('#consigneeFax').val("");
			$('#consigneeCorpId').val("0");
			$('#consigneePartyMasterId').val("0");
			$('#consigneePincode').val("");
			$('#consigneeTin').val('');
		}, resetBillingParty : function() {
			if ($('#wayBillType').val() == WAYBILL_TYPE_CREDIT) {
				$('#billingPartyId').val(0);
				$('#billingPartyName').val("");
				$('#billingPartyCreditorId').val("0");
			}
		},addConsignment : function(response) {
			var consignmentDetails				= null
			
			if(lrReturnBookingConfig.autoCalculateNewLrFreight && response.consignmentDetailsList != undefined) {
				consignmentDetails				= response.consignmentDetailsList;
			} else {
				consignmentDetails				= response.CONSIGNMENTDETAILS;
			}
			
			for(var i = 0 ;i < consignmentDetails.length;i++ ) {
				if(isAddLeftTable('leftTable', 'rightTable')) {
					 _this.addConsignmentRow(consignmentDetails[i],'rightTable');
					$("#rightTable").removeClass('hide');
				} else {
					_this.addConsignmentRow(consignmentDetails[i],'leftTable');
					$("#leftTable").removeClass('hide');
				}
			}
			
		}, addConsignmentRow : function(consignmentDetails,tableBodyId) {
			var zero 				= 0;
			var copyStr				= null;
			
			var NewRow 	= createRowInTable('', '', '');
			var one 	= createColumnInRow(NewRow, '', 'datatd', '5%', '', 'display : none', '');
			var two 	= createColumnInRow(NewRow, "quantity" + idNum, 'datatd', '5%', '', '', '');
			var three 	= createColumnInRow(NewRow, '', 'datatd', '13%', '', '', '');
			var four 	= createColumnInRow(NewRow, "typeofPackingId" + idNum, 'datatd', '13%', '', 'display : none', '');
			var five 	= createColumnInRow(NewRow, '', 'datatd', '12%', '', '', '');
			var six 	= createColumnInRow(NewRow, "qtyAmount" + idNum, 'datatd', '8%', '', '', '');
			var seven 	= createColumnInRow(NewRow, '', 'datatd', '7%', '', '', '');
			var eight 	= createColumnInRow(NewRow, "consignmentGoodsId" + idNum, 'datatd', '5%', '', 'display : none', '');
			
			if(lrReturnBookingConfig.autoCalculateNewLrFreight) {

				if(Number($('#chargeType').val()) == CHARGETYPE_ID_QUANTITY) {
					let packingTypeMasterId		= consignmentDetails.packingTypeMasterId;
					let consignmentGoodsId		= consignmentDetails.consignmentGoodsId;

					if(typeof qtyTypeWiseRateHM != 'undefined') {
						if(qtyTypeWiseRateHM.hasOwnProperty(packingTypeMasterId)) {
							appendValueInTableCol(six, qtyTypeWiseRateHM[packingTypeMasterId + "_" + consignmentGoodsId]);
							appendValueInTableCol(seven, parseFloat(consignmentDetails.quantity * qtyTypeWiseRateHM[packingTypeMasterId + "_" + consignmentGoodsId]));

							copyStr		= escape(consignmentDetails.packingTypeMasterId+'_'+zero+'_'+zero+'_'+zero+'_'+zero+'_'+zero+'_'+qtyTypeWiseRateHM[packingTypeMasterId + "_" + consignmentGoodsId]+'_'+consignmentDetails.quantity+'_'+consignmentDetails.saidToContain+'_'+consignmentDetails.consignmentGoodsId+'_'+consignmentDetails.packingTypeName).replace(/\+/g,'%2b');
						} else {
							appendValueInTableCol(six, consignmentDetails.amount);
							appendValueInTableCol(seven, parseFloat(consignmentDetails.quantity * consignmentDetails.amount));

							copyStr		= escape(consignmentDetails.packingTypeMasterId+'_'+zero+'_'+zero+'_'+zero+'_'+zero+'_'+zero+'_'+consignmentDetails.amount+'_'+consignmentDetails.quantity+'_'+consignmentDetails.saidToContain+'_'+consignmentDetails.consignmentGoodsId+'_'+consignmentDetails.packingTypeName).replace(/\+/g,'%2b');
						}
					} else {
						appendValueInTableCol(six, consignmentDetails.amount);
						appendValueInTableCol(seven, parseFloat(consignmentDetails.quantity * consignmentDetails.amount));

						copyStr		= escape(consignmentDetails.packingTypeMasterId+'_'+zero+'_'+zero+'_'+zero+'_'+zero+'_'+zero+'_'+consignmentDetails.amount+'_'+consignmentDetails.quantity+'_'+consignmentDetails.saidToContain+'_'+consignmentDetails.consignmentGoodsId+'_'+consignmentDetails.packingTypeName).replace(/\+/g,'%2b');
					}
				} else {
					appendValueInTableCol(six, consignmentDetails.amount);
					appendValueInTableCol(seven, parseFloat(consignmentDetails.quantity * consignmentDetails.amount));

					copyStr		= escape(consignmentDetails.packingTypeMasterId+'_'+zero+'_'+zero+'_'+zero+'_'+zero+'_'+zero+'_'+consignmentDetails.amount+'_'+consignmentDetails.quantity+'_'+consignmentDetails.saidToContain+'_'+consignmentDetails.consignmentGoodsId+'_'+consignmentDetails.packingTypeName).replace(/\+/g,'%2b');
				}

			} else {
				appendValueInTableCol(six, consignmentDetails.amount);
				appendValueInTableCol(seven, parseFloat(consignmentDetails.quantity * consignmentDetails.amount));
				
				copyStr		= escape(consignmentDetails.packingTypeMasterId+'_'+zero+'_'+zero+'_'+zero+'_'+zero+'_'+zero+'_'+consignmentDetails.amount+'_'+consignmentDetails.quantity+'_'+consignmentDetails.saidToContain+'_'+consignmentDetails.consignmentGoodsId+'_'+consignmentDetails.packingTypeName).replace(/\+/g,'%2b');
			}
			
			var str 		= copyStr;
			
			//setting Consignment Details
			appendValueInTableCol(one, "<input name='checkbox2' id='checkbox2' type=checkbox value='"+str+"'>");
			appendValueInTableCol(two, consignmentDetails.quantity);
			appendValueInTableCol(three, consignmentDetails.packingTypeName);
			appendValueInTableCol(four, consignmentDetails.packingTypeMasterId);
			appendValueInTableCol(five, consignmentDetails.saidToContain);
			appendValueInTableCol(eight, consignmentDetails.consignmentGoodsId);
			
			appendRowInTable(tableBodyId, NewRow);
			
		}, editChargedWeight : function(obj) {
			var actualWeight  		= parseFloat($('#actualWeight').val());
			var chargedWeight 		= parseFloat(obj.value);
			
			if(chargedWeight < actualWeight) {
				showMessage('info', chargedWeightLessThanInfoMsg(actualWeight));
				_this.calculateChargedWeight('actualWeight');
				return false;
			}
		}, checkIfLRNumberExist : function(response) {
			isDuplicateLR	= response.isDuplicateLR;
			
			if(response.message != undefined) {
				hideLayer();
				var errorMessage 	= response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			}
			
			if(isDuplicateLR) {
				setTimeout(function(){ $('#newManualLrNumber').focus(); }, 10);
				return;
			} else {
				_this.generateCr();
			}
			
		}, basicFormValidation : function() {
			
			var consignorName 	 = $('#consignorName').val();
			var consigneeName 	 = $('#consigneeName').val();
			var billingPartyName = $('#billingPartyName').val();
			
			if(wayBill.wayBillTypeId == WAYBILL_TYPE_NAME_TOPAY) {
				if(parseFloat($('#totalAmt').val(total)) < wayBill.bookingTotal) {
					showMessage('error', 'You can not enter amount less than the Original Amount ');
					return false;
				}
			}
			
			if(lrReturnBookingConfig.showManualLrNumberFieldInReturnBooking) {
				
				if(!validateInputTextFeild(1, 'newManualLrNumber', 'newManualLrNumber', 'error', lrNumberErrMsg)) {
					setTimeout(function(){ $('#newManualLrNumber').focus(); }, 0);
					return false;
				}
				
				var lrNumber = $('#newManualLrNumber').val();
				
				if(lrNumber.length != Number(lrReturnBookingConfig.allowedLenghtForManualLR)){
					showMessage('error', 'LR Number length should  be Equal to  '+Number(lrReturnBookingConfig.allowedLenghtForManualLR)+' !');
					changeTextFieldColor('newManualLrNumber', '', '', 'red');
					return false;
				}
			}
			
			if (!validateInputTextFeild(1, 'sourceBranch', 'sourceBranch', 'error', sourceBranchErrMsg)) {
				return false;
			}

			if (!validateInputTextFeild(1, 'destination', 'destination', 'error', destinationErrMsg)) {
				return false;
			}

			if(!validateInputTextFeild(1, 'destinationBranchId', 'destination', 'info', properDestinationErrMsg)) {
				return false;
			}

			if(!validateInputTextFeild(1, 'consignorName', 'consignorName', 'error', consinorNameErrMsg)) {
				return false;
			}

			if (lrReturnBookingConfig.ConsignorNameAutocomplete && Number($('#partyMasterId').val()) >= 0) {
				if (consignorName.length <= 0) {
					setTimeout(function() {
						$('#consignorName').focus();
						showMessage('error', " Please Select Party From Suggestion !");
						$('#consignorName').val('');
						changeTextFieldColor('consignorName', '', '', 'red');
					}, 200);

					return false;
				}
			}

			if(!validateInputTextFeild(1, 'consigneeName', 'consigneeName', 'error', consineeNameErrMsg)) {
				return false;
			}

			if (lrReturnBookingConfig.ConsigneeNameAutocomplete && consigneeName.length > 0) {
				if(Number($('#consigneePartyMasterId').val()) == 0) {
					setTimeout(function(){ 
						$('#consigneeName').focus(); 
						showMessage('error', " Please Select Party From Suggestion !");	
						$('#consigneeName').val('');
						changeTextFieldColor('consigneeName', '', '', 'red');
					}, 200);

					return false;
				}
			}
			
			if($('#lrType').val() == WAYBILL_TYPE_CREDIT) {
				if (lrReturnBookingConfig.BillingPartyNameAutocomplete && billingPartyName.length > 0) {
					if(Number($('#billingPartyId').val()) == 0) {
						setTimeout(function(){ 
							$('#billingPartyName').focus(); 
							showMessage('error', " Please Select Party From Suggestion !");	
							$('#billingPartyName').val('');
							changeTextFieldColor('billingPartyName', '', '', 'red');
						}, 200);
						return false;
					}
				}
			}

						
			if($('#lrType').val() != WAYBILL_TYPE_FOC) {
				if(!validateInputTextFeild(1, 'fixAmount', 'fixAmount', 'error', fixAmountRequiredErrMsg)) {
					return false;
				}
			}

						
			if($('#lrType').val() != WAYBILL_TYPE_FOC) {
				if(!_this.validateGrandTotal()) {
					return false;
				}
			}

			return true;
		},validateGrandTotal : function() {
			var grandTotal = $('#grandTotal').val();
			
			if(grandTotal <= 0) {
				showMessage('error', 'Grand Total Should Be Greater Than 0');
				changeTextFieldColor('grandTotal', '', '', 'red');
				return false;
			}
			return true;
		},processReturnBooking :function(){
			if(!_this.basicFormValidation()) {
				return false;
			}
			
			if(lrReturnBookingConfig.showManualLrNumberFieldInReturnBooking) {
					var jsonObject	= new Object();
					
					jsonObject.lrNumberManual	= Number($('#newManualLrNumber').val());
					getJSON(jsonObject, WEB_SERVICE_URL + '/wayBillWS/checkDuplicateLR.do?', _this.checkIfLRNumberExist, EXECUTE_WITH_ERROR);
			} else {
				_this.generateCr();
			}
			
		},generateCr : function(){
			
			btModalConfirm = new Backbone.BootstrapModal({
				content		: 	"Are you sure want to Delivered Old LR and Create New LR For Retrun ?",
				modalWidth 	: 	30,
				title		:	'Add Seleted LRs',
				okText		:	'YES',
				showFooter 	: 	true,
				okCloses	:	true
			}).open();
		
			btModalConfirm.on('ok', function() {
				_this.generateCrForOldNewWayBill();
			});
			
			
		},generateCrForOldNewWayBill : function(){
			showLayer();
			var jsonObject  	= new Object();
			
			jsonObject.waybillId 			= wayBill.wayBillId;	
			jsonObject.isReturnBookingLR	= true;	
			getJSON(jsonObject, WEB_SERVICE_URL + '/deliveryWayBillWS/generateCRForRetrunLR.do?', _this.saveNewWayBill, EXECUTE_WITHOUT_ERROR);
						
			
		},saveNewWayBill : function(data) {
			var crId			= 0;
			var jsonObject		= new Object();
			crId	= data.crId;
			if(crId > 0) {
				showMessage('success', 'LR is Delivered Sucessfully');
				
				_this.setJsonDataforCreateWayBill(jsonObject);
				
				hideLayer();
				jsonObject.filter				= 2;
				jsonObject.isReturnBookingLR	= true;
				jsonObject.preWayBillId			= wayBill.wayBillId;
				jsonObject.redirectTo			= 1;
				
				if(lrReturnBookingConfig.showManualLrNumberFieldInReturnBooking) {
					jsonObject.isManual			= true;
				}
				
				$("#save").addClass('hide');
				
				var jsonStr = JSON.stringify(jsonObject);
				showLayer();

				doneTheStuff = true;

				$.getJSON("WayBillAjaxAction.do?pageId=3&eventId=13",
						{json:jsonStr}, function(data) {
							if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
								showMessage('error', iconForErrMsg + ' ' + data.errorDescription);
								hideLayer();
								return false;
							} else {
								var rediredtObj = new Object();
								showMessage('error', "Lr Is Booked For Returned");
								rediredtObj["redirectTo"] = 1;
								rediredtObj["wayBillId"]  = data.waybillId;
								_this.resetAllData();
								
								$("#save").removeClass('hide');
								doneTheStuff = false;
								hideLayer();
								redirectToAfterUpdate(rediredtObj)
							}
						});
				
			}
			
		}, setJsonDataforCreateWayBill : function(jsonObject) {
			
			var manualLRDate				= Moment().format('DD-MM-YYYY');
			
			jsonObject.wayBillType			= Number($('#wayBillType').val());
			jsonObject.wayBillTypeId		= Number($('#wayBillType').val());
			jsonObject.bookingType			= Number($('#bookingType').val());
			jsonObject.lrNumberManual		= $('#newManualLrNumber').val().toUpperCase();
			jsonObject.manualLRDate			= manualLRDate;
			jsonObject.sourceBranchId		= $('#sourceBranchId').val();
			jsonObject.destinationBranchId	= $('#destinationBranchId').val();
			jsonObject.chargeTypeId			= $('#chargeType').val();
			jsonObject.consignorCorpId		= $('#consignorCorpId').val();
			jsonObject.billingPartyId		= $('#billingPartyId').val();
			jsonObject.partyMasterId		= $('#partyMasterId').val();
			jsonObject.consignorName		= $('#consignorName').val();
			jsonObject.billingPartyName		= $('#billingPartyName').val();
			jsonObject.consignorAddress		= $('#consignorAddress').val();
			jsonObject.STPaidBy				= $('#STPaidBy').val();
			jsonObject.deliveryTo			= $('#deliveryTo').val();
			jsonObject.chargeType			= $('#chargeType').val();	
			
			if ($('#consignorPhn').val() != "0000000000") {
				jsonObject.consignorPhn			= $('#consignorPhn').val();
			}
			
			jsonObject.consignorGstn			= $('#consignorGstn').val();
			jsonObject.consigneePartyMasterId	= $('#consigneePartyMasterId').val();
			jsonObject.consigneeName			= $('#consigneeName').val();
			jsonObject.consigneeAddress			= $('#consigneeAddress').val();
			
			if ($('#consigneePhn').val() != "0000000000") {
				jsonObject.consigneePhn			= $('#consigneePhn').val();
			}
			
			jsonObject.consigneeGstn		= $('#consigneeGstn').val();
			jsonObject.consignmentAmount	= $("#charge" + FREIGHT).val();
			
			jsonObject.actualWeight			= $('#actualWeight').val();
			jsonObject.chargedWeight		= $('#chargedWeight').val();
			jsonObject.privateMark			= $('#privateMark').val();
			jsonObject.declaredValue		= $('#declaredValue').val();
			jsonObject.invoiceNumber		= $('#invoiceNo').val();
					
			var checkboxarray	= "";

			$("input[name='checkbox2']").each( function () {
				checkboxarray	+= $(this).val() + "~";
			});
			jsonObject.checkbox2		= checkboxarray;
			if(wayBill.wayBillTypeId == WAYBILL_TYPE_PAID) {
				_this.getChequeDetails(jsonObject)
			}
			_this.getChargeDetails(jsonObject);
			
			jsonObject.billSelection	= billSelectionId;
			jsonObject.podRequired		= $('#podRequiredStatus').val();
			
		},getChequeDetails :function (jsonObject) {
			jsonObject.paymentType		= $('#paymentType').val();
			jsonObject.chequeDate		= $('#chequeDate').val();
			jsonObject.chequeNumber		= $('#chequeNo').val();
			jsonObject.chequeAmount		= $('#chequeAmount').val();
			jsonObject.payerName		= $('#payerName').val();
			jsonObject.bankName			= $('#bankName').val();
			jsonObject.bankNameId		= $('#bankName_primary_key').val();
			jsonObject.accountNo		= $('#accountNo').val();
			jsonObject.bankAccountId	= $('#accountNo_primary_key').val();
			jsonObject.bankAccountId	= $('#accountNo_primary_key').val();
		}, resetAllData : function() {
			$('#sourceBranch').val('');
			$('#srcBranchId').val('0');
			$('#sourceBranchId').val(0);
	    	$('#sourceStateId').val(0);
			$('#sourceRegionId').val(0);
	    	$('#sourceSubRegionId').val(0);
			$('#destination').val('');
			$('#destBranchId').val(0);
			$('#branchId').val('0');
			$('#destinationRegionId').val(0);
			$('#lrNumberManual').val('');
			$('#manualLRDate').val('');
			$('#actualWeight').val("0");
			$('#chargedWeight').val("0");
			$('#weigthFreightRate').val("0");
			$('#weightAmount').val("0");
			$('#billingPartyName').val("");
			$('#consignorName').val("");
			$('#consignorPhn').val("");
			$('#consignorGstn').val("");
			$('#consignorAddress').val("");
			$('#consignorPin').val("");
			$('#consignorContactPerson').val("");
			$('#consignorCorpId').val(0);
			$('#partyMasterId').val("0");
			$('#partyOrCreditorId').val("0");
			$('#consigneeName').val("");
			$('#consigneePhn').val("");
			$('#consigneeGstn').val("");
			$('#consigneeAddress').val("");
			$('#consigneePin').val("");
			$('#consigneeContactPerson').val("");
			$('#consigneeCorpId').val("0");
			$('#consigneePartyMasterId').val("0");
			$('#destinationBranchId').val(0);
			$('#destinationStateId').val("0");
			$('#typeOfLocation').val("0");
			$('#destination').val("");
			$('#privateMark').val('');
			$('#fixAmount').val('0');
			$('#declaredValue').val('0');
			$('#totalAmt').val('0');
			$('#discount').val('0');
			$('#discountTypes').val('0');
			$('#grandTotal').val('0');
			isDuplicateLR	= false;
		},openWindowForView : function(id, branchId) {
			window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId=' + id + '&NumberType=' + LR_SEARCH_TYPE_ID + '&BranchId=' + branchId);
		},getChargeDetails :function(jsonObject) {
			var charges	= jsondata.bookingCharges;
			
			var chargesColl = new Array(); 
			for ( var i = 0; i < bookingCharges.length; i++) {
				jsonObject[$('#charge'+bookingCharges[i].chargeTypeMasterId).attr("id")] = $('#charge'+bookingCharges[i].chargeTypeMasterId).val();

				chargesColl[bookingCharges[i].chargeTypeMasterId] = $('#charge'+charges[i].chargeTypeMasterId).val()

			}
			jsonObject.bookingCharges = chargesColl;
		},allowToEditAllInput : function(){
			$("#bookingType ").prop( "disabled", false);
				$("#lrNumberManual ").prop( "readonly", false );
				//$("#previusLRDate ").prop( "readonly", false );
				$("#actualWeight ").prop( "readonly", false );
				$("#chargedWeight ").prop( "readonly", false );
				$("#weightRate ").prop( "readonly", false );
				$("#weigthFreightRate ").prop( "readonly", false );
				$("#weightAmount ").prop( "readonly", false );
				$("#invoiceNo ").prop( "readonly", false );
				$("#declaredValue ").prop( "readonly", false );
				$("#deliveryTo ").prop( "disabled", false );
				$("#STPaidBy ").prop( "disabled", false );
				$("#paymentType ").prop( "disabled", false );
				$("#lrType").prop( "disabled", false );
		}
	});
});

function setBlankAmount(obj) {
	if(obj.value=='0') {
		obj.value='';
	}
}

function setFocusForBookingCharges(event) {
	if(getKeyCode(event) == 13) {
		initialiseFocus();
	}
}

function allowNumbersOnly(evt) {

	var keynum 		= null;
	var returnType	= true;

	if(window.event){ // IE
		keynum = evt.keyCode;
	} else if(evt.which){ // Netscape/Firefox/Opera
		keynum = evt.which;
	}

	if(keynum != null) {
		if(keynum == 8) {
			hideAllMessages();
			return true;
		} else if (keynum < 48 || keynum > 57 ) {
			returnType =  false;
		}
	}

	if(returnType == false){
		return false;
	}
	return true;
}

function setFreightAmount() {
	
	var fixAmount = $('#fixAmount').val();
	
	if(fixAmount > 0 && !isNaN(fixAmount)) {
		$('#charge'+FREIGHT).val(fixAmount);
	}
}

function getChargesTotal() {
	
	var total	= 0;

	for (const element of bookingCharges) {
		var chargeMasterId	= element.chargeTypeMasterId;

		if ($("#charge"+chargeMasterId).val() != "") {
			total += parseFloat($("#charge"+chargeMasterId).val());
		}
	}
	
	$('#totalAmt').val(total);
	
}


function isValidForPercentage() {
	
	var discountValue = $('#discount').val();
	
	if(discountValue > 100) {
		$("#isDiscountPercent").prop("disabled", true);
	} else {
		$("#isDiscountPercent").prop("disabled", false);
	}
}

function calcGrandtotal() {
	getChargesTotal();
	var amount 		= parseFloat($("#totalAmt").val());
	$("#grandTotal").val(Math.round(amount));
}

function calculateGSTTaxes(){
	var taxPaidByVal			= $('#STPaidBy').val();
	
	var isGSTNumberAvailable	= checkGSTNumberAvailable();
	var leastTaxableAmount		= 0;
	var taxAmount				= 0;
	var sourceBranchStateId			= $('#sourceStateId').val();	
	var destinationBranchStateId	= $('#destinationStateId').val();	
	var grandtotal					= $('#grandTotal').val();
	var amount 						= parseFloat($("#totalAmt").val());
	
	if(!jQuery.isEmptyObject(taxes)) {
		
		for (var i = 0; i < taxes.length; i++) {
			var tax				= taxes[i];
			taxAmount			= 0.00;
			leastTaxableAmount	= tax.leastTaxableAmount;
			/*
			 * destnationBranchId is set in autocomplete.js 
			*/
								
			if(parseInt(taxPaidByVal) == TAX_PAID_BY_TRANSPORTER_ID) {
					if (tax.taxPercentage) {
						if(parseInt(sourceBranchStateId) == parseInt(destinationBranchStateId)) {
							if(tax.taxMasterId == SGST_MASTER_ID || tax.taxMasterId == CGST_MASTER_ID) {
								if (typeof allowRateInDecimal !== 'undefined' && allowRateInDecimal == 'true') {
									taxAmount	= Number(((tax.taxAmount)* amount / 100).toFixed(2)) ;
								} else {
									taxAmount	= Number(((tax.taxAmount) * amount / 100).toFixed(2));
								}
								
								$('#tax' + tax.taxMasterId).val(taxAmount);
							}
						} else if(tax.taxMasterId == IGST_MASTER_ID) {
							taxAmount	= Number(((tax.taxAmount) * (amount / 100)).toFixed(2));
							$('#tax' + tax.taxMasterId).val(taxAmount);
						}
						
						if(!isGSTNumberAvailable)
							grandtotal	= parseInt(grandtotal) + taxAmount;
					} else if(!isGSTNumberAvailable)
						grandtotal	= grandtotal + parseFloat($('#tax' + tax.taxMasterId).val());
			} else
				$('#tax' + tax.taxMasterId).val(taxAmount);
			
			if(isGSTNumberAvailable)
				$('#tax' + tax.taxMasterId).val(0.00);
		}
	}
	
	$('#grandTotal').val(grandtotal);
}

function checkGSTNumberAvailable() {
	var consignorGSTNVal		= $('#consignorGstn').val();
	var consigneeGSTNVal		= $('#consigneeGstn').val();
	var isGSTNumberAvailable	= true;
	var allowGSTOnTransporterAtAnyCondition	= lrReturnBookingConfig.allowGSTOnTransporterAtAnyCondition;
	
	if(typeof allowGSTOnTransporterAtAnyCondition !== 'undefined' && (allowGSTOnTransporterAtAnyCondition == true || allowGSTOnTransporterAtAnyCondition == 'true')) {
		return false;
	}
	
	
	if(jQuery.isEmptyObject(consignorGSTNVal) && jQuery.isEmptyObject(consigneeGSTNVal)) {
		isGSTNumberAvailable	= false;
	}
	
	
	return isGSTNumberAvailable;
}


function isAddLeftTable(leftTableId,rightTableId){
	leftTable=document.getElementById(leftTableId);
	rightTable=document.getElementById(rightTableId);
	if(leftTable.rows.length<rightTable.rows.length || leftTable.rows.length==rightTable.rows.length )
		return false;
	else return true;
}

function isValueExistInArray(arr, value) {

	for(var i = 0; i < arr.length; i++) {
		if(arr[i] == value) {
			return true;
		}
	}
	
	return false;
}

function addNewRow() {
	var inputCount = document.getElementById('eWayBillNumberId').getElementsByTagName('input').length;
	for(var i = 0; i < inputCount; i++) {
		var ewaybillVal		= $('#ewaybill' + i).val();
		if(ewaybillVal == '') {
			showMessage('error', 'Enter E-Way Bill Number');
			$('#ewaybill' + i).css('border-color', 'red');
			$('#ewaybill' + i).focus();
			return false;
		} else if(ewaybillVal!= null && ewaybillVal.length != 12) {
			showMessage('error', '<i class="fa fa-times-circle"></i> Enter 12 digit E-Way Bill Number');
			$('#ewaybill' + i).focus();
			next	= "ewaybill"+ i;
			return false;
		}
	}

	$('#ewaybill0')
	.clone().val('')      // CLEAR VALUE.
	.attr('style', 'margin:3px 0;')
	.attr('id', 'ewaybill' + textBoxCount)     // GIVE IT AN ID.
	.appendTo("#eWayBillNumberId");

	textBoxCount = textBoxCount + 1;
	var	count	= textBoxCount-1;
		next	= "ewaybill"+count;
		$('#ewaybill'+count).focus();
	
}
function validateEwayBillNo() {
	if($('#eWayBillExempted').prop('checked')){
		return false;
	}
	return true;
 }
function resetModel() {
	var textBoxCount = document.getElementById('eWayBillNumberId').getElementsByTagName('input').length;
	$('#ewaybill0').val('');
	if (textBoxCount != 1) {
		for(var i = 1; i < textBoxCount; i++) {
			
			$('#ewaybill' + i).remove();
		}
	}
}