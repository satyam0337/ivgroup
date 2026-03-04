var WayBillTypeConstant;
var LR_SEARCH_TYPE_ID				= 1;
var QR_CODE_USING_CONSIGNMENT		= 1;
var QR_CODE_USING_WAYBILL_NUMBER	= 2;
var ewaybillOperationFromTokenBooking = false;
var eWayBillNumberArray	= new Array();
var formTypeList    = new Array();
var checkBoxArray	= new Array();
var declareValue = 0;
var configuration;
var  accountGroupId = 0;
var isWayBillSaved = false;
var escapePressed = false;
var focusOnSaveAfterInvoice = false;
var focusOnActUalWghtAfterAdd = false;
var sourceBranchModel;
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
	,PROJECT_IVUIRESOURCES + '/resources/js/module/createWayBill/addMultipleEwayBills.js'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/createWayBill/WayBillValidations.js',
	'/ivcargo/js/shortcut.js'
	],function(JsonUtility, MessageUtility, UrlParameter, FilePath,Lingua, Language, AutoComplete, AutoCompleteWrapper,
			NodValidation,ElementFocusNavigation,Selectizewrapper,BootstrapModal,EwayBillValidation,viewEwaybill,Shortcut){
	'use strict';
	var jsonObject = new Object(), myNod,  _this = '', jsondata, executive, bookingCharges, taxes, showBillSelection = false,
		BookingChargeConstant, wayBillTypeList, bookingTypeList, chargeTypeList, GroupConfiguration, TokenGenerationWayBillConfig, SequenceGenerationConfig, displayChargesPanel = false,
		billSelectionList, ChargeTypeConstant, CustomerDetailsConstant, counterForDeleteConsignment = 0, idNum = 0, SequenceCounter = null, consignmentGoods, noOfArticlesAdded = 0, totalConsignmentQuantity = 0,chargeWeightConfig = null, increaseChargeWeight = 0,isDuplicateLR = false,formTypeList,FormTypeConstant,showEwaybillPopUpOnLoad = false,FormsWithSingleSlection = false,isTBBPartyInConsignorName = false,
		consigAddedtableRowsId = [],branchCodeWiseLrNumberManual = null,showBranchCodeWiseTokenLrSequence = false, showNextLRNumberWithBranchCode = false,vehicleTypeId = 0,newLrNumberManual='';
	return Marionette.LayoutView.extend({
		initialize : function(){
			_this = this;
			this.$el.html(this.template);
		},render : function(){
			let jsonObject = new Object();
			getJSON(jsonObject, WEB_SERVICE_URL + '/wayBillWS/loadTokenWaybillGeneration.do?', _this.renderElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		},renderElements : function(response){
			showLayer();
			var jsonObject 				= new Object();
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/template/tokenGenerateWayBill/"+response.TokenGenerationWayBillConfig.flavorType+".html",
					function() {
				baseHtml.resolve();
			});
			$("#addMutipleEwayBillNumberPanel").load( "/ivcargo/jsp/createWayBill/includes/EwayBillDetailsJSPannel.html", function() {
				addMutipleEwayBillNumber.resolve();
			});
			hideLayer();

			$.when.apply($, loadelement).done(function() {
				jsondata						= response;
				executive						= response.executive;
				bookingCharges					= response.bookingCharges;
				taxes							= response.taxes;
				BookingChargeConstant			= response.BookingChargeConstant;
				bookingTypeList					= response.bookingTypeList;
				TokenGenerationWayBillConfig	= response.TokenGenerationWayBillConfig;
				GroupConfiguration				= response.GroupConfiguration;
				SequenceGenerationConfig		= response.GroupConfiguration;
				displayChargesPanel				= TokenGenerationWayBillConfig.DisplayChargesPanel;
				showBillSelection				= response.SHOW_BILL_SELECTION;
				billSelectionList				= response.billSelectionList;
				chargeTypeList					= response.chargeTypeList;
				WayBillTypeConstant				= response.WayBillTypeConstant;
				wayBillTypeList					= response.wayBillTypeList;
				ChargeTypeConstant				= response.ChargeTypeConstant;
				CustomerDetailsConstant			= response.CustomerDetailsConstant;
				consignmentGoods				= response.ConsignmentGoods;
				configuration					= TokenGenerationWayBillConfig;
				formTypeList					= response.formTypeColl
				FormTypeConstant				= response.FormTypeConstant;
				accountGroupId					= executive.accountGroupId;
				showEwaybillPopUpOnLoad			= TokenGenerationWayBillConfig.showEwaybillPopUpOnLoad;
				FormsWithSingleSlection			= TokenGenerationWayBillConfig.FormsWithSingleSlection;
				focusOnSaveAfterInvoice			= TokenGenerationWayBillConfig.focusOnSaveAfterInvoice;
				focusOnActUalWghtAfterAdd		= TokenGenerationWayBillConfig.focusOnActUalWghtAfterAdd;
				sourceBranchModel				= response.sourceBranchModel;
				showBranchCodeWiseTokenLrSequence 	= SequenceGenerationConfig.showBranchCodeWiseTokenLrSequence;
				showNextLRNumberWithBranchCode	= TokenGenerationWayBillConfig.showNextLRNumberWithBranchCode;
				
				if(!showBillSelection){
					if(typeof showEwaybillPopUpOnLoad != 'undefined' && showEwaybillPopUpOnLoad!=undefined && showEwaybillPopUpOnLoad){
						addMultipleEwayBillNo();
					}
				}
				
				if(!TokenGenerationWayBillConfig.consignorDetailsField){
					_this.hindeConrField();
				}
				if(!TokenGenerationWayBillConfig.consignorDetailsField){
					_this.hindeConeeField();
				}

			    if(!TokenGenerationWayBillConfig.showEwayBillOptionOnPage){
                    _this.showEwayBillOptionOnPage();
                }
                if(!TokenGenerationWayBillConfig.showConsignorConsigneePanel){
                    _this.showConsignorConsigneePanel();
                }
                if(!TokenGenerationWayBillConfig.allowSoureceBranchAutocomplete){
                	_this.showSourceBranch();
                }
                if(TokenGenerationWayBillConfig.setLrNoFieldReadOnly){
                	$('#lrNumberManual').attr('readonly', true);
                }
				
				ewaybillOperationFromTokenBooking =  true;
				
				if(typeof GroupConfiguration.FormsWithSingleSlection !== 'undefined' && GroupConfiguration.FormsWithSingleSlection!=undefined && GroupConfiguration.FormsWithSingleSlection && formTypeList!= undefined && formTypeList.length > 0){
					_this.createOptionFormType(formTypeList);
				}
				
				if(typeof  FormsWithSingleSlection == 'undefined' || FormsWithSingleSlection == undefined || !FormsWithSingleSlection){
					$('#singleFormTypesDiv').hide();
					$('#eWayBillNumberDiv').hide();
				}
				if(TokenGenerationWayBillConfig.BookingType) {
					if(typeof bookingTypeList !== 'undefined') {
						bookingTypeList.forEach(function(booingType) {
							$('#bookingType').append("<option value='"+ booingType.bookingTypeId +"'>" + booingType.bookingTypeName + "</option>");
						});
					}
					
					if(!showBillSelection) {
						if(typeof wayBillTypeList !== 'undefined') {
							$('#lrType').focus();
						} else {
							$('#bookingType').focus();
						}
					}
				} else {
					$('#bookingTypeDiv').remove();
					
					if(!showBillSelection) {
						if(typeof wayBillTypeList !== 'undefined') {
								$("#lrType").focus();
								next="destination"
						} else {
							$('#destination').focus();
						}
					}
				}
				
				if (!TokenGenerationWayBillConfig.FrightuptoDestination) {
					$('#freightUptoBranchDiv').remove();
				}
				
				if(typeof wayBillTypeList !== 'undefined') {
					wayBillTypeList.forEach(function(wayBillType) {
						$('#lrType').append("<option value='"+ wayBillType.wayBillTypeId +"'>" + wayBillType.wayBillType + "</option>");
					});
				}
				
				if(typeof chargeTypeList !== 'undefined') {
					chargeTypeList.forEach(function(chargeType) {
						$('#chargeType').append("<option value='"+ chargeType.chargeTypeId +"'>" + chargeType.chargeTypeName + "</option>");
					});
					
					$("#chargeType").bind("change", function() {
						_this.resetArticleWithTable();
					});
					
					$('#chargeType').keyup(function(event) {
						if(event.keyCode != undefined && event.keyCode != 13 && event.keyCode != 27) {
							_this.resetArticleWithTable();
						}
					});
				}  else {
					$('#chargeTypeDiv').remove();
				}
				
				if (!TokenGenerationWayBillConfig.QtyAmt) {
					$('#artAmountDiv').remove();
				}
				
				if (!TokenGenerationWayBillConfig.ActualWght) {
					$('#actualWeightDiv').remove();
				}
				
				if (!TokenGenerationWayBillConfig.ChargedWght) {
					$('#chargeWeightDiv').remove();
				}
				
				if (!TokenGenerationWayBillConfig.PrivateMark) {
					$('#PrivateMarkDiv').remove();
				}
				if (!TokenGenerationWayBillConfig.InvoiceNo) {
					$('#InvoiceNoDiv').remove();
				}
				if (!TokenGenerationWayBillConfig.SaidToContain) {
					$('#saidToContain').remove();
					$('#saidToContainDiv').remove();
				}
				if(TokenGenerationWayBillConfig.DefaultFormType!=undefined){
					$('#singleFormTypes').val(TokenGenerationWayBillConfig.DefaultFormType);
				}
				if(TokenGenerationWayBillConfig.removeManualLrNumber){
					$('#lrNumberManual').remove();
					$('#lrNumberPanel').remove();
				}
				if(TokenGenerationWayBillConfig.showVehicleNumber){
					_this.setVehicleNumberAutoComplete();
					$("#vehicleNumber").bind("blur", function() {
						if(vehicleTypeId == 0)
							$('#vehicleNumber').val("");
					});
				}
				else
					$('#vehicleNumberDiv').remove();
				
				if(!displayChargesPanel) {
					$('#leftPanel').switchClass('col-sm-9', 'col-sm-12');
					$('#leftPanel').switchClass('col-lg-9', 'col-lg-12');
					$('#lrNumberPanel').switchClass('col-sm-6', 'col-sm-3');
					$('#rightPanel').remove();
				}
				
				_this.setDefaultValue();
				
				initialiseFocus();
				
				if(displayChargesPanel) {
					var container = $('#charges');
	
					bookingCharges.forEach(function(charges) {
						var tr = $('<tr>');
						tr.append('<td><b>' + charges['displayName'] + '</b></td>');
						
						if(charges['chargeTypeMasterId'] == BookingChargeConstant.FREIGHT) {
							tr.append('<td><input type="text" name="charge' + charges['chargeTypeMasterId'] + '" id="charge' + charges['chargeTypeMasterId'] + '" value="0" class="form-control text-right" data-tooltip = "' + charges['displayName'] + '" readonly="readonly"/></td>');
						} else {
							tr.append('<td><input type="text" name="charge' + charges['chargeTypeMasterId'] + '" id="charge' + charges['chargeTypeMasterId'] + '" value="0" class="form-control text-right" data-tooltip = "' + charges['displayName'] + '"/></td>');
						}
					  			
						container.append(tr);
					});
				
					var tr = $('<tr id="totalAmountPanel">');
					tr.append('<td><b>Total</b></td>');
					tr.append('<td><input type="text" name="totalAmt" id="totalAmt" value="0" readonly="readonly" class="form-control text-right" data-tooltip = "Total Amount"/></td>');
					
					container.append(tr);
				
					var tr = $('<tr id="discountPercentageRow">');
					tr.append('<td><b>% Discount</b></td>');
					tr.append('<td><input type="text" name="discountPercentage" id="discountPercentage" value="0" class="form-control text-right"' 
								 + "data-tooltip = 'Discount Percentage'  maxlength='5'"
								 + "onfocus='if(this.value==0)this.value=''"
								 + "onkeyup='clearIfNotNumeric(this,0);calcDiscountOnPercentage();calcGrandtotal();'"
								 + "onblur='clearIfNotNumeric(this,0);'/></td>");
					
					container.append(tr);
				
					var tr = $('<tr id="discountRow">');
					tr.append('<td><b>Discount</b></td>');
					tr.append('<td><input id="discount" name="discount" value=0 type="text" maxlength="10" data-tooltip = "Discount"'
								+ "class='form-control text-right' autocomplete='off'"
								+ "onfocus='if(this.value=='0')this.value='';"
								+ "onkeypress='return isValidDiscount(event,this);if(getKeyCode(event) == 17){return false;}'"
								+ "onkeyup='checkAndUpdateDiscountOnPercentage();calcGrandtotal();return isValidForPercent(event,this);'"
								+ "onblur='if(this.value=='')this.value='0';calcGrandtotal();setFocusForDiscount(this,'remark');' />"
								+ "<br><span id='isDiscountPercentDiv'><input onclick='calcGrandtotal();' name='isDiscountPercent' id='isDiscountPercent' type='checkbox' data-tooltip = 'Discount %'"
								+ "onfocus='' />Disc in %</div></td>");
					
					container.append(tr);
				
					var tr = $('<tr id="rowdiscountTypes">');
					tr.append('<td><b>Discount Type</b></td>');
					tr.append('<td><select id="discountTypes" name="discountTypes" class="form-control text-right" data-tooltip = "Discount Type"'
								+ 'onclick="hideAllMessages();"></select></td>');
				
					container.append(tr);
					
					var tr = $('<tr id="commissionPanel">');
					tr.append('<td><b>Commission</b></td>');
					tr.append('<td><input id="agentcommission" name="agentcommission" value=0 type="text" maxlength="10"'
							 + 'class="form-control text-right" autocomplete="off" data-tooltip = "Agent Commission"'
							 + "onkeypress='if(getKeyCode(event) == 17){return false;}'"
							 + 'onblur="checkCommission();calcGrandtotal();" /></td>');
					
					container.append(tr);
				
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
				
					var tr = $('<tr id="grandTotalPanel">');
					tr.append('<td><b>Grand Total</b></td>');
					tr.append('<td><input type="text" name="grandTotal" id="grandTotal" value="0" readonly="readonly" class="form-control text-right" data-tooltip = "Grand Amount"/></td>');
					
					container.append(tr);
					
					var tr = $('<tr id="receivedAmountlPanel">');
					tr.append('<td><b>Received Amount</b></td>');
					tr.append('<td><input type="text" name="receivedAmount" id="receivedAmount" value="0" readonly="readonly" class="form-control text-right" data-tooltip = "Received Amount"/></td>');
					
					container.append(tr);
					
					var tr = $('<tr id="balanceAmountPanel">');
					tr.append('<td><b>Balance Amount</b></td>');
					tr.append('<td><input type="text" name="balanceAmount" id="balanceAmount" value="0" readonly="readonly" class="form-control text-right" data-tooltip = "Balance Amount"/></td>');
					
					container.append(tr);
					
					var tr = $('<tr id="isTdsRequired">');
					tr.append('<td><b>TDS Amount</b></td>');
					tr.append('<td><input type="text" name="tdsAmount" id="tdsAmount" value="0" disabled="disabled" class="form-control text-right" data-tooltip = "TDS Amount"'
							+ 'onkeypress="validAmount(event);return noNumbers(event);"/>'
							+ '<input type="hidden" id="tdsOnAmount" name="tdsOnAmount" value="0" /></td>');
					
					container.append(tr);
					
					var tr = $('<tr id="tdspercentcol">');
					tr.append('<td><b>TDS %</b></td>');
					tr.append('<td><select id="tdsPercent" class="form-control text-right" data-tooltip = "TDS %" onkeyup="calTDSAmount(this.id);" onchange="calTDSAmount(this.id);"></select></td>');
					
					container.append(tr);
				}
			
				if(TokenGenerationWayBillConfig.allowSoureceBranchAutocomplete){
					$('#sourceBranchId').val(sourceBranchModel.branchId);
					$('#sourceBranch').val(sourceBranchModel.branchName+"("+sourceBranchModel.cityName+")");
					_this.setSourceBranchAutoComplete();
				}
				
				$("#destination").autocomplete({
				    source: function (request, response) {
				        $.getJSON(WEB_SERVICE_URL+'/autoCompleteWS/getDeliveryPointDestinationBranch.do?term=' + request.term + '&branchType=3&isOwnBranchRequired=true&isOwnBranchWithLocationsRequired=true', function (data) {
				            response($.map(data.branchModel, function (item) {
				                return {
				                    label			: item.branchDisplayName,
				                    value			: item.branchDisplayName,
				                    id				: item.branchId,
				                    cityId			: item.branchCityId,
				                    stateId			: item.branchAddressStateId,
				                    typeOfLocation	: item.branchTypeOfLocation,
				                    branchCode		: item.branchCode,
				                    subRegionId		: item.subRegionId,
				                    regionId		: item.regionId,
				                    pincode			: item.branchAddressPincode,
				                    accountGroupId	: item.accountGroupId
				                };
				            }));
				        });
				    }, select: function (e, u) {
				    	$('#branchId').val(u.item.id);
				    	$('#destinationBranchId').val(u.item.id);
				    	$('#destinationStateId').val(u.item.stateId);
				    	$('#destinationRegionId').val(u.item.regionId);
				    	$('#destinationSubRegionId').val(u.item.subRegionId);
				    	
				    	
						if (SequenceGenerationConfig.SourceDestinationWiseWayBillNumberGeneratorAllow || SequenceGenerationConfig.subRegionWiseSourceDestinationWiseSequence || showBranchCodeWiseTokenLrSequence) {
							if (SequenceGenerationConfig.TokenWiseAutoLrSequence)
				    			_this.getTokenWiseLrSequence(u.item.id);
				    		else
				    			_this.checkSourceDestinationWiseSequence(u.item.id);
						}
						
				    	if(TokenGenerationWayBillConfig.consigneeNameAutocomple)
				    		_this.setConsigneeAutoComplete(u.item.id);
						
						if(!TokenGenerationWayBillConfig.consignorDetailsField)
							_this.getChargeWeightToIncreaseByBranch();
				    },
				    minLength	: 2,
				    delay		: 20,
				    autoFocus	: true
				});
				
				if (TokenGenerationWayBillConfig.FrightuptoDestination) {
					$("#freightUptoBranch").autocomplete({
					    source: function (request, response) {
					        $.getJSON(WEB_SERVICE_URL+'/autoCompleteWS/getFreightUptoBranchAutocomplete.do?term=' + request.term + '&branchType=3&isOwnBranchRequired=true&isOwnBranchWithLocationsRequired=true', function (data) {
					            response($.map(data.branchModel, function (item) {
					                return {
					                    label				: item.branchDisplayName,
					                    value				: item.branchDisplayName,
					                    freightUptoBranchId	: item.branchId
					                };
					            }));
					        });
					    }, select: function (e, u) {
					    	$('#freightUptoBranchId').val(u.item.freightUptoBranchId);
					    },
					    minLength	: 2,
					    delay		: 20,
					    autoFocus	: true
					});
				}
				
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
				
				if(showBillSelection) {
					var billSelection = $('#billSelection').val();
					
					operationOnSelectTag('billSelection', 'removeAll', '', '');
					
					for(const element of billSelectionList) {
						operationOnSelectTag('billSelection', 'addNew', element.billSelectionName, element.billSelectionId);
					}
					
					if(billSelection != undefined) {
						$('#billSelection').val(billSelection);
					}
					
					_this.openBillSelectionPopup('myModalBill');
					
					$('#billSelection').focus();
					$('#billSelection').keypress(function(event) {
						if(event.keyCode != undefined && event.keyCode === 13) {
							if ($('#myModalBill').hasClass('ui-dialog-content')) {
								$('#myModalBill').dialog('close');
								if(showEwaybillPopUpOnLoad!=undefined && showEwaybillPopUpOnLoad){
									addMultipleEwayBillNo();
								}
							}
							
							if($('#billSelection').val() == BOOKING_WITH_BILL) {
								$('#billSelectionText').html(BOOKING_WITH_BILL_NAME);
								$('#billSelectionText').removeClass("withoutbill").addClass("withbill");
							} else if($('#billSelection').val() == BOOKING_WITHOUT_BILL) {
								$('#billSelectionText').html(BOOKING_WITHOUT_BILL_NAME);
								$('#billSelectionText').removeClass("withbill").addClass("withoutbill");
							}
							
							if(TokenGenerationWayBillConfig.BookingType) {
								next = "bookingType";
							} else {
								next = "lrType";
							}
						}
					});
				} else {
					$('#myModalBill').remove();
				}
				
				$("#lrType").bind("change", function() {
					_this.changeWayBillType(this.value);
				});
				
				$("#lrNumberManual").bind("change", function() {
//					var jsonObject	= new Object();
//					
//					jsonObject.lrNumberManual	= this.value;
//					getJSON(jsonObject, WEB_SERVICE_URL + '/wayBillWS/checkDuplicateLR.do?', _this.checkIfLRNumberExist, EXECUTE_WITH_ERROR);
					_this.checkDuplicateLrNumber(this.value);
					if(accountGroupId!=442){
						//_this.setFocusOnQuantityNew();
					}
				});
				
				_this.changeWayBillType(TokenGenerationWayBillConfig.DefaultWayBillTypeForManual);
				$('#wayBillType').val(TokenGenerationWayBillConfig.DefaultWayBillTypeForManual);
				
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
				
				$('#consignorGstn').keyup(function(event) {
					if(event.keyCode != undefined && event.keyCode != 13 && (event.keyCode === 27 || event.keyCode === 8 || event.keyCode === 46)) {
						_this.resetConsignor();
					}
				});
				
				$('#consigneeGstn').keyup(function(event) {
					if(event.keyCode != undefined && event.keyCode != 13 && (event.keyCode === 27 || event.keyCode === 8 || event.keyCode === 46)) {
						_this.resetConsignee();
					}
				});
				
				$('#chargeType').keyup(function(event) {
					if(event.keyCode != undefined && event.keyCode != 13 && event.keyCode != 27) {
						_this.resetArticleWithTable();
					}
				});
				
				$('#typeofPacking').keydown(function(event) {
					if(getKeyCode(event) == 13) {
						if(!validateInputTextFeild(1, 'typeofPacking', 'typeofPacking', 'error', articleTypeErrMsg)) {
							return false;
						}
					}
					
					return true;
				});
				$('#typeofPacking').keydown(function(event) {
					if(getKeyCode(event) == 13) {
						if(!validateInputTextFeild(1, 'typeofPackingId', 'typeofPackingId', 'error', articleTypeErrMsg)) {
							return false;
						}
					}
					
					return true;
				});
				
				if (TokenGenerationWayBillConfig.SaidToContain) {
					if(TokenGenerationWayBillConfig.SaidToContainValidate) {
						$('#saidToContain').keydown(function(event) {
							if(getKeyCode(event) == 13) {
								if(!validateInputTextFeild(1, 'saidToContain', 'saidToContain', 'error', saidToContaionErrMsg)) {
									return false;
								}
							}
							
							return true;
						});
					}

					if (TokenGenerationWayBillConfig.SaidToContainAutocomplete) {
						$('#saidToContain').keydown(function(event) {
							if(getKeyCode(event) == 13) {
								if(!validateInputTextFeild(1, 'consignmentGoodsId', 'saidToContain', 'error',  properSaidToContaionErrMsg)) {
									return false;
								}
							}
							
							return true;
						});
					}
				}
				
				$('#actualWeight').keydown(function(event) {
					if(getKeyCode(event) == 13) {
						if (!validateInputTextFeild(1, 'actualWeight', 'actualWeight', 'error', actWeightErrMsg)) {
							return false;
						}
					}
					
					return true;
				});
				
				if (TokenGenerationWayBillConfig.PrivateMarkValidate) {
					$('#privateMark').keydown(function(event) {
						if(getKeyCode(event) == 13) {
							if (!validateInputTextFeild(1, 'privateMark', 'privateMark', 'error', privateMarkErrMsg)) {
								return false;
							}
						}
						
						return true;
					});
				}
				if (TokenGenerationWayBillConfig.invoiceNumberValidate) {
					$('#invoiceNumber').keydown(function(event) {
						if(getKeyCode(event) == 13) {
							if (!validateInputTextFeild(1, 'invoiceNumber', 'invoiceNumber', 'error', invoiceNumberErrMsg)) {
								return false;
							}
						}
				
						return true;
					});
				}
				
				$("#consignorGstn").bind("blur", function() {
					if(this.value != '') {
						_this.getPartyDetails(this.value, CustomerDetailsConstant.CUSTOMER_TYPE_CONSIGNOR_ID);
					}
					
					if(chargeWeightConfig == null) {
						_this.getChargeWeightToIncreaseByBranch();
					}
				});
				$("#consigneeName").bind("blur", function() {
					if($('#destinationBranchId').val() == 0 && TokenGenerationWayBillConfig.consigneeNameAutocomple){
						showMessage('error', "Destination Branch not found !");
						$('#destination').focus();
						return false;
					}
					return true;
				});
				
				$("#consigneeGstn").bind("blur", function() {
					if(this.value != '') {
						_this.getPartyDetails(this.value, CustomerDetailsConstant.CUSTOMER_TYPE_CONSIGNEE_ID);
					}
					
					if(chargeWeightConfig == null) {
						_this.getChargeWeightToIncreaseByBranch();
					}
				});
				
				$('#consignorGstn').keydown(function(event) {
					if(getKeyCode(event) == 13) {
						if(!validateInputTextFeild(9, 'consignorGstn', 'consignorGstn', 'info', gstnErrMsg)) {
							return false;
						}
						
						return true;
					}
				});
				
				$('#consigneeGstn').keydown(function(event) {
					if(getKeyCode(event) == 13) {
						if(!validateInputTextFeild(9, 'consigneeGstn', 'consigneeGstn', 'info', gstnErrMsg)) {
							return false;
						}
						
						return true;
					}
				});
				if(TokenGenerationWayBillConfig.consignorNameAutocomplete)
					_this.setConsignorAutoComplete();
				
				if(TokenGenerationWayBillConfig.billingPartyNameAutocomplete)
					_this.setBillingPartyAutoComplete();
				
				$("#actualWeight").bind("keyup", function(event) {
					if(event.keyCode != undefined  && event.keyCode !== 27 && event.keyCode !== 13) {
						if(this.value != '') {
							$("#tempActualWeight").val(this.value);
								}
							}
					});
				
				$("#actualWeight").bind("blur", function() {
					if(this.value != '') {
						_this.calculateExtraWeightOnPackingQuantity();
						_this.calculateChargedWeight('actualWeight');
						_this.getChargeWeightToAppend();
					}
				});
				
				$('#chargedWeight').keypress(function(event) {
					if(event.keyCode != undefined && event.keyCode === 13) {
						_this.editChargedWeight(this);
						_this.getChargeWeightToAppend();
					}
				});
				
				_this.bindFocusOnAddButton();
				
				$('#add').keyup(function(event) {
					if(_this.validateAddArticle()) {
						_this.checkAndAddConsignment();
					}
					
					
				});
				
				$('#add').mouseup(function(event) {
					if(_this.validateAddArticle()) {
						_this.checkAndAddConsignment();
						_this.setDefaultSaidToContain();
					}
				});
				
				$('#save').mouseup(function(event) {
					_this.saveWayBill();
				}).keydown(function(event) {
					if(event.keyCode != undefined && event.keyCode === 13) {
						_this.saveWayBill();
					}
				});
				
				if(focusOnSaveAfterInvoice){
					$("#invoiceNumber").keyup(function (e){ _this.setFocusOnSaveBtn(this); });
				}
				if(focusOnActUalWghtAfterAdd){
					$("#add").keyup(function (e){ _this.setFocusOnInvoice(this); });
				}
				_this.callTokenBookingShortcut();
				if(showEwaybillPopUpOnLoad){
					_this.closeEwaybillPopup();
				}
			});
		}, changeWayBillType : function(lrTypeId) {
			if(lrTypeId == WayBillTypeConstant.WAYBILL_TYPE_PAID) {
				$("*[data-selector='lrType'").html(WayBillTypeConstant.WAYBILL_TYPE_NAME_PAID);
				$('#DisplayWayBillType').removeClass();
				$('#DisplayWayBillType').addClass('panel-primary');
				$('#wayBillType').val(WayBillTypeConstant.WAYBILL_TYPE_PAID);
				$('#lrType').val(WayBillTypeConstant.WAYBILL_TYPE_PAID);
				$('#BillingPartyDetailsConsignor').removeClass("hide").addClass("hide");
			} else if(lrTypeId == WayBillTypeConstant.WAYBILL_TYPE_TO_PAY) {
				$("*[data-selector='lrType'").html(WayBillTypeConstant.WAYBILL_TYPE_NAME_TOPAY);
				$('#DisplayWayBillType').removeClass();
				$('#DisplayWayBillType').addClass('panel-danger');
				$('#wayBillType').val(WayBillTypeConstant.WAYBILL_TYPE_TO_PAY);
				$('#lrType').val(WayBillTypeConstant.WAYBILL_TYPE_TO_PAY);
				$('#BillingPartyDetailsConsignor').removeClass("hide").addClass("hide");
			} else if(lrTypeId == WayBillTypeConstant.WAYBILL_TYPE_CREDIT) {
				$("*[data-selector='lrType'").html(WayBillTypeConstant.WAYBILL_TYPE_NAME_CREDITOR);
				$('#DisplayWayBillType').removeClass();
				$('#DisplayWayBillType').addClass('panel-info');
				$('#wayBillType').val(WayBillTypeConstant.WAYBILL_TYPE_CREDIT);
				$('#lrType').val(WayBillTypeConstant.WAYBILL_TYPE_CREDIT);
				$('#BillingPartyDetailsConsignor').removeClass('hide');
			} else if(lrTypeId == WayBillTypeConstant.WAYBILL_TYPE_FOC) {
				$("*[data-selector='lrType'").html(WayBillTypeConstant.WAYBILL_TYPE_NAME_FOC);
				$('#DisplayWayBillType').switchClass('panel-info', 'panel-success');
				$('#wayBillType').val(WayBillTypeConstant.WAYBILL_TYPE_FOC);
				$('#lrType').val(WayBillTypeConstant.WAYBILL_TYPE_FOC);
				$('#BillingPartyDetailsConsignor').removeClass("hide").addClass("hide");
			}
			
			if($('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY) {
				_this.resetArticleWithTable();
			}
		}, validateAddArticle : function() {
			if (TokenGenerationWayBillConfig.ChargeType) {
				if(!validateInputTextFeild(1, 'chargeType', 'chargeType', 'error',  chargeTypeErrMsg)) {
					return false;
				}
			}
			
			if (TokenGenerationWayBillConfig.Qty) {
				if(!validateInputTextFeild(1, 'quantity', 'quantity', 'error',  quantityErrMsg)) {
					return false;
				}
			}

			if (TokenGenerationWayBillConfig.ArticleType && $('#typeofPacking').exists()) {
				if(!validateInputTextFeild(1, 'typeofPacking', 'typeofPacking', 'error',  articleTypeErrMsg)) {
					return false;
				}
			}
			
			if(TokenGenerationWayBillConfig.ArticleType && $('#typeofPackingId').exists()) {
				if(!validateInputTextFeild(1, 'typeofPackingId', 'typeofPacking', 'error', articleTypeErrMsg)) {
					return false;
				}
			}

			if (TokenGenerationWayBillConfig.SaidToContain) {
				if(TokenGenerationWayBillConfig.SaidToContainValidate) {
					if(!validateInputTextFeild(1, 'saidToContain', 'saidToContain', 'error', saidToContaionErrMsg)) {
						return false;
					}
				}

				if (TokenGenerationWayBillConfig.SaidToContainAutocomplete) {
					if(!validateInputTextFeild(1, 'consignmentGoodsId', 'saidToContain', 'error',  properSaidToContaionErrMsg)) {
						return false;
					}
				}
			}
			
			return true;
		}, resetDestinationPointData : function() {
			$('#destinationBranchId').val(0);
			$('#destinationStateId').val("0");
			$('#typeOfLocation').val("0");
		}, resetFreightUptoBranch : function() {
			if (TokenGenerationWayBillConfig.FrightuptoDestination) {
				$('#freightUptoBranch').attr('disabled','disabled');
				$('#freightUptoBranch').val('');
				$('#freightUptoBranchId').val(0);
			}
		}, resetConsignor : function() {
			$('#consignorName').val("");
			$('#consignorPhn').val("");
			//$('#consignorGstn').val("");
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
			$('#consignorId').val("0");
		}, resetConsignee : function() {
			$('#consigneeName').val("");
			$('#consigneePhn').val("");
			//$('#consigneeGstn').val("");
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
			$('#consigneeId').val("0");
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
			totalConsignmentQuantity = 0;
			
			if($('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY) {
				$('#qtyAmount').removeAttr('disabled');
			} else {
				$('#qtyAmount').attr('disabled','disabled');
			}
		}, getTokenWiseLrSequence : function (branchId) {
			var jsonObject		= new Object();
			
			_this.getBillSelection(jsonObject);
			
			jsonObject.destinationBranchId	= branchId;
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/lrSequenceCounterWS/getTokenWiseLrSequence.do?', _this.setSequenceRange, EXECUTE_WITHOUT_ERROR);
		}, checkSourceDestinationWiseSequence : function(branchId) {
			var jsonObject					= new Object();
			
			_this.getBillSelection(jsonObject);
			
			jsonObject.destinationBranchId	= branchId;
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/lrSequenceCounterWS/checkSourceAndDestinationWiseWayBillNumber.do?', _this.setNextLRNumber, EXECUTE_WITHOUT_ERROR);
		}, setSequenceRange : function(response) {
			if(response.message != undefined) {
				hideLayer();
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				$("*[data-selector='lrnumber'").html('');
				$('#lrNumberManual').val(0);
				SequenceCounter	= null;
				return;
			}
			
			SequenceCounter		= response.SequenceCounter;
			branchCodeWiseLrNumberManual 			= response.branchCodeWiseLrNumberManual;
			var parts = branchCodeWiseLrNumberManual.split('/');
			var incrementedValue = parseInt(parts[1]) + 1;
			var newLrNumberManual = parts[0] + '/' + incrementedValue;
			
			if(showNextLRNumberWithBranchCode)				
				$("*[data-selector='lrnumber'").html(' ( ' + newLrNumberManual + 	' ) ');
			else	
				$("*[data-selector='lrnumber'").html(' ( ' + SequenceCounter.minRange + ' - ' + SequenceCounter.maxRange + ' ) ');
			
			let jsonObject	= new Object();
			
			if(jsondata.showNextLRNumber) {
				if(Number(SequenceCounter.nextVal) > 0) {
					if(showBranchCodeWiseTokenLrSequence)
						_this.checkDuplicateLrNumber(branchCodeWiseLrNumberManual);
					else 
						_this.checkDuplicateLrNumber(SequenceCounter.nextVal);
					//getJSON(jsonObject, WEB_SERVICE_URL + '/wayBillWS/checkDuplicateLR.do?', _this.checkDuplicateLR, EXECUTE_WITH_ERROR);
				}
			}
		}, checkDuplicateLR : function(response) {
			if(SequenceCounter != null) {
				if(response.isDuplicateLR) {
					if(showBranchCodeWiseTokenLrSequence)
                        $('#lrNumberManual').val(newLrNumberManual);
                    else
						$('#lrNumberManual').val(Number(SequenceCounter.nextVal) + 1);
				} else if(jsondata.showNextLrNumberInitialDigits && (SequenceCounter.nextVal).toString().length > 4) {
					$('#lrNumberManual').val((SequenceCounter.nextVal).toString().substr(0, 4));
					$('#consignorName').focus();
				} else {
					if(showBranchCodeWiseTokenLrSequence)
						$('#lrNumberManual').val(branchCodeWiseLrNumberManual);
					else
						$('#lrNumberManual').val(SequenceCounter.nextVal);
						
					$('#consignorName').focus();
				}
			}
		}, setNextLRNumber : function(response) {
			if(response.message != undefined) {
				hideLayer();
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				$("*[data-selector='lrnumber'").html('');
				return;
			}
			
			var nextWayBillNumber			= response.NextWaybillNumber;
			var nextWaybillNumberBranchCode	= response.NextWaybillNumberBranchCode;

			if(SequenceGenerationConfig.branchCodeWiseWayBillNumberGeneration) {
				$("*[data-selector='lrnumber'").html(' Next LR No : '+ nextWaybillNumberBranchCode + '/' + (Number(nextWayBillNumber) + Number(1)));
			} else {
				$("*[data-selector='lrnumber'").html(' Next LR No : '+ Number(nextWayBillNumber + 1));
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
		}, getPartyDetails : function(gstNumber, partyType) {
			var jsonObject		= new Object();
			
			jsonObject["gstn"]					= gstNumber;

			if(partyType == CustomerDetailsConstant.CUSTOMER_TYPE_CONSIGNOR_ID) {
				jsonObject["PartyType"]				= CustomerDetailsConstant.CUSTOMER_TYPE_CONSIGNOR_ID;
			} else if(partyType == CustomerDetailsConstant.CUSTOMER_TYPE_CONSIGNEE_ID) {
				jsonObject["PartyType"]				= CustomerDetailsConstant.CUSTOMER_TYPE_CONSIGNEE_ID;
				jsonObject["destinationBranchId"]	= $('#destinationBranchId').val();
			}
			
			$.ajax({
				type		: "POST",
				url			: WEB_SERVICE_URL+'/partyMasterWS/getPartyDetailsByGstn.do',
				data		: jsonObject,
				dataType	: 'json',
				success: function(response) {
					if(response.message != undefined) {
						var errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						return;
					}
					
					var corporateAccount	= response.CorporateAccount;

					if(corporateAccount != null && typeof corporateAccount != 'undefined') {
						if(partyType == CustomerDetailsConstant.CUSTOMER_TYPE_CONSIGNOR_ID) {

							$('#partyMasterId').val(corporateAccount.corporateAccountId);
							$('#partyOrCreditorId').val(corporateAccount.corporateAccountId);
							$('#consignorCorpId').val(corporateAccount.corporateAccountId);
							$('#consignorName').val(corporateAccount.corporateAccountDisplayName);
							$('#consignorPhn').val(corporateAccount.corporateAccountMobileNumber);
							$('#consignorAddress').val(corporateAccount.corporateAccountAddress);

							if(corporateAccount.corporateAccountTBBParty && $('#wayBillType').val() == WayBillTypeConstant.WAYBILL_TYPE_CREDIT) {
								$('#billingPartyName').val(corporateAccount.corporateAccountDisplayName);
								$('#billingPartyId').val(corporateAccount.corporateAccountId);
								$('#billingPartyCreditorId').val(corporateAccount.corporateAccountId);
							}
						} else if(partyType == CustomerDetailsConstant.CUSTOMER_TYPE_CONSIGNEE_ID) {
							$('#consigneePartyMasterId').val(corporateAccount.corporateAccountId);
							$('#consigneeName').val(corporateAccount.corporateAccountDisplayName);
							$('#consigneePhn').val(corporateAccount.corporateAccountMobileNumber);
							$('#consigneeAddress').val(corporateAccount.corporateAccountAddress);
						}
						
						_this.getChargeWeightToIncrease(corporateAccount.corporateAccountId);
					}
				}
			});
		}, checkAndAddConsignment : function() {
			if($('#myTBody tr').length == 0 && $('#myTBody1 tr').length == 0) {
				_this.addConsignmentTableStructure();
			}
			
			if(_this.addConsignment() == false) {
				return false;
			}
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
			
			_this.resetArticleDetails();
			
			$(".delete").bind("click", function() {
				_this.deleteConsignments(this);
			});
			
			return response;
		}, addConsignmentRow : function(tableBodyId) {
			var zero 				= 0;
			var typeofPackingId		= $('#typeofPackingId').val();
			
			if($('#typeofPacking option:selected').text()) {
				var typeofPackingVal	= $('#typeofPacking option:selected').text();
			} else {
				var typeofPackingVal	= $('#typeofPacking').val();
			}
			
			var quantity				= $('#quantity').val();
			var consignmentGoodsId		= $('#consignmentGoodsId').val();
			var saidToContain			= '';
			
			if($('#saidToContain').exists()) 
				saidToContain			= $('#saidToContain').val();
			
			if($('#qtyAmount').exists()) {
				var qtyAmount			= $('#qtyAmount').val();
			} else {
				var qtyAmount			= 0;
			}

			var noOfArtToAdd			= GroupConfiguration.noOfConsignmentToAdd;

			if(noOfArticlesAdded >= noOfArtToAdd) {
				showMessage('info', noOfArtToAddInfoMsg(noOfArtToAdd));
				_this.resetArticleDetails();
				return false;
			}

			noOfArticlesAdded ++;
			idNum ++;
			consigAddedtableRowsId.push(idNum);

			totalConsignmentQuantity += parseInt(quantity);

			var NewRow 	= createRowInTable('', '', '');
			var one 	= createColumnInRow(NewRow, '', 'datatd', '5%', '', 'display : none', '');
			var two 	= createColumnInRow(NewRow, "quantity" + idNum, 'datatd', '5%', '', '', '');
			var three 	= createColumnInRow(NewRow, '', 'datatd', '13%', '', '', '');
			var four 	= createColumnInRow(NewRow, "typeofPackingId" + idNum, 'datatd', '13%', '', 'display : none', '');
			var five 	= createColumnInRow(NewRow, '', 'datatd', '12%', '', '', '');
			var six 	= createColumnInRow(NewRow, "qtyAmount" + idNum, 'datatd', '8%', '', '', '');
			var seven 	= createColumnInRow(NewRow, '', 'datatd', '7%', '', '', '');
			var eight 	= createColumnInRow(NewRow, '', 'datatd', '5%', '', '', '');
			var nine 	= createColumnInRow(NewRow, "consignmentGoodsId" + idNum, 'datatd', '5%', '', 'display : none', '');
			
			var copyStr		= escape(typeofPackingId+'_'+zero+'_'+zero+'_'+zero+'_'+zero+'_'+zero+'_'+qtyAmount+'_'+quantity+'_'+saidToContain+'_'+consignmentGoodsId+"_"+typeofPackingVal).replace(/\+/g,'%2b');
			var str 		= copyStr;
			
			appendValueInTableCol(one, "<input name='checkbox2' id='checkbox2' type=checkbox value='"+str+"'>");
			appendValueInTableCol(two, quantity);
			appendValueInTableCol(three, typeofPackingVal);
			appendValueInTableCol(four, typeofPackingId);
			appendValueInTableCol(five, saidToContain);
			appendValueInTableCol(six, qtyAmount);
			appendValueInTableCol(seven, parseFloat(qtyAmount * quantity));
			appendValueInTableCol(eight, "<button type='button' id='delete_" + idNum + "' class='btn btn-danger delete'>Delete</button>");
			appendValueInTableCol(nine, consignmentGoodsId);
			
			appendRowInTable(tableBodyId, NewRow);

			counterForDeleteConsignment++;
			_this.calculateTotalQty();
			_this.calculateExtraWeightOnPackingQuantity();
			
			if(noOfArticlesAdded == 1) {
				_this.getChargeWeightByPackingTypeAndParty(typeofPackingId);
			}
		}, calculateTotalQty : function() {
			$('#totalQty').html(_this.getTotalAddedArticleTableQuantity());
		}, getTotalAddedArticleTableQuantity : function() {
			var tableEl 		= document.getElementById("myTable");
			var tableEl1 		= document.getElementById("myTable1");
			var qtyTot 			= 0;
			var qtyTot1 		= 0;
			var qtyAmtTot		= 0;
			var totalLoading	= 0;
			var qtyAmtTot1		= 0;
			var typeofPackingId = 0;
			var TotalQty		= 0;
			
			if($('#typeofPackingId').val() > 0) {
				typeofPackingId		= $('#typeofPackingId').val();
			} else if($('#typeofPacking').val() > 0) {
				typeofPackingId		= $('#typeofPacking').val();
			}

			if(tableEl.rows.length > 1) {
				for(var i = 1; i < tableEl.rows.length; i++) {
					qtyTot += parseInt(tableEl.rows[i].cells[1].innerHTML);

					if(tableEl.rows[i].cells[6] != undefined) {
						qtyAmtTot += parseInt(tableEl.rows[i].cells[6].innerHTML);
					}
				}
			}

			if(tableEl1.rows.length > 1) {
				for(var i = 1; i < tableEl1.rows.length; i++) {
					qtyTot1 += parseInt(tableEl1.rows[i].cells[1].innerHTML);

					if(tableEl1.rows[i].cells[6] != undefined) {
						qtyAmtTot1 += parseInt(tableEl1.rows[i].cells[6].innerHTML);
					}
				}
			}

			TotalQty = parseInt(qtyTot) + parseInt(qtyTot1);
			return TotalQty;
		}, deleteConsignments : function(obj) {
			var tableEl 	= document.getElementById("myTable");
			var tableEl1 	= document.getElementById("myTable1");
			
			_this.deleteConsignmentTableRow(obj, tableEl);
			_this.deleteConsignmentTableRow(obj, tableEl1);
			
			var index		=obj.id.split('_')[1];
			
			for( var i = 0; i < consigAddedtableRowsId.length; i++){ 
				if ( consigAddedtableRowsId[i] === Number(index)) { 
					consigAddedtableRowsId.splice(i, 1); 
				}
			}
			

			_this.calculateTotalQty();

			next = "quantity";
			setTimeout(function(){ $('#quantity').focus(); }, 10);
			
			$('#chargedWeight').val(TokenGenerationWayBillConfig.MinChargedWeight);
			$('#actualWeight').val(TokenGenerationWayBillConfig.MinActualWeight);
			$('#tempActualWeight').val(TokenGenerationWayBillConfig.MinActualWeight);
			_this.calculateExtraWeightOnPackingQuantity();
			
			return true;
		}, deleteConsignmentTableRow : function(obj, tableElement) {
			var num 			= obj.id;
			var typeofPackingId = $("#typeofPackingId" + num.split('_')[1]).html();
			var quantity		= $("#quantity" + num.split('_')[1]).html();
			var articleTableId	= '';

			for(var row = tableElement.rows.length-1; row > 0; row--) {
				articleTableId	= tableElement.rows[row].cells[7].getElementsByTagName("button")[0].id;

				if(articleTableId == obj.id) {
					var el  = tableElement.rows[row];
					el.parentNode.removeChild(el);
					noOfArticlesAdded --;

					if(noOfArticlesAdded == 0) {
						$("#myTable").addClass('hide');
						$("#myTable1").addClass('hide');

						idNum 	= 0;
						consigAddedtableRowsId	= [];
					}
				}
			}
		}, calculateChargedWeight : function(id) {
			var actualWeight  		= parseFloat($('#' + id).val());
			var chargedWeight 		= parseFloat($('#chargedWeight').val());
			var minChrdWght 		= TokenGenerationWayBillConfig.MinChargedWeight;
			
			if(TokenGenerationWayBillConfig.roundOffChargeWeight) {
				$('#chargedWeight').val(Math.ceil(actualWeight / 5) * 5);
			} else {
				$('#chargedWeight').val(actualWeight);
			}
			
			if(Number(actualWeight) == 0) {		
				$('#actualWeight').val(actualWeight);
			} else if(Number(actualWeight) < Number(minChrdWght)) {
				$('#chargedWeight').val(minChrdWght);
			}
			
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
					
					if(data.chargeWeightConfig != undefined) {
						chargeWeightConfig		= data.chargeWeightConfig;
					}
					
					if(chargeWeightConfig == null) {
						_this.getChargeWeightToIncreaseByBranch();
					}
					
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
					
					if(data.chargeWeightConfig != undefined) {
						chargeWeightConfig		= data.chargeWeightConfig;
					}
					
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
				for(const element of chargeWeightConfig) {
					var chargeWeightConfiguration	= element;
					
					if(Number(chargeWeightConfiguration.corporateAccountId) == Number(corporateAccountId) || Number(chargeWeightConfiguration.corporateAccountId) 	== Number(0)
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
			let branches	= (TokenGenerationWayBillConfig.roundOffChargedWeightByTensForBranchs).split(",");
			
			if(TokenGenerationWayBillConfig.roundOffIncreasedChargedWeightValue) {
				if(TokenGenerationWayBillConfig.roundOffChargedWeightByTens) {
					if(isValueExistInArray(branches, branchId))
						$('#chargedWeight').val(Math.round(increasedValue / 10) * 10);
					else
						$('#chargedWeight').val(Math.ceil(increasedValue / 5) * 5);
				} 
			} else
				$('#chargedWeight').val(increasedValue);
		}, resetArticleDetails : function() {
			$('#quantity').val("0");
			$('#typeofPacking').val('');
			$('#consignmentStorageId').val("0");
			$('#consignmentAmount').val("0");
			$('#saidToContain').val("");
			$('#qtyAmount').val("0");
			$('#typeofPackingId').val("0");
			$('#consignmentGoodsId').val(0);

			_this.setDefaultSaidToContain();
		}, setDefaultSaidToContain : function() {
			if(consignmentGoods != undefined) {
				$('#saidToContain').val(consignmentGoods.name);
				$("#consignmentGoodsId").val(consignmentGoods.consignmentGoodsId);
			}
		}, bindFocusOnAddButton : function() {
			$("#add").keyup(function (e){
				_this.setFocusOnQuantityAfterAddArticle(this);
			});	
			$("#quantity").keyup(function (e){
				_this.setFocusOnQuantityAfterAddArticle(this);
			});
		}, setFocusOnQuantityAfterAddArticle : function(ele) {
			var quantity	= $('#quantity').val();

			if(ele.id == 'add') {
				next = "quantity"; 
			} else if(ele.id == 'quantity') {
				if(quantity > 0) {
					next = "typeofPacking"; 
				} else {
					if(noOfArticlesAdded > 0) {
						if (TokenGenerationWayBillConfig.ActualWght) {
							next = "actualWeight";
						} else if (TokenGenerationWayBillConfig.PrivateMark) {
							next = "privateMark";
						} else {
							next = "save";
						}
					} else {
						next = "typeofPacking";
						
						if(!validateInputTextFeild(1, 'quantity', 'quantity', 'error', quantityErrMsg)) {
							return false;
						}
						
						return true;
					}
				}
			}
		}, basicFormValidation : function() {
			if (!validateInputTextFeild(1, 'destination', 'destination', 'error', destinationErrMsg)) {
				return false;
			}
			
			if(TokenGenerationWayBillConfig.allowSoureceBranchAutocomplete && $('#sourceBranch').exists()){
				if(!validateInputTextFeild(1, 'sourceBranchId', 'sourceBranch', 'info', sourceBranchErrMsg)) {
					return false;
				}
			}
			
			if(!validateInputTextFeild(1, 'destinationBranchId', 'destination', 'info', properDestinationErrMsg)) {
				return false;
			}
			
			if(!TokenGenerationWayBillConfig.removeManualLrNumber){
				if(!validateInputTextFeild(1, 'lrNumberManual', 'lrNumberManual', 'error', lrNumberErrMsg)) {
					setTimeout(function(){ $('#lrNumberManual').focus(); }, 0);
					return false;
				}
			}
			if (!validateInputTextFeild(1, 'actualWeight', 'actualWeight', 'error', actWeightErrMsg)) {
				return false;
			}
			
			if (TokenGenerationWayBillConfig.PrivateMarkValidate) {
				if (!validateInputTextFeild(1, 'privateMark', 'privateMark', 'error', privateMarkErrMsg)) {
					return false;
				}
			}
			if (TokenGenerationWayBillConfig.invoiceNumberValidate) {
				if (!validateInputTextFeild(1, 'invoiceNumber', 'invoiceNumber', 'error', invoiceNumberErrMsg)) {
					return false;
				}
			}
			
			if(!_this.validateConsignmentTables()) {
				return false;
			}
			
			return true;
		}, validateConsignmentTables : function() {
			if($('#myTBody tr').length <= 1 && $('#myTBody1 tr').length <= 1) {
				showMessage('error', addConsignmentErrMsg);
				changeError1('quantity','0','0');
				return false;
			} else {
				removeError('quantity');
				hideAllMessages();
			}
			
			return true;
		}, saveWayBill : function() {
			if(!_this.basicFormValidation()) {
				return false;
			}
			
			if(isDuplicateLR) {
				showMessage('error', 'LR Number ' + $('#lrNumberManual').val() + ' already exist');
				$('#lrNumberManual').focus();
				return;
			}
			
			var jsonObject		= new Object();
			_this.setJsonDataforCreateWayBill(jsonObject);
			jsonObject.filter		= 2;
			
			jsonObject.isTokenWiseLR	= true;
			
			$("#save").addClass('hide');
			
			var btModalConfirm = new Backbone.BootstrapModal({
				content		: 	"Are you sure you want to Book This Token ?",
				modalWidth 	: 	30,
				title		:	'Book Token',
				okText		:	'YES',
				showFooter 	: 	true,
				okCloses	:	true
			}).open();

			btModalConfirm.on('ok', function() {
				var jsonStr = JSON.stringify(jsonObject);
				showLayer();
				
				$.getJSON("WayBillAjaxAction.do?pageId=3&eventId=13",
						{json:jsonStr}, function(data) {
							if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
								showMessage('error', iconForErrMsg + ' ' + data.errorDescription);
								hideLayer();
							} else {
								var printObj	= Object.assign(jsonObject, data.objectOut);
								
								_this.setQRDetails(printObj);
								_this.resetArticleWithTable();
								_this.resetAllData();
								_this.setRePrintOption(data, printObj);
								
								$("#save").removeClass('hide');
								if(showBillSelection) {
									_this.openBillSelectionPopup('myModalBill');
									
									$('#billSelection').focus();
								} else {
									$('#lrType').focus();
								}
								hideLayer();
							}
						});
			});
			
			btModalConfirm.on('cancel', function() {
				$("#save").removeClass('hide');
				$("#save").focus();
				hideLayer();
			});
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
			jsonObject.wayBillType			= Number($('#wayBillType').val());
			jsonObject.wayBillTypeId		= Number($('#wayBillType').val());
			jsonObject.wayBillTypeName		= $("*[data-selector='lrType'").html();
			jsonObject.bookingType			= Number($('#bookingType').val());
			
			if($('#lrNumberManual').val() != undefined)
				jsonObject.lrNumberManual		= $('#lrNumberManual').val().toUpperCase();
			
			jsonObject.destinationBranchId	= $('#destinationBranchId').val();
			jsonObject.chargeTypeId			= $('#chargeType').val();
			jsonObject.consignorCorpId		= $('#consignorCorpId').val();
			jsonObject.billingPartyId		= $('#billingPartyId').val();
			jsonObject.partyMasterId		= $('#partyMasterId').val();
			jsonObject.consignorName		= $('#consignorName').val();
			jsonObject.billingPartyName		= $('#billingPartyName').val();
			jsonObject.consignorAddress		= $('#consignorAddress').val();
			jsonObject.removeManualLrNumber	= TokenGenerationWayBillConfig.removeManualLrNumber;
			
			if ($('#consignorPhn').val() != "0000000000") {
				jsonObject.consignorPhn			= $('#consignorPhn').val();
			}
			
			
			if(jsonObject.chargeTypeId == undefined || jsonObject.chargeTypeId <=0){
				jsonObject.chargeTypeId	= 3;
			}
			
			jsonObject.consignorGstn			= $('#consignorGstn').val();
			jsonObject.consigneePartyMasterId	= $('#consigneePartyMasterId').val();
			jsonObject.consigneeName			= $('#consigneeName').val();
			jsonObject.consigneeAddress			= $('#consigneeAddress').val();
			
			if ($('#consigneePhn').val() != "0000000000") {
				jsonObject.consigneePhn			= $('#consigneePhn').val();
			}
			
			jsonObject.consigneeGstn		= $('#consigneeGstn').val();
			jsonObject.consignmentAmount	= $('#consignmentAmount').val();
			
			_this.getBillSelection(jsonObject);
			
			jsonObject.actualWeight			= $('#actualWeight').val();
			jsonObject.chargedWeight		= $('#chargedWeight').val();
			jsonObject.privateMark			= $('#privateMark').val();
			
			var checkboxarray	= "";

			$("input[name='checkbox2']").each( function () {
				checkboxarray	+= $(this).val() + "~";
			});

			jsonObject.checkbox2		= checkboxarray;
			
			if(TokenGenerationWayBillConfig.allowSoureceBranchAutocomplete){
				jsonObject.sourceBranchId	= $('#sourceBranchId').val();
				
				if(jsonObject.sourceBranchId == executive.branchId)
					jsonObject.isManual			= false;
				else
					jsonObject.isManual			= true;
			}else	
				jsonObject.sourceBranchId	= executive.branchId;
			
			if($('#invoiceNumber').exists())
				jsonObject.invoiceNumber   	= $('#invoiceNumber').val();

			jsonObject.declaredValue  	= declareValue;
			
			if($('#singleFormTypes').exists() && Number($('#singleFormTypes').val() == FormTypeConstant.E_WAYBILL_ID)) {
				jsonObject.FormTypes			= Number(getSeletedValueFromList('singleFormTypes'));
				jsonObject.formNumber			= checkBoxArray.join(',');
			}
			
			jsonObject.vehicleNumber	= $('#vehicleNumber').val();
		}, getBillSelection : function(jsonObject) {
			var billSelectionId		= $('#billSelection').val();
			
			if(billSelectionId == undefined) {
				billSelectionId		= Number(TokenGenerationWayBillConfig.defaultBillSelectionId);
			}

			jsonObject.billSelection 	= billSelectionId;
		}, resetAllData : function() {
			$('#destination').val('');
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
			$('#destination').val("");
			$('#privateMark').val('');
			$('#invoiceNumber').val('');
			$('#vehicleNumber').val("");
			
			if(TokenGenerationWayBillConfig.allowSoureceBranchAutocomplete){
				$('#sourceBranchId').val(sourceBranchModel.branchId);
				$('#sourceBranch').val(sourceBranchModel.branchName+"("+sourceBranchModel.cityName+")");
			}
			_this.setDefaultValue();
			_this.resetFreightUptoBranch();
			_this.setDefaultSaidToContain();
			isDuplicateLR	= false;
			formTypeList  = new Array();
			$('#invoiceNumber').val('');
			$('#singleFormTypes').val(0);
		}, setDefaultValue : function() {
			$('#chargedWeight').val(TokenGenerationWayBillConfig.MinChargedWeight);
			$('#actualWeight').val(TokenGenerationWayBillConfig.MinActualWeight);
			$('#tempActualWeight').val(TokenGenerationWayBillConfig.MinActualWeight);
			_this.changeWayBillType(TokenGenerationWayBillConfig.DefaultWayBillTypeForManual);
		}, setRePrintOption : function(data, printObj) {
			$('#bookedLRDetails').removeClass('hide');
			$('#prevlrnum').html('<a style="cursor:pointer;" id="lrDetails">' + data.wayBillNumber + '</a>');
			$('#prevwbtype').html(data.wayBillType);
			$('#prevdest').html(data.destinationBranchName);
			
			$("#lrDetails").bind("click", function() {
				_this.openWindowForView(data.waybillId, 0);
			});
			if(TokenGenerationWayBillConfig.removeQrCodeRePrintOption)
				$("#reprintQRCode").addClass('hide');
			
			$("#reprintQRCode").unbind("click");
			$("#reprintQRCode").bind("click", function() {
				_this.setQRDetails(printObj);
			});
		}, openWindowForView : function(id, branchId) {
			window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId=' + id + '&NumberType=' + LR_SEARCH_TYPE_ID + '&BranchId=' + branchId);
		}, setQRDetails	: function(responseOut) {
			var consigneeGSTN	 			= responseOut.consigneeGstn;
			var consignorGSTN 				= responseOut.consignorGstn;
			var isBranchAbbrevationCode		= responseOut.configuration.BranchAbbrevationCode;
			var isQrCodePrintBasedOnGSTN   	= responseOut.configuration.qrCodePrintBasedOnGSTN;//For Falcon
			var isPrintIvcargoLableInQRCodePrint = responseOut.configuration.isPrintIvcargoLableInQRCodePrint;
			var isPrintBranchNameInQRCodePrint	 = responseOut.configuration.isPrintBranchNameInQRCodePrint;
			var isPrintPrivateMarkaInQRCodePrint = responseOut.configuration.isPrintPrivateMarkaInQRCodePrint;	
			var showInvoiceNumberInQRCodePrint = responseOut.configuration.showInvoiceNumberInQRCodePrint;
			var printOneQRCodeExtra            = responseOut.configuration.printOneQRCodeExtra;
			var printQRCodeRange               = responseOut.configuration.printQRCodeRange;
			var accountGroupObj 	= responseOut.PrintHeaderModel;
            var invoiceNumberData   = "";
            var destinationBranchName       = "----";
            var chargeWeight       = responseOut.chargedWeight;
			var actualWeight       = responseOut.actualWeight;
            
            if(responseOut.wayBillDestinationBranchName != undefined)
				destinationBranchName = responseOut.wayBillDestinationBranchName;
			
            if(responseOut.invoiceNumber != undefined && responseOut.invoiceNumber.length > 0)
            	invoiceNumberData = responseOut.invoiceNumber;
            else
            	invoiceNumberData ="----";

			var dataObjectColl 				= new Object();
			dataObjectColl.waybillId 		= responseOut.wayBillId;
			dataObjectColl.lrType	 		= responseOut.wayBillTypeName;
			dataObjectColl.waybillNumber 	= responseOut.wayBillNumber;			
			dataObjectColl.numberOfPackages = responseOut.quantity;

			if(isPrintBranchNameInQRCodePrint == 'true') {
				dataObjectColl.destinationTo	= responseOut.wayBillDestinationBranchName;
				dataObjectColl.sourceFrom 		= responseOut.wayBillSourceBranchName;
			} else {
				dataObjectColl.destinationTo	= responseOut.wayBillDestinationCityName;
				dataObjectColl.sourceFrom 		= responseOut.wayBillSourceCityName;
			}

			if(isBranchAbbrevationCode == 'true' || isBranchAbbrevationCode == true) {
				dataObjectColl.destinationTo 	= responseOut.destBranchAbrvtinCode;
				dataObjectColl.sourceFrom 		= responseOut.srcBranchAbrvtinCode;
			}

			if(responseOut.privateMark != null && responseOut.privateMark != undefined) {
				if(responseOut.privateMark.length > 12)
					dataObjectColl.privateMark	= (responseOut.privateMark).substring(0,11);
				else
					dataObjectColl.privateMark	= responseOut.privateMark;
			} else
				dataObjectColl.privateMark	                = "";

			dataObjectColl.qrCodeSize 					= 12;
			dataObjectColl.bodyStyle 					= "white-space: nowrap;width:100%;font-size:45px;margin:0;padding:0;font-weight:20px;font-weight:bold;font-family:sans-serif;";

			var consignmentDetailsArr	= responseOut.consignmentMap;
			var flagErrorArr 		    = new Array();
			var flag                    = true;
			var Successflag             = true;
			var  totalArticleSize       = 0;

			var templateArray = new Array();
			var consignmentVal = 1;
			
			if(printOneQRCodeExtra != undefined && (printOneQRCodeExtra == 'true' || printOneQRCodeExtra == true)) {
				totalArticleSize = 0;
				
				for (var i = 0; i < consignmentDetailsArr.length; i++)
					totalArticleSize = totalArticleSize + consignmentDetailsArr[i].quantity;
				
				if(totalArticleSize > printQRCodeRange) {
					Successflag = false;
					flagErrorArr.push(Successflag);
				} else {
					Successflag		= true;
					flagErrorArr 	= new Array();
				}
			}
			
			for (var i = 0; i < consignmentDetailsArr.length; i++) {
				for (var j = 0; j < consignmentDetailsArr[i].quantity; j++) {
					var dataObject = new Object();
					_.map(dataObjectColl, function(val,key){
						dataObject[key] = val;
					})
			
					dataObject.currentPackage = consignmentVal++;
			
					if(Successflag && flagErrorArr.length<=0){
						if(isQrCodePrintBasedOnGSTN == 'true' || isQrCodePrintBasedOnGSTN == true) {
							if(consigneeGSTN == '' && consignorGSTN == '') {
								dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 1px;"><tr><td style="border-bottom: solid 1px; border-top:none; border-right: solid 1px; padding: 0px 10px 0px 10px;">LR No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObject.waybillNumber+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To City</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+responseOut.wayBillDestinationCityName+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To Branch</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+responseOut.wayBillDestinationBranchName+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Qty</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObject.currentPackage+' of '+dataObject.numberOfPackages+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">From</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObjectColl.sourceFrom+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Type</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObject.lrType+'</td></tr></table>')({dataObject : dataObject});
							} else {
								dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 1px;"><tr><td colspan="2" style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;text-align:center;">'+accountGroupObj.accountGroupName+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">LR No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObject.waybillNumber+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To City</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+responseOut.wayBillDestinationCityName+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To Branch</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+responseOut.wayBillDestinationBranchName+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Qty</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObject.currentPackage+' of '+dataObject.numberOfPackages+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">From</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObjectColl.sourceFrom+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Type</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObject.lrType+'</td></tr><tr style="width:25%; font-size: 20px;"><td></td><td style="text-align:right; padding: 0px 10px 0px 10px;">IVcargo</td></tr></table>')({dataObject : dataObject});
							}
						} else {
							if(isPrintIvcargoLableInQRCodePrint == 'true' || isPrintIvcargoLableInQRCodePrint == true) {
								if(showInvoiceNumberInQRCodePrint == 'true' || showInvoiceNumberInQRCodePrint == true) {
									var srsBranchName  = _this.getLimitedLengthofBranches(dataObjectColl.sourceFrom);
									var destBranchName = _this.getLimitedLengthofBranches(destinationBranchName);
									dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 1px;"><tr><td colspan="2" style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+accountGroupObj.accountGroupName+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">LR No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObject.waybillNumber+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+destBranchName+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Qty</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObject.currentPackage+' of '+dataObject.numberOfPackages+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">From</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+srsBranchName+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Actl/Chrg Wght</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+actualWeight+','+chargeWeight+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Invoice</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+invoiceNumberData+'</td></tr><tr><td></td><td style="text-align:right; padding: 0px 10px 0px 10px;">IVCARGO</td></tr></table>')({dataObject : dataObject});
								} else {
									dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 1px;"><tr><td colspan="2" style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+accountGroupObj.accountGroupName+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">LR No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObject.waybillNumber+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+destinationBranchName+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Qty</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObject.currentPackage+' of '+dataObject.numberOfPackages+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">From</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObjectColl.sourceFrom+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Type</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObject.lrType+'</td></tr><tr><td></td><td style="text-align:right; padding: 0px 10px 0px 10px;">IVCARGO</td></tr></table>')({dataObject : dataObject});
								}
							} else {
								if(isPrintPrivateMarkaInQRCodePrint == 'true'){
									dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 1px;"><tr><td colspan="2" style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+accountGroupObj.accountGroupName+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">LR No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObject.waybillNumber+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObjectColl.destinationTo+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Qty</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObject.currentPackage+' of '+dataObject.numberOfPackages+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">From</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObjectColl.sourceFrom+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Type</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObject.lrType+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Pvt Mark</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObjectColl.privateMark+'</td></tr></table>')({dataObject : dataObject});
								} else if(showInvoiceNumberInQRCodePrint == 'true' || showInvoiceNumberInQRCodePrint == true) {
									var srsBranchName  = _this.getLimitedLengthofBranches(dataObjectColl.sourceFrom);
									var destBranchName = _this.getLimitedLengthofBranches(responseOut.wayBillDestinationCityName);
									dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 1px;"><tr><td colspan="2" style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+accountGroupObj.accountGroupName+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">LR No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObject.waybillNumber+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+destBranchName+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Qty</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObject.currentPackage+' of '+dataObject.numberOfPackages+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">From</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+srsBranchName+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Type</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObject.lrType+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Invoice </td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+invoiceNumberData+'</td></table>')({dataObject : dataObject});
								} else {
									dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 1px;"><tr><td colspan="2" style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+accountGroupObj.accountGroupName+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">LR No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObject.waybillNumber+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObjectColl.destinationTo+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Qty</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObject.currentPackage+' of '+dataObject.numberOfPackages+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">From</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObjectColl.sourceFrom+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Type</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObject.lrType+'</td></tr></table>')({dataObject : dataObject});
								}
							}  
						}
					}
					dataObject.qrCodeString = dataObject.waybillId + "~"+ consignmentDetailsArr[i].consignmentDetailsId + "~" + QR_CODE_USING_CONSIGNMENT + "~" +j;
					templateArray.push(dataObject);
				}
			}
			if(Successflag && flagErrorArr.length<=0){
				var finalObj = new Object();
				finalObj.templateArray = templateArray;
				_this.printQRCodeData(finalObj);
			}
			if(printOneQRCodeExtra !=undefined && (printOneQRCodeExtra == 'true' || printOneQRCodeExtra == true)) {
				_this.setExtraQRCode(dataObject, accountGroupObj, dataObjectColl, isPrintIvcargoLableInQRCodePrint, invoiceNumberData, destinationBranchName, chargeWeight,actualWeight);
			}
		},
		
		setExtraQRCode: function(dataObject, accountGroupObj, dataObjectColl,isPrintIvcargoLableInQRCodePrint,invoiceNumberData,destinationBranchName,chargeWeight,actualWeight){
			var srsBranchName  = _this.getLimitedLengthofBranches(dataObjectColl.sourceFrom);
			var destBranchName = _this.getLimitedLengthofBranches(destinationBranchName);
			var templateArray = new Array();
			
			if(isPrintIvcargoLableInQRCodePrint == 'true' || isPrintIvcargoLableInQRCodePrint == true){
				dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 1px;"><tr><td colspan="2" style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+accountGroupObj.accountGroupName+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">LR No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObject.waybillNumber+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+destBranchName+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Total Qty</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObject.numberOfPackages+'**</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">From</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+srsBranchName+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Actl/Chrg Wght</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+actualWeight+','+chargeWeight+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Invoice </td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+invoiceNumberData+'</td></tr><tr><td></td><td style="text-align:right; padding: 0px 10px 0px 10px;">IVCARGO</td></tr></table>')({dataObject : dataObject});
			} else {
				dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 1px;"><tr><td colspan="2" style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+accountGroupObj.accountGroupName+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">LR No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObject.waybillNumber+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+destBranchName+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Total Qty</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObject.numberOfPackages+'**</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">From</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+srsBranchName+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Type</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObject.lrType+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Invoice </td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+invoiceNumberData+'</td></tr></table>')({dataObject : dataObject});
			}
			
			dataObject.qrCodeString = dataObject.waybillId+"~"+dataObject.waybillNumber+"~"+QR_CODE_USING_WAYBILL_NUMBER+"~"+0;
			templateArray.push(dataObject);
			var finalObj = new Object();
			finalObj.templateArray = templateArray;
			_this.printQRCodeData(finalObj);
		},
		
		printQRCodeData:function(finalObj){
			$.ajax({
				url : "http://127.0.0.1:60080/printQrCode",
				data : finalObj,
				success : function(result) {
				}
			});
		},
		createOptionFormType : function(formTypeList) {
			for(var i = 0; i < formTypeList.length; i++) {
					$('#singleFormTypes').append("<option value='"+ formTypeList[i].formTypeMasterId +"'>" + formTypeList[i].formTypeName + "</option>");
			}
			$('#eWayBillNumberDiv').show();
		},

		setFocusOnQuantityNew : function(){
			if($('#vehicleNumber').val() == "" || $('#vehicleNumber').val() == undefined)
				$('#vehicleNumber').focus();
			else if($('#consignorGstn').val() == "" || $('#consignorGstn').val() == undefined)
				$('#consignorGstn').focus();
			else if($('#consignorName').val() == "" || $('#consignorName').val() == undefined)
				$('#consignorName').focus();
			else if($('#consignorPhn').val() == "" || $('#consignorPhn').val() == undefined)
				$('#consignorPhn').focus();
			else if($('#consigneeGstn').val() == "" || $('#consigneeGstn').val() == undefined)
				$('#consigneeGstn').focus();
			else if($('#consigneeName').val() == "" || $('#consigneeName').val() == undefined)
				$('#consigneeName').focus();
			else if($('#consigneePhn').val() == "" || $('#consigneePhn').val() == undefined)
				$('#consigneePhn').focus();
			else
				$('#quantity').focus();
		},
		setFocusOnSaveBtn: function(ele){
			if(ele.id == 'invoiceNumber'){
				next = 'save';
			}
		},
		setFocusOnInvoice: function(ele){		
			if(ele.id == 'add'){
				next = 'actualWeight';
			}
		},
      callTokenBookingShortcut : function() {
			shortcut.add('Alt+s',function(){
				_this.saveWayBill();
		    });
		},
      closeEwaybillPopup : function(){
			$("#addEwayBillModal").on('keydown', function(e) {
				if (e.which == 27) {  
					$('#addEwayBillModal').modal('hide');
					$('#destination').focus();
					$("#addMutipleEwayBill").click(function() {
						escapePressed = true;
					});
					_this.setEscape(escapePressed);
				}
			});
		},
       setEscape(escapePressed){
			if(accountGroupId == 233){
				return;
			}
			if(accountGroupId == 442){
				if(escapePressed){
					prev = 'save';
				}else{
					prev = "destination";
				}
			} 
		},
       hindeConrField :function(){
			$('#consignorGstn').hide();
			$('#consignorName').hide();
			$('#consignorPhn').hide();
			$('#consignorAddress').hide();
		},
       hindeConeeField :function(){
			$('#consigneeGstn').hide();
			$('#consigneeName').hide();
			$('#consigneePhn').hide();
			$('#consigneeAddress').hide();
		},
		getLimitedLengthofBranches(branchName){
			var newbranchName = "";
			if(typeof branchName != 'undefined' && branchName!=undefined && branchName.length > 0){
				if(branchName.length > 10){
					newbranchName = branchName.substring(0, 10);
				}else{
					newbranchName = branchName;
				}
		
			}
			return newbranchName;
		},
		showEwayBillOptionOnPage :function(){
            $("#ewayBillOptionOnPage").addClass("displayNone");
        },
        showConsignorConsigneePanel :function(){
            $("#consignorConsigneePanel").addClass("displayNone");
           
      },showSourceBranch :function(){
          $("#sourceBranchDiv").addClass("displayNone");  
          
      },calculateExtraWeightOnPackingQuantity :function(){
    	  if(!TokenGenerationWayBillConfig.addExtraWhgtPackingTypeWise)
    		  return;
    	  
    	  var packingTypeArray = (TokenGenerationWayBillConfig.packingTypeIdsToAddExtraWeight).split(",");

    	  var totalQuantity	= 0;

    	  if(consigAddedtableRowsId.length > 0) {
    		  for(var i = 0; i < consigAddedtableRowsId.length; i++) {
    			  var packingTypeId = 0;
    				  packingTypeId 	= parseInt($('#typeofPackingId' + consigAddedtableRowsId[i]).html());
    			  if(isValueExistInArray(packingTypeArray, packingTypeId)) {
    				  totalQuantity 	+= parseInt($('#quantity' + consigAddedtableRowsId[i]).html());
    			  }
    		  }
    	  }
    	  
    	  var extraWeight	= totalQuantity * TokenGenerationWayBillConfig.extraWeightPerArticleWiseOnPackingType;
    	

    	  $('#actualWeight').val(Number($('#tempActualWeight').val()) + extraWeight);
    	  $('#chargedWeight').val($('#actualWeight').val());
    	  
      }, setConsignorAutoComplete : function() {
			$("#consignorName").autocomplete({
				source: "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18&partyType=1,3&customerType=1&responseFilter="+TokenGenerationWayBillConfig.BookingConsignorNameAutocompleteResponse+"&isBlackListPartyCheckingAllow="+TokenGenerationWayBillConfig.isBlackListPartyCheckingAllow+"&moduleFilterForBlackListPartyChecking=1",
				minLength: 2,
				delay: 250,
				autoFocus: true,
				select: function(e, u) {

					$('#consignorCorpId').val(u.item.id);
					$('#consignorId').val(u.item.id);
					$('#partyMasterId').val(u.item.id);

					let consignorId = u.item.id;
					
					if(consignorId > 0) {
						let jsonObject					= new Object();

						jsonObject.filter				= 2;
						jsonObject.getCharge			= 1;
						jsonObject.partyId				= consignorId;
						jsonObject.partyPanelType		= 1;
						jsonObject.partyType			= 3;

						let jsonStr = JSON.stringify(jsonObject);

						$.getJSON("Ajax.do?pageId=9&eventId=16",
								{json:jsonStr}, function(data) {
									if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
										showMessage('error', data.errorDescription);
									} else {
										if(!data.partyDetails) {
											return;
										}

										_this.setConsignorDetails(data.partyDetails);
									}
								});
					}
				},
			});
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
		}, setConsigneeAutoComplete : function(destinationBranchId) {
			$("#consigneeName").autocomplete({
				source: "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18&partyType=2,3&customerType=2&destinationId="+destinationBranchId+"&responseFilter="+TokenGenerationWayBillConfig.BookingConsigneeNameAutocompleteResponse,
				minLength: 3,
				delay: 20,
				autoFocus: true,
				select: function(e, u) {

					$('#consigneeCorpId').val(u.item.id);
					$('#consigneeId').val(u.item.id);
					$('#consigneePartyMasterId').val(u.item.id);

					let consigneeId = u.item.id;

					if(consigneeId > 0) {
						let jsonObject  = new Object();

						jsonObject.filter				= 2;
						jsonObject.getCharge			= 1;
						jsonObject.partyId				= consigneeId;
						jsonObject.partyPanelType		= 1;
						jsonObject.partyType			= 3;

						let jsonStr = JSON.stringify(jsonObject);

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

		}, setConsigneeDetails : function(partyDetails) {
			if(partyDetails != undefined) {
				$('#consigneePhn').val(partyDetails.mobileNumber);
				$('#consigneeGstn').val(partyDetails.gstn);
				$('#consigneeAddress').val(partyDetails.address);
			}
		}, setBillingPartyAutoComplete : function() {
			$("#billingPartyName").autocomplete({
				source: "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18&billing=4&customerType=1&responseFilter=2&showRateConfiguredSignInPartyName=true",
				minLength: 2,
				delay: 250,
				autoFocus: true,
				select: function(e, u) {

					$('#billingPartyId').val(u.item.id);
					$('#partyOrCreditorId').val(u.item.id);

					let tbbPartyId = u.item.id;

					if(tbbPartyId > 0) {
						let jsonObject  = new Object();

						jsonObject.filter				= 2;
						jsonObject.getCharge			= 1;
						jsonObject.partyId				= tbbPartyId;
						jsonObject.partyPanelType		= 1;
						jsonObject.partyType			= 3;

						let jsonStr = JSON.stringify(jsonObject);

						$.getJSON("Ajax.do?pageId=9&eventId=16",
								{json:jsonStr}, function(data) {
									if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
										showMessage('error', data.errorDescription);
									} else if(!data.partyDetails)
										return;
							});
					}
				},
			});
		}, setSourceBranchAutoComplete : function() {
			
			$("#sourceBranch").autocomplete({
			    source: function (request, response) {
			        $.getJSON(WEB_SERVICE_URL+'/autoCompleteWS/getSourceBranchAutocomplete.do?term=' + request.term + '&responseFilter=2', function (data) {
			            response($.map(data.branchModel, function (item) {
			                return {
			                    label			: item.branchDisplayName,
			                    value			: item.branchDisplayName,
			                    id				: item.branchId,
			                    cityId			: item.branchCityId,
			                    stateId			: item.branchAddressStateId,
			                    typeOfLocation	: item.branchTypeOfLocation,
			                    branchCode		: item.branchCode,
			                    subRegionId		: item.subRegionId,
			                    regionId		: item.regionId,
			                    pincode			: item.branchAddressPincode,
			                    accountGroupId	: item.accountGroupId
			                };
			            }));
			        });
			    }, select: function (e, u) {
			    	$('#sourceBranchId').val(u.item.id);
					
			    },
			    minLength	: 2,
			    delay		: 20,
			    autoFocus	: true
			});
		}, setVehicleNumberAutoComplete : function() {
			$("#vehicleNumber").autocomplete({
				source: "Ajax.do?pageId=9&eventId=13&filter=26",
				minLength: 2,
				delay: 10,
				autoFocus: true,
				select: function(event, ui) {
					if (ui.item.id != 0) {
						vehicleTypeId 		= ui.item.vehicleTypeId;
					}
				}
			});
		}, checkDuplicateLrNumber : function(lrNumber) {
			var jsonObject	= new Object();

			jsonObject.lrNumberManual	= lrNumber;
			getJSON(jsonObject, WEB_SERVICE_URL + '/wayBillWS/checkDuplicateLR.do?', _this.checkDuplicateLR, EXECUTE_WITH_ERROR);
		}
	});
});
