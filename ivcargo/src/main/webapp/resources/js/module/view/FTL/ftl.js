var WayBillTypeConstant;
var LR_SEARCH_TYPE_ID					= 1;
var QR_CODE_USING_CONSIGNMENT			= 1;
var QR_CODE_USING_WAYBILL_NUMBER		= 2;
var destinationBranchId					= 0;
var isFtlBooking						= true;
var jsondata							= null;
var BookingChargeConstant				= null;
var isBookingDiscountAllow				= false;
var isBookingDiscountPercentageAllow	= false
var LRDate								= false;
var InvoiceDate							= false;
var maxNoOfDaysAllowBeforeCashStmtEntry = 0;
var AllowPreviousDateForGroupAdminOnly 	= false;
var backDateAllowedInCurrentMonthOnly 	= false;
var allowToCreateTruckAdvanceVoucher	= false;
var ftlBookingScreenConfig		  		= null;
var configuration						= null;
var isDiscountPercent					= false;
var ChargeTypeConstant					= null;
var doneTheStuffConsignor				= false;
var doneTheStuffConsignee				= false;
var TaxPaidByConstant					= null;
var languageKeyset;
var languageKeyset2;
var	btVehicleModalConfirm;
var containerDetails;
var manualLHPVNod;
var WayBillType;
var partyType;
var CorporateAccount					= null;
var SequenceTypeConstant				= null;
var LHPVConstant						= null;
var LHPVCharges							= null;
var accountGroupId						= 0;
var checkBoxArray						= [];
var containerDetailsArray				= [];
var stringNew							= '(New)';
var executive							= null;
var destBranchAccountGroupId			= 0;
var isFtl								= true;
var isPartialPayment					= false;
var isConsignmentExempted				= false;
var isConsignmentEWayBillExempted		= false;
var previousEWayBillExemptedValue 		= false;
var preIsConsignmentExempted			= false;
var temporary							= false;
var	fixAmountId							= 0;
var TaxMasterConstant					= null;
var lrMaxDate							= null;
var lsMaxDate							= null;
var lhpvMaxDate							= null;
var invoiceMaxDate						= null;
var partyAdvMaxDate						= null;
var defaultAutoAndManualIds				= 0;
var defaultPaymentType					= 0;
var defaultChargeType					= 0;  
var manualLRDaysAllowed					= 0;  
var manualLSDaysAllowed					= 0;  
var allowBackDaysForFtlBookingScreen					= false;  
var	isTBBPartyInConsignorName			 = false;
var	isTBBPartyInConsigneeName 			= false;
var	TaxPaidByConstant					= null;
var	setGstPaidByOnBillingParty			= false;
var	setInvoiceNoDateSameAsLrDate		= false;
var validateEwaybillNumberThroughApi	= false;
var isManualWayBill	= false;
var eWayBillHM							= {};
var isTokenWayBill						= false;
var isTokenThroughLRBooking 			= false;
var GroupConfiguration					= null;
var isConsignorTBBParty					= false;
var isConsigneeTBBParty					= false;
var allowToChangeChargeWeight			= false;
var eWayBillDetailsIdHM					= {};
var groupWiseCompanyNameHm	= {};
var moduleId, ModuleIdentifierConstant, incomeExpenseModuleId, PaymentTypeConstant, generalConfiguration = null, isValidateEwaybillFromPopup = true,
eWayBillNumberArray = [], eWayBillValidationHM	= new Map(), isFromViewEWayBill = false, allowToCheckSameCompanyGstnOnEwayBill = false, groupWiseCompanyNameId = 0, isInsuranceServiceAllow = false;
define([
	PROJECT_IVUIRESOURCES + '/resources/js/module/view/waybill/filepath/tokenGenerateWayBillFilePath.js'
	,'selectizewrapper'
	,PROJECT_IVUIRESOURCES+'/resources/js/module/view/vehicle/dispatch/createnewvehicle.js'
	,'JsonUtility'
	,'messageUtility'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'jquerylingua'
	,'language'
	,'autocomplete'
	,'autocompleteWrapper'
	,'nodvalidation'
	,'focusnavigation'//import in require.config
	,'/ivcargo/resources/js/module/redirectAfterUpdate.js'
	,'/ivcargo/resources/js/validation/regexvalidation.js'
	,'/ivcargo/resources/js/module/view/containerDetails/ContainerDetails.js'
	,'/ivcargo/resources/js/module/createWayBill/addMultipleEwayBills.js'
	,'/ivcargo/resources/js/module/createWayBill/ClientGSTNumberValidation.js'
	,'/ivcargo/resources/js/module/view/master/branchMaster.js'
	,'/ivcargo/js/shortcut.js'
	],function(FilePath, Selectizewrapper, CreateNewVehicle) {
	'use strict';
	var myNod,  _this = '', bookingCharges, taxes, showBillSelection = false, billSelectionList = null, discountTypesList,
		wayBillTypeList, bookingTypeList, chargeTypeList,taxPaidByList,newVehicle, displayChargesPanel = false, transportationModeList,
		ChargeTypeConstant,TaxPaidByConstant, counterForDeleteConsignment = 0, idNum = 0, SequenceCounter = null, 
		consignmentGoods, noOfArticlesAdded = 0, chargeWeightConfig = null, increaseChargeWeight = 0,isDuplicateLR = false,
		isTBBPartyInConsignorName = false,vehicleNumberMasterId = 0 ,subCharges = new Array(),addCharges = new Array(),lhpvNodCheck,calculatedBalanceAmount = 0,
		isFTLDuplicateLs = false,isFTLDuplicateLHPV = false,isFTLDuplicateMR = false,BookingTypeConstant,formTypeMastersArrList = null,
		FormTypeConstant, consigAddedtableRowsId = [], idNum = 0, InfoForDeliveryConstant,isAllowToPayAndTbbBookingWithZeroAmount = false,mrNumberManual;
	return Marionette.LayoutView.extend({
		initialize : function(){
			_this = this;
			this.$el.html(this.template);
		},render : function(){
			var jsonObject = new Object();
			getJSON(jsonObject, WEB_SERVICE_URL + '/wayBillWS/loadFTLBookingScreen.do?', _this.renderElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		},renderElements : function(response){
			showLayer();
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/template/ftl/ftl.html",
					function() {
				baseHtml.resolve();
			});
			hideLayer();

			$.when.apply($, loadelement).done(function() {
				jsondata							= response;
				executive							= response.executive;
				bookingCharges						= response.bookingCharges;
				taxes								= response.taxes;
				BookingChargeConstant				= response.BookingChargeConstant;
				bookingTypeList						= response.bookingTypeList;
				ftlBookingScreenConfig				= response.ftlBookingScreenConfig;
				configuration						= response.ftlBookingScreenConfig;
				GroupConfiguration					= response.GroupConfiguration;
				displayChargesPanel					= ftlBookingScreenConfig.DisplayChargesPanel;
				showBillSelection					= response.SHOW_BILL_SELECTION;
				billSelectionList					= response.billSelectionList;
				chargeTypeList						= response.chargeTypeList;
				WayBillTypeConstant					= response.WayBillTypeConstant;
				wayBillTypeList						= response.wayBillTypeList;
				ChargeTypeConstant					= response.ChargeTypeConstant;
				consignmentGoods					= response.ConsignmentGoods;
				isBookingDiscountAllow				= response.isBookingDiscountAllow;
				isBookingDiscountPercentageAllow	= response.isBookingDiscountPercentageAllow;
				discountTypesList					= response.discountTypes;
				taxes								= response.taxes;
				LRDate								= ftlBookingScreenConfig.LRDate;
				InvoiceDate							= ftlBookingScreenConfig.InvoiceDate;
				maxNoOfDaysAllowBeforeCashStmtEntry	= response.maxNoOfDaysAllowBeforeCashStmtEntry;
				TaxPaidByConstant					= response.TaxPaidByConstant;
				BookingTypeConstant					= response.BookingTypeConstant;
				FormTypeConstant					= response.FormTypeConstant;
				TaxMasterConstant					= response.TaxMasterConstant;
				taxPaidByList						= response.taxPaidByList;
				LHPVConstant						= response.lhpvData.LHPVConstant;
				PaymentTypeConstant					= response.PaymentTypeConstant;
				ModuleIdentifierConstant			= response.ModuleIdentifierConstant;
				generalConfiguration				= response.generalConfiguration;
				formTypeMastersArrList				= response.formTypeMastersArrList;
				accountGroupId						= response.accountGroupId;
				InfoForDeliveryConstant				= response.InfoForDeliveryConstant;
				containerDetails					= response.ContainerDetails;
				CorporateAccount					= response.CorporateAccount;
				WayBillType							= response.WAYBILL_TYPE;
				SequenceTypeConstant				= response.SequenceTypeConstant;
				
				lrMaxDate							= response.lrMaxDate
				lsMaxDate							= response.lsMaxDate
				lhpvMaxDate							= response.lhpvMaxDate
				invoiceMaxDate						= response.invoiceMaxDate
				partyAdvMaxDate						= response.partyAdvMaxDate
				
				manualLRDaysAllowed					= response.manualLRDaysAllowed
				manualLSDaysAllowed					= response.manualLSDaysAllowed
				allowBackDaysForFtlBookingScreen	= response.allowBackDaysForFtlBookingScreen
				transportationModeList				= response.TransportationModeList;
				defaultAutoAndManualIds				= ftlBookingScreenConfig.defaultAutoAndManualTypeId
				isAllowToPayAndTbbBookingWithZeroAmount	= ftlBookingScreenConfig.isAllowToPayAndTbbBookingWithZeroAmount
				defaultPaymentType					= ftlBookingScreenConfig.DefaultPaymentType;
				allowToCreateTruckAdvanceVoucher	= ftlBookingScreenConfig.allowToCreateTruckAdvanceVoucher;
				defaultChargeType					= ftlBookingScreenConfig.DefaultChargeType;
				setGstPaidByOnBillingParty			= ftlBookingScreenConfig.setGstPaidByOnBillingParty;
				setInvoiceNoDateSameAsLrDate		= ftlBookingScreenConfig.setInvoiceNoDateSameAsLrDate;
				validateEwaybillNumberThroughApi	= GroupConfiguration.validateEwaybillNumberByApi;
				allowToChangeChargeWeight			= ftlBookingScreenConfig.allowToChangeChargeWeight;
				allowToCheckSameCompanyGstnOnEwayBill	= ftlBookingScreenConfig.allowToCheckSameCompanyGstnOnEwayBill;
				groupWiseCompanyNameHm				= response.groupWiseCompanyNameHm;
				
				var langObj 	= FilePath.loadLanguage();
				languageKeyset 	= loadLanguageWithParams(langObj);
				
				if (ftlBookingScreenConfig.InvoiceNoValidate)
					$("#invoiceNoMan").css('color', 'red');

				if (!ftlBookingScreenConfig.showExtraSingleEwaybillField)
					$('#ewaybillNumberDiv').css('display', 'none');
					
				if (!ftlBookingScreenConfig.showPurchaseOrderNumberFeild)
					$('#purchaseOrderNumberDiv').css('display', 'none');
					
				if (!ftlBookingScreenConfig.showDeliveryOrderNumberFeild)
					$('#deliveryOrderNumberDiv').css('display', 'none');
					
				if (!ftlBookingScreenConfig.showShipmentNumberFeild)
					$('#shipmentNumberDiv').css('display', 'none');	
					
				if (!ftlBookingScreenConfig.showShipmentEndDateFeild)
					$('#shipmentEndDateDiv').css('display', 'none');
													

				if(ftlBookingScreenConfig.BookingType) {
					if(typeof bookingTypeList !== 'undefined') {
						bookingTypeList.forEach(function(booingType) {
							$('#bookingType').append("<option value='"+ booingType.bookingTypeId +"'>" + booingType.bookingTypeName + "</option>");
						});
					}

					if(!showBillSelection) {
						if(typeof wayBillTypeList !== 'undefined') $('#lrType').focus(); else $('#bookingType').focus();
					}
				} else {
					$('#bookingTypeDiv').remove();

					if(!showBillSelection) {
						if(typeof wayBillTypeList !== 'undefined') {
							setTimeout(function() {
								$('#lrType').focus();
							},200);
						} else {
							$('#destination').focus();
						}
					}
				}
				
				if (!ftlBookingScreenConfig.FrightuptoDestination) 
					$('#freightUptoBranchDiv').remove();
				
				if (!ftlBookingScreenConfig.showFormTypeSelection)
					$('#singleFormTypesDiv').remove();
				
				if(typeof wayBillTypeList !== 'undefined') {
					wayBillTypeList.forEach(function(wayBillType) {
						$('#lrType').append("<option value='"+ wayBillType.wayBillTypeId +"'>" + wayBillType.wayBillType + "</option>");
					});
				}
				
				if(typeof transportationModeList !== 'undefined') {
					$('#transportationModePanel').removeClass('hide');
				
					transportationModeList.forEach(function(transportationMode) {
						$('#transportationMode').append("<option value='" + transportationMode.transportModeId + "'>" + transportationMode.transportModeName + "</option>");
					});
				}
				
				$("#manualLRDate").keyup(function (){ _this.setFocusOnSouceAfterDate(this); });
				$("#lrBooking").keyup(function (){ _this.setFocusOnSouceAfterLRBookingType(this); });
				$("#lrNumberManual").keyup(function (){ _this.focusAftermanualLR(this); });
				
				$("#manualLHPVDate").keyup(function (){
					_this.setFocusOnLhpvAfterDate(this);
				});
				
				$("#manualLHPVNumber").keyup(function(){
					_this.setFocusForLhpvChargesAfterLhpvNumber(this);
				})
				
				if(typeof chargeTypeList !== 'undefined') {
					chargeTypeList.forEach(function(chargeType) {
						$('#chargeType').append("<option value='"+ chargeType.chargeTypeId +"'>" + chargeType.chargeTypeName + "</option>");
					});
					
					$('#chargeType').val(defaultChargeType);
					
					$("#chargeType").bind("change", function() {
						_this.resetArticleWithTable();
						_this.setFreightAmount();
						_this.enableDisableFixAmount();
					});
					
					$('#chargeType').keyup(function(event) {
						if(event.keyCode != undefined && event.keyCode != 13 && event.keyCode != 27) {
							_this.resetArticleWithTable();
						}
					});
				}  else {
					$('#chargeTypeDiv').remove();
				}
				
				$('#chargeType').keyup(function(event) {
					if(event.keyCode != undefined && event.keyCode == 27) {
						_this.resetCharges();
						$('#totalAmt').val('0');
						$('#grandTotal').val('0');
					}
				});

				$('#chargeType').change(function() {
					if(ftlBookingScreenConfig.donNotValidateWeightOnArticleAndFix)
						_this.validateOnMetricAndWeight();
					
					_this.resetCharges();
					$('#totalAmt').val('0');
					$('#grandTotal').val('0');
				});
				
				if(allowToCreateTruckAdvanceVoucher)
					$('#allowTruckAdvanceVoucherPanel').show();
				else
					$('#allowTruckAdvanceVoucherPanel').hide();

				$('#fixAmount').keypress(function(event) {
					if($('#chargeType').val() != ChargeTypeConstant.CHARGETYPE_ID_QUANTITY)
						isNumberKeyWithDecimal(event,this.id);
					else
						return noNumbers(event);
				});
				
				$('#consignorName').keyup(function(event) {
					if(event.keyCode != undefined && event.keyCode != 13 && event.keyCode != 27)
						_this.resetArticleWithTable();
				});
				
				$('#consignorName').keyup(function(event) {
					if(event.keyCode != undefined && event.keyCode == 8) {
						$('#consignorPhn').val("");
						$('#consignorGstn').val("");
						$('#billingPartyName').val("");
						$('#billingPartyId').val(0);
						$('#consignorAddress').val("");
						$('#consignorCorpId').val(0);
						$('#partyMasterId').val("0");
						$('#partyOrCreditorId').val("0");
					}
				});
				
				$('#consigneeName').keyup(function(event) {
					if(event.keyCode != undefined && event.keyCode == 8) {
						$('#consigneePhn').val("");
						$('#consigneeGstn').val("");
						$('#consigneeAddress').val("");
						$('#consigneeCorpId').val("0");
						$('#consigneePartyMasterId').val("0");
					}
				});
				
				$('#consigneeName').keyup(function(event) {
					if(event.keyCode != undefined && event.keyCode != 13 && event.keyCode != 27)
						_this.resetArticleWithTable();
				});
				
				$('#fixAmount').keyup(function() {
					_this.setFreightAmount();
				});
				
				$('#saidToContain').keyup(function(event) {
					if(getKeyCode(event) == 13 && !ftlBookingScreenConfig.SaidToContainValidate)
						_this.checkForNewSaidToContain(this);
				});
				
				if(ftlBookingScreenConfig.showFormTypeSelection)
					_this.createOptionFormType();
				
				if(ftlBookingScreenConfig.createOperationalBranchWithLimitedFields) {
					$("#addBranchDiv").removeClass('hide');
					$("#addBranch").bind("click", function() {
						window.open("BranchMaster.do?pageId=209&eventId=1"); 
					});
				}

				if(ftlBookingScreenConfig.invoicetype) {
					$('#invoiceType').change(function() {
						if($('#invoiceType').exists() && Number($('#invoiceType').val() == 1))
							changeDisplayProperty('invoiceNumberDiv', 'inline');
						else {
							changeDisplayProperty('invoiceNumberDiv', 'none');
							$("#invoiceNo").val('');
						}
					});
				}
				
				$('#lrBooking').change(function() {
					if($('#lrBooking').exists() && Number($('#lrBooking').val() == 1))
						changeDisplayProperty('lrNumberPanel', 'inline');
					else
						changeDisplayProperty('lrNumberPanel', 'none');
				});
					
				$('#lsType').change(function() {
					if($('#lsType').exists() && Number($('#lsType').val() == 1))
						changeDisplayProperty('manualLsNumberDiv', 'inline');
					else
						changeDisplayProperty('manualLsNumberDiv', 'none');
				});
				

				$('#lhpvType').change(function() {
					if($('#lhpvType').exists() && Number($('#lhpvType').val() == 1))
						changeDisplayProperty('manualLhpvNumberDiv', 'inline');
					else
						changeDisplayProperty('manualLhpvNumberDiv', 'none');
				});
					
				$('#mrType').change(function() {
					if($('#mrType').exists() && Number($('#mrType').val() == 1))
						changeDisplayProperty('mrNumberDiv', 'inline');
					else
						changeDisplayProperty('mrNumberDiv', 'none');
				});
					
				if(ftlBookingScreenConfig.DisplayEWaybillNumberFieldOnEwaybillFormType) {
					$('#singleFormTypes').change(function() {
						if($('#singleFormTypes').exists() && Number($('#singleFormTypes').val() == FormTypeConstant.E_WAYBILL_ID))
							changeDisplayProperty('eWayBillNumberDiv', 'inline');
						else
							changeDisplayProperty('eWayBillNumberDiv', 'none');
					});
				}
				
				showHideInvoiceDiv();
				
				if(vehicleNumberMasterId == 0) {
					var autoVehicleNumber = new Object();
					var vehicleAgentAutoComplete = new Object();
					autoVehicleNumber.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getVehicleNumberAutocomplete.do';
					autoVehicleNumber.primary_key 	= 'vehicleNumberMasterId';

					var vehicleAgentAutoComplete 			= new Object();
					vehicleAgentAutoComplete.primary_key 	= 'vehicleAgentMasterId';
					vehicleAgentAutoComplete.field 			= 'name';
					$("#vehicleAgentListEle").autocompleteCustom(vehicleAgentAutoComplete);

					_this.getVehicleAgentAutoComplete();

					autoVehicleNumber.field 		= 'vehicleNumber';

					autoVehicleNumber.blurFunction	= _this.checkForNewVehicle;

					autoVehicleNumber.show_field 	= 'vehicleOwnerType,vehicleTypeName,capicity,vehicleRegisterdOwner,panNumber';
					autoVehicleNumber.sub_info 		= true;
					autoVehicleNumber.sub_as		= {vehicleOwner : languageKeyset['vehicleOwner'] ,vehicleTypeName : languageKeyset['vehicleType'] ,capicity : languageKeyset['capacity'] ,vehicleRegisterdOwner : languageKeyset['RegisterdOwner'] ,panNumber : languageKeyset['panNumber']};
					$("#vehicleNumberEle").autocompleteCustom(autoVehicleNumber);
				} else {
					$("#vehicleNumberEle").attr("disabled", "disabled"); 
				}
								
				if(typeof taxPaidByList !== 'undefined') {
					taxPaidByList.forEach(function(STPaidBy) {
						$('#STPaidBy').append("<option value='"+ STPaidBy.stPaidByid +"'>" + STPaidBy.stPaidByName + "</option>");
					});
					
					$("#STPaidBy").bind("change", function() {
						_this.calculateGSTTaxes();
						calcGrandtotal();
					});
				}
				
				$('#vehicleDetailsDiv').click(function() {
					_this.setVehicleDetails();
				});
				
				$('#LHPVDetailsDiv').click(function() {
					_this.setLHPVDetails();
				});
				
				$('#createInvoiceDiv').click(function() {
					_this.setInvoiceDetails();
				});
				
				$('#partyAdvanceDiv').click(function() {
					_this.setPartyAdvanceDetails();
				});
				
				$('#LorryHireDetailsDiv').click(function() {
					_this.setLorryHireDetails(response);
				});
				
				if (!ftlBookingScreenConfig.QtyAmt) {
					$('#artAmountDiv').remove();
				}
				
				if (!ftlBookingScreenConfig.ActualWght) {
					$('#actualWeightDiv').remove();
				}
				
				if (!ftlBookingScreenConfig.ChargedWght) {
					$('#chargeWeightDiv').remove();
				}
				
				if (!ftlBookingScreenConfig.PrivateMark) {
					$('#PrivateMarkDiv').remove();
				}
				
				if (!ftlBookingScreenConfig.DeclaredValue) {
					$('#declaredValue').remove();
				}
				
				if(!displayChargesPanel) {
					$('#leftPanel').switchClass('col-sm-9', 'col-sm-12');
					$('#leftPanel').switchClass('col-lg-9', 'col-lg-12');
					$('#lrNumberPanel').switchClass('col-sm-6', 'col-sm-3');
					$('#rightPanel').remove();
				}
			
				if (ftlBookingScreenConfig.cargoType) {
					$('#cargoTypeDiv1').removeClass('hide');
				} 
				
				if(generalConfiguration.BankPaymentOperationRequired) {
					var bankPaymentOperationModel		= new $.Deferred();
					$("#bankPaymentOperationPanel").load("/ivcargo/html/module/paymentTypeSelection/paymentTypeSelection.html",function() {
						bankPaymentOperationModel.resolve();
					});

					loadelement 	= new Array();

					loadelement.push(bankPaymentOperationModel);

					$.when.apply($, loadelement).done(function() {

						$("#viewPaymentDetails").click(function() {
							openAddedPaymentTypeModel();
						});

						$("#addedPayment").click(function() {
							$("#addedPaymentTypeModal").modal('hide');
						});

						configurePartyInfo();
						setIssueBankAutocomplete();
						setAccountNoAutocomplete();
					}).fail(function() {
					});
				}
				
				_this.callFtlShortcut();
				_this.getStates();
				_this.setDefaultValue();
				setServerDate();
				setLRBookingType();
				setLSType();
				setLhpvType();
				setInvoiceType();
				initialiseFocus();
				setMRType();
				
				if(displayChargesPanel) {
					var container = $('#charges');
	
					bookingCharges.forEach(function(charges) {
						var tr = $('<tr>');
						tr.append('<td><b>' + charges['displayName'] + '</b></td>');
						
						if(charges['chargeTypeMasterId'] == BookingChargeConstant.FREIGHT)
							tr.append('<td><input type="text" name="charge' + charges['chargeTypeMasterId'] + '" id="charge' + charges['chargeTypeMasterId'] + '" value="0" class="form-control text-right" data-tooltip = "' + charges['displayName'] + '" readonly="readonly" onkeypress="return allowNumbersOnly(event);" onkeyup="setFocusForBookingCharges(event);" onblur="getChargesTotal();calcGrandtotal();"/></td>');
						else
							tr.append('<td><input type="text" name="charge' + charges['chargeTypeMasterId'] + '" id="charge' + charges['chargeTypeMasterId'] + '" value="0" class="form-control text-right" data-tooltip = "' + charges['displayName'] + '" onfocus="setBlankAmount(this);" onkeypress="return allowNumbersOnly(event);" onkeyup="setFocusForBookingCharges(event);" onblur="getChargesTotal();calcGrandtotal();"/></td>');
					  			
						container.append(tr);
					});
				
					var tr = $('<tr id="totalAmountPanel">');
					tr.append('<td><b>Total</b></td>');
					tr.append('<td><input type="text" name="totalAmt" id="totalAmt" value="0" readonly="readonly" class="form-control text-right" data-tooltip = "Total Amount"/></td>');
					
					container.append(tr);
				
					if(isBookingDiscountPercentageAllow) {
						var tr = $('<tr id="discountPercentageRow">');
						tr.append('<td><b>% Discount</b></td>');
						tr.append('<td><input type="text" name="discountPercentage" id="discountPercentage" value="0" class="form-control text-right"' 
									 + "data-tooltip = 'Discount Percentage'  maxlength='5'"
									 + "onfocus='if(this.value==0)this.value=''"
									 + "onkeyup='clearIfNotNumeric(this,0);calcDiscountOnPercentage();calcGrandtotal();'"
									 + "onblur='clearIfNotNumeric(this,0);'/></td>");
						
						container.append(tr);
					}
					
					if(isBookingDiscountAllow || isBookingDiscountPercentageAllow) {
						var tr = $('<tr id="discountRow">');
						tr.append('<td><b>Discount</b></td>');
						tr.append('<td><input id="discount" name="discount" value=0 type="text" maxlength="10" data-tooltip = "Discount"'
									+ "class='form-control text-right' autocomplete='off'"
									+ "onfocus='setBlankAmount(this);"
									+ "onkeypress='return allowDecimalCharacterOnly(event);if(getKeyCode(event) == 17){return false;}'"
									+ "onkeyup='checkAndUpdateDiscountOnPercentage();calcGrandtotal();return isValidForPercentage(event,this);'"
									+ "onblur='if(this.value=='')this.value='0';calcGrandtotal();setFocusForDiscount(this,'remark');' />"
									+ "<br><span id='isDiscountPercentDiv'><input onclick='calcGrandtotal();' name='isDiscountPercent' id='isDiscountPercent' type='checkbox' data-tooltip = 'Discount %'"
									+ "onfocus='' />Disc in %</div></td>");
						
						container.append(tr);
					}
					
					if(!isBookingDiscountAllow)
						$('#isDiscountPercentDiv').remove();
					
					if(isBookingDiscountAllow) {
						var tr = $('<tr id="rowdiscountTypes">');
						tr.append('<td><b>Discount Type</b></td>');
						tr.append('<td><select id="discountTypes" name="discountTypes" class="form-control text-center" data-tooltip = "Discount Type"'
									+ 'onclick="hideAllMessages();"></select></td>');
						
						setTimeout(function() { 
							if(discountTypesList != undefined) {
								$('#discountTypes').append($("<option>").attr('value', 0).text("-- Discount Types--"));
								$(discountTypesList).each(function() {
									$('#discountTypes').append($("<option>").attr('value', this.discountMasterId).text(this.discountName));
								});
							}
						}, 500);
						
						container.append(tr);
					}
					
					if(taxes != undefined ){
						taxes.forEach(function(tax) {
							var tr = $('<tr>');

							tr.append('<td><b>' + tax['taxName'] + ' ' + tax['taxAmount'].toFixed(2) + ' %</b></td>');

							if (tax.taxPercentage) {
								tr.append('<td><input type="text" name="tax' + tax['taxMasterId'] + '" id="tax' + tax['taxMasterId'] + '" value = "0"'
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
					tr.append('<td><input type="text" name="grandTotal" id="grandTotal" value="0" readonly="readonly" class="form-control text-right" data-tooltip = "Grand Amount"/></td>');
					
					container.append(tr);
					initialiseFocus();
				}
				
				$("#sourceBranch").autocomplete({
					source: "Ajax.do?pageId=9&eventId=13&filter=24&branchType=2&responseFilter="+ftlBookingScreenConfig.sourceBranchAutocompleteFlavour,
					minLength: 2,
					delay: 10,
					autoFocus: true,
					select: function(e, u) {
						if(u.item.id != 0) {
							var selectedSource = u.item.id;
							
							var srcData = new Array();
							srcData = selectedSource.split("_");
							
							$('#srcBranchId').val(parseInt(srcData[0]));
					    	$('#sourceBranchId').val(parseInt(srcData[0]));
					    	$('#sourceStateId').val(parseInt(srcData[2]));
					    	$('#sourceRegionId').val(parseInt(srcData[2]));
					    	$('#sourceSubRegionId').val(parseInt(srcData[2]));
						}
					},
				});
				
				$("#sourceBranch").keyup(function(event){
					if(event.keyCode != undefined && event.keyCode === 13){
						if($('#srcBranchId').val() <= 0 && true)
							_this.openCreateBranchModal(1);
					} else if(event.keyCode != undefined && (event.keyCode === 8 || event.keyCode === 46))
						$('#srcBranchId').val(0);
				})
				
				$("#destination").autocomplete({
					source: "DestinationBranchAutoCompleteForAjaxAction.do?pageId=9&eventId=27&branchType=2&isOwnBranchRequired="+ftlBookingScreenConfig.isOwnBranchRequired+"&isOwnBranchWithLocationsRequired="+ftlBookingScreenConfig.OwnBranchLocationsRequired+"&locationId="+executive.branchId+"&responseFilter="+ftlBookingScreenConfig.BookingDestinationutocompleteResponse+"&deliveryDestinationBy="+ftlBookingScreenConfig.DeliveryDestinationBy+"&branchNetworkConfiguration="+ftlBookingScreenConfig.BranchNetworkConfiguration+"&branchAutoSaveForFtl="+ftlBookingScreenConfig.branchAutoSaveForFtl,
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

							destBranchAccountGroupId 	= parseInt(destData[4]);

						}
					},
				});
				
				$("#destination").keyup(function(event){
					if(event.keyCode != undefined && event.keyCode === 13) {
						if($('#destBranchId').val() <= 0 && true)
							_this.openCreateBranchModal(2);
					} else if(event.keyCode != undefined && (event.keyCode === 8 || event.keyCode === 46))
						_this.resetDestinationPointData();
				});
				
				if (ftlBookingScreenConfig.FrightuptoDestination) {
					$("#freightUptoBranch").autocomplete({
						source: "Ajax.do?pageId=9&eventId=13&responseFilter="+ftlBookingScreenConfig.BookingFreightUptoBranchAutocompleteResponse,
						minLength: 2,
						delay: 10,
						autoFocus: true,
						select: function(event, ui) {
							if(ui.item.id != 0)
								$('#freightUptoBranchId').val(ui.item.id.split("_")[0]);
						},
					});
				}
				
				destinationBranchId = $('#destinationBranchId').val();
				
				$("#consignorName").autocomplete({
					source: "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18&partyType=1,3&customerType=1&responseFilter="+ftlBookingScreenConfig.BookingConsignorNameAutocompleteResponse+"&isBlackListPartyCheckingAllow="+ftlBookingScreenConfig.isBlackListPartyCheckingAllow+"&moduleFilterForBlackListPartyChecking=1",
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
											if(!data.partyDetails)
												return;

											_this.setConsignorDetails(data.partyDetails);
										}
									});
						}
					},
				});
				
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
											if(!data.partyDetails)
												return;

											_this.setTbbPartyDetails(data.partyDetails);
										}
									});
						}
					},
				});
				
				$("#typeofPacking").autocomplete({
				    source: function (request, response) {
				        $.getJSON(WEB_SERVICE_URL+'/autoCompleteWS/getPackingTypeByNameAndGroupId.do?term=' + request.term, function (data) {
				            response($.map(data.result, function (item) {
				                return {
				                    label				: item.packingGroupTypeName,
				                    value				: item.packingGroupTypeName,
				                    packingTypeMasterId	: item.packingTypeMasterId
				                };
				            }));
				        });
				    }, select: function (e, u) {
				    	$('#typeofPackingId').val(u.item.packingTypeMasterId);
				    },
				    minLength	: 2,
				    delay		: 20,
				    autoFocus	: true
				});
				
				$("#saidToContain").autocomplete({
				    source: function (request, response) {
				        $.getJSON(WEB_SERVICE_URL+'/autoCompleteWS/getAllConsignmentGoodsDetailsByName.do?term=' + request.term, function (data) {
				            response($.map(data.result, function (item) {
				                return {
				                    label				: item.name,
				                    value				: item.name,
				                    consignmentGoodsId	: item.consignmentGoodsId
				                };
				            }));
				        });
				    }, select: function (e, u) {
				    	$('#consignmentGoodsId').val(u.item.consignmentGoodsId);
				    },
				    minLength	: 2,
				    delay		: 20,
				    autoFocus	: true
				});
				
				$('#addNewSaidToContainBtn').click(function() {
					var newSaidToContain = $('#newSaidToContain').val();
					
					if(newSaidToContain == null || newSaidToContain == "") {
						showMessage('error', " Please Enter Said To Contain !");	
						return false;
					}
					
					var jsonObject 	= new Object();
					
					jsonObject["saidToContainNameEle"] 	= newSaidToContain;
					jsonObject["isFTLBookingScreen"] 	= true;
					
					getJSON(jsonObject, WEB_SERVICE_URL+'/consignmentGoodsWS/addSaidToContain.do', _this.onAddSaidToContain, EXECUTE_WITH_ERROR);
					showLayer();
				});
				
				if(showBillSelection) {
					var billSelection = $('#billSelection').val();
					
					operationOnSelectTag('billSelection', 'removeAll', '', '');
					
					for(const element of billSelectionList) {
						operationOnSelectTag('billSelection', 'addNew', element.billSelectionName, element.billSelectionId);
					}
					
					if(billSelection != undefined)
						$('#billSelection').val(billSelection);
					
					_this.openBillSelectionPopup('billSelectionModel');
					
					$('#billSelection').focus();
					
					$('#billSelection').keypress(function(event) {
						if(event.keyCode != undefined && event.keyCode === 13) {
							$('#billSelectionModel').dialog('close');
							
							if($('#billSelection').val() == BOOKING_WITH_BILL) {
								$('#billSelectionText').html(BOOKING_WITH_BILL_NAME);
								$('#billSelectionText').removeClass("withoutbill").addClass("withbill");
							} else if($('#billSelection').val() == BOOKING_WITHOUT_BILL) {
								$('#billSelectionText').html(BOOKING_WITHOUT_BILL_NAME);
								$('#billSelectionText').removeClass("withbill").addClass("withoutbill");
							}
							
							next = ftlBookingScreenConfig.BookingType ? "bookingType" : "lrType";
						}
					});
				} else {
					$('#billSelectionModel').remove();
				}
				
				$("#lrType").bind("change", function() {
					_this.changeWayBillType(this.value);
				});
				
				$("#lrNumberManual").bind("keyup", function(event) {
					if(getKeyCode(event) == 13) {
						var jsonObject	= new Object();
						
						jsonObject.lrNumberManual	= this.value;
						getJSON(jsonObject, WEB_SERVICE_URL + '/wayBillWS/checkDuplicateLR.do?', _this.checkIfLRNumberExist, EXECUTE_WITH_ERROR);
					}
				});
				
				_this.changeWayBillType(ftlBookingScreenConfig.DefaultWayBillTypeForManual);
				
				$('#wayBillType').val(ftlBookingScreenConfig.DefaultWayBillTypeForManual);
				
				$('#sourceBranch').keydown(function(event) {
					if(getKeyCode(event) == 13) {
						if (!validateInputTextFeild(1, 'sourceBranch', 'sourceBranch', 'error', sourceBranchErrMsg))
							return false;
						
						return true;
					}
				});
				
				$('#destination').keydown(function(event) {
					if(getKeyCode(event) == 13) {
						if(!validateInputTextFeild(1, 'destination', 'destination', 'error', destinationErrMsg))
							return false;
						
						return true;
					}
				});
				
				$('#destination').keyup(function(event) {
					if(event.keyCode != undefined && (event.keyCode === 8 || event.keyCode === 46))
						_this.resetDestinationPointData();
				});
				
				if($('#lrBooking').exists() && Number($('#lrBooking').val() == 1)) {
					$('#lrNumberManual').blur(function() {
						if(!validateInputTextFeild(1, 'lrNumberManual', 'lrNumberManual', 'error', lrNumberErrMsg)) {
							setTimeout(function(){ $('#lrNumberManual').focus(); }, 0);
							return false;
						}
						
						if(ftlBookingScreenConfig.setManualLsNoSameAsManualLrNo)
							$('#manualLSNumber').val($('#lrNumberManual').val());
						
						return true;
					});
				}
				
				$('#invoiceNoDate').blur(function() {
					_this.invoiceNoDateValidation();
				});
				
				$('#manualLHPVDate').blur(function() {
					_this.lHPVDateValidation();
				});
				
				$('#invoiceDate').blur(function() {
					_this.invoiceDateValidation();
				});
				
				$('#manualLSNumber').blur(function() {
					if (!validateInputTextFeild(1, 'manualLSNumber', 'manualLSNumber', 'error', lsNumberErrMsg))
						return false;
					
					var jsonObject	= new Object();
					jsonObject.manualLSNumber = $('#manualLSNumber').val();
					jsonObject.manualLRDate = $('#manualLRDate').val();
					getJSON(jsonObject, WEB_SERVICE_URL + '/duplicateCheckingWS/validateManualLSNumber.do?', _this.checkIfManualLsNumberExist, EXECUTE_WITH_ERROR);
					
				});
				
				$('#manualLHPVNumber').blur(function() {
					var manualLhpvNumber = $('#manualLHPVNumber').val();
					
					if(manualLhpvNumber != null && manualLhpvNumber != "") {
						var jsonObject	= new Object();
						jsonObject.manualLHPVNumber = $('#manualLHPVNumber').val();
						jsonObject.manualLRDate = $('#manualLRDate').val();
						getJSON(jsonObject, WEB_SERVICE_URL + '/duplicateCheckingWS/validateManualLHPVNumber.do?', _this.checkIfManualLHPVNumberExist, EXECUTE_WITH_ERROR);
					}
				});
				
				$('#mrNumber').blur(function() {
					var mrNumber = $('#mrNumber').val();
					
					if(mrNumber != null && mrNumber != "") {
						var jsonObject	= new Object();
						jsonObject.mrNumber = $('#mrNumber').val();
						jsonObject.partyAdvDate = $('#partyAdvDate').val();
						getJSON(jsonObject, WEB_SERVICE_URL + '/duplicateCheckingWS/validateManualMRNumber.do?', _this.checkIfManualMRNumberExist, EXECUTE_WITH_ERROR);
					}
				});
				
				$('#manualLHPVNumber').blur(function() {
					next = "LorryHireDetailsDiv";
				});
				
				$('#consignorName').keydown(function(event) {
					if(getKeyCode(event) == 13)
						return !validateInputTextFeild(1, 'consignorName', 'consignorName', 'error', consinorNameErrMsg);
				});
				
				$('#consigneeName').keydown(function(event) {
					if(getKeyCode(event) == 13)
						return !validateInputTextFeild(1, 'consigneeName', 'consigneeName', 'error', consineeNameErrMsg);
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
				
				$('#billingPartyName').blur(function() {
					var billingPartyName = $('#billingPartyName').val();
					
					if (ftlBookingScreenConfig.BillingPartyNameAutocomplete && billingPartyName.length > 0) {
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
				
				$('#chargeType').keyup(function(event) {
					if(event.keyCode != undefined && event.keyCode == 27)
						_this.resetArticleWithTable();
				});
				
				$('#vehicleNumberEle').keydown(function(event) {
					if(getKeyCode(event) == 13)
						return !validateInputTextFeild(1, 'vehicleNumberEle', 'vehicleNumberEle', 'error', vehicleNumberErrMsg1);
				});
				
				$('#typeofPacking').keydown(function(event) {
					if(getKeyCode(event) == 13)
						return !validateInputTextFeild(1, 'typeofPacking', 'typeofPacking', 'error', articleTypeErrMsg);
				});
				
				if(!jQuery.isEmptyObject(response.lhpvPaymentTypeArr)) {
					Selectizewrapper.setAutocomplete({
						jsonResultList	: 	response.lhpvPaymentTypeArr,
						valueField		:	'paymentTypeId',
						labelField		:	'paymentTypeName',
						searchField		:	'paymentTypeName',
						elementId		:	'paymentType'
					});
				}
				
				if(!jQuery.isEmptyObject(response.billClearancePaymentTypeArr)) {
					Selectizewrapper.setAutocomplete({
						jsonResultList	: 	response.billClearancePaymentTypeArr,
						valueField		:	'paymentTypeId',
						labelField		:	'paymentTypeName',
						searchField		:	'paymentTypeName',
						elementId		:	'paymentTypeBill'
					});
				}
				
				if(!jQuery.isEmptyObject(response.paidPaymentTypeArr)) {
					Selectizewrapper.setAutocomplete({
						jsonResultList	: 	response.paidPaymentTypeArr,
						valueField		:	'paymentTypeId',
						labelField		:	'paymentTypeName',
						searchField		:	'paymentTypeName',
						elementId		:	'paymentTypePaidLr'
					});
				}
				
				if(defaultPaymentType > 0) {
					setTimeout(function(){ 
						$('#paymentTypePaidLr').val(defaultPaymentType);
					}, 200);
				}
				
				if (ftlBookingScreenConfig.SaidToContain && ftlBookingScreenConfig.SaidToContainValidate) {
					$('#saidToContain').keydown(function(event) {
						if(getKeyCode(event) == 13)
							return !validateInputTextFeild(1, 'saidToContain', 'saidToContain', 'error', saidToContaionErrMsg);
					});
				}
				
				if(!ftlBookingScreenConfig.donNotValidateWeightOnArticleAndFix){
					$('#actualWeight').keydown(function(event) {
						if(getKeyCode(event) == 13)
							return !validateInputTextFeild(1, 'actualWeight', 'actualWeight', 'error', actWeightErrMsg);
					});
				}
				
				if (ftlBookingScreenConfig.PrivateMarkValidate) {
					$('#privateMark').keydown(function(event) {
						if(getKeyCode(event) == 13)
							return !validateInputTextFeild(1, 'privateMark', 'privateMark', 'error', privateMarkErrMsg);
					});
				}
				
				$("#actualWeight").bind("blur", function() {
					if(this.value != '')
						_this.calculateChargedWeight('actualWeight');
				});
				
				$('#chargedWeight').keypress(function(event) {
					if(event.keyCode != undefined && event.keyCode === 13 && !allowToChangeChargeWeight) {
						_this.editChargedWeight(this);
						_this.getChargeWeightToAppend();
					}
				});
				
				$('#singleFormTypes').keyup(function(e) {
					_this.focusNextPrevious(this);
				});
				
				$('#add').keyup(function(event) {
					if(_this.validateAddArticle()) {
						_this.checkAndAddConsignment();
						_this.setFocusAfterAdd(this);
					}
				});
				
				$("#add").click(function (){
					_this.validateBasicDetails();
					
					if(!ftlBookingScreenConfig.donNotValidateWeightOnArticleAndFix)
						_this.setFocusAfterAdd(this);
				});
				
				$('#add').mouseup(function() {
					if(_this.validateAddArticle()) {
						_this.checkAndAddConsignment();
						_this.setDefaultSaidToContain();
						_this.setFocusAfterAdd(this);
					}
				});
				
				$('#invoiceAdvance').blur(function() {
					_this.calculateBillBalance();
				});
				
				$('#chargedWeight').blur(function() {
					if($("#chargeType").val() == ChargeTypeConstant.CHARGETYPE_ID_METRIC_TON){
						if(ftlBookingScreenConfig.allowToCalculateFreightInMetricTonOnWeight)
							$('#charge'+BookingChargeConstant.FREIGHT).val(parseFloat(Number($('#chargedWeight').val())) * fixAmountId);
						else
							$('#charge'+BookingChargeConstant.FREIGHT).val(parseFloat((Number($('#chargedWeight').val() * 1000)) * fixAmountId));
					}else if($("#chargeType").val() == ChargeTypeConstant.CHARGETYPE_ID_WEIGHT)
						$('#charge'+BookingChargeConstant.FREIGHT).val(parseFloat(Number($('#chargedWeight').val()) * fixAmountId));
					else if($("#chargeType").val() == ChargeTypeConstant.CHARGETYPE_ID_FIX)
						$('#charge'+BookingChargeConstant.FREIGHT).val(parseFloat(Number($('#fixAmountId').val())));
					
					calcGrandtotal();
				});
				
				if(isBookingDiscountAllow) {
					$('#discountTypes').keyup(function(event) {
						if(getKeyCode(event) == 13 && _this.validateDiscountType())
							next = "save";
					});
				}
				
				$('#vehicleNumberEle').change(function(){
					_this.getVehicleDataOnVehicleSelect();
				});
				
				$('#paymentType').change(function() {
					_this.onLhpvPaymentTypeSelect(response);
				});
				
				$('#paymentTypeBill').change(function() {
					_this.onBillPaymentTypeSelect(response);
				});
				
				$('#paymentTypePaidLr').change(function() {
					_this.onPaidLRPaymentTypeSelect(response);
				});
				
				$('#save').mouseup(function() {
					_this.saveWayBill();
				}).keydown(function(event) {
					if(event.keyCode != undefined && event.keyCode === 13)
						_this.saveWayBill();
				});
				
				$( "#consignorGstn" ).keypress(function(event) {
					if(event.keyCode != undefined && event.keyCode === 13)
							validateGSTNumberByApi(1);
							
				});
				$( "#consignorGstn" ).blur(function(e) {
					hideInfo();
					
					setTimeout(function() { 
						if(gstNoValidation(e.target.id))
							validateGSTNumberByApi1(1);
					}, 1000);
					
					if(!isGSTNumberWiseBooking()) {
						validateLengthOfConsineeGSTNumber();
					}
				});
				
				$( "#consigneeGstn" ).keypress(function(event) {
					if(event.keyCode != undefined && event.keyCode === 13)
							validateGSTNumberByApi(2);
							
				});
				$( "#consigneeGstn" ).blur(function(e) {
					hideInfo();
					
					setTimeout(function() { 
						if(gstNoValidation(e.target.id))
							validateGSTNumberByApi1(2);
					}, 1000);
					
					if(!isGSTNumberWiseBooking()) {
						validateLengthOfConsineeGSTNumber();
					}
				});
			});
		}, onAddSaidToContain : function(response) {
			if(response.message != undefined) {
				$('#addSaidToContainModal').modal('hide');
				hideLayer();
				return;
			}
			
			if(response.saidToContainName != undefined) {
				$('#saidToContain').val(response.saidToContainName);
				hideLayer();
				$('#addSaidToContainModal').modal('hide');
				$('#saidToContain').focus();
				
				if($('#newSaidToContain').val() != "")
					$('#fixAmount').focus(); 
					
				$('#fixAmount').focus(); 
			}
			
		}, onLhpvPaymentTypeSelect	: function(response){
			moduleId = response.lhpvModuleId;
			incomeExpenseModuleId	=	response.lhpvIncomeExpenseModuleId;
			
			if(generalConfiguration.BankPaymentOperationRequired)
				hideShowBankPaymentTypeOptions(document.getElementById("paymentType"));
		}, onBillPaymentTypeSelect	: function(response){
			moduleId				= response.billClearanceModuleId;
			incomeExpenseModuleId	= response.billClearanceIncomeExpenseModuleId;
			
			if(generalConfiguration.BankPaymentOperationRequired)
				hideShowBankPaymentTypeOptions(document.getElementById("paymentTypeBill"));
		},onPaidLRPaymentTypeSelect	: function(response){
			moduleId				= response.paidLRModuleId;
			incomeExpenseModuleId	= response.paidLRIncomeExpenseModuleId;
			
			if(generalConfiguration.BankPaymentOperationRequired)
				hideShowBankPaymentTypeOptions(document.getElementById("paymentTypePaidLr"));
		},setConsigneeAutoComplete : function(destBranchId) {
			$("#consigneeName").autocomplete({
				source: "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18&partyType=2,3&customerType=2&destinationId="+destBranchId+"&responseFilter="+ftlBookingScreenConfig.BookingConsigneeNameAutocompleteResponse,
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
										if(!data.partyDetails)
											return;
										
										_this.setConsigneeDetails(data.partyDetails);
									}
								});
					}
				},
			});
		},getVehicleAgentAutoComplete : function() {
			var jsonObject = new Object();
			
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/autoCompleteWS/getVehicleAgentAutocomplete.do', _this.setVehicleAgentAutocomplete,EXECUTE_WITH_ERROR);
		},setVehicleAgentAutocomplete : function(response) {
			var autovehicleAgentName = $("#vehicleAgentListEle").getInstance();
			
			$(autovehicleAgentName).each(function() {
				this.option.source = response.vehicleAgentAutoCompleteList;
			});	
			
		}, changeWayBillType : function(lrTypeId) {
			if(lrTypeId == WayBillTypeConstant.WAYBILL_TYPE_PAID) {
				$("*[data-selector='lrType'").html(WayBillTypeConstant.WAYBILL_TYPE_NAME_PAID);
				$('#DisplayWayBillType').removeClass();
				$('#DisplayWayBillType').addClass('panel-primary');
				$('#wayBillType').val(WayBillTypeConstant.WAYBILL_TYPE_PAID);
				$('#lrType').val(WayBillTypeConstant.WAYBILL_TYPE_PAID);
				$('#BillingPartyDetailsConsignor').removeClass("hide").addClass("hide");
				$('.panel-heading').attr('style','background-color :#337ab7;')
				
				$('#STPaidBy').val(TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_ID);
				
				$("#paymentModePaidLR").css('display','inline');
				
				_this.enableDisableCharges(lrTypeId);
				
			} else if(lrTypeId == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY) {
				$("*[data-selector='lrType'").html(WayBillTypeConstant.WAYBILL_TYPE_NAME_TOPAY);
				$('#DisplayWayBillType').removeClass();
				$('#DisplayWayBillType').addClass('panel-danger');
				$('#wayBillType').val(WayBillTypeConstant.WAYBILL_TYPE_TO_PAY);
				$('#lrType').val(WayBillTypeConstant.WAYBILL_TYPE_TO_PAY);
				$('#BillingPartyDetailsConsignor').removeClass("hide").addClass("hide");
				$('.panel-heading').attr('style','background-color :#e32b2b;');
				$('.panel-heading').css({"color" : "white"});
				
				$('#STPaidBy').val(TaxPaidByConstant.TAX_PAID_BY_CONSINGEE_ID);
				$("#paymentModePaidLR").css('display','none');
				
				_this.enableDisableCharges(lrTypeId);
				
			} else if(lrTypeId == WayBillTypeConstant.WAYBILL_TYPE_CREDIT) {
				$("*[data-selector='lrType'").html(WayBillTypeConstant.WAYBILL_TYPE_NAME_CREDITOR);
				$('#DisplayWayBillType').removeClass();
				$('#DisplayWayBillType').addClass('panel-info');
				$('#wayBillType').val(WayBillTypeConstant.WAYBILL_TYPE_CREDIT);
				$('#lrType').val(WayBillTypeConstant.WAYBILL_TYPE_CREDIT);
				$('#BillingPartyDetailsConsignor').removeClass('hide');
				$('.panel-heading').attr('style','background-color :#4baad9;');
				$('.panel-heading').css({"color" : "white"});
				
				$('#STPaidBy').val(TaxPaidByConstant.TAX_PAID_BY_CONSINGOR_ID);
				$("#paymentModePaidLR").css('display','none');
				
				_this.enableDisableCharges(lrTypeId);
				
			} else if(lrTypeId == WayBillTypeConstant.WAYBILL_TYPE_FOC) {
				$("*[data-selector='lrType'").html(WayBillTypeConstant.WAYBILL_TYPE_NAME_FOC);
				$('#DisplayWayBillType').switchClass('panel-info', 'panel-success');
				$('#wayBillType').val(WayBillTypeConstant.WAYBILL_TYPE_FOC);
				$('#lrType').val(WayBillTypeConstant.WAYBILL_TYPE_FOC);
				$('#BillingPartyDetailsConsignor').removeClass("hide").addClass("hide");
				$('.panel-heading').attr('style','background-color :#4ebb21;');
				$('.panel-heading').css({"color" : "white"});
				$("#paymentModePaidLR").css('display','none');
				
				_this.enableDisableCharges(lrTypeId);
			}
			
			if($('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY)
				_this.resetArticleWithTable();
		}, enableDisableCharges : function(lrTypeId) {
			var charges	= jsondata.bookingCharges;
			
			for ( var i = 0; i < charges.length; i++) {
				if(lrTypeId == WayBillTypeConstant.WAYBILL_TYPE_FOC)
					$('#charge'+charges[i].chargeTypeMasterId).attr("disabled", true);
				else
					$('#charge'+charges[i].chargeTypeMasterId).attr("disabled", false);
			}
			
			if(lrTypeId == WayBillTypeConstant.WAYBILL_TYPE_FOC) {
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
			
		}, setConsignorDetails : function(partyDetails) {
			if(partyDetails != undefined) {
				$('#consignorPhn').val(partyDetails.mobileNumber);
				$('#consignorGstn').val(partyDetails.gstn);
				$('#consignorAddress').val(partyDetails.address);

				isTBBPartyInConsignorName = partyDetails.tBBParty;
				isConsignorTBBParty = partyDetails.tBBParty;
			
				if(isTBBPartyInConsignorName) {
					$('#billingPartyName').val(partyDetails.displayName);
					$('#billingPartyId').val(partyDetails.corporateAccountId);
					$('#partyOrCreditorId').val(partyDetails.corporateAccountId);
					 _this.setGstPaidByOnBillingParty();
				}
			}

		}, setConsigneeDetails : function(partyDetails) {
			if(partyDetails != undefined) {
				isTBBPartyInConsigneeName = partyDetails.tBBParty;
				isConsigneeTBBParty	= partyDetails.tBBParty;
				
				$('#consigneePhn').val(partyDetails.mobileNumber);
				$('#consigneeGstn').val(partyDetails.gstn);
				$('#consigneeAddress').val(partyDetails.address);
				 _this.setGstPaidByOnBillingParty();
			}
			
		}, setTbbPartyDetails : function(partyDetails) {
			if(typeof partyDetails !== 'undefined' && ($('#consignorGstn').val() == null || $('#consignorGstn').val() == ""))
				$('#consignorGstn').val(partyDetails.gstn);
		}, createOptionFormType : function() {
			var formTypeArr = ftlBookingScreenConfig.FormTypeIds.split(",");
			
			$('#singleFormTypes').append("<option value='0'>Form Type </option>");
			
			for(var i = 0; i < formTypeMastersArrList.length; i++) {
				if(isValueExistInArray(formTypeArr, formTypeMastersArrList[i].formTypeMasterId))
					$('#singleFormTypes').append("<option value='"+ formTypeMastersArrList[i].formTypeMasterId +"'>" + formTypeMastersArrList[i].formTypeName + "</option>");
			}
		}, validateAddArticle : function() {
			var consignorName 	 	= $('#consignorName').val();
			var consigneeName 	 	= $('#consigneeName').val();
			var billingPartyName 	= $('#billingPartyName').val();
			var consignorParty		= 0;
			
			if (ftlBookingScreenConfig.ConsignorNameAutocomplete && consignorName.length > 0) {
				if($('#wayBillType').val() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT)
					consignorParty = $('#consignorCorpId').val();
				else
					consignorParty = $('#partyMasterId').val();
		
				if(Number(consignorParty) == 0) {
					setTimeout(function(){ 
						$('#consignorName').focus(); 
						showMessage('error', " Please Select Party From Suggestion !");	
						$('#consignorName').val('');
						changeTextFieldColor('consignorName', '', '', 'red');
					}, 200);

					return false;
				}
			}
			
			if (ftlBookingScreenConfig.ConsigneeNameAutocomplete && consigneeName.length > 0) {
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
			
			if($('#lrType').val() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT) {
				if (ftlBookingScreenConfig.BillingPartyNameAutocomplete && billingPartyName.length > 0) {
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
			
			if (ftlBookingScreenConfig.ChargeType && !validateInputTextFeild(1, 'chargeType', 'chargeType', 'error', chargeTypeErrMsg))
				return false;

			if (ftlBookingScreenConfig.Qty && !validateInputTextFeild(1, 'quantity', 'quantity', 'error',  quantityErrMsg))
				return false;

			if (ftlBookingScreenConfig.ArticleType && $('#typeofPacking').exists() && !validateInputTextFeild(1, 'typeofPacking', 'typeofPacking', 'error',  articleTypeErrMsg))
				return false;

			if(ftlBookingScreenConfig.ArticleType && $('#typeofPackingId').exists() && !validateInputTextFeild(1, 'typeofPackingId', 'typeofPacking', 'error', articleTypeErrMsg))
				return false;
			
			if (ftlBookingScreenConfig.SaidToContain && ftlBookingScreenConfig.SaidToContainValidate
				&& !validateInputTextFeild(1, 'saidToContain', 'saidToContain', 'error', saidToContaionErrMsg))
				return false;
			
			if(Number($("#chargeType").val()) == ChargeTypeConstant.CHARGETYPE_ID_METRIC_TON || Number($("#chargeType").val()) == ChargeTypeConstant.CHARGETYPE_ID_WEIGHT || Number($("#chargeType").val()) == ChargeTypeConstant.CHARGETYPE_ID_FIX) {
				var rowCount = $('#myTable tr').length - 1;
				
				if(rowCount <= 0) {
					if(Number($("#chargeType").val()) != ChargeTypeConstant.CHARGETYPE_ID_FIX){
						if(ftlBookingScreenConfig.donNotValidateWeightOnArticleAndFix){
							if($('#actualWeight').val() <= 0){
								showMessage('error', " Please Enter Weight !");	
								changeTextFieldColor('actualWeight', '', '', 'red');
								return false;
							}
						} else if(!validateInputTextFeild(1, 'chargedWeight', 'chargedWeight', 'error',  'Please Enter Charged Weight !'))
							return false;
					}
					
					if(!isAllowToPayAndTbbBookingWithZeroAmount && !validateInputTextFeild(1, 'fixAmount', 'fixAmount', 'error',  'Please Enter Amount !'))
						return false;
				}
			}
			
			if((!isAllowToPayAndTbbBookingWithZeroAmount && ($('#wayBillType').val() == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY 
																|| $('#wayBillType').val() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT)
				|| $('#wayBillType').val() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
				&& Number($("#chargeType").val()) == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY
				&& !validateInput(1, 'fixAmount', 'fixAmount', 'error',  'Please Enter Amount !'))
				return false;
			
			return true;
		},checkForNewSaidToContain : function(){
			if(ftlBookingScreenConfig.SaidToContainAutoSave ) {
				var obj = document.getElementById('saidToContain');
				if(obj.value != '') {
					if($('#consignmentGoodsId').val() <= 0) {
						if(confirm(addSaidToContainAlertMsg)) {
							var valObj = obj.value;
							
							if(valObj.indexOf("(") >= 0)
								valObj = valObj.substring(0,valObj.indexOf('('));
							
							$('#newSaidToConatainName').val(valObj);
							_this.openSaidToContainPopUp();
						} else {
							return false;
						}
					} else {
						$('#saidToContain').focus();
						$('#consignmentGoodsId').val('0');
						return false;
					}
				} else {
					return false;
				}
			}
			
		}, openSaidToContainPopUp : function(){
			switchHtmlTagClass('saidToContainOverlay', 'show', 'hide');
			var saidToContain = $("#saidToContain").val();
			
			$("#addSaidToContainModal").modal({
				backdrop: 'static',
				keyboard: false
			});
			
			setTimeout(() => {
				$('#newSaidToContain').focus();
				$('#newSaidToContain').val(saidToContain);
				$('#newSaidToContain').css("color", "#555");
				$('#newSaidToContain').css("border", "1px solid #ccc");
			}, 200);
			
		}, showEWaybillNumberFormType : function(formTypeId){
			
			$("#formNumber").attr("placeholder", "E-Way Bill Number");
			$('#formNumber').val('');
			changeDisplayProperty('formNumber', 'inline');
			
			changeDisplayProperty('eWayBillNumberDiv', 'inline');

		},hideEWaybillNumberFormType : function(formTypeId) {
			$('#formNumber').val('');
			
			if(formTypeId == FormTypeConstant.E_WAYBILL_ID)
				changeDisplayProperty('formNumber', 'none');
			
			if(ftlBookingScreenConfig.DisplayEWaybillNumberFieldOnEwaybillFormType)
				$('#ewayBillNumber').val('');
			
			removeError('formNumber');
			hideAllMessages();
		}, paymentTypeReset : function(){
			$('#paymentType').val('0');
			$('#paymentType').val(0);
			
			var paymentTypeSelectize 	= $('#paymentType').get(0).selectize;
			paymentTypeSelectize.setValue(''); 
			
		},setLorryHireDetails : function(response) {
			_this.paymentTypeReset();
			$( "#lhpvChargesDiv" ).empty();
			$('#paymentMode').removeClass('hide');
			
			if($('#LorryHireDetailsDiv') != null && $('#LorryHireDetailsDiv').is(':checked')) {
				if($('#lhpvType').exists() && Number($('#lhpvType').val() == 1) && !validateInputTextFeild(1, 'manualLHPVNumber', 'manualLHPVNumber', 'error', lhpvNumberErrMsg)) {
					$('#LorryHireDetailsDiv').attr('checked', false);
					return false;
				}
				
				if (!validateInputTextFeild(1, 'manualLHPVDate', 'manualLHPVDate', 'error', manualLHPVDateErrMsg)) {
					$('#LorryHireDetailsDiv').attr('checked', false);
					return false;
				}
				
				_this.getLHPVCharges(response);
				$("#LorryHireDetailsTable").fadeIn(1000);
			} else {
				_this.paymentTypeReset();
				$("#LorryHireDetailsTable").fadeOut(1000);
			}
		},setVehicleDetails : function() {
			if($('#vehicleDetailsDiv') != null && $('#vehicleDetailsDiv').is(':checked')) {
				$( "#lsDetails" ).show();
				_this.resetLSDetails();
				
				if( Number($('#lsType').val() == 1))
					changeDisplayProperty('manualLsNumberDiv', 'inline');
				else
					changeDisplayProperty('manualLsNumberDiv', 'none');
				
				if( Number($('#lhpvType').val() == 1))
					changeDisplayProperty('manualLhpvNumberDiv', 'inline');
				else
					changeDisplayProperty('manualLhpvNumberDiv', 'none');

				if(ftlBookingScreenConfig.setManualLsNoSameAsManualLrNo)
					$('#manualLSNumber').val($('#lrNumberManual').val());
				
				$("#lsDetails").fadeIn(1000);
			} else {
				$('#paymentMode').addClass('hide');
				$( "#lhpvChargesDiv" ).empty();
				$("#lhpvLabel").hide();
				$("#lsDetails").fadeOut(1000);
			}
		},setLHPVDetails : function() {
			if($('#LHPVDetailsDiv') != null && $('#LHPVDetailsDiv').is(':checked')) {
				_this.resetLHPVDetails();
				$("#lhpvLabel").show();
				
				if( Number($('#lhpvType').val() == 1))
					changeDisplayProperty('manualLhpvNumberDiv', 'inline');
				else
					changeDisplayProperty('manualLhpvNumberDiv', 'none');
				
				if(ftlBookingScreenConfig.lhpvRemark)
					$("#lhpvRemarkDiv").css('display','block');
				
				$("#LHPVDetailsPannel").fadeIn(1000);
			} else {
				_this.resetLHPVDetails();
				$('#LorryHireDetailsDiv').attr('checked', false);
				$('#paymentMode').addClass('hide');
				$( "#lhpvChargesDiv" ).empty();
				$("#lhpvLabel").hide();
				$("#LHPVDetailsPannel").fadeOut(1000);
			}
		},setInvoiceDetails : function(){
			if($('#createInvoiceDiv') != null && $('#createInvoiceDiv').is(':checked')) {
				$("#invoiceTab1").show();
				$( "#partyAdvanceLabelDiv" ).show();
				
				setBillInvoiceValue();
				_this.resetInvoiceDetails();
				
				if( Number($('#invoiceType').val() == 1))
					changeDisplayProperty('invoiceNumberDiv', 'inline');
				else {
					changeDisplayProperty('invoiceNumberDiv', 'none');
					$("#invoiceNo").val('')
				}
			} else {
				$( "#partyAdvanceLabelDiv" ).hide();
				$('#partyAdvanceDiv').attr('checked', false);
				$("#invoiceTab1").hide();
				$( "#invoiceTab2" ).hide();
				$( "#invoiceTab3" ).hide();
			}
		},setPartyAdvanceDetails : function() {
			if($('#partyAdvanceDiv') != null && $('#partyAdvanceDiv').is(':checked')) {
				$( "#invoiceTab2" ).show();
				$( "#invoiceTab3" ).show();
				setBillInvoiceValue();
				
				if( Number($('#mrType').val() == 1))
					changeDisplayProperty('mrNumberDiv', 'inline');
				else
					changeDisplayProperty('mrNumberDiv', 'none');
			} else {
				_this.resetPaymentAdvanceDetails();
				$( "#invoiceTab2" ).hide();
				$( "#invoiceTab3" ).hide();
			}
		},resetDestinationPointData : function() {
			$('#destBranchId').val(0);
			$('#destinationBranchId').val(0);
			$('#destinationStateId').val("0");
			$('#typeOfLocation').val("0");
		}, resetFreightUptoBranch : function() {
			if (ftlBookingScreenConfig.FrightuptoDestination) {
				$('#freightUptoBranch').attr('disabled','disabled');
				$('#freightUptoBranch').val('');
				$('#freightUptoBranchId').val(0);
			}
		}, resetConsignor : function() {
			$('#consignorName').val("");
			$('#consignorPhn').val("");
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
			if ($('#wayBillType').val() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT) {
				$('#billingPartyId').val(0);
				$('#billingPartyName').val("");
				$('#billingPartyCreditorId').val("0");
			}
		}, resetArticleWithTable : function() {
			noOfArticlesAdded	= 0;
			_this.resetArticleDetails();
			$('#totalQty').html("0");
			$("#myTBody").empty();
			$("#myTBody1").empty();
		}, validateOnMetricAndWeight : function() {
			if($("#chargeType").val() == ChargeTypeConstant.CHARGETYPE_ID_METRIC_TON 
						|| $("#chargeType").val() == ChargeTypeConstant.CHARGETYPE_ID_WEIGHT){
				if($('#actualWeight').val() <= 0){
					showMessage('error', " Please Enter Weight !");	
					changeError1('actualWeight','0','0');
					return false;
				}
			}
			
			return true;
		} ,setFreightAmount : function() {
			var totalArtAmount = 0;
			
			if(consigAddedtableRowsId.length > 0) {
				for(var i = 0; i < consigAddedtableRowsId.length; i++) {
					if($('#totalArtAmount' + consigAddedtableRowsId[i]).html() > 0)
						totalArtAmount += Number($('#totalArtAmount' + consigAddedtableRowsId[i]).html());
					
					if($("#chargeType").val() == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY)
						$('#charge'+BookingChargeConstant.FREIGHT).val(parseFloat(Number(totalArtAmount)));
				}
			}
			
			calcGrandtotal();
		}, resetLSDetails : function(){
			$('#manualLSNumber').val("");
			$('#vehicleNumberEle').val("");
			$('#vehicleNumberEle_primary_key').val(0);
			$('#ownerName').val("");
			$('#panNo').val("");
			$('#driverNameEle').val("");
			$('#driverMobileNumberEle').val("");
			$('#cleanerName').val("");
			$('#manualLHPVNumber').val("");
			$('#lhpvRemarkEle').val("");
			
		}, resetLHPVDetails : function(){
			$('#manualLHPVNumber').val("");
			$('#lhpvRemarkEle').val("");
		}, resetInvoiceDetails : function(){
			$('#invoiceNo').val("");
			
			_this.resetPaymentAdvanceDetails();
		}, resetPaymentAdvanceDetails : function(){
			$('#invoiceValue').val(0);
			$('#invoiceAdvance').val("");
			$('#invBalAmount').val(0);
			
			$('#invBalAmount').val(0);
			$('#invoiceRemark').val("");
		},checkDuplicateLR : function(response) {
			if(SequenceCounter != null) {
				if(response.isDuplicateLR)
					$('#lrNumberManual').val(Number(SequenceCounter.nextVal) + 1);
				else if(jsondata.showNextLrNumberInitialDigits && (SequenceCounter.nextVal).toString().length > 4)
					$('#lrNumberManual').val((SequenceCounter.nextVal).toString().substr(0, 4));
				else
					$('#lrNumberManual').val(SequenceCounter.nextVal);
			}
		}, checkIfLRNumberExist : function(response) {
			isDuplicateLR	= response.isDuplicateLR;
			
			if(isDuplicateLR) {
				setTimeout(function(){ $('#lrNumberManual').focus(); }, 10);
			}
			
			if(response.message != undefined) {
				hideLayer();
				var errorMessage 	= response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			}
			
		},checkIfManualLsNumberExist : function(response) {
			isFTLDuplicateLs	= response.isFTLDuplicateLs;
			
			if(isFTLDuplicateLs) {
				setTimeout(function(){ $('#manualLSNumber').focus(); }, 10);
			}
			
			if(response.message != undefined) {
				hideLayer();
				var errorMessage 	= response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			}
		},checkIfManualLHPVNumberExist : function(response) {
			isFTLDuplicateLHPV	= response.isFTLDuplicateLHPV;
			
			if(isFTLDuplicateLHPV) {
				setTimeout(function(){ $('#manualLHPVNumber').focus(); }, 10);
			}
			
			if(response.message != undefined) {
				hideLayer();
				var errorMessage 	= response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			}
		}, checkIfManualMRNumberExist : function(response) {
			isFTLDuplicateMR	= response.isDuplicateMR;
			
			if(isFTLDuplicateMR) {
				setTimeout(function(){ $('#mrNumber').focus(); }, 10);
			}
			
			if(response.message != undefined) {
				hideLayer();
				var errorMessage 	= response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			}
		},checkAndAddConsignment : function() {
			if($('#myTBody tr').length == 0 && $('#myTBody1 tr').length == 0)
				_this.addConsignmentTableStructure();
			
			if(_this.addConsignment() == false)
				return false;
		}, addConsignmentTableStructure : function() {
			var TableBody 	= document.getElementById("myTBody");
			var TableBody1	= document.getElementById("myTBody1");
			
			$("#myTable").removeClass('hide');
			$("#myTable1").removeClass('hide');

			var BaseRow1 	= document.createElement("tr"); //Create Row for tableEl
			var BaseRow 	= document.createElement("tr");	//Create Row for tableEl1
			
			BaseRow1.className	= '';
			BaseRow.className	= '';

			//create Columns for tableEl
			var Baseone 	= document.createElement("th");
			var Basetwo 	= document.createElement("th");
			var Basethree 	= document.createElement("th");
			var Basefour 	= document.createElement("th");
			var Basenine 	= document.createElement("th");
			var BaseEleven 	= document.createElement("th");

			//create Columns for tableEl1
			var Basefive	= document.createElement("th");
			var Basesix 	= document.createElement("th");
			var Baseseven 	= document.createElement("th");
			var Baseeight 	= document.createElement("th");
			var Baseten 	= document.createElement("th");
			var BaseTwelve 	= document.createElement("th");
			var BaseThirteen= document.createElement("th");
			var BaseFourteen= document.createElement("th");

			Baseone.innerHTML		= "";
			Baseone.width			= "";
			
			Basetwo.innerHTML		= "Qty";//Please do not change because it reflect to other method i.e. checkaddConsignmentTableStructure()
			Basetwo.width			= "50px";

			Basethree.innerHTML 	= "Art Type";
			Basethree.width			= "130px";

			Basefour.innerHTML		= "Contains";
			Basefour.width			= "120px";

			Basenine.innerHTML		= "Art Amt";
			Basenine.width			= "80px";

			BaseEleven.innerHTML	= "Total";
			BaseEleven.width		= "70px";

			BaseThirteen.innerHTML	= "<a class='button-normal'><i class='fa fa-arrow-up'></i></a>";
			BaseThirteen.width		= "50px";

			Basefive.innerHTML		= "";
			Basefive.width			= "";

			Basesix.innerHTML		= "Qty";//Please do not change because it reflect to other method i.e. checkaddConsignmentTableStructure()
			Basesix.width			= "50px";

			Baseseven.innerHTML		= "Art Type";
			Baseseven.width			= "130px";

			Baseeight.innerHTML		= "Contains";
			Baseeight.width			= "120px";

			Baseten.innerHTML		= "Art Amt";
			Baseten.width			= "80px";

			BaseTwelve.innerHTML	= "Total";
			BaseTwelve.width		= "70px";

			BaseFourteen.innerHTML	= "<a class='button-normal'><i class='fa fa-arrow-up'></i></a>";
			BaseFourteen.width		= "50px";

			Baseone.style.display	='none';
			Basefive.style.display	='none';

			//Add columns to row of tableEl
			BaseRow.appendChild(Baseone);
			BaseRow.appendChild(Basetwo);
			BaseRow.appendChild(Basethree);
			BaseRow.appendChild(Basefour);
			BaseRow.appendChild(Basenine);
			BaseRow.appendChild(BaseEleven);
			BaseRow.appendChild(BaseThirteen);

			//Add columns to row of tableEl1
			BaseRow1.appendChild(Basefive);
			BaseRow1.appendChild(Basesix);
			BaseRow1.appendChild(Baseseven);
			BaseRow1.appendChild(Baseeight);
			BaseRow1.appendChild(Baseten);
			BaseRow1.appendChild(BaseTwelve);
			BaseRow1.appendChild(BaseFourteen);

			TableBody.appendChild(BaseRow);//Add row to tableEl
			TableBody1.appendChild(BaseRow1);//Add row to tableEl1
		}, addConsignment : function() {
			var response;

			if(isAddLeftTable('myTable', 'myTable1')) {
				response = _this.addConsignmentRow('myTBody1');
				$("#myTable1").removeClass('hide');
			} else {
				response = _this.addConsignmentRow('myTBody');
				$("#myTable").removeClass('hide');
			}
			
			_this.enableDisableFixAmount();
			
			_this.setFreightAmount();
			
			_this.resetArticleDetails();
			
			$(".delete").bind("click", function() {
				_this.deleteConsignments(this);
				_this.enableDisableFixAmount();
				
				var rowCount = ($('#myTable tr').length - 1) + ($('#myTable1 tr').length - 1);
				
				if(rowCount <= 0) {
					_this.resetCharges();
					$('#totalAmt').val('0');
					$('#grandTotal').val('0');
				}
			});
			
			return response;
		}, enableDisableFixAmount : function() {

			var rowCount = $('#myTable tr').length - 1;

			if(rowCount > 0) {
				if($('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY)
					$('#fixAmount').removeAttr('disabled');
				else
					$('#fixAmount').attr('disabled','disabled');
			} else
				$('#fixAmount').removeAttr('disabled');
		}, addConsignmentRow : function(tableBodyId) {
			var zero 				= 0;
			var typeofPackingId		= $('#typeofPackingId').val();
			 
			if($('#typeofPacking option:selected').text())
				var typeofPackingVal	= $('#typeofPacking option:selected').text();
			else
				var typeofPackingVal	= $('#typeofPacking').val();
			
			var quantity				= $('#quantity').val();
			var consignmentGoodsId		= $('#consignmentGoodsId').val();
			var saidToContain			= $('#saidToContain').val();
			
			if($('#fixAmount').val() > 0)
				fixAmountId				= $('#fixAmount').val();
			
			if($('#fixAmount').exists())
				var qtyAmount			= $('#fixAmount').val();
			else
				var qtyAmount			= 0;

			var noOfArtToAdd			= GroupConfiguration.noOfConsignmentToAdd;

			if(noOfArticlesAdded >= noOfArtToAdd) {
				showMessage('info', noOfArtToAddInfoMsg(noOfArtToAdd));
				_this.resetArticleDetails();
				return false;
			}

			noOfArticlesAdded ++;
			idNum ++;
			consigAddedtableRowsId.push(idNum);

			var NewRow 	= createRowInTable('', '', '');
			var one 	= createColumnInRow(NewRow, '', 'datatd', '5%', '', 'display : none', '');
			var two 	= createColumnInRow(NewRow, "quantity" + idNum, 'datatd', '5%', '', '', '');
			var three 	= createColumnInRow(NewRow, '', 'datatd', '13%', '', '', '');
			var four 	= createColumnInRow(NewRow, "typeofPackingId" + idNum, 'datatd', '13%', '', 'display : none', '');
			var five 	= createColumnInRow(NewRow, '', 'datatd', '12%', '', '', '');
			var six 	= createColumnInRow(NewRow, "fixAmount" + idNum, 'datatd', '8%', '', '', '');
			var seven 	= createColumnInRow(NewRow, 'totalArtAmount' + idNum, 'datatd', '7%', '', '', '');
			var eight 	= createColumnInRow(NewRow, '', 'datatd', '5%', '', '', '');
			var nine 	= createColumnInRow(NewRow, "consignmentGoodsId" + idNum, 'datatd', '5%', '', 'display : none', '');
			
			var copyStr	= escape(typeofPackingId+'_'+zero+'_'+zero+'_'+zero+'_'+zero+'_'+zero+'_'+qtyAmount+'_'+quantity+'_'+saidToContain+'_'+consignmentGoodsId+"_"+typeofPackingVal).replace(/\+/g,'%2b');
			var str 	= copyStr;
			
			appendValueInTableCol(one, "<input name='checkbox2' id='checkbox2' type=checkbox value='"+str+"'>");
			
			appendValueInTableCol(three, typeofPackingVal);
			appendValueInTableCol(four, typeofPackingId);
			appendValueInTableCol(five, saidToContain);
			
			appendValueInTableCol(two, quantity);
			appendValueInTableCol(six, qtyAmount);
			appendValueInTableCol(seven, parseFloat(qtyAmount * quantity));
			
			if(qtyAmount > 0){
				if($("#chargeType").val() == ChargeTypeConstant.CHARGETYPE_ID_METRIC_TON){
					if(ftlBookingScreenConfig.allowToCalculateFreightInMetricTonOnWeight)
						$('#charge'+BookingChargeConstant.FREIGHT).val(parseFloat(Number($('#chargedWeight').val())) * fixAmountId);
					else
						$('#charge'+BookingChargeConstant.FREIGHT).val(parseFloat((Number($('#chargedWeight').val() * 1000)) * qtyAmount));
				}else if($("#chargeType").val() == ChargeTypeConstant.CHARGETYPE_ID_WEIGHT)
					$('#charge'+BookingChargeConstant.FREIGHT).val(parseFloat(Number($('#chargedWeight').val()) * qtyAmount));
				else if($("#chargeType").val() == ChargeTypeConstant.CHARGETYPE_ID_FIX)
					$('#charge'+BookingChargeConstant.FREIGHT).val(parseFloat(Number($('#fixAmount').val())));
			}
			
			appendValueInTableCol(eight, "<button type='button' id='delete_" + counterForDeleteConsignment + "' class='btn btn-danger delete'>Delete</button>");
			appendValueInTableCol(nine, consignmentGoodsId);
			
			appendRowInTable(tableBodyId, NewRow);

			counterForDeleteConsignment++;
			_this.calculateTotalQty();
			
			if(noOfArticlesAdded == 1)
				_this.getChargeWeightByPackingTypeAndParty(typeofPackingId);
		}, calculateTotalQty : function() {
			$('#totalQty').html(_this.getTotalAddedArticleTableQuantity());
		}, getTotalAddedArticleTableQuantity : function() {
			var tableEl 		= document.getElementById("myTable");
			var tableEl1 		= document.getElementById("myTable1");
			var qtyTot 			= 0;
			var qtyTot1 		= 0;
			
			if($('#typeofPackingId').val() > 0)
				typeofPackingId		= $('#typeofPackingId').val();
			else if($('#typeofPacking').val() > 0)
				typeofPackingId		= $('#typeofPacking').val();

			if(tableEl.rows.length > 1) {
				for(var i = 1; i < tableEl.rows.length; i++) {
					qtyTot += parseInt(tableEl.rows[i].cells[1].innerHTML);
				}
			}

			if(tableEl1.rows.length > 1) {
				for(var i = 1; i < tableEl1.rows.length; i++) {
					qtyTot1 += parseInt(tableEl1.rows[i].cells[1].innerHTML);
				}
			}

			return parseInt(qtyTot) + parseInt(qtyTot1);
		}, deleteConsignments : function(obj) {
			var tableEl 	= document.getElementById("myTable");
			var tableEl1 	= document.getElementById("myTable1");

			_this.deleteConsignmentTableRow(obj, tableEl);
			_this.deleteConsignmentTableRow(obj, tableEl1);

			_this.calculateTotalQty();

			next = "quantity";
			setTimeout(function(){ $('#quantity').focus(); }, 10);
			
			$('#chargedWeight').val(ftlBookingScreenConfig.MinChargedWeight);
			$('#actualWeight').val(ftlBookingScreenConfig.MinActualWeight);
			
			_this.enableDisableFixAmount();
			_this.setFreightAmount();

			return true;
		}, deleteConsignmentTableRow : function(obj, tableElement) {
			var articleTableId	= '';

			for(var row = tableElement.rows.length-1; row > 0; row--) {
				articleTableId	= tableElement.rows[row].cells[7].getElementsByTagName("button")[0].id;
				if(articleTableId == obj.id) {
					var el  = tableElement.rows[row];
					el.parentNode.removeChild(el);
					noOfArticlesAdded --;
					
					if($("#chargeType").val() != ChargeTypeConstant.CHARGETYPE_ID_QUANTITY)
						consigAddedtableRowsId.pop(obj.id);

					if(noOfArticlesAdded == 0) {
						$("#myTable").addClass('hide');
						$("#myTable1").addClass('hide');

						idNum 	= 0;
						consigAddedtableRowsId = [];
					}
				}
			}
		}, calculateFreightAmount : function() {
			if(consigAddedtableRowsId.length > 0) {
				for(var i = 0; i < consigAddedtableRowsId.length; i++) {
					if($('#quantity' + consigAddedtableRowsId[i]).html() > 0 && $('#weightCol' + consigAddedtableRowsId[i]).html() > 0)
						articleWeight += parseInt($('#quantity' + consigAddedtableRowsId[i]).html()) * parseInt($('#weightCol' + consigAddedtableRowsId[i]).html());
				}
			}
		},calculateChargedWeight : function(id) {
			var actualWeight  		= parseFloat($('#' + id).val());
			var minChrdWght 		= ftlBookingScreenConfig.MinChargedWeight;
			
			if(ftlBookingScreenConfig.roundOffChargeWeight)
				$('#chargedWeight').val(Math.ceil(actualWeight / 5) * 5);
			else
				$('#chargedWeight').val(actualWeight);
			
			if(Number(actualWeight) == 0)
				$('#actualWeight').val(actualWeight);
			else if(Number(actualWeight) < Number(minChrdWght))
				$('#chargedWeight').val(minChrdWght);
			
			return true;
		}, editChargedWeight : function(obj) {
			var actualWeight  		= parseFloat($('#actualWeight').val());
			var chargedWeight 		= parseFloat(obj.value);
			
			if(chargedWeight < actualWeight) {
				showMessage('info', chargedWeightLessThanInfoMsg(actualWeight));
				_this.calculateChargedWeight('actualWeight');
				return false;
			}
		}, getChargeWeightToIncrease : function(customerId) {
			var jsonObject	= new Object();
			
			jsonObject.branchId					= executive.branchId;
			jsonObject.corporateAccountId		= customerId;
			
			$.ajax({
				type		: "POST",
				url			: WEB_SERVICE_URL+'/wayBillWS/getChargeWeightToIncrease.do',
				data		: jsonObject,
				dataType	: 'json',
				success: function(data) {
					chargeWeightConfig		= null;
					
					if(data.chargeWeightConfig != undefined)
						chargeWeightConfig		= data.chargeWeightConfig;
					
					if(chargeWeightConfig == null)
						_this.getChargeWeightToIncreaseByBranch();
					
					hideLayer();
				}
			});
		}, getChargeWeightToIncreaseByBranch : function() {
			var jsonObject	= new Object();
			
			jsonObject.branchId					= executive.branchId;
			
			$.ajax({
				type		: "POST",
				url			: WEB_SERVICE_URL+'/wayBillWS/getChargeWeightToIncrease.do',
				data		: jsonObject,
				dataType	: 'json',
				success: function(data) {
					chargeWeightConfig		= null;
					
					if(data.chargeWeightConfig != undefined)
						chargeWeightConfig		= data.chargeWeightConfig;
					
					hideLayer();
				}
			});
		}, getChargeWeightByPackingTypeAndParty : function(packingTypeId) {
			var corporateAccountId	= partyMasterId;
			
			increaseChargeWeight	= 0;	// Globally Defined
			
			/*
			 * chargeWeightConfig coming from this method
			 * getChargeWeightToIncrease(customerId)
			 */
			if(chargeWeightConfig != null) {
				for(var i = 0; i < chargeWeightConfig.length; i++) {
					var chargeWeightConfiguration	= chargeWeightConfig[i];
					
					if(Number(chargeWeightConfiguration.corporateAccountId) 	== Number(corporateAccountId) || Number(chargeWeightConfiguration.corporateAccountId) 	== Number(0)
							&& Number(chargeWeightConfiguration.packingTypeId) 	== Number(packingTypeId))
						increaseChargeWeight	= chargeWeightConfiguration.chargeWeight;
				}
			}
		}, getChargeWeightToAppend : function() {
			var actualWeight	= $('#actualWeight').val();
			
			/*
			 * increaseChargeWeight coming from this method
			 * getChargeWeightByPackingTypeAndParty(packingTypeId)
			 */
			if(actualWeight > 0 && increaseChargeWeight > 0) {
				var increasedValue = Number(actualWeight) + Number(increaseChargeWeight);
				_this.roundOffIncreasedChargedWeightValue(increasedValue);	
			}
		}, roundOffIncreasedChargedWeightValue : function(increasedValue) {
			var rndOffChrgdWghtByTensForBrnchs = ftlBookingScreenConfig.roundOffChargedWeightByTensForBranchs;
			var branches	= new Array();
			branches 		= rndOffChrgdWghtByTensForBrnchs.split(",");
			
			if(ftlBookingScreenConfig.roundOffIncreasedChargedWeightValue) {
				if(ftlBookingScreenConfig.roundOffChargedWeightByTens) {
					for(var i = 0 ; i < branches.length; i++) {
						if(branches[i] == branchId)
							$('#chargedWeight').val(Math.round(increasedValue / 10) * 10);
						else
							$('#chargedWeight').val(Math.ceil(increasedValue / 5) * 5);
					}
				} 
			} else {
				$('#chargedWeight').val(increasedValue);
			}
		},callFtlShortcut : function() {
			
			shortcut.add('Alt+a',function(){
				if(_this.validateAddArticle()) {
					_this.checkAndAddConsignment();
					_this.setFocusAfterAdd(this);
				}
		    });
		
		},getStates : function() {
			
			$('#details').removeClass('hide');
			
			var jsonObject = new Object();
			
			setTimeout(() => {
				$.ajax({
					type		: "POST",
					url			: WEB_SERVICE_URL+'/stateWS/getStateList.do',
					data		: jsonObject,
					dataType	: 'json',
					success: function(data) {
						stateList	= data.stateList;
						hideLayer();
					}
				});
			}, 400);
			
		},openCreateBranchModal :function(filter) {
			
			$('#details').addClass('hide');
			
			var contentTable2	= 		'<div><form method="post" name="operationalBranchForm" action="/ivcargo/Masters.do"><input type="hidden" name="pageId" value="209"/><input type="hidden" name="eventId" value="1"/><input type="hidden" name="filter" value="0"/><input type="hidden" name="stateId" id="stateId" value="0"><input type="hidden" name="cityId" id="cityId" value="0"><input type="hidden" name="handlingBranchId" id="handlingBranchId" value="0"><input type="hidden" name="branchType" id="branchType" value="3"><input type="hidden" name="branchName" id="branchName" value=""><input type="hidden" name="branchDisplayName" id="branchDisplayName" value=""><input type="hidden" name="isFtlBooking" id="isFtlBooking" value="true">'
										+ 	'<table style="width:630px;" class="" id="operationalBranchTable"><thead class="thead-inverse"><tr><th><span style="padding-left: 125px;">State</span></th><th><span style="padding-left: 190px;">City</span></th></tr>'
										+	'<tr><td  style="line-height: 2; font-size: larger; padding-left: 50px; width: 200px;"><select style="width: 200px" id="stateEle" class="form-control"></select></td><td style="line-height: 2; font-size: larger; padding-left: 120px;"><select style="width: 200px" id="cityEle" class="form-control"></select></td></tr>'
										+	'<tr><th><span style="padding-left: 100px;">Branch Name</span></th><th><span style="padding-left: 160px;">Handling Branch</span></th></tr>'
										+	'<tr><td style="padding-left: 50px; width: 200px;"><input style="width: 200px" id="branchNameEle" class="form-control" onkeypress="return noSpclChars(event);"></input></td><td style="padding-left:120px;"><input style="width: 200px;" id="handlingBranchEle" class="form-control"></input></td></tr></thead></table></form></div>';
			
			setTimeout(() => {
				
				$("#handlingBranchEle").autocomplete({
				    source: function (request, response) {
				        $.getJSON(WEB_SERVICE_URL+'/autoCompleteWS/getBranchWiseDestinationByNameWithOutDeliveryPlace.do?term=' + request.term + '&isOwnBranchRequired=true&branchType=3', function (data) {
				        	if(typeof data.message !== 'undefined') {
				        		showMessage('error', data.message.description);
				        		return false;
				        	} else {
				        		response($.map(data.result, function (item) {
					                return {
					                    label				: item.branchName,
					                    value				: item.branchName,
					                    toBranchId			: item.branchId
					                };
					            }));
				        	}
				        });
				    }, select: function (e, u) {
				    	if(u.item.toBranchId > 0) {
				    		$('#handlingBranchId').val(u.item.toBranchId);
				    	}
				    },
				    minLength	: 2,
				    delay		: 20,
				    autoFocus	: true,
				});
			}, 200);
			
			var btModal = new Backbone.BootstrapModal({
				content		: 	contentTable2,
				modalWidth 	: 	50,
				title		:	'<center> Create Operational Branch</center>',
				okText		:	'Create Branch',
				showFooter 	: 	true,
				okCloses	:	false
			}).open();
			
			setTimeout(() => {
				var sourceBranch = $("#sourceBranch").val().toUpperCase();
				var destination = $("#destination").val().toUpperCase();
				if(filter == 1)
					$('#branchNameEle').val(sourceBranch);
				else
					$('#branchNameEle').val(destination);
			}, 500);
			
			setTimeout(() => {
				$('#stateEle').focus();
			}, 500);
			
			setTimeout(() => {
				$('#stateEle').keyup(function(){
					if(Number($('#stateEle').val()) > 0) {
						next ='cityEle';
					} else {
						showMessage('error', 'Please Select State');
						return false;
					}
				});
			}, 500);
		 	
			setTimeout(() => {
				$('#cityEle').keyup(function(){
					if(Number($('#cityEle').val()) > 0) {
						next ='branchNameEle';
					} else {
						showMessage('error', 'Please Select City');
						return false;
					}
				});
			}, 500);
			
			setTimeout(() => {
				$('#branchNameEle').focus(function(){
					next ='handlingBranchEle';
				});
			}, 500);
			
			setTimeout(() => {
				$('#handlingBranchEle').focus(function(){
					next ='okbtn';
			});
		}, 500);
		
			btModal.on('ok', function() {
				if(!validateInput())
					return false;
				
				$.get("/ivcargo/jsp/masters/MasterAjaxInterface.jsp",{ filter:32,branchName:$('#branchNameEle').val(),cityId:$.trim($("#cityEle").val())},function(data){
					 if($.trim(data)=="true"){ //if Branch found avaiable
					   showMessage('info','This Branch already exists!')
					   changeTextFieldColor('branchNameEle', '', '', 'red');
					   
					   if(filter == 1)
						   doneTheStuffConsignor = false;
					   else
						   doneTheStuffConsignee = false;
					   
					   return false;
					 } else {
						var branchName			= $('#branchNameEle').val();
						var branchDisplayName	= $("#cityEle option:selected").text()+ ' - ' + branchName.toUpperCase();
						
						$('#branchName').val(branchName);
						$('#branchDisplayName').val(branchDisplayName);
							
						if(filter == 1)
						   doneTheStuffConsignor = false;
					    else
						   doneTheStuffConsignee = false;
						
						if((filter == 1 && !doneTheStuffConsignor) ||(filter == 2 && !doneTheStuffConsignee)) {
							var btModalConfirm = new Backbone.BootstrapModal({
								content		: 	"Are you sure you want Create Branch ?",
								modalWidth 	: 	30,
								title		:	'Create Branch',
								okText		:	'YES',
								showFooter 	: 	true,
								okCloses	:	true
							}).open();
							
							btModalConfirm.on('ok', function() {
								var jsonObject		= new Object();
								
								_this.setJsonDataforBranchAutoSave(jsonObject);
								 jsonObject.isFTLBookingScreen		= true;
								var jsonStr = JSON.stringify(jsonObject);
								showLayer();

								if(filter == 1) {
									doneTheStuffConsignor = true;
									$("#sourceBranch").val('');
								} else {
									doneTheStuffConsignee = true;
									$("#destination").val('');
								}
								
								$.getJSON("BranchMasterAction.do?pageId=209&eventId=1",{json:jsonStr}, function(data) {
											if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
												showMessage('error', iconForErrMsg + ' ' + data.errorDescription);
												hideLayer();
											} else {
												if(filter == 1)
													document.getElementById('srcBranchId').value = data.newBranchId;
												else
													document.getElementById('destBranchId').value = data.newBranchId;
												
												refreshCache(BRANCH_MASTER, accountGroupId);
												btModal.close();
												hideLayer();
											}
									});
								
							});
							
							btModalConfirm.on('cancel', function() {
								if(filter == 1)
									doneTheStuffConsignor = false;
								else
									doneTheStuffConsignee = false;
								hideLayer();
							});
						}
						
						if(filter == 1)
							doneTheStuffConsignor = true;
						else
							doneTheStuffConsignee = true;
					 }
				});
			});
			
			btModal.on('cancel', function() {
				resetValues();
				if(filter == 1)
					doneTheStuffConsignor = false;
				els
					doneTheStuffConsignee = false;
					
				$('#details').removeClass('hide');
			});
			
			setTimeout(() => {
				operationOnSelectTag('cityEle', 'removeAll', '', ''); //function calling from genericfunction.js
				operationOnSelectTag('cityEle', 'addNew', '---- Select  City ----', 0); //function calling from genericfunction.js

				operationOnSelectTag('stateEle', 'removeAll', '', ''); //function calling from genericfunction.js
				operationOnSelectTag('stateEle', 'addNew', '---- Select  State ----', 0); //function calling from genericfunction.js
				
				if(stateList != null && typeof stateList !== 'undefined') {
					for(var i = 0; i < stateList.length; i++) {
						operationOnSelectTag('stateEle', 'addNew', stateList[i].stateName, stateList[i].stateId);
					} 
				}
				
				$('#stateEle').change(function(){
					$('#stateId').val(Number($('#stateEle').val()));
					getCitiesByStateId();
				});
			}, 200);
		},resetArticleDetails : function() {
			$('#quantity').val("0");
			$('#typeofPacking').val('');
			$('#consignmentStorageId').val("0");
			$('#consignmentAmount').val("0");
			$('#saidToContain').val("");
			$('#fixAmount').val("0");
			$('#typeofPackingId').val("0");
			$('#consignmentGoodsId').val(0);

			_this.setDefaultSaidToContain();
		}, setDefaultSaidToContain : function() {
			if(consignmentGoods != undefined) {
				$('#saidToContain').val(consignmentGoods.name);
				$("#consignmentGoodsId").val(consignmentGoods.consignmentGoodsId);
			}
		}, setFocusOnSouceAfterDate : function(ele){
			if(ele.id == 'manualLRDate')
				next = 'lrBooking';
		},setFocusOnSouceAfterLRBookingType : function(ele){
			if(ele.id == 'lrBooking'){
				if(ele.value == 1)
					next = 'lrNumberManual';
				else
					next = 'sourceBranch';
			}
		},setFocusOnLhpvAfterDate : function(ele){
			if(ele.id == 'manualLHPVDate')
				next = 'lhpvType';
		},setFocusForLhpvChargesAfterLhpvNumber :function(ele){
			if(ele.id == 'manualLHPVNumber')
				next = 'LorryHireDetailsDiv';
		},setFocusForLhpvCharges :function(ele){
			if(ele.id == 'lhpvCharge92')
				next = 'controlinput_paymentType';
			else if(ele.id == 'lhpvCharge7')
				next = 'controlinput_paymentType';
		},setFocusForLhpvChargesPayment :function(ele){
			if(ele.id == 'paymentType_wrapper')
				next = 'createInvoiceDiv';
		},setFocusAfterAdd : function(ele){
 			if(ele.id == 'add')
				next = 'STPaidBy';
		},setFocusOnQuantityAfterAddArticle : function(ele) {
			var quantity	= $('#quantity').val();

			if(ele.id == 'add') {
				next = "quantity"; 
			} else if(ele.id == 'quantity') {
				if(quantity > 0) {
					next = "typeofPacking"; 
				} else {
					if(noOfArticlesAdded > 0) {
						if (ftlBookingScreenConfig.ActualWght)
							next = "actualWeight";
						else if (ftlBookingScreenConfig.PrivateMark)
							next = "privateMark";
						else
							next = "save";
					} else {
						next = "typeofPacking";

						if(!validateInputTextFeild(1, 'quantity', 'quantity', 'error', quantityErrMsg))
							return false;

						return true;
					}
				}
			}
		},focusNextPrevious : function(ele){
			if($('#singleFormTypes').val() == FormTypeConstant.E_WAYBILL_ID)
				next = 'addMutipleEwayBill';
			else if($('#lrType').val() == WayBillTypeConstant.WAYBILL_TYPE_PAID)
				setChargesFocus();
			else
				setChargesFocus();
			
			$('#viewEwayBill').keyup(function(){
				setChargesFocus();
			})
		},focusAftermanualLR : function(ele){
			if(ele.id == 'lrNumberManual')
				next = 'sourceBranch';
		}, basicFormValidation : function() {
			if(!lrDateValidation())
				return false;
			
			if (!validateInputTextFeild(1, 'sourceBranchId', 'sourceBranch', 'error', sourceBranchErrMsg))
				return false;
			
			if(!validateInputTextFeild(1, 'destinationBranchId', 'destination', 'info', properDestinationErrMsg))
				return false;
			
			if (!validateInputTextFeild(1, 'manualLRDate', 'manualLRDate', 'error', dateErrMsg))
				return false;
					
			if($('#lrBooking').exists() && Number($('#lrBooking').val() == 1) && !validateInputTextFeild(1, 'lrNumberManual', 'lrNumberManual', 'error', lrNumberErrMsg)) {
				setTimeout(function(){ $('#lrNumberManual').focus(); }, 0);
				return false;
			}

			if(!validateInputTextFeild(1, 'consignorName', 'consignorName', 'error', consinorNameErrMsg))
				return false;
				
			if(!validateInputTextFeild(1, 'consigneeName', 'consigneeName', 'error', consineeNameErrMsg))
				return false;
				
			if($('#lrType').val() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT && !validateInputTextFeild(1, 'billingPartyId', 'billingPartyName', 'error', validBillingPartyErrMsg)) {
				setTimeout(function(){ $('#billingPartyName').focus(); }, 0);
				return false;
			}
			
			if(ftlBookingScreenConfig.donNotValidateWeightOnArticleAndFix){
				if (($("#chargeType").val() == ChargeTypeConstant.CHARGETYPE_ID_WEIGHT || $("#chargeType").val() == ChargeTypeConstant.CHARGETYPE_ID_METRIC_TON)
					&& !validateInputTextFeild(1, 'actualWeight', 'actualWeight', 'error', actWeightErrMsg)) {
					return false;
				}
			} else if (!validateInputTextFeild(1, 'actualWeight', 'actualWeight', 'error', actWeightErrMsg))
				return false;
			
			if (ftlBookingScreenConfig.PrivateMarkValidate && !validateInputTextFeild(1, 'privateMark', 'privateMark', 'error', privateMarkErrMsg))
				return false;

			if(!_this.validateConsignmentTables())
				return false;
			
			if($('#invoiceType').exists() && Number($('#invoiceType').val()) == 1 && $('#createInvoiceDiv').is(':checked')
				&& !validateInputTextFeild(1, 'invoiceNo', 'invoiceNo', 'error', invoiceNumberErrMsg))
					return false;

			var rowCount = $('#myTable tr').length - 1;

			if(rowCount <= 0 && $("#chargeType").val() == ChargeTypeConstant.CHARGETYPE_ID_FIX
				&& $('#lrType').val() != WayBillTypeConstant.WAYBILL_TYPE_FOC && !isAllowToPayAndTbbBookingWithZeroAmount
					&& !validateInputTextFeild(1, 'fixAmount', 'fixAmount', 'error', fixAmountRequiredErrMsg))
						return false;
	
			if(!_this.validateDiscountType())
				return false;
			
			if($('#lrType').val() != WayBillTypeConstant.WAYBILL_TYPE_FOC && !isAllowToPayAndTbbBookingWithZeroAmount
					&& !_this.validateGrandTotal())
				return false;
			
			if($("#grandTotal").val() > 0 && $('#paymentTypePaidLr').exists() && $('#lrType').val() == WayBillTypeConstant.WAYBILL_TYPE_PAID
				&& !validateInputTextFeild(1, 'paymentTypePaidLr', 'paymentTypePaidLr', 'error', paymentTypeErrMsg))
					return false;
			
			if($('#vehicleDetailsDiv').exists() && $('#vehicleDetailsDiv').is(':checked')) {
				var manualLsNumber 	= $("#manualLSNumber").val();
				var manualLsDate 	= $("#manualLSDate").val();
			
				if($('#lsType').exists() && Number($('#lsType').val()) == 1) {
					if(!validateInputTextFeild(1, 'manualLSNumber', 'manualLSNumber', 'error', lsNumberErrMsg))
						return false;
				}
				
				if(!validateInputTextFeild(1, 'vehicleNumberEle', 'vehicleNumberEle', 'error', vehicleNumberErrMsg1))
					return false;
	
				if(manualLsNumber > 0 && manualLsDate != null && !_this.lsDateValidation())
					return false;
			}
			
			if($('#LHPVDetailsDiv').exists() && $('#LHPVDetailsDiv').is(':checked')) {
				if($("#manualLHPVDate").val() != null && !_this.lHPVDateValidation())
					return false;
					
				if($('#lhpvType').exists() && Number($('#lhpvType').val()) == 1) {
					if(!validateInputTextFeild(1, 'manualLHPVNumber', 'manualLHPVNumber', 'error', lhpvNumberErrMsg))
						return false;
				}
			}
			
			if($('#createInvoiceDiv') != null && $('#createInvoiceDiv').is(':checked')) {
				if(!validateInputTextFeild(1, 'invoiceDate', 'invoiceDate', 'error',  invoiceDateErrMsg))
					return false;

				if($("#invoiceDate").val() != null && !_this.invoiceDateValidation())
					return false;
			}
			
			if($('#partyAdvanceDiv') != null && $('#partyAdvanceDiv').is(':checked')) {
				if(!validateInputTextFeild(1, 'partyAdvDate', 'partyAdvDate', 'error',  PartyAdvDateErrMsg))
					return false;

				if($("#partyAdvDate").val() != null && !_this.partyAdvDateValidation())
					return false;

				if($("#invoiceAdvance").val() > 0 && !validateInputTextFeild(1, 'paymentTypeBill', 'paymentTypeBill', 'error', paymentTypeErrMsg))
					return false;
			}
			
			if(Number($("#lhpvCharge" + ADVANCE_AMOUNT).val()) > 0
				&& !validateInputTextFeild(1, 'paymentType', 'paymentType', 'error', paymentTypeErrMsg))
					return false;
			
			if(!_this.validateForPaymentType())
				return false;
			
			if($('#partyAdvanceDiv').exists() && $('#partyAdvanceDiv').is(':checked') && !_this.calculateBillBalance())
				return false;
			
			return true;
		}, lsDateValidation : function() {
			return _this.dateFeildValidation(1);
		}, lHPVDateValidation : function() {
			return _this.dateFeildValidation(2);
		}, invoiceDateValidation : function() {
			if(!InvoiceDate)
				return true;
			
			return _this.dateFeildValidation(3);
		}, invoiceNoDateValidation : function() {
			return _this.dateFeildValidation(4);
		}, partyAdvDateValidation : function() {
			return _this.dateFeildValidation(5);
		}, dateFeildValidation : function(filter) {
			var currentDate  			= new Date(curSystemDate);
			var manualLSDate 			= document.getElementById('manualLSDate').value;
			var manualLRDate 			= document.getElementById('manualLRDate').value;
			var manualLHPVDate 			= document.getElementById('manualLHPVDate').value;
			var invoiceDate 			= document.getElementById('invoiceDate').value;
			var invoiceNoDate 			= document.getElementById('invoiceNoDate').value;
			var partyAdvDate 			= document.getElementById('partyAdvDate').value;
			var manualLRDateParts 		= new String(manualLRDate).split("-");
			var manualLSDateParts 		= new String(manualLSDate).split("-");
			var manualLHPVDateParts 	= new String(manualLHPVDate).split("-");
			var invoiceDateParts 		= new String(invoiceDate).split("-");
			var invoiceNoDateParts 		= new String(invoiceNoDate).split("-");
			var partyAdvDateParts 		= new String(partyAdvDate).split("-");
	
			var manLRFinalDate = manualLRDateParts[2] + '-' + manualLRDateParts[1] + '-' + manualLRDateParts[0];
			var manualLRsDate = new Date(manLRFinalDate);
			
			var manLSFinalDate = manualLSDateParts[2] + '-' + manualLSDateParts[1] + '-' + manualLSDateParts[0];
			var manualLSsDate = new Date(manLSFinalDate);
			
			var manLHPVFinalDate = manualLHPVDateParts[2] + '-' + manualLHPVDateParts[1] + '-' + manualLHPVDateParts[0];
			var manualLHPVsDate = new Date(manLHPVFinalDate);
		    
			var manInvoiceFinalDate = invoiceDateParts[2] + '-' + invoiceDateParts[1] + '-' + invoiceDateParts[0];
			var manualInvoicesDate = new Date(manInvoiceFinalDate);
			
			var invoiceNoFinalDate = invoiceNoDateParts[2] + '-' + invoiceNoDateParts[1] + '-' + invoiceNoDateParts[0];
			var InvoicesNoDate = new Date(invoiceNoFinalDate);
			
			var manPartyAdvFinalDate = partyAdvDateParts[2] + '-' + partyAdvDateParts[1] + '-' + partyAdvDateParts[0];
			var manualPartyAdvsDate = new Date(manPartyAdvFinalDate);
	
			if(filter == 1) {
				if (manualLSsDate.getTime() < manualLRsDate.getTime()) {
					showMessage('error', LSDateErlThanLRInfoMsg);
					changeError1('manualLSDate','0','0');
					return false;
				} else if(manualLSsDate.getTime() > currentDate.getTime()) {
					showMessage('error', futureDateNotAllowdErrMsg);
					changeError1('manualLSDate','0','0');
					return false;
				}
			} 
	
			if(filter == 2 && manualLHPVDate != null) {
				if (manualLHPVsDate.getTime() < manualLSsDate.getTime()) {
					showMessage('error', LHPVDateErlThanLSInfoMsg);
					changeError1('manualLHPVDate','0','0');
					return false;
				} else if(manualLHPVsDate.getTime() > currentDate.getTime()) {
					showMessage('error', futureDateNotAllowdErrMsg);
					changeError1('manualLHPVDate','0','0');
					return false;
				}
			} 
	
			if(filter == 3 && invoiceDate != null) {
				if (manualInvoicesDate.getTime() < manualLRsDate.getTime()) {
					showMessage('error', InvoiceDateErlThanLSInfoMsg);
					changeError1('invoiceDate','0','0');
					return false;
				} else if(manualInvoicesDate.getTime() > currentDate.getTime()) {
					showMessage('error', futureDateNotAllowdErrMsg);
					changeError1('invoiceDate','0','0');
					return false;
				}
			}
	
			/*
			if(filter == 4 && invoiceNoDate != null) {
				if (InvoicesNoDate.getTime() < manualLRsDate.getTime()) {
					showMessage('error', InvoiceDateErlThanLSInfoMsg);
					changeError1('invoiceNoDate','0','0');
					return false;
				} else if(InvoicesNoDate.getTime() > currentDate.getTime()) {
					showMessage('error', futureDateNotAllowdErrMsg);
					changeError1('invoiceNoDate','0','0');
					return false;
				}
			}
			*/
			if(filter == 5 && partyAdvDate != null) {
				if (manualPartyAdvsDate.getTime() < manualInvoicesDate.getTime()) {
					showMessage('error', PartyAdvDateErlThanLSInfoMsg);
					changeError1('partyAdvDate','0','0');
					return false;
				} else if(manualPartyAdvsDate.getTime() > currentDate.getTime()) {
					showMessage('error', futureDateNotAllowdErrMsg);
					changeError1('partyAdvDate','0','0');
					return false;
				}
			}
		
			return true;
		}, checkForNewVehicle : function() {
			var ele = $(this).attr('id');
			
			setTimeout(function(){
				var vehicleValue 		= $('#'+ele+'_primary_key').val();
				var vehicleValueString	= $("#vehicleNumberEle").val();
				newVehicle 				= $("#vehicleNumberEle").val();
				
				if (vehicleValue == "" && vehicleValueString.length > 0) {
					var btModalConfirm = new Backbone.BootstrapModal({
						content		: 	"Vehicle Not Present In Record. Do You Want To Create New?",
						modalWidth 	: 	30,
						title		:	'New Vehicle',
						okText		:	'YES',
						showFooter 	: 	true,
						okCloses	:	true
					}).open();
					
					btModalConfirm.on('ok', function() {
						var jsonObjectData	= new Object();
						myNod = nod();
						jsonObjectData.node			= myNod;
						jsonObjectData.newVehicle 	= newVehicle;
						jsonObjectData.moduleId 	= FTL_BOOKING;
						
						btVehicleModalConfirm = new Backbone.BootstrapModal({
							modalId		: 	'newVehicle',
							content		: 	new CreateNewVehicle(jsonObjectData),
							modalWidth 	: 	80,
							title		:	'New Vehicle',
							okText		:	'SAVE',
							showFooter 	: 	true,
							okCloses	: 	false,
							focusOk		:	false
						}).open();
							setTimeout(() => {
							$('#vehicleRegisteredOwnerEle').keyup(function(){
								next ='okbtn';
							});
						}, 500);
						
						btVehicleModalConfirm.on('ok', function() {
							myNod.performCheck();
							if(myNod.areAll('valid')){
								var jsonDataObject	= new Object();
								jsonDataObject.moduleId		= FTL_BOOKING;
								var $inputs = $('#newVehicle :input');
								//this will iterate all elements and will set the name as key and value of Element as value in jsonObject
								$inputs.each(function (index){if($(this).val() != ""){jsonDataObject[$(this).attr('name')] = $.trim($(this).val());}});
								getJSON(jsonDataObject, WEB_SERVICE_URL+'/vehicleWS/saveVehicle.do', _this.onSaveVehicle, EXECUTE_WITH_ERROR); //submit JSON
							}
						});	
					});
					$("#vehicleNumberEle").val("");
				}
			},200)
		},onSaveVehicle : function(response) {
			
			btVehicleModalConfirm.close();
			
			$('#vehicleNumberEle').val(response.vehicleNumber);

			var autocompleteSourceAndDest = $('#vehicleNumberEle').getInstance();

			$( autocompleteSourceAndDest ).each(function() {
			  
			  this.elem.combo_input.context.value = response.vehicleNumber;
			  document.getElementById(this.elem.combo_input.context.id+'_primary_key').value = response.vehicleNumberMasterId;
			  this._hideResults(this);
			  var _this = this;
			  $('#vehicleNumberEle').focus();
			  setTimeout(function(){_this._hideResults(_this);
			  	  _this.elem.combo_input.context.value = response.vehicleNumber; 
			  	  document.getElementById(_this.elem.combo_input.context.id+'_primary_key').value = response.vehicleNumberMasterId;
				 $('#driverLicenceNumberEle').focus();         
			  },500);
			});
			setTimeout(function(){
				_this.getVehicleDataOnVehicleSelect();
			},1000);
		}, getVehicleDataOnVehicleSelect : function() {
			var jsonObject = new Object();
			
			if($("#" + $(this).attr("id") + "_primary_key").val() == undefined)
				jsonObject.vehicleNumberMasterId = $("#vehicleNumberEle_primary_key").val();
			else
				jsonObject.vehicleNumberMasterId = $("#" + $(this).attr("id") + "_primary_key").val();
			
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/dispatchWs/getVehicleNumberDetailsForDispatch.do', _this.setVehicleNumberData, EXECUTE_WITH_ERROR);
		},setVehicleNumberData  : function(response){
			var vehicleNumberMaster			= response.vehicleNumberMaster;
		
			if(typeof vehicleNumberMaster !== 'undefined') {
				if(vehicleNumberMaster.vehicleOwner == OWN_VEHICLE_ID)
					$("#ownerName").val(vehicleNumberMaster.registeredOwner);
				else
					$("#ownerName").val(vehicleNumberMaster.vehicleAgentName);
				
				if(vehicleNumberMaster.panNumber != null)
					$("#panNo").val(vehicleNumberMaster.panNumber);
			}	
		},validateConsignmentTables : function() {
			if($('#myTBody tr').length <= 1 && $('#myTBody1 tr').length <= 1) {
				showMessage('error', addConsignmentErrMsg);
				changeError1('quantity','0','0');
				return false;
			} else {
				removeError('quantity');
				hideAllMessages();
			}
			
			return true;
		},validateBasicDetails : function(){
			if($('#lrBooking').exists() && Number($('#lrBooking').val() == 1)
				&& !validateInputTextFeild(1, 'lrNumberManual', 'lrNumberManual', 'basicError', lrNumberErrMsg)) {
				setTimeout(function(){ $('#lrNumberManual').focus(); }, 0);
				return false;
			}
			
			if (!validateInputTextFeild(1, 'sourceBranchId', 'sourceBranch', 'error', sourceBranchErrMsg))
				return false;
			
			if(!validateInputTextFeild(1, 'destinationBranchId', 'destination', 'info', properDestinationErrMsg))
				return false;
			
			if (!validateInputTextFeild(1, 'manualLRDate', 'manualLRDate', 'error', dateErrMsg))
				return false;
			
			if(!validateInputTextFeild(1, 'consignorName', 'consignorName', 'error', consinorNameErrMsg))
				return false;
			
			if(!validateInputTextFeild(1, 'consigneeName', 'consigneeName', 'error', consineeNameErrMsg))
				return false;

			if(ftlBookingScreenConfig.donNotValidateWeightOnArticleAndFix)
				_this.validateOnMetricAndWeight();
		},validateDiscountType : function(){
			var discountAmt 	= $('#discount').val();
			var discountTypes	= $('#discountTypes').val();
			
			if(discountAmt > 0 && discountTypes <= 0) {
				showMessage('error', discountTypeErrMsg);
				changeTextFieldColor('discountTypes', '', '', 'red');
				return false;
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
			
		},calculateTotal : function(data) {
			var chargeAmount = parseInt(0);
			
			if(!isNaN(parseInt($("#lhpvCharge" + LORRY_HIRE).val())))
				chargeAmount = parseInt($("#lhpvCharge" + LORRY_HIRE).val());
			
			var total	= parseInt(chargeAmount);

			$.each(addCharges, function( index, value ) {
				chargeAmount = parseInt(0);
				
				if(!isNaN(parseInt($("#" + value).val())))
					chargeAmount = parseInt($("#" + value).val());
				
				total += parseInt(chargeAmount)
			});

			$.each(subCharges, function( index, value ) {
				chargeAmount = parseInt(0);
				
				if(!isNaN(parseInt($("#" + value).val())))
					chargeAmount = parseInt($("#" + value).val());
				
				total -= parseInt(chargeAmount);
			});
			
			$("#lhpvCharge" + BALANCE_AMOUNT).val(total);
		},calculateBalanceAmount : function(flag) {
			var totalAmount				= $('#lhpvCharge' + LORRY_HIRE).val();
			var hamaliCharge			= 0;
			var otherAdditionalCharges	= 0;
			var detaintionCharges		= 0;
			var advanceAmount			= $('#lhpvCharge' + ADVANCE_AMOUNT).val();
			var deduction				= 0;
			var tdsAmt 					= 0;
			var isCalculateTDSInPercentage  = false;
			var	bcCharges				= 0;
			var	coolycomm				= 0;
			var	haltingCharge			= 0;
			
			if($('#isCharge_'+TDS).exists())
				isCalculateTDSInPercentage  =$('#isCharge_'+TDS).is(":checked");
			
			if ($('#lhpvCharge' + OTHER_ADDITIONAL).exists())
				otherAdditionalCharges	= $('#lhpvCharge' + OTHER_ADDITIONAL).val();
			
			if ($('#lhpvCharge' + DETENTION).exists())
				detaintionCharges		= $('#lhpvCharge' + DETENTION).val();
			
			if ($('#lhpvCharge' + BC).exists())
				bcCharges		= $('#lhpvCharge' + BC).val();
			
			if ($('#lhpvCharge' + DEDUCTION).exists())
				deduction		= $('#lhpvCharge' + DEDUCTION).val();
			
			if ($('#lhpvCharge' + COOLY_COMM).exists())
				coolycomm	= $('#lhpvCharge' + COOLY_COMM).val();
			
			if ($('#lhpvCharge' + CREDIT_HAMALI).exists())
				hamaliCharge	= $('#lhpvCharge' + CREDIT_HAMALI).val();
			
			if ($('#lhpvCharge' + HALTING).exists())
				haltingCharge		= $('#lhpvCharge' + HALTING).val();
			
			var totalAmount		= parseInt(totalAmount) + parseInt(hamaliCharge) + parseInt(otherAdditionalCharges) + parseInt(detaintionCharges) + parseInt(haltingCharge) - parseInt(bcCharges) - parseInt(coolycomm) ;
			
			if(totalAmount >= 0) {
				var advanceAmount	= parseInt(advanceAmount);
				var deductionAmount	= parseInt(deduction);
				var calculatedBalanceAmount	= calculatedBalanceAmount;

				if(deductionAmount > totalAmount) {
					$('#lhpvCharge' + DEDUCTION).val(0);
					deductionAmount = parseInt($('#lhpvCharge' + DEDUCTION).val());
					showMessage('info','You can not enter Deduction charge more than Balance Amount');
					return false;
				}
				
				totalAmount = totalAmount - deductionAmount;

				if(flag) {
					if ($('#lhpvCharge' + TDS).exists()) {
						tdsAmt			= $('#lhpvCharge' + TDS).val();
					}
				} else {
					if(isCalculateTDSInPercentage) {
						tdsAmt = _this.calculateTDSInPercentage();
						$('#lhpvCharge' + TDS).val(tdsAmt);
					} else {
						tdsAmt = _this.calTDSAmount();
					}
				}
				
				$('#lhpvCharge' + BALANCE_AMOUNT).val(totalAmount - advanceAmount - tdsAmt);
				calculatedBalanceAmount = parseInt($('#lhpvCharge' + BALANCE_AMOUNT).val());
			} else {
				$('#lhpvCharge' + UNLOADING).val(0);
				
				var totalAmount				= $('#lhpvCharge' + LORRY_HIRE).val();
				var unloadingCharges		= $('#lhpvCharge' + UNLOADING).val();
				var otherAdditionalCharges	= $('#lhpvCharge' + OTHER_ADDITIONAL).val();
				var detaintionCharges		= $('#lhpvCharge' + DETENTION).val();
				
				$('#lhpvCharge' + BALANCE_AMOUNT).val(parseInt(totalAmount) + parseInt(unloadingCharges) + parseInt(otherAdditionalCharges) + parseInt(detaintionCharges));
				calculatedBalanceAmount = $('#lhpvCharge' + BALANCE_AMOUNT).val();
			}
			
			_this.calculateRefundAmount(calculatedBalanceAmount);
			
		}, calculateRefundAmount : function(calculatedBalanceAmount1) {
			var toPayReceivedAmount	= 0;
			calculatedBalanceAmount = calculatedBalanceAmount1;
			
			if($('#lhpvCharge' + TOPAY_RECEIVED).exists())
				toPayReceivedAmount	= parseInt($('#lhpvCharge' + TOPAY_RECEIVED).val());
			
			var refundAmount		= parseInt((calculatedBalanceAmount - toPayReceivedAmount),10);
			
			if(refundAmount < 0) {
				$('#lhpvCharge' + REFUND_AMOUNT).val(Math.abs(refundAmount));
				$('#lhpvCharge' + BALANCE_AMOUNT).val(0);
			} else {
				$('#lhpvCharge' + REFUND_AMOUNT).val(0);
				$('#lhpvCharge' + BALANCE_AMOUNT).val(Math.abs(refundAmount));
			}
		}, calculateGSTTaxes: function() {
			
			var taxPaidByVal				= $('#STPaidBy').val();
			
			var isGSTNumberAvailable		= _this.checkGSTNumberAvailable();
			var leastTaxableAmount			= 0;
			var taxAmount					= 0;
			var sourceBranchStateId			= $('#sourceStateId').val();	
			var destinationBranchStateId	= $('#destinationStateId').val();	
			var grandtotal					= $('#grandTotal').val();
			var amount 						= parseFloat($("#totalAmt").val());
		
			if(taxes != undefined && !jQuery.isEmptyObject(taxes)) {
				for (var i = 0; i < taxes.length; i++) {
					var tax				= taxes[i];
					taxAmount			= 0.00;
					leastTaxableAmount	= tax.leastTaxableAmount;
					var allowRateInDecimal	= ftlBookingScreenConfig.allowRateInDecimal;

					if(parseInt(taxPaidByVal) == TaxPaidByConstant.TAX_PAID_BY_TRANSPORTER_ID) {
						if (tax.taxPercentage) {
							if(parseInt(sourceBranchStateId) == parseInt(destinationBranchStateId)) {
								if(tax.taxMasterId == SGST_MASTER_ID || tax.taxMasterId == CGST_MASTER_ID) {
									if (typeof allowRateInDecimal !== 'undefined' && allowRateInDecimal)
										taxAmount	= Number(((tax.taxAmount)* amount / 100).toFixed(2)) ;
									else
										taxAmount	= Number(((tax.taxAmount) * amount / 100).toFixed(2));

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
		}, checkGSTNumberAvailable : function() {
			var consignorGSTNVal		= $('#consignorGstn').val();
			var consigneeGSTNVal		= $('#consigneeGstn').val();

			var isGSTNumberAvailable	= true;
			var allowGSTOnTransporterAtAnyCondition	= ftlBookingScreenConfig.allowGSTOnTransporterAtAnyCondition;
			var customGSTPaidByOnWayBillType				= ftlBookingScreenConfig.customGSTPaidByOnWayBillType;
			var customSetGstPaidByTransporterOnGstNumber	= ftlBookingScreenConfig.customSetGstPaidByTransporterOnGstNumber;

			if(typeof allowGSTOnTransporterAtAnyCondition !== 'undefined' && allowGSTOnTransporterAtAnyCondition)
				return false;

			if(typeof customGSTPaidByOnWayBillType !== 'undefined' && customGSTPaidByOnWayBillType)
				return false;

			if(jQuery.isEmptyObject(consignorGSTNVal) && jQuery.isEmptyObject(consigneeGSTNVal))
				isGSTNumberAvailable	= false;

			if(typeof customSetGstPaidByTransporterOnGstNumber !== 'undefined' && customSetGstPaidByTransporterOnGstNumber) {
				var wayBillType				= $('#wayBillType').val();
				
				if((wayBillType == WAYBILL_TYPE_PAID || wayBillType == WAYBILL_TYPE_CREDIT) && (jQuery.isEmptyObject(consignorGSTNVal)))
					isGSTNumberAvailable	= false;
				else if ((wayBillType == WAYBILL_TYPE_TO_PAY) && (jQuery.isEmptyObject(consigneeGSTNVal)))
					isGSTNumberAvailable	= false;
			}

			return isGSTNumberAvailable;
		}, calTDSAmount : function() {
			var declaration		= $('#declarationGiven').val();
			
			if(declaration == LHPVConstant.DECLARATION_GIVEN_NO) {
				var totalAmount		= $('#lhpvCharge' + LORRY_HIRE).val();
				var TDSRate			= $('#tdsRateEle').val();
				
				if(TDSRate == '')
					TDSRate			= 0;
				
				var tdsCharge		= parseInt(TDSRate);
				var totalAmt		= parseInt(totalAmount);
				var tdsAmt			= Math.round((totalAmt * parseInt(tdsCharge, 10)) / 100);
				
				$('#lhpvCharge' + TDS).val(tdsAmt);
				
				return tdsAmt;
			} else {
				return 0;
			}
		},checkCalculateTDSInPercentage : function(){
			var isCalculateTDSInPercentage  = $('#isCharge_'+TDS).is(":checked");
			var tdsINPercentage 			= Number($('#lhpvCharge_' + TDS).val());
			
			if(isCalculateTDSInPercentage) {
				if(tdsINPercentage == 0  ) {
					showMessage('warning', 'TDS % is not Calculate on '+tdsINPercentage);
					return false;
				}
				
				if(tdsINPercentage > 100) {
					$('#lhpvCharge_' + TDS).val(0)
					showMessage('warning', 'TDS % should not greater than ' + tdsINPercentage);
					return false;
				}
			}
			
			return true;
		}, calculateTDSInPercentage: function(){
			var tdsINPercentage = Number($('#lhpvCharge_' + TDS).val());
			var totalAmount		= Number($('#lhpvCharge' + LORRY_HIRE).val());
			
			return (totalAmount) * (tdsINPercentage / 100);
		}, checkTDSAmount : function() {
			var declarationGiven = $('#declarationGiven').val();
			var tdsAmount		 = $('#lhpvCharge' + TDS).val(); 
			
			if(declarationGiven != '' && declarationGiven == LHPVConstant.DECLARATION_GIVEN_NO && tdsAmount == 0)
				alert('Declaration Form is Not Given & You did TDS Amount 0');	
		}, calculateBillBalance : function(){
			var invoiceValue  	= $('#invoiceValue').val();
			var invoiceAdvance 	= $('#invoiceAdvance').val(); 
			var invBalAmount 	= 0;
			
			invBalAmount = invoiceValue - invoiceAdvance
			
			if(invBalAmount >= 0) {
				$("#invBalAmount").val(invBalAmount);
			} else {
				showMessage('error', InvoiceBalnceErrMsg);
				$("#invBalAmount").val(0);
				$('#invoiceAdvance').focus();
				changeError1('invoiceAdvance','0','0');
				return false;
			}
			
			return true;
		}, validateForPaymentType : function() {
			if(generalConfiguration.BankPaymentOperationRequired){
				var paymentType = $('#paymentType').val();

				if(paymentType == 0)
					return true;

				if(paymentType > 0 && isValidPaymentMode(paymentType)) { //Defined in paymentTypeSelection.js
					var trCount = $("#storedPaymentDetails  tr").length;
					
					if(trCount == 0) {
						showMessage('error','Please, Add Payment details for this Lhpv !');
						hideLayer();
						return false;
					}	
				}
			} else {
				if($('#paymentType').val() == PAYMENT_TYPE_CHEQUE_ID) {
					if(!validateInput(1, 'chequeDate', 'chequeDate', 'packageError', chequeDateErrMsg))
						return false;

					if(!validateInput(1, 'chequeNo', 'chequeNo', 'packageError', chequeNumberErrMsg))
						return false;

					if(!validateInput(1, 'bankName', 'bankName', 'packageError', branchNameErrMsg1))
						return false;

					if(!validateInput(1, 'chequeAmount', 'chequeAmount', 'packageError', chequeAmountErrMsg))
						return false;
				}
			}
			
			return true;
		},saveWayBill : function() {
			if(!_this.basicFormValidation())
				return false;
			
			if(isDuplicateLR) {
				showMessage('error', 'LR Number ' + $('#lrNumberManual').val() + ' already exist');
				$('#lrNumberManual').focus();
				return false;
			}
			
			if(isFTLDuplicateLs) {
				showMessage('error', 'LS Number ' + $('#manualLSNumber').val() + ' already exist');
				$('#manualLSNumber').focus();
				return false;
			}
			
			if(isFTLDuplicateLHPV) {
				showMessage('error', 'LHPV Number ' + $('#manualLHPVNumber').val() + ' already exist');
				$('#lrNumberManual').focus();
				return false;
			}
			
			if(isFTLDuplicateMR) {
				showMessage('error', 'MR Number ' + $('#mrNumber').val() + ' already exist');
				$('#mrNumber').focus();
				return false;
			}
			
			var jsonObject		= new Object();
			_this.setJsonDataforCreateWayBill(jsonObject);
			
			jsonObject.filter		= 2;
			
			jsonObject.isFTLBookingScreen		= true;
			
			doneTheStuff = false;
			
			if(!doneTheStuff) {
				var btModalConfirm = new Backbone.BootstrapModal({
					content		: 	"Are you sure you want to Book This LR ?",
					modalWidth 	: 	30,
					title		:	'Book LR',
					okText		:	'YES',
					showFooter 	: 	true,
					okCloses	:	true
				}).open();

				btModalConfirm.on('ok', function() {
					var jsonStr = JSON.stringify(jsonObject);
					showLayer();

					doneTheStuff = true;

					$.getJSON("WayBillAjaxAction.do?pageId=3&eventId=13",
							{json:jsonStr}, function(data) {
								if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
									showMessage('error', iconForErrMsg + ' ' + data.errorDescription);
									hideLayer();
								} else {
									_this.resetArticleWithTable();
									_this.resetCharges();
									_this.resetAllData();
									_this.setRePrintOptionForFtl(data);
									$("#save").removeClass('hide');
									doneTheStuff = false;

									$('#lrType').focus();
									hideLayer();
								}
						});
				});

				btModalConfirm.on('cancel', function() {
					$("#save").removeClass('hide');
					$("#save").focus();
					doneTheStuff = false;
					hideLayer();
				});
			}
			
		}, branchAutoSave : function(){
			var jsonObject		= new Object();
			jsonObject.filter		= 6;
			
			jsonObject.isFTLBookingScreen		= true;
		}, openBillSelectionPopup : function(elementId) {
			$( "#" + elementId ).dialog({
		    	closeOnEscape	: false,
		    	draggable		: false,
		    	modal			: true,
		    	open: function(event, ui) {
		            $(".ui-dialog-titlebar-close", ui.dialog | ui).hide();
		        }
		    });
		}, setJsonDataforCreateWayBill : function(jsonObject) {
			isDiscountPercent = isDiscountPercent != undefined && $('#isDiscountPercent').prop('checked') == true;
			
			jsonObject.wayBillType				= Number($('#wayBillType').val());
			jsonObject.wayBillTypeId			= Number($('#wayBillType').val());
			jsonObject.bookingType				= BookingTypeConstant.DIRECT_DELIVERY_DIRECT_VASULI_ID;
			jsonObject.lrNumberManual			= $('#lrNumberManual').val().toUpperCase();
			jsonObject.manualLRDate				= $('#manualLRDate').val();
			jsonObject.sourceBranchId			= $('#sourceBranchId').val();
			jsonObject.sourceBranch				= $('#sourceBranch').val();
			jsonObject.destinationBranchId		= $('#destinationBranchId').val();
			jsonObject.destination				= $('#destination').val();
			jsonObject.chargeTypeId				= $('#chargeType').val();
			jsonObject.quantity					= $('#quantity').val();
			jsonObject.typeofPacking			= $('#typeofPacking').val();
			jsonObject.saidToContain			= $('#saidToContain').val();
			jsonObject.consignorCorpId			= $('#consignorCorpId').val();
			jsonObject.billingPartyId			= $('#billingPartyId').val();
			jsonObject.partyMasterId			= $('#partyMasterId').val();
			jsonObject.consignorName			= $('#consignorName').val();
			jsonObject.billingPartyName			= $('#billingPartyName').val();
			jsonObject.consignorAddress			= $('#consignorAddress').val();
			jsonObject.invoiceNumber			= $('#invoiceNumber').val();
			jsonObject.STPaidBy					= $('#STPaidBy').val();
			jsonObject.deliveryTo				= InfoForDeliveryConstant.DIRECT_DELIVERY_DIRECT_VASULI_ID;
			jsonObject.cargoType				= $('#cargoType1').val();
			jsonObject.consignmentAmount		= $("#charge" + FREIGHT).val();
			jsonObject.amount					= $("#charge" + FREIGHT).val();
			
			jsonObject["stateId"]				= $('#stateEle').val();
			jsonObject.cityEle					= $('#cityEle').val();
			jsonObject.branchNameEle			= $('#branchNameEle').val();
			jsonObject.handlingBranchEle		= $('#handlingBranchEle').val();
			jsonObject.invoiceDate				= $('#invoiceNoDate').val();
			jsonObject.transportationMode		= $('#transportationMode').val();
			
			if($('#paymentTypePaidLr').exists() && $('#lrType').val() == WAYBILL_TYPE_PAID) {
				jsonObject.paymentType 		= $('#paymentTypePaidLr').val();
				
				var paymentTypeSelectize 					= $('#paymentTypePaidLr').get(0).selectize;
				var currentPaymentType 						= paymentTypeSelectize.getValue(); 
				var paymentTypeOption 						= paymentTypeSelectize.options[ currentPaymentType ];

				jsonObject.paymentTypeName					= paymentTypeOption.paymentTypeName;
				
				if($('#paymentTypePaidLr').val() != PAYMENT_TYPE_CASH_ID)
					jsonObject.chequeAmount			= $('#chequeAmount').val();
			} 
			
			_this.getContainerDetails(jsonObject);
			
			if ($('#consignorPhn').val() != "0000000000")
				jsonObject.consignorPhn			= $('#consignorPhn').val();
			
			jsonObject.consignorGstn			= $('#consignorGstn').val();
			jsonObject.consigneePartyMasterId	= $('#consigneePartyMasterId').val();
			jsonObject.consigneeName			= $('#consigneeName').val();
			jsonObject.consigneeAddress			= $('#consigneeAddress').val();
			
			if ($('#consigneePhn').val() != "0000000000")
				jsonObject.consigneePhn			= $('#consigneePhn').val();
			
			jsonObject.consigneeGstn		= $('#consigneeGstn').val();
			
			_this.getBillSelection(jsonObject);
			
			jsonObject.actualWeight			= $('#actualWeight').val();
			jsonObject.chargedWeight		= $('#chargedWeight').val();
			jsonObject.privateMark			= $('#privateMark').val();
			jsonObject.declaredValue		= $('#declaredValue').val();
			
			if($('#singleFormTypes').exists() && Number($('#singleFormTypes').val() == FormTypeConstant.E_WAYBILL_ID)) {
				jsonObject.FormTypes			= Number(getSeletedValueFromList('singleFormTypes'));
				jsonObject.formNumber			= checkBoxArray.join(',');
			}
			
			jsonObject.vehicleNumberEle				= $('#vehicleNumberEle').val();
			jsonObject.vehicleNumberMasterId		= $('#vehicleNumberEle_primary_key').val();
			jsonObject.driverNameEle				= $('#driverNameEle').val();
			jsonObject.driverMobileNumberEle		= $('#driverMobileNumberEle').val();
			jsonObject.cleaner						= $('#cleanerName').val();
			jsonObject.manualLSNumber				= $('#manualLSNumber').val();
			jsonObject.manualLSDate					= $('#manualLSDate').val();
			jsonObject.ownerName					= $('#ownerName').val();
			jsonObject.panNo						= $('#panNo').val();
			
			jsonObject.manualLHPVNumber				= $('#manualLHPVNumber').val();
			jsonObject.manualLHPVDate				= $('#manualLHPVDate').val();
			jsonObject.operationType				= LHPVConstant.CREATE_ID;
			
			jsonObject.totalAmount					= $("#lhpvCharge" + BALANCE_AMOUNT).val();
			jsonObject.ftlLhpvAdvanceAmount			= $("#lhpvCharge" + ADVANCE_AMOUNT).val();
			jsonObject.lhpvType						= $('#lhpvType').val();
			
			jsonObject.billDate						= $('#invoiceDate').val();
			jsonObject.billno						= $('#invoiceNo').val();
			jsonObject.remark						= $('#remark').val();
			jsonObject.lhpvRemarkEle				= $('#lhpvRemarkEle').val();
			jsonObject.purchaseOrderNumber			= $('#purchaseOrderNumber').val();
			jsonObject.deliveryOrderNumber			= $('#deliveryOrderNumber').val();
			jsonObject.shipmentNumber				= $('#shipmentNumber').val();
			jsonObject.shipmentEndDate				= $('#shipmentEndDate').val();

			var invoiceNumber	= $("#invoiceNo").val();
			
			if($('#createInvoiceDiv').exists() && $('#createInvoiceDiv').is(':checked')) {
				jsonObject.createInvoice			= true;
				
				if($('#invoiceType').exists() && Number($('#invoiceType').val()) == 1 && invoiceNumber != null && invoiceNumber != '' )
					jsonObject.manualInvoiceForFtl		= true;
			}

			var invoiceValue  	= $('#invoiceValue').val();
			var invoiceAdvance 	= $('#invoiceAdvance').val(); 
			var invBalAmount 	= 0;
			
			invBalAmount	= invoiceValue - invoiceAdvance;
			
			
			jsonObject.isPartialPayment = invBalAmount > 0;
			jsonObject.balAmount 		= $('#invBalAmount').val();
			jsonObject.recAmount 		= $('#invoiceAdvance').val();
			jsonObject.billPaymentDate 	= $('#partyAdvDate').val();
			
			//for lr
			var lrNumberManual	= $("#lrNumberManual").val();
			
			if($('#lrBooking').exists() && Number($('#lrBooking').val() == 1) && lrNumberManual != null && lrNumberManual != '' )
				jsonObject.isManual		= true;
		
			if($('#vehicleDetailsDiv').exists() && $('#vehicleDetailsDiv').is(':checked')) {
				jsonObject.createLSFlag = true

				if($('#lsType').exists() && Number($('#lsType').val() == 1) && manualLSNumber != null && manualLSNumber != '' )
					jsonObject.isManualDispatch			= true;
			}
			
			if(allowToCreateTruckAdvanceVoucher && $('#allowTruckAdvanceVoucherPanel').is(":visible"))
				jsonObject.isFtlLhpvPaymentVoucherCreationNeeded	= $('#allowTruckAdvanceVoucher').is(':checked') && $('#lhpvCharge' + ADVANCE_AMOUNT).val() > 0;
			else
				jsonObject.isFtlLhpvPaymentVoucherCreationNeeded	= true;
			
			if(ftlBookingScreenConfig.allowManualMrNumber) {
				mrNumberManual 	= $('#mrNumber').val();

				if($('#partyAdvanceDiv').exists() && $('#partyAdvanceDiv').is(':checked')) {
					jsonObject.createMRFlag = true
					
					if($('#mrType').exists() && Number($('#mrType').val() == 1) && mrNumberManual != null && mrNumberManual != '') {
						jsonObject.isManualMr		= true;
						jsonObject.mrNumberManual 	= $('#mrNumber').val();
					}
				}
			}
			
			var manualLHPVNumber	= $("#manualLHPVNumber").val();
			
			if($('#LHPVDetailsDiv').exists() && $('#LHPVDetailsDiv').is(':checked')) {
				jsonObject.paymentType			= $('#paymentType').val();
				jsonObject.paymentStatus		= LHPVConstant.LHPV_ADVANCE_SETTLEMENT_STATUS_CLEAR;
				jsonObject.createLHPV			= true;
				
				if($('#lhpvType').exists() && Number($('#lhpvType').val() == 1) && manualLHPVNumber != null && manualLHPVNumber != '' )
					jsonObject.manualLhpvForFtl			= true;
			}
			
			var keyObject = Object.keys(charges);
			var data1 = new Object();
			
			for (var i = 0; i < keyObject.length; i++) {
				data1[keyObject[i]]		= $("#" + keyObject[i]).val();
			}
			
			jsonObject.LHPVCharges	= data1;
			
			var checkboxarray	= "";

			$("input[name='checkbox2']").each( function () {
				checkboxarray	+= $(this).val() + "~";
			});
			
			jsonObject.checkbox2		= checkboxarray;
			jsonObject.discount			= $('#discount').val();
			jsonObject.isDiscountPercent= isDiscountPercent;
			
			if(generalConfiguration.BankPaymentOperationRequired) {
				if($('#paymentType').val() == PAYMENT_TYPE_CHEQUE_ID
						|| $('#paymentType').val() == PAYMENT_TYPE_ONLINE_RTGS_ID
						|| $('#paymentType').val() == PAYMENT_TYPE_ONLINE_NEFT_ID) {

					jsonObject.chequeNumber				= $('#chequeNo').val();
					jsonObject.chequeDate				= $('#chequeDate').val();

					if($('#accountNo_primary_key').exists())
						jsonObject.bankAccountId		= $('#accountNo_primary_key').val();
					else
						jsonObject.bankName		= $('#bankName1').val();

					jsonObject.chequeGivenTo			= $('#payeeName').val();
				}

				if($('#paymentType').val() == PAYMENT_TYPE_CREDIT_CARD_ID 
						|| $('#paymentType').val() == PAYMENT_TYPE_DEBIT_CARD_ID)
					jsonObject.chequeNumber				= $('#cardNo').val();

				if($('#paymentType').val() == PAYMENT_TYPE_CREDIT_CARD_ID 
						|| $('#paymentType').val() == PAYMENT_TYPE_DEBIT_CARD_ID
						|| $('#paymentType').val() == PAYMENT_TYPE_IMPS_ID) {

					if($('#accountNo_primary_key').exists())
						jsonObject.bankAccountId		= $('#accountNo_primary_key').val();
					else
						jsonObject.bankName				= $('#bankName1').val();
				}

				if($('#paymentType').val() == PAYMENT_TYPE_IMPS_ID 
						|| $('#paymentType').val() == PAYMENT_TYPE_PAYTM_ID
						|| $('#paymentType').val() == PAYMENT_TYPE_UPI_ID
						|| $('#paymentType').val() == PAYMENT_TYPE_PHONE_PAY_ID
						|| $('#paymentType').val() == PAYMENT_TYPE_GOOGLE_PAY_ID
						|| $('#paymentType').val() == PAYMENT_TYPE_WHATSAPP_PAY_ID) {
					jsonObject.chequeNumber				= $('#referenceNumber').val();
				}
				
				jsonObject.lhpvPaymentValues	= $('#lhpvPaymentDetails').val();
				jsonObject.billPaymentValues	= $('#billPaymentDetails').val();
				jsonObject.paymentTypeBill		= $('#paymentTypeBill').val();
				jsonObject.paymentValues 		= $('#paidLrPaymentDetails').val();
				jsonObject.paymentType			= $('#paymentTypePaidLr').val();
				
				jsonObject.invoiceRemark		= $('#invoiceRemark').val();
				
				if($('#lhpvCharge' + ADVANCE_AMOUNT).val() <= 0)
					jsonObject.paymentStatus	= 0;
			} else { 
				jsonObject.chequeDate		= $('#chequeDate1').val();
				jsonObject.chequeNumber		= $('#chequeNo1').val();
				jsonObject.bankName			= $('#bankName1').val();
			}
			
			jsonObject.companyId	= groupWiseCompanyNameId;
			
			_this.getChargeDetails(jsonObject);
			
		},setJsonDataforBranchAutoSave :function(jsonObject){
			jsonObject.name					= $('#branchName').val();
			jsonObject.city					= $('#cityEle').val();
			jsonObject.state				= $('#stateEle').val();
			jsonObject.region				= $('#region').val();
			jsonObject.subRegion			= $('#subRegion').val();
			jsonObject.displayName			= $('#branchDisplayName').val();
			jsonObject.handlingBranchId		= $('#handlingBranchId').val();
		},getContainerDetails : function(jsonObject) {
			if(containerDetailsArray != undefined)
				jsonObject.containerDetailsArray  = containerDetailsArray;
		},getBillSelection : function(jsonObject) {
			var billSelectionId		= $('#billSelection').val();
			
			if(billSelectionId == undefined)
				billSelectionId		= Number(ftlBookingScreenConfig.defaultBillSelectionId);

			jsonObject.billSelection 	= billSelectionId;
		}, resetAllData : function() {
			$('#singleEwaybillNo').val("");
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
			$('#privateMark').val('');
			$('#fixAmount').val('0');
			$('#declaredValue').val('0');
			$('#totalAmt').val('0');
			$('#discount').val('0');
			$('#discountTypes').val('0');
			$('#grandTotal').val('0');
			$('#invoiceNumber').val('0');
			$('#mrNumber').val('0');
			$('#remark').val('');
			$('#manualLSNumber').val('');
			$('#vehicleNumberEle').val('');
			$('#ownerName').val('');
			$('#panNo').val('');
			$('#driverNameEle').val('');
			$('#driverMobileNumberEle').val('');
			$('#cleanerName').val('');
			$('#manualLHPVNumber').val('');
			$('#manualLSDate').val('');
			$('#manualLHPVDate').val('');
			$('#invoiceDate').val('');
			$('#LorryHireDetailsDiv').attr('checked', false);
			$('#vehicleDetailsDiv').attr('checked', false);
			$('#createInvoiceDiv').attr('checked', false);
			$('#partyAdvanceDiv').attr('checked', false);
			$("#lhpvChargesDiv" ).empty();
			$("#lsDetails" ).hide();
			$('#paymentType').val('0');
			$('#paymentMode').addClass('hide');
			$('#singleFormTypes').val(0);
			$('#paymentType').val(0);
			$('#chargeType').val(6);
			$("#lhpvLabel").hide();
			$("#invoiceTab1").hide();
			$("#invoiceTab2").hide();
			$("#invoiceTab3").hide();
			$("#partyAdvanceLabelDiv").hide();
			$('#lrBooking').val(defaultAutoAndManualIds)
			$('#lrNumberPanel').hide();
			$('#LHPVDetailsDiv').attr('checked', false);
			$("#LHPVDetailsPannel").hide();
			$("#lhpvRemarkEle").val('');
			$('#partyAdvDate').val('');
			$('#invoiceNoDate').val('');
			$('#paymentTypePaidLr').val('0');
			$('#paymentTypePaidLr').val(0);
			$('#transportationMode').val(2);
			
			if(allowToCreateTruckAdvanceVoucher)
				$('#allowTruckAdvanceVoucher').attr('checked', false);
			
			if(Number($('#lrBooking').val()) == 1)
				changeDisplayProperty('lrNumberPanel', 'inline');
			else
				changeDisplayProperty('lrNumberPanel', 'none');
			
			setServerDate();
			
			checkBoxArray = new Array();
			changeDisplayProperty('eWayBillNumberDiv', 'none');
			
			var paymentTypeSelectize = $('#paymentType').get(0).selectize;
			paymentTypeSelectize.setValue(''); 
			
			$("#paymentType").attr("placeholder", "Payment Type");
			
			if(generalConfiguration.BankPaymentOperationRequired)
				hideShowBankPaymentTypeOptions(document.getElementById("paymentType"));
			
			var paymentTypeSelectize = $('#paymentTypeBill').get(0).selectize;
			paymentTypeSelectize.setValue(''); 
			
			$("#paymentTypeBill").attr("placeholder", "Payment Type");
			
			if(generalConfiguration.BankPaymentOperationRequired)
				hideShowBankPaymentTypeOptions(document.getElementById("paymentTypeBill"));
			
			var paymentTypeSelectize = $('#paymentTypePaidLr').get(0).selectize;
			paymentTypeSelectize.setValue(''); 
			
			$("#paymentTypePaidLr").attr("placeholder", "Payment Type");
			
			if(generalConfiguration.BankPaymentOperationRequired)
				hideShowBankPaymentTypeOptions(document.getElementById("paymentTypePaidLr"));
			
			if(ftlBookingScreenConfig.cargoTypeSelectionWiseShowCharges && $('#cargoType1').exists() && $('#cargoType1').is(":visible"))
				$('#cargoType1').val(0);
			
			if (ftlBookingScreenConfig.cargoType)
				resetContainerDetails();
			
			showHideInvoiceDiv();
			
			_this.setDefaultValue();
			_this.resetFreightUptoBranch();
			_this.setDefaultSaidToContain();
			_this.resetInvoiceDetails();
			_this.resetLHPVDetails();
			
			$('#chargeType').val(defaultChargeType);
			
			isDuplicateLR		= false;
			isFTLDuplicateLs 	= false;
			isFTLDuplicateLHPV 	= false;
			isFTLDuplicateMR 	= false;
			
		},resetCharges: function(){
			var charges	= jsondata.bookingCharges;

			for (var i = 0; i < charges.length; i++) {
				$("#charge" + charges[i].chargeTypeMasterId).val(0);
				$('#charge'+charges[i].chargeTypeMasterId).attr("disabled", false);
			}
			
			$('#fixAmount').attr("disabled", false);
			$('#discount').attr("disabled", false);
			$('#isDiscountPercent').attr("disabled", false);
			$('#discountTypes').attr("disabled", false);
			
			$('#tax' + CGST_MASTER_ID).val(0);
			$('#tax' + SGST_MASTER_ID).val(0);
			$('#tax' + IGST_MASTER_ID).val(0);
		}, setDefaultValue : function() {
			$('#chargedWeight').val(ftlBookingScreenConfig.MinChargedWeight);
			$('#actualWeight').val(ftlBookingScreenConfig.MinActualWeight);
			_this.changeWayBillType(ftlBookingScreenConfig.DefaultWayBillTypeForManual);
		},setRePrintOptionForFtl : function(data){
			
			$('#bookedLRDetails').removeClass('hide');
			$('#prevlrnum').html('<a style="cursor:pointer;" id="lrDetails">' + data.wayBillNumber + '</a>');

			$("#lrDetails").bind("click", function() {
				_this.openWindowForView(data.waybillId, 0);
			});
			
			var LRno	= 'LR ' + data.wayBillNumber;
			 document.getElementById("reprintLr").innerHTML = LRno;
			
			$("#reprintLr").unbind("click");
			
			$("#reprintLr").bind("click", function() {
				window.open("printWayBill.do?pageId=340&eventId=10&modulename=lrPrint&masterid=" + data.waybillId + "&isRePrint=true","newwin","width=425,height=300");
			});

			if(data.dispatchLedgerId > 0 && data.dispatchLedgerId != undefined){
				var dispatchname	= 'LS ' + data.lsNumber;
				$("#reprintLS").css('display','block');
				document.getElementById("reprintLS").innerHTML = dispatchname;
				
				$("#reprintLS").unbind("click");
			
				$("#reprintLS").bind("click", function() {
					window.open('InterBraSnch.do?pageId=340&eventId=10&modulename=loadingSheetPrintDestinationWise&masterid='+data.dispatchLedgerId+'&isReprint=true', 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
				});
			} else {
				$("#reprintLS").css('display','none');
			}
			
			if(data.lhpvId > 0 && data.lhpvId != undefined){
				var LHPVno	= 'LHPV ' + data.lhpvNumber;
				$("#reprintLHPV").css('display','block');
				document.getElementById("reprintLHPV").innerHTML = LHPVno;
				
				$("#reprintLHPV").unbind("click");
				
				$("#reprintLHPV").bind("click", function() {
					var typeOfLhpvId = LHPVConstant.TYPE_OF_LHPV_ID_NORMAL;
					window.open('LHPVView.do?pageId=48&eventId=1&lhpvId='+data.lhpvId+'&typeOfLhpvId='+typeOfLhpvId+'&isOriginal=false&isRePrint= true', 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no,');
				});
			} else {
				$("#reprintLHPV").css('display','none');
			}
			
			if(data.exepenseVoucherDetailsId > 0 && data.lhpvId != undefined){
				var paymentVoucherNumber	= 'Voucher ' + data.paymentVoucherNumber;
				 document.getElementById("reprintVoucher").innerHTML = paymentVoucherNumber;
				$("#reprintVoucher").css('display','block');
				$("#reprintVoucher").unbind("click");
				$("#reprintVoucher").bind("click", function() {
				window.open('viewBranchExpense.do?pageId=25&eventId=16&voucherDetailsId='+data.exepenseVoucherDetailsId, 'newwindow', 'config=height=410,width=700, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');	
				});
			} else {
				$("#reprintVoucher").css('display','none');
			}
		},openWindowForView : function(id, branchId) {
			window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId=' + id + '&NumberType=' + LR_SEARCH_TYPE_ID + '&BranchId=' + branchId);
		},getChargeDetails :function(jsonObject) {
			var charges	= jsondata.bookingCharges;
			
			var chargesColl = new Array();
			
			for ( var i = 0; i < charges.length; i++) {
				jsonObject[$('#charge'+charges[i].chargeTypeMasterId).attr("id")] = $('#charge'+charges[i].chargeTypeMasterId).val();

				if($('#charge'+charges[i].chargeTypeMasterId).val() > 0)
					chargesColl[charges[i].chargeTypeMasterId] = $('#charge'+charges[i].chargeTypeMasterId).val()
			}
			
			jsonObject.bookingCharges = chargesColl;
		},getLHPVCharges :function(data){
			var lhpvData = data.lhpvData;
			var lhpvSubChargesHshmp	= lhpvData.lhpvSubChrgHshmp;
			var keyObject 			= Object.keys(lhpvSubChargesHshmp);

			subCharges 	= new Array();

			for (var i = 0; i < keyObject.length; i++) {
				var chargeObject		= lhpvSubChargesHshmp[keyObject[i]];
				var chargeIdentifier 	= "lhpvCharge" + chargeObject.lhpvChargeTypeMasterId;
				subCharges.push(chargeIdentifier);
			}

			var lhpvAddChargesHshmp	= lhpvData.lhpvAddChrgHshmp;
			var keyObject 			= Object.keys(lhpvAddChargesHshmp);

			addCharges 	= new Array()

			for (var i = 0; i < keyObject.length; i++) {
				var chargeObject		= lhpvAddChargesHshmp[keyObject[i]];
				var chargeIdentifier 	= "lhpvCharge" + chargeObject.lhpvChargeTypeMasterId;
				addCharges.push(chargeIdentifier);
			}

			var lhpvChargesHshmp		= lhpvData.lhpvChargesHshmp;
			var keyObject 				= Object.keys(lhpvChargesHshmp);

			for (var i = 0; i < keyObject.length; i++) {
				var chargeObject			= lhpvChargesHshmp[keyObject[i]];
				var chargeIdentifier 		= "lhpvCharge" + chargeObject.lhpvChargeTypeMasterId;
				charges[chargeIdentifier]	= 0;
				var chargeDiv				= null;

				initialiseFocus();

				if (chargeObject.operationType == OPERATION_TYPE_STATIC || chargeObject.operationType == OPERATION_TYPE_NO_EFFECT_BALANCE) {			
					chargeDiv	= ("<div class='row'><div class='col-xs-4'><label class='col-xs-5'><span>" + chargeObject.displayName + "</span><span style='color: red;font-size: 20px;'>*</span></label><div class='col-xs-7 validation-message'><div class='left-inner-addon'><input class='form-control calculation' value='0' type='text' name='" + chargeIdentifier + "' id='" + chargeIdentifier + "' data-tooltip='" + chargeObject.displayName + " '  " 

									+"onkeypress='if (event.which != 8 && event.which != 0 && (event.which < 48 || event.which > 57)) {event.preventDefault();  }' /></div></div></div></div>");
				}
				if (chargeObject.operationType == OPERATION_TYPE_STATIC && chargeObject.lhpvChargeTypeMasterId == LORRY_HIRE){
					var chargeDiv	= ("<div class='row'><div class='col-xl-12'><label class='col-xs-5'><span>" + chargeObject.displayName + "</span><span style='color: red;font-size: 20px;'>*</span></label><div class='col-xs-7 validation-message'><div class='left-inner-addon'><input class='form-control calculation' value='0' type='text' name='" + chargeIdentifier + "' id='" + chargeIdentifier + "' data-tooltip='" + chargeObject.displayName + " '  " 

								+"onkeypress='if (event.which != 8 && event.which != 0 && (event.which < 48 || event.which > 57)) {event.preventDefault();  }' /></div></div></div></div>");
				} else if (chargeObject.operationType == OPERATION_TYPE_STATIC) {					
					var chargeDiv	= ("<div class='row' id='div_"+chargeIdentifier+"'><div class='col-xl-12'><label class='col-xs-5'><span>" + chargeObject.displayName + "</span></label><div class='col-xs-7 validation-message'><div class='left-inner-addon'><input class='form-control calculation' value='0' type='text' name='" + chargeIdentifier + "' id='" + chargeIdentifier + "' data-tooltip='" + chargeObject.displayName + " '  " 

								+"onkeypress='if (event.which != 8 && event.which != 0 && (event.which < 48 || event.which > 57)) {event.preventDefault();  }' /></div></div></div></div>");
				} 

				if (chargeObject.operationType == OPERATION_TYPE_ADD) {
					var chargeDiv	= ("<div class='row'><div class='col-xl-12'><label class='col-xs-5'><span>" + chargeObject.displayName + "</span></label><div class='col-xs-7 validation-message'><div class='left-inner-addon'><i class='glyphicon glyphicon-plus'></i><input class='form-control calculation' value='0' type='text' name='" + chargeIdentifier + "' id='"+chargeIdentifier+"' data-tooltip='" + chargeObject.displayName + "'  " 

								+"onkeypress='if (event.which != 8 && event.which != 0 && (event.which < 48 || event.which > 57)) {event.preventDefault();  }' /></div></div></div></div>");
				}

				if (chargeObject.operationType == OPERATION_TYPE_SUBTRACT) {
					if((true)
							&& chargeObject.lhpvChargeTypeMasterId == TDS) {
						var chargeDiv	= ("<div class='row' id='div_"+chargeIdentifier+"'><div class='col-xl-12'><label class='col-xs-5'><span>" + chargeObject.displayName + "</span></label><div class='col-xs-7 validation-message'><div class='left-inner-addon'><i class='glyphicon glyphicon-minus'></i><input class='form-control calculation' value='0' type='text' name='" + chargeIdentifier + "' id='"+chargeIdentifier+"' data-tooltip='" + chargeObject.displayName + "'" 

									+"onkeypress='if (event.which != 8 && event.which != 0 && (event.which < 48 || event.which > 57)) {event.preventDefault();  }' /></div></div></div>"
									+ "<div class='col-xl-12'><label class='col-xs-5'><span>TDS in % <input id='isCharge_"+chargeObject.lhpvChargeTypeMasterId+"'  type='checkbox' data-tooltip='TDS'/></span></label><div class='col-xs-7 validation-message'>"
									+ "<input id='lhpvCharge_"+chargeObject.lhpvChargeTypeMasterId+"'class='form-control  hide' type='text' value='0'"
									+ "type='text'/></div></div></div>");
					} else {
						var chargeDiv	= ("<div class='row' id='div_"+chargeIdentifier+"'><div class='col-xl-12'><label class='col-xs-5'><span>" + chargeObject.displayName + "</span></label><div class='col-xs-7 validation-message'><div class='left-inner-addon'><i class='glyphicon glyphicon-minus'></i><input class='form-control calculation' value='0' type='text' name='" + chargeIdentifier + "' id='"+chargeIdentifier+"' data-tooltip='" + chargeObject.displayName + "'" 

									+"onkeypress='if (event.which != 8 && event.which != 0 && (event.which < 48 || event.which > 57)) {event.preventDefault();  }' /></div></div></div></div>");
					}
				}

				$( "#lhpvChargesDiv" ).append(chargeDiv);

			}
			
			$("#manualLHPVNumber").keypress(function() {
				_this.setFocusForLhpvChargesAfterLhpvNumber(this);
			});
			
			$( "#lhpvChargesDiv :input" ).focus(function() {
				$(this).select();
			});
			
			$("#lhpvCharge92").keyup(function() {
				_this.setFocusForLhpvCharges(this);
			});
			
			$("#paymentType_wrapper").change(function(){
				_this.setFocusForLhpvChargesPayment(this);
			});

			$("#lhpvChargesDiv :input").blur(function() {
				if($(this).attr('id') == ('lhpvCharge' + TDS) || $(this).attr('id') == ('lhpvCharge' + ADVANCE_AMOUNT))
					_this.calculateBalanceAmount(true);
				else
					_this.calculateBalanceAmount(false);
			});
			
			$("#isCharge_"+ TDS).click(function() {
				if(this.checked) {
					$("#lhpvCharge" + TDS).attr('readonly', true);
					$("#lhpvCharge_" + TDS).removeClass('hide');
					$("#lhpvCharge" + TDS).val(0);
				} else {
					$("#lhpvCharge" + TDS).attr('readonly', false);
					$("#lhpvCharge_" + TDS).addClass('hide');
					$("#lhpvCharge_" + TDS).val(0);
					$("#lhpvCharge" + TDS).val(0);
				}
			});

			$("#lhpvCharge_" + TDS).on('keypress', function(e) {
				return validateFloatKeyPress(e, this);
			});

			$("#lhpvCharge" + BALANCE_AMOUNT).prop("readonly", true);

			manualLHPVNod	= nod();
			manualLHPVNod.configure({
				parentClass:'validation-message'
			});
			
			manualLHPVNod.add({
				selector	: '#manualNumberEle',
				validate	: 'presence',
				errorMessage: 'Enter LHPV Number !'
			});

			manualLHPVNod.add({
				selector	: '#manualNumberEle',
				validate	: 'integer',
				errorMessage: 'Enter Valid LHPV Number !'
			});

			manualLHPVNod.add({
				selector	: '#manualDateEle',
				validate	: 'presence',
				errorMessage: 'Select Manual LHPV Date !'
			});

			lhpvNodCheck = nod();

			lhpvNodCheck.add({
				selector	: "#remarkEle",
				validate	: "presence",
				errorMessage: "Provide Remark"
			});

			lhpvNodCheck.add({
				selector	: "#paymentType_wrapper",
				validate	: "validateAutocomplete:#paymentType",
				errorMessage: "Please Select Payment Type"
			});

			lhpvNodCheck.add({
				selector	: "#paymentStatus_wrapper",
				validate	: "validateAutocomplete:#paymentStatus",
				errorMessage: "Please Select Payment Status"
			});

			$( ".calculation" ).bind("change", function() {
				_this.calculateTotal(data);
			});
		}, setGstPaidByOnBillingParty: function(){
			if(!setGstPaidByOnBillingParty)
				return;
			
			if(isTBBPartyInConsignorName)
				$('#STPaidBy').val(TAX_PAID_BY_CONSINGOR_ID);
			else if(isTBBPartyInConsigneeName)
				$('#STPaidBy').val(TAX_PAID_BY_CONSINGEE_ID);
			else
				$('#STPaidBy').val(TAX_PAID_BY_CONSINGOR_ID);
		}
	});
});

function lrDateValidation() {
	if (LRDate) {
		if(!validateInputTextFeild(1, 'manualLRDate', 'manualLRDate', 'error',  dateErrMsg))
			return false;

		if(!chkDate(getValueFromInputField('manualLRDate')))
			return false;
	}
	
	return true;
}

function chkDate(date) {
	if(isValidDate(date)) {
		var currentDate  			= new Date(curSystemDate);
		var previousDate 			= new Date(curSystemDate);
		var manualLRDate 			= new Date(curSystemDate);
		var pastDaysAllowed 		= maxNoOfDaysAllowBeforeCashStmtEntry;
		var currentWayBillTypeId 	= 0;
		var wayBillTypeId		 	= 0;
		var backDaysAllow		 	= 0;
		
		if(allowBackDaysForFtlBookingScreen)
			pastDaysAllowed			= manualLRDaysAllowed;
		else
			pastDaysAllowed 		= maxNoOfDaysAllowBeforeCashStmtEntry;
		
		var manualLRDateParts 	= new String(date).split("-");
		manualLRDate.setFullYear(parseInt(manualLRDateParts[2],10));
		manualLRDate.setMonth(parseInt(manualLRDateParts[1]-1,10));
		manualLRDate.setDate(parseInt(manualLRDateParts[0],10));

		var diffDays 			= diffBetweenTwoDate(manualLRDate, currentDate);
		
		var wayBillTypeWiseBackDaysAllow 		 	= ftlBookingScreenConfig.wayBillTypeWiseBackDaysAllow;
		var wayBillTypeIdAndBackDaysConfiguration	= ftlBookingScreenConfig.wayBillTypeIdAndBackDaysConfiguration;

		if(getValueFromInputField('wayBillType') != null) 
			currentWayBillTypeId = getValueFromInputField('wayBillType');

		if(wayBillTypeWiseBackDaysAllow == 'true'){
			var wayBillTypeIdAndBackDaysConfigurationArray	= wayBillTypeIdAndBackDaysConfiguration.split(',');
			
			if(wayBillTypeIdAndBackDaysConfigurationArray != null){
				for(i = 0; i < wayBillTypeIdAndBackDaysConfigurationArray.length; i++) {
					wayBillTypeId				= wayBillTypeIdAndBackDaysConfigurationArray[i].split('_')[0];
					backDaysAllow				= wayBillTypeIdAndBackDaysConfigurationArray[i].split('_')[1];

					if(wayBillTypeId == currentWayBillTypeId){
						pastDaysAllowed = backDaysAllow;
						break;
					} 
				}
			}
		}

		if (pastDaysAllowed < '0') {
			showMessage('error', configManualBokingErrMsg);
			changeError1('manualLRDate','0','0');
			isValidationError=true;
			return false;
		}

		previousDate.setDate(previousDate.getDate() - parseInt(pastDaysAllowed,10));
		previousDate.setHours(0,0,0,0);
		
		if(backDateAllowedInCurrentMonthOnly) {
			if(manualLRDate.getMonth() != currentDate.getMonth()) {
				$("#manualLRDate").val('');
				showMessage('info', backDateInCurrentMonthOnlyErrMsg);
				changeError1('manualLRDate','0','0');
				isValidationError=true;
				return false;
			}
		}

		if(manualLRDate.getTime() > currentDate.getTime()) {
			showMessage('error', futureDateNotAllowdErrMsg);
			changeError1('manualLRDate','0','0');
			isValidationError=true;
			return false;
		} else {
            if(AllowPreviousDateForGroupAdminOnly == 'true'
				&& executive.executiveType != EXECUTIVE_TYPE_GROUPADMIN && Number(diffDays) > Number(1)) {
					$("#manualLRDate").val('');
					showMessage('info', dateTillDayFromTodayInfoMsg(1));
					changeError1('manualLRDate','0','0');
					isValidationError=true;
					return false;
           }
			
            if(manualLRDate.getTime() > previousDate.getTime()) {
            	hideAllMessages();
            	removeError('manualLRDate');
            	return true;
            } else {
				showMessage('info', dateTillDayFromTodayInfoMsg(pastDaysAllowed));
				changeError1('manualLRDate','0','0');
				isValidationError=true;
				return false;
			}
		}
	} else {
		showMessage('error', validDateErrMsg);
		changeError1('manualLRDate','0','0');
		isValidationError=true;
		return false;
	}
}

function setBlankAmount(obj) {
	if(obj.value=='0')
		obj.value='';
}

function setChargesFocus() {
	var charges	= jsondata.bookingCharges;

	if($('#lrType').val() != WayBillTypeConstant.WAYBILL_TYPE_FOC) {
		for (var i = 0; i < charges.length; i++) {
			next =  'charge' + charges[1].chargeTypeMasterId;
		}
	} else {
		next = "vehicleDetailsDiv";
	}
}

function setFocusForBookingCharges(event) {
	if(getKeyCode(event) == 13) {
		if(jsondata.accountGroupId == 424 || jsondata.accountGroupId == 620) {
			$("#charge8").keyup(function () {
				next = 'save';
			});
		} else if(jsondata.accountGroupId == 204) {
			$("#charge67").keyup(function () {
				next = 'save';
			});
		} else if(jsondata.accountGroupId == 407) {
			$("#charge24").keyup(function () {
				next = 'save';
			});
		}
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
	
	return returnType;
}

function getChargesTotal() {
	var charges	= jsondata.bookingCharges;
	var total	= 0;

	for (var i = 0; i < charges.length; i++) {
		var chargeMasterId	= charges[i].chargeTypeMasterId;

		if ($("#charge"+chargeMasterId).val() != "")
			total += parseFloat($("#charge"+chargeMasterId).val());
	}
	
	$('#totalAmt').val(total);
	
	return total;
}

function checkAndUpdateDiscountOnPercentage() {
	if(isBookingDiscountPercentageAllow) {
		var discountPercentage 	= (parseFloat($("#discount").val()) / parseFloat($("#charge"+BookingChargeConstant.FREIGHT).val())) * 100;

		if(Number(discountPercentage) <= Number(ftlBookingScreenConfig.maximumDiscountValue))
			$("#discountPercentage").val(discountPercentage);
		else {
			showMessage('error', 'Discount not allowed more than '+ftlBookingScreenConfig.maximumDiscountValue+'%.')
			$("#discountPercentage").val(0);
			$("#discount").val(0);
		}
	}
}

function isValidForPercentage() {
	var discountValue = $('#discount').val();
	
	if(discountValue > 100)
		$("#isDiscountPercent").prop("disabled", true);
	else
		$("#isDiscountPercent").prop("disabled", false);
}

function calcGrandtotal() {

	var grandtotal 	= 0;
	var amount 		= getChargesTotal();
	discAmount 		= 0;
	
	if(isBookingDiscountAllow) {
		if(document.getElementById('isDiscountPercent') != null && document.getElementById('isDiscountPercent').checked)
			discAmount	= amount - parseFloat($('#discount').val()) * parseFloat(amount) / 100;
		else
			discAmount	= amount - parseFloat($('#discount').val());
	} else {
		discAmount = amount;
	}
	
	var cgst	= 0;
	var sgst	= 0;
	var igst	= 0;
	
	if($('#tax' + TaxMasterConstant.CGST_MASTER_ID).val() > 0)
		cgst	= $('#tax' + TaxMasterConstant.CGST_MASTER_ID).val();
	
	if($('#tax' + TaxMasterConstant.SGST_MASTER_ID).val() > 0)
		sgst	= $('#tax' + TaxMasterConstant.SGST_MASTER_ID).val();
	
	if($('#tax' + TaxMasterConstant.IGST_MASTER_ID).val() > 0)
		igst	= $('#tax' + TaxMasterConstant.IGST_MASTER_ID).val();
	
	discAmount = parseFloat(discAmount);
	grandtotal = parseFloat(discAmount) + parseFloat(cgst) + parseFloat(sgst) + parseFloat(igst);
	
	if (lrWiseDecimalAmountAllow($('#wayBillType').val()))
		$("#grandTotal").val((grandtotal).toFixed(2));
	else
		$("#grandTotal").val(Math.round(grandtotal));
}

function lrWiseDecimalAmountAllow(wayBillType) {
	if(ftlBookingScreenConfig.allowRateInDecimal) {
		if(ftlBookingScreenConfig.lrTypeWiseAmountInDecimal) {
			var lrTypeArray 	= (ftlBookingScreenConfig.LRTypeForAllowRateInDecimal).split(",");
			
			if(isValueExistInArray(lrTypeArray, wayBillType))
				return true;
		} else {
			return true;
		}
	}
	
	return false;
}

function partyAdvance(){
	if(document.getElementById('partyAdvanceDiv') != null && document.getElementById('partyAdvanceDiv').checked) {
		$("#partyAdvanceTab").fadeIn(1000);
		$("#createInvoiceDiv").fadeIn(1000);
		$("#invoiceTab1").fadeIn(1000);
	} else {
		$("#partyAdvanceTab").fadeOut(1000);
		$("#createInvoiceDiv").fadeOut(1000);
		$("#invoiceTab1").fadeOut(1000);
	}
}

function tdsinPercent() {
	var lorryHireAmount		= 0;
	var tdsAmount			= 0;
	
	var lorryHireAmount		= parseInt($("#lhpvCharge" + LORRY_HIRE).val());
	var tdsCharge 			= $('#TDSRate').val();
	
	if(document.getElementById('tdsinpercent') != null && document.getElementById('tdsinpercent').checked) {
		$(".tdsrow").css('display','block');
		tdsAmount		= parseFloat(lorryHireAmount) * parseFloat(tdsCharge) / 100;
		$("#lhpvCharge" + TDS).val(tdsAmount);
	} else {
		$(".tdsrow").css('display','none');
	}
}

function saveSaidToContain() {
	setNextPreviousForSaidToContain();
	
	if(!validateInput(1, 'newSaidToConatainName', 'newSaidToConatainName', 'addNewDriverErrorDiv', saidToContaionErrMsg))
		return false;

	var newSaidToContainName = $('#newSaidToConatainName').val();

	var jsonObject					= new Object();

	jsonObject.filter				= 3;
	jsonObject.newSaidToContainName	= newSaidToContainName;

	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("Ajax.do?pageId=9&eventId=16",
			{json:jsonStr}, function(data) {
				if (!jQuery.isEmptyObject(data)) {
					if(data.saved) {
						$("#consignmentGoodsId").val(data.id);
						$("#saidToContain").val(newSaidToContainName);
						HideSaidToContainDialog();
					} else {
						alert(data.Exist);
					}
				}
			});
}

function HideSaidToContainDialog(){
    $("#companyNameOverlay").hide();
    $("#companyNameDialog").fadeOut(0);
}

function setNextPreviousForSaidToContain() {
	var qtyAmount			= null;

	if(document.getElementById('fixAmount') != null)
		qtyAmount			= document.getElementById('fixAmount');

	if(qtyAmount.disabled)
		next = 'add';
	else
		next = 'fixAmountDiv';
}

function setNextPreviousForLsType() {
	if($('#lsType').exists() && Number($('#lsType').val() == 1))
		next = 'manualLSNumber';
	else
		next = 'vehicleNumberEle';
}

function setNextPreviousForMAnualLhpvType() {
	if($('#lhpvType').exists() && Number($('#lhpvType').val() == 1))
		next = 'manualLHPVNumber';
	else
		next = 'LorryHireDetailsDiv';
}

function isNumberKeyWithDecimal(evt,id) {
	var charCode = (evt.which) ? evt.which : evt.keyCode;

	if(charCode == 46) {
		var txt=document.getElementById(id).value;
		
		if(!(txt.indexOf(".") > -1))
			return true;
	}
	
	if (charCode > 31 && (charCode < 48 || charCode > 57))
		return false;

	return true;
}

function noNumbers(evt) {
	if (evt.ctrlKey == 1) {
		return true;
	} else {
		var keynum = null;
		
		if(window.event) // IE
			keynum = evt.keyCode;
		else if(evt.which) // Netscape/Firefox/Opera
			keynum = evt.which;
		
		if(keynum != null) {
			if(keynum == 8)
				return true;
			else if(keynum == 45 || keynum == 47)
				return true;
			else if (keynum < 48 || keynum > 57)
				return false;
		}

		return true;
	}
}

function validateContainerBeforeSave(count) {
	
	if(count == 0) {
		showMessage('info','Please enter container details!');
		$("#containerType").focus();
		return false;
	}
	
	if($('#containerDetailsSummary').exists() && $('#containerDetailsSummary').is(":visible")) {
		var count = $("#containerDetailsDivSummaryDiv tr").length;
		if(Number(count) == 1) {
			var containerType = $("#actualContainerType").val();
			
			if(containerType == 2) {
				showMessage('info','Please add one more container, as you have selected 20ft double!');
				$("#containerType").val(0);
				$("#containerType").focus();
				return false;
			}
		}
	}
	
	return true;
}

function validateContainerType(typeObj) {
	
	if($('#containerDetailsSummary').exists() && $('#containerDetailsSummary').is(":visible")){
		var count = $("#containerDetailsDivSummaryDiv tr").length;
		
		if(Number(count) == 2){
			showMessage('info','Cannot add more!');
			$("#containerType").val(0);
			$("#containerType").focus();
			return;
		} else if(Number(count) == 1) {
			var containerType = $("#actualContainerType").val();
			if(containerType != 2){
				showMessage('info','Cannot add more!');
				$("#containerType").val(0);
				$("#containerType").focus();
				return;
			} 
			
			if(typeObj.value != containerType ) {
				showMessage('info','Cannot select different container type!');
				$("#containerType").val(0);
				$("#containerType").focus();
				return;
			}
		}
	}
}

function validateContainerSize(sizeObj) {
	
	var size 			= sizeObj.value;
	var containerType 	= $('#containerType').val();

	if(containerType <= 0) {
		showMessage('info','Please select container type!');
		$("#"+sizeObj.id).val('');
		$("#containerType").focus();
		return false;
	}
	
	if(containerType == 3) {
		if(size > 40){
			showMessage('info','Cannot enter size greater than 40ft.');
			setTimeout(() => {
				$("#"+sizeObj.id).val('');
				$("#"+sizeObj.id).focus();
			}, 500);
			return false;
		}
	} else if(size > 20){
		showMessage('info','Cannot enter size greater than 20ft.');
		setTimeout(() => {
			$("#"+sizeObj.id).val('');
			$("#"+sizeObj.id).focus();
		}, 500);
		return false;
	}
	
	return true;
}

function saveContainerDetailsFunc() {
	containerDetailsArray 	= new Array();
	var count				= $("#containerDetailsDivSummaryDiv tr").length;

	if(!validateContainerBeforeSave(count))
		return;
	
	if(Number(count) > 0) {
		for(var i = 0; i < count; i++) {
			var containerDetailsData 	= {};

			containerDetailsData.containerNumber			= $("#containerNo_" + (i + 1)).html();
			containerDetailsData.containerSize				= $("#containerSize_" + (i + 1)).html();
			containerDetailsData.containerType				= $("#containerType_" + (i + 1)).val();
			containerDetailsData.sealNumber					= $("#sealNo_" + (i + 1)).html();
			containerDetailsData.row						= $("#row_" + (i + 1)).val();

			containerDetailsArray.push(containerDetailsData);
		}
	}
	
	$('#popUpForCargoType').modal('hide');
	$('#viewContainerDetailsDiv1').removeClass('hide');
}

function viewContainerDetailsFunc() {
	$("#popUpForCargoType").modal({
		backdrop: 'static',
		keyboard: false
	});
}

function resetContainerDetails() {
	$("#containerNo").val('');
	$("#sealNo").val('');
	$("#containerSize").val('');
	$("#containerType").val(0);
	$('#popUpForCargoType').modal('hide');
	$('#viewContainerDetailsDiv1').addClass('hide');
	$('#containerDetailsDiv').addClass('hide');
	$('#containerDetailsDivSummaryDiv').empty();
	containerDetailsArray 	= [];
	dr = 0;
}

function addCargoType(cargoType) {
	
	resetContainerDetails();
	
	if(cargoType.value == 1){

		$("#popUpForCargoType").modal({
			backdrop: 'static',
			keyboard: false
		});
		
		setTimeout(() => {
			$('#containerType').focus();
		}, 500);
		
		$("#addContainerDetails").bind("click", function() {
			addContainerDetailsFunc();
		});
		
		$("#saveContainerDetails").bind("click", function() {
			saveContainerDetailsFunc();
		});
	}
}

function removeContainerRow(id){
	
	var row = $('#row_'+(id+1)).val();
	$('#containerDetailsSummary'+id).remove();
	dr = dr - 1; 
	
	containerDetailsArray = containerDetailsArray.filter(function(obj) {return obj.row != Number(row);});
		
	if($('#containerDetailsSummary').exists() && $('#containerDetailsSummary').is(":visible")){
		var count = $("#containerDetailsDivSummaryDiv tr").length;
		if(count == 0){
			containerDetailsArray 	= [];
		}
	}
}

function validateContainerArray(){
	if(containerDetailsArray != undefined && containerDetailsArray.length > 0)
		$('#viewContainerDetailsDiv1').removeClass('hide');
	else
		$('#viewContainerDetailsDiv1').addClass('hide');
}

function validateContainerFields(){
	
	if($("#containerType").val() <= 0){
		showMessage('info','Please select container type!');
		$("#containerType").val(0);
		$("#containerType").focus();
		return false;
	}
	
	if($("#containerNo").val() == ''){
		showMessage('info','Please enter container number!');
		$("#containerNo").val('');
		$("#containerNo").focus();
		return false;
	}
	
	if($("#containerSize").val() == '' || $("#containerSize").val() <= 0){
		showMessage('info','Please enter container size!');
		$("#containerSize").val('');
		$("#containerSize").focus();
		return false;
	}

	if($("#sealNo").val() == ''){
		showMessage('info','Please enter seal number!');
		$("#sealNo").val('');
		$("#sealNo").focus();
		return false;
	}
	
	return true;
}

var dr = 0;

function addContainerDetailsFunc(){
	if(!validateContainerFields())
		return;

	var containerType 				= $('#containerType').val();
	var containerSize 				= $('#containerSize').val();

	if(containerType == 3){
		if(dr > 1){
			showMessage('info','Cannot add more!');
			return;
		}
		if(containerSize > 40){
			showMessage('info','Cannot add more than 40ft!');
			$('#containerSize').val('');
			$('#containerSize').focus();
			return;
		}
	} else {
		if(dr > 2){
			showMessage('info','Cannot add more!');
			return;
		}
		if(containerSize > 20){
			showMessage('info','Cannot add more than 20ft!');
			$('#containerSize').val('');
			$('#containerSize').focus();
			return;
		}
	}
	
	var containerNo 				= $('#containerNo').val();
	var containerTypeStr			= "";

	if(containerType == 3)
		containerTypeStr = "40 FT Single";
	else if(containerType == 2)
		containerTypeStr = "20 FT Double";
	else if(containerType == 1)
		containerTypeStr = "20 FT Single";

	var sealNo 						= $('#sealNo').val();

	if (containerNo.length > 15)
		containerNo = containerNo.substring(0,15) + '..';
	
	if (sealNo.length > 15)						
		sealNo = sealNo.substring(0,15) + '..';
	
	if(!$('#containerDetailsSummary'+dr ).exists()){
		alreadyAdded = true;
		var row 						= createRowInTable('containerDetailsSummary' + dr, '', '');
		var containerTypeCol 			= createColumnInRow(row, 'containerTypeStr_' + (dr + 1), '', '250px', '', 'letter-spacing:2px;text-align: center;', '');
		var containerNoCol 				= createColumnInRow(row, 'containerNo_' + (dr + 1), '', '250px', '', 'letter-spacing:2px;text-align: center;', '');
		var containerSizeCol 			= createColumnInRow(row, 'containerSize_' + (dr + 1), '', '250px', '', 'letter-spacing:2px;text-align: center;', '');
		var sealNoCol 					= createColumnInRow(row, 'sealNo_' + (dr + 1), '', '250px', '', 'letter-spacing:2px;text-align: center;', '');

		appendValueInTableCol(containerTypeCol, containerTypeStr.toUpperCase());
		appendValueInTableCol(containerTypeCol, '<input type ="hidden" id="row_'+ (dr + 1) +'" value= ' + dr + ' />');
		appendValueInTableCol(containerTypeCol, '<input type ="hidden" id="actualContainerType" value= ' + $('#containerType').val() + ' />');
		appendValueInTableCol(containerTypeCol, '<input type ="hidden" id="containerType_' + (dr + 1) + '" value= ' + containerType + ' />');
		appendValueInTableCol(containerNoCol, containerNo.toUpperCase());
		appendValueInTableCol(containerSizeCol, containerSize);
		appendValueInTableCol(sealNoCol, sealNo.toUpperCase());
		appendValueInTableCol(createColumnInRow(row, 'removeRow_' + (dr + 1), '', '250px', '', 'letter-spacing:2px;text-align: center;', ''), '<button type="button" id="remove_'+ (dr + 1) + '" class="btn btn-danger">Remove</button>');

		$("#containerDetailsDivSummaryDiv").append(row);
		$("#containerDetailsDiv").removeClass('hide');

		$("#remove_"+(dr + 1)).bind("click", function() {
			removeContainerRow(dr-1);
		});

		dr = dr + 1;
		$("#containerNo").val('');
		$("#sealNo").val('');
		$("#containerSize").val('');
		$("#containerType").val(0);
		setTimeout(() => {
			$("#containerType").focus();
		}, 200);

	}
}

function hideCharge(chargeId) {
	changeDisplayProperty('label'+chargeId, 'none');
	changeDisplayProperty('charge'+chargeId, 'none');
}

function showCharge(chargeId) {
	changeDisplayProperty('label'+chargeId,'block');
	changeDisplayProperty('charge'+chargeId,'block');
}

function hideSpecificCharge(cargoType) {
	var hideBookingChargeIds				= null;
	var hideContainerChargeIds				= null;
	var	bookinghargeIdArray 				= new Array();
	var containerChargeIdsArray 			= new Array();
	
	hideBookingChargeIds 				= ftlBookingScreenConfig.hideBookingChargeIds;
	bookinghargeIdArray					= hideBookingChargeIds.split(",");
	hideContainerChargeIds 				= ftlBookingScreenConfig.hideContainerChargeIds;
	containerChargeIdsArray				= hideContainerChargeIds.split(",");
	
	if(ftlBookingScreenConfig.cargoTypeSelectionWiseShowCharges) {
		if(cargoType.value == containerDetails.CARGO_TYPE_CONTAINER) {
			if(bookinghargeIdArray != null && bookinghargeIdArray.length > 0) {
				for (i = 0; i < bookinghargeIdArray.length; i++) {
					hideCharge(bookinghargeIdArray[i]);
				}
			}
		} else {
			if(bookinghargeIdArray != null && bookinghargeIdArray.length > 0) {
				for (i = 0; i < bookinghargeIdArray.length; i++) {
					showCharge(bookinghargeIdArray[i]);
				}
			}
		}
		
		if(cargoType.value == containerDetails.CARGO_TYPE_CONTAINER) {
			if(containerChargeIdsArray != null && containerChargeIdsArray.length > 0) {
				for (i = 0; i < containerChargeIdsArray.length; i++) {
					showCharge(containerChargeIdsArray[i]);
				}
			}
		} else if(containerChargeIdsArray != null && containerChargeIdsArray.length > 0) {
			for (i = 0; i < containerChargeIdsArray.length; i++) {
				hideCharge(containerChargeIdsArray[i]);
			}
		}
	}
}

function SpecificChargeReset() {
	if(ftlBookingScreenConfig.cargoTypeSelectionWiseShowCharges) {
		var freight	= Number($("#charge1").val());

		for(var j = 0; j < charges.length; j++) {
			$("#charge" + charges[j].chargeTypeMasterId).val(0);
		}

		$("#charges input:text").val("0");

		$("#charge1").val(freight);

		if(typeof calcTotal != 'undefined')
			calcTotal();
		
		diffAmtAfterRoundOff = 0;
		$('#tdsAmount').val(0);
		$('#tdsPercent').val(0);
	}
}

function checkForNewParty(objId) {
	var zerosReg = /[1-9]/g;
	
	var newPartyAutoSave = ftlBookingScreenConfig.NewPartyAutoSave;
	
	var consignorParty = 0;
	
	if($('#wayBillType').val() == WayBillType.WAYBILL_TYPE_CREDIT)
		consignorParty = $('#consignorCorpId').val();
	else
		consignorParty = $('#partyMasterId').val();
	
	var obj 	= document.getElementById(objId);
	
	if(ftlBookingScreenConfig.updatePartyGstNumber) {
		if(obj.id == 'consignorName' && obj.value.length > 0 && !(obj.value.toLowerCase() == '')) {
			
			if(consignorParty > 0) {
				if(($('#prevConsignorGstn').val() == '' && $('#consignorGstn').val() != '') || (ftlBookingScreenConfig.checkGSTNumberForUnique && $('#prevConsignorGstn').val() != $('#consignorGstn').val())) {
					updatePartyGstNumber(CorporateAccount.CORPORATEACCOUNT_TYPE_BOOKING);
				}
			}
		} else if(Number($('#consigneePartyMasterId').val()) > 0) {
			if(($('#prevConsigneeGstn').val() == '' && $('#consigneeGstn').val() != '') || configuration.checkGSTNumberForUnique) {
				updatePartyGstNumber(CorporateAccount.CORPORATEACCOUNT_TYPE_DELIVERY);
			}
		}
	}
	
	if(newPartyAutoSave) {
		var valObj 	= obj.value;
		
		document.getElementById(objId).value = valObj.replace(stringNew, ''); //stringNew defined in VariableForCreateWayBill.js
		
		if(obj.id == 'consignorName' && obj.value.length > 0 && !(obj.value.toLowerCase() == '')) {
			if(consignorParty <= 0) {
				showAddNewPartyDailog(CorporateAccount.CORPORATEACCOUNT_TYPE_BOOKING);
			} else if(consignorParty > 0) {
				if(ftlBookingScreenConfig.updatePartyContact && $('#prevConsignorPhn').val() != $('#consignorPhn').val()
					&& ($('#consignorPhn').val() != '')  && zerosReg.test($('#consignorPhn').val()))
						updatePartyContactDetail(CorporateAccount.CORPORATEACCOUNT_TYPE_BOOKING);
			} else
				return false;
		} else {
			if(Number($('#consigneePartyMasterId').val()) <= 0) {
				if(obj.id == 'consigneeName' && obj.value.length > 0 && !(obj.value.toLowerCase() == ''))
					showAddNewPartyDailog(CorporateAccount.CORPORATEACCOUNT_TYPE_DELIVERY);
			} else if(Number($('#consigneePartyMasterId').val()) > 0) {
				if(ftlBookingScreenConfig.updatePartyContact && $('#prevConsigneePhn').val() != $('#consigneePhn').val()
					&& ($('#consigneePhn').val() != '') && zerosReg.test($('#consigneePhn').val()))
						updatePartyContactDetail(CorporateAccount.CORPORATEACCOUNT_TYPE_DELIVERY);
			} else
				return false;
		}
	}
	
	return false;
}

function showAddNewPartyDailog(partyType) {
	resetAddNewPartyElements();
	document.getElementById('newPartyType').selectedIndex = partyType;

	var newPartyName 			= '';
	var newPartyMobileNumber 	= '';

	if(partyType == CorporateAccount.CORPORATEACCOUNT_TYPE_BOOKING) {
		if(!validateConsignorMobile()) {
			$('#consignorPhn').val('');
			return false;
		}

		if (!validateLengthOfConsignorMobileNumber())
			return false;

		if (!validateLengthOfConsinorGSTNumber())
			return false;

		newPartyName			= $('#consignorName').val();
		newPartyMobileNumber	= $('#consignorPhn').val();

		if(newPartyName.length > 0 && (newPartyName.toLowerCase()!= '')) {
			$('#newPartyName').val(newPartyName.replace(stringNew, '')); //stringNew defined in VariableForCreateWayBill.js

			if(newPartyMobileNumber.length > 0 && (newPartyMobileNumber.toLowerCase() != ''))
				$('#newPartyMobileNumber').val(newPartyMobileNumber);
			else
				$('#newPartyMobileNumber').val('0000000000');
		}

		if($('#consignoCorprGstn').exists() && $('#consignoCorprGstn').is(":visible"))
			$('#newPartyGstNumber').val($('#consignoCorprGstn').val());
		else
			$('#newPartyGstNumber').val($('#consignorGstn').val());

		$('#newPartyPincode').val($('#consignorPin').val());
	} else {
		if(partyType == CorporateAccount.CORPORATEACCOUNT_TYPE_DELIVERY) {
			if(!validateConsigneeMobile()) {
				$('#consigneePhn').val('');
				return false;
			}

			if (!validateLengthOfConsigneeMobileNumber())
				return false;

			if (!validateLengthOfConsineeGSTNumber())
				return false;

			newPartyName 			= $('#consigneeName').val();
			newPartyMobileNumber 	= $('#consigneePhn').val();

			if(newPartyName.length > 0 && (newPartyName.toLowerCase() != '')) {
				$('#newPartyName').val(newPartyName.replace(stringNew, ''));  //stringNew defined in VariableForCreateWayBill.js
				$('#tinNo').val($('#consigneeTin').val());

				if(newPartyMobileNumber.length > 0 && (newPartyMobileNumber.toLowerCase() != ''))
					$('#newPartyMobileNumber').val(newPartyMobileNumber);
				else
					$('#newPartyMobileNumber').val('0000000000');
			}
			
			if($('#consigneeCorpGstn').exists() && $('#consigneeCorpGstn').is(":visible"))
				$('#newPartyGstNumber').val($('#consigneeCorpGstn').val());
			else
				$('#newPartyGstNumber').val($('#consigneeGstn').val());
			
			$('#newPartyPincode').val($('#consigneePin').val());
		}

		//Comment By Chayan
		// If destination branch from other group then use executive subregion name in consignee address
	}

	if(partyType == CorporateAccount.CORPORATEACCOUNT_TYPE_BOOKING || partyType == CorporateAccount.CORPORATEACCOUNT_TYPE_DELIVERY) {
		if(ftlBookingScreenConfig.partyPanelType == '2') {
			if($('#newPartyMobileNumber').val() != '0000000000') {
				saveNewParty(partyType);
			}
		} else {
			saveNewParty(partyType);
		}
	}
}

function updatePartyContactDetail(partyType) {
	var partyMobileNumber 	= '';
	var partyId				= 0;
	
	if(partyType == CorporateAccount.CORPORATEACCOUNT_TYPE_BOOKING) {
		if (!validateInput(2, 'consignorPhn', 'consignorPhn', 'consignorPhn', validConsinorMobileErrMsg))
			return false;
		else if (!validateInput(5, 'consignorPhn', 'consignorPhn', 'consignorPhn', consinorMobileNumberLenErrMsg))
			return false;
		
		if($('#wayBillType').val() == WayBillType.WAYBILL_TYPE_CREDIT) {
			partyMobileNumber		= $('#consignorPhn').val();
			partyId 				= $('#consignorCorpId').val();
		} else {
			partyMobileNumber		= $('#consignorPhn').val();
			partyId 				= $('#partyMasterId').val();
		}
	} else if(partyType == CorporateAccount.CORPORATEACCOUNT_TYPE_DELIVERY) {
		if (!validateInput(2, 'consigneePhn', 'consigneePhn', 'consigneePhn', validConsineeMobileErrMsg))
			return false;
		else if (!validateInput(5, 'consigneePhn', 'consigneePhn', 'consigneePhn', consineeMobileNumberLenErrMsg))
			return false;
			
		partyMobileNumber 	= $('#consigneePhn').val();
		partyId 			= $('#consigneePartyMasterId').val();
	}
	
	var jsonObject				= new Object();
	
	jsonObject["partyMobileNumber"]	= partyMobileNumber;
	jsonObject["partyId"]			= partyId;
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/partyMasterWS/updatePartyContactDetail.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			console.log(data);
		}
	});
}

function resetAddNewPartyElements() {
	if(ftlBookingScreenConfig.NewPartyAutoSave) {
		$('#newPartyName').val('');
		$('#newPartyMobileNumber').val('');
		$('#newPartyAddress').val('');
		
		if ($('#tinNo').exists())
			$('#tinNo').val('')
		
		hideAllMessages();
		removeError('newPartyType');
		removeError('newPartyName');
		removeError('newPartyMobileNumber');
		removeError('newPartyAddress');
	}
}

function configurePartyInfo() {
	if (ftlBookingScreenConfig.NewPartyAutoSave)
		setNewPartyType();
}

function setNewPartyType() {
	removeOption('newPartyType', null);

	createOption('newPartyType', 0, '------ Select Type -----');

	createOption('newPartyType', CorporateAccount.CORPORATEACCOUNT_TYPE_BOOKING, 'Consignor');
	createOption('newPartyType', CorporateAccount.CORPORATEACCOUNT_TYPE_DELIVERY, 'Consignee');
	createOption('newPartyType', CorporateAccount.CORPORATEACCOUNT_TYPE_BOTH, 'Both');
}

function saveNewParty(partyType) {
	if($('#newPartyName').val() == 'No Record Found')
		return false;

	if (partyType == CorporateAccount.CORPORATEACCOUNT_TYPE_DELIVERY) {
		if (ftlBookingScreenConfig.DestinationAutocomplete) {
			if(!validateDestinationBranch()) {return false;}
		}
	}

	//var partyType = $('#newPartyType').val();
	var partyName = document.getElementById('newPartyName').value.toUpperCase();

	var partyMobileNumber 	= $('#newPartyMobileNumber').val();
	var partyAddress 		= $('#newPartyAddress').val();
	var partyBranchId 		= 0;

	if(partyType == CorporateAccount.CORPORATEACCOUNT_TYPE_BOOKING) {
		setNextEleFocusForConsinor();
		partyBranchId 	= getBranchIdForConsignorParty();
	} else if (partyType == CorporateAccount.CORPORATEACCOUNT_TYPE_DELIVERY) {
		setNextEleFocusForConsignee();

		if(executive.accountGroupId == destBranchAccountGroupId)
			partyBranchId	= getBranchIdForConsigneeParty();
		else
			partyBranchId 	= executive.branchId;
	}

	if(partyBranchId > 0) {
		var jsonObject					= new Object();

		jsonObject.partyType			= CorporateAccount.CORPORATEACCOUNT_TYPE_BOTH;
		jsonObject.partyName			= partyName;
		jsonObject.partyAddress			= partyAddress;
		jsonObject.partyMobileNumber	= partyMobileNumber;
		jsonObject.partyBranchId		= partyBranchId;
		jsonObject.gstn					= $('#newPartyGstNumber').val();
		jsonObject.panNumber			= $('#newPartyPanNo').val();
		jsonObject.pincode				= $('#newPartyPincode').val();

		var jsonStr = JSON.stringify(jsonObject);

		$.getJSON("CorporatePartySaveAjaxAction.do?pageId=9&eventId=17",
				{json:jsonStr}, function(data) {
					if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
						if(typeof data.errorDescription != 'undefined') {
							showMessage('error', data.errorDescription);
						}
					} else {
						var newPartyId = parseInt(data.partyid);

						if(newPartyId > 0) {
							if(partyType == CorporateAccount.CORPORATEACCOUNT_TYPE_BOOKING) {
								$('#consignorName').val(partyName);
								$('#consignorPhn').val(partyMobileNumber);
								$('#consignorAddress').val(partyAddress);
								$('#consignorPin').val($('#newPartyPincode').val());
								$('#consignorGstn').val(data.gstn);
								$('#consignoCorprGstn').val(data.gstn);

								if($('#wayBillType').val() != WayBillType.WAYBILL_TYPE_CREDIT) {
									$('#partyMasterId').val(newPartyId);
									//Called from Rate.js
									//AddRemoveRateTypeOptions(CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_ID, 'partyMasterId');
								} else {
									$('#consignorCorpId').val(newPartyId);
								}

								$('#partyOrCreditorId').val(newPartyId);
							} else {
								if(partyType == CorporateAccount.CORPORATEACCOUNT_TYPE_DELIVERY) {
									$('#consigneeName').val(partyName);
									$('#consigneePhn').val(partyMobileNumber);
									$('#consigneeAddress').val(partyAddress);
									$('#consigneeTin').val(tinNo);
									$('#consigneePin').val($('#newPartyPincode').val());
									$('#consigneeGstn').val(data.gstn);
									$('#consigneeCorpGstn').val(data.gstn);
									$('#consigneePartyMasterId').val(newPartyId);

									//Called from Rate.js
								}
							}

							//saveNewContactAndGstn();

						} else {
							alert('There was an error while saving, please try again !');
							return;
						}
					}
				});
	}
}

function resetAddNewPartyElements() {
	if(ftlBookingScreenConfig.NewPartyAutoSave) {
		$('#newPartyName').val('');
		$('#newPartyMobileNumber').val('');
		$('#newPartyAddress').val('');
		
		if ($('#tinNo').exists())
			$('#tinNo').val('')
		
		hideAllMessages();
		removeError('newPartyType');
		removeError('newPartyName');
		removeError('newPartyMobileNumber');
		removeError('newPartyAddress');
	}
}

function validateConsignorMobile() {
	if (ftlBookingScreenConfig.validateOnEveryFeild)
		return true;
	
	if (ftlBookingScreenConfig.ConsignorMobileNoValidate) {
		switch (ftlBookingScreenConfig.ConsignorMobileNumberValidationFlavor) {
		case '1':
			if($('#consignorPhn').exists() && $('#consignorPhn').is(":visible")){
				if (!validateInput(1, 'consignorPhn', 'consignorPhn', 'consignorError', consinorMobileNumberErrMsg))
					return false;
				else if (!validateLengthOfConsignorMobileNumber())
					return false;
			} else if($('#consignorCodePhn').exists() && $('#consignorCodePhn').is(":visible")){
				if (!validateInput(1, 'consignorCodePhn', 'consignorCodePhn', 'consignorError', consinorMobileNumberErrMsg))
					return false;
				else if (!validateLengthOfConsignorMobileNumber())
					return false;
			}
			break;
		case '2':
			if($('#consignorPhn').exists() && $('#consignorPhn').is(":visible")){
				if (!validateInput(1, 'consignorPhn', 'consignorPhn', 'consignorError', consinorMobileNumberErrMsg))
					return false;
				else if (!validateInput(2, 'consignorPhn', 'consignorPhn', 'consignorError', validConsinorMobileErrMsg))
					return false;
				else if (!validateLengthOfConsignorMobileNumber())
					return false;
			} else if($('#consignorCodePhn').exists() && $('#consignorCodePhn').is(":visible")) {
				if (!validateInput(1, 'consignorCodePhn', 'consignorCodePhn', 'consignorError', consinorMobileNumberErrMsg))
					return false;
				else if (!validateInput(2, 'consignorCodePhn', 'consignorCodePhn', 'consignorError', validConsinorMobileErrMsg))
					return false;
				else if (!validateLengthOfConsignorMobileNumber())
					return false;
			}
			
			break;
		default:
			break;
		}
	} else if(ftlBookingScreenConfig.partyPanelType == '2' && ftlBookingScreenConfig.ConsignorMobileNumberValidationFlavor == '0' && $('#consignorPhn').val() == '') {
		$('#consignorPhn').val('0000000000');
		return true;
	} else if (!validateLengthOfConsignorMobileNumber())
		return false;

	return true;
}

function validateConsigneeMobile() {
	if (ftlBookingScreenConfig.validateOnEveryFeild)
		return true;

	if (ftlBookingScreenConfig.ConsigneeMobileNoValidate) {
		switch (ftlBookingScreenConfig.ConsigneeMobileNumberValidationFlavor) {
		case '1':
			if (!validateInput(1, 'consigneePhn', 'consigneePhn', 'consigneePhn', consineeMobileNumberErrMsg))
				return false;
			else if (!validateLengthOfConsignorMobileNumber())
				return false;
			break;
		case '2':
			if (!validateInput(1, 'consigneePhn', 'consigneePhn', 'consigneePhn', consineeMobileNumberErrMsg))
				return false;
			else if (!validateInput(2, 'consigneePhn', 'consigneePhn', 'consigneePhn', validConsineeMobileErrMsg))
				return false;
			else if (!validateLengthOfConsigneeMobileNumber())
				return false;
			break;
		default:
			break;
		}
	} else if(ftlBookingScreenConfig.partyPanelType == '2' && ftlBookingScreenConfig.ConsigneeMobileNumberValidationFlavor == '0' && $('#consigneePhn').val() == '') {
		$('#consigneePhn').val('0000000000');
		return true;
	} else if(!validateLengthOfConsigneeMobileNumber())
		return false;
	
	return true;
}

function validateLengthOfConsignorMobileNumber() {
	if(!ftlBookingScreenConfig.landlineNoAllowedInMobileNoFeild) {
		if(ftlBookingScreenConfig.ConsignorMobileNoLengthValidate
			&& !validateInput(5, 'consignorPhn', 'consignorPhn', 'consignorPhn', consinorMobileNumberLenErrMsg))
				return false;
	} else if (!validateInput(7, 'consignorPhn', 'consignorPhn', 'consignorPhn', validConsignorPhoneOrMobileNumber))
		return false;
	
	return true;
}

function validateLengthOfConsigneeMobileNumber() {
	if(!ftlBookingScreenConfig.landlineNoAllowedInMobileNoFeild) {
		if(ftlBookingScreenConfig.ConsigneeMobileNoLengthValidate
			&& !validateInput(5, 'consigneePhn', 'consigneePhn', 'consigneePhn', consineeMobileNumberLenErrMsg))
				return false;
	} else if (!validateInput(7, 'consigneePhn', 'consigneePhn', 'consigneePhn', validConsigneePhoneOrMobileNumber))
		return false;
	
	return true;
}


function validateLengthOfConsinorGSTNumber() {
	if($('#consignoCorprGstn').exists() && $('#consignoCorprGstn').is(":visible")){
		if(!validateInputTextFeild(9, 'consignoCorprGstn', 'consignoCorprGstn', 'info', gstnErrMsg))
			return false;
	} else if(!validateInputTextFeild(9, 'consignorGstn', 'consignorGstn', 'info', gstnErrMsg))
		return false;

	return true;
}

function validateLengthOfConsineeGSTNumber() {
	if($('#consigneeCorpGstn').exists() && $('#consigneeCorpGstn').is(":visible")){
		if(!validateInputTextFeild(9, 'consigneeCorpGstn', 'consigneeCorpGstn', 'info', gstnErrMsg))
			return false;
	} else if(!validateInputTextFeild(9, 'consigneeGstn', 'consigneeGstn', 'info', gstnErrMsg))
		return false;
	
	return true;
}

function validateDestinationBranch() {
	if(ftlBookingScreenConfig.ShowCityAndDestinationBranch && !isManualWayBill){
		if(!validateInput(1, 'destinationIdEle_primary_key', 'destinationIdEle', 'basicError', properDestinationErrMsg))
			return false;
	} else if(!validateInput(1, 'destinationBranchId', 'destination', 'basicError', properDestinationErrMsg))
		return false;
		
	return true;
}

function validateNewPartyMobileNumber() {
	return !validateInput(1, 'newPartyMobileNumber', 'newPartyMobileNumber', 'addNewPartyErrorDiv', mobileNumberErrMsg);
}

function validateNewPartyName() {
	return !validateInput(1, 'newPartyName', 'newPartyName', 'addNewPartyErrorDiv', partyNameErrMsg);
}

function validateNewPartyType() {
	return !validateInput(1, 'newPartyType', 'newPartyType', 'addNewPartyErrorDiv', partyTypeErrMsg);
}

function setNextEleFocusForConsinor() {
	if(configuration.partyPanelType == '1')
		next	= 'consigneeName';
	else
		next	= 'consigneePhn';
}

function setNextEleFocusForConsignee() {
	if(configuration.SetFocusAfterAddConsigneePartyOnChargeType)
		next	= 'chargeType';
	else
		next	= 'quantity';
}

/*
 * This function is work to save Consignor party as source branch level or Destination Branch Level
 */
function getBranchIdForConsignorParty() {
	
	var partyBranchId	= 0;
	
	var ConsignorPartySaveBranchFlavor	= ftlBookingScreenConfig.ConsignorPartySaveBranchFlavor;
	
	switch (Number(ConsignorPartySaveBranchFlavor)) {
	case 1:		//Source Branch Flavor
		partyBranchId	= executive.branchId;
		break;
	case 2:		//Destination Branch Flavor
		partyBranchId	= $('#destinationBranchId').val();
		break;
	default:
		partyBranchId	= executive.branchId;
		break;
	}
	
	return partyBranchId;
}

function getBranchIdForConsigneeParty() {
	
	var partyBranchId	= 0;
	
	var ConsigneePartySaveBranchFlavor	= configuration.ConsigneePartySaveBranchFlavor;
	
	switch (Number(ConsigneePartySaveBranchFlavor)) {
	case 1:		//Source Branch Flavor
		partyBranchId	= executive.branchId;
		break;
	case 2:		//Destination Branch Flavor
		partyBranchId	= $('#destinationBranchId').val();
		break;
	default:
		partyBranchId	= executive.branchId;
		break;
	}
	
	return partyBranchId;
}

function getCorporateAccountId() { // Name change from isPartyExist() 
	var corporateAccountId1 = 0;
	
	if($('#wayBillType').val() == WayBillType.WAYBILL_TYPE_TO_PAY)
		corporateAccountId1	= $('#consigneePartyMasterId').val();
	else
		corporateAccountId1	= $('#partyMasterId').val();
	
	return corporateAccountId1;
}


function removeOption(Id,value) {
	if(value != null)
		$('#'+Id+' option[value='+value+']').remove();
	else
		$('#'+Id+' option[value]').remove();
}

function createOption(Id,key,value) {
	var newOption = $("<option />");
	$('#'+Id).append(newOption);
	newOption.attr('id',key);
	newOption.val(key);
	newOption.html(value);
}

function updatePartyGstNumber(partyType){
	var partyGstNumber 		= '';
	var partyId				= 0;
	
	if(partyType == CorporateAccount.CORPORATEACCOUNT_TYPE_BOOKING){
		if (!validateLengthOfConsinorGSTNumber())
			return false;
		
		if($('#wayBillType').val() == WayBillType.WAYBILL_TYPE_CREDIT) {
			partyGstNumber 			= $('#consignorGstn').val();
			partyId 				= $('#consignorCorpId').val();
		} else {
			partyGstNumber 			= $('#consignorGstn').val();
			partyId 				= $('#partyMasterId').val();
		}
	} else if(partyType == CorporateAccount.CORPORATEACCOUNT_TYPE_DELIVERY){
		partyGstNumber 		= $('#consigneeGstn').val();
		partyId 			= $('#consigneePartyMasterId').val();
	}
	
	var jsonObject				= new Object();
	
	jsonObject["gstNumber"]				= partyGstNumber;
	jsonObject["corporateAccountId"]	= partyId;
	
	if(ftlBookingScreenConfig.checkGSTNumberForUnique) {
		jsonObject["filter"]				= 2;
		$.ajax({
			type		: "POST",
			url			: WEB_SERVICE_URL+'/partyMasterWS/checkUniqueGstNumber.do',
			data		: jsonObject,
			dataType	: 'json',
			success: function(data) {
				if(data.error != undefined) {
					var errorMessage = data.error;
					showMessage('error', errorMessage);
				} else {
					$.ajax({
						type		: 	"POST",
						url			: 	WEB_SERVICE_URL + '/partyMasterWS/updatePartyGstNumber.do',
						data		:	jsonObject,
						dataType	: 	'json',
						success		: 	function(data) {
							console.log(data);
						}
					});
				}
			}
		});
	} else {
		$.ajax({
			type		: 	"POST",
			url			: 	WEB_SERVICE_URL + '/partyMasterWS/updatePartyGstNumber.do',
			data		:	jsonObject,
			dataType	: 	'json',
			success		: 	function(data) {
				console.log(data);
			}
		});
	}
}

function setInvoiceType() {
	removeOption('invoiceType',null);
	createOption('invoiceType',0, "Auto");
	createOption('invoiceType',1, 'Manual');
	$('#invoiceType').val(defaultAutoAndManualIds)
}

function setBillInvoiceValue(){
	var grandTotal = $('#grandTotal').val();
	$('#invoiceValue').val(grandTotal)
}

function setLRBookingType() {
	removeOption('lrBooking',null);
	createOption('lrBooking',0, "Auto");
	createOption('lrBooking',1, 'Manual');
	$('#lrBooking').val(defaultAutoAndManualIds);
	
	if(Number($('#lrBooking').val()) == 1)
		changeDisplayProperty('lrNumberPanel', 'inline');
	else
		changeDisplayProperty('lrNumberPanel', 'none');
}

function setLSType() {
	removeOption('lsType',null);
	createOption('lsType',0, "Auto");
	createOption('lsType',1, 'Manual');
	$('#lsType').val(defaultAutoAndManualIds)
}

function setLhpvType() {
	removeOption('lhpvType',null);
	createOption('lhpvType',0, "Auto");
	createOption('lhpvType',1, 'Manual');
	$('#lhpvType').val(defaultAutoAndManualIds)
}

function setServerDate(){
	$('#manualLRDate').val(lrMaxDate);
	$('#manualLSDate').val(lsMaxDate);
	$('#manualLHPVDate').val(lhpvMaxDate);
	$('#invoiceDate').val(invoiceMaxDate);
	$("#partyAdvDate").val(partyAdvMaxDate)
}

function showHideInvoiceDiv() {
	setTimeout(function() { 
		if(Number($("#lrType").val()) != WayBillTypeConstant.WAYBILL_TYPE_CREDIT)
			$("#checkCreateInvoiceDetails").hide();
		else
			$("#checkCreateInvoiceDetails").show();
	}, 200);
	
	$('#lrType').change(function() {
		if(Number($("#lrType").val()) != WayBillTypeConstant.WAYBILL_TYPE_CREDIT)
			$("#checkCreateInvoiceDetails").hide();
		else
			$("#checkCreateInvoiceDetails").show();
	});
}

function setMRType() {
	removeOption('mrType',null);
	createOption('mrType',0, "Auto");
	createOption('mrType',1, 'Manual');
	$('#mrType').val(defaultAutoAndManualIds)

}

function validateDeclaredValue(event) {
	if (ftlBookingScreenConfig.DeclaredValue && ftlBookingScreenConfig.DeclaredValueValidate && getKeyCode(event) == 13) {
		if(!validateInputTextFeild(1, 'declaredValue', 'declaredValue', 'error', declaredValueErrMsg))
			return false;
			
		return true;
	}
	
	return true;
}

function validateInvoiceNumber(event) {
	if (ftlBookingScreenConfig.InvoiceNo && ftlBookingScreenConfig.InvoiceNoValidate && getKeyCode(event) == 13) {
		if(!validateInputTextFeild(1, 'invoiceNo', 'invoiceNo', 'error', invoiceNumberErrMsg))
			return false;
			
		return true;
	}
	
	return true;
}

function validateActualWeight(event) {
	if (ftlBookingScreenConfig.ActualWght && ftlBookingScreenConfig.ActualWghtValidate && getKeyCode(event) == 13) {
		if(!validateInputTextFeild(1, 'actualWeight', 'actualWeight', 'error', actWeightErrMsg))
			return false;
			
		return true;
	}
	
	return true;
}

function validateChargedWeight(event) {
	if (ftlBookingScreenConfig.ChargedWght && ftlBookingScreenConfig.ChargedWghtValidate && getKeyCode(event) == 13) {
		if(!validateInputTextFeild(1, 'chargedWeight', 'chargedWeight', 'error', chargeWeightErrMsg))
			return false;
			
		return true;
	}
	
	return true;
}

function validateSingleEwaybillNumber() {
	if($('#singleEwaybillNo').val() != '' && $('#singleEwaybillNo').val().length > 0 && $('#singleEwaybillNo').val().length < 12) {
		showMessage('info', " Please Enter 12 Digit Ewaybill Number !");
		$('#singleEwaybillNo').val("");
		setTimeout(function(){
			$('#singleEwaybillNo').focus();
		},10);
		return;
	} else {
		var ewNumber = $('#singleEwaybillNo').val();

		if(ewNumber != '') {
			eWayBillNumberArray.push(ewNumber);
			checkBoxArray.push(ewNumber);
			validateEwayBillNumberByApi();
		}
	}
}
function isGSTNumberWiseBooking() {
	return GroupConfiguration.gstNumberWiseBooking == 'true' || GroupConfiguration.gstNumberWiseBooking == true;
}
function checkGSTNumberEntered(gstn) {
	return gstn != undefined && gstn != '' && gstn.length >= 15;
}
function gstNoValidation(elementID){
	var element 	= document.getElementById(elementID);
	var gstRegex	= /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
	var gstRegexn	= /^[0-9]{2}[A-Z]{4}[0-9]{5}[A-Z]{1}[1-9]{1}[A-Z]{2}$/; 
	var regex 		= new RegExp(gstRegex);
	var regexn		= new RegExp(gstRegexn);
		if (element.value != '' && element.value != null && element.value.length != 15) {
			showMessage('error', ' Please, Enter 15 digit GST Number !');
			changeTextFieldColor(elementID, '', '', 'red');
			element.focus();
			isValidationError	= true;
			return false;			
		} else if(element.value.length == 15 && !(regex.test(element.value.toUpperCase())) == true && !(regexn.test(element.value.toUpperCase())) == true) {
			showMessage('error', ' Please, Enter Valid GST Number !');
			changeTextFieldColor(elementID, '', '', 'red');
			element.focus();
			isValidationError = true;
			return false;
		} 
		  
	return true;			
}