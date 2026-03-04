var WayBillTypeConstant;
var LR_SEARCH_TYPE_ID					= 1;
var QR_CODE_USING_CONSIGNMENT			= 1;
var QR_CODE_USING_WAYBILL_NUMBER		= 2;
var destinationBranchId					= 0;
var jsondata							= null;
var BookingChargeConstant				= null;
var isBookingDiscountAllow				= false;
var isBookingDiscountPercentageAllow	= false
var LRDate								= false;
var maxNoOfDaysAllowBeforeCashStmtEntry = 0;
var AllowPreviousDateForGroupAdminOnly 	= false;
var backDateAllowedInCurrentMonthOnly 	= false;
var localBookingScreenConfig		  	= null;
var ChargeTypeConstant					= null;
var doneTheStuff						= false;

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
	,'/ivcargo/resources/js/validation/regexvalidation.js',
	],function(JsonUtility, MessageUtility, UrlParameter, FilePath,Lingua, Language, AutoComplete, AutoCompleteWrapper,
			NodValidation,ElementFocusNavigation,Selectizewrapper,BootstrapModal){
	'use strict';
	var jsonObject = new Object(), myNod,  _this = '', executive, bookingCharges, taxes, showBillSelection = false,discountTypesList,
		wayBillTypeList, bookingTypeList, chargeTypeList, GroupConfiguration, displayChargesPanel = false,
		billSelectionList, ChargeTypeConstant, counterForDeleteConsignment = 0, idNum = 0, SequenceCounter = null, consignmentGoods, noOfArticlesAdded = 0, totalConsignmentQuantity = 0,chargeWeightConfig = null, increaseChargeWeight = 0,isDuplicateLR = false, isTBBPartyInConsignorName = false;
	return Marionette.LayoutView.extend({
		initialize : function(masterObj){
			_this = this;
			this.$el.html(this.template);
		},render : function(){
			var jsonObject = new Object();
			getJSON(jsonObject, WEB_SERVICE_URL + '/wayBillWS/loadLocalBookingScreen.do?', _this.renderElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		},renderElements : function(response){
			showLayer();
			var jsonObject 				= new Object();
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/template/localBookingScreen/localBookingScreen.html",
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
				localBookingScreenConfig			= response.localBookingScreenConfig;
				GroupConfiguration					= response.GroupConfiguration;
				displayChargesPanel					= localBookingScreenConfig.DisplayChargesPanel;
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
				LRDate								= localBookingScreenConfig.LRDate;
				maxNoOfDaysAllowBeforeCashStmtEntry	= response.maxNoOfDaysAllowBeforeCashStmtEntry;
				
				if(localBookingScreenConfig.BookingType) {
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
							setTimeout(function() {
								$('#lrType').focus();
							},200);
						} else {
							$('#destination').focus();
						}
					}
				}
				
				if (!localBookingScreenConfig.FrightuptoDestination) {
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
				
				if (!localBookingScreenConfig.QtyAmt) {
					$('#artAmountDiv').remove();
				}
				
				if (!localBookingScreenConfig.ActualWght) {
					$('#actualWeightDiv').remove();
				}
				
				if (!localBookingScreenConfig.ChargedWght) {
					$('#chargeWeightDiv').remove();
				}
				
				if (!localBookingScreenConfig.PrivateMark) {
					$('#PrivateMarkDiv').remove();
				}
				
				if (!localBookingScreenConfig.DeclaredValue) {
					$('#declaredValueDiv').remove();
				}
				
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
							tr.append('<td><input type="text" name="charge' + charges['chargeTypeMasterId'] + '" id="charge' + charges['chargeTypeMasterId'] + '" value="0" class="form-control text-right" data-tooltip = "' + charges['displayName'] + '" readonly="readonly" onkeypress="return allowNumbersOnly(event);" onkeyup="setFocusForBookingCharges(event);" onblur="getChargesTotal();calcGrandtotal();"/></td>');
						} else {
							tr.append('<td><input type="text" name="charge' + charges['chargeTypeMasterId'] + '" id="charge' + charges['chargeTypeMasterId'] + '" value="0" class="form-control text-right" data-tooltip = "' + charges['displayName'] + '" onfocus="setBlankAmount(this);" onkeypress="return allowNumbersOnly(event);" onkeyup="setFocusForBookingCharges(event);" onblur="getChargesTotal();calcGrandtotal();"/></td>');
						}
					  			
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
					
					if(!isBookingDiscountAllow) {
						$('#isDiscountPercentDiv').remove();
					}
					
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
					  			
						//container.append(tr);
					});
				
					var tr = $('<tr id="grandTotalPanel">');
					tr.append('<td><b>Grand Total</b></td>');
					tr.append('<td><input type="text" name="grandTotal" id="grandTotal" value="0" readonly="readonly" class="form-control text-right" data-tooltip = "Grand Amount"/></td>');
					
					container.append(tr);
				}
				
				$("#sourceBranch").autocomplete({
					source: "Ajax.do?pageId=9&eventId=13&filter=24&branchType=2&responseFilter="+localBookingScreenConfig.sourceBranchAutocompleteFlavour,
					minLength: 2,
					delay: 10,
					autoFocus: true,
					select: function(e, u) {
						if(u.item.id != 0) {
							var selectedSource = u.item.id;
							
							var srcData = new Array();
							srcData = selectedSource.split("_");
							
							console.log("srcData ", srcData)
							
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
				
				$("#destination").autocomplete({
					source: "DestinationBranchAutoCompleteForAjaxAction.do?pageId=9&eventId=27&branchType=2&isOwnBranchRequired="+localBookingScreenConfig.isOwnBranchRequired+"&isOwnBranchWithLocationsRequired="+localBookingScreenConfig.OwnBranchLocationsRequired+"&locationId="+executive.branchId+"&responseFilter="+localBookingScreenConfig.BookingDestinationutocompleteResponse+"&deliveryDestinationBy="+localBookingScreenConfig.DeliveryDestinationBy+"&branchNetworkConfiguration="+localBookingScreenConfig.BranchNetworkConfiguration,
					minLength: 2,
					delay: 10,
					autoFocus: true,
					select: function(e, u) {
						if(u.item.id != 0) {
							var destData = (u.item.id).split("_");
							
							console.log("destData ", destData)
							
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
				
				if (localBookingScreenConfig.FrightuptoDestination) {
					$("#freightUptoBranch").autocomplete({
						source: "Ajax.do?pageId=9&eventId=13&responseFilter="+localBookingScreenConfig.BookingFreightUptoBranchAutocompleteResponse,
						minLength: 2,
						delay: 10,
						autoFocus: true,
						select: function(event, ui) {
							if(ui.item.id != 0) {
								$('#freightUptoBranchId').val(ui.item.id.split("_")[0]);
							}
						},
					});
				}
				
				destinationBranchId = $('#destinationBranchId').val();
				
				$("#consignorName").autocomplete({
					source: "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18&partyType=1,3&customerType=1&responseFilter="+localBookingScreenConfig.BookingConsignorNameAutocompleteResponse+"&isBlackListPartyCheckingAllow="+localBookingScreenConfig.isBlackListPartyCheckingAllow+"&moduleFilterForBlackListPartyChecking=1",
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

											//_this.setTbbPartyDetails(party);
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
				
				if(showBillSelection) {
					var billSelection = $('#billSelection').val();
					
					operationOnSelectTag('billSelection', 'removeAll', '', '');
					
					for(const element of billSelectionList) {
						operationOnSelectTag('billSelection', 'addNew', element.billSelectionName, element.billSelectionId);
					}
					
					if(billSelection != undefined) {
						$('#billSelection').val(billSelection);
					}
					
					_this.openBillSelectionPopup('myModal');
					
					$('#billSelection').focus();
					
					$('#billSelection').keypress(function(event) {
						if(event.keyCode != undefined && event.keyCode === 13) {
							$('#myModal').dialog('close');
							
							if($('#billSelection').val() == BOOKING_WITH_BILL) {
								$('#billSelectionText').html(BOOKING_WITH_BILL_NAME);
								$('#billSelectionText').removeClass("withoutbill").addClass("withbill");
							} else if($('#billSelection').val() == BOOKING_WITHOUT_BILL) {
								$('#billSelectionText').html(BOOKING_WITHOUT_BILL_NAME);
								$('#billSelectionText').removeClass("withbill").addClass("withoutbill");
							}
							
							if(localBookingScreenConfig.BookingType) {
								next = "bookingType";
							} else {
								next = "lrType";
							}
						}
					});
				} else {
					$('#myModal').remove();
				}
				
				$("#lrType").bind("change", function() {
					_this.changeWayBillType(this.value);
				});
				
				$("#lrNumberManual").bind("blur", function() {
					var jsonObject	= new Object();
					
					jsonObject.lrNumberManual	= this.value;
					getJSON(jsonObject, WEB_SERVICE_URL + '/wayBillWS/checkDuplicateLR.do?', _this.checkIfLRNumberExist, EXECUTE_WITH_ERROR);
				});
				
				_this.changeWayBillType(localBookingScreenConfig.DefaultWayBillTypeForManual);
				$('#wayBillType').val(localBookingScreenConfig.DefaultWayBillTypeForManual);
				
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
				
				$('#lrNumberManual').keyup(function(event) {
					
					var lrNumber = $('#lrNumberManual').val();
					
					if(lrNumber.length != Number(localBookingScreenConfig.allowedLenghtForManualLR)){
						showMessage('error', 'LR Number length should  be Equal to  '+Number(localBookingScreenConfig.allowedLenghtForManualLR)+' !');
						changeTextFieldColor('lrNumberManual', '', '', 'red');
						return false;
					}
					return true;
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
				
				$('#consigneeName').keyup(function(event) {
					var consigneeName = $('#consigneeName').val();
					if(consigneeName.length > 0 && $('#destinationBranchId').val() <= 0) {
						$('#consigneeName').prop("autocomplete", "off");
						showMessage('error', " Please Select Destination !");	
						changeTextFieldColor('consigneeName', '', '', 'red');
						return false;
					}
					return true;
				});
				
				$('#consignorName').blur(function(event) {
					
					var consignorName = $('#consignorName').val();
					
					if (localBookingScreenConfig.ConsignorNameAutocomplete && consignorName.length > 0) {
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
				
				$('#consigneeName').blur(function(event) {
					
					var consigneeName = $('#consigneeName').val();
					
					if (localBookingScreenConfig.ConsigneeNameAutocomplete && consigneeName.length > 0) {
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
				
				$('#billingPartyName').blur(function(event) {
					
					var billingPartyName = $('#billingPartyName').val();
					
					if (localBookingScreenConfig.BillingPartyNameAutocomplete && billingPartyName.length > 0) {
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
				
				if (localBookingScreenConfig.SaidToContain) {
					if(localBookingScreenConfig.SaidToContainValidate) {
						$('#saidToContain').keydown(function(event) {
							if(getKeyCode(event) == 13) {
								if(!validateInputTextFeild(1, 'saidToContain', 'saidToContain', 'error', saidToContaionErrMsg)) {
									return false;
								}
							}
							
							return true;
						});
					}

					if (localBookingScreenConfig.SaidToContainAutocomplete) {
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
				
				if (localBookingScreenConfig.PrivateMarkValidate) {
					$('#privateMark').keydown(function(event) {
						if(getKeyCode(event) == 13) {
							if (!validateInputTextFeild(1, 'privateMark', 'privateMark', 'error', privateMarkErrMsg)) {
								return false;
							}
						}
						
						return true;
					});
				}
				
				$("#actualWeight").bind("blur", function() {
					if(this.value != '') {
						_this.calculateChargedWeight('actualWeight');
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
				
				$('#fixAmount').keyup(function(event) {
					if(getKeyCode(event) == 13) {
						if($('#lrType').val() != WayBillTypeConstant.WAYBILL_TYPE_FOC) {
							if(!validateInputTextFeild(1, 'fixAmount', 'fixAmount', 'error', fixAmountRequiredErrMsg)) {
								return false;
							}
						}
						return true;
					}
				});
				
				if(localBookingScreenConfig.DeclaredValue && localBookingScreenConfig.DeclaredValueValidate) {
					$('#declaredValue').keyup(function(event) {
						if(getKeyCode(event) == 13) {
							if(!validateInputTextFeild(1, 'declaredValue', 'declaredValue', 'error', declaredValueErrMsg)) {
								return false;
							}
							return true;
						}
					});
				}
				
				if(isBookingDiscountAllow) {
					$('#discountTypes').keyup(function(event) {
						if(getKeyCode(event) == 13) {
							if(_this.validateDiscountType()) {
								next = "save";
							} 
						}
					});
				}
				
				$('#save').mouseup(function(event) {
					_this.saveWayBill();
				}).keydown(function(event) {
					if(event.keyCode != undefined && event.keyCode === 13) {
						_this.saveWayBill();
					}
				});
			});
		}, setConsigneeAutoComplete : function(destBranchId) {
			
			$("#consigneeName").autocomplete({
				source: "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18&partyType=2,3&customerType=2&destinationId="+destBranchId+"&responseFilter="+localBookingScreenConfig.BookingConsigneeNameAutocompleteResponse,
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

		}, changeWayBillType : function(lrTypeId) {
			if(lrTypeId == WayBillTypeConstant.WAYBILL_TYPE_PAID) {
				$("*[data-selector='lrType'").html(WayBillTypeConstant.WAYBILL_TYPE_NAME_PAID);
				$('#DisplayWayBillType').removeClass();
				$('#DisplayWayBillType').addClass('panel-primary');
				$('#wayBillType').val(WayBillTypeConstant.WAYBILL_TYPE_PAID);
				$('#lrType').val(WayBillTypeConstant.WAYBILL_TYPE_PAID);
				$('#BillingPartyDetailsConsignor').removeClass("hide").addClass("hide");
				$('.panel-heading').attr('style','background-color :#337ab7;')
				
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
				
				_this.enableDisableCharges(lrTypeId);
				
			} else if(lrTypeId == WayBillTypeConstant.WAYBILL_TYPE_FOC) {
				$("*[data-selector='lrType'").html(WayBillTypeConstant.WAYBILL_TYPE_NAME_FOC);
				$('#DisplayWayBillType').switchClass('panel-info', 'panel-success');
				$('#wayBillType').val(WayBillTypeConstant.WAYBILL_TYPE_FOC);
				$('#lrType').val(WayBillTypeConstant.WAYBILL_TYPE_FOC);
				$('#BillingPartyDetailsConsignor').removeClass("hide").addClass("hide");
				$('.panel-heading').attr('style','background-color :#4ebb21;');
				$('.panel-heading').css({"color" : "white"});
				
				_this.enableDisableCharges(lrTypeId);
			}
			
			if($('#chargeType').val() == ChargeTypeConstant.CHARGETYPE_ID_QUANTITY) {
				_this.resetArticleWithTable();
			}
		}, enableDisableCharges : function(lrTypeId) {
			
			var charges	= jsondata.bookingCharges;
			
			var chargesColl = new Array(); 
			for ( var i = 0; i < charges.length; i++) {
				if(lrTypeId == WayBillTypeConstant.WAYBILL_TYPE_FOC) {
					$('#charge'+charges[i].chargeTypeMasterId).attr("disabled", true);
				} else {
					$('#charge'+charges[i].chargeTypeMasterId).attr("disabled", false);
				}
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
			
			if (localBookingScreenConfig.ConsignorNameAutocomplete && consignorName.length > 0) {
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
			
			if (localBookingScreenConfig.ConsigneeNameAutocomplete && consigneeName.length > 0) {
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
				if (localBookingScreenConfig.BillingPartyNameAutocomplete && billingPartyName.length > 0) {
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
			
			if (localBookingScreenConfig.ChargeType) {
				if(!validateInputTextFeild(1, 'chargeType', 'chargeType', 'error',  chargeTypeErrMsg)) {
					return false;
				}
			}

			if (localBookingScreenConfig.Qty) {
				if(!validateInputTextFeild(1, 'quantity', 'quantity', 'error',  quantityErrMsg)) {
					return false;
				}
			}

			if (localBookingScreenConfig.ArticleType && $('#typeofPacking').exists()) {
				if(!validateInputTextFeild(1, 'typeofPacking', 'typeofPacking', 'error',  articleTypeErrMsg)) {
					return false;
				}
			}

			if(localBookingScreenConfig.ArticleType && $('#typeofPackingId').exists()) {
				if(!validateInputTextFeild(1, 'typeofPackingId', 'typeofPacking', 'error', articleTypeErrMsg)) {
					return false;
				}
			}

			if (localBookingScreenConfig.SaidToContain) {
				if(localBookingScreenConfig.SaidToContainValidate) {
					if(!validateInputTextFeild(1, 'saidToContain', 'saidToContain', 'error', saidToContaionErrMsg)) {
						return false;
					}
				}

				if (localBookingScreenConfig.SaidToContainAutocomplete) {
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
			if (localBookingScreenConfig.FrightuptoDestination) {
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
		}, checkDuplicateLR : function(response) {
			if(SequenceCounter != null) {
				if(response.isDuplicateLR) {
					$('#lrNumberManual').val(Number(SequenceCounter.nextVal) + 1);
				} else {
					if(jsondata.showNextLrNumberInitialDigits && (SequenceCounter.nextVal).toString().length > 4) {
						$('#lrNumberManual').val((SequenceCounter.nextVal).toString().substr(0, 4));
					} else{
						$('#lrNumberManual').val(SequenceCounter.nextVal);
					}
				}
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
			var saidToContain			= $('#saidToContain').val();
			
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
			appendValueInTableCol(eight, "<button type='button' id='delete_" + counterForDeleteConsignment + "' class='btn btn-danger delete'>Delete</button>");
			appendValueInTableCol(nine, consignmentGoodsId);
			
			appendRowInTable(tableBodyId, NewRow);

			counterForDeleteConsignment++;
			_this.calculateTotalQty();
			
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

			_this.calculateTotalQty();

			next = "quantity";
			setTimeout(function(){ $('#quantity').focus(); }, 10);
			
			$('#chargedWeight').val(localBookingScreenConfig.MinChargedWeight);
			$('#actualWeight').val(localBookingScreenConfig.MinActualWeight);

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
					}
				}
			}
		}, calculateChargedWeight : function(id) {
			var actualWeight  		= parseFloat($('#' + id).val());
			var chargedWeight 		= parseFloat($('#chargedWeight').val());
			var minChrdWght 		= localBookingScreenConfig.MinChargedWeight;
			
			if(localBookingScreenConfig.roundOffChargeWeight) {
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
				for(var i = 0; i < chargeWeightConfig.length; i++) {
					var chargeWeightConfiguration	= chargeWeightConfig[i];
					
					if(Number(chargeWeightConfiguration.corporateAccountId) 	== Number(corporateAccountId) || Number(chargeWeightConfiguration.corporateAccountId) 	== Number(0)
							&& Number(chargeWeightConfiguration.packingTypeId) 	== Number(packingTypeId)
					) {
						increaseChargeWeight	= chargeWeightConfiguration.chargeWeight;
					}
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
			var rndOffChrgdWghtByTensForBrnchs = localBookingScreenConfig.roundOffChargedWeightByTensForBranchs;
			var branches	= new Array();
			branches 		= rndOffChrgdWghtByTensForBrnchs.split(",");
			
			if(localBookingScreenConfig.roundOffIncreasedChargedWeightValue) {
				if(localBookingScreenConfig.roundOffChargedWeightByTens) {
					for(var i = 0 ; i < branches.length; i++) {
						if(branches[i] == branchId) {
							$('#chargedWeight').val(Math.round(increasedValue / 10) * 10);
						} else {
							$('#chargedWeight').val(Math.ceil(increasedValue / 5) * 5);
						}
					}
				} 
			} else {
				$('#chargedWeight').val(increasedValue);
			}
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
						if (localBookingScreenConfig.ActualWght) {
							next = "actualWeight";
						} else if (localBookingScreenConfig.PrivateMark) {
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
			
			var consignorName 	 = $('#consignorName').val();
			var consigneeName 	 = $('#consigneeName').val();
			var billingPartyName = $('#billingPartyName').val();
			
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

			if (localBookingScreenConfig.ConsignorNameAutocomplete && consignorName.length > 0) {
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

			if(!validateInputTextFeild(1, 'consigneeName', 'consigneeName', 'error', consineeNameErrMsg)) {
				return false;
			}

			if (localBookingScreenConfig.ConsigneeNameAutocomplete && consigneeName.length > 0) {
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
				if (localBookingScreenConfig.BillingPartyNameAutocomplete && billingPartyName.length > 0) {
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

			if(!validateInputTextFeild(1, 'lrNumberManual', 'lrNumberManual', 'error', lrNumberErrMsg)) {
				setTimeout(function(){ $('#lrNumberManual').focus(); }, 0);
				return false;
			}

			if (!validateInputTextFeild(1, 'actualWeight', 'actualWeight', 'error', actWeightErrMsg)) {
				return false;
			}

			if (localBookingScreenConfig.PrivateMarkValidate) {
				if (!validateInputTextFeild(1, 'privateMark', 'privateMark', 'error', privateMarkErrMsg)) {
					return false;
				}
			}

			if(!_this.validateConsignmentTables()) {
				return false;
			}
			
			if($('#lrType').val() != WayBillTypeConstant.WAYBILL_TYPE_FOC) {
				if(!validateInputTextFeild(1, 'fixAmount', 'fixAmount', 'error', fixAmountRequiredErrMsg)) {
					return false;
				}
			}

			if (localBookingScreenConfig.DeclaredValue && localBookingScreenConfig.DeclaredValueValidate) {
				if(!validateInputTextFeild(1, 'declaredValue', 'declaredValue', 'error', declaredValueErrMsg)) {
					return false;
				}
			}

			if(!_this.validateDiscountType()) {
				return false;
			}
			
			if($('#lrType').val() != WayBillTypeConstant.WAYBILL_TYPE_FOC) {
				if(!_this.validateGrandTotal()) {
					return false;
				}
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
			
			jsonObject.isLocalBookingLR	= true;
			jsonObject.isManual			= true;
			
			$("#save").addClass('hide');
			
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
									var printObj	= Object.assign(jsonObject, data.objectOut);
									
									_this.setQRDetails(printObj);
									_this.resetArticleWithTable();
									_this.resetCharges();
									_this.resetAllData();
									_this.setRePrintOption(data, printObj);
									
									$("#save").removeClass('hide');
									doneTheStuff = false;

									if(showBillSelection) {
										_this.openBillSelectionPopup('myModal');

										$('#billSelection').focus();
									} else {
										$('#lrType').focus();
									}
									hideLayer();
								}
							});
				});
			}
			
			btModalConfirm.on('cancel', function() {
				$("#save").removeClass('hide');
				$("#save").focus();
				doneTheStuff = false;
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
			jsonObject.lrNumberManual		= $('#lrNumberManual').val().toUpperCase();
			jsonObject.manualLRDate			= $('#manualLRDate').val();
			jsonObject.sourceBranchId		= $('#sourceBranchId').val();
			jsonObject.destinationBranchId	= $('#destinationBranchId').val();
			jsonObject.chargeTypeId			= $('#chargeType').val();
			jsonObject.consignorCorpId		= $('#consignorCorpId').val();
			jsonObject.billingPartyId		= $('#billingPartyId').val();
			jsonObject.partyMasterId		= $('#partyMasterId').val();
			jsonObject.consignorName		= $('#consignorName').val();
			jsonObject.billingPartyName		= $('#billingPartyName').val();
			jsonObject.consignorAddress		= $('#consignorAddress').val();
			
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
			jsonObject.consignmentAmount	= $('#consignmentAmount').val();
			
			_this.getBillSelection(jsonObject);
			
			jsonObject.chargeType			= ChargeTypeConstant.CHARGETYPE_ID_FIX;
			jsonObject.actualWeight			= $('#actualWeight').val();
			jsonObject.chargedWeight		= $('#chargedWeight').val();
			jsonObject.privateMark			= $('#privateMark').val();
			jsonObject.declaredValue		= $('#declaredValue').val();
			
			var checkboxarray	= "";

			$("input[name='checkbox2']").each( function () {
				checkboxarray	+= $(this).val() + "~";
			});

			jsonObject.checkbox2		= checkboxarray;
			jsonObject.sourceBranchId	= executive.branchId;
			jsonObject.discount			= $('#discount').val();
			jsonObject.isDiscountPercent= $('#isDiscountPercent').prop('checked');
			
			_this.getChargeDetails(jsonObject);
			
		}, getBillSelection : function(jsonObject) {
			var billSelectionId		= $('#billSelection').val();
			
			if(billSelectionId == undefined) {
				billSelectionId		= Number(localBookingScreenConfig.defaultBillSelectionId);
			}

			jsonObject.billSelection 	= billSelectionId;
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
			
			_this.setDefaultValue();
			_this.resetFreightUptoBranch();
			_this.setDefaultSaidToContain();
			isDuplicateLR	= false;
		},resetCharges: function(){
			var charges	= jsondata.bookingCharges;
			var total	= 0;

			for (var i = 0; i < charges.length; i++) {
				$("#charge" + charges[i].chargeTypeMasterId).val(0);
				$('#charge'+charges[i].chargeTypeMasterId).attr("disabled", false);
			}
			
			$('#fixAmount').attr("disabled", false);
			$('#discount').attr("disabled", false);
			$('#isDiscountPercent').attr("disabled", false);
			$('#discountTypes').attr("disabled", false);
			
		}, setDefaultValue : function() {
			$('#chargedWeight').val(localBookingScreenConfig.MinChargedWeight);
			$('#actualWeight').val(localBookingScreenConfig.MinActualWeight);
			_this.changeWayBillType(localBookingScreenConfig.DefaultWayBillTypeForManual);
		}, setRePrintOption : function(data, printObj) {
			$('#bookedLRDetails').removeClass('hide');
			$('#prevlrnum').html('<a style="cursor:pointer;" id="lrDetails">' + data.wayBillNumber + '</a>');
			$('#prevwbtype').html(data.wayBillType);
			$('#prevsrc').html(data.sourceBranchName);
			$('#prevdest').html(data.destinationBranchName);
			$('#prevGrandTotal').html(data.grandTotal);
			
			$("#lrDetails").bind("click", function() {
				_this.openWindowForView(data.waybillId, 0);
			});
			
			$("#reprintLr").unbind("click");
			$("#reprintLr").bind("click", function() {
				window.open("printWayBill.do?pageId=340&eventId=10&modulename=lrPrint&masterid=" + data.waybillId + "&isRePrint=true","newwin","width=425,height=300");
			});
			
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
			
			var accountGroupObj 	= responseOut.PrintHeaderModel;

			var dataObjectColl 							= new Object();
			dataObjectColl.waybillId 					= responseOut.wayBillId;
			dataObjectColl.lrType	 					= responseOut.wayBillTypeName;
			dataObjectColl.waybillNumber 				= responseOut.wayBillNumber;			
			dataObjectColl.numberOfPackages 			= responseOut.quantity;
														   
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

			var templateArray = new Array();
			var consignmentVal = 1;
			
			for (var i = 0; i < consignmentDetailsArr.length; i++) {
				for (var j = 0; j < consignmentDetailsArr[i].quantity; j++) {
					var dataObject = new Object();
					_.map(dataObjectColl,function(val,key){
						dataObject[key] = val;
					})

					dataObject.currentPackage = consignmentVal++;
					
					if(isQrCodePrintBasedOnGSTN == 'true' || isQrCodePrintBasedOnGSTN == true ){
						if(consigneeGSTN == '' && consignorGSTN == ''){
							dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 1px;"><tr><td style="border-bottom: solid 1px; border-top:none; border-right: solid 1px; padding: 0px 10px 0px 10px;">LR No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObject.waybillNumber+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To City</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+responseOut.wayBillDestinationCityName+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To Branch</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+responseOut.wayBillDestinationBranchName+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Qty</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObject.currentPackage+' of '+dataObject.numberOfPackages+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">From</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObjectColl.sourceFrom+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Type</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObject.lrType+'</td></tr></table>')({dataObject : dataObject});
						}else {
							dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 1px;"><tr><td colspan="2" style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;text-align:center;">'+accountGroupObj.accountGroupName+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">LR No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObject.waybillNumber+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To City</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+responseOut.wayBillDestinationCityName+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To Branch</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+responseOut.wayBillDestinationBranchName+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Qty</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObject.currentPackage+' of '+dataObject.numberOfPackages+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">From</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObjectColl.sourceFrom+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Type</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObject.lrType+'</td></tr><tr style="width:25%; font-size: 20px;"><td></td><td style="text-align:right; padding: 0px 10px 0px 10px;">IVcargo</td></tr></table>')({dataObject : dataObject});
						}

					}else {
						if(isPrintIvcargoLableInQRCodePrint == 'true' || isPrintIvcargoLableInQRCodePrint == true){
							dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 1px;"><tr><td colspan="2" style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+accountGroupObj.accountGroupName+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">LR No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObject.waybillNumber+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+responseOut.wayBillDestinationCityName+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Qty</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObject.currentPackage+' of '+dataObject.numberOfPackages+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">From</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObjectColl.sourceFrom+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Type</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObject.lrType+'</td></tr><tr><td></td><td style="text-align:right; padding: 0px 10px 0px 10px;">IVCARGO</td></tr></table>')({dataObject : dataObject});
						} else {
							if(isPrintPrivateMarkaInQRCodePrint == 'true'){
								dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 1px;"><tr><td colspan="2" style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+accountGroupObj.accountGroupName+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">LR No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObject.waybillNumber+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObjectColl.destinationTo+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Qty</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObject.currentPackage+' of '+dataObject.numberOfPackages+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">From</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObjectColl.sourceFrom+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Type</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObject.lrType+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Pvt Mark</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObjectColl.privateMark+'</td></tr></table>')({dataObject : dataObject});
							} else {
								dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 1px;"><tr><td colspan="2" style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+accountGroupObj.accountGroupName+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">LR No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObject.waybillNumber+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">To</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObjectColl.destinationTo+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Qty</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObject.currentPackage+' of '+dataObject.numberOfPackages+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">From</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObjectColl.sourceFrom+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">Type</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+dataObject.lrType+'</td></tr></table>')({dataObject : dataObject});
							}
						} 
					}
					dataObject.qrCodeString = dataObject.waybillId + "~"+ consignmentDetailsArr[i].consignmentDetailsId + "~" + QR_CODE_USING_CONSIGNMENT + "~" +j;
					templateArray.push(dataObject);
				}
			}
			
			var finalObj = new Object();
			
			finalObj.templateArray = templateArray;
			$.ajax({
				url : "http://127.0.0.1:60080/printQrCode",
				data : finalObj,
				success : function(result) {
				}
			});
		},getChargeDetails :function(jsonObject) {
			var charges	= jsondata.bookingCharges;
			
			var chargesColl = new Array(); 
			for ( var i = 0; i < charges.length; i++) {
				jsonObject[$('#charge'+charges[i].chargeTypeMasterId).attr("id")] = $('#charge'+charges[i].chargeTypeMasterId).val();

				chargesColl[charges[i].chargeTypeMasterId] = $('#charge'+charges[i].chargeTypeMasterId).val()

			}
			jsonObject.bookingCharges = chargesColl;
		}
	});
});

function lrDateValidation() {
	if (LRDate) {

		if(!validateInputTextFeild(1, 'manualLRDate', 'manualLRDate', 'error',  dateErrMsg)) {
			return false;
		}

		if(!chkDate(getValueFromInputField('manualLRDate'))) {
			return false;
		}
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
		
		var manualLRDateParts 	= new String(date).split("-");
		manualLRDate.setFullYear(parseInt(manualLRDateParts[2],10));
		manualLRDate.setMonth(parseInt(manualLRDateParts[1]-1,10));
		manualLRDate.setDate(parseInt(manualLRDateParts[0],10));

		var diffDays 			= diffBetweenTwoDate(manualLRDate, currentDate);
		
		var wayBillTypeWiseBackDaysAllow 		 	= localBookingScreenConfig.wayBillTypeWiseBackDaysAllow;
		var wayBillTypeIdAndBackDaysConfiguration	= localBookingScreenConfig.wayBillTypeIdAndBackDaysConfiguration;
		var currentDateAllowedInReverseEntry 		= localBookingScreenConfig.currentDateAllowedInReverseEntry;
		var futureDaysAllowed 						= localBookingScreenConfig.maxNoOfDaysAllowForFutureDate;
		var allowpreviousdateforgroupadminonly		= localBookingScreenConfig.AllowPreviousDateForGroupAdminOnly;

		if(getValueFromInputField('wayBillType') != null) {
			currentWayBillTypeId = getValueFromInputField('wayBillType');
		}

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
		
		if(backDateAllowedInCurrentMonthOnly){
			if(manualLRDate.getMonth() != currentDate.getMonth()){
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
            if(AllowPreviousDateForGroupAdminOnly == 'true'){
				if(executive.executiveType != EXECUTIVE_TYPE_GROUPADMIN){
					if(Number(diffDays) > Number(1)) {
						$("#manualLRDate").val('');
						showMessage('info', dateTillDayFromTodayInfoMsg(1));
						changeError1('manualLRDate','0','0');
						isValidationError=true;
						return false;
					}
			   	}
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
			};
		};
	} else {
		showMessage('error', validDateErrMsg);
		changeError1('manualLRDate','0','0');
		isValidationError=true;
		return false;
	}
	return true;
}

function setBlankAmount(obj) {
	if(obj.value=='0') {
		obj.value='';
	}
}

function setChargesFocus(event) {
	var charges	= jsondata.bookingCharges;

	if(getKeyCode(event) == 13) {
		if($('#lrType').val() != WayBillTypeConstant.WAYBILL_TYPE_FOC) {
			if(localBookingScreenConfig.DeclaredValue && localBookingScreenConfig.DeclaredValueValidate) {
				if(validateInputTextFeild(1, 'declaredValue', 'declaredValue', 'error', declaredValueErrMsg)) {
					for (var i = 0; i < charges.length; i++) {
						next =  'charge' + charges[1].chargeTypeMasterId;
						initialiseFocus();
					}
				}
			} else {
				for (var i = 0; i < charges.length; i++) {
					next =  'charge' + charges[1].chargeTypeMasterId;
					initialiseFocus();
				}
			}
		} else {
			next= 'save';
		}
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
		$('#charge'+BookingChargeConstant.FREIGHT).val(fixAmount);
	}
}

function getChargesTotal() {
	var charges	= jsondata.bookingCharges;
	var total	= 0;

	for (var i = 0; i < charges.length; i++) {
		var chargeMasterId	= charges[i].chargeTypeMasterId;

		if ($("#charge"+chargeMasterId).val() != "") {
			total += parseFloat($("#charge"+chargeMasterId).val());
		}
	}
	$('#totalAmt').val(total);
}

function checkAndUpdateDiscountOnPercentage() {

	if(isBookingDiscountPercentageAllow) {
		var discountPercentage = 0;
		var discountAmount	= 0;

		discountPercentage = (parseFloat($("#discount").val()) / parseFloat($("#charge"+BookingChargeConstant.FREIGHT).val())) * 100;

		if(Number(discountPercentage) <= Number(localBookingScreenConfig.maximumDiscountValue)) {
			$("#discountPercentage").val(discountPercentage);
		} else {
			showMessage('error','Discount not allowed more than '+localBookingScreenConfig.maximumDiscountValue+'%.')
			$("#discountPercentage").val(0);
			$("#discount").val(0);
		}
	}
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

	var grandtotal 	= 0;
	var amount 		= parseFloat($("#totalAmt").val());
	discAmount 		= 0;

	if(isBookingDiscountAllow) {
		if($('#isDiscountPercent').prop('checked')) {
			discAmount	= amount - parseFloat($('#discount').val()) * parseFloat(amount) / 100;
		} else {
			discAmount	= amount - parseFloat($('#discount').val());
		}
	} else {
		discAmount = amount;
	}
	
	discAmount = parseFloat(discAmount);
	grandtotal = parseFloat(discAmount);

	if (lrWiseDecimalAmountAllow($('#wayBillType').val())) {
		$("#grandTotal").val((grandtotal).toFixed(2));
	} else {				
		$("#grandTotal").val(Math.round(grandtotal));
	}
}

function lrWiseDecimalAmountAllow(wayBillType) {
	if(localBookingScreenConfig.allowRateInDecimal) {
		if(localBookingScreenConfig.lrTypeWiseAmountInDecimal) {
			var lrTypeArray 	= (localBookingScreenConfig.LRTypeForAllowRateInDecimal).split(",");
			
			if(isValueExistInArray(lrTypeArray, wayBillType)) {
				return true;
			}
		} else {
			return true;
		}
	}
	return false;
}