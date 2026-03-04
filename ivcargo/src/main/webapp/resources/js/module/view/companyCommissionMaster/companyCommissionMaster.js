define([  
          '/ivcargo/resources/js/generic/urlparameter.js'
          ,'slickGridWrapper2'
          ,'selectizewrapper'
          ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/companyCommissionMaster/updateCompanyCommDetails.js'
		 ,'JsonUtility'
          ,'messageUtility'
          ,'autocomplete'
          ,'autocompleteWrapper'
          ,'nodvalidation'
          ,'focusnavigation'//import in require.config
          ,'bootstrapSwitch'
          ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
          ],
          function(UrlParameter, SlickGridWrapper, Selectizewrapper, UpdateCompanyCommDetails) {
	'use strict';
	var jsonObject = new Object(), myNod,  _this = '', savedSuccess;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/companyCommissionMasterWS/getCompanyCommissionMasterElements.do?', _this.renderLRSearch, EXECUTE_WITHOUT_ERROR);
			return _this;
		},renderLRSearch : function (response){
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/companyCommissionMaster/companyCommissionMaster.html",function() {
				baseHtml.resolve();
			});
			
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
					elementId		:	'branchEle',
					create			: 	false,
					maxItems		: 	1
				});
			
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.destinationBranchList,
					valueField		:	'branchId',
					labelField		:	'branchName',
					searchField		:	'branchName',
					elementId		:	'destinationBranchEle',
					create			: 	false,
					maxItems		: 	response.destinationBranchList.length
				});
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.wayBillTypeArr,
					valueField		:	'wayBillTypeId',
					labelField		:	'wayBillType',
					searchField		:	'wayBillType',
					elementId		:	'wayBillTypeEle',
					create			: 	false,
					maxItems		: 	response.wayBillTypeArr.length
				});
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.chargeTypeModelArr,
					valueField		:	'chargeTypeMasterId',
					labelField		:	'chargeTypeMasterName',
					searchField		:	'chargeTypeMasterName',
					elementId		:	'chargeTypeMasterEle',
					create			: 	false,
					maxItems		: 	response.chargeTypeModelArr.length
				});
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.commissionTypeArr,
					valueField		:	'commissionTypeId',
					labelField		:	'commissionTypeName',
					searchField		:	'commissionTypeName',
					elementId		:	'commissionTypeEle',
					create			: 	false,
					maxItems		: 	1,
					onChange		: _this.onCommissionTypeSelect
				});
				
				/*
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.packingTypeForGroupList,
					valueField		:	'typeOfPackingMasterId',
					labelField		:	'packingTypeName',
					searchField		:	'packingTypeName',
					elementId		:	'packingTypeEle',
					create			: 	false,
					maxItems		: 	response.packingTypeForGroupList.length
				});*/
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.weightConfigList,
					valueField		:	'commissionTypeId',
					labelField		:	'commissionTypeName',
					searchField		:	'commissionTypeName',
					elementId		:	'weightConfigEle',
					create			: 	false,
					maxItems		: 	1
				});
			
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector: '#branchEle',
					validate: 'validateAutocomplete:#branchEle',
					errorMessage: 'Select proper Source Branch !'
				});
				
				myNod.add({
					selector: '#destinationBranchEle',
					validate: 'validateAutocomplete:#destinationBranchEle',
					errorMessage: 'Select proper Destination Branch !'
				});
				myNod.add({
					selector: '#wayBillTypeEle',
					validate: 'validateAutocomplete:#wayBillTypeEle',
					errorMessage: 'Select LR Type !'
				});
				/*myNod.add({
					selector: '#chargeTypeMasterEle',
					validate: 'validateAutocomplete:#chargeTypeMasterEle',
					errorMessage: 'Select Proper Booking Charges !'
				});*/
			
				myNod.add({
					selector: '#commissionTypeEle',
					validate: 'validateAutocomplete:#commissionTypeEle',
					errorMessage: 'Select Proper Commission Type !'
				});
				myNod.add({
					selector: '#commissionValueEle',
					validate: 'presence',
					errorMessage: 'Please Enter Amount'
				});
				myNod.add({
					selector		: '#commissionValueEle',
					validate		: 'float',
					errorMessage	: 'value should be decimal number'
				});
				
				hideLayer();
				$("#saveBtn").click(function() {
					myNod.performCheck();
					if(myNod.areAll('valid')){
						_this.onSubmit(_this);								
					}
				});
				
				$("#add").click(function(){
					_this.addBranchCommission();
				});
				
				$("#viewAllBranchComm").click(function(){
					_this.viewBranchCommission();
				});
				
				$("#updateBtn").click(function() {
					_this.onView(_this);								
				});
				
				$('#isPercentageEle').bootstrapSwitch({
					on : 'YES',
					off : 'NO',
					onLabel : 'YES',
					offLabel : 'NO',
					deactiveContent : 'Are You Sure To Switch To Percentage?',
					activeContent : 'Are You Sure To Switch To Normal Value?'

				});
			});
			return _this;
		
		},setBranch : function (jsonObj) {
			var autoBranchName = $("#branchEle").getInstance();

			$(autoBranchName).each(function() {
				this.option.source = jsonObj.sourceBranch;
			})
		},onSubmit : function() {
			showLayer();
				var jsonObject = new Object();
				
				jsonObject["bookingBranchId"] 			= $('#branchEle').val();
				jsonObject["applicableOnBranchIdString"] = $('#destinationBranchEle').val();
				jsonObject["wayBillTypeString"] 		= $('#wayBillTypeEle').val();
				jsonObject["chargeTypeMaster"] 			= $('#chargeTypeMasterEle').val();
				jsonObject["commissionTypeId"] 			= $('#commissionTypeEle').val();
				jsonObject["commissionValue"] 			= $('#commissionValueEle').val();
				jsonObject["isPercentage"] 				= $('#isPercentageEle').prop('checked');
				jsonObject["weightConfig"] 				= $('#weightConfigEle').val();
				
				 getJSON(jsonObject, WEB_SERVICE_URL+'/companyCommissionMasterWS/saveCompanyCommissionDetails.do', _this.setSavingResponse, EXECUTE_WITH_ERROR);
				
		},setSavingResponse : function(response){
			if(response.message != undefined){
				var MyRouter = new Marionette.AppRouter({});
				MyRouter.navigate('&modulename=companyCommissionMaster&savedSuccess=true',{trigger: true});
				location.reload();
				hideLayer();
				return;
			}

			hideLayer();
		},onBookingTypeSelect : function (){
			if($('#bookingTypeEle').val() == 2){
				$('#vehicleTypeId').removeClass('hide');
				$("#vehicleTypeEle").prop('disabled', false);
				myNod.add({
					selector: '#vehicleTypeEle',
					validate: 'presenceIfNotDisable:#vehicleTypeEle',
					errorMessage: 'Select Vehicle Type !'
				});
			}else{
				$('#vehicleTypeId').addClass('hide');
				$("#vehicleTypeEle").prop('disabled', true);
			}
		},onCommissionTypeSelect : function (){
			if($('#commissionTypeEle').val() == 4){
				$('#weightConfigId').removeClass('hide');
				$("#weightConfigEle").prop('disabled', false);
				myNod.add({
					selector: '#weightConfigEle',
					validate: 'presenceIfNotDisable:#weightConfigEle',
					errorMessage: 'Select Proper Weight Config !'
				});
			}else{
				$('#weightConfigId').addClass('hide');
				$("#weightConfigEle").prop('disabled', true);
			}

			if($('#commissionTypeEle').val() == 1){
				$('#isPercentageId').removeClass('hide');
			}else{
				$('#isPercentageId').addClass('hide');
			}
			
			if($('#commissionTypeEle').val() == 2){
				$('#isPercentageId').removeClass('hide');
				$('#chargeTypeMasterId').removeClass('hide');
				$("#chargeTypeMasterId").prop('disabled', false);
				myNod.add({
					selector: '#chargeTypeMasterEle',
					validate: 'presenceIfNotDisable:#chargeTypeMasterEle',
					errorMessage: 'Select Booking Charge Type !'
				});
			}else{
				if($('#commissionTypeEle').val() != 1){
					$('#isPercentageId').removeClass('hide');
				}
				$('#chargeTypeMasterId').addClass('hide');
				$("#chargeTypeMasterId").prop('disabled', true);
			}
			
		},onShow: function(){
			savedSuccess	= UrlParameter.getModuleNameFromParam('savedSuccess');
			if(savedSuccess == 'true'){
				showMessage('success', 'Data Saved Successfully !');
			}
		},addBranchCommission : function(){
			$("#middle-border-boxshadow").toggle(900);
			
			if($("#bottom-border-boxshadow").css('display') != 'none'){
				$("#bottom-border-boxshadow").toggle(900);
			}
		},viewBranchCommission : function(){
			getJSON(jsonObject, WEB_SERVICE_URL + '/selectOptionsWS/getAllBranchAutocomplete.do?', _this.renderView, EXECUTE_WITHOUT_ERROR);
			showLayer();
		},renderView : function (response){
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	response.branchList,
				valueField		:	'branchId',
				labelField		:	'branchName',
				searchField		:	'branchName',
				elementId		:	'agentBranchEle',
				create			: 	false,
				maxItems		: 	1
			});
			
			hideLayer();
			
			if($("#middle-border-boxshadow").css('display') != 'none'){
				$("#middle-border-boxshadow").toggle(900);
			}
			$("#bottom-border-boxshadow").toggle(900);
			$("#updateBtn").show();
		},onView : function (){
			showLayer();
			var jsonObject = new Object();
			jsonObject["txnBranchId"] 			= $('#agentBranchEle').val();
			getJSON(jsonObject, WEB_SERVICE_URL+'/companyCommissionMasterWS/viewCompanyCommissionDetails.do', _this.setViewResponse, EXECUTE_WITH_ERROR);
		},setViewResponse : function (response) {
			if(response.message != undefined) {
				refreshAndHidePartOfPage('branchCommissionDetailsDiv', 'hide');
				hideLayer();
				return;
			}
			
			let language	= {};
			language.partialheader = 'Update';
			
			response.Language	= language;

			if(response.CorporateAccount != undefined) {
				$('#branchCommissionDetailsDiv').show();
				hideAllMessages();
				response.tableProperties.callBackFunctionForPartial = _this.viewBranchCommissionforUpdate;
				SlickGridWrapper.setGrid(response);
			}
			
			hideLayer();
		},viewBranchCommissionforUpdate : function(grid,dataView,row){
			var jsonObject 		= new Object();
			jsonObject.dataView = dataView.getItem(row);
			var object 			= new Object();
			object.elementValue = jsonObject;

			var btModal = new Backbone.BootstrapModal({
				content: new UpdateCompanyCommDetails(object),
				modalWidth : 100,
				title:'Update Company Commission Details'

			}).open();
			/*object.btModal = btModal;
			new UpdateCompanyCommDetails(object)
			btModal.open();*/
		}
	});
});

function deleteCommissionDetails(grid,dataView,row){
	if (confirm('Are you sure you want to Delete?')) {
		showLayer();
		var jsonObject = new Object();
		jsonObject["companyCommisionId"] 			= dataView.getItem(row).companyCommisionId;
		 getJSON(jsonObject, WEB_SERVICE_URL+'/companyCommissionMasterWS/deleteCommissionDetails.do', responseAfterDelete, EXECUTE_WITH_ERROR);
	}else{
		hideLayer();
	}
}
function responseAfterDelete(){
	setTimeout(function(){ location.reload(); }, 500);
	
}