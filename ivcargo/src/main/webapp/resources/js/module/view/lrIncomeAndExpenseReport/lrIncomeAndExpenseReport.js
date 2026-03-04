define([  'JsonUtility'
	,'messageUtility'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/lrIncomeAndExpenseReport/lrIncomeAndExpenseReportfilepath.js'
	,'jquerylingua'
	,'language'
	,'autocomplete'
	,'autocompleteWrapper'
	,'slickGridWrapper2'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
	,'selectizewrapper'
	],function(JsonUtility, MessageUtility, FilePath, Lingua, Language, AutoComplete, AutoCompleteWrapper,
			slickGridWrapper2, NodValidation, BootstrapModal,datePickerUI,ElementFocusNavigation,Selection,UrlParameter,Selectizewrapper) {
	'use strict';
	var jsonObject = new Object(), myNod, corporateAccountId = 0,  _thisRender = '', gridObject, corporateAccountId = 0,crossingTypeComboBoxShow = false, customerAccessId = 0, masterLangObj, masterLangKeySet, caLangObj, caLangKeySet, fromDate = null, toDate = null, regionId = 0, subRegionId = 0, sourceBranchId = 0,wayBillTypeId = 0,
	wayBillTypeConstantList, childwin;

	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_thisRender = this;
		}, render : function() {
			getJSON(null, WEB_SERVICE_URL + '/lrIncomeAndExpenseReportWS/getLRIncomeAndExpenseReportElementConfiguration.do?',	_thisRender.loadViewForReport, EXECUTE_WITHOUT_ERROR);
			return _thisRender;
		}, loadViewForReport : function(response) {
			hideLayer();
			if(response.message != undefined) {
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}
			var loadelement		= new Array();
			var baseHtml		= new $.Deferred();

			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/report/lrIncomeAndExpenseReport/lrIncomeAndExpenseReport.html",function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();

				var keyObject = Object.keys(response);

				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]].show == false) {
						$("*[data-attribute="+ keyObject[i]+ "]").addClass("hide");
					}
				}

				var elementConfiguration				= new Object();
				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');

				response.elementConfiguration			= elementConfiguration;
				response.isCalenderSelection			= true;
				response.isOneYearCalenderSelection		= true;
				response.monthLimit						= 12;
				response.sourceAreaSelection			= true;

				Selection.setSelectionToGetData(response);
				masterLangObj 		= FilePath.loadLanguage();
				masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
				
				var autoTypeName 						= new Object();
				autoTypeName.primary_key 				= 'typeId';
				autoTypeName.field 						= 'typeName';

				$("#typeEle").autocompleteCustom(autoTypeName);

				var autoType = $("#typeEle").getInstance();

				$(autoType).each(function() {
					this.option.source = response.IncomeOrExpenseTypeList;
				})

				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				if($('#regionEle').is(":visible")){
					myNod.add({
						selector: '#regionEle',
						validate: 'validateAutocomplete:#regionEle_primary_key',
						errorMessage: 'Select proper Region !'
					});
				}

				if($('#subRegionEle').is(":visible")){
					myNod.add({
						selector: '#subRegionEle',
						validate: 'validateAutocomplete:#subRegionEle_primary_key',
						errorMessage: 'Select proper Area !'
					});
				}

				if($('#branchEle').is(":visible")){
					myNod.add({
						selector: '#branchEle',
						validate: 'validateAutocomplete:#branchEle_primary_key',
						errorMessage: 'Select proper Branch !'
					});
				}
				
				myNod.add({
					selector: '#typeEle',
					validate: 'validateAutocomplete:#typeEle',
					errorMessage: 'Select Type !'
				});

				hideLayer();

				$("#searchBtn").click(function(){
					myNod.performCheck();
					if(myNod.areAll('valid')){
						_thisRender.onSubmit();
					}
				});
			});

		},onSubmit:function() {

			showLayer();
			var jsonObject = new Object();
			if($("#dateEle").attr('data-startdate') != undefined){
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate');
			}

			if($("#dateEle").attr('data-enddate') != undefined){
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate');
			}
			jsonObject["regionId"] 					= $('#regionEle_primary_key').val();
			jsonObject["subRegionId"] 				= $('#subRegionEle_primary_key').val();
			jsonObject["sourceBranchId"] 			= $('#branchEle_primary_key').val();
			jsonObject["typeId"] 					= $('#typeEle_primary_key').val();

			getJSON(jsonObject, WEB_SERVICE_URL + '/lrIncomeAndExpenseReportWS/getLRIncomeAndExpenseReportDetails.do?', _thisRender.setReportData, EXECUTE_WITH_ERROR);
		}, setReportData:function(response) {

			if(response.message != undefined) {
				hideLayer();
				$('#middle-border-boxshadow').addClass('hide');
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}

			if(response.LRIncomeAndExpenseReportModel.CorporateAccount.length == 0){
				hideLayer();
				$('#middle-border-boxshadow').addClass('hide');
				showMessage('error', "No Record Found !");
				return;
			}

			showLayer();

			if(response.LRIncomeAndExpenseReportModel != null){
				var lrIncomeAndExpenseReportModelColumnConfig	= response.LRIncomeAndExpenseReportModel.columnConfiguration;
				var lrIncomeAndExpenseReportModelKeys			= _.keys(lrIncomeAndExpenseReportModelColumnConfig);
				var bcolConfig									= new Object();
				var newlrIncomeAndExpenseReportModelKeys		= new Array();
				
				for(var i = 0;lrIncomeAndExpenseReportModelKeys.length > i; i++) {

					if(lrIncomeAndExpenseReportModelKeys[i] != 'quantity') {
						newlrIncomeAndExpenseReportModelKeys.push(lrIncomeAndExpenseReportModelKeys[i]);
					} else {
						break;
					}
				}
				
				if(response.incOrExpNameHM != undefined) {
					var incOrExpNameHM	= response.incOrExpNameHM;
					for(var j in incOrExpNameHM) {
						if(incOrExpNameHM[j] != null) {
							newlrIncomeAndExpenseReportModelKeys.push(incOrExpNameHM[j].replace(/[' ',.,/]/g,""));
							lrIncomeAndExpenseReportModelColumnConfig[incOrExpNameHM[j].replace(/[' ',.,/]/g,"")] = {
									"dataDtoKey":incOrExpNameHM[j].replace(/[' ',.,/]/g,"")
									,"dataType":"number"
									,"languageKey":incOrExpNameHM[j].replace(/[' ',.,/]/g,"")
									,"searchFilter":true
									,"listFilter":true
									,"columnHidden":false
									,"displayColumnTotal":true
									,"columnMinimumDisplayWidthInPx":100
									,"columnInitialDisplayWidthInPx":100
									,"columnMaximumDisplayWidthInPx":120
									,"columnPrintWidthInPercentage":8
									,"elementCssClass":""
									,"columnDisplayCssClass":""
									,"columnPrintCssClass":""
									,"sortColumn":true
									,"show":true
							};
							masterLangKeySet[incOrExpNameHM[j].replace(/[' ',.,/]/g,"")] = incOrExpNameHM[j].replace(/[' ',.,/]/g,"");
						}
					}
				}
				
				newlrIncomeAndExpenseReportModelKeys = _.union(newlrIncomeAndExpenseReportModelKeys, lrIncomeAndExpenseReportModelKeys);
				
				for (var i = 0; i < newlrIncomeAndExpenseReportModelKeys.length; i++) {

					var bObj	= lrIncomeAndExpenseReportModelColumnConfig[newlrIncomeAndExpenseReportModelKeys[i]];

					if (bObj != null && bObj.show != undefined && bObj.show == true) {
						bcolConfig[newlrIncomeAndExpenseReportModelKeys[i]] = bObj;
					}
				}

				response.LRIncomeAndExpenseReportModel.columnConfiguration		= _.values(bcolConfig);
				response.LRIncomeAndExpenseReportModel.Language					= masterLangKeySet;
			}

			if(response.LRIncomeAndExpenseReportModel.CorporateAccount != undefined && response.LRIncomeAndExpenseReportModel.CorporateAccount.length > 0) {
			
				for(var i=0;response.LRIncomeAndExpenseReportModel.CorporateAccount.length > i; i++) {
					if(response.LRIncomeAndExpenseReportModel.CorporateAccount[i].incOrExpTypeCollection != undefined) {
						var incOrExpTypeHM	= response.LRIncomeAndExpenseReportModel.CorporateAccount[i].incOrExpTypeCollection;
						for(var l in incOrExpTypeHM) {
							if(l.split("_")[1] != undefined) {
								response.LRIncomeAndExpenseReportModel.CorporateAccount[i][l.split("_")[1].replace(/[' ',.,/]/g,"")] = incOrExpTypeHM[l];
							}
						}
					}
				}
			
				$('#middle-border-boxshadow').removeClass('hide');
				gridObject = slickGridWrapper2.setGrid(response.LRIncomeAndExpenseReportModel);
			} else {
				$('#middle-border-boxshadow').addClass('hide');
			}

			hideLayer();
		}
	});
});

function transportSearch(grid,dataView,row){
	var LR_SEARCH_TYPE_ID		= 1;
	if(dataView.getItem(row).wayBillId != undefined) {
		window.open('SearchWayBillAction.do?pageId=5&eventId=3&wayBillId=' + dataView.getItem(row).wayBillId + '&NumberType=' + LR_SEARCH_TYPE_ID + '&BranchId=0');
	}
}
function incomeDataOfWaybill(grid,dataView,row){
	
	showLayer();
	
	var jsonObject = new Object();
	
	jsonObject["regionId"] 			= $('#regionEle_primary_key').val();
	jsonObject["subRegionId"] 		= $('#subRegionEle_primary_key').val();
	jsonObject["sourceBranchId"] 	= $('#branchEle_primary_key').val();
	jsonObject["waybillId"] 		= dataView.getItem(row).wayBillId; 
	
	if(dataView.getItem(row).incomeAmount > 0){
		require([PROJECT_IVUIRESOURCES + '/resources/js/module/view/lrIncomeAndExpenseReport/lrIncomeDetails.js'], function(incomeDetails){
			var btModal = new Backbone.BootstrapModal({
				content		: new incomeDetails(jsonObject),
				modalWidth 	: 80,
				okText		: 'Close',
				showFooter 	: true,
				title		: '<center>LR Income Details</center>'

			}).open();
		});
	} else {
		showMessage('error', "No Record Found !");
		hideLayer();
	}

}

function expenseDataOfWaybill(grid,dataView,row){
	
	showLayer();
	
	var jsonObject = new Object();
	
	jsonObject["regionId"] 			= $('#regionEle_primary_key').val();
	jsonObject["subRegionId"] 		= $('#subRegionEle_primary_key').val();
	jsonObject["sourceBranchId"] 	= $('#branchEle_primary_key').val();
	jsonObject["waybillId"] 		= dataView.getItem(row).wayBillId; 

	
	if(dataView.getItem(row).expenseAmount > 0){
		require([PROJECT_IVUIRESOURCES + '/resources/js/module/view/lrIncomeAndExpenseReport/lrExpenseDetails.js'], function(expenseDetails){
			var btModal = new Backbone.BootstrapModal({
				content		: new expenseDetails(jsonObject),
				modalWidth 	: 80,
				okText		: 'Close',
				showFooter 	: true,
				title		: '<center>LR Expense Details</center>'

			}).open();
		});
	} else {
		showMessage('error', "No Record Found !");
		hideLayer();
	}
	
}
