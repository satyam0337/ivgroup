var configuration	= {};
var wayBillId;
var bookingTotal = 0.00;
var paymentTypeArr = null;
var moduleId = 0;
var ModuleIdentifierConstant  = {};
var PaymentTypeConstant	= {};
var deliveryPaymentTypeId	= 0;
var partialArticleDetailsList = null;
var totalPendingQty = 0;
var lrFullyDelivered = true;
var taxes;
var changeStPaidbyOnPartyGSTN = false;
var deliveryConfiguration = {};
define(
		[
			'/ivcargo/resources/js/generic/urlparameter.js',
			PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js',
			'JsonUtility',
			'messageUtility',
			'bootstrapSwitch',
			'nodvalidation',
			'focusnavigation',
			PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
			'/ivcargo/resources/js/validation/regexvalidation.js',
			'/ivcargo/resources/js/module/generatecr/calculateDeliveryGSTTax.js',
			'/ivcargo/js/generic/CreateDOM.js'],
			function(UrlParameter, Selection) {
			'use strict';
			let jsonObject = new Object(), myNod, _this = '', addDlyCharges = [], sourceBranchStateId = 0, destinationBranchStateId = 0, consignorGstn, consigneeGstn, consignorCorpId, consigneeCorpId, billingPartyId, cosignorId,
			paymentReceivedFlag	= false, deliveryCharges, wayBillTypeId = 0, crDetailsObj = null;
			return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/generatePartialCRWS/loadPartialDelivery.do?', _this.renderPartialDeliveryElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, renderPartialDeliveryElements : function(response) {
					showLayer();
					
					let loadelement = new Array();
					let baseHtml 	= new $.Deferred();
					let paymentHtml = new $.Deferred();
					
					loadelement.push(baseHtml);
					loadelement.push(paymentHtml);

					$("#mainContent").load("/ivcargo/html/module/delivery/partialDelivery.html", function() {
						baseHtml.resolve();
					});
					
					$("#bankPaymentOperationPanel").load("/ivcargo/html/module/paymentTypeSelection/paymentTypeSelectionTce.html", function() {
						paymentHtml.resolve();
					});

					$.when.apply($, loadelement).done(function() {
						setIssueBankAutocomplete();
						setAccountNoAutocomplete();
						hideLayer();
						$("#lrNumberEle").focus();
						
						paymentTypeArr				= response.paymentTypeArr;
						moduleId					= response.moduleId;
						PaymentTypeConstant			= response.PaymentTypeConstant;
						deliveryConfiguration		= response;
						configuration				= response;
						
						let elementConfiguration	= {};
						
						elementConfiguration.billingPartyNameElement	= $('#billingPartyNameEle');
						
						response.billingPartySelectionWithSelectize	= true;
						response.elementConfiguration	= elementConfiguration;
						
						Selection.setSelectionToGetData(response);

						myNod = nod();
						myNod.configure({
							parentClass:'validation-message'
						});
						
						myNod.add({
							selector: '#lrNumberEle',
							validate: 'presence',
							errorMessage: 'Enter LR Number !'
						});

						$("#lrNumberEle").keyup(function(event) {
							let key	= getKeyCode(event);
							
							if (key == 8 || key == 46) {
								_this.resetAllField();
								$('#bottom-border-boxshadow').addClass('hide');
								return;
							}
							
							myNod.performCheck();

							if(myNod.areAll('valid') && key == 13)
								_this.onFind();
						});
						
						$("#deliver").click(function() {
							if(!_this.checkValidation())
								return false;
								
							_this.forwardForPartialDelivery();
						});
					});
				}, onFind : function() {
					showLayer();
					_this.resetAllField();
					let jsonObject = new Object();
					jsonObject.wayBillNumber		= $('#lrNumberEle').val();

					getJSON(jsonObject, WEB_SERVICE_URL + '/generatePartialCRWS/getPartialDeliveredData.do', _this.setBillDetailsData, EXECUTE_WITH_ERROR);
				}, resetAllField : function() {
					$("#billingPartyNameEle").val(0);
					$('#selectedDeliveryCreditorPanel').addClass("hide");
					$('#bookingType').html('');
					$('#DeliveryTo').html('');
					$('#formType').html('');
					$("#deliveredToName").val('');
					$("#deliveredToPhoneNo").val('');
					$("#deliveryRemark").val('');
					$('#deliveryPaymentType').val(0);
					$('#STPaidBy').val(0);
					$('#paymentCheckBox').val('')
					addDlyCharges = [];
					$('#selectedDeliveryCreditorPanel').addClass('hide');
					$('#viewAddedPaymentDetailsCreate').addClass('hide');
				}, setBillDetailsData : function(response) {
					if(response.message != undefined) {
						hideLayer();
						$('#bottom-border-boxshadow').addClass('hide');
						$('#taxTypeDiv').addClass('hide');
						return;
					}
					
					$('#bottom-border-boxshadow').removeClass('hide');
					
					_this.setDataInTable(response);
					_this.setPaymentMode('deliveryPaymentType');
					
					if(configuration.DeliverySTPaidBy)
						_this.setSTPaidBy();
					
					initialiseFocus();
					$('#deliveryPaymentType').focus();
					
					hideLayer();
				}, setDataInTable : function(data) {
					crDetailsObj				= data.partialDeliveryStockModel;
					partialArticleDetailsList	= data.partialArticleDetailsList;
					deliveryCharges 			= data.chargeTypeModelArrDly;
					bookingTotal				= crDetailsObj.bookingTotal;
					taxes						= data.taxModel;
					sourceBranchStateId			= data.sourceBranchStateId;
					destinationBranchStateId	= data.destinationBranchStateId;
					paymentReceivedFlag			= data.paymentReceivedFlag;
					wayBillTypeId				= crDetailsObj.wayBillTypeId;
					
					if(deliveryConfiguration.changeStPaidbyOnPartyGSTN)
						changeStPaidbyOnPartyGSTN = true;
					
					wayBillId = crDetailsObj.wayBillId;
					$('#lrNum').val(crDetailsObj.wayBillNumber);
					$('#lrNum').html('<a href="javascript:viewWayBillDetails(' + wayBillId + ');">' + crDetailsObj.wayBillNumber +  '</a>');
					$('#crNum').html(crDetailsObj.wayBillDeliveryNumber);
					$('#waybillCurrStatus').html(crDetailsObj.wayBillStatusString);
					$('#receivedAt').html(crDetailsObj.destinationBranch);
					$('#waybillType').html(crDetailsObj.wayBillType);
					$('#currStatusDate').html(crDetailsObj.wayBillCreationDateTimeStampstr);
					$('#sourceBranch').html(crDetailsObj.sourceBranchName);
					$('#destBranch').html(crDetailsObj.destinationBranchName);
					$('#bookingType').html(crDetailsObj.bookingType);
					$('#DeliveryTo').html(crDetailsObj.deliveryTo);
					$('#formType').html(data.formTypeStr);
					$('#ActlWt').html(crDetailsObj.actualWeight);
					$('#ChgdWt').html(crDetailsObj.chargedWeight);
					$('#consignorInv').html(crDetailsObj.consignorInvoiceNo);
					$('#declrdVal').html(crDetailsObj.declaredValue);
					$('#Remark').html(crDetailsObj.wayBillRemark);
					
					_this.setPartyDetails(data);
					_this.setConsignemntDetails();
					_this.changeColourforwaybillType(wayBillTypeId);
					_this.disableSTPaidBy(wayBillTypeId);
					
					$(".widthInPx").css("width", "70px");
					$(".maxlength5").css("maxlength", "7");
					$('#gcrDelivery').removeClass('hide');
					$('#showPaymentType').removeClass('hide');
					
					_this.setDeliveryCharges();
					
					$('#bookingTotalAmnt').val(bookingTotal);
					
					if (wayBillTypeId == WAYBILL_TYPE_TO_PAY)
						$('#dlyAmount').val(Math.round(crDetailsObj.grandTotal));
					
					if(paymentReceivedFlag){
						$('#deliveryPaymentType').val(0);
						$('#paymentCheckBox').val('')
						addDlyCharges = [];
						$('#gcrDelivery').addClass('hide');
						$('#showPaymentType').addClass('hide');
					}
				}, setPartyDetails: function(response) {
					$('#partyDetails tbody').empty();
					
					let consignorDetails = response.consignorDetails;
					let consigneeDetails = response.consigneeDetails;
					
					consignorGstn			= consignorDetails.gstn;
					consignorCorpId			= consignorDetails.corporateAccountId;
					cosignorId				= consignorDetails.customerDetailsId;
					billingPartyId			= consignorDetails.customerDetailsBillingPartyId;
					consigneeGstn			= consigneeDetails.gstn;
					consigneeCorpId			= consigneeDetails.corporateAccountId;
					
					let consignortr = $('<tr class="table-primary" >');
	
					consignortr.append('<td class="fw-bold">Consignor</td>');
					consignortr.append('<td class="fw-bold">' + consignorDetails.customerDetailsName + '</td>');
					consignortr.append('<td class="fw-bold">' + consignorDetails.customerDetailsMobileNumber + '</td>');
					consignortr.append('<td class="fw-bold">' + consignorDetails.gstn + '</td>');
					consignortr.append('<td class="fw-bold">' + consignorDetails.customerDetailsAddress + '</td>');
	
					let consigneetr = $('<tr style="background: #1cc88a;">');
					
					consigneetr.append('<td class="text-white fw-bold">Consignee</td>');
					consigneetr.append('<td class="text-white fw-bold">' + consigneeDetails.customerDetailsName + '</td>');
					consigneetr.append('<td class="text-white fw-bold">' + consigneeDetails.customerDetailsMobileNumber + '</td>');
					consigneetr.append('<td class="text-white fw-bold">' + consigneeDetails.gstn + '</td>');
					consigneetr.append('<td class="text-white fw-bold">' + consigneeDetails.customerDetailsAddress + '</td>');
	
					$('#partyDetails tbody').append(consignortr);
					$('#partyDetails tbody').append(consigneetr);
				}, setConsignemntDetails : function() {
					$('#consignmentTable thead').empty();
					$('#consignmentTable tbody').empty();
					
					totalPendingQty	= 0;
					
					var columnArray = new Array();
					
					columnArray.push('<th>No of Art</th>');
					columnArray.push('<th>Article Type</th>');
					columnArray.push('<th>Said To Contain</th>');
					columnArray.push('<th>Partial Delivered</th>');
					columnArray.push('<th>Pending Quantity</th>');
					$('#consignmentTable thead').append('<tr>' + columnArray.join(' ') + '</tr>');
					
					for(var i = 0; i < partialArticleDetailsList.length; i++) {
						columnArray = new Array();
						
						totalPendingQty += partialArticleDetailsList[i].pendingQuantity;
						
						columnArray.push("<td align='center'>"+ partialArticleDetailsList[i].totalQuantity +"</td>");
						columnArray.push("<td align='center'>"+ partialArticleDetailsList[i].packingTypeName +"</td>");
						columnArray.push("<td align='center'>"+ partialArticleDetailsList[i].saidToContain +"</td>");
						columnArray.push("<td align='center'>"+ partialArticleDetailsList[i].quantity +"</td>");
						columnArray.push("<td style='display:none'><input id='pendingQty_" + partialArticleDetailsList[i].consignmentDetailsId + "'  value='" + partialArticleDetailsList[i].pendingQuantity + "'></td>");
						columnArray.push("<td class ='thead-inverse textClass' ><input class='maxlength5 form-control' type='text' id='pendingQuantity_" + partialArticleDetailsList[i].consignmentDetailsId + "' value='" + partialArticleDetailsList[i].pendingQuantity + "' max='" + partialArticleDetailsList[i].pendingQuantity + "' min='1' maxlength='4' onkeypress='return noNumbers(event);' data-tooltip='Quantity'></td>");
						$('#consignmentTable tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
						
						$("#pendingQuantity_" + partialArticleDetailsList[i].consignmentDetailsId).blur(function() {
							hideInfo();
							clearIfNotNumeric(this, 0);
							_this.validatePartialQuantity(this);
						});
					}
				}, validatePartialQuantity : function(obj) {
					let id			= (obj.id).split('_')[1];
					var parQuantity = Number($('#pendingQuantity_' + id).val());
					var pendingQty 	= Number($('#pendingQty_' + id).val());
					
					if(Number(parQuantity) > Number(pendingQty)) {
						showMessage('error', 'You can not enter Quantity greater than ' + pendingQty + '!');
						$('#pendingQuantity_' + id).val(0)
						return false;
					} else if(parQuantity < 0) {
						showMessage('error', 'You can not enter Quantity less than 0!');
						$('#pendingQuantity_' + id).val(0)
						return false;
					}
					
					var totalPartialQty = 0;
					
					for(var i = 0; i < partialArticleDetailsList.length; i++) {
						totalPartialQty += Number($('#pendingQuantity_' + partialArticleDetailsList[i].consignmentDetailsId).val());
					}
					
					if(totalPartialQty == totalPendingQty) {
						lrFullyDelivered = true;
						$('#gcrDelivery').removeClass('hide');
						$('#showPaymentType').removeClass('hide');
					} else {
						lrFullyDelivered = false;
						$('#deliveryPaymentType').val(0);
						$('#paymentCheckBox').val('')
						addDlyCharges = [];
						$('#gcrDelivery').addClass('hide');
						$('#showPaymentType').addClass('hide');
						$('#selectedDeliveryCreditorPanel').addClass('hide');
						$('#viewAddedPaymentDetailsCreate').addClass('hide');
					}
				}, changeColourforwaybillType : function(waybillTypeId) {
					var waybillType = document.getElementById('waybillType');

					switch (waybillTypeId) {
					case WAYBILL_TYPE_PAID:
						waybillType.style.backgroundColor = "#0073BA";
						waybillType.style.color = "white";
						break;
				
					case WAYBILL_TYPE_TO_PAY:
						waybillType.style.backgroundColor = "#E77072";
						waybillType.style.color = "white";
						break;
				
					case WAYBILL_TYPE_CREDIT:
						waybillType.style.backgroundColor = "#52AEC6";
						waybillType.style.color = "white";
						break;
				
					case WAYBILL_TYPE_FOC:
						waybillType.style.backgroundColor = "#2CAE54";
						waybillType.style.color = "white";
						break;
					}
				}, disableSTPaidBy : function(waybillTypeId) {
					if (!configuration.DeliverySTPaidBy)
						return;
					
					$('#STPaidByDiv').removeClass("hide");
				
					switch (Number(waybillTypeId)) {
					case WAYBILL_TYPE_PAID:
						if (configuration.disableSTPaidBy)
							$('#STPaidBy').prop("disabled", true) 
						break;
					case WAYBILL_TYPE_TO_PAY:
						if (configuration.disableSTPaidBy)
							$('#STPaidBy').prop("disabled", true) 
						break;
					case WAYBILL_TYPE_CREDIT:
						if (configuration.disableSTPaidBy)
							$('#STPaidBy').prop("disabled", true) 
						break;
					case WAYBILL_TYPE_FOC:
						if (configuration.disableSTPaidBy)
							$('#STPaidBy').prop("disabled", true) 
						break;
					default : 
						$('#STPaidBy').prop("disabled", false) 
					}
				}, setPaymentMode : function(elementId) {
					removeOption(elementId, null);
					createOption(elementId, 0, '---Select Mode---');
				
					if(!jQuery.isEmptyObject(paymentTypeArr)) {
						for(const element of paymentTypeArr) {
							if(element != null)
								$('#' + elementId).append('<option value="' + element.paymentTypeId + '" id="' + element.paymentTypeId + '">' + element.paymentTypeName + '</option>');
						}
					}
					
					$("#" + elementId).change(function() {
						setValueToTableOnPaymentModeChange(this);removeError('deliveryPaymentType');
					});
						
					$("#" + elementId).keypress(function() {
						hideShowPaymentTypeDetailsNew(this);removeError('deliveryPaymentType');
					});
					
					$('#viewAddedPaymentDetailsCreate').addClass('hide');
				}, setSTPaidBy : function() {
					removeOption('STPaidBy', null);
					createOption('STPaidBy', 0, 'GST Paid By');
					
					if(!configuration.disableConsignorOption)
				 		createOption('STPaidBy', TAX_PAID_BY_CONSINGOR_ID, TAX_PAID_BY_CONSINGOR_NAME);
				 		
					createOption('STPaidBy', TAX_PAID_BY_CONSINGEE_ID, TAX_PAID_BY_CONSINGEE_NAME);
					
					if(!configuration.disableTransporterOption)
						createOption('STPaidBy', TAX_PAID_BY_TRANSPORTER_ID, TAX_PAID_BY_TRANSPORTER_NAME);
				}, setDeliveryCharges : function() {
					$('#deliveryCharges').empty();
					
					var columnArray = new Array();
					
					columnArray.push('<td><b>Booking Total</b></td>');
					columnArray.push('<td><input type="text" id="bookingTotalAmnt" value="0" disabled class="width-100px textAlignRight form-control"/></td>');
					
					$('#deliveryCharges').append('<tr>' + columnArray.join(' ') + '</tr>');
					
					columnArray	= [];
					
					for(var i = 0; i < deliveryCharges.length; i++) {
						let charge			= deliveryCharges[i];
						var chargeId		= charge.chargeTypeMasterId;
						
						columnArray.push('<td><b>' + charge.chargeTypeMasterDisplayName + '</b></td>');
						columnArray.push('<td><input id = "deliveryCharge' + chargeId + '" name = "deliveryCharge' + chargeId + '" type="text" value="0" maxlength="6" class="form-control textAlignRight" data-tooltip = "' + charge.chargeTypeMasterDisplayName + '"/></td>');
						columnArray.push('<td class="hide"><input id = "actualInput' + chargeId + '" name = "actualInput' + chargeId + '" type="hideen" value="0"/></td>');
					
						$('#deliveryCharges').append('<tr>' + columnArray.join(' ') + '</tr>');
						columnArray	= [];
						
						$("#deliveryCharge" + chargeId).focus(function() {
							if(this.value == 0) this.value = "";
						});
						
						$("#deliveryCharge" + chargeId).keypress(function(event) {
							if(deliveryConfiguration.allowOnlyNumericInCharges)
								return allowDecimalCharacterOnly(event);
							
							return noNumbers(event);
						});
						
						$("#deliveryCharge" + chargeId).keyup(function() {
							_this.calulateDlyAmount();
						});
						
						$("#deliveryCharge" + chargeId).bind("paste", function(e){
							removeSpecialCharacterAfterPaste(this);
						} );
						
						$("#deliveryCharge" + chargeId).blur(function() {
							clearIfNotNumeric(this,0);_this.calulateDlyAmount();
						});
					}
					
					_this.setTaxes(wayBillId);
					
					columnArray.push('<td><b>Delivery Amount</b></td>');
					columnArray.push('<td><input name="dlyAmount" id="dlyAmount" type="text" value="0" class="width-100px textAlignRight form-control" title="Total Dly Amount to be Received." disabled/></td>');
					
					$('#deliveryCharges').append('<tr>' + columnArray.join(' ') + '</tr>');
				}, setTaxes : function(wayBillId) {
					if (!deliveryConfiguration.DeliveryTimeServiceTax)
						return;
				
					if(jQuery.isEmptyObject(taxes))
						return;

					for (var i = 0; i < taxes.length; i++) {
						let taxModel	= taxes[i];
						
						let	taxName		= taxModel.taxName;
						let taxModelId	= taxModel.taxModelId;
						let taxAmount	= taxModel.taxAmount;
					
						if (taxModel.taxPercentage)
							taxName	+= ' ' + (taxAmount).toFixed(2) + '%';
						
						var columnArray = new Array();
					
						columnArray.push('<td><b>' + taxName + '</b></td>');
						columnArray.push('<td><input type="text" id="tax_' + taxModelId + '_' + wayBillId + '" name="tax_' + taxModelId + '_' + wayBillId + '" value="0" class="width-100px textAlignRight form-control" disabled/></td>');
						
						if(taxModel.taxPercentage)
							columnArray.push('<td class="hide"><input type="checkbox" id="Perctax_' + taxModelId + '_' + wayBillId + '" name="tax_' + taxModelId + '_' + wayBillId + '" value="' + (taxAmount).toFixed(2) + '" class="width-100px textAlignRight form-control" checked="checked"/></td>');
						else
							columnArray.push('<td class="hide"><input type="checkbox" id="Perctax_' + taxModelId + '_' + wayBillId + '" name="tax_' + taxModelId + '_' + wayBillId + '" value="' + (taxAmount).toFixed(2) + '" class="width-100px textAlignRight form-control" readonly/></td>');

						columnArray.push('<td class="hide"><input type="text" id="actualTax_' + taxModelId + '_' + wayBillId + '" name="actualTax_' + taxModelId + '_' + wayBillId + '" value="0" class="width-100px textAlignRight form-control" readonly/></td>');
						columnArray.push('<td class="hide"><input type="text" id="unAddedST_' + taxModelId + '_' + wayBillId + '" name="unAddedST_' + taxModelId + '_' + wayBillId + '" value="0" class="width-100px textAlignRight form-control" readonly/></td>');
						columnArray.push('<td class="hide"><input type="text" id="calculateSTOnAmount_' + taxModelId + '_' + wayBillId + '" name="calculateSTOnAmount_' + taxModelId + '_' + wayBillId + '" value="0" class="width-100px textAlignRight form-control" readonly/></td>');
					
						$('#deliveryCharges').append('<tr>' + columnArray.join(' ') + '</tr>');
					}
				}, calulateDlyAmount : function() {
					var totalAmount = 0.00;
					addDlyCharges = [];
					
					for(var i = 0; i < deliveryCharges.length; i++) {
						if(Number($('#deliveryCharge' + deliveryCharges[i].chargeTypeMasterId).val()) > 0) {
							var chargeObj = new Object();
							chargeObj.wayBillChargeMasterId 		= deliveryCharges[i].chargeTypeMasterId;
							chargeObj.wayBillDeliverychargeAmount 	= Number($('#deliveryCharge' + deliveryCharges[i].chargeTypeMasterId).val());
							chargeObj.accountGroupId				= deliveryCharges[i].accountGroupId;
							chargeObj.wayBillDeliveryChargeMarkForDelete	= false;
							chargeObj.wayBillId						= wayBillId;
							totalAmount += Number($('#deliveryCharge' + deliveryCharges[i].chargeTypeMasterId).val());
							addDlyCharges.push(chargeObj);
						}
					}
					
					let dlyTotal	= 0;
					
					if(wayBillTypeId == WAYBILL_TYPE_TO_PAY)
						dlyTotal = parseFloat(bookingTotal) + parseFloat(totalAmount);
					else
						dlyTotal = parseFloat(totalAmount);
					
					$('#dlyAmount').val(dlyTotal);
					
					// Tax Calculation
					if(!jQuery.isEmptyObject(taxes)) {
						var calcSTOn			= 0;
				
						if(deliveryConfiguration.STCalOnBookingDeliveyTotalIfNotAllowedAtBookingTime)
							calcSTOn			= totalAmount - _this.getServiceTaxExcludeCharges() + Number(bookingTotalAmnt);
						else
							calcSTOn			= totalAmount - _this.getServiceTaxExcludeCharges();
				
						var billAmt				= $('#dlyAmount').exists() ? Number($('#dlyAmount').val()) : 0;
						
						calculatePartialDlyGSTTaxes(taxes, wayBillId, 'STPaidBy', calcSTOn, billAmt, sourceBranchStateId, destinationBranchStateId, consignorGstn, consigneeGstn);
					}
				}, getServiceTaxExcludeCharges : function() {
					var total	= 0;

					for (var i = 0; i < deliveryCharges.length; i++) {
						var chargeMasterId	= deliveryCharges[i].chargeTypeMasterId;
						
						if(deliveryCharges[i].taxExclude)
							total  += Number($("#deliveryCharge" + chargeMasterId).val());
					}
					
					return total;
				}, viewWayBillDetails : function(wayBillId, wayBillNumber) {
					window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId=' + wayBillId + '&NumberType=' + 1 + '&wayBillNumber=' + wayBillNumber);
				}, forwardForPartialDelivery : function() {
					showLayer();
					let jsonObject = new Object();
					jsonObject.wayBillNumber		= $('#lrNumberEle').val();
					
					var ans = confirm("Are you sure you want to Deliver LR ?");
					
					if(ans)
						_this.getUrlForSubmit(jsonObject);
					else {
						hideLayer();
						return false;
					}
					
					getJSON(jsonObject, WEB_SERVICE_URL + '/generatePartialCRWS/generatePartialDelivery.do', _this.afterPartialDelivery, EXECUTE_WITH_ERROR);
				}, getUrlForSubmit : function(jsonObject) {
					jsonObject.waybillId 				= wayBillId;
					jsonObject.deliveryContactDetailsId = crDetailsObj.deliveryContactDetailsId;
					jsonObject.crId						= crDetailsObj.crId;
					jsonObject.wayBillDeliveryNumber	= crDetailsObj.wayBillDeliveryNumber;
					jsonObject.wayBillNumber			= crDetailsObj.wayBillNumber;
					jsonObject.deliveredToName			= $('#deliveredToName').val();
					jsonObject.deliveredToPhoneNo		= $('#deliveredToPhoneNo').val();
					jsonObject.STPaidBy					= $('#STPaidBy').val();
					jsonObject.deliveryRemark			= $('#deliveryRemark').val();
					jsonObject.selectedDeliveryCreditorId		= $('#billingPartyNameEle').val();
					jsonObject.consignorId				= cosignorId;
					
					_this.getPartialQty(jsonObject);
					jsonObject.deliveryChargesArr = JSON.stringify(addDlyCharges);
					
					deliveryPaymentTypeId = $('#deliveryPaymentType').val();
					
					_this.getPaymentTypeAndDetails(deliveryPaymentTypeId, jsonObject);
				}, getPartialQty : function(jsonObject) {
					var partialConsignmentArr = new Array();
					
					for(var i = 0; i < partialArticleDetailsList.length; i++) {
						var parQuantity = Number($('#pendingQuantity_' + partialArticleDetailsList[i].consignmentDetailsId).val());
					
						if(parQuantity > 0) {
							var qtyObj = new Object();
							qtyObj.consignmentDetailsId 		= partialArticleDetailsList[i].consignmentDetailsId;
							qtyObj.deliveryContactDetailsId 	= partialArticleDetailsList[i].deliveryContactDetailsId;
							qtyObj.packingTypeMasterId 			= partialArticleDetailsList[i].packingTypeMasterId;
							qtyObj.pendingDeliveryStockArticleDetailsId = partialArticleDetailsList[i].pendingDeliveryStockArticleDetailsId;
							qtyObj.quantity 					= parQuantity;
							qtyObj.wayBillId					= wayBillId;	
							
							partialConsignmentArr.push(qtyObj);
						}
					}
					
					jsonObject.partialConsignmentDataArr = JSON.stringify(partialConsignmentArr);
				}, getPaymentTypeAndDetails : function(deliveryPaymentType, jsonObject) {
					if (deliveryPaymentType == PAYMENT_TYPE_CHEQUE_ID || deliveryPaymentType == PAYMENT_TYPE_ONLINE_RTGS_ID || deliveryPaymentType == PAYMENT_TYPE_ONLINE_NEFT_ID)
						_this.chequeDetails(jsonObject);
					else if (deliveryPaymentType == PAYMENT_TYPE_CREDIT_CARD_ID || deliveryPaymentType == PAYMENT_TYPE_DEBIT_CARD_ID)
						_this.cardDetails(jsonObject);
					else if(deliveryPaymentType == PAYMENT_TYPE_PAYTM_ID || deliveryPaymentType == PAYMENT_TYPE_UPI_ID || deliveryPaymentType == PAYMENT_TYPE_PHONE_PAY_ID || deliveryPaymentType == PAYMENT_TYPE_GOOGLE_PAY_ID || deliveryPaymentType == PAYMENT_TYPE_WHATSAPP_PAY_ID)
						_this.paytmDetails(jsonObject);
					else if(deliveryPaymentType == PAYMENT_TYPE_IMPS_ID)
						_this.getIMPSDetails(jsonObject);
				
					jsonObject.paymentValues = $('#paymentCheckBox').val();
					jsonObject.deliveryPaymentType = deliveryPaymentType;
				}, chequeDetails : function(jsonObject) {
					jsonObject.chequeNumber		= $('#chequeNo').val();
					jsonObject.chequeAmount		= $('#chequeAmount').val();
					jsonObject.bankName			= $('#bankName').val();
					jsonObject.chequeDate		= $('#chequeDate').val();
					jsonObject.bankNameId		= $('#bankName_primary_key').val();
					jsonObject.accountNo		= $('#accountNo').val();
					jsonObject.bankAccountId	= $('#accountNo_primary_key').val();
				}, cardDetails : function(jsonObject) {
					jsonObject.chequeNumber		= $('#creditDebitCardNo').val();
					jsonObject.bankName			= $('#creditDebitBankName').val();
				}, paytmDetails : function(jsonObject) {
					jsonObject.chequeNumber		= $('#referenceNumber').val();
					jsonObject.chequeAmount		= $('#chequeAmount').val();
					jsonObject.referenceNumber	= $('#referenceNumber').val();
					jsonObject.payerName		= $('#payerName').val();
				}, getIMPSDetails : function(jsonObject) {
					jsonObject.bankName			= $('#bankName').val();
					jsonObject.bankNameId		= $('#bankName_primary_key').val();
					jsonObject.chequeNumber		= $('#referenceNumber').val();
					jsonObject.referenceNumber	= $('#referenceNumber').val();
					jsonObject.payerName		= $('#payerName').val();
					jsonObject.chequeAmount		= $('#chequeAmount').val();
					jsonObject.accountNo		= $('#accountNo').val();
					jsonObject.bankAccountId	= $('#accountNo_primary_key').val();
				}, checkValidation : function() {
					var dlyPaymentMode = $('#deliveryPaymentType').val();
					var whitespaceRegex = /^\s*$/;
					
					if(!paymentReceivedFlag && lrFullyDelivered) {
						if((dlyPaymentMode == undefined || dlyPaymentMode == 0)) {
							showMessage('error', 'Please, Select payment !');
							return false;
						} else if(dlyPaymentMode > 0 && dlyPaymentMode != PAYMENT_TYPE_CASH_ID && dlyPaymentMode != PAYMENT_TYPE_CREDIT_ID && dlyPaymentMode != PAYMENT_TYPE_BILL_CREDIT_ID
							&& whitespaceRegex.test($('#storedPaymentDetails').html())) {
								showMessage('error', 'Please, Add Payment Details !');
								return false;
						}
					}
					
					if (dlyPaymentMode == PAYMENT_TYPE_BILL_CREDIT_ID) {
						var selectedDeliveryCreditorVal = $('#billingPartyNameEle').val();
						
						if(selectedDeliveryCreditorVal == '' || selectedDeliveryCreditorVal == 0 || selectedDeliveryCreditorVal < 0) {
							showMessage('error', 'Please, Select or Insert proper Delivery Creditor !');
							return false;
						}
					}
					
					var deliveredToPhoneNo	= document.getElementById('deliveredToPhoneNo');
					
					if(deliveredToPhoneNo =='' || deliveredToPhoneNo == 0 || deliveredToPhoneNo < 0) {
						showMessage('error', 'Please, Enter valid Phone Number!');
						return false;
					}
						
					if ( deliveredToPhoneNo != null ) {
						if ( deliveredToPhoneNo.value.length < 8 || deliveredToPhoneNo.value.length > 10 ) {
							showMessage('error', 'Please, Enter valid Phone Number!');
							$('#deliveredToPhoneNo').val(0);
							next='deliveredToPhoneNo';
							hideLayer();
							return false;
						} else if($('#STPaidBy').exists() && $('#STPaidBy').is(':visible'))
							next='STPaidBy';
					}
					
					var totalPartialQuantity = 0;
					
					for(var i = 0; i < partialArticleDetailsList.length; i++) {
						totalPartialQuantity += Number($('#pendingQuantity_' + partialArticleDetailsList[i].consignmentDetailsId).val());
					}
					
					if(totalPartialQuantity <= 0) {
						showMessage('info', 'Please! add at least 1 quantity');
						return false;
					}
					
					return true;
				}, afterPartialDelivery : function(res) {
					if(res.wayBillDeliveryNumber != undefined) {
						$('#bottom-border-boxshadow').addClass('hide');
						_this.resetAllField();
					}
					
					hideLayer();
				}
			});
		});

function setValueToTableOnPaymentModeChange(obj){
	hideShowBankPaymentTypeOptions(obj);
}

function removeError(id){
	$(id).css({"border-color": ""});
}

function hideShowPaymentTypeDetailsNew(obj) {
	hideShowBankPaymentTypeOptions(obj);
		
	setTimeout(function() { 
		//getAccountNumberForGroup();
	}, 200);
		
	$(document).keypress(function(e) { 
		if (e.keyCode == 27) { 
			hideBTModel();
			setTimeout(function(){
				$('#deliveryPaymentType').focus();
			}, 1000);
		} 
	});
		
	if($("#selectedDeliveryCreditorPanel").exists()) {
		if(Number(obj.value) == PAYMENT_TYPE_BILL_CREDIT_ID) {
			$('#selectedDeliveryCreditorPanel').removeClass("hide");
		} else {
			$('#selectedDeliveryCreditorPanel').addClass("hide");
			$("#billingPartyNameEle").val(0);
		}
	}
}