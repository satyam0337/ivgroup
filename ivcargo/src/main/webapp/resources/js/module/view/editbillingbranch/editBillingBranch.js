define([  'JsonUtility'
          ,'messageUtility'
          ,'/ivcargo/resources/js/generic/urlparameter.js'
          ,PROJECT_IVUIRESOURCES + '/resources/js/module/view/editbillingbranch/editbillingbranchfilepath.js'
          ,'jquerylingua'
          ,'language'
          ,'autocomplete'
          ,'autocompleteWrapper'
          ,'nodvalidation'
          ,'focusnavigation'//import in require.config
          ,'selectizewrapper'
          ,'/ivcargo/resources/js/module/redirectAfterUpdate.js'
          ],
          function(JsonUtility, MessageUtility, UrlParameter, FilePath,Lingua, Language, AutoComplete, AutoCompleteWrapper,
        		 NodValidation,ElementFocusNavigation,Selectizewrapper) {
	'use strict';
	var jsonObject = new Object(), myNod,  _this = '', masterLangObj, masterLangKeySet,waybillId,billingBranchIdCurr,redirectTo;
	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this = this;
			waybillId					= UrlParameter.getModuleNameFromParam('wayBillId');
			billingBranchIdCurr			= UrlParameter.getModuleNameFromParam('billingBranchId');
			redirectTo 					= UrlParameter.getModuleNameFromParam('redirectFilter');
		},render : function() {
			var jsonObject = new Object();
			jsonObject.waybillId		= waybillId;
			getJSON(jsonObject, WEB_SERVICE_URL + '/selectOptionsWS/getBranchAutocomplete.do?', _this.renderUpdateBillingBranch, EXECUTE_WITHOUT_ERROR);
			return _this;
		},renderUpdateBillingBranch : function (response){
			console.log(response);
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			loadelement.push(baseHtml);
			$("#mainContent").load("/ivcargo/html/module/editbillingbranch/editBillingBranch.html",function() {
				baseHtml.resolve();
			});
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.branchList,
					valueField		:	'branchId',
					labelField		:	'branchName',
					searchField		:	'branchName',
					elementId		:	'branchEle',
					create			: 	false,
					maxItems		: 	1
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
					errorMessage: 'Select proper Branch !'
				});

				hideLayer();
				$("#saveBtn").click(function() {
					myNod.performCheck();
					if(myNod.areAll('valid')){
						_this.onSubmit(_this);								
					}
				});
			});
			return _this;
		
		},onSubmit : function() {
			
			if(billingBranchIdCurr == Number($('#branchEle').val())){
				showMessage('info', 'Please Enter Branch other than current Billing branch');
				return false;
			}
			
			showLayer();
			var answer = confirm ("Are you Sure to Update Billing Branch?");
			if (answer){
				var jsonObject = new Object();
				
				jsonObject["billingBranchId"] 			= $('#branchEle').val();
				jsonObject["waybillId"] 				= waybillId;
				jsonObject["prevBillingBranchId"]		= billingBranchIdCurr;
				jsonObject["redirectTo"]				= redirectTo;
				
				console.log('jsonObject ',jsonObject)
				getJSON(jsonObject, WEB_SERVICE_URL+'/editBillingBranchWS/editBillingBranch.do', _this.setEditBillingBranchResponse, EXECUTE_WITH_ERROR);
				hideLayer();
			} else {
				hideLayer();
			}
		},setEditBillingBranchResponse : function(response) {
			console.log('response ',response)
			redirectToAfterUpdate(response);
		}
	});
});