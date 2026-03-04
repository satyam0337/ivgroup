define([  
         '/ivcargo/resources/js/generic/urlparameter.js'
          ,'slickGridWrapper2'
          ,'selectizewrapper'
          ,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
          ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/partyCommissionMaster/updatePartyCommDetails.js'
		  ,'JsonUtility'
          ,'messageUtility'
          ,'autocomplete'
          ,'autocompleteWrapper'
          ,'nodvalidation'
          ,'focusnavigation'//import in require.config
          ,'bootstrapSwitch'
          ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
          ],
          function(UrlParameter, SlickGridWrapper, Selectizewrapper, Selection, UpdatePartyCommDetails) {
	'use strict';
	var jsonObject = new Object(), myNod,  _this = '', branchId=0,partyId=0,partyName,branchName,savedSuccess;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
			branchId 						= UrlParameter.getModuleNameFromParam('branchId');
			partyId 						= UrlParameter.getModuleNameFromParam('partyId');
			partyName 						= UrlParameter.getModuleNameFromParam('partyName');
			branchName 						= UrlParameter.getModuleNameFromParam('branchName');
			
			if(partyName != null){
				partyName	= partyName.replace(/%20/g, " ");
			}
			
			if(branchName != null){
				branchName	= branchName.replace(/%20/g, " ");
			}
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/partyCommissionMasterWS/getPartyCommisionElementConfiguration.do?', _this.renderLRSearch, EXECUTE_WITHOUT_ERROR);
			return _this;
		},renderLRSearch : function (response){
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			loadelement.push(baseHtml);
			$("#mainContent").load("/ivcargo/html/module/partyCommissionMaster/partyCommissionMaster.html",function() {
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
			
				if(response.wayBillTypeList != undefined){
					for(var i=0;i<response.wayBillTypeList.length;i++){
						var wayBillType = response.wayBillTypeList[i];
						if(wayBillType.wayBillTypeId == -1){
							response.wayBillTypeArr.splice(i,1);
						}
					}
				}
				
				let elementConfiguration	= {};
				elementConfiguration.partyNameElement	= $("#partyEle");
				
				response.lrType							= response.wayBillType;
				response.multipleLRTypeSelection		= true;
				response.partySelectionWithoutSelectize	= true;
				response.multipleBookingChargesSelection= true;
				response.destinationBranchSelectionWithSelectize= true;
				response.multipleDestBranchSelection= true;
				response.elementConfiguration			= elementConfiguration;
				
				Selection.setSelectionToGetData(response);
				
				var branchList	= response.branchList;
				
				if(branchId > 0 && partyId > 0) {
					_this.addBranchCommission();
					$('#partyEle_primary_key').val(partyId);
					$('#branchEle').val(branchId);
					$('#partyEle').val(partyName);
					
					branchList	= new Array();
					var branch		= new Object();
					branch.branchId = branchId
					branch.branchName = branchName
					branchList.push(branch);
				}
				
				response.branchList	= branchList;
				Selection.setAgentBranches(response);
				
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
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.weightConfigList,
					valueField		:	'commissionTypeId',
					labelField		:	'commissionTypeName',
					searchField		:	'commissionTypeName',
					elementId		:	'weightConfigEle',
					create			: 	false,
					maxItems		: 	1
				});
				
				elementConfiguration.partyNameElement	= $("#partyNameEle");
				
				Selection.setPartyAutocomplete(elementConfiguration);
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				addAutocompleteElementInNode1(myNod, 'branchEle', 'Select proper Source Branch !');
				addAutocompleteElementInNode1(myNod, 'destBranchEle', 'Select proper Destination Branch !');
				addAutocompleteElementInNode1(myNod, 'lrTypeEle', 'Select LR Type !');
				addAutocompleteElementInNode1(myNod, 'commissionTypeEle', 'Select Proper Commission Type !');
				addElementToCheckEmptyInNode(myNod, 'commissionValueEle', 'Please Enter Amount');
				addElementToCheckFloatInNode(myNod, 'commissionValueEle', 'value should be decimal number');

				hideLayer();

				$("#saveBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmit(_this);								
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
				$('#isPercentageId').addClass('hide');
			});
			return _this;
		},onSubmit : function() {
			showLayer();
			var jsonObject = new Object();
				
			jsonObject["sourceBranchId"] 			= $('#branchEle').val();
			jsonObject["destinationBranchIdsString"] = $('#destBranchEle').val();
			jsonObject["wayBillTypeString"] 		= $('#lrTypeEle').val();
			jsonObject["chargeTypeMaster"] 			= $('#chargesEle').val();
			jsonObject["commissionTypeId"] 			= $('#commissionTypeEle').val();
			jsonObject["weightConfigId"] 			= $('#weightConfigEle').val();
			jsonObject["packingTypeString"] 		= $('#packingTypeEle').val();
			jsonObject["commissionValue"] 			= $('#commissionValueEle').val();
			jsonObject["corporateAccountId"] 		= $('#partyEle_primary_key').val();
			jsonObject["isPercentage"] 				= $('#isPercentageEle').prop('checked');
				
			 getJSON(jsonObject, WEB_SERVICE_URL+'/partyCommissionMasterWS/savePartyCommissionDetails.do', _this.setSavingResponse, EXECUTE_WITH_ERROR);
		},setSavingResponse : function(response){
			if(response.message != undefined){
				var MyRouter = new Marionette.AppRouter({});
				MyRouter.navigate('&modulename=partyCommissionMaster&savedSuccess=true',{trigger: true});
				location.reload();
				hideLayer();
				return;
			}

			hideLayer();
		},onCommissionTypeSelect : function (){
			if($('#commissionTypeEle').val() == 5){
				$('#weightConfigId').removeClass('hide');
				$("#weightConfigEle").prop('disabled', false);
				
				myNod.add({
					selector: '#weightConfigEle',
					validate: 'presenceIfNotDisable:#weightConfigEle',
					errorMessage: 'Select Proper Weight Config !'
				});
			} else {
				$('#weightConfigId').addClass('hide');
				$("#weightConfigEle").prop('disabled', true);
			}
			
			if($('#commissionTypeEle').val() == 4){
				$('#packingTypeId').removeClass('hide');
				$("#packingTypeEle").prop('disabled', false);
				
				myNod.add({
					selector: '#packingTypeEle',
					validate: 'presenceIfNotDisable:#packingTypeEle',
					errorMessage: 'Select Proper Packing Type !'
				});
			} else {
				$('#packingTypeId').addClass('hide');
				$("#packingTypeEle").prop('disabled', true);
			}

			if($('#commissionTypeEle').val() == 1)
				$('#isPercentageId').removeClass('hide');
			else
				$('#isPercentageId').addClass('hide');
			
			if($('#commissionTypeEle').val() == 2){
				$('#isPercentageId').removeClass('hide');
				$('#chargeTypeMasterId').removeClass('hide');
				$("#chargeTypeMasterId").prop('disabled', false);
				
				myNod.add({
					selector: '#chargesEle',
					validate: 'presenceIfNotDisable:#chargesEle',
					errorMessage: 'Select Booking Charge Type !'
				});
			} else {
				if($('#commissionTypeEle').val() != 1)
					$('#isPercentageId').addClass('hide');
				
				$('#chargeTypeMasterId').addClass('hide');
				$("#chargeTypeMasterId").prop('disabled', true);
			}
			
		},onShow: function(){
			savedSuccess	= UrlParameter.getModuleNameFromParam('savedSuccess');
			if(savedSuccess == 'true'){
				showMessage('success', 'Data Saved Successfully !');
			}
		},addBranchCommission : function(){
			$("#middle-border-boxshadow").hide();
			$("#bottom-border-boxshadow").css("opacity", 0);
			$("#middle-border-boxshadow").removeClass("hide");
			$("#middle-border-boxshadow").toggle("slide", { direction: "left" }, 500);
		},viewBranchCommission : function(){
			$("#middle-border-boxshadow").hide();
			$("#bottom-border-boxshadow").hide();
			$("#bottom-border-boxshadow").css("opacity", 1);
			$("#bottom-border-boxshadow").toggle("slide", { direction: "right" }, 500);
			$("#updateBtn").show();
		},onView : function (){
			showLayer();
			var jsonObject = new Object();
			jsonObject["corporateAccountId"] 		= $('#partyNameEle_primary_key').val();
			 getJSON(jsonObject, WEB_SERVICE_URL+'/partyCommissionMasterWS/viewPartyCommissionDetails.do', _this.setViewResponse, EXECUTE_WITH_ERROR);
		},setViewResponse : function (response){
			if(response.message != undefined){
				refreshAndHidePartOfPage('partyCommissionDetailsDiv', 'hide');
				hideLayer();
				return;
			}

			if(response.CorporateAccount != undefined) {
				$('#partyCommissionDetailsDiv').show();
				hideAllMessages();
				response.tableProperties.callBackFunctionForPartial = _this.viewPartyCommissionforUpdate;
				
				let language	= {};
				language.partialheader	= 'Update';
				
				response.Language	= language;
				
				SlickGridWrapper.setGrid(response);
			}
			
			hideLayer();
		},viewPartyCommissionforUpdate : function(grid,dataView,row){
			var jsonObject 		= new Object();
			jsonObject.dataView = dataView.getItem(row);
			var object 			= new Object();
			object.elementValue = jsonObject;

			var btModal = new Backbone.BootstrapModal({
				content: new UpdatePartyCommDetails(object),
				modalWidth : 100,
				title:'Update Party Commission Details'

			}).open();
			/*object.btModal = btModal;
			new UpdateBranchCommDetails(object)
			btModal.open();*/
		}
	});
});

function deleteCommission(grid,dataView,row){
	if (confirm('Are you sure you want to Delete?')) {
		showLayer();
		var jsonObject = new Object();
		jsonObject["partyCommissionId"] 				= dataView.getItem(row).partyCommissionId;
		getJSON(jsonObject, WEB_SERVICE_URL+'/partyCommissionMasterWS/deleteCommissionDetails.do', responseAfterDelete, EXECUTE_WITH_ERROR);

	}else{
		hideLayer();
	}
	}
function responseAfterDelete(){
	setTimeout(function(){ location.reload(); }, 500);
	
}