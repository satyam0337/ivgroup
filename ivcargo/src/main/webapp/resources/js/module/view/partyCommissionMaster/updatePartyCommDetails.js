define([  
	
          '/ivcargo/resources/js/generic/urlparameter.js'
          ,'selectizewrapper'
           ,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
		,'JsonUtility'
          ,'messageUtility'
          ,'autocomplete'
          ,'autocompleteWrapper'
          ,'slickGridWrapper2'
          ,'nodvalidation'
          ,'focusnavigation'//import in require.config
          ,'bootstrapSwitch'
          ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
          ],
          function(UrlParameter, Selectizewrapper, Selection) {
	'use strict';
	var jsonObject = new Object(), myNod,  _this = '', savedSuccess, partyCommissionId,
	COMMISSION_TYPE_ON_CHARGE_SUM_ID								= 1,
	COMMISSION_TYPE_ON_CHARGE_MASTER_ID							= 2,
   COMMISSION_TYPE_ON_PACKING_TYPE_ID								= 4,
	COMMISSION_TYPE_ON_WEIGHT_ID											= 5
	;
	return Marionette.LayoutView.extend({
		initialize : function(jsonObjectData) {

			//initialize is the first function called on call new view()
			//append template first 
			//the html would be set in the el element
			//this object is not found in other function so _this has been created
			_this 				= this;
			jsonObject 			= jsonObjectData.elementValue;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/partyCommissionMasterWS/getPartyCommisionElementConfiguration.do?', _this.setElements, EXECUTE_WITHOUT_ERROR);
		},setElements : function (response){
			console.log(response);
			var branchArray		= new Array();
			var destArray		= new Array();
			var commTypeArray	= new Array();
			var wayBillTypeArray = new Array();
			var packingTypeArray = new Array();
			var weightConfigArray = new Array();
			var chargeTypeArray	  = new Array();
			
			console.log(jsonObject.dataView.applicableOnChargeTypeMasterIds);
			if(jsonObject.dataView.applicableOnChargeTypeMasterIds != null){
				var charges		 = jsonObject.dataView.applicableOnChargeTypeMasterIds;
				var chargesArr   = charges.split(',');
				for(var i = 0 ; i < chargesArr.length ; i++){
					chargeTypeArray.push(chargesArr[i]);
				}
			}
			partyCommissionId	= jsonObject.dataView.partyCommissionId;
			branchArray.push(jsonObject.dataView.sourceBranchId);
			if(jsonObject.dataView.destinationBranchId == 0){
				destArray.push(-1);
			}else{
				destArray.push(jsonObject.dataView.destinationBranchId);
			}
			
			commTypeArray.push(jsonObject.dataView.commissionTypeId);
			wayBillTypeArray.push(jsonObject.dataView.wayBillTypeId);
			weightConfigArray.push(jsonObject.dataView.weightConfigId);
			if(jsonObject.dataView.packingTypeMasterId == 0){
				packingTypeArray.push(-1);
			}else{
				packingTypeArray.push(jsonObject.dataView.packingTypeMasterId);
			}
			
			
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			loadelement.push(baseHtml);
			
			setTimeout(function(){
				$("#modalBody").load("/ivcargo/html/module/partyCommissionMaster/partyCommDetails.html",function() {
					baseHtml.resolve();
				});
			},500);
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				var keyObject = Object.keys(response);
				
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]]) {
						$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
					}
				}
				
				if(response.wayBillTypeList != undefined){
					for(var i=0;i<response.wayBillTypeList.length;i++){
						var wayBillType = response.wayBillTypeList[i];
						if(wayBillType.wayBillTypeId == -1){
							response.wayBillTypeArr.splice(i,1);
						}
					}
				}

				let elementConfiguration	= {};				
				elementConfiguration.partyNameElement	= $("#updatePartyEle");
				
				Selection.setPartyAutocomplete(elementConfiguration);
				
				$("#updatePartyEle").val(jsonObject.dataView.partyName);
				$("#updatePartyEle_primary_key").val(jsonObject.dataView.corporateAccountId);
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.branchList,
					valueField		:	'branchId',
					labelField		:	'branchName',
					searchField		:	'branchName',
					elementId		:	'updateBranchEle',
					create			: 	false,
					maxItems		: 	1,
					items			:   branchArray
				});
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.sourceBranch,
					valueField		:	'branchId',
					labelField		:	'branchName',
					searchField		:	'branchName',
					elementId		:	'uptdestinationBranchEle',
					create			: 	false,
					maxItems		: 	1,
					items			:   destArray
				});
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.wayBillTypeList,
					valueField		:	'wayBillTypeId',
					labelField		:	'wayBillType',
					searchField		:	'wayBillType',
					elementId		:	'uptwayBillTypeEle',
					create			: 	false,
					maxItems		: 	1,
					items			:wayBillTypeArray
				});
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.bookingCharges,
					valueField		:	'chargeTypeMasterId',
					labelField		:	'chargeTypeMasterName',
					searchField		:	'chargeTypeMasterName',
					elementId		:	'uptchargeTypeMasterEle',
					create			: 	false,
					maxItems		: 	response.bookingCharges.length,
					items			:  chargeTypeArray
				});
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.commissionTypeArr,
					valueField		:	'commissionTypeId',
					labelField		:	'commissionTypeName',
					searchField		:	'commissionTypeName',
					elementId		:	'uptcommissionTypeEle',
					create			: 	false,
					maxItems		: 	1,
					onChange		: _this.onCommissionTypeSelect,
					items			:commTypeArray
				});
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.weightConfigList,
					valueField		:	'commissionTypeId',
					labelField		:	'commissionTypeName',
					searchField		:	'commissionTypeName',
					elementId		:	'uptweightConfigEle',
					create			: 	false,
					maxItems		: 	1,
					items			:weightConfigArray
				});
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.packingTypeForGroupList,
					valueField		:	'typeOfPackingMasterId',
					labelField		:	'packingTypeName',
					searchField		:	'packingTypeName',
					elementId		:	'uptpackingTypeEle',
					create			: 	false,
					maxItems		: 	1,
					items			:packingTypeArray
				});
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				addAutocompleteElementInNode1(myNod, 'updateBranchEle', 'Select proper Source Branch !');
				addAutocompleteElementInNode1(myNod, 'uptdestinationBranchEle', 'Select proper Destination Branch !');
				addAutocompleteElementInNode1(myNod, 'updatePartyEle', 'Select proper Party !');
				addAutocompleteElementInNode1(myNod, 'uptwayBillTypeEle', 'Select LR Type !');
				addAutocompleteElementInNode1(myNod, 'uptcommissionTypeEle', 'Select Proper Commission Type !');
				addElementToCheckEmptyInNode(myNod, 'uptcommissionValueEle', 'Please Enter Amount');
				addElementToCheckFloatInNode(myNod, 'uptcommissionValueEle', 'Value should be decimal number');

				if(jsonObject.dataView.weightConfigId != 0)
					addAutocompleteElementInNode1(myNod, 'uptweightConfigEle', 'Select Proper Weight Config Type !');

				if(jsonObject.dataView.packingTypeMasterId != 0)
					addAutocompleteElementInNode1(myNod, 'uptpackingTypeEle','Select Proper Packing Type !');

				if(jsonObject.dataView.applicableOnChargeTypeMasterIds != null)
					addAutocompleteElementInNode1(myNod, 'uptchargeTypeMasterEle','Select Proper Charge Type !');
				
				$('#uptcommissionValueEle').val(jsonObject.dataView.commissionValue);
				
				hideLayer();
				$("#updateCommBtn").click(function() {
					myNod.performCheck();
					if(myNod.areAll('valid')){
						_this.onUpdate(_this);								
					}
				});
				
				$('#uptisPercentageEle').bootstrapSwitch({
					on : 'YES',
					off : 'NO',
					onLabel : 'YES',
					offLabel : 'NO',
					deactiveContent : 'Are You Sure To Switch To Percentage?',
					activeContent : 'Are You Sure To Switch To Normal Value?'

				});
				
				$('#uptisPercentageId').addClass('hide')

				if(jsonObject.dataView.commissionTypeId == COMMISSION_TYPE_ON_CHARGE_MASTER_ID){
					$('#uptchargeTypeMasterId').removeClass('hide')
					$('#uptisPercentageId').removeClass('hide')
				}
				
				$('#uptisPercentageEle').prop('checked', jsonObject.dataView.percentagValue);
				
				if(jsonObject.dataView.commissionTypeId == COMMISSION_TYPE_ON_WEIGHT_ID)
					$('#uptweightConfigId').removeClass('hide')
				
				if(jsonObject.dataView.commissionTypeId == COMMISSION_TYPE_ON_PACKING_TYPE_ID)
					$('#uptpackingTypeId').removeClass('hide')
				
				if(jsonObject.dataView.commissionTypeId == COMMISSION_TYPE_ON_CHARGE_SUM_ID || jsonObject.dataView.commissionTypeId == COMMISSION_TYPE_ON_CHARGE_MASTER_ID)
					$('#uptisPercentageId').removeClass('hide')
			});

			return _this;
		},onUpdate : function() {
			if (confirm('Are you sure you want to update?')) {
				showLayer();
				var newJsonObject = new Object();
				newJsonObject["partyCommissionId"] 		= partyCommissionId;
				newJsonObject["sourceBranchId"] 			= $('#updateBranchEle').val();
				newJsonObject["corporateAccountId"] 		= $("#updatePartyEle_primary_key").val();
				newJsonObject["destinationBranchId"] 		= $('#uptdestinationBranchEle').val();
				newJsonObject["wayBillTypeId"] 				= $('#uptwayBillTypeEle').val();
				newJsonObject["applicableOnChargeTypeMasterIds"] 			= $('#uptchargeTypeMasterEle').val();
				newJsonObject["commissionTypeId"] 			= $('#uptcommissionTypeEle').val();
				newJsonObject["weightConfigId"] 			= $('#uptweightConfigEle').val();
				newJsonObject["packingTypeMasterId"] 		= $('#uptpackingTypeEle').val();
				newJsonObject["commissionValue"] 			= $('#uptcommissionValueEle').val();
				newJsonObject["isPercentage"] 				= $('#uptisPercentageEle').prop('checked');

				getJSON(newJsonObject, WEB_SERVICE_URL+'/partyCommissionMasterWS/updatePartyCommissionDetails.do', _this.setSavingResponse, EXECUTE_WITH_ERROR);
			} else {
				hideLayer();
			}
		},setSavingResponse : function(response){
			if(response.message != undefined){
				var MyRouter = new Marionette.AppRouter({});
				MyRouter.navigate('&modulename=partyCommissionMaster&savedSuccess=true',{trigger: true});
				location.reload();
				hideLayer();
				return;
			}

			hideLayer();
		},onDestinationSelect : function (){
			if($('#destinationBranchEle').val() == -1){
				
			}
		},onCommissionTypeSelect : function (){
			if($('#uptcommissionTypeEle').val() == COMMISSION_TYPE_ON_WEIGHT_ID){
				$('#uptweightConfigId').removeClass('hide')
				$("#uptweightConfigEle").prop('disabled', false);
				myNod.add({
					selector: '#uptweightConfigEle',
					validate: 'presenceIfNotDisable:#uptweightConfigEle',
					errorMessage: 'Select Proper Weight Config !'
				});
			}else{
				$('#uptweightConfigId').addClass('hide')
				$("#uptweightConfigEle").prop('disabled', true);
			}
			if($('#uptcommissionTypeEle').val() == COMMISSION_TYPE_ON_PACKING_TYPE_ID){
				$('#uptpackingTypeId').removeClass('hide')
				$("#uptpackingTypeEle").prop('disabled', false);
				myNod.add({
					selector: '#uptpackingTypeEle',
					validate: 'presenceIfNotDisable:#uptpackingTypeEle',
					errorMessage: 'Select Proper Packing Type !'
				});
			}else{
				$('#uptpackingTypeId').addClass('hide')
				$("#uptpackingTypeEle").prop('disabled', true);
			}

			if($('#uptcommissionTypeEle').val() == COMMISSION_TYPE_ON_CHARGE_SUM_ID){
				$('#uptisPercentageId').removeClass('hide')
			}else{
				$('#uptisPercentageId').addClass('hide')
			}
			
			if($('#uptcommissionTypeEle').val() == COMMISSION_TYPE_ON_CHARGE_MASTER_ID){
				$('#uptisPercentageId').removeClass('hide')
				$('#uptchargeTypeMasterId').removeClass('hide')
				$("#uptchargeTypeMasterId").prop('disabled', false);
				myNod.add({
					selector: '#uptchargeTypeMasterEle',
					validate: 'presenceIfNotDisable:#uptchargeTypeMasterEle',
					errorMessage: 'Select Booking Charge Type !'
				});
			}else{
				if($('#uptcommissionTypeEle').val() != COMMISSION_TYPE_ON_CHARGE_SUM_ID){
					$('#uptisPercentageId').addClass('hide')
				}
				$('#uptchargeTypeMasterId').addClass('hide')
				$("#uptchargeTypeMasterId").prop('disabled', true);
			}
			
		},onShow: function(){
			savedSuccess	= UrlParameter.getModuleNameFromParam('savedSuccess');
			if(savedSuccess == 'true'){
				showMessage('success', 'Data Updated Successfully !');
			}
		}
	});
});
