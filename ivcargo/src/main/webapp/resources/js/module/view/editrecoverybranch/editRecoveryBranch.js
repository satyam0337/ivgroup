define([  
    '/ivcargo/resources/js/generic/urlparameter.js'
    ,'selectizewrapper'
	,'JsonUtility'
    ,'messageUtility'
    ,'nodvalidation'
    ,'focusnavigation'//import in require.config
    ,'/ivcargo/resources/js/module/redirectAfterUpdate.js'
          ],
          function(UrlParameter, Selectizewrapper) {
	'use strict';
	let myNod,  _this = '',waybillId,recoveryBranchIdCurr,redirectTo;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
			waybillId					= UrlParameter.getModuleNameFromParam('wayBillId');
			recoveryBranchIdCurr		= UrlParameter.getModuleNameFromParam('recoveryBranchId');
			redirectTo 					= UrlParameter.getModuleNameFromParam('redirectFilter');
		},render : function() {
			let jsonObject = new Object();
			jsonObject.waybillId		= waybillId;
			getJSON(jsonObject, WEB_SERVICE_URL + '/selectOptionsWS/getBranchAutocomplete.do?', _this.renderUpdateBillingBranch, EXECUTE_WITHOUT_ERROR);
			return _this;
		},renderUpdateBillingBranch : function (response){
			console.log(response);
			let loadelement = new Array();
			let baseHtml = new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/editrecoverybranch/editRecoveryBranch.html",function() {
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
				
					if(myNod.areAll('valid'))
						_this.onSubmit();								
				});
			});
			
			return _this;
		},onSubmit : function() {
			if(recoveryBranchIdCurr == Number($('#branchEle').val())) {
				showMessage('error', 'Please Enter Branch other than current Recovery branch');
				return false;
			}
			
			showLayer();
			let answer = confirm ("Are you Sure to Update Recovery Branch?");
			
			if (answer){
				let jsonObject = new Object();
				
				jsonObject["recoveryBranchId"] 			= $('#branchEle').val();
				jsonObject["waybillId"] 				= waybillId;
				jsonObject["prevRecoveryBranchId"]		= recoveryBranchIdCurr;
				jsonObject["redirectTo"]				= redirectTo;
				
				getJSON(jsonObject, WEB_SERVICE_URL+'/editRecoveryBranchWS/updateRecoveryBranch.do', _this.setEditRecoveryBranchResponse, EXECUTE_WITH_ERROR);
				hideLayer();
			} else {
				hideLayer();
			}
		},setEditRecoveryBranchResponse : function(response) {
			redirectToAfterUpdate(response);
		}
	});
});