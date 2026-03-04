var grid;
var _thisRender;
var LangKeySet;
var myNod;

define([ 
		'JsonUtility'
		,'messageUtility'
		,'jquerylingua'
         ,'language'
         ,'/ivcargo/resources/js/module/view/vehicletrackreport/vehicletrackreportfilepath.js'
         ,'focusnavigation'
         ,'nodvalidation'
         ,'slickGridWrapper3'
         ,'autocomplete'
         ,'autocompleteWrapper'
         ,PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js'
         ],function (JsonUtility, MessageUtility, jquerylingua, Language, FilePath, Focusnavigation, Validation, slickGridWrapper3, AutoComplete, AutoCompleteWrapper, Selection) {
	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_thisRender = this;
		}, render : function() {
			getJSON(null, WEB_SERVICE_URL + '/vehicleTrackReportWS/getVehicleTrackReportElement.do?',	_thisRender.loadViewForReport, EXECUTE_WITHOUT_ERROR);
			return _thisRender;
		}, loadViewForReport:function(response) {
			hideLayer();
			if(response.message != undefined) {
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}
			
			var loadelement			= new Array();

			var baseHtml	= new $.Deferred();
			
			loadelement.push(baseHtml);

			$( "#mainContent" ).load( "/ivcargo/html/report/vehicletrackreport/vehicletrackreport.html" , function() {
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
				
				response.sourceAreaSelection	= true;
				
				var elementConfiguration			= new Object();
				
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
					selector: '#reportSelectionEle',
					validate: 'validateAutocomplete:#reportSelectionEle_primary_key',
					errorMessage: 'Select proper Report Type'
				},{
					selector: '#regionEle',
					validate: 'validateAutocomplete:#regionEle_primary_key',
					errorMessage: 'Select proper Region'
				},{
					selector: '#subRegionEle',
					validate: 'validateAutocomplete:#subRegionEle_primary_key',
					errorMessage: 'Select proper Sub Region'
				},{
					selector: '#branchEle',
					validate: 'validateAutocomplete:#branchEle_primary_key',
					errorMessage: 'Select proper Branch'
				}]);

				$("#searchBtn").click(function(){
					if(_thisRender.validateElements()){
						$("#mySlickGrid").html("");
						_thisRender.onSubmit();
					}
				});

				LangKeySet = loadLanguageWithParams(FilePath.loadLanguage());
				
				var reportSelectionEleAutoComplete 			= new Object();
				reportSelectionEleAutoComplete.url 			= response.ReportType;
				reportSelectionEleAutoComplete.primary_key 	= 'reportTypeId';
				reportSelectionEleAutoComplete.field 		= 'reportType';
				$("#reportSelectionEle").autocompleteCustom(reportSelectionEleAutoComplete);
			});

		},onSubmit:function() {
			showLayer();
			
			var regionId		= $("#regionEle_primary_key").val();
			var subRegionId		= $("#subRegionEle_primary_key").val();
			var branchId		= $("#branchEle_primary_key").val();
			
			var requestJson		= new Object();
			
			requestJson.reportTypeId	= $("#reportSelectionEle_primary_key").val();
			
			if(regionId > 0) {
				requestJson.regionId	= regionId;	
			} else {
				requestJson.regionId	= 0;
			}
			
			if(subRegionId > 0) {
				requestJson.subRegionId	= subRegionId;	
			} else {
				requestJson.subRegionId	= 0;
			}
			
			if(branchId > 0) {
				requestJson.branchId	= branchId;	
			} else {
				requestJson.branchId	= 0;
			}
			
			getJSON(requestJson, WEB_SERVICE_URL+'/vehicleTrackReportWS/getVehicleTrackReportData.do', _thisRender.setDataInTable, EXECUTE_WITH_ERROR);
		},setDataInTable:function(response){
			if(response.message != undefined){
				hideLayer();
				$('#bottom-border-boxshadow').addClass('hide');
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				return;
			}
			
			hideLayer();
			$('#bottom-border-boxshadow').removeClass('hide');
			
			var ColumnConfig		= response.VehicleTrackReport.columnConfiguration;
			var columnKeys			= _.keys(ColumnConfig);
			var bcolConfig			= new Object();
			
			for (var i=0; i<columnKeys.length; i++) {
				var bObj		= ColumnConfig[columnKeys[i]];
				if (bObj.show == true) {
					bcolConfig[columnKeys[i]]	= bObj;
				}
			}
			
			response.VehicleTrackReport.columnConfiguration		= _.values(bcolConfig);
			response.VehicleTrackReport.Language				= LangKeySet;
			
			slickGridWrapper3.applyGrid({
				ColumnHead					: response.VehicleTrackReport.columnConfiguration, // *compulsory // for table headers
				ColumnData					: _.values(response.VehicleTrackReport.CorporateAccount), 	// *compulsory // for table's data
				Language					: response.VehicleTrackReport.Language, 			// *compulsory for table's header row language
				ShowPrintButton				: true,
				ShowCheckBox				: false,
				removeSelectAllCheckBox		: 'false',
				fullTableHeight				: false,
				rowHeight 					: 30,
				DivId						: 'vehicleTrackReportDiv',				// *compulsary field // division id where slickgrid table has to be created
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

function showLHPVDetails(grid, dataview, row) {
	var data		= dataview.getItem(row);
	var lhpvId 		= data.lhpvId;
	var lhpvNumber 	= data.lhpvNumber;
	var LHPV_SEARCH_TYPE_ID = 3;
	
	window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId='+lhpvId+'&wayBillNumber='+lhpvNumber+'&TypeOfNumber='+LHPV_SEARCH_TYPE_ID+'&BranchId=0&CityId=0&searchBy=0');
}
function showTESBranches (grid, dataview, row) {
	var data	= dataview.getItem(row);
	var lorryHireId	= data.tesId;
	$.post("Ajax.do?pageId=9&eventId=13",{filter:37,lorryHireId:lorryHireId},function(data){
		var response = $.trim(data);	
		if (/error/i.test(response)){
			alert('Error while retrieving !');
			return false;
		} else if(response == '<%=CargoErrorList.SESSION_INVALID_DESCRIPTION%>' || response == '<%=CargoErrorList.NO_RECORDS_DESCRIPTION%>'){
		} else {
			var loadelement			= new Array();
			var bootstrapmodal		= new $.Deferred();
			loadelement.push(bootstrapmodal);
			$( "#bootstrapModalDiv" ).load( "html/report/bootstrapmodal.html" , function() {
				bootstrapmodal.resolve();
			});
			$.when.apply($, loadelement).done(function() {
				$('#myModal').modal('toggle');
				$('#myModal').modal('show');
				$('#myModal').modal();
				$("#data").html(response);
			});
			//alert("Route Branches  " + "\n\n" + response);
		}
 	});
}
function printWindowPumpReceipt(printId) {
	childwin = window.open('pumpReceiptPrint.do?pageId=347&eventId=3&Printno='+printId, 'newwindow', config='height=600,width=850, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}