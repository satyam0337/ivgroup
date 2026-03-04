define([  
          '/ivcargo/resources/js/generic/urlparameter.js'
          ,'selectizewrapper'
		 ,'JsonUtility'
          ,'messageUtility'
          ,'autocomplete'
          ,'autocompleteWrapper'
          ,'nodvalidation'
          ,'focusnavigation'//import in require.config
          ,'bootstrapSwitch'
          ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
          ],
          function(UrlParameter, Selectizewrapper) {
	'use strict';
	var jsonObject = new Object(), myNod,  _this = '',btModal, savedSuccess,branchCommissionId, rowId = 0 ;
	return Marionette.LayoutView.extend({
		initialize : function(jsonObjectData) {

			//initialize is the first function called on call new view()
			//append template first 
			//the html would be set in the el element
			//this object is not found in other function so _this has been created
			_this 				= this;
			jsonObject 			= jsonObjectData.elementValue;
			btModal				= jsonObjectData.btModal;
			rowId				= jsonObject.dataView.id - 1;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/branchCommissionMasterWS/getBranchCommissionMasterElements.do?', _this.setElements, EXECUTE_WITHOUT_ERROR);
		},setElements : function (response){
			console.log(response);
			var branchArray		= new Array();
			var destArray		= new Array();
			var txnTypeArray	= new Array();
			var commTypeArray	= new Array();
			var wayBillTypeArray = new Array();
			var bookingTypeArray = new Array();
			var packingTypeArray = new Array();
			var weightConfigArray = new Array();
			var vehicleTypeArray  = new Array();
			var transportModeConfigArray	= new Array();
			var businessTypeArray = new Array();
			
			branchCommissionId	= jsonObject.dataView.branchCommissionId;
			
			branchArray.push(jsonObject.dataView.txnBranchId);
			if(jsonObject.dataView.applicableOnBranchId == 0){
				destArray.push(-1);
			}else{
				destArray.push(jsonObject.dataView.applicableOnBranchId);
			}
			
			txnTypeArray.push(jsonObject.dataView.txnTypeId);
			commTypeArray.push(jsonObject.dataView.commissionTypeId);
			wayBillTypeArray.push(jsonObject.dataView.wayBillTypeId);
			bookingTypeArray.push(jsonObject.dataView.bookingTypeId);
			weightConfigArray.push(jsonObject.dataView.weightConfig);
			transportModeConfigArray.push(jsonObject.dataView.transportationModeId);
			businessTypeArray.push(jsonObject.dataView.businessTypeId);
			
			if(jsonObject.dataView.packingTypeMasterId == 0)
				packingTypeArray.push(-1);
			else
				packingTypeArray.push(jsonObject.dataView.packingTypeMasterId);
			
			if(jsonObject.dataView.vehicleTypeId == 0)
				vehicleTypeArray.push(-1);
			else
				vehicleTypeArray.push(jsonObject.dataView.vehicleTypeId);
			
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			loadelement.push(baseHtml);
			
			setTimeout(function(){
				$("#modalBody").load("/ivcargo/html/module/branchCommissionMaster/branchCommDetails.html",function() {
					baseHtml.resolve();
				});
			},200);
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				var keyObject = Object.keys(response);
				
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]]) {
						$("*[data-attribute="+ keyObject[i]+ "]").addClass("show");
					}
				}
				
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
					jsonResultList	: 	response.destinationBranchList,
					valueField		:	'branchId',
					labelField		:	'branchName',
					searchField		:	'branchName',
					elementId		:	'uptdestinationBranchEle',
					create			: 	false,
					maxItems		: 	1,
					items			:   destArray
				});
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.TxnTypeArr,
					valueField		:	'txnTypeId',
					labelField		:	'txnTypeName',
					searchField		:	'txnTypeName',
					elementId		:	'upttxnTypeEle',
					create			: 	false,
					maxItems		: 	1,
					items			:txnTypeArray
				});
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.wayBillTypeArr,
					valueField		:	'wayBillTypeId',
					labelField		:	'wayBillType',
					searchField		:	'wayBillType',
					elementId		:	'uptwayBillTypeEle',
					create			: 	false,
					maxItems		: 	1,
					items			:wayBillTypeArray
				});
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.chargeTypeModelArr,
					valueField		:	'chargeTypeMasterId',
					labelField		:	'chargeTypeMasterName',
					searchField		:	'chargeTypeMasterName',
					elementId		:	'uptchargeTypeMasterEle',
					create			: 	false,
					maxItems		: 	response.chargeTypeModelArr.length
				});
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.bookingTypeArr,
					valueField		:	'bookingTypeId',
					labelField		:	'bookingTypeName',
					searchField		:	'bookingTypeName',
					elementId		:	'uptbookingTypeEle',
					create			: 	false,
					maxItems		: 	1,
					onChange		: _this.onBookingTypeSelect,
					items			:bookingTypeArray
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
					jsonResultList	: 	response.vehicleTypeList,
					valueField		:	'vehicleTypeId',
					labelField		:	'name',
					searchField		:	'name',
					elementId		:	'uptvehicleTypeEle',
					create			: 	false,
					maxItems		: 	1,
					items			: vehicleTypeArray
				});
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.weightConfigList,
					valueField		:	'commissionTypeId',
					labelField		:	'commissionTypeName',
					searchField		:	'commissionTypeName',
					elementId		:	'uptweightConfigEle',
					create			: 	false,
					maxItems		: 	1,
					items			: weightConfigArray
				});
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.packingTypeForGroupList,
					valueField		:	'typeOfPackingMasterId',
					labelField		:	'packingTypeName',
					searchField		:	'packingTypeName',
					elementId		:	'uptpackingTypeEle',
					create			: 	false,
					maxItems		: 	1,
					items			:  packingTypeArray
				});
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.transportationModeList,
					valueField		:	'transportModeId',
					labelField		:	'transportModeName',
					searchField		:	'transportModeName',
					elementId		:	'upTransportationModeEle',
					create			: 	false,
					maxItems		: 	1,
					items			: transportModeConfigArray
				});
				
				if(response.businessTypeSelection){
					$('#upBusinessTypeSelectionId').show();
					Selectizewrapper.setAutocomplete({
						jsonResultList	: 	response.businessTypeList,
						valueField		:	'businessTypeId',
						labelField		:	'businessTypeName',
						searchField		:	'businessTypeName',
						elementId		:	'upBusinessTypeEle',
						create			: 	false,
						maxItems		: 	1,
						items			: businessTypeArray
					});
				}
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector: '#updateBranchEle',
					validate: 'validateAutocomplete:#updateBranchEle',
					errorMessage: 'Select proper Source Branch !'
				});
				
				myNod.add({
					selector: '#uptdestinationBranchEle',
					validate: 'validateAutocomplete:#uptdestinationBranchEle',
					errorMessage: 'Select proper Destination Branch !'
				});
				myNod.add({
					selector: '#upttxnTypeEle',
					validate: 'validateAutocomplete:#upttxnTypeEle',
					errorMessage: 'Select proper Txn Type !'
				});
			
				myNod.add({
					selector: '#uptwayBillTypeEle',
					validate: 'validateAutocomplete:#uptwayBillTypeEle',
					errorMessage: 'Select LR Type !'
				});
				/*myNod.add({
					selector: '#chargeTypeMasterEle',
					validate: 'validateAutocomplete:#chargeTypeMasterEle',
					errorMessage: 'Select Proper Booking Charges !'
				});*/
				myNod.add({
					selector: '#uptbookingTypeEle',
					validate: 'validateAutocomplete:#uptbookingTypeEle',
					errorMessage: 'Select Proper Booking Type !'
				});
				myNod.add({
					selector: '#uptcommissionTypeEle',
					validate: 'validateAutocomplete:#uptcommissionTypeEle',
					errorMessage: 'Select Proper Commission Type !'
				});
				myNod.add({
					selector: '#uptcommissionValueEle',
					validate: 'presence',
					errorMessage: 'Please Enter Amount'
				});
				myNod.add({
					selector		: '#uptcommissionValueEle',
					validate		: 'float',
					errorMessage	: 'value should be decimal number'
				});
				
				$('#uptcommissionValueEle').val(jsonObject.dataView.commissionValue);
				
				if(!jsonObject.dataView.percentagValue)
					$('#uptisPercentageEle').prop('checked',false);
				
				if(jsonObject.dataView.commissionTypeId == COMMISSION_TYPE_ON_WEIGHT_ID)
					$('#uptweightConfigId').show();
				
				if(jsonObject.dataView.commissionTypeId == COMMISSION_TYPE_ON_PACKING_TYPE_ID)
					$('#uptpackingTypeId').show();
				
				if(jsonObject.dataView.bookingTypeId == BOOKING_TYPE_FTL_ID && doNotShowVehicleTypeOnFtlBooking)
					$('#uptvehicleTypeId').show();
				
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
				$('#uptisPercentageId').hide();
				
			});
			return _this;
		},onUpdate : function() {
			if (confirm('Are you sure you want to update?')) {
				showLayer();
				var jsonObject = new Object();
				jsonObject["branchCommissionId"] 		= branchCommissionId;
				jsonObject["txnBranchId"] 				= $('#updateBranchEle').val();
				jsonObject["applicableOnBranchId"] 		= $('#uptdestinationBranchEle').val();
				jsonObject["txnType"] 					= $('#upttxnTypeEle').val();
				jsonObject["wayBillType"] 				= $('#uptwayBillTypeEle').val();
				jsonObject["chargeTypeMaster"] 			= $('#chargeTypeMasterEle').val();
				jsonObject["bookingTypeId"] 			= $('#uptbookingTypeEle').val();
				jsonObject["commissionTypeId"] 			= $('#uptcommissionTypeEle').val();
				jsonObject["vehileTypeIds"] 			= $('#uptvehicleTypeEle').val();
				jsonObject["weightConfig"] 				= $('#uptweightConfigEle').val();
				jsonObject["packingTypeMaster"] 		= $('#uptpackingTypeEle').val();
				jsonObject["commissionValue"] 			= $('#uptcommissionValueEle').val();
				jsonObject["transportationModeId"] 		= $('#upTransportationModeEle').val();
				jsonObject["isPercentage"] 				= $('#uptisPercentageEle').prop('checked');
				jsonObject["businessTypeId"] 			= $('#upBusinessTypeEle').val();
				
				showLayer();
				getJSON(jsonObject, WEB_SERVICE_URL+'/branchCommissionMasterWS/updateBranchCommissionDetails.do', _this.setSavingResponse, EXECUTE_WITH_ERROR);
			} else {
				hideLayer();
			}
		}, setSavingResponse : function(response) {
			hideLayer();
						
			if(response.message != undefined && response.message.type != MESSAGE_TYPE_SUCCESS)
				return;
						
			if(response.message != undefined) {
				$('#txnTypeString_' + rowId).html(response.txnTypeString);
				$('#commissionValue_' + rowId).html(response.commissionValue);
				$('#percentageString_' + rowId).html(response.percentageString);
				$('#bookingTypeString_' + rowId).html(response.bookingTypeString);
				$('#commissionTypeName_' + rowId).html(response.commissionTypeName);
				$('#weightConfigString_' + rowId).html(response.weightConfigString);
				$('#packingTypeString_' + rowId).html(response.packingTypeMasterName);
				$('#applicableChargeType_' + rowId).html(response.applicableChargeType);
				$('#businessTypeName_' + rowId).html(response.businessTypeName);
			}
			
			btModal.close();
				
			hideLayer();
		},onBookingTypeSelect : function (){
			if($('#uptbookingTypeEle').val() == 2 && doNotShowVehicleTypeOnFtlBooking){
				$('#uptvehicleTypeId').show();
				$("#uptvehicleTypeId").prop('disabled', false);
				myNod.add({
					selector: '#uptvehicleTypeEle',
					validate: 'presenceIfNotDisable:#uptvehicleTypeEle',
					errorMessage: 'Select Vehicle Type !'
				});
			}else{
				$('#uptvehicleTypeId').hide();
				$("#uptvehicleTypeEle").prop('disabled', true);
			}
		},onCommissionTypeSelect : function (){
			if($('#uptcommissionTypeEle').val() == COMMISSION_TYPE_ON_WEIGHT_ID){
				$('#uptweightConfigId').show();
				$("#uptweightConfigEle").prop('disabled', false);
				myNod.add({
					selector: '#uptweightConfigEle',
					validate: 'presenceIfNotDisable:#uptweightConfigEle',
					errorMessage: 'Select Proper Weight Config !'
				});
			}else{
				$('#uptweightConfigId').hide();
				$("#uptweightConfigEle").prop('disabled', true);
			}
			if($('#uptcommissionTypeEle').val() == COMMISSION_TYPE_ON_PACKING_TYPE_ID){
				$('#uptpackingTypeId').show();
				$("#uptpackingTypeEle").prop('disabled', false);
				myNod.add({
					selector: '#uptpackingTypeEle',
					validate: 'presenceIfNotDisable:#uptpackingTypeEle',
					errorMessage: 'Select Proper Packing Type !'
				});
			}else{
				$('#uptpackingTypeId').hide();
				$("#uptpackingTypeEle").prop('disabled', true);
			}

			if($('#uptcommissionTypeEle').val() == COMMISSION_TYPE_ON_CHARGE_SUM_ID)
				$('#uptisPercentageId').show();
			else
				$('#uptisPercentageId').hide();
			
			if($('#uptcommissionTypeEle').val() == COMMISSION_TYPE_ON_CHARGE_MASTER_ID){
				$('#uptisPercentageId').show();
				$('#uptchargeTypeMasterId').show();
				$("#uptchargeTypeMasterId").prop('disabled', false);
				myNod.add({
					selector: '#uptchargeTypeMasterEle',
					validate: 'presenceIfNotDisable:#uptchargeTypeMasterEle',
					errorMessage: 'Select Booking Charge Type !'
				});
			}else{
				if($('#uptcommissionTypeEle').val() != COMMISSION_TYPE_ON_CHARGE_SUM_ID){
					$('#uptisPercentageId').hide();
				}
				$('#uptchargeTypeMasterId').hide();
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

function deleteBranchCommission(grid,dataView,row){
	if(dataView.getItem(row).wayBillId != undefined){
		window.open('TransportSearchWayBillAction.do?pageId=3&eventId=8&wayBillId='+dataView.getItem(row).wayBillId+'&wayBillNumber='+dataView.getItem(row).wayBillNumber+'&flag=true&id=search+&userErrorId=0&errorAssociatedToNumber=');
	} 
}