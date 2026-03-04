define([
	'JsonUtility',
	 'messageUtility',
	 PROJECT_IVUIRESOURCES + '/resources/js/module/view/lrDestinationWiseLsReport/lrdestinationwiselsreportfilepath.js',
	 'jquerylingua',
	 'language',
	 'bootstrapSwitch',
	 'slickGridWrapper2',
	  'moment',
	 'nodvalidation',
	 'focusnavigation',
	 PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
	 PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js',
],function(JsonUtility, MessageUtility, FilePath, Lingua, Language, BootstrapSwitch, slickGridWrapper2, moment ,NodValidation, FocusNavigation,
		 BootstrapModal, Selection){
	'use strict';
	var jsonObject = new Object(), myNod, masterLangObj, masterLangKeySet, gridObject,  _this;
	return Marionette.LayoutView.extend({
		initialize : function(masterObj){
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/LrDestinationWiseLsRegisterWS/getLrDestinationWiseLsRegisterReportElement.do?',	_this.setLRDestinationWiseLSReportsElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		},setLRDestinationWiseLSReportsElements : function(response){
			console.log(response)
			
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			
			loadelement.push(baseHtml);
			$("#mainContent").load("/ivcargo/html/module/lrDestinationWiseLsReport/lrDestinationWiseLsReport.html",function() {
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
				
				var elementConfiguration	= new Object();
				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
				response.elementConfiguration	= elementConfiguration;
				response.sourceAreaSelection	= true;
				response.isPhysicalBranchesShow	= true;
				response.AllOptionsForRegion  	 = true;
				response.AllOptionsForSubRegion  = true;
				response.AllOptionsForBranch 	 = true;
				response.isCalenderSelection	= true;
				
				Selection.setSelectionToGetData(response);
				
				masterLangObj 		= FilePath.loadLanguage();
				masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				if($('#regionEle').exists() && $('#regionEle').is(":visible")){
					myNod.add({
						selector: '#regionEle',
						validate: 'validateAutocomplete:#regionEle_primary_key',
						errorMessage: 'Select proper Region !'
					});
				}

				if($('#subRegionEle').exists() && $('#subRegionEle').is(":visible")){
					myNod.add({
						selector: '#subRegionEle',
						validate: 'validateAutocomplete:#subRegionEle_primary_key',
						errorMessage: 'Select proper Area !'
					});
				}

				if($('#branchEle').exists() && $('#branchEle').is(":visible")){
					myNod.add({
						selector: '#branchEle',
						validate: 'validateAutocomplete:#branchEle_primary_key',
						errorMessage: 'Select proper Branch !'
					});
				}
					
				hideLayer();
				
				$("#saveBtn").click(function() {
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
			jsonObject["regionId"] 			= $('#regionEle_primary_key').val();
			jsonObject["subRegionId"] 		= $('#subRegionEle_primary_key').val();
			jsonObject["branchId"] 			= $('#branchEle_primary_key').val();
			console.log('jsonObject ',jsonObject)
			getJSON(jsonObject, WEB_SERVICE_URL+'/LrDestinationWiseLsRegisterWS/getLrDestinationWiseLsRegisterReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		},setReportData : function(response){
			console.log('response ',response)
			if(response.message != undefined) {
				hideLayer();
				$('#middle-border-boxshadow').addClass('hide');
				
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}
			
			if(response.LRDestinationWiseLsReportModel != undefined) {
				var lrDestinationWiseLsColumnConfig = response.LRDestinationWiseLsReportModel.columnConfiguration;
				var lrDestinationWiseLsColumnKeys	= _.keys(lrDestinationWiseLsColumnConfig);
				var lrDestinationWiseLsConfig		= new Object();
				
				for (var i = 0; i < lrDestinationWiseLsColumnKeys.length; i++) {
					
					var bObj	= lrDestinationWiseLsColumnConfig[lrDestinationWiseLsColumnKeys[i]];
					
					if (bObj.show == true) {
						lrDestinationWiseLsConfig[lrDestinationWiseLsColumnKeys[i]] = bObj;
					}
				}
			
				response.LRDestinationWiseLsReportModel.columnConfiguration	= lrDestinationWiseLsConfig;
				response.LRDestinationWiseLsReportModel.Language			= masterLangKeySet;
			}
			
			if(response.LRDestinationWiseLsReportModel != undefined && response.LRDestinationWiseLsReportModel.CorporateAccount != undefined) {
				$('#middle-border-boxshadow').removeClass('hide');
				hideAllMessages();
				gridObject = slickGridWrapper2.setGrid(response.LRDestinationWiseLsReportModel);
				slickGridWrapper2.setAggregateFunction(gridObject, 'vehicleNumber');
			} else {
				$('#middle-border-boxshadow').addClass('hide');
			}
			
			hideLayer();
			
		}
	});
});

function billPaymentDetails(grid,dataView,row){
	if(dataView.getItem(row).dispatchLedgerId != undefined){
		window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId='+dataView.getItem(row).dispatchLedgerId+'&wayBillNumber='+dataView.getItem(row).lsNumber+'&TypeOfNumber=2&BranchId=0&CityId=0&searchBy=');
	}  
}