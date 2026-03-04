define([  'JsonUtility'
          ,'messageUtility'
          ,PROJECT_IVUIRESOURCES + '/resources/js/module/view/lscommissionreport/LSCommissionReportfilepath.js'
          ,PROJECT_IVUIRESOURCES + '/resources/js/module/view/lscommissionreport/LSCommissionReportHandle.js'
          ,'jquerylingua'
          ,'language'
          ,'autocomplete'
          ,'autocompleteWrapper'
          ,'slickGridWrapper3'
          ,'selectizewrapper'
          ,'nodvalidation'
          ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
          ,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
          ,'focusnavigation'//import in require.config
          ,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
          ,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/populatesubregionandbranch.js'//PopulateAutocomplete
          ,PROJECT_IVUIRESOURCES + '/resources/js/module/generateconsolidateewaybill/consolidatedewaybill.js'
          ],function(JsonUtility, MessageUtility, FilePath, Handle, Lingua, Language, AutoComplete, AutoCompleteWrapper,
        		  slickGridWrapper3, Selectizewrapper, NodValidation, BootstrapModal,datePickerUI,ElementFocusNavigation,Selection,PopulateAutocomplete, GenerateEWayBill) {
	'use strict';
	var jsonObject = new Object(), myNod, _this = '', gridObject, crossingTypeComboBoxShow = false, masterLangKeySet;
	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/lsCommissionReportWS/getLSCommissionReportElement.do?', _this.renderLSBookingRegisterElements,	EXECUTE_WITHOUT_ERROR);
			return _this;
		},renderLSBookingRegisterElements : function(response){
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/lscommissionreport/LSCommissionReport.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				var keyObject = Object.keys(response);
				
				for (var i = 0; i < keyObject.length; i++) {
					if (keyObject[i] == 'crossingType' && response[keyObject[i]].show == true)
						crossingTypeComboBoxShow = true;
					
					if (response[keyObject[i]].show)
						$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
				}
				
				var elementConfiguration				= new Object();

				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
				response.elementConfiguration			= elementConfiguration;
				response.sourceAreaSelection			= true;
				response.isCalenderSelection			= true;
				response.AllOptionsForRegion			= true;
				response.AllOptionsForSubRegion			= true;
				response.AllOptionsForBranch			= true;

				Selection.setSelectionToGetData(response);
				
				var operationalBranchAutoComplete = new Object();
				operationalBranchAutoComplete.primary_key = 'assignedLocationId';
				//operationalBranchAutoComplete.url 		= response.branchModelArr;
				operationalBranchAutoComplete.field = 'branchName';
				$("#operationalBranchEle").autocompleteCustom(operationalBranchAutoComplete);
				
				masterLangKeySet = loadLanguageWithParams(FilePath.loadLanguage());
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				if(response.executive.executiveType == EXECUTIVE_TYPE_GROUPADMIN) {
					addAutocompleteElementInNode(myNod, 'regionEle', 'Select proper Region !');
					addAutocompleteElementInNode(myNod, 'subRegionEle', 'Select proper Area !');
					addAutocompleteElementInNode(myNod, 'branchEle', 'Select proper Branch !');
				} else if (executive.executiveType == EXECUTIVE_TYPE_REGIONADMIN) {
					addAutocompleteElementInNode(myNod, 'subRegionEle', 'Select proper Area !');
					addAutocompleteElementInNode(myNod, 'branchEle', 'Select proper Branch !');
				} else if (executive.executiveType == EXECUTIVE_TYPE_SUBREGIONADMIN)
					addAutocompleteElementInNode(myNod, 'branchEle', 'Select proper Branch !');

				var lsTypeAutoComplete = new Object();
				lsTypeAutoComplete.primary_key = 'lsId';
				lsTypeAutoComplete.field = 'lsName';
				lsTypeAutoComplete.callBack = _this.onLSTypeSelect;
				lsTypeAutoComplete.keyupFunction = _this.onLSTypeSelect;
				$("#lsTypeEle").autocompleteCustom(lsTypeAutoComplete);

				setLSType();
				
				var crossingTypeAutoComplete = new Object();
				crossingTypeAutoComplete.primary_key = 'crossingId';
				crossingTypeAutoComplete.field = 'crossingName';
				$("#crossingLSEle").autocompleteCustom(crossingTypeAutoComplete);
				
				setCrossingLSType();
				
				var branchAreaAutoComplete = new Object();
				branchAreaAutoComplete.url = WEB_SERVICE_URL+'/lsCommissionReportWS/getDestinationAreaBranch.do';
				//populatesubregionandbranch.js
				PopulateAutocomplete.setSubregionAndBranch(branchAreaAutoComplete);

				var vehicleAutoComplete = new Object();
				vehicleAutoComplete.primary_key = 'vehicleNumberMasterId';
				vehicleAutoComplete.field 		= 'vehicleNumber';
				$("#vehicleEle").autocompleteCustom(vehicleAutoComplete);
				
				Selectizewrapper.setAutocomplete({
					url 				: WEB_SERVICE_URL+'/autoCompleteWS/getVehicleAgentAutocomplete.do?',
					valueField			: 'vehicleAgentMasterId',
					labelField			: 'name',
					searchField			: 'name',
					elementId			: 'vehicleAgentEle',
					responseObjectKey 	: 'vehicleAgentAutoCompleteList'
				});
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.billSelection,
					valueField		:	'billSelectionId',
					labelField		:	'billSelectionName',
					searchField		:	'billSelectionName',
					elementId		:	'billSelectionEle',
					create			: 	false,
					maxItems		: 	1
				});
				
				getJSON(jsonObject, WEB_SERVICE_URL	+ '/selectOptionsWS/getGroupMergingVehicleNumberList.do?',	_this.setVehicleNumber,	EXECUTE_WITHOUT_ERROR);

				hideLayer();

				$("#saveBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmit(_this);								
				});
				
				$("#branchSelectEle").click(function() {
					_this.onBranchSelect(_this);								
				});
				
				$("#btnGCR").click(function() {
					GenerateEWayBill.generateConsolidatedEwaybill(response);
				});
			});

		},setReportData : function(response) {
			if(response.message != undefined){
				hideLayer();
				$('#middle-border-boxshadow').hide();
				$('#print_viewBillDetails').hide();
				$('#billDetailsDiv').hide();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
				return;
			}

				var ColumnConfig = response.tableConfig.columnConfiguration;
				var columnKeys	= _.keys(ColumnConfig);
				var bcolConfig	= new Object();

				for (var i = 0; i < columnKeys.length; i++) {

					if(response.showCommision) {
						var bObj	= ColumnConfig[columnKeys[i]];
						
						if (bObj.show == true)
							bcolConfig[columnKeys[i]] = bObj;
					} else {
						var bObj	= ColumnConfig[columnKeys[i]];
						
						if (bObj != null && columnKeys[i] != 'commission' && bObj.show)
							bcolConfig[columnKeys[i]] = bObj;
					}
				}
				response.tableConfig.columnConfiguration	= _.values(bcolConfig);
				response.tableConfig.Language				= masterLangKeySet;

				if(response.tableConfig.CorporateAccount != undefined) {
					response.tableConfig.CorporateAccount =	_.sortBy(response.tableConfig.CorporateAccount, 'tripDateTimeForString');
					$('#middle-border-boxshadow').show();
					$('#print_viewBillDetails').show();
					$('#billDetailsDiv').show();
					hideAllMessages();
					//gridObject = slickGridWrapper3.applyGrid(response.tableConfig);
					gridObject = slickGridWrapper3.applyGrid(
							{
								ColumnHead					: response.tableConfig.columnConfiguration, // *compulsory // for table headers
								ColumnData					: _.values(response.tableConfig.CorporateAccount), 	// *compulsory // for table's data
								Language					: response.tableConfig.Language, 			// *compulsory for table's header row language
								ShowPrintButton				: true,
								ShowCheckBox				: false,
								removeSelectAllCheckBox		: 'false',
								fullTableHeight				: false,
								rowHeight 					: 	30,
								DivId						: 'billDetailsDiv',				// *compulsary field // division id where slickgrid table has to be created
								SerialNo:[{						// optional field // for showing Row number
									showSerialNo	: true,
									searchFilter	: false,          // for search filter on serial no
									ListFilter		: false				// for list filter on serial no
								}],
								InnerSlickId				: 'editReportDivInner', // Div Id
								InnerSlickHeight			: '350px',
								NoVerticalScrollBar			: false //optional for no vertical scrolling & if set true remove height attribute to Grid Div
							});

				}
			
			hideLayer();
		},onLSTypeSelect : function() {
			if(crossingTypeComboBoxShow){
				var lsType = $('#lsTypeEle_primary_key').val();
					if(lsType == 1){
						$('#crossingLSDiv').switchClass('hide','show');
						$('#crossingLSEle').val('');
						$('#crossingLSEle_primary_key').val("");
					} else {
						$('#crossingLSDiv').switchClass('show','hide');
						$('#crossingLSEle').val('');
						$('#crossingLSEle_primary_key').val("");
					}
			}
		}, onBranchSelect : function() {
			jsonObject = new Object();
			jsonObject.areaBranchId = Number($('#branchSelectEle_primary_key').val());
			getJSON(jsonObject,	WEB_SERVICE_URL + '/selectOptionsWS/getOperationalBranchOption.do', _this.setOperationalBranch,EXECUTE_WITHOUT_ERROR);
		},setOperationalBranch : function (jsonObj) {
			var autoBranchName = $("#operationalBranchEle").getInstance();
			$(autoBranchName).each(function() {
				this.option.source = jsonObj.branchModelArr;
			})
		},setVehicleNumber : function(jsonObj) {
			var autoVehicleName = $("#vehicleEle").getInstance();

			$(autoVehicleName).each(function() {
				this.option.source = jsonObj.vehicleNumber;
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

			jsonObject["regionId"] 				= $('#regionEle_primary_key').val();
			jsonObject["subRegionId"] 			= $('#subRegionEle_primary_key').val();
			jsonObject["sourceBranchId"] 		= $('#branchEle_primary_key').val();
			jsonObject["typeOfLS"] 				= $('#lsTypeEle_primary_key').val();
			jsonObject["typeOfCrossing"]		= $('#crossingLSEle_primary_key').val();
			jsonObject["destinationSubRegionId"]= $('#areaSelectEle_primary_key').val();
			jsonObject["destinationBranchId"] 	= $('#branchSelectEle_primary_key').val();
			jsonObject["vehicleNumberMasterId"] = $('#vehicleEle_primary_key').val();
			jsonObject["operationalBranchId"] 	= $('#operationalBranchEle_primary_key').val();
			jsonObject["billSelectionId"] 		= $('#billSelectionEle').val();
			jsonObject["vehicleAgentMasterId"] 	= $('#vehicleAgentEle').val();
			getJSON(jsonObject, WEB_SERVICE_URL+'/lsCommissionReportWS/getLSCommissionReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}
	});
});
function setLSType(){
	var lsTypes = '{ "lsTypeArr" : [' +
	'{ "lsId":"3" , "lsName":"InterBranch" },' +
	'{ "lsId":"1" , "lsName":"LS" },' +
	'{ "lsId":"-1" , "lsName":"ALL" } ]}';

	var obj = JSON.parse(lsTypes);
	var autoLSName = $("#lsTypeEle").getInstance();
	$(autoLSName).each(function() {
		this.option.source = obj.lsTypeArr;
	});
}

function setCrossingLSType(){
	var crossingTypes = '{ "crossingTypeArr" : [' +
	'{ "crossingId":"2" , "crossingName":"Crossing" },' +
	'{ "crossingId":"1" , "crossingName":"Normal" },' +
	'{ "crossingId":"-1" , "crossingName":"ALL" } ]}';
	
	var obj = JSON.parse(crossingTypes);
	var autoCrossingLSName = $("#crossingLSEle").getInstance();
	$(autoCrossingLSName).each(function() {
		this.option.source = obj.crossingTypeArr;
	});
}

function lsNumberSearch(grid,dataView,row){
	var dispatchLedgerId	= 0;
	
	if(dataView.getItem(row).dispatchLedgerId != undefined && dataView.getItem(row).dispatchLedgerId > 0){
		dispatchLedgerId = dataView.getItem(row).dispatchLedgerId;
	} else if(dataView.getItem(row).lsNumber != undefined && dataView.getItem(row).lsNumber > 0) {
		dispatchLedgerId = dataView.getItem(row).lsNumber;
	}
	window.open('Reports.do?pageId=11&eventId=3&dispatchLedgerId='+dispatchLedgerId+'&Type=Dispatched&isDispatchForOwnGroup=true','','location=0, status=0 ,scrollbars=1, width=800, height=600, resizable=1');
}
function transportSearch(grid,dataView,row){
	if(dataView.getItem(row).dispatchLedgerId != undefined){
		window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId='+dataView.getItem(row).dispatchLedgerId+'&wayBillNumber='+dataView.getItem(row).lsNumber+'&TypeOfNumber=2&BranchId=0&CityId=0&searchBy=');
	} 
}
function transportSearchLhpv(grid,dataView,row){
	if(dataView.getItem(row).lhpvId != undefined && dataView.getItem(row).lhpvId > 0){
		window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId='+dataView.getItem(row).lhpvId+'&wayBillNumber='+dataView.getItem(row).lhpvNumber+'&TypeOfNumber=3&BranchId=0&SubRegionId=0&searchBy=');
	} 
}
function lsprint(grid,dataView,row){
	if(dataView.getItem(row).dispatchLedgerId != undefined){
		window.open('Reports.do?pageId=11&eventId=3&dispatchLedgerId='+dataView.getItem(row).dispatchLedgerId+'&Type=Dispatched&isDispatchForOwnGroup=true','','location=0, status=0 ,scrollbars=1, width=800, height=600, resizable=1');
	}
}