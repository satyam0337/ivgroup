define([  
 		'/ivcargo/resources/js/generic/urlparameter.js'
 		,'selectizewrapper'
		,'JsonUtility'
		,'messageUtility'
		,'nodvalidation'
		,'focusnavigation'//import in require.config
		,'/ivcargo/resources/js/module/redirectAfterUpdate.js'
	], function(UrlParameter, Selectizewrapper) {
	'use strict';
	let jsonObject = new Object(), myNod,  _this = '', dispatchLedgerId, destinationBranchIdCurr, redirectTo;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
			dispatchLedgerId 				= UrlParameter.getModuleNameFromParam('dispatchLedgerId');
			redirectTo						= UrlParameter.getModuleNameFromParam('redirectTo');
			jsonObject.dispatchLedgerId		= dispatchLedgerId;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/editLSWS/loadEditLSDeatination.do?', _this.renderUpdateLSDestination, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, renderUpdateLSDestination : function (response) {
			if(response.message != undefined){
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				setTimeout(function() {
					window.close();
				}, 2000);
				return;
			}
			
			let loadelement = new Array();
			let baseHtml = new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/editLSDestination/editLSDestination.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				if(response.showMergingBranchesInDestination) {
					Selectizewrapper.setAutocomplete({
						url				: 	WEB_SERVICE_URL + '/autoCompleteWS/getDeliveryPointDestinationBranch.do?locationId=' + response.sourceBranchId + '&branchType=3&isOwnBranchRequired=true&isOwnBranchWithLocationsRequired=true&branchNetworkConfiguration=true',
						valueField		:	'branchId',
						labelField		:	'branchDisplayName',
						searchField		:	'branchDisplayName',
						elementId		:	'branchEle',
						responseObjectKey : 'branchModel',
						create			: 	false,
						maxItems		: 	1
					});
				} else {
					Selectizewrapper.setAutocomplete({
						jsonResultList	: response.branchList,
						valueField		: 'branchId',
						labelField		: 'branchName',
						searchField		: 'branchName',
						elementId		: 'branchEle',
						create			: false,
						maxItems		: 1
					});
				}
				
				destinationBranchIdCurr	= response.destinationBranchId;
				
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
						_this.onSubmit(_this);								
				});
			});
		}, onSubmit : function() {
			showLayer();
			let answer = confirm ("Are you Sure to Update LS Destination?");
			
			if (answer) {
				let jsonObject = new Object();
				let destinationBranchId = $('#branchEle').val();
				
				if(destinationBranchIdCurr == Number(destinationBranchId)) {
					showMessage('info', 'Please Enter other than current destination branch');
					hideLayer();
					return;
				}
				
				jsonObject["destinationBranchId"] 		= destinationBranchId;
				jsonObject["dispatchLedgerId"] 			= dispatchLedgerId;
				jsonObject["redirectTo"]				= redirectTo;
				
				getJSON(jsonObject, WEB_SERVICE_URL+'/editLSWS/editLSDestination.do', _this.setEditDestinationResponse, EXECUTE_WITH_ERROR);
			} else {
				hideLayer();
			}
		}, setEditDestinationResponse : function(response) {
			if(response.message != undefined) {
				hideLayer();
				setTimeout(function(){redirectToAfterUpdate(response)}, 1500);
			}
			
			hideLayer();
		}
	});
});