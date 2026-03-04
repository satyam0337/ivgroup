var bookingWayBillTxn;
define([
	'JsonUtility',
	 'messageUtility',
	 PROJECT_IVUIRESOURCES + '/resources/js/module/view/vehicleWiseCommissionReport/vehicleWiseCommissionReportFilePath.js',
	 'jquerylingua',
	 'language',
	 'bootstrapSwitch',
	 'selectizewrapper',
	 'slickGridWrapper2',
	 'nodvalidation',
	 'focusnavigation',
	 PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
	 PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js',
],function(JsonUtility, MessageUtility, FilePath, Lingua, Language, BootstrapSwitch, Selectizewrapper,slickGridWrapper2, NodValidation, FocusNavigation,
		 BootstrapModal, Selection){
	'use strict';
	var jsonObject = new Object(), 
	myNod, 
	masterLangObj, 
	masterLangKeySet, 
	gridObject, 
	_this;
	return Marionette.LayoutView.extend({
		initialize : function(masterObj){
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/VehicleWiseCommissionReportWS/getVehicleWiseCommissionReportElement.do?',	_this.setVehicleWiseCommissionReportElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		},setVehicleWiseCommissionReportElements : function(response){
			
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			
			loadelement.push(baseHtml);
				$("#mainContent").load("/ivcargo/html/module/vehicleWiseCommissionReport/vehicleWiseCommissionReport.html",function() {
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
					jsonResultList	: 	response.vehicleNumberMasterList,
					valueField		:	'vehicleNumberMasterId',
					labelField		:	'vehicleNumber',
					searchField		:	'vehicleNumber',
					elementId		:	'vehicleEle',
					create			: 	false,
					maxItems		: 	100
				});
				
				var options				= new Object();
				options.minDate			= response.minDateString;
				options.monthLimit 		= 1;
				$("#dateEle").DatePickerCus(options);
				
				var keyObject = Object.keys(response);
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]].show == true) {
						$("*[data-attribute="+ keyObject[i]+ "]").addClass("show");
					}
				}
				
			//	var elementConfiguration	= new Object();
				
			//	Selection.setSelectionToGetData(response);
				masterLangObj 		= FilePath.loadLanguage();
				masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
				
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				myNod.add({
					selector		: '#vehicleEle',
					validate		: 'presence',
					errorMessage	: 'Enter Vehicle No. !'
				});
				
				hideLayer();
				
				$("#findBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid')) {
						_this.onSubmit(_this);								
					}
				});
			});
		},onSubmit : function() {
			showLayer();
			var jsonObject = new Object();
			
			if($("#dateEle").attr('data-startdate') != undefined){
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
			}
			if($("#dateEle").attr('data-enddate') != undefined){
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
			}
			jsonObject["vehicleNumberMasterId"] = $('#vehicleEle').val();
			getJSON(jsonObject, WEB_SERVICE_URL+'/VehicleWiseCommissionReportWS/getVehicleWiseCommissionReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		
		},setReportData : function(response){
			
			if(response.message != undefined){
				hideLayer();
				var errorMessage = response.message;
				showMessage('error', errorMessage.typeSymble + '  ' +  errorMessage.description);
				$('#middle-border-boxshadow').addClass('hide');
				$('#summaryTable').addClass('hide');
				return;
			}
			if(response.vehicleWiseCommissionReportList != null){
			if(response.vehicleWiseCommissionReportList != undefined) {
				var vehicleWiseCommissionColumnConfig   = response.vehicleWiseCommissionReportList.columnConfiguration;
				var vehicleWiseCommissionColumnKeys		= _.keys(vehicleWiseCommissionColumnConfig);
				var vehicleWiseCommissionConfig			= new Object();

				for (var i = 0; i < vehicleWiseCommissionColumnKeys.length; i++) {

					var bObj	= vehicleWiseCommissionColumnConfig[vehicleWiseCommissionColumnKeys[i]];

					if (bObj.show == true) {
						vehicleWiseCommissionConfig[vehicleWiseCommissionColumnKeys[i]] = bObj;
					}
				}
				response.vehicleWiseCommissionReportList.columnConfiguration	= vehicleWiseCommissionConfig;
				response.vehicleWiseCommissionReportList.Language				= masterLangKeySet;
			} else{
				$('#summaryTable').addClass('hide');
			}
			if(response.vehicleWiseCommissionReportList != undefined && response.vehicleWiseCommissionReportList.CorporateAccount != undefined) {
				$('#middle-border-boxshadow').removeClass('hide');
				$('#summaryTable').removeClass('hide');
				gridObject = slickGridWrapper2.setGrid(response.vehicleWiseCommissionReportList);
			} else {
				$('#summaryTable').addClass('hide');
			}
			
		}
			var columnArray		= new Array();
			
			
			var totalAmount = response.totalAmount ;
			var totalCommission = response.totalCommission ;
			var grandTotal = response.grandTotal ;
			$("#totalAmount").html(totalAmount)
			$("#totalCommission").html(totalCommission)
			$("#grandTotal").html(grandTotal)
			
			hideLayer();
		}
	});
});
function transportSearch(grid,dataView,row){
	if(dataView.getItem(row).dispatchLedgerid != undefined){
		window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId='+dataView.getItem(row).dispatchLedgerid+'&wayBillNumber='+dataView.getItem(row).lsNumber+'&TypeOfNumber=2&BranchId=0&CityId=0&searchBy=');
	}
}