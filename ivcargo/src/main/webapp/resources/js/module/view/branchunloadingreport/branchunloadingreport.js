define([  'JsonUtility'
	,'messageUtility'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/branchunloadingreport/branchunloadingreportfilepath.js'
	,'jquerylingua'
	,'language'
	,'autocomplete'
	,'autocompleteWrapper'
	,'slickGridWrapper2'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
	],function(JsonUtility, MessageUtility, FilePath, Lingua, Language, AutoComplete, AutoCompleteWrapper,
			slickGridWrapper2, NodValidation, BootstrapModal,ElementFocusNavigation,Selection) {
	'use strict';
	var jsonObject = new Object(),myNod,_this = '',gridObject,masterLangObj,masterLangKeySet,caLangObj, 
					caLangKeySet,executive,isAllowBranchVehicleLsWiseGroup = false;
	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/branchUnloadingReportWS/getBranchUnloadingReportElement.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		},getElementConfigDetails : function(response){

			var loadelement 				= new Array();
			var baseHtml 				    = new $.Deferred();
			executive						= response.executive;
			isAllowBranchVehicleLsWiseGroup	= response.isAllowBranchVehicleLsWiseGroup.allow;

			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/branchUnloadingReport/BranchUnloadingReport.html",function() {
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
				var options		= new Object();
				options.minDate	= response.minDateString;
				$("#dateEle").DatePickerCus(options);
				
				var elementConfiguration	= new Object();

				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');

				response.elementConfiguration			= elementConfiguration;
				response.sourceAreaSelection			= true;
				response.isPhysicalBranchesShow			= true;
				
				
				Selection.setSelectionToGetData(response);

				masterLangObj 		= FilePath.loadLanguage();
				masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				hideLayer();
				
				if (executive.executiveType == EXECUTIVE_TYPE_GROUPADMIN) {
					if($('#regionEle').is(":visible")){
						myNod.add({
							selector	: '#regionEle',
							validate	: 'validateAutocomplete:#regionEle_primary_key',
							errorMessage	: 'Select proper Region !'
						});
					}
					if($('#subRegionEle').is(":visible")){
						myNod.add({
							selector	: '#subRegionEle',
							validate	: 'validateAutocomplete:#subRegionEle_primary_key',
							errorMessage	: 'Select proper Area !'
						});
					}
					
					if($('#branchEle').is(":visible")){
						myNod.add({
							selector	: '#branchEle',
							validate	: 'validateAutocomplete:#branchEle_primary_key',
							errorMessage	: 'Select proper Branch !'
						});
					}
					
				}
				if (executive.executiveType == EXECUTIVE_TYPE_REGIONADMIN) {
					if($('#subRegionEle').is(":visible")){
						myNod.add({
							selector	: '#subRegionEle',
							validate	: 'validateAutocomplete:#subRegionEle_primary_key',
							errorMessage	: 'Select proper Area !'
						});
					}
					
					if($('#branchEle').is(":visible")){
						myNod.add({
							selector	: '#branchEle',
							validate	: 'validateAutocomplete:#branchEle_primary_key',
							errorMessage	: 'Select proper Branch !'
						});
					}

				}
				if (executive.executiveType == EXECUTIVE_TYPE_SUBREGIONADMIN ) {
					if($('#branchEle').is(":visible")){
						myNod.add({
							selector	: '#branchEle',
							validate	: 'validateAutocomplete:#branchEle_primary_key',
							errorMessage	: 'Select proper Branch !'
						});
					}

				}
				
				if (executive.executiveType == EXECUTIVE_TYPE_BRANCHADMIN
						|| executive.executiveType == EXECUTIVE_TYPE_EXECUTIVE ) {
					$("#regionEle_primary_key").val(executive.regionId);
					$("#subRegionEle_primary_key").val(executive.subRegionId);
					$("#branchEle_primary_key").val(executive.branchId);
				}
				
				$("#searchBtn").click(function() {
					myNod.performCheck();
					if(myNod.areAll('valid')){
						_this.onSubmit(_this);								
					}
				});
				
			});

		},setReportData : function(response) {
			console.log("response ",response)
			$("#bookButNotDispatchDiv").empty();

			if(response.message != undefined){
				hideLayer();
				$('#bottom-border-boxshadow').hide();
				$('#btnprint_branchUnloadingDetails').hide();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}
			
			var pendingDispatchStockModelColumnConfig		= response.BranchUnloadingReportModel.columnConfiguration;
			var pendingDispatchStockModelKeys				= _.keys(pendingDispatchStockModelColumnConfig);
			var bcolConfig								= new Object();
			
			for (var i=0; i<pendingDispatchStockModelKeys.length; i++) {
				var bObj	= pendingDispatchStockModelColumnConfig[pendingDispatchStockModelKeys[i]];
				if (bObj.show == true) {
					bcolConfig[pendingDispatchStockModelKeys[i]]	= bObj;
				}
			}
			
			response.BranchUnloadingReportModel.columnConfiguration	= bcolConfig;
			response.BranchUnloadingReportModel.Language				= masterLangKeySet;

			if(response.BranchUnloadingReportModel.CorporateAccount != undefined && response.BranchUnloadingReportModel.CorporateAccount.length > 0) {
				$('#bottom-border-boxshadow').show();
				$('#btnprint_branchUnloadingDetails').show();
				gridObject = slickGridWrapper2.setGrid(response.BranchUnloadingReportModel);
				
				
				$('#print_branchUnloadingDetails').css("padding-left", "15px");
				$('#print_branchUnloadingDetails').css("padding-top", "10px");
				

				var dataViewObject = grid.getData();
				var columnsArr 		= new Array();
				var columns 	= grid.getColumns();
				columns.forEach(function (col) {
					columnsArr.push(new Slick.Data.Aggregators.Sum(col.field));
				});
					
				if(isAllowBranchVehicleLsWiseGroup || isAllowBranchVehicleLsWiseGroup == 'true') {
					dataViewObject.setGrouping([{
						getter: 'receivedBranchName',
						formatter: function (g) {
							return  g.value + "  <span style='color:green'>(" + g.count + " rows)</span>";
						},
						aggregators: columnsArr,
						aggregateCollapsed: true,
						lazyTotalsCalculation: true,
						comparer: function (a, b) {
							var x = a['value'], y = b['value'];
							return 1 * (x === y ? 0 : (x > y ? 1 : -1));
						    },
					},{
						getter: 'vehicleNumber',
						formatter: function (g) {
							return  g.value + "  <span style='color:green'>(" + g.count + " rows)</span>";
						},
						aggregators: columnsArr,
						aggregateCollapsed: true,
						lazyTotalsCalculation: true,
						comparer: function (a, b) {
							var x = a['value'], y = b['value'];
							return 1 * (x === y ? 0 : (x > y ? 1 : -1));
						},
						collapsed:false
					},{
						getter: 'lsnumber',
						formatter: function (g) {
									return  g.value + "  <span style='color:green'>(" + g.count + " rows)</span>";
						},
						aggregators: columnsArr,
						aggregateCollapsed: true,
						lazyTotalsCalculation: true,
						comparer: function (a, b) {
						var x = a['value'], y = b['value'];
						return 1 * (x === y ? 0 : (x > y ? 1 : -1));
						},
						collapsed:false
					}]);
				}
				
			} else {
				$('#bottom-border-boxshadow').hide();
				$('#btnprint_branchUnloadingDetails').hide();
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
			
			if (executive.executiveType == EXECUTIVE_TYPE_BRANCHADMIN
					|| executive.executiveType == EXECUTIVE_TYPE_EXECUTIVE ) {
				jsonObject["regionId"] 							= executive.regionId
				jsonObject["subRegionId"] 						= executive.subRegionId;
				jsonObject["sourceBranchId"] 					= executive.branchId;
			}else {
				jsonObject["regionId"] 							= $('#regionEle_primary_key').val();
				jsonObject["subRegionId"] 						= $('#subRegionEle_primary_key').val();
				jsonObject["sourceBranchId"] 					= $('#branchEle_primary_key').val();
			}
			
			console.log("jsonObject ",jsonObject);
													
			getJSON(jsonObject, WEB_SERVICE_URL+'/branchUnloadingReportWS/getBranchUnloadingReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}
	});
});

function wayBillSearch(grid, dataView, row) {
	if(dataView.getItem(row).wayBillId != undefined) {
		window.open('SearchWayBillAction.do?pageId=3&eventId=8&wayBillId=' + dataView.getItem(row).wayBillId + '&id=search');
	} 
}