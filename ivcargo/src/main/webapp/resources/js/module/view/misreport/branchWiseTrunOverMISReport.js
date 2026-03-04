define([  'JsonUtility'
	,'messageUtility'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/misreport/branchWiseTrunOverMISReportfilepath.js'
	,'jquerylingua'
	,'language'
	,'autocomplete'
	,'autocompleteWrapper'
	,'slickGridWrapper2'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/populatesubregionandbranch.js'//PopulateAutocomplete
	],function(JsonUtility, MessageUtility, FilePath, Lingua, Language, AutoComplete, AutoCompleteWrapper,
			slickGridWrapper2, NodValidation, BootstrapModal,datePickerUI,ElementFocusNavigation,PopulateAutocomplete) {
	'use strict';
	var jsonObject = new Object(), myNod, corporateAccountId = 0, tab = "createTab", _this = '', gridObject, corporateAccountId = 0,crossingTypeComboBoxShow = false, customerAccessId = 0, masterLangObj, masterLangKeySet, caLangObj, caLangKeySet,configuration;
	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/branchWiseTrunOverMISReportWS/getBranchWiseTrunOverMISReportElement.do?',	_this.renderMISReportElements,	EXECUTE_WITHOUT_ERROR);
			return _this;
		},renderMISReportElements : function(response){
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			var executive	= response.executive;
			loadelement.push(baseHtml);
			$("#mainContent").load("/ivcargo/html/module/misreport/BranchWiseTrunOverMISReport.html",function() {
				baseHtml.resolve();
			});
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				var options			= new Object();

				options.minDate			= response.minDateString;
				options.monthLimit 		= response.monthLimit;

				if(response.sixMonthDateRange != undefined){
					options.sixMonthDateRange	= response.sixMonthDateRange.allow;
				}

				if(response.threeMonthDateRange != undefined){
					options.threeMonthDateRange	= response.threeMonthDateRange.allow;
				}

				if(response.oneYearDateRange != undefined){
					options.oneYearDateRange	= response.oneYearDateRange.allow;
				}
				if(response.showMonthWiseDateSelection != undefined){
					options.showMonthWiseDateSelection	= response.showMonthWiseDateSelection.allow;
				}


				$("#dateEle").DatePickerCus(options);

				masterLangObj = FilePath.loadLanguage();
				masterLangKeySet = loadLanguageWithParams(masterLangObj);

				hideLayer();
				$("#saveBtn").click(function() {
					_this.onSubmit(_this);								
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

			getJSON(jsonObject, WEB_SERVICE_URL+'/branchWiseTrunOverMISReportWS/getMISReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		},setReportData : function(response){
			console.log("Getting Data",response);

			if(response.message != undefined) {
				$('#bottom-border-boxshadow').addClass('hide');
				hideLayer();
				return;
			}

			if(response.BranchWiseTrunOverMISReporModel.CorporateAccount.length <= 0){
				showMessage('error', "No records found !");
				$('#bottom-border-boxshadow').addClass('hide');
				hideLayer();
				return;
			}

			if(response.BranchWiseTrunOverMISReporModel != undefined){
				var columnConfig		= response.BranchWiseTrunOverMISReporModel.columnConfiguration;
				var keys				= _.keys(columnConfig);
				var bcolConfig			= new Object();

				for (var i=0; i<keys.length; i++) {
					var bObj	= columnConfig[keys[i]];
					if (bObj.show == true) {
						bcolConfig[keys[i]]	= bObj;
					}
				}

				response.BranchWiseTrunOverMISReporModel.columnConfiguration	= bcolConfig;
				response.BranchWiseTrunOverMISReporModel.Language				= masterLangKeySet;

				if(response.BranchWiseTrunOverMISReporModel.CorporateAccount != undefined && response.BranchWiseTrunOverMISReporModel.CorporateAccount.length > 0) {
					hideLayer();
					$('#bottom-border-boxshadow').removeClass('hide');
					gridObject = slickGridWrapper2.setGrid(response.BranchWiseTrunOverMISReporModel);
				}
			}
		}
	});
});
