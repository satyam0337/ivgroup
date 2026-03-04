define([  
		PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
		,'slickGridWrapper2'
		,PROJECT_IVUIRESOURCES + '/resources/js/module/view/discountMaster/updateDiscountMasterDetails.js'
		,'selectizewrapper'
		,'JsonUtility'
		,'messageUtility'
		,'/ivcargo/resources/js/generic/urlparameter.js'
		,'autocomplete'
		,'autocompleteWrapper'
		,'nodvalidation'
		,'focusnavigation'//import in require.config
		,'bootstrapSwitch'
		,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
		,PROJECT_IVUIRESOURCES + '/resources/js/bootstrap/bootstrap-clockpicker.min.js'
		],
		function(Selection, SlickGridWrapper, UpdateDiscountMaster, Selectizewrapper) {
	'use strict';
	var jsonObject = new Object(), myNod,  _this = '', corporateAccountId = 0, branchList = null, discountTypeList = null;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/discountMasterWS/getDiscountMasterElementConfiguration.do?',_this.setMasterElements, EXECUTE_WITH_ERROR);
			return _this;
		}, setMasterElements : function (response){
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/discountMaster/discountMaster.html",function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				hideLayer();
				
				branchList 			= response.branchList;
				discountTypeList 	= response.discountTypeList;

				$("#add").click(function() {
					_this.addDiscount(response);
				});
				
				$("#viewDiscountMasterDetails").click(function() {
					_this.viewDiscountMaster();
				});
			});
			
			return _this;
		}, addDiscount : function(response) {
			$(".add-view-discount").empty();
			$("#discountMasterDetailsDiv").empty();
			$('#bottom-border-boxshadow').addClass('hide');
			$(".update-modal-body").empty();
			
			showLayer();
			
			$(".add-view-discount").load( "/ivcargo/html/module/discountMaster/addDiscountMaster.html", function() {
				_this.setCategory();
				_this.setChargeType();

				if(response.packingTypeForGroupList != undefined)
					response.multiplePackingTypesSelection		= response.packingTypeForGroupList.length;

				Selection.setBranchAutocompleteWithSelectize(response);
				Selection.setBookingCharges(response);
				Selection.setPackingTypeForGroups(response);
				
				response.partyNameElement	= $('#partyNameEle');
				response.gstElement			= $('#gstNoEle');
				response.partyMobileElement = $('#mobileNoEle');
								
				Selection.setPartyAutocomplete(response);
				Selection.setGSTAutocomplete(response);
				Selection.setPartyMobileNumberAutocomplete(response);
				
				$('#partyNameEle, #gstNoEle, #mobileNoEle').change(function() {
					_this.getPartyDetails();
				});
				
				_this.creatrAndSetTimePicker();
				
				myNod = _this.addElementInNod();
				_this.bindEvents();
				
				$(".add-view-discount").removeClass('hide');
				$("#isPercentCheckDiv").addClass('hide');
				hideLayer();
			});
		}, addElementInNod : function() {
			myNod = nod();
				
			myNod.configure({
				parentClass:'validation-message'
			});
			
			myNod.add({
				selector: '#categoryTypeEle',
				validate: 'validateAutocomplete:#categoryTypeEle',
				errorMessage: 'Enter Proper Category'
			});
				
			myNod.add({
				selector: '#discountTypeEle',
				validate: 'presence',
				errorMessage: 'Select proper Charge Type !'
			});
				
			myNod.add({
				selector: '#discountPercentEle',
				validate: 'presence',
				errorMessage: 'Select proper discount !'
			});
				
			return myNod;
		}, setCategory: function() {
			let categoryArr = [
				{ "categoryTypeId": 1, "categoryTypeName": "Branch" },
				{ "categoryTypeId": 2, "categoryTypeName": "Party" },
			]
			
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	categoryArr,
				valueField		:	'categoryTypeId',
				labelField		:	'categoryTypeName',
				searchField		:	'categoryTypeName',
				elementId		:	'categoryTypeEle',
				create			: 	false,
				maxItems		: 	1
			});
		}, setChargeType: function() {
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	discountTypeList,
				valueField		:	'discountTypeId',
				labelField		:	'discountTypeName',
				searchField		:	'discountTypeName',
				elementId		:	'discountTypeEle',
				create			: 	false,
				maxItems		: 	1
			});
		}, creatrAndSetTimePicker : function() {
			$('.clockpicker').clockpicker({
				placement: 'right',
				align: 'right',
				autoclose: true,
				twelvehour: true
			});
			
			var today	= new Date();
			var time	= today.getHours();
			var minute	= today.getMinutes();
				
			if(today.getMinutes() < 10)
				minute = '0' + minute;
				
			if(today.getHours() < 10)
				time = '0' + time;
				
			$('#startTimeEle').val(time + ':' + minute);
			$('#endTimeEle').val(time + ':' + minute);
		}, bindEvents : function() {
			$('#categoryTypeEle').change(function() {
				if($('#categoryTypeEle').val() == 2) {//party
					$('#branchEleDiv').addClass('hide');
					$('#partySelectorDiv').removeClass('hide');
					myNod.remove("#branchEle");		
				} else if($('#categoryTypeEle').val() == 1) {//branch
					$('#branchEleDiv').removeClass('hide');
					$('#partySelectorDiv').addClass('hide');
					
					myNod.add({
						selector: '#branchEle',
						validate: 'validateAutocomplete:#branchEle',
						errorMessage: 'Select proper Branch !'
					});
				}
				
				$('#bottom-border-boxshadow').addClass('hide');
				$('#discountMasterDetailsDiv').empty();
			});
			
			$('#discountTypeEle').change(function() {
				if($('#discountTypeEle').val() == DISCOUNT_TYPE_ARTICLE) {
					$('#packingTypeDiv').removeClass('hide');
					$('#chargeTypeMasterIdDiv').addClass('hide');
					$('#isPercentCheckDiv').addClass('hide');
			
					myNod.add({
						selector: '#packingTypeEle',
						validate: 'presenceIfNotDisable:#packingTypeEle',
						errorMessage: 'Select Proper Packing Type !'
					});	
				} else if($('#discountTypeEle').val() == DISCOUNT_TYPE_CHARGES) {
					myNod.remove("#packingTypeEle");
					$('#packingTypeDiv').addClass('hide');
					$('#chargeTypeMasterIdDiv').removeClass('hide');
					$('#isPercentCheckDiv').removeClass('hide');
				}else if($('#discountTypeEle').val() == DISCOUNT_TYPE_FIX_PER_QUANTITY) {
					$('#packingTypeDiv').addClass('hide');
					$('#chargeTypeMasterIdDiv').addClass('hide');
					$('#isPercentCheckDiv').addClass('hide');	
				}else {
					myNod.remove("#packingTypeEle");
					$('#packingTypeDiv').addClass('hide');
					$('#chargeTypeMasterIdDiv').addClass('hide');
					$('#isPercentCheckDiv').addClass('hide');
				}
			});
			
			$("#saveBtn").click(function() {
				if (!_this.validatePartySelection()) {return false;}
				
				myNod.performCheck();
					
				if(myNod.areAll('valid'))
					_this.onSubmit();								
			});
		}, getPartyId : function() {
			let corporateAccountId = $('#corporateAccountId').val();

			if (corporateAccountId == 0 || corporateAccountId == "")
				corporateAccountId = $("#partyNameEle_primary_key").val();

			if (corporateAccountId == 0 || corporateAccountId == "")
				corporateAccountId = $("#gstNoEle_primary_key").val();

			if (corporateAccountId == 0 || corporateAccountId == "")
				corporateAccountId = $("#mobileNoEle_primary_key").val();
				
			return corporateAccountId;
		}, getPartyDetails: function() {
			showLayer();

			var jsonObject = new Object();
			jsonObject.corporateAccountId = _this.getPartyId();

			getJSON(jsonObject, WEB_SERVICE_URL + '/partyMasterWS/getPartyByCorporateAccountId.do?', _this.setDataInFields, EXECUTE_WITH_ERROR);
		}, setDataInFields: function(response) {
			hideLayer();
			_this.resetElement();
			
			if (response.CorporateAccount == undefined || response.CorporateAccount == null)
				return false;

			var object = response.CorporateAccount;

			$('#corporateAccountId').val(corporateAccountId);
			$("#partyNameEle").val(object.corporateAccountDisplayName);
			$("#mobileNoEle").val(object.corporateAccountMobileNumber);
			$("#gstNoEle").val(object.gstn);
			$("#corporateAccountId").val(object.corporateAccountId);
		}, resetElement: function() {
			var $inputs		= $('#partySelectorDiv :input');
			
			$inputs.each(function() {
				if ($(this).attr("id") != 'partyNameEle' && $(this).attr("id") != 'partyNameEle_primary_key'
					&& ($(this).attr("id") != 'gstNoSelectorEle' && $(this).attr("id") != 'gstNoEle_primary_key')
					&& ($(this).attr("id") != 'mobileNoEle' && $(this).attr("id") != 'mobileNoEle_primary_key')) {
					$(this).val('');
				}
			});

			hideLayer();
		}, onDiscountSelect: function(value) {
			if(value == 1) {
				$('#weeklyBasis').addClass("hide");
				myNod.remove("#weeklyBasisEle_wrapper");
				var selectize		= $('#weeklyBasisEle').get(0).selectize;
				selectize.setValue(8); 
			} else
				$("#weeklyBasis").removeClass("hide");
		}, validatePartySelection : function() {
			let corporateAccountId = _this.getPartyId();

			if($('#categoryTypeEle').val() == 2 && (corporateAccountId == 0 || corporateAccountId == "")) {
				showAlertMessage('error', "Select Proper Party");
				return false;
			}
			
			return true;
		}, validateBranchSelection : function() {
			if($('#categoryTypeEle').val() == 1 && ($('#branchEle').val() == undefined || $('#branchEle').val() == 0)) {
				showAlertMessage('error', "Select Branch !");
				return false;
			}
			
			return true;
		}, viewDiscountMaster : function() {
			$(".add-view-discount").empty();
			
			showLayer();
			
			$(".add-view-discount").load( "/ivcargo/html/module/discountMaster/viewDiscountMaster.html", function() {
				_this.renderView();
			});
		}, renderView : function () {
			_this.setAutocompleteData();
			
			myNod = nod();
				
			myNod.configure({
				parentClass:'validation-message'
			});
			
			myNod.add({
				selector: '#categoryTypeEle',
				validate: 'validateAutocomplete:#categoryTypeEle',
				errorMessage: 'Enter Proper Category'
			});
			
			$("#viewBtn").click(function() {
				myNod.performCheck();
					
				if(myNod.areAll('valid'))
					_this.onView();
			});
			
			$(".add-view-discount").removeClass('hide');
			hideLayer();
		}, setAutocompleteData : function() {
			let response = {};

			response.branchList 		= branchList;
			response.partyNameElement	= $('#partyNameEle');
			response.gstElement			= $('#gstNoEle');
			response.partyMobileElement = $('#mobileNoEle');
		
			Selection.setBranchAutocompleteWithSelectize(response);
			Selection.setPartyAutocomplete(response);
			Selection.setGSTAutocomplete(response);
			Selection.setPartyMobileNumberAutocomplete(response);
			
			_this.setCategory();
			_this.bindEvents();
			
			$('#partyNameEle, #gstNoEle, #mobileNoEle').change(function() {
				_this.getPartyDetails();
			});
		}, onSubmit : function() {
			showLayer();
			let jsonObject = new Object();

			jsonObject["categoryTypeId"]			= $('#categoryTypeEle').val();
			jsonObject["configBranchId"]			= $('#branchEle').val();
			jsonObject["corporateAccountId"]		= _this.getPartyId();
			jsonObject["discountTypeId"]			= $('#discountTypeEle').val();
			jsonObject["packingTypeMasterIds"]		= $('#packingTypeEle').val()
			jsonObject["chargeTypeMasterId"]		= $('#chargesEle').val();
			jsonObject["discountValue"]				= $('#discountPercentEle').val();
			jsonObject["isPercent"]					= $('#isPercentCheck').prop("checked");
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/discountMasterWS/saveDiscountMasterDetails.do', _this.setSavingResponse, EXECUTE_WITH_ERROR);
		}, setSavingResponse : function(response) {
			hideLayer();

			if(response.message != undefined) {
				/*_this.resetElementsById([
					"categoryTypeEle",
					"branchEle",
					"corporateAccountId",
					"discountTypeEle",
					"discountTypeEle",
					"discountPercentEle",
					"packingTypeEle",
					"chargesEle",
					"gstNoEle",
					"mobileNoEle",
					"partyNameEle",
					"partyNameEle_primary_key",
					"mobileNoEle",
					"gstNoEle_primary_key",
				]);*/
			}
		}, resetElementsById: function(elementIds) {
			elementIds.forEach(function(id) {
				const element = $("#" + id);

				if (element.is("input")) {
					element.val(""); // Clear input value
				} else if (element.is("select")) {
					element.prop("selectedIndex", 0); // Reset to the first option
				} else if (element.is("textarea")) {
					element.val(""); // Clear textareas
				} else if (element.hasClass("autocomplete-custom")) {
					// Clear custom autocomplete fields
					element.val("");
					$("#" + id + "_primary_key").val("");
				}

				// Optionally hide validation errors or reset styles
				element.removeClass("error");
			});

			// Handle additional custom logic, like hiding or showing divs
			$('#branchEleDiv').addClass('hide');
			$('#partyDiv').addClass('hide');
			$('#packingTypeDiv').addClass('hide');
			$('#chargeTypeMasterIdDiv').addClass('hide');
			$('#isPercentCheckDiv').addClass('hide');
		}, onView : function () {
			if(!_this.validateBranchSelection())
				return;
			else if(!this.validatePartySelection())
				return;
			
			showLayer();

			var jsonObject = new Object();
			
			jsonObject["configBranchId"]		= $('#branchEle').val();
			jsonObject["corporateAccountId"]	= _this.getPartyId();

			getJSON(jsonObject, WEB_SERVICE_URL+'/discountMasterWS/viewDiscountMasterDetails.do', _this.setViewResponse, EXECUTE_WITH_ERROR);
		}, setViewResponse : function (response) {
			if(response.message != undefined) {
				$('#bottom-border-boxshadow').addClass('hide');
				hideLayer();
				return;
			}

			if(response.CorporateAccount != undefined) {
				$('#bottom-border-boxshadow').removeClass('hide');
				hideAllMessages();
				response.tableProperties.callBackFunctionForDelete 	= _this.deleteDiscount;
				response.tableProperties.callBackFunctionForPartial = _this.viewDiscountMasterforUpdate;
				
				let language = {};
				
				language.deactivate = 'Delete';
				response.Language = language;
				response.showDeleteButtonAfterPartial = response.tableProperties.showDeleteButton;
				response.tableProperties.showDeleteButton	= false;
				
				SlickGridWrapper.setGrid(response);
			}
			
			hideLayer();
		}, viewDiscountMasterforUpdate : function(grid, dataView, row) {
			var item = dataView.getItem(row);//RowNum is the number of the row
			var rowId = item.id;
			
			var jsonObject		= new Object();
			jsonObject.discountMasterId = item.discountMasterId;
			jsonObject.rowId	= rowId;
			jsonObject.discountTypeId   = item.discountTypeId

			let updateDiscountMaster	= new UpdateDiscountMaster(jsonObject);
			updateDiscountMaster.render();
		}, deleteDiscount : function(grid, dataView, args, e) {
			if (confirm('Are you sure you want to Delete?')) {
				showLayer();
				var row = args.row;
				var item = dataView.getItem(row);//RowNum is the number of the row
				var jsonObject = new Object();
				jsonObject["discountMasterId"]		= item.discountMasterId;
		
				getJSON(jsonObject, WEB_SERVICE_URL+'/discountMasterWS/deleteDiscountMasterDetails.do', _this.responseAfterDelete, EXECUTE_WITH_ERROR);
				
				var rowID = item.id;
				
				if(rowID > 0) {
					setTimeout(function() { 
						dataView.deleteItem(rowID);//RowID is the actual ID of the row and not the row number
						grid.invalidate();
						grid.render();
					}, 500);
				}
			} else
				hideLayer();		
		}, responseAfterDelete : function() {
			hideLayer();
		}
	});
});
