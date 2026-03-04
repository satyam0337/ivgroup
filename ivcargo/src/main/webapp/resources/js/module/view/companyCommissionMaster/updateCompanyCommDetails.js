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
	var jsonObject = new Object(), myNod,  _this = '', savedSuccess, companyCommisionId;
	return Marionette.LayoutView.extend({
		initialize : function(jsonObjectData) {

			//initialize is the first function called on call new view()
			//append template first 
			//the html would be set in the el element
			//this object is not found in other function so _this has been created
			_this 				= this;
			jsonObject 			= jsonObjectData.elementValue;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/companyCommissionMasterWS/getCompanyCommissionMasterElements.do?', _this.setElements, EXECUTE_WITHOUT_ERROR);
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
			companyCommisionId	= jsonObject.dataView.companyCommisionId;
			
			branchArray.push(jsonObject.dataView.bookingBranchId);
			
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
		
			if(jsonObject.dataView.packingTypeMasterId == 0){
				packingTypeArray.push(-1);
			}else{
				packingTypeArray.push(jsonObject.dataView.packingTypeMasterId);
			}
			if(jsonObject.dataView.vehicleTypeId == 0){
				vehicleTypeArray.push(-1);
			}else{
				vehicleTypeArray.push(jsonObject.dataView.vehicleTypeId);
			}
			
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			loadelement.push(baseHtml);
			
			setTimeout(function(){
				$("#modalBody").load("/ivcargo/html/module/companyCommissionMaster/companyCommDetails.html",function() {
					baseHtml.resolve();
				});
			},200);
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				var keyObject = Object.keys(response);
				
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]]) {
						$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
					}
				}
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.destinationBranchList,
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
					jsonResultList	: 	response.wayBillTypeArr,
					valueField		:	'wayBillTypeId',
					labelField		:	'wayBillType',
					searchField		:	'wayBillType',
					elementId		:	'uptwayBillTypeEle',
					create			: 	false,
					maxItems		: 	1,
					items			:	wayBillTypeArray
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
					jsonResultList	: 	response.commissionTypeArr,
					valueField		:	'commissionTypeId',
					labelField		:	'commissionTypeName',
					searchField		:	'commissionTypeName',
					elementId		:	'uptcommissionTypeEle',
					create			: 	false,
					maxItems		: 	1,
					onChange		: _this.onCommissionTypeSelect,
					items			:	commTypeArray
				});
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.weightConfigList,
					valueField		:	'commissionTypeId',
					labelField		:	'commissionTypeName',
					searchField		:	'commissionTypeName',
					elementId		:	'uptweightConfigEle',
					create			: 	false,
					maxItems		: 	1,
					items			:	weightConfigArray
				});
				
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
				
				if(!jsonObject.dataView.percentagValue){
					$('#uptisPercentageEle').prop('checked',false);
				}
				
				if(jsonObject.dataView.commissionTypeId == 4){
					$('#uptweightConfigId').removeClass('hide');
				}
				
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
				
			});
			return _this;
		},onUpdate : function() {
			showLayer();
				var jsonObject = new Object();
				if (confirm('Are you sure you want to Update?')) {
				    jsonObject["companyCommisionId"] 		= companyCommisionId;
					jsonObject["bookingBranchId"] 					= $('#updateBranchEle').val();
					jsonObject["applicableOnBranchId"] 				= $('#uptdestinationBranchEle').val();
					jsonObject["wayBillTypeId"] 					= $('#uptwayBillTypeEle').val();
					jsonObject["applicableOnChargeTypeMasterIds"] 	= $('#chargeTypeMasterEle').val();
					jsonObject["commissionTypeId"] 					= $('#uptcommissionTypeEle').val();
					jsonObject["commissionValue"] 					= $('#uptcommissionValueEle').val();
					jsonObject["isPercentage"] 						= $('#uptisPercentageEle').prop('checked');
					jsonObject["weightConfig"]						= $('#uptweightConfigEle').val();
					 getJSON(jsonObject, WEB_SERVICE_URL+'/companyCommissionMasterWS/updateCompanyCommissionDetails.do', _this.setSavingResponse, EXECUTE_WITH_ERROR);
				} else {
					hideLayer();
				}
			
		},setSavingResponse : function(response){
			if(response.message != undefined){
				var MyRouter = new Marionette.AppRouter({});
				MyRouter.navigate('&modulename=companyCommissionMaster&savedSuccess=true',{trigger: true});
				location.reload();
				hideLayer();
				return;
			}

			hideLayer();
		},onCommissionTypeSelect : function (){
			if($('#uptcommissionTypeEle').val() == 5){
				$('#uptweightConfigId').removeClass('hide');
				$("#uptweightConfigEle").prop('disabled', false);
				myNod.add({
					selector: '#uptweightConfigEle',
					validate: 'presenceIfNotDisable:#uptweightConfigEle',
					errorMessage: 'Select Proper Weight Config !'
				});
			}else{
				$('#uptweightConfigId').addClass('hide');
				$("#uptweightConfigEle").prop('disabled', true);
			}
			if($('#uptcommissionTypeEle').val() == 4){
				$('#uptpackingTypeId').removeClass('hide');
				$("#uptpackingTypeEle").prop('disabled', false);
				myNod.add({
					selector: '#uptpackingTypeEle',
					validate: 'presenceIfNotDisable:#uptpackingTypeEle',
					errorMessage: 'Select Proper Packing Type !'
				});
			}else{
				$('#uptpackingTypeId').addClass('hide');
				$("#uptpackingTypeEle").prop('disabled', true);
			}

			if($('#uptcommissionTypeEle').val() == 1){
				$('#uptisPercentageId').removeClass('hide');
			}else{
				$('#uptisPercentageId').addClass('hide');
			}
			
			if($('#uptcommissionTypeEle').val() == 2){
				$('#uptisPercentageId').removeClass('hide');
				$('#uptchargeTypeMasterId').removeClass('hide');
				$("#uptchargeTypeMasterId").prop('disabled', false);
				myNod.add({
					selector: '#uptchargeTypeMasterEle',
					validate: 'presenceIfNotDisable:#uptchargeTypeMasterEle',
					errorMessage: 'Select Booking Charge Type !'
				});
			}else{
				if($('#uptcommissionTypeEle').val() != 1){
					$('#uptisPercentageId').addClass('hide');
				}
				$('#uptchargeTypeMasterId').addClass('hide');
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
