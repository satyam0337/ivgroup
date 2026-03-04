define([  'JsonUtility'
          ,'messageUtility'
          ,'/ivcargo/resources/js/generic/urlparameter.js'
          ,PROJECT_IVUIRESOURCES + '/resources/js/module/view/hiremaster/hireMasterFilepath.js'
          ,'jquerylingua'
          ,'language'
          ,'autocomplete'
          ,'autocompleteWrapper'
          ,'slickGridWrapper2'
          ,'nodvalidation'
          ,'focusnavigation'//import in require.config
          ,'selectizewrapper'
          ,'bootstrapSwitch'
          ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
          ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/hiremaster/updateHireDetails.js'
          ],
          function(JsonUtility, MessageUtility, UrlParameter, FilePath,Lingua, Language, AutoComplete, AutoCompleteWrapper,
        		  SlickGridWrapper,NodValidation,ElementFocusNavigation,Selectizewrapper,BootstrapSwitch,BootstrapModal,UpdateHireDetails) {
	'use strict';
	var jsonObject = new Object(), myNod,  _this = '', updateSuccess,savedSuccess,masterLangObj, masterLangKeySet,gridObject,executive,isRestrictDateSelection,noOfMonthAllow;
	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/hireMasterWS/getHireMasterElements.do?', _this.setElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		},setElements : function (response){
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			loadelement.push(baseHtml);
			$("#mainContent").load("/ivcargo/html/module/hiremaster/hireMaster.html",function() {
				baseHtml.resolve();
			});
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				var keyObject = Object.keys(response);
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]].show == true) {
						$("*[data-attribute="+ keyObject[i]+ "]").addClass("show");
					}
				}
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.branchList,
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
					maxItems		: 	1
				});
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.destinationBranchList,
					valueField		:	'branchId',
					labelField		:	'branchName',
					searchField		:	'branchName',
					elementId		:	'crossingBranchEle',
					create			: 	false,
					maxItems		: 	1
				});
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.hireTypeArr,
					valueField		:	'hireTypeId',
					labelField		:	'hireTypeSting',
					searchField		:	'hireTypeSting',
					elementId		:	'typeOfHireEle',
					create			: 	false,
					maxItems		: 	1,
					onChange		: _this.onHireTypeSelect
				});
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.sequenceNumberArr,
					valueField		:	'sequnceNumber',
					labelField		:	'sequnceNumberString',
					searchField		:	'sequnceNumberString',
					elementId		:	'hireTypeIdEle',
					create			: 	false,
					maxItems		: 	1
				});
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.packingTypeForGroupList,
					valueField		:	'typeOfPackingMasterId',
					labelField		:	'packingTypeName',
					searchField		:	'packingTypeName',
					elementId		:	'packingTypeEle',
					create			: 	false,
					maxItems		: 	response.packingTypeForGroupList.length
				});
				
				
				masterLangObj = FilePath.loadLanguage();
				masterLangKeySet = loadLanguageWithParams(masterLangObj);
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
					selector: '#amountEle',
					validate: 'presence',
					errorMessage: 'Please Enter Amount'
				});
				myNod.add({
					selector		: '#amountEle',
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
				$('#isWeightTypeEle').bootstrapSwitch({
					on : 'YES',
					off : 'NO',
					onLabel : 'YES',
					offLabel : 'NO',
					deactiveContent : 'Are You Sure To Switch To Weight Type?',
					activeContent : 'Are You Sure To Switch From Weight Type?'

				});
			});
			return _this;
		
		},setBranch : function (jsonObj) {
			var autoBranchName = $("#branchEle").getInstance();

			$(autoBranchName).each(function() {
				this.option.source = jsonObj.sourceBranch;
			})
		},resetAutcomplete : function (jsonArray) {
			for ( var eleId in jsonArray) {
				var elem = $(jsonArray[eleId]).getInstance();
				$(elem).each(function() {
					var elemObj = this.elem.combo_input;
					$(elemObj).each(function() {
						$("#" + $(this).attr("id")).val('');
						$("#" + $(this).attr("id") + '_primary_key').val("");
					})
				})
			}
		},onSubmit : function() {
			showLayer();
				var jsonObject = new Object();
				
				jsonObject["sourceBranchId"] 			= $('#branchEle').val();
				jsonObject["destinationBranchId"] 		= $('#destinationBranchEle').val();
				jsonObject["amount"] 					= $('#amountEle').val();
				jsonObject["isWeightType"] 				= $('#isWeightTypeEle').prop('checked');
				jsonObject["packingType"] 				= $('#packingTypeEle').val();
				jsonObject["crossingBranchId"] 			= $('#crossingBranchEle').val();
				jsonObject["sequenceNumber"] 			= $('#hireTypeIdEle').val();
				jsonObject["typeOfHire"] 				= $('#typeOfHireEle').val();
				getJSON(jsonObject, WEB_SERVICE_URL+'/hireMasterWS/saveHireDetails.do', _this.setSavingResponse, EXECUTE_WITH_ERROR);
				
		},setSavingResponse : function(response){
			if(response.message != undefined){
				var errorMessage = response.message;
				//showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				var MyRouter = new Marionette.AppRouter({});
				MyRouter.navigate('&modulename=hireMaster&savedSuccess=true',{trigger: true});
				location.reload();
				hideLayer();
				return;
			}

			hideLayer();
		},onDestinationSelect : function (){
			if($('#destinationBranchEle').val() == -1){
				
			}
		},onBookingTypeSelect : function (){
			if($('#bookingTypeEle').val() == 2){
				$('#vehicleTypeId').show();
				$("#vehicleTypeEle").prop('disabled', false);
				myNod.add({
					selector: '#vehicleTypeEle',
					validate: 'presenceIfNotDisable:#vehicleTypeEle',
					errorMessage: 'Select Vehicle Type !'
				});
			}else{
				$('#vehicleTypeId').hide();
				$("#vehicleTypeEle").prop('disabled', true);
			}
		},onCommissionTypeSelect : function (){
			if($('#commissionTypeEle').val() == 4){
				$('#weightConfigId').show();
				$("#weightConfigEle").prop('disabled', false);
				myNod.add({
					selector: '#weightConfigEle',
					validate: 'presenceIfNotDisable:#weightConfigEle',
					errorMessage: 'Select Proper Weight Config !'
				});
			}else{
				$('#weightConfigId').hide();
				$("#weightConfigEle").prop('disabled', true);
			}

			if($('#commissionTypeEle').val() == 1){
				$('#isPercentageId').show();
			}else{
				$('#isPercentageId').hide();
			}
			
			if($('#commissionTypeEle').val() == 2){
				$('#isPercentageId').show();
				$('#chargeTypeMasterId').show();
				$("#chargeTypeMasterId").prop('disabled', false);
				myNod.add({
					selector: '#chargeTypeMasterEle',
					validate: 'presenceIfNotDisable:#chargeTypeMasterEle',
					errorMessage: 'Select Booking Charge Type !'
				});
			}else{
				if($('#commissionTypeEle').val() != 1){
					$('#isPercentageId').hide();
				}
				$('#chargeTypeMasterId').hide();
				$("#chargeTypeMasterId").prop('disabled', true);
			}
			
		},onShow: function(){
			savedSuccess	= UrlParameter.getModuleNameFromParam('savedSuccess');
			updateSuccess	= UrlParameter.getModuleNameFromParam('updateSuccess');
			if(savedSuccess == 'true'){
				showMessage('success', 'Data Saved Successfully !');
			}
			if(updateSuccess != undefined){
				if(updateSuccess == 'true'){
					showMessage('success', 'Data Updated Successfully !');
				}
			}
		},addBranchCommission : function(){
			$("#middle-border-boxshadow").toggle(900);
		},viewBranchCommission : function(){
			getJSON(jsonObject, WEB_SERVICE_URL + '/selectOptionsWS/getAllBranchAutocomplete.do?', _this.renderView, EXECUTE_WITHOUT_ERROR);
			
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
			if($("#middle-border-boxshadow").css('display') != 'none'){
				$("#middle-border-boxshadow").toggle(900);
			}
			$("#bottom-border-boxshadow").toggle(900);
			$("#updateBtn").show();
		},onView : function (){
			showLayer();
			var jsonObject = new Object();
			jsonObject["sourceBranchId"] 			= $('#agentBranchEle').val();
			 getJSON(jsonObject, WEB_SERVICE_URL+'/hireMasterWS/viewHireDetails.do', _this.setViewResponse, EXECUTE_WITH_ERROR);
		},setViewResponse : function (response){
			if(response.message != undefined){
				$('#branchCommissionDetailsDiv').hide();
				hideLayer();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}
			
			var ColumnConfig = response.tableConfig.columnConfiguration;
			var columnKeys	= _.keys(ColumnConfig);
			var bcolConfig	= new Object();
			for (var i=0; i<columnKeys.length; i++) {

				var bObj	= ColumnConfig[columnKeys[i]];
				if (bObj.show == true) {
					bcolConfig[columnKeys[i]] = bObj;
				}
			}
			response.tableConfig.columnConfiguration	= bcolConfig;
			
			response.tableConfig.Language	= masterLangKeySet;

			if(response.tableConfig.CorporateAccount != undefined) {
				$('#branchCommissionDetailsDiv').show();
				hideAllMessages();
				response.tableConfig.tableProperties.callBackFunctionForPartial = _this.viewBranchCommissionforUpdate;
				gridObject = SlickGridWrapper.setGrid(response.tableConfig);
			}
			
			hideLayer();
		},viewBranchCommissionforUpdate : function(grid,dataView,row){
			var jsonObject 		= new Object();
			jsonObject.dataView = dataView.getItem(row);
			var object 			= new Object();
			object.elementValue = jsonObject;

			var btModal = new Backbone.BootstrapModal({
				content: new UpdateHireDetails(object),
				modalWidth : 100,
				title:'Update Hire Details'

			}).open();
			/*object.btModal = btModal;
			new UpdateCompanyCommDetails(object)
			btModal.open();*/
		},onHireTypeSelect : function(response){
			if(Number(response) == 1){
				$('#crossingBranchRow').show();
				$("#crossingBranchEle").prop('disabled', false);
				myNod.add({
					selector: '#crossingBranchEle',
					validate: 'presenceIfNotDisable:#crossingBranchEle',
					errorMessage: 'Select Crossing Branch !'
				});
			}else{
				$('#crossingBranchRow').hide();
				$("#crossingBranchEle").prop('disabled', true);
			}
			if(Number(response) == 2){
				$('#destinationBranchRow').show();
				$("#destinationBranchEle").prop('disabled', false);
				myNod.add({
					selector: '#destinationBranchEle',
					validate: 'presenceIfNotDisable:#destinationBranchEle',
					errorMessage: 'Select Proper Destination Branch !'
				});
				$("#destinationBranchEle").prop('disabled', false);
				
				$('#sequnceNumberId').show();
				$("#hireTypeIdEle").prop('disabled', false);
				myNod.add({
					selector: '#hireTypeIdEle',
					validate: 'presenceIfNotDisable:#hireTypeIdEle',
					errorMessage: 'Select Proper Hire Number !'
				});
			 }else{
				 $('#destinationBranchRow').hide(); 
				 $('#sequnceNumberId').hide(); 
				 $("#destinationBranchEle").prop('disabled', true);
				 $("#hireTypeIdEle").prop('disabled', true);
			 }
		
		}
	});
});

function transportSearch(grid,dataView,row){
	if (confirm('Are you sure you want to Delete?')) {
		showLayer();
		var jsonObject = new Object();
		jsonObject["sourceBranchWiseCrossingAmountId"] 			= dataView.getItem(row).sourceBranchWiseCrossingAmountId;
		 getJSON(jsonObject, WEB_SERVICE_URL+'/hireMasterWS/deleteHireDetails.do', responseAfterDelete, EXECUTE_WITH_ERROR);
	}else{
		hideLayer();
	}
}
function responseAfterDelete(){
	setTimeout(function(){ location.reload(); }, 500);
	
}