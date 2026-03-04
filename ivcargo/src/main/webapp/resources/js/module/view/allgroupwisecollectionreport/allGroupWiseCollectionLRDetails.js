define([  'JsonUtility'
	,'messageUtility'
	,'/ivcargo/resources/js/generic/urlparameter.js'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/allgroupwisecollectionreport/allgroupwisecollectionreportfilepath.js'
	,'jquerylingua'
	,'language'
	,'autocomplete'
	,'autocompleteWrapper'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'slickGridWrapper2'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	],function(JsonUtility, MessageUtility, UrlParameter, FilePath, Lingua, Language, AutoComplete, AutoCompleteWrapper,
			 NodValidation, BootstrapModal, slickGridWrapper2, ElementFocusNavigation,Selection) {
	'use strict';
	var jsonObject = new Object(), 
	myNod,
	_this = '', 
	masterLangObj, 
	masterLangKeySet,
	fromDate,
	toDate,
	branchId,
	gridObject,
	showAmountWithGSTNColumn = false;
	
	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this = this;
			branchId		 	= UrlParameter.getModuleNameFromParam('branchId');
			fromDate			= UrlParameter.getModuleNameFromParam('fromDate');
			toDate 				= UrlParameter.getModuleNameFromParam('toDate');
			console.log('branchId >>> ', branchId)
		},render : function() {
			jsonObject	= new Object();
			
			jsonObject.branchId				= branchId;
			jsonObject.fromDate				= fromDate;
			jsonObject.toDate				= toDate;
			console.log('jsonObject >>> ', jsonObject)
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/allBranchWiseCollectionReportWS/getAllBranchWiseCollectionLRDetails.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		},getElementConfigDetails : function(response){

			console.log("response : " ,response);
			
			var loadelement = new Array();
			var baseHtml 	= new $.Deferred();

			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/allbranchwisecollectionreport/AllBranchWiseCollectionLRDetails.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				masterLangObj 		= FilePath.loadLanguage();
				masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
				if(response.message != undefined) {
					hideLayer();
					$('#top-border-boxshadow').addClass('hide');
					$('#middle-border-boxshadow').addClass('hide');
					$('#bottom-border-boxshadow').addClass('hide');
					
					var errorMessage = response.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
					
					return;
				}
				if(response.BookedLRs != undefined && response.BookedLRs.CorporateAccount.length > 0){
					var ColumnConfig		= response.BookedLRs.columnConfiguration;
					var columnKeys			= _.keys(ColumnConfig);
					var bcolConfig			= new Object();
					
					for (var i=0; i<columnKeys.length; i++) {
						var bObj		= ColumnConfig[columnKeys[i]];
						if (bObj.show == true) {
							bcolConfig[columnKeys[i]]	= bObj;
						}
					}
					response.BookedLRs.columnConfiguration		= _.values(bcolConfig);
					response.BookedLRs.Language					= masterLangKeySet;
					hideLayer();
					gridObject = slickGridWrapper2.setGrid(response.BookedLRs);
				} else {
					$('#middle-border-boxshadow').addClass('hide');
				}
				
				if(response.DeliveredLRs != undefined && response.DeliveredLRs.CorporateAccount.length > 0){
					var ColumnConfig		= response.DeliveredLRs.columnConfiguration;
					var columnKeys			= _.keys(ColumnConfig);
					var bcolConfig			= new Object();
					
					for (var i=0; i<columnKeys.length; i++) {
						var bObj		= ColumnConfig[columnKeys[i]];
						if (bObj.show == true) {
							bcolConfig[columnKeys[i]]	= bObj;
						}
					}
					response.DeliveredLRs.columnConfiguration		= _.values(bcolConfig);
					response.DeliveredLRs.Language					= masterLangKeySet;
					hideLayer();
					gridObject = slickGridWrapper2.setGrid(response.DeliveredLRs);
				} else {
					$('#bottom-border-boxshadow').addClass('hide');
				}
				if(response.bookingTotal <= 0 && response.deliveryTotal <= 0){
					$('#top-border-boxshadow').addClass('hide');
				} else {
					var bookingTotal 	= Math.round(response.bookingTotal);
					var deliveryTotal 	= Math.round(response.deliveryTotal);
					var totalAmt 		= bookingTotal + deliveryTotal;
					$("*[data-selector='totalHeader']").html("Total Amount = Booking Total + Delivery Total = "+bookingTotal+" + "+ deliveryTotal +" = " + totalAmt);
					
				}
			});

		}
	});
});