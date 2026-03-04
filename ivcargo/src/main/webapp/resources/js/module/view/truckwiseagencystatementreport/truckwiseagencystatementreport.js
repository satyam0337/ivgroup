
define([  'JsonUtility'
	,'messageUtility'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/truckwiseagencystatementreport/truckwiseagencystatementreportfilepath.js'
	,'jquerylingua'
	,'language'
	,'autocomplete'
	,'autocompleteWrapper'
	,'slickGridWrapper2'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	],function(JsonUtility, MessageUtility, FilePath, Lingua, Language, AutoComplete, AutoCompleteWrapper,
			slickGridWrapper2, NodValidation, BootstrapModal,ElementFocusNavigation,Selection) {
	'use strict';
	var jsonObject = new Object(), 
	myNod,  
	_this = '', 
	gridObject, 
	masterLangObj, 
	masterLangKeySet, 
	caLangObj, 
	caLangKeySet;
	
	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/truckWiseAgencyStatementReportWS/getTruckWiseAgencyStatementReportElementConfiguration.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		},getElementConfigDetails : function(response){

			console.log("response : " ,response);
			
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			var executive	= response.executive;

			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/truckwiseagencystatementreport/TruckWiseAgencyStatementReport.html",function() {
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
				
				var elementConfiguration					= new Object();

				elementConfiguration.dateElement			= $('#dateEle');
				elementConfiguration.regionElement			= $('#regionEle');
				elementConfiguration.subregionElement		= $('#subRegionEle');
				elementConfiguration.branchElement			= $('#branchEle');

				elementConfiguration.destRegionElement		= $('#toRegionEle');
				elementConfiguration.destSubregionElement	= $('#toSubRegionEle');
				elementConfiguration.destBranchElement		= $('#toBranchEle');

				elementConfiguration.vehicleElement			= $('#vehicleEle');

				response.elementConfiguration				= elementConfiguration;
				response.isCalenderSelection				= true;
				response.isThreeMonthsCalenderSelection		= true;
				response.sourceAreaSelection				= true;
				response.destinationAreaSelection			= true;
				response.vehicleSelection					= true;
				response.AllOptionsForDestSubRegion			= true;
				response.AllOptionForDestinationBranch		= true;
				
				Selection.setSelectionToGetData(response);

				masterLangObj 		= FilePath.loadLanguage();
				masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
				
				myNod = nod();

				myNod.configure({
					parentClass:'validation-message'
				});

				if (executive.executiveType == EXECUTIVE_TYPE_GROUPADMIN) {
					myNod.add({
						selector: '#regionEle',
						validate: 'validateAutocomplete:#regionEle_primary_key',
						errorMessage: 'Select proper Region !'
					});

					myNod.add({
						selector: '#subRegionEle',
						validate: 'validateAutocomplete:#subRegionEle_primary_key',
						errorMessage: 'Select proper Sub Region !'
					});
					
					myNod.add({
						selector: '#branchEle',
						validate: 'validateAutocomplete:#branchEle_primary_key',
						errorMessage: 'Select proper Branch !'
					});

					myNod.add({
						selector: '#toRegionEle',
						validate: 'validateAutocomplete:#toRegionEle_primary_key',
						errorMessage: 'Select proper To Region !'
					});
					
					myNod.add({
						selector: '#toSubRegionEle',
						validate: 'validateAutocomplete:#toSubRegionEle_primary_key',
						errorMessage: 'Select proper To Sub Region !'
					});
					
					myNod.add({
						selector: '#toBranchEle',
						validate: 'validateAutocomplete:#toBranchEle_primary_key',
						errorMessage: 'Select proper Branch !'
					});

					myNod.add({
						selector: '#vehicleEle',
						validate: 'validateAutocomplete:#vehicleEle_primary_key',
						errorMessage: 'Select proper Vehicle !'
					});
				}
				
				hideLayer();

				$("#searchBtn").click(function() {
					myNod.performCheck();
					if(myNod.areAll('valid')){
						_this.onSubmit(_this);								
					}
				});
			});

		},setReportData : function(response) {

			$("#truckWiseAgencyStatementReportDiv").empty();

			if(response.message != undefined){
				hideLayer();
				$('#bottom-border-boxshadow').hide();
				$('#btnprint_truckWiseAgencyStatementReportDetails').hide();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				return;
			}
			
			var truckWiseAgencyStatementReportModelColumnConfig		= response.TruckWiseAgencyStatementReportModel.columnConfiguration;
			var truckWiseAgencyStatementReportModelKeys				= _.keys(truckWiseAgencyStatementReportModelColumnConfig);
			var bcolConfig											= new Object();
			
			for (var i=0; i<truckWiseAgencyStatementReportModelKeys.length; i++) {
				var bObj	= truckWiseAgencyStatementReportModelColumnConfig[truckWiseAgencyStatementReportModelKeys[i]];
				if (bObj.show == true) {
					bcolConfig[truckWiseAgencyStatementReportModelKeys[i]]	= bObj;
				}
			}
			
			response.TruckWiseAgencyStatementReportModel.columnConfiguration		= bcolConfig;
			response.TruckWiseAgencyStatementReportModel.Language					= masterLangKeySet;
			
			if(response.TruckWiseAgencyStatementReportModel.CorporateAccount != undefined && response.TruckWiseAgencyStatementReportModel.CorporateAccount.length > 0) {
				$('#bottom-border-boxshadow').show();
				$('#truckWiseAgencyStatementReportDiv').show();

				gridObject = slickGridWrapper2.setGrid(response.TruckWiseAgencyStatementReportModel);

				var dataViewObject = grid.getData();
				var columnsArr = new Array();
				var columns = grid.getColumns();
				
				columns.forEach(function (col) {
					if(col.hasTotal){
						columnsArr.push(new Slick.Data.Aggregators.Sum(col.field));
					}
				});

				dataViewObject.setGrouping([{
					getter: 'lsSourceBranchName',
					formatter: function (g) {
						return 'Source Branch : '+ g.value + "  <span style='color:green'>(" + g.count + " rows)</span>";
					},
					aggregateCollapsed: true,
					lazyTotalsCalculation: true,
					comparer: function (a, b) {
						var x = a['value'], y = b['value'];
						return 1 * (x === y ? 0 : (x > y ? 1 : -1));
					    },
				},{
					getter: 'lsDestinationBranchName',
					formatter: function (g) {
						return 'Destination Branch : '+ g.value + "  <span style='color:green'>(" + g.count + " rows)</span>";
					},
					aggregators: columnsArr,
					aggregateCollapsed: true,
					lazyTotalsCalculation: true,
					comparer: function (a, b) {
						var x = a['value'], y = b['value'];
						return 1 * (x === y ? 0 : (x > y ? 1 : -1));
					    },
				}]);
			} else {
				$('#bottom-border-boxshadow').hide();
				$('#btnprint_truckWiseAgencyStatementReportDetails').hide();
			}
			
			hideLayer();
		},onSubmit : function() {
			
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

			jsonObject["toRegionId"] 				= $('#toRegionEle_primary_key').val();
			jsonObject["toSubRegionId"] 			= $('#toSubRegionEle_primary_key').val();
			jsonObject["toBranchId"] 				= $('#toBranchEle_primary_key').val();

			jsonObject["vehicleNumberMasterId"]		= $('#vehicleEle_primary_key').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/truckWiseAgencyStatementReportWS/getTruckWiseAgencyStatementReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}
	});
});