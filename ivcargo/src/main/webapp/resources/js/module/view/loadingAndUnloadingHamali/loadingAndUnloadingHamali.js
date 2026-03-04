define([  'JsonUtility'
	,'messageUtility'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/loadingAndUnloadingHamali/loadingAndUnloadingHamalifilepath.js'
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
			getJSON(null, WEB_SERVICE_URL + '/loadingAndUnloadingHamaliWS/getLoadingAndUnloadingHamaliElementConfiguration.do?',	_thisRender.loadViewForReport, EXECUTE_WITHOUT_ERROR);
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

			$("#mainContent").load("/ivcargo/html/module/loadingAndUnloadingHamali/loadingAndUnloadinghamali.html",function() {
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

				var autoTypeName 						= new Object();
				autoTypeName.primary_key 				= 'typeId';
				autoTypeName.field 						= 'typeName';

				$("#typeEle").autocompleteCustom(autoTypeName);

				var autoType = $("#typeEle").getInstance();

				$(autoType).each(function() {
					this.option.source = response.TypeList;
				})

				response.elementConfiguration			= elementConfiguration;
				response.isCalenderSelection			= true;
				response.isOneYearCalenderSelection		= false;
				response.monthLimit						= 12;
				response.sourceAreaSelection			= true;
				response.isPhysicalBranchesShow			= true;

				Selection.setSelectionToGetData(response);
				masterLangObj 		= FilePath.loadLanguage();
				masterLangKeySet 	= loadLanguageWithParams(masterLangObj);

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

			getJSON(jsonObject, WEB_SERVICE_URL + '/loadingAndUnloadingHamaliWS/getLoadingAndUnloadingHamaliDetails.do?', _thisRender.setReportData, EXECUTE_WITH_ERROR);
		}, setReportData:function(response) {

			
			$("#loadingHamaliReportDiv").empty();
			$("#unloadingHamaliReportDiv").empty();

			if(response.message != undefined){
				hideLayer();
				var errorMessage = response.message;
				showMessage('error', errorMessage.typeSymble + '  ' +  errorMessage.description);
				$('#middle-border-boxshadow').hide();
				$('#bottom-border-boxshadow').hide();
				
				return;
			}
			
			console.log("response >>>",response)
			//console.log("type id >>>",response.typeId)
			if(response.typeId == 1 || response.typeId == 3) {
				_thisRender.setLoadingHamaliTableData(response);
			}
			
			if(response.typeId == 2 || response.typeId == 3) {
				_thisRender.setUnLoadingHamaliTableData(response);
			}
			
			hideLayer();
		},setLoadingHamaliTableData:function(response){
			
			if(response.LoadingHamaliReportModel != undefined) {
				var loadingAndUnLoadingReportModelColumnConfig 				= response.LoadingHamaliReportModel.columnConfiguration;
				var loadingAndUnLoadingReportModelColumnConfigColumnKeys	= _.keys(loadingAndUnLoadingReportModelColumnConfig);
				var loadingAndUnLoadingReportModelConfig		= new Object();

				for (var i = 0; i < loadingAndUnLoadingReportModelColumnConfigColumnKeys.length; i++) {
					var bObj	= loadingAndUnLoadingReportModelColumnConfig[loadingAndUnLoadingReportModelColumnConfigColumnKeys[i]];

					if (bObj.show == true) {
						loadingAndUnLoadingReportModelConfig[loadingAndUnLoadingReportModelColumnConfigColumnKeys[i]] = bObj;
					}
				}
				response.LoadingHamaliReportModel.columnConfiguration		= loadingAndUnLoadingReportModelConfig;
				response.LoadingHamaliReportModel.Language				= masterLangKeySet;
			}
			
			if(response.LoadingHamaliReportModel != undefined && response.LoadingHamaliReportModel.CorporateAccount != undefined) {
				$('#middle-border-boxshadow').show();
				if(Number($('#typeEle_primary_key').val()) != 3)
					$('#bottom-border-boxshadow').hide();
				hideAllMessages();
				gridObject = slickGridWrapper2.setGrid(response.LoadingHamaliReportModel);
			} else {
				$('#middle-border-boxshadow').hide();
			}
		},setUnLoadingHamaliTableData:function(response){

			
			if(response.UnLoadingHamaliReportModel != undefined) {
				var loadingAndUnLoadingReportModelColumnConfig 				= response.UnLoadingHamaliReportModel.columnConfiguration;
				var loadingAndUnLoadingReportModelColumnConfigColumnKeys	= _.keys(loadingAndUnLoadingReportModelColumnConfig);
				var loadingAndUnLoadingReportModelConfig		= new Object();

				for (var i = 0; i < loadingAndUnLoadingReportModelColumnConfigColumnKeys.length; i++) {

					var bObj	= loadingAndUnLoadingReportModelColumnConfig[loadingAndUnLoadingReportModelColumnConfigColumnKeys[i]];

					if (bObj.show == true) {
						loadingAndUnLoadingReportModelConfig[loadingAndUnLoadingReportModelColumnConfigColumnKeys[i]] = bObj;
					}
				}
				response.UnLoadingHamaliReportModel.columnConfiguration		= loadingAndUnLoadingReportModelConfig;
				response.UnLoadingHamaliReportModel.Language				= masterLangKeySet;
			}
			if(response.UnLoadingHamaliReportModel != undefined && response.UnLoadingHamaliReportModel.CorporateAccount != undefined) {
				if(Number($('#typeEle_primary_key').val()) != 3)
					$('#middle-border-boxshadow').hide();
				$('#bottom-border-boxshadow').show();
				hideAllMessages();
				gridObject = slickGridWrapper2.setGrid(response.UnLoadingHamaliReportModel);
			} else {
				$('#bottom-border-boxshadow').hide();
			}
		}
	});
});


function transportSearchForLoadingHamali(grid,dataView,row){
	if(dataView.getItem(row).loadingHamaliLedgerId != undefined){
		window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId='+dataView.getItem(row).loadingHamaliLedgerId+'&wayBillNumber='+dataView.getItem(row).loadingHamaliNumber+'&TypeOfNumber=31&BranchId='+dataView.getItem(row).branchId+'&CityId=0&searchBy=');
	} 
}

function transportSearchForUnloadingHamali(grid,dataView,row){
	if(dataView.getItem(row).unLoadingHamaliLedgerId != undefined){
		window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId='+dataView.getItem(row).unLoadingHamaliLedgerId+'&wayBillNumber='+dataView.getItem(row).unLoadingHamaliNumber+'&TypeOfNumber=32&BranchId='+dataView.getItem(row).unloadingBranchId+'&CityId=0&searchBy=');
	} 
}