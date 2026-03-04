var jsondata,
wayBill,
leastTaxableAmount = 0,
redirectFilter = 0,
billId	= 0,
taxes,
freightAmount = 0,
rateHM,
bookingCharges,
weightFreightRate,
qtyTypeWiseRateHM,
allowRateInDecimal,
consignmentDetailsList,
totalQuantityFreightAmt = 0,
minimumRateConfigValue = 0,
totalPreConsignmentAmount = 0,
destnationSubRegionIdForOverNite	= 0,
taxBy	= 0,partyId = 0,
editLrRateAmountLocking = false,
allowToEditLrRate = false,
deliveryToArray,
allowToEditBookingDiscount	= false,
allowDeliveryToExpressBasedOnExpressCharge	= false,
destBranch	= null,
groupConfiguration	= null,
creditorInvoice	= false,
editLRRateProperties = null,
discountInPercent = 0,
shortCreditConfigLimit = null,
executive						= null,
isAgentBranchComissionBillCreated	= false,
doneTheStuff						= false,
editTopayLRAmountLessThanCurrentAmount 		= false,
editTopayLRAmountHigherThanCurrentAmount 	= false,
editTBBLRAmountLessThanCurrentAmount 		= false,
editTBBLRAmountHigherThanCurrentAmount 		= false,
allowIncreaseDecreaseRateBasedOnPermission	= false,
wayBillIsManual								= false,
allowToDecreaseRatesForGroupAdmin			= false,
srcBranch	= null,
shortCreditCollLedgerId	= 0,
txnTypeId = 0, consignmentSummaryBillSelectionId = BOOKING_WITH_BILL, wayBillBkgTaxTan = null;

define(
		[
		 'JsonUtility',
		 'messageUtility',
		 '/ivcargo/resources/js/generic/urlparameter.js',
		 'jquerylingua',
		 'language',
		 'autocomplete',
	     'autocompleteWrapper',
		 'bootstrapSwitch',
		 'nodvalidation',
		 'focusnavigation',
		 PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
		 PROJECT_IVUIRESOURCES + '/resources/js/module/view/editLrRate/wayBillBookingChargesData.js',
		 PROJECT_IVUIRESOURCES + '/resources/js/module/redirectAfterUpdate.js',
		 PROJECT_IVUIRESOURCES + '/resources/js/module/editlrrate/wayBillDeliveryChargesData.js',
		 PROJECT_IVUIRESOURCES + '/resources/js/module/createWayBill/commonBookingValidations.js'
		],
		 function(JsonUtility, MessageUtility, UrlParameter, Lingua, Language, AutoComplete, AutoCompleteWrapper, BootstrapSwitch, NodValidation, FocusNavigation,
				 BootstrapModal) {
			'use strict';
			let jsonObject = new Object(), _this = '', wayBillId, creditorId, rateApplyOnChargeType = 0,
			editLRRateOfCreditor = false, preFreight = 0, partyIdForCommission = 0, consignmentSummary = null,preHandling = 0;
			return Marionette.LayoutView.extend({
				initialize : function(masterObj) {
					_this 					= this;
					wayBillId 				= UrlParameter.getModuleNameFromParam('wayBillId');
					billId					= UrlParameter.getModuleNameFromParam('billId');
					creditorId 				= UrlParameter.getModuleNameFromParam('creditorId');
					redirectFilter			= UrlParameter.getModuleNameFromParam('redirectFilter');
					creditorInvoice			= UrlParameter.getModuleNameFromParam('creditorInvoice');
					shortCreditCollLedgerId	= UrlParameter.getModuleNameFromParam('shortCreditCollLedgerId');
					txnTypeId	= UrlParameter.getModuleNameFromParam('txnTypeId');
					
					if(creditorInvoice == null || creditorInvoice == undefined)
						creditorInvoice	= false;
					
					jsonObject.waybillId			= wayBillId;
					jsonObject.billId				= billId;
					jsonObject.creditorId			= creditorId;
					jsonObject.redirectFilter		= redirectFilter;
					jsonObject.shortCreditCollLedgerId = shortCreditCollLedgerId;
					jsonObject.creditorInvoice = creditorInvoice;
					
				}, render : function() {
					showLayer();
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/editLRRateWS/getDataToEditLRRate.do?',	_this.getDataToEditLRRate, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, getDataToEditLRRate : function(response) {
					hideLayer();
					
					if(response.message != undefined) {
						let errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						
						setTimeout(() => {
							window.close();
						}, 2000);
					}
					
					jsondata						= response;
					editLRRateProperties			= response.editLRRateProperties;
					wayBill							= response.wayBill;
					consignmentSummary				= response.ConsignmentSummary;
					taxBy							= response.TaxBy;
					taxes							= response.taxes;
					consignmentDetailsList			= response.consignmentDetailsList;
					destnationSubRegionIdForOverNite= response.destnationSubRegionIdForOverNite;
					partyId							= response.partyId;
					bookingCharges					= jsondata.bookingCharges;
					editLrRateAmountLocking			= editLRRateProperties.editLrRateAmountLocking;
					allowIncreaseDecreaseRateBasedOnPermission	= editLRRateProperties.allowIncreaseDecreaseRateBasedOnPermission;
					allowToEditLrRate				= response.allowToEditLrRate;
					allowToEditBookingDiscount		= response.allowToEditBookingDiscount;
					deliveryToArray					= response.deliveryToArray;
					allowDeliveryToExpressBasedOnExpressCharge	= editLRRateProperties.allowDeliveryToExpressBasedOnExpressCharge;
					destBranch						= response.destBranch;
					groupConfiguration				= response.groupConfig;
					discountInPercent				= response.discountInPercent;
					shortCreditConfigLimit			= response.shortCreditConfigLimit;
					executive						= response.executive;
					srcBranch						= response.sourceBranch;
					consignmentSummaryBillSelectionId	= consignmentSummary.consignmentSummaryBillSelectionId;
					editTopayLRAmountLessThanCurrentAmount				= response.editTopayLRAmountLessThanCurrentAmount;
					editTopayLRAmountHigherThanCurrentAmount			= response.editTopayLRAmountHigherThanCurrentAmount;
					editTBBLRAmountLessThanCurrentAmount				= response.editTBBLRAmountLessThanCurrentAmount;
					editTBBLRAmountHigherThanCurrentAmount				= response.editTBBLRAmountHigherThanCurrentAmount;
					wayBillIsManual										= wayBill.wayBillIsManual;
					allowToDecreaseRatesForGroupAdmin					= editLRRateProperties.allowToDecreaseRatesForGroupAdmin;
					wayBillBkgTaxTan									= response.wayBillBkgTaxTan;
					const isMahindraCargoLogistics 						= groupConfiguration.showGstPaidByBasisOfDivisionSelection && response.divisionId == MAHINDRA_CARGO_LOGISTICS;
					jsondata.isMahindraCargoLogistics 					= isMahindraCargoLogistics;

					if(shortCreditConfigLimit != null && shortCreditConfigLimit != undefined) {
						if(shortCreditConfigLimit.creditType == 1)
							showMessage('info', " Short Credit Limit Available " + shortCreditConfigLimit.creditLimit +"  !");
						else if (shortCreditConfigLimit.creditType == 2)
							showMessage('info', " Short Credit Balance Available " + shortCreditConfigLimit.balance +"  !");
					}
					
					isAgentBranchComissionBillCreated	= response.isAgentBranchComissionBillCreated;
					
					if(typeof taxes != 'undefined')
						leastTaxableAmount			= taxes[0].leastTaxableAmount;
					
					if(destnationSubRegionIdForOverNite > 0)
						leastTaxableAmount = 0;
					
					allowRateInDecimal				= response.allowRateInDecimal;
					jsondata.isGstNoAvalable		= false;
					preFreight						= response.preFreight;
					preHandling						= response.preHandling;
					
					let loadelement 				= new Array();
					let baseHtml 					= new $.Deferred();
					loadelement.push(baseHtml);
					
					$("#mainContent").load("/ivcargo/html/module/waybill/editRate/EditLRRate.html", function() {
						baseHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						hideLayer();
						
						_this.setHiddenElementData(response);
						_this.setLRNumber();
						_this.setLRPresentMessage(response);
						
						setWayBillBookingChargesData(response);
						
						if(jsondata.wayBillChargeWiseRemarkNeeded)
							$('#editRemark').removeClass('hide');
						
						_this.loadCreateWayBillPage(response); // load content as per configuration

						if (jsondata.isMahindraCargoLogistics) { 
							$('#STPaidBy').closest('tr').hide();
							$('#deliverySTPaidBy').closest('tr').hide();
						}

						calcGrandTotal();
						
						if(editLRRateProperties.allowToEditPaidLoading)
							_this.showHidePaidLoading();
						
						if (editLRRateProperties.hideBookingChargesInEditLrRate)
							_this.hideChargesEditLrRate();
							
						if(editLRRateOfCreditor && (typeof response.wayBillDeliveryChargesColl != 'undefined')) {
							_this.enableDisableSTPaidBy();
							_this.setPreGrandTotal();
						}
						
						if(jsondata.isWeightFreightRateAllowToEdit || jsondata.isConsignmentDetailsAllowToEdit) {
							setDataToEditWeightFreightRateAndArticleDetials();
							
							if(editLRRateProperties.AllowToEditWeight) {
								$("#actualWeight").removeAttr("disabled");
								$("#chargeWeight").removeAttr("disabled");
							}
						}
						
						if(jsondata.ApplyRate) {
							$('#isAllowToApplyRatePanel').removeClass('hide');
							_this.getRateToApplyOnUpdateLRRate(wayBill.wayBillId);
							
							$("#ApplyAutoRates").click(function() {
								_this.applyRateFromRateMaster();
							});
						}
						
						//Calling from elementfocusnavigation.js file
						initialiseFocus();
						
						document.getElementById('wayBillCharge_' + FREIGHT).focus();
						
						$("#Update").click(function() {
							_this.saveWayBillCharges();
							$("#Update").addClass('hide');
						});
					});
				}, setHiddenElementData : function(response) {
					$('#wayBillId').val(wayBill.wayBillId);
					$('#billId').val(response.billId);
					$('#wayBillNo').val(wayBill.wayBillNumber);
					$('#prevDeliveryToId').val(response.DeliveryTo);
					$('#wayBillTypeId').val(wayBill.wayBillTypeId);
				}, setLRNumber : function() {
					if(typeof wayBill != 'undefined')
						$('#lrNumber').html('<b>LR No. - ' + wayBill.wayBillNumber + '</b>');
				}, setLRPresentMessage : function(response) {
					if(typeof response.shortCreditBillNumber != 'undefined')
						$('#lrPresentMessage').html('This LR No. is alredy present in Short Credit Bill No. ' + response.shortCreditBillNumber);
					else if(response.errorMessage != '' && typeof response.errorMessage != 'undefined')
						$('#lrPresentMessage').html('<b>' + response.errorMessage + '</b>');
				}, loadCreateWayBillPage : function(response) {
					$("#lastSTaxDate").val(response.LastChangeDateForServiceTax);
					$("#lastSTaxAmt").val(response.OldServiceTaxRate);
					$("#ispreviousStaxConfig").val(editLRRateProperties.ispreviousStaxConfig);
					$("#startDateForGst").val(editLRRateProperties.startDateForGst);
				}, showHidePaidLoading : function() {
					if($('#wayBillTypeId').val() == WAYBILL_TYPE_TO_PAY) { 
						$('#wayBillCharge_' + HAMALI).val(0);
						$('#wayBillCharge_' + HAMALI).css("display", "none");
						$('#label' + PAID_HAMALI).css("display", "none");
						$('#wayBillCharge_' + PAID_HAMALI).css("display", "table-cell");
						$('#label' + PAID_HAMALI).css("display", "table-cell");
						$('#wayBillChargeRow_' + HAMALI).css("display", "none");
						$('#wayBillChargeRow_' + PAID_HAMALI).css("display", "table-row");
					} else {
						$('#wayBillCharge_' + PAID_HAMALI).val(0);
						$('#wayBillCharge_' + PAID_HAMALI).css("display", "none");
						$('#label' + PAID_HAMALI).css("display", "none");
						$('#wayBillCharge_' + HAMALI).css("display", "table-cell");
						$('#label' + HAMALI).css("display", "table-cell");
						$('#wayBillChargeRow_' + HAMALI).css("display", "table-row");
						$('#wayBillChargeRow_' + PAID_HAMALI).css("display", "none");
					}
					
					//_this.calcGrandTotal(response);
					calcGrandTotal();
				}, hideChargesEditLrRate : function() {
					let bookinghargeIdArray = editLRRateProperties.hideChargeIdsInEditLrRate.split(",");
					if (bookinghargeIdArray.length > 0) {
						for (let i = 0; i < bookinghargeIdArray.length; i++) {
							let chargeId = bookinghargeIdArray[i];
							$('#wayBillChargeRow_' + chargeId).css("display", "none");
						}
					}
				}, calcGrandTotal : function() {//Currently not in used
					//used defined in /ivcargo/src/main/webapp/resources/js/module/view/editLrRate/wayBillBookingChargesData.js
					let amtTotal	 				= 0;
					let bookingDiscount 			= 0;
					let discountedAmountTotal     	= 0;
					
					for(const element of bookingCharges) {
						if($('#wayBillCharge_' + element.chargeTypeMasterId).exists()) {
							if($('#wayBillCharge_' + element.chargeTypeMasterId).val() != '') {
								if (allowRateInDecimal)
									amtTotal += parseFloat($('#wayBillCharge_' + element.chargeTypeMasterId).val(), 10);
								else					
									amtTotal += parseInt($('#wayBillCharge_' + element.chargeTypeMasterId).val(), 10);
							}
						}
					}

					if($('#txtBkgDisc').val() != undefined)
						bookingDiscount = $('#txtBkgDisc').val();

					$('#discountedAmountTotal').val(amtTotal.toFixed(2) - bookingDiscount.toFixed(2));
					discountedAmountTotal = $('#discountedAmountTotal').val();

					let taxAmt			= 0;
					let totalTax		= 0;
					let nonTaxableAmt	= 0;

					if((typeof taxBy != 'undefined' && Number(taxBy) > 0) && (typeof taxes != 'undefined' && taxes != null)) { 
						for(const element of taxes) {
							let tax	= element;
							taxAmt 	= 0;
							
							if($('#wayBillTaxes_' + tax.taxMasterId).exists()) {
								if(tax.isTaxPercentage) {
									if(parseInt((amtTotal - nonTaxableAmt), 10) > leastTaxableAmount) {
										if($("#perctax_" + tax.taxMasterId).prop("checked")) {
											if(jsondata.isPrevStaxAllow) {
												if (allowRateInDecimal)
													taxAmt = parseFloat($("#lastSTaxAmt").val() * (amtTotal - nonTaxableAmt) / 100);
												else									
													taxAmt = Math.round(parseFloat($("#lastSTaxAmt").val()) * (amtTotal - nonTaxableAmt) / 100);
											} else if (allowRateInDecimal)
												taxAmt = parseFloat(tax.taxAmount * (amtTotal - nonTaxableAmt) / 100);
											else									
												taxAmt = Math.round(parseFloat(tax.taxAmount) * (amtTotal - nonTaxableAmt) / 100);
										} else if (allowRateInDecimal)
											taxAmt = parseFloat(tax.taxAmount);
										else								
											taxAmt = Math.round(tax.taxAmount);
										
										$('#STPaidBy').prop('disabled', false);
									} else {
										$('#STPaidBy').prop('disabled', true);
										stPaidBy.selectedIndex 	= Number(taxBy);
									}
									
									if (allowRateInDecimal)
										totalTax += parseFloat(taxAmt);
									else
										totalTax += parseInt(taxAmt);
									
									if($('#STPaidBy').val() == TAX_PAID_BY_TRANSPORTER_ID && !jsondata.isGstNoAvalable) {
										if (allowRateInDecimal)
											$('#wayBillTaxes_' + tax.taxMasterId).val((parseFloat(taxAmt)).toFixed(2));
										else
											$('#wayBillTaxes_' + tax.taxMasterId).val(parseInt(taxAmt));
									} else
										$('#wayBillTaxes_' + tax.taxMasterId).val(0);
								}
							}
						}
					} else if(typeof taxes != 'undefined' && taxes != null) {
						var stPaidBy 	= document.getElementById('STPaidBy');
						nonTaxableAmt 	= _this.getServiceTaxExcludeCharges();

						for(const element of taxes) {
							let tax	= element;
							taxAmt 	= 0;

							if($('#wayBillTaxes_' + tax.taxMasterId).exists()) {
								if(tax.isTaxPercentage) {
									if(parseInt((discountedAmountTotal - nonTaxableAmt), 10) > leastTaxableAmount) {
										$('#STPaidBy').prop('disabled', false);

										if($("#perctax_" + tax.taxMasterId).prop("checked")) {
											if(jsondata.isPrevStaxAllow) {
												if (allowRateInDecimal)
													taxAmt 	= (parseFloat($("#lastSTaxAmt").val()) * (discountedAmountTotal - nonTaxableAmt) / 100);
												else								
													taxAmt 	= Math.round(parseFloat($("#lastSTaxAmt").val()) * (discountedAmountTotal - nonTaxableAmt) / 100);
											} else if (allowRateInDecimal)
												taxAmt 	= (parseFloat(tax.taxAmount) * (discountedAmountTotal - nonTaxableAmt) / 100);	
											else
												taxAmt 	= Math.round(parseFloat(tax.taxAmount) * (discountedAmountTotal - nonTaxableAmt) / 100);
										} else if (allowRateInDecimal)
											taxAmt = (tax.taxAmount);
										else								
											taxAmt = Math.round(tax.taxAmount);

										if($('#STPaidBy').val() <= 0) {
											if(partyId > 0) {
												if(jsondata.isTaxPaidByTrans)
													stPaidBy.selectedIndex = TAX_PAID_BY_TRANSPORTER_ID;
												else if(wayBillTypeId == WAYBILL_TYPE_PAID)
													stPaidBy.selectedIndex = TAX_PAID_BY_CONSINGOR_ID;
												else
													stPaidBy.selectedIndex = TAX_PAID_BY_CONSINGEE_ID;
											} else if(jsondata.isTaxPaidByTrans)
												stPaidBy.selectedIndex = TAX_PAID_BY_TRANSPORTER_ID;
											else
												stPaidBy.selectedIndex = TAX_PAID_BY_CONSINGOR_ID;
										}
									} else {
										$('#STPaidBy').prop('disabled', true);
										stPaidBy.selectedIndex 	= 0;
									}

									if (allowRateInDecimal)
										totalTax += parseFloat(taxAmt);
									else				
										totalTax += parseInt(taxAmt);

									if($('#STPaidBy').val() == TAX_PAID_BY_TRANSPORTER_ID && !jsondata.isGstNoAvalable) {
										if (allowRateInDecimal)
											$('#wayBillTaxes_' + tax.taxMasterId).val((parseFloat(taxAmt)).toFixed(2));
										else				
											$('#wayBillTaxes_' + tax.taxMasterId).val(parseInt(taxAmt));
									} else
										$('#wayBillTaxes_' + tax.taxMasterId).val(0);
								} else if (allowRateInDecimal)
									totalTax += parseFloat($('#wayBillTaxes_' + tax.taxMasterId).val());
								else							
									totalTax += parseInt($('#wayBillTaxes_' + tax.taxMasterId).val());
							}
						}

						if (allowRateInDecimal)
							$('#bookingTaxAmount').val(totalTax.toFixed(2));
						else							
							$('#bookingTaxAmount').val(totalTax);
					}

					if($('#STPaidBy').val() == TAX_PAID_BY_TRANSPORTER_ID && !jsondata.isGstNoAvalable) { 
						if (allowRateInDecimal)
							$('#grandTotal').val((parseFloat(discountedAmountTotal) + parseFloat(totalTax)).toFixed(2));
						else
							$('#grandTotal').val(parseInt(discountedAmountTotal) + parseInt(totalTax));
					} else if (allowRateInDecimal)
						$('#grandTotal').val((parseFloat(discountedAmountTotal)).toFixed(2));
					else
						$('#grandTotal').val(parseInt(discountedAmountTotal));
				}, enableDisableSTPaidBy : function() {
					$('#STPaidBy').prop('disabled', !(typeof taxBy != 'undefined' && taxBy > 0));
				}, setPreGrandTotal : function() {
					$('#preGrandTotal').val($('#grandTotal').val());
				}, getServiceTaxExcludeCharges : function () {
					let total		= 0;
					let charge  	= null;

					for(const element of bookingCharges) {
						if(element.taxExclude) {
							charge =  document.getElementById('wayBillCharge_' + element.chargeTypeMasterId);
							total += (charge != null ? parseInt(charge.value) : 0);
						}
					}
					
					return total;
				}, getRateToApplyOnUpdateLRRate : function(wayBillId) {
					let jsonObject						= new Object();
					
					jsonObject["destinationBranchId"]	= 0;
					jsonObject["waybillId"]				= wayBillId;
					
					showLayer();
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/wayBillWS/getBookingRateToApplyRateInUpdates.do?', _this.setDataToApplyLRRate, EXECUTE_WITHOUT_ERROR);
				}, setDataToApplyLRRate : function(response) {
					hideLayer();
					$("#newChargeResults tbody tr").remove();
					
					if(typeof response.rateHM != 'undefined') {
						rateHM						= response.rateHM;
						wayBill						= response.wayBillDetails;
						freightAmount				= response.freightAmount;
						taxes						= response.taxes;
						taxBy						= response.taxBy;
						weightFreightRate			= response.weightFreightRate;
						qtyTypeWiseRateHM			= response.qtyTypeWiseRateHM;
						minimumRateConfigValue		= response.minimumRateConfigValue;
						totalQuantityFreightAmt		= response.totalQuantityFreightAmt;
						totalPreConsignmentAmount	= response.totalPreConsignmentAmount;
						rateApplyOnChargeType		= response.rateApplyOnChargeType;
						partyIdForCommission		= response.partyIdForCommission;
						
						if(rateHM != null)
							_this.setNewChargesData(response);
					}

					if(freightAmount <= 0) {
						
						if(editLRRateProperties.checkApplyRateAutomatically) {
							$('#ApplyAutoRates').prop('disabled', false);
							$('#ApplyAutoRates').prop('checked', false);
						}
					} else if(editLRRateProperties.checkApplyRateAutomatically) {
						$('#ApplyAutoRates').prop('checked', true);
						$('#ApplyAutoRates').prop('disabled', true);
						
						_this.applyRateAutomaticallyFromRateMaster();
						calcGrandTotal();
					}
				}, setNewChargesData : function(response) {
					for(const element of bookingCharges) {
						let chargeAmount		= 0;
						let chargeTypeModel		= element;
						let chargeId			= chargeTypeModel.chargeTypeMasterId;
						let chargeName			= chargeTypeModel.displayName;
						
						let otherChargesList	= response.otherChargesList;
	
						if(response.hideBookingChargesFlag && otherChargesList != undefined && isValueExistInArray(otherChargesList, chargeId))
							continue;

						if(rateHM.hasOwnProperty(chargeId)) {
							if (allowRateInDecimal)
								chargeAmount		= rateHM[chargeId];
							else
								chargeAmount		= Math.round(rateHM[chargeId]);
						}

						let		chargeRow		= createRowInTable('wayBillChargeRow_' + chargeId, '', '');

						appendRowInTable('newChargesRowToEdit', chargeRow);

						let 	chargeNameCol	= createColumnInRow(chargeRow, '', '', '', '', '', '');
						let 	chargeValueCol	= createColumnInRow(chargeRow, '', '', '', '', '', '');

						createLabel(chargeNameCol, 'label' + chargeId, chargeName, 'width:auto', 'width-100px', 'Charges');

						appendValueInTableCol(chargeValueCol, inputForNewCharges(chargeId, chargeAmount, chargeName));
					}
						
					function inputForNewCharges(chargeId, chargeAmount, chargeName) {
						let wayBillChargesFeild	= $("<input/>", { 
							type			: 'text', 
							id				: 'newCharge_' + chargeId,
							name			: 'newCharge_' + chargeId,
							class			: 'form-control width-80px',
							value			: chargeAmount,
							readonly		: true,
							style			: 'text-align: right;',
							'data-tooltip'	: chargeName
						});

						return wayBillChargesFeild;
					}
				}, applyRateFromRateMaster : function() {
					if($('#newCharge_1').val() == 0) {
						$("#ApplyAutoRates").prop('checked', false);
						return false;
					}

					if(confirm('Do you want to apply rate ?')) {
						$("#ApplyAutoRates").prop('checked', true);
						_this.applyRateAutomaticallyFromRateMaster();
					} else
						$("#ApplyAutoRates").prop('checked', false);

					calcGrandTotal();
				}, saveWayBillCharges : function() {
					if(_this.formValidation()) {
						if(!_this.allowLessAmountThanPreviousAmount())
							return false;
						
						let freight 	= parseFloat($('#wayBillCharge_' + FREIGHT).val());
						
						if(isAgentBranchComissionBillCreated && freight != preFreight) {
							showMessage('info', "Edit Freight Rate not Allowed after agent bill creation ! ");
							$('#wayBillCharge_' + FREIGHT).val(preFreight);
							return false;
						}
						
						let grandTotal 	= 0.00;
						
						if($('#discount').exists() && $('#discount').is(":visible"))
							grandTotal      = Number($("#grandTotal").val() + $('#discount').val())
						else
							grandTotal      = Number($("#grandTotal").val())
						
						if(!_this.calcDiscountLimit())
							return false;
						
						if(groupConfiguration.shortCreditConfigLimitAllowed
							&& $('#wayBillTypeId').val() == WAYBILL_TYPE_PAID && wayBill.paymentType == PAYMENT_TYPE_CREDIT_ID
								&& shortCreditConfigLimit != null) {
							if(shortCreditConfigLimit.creditType == 1) {
								if(grandTotal > shortCreditConfigLimit.creditLimit) {
									showMessage('info', " Short Credit Amount Limit of "+ shortCreditConfigLimit.creditLimit +" Exceeded !");
									return false;
								}
							} else if(shortCreditConfigLimit.creditType == 2 && grandTotal > shortCreditConfigLimit.balance) {
								showMessage('info', " Short Credit Balance Limit of "+ shortCreditConfigLimit.balance +" Exceeded !");
								return false;
							}
						}
						
						$("#Update").addClass('hide');
						
						if(!doneTheStuff) {
							let answer = confirm ("Are you sure you want to save LR charges ?");
							
							if (answer) {
								doneTheStuff = true;
								$('#STPaidBy').prop('disabled', false);
								$('#DeliveryTo').prop('disabled', false);
								
								let serviceTaxAmount		= 0;
								
								let jsonObject		= new Object();
								
								jsonObject["waybillId"]							= $('#wayBillId').val();
								jsonObject["billId"]							= $('#billId').val();
								jsonObject["STPaidBy"]							= $('#STPaidBy').val();
								jsonObject["DeliveryTo"]						= $('#DeliveryTo').val();
								jsonObject["prevDeliveryToId"]					= $('#prevDeliveryToId').val();
								jsonObject["wayBillNumber"]						= $('#wayBillNo').val();
								jsonObject["isPrevStaxAllow"]					= jsondata.isPrevStaxAllow;
								jsonObject["lastSTaxAmt"]						= $('#lastSTaxAmt').val();
								jsonObject["wayBillTypeId"]						= $('#wayBillTypeId').val();
								jsonObject["isWeightFreightRateAllowToEdit"]	= jsondata.isWeightFreightRateAllowToEdit;	
								jsonObject["redirectFilter"]					= redirectFilter;
								jsonObject["discount"]							= $('#discount').val();
								jsonObject["remark"]							= $('#remark').val();
								jsonObject["isDiscountPercent"]					= $('#isDiscountPercent').is(":checked");
								jsonObject["agentCommission"]					= $('#agentcommission').val();
								jsonObject["bookingGrandTotal"]					= $('#grandTotal').val();
								jsonObject["rateApplyOnChargeType"]				= rateApplyOnChargeType;
								jsonObject["partyIdForCommission"]				= partyIdForCommission;
								jsonObject["gstType"]							= $('#gstType').val();
								jsonObject.shortCreditCollLedgerId 				= shortCreditCollLedgerId;
								jsonObject.stbsTxnTypeId						= txnTypeId;
								
								if($('#ApplyAutoRates').is(":checked"))
									jsonObject.weightFreightRate			= weightFreightRate;
								else if(editLRRateProperties.calculateWeightFreightRateBasedOnFreight && jsondata.ChargeTypeId == CHARGETYPE_ID_WEIGHT && jsondata.ChargeWeight > 0)
									jsonObject.weightFreightRate			= (Number($('#wayBillCharge_' + FREIGHT).val()) / jsondata.ChargeWeight).toFixed(2);
								else
									jsonObject.weightFreightRate			= 0;
																
								if(!jsondata.isMahindraCargoLogistics && typeof taxes != 'undefined' && taxes != null) {
									for(const element of taxes) {
										if ($('#wayBillTaxes_' + element.taxMasterId).exists())
											serviceTaxAmount	+= Number($('#wayBillTaxes_' + element.taxMasterId).val());
									}
								} 
								
								jsonObject["serviceTaxAmount"]					= serviceTaxAmount;
								
								_this.getBookingChargeDetails(jsonObject);
								
								if(jsondata.editLRRateProperties.wayBillChargeWiseRemarkNeeded)
									_this.getBookingChargeRemarkDetails(jsonObject);
								
								if(jsondata.ChargeTypeId == CHARGETYPE_ID_WEIGHT) {
									if(jsondata.isWeightFreightRateAllowToEdit) {
										jsonObject["weightFreightRate"]		= $('#weightFreightRate').val();
										jsonObject["chargeWeight"]			= $('#chargeWeight').val();
										jsonObject["actualWeight"]			= $('#actualWeight').val();
										jsonObject["allowToEditWeight"]		= editLRRateProperties.AllowToEditWeight;
									}
								} else if(jsondata.ChargeTypeId == CHARGETYPE_ID_QUANTITY && jsondata.isConsignmentDetailsAllowToEdit)
									_this.getTotalAmountAfterEditConsignmentAmount(jsonObject);
								
								$('#deliverySTPaidBy').prop('disabled', false);
								$('#txtBkgDisc').prop('disabled', false);
								$('#txtDelDisc').prop('disabled', false);
								
								jsonObject["deliverySTPaidBy"]					= $('#deliverySTPaidBy').val();	
								jsonObject["txtBkgDisc"]						= $('#txtBkgDisc').val();
								jsonObject["txtDelDisc"]						= $('#txtDelDisc').val();
								jsonObject["discountTypesBkg"]					= $('#discountTypesBkg').val();
								jsonObject["bkgDiscount"]						= $('#bkgDiscount').val();
								jsonObject["discountTypesDly"]					= $('#discountTypesDly').val();
								jsonObject["dlyDiscount"]						= $('#dlyDiscount').val();
								jsonObject["creditorInvoice"]					= creditorInvoice;
								jsonObject["freightAmt"]						= $('#wayBillChargeHidden_' + FREIGHT).val();
								jsonObject["tdsAmount"]							= $('#tdsAmount').val();
								
								_this.getDeliveryChargeDetails(jsonObject);
								
								if(document.getElementById('deliveryresults')) {
									let cahargeTable  = document.getElementById('deliveryresults');
									let inputs		  = cahargeTable.getElementsByTagName("input");
									let len			  = inputs.length;
									
									for(let i = 0; i < len; i++) {
										if(inputs[i].type == 'text')
											inputs[i].disabled = false;
									}
								}
								
								showLayer();
								getJSON(jsonObject, WEB_SERVICE_URL	+ '/editLRRateWS/editWayBillCharge.do?', _this.setResponse, EXECUTE_WITHOUT_ERROR);
								
							} else {
								doneTheStuff = false;
								setTimeout(() => {
									$("#Update").removeClass('hide');
								}, 200);
							}
						}
					} else {
						doneTheStuff = false;
						setTimeout(() => {
							$("#Update").removeClass('hide');
						}, 200);
					}
				}, formValidation : function() {
					if(editLrRateAmountLocking) {
						if(!allowToEditLrRate) {
							if(allowIncreaseDecreaseRateBasedOnPermission) {
								 if(!editTopayLRAmountLessThanCurrentAmount || !editTopayLRAmountHigherThanCurrentAmount || !editTBBLRAmountLessThanCurrentAmount || !editTBBLRAmountHigherThanCurrentAmount){
										if(wayBill.wayBillTypeId == WAYBILL_TYPE_TO_PAY) {
											if(parseInt($('#grandTotal').val())	< wayBill.bookingTotal && !editTopayLRAmountLessThanCurrentAmount) {
												showMessage('info', "You can not enter amount less than the Original Amount "+ wayBill.bookingTotal + " Rs /-");
												return false;
											} else if(parseInt($('#grandTotal').val())	> wayBill.bookingTotal && !editTopayLRAmountHigherThanCurrentAmount) {
												showMessage('info', "You can not enter amount Higher than the Original Amount "+ wayBill.bookingTotal + " Rs /-");
												return false;
											}
										} else if(wayBill.wayBillTypeId == WAYBILL_TYPE_CREDIT) {
											if(creditorInvoice == 'false' || creditorInvoice == false) {
												if(parseInt($('#grandTotal').val())	< wayBill.bookingTotal && !editTBBLRAmountLessThanCurrentAmount) {
													showMessage('info', "You can not enter amount less than the Original Amount "+ wayBill.bookingTotal + " Rs /-");
													return false;
												} else if(parseInt($('#grandTotal').val())	> wayBill.bookingTotal && !editTBBLRAmountHigherThanCurrentAmount) {
													showMessage('info', "You can not enter amount Higher than the Original Amount "+ wayBill.bookingTotal + " Rs /-");
													return false;
												}
											}
										}
									}
							} else if(creditorInvoice == 'false' || creditorInvoice == false) {
								if((wayBill.wayBillTypeId == WAYBILL_TYPE_TO_PAY) || (wayBill.wayBillTypeId == WAYBILL_TYPE_CREDIT)){
									if(wayBill.wayBillStatus != WAYBILL_STATUS_BOOKED){
										if(parseInt($('#grandTotal').val())	< wayBill.bookingTotal) {
											showMessage('info', "You can not enter amount less than the Original Amount "+ wayBill.bookingTotal + " Rs /-");
											return false;
										}
									} else if((executive.executiveType == EXECUTIVE_TYPE_EXECUTIVE 
											|| executive.executiveType == EXECUTIVE_TYPE_BRANCHADMIN)
											&& (executive.branchId != wayBill.wayBillBranchId)){
										showMessage('info', "LR status is Booked you can not edit amount");
										return false;
									}
								} else if(parseInt($('#grandTotal').val())	< wayBill.bookingTotal) {
									showMessage('info', "You can not enter amount less than the Original Amount "+ wayBill.bookingTotal + " Rs /-");
									return false;
								}
							}
						}
					} else if((wayBill.wayBillTypeId == WAYBILL_TYPE_PAID && !jsondata.allowToEnterPaidAmountLessThanOldAmount) 
							|| (wayBill.wayBillTypeId == WAYBILL_TYPE_TO_PAY && !jsondata.allowToEnterTopayAmountLessThanOldAmount && !allowToEditLrRate)) {
						if(parseInt($('#grandTotal').val())	< parseInt($('#prevGrandTotal').val())) {
							showMessage('info', "You can not enter amount less than the Original Amount "+ parseInt($('#prevGrandTotal').val()) + " Rs /-");
							return false;
						}
					}
					
					if(editLRRateProperties.allowToInsertRemark) {
						if(editLRRateProperties.stopRemarkValidationForTBB){ //stopValidationForTBB, true for jayram, false for others
							if(wayBill.wayBillTypeId != WAYBILL_TYPE_CREDIT && !validateRemark(1, 'remark', 'remark')) {
								$('#remark').val('');
								return false;
							}
						} else if(!validateRemark(1, 'remark', 'remark')) {
							$('#remark').val('');
							return false;
						}
					}

					if (typeof taxes != 'undefined' && taxes != null && (!groupConfiguration.doNotCalculateGSTForEstimateLR || consignmentSummaryBillSelectionId != BOOKING_WITHOUT_BILL)) {						
						if (!jsondata.isMahindraCargoLogistics) {
							if (!document.getElementById('STPaidBy').disabled && ($('#STPaidBy').val() == null
								|| $('#STPaidBy').val() == undefined || $('#STPaidBy').val() == 0)) {
								showMessage('error', stPaidByErrMsg);
								changeTextFieldColor('STPaidBy', '', '', 'red');
								return false;
							}
						}

						changeTextFieldColorWithoutFocus('STPaidBy', '', '', 'green');
					}
					
					if (groupConfiguration.validateOCChargeOnDoorDeliverySelection) {
						let selectedDeliveryId = Number($('#DeliveryTo').val());
						let ocCharge = $('#wayBillCharge_'+ OC_CHARGE).val();
						
						if (selectedDeliveryId == DELIVERY_TO_DOOR_ID && (ocCharge == null || ocCharge <= 0)) {
							showMessage('error', 'OC Charge cannot be empty!');
							return false;
						}
					}
					
					let grandTotal			= parseInt($('#grandTotal').val());

					if(jsondata.allowToEditAgentcommission) {
						let commission 			= parseInt($('#agentcommission').val());	

						if(grandTotal <= 0 && (grandTotal - commission) <= 0) {
							showMessage('error', 'Grand Total Must Be More Than 0');
							return false;
						}
					}

					if(editLRRateProperties.grandTotalMandatoryInTBB && wayBill.wayBillTypeId == WAYBILL_TYPE_CREDIT
						&& grandTotal <= 0) {
						showMessage('error', 'Grand Total Must Be More Than 0');
						return false;
					} 
					
					if(!minimumLrBookingTotal(groupConfiguration, wayBill.wayBillTypeId, $('#grandTotal').val(), wayBill.wayBillInfoBookingBranchId))
						return false;
					
					if (editLRRateProperties.validateDeliverySTPaidBy && document.getElementById("deliverySTPaidBy") != null) {
						if (!jsondata.isMahindraCargoLogistics && !document.getElementById('deliverySTPaidBy').disabled && $('#deliverySTPaidBy').val() == 0) {
							changeTextFieldColor('deliverySTPaidBy', '', '', 'red');
							showMessage('error', deliverySTPaidByErrMsg);
							return false;
						}

						changeTextFieldColorWithoutFocus('deliverySTPaidBy', '', '', 'green');
					}

					// Validation for discount
					if(editLRRateProperties.validateDiscountTypeBooking && document.getElementById("txtBkgDisc") != null) {
						var discnt  = $('#txtBkgDisc').val();
						var disType = $('#discountTypesBkg').val();

						if(discnt > 0 && disType <= 0 && disType.length > 1) {
							showMessage('error', discountTypeErrMsg);
							changeTextFieldColor('discountTypesBkg', '', '', 'red');
							return false;
						}
					}

					if(editLRRateProperties.validateDiscountTypeDelivery && document.getElementById("txtDelDisc") != null) {
						var discnt  = $('#txtDelDisc').val();
						var disType = $('#discountTypesDly').val();

						if(discnt > 0 && disType <= 0 && disType.length > 1) {
							showMessage('error', discountTypeErrMsg);
							changeTextFieldColor('discountTypesDly', '', '', 'red');
							return false;
						}
					}

					for(const element of bookingCharges) {
						let chargeId				= element.chargeTypeMasterId;
						let chargeName				= element.chargeName;
						
						if(!_this.validateRemarkOnCharge(chargeId, chargeName))
							return false;
					}
					
					if(allowDeliveryToExpressBasedOnExpressCharge && $("#DeliveryTo").val() != DELIVERY_TO_EXPRESS_DELIVERY_ID
						&& $("#wayBillCharge_" + EXPRESS).val() > 0) {
						showMessage('error', 'Please, Select Express Delivery !');
						return false;
					}
					
					if (groupConfiguration.showGstType && groupConfiguration.validateGstType && Number($('#gstType').val()) <= 0) {
						showMessage('error', 'Please Select Gst Type!');
						return false;
					}
					
					//commonBookingValidations.js
					return validateFreightChargeConfigAmount(wayBill.wayBillTypeId, groupConfiguration, parseFloat($('#wayBillCharge_' + FREIGHT).val()), srcBranch.subRegionId);
				}, allowLessAmountThanPreviousAmount : function() {
					if (!editLRRateProperties.allowRateLessThanCurrentRate && wayBill.wayBillTypeId != WAYBILL_TYPE_CREDIT) { 
						let freight 	= parseFloat($('#wayBillCharge_' + FREIGHT).val()); 

						if(freight < preFreight) {
							showMessage('info', freightAmountLessThanInfoMsg(preFreight));
							$('#wayBillCharge_' + FREIGHT).val(preFreight);
							return false;
						}
					}
					
					if (groupConfiguration.doNotAllowIncreaseInHandlingCharge && executive.executiveType != EXECUTIVE_TYPE_GROUPADMIN) {
						let handlingCharge	= parseFloat($('#wayBillCharge_' + HANDLING_BOOKING).val());
						
						if (handlingCharge > Number(preHandling)) {
							showMessage("error", "You cannot enter Handling Charge greater than " + Number(preHandling) + ".");
							$('#wayBillCharge_' + HANDLING_BOOKING).val(preHandling);
							return false;
						}
					}
					
					return true;
				}, validateRemarkOnCharge : function(chargeId, chargeName) {
					let chargesToValidateRemark					= (editLRRateProperties.waybillChargeMasterIdsForValidateRemark).split(",");
					
					if(!editLRRateProperties.wayBillChargeWiseRemarkNeeded)
						return true;

					let chargeValue = $('#wayBillCharge_' + chargeId).val();

					if(chargeValue > 0 && jQuery.inArray(chargeId + "", chargesToValidateRemark) >= 0 ) {
						if($('#wayBillChargeRemark_' + chargeId).exists()) {
							let chargeRemark = $('#wayBillChargeRemark_' + chargeId).val();

							if(chargeRemark == "") {
								changeTextFieldColor('wayBillChargeRemark_' + chargeId, '', '', 'red');
								showMessage('error','Please Enter ' + chargeName + ' remark !');
								return false;
							} else {
								hideAllMessages();
								changeTextFieldColorWithoutFocus('wayBillChargeRemark_' + chargeId, '', '', 'green');
								return true;
							}
						}
					}

					return true;
				}, getBookingChargeDetails: function(jsonObject) {
					let chargesColl = new Object();
					let bookingCharges = jsondata.bookingCharges;

					for (const element of bookingCharges) {
						let operationType	= element.operationType;
						let chargeValue		= parseFloat($('#wayBillCharge_' + element.chargeTypeMasterId).val()) || 0;
						
						if(groupConfiguration.isAllowOperationTypeWiseChargesEffect) {
							if(element.operationType == OPERATION_TYPE_NUETRAL)
								chargeValue = 0;
							else if(element.operationType == CHARGE_OPERATION_TYPE_SUBTRACT)
								chargeValue = -Math.abs(chargeValue);
						} else if (operationType == CHARGE_OPERATION_TYPE_SUBTRACT)
							chargeValue = -Math.abs(chargeValue);
						
						chargesColl["charge_" + element.chargeTypeMasterId] = chargeValue;
					}

					jsonObject.lrBookingCharges = JSON.stringify(chargesColl);
					jsonObject.qtyTypeWiseRateHM = qtyTypeWiseRateHM;
				}, getDeliveryChargeDetails: function(jsonObject) {
					let charges		= jsondata.deliveryCharges;
					let chargesColl = new Object(); 

					if(typeof charges != 'undefined') {
						for (const element of charges) {
							chargesColl["charge_" + element.chargeTypeMasterId] = $('#wayBillDlyCharge_' + element.chargeTypeMasterId).val();
						}
					}

					jsonObject.lrDeliveryCharges = JSON.stringify(chargesColl);
				}, getBookingChargeRemarkDetails : function(jsonObject) {
					let charges				= jsondata.bookingCharges;
					let chargesRemarkColl 	= new Object(); 

					for ( let i = 0; i < charges.length; i++) {
						if($('#wayBillChargeRemark_' + bookingCharges[i].chargeTypeMasterId).exists())
							chargesRemarkColl["charge_" + charges[i].chargeTypeMasterId] = $('#wayBillChargeRemark_' + charges[i].chargeTypeMasterId).val();
					}

					jsonObject.wayBillChargeRemark = JSON.stringify(chargesRemarkColl);
				}, getTotalAmountAfterEditConsignmentAmount : function(jsonObject) {
					let articleArray	= new Array();

					let tableSize 		= $('#editLRAmount tbody tr').length;

					if(tableSize > 0) {
						for(let i = 0; i < (tableSize - 1); i++) {
							let articleData = new Object();

							articleData.Qty			 			= $('#qty_' + [i + 1]).val();
							articleData.NewqtyAmt				= $('#newqtyAmt_' + [i + 1]).val();
							articleData.ConsignmentGoodsId		= $('#consignmentGoodsId_' + [i + 1]).val();
							articleData.SaidToContain			= $('#saidToContain_' + [i + 1]).val();
							articleData.PackingTypeMasterId		= $('#packingType_' + [i + 1]).val();
							articleData.ConsignmentDetailsId	= $('#consignmentDetailsId_' + [i + 1]).val();

							articleArray.push(articleData);
						}
					}

					jsonObject.ArticleArray = JSON.stringify(articleArray);
				}, setResponse : function(response) {
					doneTheStuff = false;
					redirectToAfterUpdate(response);
					hideLayer();
				}, calcDiscountLimit : function() {
					let disAmt 		= $('#discount').val();
					let totalAmt 	= $('#discountedAmountTotal').val();
					
					if($("#isDiscountPercent").exists() && $("#isDiscountPercent").prop("checked"))
						disAmt = (parseFloat(disAmt) * parseFloat(totalAmt)) / 100;

					if(!validateDiscountLimit(discountInPercent, totalAmt, disAmt, $('#discount'))) {
						changeTextFieldColor('discount', '', '', 'red');
						return false;
					}
					
					return true;
				}, applyRateAutomaticallyFromRateMaster : function() {
					setChargeTypeWiseChargesAfterApplyRate(); // defined in editWeightFreightRateAndArticleWiseRate.js

					for(const element of bookingCharges) {
						let chargeId			= element.chargeTypeMasterId;

						$('#wayBillCharge_' + chargeId).val($('#newCharge_' + chargeId).val());
							
						if($('#newCharge_' + chargeId).val() > 0) {
							$('#wayBillChargeRemark_' + chargeId).attr('readonly', false);
						} else {
							$('#wayBillChargeRemark_' + chargeId).val('');
							$('#wayBillChargeRemark_' + chargeId).attr('readonly', true);
						}
					}
				}
			});
		});