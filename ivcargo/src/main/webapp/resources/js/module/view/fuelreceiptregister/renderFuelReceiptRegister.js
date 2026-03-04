var grid, gridObj;
var _thisRender;
var executive;
var LangKeySet;
var filterConfiguration = new Object();
var columnHiddenConfiguration;
var myNod;

define([ 
		'JsonUtility'
 		,'messageUtility'
		,'jquerylingua'
         ,'language'
         ,'/ivcargo/resources/js/module/view/fuelreceiptregister/fuelreceiptregisterfilepath.js'
         ,'focusnavigation'
         ,'nodvalidation'
         ,'slickGridWrapper3'
         ,'autocomplete'
         ,'autocompleteWrapper'
         ,PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js'
         ],function (JsonUtility, MessageUtility, jquerylingua, Language, FilePath, Focusnavigation,Validation,slickGridWrapper3
        		 ,AutoComplete,AutoCompleteWrapper, Selection) {
	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_thisRender = this;
		}, render : function() {
			getJSON(null, WEB_SERVICE_URL + '/fuelReceiptRegisterReportWS/getFuelReceiptRegisterReportElement.do?',	_thisRender.loadViewForReport, EXECUTE_WITHOUT_ERROR);
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
			
			$("#mainContent").load( "/ivcargo/html/report/fuelReceiptRegisterReport/fuelReceiptRegisterReport.html" , function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				var keyObject = Object.keys(response);
				
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]].show) {
						$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
					}
				}
				
				executive			= response.executive;
				
				response.isCalenderSelection	= true;
				response.sourceAreaSelection	= true;
				
				var elementConfiguration			= new Object();
				
				elementConfiguration.dateElement		= "#dateEle";
				elementConfiguration.regionElement		= '#regionEle';
				elementConfiguration.subregionElement	= '#subRegionEle';
				elementConfiguration.branchElement		= '#branchEle';
				
				response.elementConfiguration			= elementConfiguration;
				response.isPhysicalBranchesShow			= true;
				Selection.setSelectionToGetData(response);
					
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				myNod.add([{
					selector: '#fuelPumpEle',
					validate: 'validateAutocomplete:#fuelPumpEle_primary_key',
					errorMessage: 'Select proper Fuel Pump'
				},{
					selector: '#vehicleNumberEle',
					validate: 'validateAutocomplete:#vehicleNumberEle_primary_key',
					errorMessage: 'Select proper Fuel Pump'
				}]);
				if($('#regionEle').exists() && $('#regionEle').is(":visible")) {
					myNod.add({
						selector: '#regionEle',
						validate: 'validateAutocomplete:#regionEle_primary_key',
						errorMessage: 'Select proper Region !'
					});
				}
				if($('#subRegionEle').exists() && $('#subRegionEle').is(":visible")) {
					myNod.add({
						selector: '#subRegionEle',
						validate: 'validateAutocomplete:#subRegionEle_primary_key',
						errorMessage: 'Select proper Area !'
					});
				}
				
				if($('#branchEle').exists() && $('#branchEle').is(":visible")) {
					myNod.add({
						selector: '#branchEle',
						validate: 'validateAutocomplete:#branchEle_primary_key',
						errorMessage: 'Select proper Branch !'
					});
				}
				
				$("#searchBtn").click(function(){
					if(_thisRender.validateElements()){
						$("#mySlickGrid").html("");
						_thisRender.onSubmit();
					}
				});
				
				LangKeySet = loadLanguageWithParams(FilePath.loadLanguage());
				
				var fuelPumpEleAutoComplete = new Object();
				fuelPumpEleAutoComplete.url = response.pumpNameMaster;
				fuelPumpEleAutoComplete.primary_key = 'pumpNameMasterId';
				fuelPumpEleAutoComplete.field = 'name';
				$("#fuelPumpEle").autocompleteCustom(fuelPumpEleAutoComplete);
				
				var autoVehicleNumber 			= new Object();
				autoVehicleNumber.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getVehicleNumberAutocomplete.do?viewAll=true';

				autoVehicleNumber.primary_key 	= 'vehicleNumberMasterId';
				autoVehicleNumber.field 		= 'vehicleNumber';
				$("#vehicleNumberEle").autocompleteCustom(autoVehicleNumber);

				
				var routeTypeEleAutoComplete = new Object();
				routeTypeEleAutoComplete.primary_key = 'routeTypeId';
				routeTypeEleAutoComplete.field = 'routeTypeName';
				$("#routeTypeEle").autocompleteCustom(routeTypeEleAutoComplete);
				
				setRouteType();
				
				var reportSortAutoComplete = new Object();
				reportSortAutoComplete.url = response.reportSorting;
				reportSortAutoComplete.primary_key = 'reportSortingId';
				reportSortAutoComplete.field = 'name';
				$("#reportSortEle").autocompleteCustom(reportSortAutoComplete);
			});
			
		},onSubmit:function() {
			showLayer();
			var fromDate	= document.getElementById("dateEle").getAttribute("data-startdate");
			var toDate		= document.getElementById("dateEle").getAttribute("data-enddate");
			var fuelPumpId	= $("#fuelPumpEle_primary_key").val();
			var vehicleId	= $("#vehicleNumberEle_primary_key").val();
			var regionId	= $("#regionEle_primary_key").val();
			var subRegionId	= $("#subRegionEle_primary_key").val();
			var routeTypeId	= $("#routeTypeEle_primary_key").val();
			
			var branchId	= $("#branchEle_primary_key").val();
			
			if (executive.executiveType == EXECUTIVE_TYPE_BRANCHADMIN 
					|| executive.executiveType == EXECUTIVE_TYPE_EXECUTIVE) {
				branchId = executive.branchId;
			}
			
			var inJson		= new Object();
			
			inJson.fromDate		= fromDate;
			inJson.toDate		= toDate;
			
			if(fuelPumpId > 0) {
				inJson.fuelPumpId	= fuelPumpId;
			} else {
				inJson.fuelPumpId	= 0;
			}
			
			if(vehicleId > 0) {
				inJson.vehicleId	= vehicleId;
			} else {
				inJson.vehicleId	= 0;
			}
			
			if(regionId > 0) {
				inJson.regionId		= regionId;
			} else {
				inJson.regionId		= 0;
			}
			
			if(subRegionId > 0) {
				inJson.subRegionId	= subRegionId;
			} else {
				inJson.subRegionId	= 0;
			}
			
			if(branchId > 0) {
				inJson.branchId		= branchId;
			} else {
				inJson.branchId		= 0;
			}
			
			if(routeTypeId > 0) {
				inJson.routeTypeId		= routeTypeId;
			} else {
				inJson.routeTypeId		= 0;
			}
			
			getJSON(inJson, WEB_SERVICE_URL + '/fuelReceiptRegisterReportWS/getFuelReceiptRegister.do?', _thisRender.setDataInTable, EXECUTE_WITH_ERROR);
		},setDataInTable:function(response) {
			if(response.message != undefined) {
				hideLayer();
				$('#bottom-border-boxshadow').addClass('hide');
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				return;
			}
			
			hideLayer();
			$('#bottom-border-boxshadow').removeClass('hide');
			
			var ColumnConfig		= response.pumpReceipt.columnConfiguration;
			var columnKeys			= _.keys(ColumnConfig);
			var bcolConfig			= new Object();
			
			for (var i=0; i<columnKeys.length; i++) {
				var bObj		= ColumnConfig[columnKeys[i]];
				if (bObj.show == true) {
					bcolConfig[columnKeys[i]]	= bObj;
				}
			}
			
			response.pumpReceipt.columnConfiguration	= _.values(bcolConfig);
			response.pumpReceipt.Language				= LangKeySet;
			
			slickGridWrapper3.applyGrid({
				ColumnHead					: response.pumpReceipt.columnConfiguration, // *compulsory // for table headers
				ColumnData					: _.values(response.pumpReceipt.CorporateAccount), 	// *compulsory // for table's data
				Language					: response.pumpReceipt.Language, 			// *compulsory for table's header row language
				ShowPrintButton				: true,
				ShowExportExcelButton		: false,
				ShowCheckBox				: false,
				removeSelectAllCheckBox		: 'false',
				fullTableHeight				: false,
				rowHeight 					: 30,
				DivId						: 'fuelReceiptRegisterDiv',				// *compulsary field // division id where slickgrid table has to be created
				SerialNo:[{						// optional field // for showing Row number
					showSerialNo	: true,
					searchFilter	: false,          // for search filter on serial no
					ListFilter		: false				// for list filter on serial no
				}],
				InnerSlickId				: 'editReportDivInner', // Div Id
				InnerSlickHeight			: '350px',
				NoVerticalScrollBar			: false, //optional for no vertical scrolling & if set true remove height attribute to Grid Div
				ShowPartialButton	        : false
			});
		},validateElements : function(){

			//this will check all the elements which have been added in configuration
			if(!myNod.areAll('valid')){
				showMessage('error', nod.constants.VALIDATIONMESSAGE);
			}
			myNod.performCheck();
			//this will give true if all elements validation is true
			return myNod.areAll('valid');

		}
	});
});
function showPumpReceipt(grid, dataview, row) {
	var data = dataview.getItem(row);
	var jsonObject 		= null;
	var jsonOutObject	= null;
	var printNo			= 0;
	jsonObject  = new Object();
	jsonOutObject  = new Object();
	jsonObject.pumpReceiptDetailsId	= data.pumpReceiptDetailsId;
	jsonObject.pumpReceiptId		= data.pumpReceiptId;
	jsonObject.Filter				= 7;
	jsonOutObject = jsonObject;

	if(data.status){
		showMessage('error', 'Pump Receipt Cancelled');
		return false;
	}
	showLayer();
	var jsonStr	  = JSON.stringify(jsonOutObject);
	$.getJSON("PrintReceiptAjaxAction.do?pageId=346&eventId=2", 
			{json:jsonStr}, function(data) {
				printJsonForPumpRecipt	= data.printForPumpRecipt;
				printWindowPumpReceipt(printNo);
				hideLayer();
			});	
}
function printWindowPumpReceipt(printId) {
	childwin = window.open('pumpReceiptPrint.do?pageId=347&eventId=3&Printno='+printId, 'newwindow', config='height=600,width=850, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function setRouteType(){
	var routeTypes = '{ "routeTypeArr" : [' +
	'{ "routeTypeId":"1" , "routeTypeName":"Routing" },' +
	'{ "routeTypeId":"2" , "routeTypeName":"Local" },' +
	'{ "routeTypeId":"3" , "routeTypeName":"Both" },' +
	'{ "routeTypeId":"-1" , "routeTypeName":"ALL" } ]}';

	var obj = JSON.parse(routeTypes);
	var route = $("#routeTypeEle").getInstance();
	$(route).each(function() {
		this.option.source = obj.routeTypeArr;
	});
}
