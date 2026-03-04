var jsondata,
TaxPaidByConstant,
BookingChargeConstant,
TaxMasterConstant,
InfoForDeliveryConstant,
wayBill,
leastTaxableAmount = 0,
redirectFilter = 0,
billId	= 0,
taxes,
freightAmount = 0,
rateHM,
allowToEditSTPaidBy,
qtyTypeWiseRateHM,
allowRateInDecimal,
consignmentDetailsList,
totalQuantityFreightAmt = 0,
minimumRateConfigValue = 0,
transportModeId	= 1,
totalPreConsignmentAmount = 0,
noOfConsignmentToAdd	= 0,
consDetailsList	= null,
preIsConsignmentExempted	= false,
validateConsignmentOnExempted	= false,
disableArticleAmountForGroupAdmin = false,
packingType	= null,
ChargeTypeConstant,
consignmentSummary	= null,
editConsignmentProperties	= null,
applyRateEditConsignmentConfig	= null,
BookingTypeConstant			= null,
chargeTypeList = null,
chargeType	= 0, isQuantity = 0,
vehicleType	= null,
consignor	= null,
minWeight = 0,
corporateAccountId = 0,
creditorId = 0,
isTaxPaidByTransporter			= false,
partyId	= 0,
allowToDecreaseConsignmentAmount	= false,
allowToDecreaseConsignmentFreightAmount		= false,
executive,
isTokenLR	= false,
showSaidToContainByPackingType	= false,
groupConfiguration = null,
shortCreditConfigLimit = null,
PaymentTypeConstant = null;
isAgentBranchComissionBillCreated = false,
doneTheStuff		= false,
wayBillTypeId = 0,
roundOffChargeWeight = false,
shortCreditCollLedgerId	= 0,
txnTypeId = 0, articleArray = null;

define(
		[
		 '/ivcargo/resources/js/generic/urlparameter.js',
		 'JsonUtility',
		 'messageUtility',
		 'jquerylingua',
		 'language',
		 'autocomplete',
	     'autocompleteWrapper',
		 'bootstrapSwitch',
		 'nodvalidation',
		 'focusnavigation',
		 PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
		 PROJECT_IVUIRESOURCES + '/resources/js/module/redirectAfterUpdate.js',
		 PROJECT_IVUIRESOURCES + '/resources/js/module/editlrrate/applyRateOnUpdate.js',
		 PROJECT_IVUIRESOURCES + '/resources/js/module/view/editconsignment/setEditConsignmentData.js',
		 PROJECT_IVUIRESOURCES + '/resources/js/module/createWayBill/commonBookingValidations.js'
		 ],
		 function(UrlParameter) {
			'use strict';
			let jsonObject = new Object(), _this = '', wayBillId, applyRateWithChangeConsignment = false, checkApplyRateAutomatically = false, allowRateInDecimal = false,
			isConsigneeIncreaseChargeWeight	= false, isConsignorIncreaseChargeWeight = false, chargeWeightConfig = null, branchId = 0, increaseChargeWeight = 0,
			cftUnitList = null, showVolumetricFeilds = false;
			return Marionette.LayoutView.extend({
				initialize : function(masterObj) {
					_this 					= this;
					wayBillId 				= UrlParameter.getModuleNameFromParam('wayBillId');
					billId					= UrlParameter.getModuleNameFromParam('billId');
					creditorId 				= UrlParameter.getModuleNameFromParam('creditorId');
					redirectFilter			= UrlParameter.getModuleNameFromParam('redirectFilter');
					shortCreditCollLedgerId	= UrlParameter.getModuleNameFromParam('shortCreditCollLedgerId');
					txnTypeId				= UrlParameter.getModuleNameFromParam('txnTypeId');
					
					jsonObject.waybillId			= wayBillId;
					jsonObject.billId				= billId;
					jsonObject.creditorId			= creditorId;
					jsonObject.redirectTo			= redirectFilter;
					jsonObject.shortCreditCollLedgerId = shortCreditCollLedgerId;

				}, render : function() {
					showLayer();
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/editConsignmentWS/getDataToEditConsignment.do?', _this.getDataToEditConsignment, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, getDataToEditConsignment : function(response) {
					hideLayer();
					
					if(response.message != undefined) {
						setTimeout(() => {
							window.close();
						}, 1500);
					}
					
					jsondata						= response;
					
					let loadelement 				= new Array();
					let baseHtml 					= new $.Deferred();
					loadelement.push(baseHtml);
					
					$("#mainContent").load("/ivcargo/html/module/waybill/editConsignment/EditConsignment.html", function() {
						baseHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						hideLayer();
						
						noOfConsignmentToAdd			= response.noOfConsignmentToAdd;
						consDetailsList					= response.consDetailsList;
						packingType						= response.packingType;
						cftUnitList						= response.cftUnitList;
						wayBill							= response.WayBill;
						groupConfiguration				= response.GroupConfiguration;
						allowRateInDecimal				= response.allowRateInDecimal;
						editConsignmentProperties		= response.EditConsignmentConfiguration;
						applyRateEditConsignmentConfig	= response.EditLRRateConfiguration;
						branchId						= wayBill.wayBillSourceBranchId;
						 
						if(redirectFilter == 14)
							editConsignmentProperties.AllowToUpdateAmount = false;
						 
						applyRateWithChangeConsignment	= applyRateEditConsignmentConfig.ApplyRate;
						checkApplyRateAutomatically		= applyRateEditConsignmentConfig.checkApplyRateAutomatically;
						ChargeTypeConstant				= response.ChargeTypeConstant;
						BookingTypeConstant				= response.BookingTypeConstant;
						consignmentSummary				= response.consignmentSummary;
						chargeType						= response.chargeType;
						chargeTypeList					= response.chargeTypeList;
						isQuantity						= response.isQuantity;
						vehicleType						= response.vehicleType;
						consignor						= response.consignor;
						validateConsignmentOnExempted	= groupConfiguration.validateConsignmentOnExempted;
						minWeight						= groupConfiguration.MinWeight;
						corporateAccountId				= response.corporateAccountId;
						isTaxPaidByTransporter			= response.isTaxPaidByTrans;
						partyId							= response.partyId;
						allowToDecreaseConsignmentFreightAmount	= response.allowToDecreaseConsignmentFreightAmount;
						allowToDecreaseConsignmentAmount		= response.allowToDecreaseConsignmentAmount;
						executive							= response.executive;
						isTokenLR							= response.isTokenLR;
						showSaidToContainByPackingType		= groupConfiguration.showSaidToContainByPackingType;
						shortCreditConfigLimit				= response.shortCreditConfigLimit;
						disableArticleAmountForGroupAdmin	= editConsignmentProperties.disableArticleAmountForGroupAdmin;
						TaxPaidByConstant					= response.TaxPaidByConstant;
						taxes								= response.taxes;
						wayBillTypeId						= wayBill.wayBillTypeId;
						roundOffChargeWeight				= groupConfiguration.roundOffChargeWeight;
						
						showVolumetricFeilds = editConsignmentProperties.editVolumetricData && (groupConfiguration.VolumetricWiseAddArticle || groupConfiguration.VolumetricRate);

						if(showVolumetricFeilds) {
							document.getElementById('tableWidthClass').classList.add('col-sm-12');
							$('#volumetricId').removeClass('hide');
							
							if(0 < Number(consDetailsList[0].length)) {
								$('#volumetric').prop('checked', true);
								_this.hideVolumetricFields();
							}
						} else
							document.getElementById('tableWidthClass').classList.add('col-sm-6');

						if(shortCreditConfigLimit != null && shortCreditConfigLimit != undefined) {
							if(shortCreditConfigLimit.creditType == 1)
								showMessage('info', " Short Credit Limit Available "+ shortCreditConfigLimit.creditLimit +"  !");
							else if (shortCreditConfigLimit.creditType == 2)
								showMessage('info', " Short Credit Balance Available "+ shortCreditConfigLimit.balance +"  !");
						}

						if(typeof taxes != 'undefined')
							leastTaxableAmount			= taxes[0].leastTaxableAmount;
						
						PaymentTypeConstant					= response.PaymentTypeConstant;
						isAgentBranchComissionBillCreated 	= response.isAgentBranchComissionBillCreated;
						
						_this.setHiddenElementData();
						_this.setLRNumber();
						_this.setLRPresentMessage();
						
						_this.setWayBillConsignmentDetailsData();
						
						if(editConsignmentProperties.allowToEditStPaidBy && typeof taxes != 'undefined')
							_this.setStPaidByData(response);
						
						if(response.editBookingChargeType) {
							if(chargeTypeList != undefined && chargeTypeList != null)
								_this.setChargeTypeList();
							
							$('#editBookingChargeType').removeClass('hide');
							$('#weightFreightRateCol').removeClass('hide');
							
							if((chargeType != CHARGETYPE_ID_WEIGHT && chargeType != CHARGETYPE_ID_METRIC_TON)|| wayBillTypeId == WAYBILL_TYPE_FOC)
								$('#weightFreightRate').attr('readonly', true);
							
							if(chargeType == CHARGETYPE_ID_WEIGHT)
								$('#weightFreightRate').val(consignmentSummary.consignmentSummaryWeightFreightRate);
							else
								$('#weightFreightRate').val(0);
								
							if(chargeType == CHARGETYPE_ID_CFT) {
								$('#cftAmountCol').removeClass('hide');
								$('#cftFreightRateCol').removeClass('hide');
								$('#cftAmount').val(consignmentSummary.cftValue);
								$('#cftFreightRate').val(consignmentSummary.cftRate);
							} else {
								$('#cftAmountCol').addClass('hide');
								$('#cftFreightRateCol').addClass('hide');
								$('#cftAmount').val(0);
								$('#cftFreightRate').val(0);
							}
							
							if(chargeType == CHARGETYPE_ID_CBM) {
								$('#cbmAmountCol').removeClass('hide');
								$('#cbmFreightRateCol').removeClass('hide');
								$('#cbmAmount').val(consignmentSummary.cbmValue);
								$('#cbmFreightRate').val(consignmentSummary.cbmRate);
							} else {
								$('#cbmAmountCol').addClass('hide');
								$('#cbmFreightRateCol').addClass('hide');
								$('#cbmAmount').val(0);
								$('#cbmFreightRate').val(0);
							}
						} else {
							$('#editBookingChargeType').remove();
							$('#weightFreightRate').val(consignmentSummary.consignmentSummaryWeightFreightRate);
						}
						
						if(editConsignmentProperties.AllowToUpdateAmount)
							$('#allowToUpdateAmount').removeClass('hide');
						
						if(!response.editBookingChargeType)
							$('#fixAmountCol').remove();
						else if(response.editBookingChargeType && chargeType != CHARGETYPE_ID_FIX || wayBillTypeId == WAYBILL_TYPE_FOC)
							$('#fixAmount').attr('readonly', true);
						
						if(!(response.showCheckBox && applyRateWithChangeConsignment && !isTokenLR))
							$('#applyRateCol').remove();
						
						$("#isRateAutoMaster").bind("click", function() {
							if(_this.checkChargeType())
								_this.getAllPackingTypeRates();
							else if(Number($('#newChargeType').val()) != CHARGETYPE_ID_FIX)
								location.reload();
						});
						
						$('#newChargeType').bind("change", function() {
							_this.changeOnChargeType(this.value);
						});
						
						$('#volumetric').bind("click", function() {
							_this.hideVolumetricFields();
						});
						
						if(groupConfiguration.showActualAndChargedWeightInMerticTon) {
							$('#actWeight').bind("keypress", function(event) {
								if(!validateFloatKeyPress(event, this))
									return false;
							});
							
							$('#chWeight').bind("keypress", function(event) {
								if(!validateFloatKeyPress(event, this))
									return false;
							});
						} else {
							$('#actWeight').bind("keypress", function(event) {
								if(!validateFloatKeyPress(event, this) || event.altKey == 1)
									return false;
							});
							
							$('#chWeight').bind("keypress", function(event) {
								if(!validateFloatKeyPress(event, this) || event.altKey == 1)
									return false;
							});
						}
						
						if(groupConfiguration.applyPartyCommissionFromPartyMaster && checkApplyRateAutomatically)
							_this.getAllPackingTypeRates();
						
						$('#actWeight').bind("blur", function() {
							_this.getParty();
							_this.getChargeWeightToAppend();
							_this.getAllPackingTypeRates();
						});
						
						$('#actWeight').bind("keyup", function() {
							_this.getParty();
						});
						
						$('#chWeight').bind("blur", function() {
							_this.editChargedWeight();
							_this.getAllPackingTypeRates();
						});
						
						if(disableArticleAmountForGroupAdmin && executive.executiveType != EXECUTIVE_TYPE_GROUPADMIN) {
							for(let i = 0; i < noOfConsignmentToAdd; i++)
								$("#qtyAmt_" + i).attr('readonly', true);
						}
						
						if(groupConfiguration.IncreaseChargeWeight) {
							if(consignor.customerDetailsBillingPartyId > 0)
								_this.getFlavourWiseChargeWeightToIncrease(consignor.customerDetailsBillingPartyId, CUSTOMER_TYPE_CONSIGNOR_ID);
							else if(wayBillTypeId == WAYBILL_TYPE_TO_PAY)
								_this.getFlavourWiseChargeWeightToIncrease(response.ConsigneeCorporateAccountId, CUSTOMER_TYPE_CONSIGNEE_ID);
							else
								_this.getFlavourWiseChargeWeightToIncrease(consignor.corporateAccountId, CUSTOMER_TYPE_CONSIGNOR_ID);
						}
						
						//Calling from elementfocusnavigation.js file
						initialiseFocus();
						
						/*$("#Update").click(function() {
							_this.saveWayBillCharges(_this);
						});*/
					});
				}, setHiddenElementData : function() {
					$('#congmntQty').val(consignmentSummary.consignmentSummaryQuantity);
					$('#actualWeight').val(consignmentSummary.consignmentSummaryActualWeight);
					$('#wayBillNo').val(wayBill.wayBillNumber);
					$('#wayBillId').val(wayBillId);
					$('#billId').val(billId);
					$('#deliveryTo').val(consignmentSummary.consignmentSummaryDeliveryTo);
					$('#preWeightFreightRate').val(consignmentSummary.consignmentSummaryWeightFreightRate);
					
					if(groupConfiguration.showActualAndChargedWeightInMerticTon && consignmentSummary.consignmentSummaryBookingTypeId == BookingTypeConstant.DIRECT_DELIVERY_DIRECT_VASULI_ID){
						$('#actWeight').val(Number(consignmentSummary.consignmentSummaryActualWeight / 1000));
						$('#chWeight').val(Number(consignmentSummary.consignmentSummaryChargeWeight / 1000));
					} else {
						$('#actWeight').val(Math.round(consignmentSummary.consignmentSummaryActualWeight));
						$('#chWeight').val(Math.round(consignmentSummary.consignmentSummaryChargeWeight)); 
					}
					
					$('#fixAmount').val(consignmentSummary.consignmentSummaryAmount);
				}, setLRNumber : function() {
					if(typeof wayBill != 'undefined') {
						$('#lrNumber').html('<b>LR No. - ' + wayBill.wayBillNumber + '</b>');
					}
				}, setChargeTypeList : function() {
					for(const element of chargeTypeList) {
						if(chargeType == element.chargeTypeId)
							$('#newChargeType').append($("<option selected='selected'/>").attr('value', element.chargeTypeId).text(element.chargeTypeName));
						else
							$('#newChargeType').append($("<option/>").attr('value', element.chargeTypeId).text(element.chargeTypeName));
					}
				}, setLRPresentMessage : function() {
					if(jsondata.errorMessage != '' && typeof jsondata.errorMessage != 'undefined')
						$('#lrPresentMessage').html('<b>' + jsondata.errorMessage + '</b>');
				}, setStPaidByData : function(response) {
					let tableRow			= createRowInTable('tr', '', '', '');
					let stPaidByCol			= createColumnInRow(tableRow, '', '', '', '', '', '');
					appendValueInTableCol(stPaidByCol, _this.createStPaidBySelection(response));
					
					appendRowInTable('stPaidByRowToEdit', tableRow);
				}, setWayBillConsignmentDetailsData : function() {
					let cons					= null;
					
					for(let i = 0; i < noOfConsignmentToAdd; i++) {
						let tableRow 			= null;
						let noOfArtCol			= null;
						let artTypeCol			= null;
						let saidtoContainCol	= null;
						let volSelCol			= null;
						let qtyAmtCol			= null;
						let cftUnitRow			= null;
						let cftValueRow			= null;
						let lengthRow			= null;
						let breadthRow			= null;
						let heightRow			= null;
						let actualWeightRow		= null;
						let chargeWeightRow		= null;
						let qtyAmount			= null;
						
						if(i < consDetailsList.length) {
							cons						= consDetailsList[i];
							preIsConsignmentExempted	= cons.exempted;
							let packingTypeMasterId		= cons.packingTypeMasterId;
							let consignmentDetailsId	= cons.consignmentDetailsId;
							let qty						= cons.quantity;
							let consignmentGoodsId		= cons.consignmentGoodsId;
							let saidtoContain			= cons.saidToContain;
							let qtyAmount				= cons.amount;
							let artCftUnitId			= cons.cftUnitId;
							let artCftValue				= cons.cftRate;
							let length					= cons.length;
							let breadth					= cons.breadth; 
							let height					= cons.height; 
							let volumetricFactor		= cons.volumetricFactor; 
							let artActualWeight			= cons.actualWeight;
							let artChargeWeight			= cons.chargeWeight;
							
							if(cons != null) {
								tableRow			= createRowInTable('tr_' + i, '', '');
								
								noOfArtCol			= createColumnInRow(tableRow, '', '', '', '', '', '');
								artTypeCol			= createColumnInRow(tableRow, '', '', '', '', '', '');
								saidtoContainCol	= createColumnInRow(tableRow, '', '', '', '', '', '');
								
								if(editConsignmentProperties.AllowToUpdateAmount)
									qtyAmtCol		= createColumnInRow(tableRow, '', '', '', '', '', '');
								else
									qtyAmtCol		= createColumnInRow(tableRow, '', 'hide', '', '', '', '');
									
								if(showVolumetricFeilds) {
									if(groupConfiguration.cftUnitSelection)
										cftUnitRow				= createColumnInRow(tableRow, '', 'volumetricCFTUnit', '', '', '', '');
										
									if(!groupConfiguration.hideCFTValueFieldOnBookingPage)
										cftValueRow				= createColumnInRow(tableRow, '', 'volumetricCFTValue', '', '', '', '');
									
									lengthRow				= createColumnInRow(tableRow, '', 'volumetricCell', '', '', '', '');
									breadthRow				= createColumnInRow(tableRow, '', 'volumetricCell', '', '', '', '');
									heightRow				= createColumnInRow(tableRow, '', 'volumetricCell', '', '', '', '');
									
									if(groupConfiguration.volumetricWeightCalculationBasedOnVolumetricFactor)
										volSelCol			= createColumnInRow(tableRow, '', 'volumetricOption', '', '', '', '');
										
									if(groupConfiguration.showVolumetricActualWeight)
										actualWeightRow				= createColumnInRow(tableRow, '', 'volumetricCellWeight', '', '', '', '');
									
									chargeWeightRow				= createColumnInRow(tableRow, '', 'volumetricCell', '', '', '', '');
								}
								
								appendValueInTableCol(noOfArtCol, _this.createNoOfArticleField(qty, i));
								appendValueInTableCol(noOfArtCol, '<input type="hidden" name="consignmentDetailsId_' + i +'" id ="consignmentDetailsId_' + i + '" value="' + consignmentDetailsId + '"/>');
								appendValueInTableCol(artTypeCol, _this.createPackingTypeSelection(packingTypeMasterId, i));
								appendValueInTableCol(saidtoContainCol, _this.createSaidtoContainFeild(saidtoContain, i));

								if(editConsignmentProperties.AllowToUpdateAmount)
									appendValueInTableCol(qtyAmtCol, _this.createAmountField(qtyAmount, i));
								else
									appendValueInTableCol(qtyAmtCol, '<input type="hidden" name="qtyAmt_' + i +'" id ="qtyAmt_' + i + '" class="qtyAmt" value="' + qtyAmount + '"/>');
								
								appendValueInTableCol(qtyAmtCol, '<input type="hidden" name="newqtyAmt_' + i +'" id ="newqtyAmt_' + i + '" class="qtyAmt" value="0"/>');
								appendValueInTableCol(saidtoContainCol, '<input type="hidden" name="consignmentGoodsId_' + i +'" id ="consignmentGoodsId_' + i + '" value="' + consignmentGoodsId + '"/>');

								if(showVolumetricFeilds) {
									if(groupConfiguration.cftUnitSelection) {
										appendValueInTableCol(cftUnitRow, _this.cftUnitSelection(artCftUnitId, i));
										appendValueInTableCol(cftUnitRow, '<input type="hidden" name="artCftUnitId_' + i +'" id ="artCftUnitId_' + i + '" value="' + artCftUnitId + '"/>');
									}
									
									if(!groupConfiguration.hideCFTValueFieldOnBookingPage)
										appendValueInTableCol(cftValueRow, _this.createCFTValueField(artCftValue, i));
										
									appendValueInTableCol(lengthRow, _this.createLengthValueField(length, i));
									appendValueInTableCol(breadthRow, _this.createBreadthValueField(breadth, i));
									appendValueInTableCol(heightRow, _this.createHeightValueField(height, i));
									
									if(volSelCol != null)
										appendValueInTableCol(volSelCol, _this.createVolTypeSelection(volumetricFactor, i));
									
									if(groupConfiguration.showVolumetricActualWeight)
										appendValueInTableCol(actualWeightRow, _this.createActualWeightField(artActualWeight, i));
										
									appendValueInTableCol(chargeWeightRow, _this.createChargeWeightField(artChargeWeight, i));
								}
								
								appendRowInTable('consignmentRowToEdit', tableRow);
							}
						} else {
							tableRow			= createRowInTable('tr_' + i, '', '');

							noOfArtCol			= createColumnInRow(tableRow, '', '', '', '', '', '');
							artTypeCol			= createColumnInRow(tableRow, '', '', '', '', '', '');
							saidtoContainCol	= createColumnInRow(tableRow, '', '', '', '', '', '');

							if(editConsignmentProperties.AllowToUpdateAmount)
								qtyAmtCol		= createColumnInRow(tableRow, '', '', '', '', '', '');
							else
								qtyAmtCol		= createColumnInRow(tableRow, '', 'hide', '', '', '', '');
								
							if(showVolumetricFeilds) {
								if(groupConfiguration.cftUnitSelection)
									cftUnitRow				= createColumnInRow(tableRow, '', 'volumetricCFTUnit', '', '', '', '');

								if(!groupConfiguration.hideCFTValueFieldOnBookingPage)
									cftValueRow			= createColumnInRow(tableRow, '', 'volumetricCFTValue', '', '', '', '');
							
								lengthRow				= createColumnInRow(tableRow, '', 'volumetricCell', '', '', '', '');
								breadthRow				= createColumnInRow(tableRow, '', 'volumetricCell', '', '', '', '');
								heightRow				= createColumnInRow(tableRow, '', 'volumetricCell', '', '', '', '');
								
								if(groupConfiguration.volumetricWeightCalculationBasedOnVolumetricFactor)
									volSelCol			= createColumnInRow(tableRow, '', 'volumetricOption', '', '', '', '');
									
								if(groupConfiguration.showVolumetricActualWeight)
									actualWeightRow		= createColumnInRow(tableRow, '', 'volumetricCellWeight', '', '', '', '');
								
								chargeWeightRow			= createColumnInRow(tableRow, '', 'volumetricCell', '', '', '', '');
							}
							
							appendValueInTableCol(noOfArtCol, _this.createNoOfArticleField(0, i));
							appendValueInTableCol(noOfArtCol, '<input type="hidden" name="consignmentDetailsId_' + i +'" id ="consignmentDetailsId_' + i + '" value="0"/>');
							appendValueInTableCol(artTypeCol, _this.createPackingTypeSelection(0, i));
							appendValueInTableCol(saidtoContainCol, _this.createSaidtoContainFeild('', i));

							if(editConsignmentProperties.AllowToUpdateAmount)
								appendValueInTableCol(qtyAmtCol, _this.createAmountField(0, i));
							else
								appendValueInTableCol(qtyAmtCol, '<input type="hidden" name="qtyAmt_' + i +'" id ="qtyAmt_' + i + '" class="qtyAmt" value="' + qtyAmount + '"/>');
							
							appendValueInTableCol(qtyAmtCol, '<input type="hidden" name="newqtyAmt_' + i +'" id ="newqtyAmt_' + i + '" class="qtyAmt" value="0"/>');
							appendValueInTableCol(saidtoContainCol, '<input type="hidden" name="consignmentGoodsId_' + i +'" id ="consignmentGoodsId_' + i + '" value="0"/>');

							if(showVolumetricFeilds) {
								if(groupConfiguration.cftUnitSelection) {
									appendValueInTableCol(cftUnitRow, _this.cftUnitSelection(0, i));
									appendValueInTableCol(cftUnitRow, '<input type="hidden" name="artCftUnitId_' + i +'" id ="artCftUnitId_' + i + '" value="0"/>');
								}
								
								if(!groupConfiguration.hideCFTValueFieldOnBookingPage)
									appendValueInTableCol(cftValueRow, _this.createCFTValueField(0, i));
									
								appendValueInTableCol(lengthRow, _this.createLengthValueField(0, i));
								appendValueInTableCol(breadthRow, _this.createBreadthValueField(0, i));
								appendValueInTableCol(heightRow, _this.createHeightValueField(0, i));
								
								if(volSelCol != null)
									appendValueInTableCol(volSelCol, _this.createVolTypeSelection(0, i));
								
								if(groupConfiguration.showVolumetricActualWeight)
									appendValueInTableCol(actualWeightRow, _this.createActualWeightField(0, i));
								
								appendValueInTableCol(chargeWeightRow, _this.createChargeWeightField(0, i));
							}
							
							appendRowInTable('consignmentRowToEdit', tableRow);
						}
						
						_this.setSaidToContainAutocomplete("#saidtoContain_" + i);
					}
					
					if(!$('#volumetric').prop('checked'))
						_this.hideVolumetricFields();
					
					$(".qty").bind("blur", function() {
						if(_this.checkChargeType())
							_this.getPackingTypeRates(this);
					});
					
					$(".packingType").bind("change", function() {
						if(showSaidToContainByPackingType) {
							let i = this.id.split('_')[1];

							$("#saidtoContain_" + i).val('');
							$("#consignmentGoodsId_" + i).val('');
						}
					});
					
					$(".packingType").bind("blur", function() {
						if(_this.checkChargeType())
							_this.getPackingTypeRates(this);
							
						_this.setSaidToContainAutocomplete(this.id);

						if(groupConfiguration.allowPackingTypeWiseMinWeightCal)
							_this.getParty();
					});
					
					$('.saidtoContain').keyup(function(event) {
						if(showSaidToContainByPackingType) {
							let i = this.id.split('_')[1];
							
							if(event.keyCode != undefined && event.keyCode != 13 && event.keyCode != 27)
								$("#consignmentGoodsId_" + i).val('');
						}
					});
					
					$(".saidtoContain").bind("blur", function() {
						if(!showSaidToContainByPackingType)
							_this.checkForNewSaidToContain(this);

						if(_this.checkChargeType())
							_this.getPackingTypeRates(this);
					});
					
					$('#saidtoContain').keyup(function(event) {
						if(event.keyCode != undefined && event.keyCode != 13 && (event.keyCode === 27 || event.keyCode === 8 || event.keyCode === 46))
							$('#consignmentGoodsId_' + (this.id).split('_')[1]).val(0);
					});
					
					$(".volumetricCalculation").bind("change", function() {
						_this.calculateVolumetricCharge(this.id);
					});
					
					$('.volumetricFactorId').bind("change", function() {
						_this.calculateVolumetricCharge(this.id);
					});
				}, setSaidToContainAutocomplete(id) {
					let i = id.split('_')[1];
					
					$("#saidtoContain_" + i).autocomplete({
					    source: function (request, response) {
					        $.getJSON(WEB_SERVICE_URL+'/autoCompleteWS/getAllConsignmentGoodsDetailsByName.do?term=' + request.term+'&packingTypeMasterId=' + $('#packingType_' + i).val() + '&showSaidToContainByPackingType=' +showSaidToContainByPackingType, function (data) {
					            response($.map(data.result, function (item) {
					                return {
					                    label		: item.name,
					                    value		: item.name,
					                    id			: item.consignmentGoodsId,
					                    exempted	: item.exempted
					                };
					            }));
					        });
					    }, select: function (e, u) {
					    	_this.getSaidToContainForEdit(u.item.exempted, this.id, u.item.id);
					    },
					    minLength: 2,
					    delay: 100
					});
				}, createNoOfArticleField : function(qty, i) {
					let noOfArticleFeild= $("<input/>", { 
						type			: 'text', 
						id				: 'qty_' + i, 
						class			: 'form-control qty volumetricCalculation', 
						name			: 'qty_' + i, 
						value 			: qty, 
						style			: 'width: 60px; text-align: right;',
						maxlength 		: '5',
						onfocus			: 'resetTextFeild(this, 0);',
						onkeypress 		: "return noNumbers(event ,this);",
						'data-tooltip'	: 'Quantity',
						placeholder		: '0'});

					return noOfArticleFeild;
				}, createPackingTypeSelection : function(packingTypeMasterId, i) {
					let packingTypeSel = $('<select id="packingType_'+ i +'" name="packingType_'+ i +'" class="form-control col-xs-2 packingType" data-tooltip = "Packing Type" style = "width: 110px;"/>');
					packingTypeSel.append($("<option>").attr('value', 0).text('---Article Type---'));

					$(packingType).each(function() {
						if(packingTypeMasterId == this.packingTypeMasterId)
							packingTypeSel.append($("<option selected='selected'>").attr('value', this.packingTypeMasterId).text(this.packingTypeMasterName));
						else
							packingTypeSel.append($("<option>").attr('value', this.packingTypeMasterId).text(this.packingTypeMasterName));
					});
					
					return packingTypeSel;
				}, createVolTypeSelection: function(volumetricFactor, i) {
					let volTypeSel = $('<select id="volumetricFactorId_' + i + '" name="volumetricFactorId_' + i + '" class="form-control col-xs-2 volumetricFactorId"  data-tooltip = "Volumetric Type" style = "width: 110px;"/>');
					volTypeSel.append($("<option>").attr('value', 0).text('---Select---'));

					let volumetricCalculationAmountList = (groupConfiguration.volumetricFactorValuesForVolumetricWeightCalculation).split(',');

					for (const element of volumetricCalculationAmountList) {
						if(Number(element) == Number(volumetricFactor))
							volTypeSel.append($("<option>").attr('selected', 'selected').attr('value', element).text(element));
						else
							volTypeSel.append($("<option>").attr('value', element).text(element));
					}
					
					return volTypeSel;
				}, cftUnitSelection : function(artCftUnitId, i) {
					let cftUnitSel = $('<select id="artCftUnitId_'+ i +'" name="artCftUnitId_'+ i +'" class="form-control col-xs-2 cftUnit volumetricCalculation" data-tooltip = "CFT Unit" style = "width: 110px;"/>');
					cftUnitSel.append($("<option>").attr('value', 0).text('--Select--'));

					$(cftUnitList).each(function() {
						if(artCftUnitId == this.cftUnitId)
							cftUnitSel.append($("<option selected='selected'>").attr('value', this.cftUnitId).text(this.cftUnitName));
						else
							cftUnitSel.append($("<option>").attr('value', this.cftUnitId).text(this.cftUnitName));
					});
					
					return cftUnitSel;
				},createStPaidBySelection : function(response) {
					
					let taxBy = response.TaxBy
					let isPartyExempted	= response.isPartyExempted;
					let stPaidSel = $('<select id="stPaidBy" name="stPaidBy" class="form-control col-xs-2 stPaid" data-tooltip = "GST Paid By" style = "width: 110px;"/>');

					if(taxBy > 0) {
						stPaidSel.append('<option value="' + 0 + '" id="' + 0 + '"selected="">' + '- Not Applicable- ' + '</option>');
					
						if(taxBy == TAX_PAID_BY_CONSINGOR_ID) {
							if(groupConfiguration.showStPaidByConsignor)
								stPaidSel.append('<option value="' + TAX_PAID_BY_CONSINGOR_ID + '" id="' + TAX_PAID_BY_CONSINGOR_ID + '" selected="selected">' + TAX_PAID_BY_CONSINGOR_NAME + '</option>');

							if(groupConfiguration.showStPaidByConsignee)
								stPaidSel.append('<option value="' + TAX_PAID_BY_CONSINGEE_ID + '" id="' + TAX_PAID_BY_CONSINGEE_ID + '">' + TAX_PAID_BY_CONSINGEE_NAME + '</option>');

							if(!groupConfiguration.hideStPaidByTransporter)
								stPaidSel.append('<option value="' + TAX_PAID_BY_TRANSPORTER_ID + '" id="' + TAX_PAID_BY_TRANSPORTER_ID + '">' + TAX_PAID_BY_TRANSPORTER_NAME + '</option>');
							
							if(!groupConfiguration.hideStPaidByExempted)
								stPaidSel.append('<option value="' + TAX_PAID_BY_EXEMPTED_ID + '" id="' + TAX_PAID_BY_EXEMPTED_ID + '">' + TAX_PAID_BY_EXEMPTED_NAME + '</option>');
						} else if(taxBy == TAX_PAID_BY_CONSINGEE_ID) {
							if(groupConfiguration.showStPaidByConsignor)
								stPaidSel.append('<option value="' + TAX_PAID_BY_CONSINGOR_ID + '" id="' + TAX_PAID_BY_CONSINGOR_ID + '">' + TAX_PAID_BY_CONSINGOR_NAME + '</option>');

							if(groupConfiguration.showStPaidByConsignee)
								stPaidSel.append('<option value="' + TAX_PAID_BY_CONSINGEE_ID + '" id="' + TAX_PAID_BY_CONSINGEE_ID + '" selected="selected">' + TAX_PAID_BY_CONSINGEE_NAME + '</option>');

							if(!groupConfiguration.hideStPaidByTransporter)
								stPaidSel.append('<option value="' + TAX_PAID_BY_TRANSPORTER_ID + '" id="' + TAX_PAID_BY_TRANSPORTER_ID + '">' + TAX_PAID_BY_TRANSPORTER_NAME + '</option>');
							
							if(!groupConfiguration.hideStPaidByExempted)
								stPaidSel.append('<option value="' + TAX_PAID_BY_EXEMPTED_ID + '" id="' + TAX_PAID_BY_EXEMPTED_ID + '">' + TAX_PAID_BY_EXEMPTED_NAME + '</option>');
						} else if(taxBy == TAX_PAID_BY_TRANSPORTER_ID) {
							if(groupConfiguration.showStPaidByConsignor)
								stPaidSel.append('<option value="' + TAX_PAID_BY_CONSINGOR_ID + '" id="' + TAX_PAID_BY_CONSINGOR_ID + '">' + TAX_PAID_BY_CONSINGOR_NAME + '</option>');

							if(groupConfiguration.showStPaidByConsignee)
								stPaidSel.append('<option value="' + TAX_PAID_BY_CONSINGEE_ID + '" id="' + TAX_PAID_BY_CONSINGEE_ID + '">' + TAX_PAID_BY_CONSINGEE_NAME + '</option>');
							
							if(!groupConfiguration.hideStPaidByTransporter)
								stPaidSel.append('<option value="' + TAX_PAID_BY_TRANSPORTER_ID + '" id="' + TAX_PAID_BY_TRANSPORTER_ID + '" selected="selected">' + TAX_PAID_BY_TRANSPORTER_NAME + '</option>');
							
							if(!groupConfiguration.hideStPaidByExempted)
								stPaidSel.append('<option value="' + TAX_PAID_BY_EXEMPTED_ID + '" id="' + TAX_PAID_BY_EXEMPTED_ID + '">' + TAX_PAID_BY_EXEMPTED_NAME + '</option>');
						} else if(taxBy == TAX_PAID_BY_EXEMPTED_ID)
							stPaidSel.append('<option value="' + TAX_PAID_BY_EXEMPTED_ID + '" id="' + TAX_PAID_BY_EXEMPTED_ID + '">' + TAX_PAID_BY_EXEMPTED_NAME + '</option>');
					} else {
						stPaidSel.append('<option value="' + 0 + '" id="' + 0 + '"selected="selected">' + '- Not Applicable- ' + '</option>');
					
						if(isPartyExempted) {
							stPaidSel.append('<option value="' + TAX_PAID_BY_EXEMPTED_ID + '" id="' + TAX_PAID_BY_EXEMPTED_ID + '">' + TAX_PAID_BY_EXEMPTED_NAME + '</option>');
							stPaidSel.selectedIndex = TAX_PAID_BY_EXEMPTED_ID;
						} else {
							if(groupConfiguration.showStPaidByConsignor)
								stPaidSel.append('<option value="' + TAX_PAID_BY_CONSINGOR_ID + '" id="' + TAX_PAID_BY_CONSINGOR_ID + '">' + TAX_PAID_BY_CONSINGOR_NAME + '</option>');

							if(groupConfiguration.showStPaidByConsignee)
								stPaidSel.append('<option value="' + TAX_PAID_BY_CONSINGEE_ID + '" id="' + TAX_PAID_BY_CONSINGEE_ID + '">' + TAX_PAID_BY_CONSINGEE_NAME + '</option>');

							if(!groupConfiguration.hideStPaidByTransporter)
								stPaidSel.append('<option value="' + TAX_PAID_BY_TRANSPORTER_ID + '" id="' + TAX_PAID_BY_TRANSPORTER_ID + '">' + TAX_PAID_BY_TRANSPORTER_NAME + '</option>');
							
							if(!groupConfiguration.hideStPaidByExempted)
								stPaidSel.append('<option value="' + TAX_PAID_BY_EXEMPTED_ID + '" id="' + TAX_PAID_BY_EXEMPTED_ID + '">' + TAX_PAID_BY_EXEMPTED_NAME + '</option>');
						}
					}
					 
					return stPaidSel;
				}, createSaidtoContainFeild : function(saidtoContain, i) {
					let aidtoContainFeild= $("<input/>", { 
						type			: 'text', 
						id				: 'saidtoContain_' + i, 
						class			: 'form-control saidtoContain',
						style			: 'width: 120px;',
						name			: 'saidtoContain_' + i, 
						value 			: saidtoContain,
						'data-tooltip'	: 'Said To Contain',
						placeholder		: 'Said To Contain'});

						return aidtoContainFeild;
				}, createAmountField : function(qtyAmt, i) {
					let onkeypress		= null;
					let readonlyVal		= false;
					
					if(!allowRateInDecimal) {
						qtyAmt			= Math.round(qtyAmt);
						onkeypress		= "if(this.value=='0')this.value='';return noNumbers(event);return validAmount(event);if(event.altKey==1){return false;}";
					} else
						onkeypress		= "if(this.value=='0')this.value='';return validateFloatKeyPress(event,this);";
					
					if(!isQuantity || wayBillTypeId == WAYBILL_TYPE_FOC) {
						readonlyVal		= true;
						qtyAmt			= 0;
					}
					
					let amountFeild= $("<input/>", { 
						type			: 'text', 
						id				: 'qtyAmt_' + i, 
						class			: 'form-control qtyAmt', 
						name			: 'qtyAmt_' + i, 
						value 			: qtyAmt, 
						'data-tooltip'	: 'Amount',
						style			: 'width: 110px;',
						onfocus			: "this.select(); if(this.value=='0')this.value=''; ",
						readonly		: readonlyVal,
						onkeypress 		: onkeypress,
						placeholder		: '0'
					});

					return amountFeild;
				}, createCFTValueField : function(artCftValue, i) {
					$("#volumetricCFTValueLabel").text(groupConfiguration.cftRateLabel);
					let amountFeild= $("<input/>", { 
						type			: 'text', 
						id				: 'artCftValue_' + i, 
						class			: 'form-control cftValue volumetricCalculation', 
						name			: 'artCftValue_' + i, 
						value 			: artCftValue, 
						'data-tooltip'	: groupConfiguration.cftRateLabel,
						style			: 'width: 110px;',
						onfocus			: "this.select(); if(this.value=='0')this.value=''; ",
						onkeypress 		: "return validAmount(event);if(getKeyCode(event) == 17){return false;}",
						placeholder		: '0'
					});

					return amountFeild;
				}, createLengthValueField : function(length, i) {
					let amountFeild= $("<input/>", { 
						type			: 'text', 
						id				: 'length_' + i, 
						class			: 'form-control volumetricCalculation', 
						name			: 'length_' + i, 
						value 			: length, 
						'data-tooltip'	: 'Length',
						style			: 'width: 110px;',
						onfocus			: "this.select(); if(this.value=='0')this.value=''; ",
						onkeypress 		: "return validAmount(event);if(getKeyCode(event) == 17){return false;}",
						placeholder		: '0'
					});

					return amountFeild;
				}, createBreadthValueField : function(breadth, i) {
					let amountFeild= $("<input/>", { 
						type			: 'text', 
						id				: 'breadth_' + i, 
						class			: 'form-control volumetricCalculation', 
						name			: 'breadth_' + i, 
						value 			: breadth, 
						'data-tooltip'	: 'Breadth',
						style			: 'width: 110px;',
						onfocus			: "this.select(); if(this.value=='0')this.value=''; ",
						onkeypress 		: "return validAmount(event);if(getKeyCode(event) == 17){return false;}",
						placeholder		: '0'
					});

					return amountFeild;
				}, createHeightValueField : function(height, i) {
					let amountFeild= $("<input/>", { 
						type			: 'text', 
						id				: 'height_' + i, 
						class			: 'form-control volumetricCalculation', 
						name			: 'height_' + i, 
						value 			: height, 
						'data-tooltip'	: 'Height',
						style			: 'width: 110px;',
						onfocus			: "this.select(); if(this.value=='0')this.value=''; ",
						onkeypress 		: "return validAmount(event);if(getKeyCode(event) == 17){return false;}",
						placeholder		: '0'
					});

					return amountFeild;
				}, createActualWeightField : function(artActualWeight, i) {
					let amountFeild= $("<input/>", { 
						type			: 'text', 
						id				: 'artActualWeight_' + i, 
						class			: 'form-control volumetricCalculation', 
						name			: 'artActualWeight_' + i, 
						value 			: artActualWeight, 
						'data-tooltip'	: 'Actual Wt',
						style			: 'width: 110px;',
						onfocus			: "this.select(); if(this.value=='0')this.value=''; ",
						onkeypress 		: "return validAmount(event);if(getKeyCode(event) == 17){return false;}",
						placeholder		: '0'
					});

					return amountFeild;
				}, createChargeWeightField : function(artChargeWeight, i) {
					$("#chargeWeightLabel").text(groupConfiguration.volumetricChargeWeightLabel);
					let amountFeild= $("<input/>", { 
						type			: 'text', 
						id				: 'artChargeWeight_' + i, 
						class			: 'form-control volumetricCalculation', 
						name			: 'artChargeWeight_' + i, 
						value 			: artChargeWeight, 
						'data-tooltip'	: groupConfiguration.volumetricChargeWeightLabel,
						style			: 'width: 110px;',
						readonly		: true,
						onfocus			: "this.select(); if(this.value=='0')this.value=''; ",
						onkeypress 		: "return validAmount(event);if(getKeyCode(event) == 17){return false;}",
						placeholder		: '0'
					});

					return amountFeild;
				}, checkChargeType : function() {
					if(applyRateWithChangeConsignment && checkApplyRateAutomatically)
						return true;
					
					if($('#isRateAutoMaster').prop('checked')) {
						if(Number($('#newChargeType').val()) == CHARGETYPE_ID_FIX) {
							showMessage('info', 'You cannot do apply rate in Fix !');
							$('#isRateAutoMaster').prop('checked', false);
							return false;
						} else if(Number($('#newChargeType').val()) == CHARGETYPE_ID_CUBIC_RATE) {
							showMessage('info', 'You cannot do apply rate in Cubic Rate !');
							$('#isRateAutoMaster').prop('checked', false);
							return false;
						}
						
						return true;
					}
					
					return false;
				}, getSaidToContainForEdit : function(isExempted, eleId, consignmentGoodsId) {
					if(validateConsignmentOnExempted && isExempted != undefined) {
						if(preIsConsignmentExempted == isExempted) {
							$('#consignmentGoodsId_' + eleId.split('_')[1]).val(consignmentGoodsId);
						} else {
							showMessage('info', 'All consignments should be either "Exempted" Or "Not Exempted"');
							$('#saidtoContain_' + eleId.split('_')[1]).val('');
						}
					} else
						$('#consignmentGoodsId_' + eleId.split('_')[1]).val(consignmentGoodsId);
				}, checkForNewSaidToContain : function(obj) {
					if(editConsignmentProperties.saidToContainAutoComplete) {
						if(obj.value.length > 1) {
							let consignmentGoodsId = $('#consignmentGoodsId_' + (obj.id).split('_')[1]).val();
							
							if(consignmentGoodsId <= 0 && groupConfiguration.SaidToContain) {
								if(confirm("Said to contain does not exist, do you want to add?")) {
									$('#newSaidToConatainName').val(obj.value);
								
									$("#addSaidToContainModal").modal({
										backdrop: 'static',
									    keyboard: false
									});
									
									$('#btnSaidToContainSubmit').bind("click", function() {
										_this.saveSaidToContain(obj);
									});
								} else
									return false;
							} else
								return false;
						}
					}
				}, saveSaidToContain : function(obj) {
					if(obj.id != undefined) {
						if(!_this.validateAddSaidToContain)
							return false;
						
						let jsonObject		= new Object();
						
						jsonObject['saidToContainNameEle']	= $('#newSaidToConatainName').val();
						
						$.ajax({
							type		: 	"POST",
							url			: 	WEB_SERVICE_URL + '/consignmentGoodsWS/addSaidToContainFromEditConsignment.do',
							data		:	jsonObject,
							dataType	: 	'json',
							success		: 	function(response) {
								if (response.message != undefined) {
									let errorMessage = response.message;
									showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
									hideLayer();
								} else {
									$('#consignmentGoodsId_' + (obj.id).split('_')[1]).val(response.consignmentGoodsId);
									$('#addSaidToContainModal').modal('hide');
									$('#newSaidToConatainName').val('');
									hideLayer();
								}
							}
						});
					}
				}, validateAddSaidToContain : function() {
					if($('#newSaidToConatainName').val() == '') {
						showMessage('error', saidToContaionErrMsg); //Defined in VariableForErrorMsg.js file
						return false;
					}
					
					return true;
				}, editChargedWeight : function() {
					let actualWeight  	= Number($('#actWeight').val());
					let chargedWeight 	= Number($('#chWeight').val());
					
					if($('#actualWeight').val() > 0) {
						if(actualWeight <= minWeight) {
							if(chargedWeight < minWeight) {
								showMessage('error', 'You can not enter Charged Weight less than ' + minWeight);
								_this.calculateChargedWeight();
								return false;
							}
						} else if(chargedWeight < actualWeight) {
							showMessage('error', 'You can not enter Charged Weight less than ' + actualWeight);
							_this.calculateChargedWeight();
							return false;
						}
					}
					
					return true;
				}, calculateChargedWeight : function() {
					let actWeight  	= $('#actWeight').val();
					let capacity 	= 0;
					
					if(typeof vehicleType != 'undefined' && vehicleType != undefined)
						capacity	= vehicleType.capacity;

					if(actWeight == 0)
						$('#chWeight').val(0);
					else if(actWeight >= 1 && actWeight <= parseInt(minWeight))
						$('#chWeight').val(minWeight);
					else if(roundOffChargeWeight) {
						for(let i = actWeight; i <= parseInt(actWeight) + 9; i++) {
							let lenOfAW  = i.toString().length;
							let lastOfAW = i.toString().substring(lenOfAW, lenOfAW - 1);
							
							if(lastOfAW == 0 || lastOfAW == 5) {
								$('#chWeight').val(i.toString());
								break;
							}
						}
					} else
						$('#chWeight').val(actWeight);
					
					if(Number(consignmentSummary.consignmentSummaryBookingTypeId) == BOOKING_TYPE_FTL_ID
				 && typeof vehicleType != 'undefined' && vehicleType != undefined) {
						if(parseInt(actWeight, 10) > parseInt(capacity, 10)) {
							alert('Capacity of Vehicle is ' + capacity + ' so you can not enter Actual Weight more than that');
							$('#actWeight').val('0');
							$('#chWeight').val('0');
						}
					}
					
					if(jsondata.isChargedWeightRound && jsondata.chargedWeightRoundOffValue > 0)
						$('#chWeight').val(Math.ceil(actWeight / jsondata.chargedWeightRoundOffValue) * jsondata.chargedWeightRoundOffValue);	
					else if(corporateAccountId > 0)
						$('#chWeight').val(actWeight);	
						
					if(groupConfiguration.AllowMinActualWeight) {
						let minActWght = groupConfiguration.MinActualWeight;
				
						if(Number(actWeight) > Number(minActWght)) {
							$('#actWeight').val(actWeight);
							$('#chWeight').val(actWeight);
						} else {
							$('#actWeight').val(minActWght);
							$('#chWeight').val(minActWght);
						}
					}
					
					if(groupConfiguration.AllowMinChargedWeight && (!configuration.allowMinChargedWeightInTBB || wayBillTypeId == WAYBILL_TYPE_CREDIT)) {
						let minChrdWght = groupConfiguration.MinChargedWeight;
				
						if(Number(actWeight) == 0)
							$('#actWeight').val(actWeight);
						else if(Number(actWeight) < Number(minChrdWght))
							$('#chWeight').val(minChrdWght);
						else if(Number(actWeight) > Number(minChrdWght) && Number(minChrdWght) > 0)
							$('#chWeight').val(actWeight);
					}
					
					if(groupConfiguration.roundOffIncreasedChargedWeightValue) {
						let number 		= groupConfiguration.numberToRoundOffChargedWeight;
						let branches	= (groupConfiguration.roundOffChargedWeightByTensForBranchs).split(",");
						
						if(groupConfiguration.roundOffChargedWeightByTens) {
							for(const element of branches) {
								if(element == branchId)  //branchId is gloabally defined, it is Executive branch Id
									$('#chWeight').val(Math.round($('#chWeight').val() / 10) * 10);
								else
									$('#chWeight').val(Math.ceil($('#chWeight').val() / number) * number);
							}
						}
					}
					
					let actualWeight	= Number($('#actWeight').val());
	
					if(groupConfiguration.setDefaultChargeWeight && actualWeight > 0)
						$('#chWeight').val(groupConfiguration.defaultChargeWeightValue);
				}, changeOnChargeType : function(newChargeType) {
					$('#cbmAmount').val(0);
					$('#cbmFreightRate').val(0);
					$('#cftAmount').val(0);
					$('#cftFreightRate').val(0);
					$('#cftAmountCol').addClass('hide');
					$('#cftFreightRateCol').addClass('hide');	
					$('#cbmAmountCol').addClass('hide');
					$('#cbmFreightRateCol').addClass('hide');
						
					if(Number(newChargeType) == CHARGETYPE_ID_CFT) {
						for(let i = 0; i < noOfConsignmentToAdd; i++) {
							$('#qtyAmt_' + i).val(0);
							$('#qtyAmt_' + i).attr('readonly', true);
						}
						
						$('#cftAmount').val(consignmentSummary.cftValue);
						$('#cftFreightRate').val(consignmentSummary.cftRate);
						$('#weightFreightRate').attr('readonly', true);
						$('#fixAmount').attr('readonly', true);
						$('#weightFreightRate').val(0);
						$('#editConsignmentRate').hide();
						$('#chargesRowToEdit').empty();
						$('#isRateAutoMaster').prop('checked', false);
						$('#cftAmountCol').removeClass('hide');
						$('#cftFreightRateCol').removeClass('hide');
						$('#cbmAmount').val(0);
						$('#cbmFreightRate').val(0);
						$('#cbmAmountCol').addClass('hide');
						$('#cbmFreightRateCol').addClass('hide');										
					} else if(Number(newChargeType) == CHARGETYPE_ID_CBM) {
						for(let i = 0; i < noOfConsignmentToAdd; i++) {
							$('#qtyAmt_' + i).val(0);
							$('#qtyAmt_' + i).attr('readonly', true);
						}
						
						$('#cbmAmount').val(consignmentSummary.cbmValue);
						$('#cbmFreightRate').val(consignmentSummary.cbmRate);
						$('#weightFreightRate').attr('readonly', true);
						$('#fixAmount').attr('readonly', true);
						$('#weightFreightRate').val(0);
						$('#editConsignmentRate').hide();
						$('#chargesRowToEdit').empty();
						$('#isRateAutoMaster').prop('checked', false);
						$('#cbmAmountCol').removeClass('hide');
						$('#cbmFreightRateCol').removeClass('hide');	
						$('#cftAmount').val(0);
						$('#cftFreightRate').val(0);	
						$('#cftAmountCol').addClass('hide');
						$('#cftFreightRateCol').addClass('hide');				
					}
					
					if(Number(newChargeType) == CHARGETYPE_ID_QUANTITY) {
						if(wayBillTypeId != WAYBILL_TYPE_FOC) {
							for(let i = 0; i < noOfConsignmentToAdd; i++)
								$('#qtyAmt_' + i).removeAttr('readonly');
						}
						
						$('#fixAmount').attr('readonly', true);
						$('#weightFreightRate').attr('readonly', true);
						$('#weightFreightRate').val(0);
					} else if(Number(newChargeType) == CHARGETYPE_ID_WEIGHT || Number(newChargeType) == CHARGETYPE_ID_METRIC_TON ) {
						for(let i = 0; i < noOfConsignmentToAdd; i++) {
							$('#qtyAmt_' + i).val(0);
							$('#qtyAmt_' + i).attr('readonly', true);
						}
						
						$('#fixAmount').attr('readonly', true);
						
						if(wayBillTypeId != WAYBILL_TYPE_FOC) {
							$('#weightFreightRate').removeAttr('readonly');
							$('#weightFreightRate').val(consignmentSummary.consignmentSummaryWeightFreightRate);
						}
					} else if(Number(newChargeType) == CHARGETYPE_ID_FIX) {
						for(let i = 0; i < noOfConsignmentToAdd; i++) {
							$('#qtyAmt_' + i).val(0);
							$('#qtyAmt_' + i).attr('readonly', true);
						}
						
						$('#weightFreightRate').attr('readonly', true);
						
						if(wayBillTypeId != WAYBILL_TYPE_FOC)
							$('#fixAmount').removeAttr('readonly');
							
						$('#weightFreightRate').val(0);
						$('#editConsignmentRate').hide();
						$('#chargesRowToEdit').empty();
					
						if(wayBillTypeId != WAYBILL_TYPE_FOC)
							$('#isRateAutoMaster').prop('checked', false);
					}
					
					if($('#isRateAutoMaster').is(":checked") && Number(newChargeType) != CHARGETYPE_ID_FIX && Number(newChargeType) != CHARGETYPE_ID_CUBIC_RATE)
						_this.getAllPackingTypeRates();
				}, getAllPackingTypeRates : function() {
					if(isTokenLR)
						return;
					
					if(applyRateWithChangeConsignment && ($('#isRateAutoMaster').is(":checked") || applyRateEditConsignmentConfig.checkApplyRateAutomatically)) {
						let packingDetails	= "";
												
						for(let i = 0 ; i < noOfConsignmentToAdd; i++) {
							let	quantity		= 0;
							let	packingType		= 0;
							let	saidToContain	= 0;

							if($('#qty_' + i).val() > 0)
								quantity			= Number($('#qty_' + i).val());

							if($('#packingType_' + i).val() > 0)
								packingType			= Number($('#packingType_' + i).val());

							if($('#consignmentGoodsId_' + i).val() > 0)
								saidToContain		= Number($('#consignmentGoodsId_' + i).val());

							if(Number(packingType) > 0 && Number(quantity) > 0)
								packingDetails		+= quantity + "_" + packingType + "_" + saidToContain + ",";
						} 
						
						/*
						 * Defined in applyRateOnUpdate.js
						 */
						getAllPackingTypeRatesForEditConsignment(applyRateEditConsignmentConfig, packingDetails);
					}
				}, getPackingTypeRates : function(obj) {
					if(isTokenLR)
						return;

					if(Number(obj.value) >= 0) {
						let packingDetails		= "";

						for(let i = 0 ; i < noOfConsignmentToAdd; i++) {
							let	quantity		= 0;
							let	packingType		= 0;
							let	saidToContain	= 0;

							if($('#qty_' + i).val() > 0)
								quantity			= Number($('#qty_' + i).val());

							if($('#packingType_' + i).val() > 0)
								packingType			= Number($('#packingType_' + i).val());

							if($('#consignmentGoodsId_' + i).val() > 0)
								saidToContain		= Number($('#consignmentGoodsId_' + i).val());

							if(Number(packingType) > 0 && Number(quantity) > 0)
								packingDetails		+= quantity + "_" + packingType + "_" + saidToContain + ",";
						} 

						/*
						 * Defined in applyRateOnUpdate.js
						 */
						getAllPackingTypeRatesForEditConsignment(applyRateEditConsignmentConfig, packingDetails);
					}
				}, getParty : function() {
					if(consignor.customerDetailsBillingPartyId > 0)
						_this.getMinimumPartyWeightAndAmount(consignor.customerDetailsBillingPartyId);
					else if(consignor.corporateAccountId > 0)
						_this.getMinimumPartyWeightAndAmount(consignor.corporateAccountId);
					else
						_this.calculateChargedWeight();
				}, getMinimumPartyWeightAndAmount : function(partyId) {
					let jsonObject			= new Object();
					
					jsonObject["corporateAccountId"] 	= partyId;
					jsonObject["waybillId"] 			= $('#wayBillId').val();
					jsonObject["packingTypeIds"]		= _this.getPackingTypeIds();
					
					$.ajax({
						type		: 	"POST",
						url			: 	WEB_SERVICE_URL + '/wayBillWS/getMinimumValueConfigRate.do',
						data		:	jsonObject,
						dataType	: 	'json',
						success		: 	function(data) {
							if (!data || jQuery.isEmptyObject(data) || data.message) {
								_this.calculateChargedWeight();
								hideLayer();
							} else {
								let ptmMinimumValueConfigHM	= data.ptmMinimumValueConfigHM;
								
								if(ptmMinimumValueConfigHM != undefined && !jQuery.isEmptyObject(ptmMinimumValueConfigHM))
									minWeight	= _this.getPackingTypeWiseMinimumWeight(ptmMinimumValueConfigHM);
								else if(typeof data.MinWght != 'undefined')
									minWeight	= data.MinWght;
																	
								hideLayer();
								
								_this.calculateChargedWeight();
							}
						}
					});
				}, getChargeWeightToIncrease : function(customerId, partyType) {
					if(!groupConfiguration.IncreaseChargeWeight)
						return;
					
					let jsonObject					= new Object();
					
					jsonObject["branchId"]				= branchId;
					jsonObject["corporateAccountId"]	= customerId;
					jsonObject["chargeWeightFlavour"]	= groupConfiguration.chargeWeightFlavour;
					jsonObject["partyType"]				= partyType;
					
					if(isConsignorIncreaseChargeWeight || isConsigneeIncreaseChargeWeight)
						return;
					
					$.ajax({
						type		: 	"POST",
						url			: 	WEB_SERVICE_URL + '/rateMasterWS/getAllIncreaseChargeWeightConfigDetailsOnBooking.do',
						data		:	jsonObject,
						dataType	: 	'json',
						success		: 	function(data) {
							if(data.chargeWeightConfig) {
								chargeWeightConfig				= data.chargeWeightConfig;
								isConsignorIncreaseChargeWeight	= data.isConsignorIncreaseChargeWeight;
								isConsigneeIncreaseChargeWeight	= data.isConsigneeIncreaseChargeWeight;
							}
						}
					});
				}, getFlavourWiseChargeWeightToIncrease : function(customerId, partyType) {
					switch(groupConfiguration.chargeWeightFlavour) {			//chargeWeightFlavour globally defined
					case 2:
						if(partyType == CUSTOMER_TYPE_CONSIGNEE_ID)
							_this.getChargeWeightToIncrease(customerId, partyType);
						break;
					case 3:
						if(partyType == CUSTOMER_TYPE_CONSIGNOR_ID)
							isConsignorIncreaseChargeWeight	= false;
						else if(partyType == CUSTOMER_TYPE_CONSIGNEE_ID)
							isConsigneeIncreaseChargeWeight	= false;
						
						_this.getChargeWeightToIncrease(customerId, partyType);
						break;
					case 1:
					default:
						if(partyType == CUSTOMER_TYPE_CONSIGNOR_ID)
							_this.getChargeWeightToIncrease(customerId, partyType);
						break;
					}
				}, getChargeWeightToAppend : function() {
					let increasedValue	= 0;
					let totalQuatity	= 0;
					
					if(groupConfiguration.IncreaseChargeWeight) {
						let actualWeight	= $('#actWeight').val();
						
						if(increaseChargeWeight == 0)
							_this.getChargeWeightByPackingTypeAndParty();
						
						/*
						 * increaseChargeWeight coming from this method
						 * getChargeWeightByPackingTypeAndParty()
						 */
						if(actualWeight > 0 && increaseChargeWeight > 0) {
							if(groupConfiguration.increaseChargeWeightOnAddedQuantity) {
								for(let i = 0; i < noOfConsignmentToAdd; i++) {
									if($('#qty_0').html() == $('#qty_' + i).html() && $('#qty_' + i).html() > 0)
										totalQuatity += parseInt($('#qty_' + i).html());
								}
								
								increasedValue = Math.round(Number(actualWeight) + Number(totalQuatity * increaseChargeWeight));
							} else
								increasedValue = Number(actualWeight) + Number(increaseChargeWeight);
							
							_this.roundOffIncreasedChargedWeightValue(increasedValue);	
						}
					}
				}, getChargeWeightByPackingTypeAndParty : function() {
					increaseChargeWeight	= 0;	// Globally Defined
	
					/*
					 * chargeWeightConfig coming from this method
					 * getChargeWeightToIncrease(customerId)
					 */
					if(chargeWeightConfig != undefined) {
						for(const element of chargeWeightConfig) {
							let chargeWeightConfiguration	= element;
							
							for(let j = 0; j < noOfConsignmentToAdd; j++) {
								if($('#packingType_' + j).val() > 0 && Number(chargeWeightConfiguration.packingTypeId) == Number($('#packingType_' + j).val())) {
									increaseChargeWeight	= chargeWeightConfiguration.chargeWeight;
									break;
								}
							}
						}
					}
				}, roundOffIncreasedChargedWeightValue : function(increasedValue) {
					let number 		= groupConfiguration.numberToRoundOffChargedWeight;
					let branches	= (groupConfiguration.roundOffChargedWeightByTensForBranchs).split(",");
					
					if(groupConfiguration.roundOffIncreasedChargedWeightValue) {
						if(groupConfiguration.roundOffChargedWeightByTens) {
							for(const element of branches) {
								if(element == branchId)
									$('#chargedWeight').val(Math.round(increasedValue / 10) * 10);
								else
									$('#chargedWeight').val(Math.ceil(increasedValue / number) * number);
							}
						} 
					} else
						$('#chargedWeight').val(increasedValue);
				}, getPackingTypeIds : function() {
					let  packingTypeIds			= [];
					
					for(let i = 0; noOfConsignmentToAdd > i; i++) {
						if(Number($("#packingType_" + i).val()) > 0)
							packingTypeIds.push($("#packingType_" + i).val());
					}
					
					return packingTypeIds.join(',');
				}, hideVolumetricFields : function() {
					if ($('#volumetric').prop('checked')) {
						if(groupConfiguration.cftUnitSelection)
							$(".volumetricCFTUnit").removeClass("hide");
							
						if(!groupConfiguration.hideCFTValueFieldOnBookingPage)
							$(".volumetricCFTValue").removeClass("hide");
							
						$(".volumetricCell").removeClass("hide");
							
						if(groupConfiguration.showVolumetricActualWeight)
							$(".volumetricCellWeight").removeClass("hide");
							
						if(groupConfiguration.volumetricWeightCalculationBasedOnVolumetricFactor)
							$(".volumetricOption").removeClass("hide");
					} else {
						$(".volumetricCFTUnit").addClass("hide");
						$(".volumetricCFTValue").addClass("hide");
						$(".volumetricCell").addClass("hide");
						$(".volumetricCellWeight").addClass("hide");
						$(".volumetricOption").addClass("hide");
					}
				}, calculateVolumetricCharge : function(id) {
					if(!showVolumetricFeilds) return;

					id = id.split('_')[1];
					let artCftUnitId 	= $('#artCftUnitId_' + id).val();
					let length			= $('#length_' + id).val();
					let breadth			= $('#breadth_' + id).val();
					let height			= $('#height_' + id).val();
					let noOfArt			= $('#qty_' + id).val();
					let artCftValue		= $('#artCftValue_' + id).val() != undefined ? $('#artCftValue_' + id).val() : 0;
					let	artChrgWeight	= $('#artChargeWeight_' + id).val();
					let actualWeight	= 0;
					let chrgWeight		= 0;
					let volume		= Number(length) * Number(breadth) * Number(height);

					if (groupConfiguration.volumetricWeightCalculationBasedOnVolumetricFactor) {
						let	volSelAmount	= $('#volumetricFactorId_' + id).val();
						
						if(volSelAmount > 0)
							$('#artChargeWeight_' + id).val(((volume  * noOfArt) / volSelAmount).toFixed(2));
						else
							$('#artChargeWeight_' + id).val(0);
					} else if(groupConfiguration.cftWeightCalcinCMandINCH) {
						if(artCftUnitId == CFT_UNIT_CM_ID)
							artChrgWeight	= (volume * artCftValue * noOfArt) / 27000;
						else if(artCftUnitId == CFT_UNIT_INCH_ID)
							artChrgWeight	= (volume * artCftValue * noOfArt) / 1728;
						else if(artCftUnitId == CFT_UNIT_FEET_ID )
							artChrgWeight	= (volume * artCftValue * noOfArt);

						$('#artChargeWeight_' + id).val(artChrgWeight.toFixed(2));
					} else if(groupConfiguration.cftWeightCalcInINCH && artCftUnitId == CFT_UNIT_FEET_ID)
						$('#artChargeWeight_' + id).val(volume.toFixed(2));
					else if (groupConfiguration.hideCFTValueFieldOnBookingPage)
						$('#artChargeWeight_' + id).val(((volume * noOfArt) / groupConfiguration.valueToDivideForValumetricCalculation).toFixed(2));
					else if(groupConfiguration.chargedWeightCalcForCubicFeet)
						$('#artChargeWeight_' + id).val((volume * artCftValue).toFixed(2));
					else
						$('#artChargeWeight_' + id).val(((volume * artCftValue * noOfArt) / 27000).toFixed(2));
					
					for (let i = 0; i < noOfConsignmentToAdd; i++) {
						if($('#qty_' + i).val() > 0) {
							actualWeight 	+= Number($('#artActualWeight_' + i).val());
							chrgWeight		+= Number($('#artChargeWeight_' + i).val());
						}
					}

					if(groupConfiguration.showVolumetricActualWeight)
						$('#actWeight').val(Number(actualWeight));

					$('#chWeight').val(Number(chrgWeight));					
				}, getPackingTypeWiseMinimumWeight : function(ptmMinimumValueConfigHM) {
					let minWeight	= 0;
					
					for (let i = 0; i < noOfConsignmentToAdd; i++) {
						let packingTypeId	= $("#packingType_" + i).val();
						let qty				= $("#qty_" + i).val();
						
						if(qty > 0 && Number(packingTypeId) > 0) {
							let weight	= ptmMinimumValueConfigHM[CHARGE_SECTION_PARTY_MINIMUM_WEIGHT_ID + "_" + packingTypeId];
							
							if(weight != undefined)
								minWeight 	+= Number(weight) * qty;
						}
					}
					
					return minWeight;
				}
			});
		});