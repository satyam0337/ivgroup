var ModuleIdentifierConstant = null;
var regionId,subRegionId,branchId;
define([  'JsonUtility'
	,'messageUtility'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/marketingPersonDetailsReport/marketingPersonDetailsReportFilePath.js'
	,'jquerylingua'
	,'language'
	,'selectizewrapper'
	,'nodvalidation'
	,'slickGridWrapper3'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/module/view/marketingPersonDetailsReport/viewPartyDetails.js'

	],function(JsonUtility, MessageUtility, FilePath, Lingua, Language, Selectizewrapper, NodValidation, slickGridWrapper3, FocusNavigation,
			BootstrapModal, Selection, PartyDetails) {
	'use strict';
	var jsonObject = new Object(), 
	myNod,  
	viewObject,
	gridObject, 
	masterLangObj, 
	masterLangKeySet, 
	caLangObj, 
	caLangKeySet,
	_this = '';

	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/marketingPersonDetailsReportWS/getMarketingPersonDetailsReportElement.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		},getElementConfigDetails : function(response){
			showLayer();
			console.log("response",response)
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			var executive				= response.executive;

			loadelement.push(baseHtml);
			$("#mainContent").load("/ivcargo/html/module/marketingPersonDetailsReport/marketingPersonDetailsReport.html",function() {
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

				var elementConfiguration				= new Object();

				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');

				response.elementConfiguration			= elementConfiguration;
				response.sourceAreaSelection			= true;

				Selection.setSelectionToGetData(response);

				if (executive.executiveType == EXECUTIVE_TYPE_REGIONADMIN) {
					$("#regionEle_primary_key").val(executive.regionId);
					var autoSubRegionName = $("#subRegionEle").getInstance();
					subRegionId 	= executive.subRegionId;
					$(autoSubRegionName).each(function() {
						this.option.source = response.subRegionList;
					});
				}
				
				if (executive.executiveType == EXECUTIVE_TYPE_SUBREGIONADMIN) {
					$("#regionEle_primary_key").val(executive.regionId);
					$("#subRegionEle_primary_key").val(executive.subRegionId);
					subRegionId 	= executive.subRegionId;
					regionId 		= executive.regionId;
					var autoBranchName = $("#branchEle").getInstance();

					$(autoBranchName).each(function() {
						this.option.source = response.branchList;
					})
				}
				
				if (executive.executiveType == EXECUTIVE_TYPE_BRANCHADMIN) {
					$("#regionEle_primary_key").val(executive.regionId);
					$("#subRegionEle_primary_key").val(executive.subRegionId);
					$("#branchEle_primary_key").val(executive.branchId);
					branchId 		= executive.branchId;
					subRegionId 	= executive.subRegionId;
					regionId 		= executive.regionId;
				}
				
				if (executive.executiveType == EXECUTIVE_TYPE_EXECUTIVE) {
					$("#regionEle_primary_key").val(executive.regionId);
					$("#subRegionEle_primary_key").val(executive.subRegionId);
					$("#branchEle_primary_key").val(executive.branchId);
					branchId 		= executive.branchId;
					subRegionId 	= executive.subRegionId;
					regionId 		= executive.regionId;
				}
				
				masterLangObj 		= FilePath.loadLanguage();
				masterLangKeySet 	= loadLanguageWithParams(masterLangObj);

				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector		: '#regionEle',
					validate		: 'validateAutocomplete:#regionEle',
					errorMessage	: 'Select proper Region !'
				});

				myNod.add({
					selector		: '#subRegionEle',
					validate		: 'validateAutocomplete:#subRegionEle',
					errorMessage	: 'Select proper SubRegion !'
				});

				myNod.add({
					selector		: '#branchEle',
					validate		: 'validateAutocomplete:#branchEle',
					errorMessage	: 'Select proper Branch !'
				});

				hideLayer();

				$("#saveBtn").click(function() {
					myNod.performCheck();

					if(myNod.areAll('valid')) {
						_this.onSubmit();								
					}
				});
			});

		},onSubmit : function() {

			showLayer();
			var jsonObject = new Object();
			
			if($('#regionEle_primary_key').val() == undefined || $('#regionEle_primary_key').val() == 'undefined'){
				jsonObject["regionId"] 	= regionId;
			} else {
				jsonObject["regionId"] 	= $('#regionEle_primary_key').val();
			}
			
			if($('#subRegionEle_primary_key').val() == undefined || $('#subRegionEle_primary_key').val() == 'undefined'){
				jsonObject["subRegionId"] 	= subRegionId;
			} else {
				jsonObject["subRegionId"] 	= $('#subRegionEle_primary_key').val();
			}
			
			if($('#branch_primary_key').val() == undefined || $('#branch_primary_key').val() == 'undefined'){
				jsonObject["branchId"] 	= branchId;
			} else {
				jsonObject["branchId"] 	= $('#branch_primary_key').val();
			}
			
			console.log('log >>> ', jsonObject)

			getJSON(jsonObject, WEB_SERVICE_URL+'/marketingPersonDetailsReportWS/getMarketingPersonReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);

		},setReportData : function(response){
			console.log('response >>> ', response)
			if(response.message != undefined){
				hideLayer();
				$('#middle-border-boxshadow').hide();
				$('#print_viewBillDetails').hide();
				$('#billDetailsDiv').hide();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}

			var ColumnConfig = response.MarketingPerson.columnConfiguration;
			var columnKeys	= _.keys(ColumnConfig);
			var bcolConfig	= new Object();
			for (var i=0; i<columnKeys.length; i++) {
				if(response.showCommision == true){
					var bObj	= ColumnConfig[columnKeys[i]];
					if (bObj.show == true) {
						bcolConfig[columnKeys[i]] = bObj;
					}
				} else {
					var bObj	= ColumnConfig[columnKeys[i]];
					if (bObj != null) {
						if (bObj.show == true) {
							bcolConfig[columnKeys[i]] = bObj;
						}
					}
				}
			}
			response.MarketingPerson.columnConfiguration	= _.values(bcolConfig);
			response.MarketingPerson.Language				= masterLangKeySet;

			if(response.MarketingPerson.CorporateAccount != undefined) {
				$('#middle-border-boxshadow').show();
				$('#print_viewBillDetails').show();
				$('#billDetailsDiv').show();
				hideAllMessages();
				gridObject = slickGridWrapper3.applyGrid(
						{
							ColumnHead					: response.MarketingPerson.columnConfiguration, // *compulsory // for table headers
							ColumnData					: _.values(response.MarketingPerson.CorporateAccount), 	// *compulsory // for table's data
							Language					: response.MarketingPerson.Language, 			// *compulsory for table's header row language
							ShowPrintButton				: true,
							ShowCheckBox				: false,
							removeSelectAllCheckBox		: 'false',
							fullTableHeight				: false,
							rowHeight 					: 	30,
							DivId						: 'billDetailsDiv',				// *compulsary field // division id where slickgrid table has to be created
							SerialNo:[{						// optional field // for showing Row number
								showSerialNo	: false,
								searchFilter	: false,          // for search filter on serial no
								ListFilter		: false				// for list filter on serial no
							}],
							InnerSlickId				: 'editReportDivInner', // Div Id
							InnerSlickHeight			: '350px',
							NoVerticalScrollBar			: false, //optional for no vertical scrolling & if set true remove height attribute to Grid Div
							DataVieObject		        : viewObject,
							DataGridObject		        : gridObject,
							ShowPartialButton	        : false,
							CallBackFunctionForPartial	: _this.getPartiesByMarketingPerson
						});

				slickGridWrapper3.setAggregateFunction(grid,'branchName');
			}
			hideLayer();
		},getPartiesByMarketingPerson:function(grid, dataView,row){
			console.log('data--',dataView.getItem(row))
			hideLayer();
			require([PROJECT_IVUIRESOURCES+'/resources/js/module/view/marketingPersonDetailsReport/viewPartyDetails.js'], function(PartyDetails){
				if(dataView.getItem(row).marketingPersonExecId != undefined){
					var jsonObject 							= new Object();
					jsonObject.marketingPersonExecId 		= dataView.getItem(row).marketingPersonExecId;
					var object 								= new Object();
					object.elementValue 					= jsonObject;
					object.gridObj 							= grid;
					object.marketingPersonExecId			= dataView.getItem(row).marketingPersonExecId;

					var btModal = new Backbone.BootstrapModal({
						content: new PartyDetails(object),
						modalWidth : 80,
						title:'Party Details'

					}).open();
					object.btModal = btModal;
					new PartyDetails(object)
					btModal.open();

				};
			});
		}
	});
});

var partyConfig; 
function viewAllPartyDetails(grid, dataView,row) {
	partyConfig = 1;
	if(dataView.getItem(row).totalParties > 0){
		viewPartyDetails(grid, dataView,row, partyConfig);
	}
}
function viewRegularPartyDetails(grid, dataView,row) {
	partyConfig = 2;
	if(dataView.getItem(row).regularParties > 0){
		viewPartyDetails(grid, dataView,row, partyConfig);
	}
}
function viewIrregularPartyDetails(grid, dataView,row) {
	partyConfig = 3;
	if(dataView.getItem(row).irregularParties > 0){
		viewPartyDetails(grid, dataView,row, partyConfig);
	}
}
function viewNonBookingPartyDetails(grid, dataView,row) {
	partyConfig = 4;
	if(dataView.getItem(row).nonBookingParties > 0){
		viewPartyDetails(grid, dataView,row, partyConfig);
	}
}
function viewPartyDetails(grid, dataView,row, partyConfig) {

		hideLayer();
		require([PROJECT_IVUIRESOURCES+'/resources/js/module/view/marketingPersonDetailsReport/viewPartyDetails.js'], function(PartyDetails){
			if(dataView.getItem(row).marketingPersonExecId != undefined ){
				var jsonObject 							= new Object();
				jsonObject.marketingPersonExecId 		= dataView.getItem(row).marketingPersonExecId;
				jsonObject.partyConfig 					= partyConfig;
				if($('#regionEle_primary_key').val() == undefined || $('#regionEle_primary_key').val() == 'undefined'){
				jsonObject["regionId"] 	= regionId;
				} else {
					jsonObject["regionId"] 	= $('#regionEle_primary_key').val();
				}
				
				if($('#subRegionEle_primary_key').val() == undefined || $('#subRegionEle_primary_key').val() == 'undefined'){
					jsonObject["subRegionId"] 	= subRegionId;
				} else {
					jsonObject["subRegionId"] 	= $('#subRegionEle_primary_key').val();
				}
				
				if($('#branch_primary_key').val() == undefined || $('#branch_primary_key').val() == 'undefined'){
					jsonObject["branchId"] 	= branchId;
				} else {
					jsonObject["branchId"] 	= $('#branch_primary_key').val();
				}

				var object 								= new Object();
				object.elementValue 					= jsonObject;
				object.gridObj 							= grid;
				object.marketingPersonExecId			= dataView.getItem(row).marketingPersonExecId;
				object.partyConfig						= partyConfig;
				object["regionId"] 						= jsonObject["regionId"];
				object["subRegionId"] 					= jsonObject["subRegionId"];
				object["branchId"] 						= jsonObject["branchId"];
	
				var btModal = new Backbone.BootstrapModal({
					content: new PartyDetails(object),
					modalWidth : 80,
					title:'Party Details'
	
				}).open();
				object.btModal = btModal;
				new PartyDetails(object)
				btModal.open();
			};
		});
}
