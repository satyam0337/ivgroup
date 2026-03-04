
define([  
	'slickGridWrapper2'
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,'JsonUtility'
	,'messageUtility'
	,'autocomplete'
	,'autocompleteWrapper'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'focusnavigation'//import in require.config
	],function(slickGridWrapper2, Selection) {
	'use strict';
	let jsonObject = new Object(), 
	myNod,  
	_this = '';
	
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/driverAttendanceReportWS/getDriverAttendanceElement.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		}, getElementConfigDetails : function(response){
			let loadelement = new Array();
			let baseHtml 	= new $.Deferred();

			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/report/dispatchreport/driverAttendanceReport/driverAttendanceReport.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				let keyObject = Object.keys(response);
				
				for (const element of keyObject) {
					if (response[element])
						$("*[data-attribute="+ element+ "]").removeClass("hide");
				}
				
				let autoDriverName 				= new Object();
				autoDriverName.url 				= WEB_SERVICE_URL+'/autoCompleteWS/getDriverWithMobileNumber.do?viewAll=true';
				autoDriverName.primary_key 		= 'driverMasterId';
				autoDriverName.field 			= 'driverName';
				autoDriverName.sub_as			= {mobileNumber : 'Driver Number'};
				autoDriverName.show_field 		= 'mobileNumber';
				autoDriverName.sub_info 		= true;
				$("#driverNameEle").autocompleteCustom(autoDriverName);
				
				let elementConfiguration	= new Object();
				
				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
				elementConfiguration.vehicleElement		= $('#vehicleNumberEle');
				
				response.elementConfiguration		= elementConfiguration;
				response.sourceAreaSelection		= true;
				response.isCalenderSelection		= true;
				response.vehicleSelection			= response.vehicleNumber;
				response.viewAllVehicle				= true;
				
				Selection.setSelectionToGetData(response);	
				
				if(response.showDriverSummary)
					$('#driverSummary').removeClass('hide');
				else
					$('#driverSummary').remove();
				
				setTimeout(function() {
					$(elementConfiguration.regionElement).val("ALL")
					$('#regionEle_primary_key').val(-1);
					$(elementConfiguration.subregionElement).val("ALL")
					$('#subRegionEle_primary_key').val(-1);
					$(elementConfiguration.branchElement).val("ALL")
					$('#branchEle_primary_key').val(-1);
					$('#driverNameEle').focus();
				}, 100);
				
				response.vehicleNumber	= response.validateVehicleNumber;
				response.driverName		= response.validateDriverName;

				myNod = Selection.setNodElementForValidation(response);
				
				hideLayer();

				$("#searchBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmit();								
				});
			});
		}, setReportData : function(response) {
			hideLayer();
			
			$("#driverAttendanceReportDiv").empty();

			if(response.message != undefined) {
				$('#bottom-border-boxshadow').addClass('hide');
				return;
			}
			
			$('#bottom-border-boxshadow').removeClass('hide');
			slickGridWrapper2.setGrid(response);
			
			hideLayer();
		}, onSubmit : function() {
			showLayer();
			
			let jsonObject 			   = Selection.getElementData();
			jsonObject.isDriverSummary = $('#driverSummaryEle').prop('checked');
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/driverAttendanceReportWS/getDriverAttendanceDetails.do', _this.setReportData, EXECUTE_WITH_NEW_ERROR);
		}
	});
});