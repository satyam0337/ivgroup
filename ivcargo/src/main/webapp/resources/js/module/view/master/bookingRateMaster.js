define([
	 "selectizewrapper"
	 ,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	 ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'JsonUtility'
	,'messageUtility'
	 ,'jquerylingua'
	 ,'autocomplete'
	 ,'autocompleteWrapper'
	 ,'language'
	 ,'nodvalidation'
	 ,PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
	 ,"focusnavigation"
], function(Selectizewrapper, Selection) {
	'use strict';
	let jsonObject = new Object(),_this = '', count = 0, unique_id = 0, rateTypeSelection, executiveType, regionId = 0, subRegionId = 0,
	myNod1, myNod2, jsondata, CHARGE_SECTION_PARTY_MINIMUM = 3, CHARGE_SECTION_PARTY_DDSLAB_ID= 7,
	setFixChargeRate = false, allowChargeTypeAndDestinationWiseMinimumValueConfig = false, showDataOnselectedFixCharge = false;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/rateMasterWS/loadNewRateMaster.do?', _this.setRateMasterDetailsData, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setRateMasterDetailsData : function(response) {
			jsondata	= response;

			if(response.message != undefined) {
				hideLayer();
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
				return;
			}
			
			let loadelement 			= new Array();
			let baseHtml 				= new $.Deferred();
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/master/bookingRateMaster/bookingRateMaster.html", function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				rateTypeSelection				= response.rateTypeSelection;
				setFixChargeRate				= response.setFixChargeRate;
				showDataOnselectedFixCharge		= response.showDataOnselectedFixCharge;
				allowChargeTypeAndDestinationWiseMinimumValueConfig	= response.allowChargeTypeAndDestinationWiseMinimumValueConfig;
				
				let keyObject = Object.keys(response);

				for (const element of keyObject) {
					if (response[element] && element != 'consigneePartyName')
						$("*[data-attribute=" + element + "Col]").removeClass("hide");
						
					if (!response[element])
						$("*[data-attribute=" + element + "Col]").remove();
				}
				
				executiveType					= response.executiveType;
				regionId						= response.regionId;
				subRegionId						= response.subRegionId;
				
				let elementConfiguration				= new Object();
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
				
				elementConfiguration.destRegionElement		= $('#destRegionEle');
				elementConfiguration.destSubregionElement	= $('#destSubRegionEle');
				elementConfiguration.destBranchElement		= $('#destBranchEle');

				response.elementConfiguration					= elementConfiguration;
				response.sourceAreaSelectionWithSelectize		= true;
				response.destinationAreaSelectionWithSelectize	= true;
				response.vehicleTypeSelection					= response.vehicleTypeList != undefined;
				response.sourceRegionSubRegionForAllUser		= rateTypeSelection;

				Selection.setSelectionToGetData(response);
				_this.setSelectionData(response);
				
				if(rateTypeSelection) {
					$("*[data-attribute=rateTypeCol]").removeClass('hide');
					_this.onRateTypeSelect($('#rateTypeEle').val());
				}
				
				if(setFixChargeRate)
					_this.setFixChargeRateOption();
				
				let myNod	= _this.formValidations(response);
				
				$('#fixChargeEle').click(function() {
					_this.selectFixCharge(this.checked,false);
				});
				
				$('#saveRates').click(function() {
					_this.saveRates();
				});
				
				$('#findData').click(function() {
					if($('#fixChargeEle').prop("checked")) {
						myNod1.performCheck();
						
						if(myNod1.areAll('valid'))
							_this.getRateDetails();
					} else if($('#rateSectionEle').val() == CHARGE_SECTION_PARTY_MINIMUM) {
						myNod2.performCheck();
						
						if(myNod2.areAll('valid'))
							_this.getRateDetails();
					} else {
						myNod.performCheck();
						
						if(myNod.areAll('valid'))
							_this.getRateDetails();
					}
				});
				
				$('#saveMinimumRates').click(function() {
					_this.saveRates();
				});
				
				hideLayer();
			});
		}, setSelectionData : function(response) {
			let chargeTypeSectionList		= response.chargeTypeSectionList;
			
			if(chargeTypeSectionList != undefined && chargeTypeSectionList.length > 0) {
				$('#rateSectionCol').removeClass('hide');
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: chargeTypeSectionList,
					valueField		: 'rateSectionId',
					labelField		: 'rateSectionName',
					searchField		: 'rateSectionName',
					elementId		: 'rateSectionEle',
					onChange		: _this.onRateSectionSelect
				});
			} else
				$('#rateSectionCol').empty();
			
			Selectizewrapper.setAutocomplete({
				jsonResultList	: response.categoryList,
				valueField		: 'categoryTypeId',
				labelField		: 'categoryTypeName',
				searchField		: 'categoryTypeName',
				elementId		: 'categoryEle',
				onChange		: _this.onCategoryTypeSelect
			});
			
			if(rateTypeSelection) {
				Selectizewrapper.setAutocomplete({
					jsonResultList	: response.rateTypeList,
					valueField		: 'rateType',
					labelField		: 'rateTypeName',
					searchField		: 'rateTypeName',
					elementId		: 'rateTypeEle',
					onChange		: _this.onRateTypeSelect
				});
			}
			
			let maxItemsSlab		= response.multipleSlabSelection ? (response.slabMasterList).length : 1;
			let maxItemsConsParty	= response.multipleConsigneePartySelection ? 5 : 1;
			
			if(response.slab) {
				Selectizewrapper.setAutocomplete({
					jsonResultList	: response.slabMasterList,
					valueField		: 'slabMasterId',
					labelField		: 'range',
					searchField		: 'range',
					elementId		: 'slabEle',
					maxItems 		: maxItemsSlab
				});
			}
			
			$('#bookingTypeEle').change(function() {
				_this.onBookingTypeSelect();
			});
			
			Selectizewrapper.setAutocomplete({
				url 				: WEB_SERVICE_URL+'/autoCompleteWS/getPartyDetailsAutocomplete.do?isSearchByAllParty=true',
				valueField			: 'corporateAccountId',
				labelField			: 'corporateAccountDisplayName',
				searchField			: 'corporateAccountDisplayName',
				elementId			: 'partyNameEle',
				responseObjectKey 	: 'result'
			});
			
			Selectizewrapper.setAutocomplete({
				url 				: WEB_SERVICE_URL+'/autoCompleteWS/getPartyDetailsAutocomplete.do?isSearchByAllParty=true',
				valueField			: 'corporateAccountId',
				labelField			: 'corporateAccountDisplayName',
				searchField			: 'corporateAccountDisplayName',
				elementId			: 'consigneePartyNameEle',
				responseObjectKey 	: 'result',
				maxItems			: maxItemsConsParty
			});
		}, autocompleteForPackingType : function(eleId) {
			let srcSubRegionAutoComplete 			= new Object();
			srcSubRegionAutoComplete.url 			= WEB_SERVICE_URL + '/autoCompleteWS/getPackingTypeByNameAndGroupId.do?';
			srcSubRegionAutoComplete.primary_key 	= 'packingTypeMasterId';
			srcSubRegionAutoComplete.field 			= 'packingGroupTypeName';
			srcSubRegionAutoComplete.callBack		= _this.setPackingTypeId;
			srcSubRegionAutoComplete.show_field 	= 'packingTypeMasterId'; //do not remove driverMasterId from here
			srcSubRegionAutoComplete.sub_info 		= true;
			$(eleId).autocompleteCustom(srcSubRegionAutoComplete);
			
			$('.packingTypeMasterId').on('change keydown focus keypress', function() {
				if(this.value != '')
					showInfo(this, this.value);
				else
					showInfo(this, 'Packing Type');
			});
		}, autocompleteForSaidToContain : function(eleId) {
			let stcAutoComplete 			= new Object();
			stcAutoComplete.url 			= WEB_SERVICE_URL + '/autoCompleteWS/getAllConsignmentGoodsDetailsByName.do?';
			stcAutoComplete.primary_key 	= 'consignmentGoodsId';
			stcAutoComplete.field 			= 'name';
			stcAutoComplete.callBack		= _this.setSaidToContainId,
			stcAutoComplete.show_field 		= 'consignmentGoodsId'; //do not remove driverMasterId from here
			stcAutoComplete.sub_info 		= true;
			$(eleId).autocompleteCustom(stcAutoComplete);
			
			$('.consignmentGoodsId').on('change keydown focus keypress',function() {
				if(this.value != '')
					showInfo(this, this.value);
				else
					showInfo(this, 'Said To Contain');
			});
		}, setFixChargeRateOption : function() {
			$("*[data-attribute=fixChargeCol]").removeClass('hide');
			$("#fixChargeEle").prop("checked", false);
			_this.selectFixCharge(false, false);
		}, formValidations : function(response) {
			let myNod = nod();
			myNod1 = nod();
			myNod2 = nod();
			
			myNod.configure({
				parentClass:'validation-message'
			});
			
			myNod1.configure({
				parentClass:'validation-message'
			});
			
			myNod2.configure({
				parentClass:'validation-message'
			});
			
			_this.branchSelectionValidation(myNod);
			_this.branchSelectionValidation(myNod2);
			
			if(response.validateBusinessType) {
				addAutocompleteElementInNode1(myNod, 'businessTypeEle', 'Select Proper Business Type !');
				addAutocompleteElementInNode1(myNod1, 'businessTypeEle', 'Select Proper Business Type !');
				addAutocompleteElementInNode1(myNod2, 'businessTypeEle', 'Select Proper Business Type !');
			}
			
			addAutocompleteElementInNode1(myNod, 'categoryEle', 'Select Proper Category !');
			addAutocompleteElementInNode1(myNod1, 'categoryEle', 'Select Proper Category !');
			addAutocompleteElementInNode1(myNod2, 'categoryEle', 'Select Proper Category !');
			
			addAutocompleteElementInNode1(myNod, 'rateTypeEle', 'Select Proper Rate Type !');
			addAutocompleteElementInNode1(myNod1, 'rateTypeEle', 'Select Proper Rate Type !');
			
			addAutocompleteElementInNode1(myNod, 'chargeTypeEle', 'Select Proper Charge Type !');

			addAutocompleteElementInNode1(myNod, 'chargesEle', 'Select Proper Charge !');
			addAutocompleteElementInNode1(myNod1, 'chargesEle', 'Select Proper Charge !');
			
			addAutocompleteElementInNode1(myNod, 'lrTypeEle', 'Select Proper LR Type !');
			addAutocompleteElementInNode1(myNod, 'bookingTypeEle', 'Select Proper Booking Type !');
			
			return myNod;
		}, branchSelectionValidation : function(myNod) {
			addAutocompleteElementInNode1(myNod, 'branchEle', 'Select Select Branch  !');
		}, otherValidation : function() {
			if($('#bookingTypeEle').val() == BOOKING_TYPE_FTL_ID && $('#vehicleTypeEle').val() == '') {
				showMessage('error', 'Please, Select vehicle type !');
				return false;
			}
			
			return true;
		}, getRateDetails : function() {
			if(!_this.otherValidation())
				return;
			
			let jsonObject	= new Object();
			
			_this.basicDataToSaveAndGet(jsonObject);
			
			showLayer();
			
			if($('#rateSectionEle').val() == CHARGE_SECTION_PARTY_MINIMUM && !allowChargeTypeAndDestinationWiseMinimumValueConfig) {
				jsonObject	= _this.getMinimumPartyData();
				getJSON(jsonObject, WEB_SERVICE_URL	+ '/rateMasterWS/getPartyMinimumRates.do?', _this.setMinimumRateDetails, EXECUTE_WITHOUT_ERROR);
			} else
				getJSON(jsonObject, WEB_SERVICE_URL	+ '/rateMasterWS/getRateDetailsForUpdate.do?', _this.setRateDetails, EXECUTE_WITHOUT_ERROR);
		}, setRateDetails : function(response) {
			hideLayer();
			$('#bottom-border-boxshadow').removeClass('hide');
			$('#mainTable').empty();
			
			let branchMap				= response.branchMap;
			let consignmentGoodsHM		= response.consignmentGoodsHM;
			let branchRateHM			= response.branchRateHM;
			let packingTypeHM			= response.packingTypeHM;
			let cftRateHM				= response.cftRateHM;
			let chargeTypeId			= $('#chargeTypeEle').val();
			
			let selectize 		= $('#chargesEle').get(0).selectize;
			let current 		= selectize.getValue(); 
			let option 			= selectize.options[ current ];
			let chargeName		= '';
			
			if(option != undefined)
				chargeName		= option.chargeTypeMasterName;
			
			if($('#fixChargeEle').prop("checked"))
				$("*[data-selector='header1']").html('Fix Charges <br>' + chargeName);
			else
				$("*[data-selector='header1']").html(chargeTypeId == CHARGETYPE_ID_QUANTITY ? "Article <br>" + chargeName : "Weight <br>" + chargeName);
			
			let headerColumnArray		= new Array();
			
			headerColumnArray.push('<th></th>');
			
			if(chargeTypeId == CHARGETYPE_ID_QUANTITY) {
				headerColumnArray.push('<th></th>');
				headerColumnArray.push('<th></th>');
				headerColumnArray.push('<th>Packing Type</th>');
				headerColumnArray.push('<th>Said To Contain</th>');
			}
			
			if($('#cftUnitEle').val() > 0)
				headerColumnArray.push('<th>' + jsondata.cftValueLabel + '</th>');
			
			for(let key in branchMap) {
				headerColumnArray.push('<th>' + branchMap[key] + '</th>');
			}
			
			$('#mainTable').append('<tr>' + headerColumnArray.join(' ') + '</tr>');

			let  label ;
			if ($('#fixChargeEle').prop("checked"))
				label = "Min Fix Amt";
			else if(chargeTypeId == CHARGETYPE_ID_QUANTITY)

				label = "Per Art Rate";
			else	
				label = "Per KG Rate ";
				
			for(let key in branchRateHM) {
				let packingTypeObj	= branchRateHM[key];
				
				headerColumnArray = [];
				
				headerColumnArray.push('<td><button type = "button" class = "deleteRates btn btn-danger">Delete</button></td>');
				
				if(chargeTypeId == CHARGETYPE_ID_QUANTITY) {
					headerColumnArray.push('<td><button type = "button" class = "cloneCurrentRow btn btn-primary">Copy</button></td>');
					headerColumnArray.push('<td><button type = "button" class = "removeCurrentRow btn btn-success">Remove</button></td>');
	
					if(packingTypeHM[key.split("_")[0]] != undefined)
						headerColumnArray.push('<td><input type = "text" value = "' + packingTypeHM[key.split("_")[0]] + '" name = "packingTypeMasterId" id = "packingType_' + unique_id + '" class = "packingTypeMasterId form-control" disabled = "disabled"/><input type = "hidden" id = "packingTypeId_' + unique_id + '" value = "' + key.split("_")[0] + '"/></td>');
					else
						headerColumnArray.push('<td><input type = "text" name = "packingTypeMasterId" id = "packingType_' + unique_id + '" class = "packingTypeMasterId form-control"/><input type = "hidden" id = "packingTypeId_' + unique_id + '" value = "0"/></td>');
					
					if(consignmentGoodsHM[key.split("_")[1]] != undefined)
						headerColumnArray.push('<td><input type = "text" value = "' + consignmentGoodsHM[key.split("_")[1]] + '" name = "consignmentGoodsId" id = "saidtoContain_' + unique_id + '" class = "consignmentGoodsId form-control" disabled = "disabled"/><input type = "hidden" id = "consignmentGoodsId_' + unique_id + '" value = "' + key.split("_")[1] + '"/></td>');
					else
						headerColumnArray.push('<td><input type = "text" name = "consignmentGoodsId" id = "saidtoContain_' + unique_id + '" class = "consignmentGoodsId form-control"/><input type = "hidden" id = "consignmentGoodsId_' + unique_id + '" value = "0"/></td>');
				}
				
				if($('#cftUnitEle').val() > 0)
					headerColumnArray.push('<td><input type = "text" value = "' + cftRateHM[key] + '" id = "cftAmount_' + key + '" class="form-control" style = "width:80px;" onfocus="resetTextFeild(this, 0)" onblur = "clearIfNotNumeric(this, 0);"/></td>');
				
				if($('#rateSectionEle').val() == CHARGE_SECTION_PARTY_MINIMUM && allowChargeTypeAndDestinationWiseMinimumValueConfig) {
					for(let key1 in branchMap) {
						let minimumAmt	= 0;
						let minimumWght	= 0

						headerColumnArray.push('<td><input type = "text" value = "' + packingTypeObj[key1] + '" id = "branchAmount' + "_" + key1 + '" class="form-control" style = "width:100px;" onfocus="resetTextFeild(this, 0)" onblur = "clearIfNotNumeric(this, 0);"/>'+label+'</td>');

						if(packingTypeObj != undefined && packingTypeObj[key1] != undefined) {
							let sectionObj	= packingTypeObj[key1];
							
							if(sectionObj[CHARGE_SECTION_PARTY_NAME_MINIMUM_RATE_ID] != undefined)
								minimumAmt	= sectionObj[CHARGE_SECTION_PARTY_NAME_MINIMUM_RATE_ID];
								
							if(sectionObj[CHARGE_SECTION_PARTY_MINIMUM_WEIGHT_ID] != undefined)
								minimumWght	= sectionObj[CHARGE_SECTION_PARTY_MINIMUM_WEIGHT_ID];
						}
						
						headerColumnArray.push('<td style="white-space: nowrap; text-align: center;"><span style="display: inline-block;"><b>Min Weight</b> <br/><input type="text" value="' + minimumWght + '" id="minWeightRate' + "_"  + key1 + '" class="form-control" style="width:70px;" onblur="clearIfNotNumeric(this, 0);"/></span> &nbsp; <span style="display: inline-block;"><b>Min Amount</b><br/><input type="text" value="' + minimumAmt + '" id="minAmount' + "_" + key1 + '" class="form-control" style="width:70px;" onblur="clearIfNotNumeric(this, 0);"/></span> </td>');
					}
				} else {
					for(let key1 in branchMap) {
						if(packingTypeObj[key1] == undefined)
							packingTypeObj[key1]	= 0;
			
						headerColumnArray.push('<td><input type = "text" value = "' + packingTypeObj[key1] + '" id = "branchAmount' + "_" + key1 + '" class="form-control" style = "width:100px;" onfocus="resetTextFeild(this, 0)" onblur = "clearIfNotNumeric(this, 0);"/> '+label +'</td>');
				   }

				}
				
				$('#mainTable').append('<tr>' + headerColumnArray.join(' ') + '</tr>');
				unique_id++;
			}
			/*
				Start blank row
			*/
			if(chargeTypeId == CHARGETYPE_ID_QUANTITY) {	
				headerColumnArray	= [];
					
				headerColumnArray.push('<td><button type = "button" class = "deleteRates btn btn-danger">Delete</button></td>');
				headerColumnArray.push('<td><button type = "button" class = "cloneCurrentRow btn btn-primary">Copy</button></td>');
				headerColumnArray.push('<td><button type = "button" class = "removeCurrentRow btn btn-success">Remove</button></td>');
				headerColumnArray.push('<td><input type = "text" name = "packingTypeMasterId" id = "packingType_' + unique_id + '" class = "packingTypeMasterId form-control" style = "width: 150px;"/><input type = "hidden" id = "packingTypeId_' + unique_id + '" value = "0"/></td>');
				headerColumnArray.push('<td><input type = "text" name = "consignmentGoodsId" id = "saidtoContain_' + unique_id + '" class = "consignmentGoodsId form-control" style = "width: 150px;"/><input type = "hidden" id = "consignmentGoodsId_' + unique_id + '" value = "0"/></td>');
					
				if($('#cftUnitEle').val() > 0)
					headerColumnArray.push('<td><input type = "text" value = "0" id = "cftAmount_0" class="form-control" style = "width:80px;" onfocus="resetTextFeild(this, 0)" onblur = "clearIfNotNumeric(this, 0);"/></td>');
				
				if($('#rateSectionEle').val() == CHARGE_SECTION_PARTY_MINIMUM && allowChargeTypeAndDestinationWiseMinimumValueConfig) {
					for(let key1 in branchMap) {
						headerColumnArray.push('<td style="white-space: nowrap; text-align: center;"><span style="display: inline-block;"><b>Min Weight</b> <br/><input type="text" value="0" id="minWeightRate' + "_"  + key1 + '" class="form-control" style="width:70px;" onblur="clearIfNotNumeric(this, 0);"/></span> &nbsp; <span style="display: inline-block;"><b>Min Amount</b> <br/><input type="text" value="0" id="minAmount' + "_"  + key1 + '" class="form-control" style="width:70px;" onblur="clearIfNotNumeric(this, 0);"/></span> </td>');
					}
				} else {
					for(let key1 in branchMap) {
						headerColumnArray.push('<td><input type = "text" value = "0" id = "branchAmount' + "_" + key1 + '" class="form-control" style = "width:100px;" onfocus="resetTextFeild(this, 0)" onblur = "clearIfNotNumeric(this, 0);"/>'+ label + ' </td>');
					}
				}
				
				$('#mainTable').append('<tr>' + headerColumnArray.join(' ') + '</tr>');
			} else if(jQuery.isEmptyObject(branchRateHM)) {
				headerColumnArray	= [];
					
				headerColumnArray.push('<td><button type = "button" class = "deleteRates btn btn-danger">Delete</button></td>');
					
				if($('#cftUnitEle').val() > 0)
					headerColumnArray.push('<td><input type = "text" value = "0" id = "cftAmount_0" class="form-control" style = "width:80px;" onfocus="resetTextFeild(this, 0)" onblur = "clearIfNotNumeric(this, 0);"/></td>');

				if($('#rateSectionEle').val() == CHARGE_SECTION_PARTY_MINIMUM) {
					for(let key1 in branchMap) {
						headerColumnArray.push('<td style="white-space: nowrap; text-align: center;"><span style="display: inline-block;">Min Weight <br/><input type="text" value="0" id="minWeightRate'+ "_" + key1 + '" class="form-control" style="width:70px;" onblur="clearIfNotNumeric(this, 0);"/></span> &nbsp; <span style="display: inline-block;">Min Amount <br/><input type="text" value="0" id="minAmount' + "_" + key1 + '" class="form-control" style="width:70px;" onblur="clearIfNotNumeric(this, 0);"/></span> </td>');
					}
				} else {
					for(let key1 in branchMap) {
						headerColumnArray.push('<td><input type = "text" value = "0" id = "branchAmount' + "_" + key1 + '" class="form-control" style = "width:100px;" onfocus="resetTextFeild(this, 0)" onblur = "clearIfNotNumeric(this, 0);"/>'+ label +'</td>');
					}

				}
				
				$('#mainTable').append('<tr>' + headerColumnArray.join(' ') + '</tr>');
			}
			
			/*
				End Blank Row
			*/
			
			$('.deleteRates').click(function() {
				_this.deleteRates(this);
			});
			
			$('.cloneCurrentRow').click(function() {
				_this.cloneCurrentRow(this);
			});
			
			$('.removeCurrentRow').click(function() {
				_this.removeCurrentRow(this);
			});
			
			_this.autocompleteForPackingType('.packingTypeMasterId');
			_this.autocompleteForSaidToContain('.consignmentGoodsId');
		}, getConfirmation : function(title, content) {
			let btModalConfirm = new Backbone.BootstrapModal({
				content		: 	content,
				modalWidth 	: 	30,
				title		:	title,
				okText		:	'YES',
				showFooter 	: 	true,
				okCloses	:	true
			}).open();
			
			return btModalConfirm;
		}, onRateSectionSelect : function() {
			if($('#rateSectionEle').val() == CHARGE_SECTION_PARTY_MINIMUM) {
				$('#minimumValueConfigurationCol').removeClass('hide');
				$("*[data-attribute=rateTypeCol]").addClass('hide');
				
				if(allowChargeTypeAndDestinationWiseMinimumValueConfig)
					$('#destBranchSelection').removeClass('hide');
				else
					$('#destBranchSelection').addClass('hide');
					
				$("*[data-attribute=fixChargeCol]").addClass('hide');
				$("*[data-attribute=charges]").addClass('hide');
				
				_this.selectFixCharge(true, true);
			} else {
				$('#middle-border-boxshadow').addClass('hide');
				
				if(rateTypeSelection)
					$("*[data-attribute=rateTypeCol]").removeClass('hide');
				
				$('#destBranchSelection').removeClass('hide');
				
				if(setFixChargeRate)
					_this.setFixChargeRateOption();
					
				$("*[data-attribute=charges]").removeClass('hide');
			}
		}, onCategoryTypeSelect : function() {
			if($('#categoryEle').val() == CATEGORY_TYPE_PARTY_ID) {
				$("*[data-attribute=partyNameCol]").removeClass('hide');
				
				if($('#rateSectionEle').val() != CHARGE_SECTION_PARTY_MINIMUM)
					$("*[data-attribute=consigneePartyNameCol]").removeClass('hide');
			} else {
				$("*[data-attribute=partyNameCol]").addClass('hide');
				$("*[data-attribute=consigneePartyNameCol]").addClass('hide');
				let selectize = $("#partyNameEle")[0].selectize;
				selectize.clear();
				selectize = $("#consigneePartyNameEle")[0].selectize;
				selectize.clear();
			}
		}, onBookingTypeSelect : function() {
			if($('#bookingTypeEle').val() == BOOKING_TYPE_FTL_ID) {
				$("*[data-attribute=vehicleTypeCol]").removeClass("hide");
			} else {
				$("*[data-attribute=vehicleTypeCol]").addClass("hide");
				let selectize = $("#vehicleTypeEle")[0].selectize;
				selectize.clear();
			}
		}, onRateTypeSelect : function(rateTypeId) {
			if(rateTypeId == undefined)
				rateTypeId	= $('#rateTypeEle').val();
			
			Selection.changeOnIncomingOutgoing(rateTypeId, executiveType, regionId, subRegionId);
		}, saveRates : function() {
			if(!_this.otherValidation())
				return;
				
			showLayer();
			
			let jsonObject = {};
			
			if($('#rateSectionEle').val() == CHARGE_SECTION_PARTY_MINIMUM && !allowChargeTypeAndDestinationWiseMinimumValueConfig) {
				jsonObject	= _this.getMinimumPartyData();
				getJSON(jsonObject, WEB_SERVICE_URL	+ '/rateMasterWS/addPartyMinimumRates.do?', _this.setResponse, EXECUTE_WITHOUT_ERROR);
			} else {
				jsonObject 	= _this.getDataToSaveAndUpdate(false, null);
				jsonObject.allowChargeTypeAndDestinationWiseMinimumValueConfig	= $('#rateSectionEle').val() == CHARGE_SECTION_PARTY_MINIMUM && allowChargeTypeAndDestinationWiseMinimumValueConfig;
				getJSON(jsonObject, WEB_SERVICE_URL	+ '/rateMasterWS/insertAndUpdateRateDetails.do?', _this.setResponse, EXECUTE_WITHOUT_ERROR);
			}
		}, getDataToSaveAndUpdate : function(isDelete, obj) {
			let result	= null;
			
			if(isDelete)
				result	= _this.getAllValuesToDelete(obj);
			else
				result	= _this.getAllValuesToSave();
			
			let jsonObject		= new Object();
			
			jsonObject["branchRates"]				= JSON.stringify(result);
			jsonObject["count"]						= count;
			
			_this.basicDataToSaveAndGet(jsonObject);
			
			return jsonObject;
		}, basicDataToSaveAndGet : function(jsonObject) {
			jsonObject.rateTypeId					= $('#rateTypeEle').val();
			jsonObject.categoryTypeId				= $('#categoryEle').val();
			jsonObject.sourceBranchId				= $('#branchEle').val();
			jsonObject.sourceSubRegionId			= $('#subRegionEle').val();
			jsonObject.destinationBranchId			= $('#destBranchEle').val();
			jsonObject.destinationSubRegionId		= $('#destSubRegionEle').val();
			jsonObject.corporateAccountId			= $('#partyNameEle').val();
			jsonObject.ConsigneeCorporateAccountId	= $('#consigneePartyNameEle').val();
			jsonObject.chargeTypeId					= $('#chargeTypeEle').val();
			jsonObject.chargeTypeMasterId			= $('#chargesEle').val();
			jsonObject.cftUnitId					= $('#cftUnitEle').val();
			jsonObject.slabMasterId					= $('#slabEle').val();
			jsonObject.wayBillTypeId				= $('#lrTypeEle').val();
			jsonObject.businessTypeId				= $('#businessTypeEle').val();
			jsonObject.bookingTypeId				= $('#bookingTypeEle').val();
			jsonObject.vehicleTypeId				= $('#vehicleTypeEle').val();
			jsonObject.chargedFixed					= isCheckBoxChecked('fixChargeEle');
			jsonObject.isFixedCftAmt				= ($('#fixChargeEle').is(':checked')) && $('#cftUnitEle').val() > 0;
			jsonObject.rateSectionEle				= $('#rateSectionEle').val();
		}, getAllValuesToSave : function() {
			let allValues 	= {};
			count = 0;

			$("table tbody tr").each(function() {
				let basicData 	= {};
				let branchRates	= {};
		
				$(this).find("input").each(function() {
					const fieldId 		= $(this).attr("id");
					const id			= fieldId.split("_")[0];
			
					if(id == 'packingTypeId')
						basicData['packingTypeMasterId'] = $(this).val();
					else if(id == 'consignmentGoodsId')
						basicData['consignmentGoodsId'] = $(this).val();
					else if(id == 'cftAmount')
						basicData['cftAmount'] 	= $(this).val();
					else
						branchRates[fieldId]	= $(this).val();
				});
		
				if(count > 0) {
					allValues['basicData_' + count]		= basicData;
					allValues['branchRates_' + count]	= branchRates;
				}
		
				count++;
			})
		
			return allValues;
		}, getAllValuesToDelete : function(obj) {
			count = 0;
			
			let $item = $(obj).closest("tr").find('input');
			 
			let allValues 	= {};
			let basicData 	= {};
			let branchRates	= {};
			
			$item.each(function() {
				const fieldId 		= $(this).attr("id");
				const id			= fieldId.split("_")[0];
			
				if(id == 'packingTypeId')
					basicData['packingTypeMasterId'] = $(this).val();
				else if(id == 'consignmentGoodsId')
					basicData['consignmentGoodsId'] = $(this).val();
				else if(id == 'cftAmount')
					basicData['cftAmount'] 	= $(this).val();
				else if($(this).val() > 0) {
					branchRates[fieldId]	= 0;
					$(this).val(0);
				}	
			});
			
			count++;
		
			allValues['basicData_' + count]		= basicData;
			allValues['branchRates_' + count]	= branchRates;
			
			count++;
			
			return allValues;
		}, setResponse : function(response) {
			hideLayer();
					
			if(response.message != undefined) {
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			}
		}, deleteRates : function(obj) {
			showLayer();

			let jsonObject = _this.getDataToSaveAndUpdate(true, obj);
			
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/rateMasterWS/insertAndUpdateRateDetails.do?', _this.setResponse, EXECUTE_WITHOUT_ERROR);
		}, cloneCurrentRow : function(obj) {
			let $curRow = $(obj).closest('tr'),
			$newRow = $curRow.clone(true);
		
			unique_id++;

			let $item = $newRow.find('input');
			
			$item.each(function() {
				const fieldId 		= $(this).attr("id");
				const id			= fieldId.split("_")[0];
			
				if(id == 'packingTypeId' || id == 'consignmentGoodsId')
					$(this).attr("id",  id + "_" + unique_id);
			});
			
			const fieldId 		= $newRow.find(".packingTypeMasterId").attr("id");
			const fieldId1 		= $newRow.find(".consignmentGoodsId").attr("id");
			
			$newRow.find(".packingTypeMasterId").attr('id', fieldId.split("_")[0] + "_" + unique_id);
			$newRow.find(".consignmentGoodsId").attr('id', fieldId1.split("_")[0] + "_" + unique_id);
			
			$newRow.find(".packingTypeMasterId").removeAttr("disabled");
			$newRow.find(".consignmentGoodsId").removeAttr("disabled");
			
			$curRow.after($newRow);
			
			setTimeout(function() {
				_this.autocompleteForPackingType($('#' + $newRow.find(".packingTypeMasterId").attr("id")));
				_this.autocompleteForSaidToContain($('#' + $newRow.find(".consignmentGoodsId").attr("id")));
			}, 200);
		}, setPackingTypeId : function() {
			let jsonValue 	= $('#' + $(this).attr('id')).attr('sub_info');
			let obj 		= eval( '(' + jsonValue + ')' );
			$('#packingTypeId_' + (this.id).split("_")[1]).val(obj.packingTypeMasterId);
		}, setSaidToContainId : function() {
			let jsonValue 	= $('#' + $(this).attr('id')).attr('sub_info');
			let obj 		= eval( '(' + jsonValue + ')' );
			$('#consignmentGoodsId_' + (this.id).split("_")[1]).val(obj.consignmentGoodsId);
		}, removeCurrentRow : function(obj) {
			let count = $('#mainTable tr').length;
			
			if(count <= 2) {
				showMessage('error', 'You cannot remove last row !');
				return;
			}
			
			$(obj).closest('tr').remove();
		}, selectFixCharge : function(checked, flag) {
			if(checked && (!showDataOnselectedFixCharge || flag)) {
				$("*[data-attribute=bookingTypeCol]").addClass("hide");
				
				if(allowChargeTypeAndDestinationWiseMinimumValueConfig)
					$("*[data-attribute=chargeTypeCol]").removeClass("hide");
				else
					$("*[data-attribute=chargeTypeCol]").addClass("hide");
					
				$("*[data-attribute=slabCol]").addClass("hide");
				$("*[data-attribute=cftUnitCol]").addClass("hide");
				$("*[data-attribute=lrTypeCol]").addClass("hide");
				$("*[data-attribute=vehicleTypeCol]").addClass("hide");
				$("*[data-attribute=consigneePartyNameCol]").addClass("hide");
				_this.resetSeletedOptions();
				
				$('#bottom-border-boxshadow').addClass('hide');
				$('#mainTable').empty();
			} else {
				$("*[data-attribute=bookingTypeCol]").removeClass('hide');
				$("*[data-attribute=chargeTypeCol]").removeClass('hide');
				$("*[data-attribute=slabCol]").removeClass('hide');
				$("*[data-attribute=cftUnitCol]").removeClass('hide');
				$("*[data-attribute=lrTypeCol]").removeClass('hide');
				//$("*[data-attribute=vehicleTypeCol]").removeClass('hide');
				//$("*[data-attribute=consigneePartyNameCol]").removeClass('hide');
			}
			
		}, resetSeletedOptions : function() {
			let selectize = $("#bookingTypeEle")[0].selectize;
			selectize.clear();
			
			selectize = $("#vehicleTypeEle")[0].selectize;
			selectize.clear();
			
			selectize = $("#lrTypeEle")[0].selectize;
			selectize.clear();
			
			selectize = $("#cftUnitEle")[0].selectize;
			selectize.clear();
			
			selectize = $("#chargeTypeEle")[0].selectize;
			selectize.clear();
			
			selectize = $("#slabEle")[0].selectize;
			selectize.clear();
			
			selectize = $("#consigneePartyNameEle")[0].selectize;
			selectize.clear();
			
			selectize = $("#chargesEle")[0].selectize;
			selectize.clear();
		}, getMinimumPartyData : function() {
			let jsonObject	= {};
			
			jsonObject.businessTypeId				= $('#businessTypeEle').val();
			jsonObject.categoryTypeId				= $('#categoryEle').val();
			jsonObject.sourceBranchId				= $('#branchEle').val();
			jsonObject.sourceSubRegionId			= $('#subRegionEle').val();
			jsonObject.corporateAccountId			= $('#partyNameEle').val();
			jsonObject.minWeightRate				= $('#minimumWeightEle').val();
			jsonObject.ddSlab						= $('#ddSlabEle').val();
			jsonObject.minAmount					= $('#minimumAmountEle').val();
			
			return jsonObject;
		}, setMinimumRateDetails : function(response) {
			hideLayer();
			$('#middle-border-boxshadow').removeClass('hide');
			$('#minimumWeightEle').val(0);
			$('#ddSlabEle').val(0);
			$('#minimumAmountEle').val(0);
			
			let rateList		= response.rateList;
			let rateMaster		= null;

			if(typeof rateList != 'undefined') {
				if(rateList.hasOwnProperty(CHARGE_SECTION_PARTY_MINIMUM_WEIGHT_ID)) {
					rateMaster			= rateList[CHARGE_SECTION_PARTY_MINIMUM_WEIGHT_ID];
					$('#minimumWeightEle').val(rateMaster.rate);
				}

				if(rateList.hasOwnProperty(CHARGE_SECTION_PARTY_DDSLAB_ID)) {
					rateMaster			= rateList[CHARGE_SECTION_PARTY_DDSLAB_ID];
					$('#ddSlabEle').val(rateMaster.rate);
				}

				if(rateList.hasOwnProperty(CHARGE_SECTION_PARTY_NAME_MINIMUM_RATE_ID)) {
					rateMaster			= rateList[CHARGE_SECTION_PARTY_NAME_MINIMUM_RATE_ID];
					$('#minimumAmountEle').val(rateMaster.rate);
				}
			}
		}
	});
});