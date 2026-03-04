var LR_SEARCH_TYPE_ID						= 1;
var declareValue							= 0;
var	accountGroupId							= 0;
var isWayBillSaved							= false;
var totalAmount								= 0;
define(['selectizewrapper','JsonUtility'
	,'messageUtility'
	,'/ivcargo/resources/js/generic/urlparameter.js'
	,'autocomplete'
	,'autocompleteWrapper'
	,'nodvalidation'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'/ivcargo/resources/js/module/redirectAfterUpdate.js'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/createWayBill/WayBillValidations.js',
	'/ivcargo/js/shortcut.js'
	],function(Selectizewrapper){
	'use strict';
	let jsonObject = new Object(), _this = '', executive, wayBillTypeList, bookingTypeList, chargeTypeList, groupConfiguration, pickupRequestGenerationConfig,
		idNum = 0, consignmentGoods, noOfArticlesAdded = 0, totalConsignmentQuantity = 0, consigAddedtableRowsId = [], consignorDetails = null, textBoxCount = 1, 
		validateEwaybillNumberThroughApi = false, setConeeAddressFromEwaybillNoAPI = false,checkBoxArray = new Array(), isFromViewEWayBill = false,
		eWayBillDetailsIdHM	= {}, eWayBillHM = {}, ewaybillValidDetails = {}, eWayBillValidationHM	= new Map(), eWayBillNumberArray = new Array(), corporateAccountList, CORPORATEACCOUNT_TYPE_BOTH = 3;
	return Marionette.LayoutView.extend({
		initialize : function(){
			_this = this;
			this.$el.html(this.template);
		},render : function(){
			let jsonObject = new Object();
			jsonObject.isCRMPage = true;
			getJSON(jsonObject, CUSTOMER_ACCESS_URL_CONSTANT + '/wayBillWS/loadPickUpRequestGenerationData.do?', _this.renderElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, renderElements : function(response){
			hideLayer();

			require(['text!/ivcargo/template/pickupRequestGenerationOnWeb.html'], function(searchHtml) {
				$("#mainContent").html(_.template(searchHtml));
				executive						= response.executive;
				bookingTypeList					= response.bookingTypeList;
				pickupRequestGenerationConfig	= response.pickupRequestGenerationConfig;
				groupConfiguration				= response.GroupConfiguration;
				chargeTypeList					= response.chargeTypeList;
				wayBillTypeList					= response.wayBillTypeList;
				consignmentGoods				= response.ConsignmentGoods;
				accountGroupId					= executive.accountGroupId;
				consignorDetails				= response.corporateAccountDetails;
				corporateAccountList			= response.corporateAccountList;
				
				if(corporateAccountList.length > 0){
					corporateAccountList.unshift(consignorDetails);
					$('.consignorDetails').removeClass('hide');
				}
				
				validateEwaybillNumberThroughApi		= groupConfiguration.validateEwaybillNumberByApi;
				
				if(typeof bookingTypeList !== 'undefined') {
					bookingTypeList.forEach(function(booingType) {
						$('#bookingType').append("<option value='"+ booingType.bookingTypeId +"'>" + booingType.bookingTypeName + "</option>");
					});
				}
				
				if(typeof wayBillTypeList !== 'undefined') {
					wayBillTypeList.forEach(function(wayBillType) {
						$('#lrType').append("<option value='"+ wayBillType.wayBillTypeId +"'>" + wayBillType.wayBillType + "</option>");
					});
				}
				
				if(typeof corporateAccountList !== 'undefined') {
					corporateAccountList.forEach(function(data) {
						$('#consignorChildPartyId').append("<option value='"+ data.corporateAccountId +"'>" + data.corporateAccountDisplayName + "</option>");
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

				initialiseFocus();
				
				$("#destination").autocomplete({
					source: function (request, response) {
						$.ajax({
							type: "POST",
							url: CUSTOMER_ACCESS_URL_CONSTANT + '/autoCompleteWS/getDeliveryPointDestinationBranch.do',
							contentType: "application/x-www-form-urlencoded",
							data: {
								term: request.term,
								branchType: 3,
								isOwnBranchRequired: true,
								isOwnBranchWithLocationsRequired: true,
								executiveId : localStorage.getItem("currentExecutiveId")
							},
							success: function (data) {
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
							}
						});
					},
					select: function (e, u) {
						$('#branchId').val(u.item.id);
						$('#destinationBranchId').val(u.item.id);
						$('#destinationStateId').val(u.item.stateId);
						$('#destinationRegionId').val(u.item.regionId);
						$('#destinationSubRegionId').val(u.item.subRegionId);
				
						//_this.setConsigneeAutoComplete(u.item.id);
					},
					minLength: 2,
					delay: 20,
					autoFocus: true
				});

				$("#typeofPacking").autocomplete({
					source: function (request, response) {
						$.ajax({
							type: "POST",
							url: CUSTOMER_ACCESS_URL_CONSTANT + '/autoCompleteWS/getPackingTypeByNameAndGroupId.do',
							contentType: "application/x-www-form-urlencoded",
							data: {
								term: request.term,
								executiveId : localStorage.getItem("currentExecutiveId")
							},
							success: function (data) {
								if (data.result == 0) {
									showMessage('error', "Enter Valide Articles Type");
									changeTextFieldColor('typeofPacking', '', '', 'red');
									isValidationError = true;
									$("#typeofPacking").val('');
									$("#typeofPacking").focus();
									return false;
								}
								response($.map(data.result, function (item) {
									return {
										label: item.packingGroupTypeName,
										value: item.packingGroupTypeName,
										packingTypeMasterId: item.packingTypeMasterId
									};
								}));
							}
						});
					},
					select: function (e, u) {
						$('#typeofPackingId').val(u.item.packingTypeMasterId);
					},
					minLength: 2,
					delay: 20,
					autoFocus: true
				});

				$("#saidToContain").autocomplete({
					source: function (request, response) {
						$.ajax({
							type: "POST",
							url: CUSTOMER_ACCESS_URL_CONSTANT + '/autoCompleteWS/getAllConsignmentGoodsDetailsByName.do',
							contentType: "application/x-www-form-urlencoded",
							data: {
								term: request.term,
								executiveId : localStorage.getItem("currentExecutiveId")
							},
							
							success: function (data) {
								if (data.result == 0) {
									showMessage('error', "Enter Valide Said To Contain");
									changeTextFieldColor('saidToContaionErrMsg', '', '', 'red');
									isValidationError = true;
									$("#saidToContain").val('');
									$("#saidToContain").focus();
									return false;
								}
								response($.map(data.result, function (item) {
									return {
										label: item.name,
										value: item.name,
										consignmentGoodsId: item.consignmentGoodsId
									};
								}));
							}
						});
					},
					select: function (e, u) {
						$('#consignmentGoodsId').val(u.item.consignmentGoodsId);
					},
					minLength: 2,
					delay: 20,
					autoFocus: true
				});

				$("#billingPartyName").autocomplete({
					source: function (request, response) {
						$.ajax({
							type: "POST",
							url: CUSTOMER_ACCESS_URL_CONSTANT + '/autoCompleteWS/getTBBPartyDetailsAutocomplete.do',
							contentType: "application/x-www-form-urlencoded",
							data: {
								term: request.term,
								billing: 4,
								customerType: 1,
								executiveId : localStorage.getItem("currentExecutiveId")
							},
							success: function (data) {
								if (data && data.result) {
									response($.map(data.result, function (item) {
										return {
											label: item.corporateAccountDisplayName,
											value: item.corporateAccountDisplayName,
											id: item.corporateAccountId
										};
									}));
								}
							}
						});
					},
					select: function (e, u) {
						$('#billingPartyId').val(u.item.id);
						$('#partyOrCreditorId').val(u.item.id);
					},
					minLength: 2,
					delay: 20,
					autoFocus: true
				});

				$("#consigneeName").autocomplete({
					source: function (request, response) {
						$.ajax({
							type: "POST",
							url: CUSTOMER_ACCESS_URL_CONSTANT + '/autoCompleteWS/getPartyDetailsAutocomplete.do',
							contentType: "application/x-www-form-urlencoded",
							data: {
								term: request.term,
								//billing: 4,
								customerType: 2,
								executiveId : localStorage.getItem("currentExecutiveId"),
								destinationBranchId: $('#destinationBranchId').val(),
								responseFilter	   : 2
							},
							success: function (data) {
								if (data && data.result) {
									response($.map(data.result, function (item) {
										return {
											label: item.corporateAccountDisplayName,
											value: item.corporateAccountDisplayName,
											id: item.corporateAccountId
										};
									}));
								}
							}
						});
					},
					select: function (e, u) {
						$('#consigneeId').val(u.item.id);
						$('#consigneeName').val(u.item.value);
						let jsonObject = new Object();
						jsonObject.partyId = u.item.id;
						getJSON(jsonObject, CUSTOMER_ACCESS_URL_CONSTANT + '/wayBillWS/getPartyDetails.do?', _this.setConsigneeDetails, EXECUTE_WITHOUT_ERROR);
					},
					minLength: 2,
					delay: 20,
					autoFocus: true
				});
				
				$("#lrType").bind("change", function() {
					_this.changeWayBillType(this.value);
				});
				
				_this.changeWayBillType(pickupRequestGenerationConfig.DefaultWayBillTypeForManual);
				$('#wayBillType').val(pickupRequestGenerationConfig.DefaultWayBillTypeForManual);
				
				$('#destination').keydown(function(event) {
					if(getKeyCode(event) == 13)
						return validateInputTextFeild(1, 'destination', 'destination', 'error', destinationErrMsg);
				});
				
				$('#destination').keyup(function(event) {
					if(event.keyCode != undefined && (event.keyCode === 8 || event.keyCode === 46))
						_this.resetDestinationPointData();
				});
				
				$('#chargeType').keyup(function(event) {
					if(event.keyCode != undefined && event.keyCode != 13 && event.keyCode != 27)
						_this.resetArticleWithTable();
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
				
				if (pickupRequestGenerationConfig.SaidToContain) {
					if(pickupRequestGenerationConfig.SaidToContainValidate) {
						$('#saidToContain').keydown(function(event) {
							if(getKeyCode(event) == 13) {
								if(!validateInputTextFeild(1, 'saidToContain', 'saidToContain', 'error', saidToContaionErrMsg)) {
									return false;
								}
							}
							
							return true;
						});
					}

					if (pickupRequestGenerationConfig.SaidToContainAutocomplete) {
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
				
				if (pickupRequestGenerationConfig.PrivateMarkValidate) {
					$('#privateMark').keydown(function(event) {
						if(getKeyCode(event) == 13) {
							if (!validateInputTextFeild(1, 'privateMark', 'privateMark', 'error', privateMarkErrMsg)) {
								return false;
							}
						}
						
						return true;
					});
				}
				if (pickupRequestGenerationConfig.invoiceNumberValidate) {
					$('#invoiceNumber').keydown(function(event) {
						if(getKeyCode(event) == 13) {
							if (!validateInputTextFeild(1, 'invoiceNumber', 'invoiceNumber', 'error', invoiceNumberErrMsg)) {
								return false;
							}
						}
				
						return true;
					});
				}
				
				$('#addMutipleEwayBill, #btSubmit, #viewEwayBill, #btOk').keydown(function(event) {
					if (event.key === 'Enter') {
						let nextElement;
						switch (this.id) {
							case 'addMutipleEwayBill': nextElement = '#ewaybill0'; break;
							case 'btSubmit': nextElement = '#viewEwayBill'; break;
							case 'viewEwayBill': nextElement = '#btOk'; break;
							case 'btOk': nextElement = '#save'; break;
						}

						if (nextElement) {
							setTimeout(() => $(nextElement).focus(), 500);
						}
					}
				});
				
				$("#consigneeName").keydown("blur", function() {
					if($('#destinationBranchId').val() == 0){
						showMessage('error', "Destination Branch not found !");
						$('#destination').focus();
						return false;
					}
					return true;
				});
				
				$('#consigneeGstn').keydown(function(event) {
					if(getKeyCode(event) == 13)
						return validateInputTextFeild(9, 'consigneeGstn', 'consigneeGstn', 'info', gstnErrMsg);
				});
				
				$('#consigneeGstn').bind("blur",function(event) {
					_this.saveNewParty(); 
				});
				
				$("#actualWeight").bind("keyup", function(event) {
					if(event.keyCode != undefined  && event.keyCode !== 27 && event.keyCode !== 13) {
						if(this.value != '') {
							$("#tempActualWeight").val(this.value);
						}
					}
				});
				
				$("#actualWeight").bind("blur", function() {
					if(this.value != '') {
						_this.calculateChargedWeight('actualWeight');
					}
				});
				
				$('#chargedWeight').keypress(function(event) {
					if(event.keyCode != undefined && event.keyCode === 13) {
						_this.editChargedWeight(this);
					}
				});
				
				$("#addMutipleEwayBill").bind("click", function(){
					_this.addMultipleEwayBillNo();
				});
				$("#ewaybill0").bind("keyup", function(){
					_this.validateEwayBill(this);
				});
				$("#btRemove").bind("click", function(){
					_this.removeTextValue();
				});
				$("#submitButton").bind("blur", function(){
					_this.viewEwaybillNumber();
				});
				$("#submitButton").bind("click", function(){
					_this.submitEWayBillData();
				});
				$("#btAddNew").bind("click", function(){
					_this.addNewRow();
				});
				$("#viewEwayBill").bind("click", function(){
					_this.viewEwayBillNo();
				});
				$("#btOk").bind("click", function(){
					_this.reCalculateEwayBill();
				});
				$("#btnClose").bind("click", function(){
					_this.resetModel();
				});
				$(".close").bind("click", function(){
					_this.resetModel();
				});
				$("#consigneeName").bind("blur", function(){
					let str = $("#consigneeName").val();
					$("#consigneeName").val(str.replace(/\s?\(.*\)/, '').trim());
				});
				$('#singleEwaybillNo').bind("blur", function(event){
					if($('#singleEwaybillNo').val() != '' && $('#singleEwaybillNo').val().length > 0 && $('#singleEwaybillNo').val().length < 12) {
						showMessage('info', " Please Enter 12 Digit Ewaybill Number !");
						$('#singleEwaybillNo').focus();
						$('#singleEwaybillNo').val("")
						return;
					}else if($('#singleEwaybillNo').val() != '')
						_this.validateSingleEwaybillNumber();
					else
						$('#consignorChildPartyId').focus();
				});
				
				_this.bindFocusOnAddButton();
				
				if(pickupRequestGenerationConfig.DefaultWayBillTypeForManual == WAYBILL_TYPE_CREDIT)
					_this.setBillingParty();
				
				$('#chargeType').val(pickupRequestGenerationConfig.DefaultChargeType);
				
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
				
				_this.callTokenBookingShortcut();
			});
		}, changeWayBillType : function(lrTypeId) {
			if(lrTypeId == WAYBILL_TYPE_PAID) {
				$("*[data-selector='lrType'").html(WAYBILL_TYPE_NAME_PAID);
				$('#DisplayWayBillType').removeClass();
				$('#DisplayWayBillType').css({'background': 'rgb(0, 115, 186)'});
				$('#wayBillType').val(WAYBILL_TYPE_PAID);
				$('#lrType').val(WAYBILL_TYPE_PAID);
				$('#BillingPartyDetailsConsignor').removeClass("hide").addClass("hide");
				_this.resetBillingParty();
			} else if(lrTypeId == WAYBILL_TYPE_TO_PAY) {
				$("*[data-selector='lrType'").html(WAYBILL_TYPE_NAME_TOPAY);
				$('#DisplayWayBillType').removeClass();
				$('#DisplayWayBillType').css({'background': 'rgb(231, 112, 114)'});
				$('#wayBillType').val(WAYBILL_TYPE_TO_PAY);
				$('#lrType').val(WAYBILL_TYPE_TO_PAY);
				$('#BillingPartyDetailsConsignor').removeClass("hide").addClass("hide");
				_this.resetBillingParty();
			} else if(lrTypeId == WAYBILL_TYPE_CREDIT) {
				$("*[data-selector='lrType'").html(WAYBILL_TYPE_NAME_CREDITOR);
				$('#DisplayWayBillType').removeClass();
				$('#DisplayWayBillType').css({'background': 'rgb(82, 174, 198)'});
				$('#wayBillType').val(WAYBILL_TYPE_CREDIT);
				$('#lrType').val(WAYBILL_TYPE_CREDIT);
				$('#BillingPartyDetailsConsignor').removeClass('hide');
				//_this.setBillingPartyAutoComplete();
				_this.setBillingParty();
			} else if(lrTypeId == WAYBILL_TYPE_FOC) {
				$("*[data-selector='lrType'").html(WAYBILL_TYPE_NAME_FOC);
				$('#DisplayWayBillType').css({'background': 'rgb(44, 174, 84)'});
				$('#wayBillType').val(WAYBILL_TYPE_FOC);
				$('#lrType').val(WAYBILL_TYPE_FOC);
				$('#BillingPartyDetailsConsignor').removeClass("hide").addClass("hide");
				_this.resetBillingParty();
			}
			
			if($('#chargeType').val() == CHARGETYPE_ID_QUANTITY)
				_this.resetArticleWithTable();
		}, setConsigneeDetails : function(response) {
			let partyDetails	= response.partyDetails;
			
			if(partyDetails != undefined && partyDetails != null) {
				$('#consigneePhn').val(partyDetails.corporateAccountMobileNumber);
				$('#consigneeGstn').val(partyDetails.gstn);
				$('#consigneeAddress').val(partyDetails.corporateAccountAddress);
				$('#consigneeName').val(partyDetails.corporateAccountDisplayName);
			}
		}, validateAddArticle : function() {
			if(!validateInputTextFeild(1, 'quantity', 'quantity', 'error',	quantityErrMsg))
				return false;

			if(!validateInputTextFeild(1, 'typeofPackingId', 'typeofPackingId', 'error',  articleTypeErrMsg))
				return false;
			
			return validateInputTextFeild(1, 'consignmentGoodsId', 'consignmentGoodsId', 'error', saidToContaionErrMsg);
		}, resetDestinationPointData : function() {
			$('#destinationBranchId').val(0);
			$('#destinationStateId').val("0");
			$('#typeOfLocation').val("0");
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
			//$('#consigneePartyMasterId').val("0");
			$('#consigneePincode').val("");
			$('#consigneeTin').val('');
			$('#consigneeId').val("0");
		}, setBillingParty : function() {
			$('#billingPartyId').val(consignorDetails.corporateAccountId);
			$('#billingPartyName').val(consignorDetails.corporateAccountDisplayName);
			$('#billingPartyCreditorId').val(consignorDetails.corporateAccountId);
		}, resetBillingParty : function() {
			$('#billingPartyId').val(0);
			$('#billingPartyName').val("");
			$('#billingPartyCreditorId').val("0");
		}, resetArticleWithTable : function() {
			noOfArticlesAdded	= 0;
			_this.resetArticleDetails();
			$('#totalQty').html("0");
			$("#myTBody").empty();
			$("#myTBody1").empty();
			totalConsignmentQuantity = 0;
			
			if($('#chargeType').val() == CHARGETYPE_ID_QUANTITY) {
				$('#qtyAmount').removeAttr('disabled');
			} else {
				$('#qtyAmount').attr('disabled','disabled');
			}
		}, checkAndAddConsignment : function() {
			if($('#myTBody tr').length == 0 && $('#myTBody1 tr').length == 0)
				_this.addConsignmentTableStructure();
			
			return _this.addConsignment();
		}, addConsignmentTableStructure : function() {
			let TableBody	= document.getElementById("myTBody");
			let TableBody1	= document.getElementById("myTBody1");
			
			$("#myTable").removeClass('hide');
			$("#myTable1").removeClass('hide');

			let BaseRow1	= document.createElement("tr"); //Create Row for tableEl
			let BaseRow		= document.createElement("tr");	//Create Row for tableEl1
			
			BaseRow1.className	= '';
			BaseRow.className	= '';

			//create Columns for tableEl
			let Baseone		= document.createElement("th");
			let Basetwo		= document.createElement("th");
			let Basethree	= document.createElement("th");
			let Basefour	= document.createElement("th");
			//let Basenine	= document.createElement("th");
			//let BaseEleven	= document.createElement("th");

			//create Columns for tableEl1
			let Basefive	= document.createElement("th");
			let Basesix		= document.createElement("th");
			let Baseseven	= document.createElement("th");
			let Baseeight	= document.createElement("th");
			//let Baseten		= document.createElement("th");
			//let BaseTwelve	= document.createElement("th");
			let BaseThirteen= document.createElement("th");
			let BaseFourteen= document.createElement("th");

			Baseone.innerHTML		= "";
			Baseone.width			= "";
			
			Basetwo.innerHTML		= "Qty";//Please do not change because it reflect to other method i.e. checkaddConsignmentTableStructure()
			Basetwo.width			= "50px";

			Basethree.innerHTML		= "Art Type";
			Basethree.width			= "130px";

			Basefour.innerHTML		= "Contains";
			Basefour.width			= "120px";

			//Basenine.innerHTML		= "Art Amt";
			//Basenine.width			= "80px";

			//BaseEleven.innerHTML	= "Total";
			//BaseEleven.width		= "70px";

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

			//Baseten.innerHTML		= "Art Amt";
			//Baseten.width			= "80px";

			//BaseTwelve.innerHTML	= "Total";
			//BaseTwelve.width		= "70px";

			BaseFourteen.innerHTML	= "<a class='button-normal'><i class='fa fa-arrow-up'></i></a>";
			BaseFourteen.width		= "50px";

			Baseone.style.display	='none';
			Basefive.style.display	='none';

			//Add columns to row of tableEl
			BaseRow.appendChild(Baseone);
			BaseRow.appendChild(Basetwo);
			BaseRow.appendChild(Basethree);
			BaseRow.appendChild(Basefour);
			//BaseRow.appendChild(Basenine);
			//BaseRow.appendChild(BaseEleven);
			BaseRow.appendChild(BaseThirteen);

			//Add columns to row of tableEl1
			BaseRow1.appendChild(Basefive);
			BaseRow1.appendChild(Basesix);
			BaseRow1.appendChild(Baseseven);
			BaseRow1.appendChild(Baseeight);
			//BaseRow1.appendChild(Baseten);
			//BaseRow1.appendChild(BaseTwelve);
			BaseRow1.appendChild(BaseFourteen);

			TableBody.appendChild(BaseRow);//Add row to tableEl
			TableBody1.appendChild(BaseRow1);//Add row to tableEl1
		}, addConsignment : function() {
			let response;

			if(_this.isAddLeftTable('myTable', 'myTable1')) {
				response = _this.addConsignmentRow('myTBody1');
				$("#myTable1").removeClass('hide');
			} else {
				response = _this.addConsignmentRow('myTBody');
				$("#myTable").removeClass('hide');
			}
			
			_this.resetArticleDetails();

			$("#delete_" + idNum).bind("click", function() {
				_this.deleteConsignments(this.id);
			});
			
			return response;
		}, isAddLeftTable : function(leftTableId, rightTableId) {
			let leftTable	= document.getElementById(leftTableId);
			let rightTable	= document.getElementById(rightTableId);
			
			return !(leftTable.rows.length < rightTable.rows.length || leftTable.rows.length == rightTable.rows.length);
		}, addConsignmentRow : function(tableBodyId) {
			let zero				= 0;
			let typeofPackingId		= $('#typeofPackingId').val();
			
			if($('#typeofPacking option:selected').text()) {
				var typeofPackingVal	= $('#typeofPacking option:selected').text();
			} else {
				var typeofPackingVal	= $('#typeofPacking').val();
			}
			
			let quantity				= $('#quantity').val();
			let consignmentGoodsId		= $('#consignmentGoodsId').val();
			let saidToContain			= '';
			
			if($('#saidToContain').exists()) 
				saidToContain			= $('#saidToContain').val();
			
			let qtyAmount			= 0;
			
			if($('#qtyAmount').exists())
				qtyAmount			= $('#qtyAmount').val();

			let noOfArtToAdd			= groupConfiguration.noOfConsignmentToAdd;

			if(noOfArticlesAdded >= noOfArtToAdd) {
				showMessage('info', noOfArtToAddInfoMsg(noOfArtToAdd));
				_this.resetArticleDetails();
				return false;
			}

			noOfArticlesAdded ++;
			idNum ++;
			consigAddedtableRowsId.push(idNum);

			totalConsignmentQuantity += parseInt(quantity);

			let newRow	= createRowInTable('articleTableRow' + idNum, '', '');
			let one		= createColumnInRow(newRow, '', 'datatd', '5%', '', 'display : none', '');
			let two		= createColumnInRow(newRow, "quantity" + idNum, 'datatd', '5%', '', '', '');
			let three	= createColumnInRow(newRow, '', 'datatd', '13%', '', '', '');
			let four	= createColumnInRow(newRow, "typeofPackingId" + idNum, 'datatd', '13%', '', 'display : none', '');
			let five	= createColumnInRow(newRow, '', 'datatd', '12%', '', '', '');
			let eight	= createColumnInRow(newRow, '', 'datatd', '5%', '', '', '');
			let nine	= createColumnInRow(newRow, "consignmentGoodsId" + idNum, 'datatd', '5%', '', 'display : none', '');
			
			let copyStr		= escape(typeofPackingId+'_'+zero+'_'+zero+'_'+zero+'_'+zero+'_'+zero+'_'+qtyAmount+'_'+quantity+'_'+saidToContain+'_'+consignmentGoodsId+"_"+typeofPackingVal+'_'+zero).replace(/\+/g,'%2b');
			let str			= copyStr;
			
			appendValueInTableCol(one, "<input name='checkbox2' id='checkbox2' type=checkbox value='"+str+"'>");
			appendValueInTableCol(two, quantity);
			appendValueInTableCol(three, typeofPackingVal);
			appendValueInTableCol(four, typeofPackingId);
			appendValueInTableCol(five, saidToContain);
			appendValueInTableCol(eight, "<button type='button' id='delete_" + idNum + "' class='btn btn-danger delete'>Delete</button>");
			appendValueInTableCol(nine, consignmentGoodsId);
			
			appendRowInTable(tableBodyId, newRow);
			
			_this.calculateTotalQty();
		}, calculateTotalQty : function() {
			$('#totalQty').html(_this.getTotalAddedArticleTableQuantity());
		}, getTotalAddedArticleTableQuantity : function() {
			let qtyTot			= 0;
			let qtyAmtTot		= 0;
			let TotalQty		= 0;
			
			if(consigAddedtableRowsId.length > 0) {
				for(const element of consigAddedtableRowsId) {
					if($('#quantity' + element).html() > 0)
						qtyTot	+= parseInt($('#quantity' + element).html());

					if($('#qtyAmountTotal' + element).html() > 0)
						qtyAmtTot += parseInt($('#qtyAmountTotal' + element).html());
				}
			}
			
			TotalQty = parseInt(qtyAmtTot);
			
			return TotalQty;
		}, deleteConsignments : function(deleteButtonId) {
			let num					= deleteButtonId;
			let indexVal			= Number(num.split('_')[1]);
			
			$('#articleTableRow' + indexVal).remove();
			
			for( let i = 0; i < consigAddedtableRowsId.length; i++){ if ( consigAddedtableRowsId[i] === indexVal) { consigAddedtableRowsId.splice(i, 1); }}
			
			noOfArticlesAdded --;

			if(noOfArticlesAdded == 0)
				_this.removeConsignmentTables();

			_this.calculateTotalQty();

			next = "quantity";
			setTimeout(function(){ $('#quantity').focus(); }, 10);
			
			return true;
		}, removeConsignmentTables : function() {
			$("#myTable").addClass('hide');
			$("#myTable1").addClass('hide');
					
			$('#myTBody tr').remove();
			$('#myTBody1 tr').remove();
				
			idNum = 0;
			consigAddedtableRowsId	= [];
		}, calculateChargedWeight : function(id) {
			let actualWeight		= parseFloat($('#' + id).val());
			let minChrdWght			= pickupRequestGenerationConfig.MinChargedWeight;
			
			if(pickupRequestGenerationConfig.roundOffChargeWeight)
				$('#chargedWeight').val(Math.ceil(actualWeight / 5) * 5);
			else
				$('#chargedWeight').val(actualWeight);
			
			if(Number(actualWeight) == 0)
				$('#actualWeight').val(actualWeight);
			else if(Number(actualWeight) < Number(minChrdWght))
				$('#chargedWeight').val(minChrdWght);
			
			return true;
		}, editChargedWeight : function(obj) {
			let actualWeight		= parseFloat($('#actualWeight').val());
			let chargedWeight		= parseFloat(obj.value);
			
			if(chargedWeight < actualWeight) {
				showMessage('info', chargedWeightLessThanInfoMsg(actualWeight));
				_this.calculateChargedWeight('actualWeight');
				return false;
			}
		}, resetArticleDetails : function() {
			$('#quantity').val("0");
			$('#typeofPacking').val('');
			$('#consignmentStorageId').val("0");
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
			let quantity	= $('#quantity').val();

			if(ele.id == 'add') {
				next = "quantity"; 
			} else if(ele.id == 'quantity') {
				if(quantity > 0) {
					next = "typeofPacking"; 
				} else if(noOfArticlesAdded > 0) {
					next = "actualWeight";
				} else {
					next = "typeofPacking";
						
					return !(!validateInputTextFeild(1, 'quantity', 'quantity', 'error', quantityErrMsg));
				}
			}
		}, basicFormValidation : function() {
			if (!validateInputTextFeild(1, 'destination', 'destination', 'error', destinationErrMsg))
				return false;
			
			if (!validateInputTextFeild(1, 'consigneeId', 'consigneeId', 'error', 'Please, Enter Valid Consignee Name !')) {
				return false;
			}
			
			if (!validateInputTextFeild(1, 'consigneeName', 'consigneeName', 'error', consineeNameErrMsg)) {
				return false;
			}
			
			if($('#wayBillType').val() == WAYBILL_TYPE_CREDIT && !validateInputTextFeild(1, 'billingPartyName', 'billingPartyName', 'error', validBillingPartyErrMsg)){
				return false;
			}
			
			if(!validateInputTextFeild(1, 'destinationBranchId', 'destination', 'info', properDestinationErrMsg)) {
				return false;
			}
			
			if (!validateInputTextFeild(1, 'actualWeight', 'actualWeight', 'error', actWeightErrMsg)) {
				return false;
			}
			
			if (pickupRequestGenerationConfig.PrivateMarkValidate) {
				if (!validateInputTextFeild(1, 'privateMark', 'privateMark', 'error', privateMarkErrMsg)) {
					return false;
				}
			}
			if (pickupRequestGenerationConfig.invoiceNumberValidate) {
				if (!validateInputTextFeild(1, 'invoiceNumber', 'invoiceNumber', 'error', invoiceNumberErrMsg)) {
					return false;
				}
			}
			
			return !(!_this.validateConsignmentTables());
		}, validateConsignmentTables : function() {
			if($('#myTBody tr').length <= 1 && $('#myTBody1 tr').length <= 1) {
				showMessage('error', addConsignmentErrMsg);
				changeError1('quantity','0','0');
				return false;
			}
				
			hideAllMessages();
			
			return true;
		}, saveWayBill : function() {
			if(!_this.basicFormValidation())
				return false;
			
			let jsonObject		= new Object();
			_this.setJsonDataforCreateWayBill(jsonObject);
			
			jsonObject.isGmtGroup	= true;
			jsonObject.isCustomerAccessBooking	= true;

			let btModalConfirm = new Backbone.BootstrapModal({
				content		:	"Are you sure you want to Generate Pickup Request ?",
				modalWidth	:	30,
				title		:	'Book Token',
				okText		:	'YES',
				showFooter	:	true,
				okCloses	:	true
			}).open();

			btModalConfirm.on('ok', function() {
				showLayer();
				getJSON(jsonObject, CUSTOMER_ACCESS_URL_CONSTANT + '/wayBillWS/generateWaybillFromWeb.do?', _this.pickupRequest, EXECUTE_WITHOUT_ERROR);
				return _this;
			});
			
			btModalConfirm.on('cancel', function() {
				$("#save").removeClass('hide');
				$("#save").focus();
				hideLayer();
			});
		},pickupRequest(response){
			showMessage('info', 'Pickup request generated successfully.');
			_this.resetAllData();
			_this.resetArticleWithTable();
			_this.setPrevLrNo(response.wayBill);
		},openBillSelectionPopup : function(elementId) {
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
			
			jsonObject.destinationBranchId	= $('#destinationBranchId').val();
			jsonObject.chargeType			= $('#chargeType').val();
			jsonObject.billingPartyId		= $('#billingPartyId').val();
			jsonObject.partyMasterId		= $('#partyMasterId').val();
			jsonObject.billingPartyName		= $('#billingPartyName').val();
			
			if ($('#consignorPhn').val() != "0000000000")
				jsonObject.consignorPhn			= $('#consignorPhn').val();
			
			if(jsonObject.chargeTypeId == undefined || jsonObject.chargeTypeId <= 0)
				jsonObject.chargeTypeId	= 3;
			
			jsonObject.consigneePartyMasterId	= $('#consigneeId').val();
			jsonObject.consigneeName			= $('#consigneeName').val();
			jsonObject.consigneeAddress			= $('#consigneeAddress').val();
			
			if ($('#consigneePhn').val() != "0000000000") {
				jsonObject.consigneePhn			= $('#consigneePhn').val();
			}
			
			jsonObject.consigneeGstn		= $('#consigneeGstn').val();
			jsonObject.consignmentAmount	= totalAmount;
			
			if(Number($('#consignorChildPartyId').val()) > 0){
				const result = corporateAccountList.find(account => account.corporateAccountId === Number($('#consignorChildPartyId').val()));

				jsonObject.consignorName		= result.corporateAccountDisplayName;
				jsonObject.consignorPhn			= result.corporateAccountMobileNumber;
				jsonObject.consignorCorpId		= result.corporateAccountId;
				jsonObject.partyMasterId		= result.corporateAccountId;
				jsonObject.consignorGstn		= result.consignorGstn;
				jsonObject.consignorAddress		= result.corporateAccountAddress;
			}else{
				jsonObject.consignorName		= consignorDetails.corporateAccountDisplayName;
				jsonObject.consignorPhn			= consignorDetails.corporateAccountMobileNumber;
				jsonObject.consignorCorpId		= consignorDetails.corporateAccountId;
				jsonObject.partyMasterId		= consignorDetails.corporateAccountId;
				jsonObject.consignorGstn		= consignorDetails.consignorGstn;
				jsonObject.consignorAddress		= consignorDetails.corporateAccountAddress;
			}
			
			jsonObject.actualWeight			= $('#actualWeight').val();
			jsonObject.chargedWeight		= $('#chargedWeight').val();
			jsonObject.privateMark			= $('#privateMark').val();
			jsonObject.remark				= $('#remark').val();
			jsonObject.invoiceNo			= $('#invoiceNumber').val();
			
			jsonObject.sourceBranchId	= executive.branchId;
			jsonObject.wbAccountGroupId	= accountGroupId;
			jsonObject.accountGroupId	= accountGroupId;
			jsonObject.declaredValue	= $('#declaredValue').val();
			jsonObject.podRequired		= pickupRequestGenerationConfig.defaultPodYes ? 2 : 1;
			jsonObject.allowAutoBookingRateFromAccessPortal	= pickupRequestGenerationConfig.allowAutoBookingRateFromRateMaster;
			
			let consignmentColl	= "";
			
			$("input[name='checkbox2']").each( function () {
				consignmentColl	+= $(this).val() + "~";
			});
			
			jsonObject.formNumber			= checkBoxArray.join(',');
			jsonObject.consignmentColl		= consignmentColl;
			jsonObject.FormTypes = E_WAYBILL_ID;
			jsonObject.status	= REQUEST_GENERATE;
			jsonObject.bookingMode	= 1;
			
		}, resetAllData : function() {
			$('#destination').val('');
			$('#branchId').val('0');
			$('#destinationRegionId').val(0);
			$('#actualWeight').val("0");
			$('#chargedWeight').val("0");
			$('#weigthFreightRate').val("0");
			$('#weightAmount').val("0");
			$('#billingPartyName').val("");
			$('#partyMasterId').val("0");
			$('#partyOrCreditorId').val("0");
			$('#consigneeName').val("");
			$('#consigneePhn').val("");
			$('#consigneeGstn').val("");
			$('#consigneeAddress').val("");
			$('#consigneePin').val("");
			$('#consigneeContactPerson').val("");
			$('#consigneeCorpId').val("0");
			//$('#consigneePartyMasterId').val("0");
			$('#destinationBranchId').val(0);
			$('#destinationStateId').val("0");
			$('#typeOfLocation').val("0");
			$('#destination').val("");
			$('#privateMark').val('');
			$('#invoiceNumber').val('');
			$('#remark').val('');
			$('#declaredValue').val('');
			checkBoxArray = new Array();
			$("#isValidEwaybillMsg").addClass('hide');
			$('#singleEwaybillNo').val('');
		}, setPrevLrNo : function(data) {
			$('#bookedLRDetails').removeClass('hide');
			$('#prevlrnum').html('<a style="" id="lrDetails">' + data.wayBillNumber + '</a>');
			$('#prevwbtype').html(data.wayBillType);
			
			/*$("#lrDetails").bind("click", function() {
				_this.openWindowForView(data.wayBillId, 0);
			});*/
		}, addMultipleEwayBillNo : function() {
			$('.modal-backdrop').show();
			$("#addEwayBillModal").modal({
				backdrop: 'static',
				focus	: this,
				keyboard: false
			});
			setTimeout(function(){ $('#ewaybill0').focus(); }, 500);
		}, validateEwayBill : function(eWaybill) {
			if(eWaybill.value.length == 12) {
				let textBoxCount = document.getElementById('eWayBillNumberId').getElementsByTagName('input').length;
				for(let i = 0; i < textBoxCount; i++) {
					let ele = document.getElementById('ewaybill' + i);
					
					if(eWaybill.id != ele.id) {
						if(eWaybill.value == $('#ewaybill' + i).val()) {
							showMessage('error', '<i class="fa fa-times-circle"></i> Enter another EwayBill No.');
							$('#' + eWaybill.id).val('');
							return false;
						} else
							$('#btSubmit').prop('disabled', false);
					} else {
						$('#btSubmit').prop('disabled', false);
						$('#btSubmit').focus();
					}
				}
				_this.updateEwaybillId(textBoxCount);
				_this.addNewRow();
			}
		}, addNewRow : function() {
			let inputCount = document.getElementById('eWayBillNumberId').getElementsByTagName('input').length;
		
			for(let i = 0; i < inputCount; i++) {
				let ewaybillVal		= $('#ewaybill' + i).val();
		
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
			.clone().val('')	  // CLEAR VALUE.
			.attr('style', 'margin:3px 0;')
			.attr('id', 'ewaybill' + inputCount)	 // GIVE IT AN ID.
			.appendTo("#eWayBillNumberId");
		
			let	count	= inputCount;
				next	= "ewaybill" + count;
				$('#ewaybill' + count).focus();
			_this.updateEwaybillId(count);
		}, removeTextValue : function() {
			textBoxCount = document.getElementById('eWayBillNumberId').getElementsByTagName('input').length;
			if (textBoxCount != 1) {
				
				if(validateEwaybillNumberThroughApi) {
					if(eWayBillNumberArray != null && eWayBillNumberArray.length > 0) {
						for(let i = 0; i < eWayBillNumberArray.length; i++) {
							if(eWayBillNumberArray[i] == $('#ewaybill' + (textBoxCount - 1)).val().trim()) {
								if($('#ewaybillMsg' + i).exists())
									$('#ewaybillMsg' + i).remove();
								
								eWayBillNumberArray.splice(i,1);
							}
						}
					}
				}
		
				$('#ewaybill' + (textBoxCount - 1)).remove(); textBoxCount = textBoxCount - 1;
			}	
		}, viewEwaybillNumber : function() {
			if(groupConfiguration.showEwaybillNumberOnBookingPage == 'true'){
				$("#viewEwaybillTable").css("display", "none");
				$('#eWayBillDetails1').empty();
				setTimeout(function(){
					if(checkBoxArray === undefined	|| checkBoxArray.length == 0){
						$('#eWayBillDetails').html('&#9746; No records found !');
						return false;
					}
		
					var columnArray		= new Array();
		
					$("#viewEwaybillTable").css("display", "block");
		
					for (var i = 0; i < checkBoxArray.length; i++) {
						var obj		= checkBoxArray[i];
						columnArray.push("<td style='text-align: center; vertical-align: middle;font-size: 15px;'>" + (i + 1) + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;font-size: 15px;' id='ewaybillNumber" + i + "' name='ewaybillNumber" + i + "' value='"+ obj +"'>" + (obj) + "</td>");
						$('#viewEwaybillTable tbody').append('<tr id="ewaybillNumber'+ i +'">' + columnArray.join(' ') + '</tr>');
		
						columnArray	= [];
					}
				},100);
			}
		}, submitEWayBillData : function() {
			isFromViewEWayBill	= false;
			if(!_this.addEwayBillData())
				return false;
		
			if(!_this.validateEwayBillNumberByApi())
				return false;
			
		}, addEwayBillData : function() {
			let inputCount = document.getElementById('eWayBillNumberId').getElementsByTagName('input').length;
			let temp = new Array();
		
			for(let i = 0; i < inputCount; i++) {
				let ewaybillVal		= $('#ewaybill' + i).val();
				
				if(ewaybillVal != undefined) {
					if(ewaybillVal == '' && inputCount == 1) {
						showMessage('error', 'Enter E-Way Bill Number');
						$('#ewaybill' + i).css('border-color', 'red');
						$('#ewaybill' + i).focus();
						return false;
					 } else if(ewaybillVal != '' && ewaybillVal.length != 12) {
						showMessage('error', '<i class="fa fa-times-circle"></i> Enter 12 digit E-Way Bill ' + ewaybillVal);
						$('#ewaybill' + i).css('border-color', 'red');
						$('#ewaybill' + i).focus();
						next	= "ewaybill" + i;
						return false;
					 }
					
					for(let j = 0; j < ewaybillVal.length; j++) {
						let code = ewaybillVal.charCodeAt(j);
		
						if(!(code >= 65 && code <= 91) && !(code >= 97 && code <= 121) && !(code >= 48 && code <= 57)) { 
							$('#ewaybill' + i).val('');
							$('#ewaybillNumber' + i).val('');
							showMessage('error', 'Enter Only Numbers !!');
							return false;
						}
					}
				}
			}
		
			if(validateEwaybillNumberThroughApi) {
				eWayBillNumberArray	= new Array();
				
				for(let i = 0; i < inputCount; i++) {
					if($('#ewaybill' + i).exists() && $('#ewaybill' + i).val() != '' && $('#ewaybill' + i).val().length == 12)
						eWayBillNumberArray.push($('#ewaybill' + i).val());
				}
			} else {
				if(checkBoxArray.length == 0) {
					for(let i = 0; i < inputCount; i++) {
						if($('#ewaybill' + i).exists() && $('#ewaybill' + i).val() != '')
							checkBoxArray.push($('#ewaybill' + i).val());
					}
				} else {
					for(let i = 0; i < inputCount; i++) {
						if($('#ewaybill' + i).exists() && $('#ewaybill' + i).val() != '' && !isValueExistInArray(checkBoxArray, $('#ewaybill' + i).val()))
							temp.push($('#ewaybill' + i).val());
					}
					
					if(temp.length > 0) {
						for(let i = 0; i < temp.length; i++)
							checkBoxArray.push(temp[i]);
					}
				}
				
				_this.resetModel();
				$('#addEwayBillModal').modal('hide');
			}
			
			return true;
		}, validateEwayBillNumberByApi : function() {
			if(validateEwaybillNumberThroughApi && eWayBillNumberArray != null && eWayBillNumberArray.length > 0) {
					showLayer();
		
					eWayBillValidationHM	= new Map();
					let jsonObject			= new Object();
		
					jsonObject.eWayBillNumberArray	= eWayBillNumberArray.join(",");
					jsonObject.moduleId				= 105;
					jsonObject.allowPartyPopupOnEwayBillsGstNumber	= groupConfiguration.allowPartyPopupOnEwayBillsGstNumber;
					jsonObject.executiveId				 = localStorage.getItem("currentExecutiveId");
					jsonObject.accountGroupId			 = accountGroupId;
					$.ajax({
						type		:	"POST",
						url			:	CUSTOMER_ACCESS_URL_CONSTANT + '/FetchEwayBillDataWS/validateEwayBillNumberByApi.do',
						data		:	jsonObject,
						dataType	:	'json',
						success		:	function(data) {
							hideLayer();
							
							if(data == undefined) {
								showMessage('error', 'No Record Found !');
								return;
							}
								
							if(data.exceptionCode == 404) {
								showMessage('error', 'Server not found !');
								
								eWayBillNumberArray	= new Array();
								let inputCount = textBoxCount;
							
								for(let i = 0; i < inputCount; i++) {
									if($('#ewaybill' + i).exists() && $('#ewaybill' + i).val() != '' && $('#ewaybill' + i).val().length == 12) {
										eWayBillNumberArray.push($('#ewaybill' + i).val());
										checkBoxArray.push($('#ewaybill' + i).val());
									}
								}
		
								_this.resetModel();
								textBoxCount = 1;
								$('#addEwayBillModal').modal('hide');
								return;
							}
							
							ewaybillValidDetails	= data.ewaybillDetailsObj;
							eWayBillValidationHM	= data.eWayBillValidationHM;
							
							if(data.eWayBillHM != undefined) {
								for (let key in data.eWayBillHM)
									eWayBillHM[key] = (data.eWayBillHM)[key];
							}
							
							if(data.eWayBillDetailsIdHM != undefined) {
								for (let key in data.eWayBillDetailsIdHM)
									eWayBillDetailsIdHM[key] = (data.eWayBillDetailsIdHM)[key];
							}
							
							if(groupConfiguration.showExtraSingleEwaybillField && $('#singleEwaybillNo').val() != ''
							&& typeof eWayBillValidationHM !== 'undefined' && eWayBillValidationHM != null) {
								for(let key in eWayBillValidationHM) {
									let eWayBillValidationDetails	= eWayBillValidationHM[key];
								
									if(!eWayBillValidationDetails.validEWayBill) {
										showMessage('error', 'Enter Valid E-Way Bill Number !');
										
										$("#isValidEwaybillMsg").addClass('hide');
										_this.removeEwaybillFromArray();
										
										if(groupConfiguration.resetSingleEWayBillField)
											$('#singleEwaybillNo').val('');
											
										$("#singleEwaybillNo").focus();
										return;
									}		
								}
							}
							
							if(groupConfiguration.validateDuplicateEwaybillNumberOnLrNumber 
							 && typeof eWayBillValidationHM !== 'undefined' && eWayBillValidationHM != null) {
								for(let key in eWayBillValidationHM) {
									let ewayBillDetail	= eWayBillValidationHM[key];
								
									if(ewayBillDetail.usedEWayBillNumber) {
										showMessage('error', "E-Waybill number is already added in this LR. " + ewayBillDetail.usedEwayBillLrNo);
										
										$("#isValidEwaybillMsg").addClass('hide');
										_this.removeEwaybillFromArray();
										
										if(groupConfiguration.resetSingleEWayBillField)
											$('#singleEwaybillNo').val('');
											
										$("#singleEwaybillNo").focus();
										return;
									}		
								}
							}
							
							setConeeAddressFromEwaybillNoAPI	= data.setConeeAddressFromEwaybillNoAPI != undefined && data.setConeeAddressFromEwaybillNoAPI;
							
							if(setConeeAddressFromEwaybillNoAPI) {
								if(data.getEwaybillDetails != null && data.getEwaybillDetails != undefined
									&& data.getEwaybillDetails.consgineeAddress != undefined && data.getEwaybillDetails.consgineeAddress != "" && data.getEwaybillDetails.consgineeAddress != null)
										$("#consigneeAddress").val(data.getEwaybillDetails.consgineeAddress);
								
								if(ewaybillValidDetails != null && ewaybillValidDetails != undefined
									&& ewaybillValidDetails.consginorAddress != undefined && ewaybillValidDetails.consgineeAddress != "" &&	 ewaybillValidDetails.consgineeAddress != null)
										$("#consigneeAddress").val(data.getEwaybillDetails.consgineeAddress);
							}
							
							if(typeof eWayBillValidationHM !== 'undefined' && eWayBillValidationHM != null) {
								if(groupConfiguration.showDataByEwaybillApiOnBookingScreen) {
									if(groupConfiguration.allowPartyPopupOnEwayBillsGstNumber
										&& data.consignorGstnList != undefined && data.consigneeGstnList != undefined && data.consignorGstnList.length > 0 && data.consigneeGstnList.length > 0){
										showPartyDetailsPopUpOnMultipleGstn(data);
									} else
										_this.showDataByEwaybillApi(data);
								}
								
								return _this.validateEWayBillNumbers();
							}
						}
					});
			}
		
			return true;
		}, showDataByEwaybillApi : function(data) {
			let ewayBillData		= data.ewaybillDetailsObj;
			let ewayBilldetails		= data.getEwaybillDetails;
			
			let consigneeGstn	= null;
			let declareValue	= 0;
			let consgineeName	= null;
			let consigneeAddress	= null;
									
			if(ewayBillData) {
				if(ewayBillData.gstin_of_consignee && ewayBillData.gstin_of_consignee != "")
					consigneeGstn = ewayBillData.gstin_of_consignee;
											
				if(ewayBillData.declareValue > 0)
					declareValue	= ewayBillData.declareValue;
					
				consigneeAddress	= ewayBillData.consgineeAddress;
			}
									
			if(ewayBilldetails) {
				consgineeName	= ewayBilldetails.consgineeName;
						
				if(consigneeGstn == null)
					consigneeGstn = ewayBilldetails.gstin_of_consignee;
										
				if(declareValue == 0)
					declareValue = ewayBilldetails.declareValue;
					
				consigneeAddress	= ewayBilldetails.consgineeAddress;
			}
									
			$("#declaredValue").val(declareValue);
			
			_this.setMultipleInvoiceAndDeclareValue();
			
			let jsonObject				= new Object();
			jsonObject.consigneeGstn		= consigneeGstn;
			jsonObject.consigneeName		= consgineeName;
			jsonObject.consigneeAddress		= consigneeAddress;
			
			if(ewayBillData != undefined && $('#consigneeName').val() == '')
				_this.partyCheckingOnGstNumber(jsonObject);
			
			
		}, removeEwaybillFromArray : function() {
			let ewaybillVal = $('#singleEwaybillNo').val();
			
			if(typeof eWayBillNumberArray !== 'undefined' && eWayBillNumberArray != null && eWayBillNumberArray.includes(ewaybillVal)) {
				eWayBillNumberArray = eWayBillNumberArray.filter(item => item !== ewaybillVal);
				checkBoxArray		= checkBoxArray.filter(item => item !== ewaybillVal);
			}
		}, setMultipleInvoiceAndDeclareValue : function() {
			if(!groupConfiguration.addMultipleInvoiceAndDeclareValueOfAllEWaybill)
				return;
			
			let invoiceArr	= [];
			let declareArr	= [];
			
			for(let key in eWayBillHM) {
				let data	= eWayBillHM[key];
				
				if(data.invoiceNumber != undefined)
					invoiceArr.push(data.invoiceNumber);
					
				declareArr.push(data.declareValue);
			}
			
			$("#invoiceNumber").val(invoiceArr.join("/"));
			$("#declaredValue").val(declareArr.reduce(function(pv, cv) { return pv + cv; }, 0));
		}, validateEWayBillNumbers : function() {
	
			if(validateEwaybillNumberThroughApi) {
				if(isFromViewEWayBill) {
					if(!_this.displayEWayBillMsgOnViewEWayBill(eWayBillValidationHM))
						return false;
				} else if(!_this.displayEWayBillMsg(eWayBillValidationHM))
					return false;
					
				if(isFromViewEWayBill)
					_this.reCalculateEwayBillAfterApiValidation();
				else
					_this.addEwayBillDataAfterApiValidation();
			}
			
			return true;
		}, displayEWayBillMsgOnViewEWayBill : function(eWayBillValidationHM) {
			let isInvalidEWayBill	= false;
			$('.ewaybillViewMsg').remove();
			
			$('#eWayBillDetails :input').map(function() {
				let type = $(this).prop("type");
				
				if(type == "text") {
					if(typeof eWayBillValidationHM !== 'undefined' && eWayBillValidationHM != null) {
						for(let key in eWayBillValidationHM) {
							let eWayBillValidationDetails	= eWayBillValidationHM[key];
							
							if($(this).val().trim() == eWayBillValidationDetails.ewaybillNumber) {
								if(!eWayBillValidationDetails.validEWayBill) {
									changeTextFieldColor($(this).id, '', '', 'red');
									$('#' + $(this).id).css("color", "red").val(eWayBillValidationDetails.ewaybillNumber);
									$('#' + $(this).id).after( "<span class='ewaybillViewMsg' id='ewaybillViewMsg" + $(this).data('value') +"' style='display:block'><font color='red'><b>Invalid E-WayBill</b></font></span>");
									isInvalidEWayBill = true;
								} else {
									changeTextFieldColor($(this).id , '', '', 'green');
									$('#' + $(this).id).css("color", "green").val(eWayBillValidationDetails.ewaybillNumber);
									$('#' + $(this).id).after( "<span class='ewaybillViewMsg' id='ewaybillViewMsg" + $(this).data('value') +"' style='display:block'><font color='green'><b>Valid E-WayBill</b></font></span>");
								}
							} 
						}
					}
				}
			});
			
			return !isInvalidEWayBill;
		}, displayEWayBillMsg : function(eWayBillValidationHM) {
			let inputCount = document.getElementById('eWayBillNumberId').getElementsByTagName('input').length;
			let isInvalidEWayBill	= false;
			$('.ewaybillViewMsg').remove();
			
			for(let i = 0; i < inputCount; i++) {
				if($('#ewaybill' + i).exists() && $('#ewaybill' + i).val() != '') {
					if(typeof eWayBillValidationHM !== 'undefined' && eWayBillValidationHM != null) {
						for(let key in eWayBillValidationHM) {
							let eWayBillValidationDetails	= eWayBillValidationHM[key];
							
							if($('#ewaybill' + i).val().trim() == eWayBillValidationDetails.ewaybillNumber) {
								if(!eWayBillValidationDetails.validEWayBill) {
									changeTextFieldColor('ewaybill' + i, '', '', 'red');
									$('#ewaybill' + i).css("color", "red").val(eWayBillValidationDetails.ewaybillNumber);
									$('#ewaybill' + i).after( "<span class='ewaybillViewMsg' id='ewaybillMsg" + i +"' style='display:block'><font color='red'><b>Invalid E-WayBill</b></font></span>");
									isInvalidEWayBill = true;
								} else {
									changeTextFieldColor('ewaybill' + i , '', '', 'green');
									$('#ewaybill' + i).css("color", "green").val(eWayBillValidationDetails.ewaybillNumber);
									$('#ewaybill' + i).after( "<span class='ewaybillViewMsg' id='ewaybillMsg" + i +"' style='display:block'><font color='green'><b>Valid E-WayBill</b></font></span>");
								}
							} 
						}
					}
				}
			}
		
			return !isInvalidEWayBill;
		}, reCalculateEwayBillAfterApiValidation : function() {
			checkBoxArray	= new Array();
			
			$('#eWayBillDetails tr').each(function() {
				$(this).find('input').each(function() {
					if($(this).val() != '')
						checkBoxArray.push($(this).val());
				})
			});
		
			$('#myModal').modal('hide');
			$('.ewaybillViewMsg').remove();
			
			if(checkBoxArray.length > 0) {
				$("#isValidEwaybillMsg").removeClass('hide');
				$("#noEwaybillMsg").addClass('hide');
			} else {
				$("#isValidEwaybillMsg").addClass('hide');
				$("#noEwaybillMsg").removeClass('hide');
				$("#invoiceNumber").val('');
				$("#declaredValue").val('');
				eWayBillHM	= {};
				eWayBillDetailsIdHM = {};
			}
		}, addEwayBillDataAfterApiValidation : function() {
			if(document.getElementById('eWayBillNumberId')) {
				let inputCount = document.getElementById('eWayBillNumberId').getElementsByTagName('input').length;
				let temp = new Array();
		
				if(checkBoxArray.length == 0) {
					for(let i = 0; i < inputCount; i++) {
						if($('#ewaybill' + i).exists() && $('#ewaybill' + i).val() != ''
							&& typeof eWayBillValidationHM !== 'undefined' && eWayBillValidationHM != null) {
							for(let key in eWayBillValidationHM) {
								let eWayBillValidationDetails	= eWayBillValidationHM[key];
		
								if(eWayBillValidationDetails.ewaybillNumber == $('#ewaybill' + i).val().trim()
									&& eWayBillValidationDetails.validEWayBill)
										checkBoxArray.push($('#ewaybill' + i).val());
							}
						}
					}
				} else {
					for(let i = 0; i < inputCount; i++) {
						if(isValueExistInArray(checkBoxArray, $('#ewaybill' + i).val())) {
							showMessage('error', '<i class="fa fa-times-circle"></i>' + $("#ewaybill" + i).val() + ' E-Way Bill Number already added');
							return false;
						} else if(typeof eWayBillValidationHM !== 'undefined' && eWayBillValidationHM != null) {
							for(let key in eWayBillValidationHM) {
								let eWayBillValidationDetails	= eWayBillValidationHM[key];
		
								if(eWayBillValidationDetails.ewaybillNumber == $('#ewaybill' + i).val().trim()
									&& eWayBillValidationDetails.validEWayBill)
									temp.push($('#ewaybill' + i).val());
							}
						}
					}
					
					if(temp.length > 0 && typeof eWayBillValidationHM !== 'undefined' && eWayBillValidationHM != null) {
						for(const element of temp) {
							for(let key in eWayBillValidationHM) {
								let eWayBillValidationDetails	= eWayBillValidationHM[key];
		
								if(eWayBillValidationDetails.ewaybillNumber == element && eWayBillValidationDetails.validEWayBill)
									checkBoxArray.push(element);
							}
						}
					}
				}
				
				_this.resetModel();
				textBoxCount = 1;
				$('#addEwayBillModal').modal('hide');
		
				if(groupConfiguration.showEwaybillPopUpOnLoad && groupConfiguration.DefaultFormType == 1018) {
					$('#singleFormTypes').val(1018);
					$('#eWayBillNumberDiv').css('display', 'inline');
				}
				
				if(validateEwaybillNumberThroughApi || groupConfiguration.showEwaybillPopUpOnLoad) {
					if(checkBoxArray.length > 0) {
						$("#isValidEwaybillMsg").removeClass('hide');
						$("#noEwaybillMsg").addClass('hide');
					} else {
						$("#isValidEwaybillMsg").addClass('hide');
						$("#noEwaybillMsg").removeClass('hide');
						$("#invoiceNumber").val('');
						$("#declaredValue").val('');
						eWayBillHM	= {};
						eWayBillDetailsIdHM = {};
					}
		
					$('.ewaybillViewMsg').remove();
				}
			}	
		}, resetModel : function() {
			if(document.getElementById('eWayBillNumberId') == null) return;
			
			let textBoxCount = document.getElementById('eWayBillNumberId').getElementsByTagName('input').length;
			$('#ewaybill0').val('');
		
			if (textBoxCount != 1) {
				for(let i = 1; i < textBoxCount; i++) {
					$('#ewaybill' + i).remove();
				}
			}
			$('.ewaybillViewMsg').remove();
			$('#ewaybill0').css("border-color", "").css("color", "")
		}, viewEwayBillNo : function() {
			$("#myModal").modal({
				backdrop: 'static',
				keyboard: false
			});
		
			setTimeout(function(){
				if(checkBoxArray.length == 0) {
					$('#eWayBillDetails').html('&#9746; No records found !');
					return false;
				}
		
				$('#eWayBillDetails').empty();
		
				for(let i = 0; i < checkBoxArray.length; i++) {
					let row		= createRowInTable("eway" + i, '', '');
		
					let col		= createColumnInRow(row, "ewaybill_" + i, '', '95%', '', '', '');
					let col2	= createColumnInRow(row, "td_" + i, '', '5%', '', '', '');
		
					let inputAttr		= new Object();
					let input			= null;
		
					inputAttr.id			= 'ewaybillNumber' + i;
					inputAttr.type			= 'text';
					inputAttr.value			= checkBoxArray[i];
					inputAttr.name			= 'ewaybill' + i;
					inputAttr.class			= 'form-control';
					inputAttr.style			= 'width: 100%;text-align: left;';
					inputAttr.onkeypress	="return noNumbers(event)"
					inputAttr.maxlength	= 12;
		
					input	= createInput(col, inputAttr);
					input.attr( {
						'data-value' : i
					});
					input.on("click blur", function(){
						_this.validateEwayBillNumber(this);
					});
		
					let buttonRemoveJS		= new Object();
					let buttonRemove		= null;
		
					buttonRemoveJS.id		= 'remove' + i;
					buttonRemoveJS.name		= 'remove' + i;
					buttonRemoveJS.value	= 'Remove';
					buttonRemoveJS.type		= 'button';
					buttonRemoveJS.class	= 'btn btn-danger glyphicon glyphicon-remove';
					buttonRemoveJS.style	= 'width: 36px;';
		
					buttonRemove			= createButton(col2, buttonRemoveJS);
					buttonRemove.attr({
						'data-value' : i
					});
					buttonRemove.on("click", function() {
						_this.removeEwayBill(this)
					})
					col2.append('&emsp;');
					$('#eWayBillDetails').append(row);
				}
		
				$('#btOk').prop('disabled', false);
				
			},100);
		}, removeEwayBill : function(obj) {
			let dataValue		= $(obj).data('value');
			let ewaybillNumber	= $('#ewaybillNumber' + dataValue).val();
			
			$('#eway' + dataValue).remove();
			$('#btOk').prop('disabled', false);
			
			if(checkBoxArray != undefined && checkBoxArray.length > 0)
				checkBoxArray		= checkBoxArray.filter(item => item !== dataValue);
			
			if(eWayBillHM != undefined) {
				delete eWayBillHM[ewaybillNumber];
				_this.setMultipleInvoiceAndDeclareValue();
			}
			
			if(eWayBillDetailsIdHM != undefined) {
				delete eWayBillDetailsIdHM[ewaybillNumber];
			}
			
			$('#singleEwaybillNo').val('');
		}, validateEwayBillNumber : function(eWaybill) {
			if(eWaybill.value.length == 12) {
				let textBoxCount = document.getElementById('eWayBillDetails').getElementsByTagName('input').length;
				
				for(let i = 0; i < textBoxCount; i++) {
					let ele = document.getElementById('ewaybillNumber' + i);
					
					if(ele == null)
						continue;
					
					if(eWaybill.id != ele.id) {
						if(eWaybill.value == $('#ewaybillNumber' + i).val()) {
							showMessage('error', '<i class="fa fa-times-circle"></i> Enter another EwayBill No.');
							changeTextFieldColor(eWaybill.id, '', '', 'red');
							$('#' + eWaybill.id).val('');
							$('#' + eWaybill.id).focus();
							return false;
						} else {
							changeTextFieldColor(eWaybill.id, '', '', 'blue');
							$('#btOk').prop('disabled', false);
						}
					} else {
						changeTextFieldColor(eWaybill.id, '', '', 'blue');
						$('#btOk').prop('disabled', false);
					}
				}
			}
		}, reCalculateEwayBill : function() {
			textBoxCount	= 1;
			let validEwabill	= true;
		
			$('#eWayBillDetails tr').each(function() {
				$(this).find('input').each(function() {
					if($(this).val() == '') {
						showMessage('error', 'Enter E-Way Bill Number');
						validEwabill	= false;
					} else if($(this).val().length != 12) {
						showMessage('error', '<i class="fa fa-times-circle"></i> Enter 12 digit E-Way Bill ' + $(this).val());
						validEwabill	= false;
					}
				});
			});
			
			if(validEwabill) {
				if(validateEwaybillNumberThroughApi) {
					eWayBillNumberArray	= new Array();
					isFromViewEWayBill	= true;
					
					let inputCount = document.getElementById('eWayBillDetails').getElementsByTagName('input').length;
					
					if(inputCount > 0) {
						$('#eWayBillDetails tr').each(function() {
							$(this).find('input').each(function() {
								if($(this).val() != '')
									eWayBillNumberArray.push($(this).val());
							})
						});
						
						_this.validateEwayBillNumberByApi();
					} else
						_this.reCalculateEwayBillAfterApiValidation();
				} else {
					checkBoxArray	= new Array();
					
					$('#eWayBillDetails tr').each(function() {
						$(this).find('input').each(function() {
							if($(this).val() != '')
								checkBoxArray.push($(this).val());
						})
					});
					
					$('#myModal').modal('hide');
				}
			}
		
			if(typeof calculateCustomFormCharge != 'undefined') calculateCustomFormCharge();
		},validateSingleEwaybillNumber : function() {
			eWayBillNumberArray	= [];	
			checkBoxArray		= [];
			
			let ewNumber = $('#singleEwaybillNo').val();
			
			if(ewNumber != '') {
				eWayBillNumberArray.push(ewNumber);
				checkBoxArray.push(ewNumber);
				_this.validateEwayBillNumberByApi();
			}
		}, partyCheckingOnGstNumber : function(jsonObject) {
			jsonObject.isAlloWPartyAtAnyLevel	= true;
			jsonObject.singleEwaybillNo		= $('#singleEwaybillNo').val();
			jsonObject.destinationBranchId	= $('#branchId').val();
			jsonObject.wayBillTypeId		= $('#wayBillType').val();
			jsonObject.executiveId				 = localStorage.getItem("currentExecutiveId");
			jsonObject.accountGroupId			 = accountGroupId;
			
			if($('#destination').val() == ""){
				$("#destination").focus();
				showMessage('error', 'Enter Destination !');
				return false;
			} else {
				showLayer();
				$.ajax({
					type: "POST",
					url: CUSTOMER_ACCESS_URL_CONSTANT + '/partyMasterWS/checkAndInsertPartyOnGSTEwaybill.do',
					data: jsonObject,
					dataType: 'json',
					success: function(data) {
						let consigneeDetails = data.ConsigneeDetails;
	
						hideLayer();
		
						if (consigneeDetails != undefined)
							_this.setConsigneeEwaybill(consigneeDetails, jsonObject.consigneeGstn);
						else
							$("#consigneeName").val(jsonObject.consigneeName);
		
						if (groupConfiguration.showExtraSingleEwaybillField && $('#singleEwaybillNo').val() > 0) {
							if (consignorDetails != undefined && consigneeDetails != undefined) {
								if($('#billingPartyId').val() == 0 && $('#wayBillType').val() == WAYBILL_TYPE_CREDIT) {
									$('#billingPartyName').focus();
									next = 'chargeType';
								} else
									$("#chargeType").focus();
							}
						}
		
						if(_this.isValidGSTChecking()) {
							if($("#destination").val() == '')
								$("#destination").focus();
							else{
								if($("#consignorName").val() == '')
									$("#consignorName").focus();
								else if($("#consigneeName").val() == '')
									$("#consigneeName").focus();
								else
									$("#quantity").focus();
							}
						}
					}
				});
			}
		}, setConsigneeEwaybill : function(party, gstn) {
			$("#consigneeName").val(party.corporateAccountDisplayName);
			$("#consigneeGstn").val(gstn);
			$("#consigneePhn").val(party.corporateAccountMobileNumber);
			
			if(!setConeeAddressFromEwaybillNoAPI || $("#consigneeAddress").val() == '')
				$("#consigneeAddress").val(party.corporateAccountAddress);
				
			$("#consigneeId").val(party.corporateAccountId);
		}, isValidGSTChecking : function() {
			if (!groupConfiguration.gstValidationGroupLevel && !groupConfiguration.gstValidationBranchLevel)
				return false;
		
			if (groupConfiguration.gstValidationBranchLevel && groupConfiguration.branchIdsForGstValidation != undefined) {
				let branchIdsArray = (groupConfiguration.branchIdsForGstValidation).split(',');
		
				return isValueExistInArray(branchIdsArray, branchId);
			}
			
			return true;
		},updateEwaybillId : function(id){
			$('#ewaybill' + id).keyup(function(event){
				_this.validateEwayBill(this);
			});
		}, saveNewParty : function() {
			if($('#branchId').val() > 0) {
				let jsonObject					  = new Object();
								
				jsonObject.partyTypeEle_primary_key	   = CORPORATEACCOUNT_TYPE_BOTH;
				jsonObject.partyNameEle				   = $('#consigneeName').val().toUpperCase();;
				jsonObject.addressEle				 = $('#destination').val();
				$('#consigneeAddress').val(jsonObject.partyAddress);
				if ($('#consigneePhn').val() != "0000000000")
					jsonObject.mobileNumber1Ele		 = $('#consigneePhn').val();
							
				jsonObject.branchEle			 = $('#branchId').val();
				jsonObject.gstnEle				 = $('#consigneeGstn').val();
				jsonObject.displayNameEle		 = $('#consigneeName').val().toUpperCase();
				jsonObject.executiveId			 = localStorage.getItem("currentExecutiveId");
				jsonObject.accountGroupId		 = accountGroupId;
													
				$.ajax({
					type		: "POST",
					url			   : CUSTOMER_ACCESS_URL_CONSTANT+'/partyMasterWS/addNewParty.do',
					data		: jsonObject,
					dataType	: 'json',
					success: function(data) {
						var newPartyId = parseInt(data.partyId);
						if(newPartyId > 0) {
							 $('#consigneeId').val(newPartyId);
						}else {
							alert('There was an error while saving, please try again !');
							return;
						}
					}
				});
			}
		}, openWindowForView : function(id, branchId) {
			encryptGlobalParams({type: 1, url: 'TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId=' + id + '&NumberType=' + LR_SEARCH_TYPE_ID + '&BranchId=' + branchId});
		}, callTokenBookingShortcut : function() {
			shortcut.add('Alt+s', function(){
				_this.saveWayBill();
			});
		}
	});
});
