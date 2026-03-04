var jsondata,
TaxPaidByConstant,
BookingChargeConstant,
ChargeTypeConstant,
TaxMasterConstant,
InfoForDeliveryConstant,
WayBillTypeConstant,
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
editLRRateProperties = null,
discountInPercent = 0,
TaxMasterConstant = null,
shortCreditConfigLimit = null,
PaymentTypeConstant = null,
executive						= null,
isAgentBranchComissionBillCreated	= false,
doneTheStuff						= false,
editTopayLRAmountLessThanCurrentAmount 		= false,
editTopayLRAmountHigherThanCurrentAmount 	= false,
editTBBLRAmountLessThanCurrentAmount 		= false,
editTBBLRAmountHigherThanCurrentAmount 		= false,
allowIncreaseDecreaseRateBasedOnPermission	= false,
wayBillIsManual								= false,
allowToDecreaseRatesForGroupAdmin			= false;
prevTaxBy                                   = 0;
wayBillTaxTan  = null;
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
			PROJECT_IVUIRESOURCES + '/resources/js/module/redirectAfterUpdate.js',
			/* PROJECT_IVUIRESOURCES+'/resources/js/module/view/partymaster/partymastersetup.js' */],
			function(JsonUtility, MessageUtility, UrlParameter, Lingua, Language, AutoComplete, AutoCompleteWrapper, BootstrapSwitch, NodValidation, FocusNavigation,
					BootstrapModal) {
			'use strict';
			var jsonObject = new Object(), myNod, corporateAccountId = 0,  _this = '', wayBillId, creditorId, allowToEditAgentcommission, rateApplyOnChargeType = 0,
			editLRRateOfCreditor = false, wayBillBkgTaxTan = null, preFreight = 0;
			return Marionette.LayoutView.extend({
				initialize : function(masterObj) {
					_this 					= this;
					wayBillId 				= UrlParameter.getModuleNameFromParam('wayBillId');
					billId					= UrlParameter.getModuleNameFromParam('billId');
					creditorId 				= UrlParameter.getModuleNameFromParam('creditorId');
					redirectFilter			= UrlParameter.getModuleNameFromParam('redirectFilter');

					jsonObject.waybillId			= wayBillId;
					jsonObject.billId				= billId;
					jsonObject.creditorId			= creditorId;
					jsonObject.redirectFilter		= redirectFilter;
				}, render : function() {
					showLayer();
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/editConsignmentWS/getDataToEditSTPaidBy.do?',	_this.getDataToEditLRRate, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, getDataToEditLRRate : function(response) {
					hideLayer();

					if(response.message != undefined) {
						var errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);

						setTimeout(() => {
							window.close();
						}, 2000);
					}

					jsondata						= response;
					TaxPaidByConstant				= response.TaxPaidByConstant;
					taxBy							= response.TaxBy;
					TaxMasterConstant				= response.TaxMasterConstant;
					wayBillBkgTaxTan				= response.wayBillBkgTaxTan;
					taxes							= response.taxes;
					TaxMasterConstant				= response.TaxMasterConstant;
					groupConfiguration              = response.GroupConfiguration;
					wayBill                         = response.WayBill;
					wayBillTaxTan					= response.wayBillTaxTan;
					if(typeof taxes != 'undefined') {
						leastTaxableAmount			= taxes[0].leastTaxableAmount;
					}
					var jsonObject 					= new Object();
					var loadelement 				= new Array();
					var baseHtml 					= new $.Deferred();
					loadelement.push(baseHtml);

					$("#mainContent").load("/ivcargo/html/module/waybill/editStPaidBy/EditStPaidBy.html", function() {
						baseHtml.resolve();
					});

					$.when.apply($, loadelement).done(function() {
						hideLayer();

						_this.setHiddenElementData(response);
						_this.setLRNumber(response);
						_this.loadCreateWayBillPage(response); // load content as per configuration
						_this.setLRPresentMessage(response);
						
						if(prevTaxBy > 0){
							$('#stPaidBy').val(Number(prevTaxBy));
						}
						//_this.calcGrandTotal(response);
						//Calling from elementfocusnavigation.js file
						initialiseFocus();

						$("#Update").click(function() {
							_this.saveSTPaidBy();
							$("#Update").addClass('hide');
						});
					});
				},
				setLRPresentMessage : function(response) {
					var tableRow			= createRowInTable('tr', '', '', '');
					var stPaidByCol			= createColumnInRow(tableRow, '', '', '', '', '', '');
					appendValueInTableCol(stPaidByCol, _this.createStPaidBySelection(response));
					appendRowInTable('stPaidByRowToEdit', tableRow);
				},
				createStPaidBySelection : function(response) {
					var taxBy = response.TaxBy
					prevTaxBy = taxBy;
					var isPartyExempted	= response.isPartyExempted;
					var stPaidSel = $('<select id="stPaidBy" name="stPaidBy" class="form-control col-xs-2 stPaid" data-tooltip = "GST Paid By" style = "width: 250px;"/>');

					if(taxBy > 0) {
						stPaidSel.append('<option value="' + 0 + '" id="' + 0 + '"selected="">' + 'Not Applicable' + '</option>');

						if(taxBy == TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_ID) {
							if(groupConfiguration.showStPaidByConsignor) {
								stPaidSel.append('<option value="' + TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_ID + '" id="' + TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_ID + '" selected="selected">' + TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_NAME + '</option>');
							}

							if(groupConfiguration.showStPaidByConsignee) {
								stPaidSel.append('<option value="' + TaxPaidByConstant.TAX_PAID_BY_CONSINGEE_ID + '" id="' + TaxPaidByConstant.TAX_PAID_BY_CONSINGEE_ID + '">' + TaxPaidByConstant.TAX_PAID_BY_CONSINGEE_NAME + '</option>');
							}

							if(!groupConfiguration.hideStPaidByTransporter) {
								stPaidSel.append('<option value="' + TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_ID + '" id="' + TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_ID + '">' + TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_NAME + '</option>');
							}
							if(!groupConfiguration.hideStPaidByExempted) {
								stPaidSel.append('<option value="' + TaxPaidByConstant.TAX_PAID_BY_EXEMPTED_ID + '" id="' + TaxPaidByConstant.TAX_PAID_BY_EXEMPTED_ID + '">' + TaxPaidByConstant.TAX_PAID_BY_EXEMPTED_NAME + '</option>');
							}
						} else if(taxBy == TaxPaidByConstant.TAX_PAID_BY_CONSINGEE_ID) {
							if(groupConfiguration.showStPaidByConsignor) {
								stPaidSel.append('<option value="' + TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_ID + '" id="' + TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_ID + '">' + TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_NAME + '</option>');
							}

							if(groupConfiguration.showStPaidByConsignee) {
								stPaidSel.append('<option value="' + TaxPaidByConstant.TAX_PAID_BY_CONSINGEE_ID + '" id="' + TaxPaidByConstant.TAX_PAID_BY_CONSINGEE_ID + '" selected="selected">' + TaxPaidByConstant.TAX_PAID_BY_CONSINGEE_NAME + '</option>');
							}

							if(!groupConfiguration.hideStPaidByTransporter) {
								stPaidSel.append('<option value="' + TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_ID + '" id="' + TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_ID + '">' + TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_NAME + '</option>');
							}
							if(!groupConfiguration.hideStPaidByExempted) {
								stPaidSel.append('<option value="' + TaxPaidByConstant.TAX_PAID_BY_EXEMPTED_ID + '" id="' + TaxPaidByConstant.TAX_PAID_BY_EXEMPTED_ID + '">' + TaxPaidByConstant.TAX_PAID_BY_EXEMPTED_NAME + '</option>');
							}
						} else if(taxBy == TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_ID) {
							if(groupConfiguration.showStPaidByConsignor) {
								stPaidSel.append('<option value="' + TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_ID + '" id="' + TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_ID + '">' + TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_NAME + '</option>');
							}

							if(groupConfiguration.showStPaidByConsignee) {
								stPaidSel.append('<option value="' + TaxPaidByConstant.TAX_PAID_BY_CONSINGEE_ID + '" id="' + TaxPaidByConstant.TAX_PAID_BY_CONSINGEE_ID + '">' + TaxPaidByConstant.TAX_PAID_BY_CONSINGEE_NAME + '</option>');
							}
							if(!groupConfiguration.hideStPaidByTransporter) {
								stPaidSel.append('<option value="' + TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_ID + '" id="' + TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_ID + '" selected="selected">' + TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_NAME + '</option>');
							}
							if(!groupConfiguration.hideStPaidByExempted) {
								stPaidSel.append('<option value="' + TaxPaidByConstant.TAX_PAID_BY_EXEMPTED_ID + '" id="' + TaxPaidByConstant.TAX_PAID_BY_EXEMPTED_ID + '">' + TaxPaidByConstant.TAX_PAID_BY_EXEMPTED_NAME + '</option>');
							}
						} else if(taxBy == TaxPaidByConstant.TAX_PAID_BY_EXEMPTED_ID) {
							stPaidSel.append('<option value="' + TaxPaidByConstant.TAX_PAID_BY_EXEMPTED_ID + '" id="' + TaxPaidByConstant.TAX_PAID_BY_EXEMPTED_ID + '">' + TaxPaidByConstant.TAX_PAID_BY_EXEMPTED_NAME + '</option>');
							if(groupConfiguration.showStPaidByConsignor) {
								stPaidSel.append('<option value="' + TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_ID + '" id="' + TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_ID + '">' + TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_NAME + '</option>');
							}
							if(groupConfiguration.showStPaidByConsignee) {
								stPaidSel.append('<option value="' + TaxPaidByConstant.TAX_PAID_BY_CONSINGEE_ID + '" id="' + TaxPaidByConstant.TAX_PAID_BY_CONSINGEE_ID + '" selected="selected">' + TaxPaidByConstant.TAX_PAID_BY_CONSINGEE_NAME + '</option>');
							}
						}
					}else {

						stPaidSel.append('<option value="' + 0 + '" id="' + 0 + '"selected="selected">' + ' Not Applicable' + '</option>');

						if(isPartyExempted){
							stPaidSel.append('<option value="' + TaxPaidByConstant.TAX_PAID_BY_EXEMPTED_ID + '" id="' + TaxPaidByConstant.TAX_PAID_BY_EXEMPTED_ID + '">' + TaxPaidByConstant.TAX_PAID_BY_EXEMPTED_NAME + '</option>');
							stPaidSel.selectedIndex = TaxPaidByConstant.TAX_PAID_BY_EXEMPTED_ID;
						} else {
							if(groupConfiguration.showStPaidByConsignor) {
								stPaidSel.append('<option value="' + TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_ID + '" id="' + TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_ID + '">' + TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_NAME + '</option>');
							}

							if(groupConfiguration.showStPaidByConsignee) {
								stPaidSel.append('<option value="' + TaxPaidByConstant.TAX_PAID_BY_CONSINGEE_ID + '" id="' + TaxPaidByConstant.TAX_PAID_BY_CONSINGEE_ID + '">' + TaxPaidByConstant.TAX_PAID_BY_CONSINGEE_NAME + '</option>');
							}

							if(!groupConfiguration.hideStPaidByTransporter) {
								stPaidSel.append('<option value="' + TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_ID + '" id="' + TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_ID + '">' + TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_NAME + '</option>');
							}
							if(!groupConfiguration.hideStPaidByExempted) {
								stPaidSel.append('<option value="' + TaxPaidByConstant.TAX_PAID_BY_EXEMPTED_ID + '" id="' + TaxPaidByConstant.TAX_PAID_BY_EXEMPTED_ID + '">' + TaxPaidByConstant.TAX_PAID_BY_EXEMPTED_NAME + '</option>');
							}
						}
					} 
					return stPaidSel;
				},
				setHiddenElementData : function(response) {
					$('#wayBillId').val(wayBill.wayBillId);
					$('#wayBillNo').val(wayBill.wayBillNumber);
					$('#wayBillTypeId').val(wayBill.wayBillTypeId);
				}, setLRNumber : function(response) {
					if(typeof wayBill != 'undefined') {
						$('#lrNumber').html('<b>LR No. - ' + wayBill.wayBillNumber + '</b>');
					}
				}, loadCreateWayBillPage : function(response) {
					$("#lastSTaxDate").val(response.LastChangeDateForServiceTax);
					$("#lastSTaxAmt").val(response.OldServiceTaxRate);
				}, enableDisableSTPaidBy : function(response) {
					if(typeof taxBy != 'undefined' && taxBy > 0) {
						$('#STPaidBy').prop('disabled', false);
					} else {
						$('#STPaidBy').prop('disabled', true);
					}
				}, saveSTPaidBy : function() {
					if(_this.formValidation()) {				
						$("#Update").addClass('hide');
						if(!doneTheStuff) {

							var answer = confirm ("Are you sure you want to save LR charges ?");

							if (answer) {
								doneTheStuff = true;
								$('#STPaidBy').prop('disabled', false);
								$('#DeliveryTo').prop('disabled', false);

								var serviceTaxAmount		= 0;

								var jsonObject		    = new Object();
								jsonObject.prevTaxType  = prevTaxBy;
								jsonObject.waybillId    = wayBillId;
								jsonObject.taxTypeId    = $('#stPaidBy').val();
								jsonObject.redirectTo   = redirectFilter;
								showLayer();
								getJSON(jsonObject, WEB_SERVICE_URL	+ '/editConsignmentWS/editSTPaidBy.do?', _this.setResponse, EXECUTE_WITHOUT_ERROR);

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
					var selectedTaxBy = $('#stPaidBy').val();
					if(selectedTaxBy == undefined || selectedTaxBy == 'undefined'){
						selectedTaxBy = 0;
					}
					if(selectedTaxBy == prevTaxBy){
						showMessage('error', 'Please Select Different STPaidBy');
						changeTextFieldColor('STPaidBy', '', '', 'red');
						return false;
					}
					var lrAmt         = wayBill.wayBillGrandTotal;
					if(typeof taxes != 'undefined' && taxes != null) {
						if(selectedTaxBy == 0 && (typeof wayBillTaxTan != 'undefined' && wayBillTaxTan != null && wayBillTaxTan.length > 0)) {	
							showMessage('error', 'Please Select Valid GST Paid By');
							changeTextFieldColor('STPaidBy', '', '', 'red');
							return false;
						} else {
							changeTextFieldColorWithoutFocus('STPaidBy', '', '', 'green');
						}
					}
					if(prevTaxBy == TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_ID && selectedTaxBy != TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_ID){
						showMessage('error', 'You Cannot Change Transporter To Other');
						return false;
					}
					if(prevTaxBy != TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_ID && selectedTaxBy == TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_ID){
						showMessage('error', 'You Cannot Select Transporter');
						return false;
					}

					if(selectedTaxBy == TaxPaidByConstant.TAX_PAID_BY_NOT_APPLICABLE_ID && lrAmt > leastTaxableAmount ){
						showMessage('error', 'You Cannot Select Transporter Because LR Amt is Higher than '+leastTaxableAmount);
						return false;
					}
					return true;
				}, setResponse : function(response) {
					if(response != undefined && response.isUpdated!=undefined && response.isUpdated){
						doneTheStuff = false;
						redirectToAfterUpdate(response);
						hideLayer();
					}else{
						showMessage('error', 'Failed To Edit STPaidBy');
					}
				},
			});
		});