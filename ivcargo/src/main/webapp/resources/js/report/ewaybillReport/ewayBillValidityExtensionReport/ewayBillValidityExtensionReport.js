var deatails;
define([  
	'selectizewrapper'
	,'slickGridWrapper2'
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,'JsonUtility'
	,'messageUtility'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'focusnavigation'//import in require.config
	],function(Selectizewrapper, slickGridWrapper2, Selection) {
	'use strict';
	let jsonObject = new Object(), myNod,  _this = '';
	
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/ewayBillValidityExtensionReportWS/getEwayBillValidityExtensionReportElementConfig.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		}, getElementConfigDetails : function(response) {
			let loadelement = new Array();
			let baseHtml = new $.Deferred();
			let selectEWayBillExtendedOnTripDateOption = response.selectEWayBillExtendedOnTripDateOption;
			
			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/report/ewaybillReport/ewayBillValidityExtensionReport/ewayBillValidityExtensionReport.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				let keyObject = Object.keys(response);

				for (const element of keyObject) {
					if (response[element])
						$("*[data-attribute="+ element+ "]").removeClass("hide");
   				}

				let elementConfiguration					= new Object();
				
				elementConfiguration.dateElement			= $('#dateEle');
				elementConfiguration.regionElement 			= $('#regionEle');
				elementConfiguration.subregionElement 		= $('#subRegionEle');
				elementConfiguration.branchElement 			= $('#branchEle');
				
				response.elementConfiguration		= elementConfiguration;
				response.isCalenderSelection		= true;
				response.sourceAreaSelection		= true;

				if (!response.showRegionAndSubRegionpannel) {    
					$("*[data-attribute='region']").hide();
  					$("*[data-attribute='subRegion']").hide();
    				$("*[data-attribute='branch']").hide();
				} else {    
					$("*[data-attribute='region']").show();
    				$("*[data-attribute='subRegion']").show();
   					$("*[data-attribute='branch']").show();
    			}

				response.isPhysicalBranchesShow	= true;
				Selection.setSelectionToGetData(response);

				myNod = nod();

				myNod.configure({
					parentClass:'validation-message'
				});
				
				if($('#regionEle').exists() && $('#regionEle').is(":visible")){
					myNod.add({
						selector: '#regionEle',
						validate: 'validateAutocomplete:#regionEle_primary_key',
						errorMessage: 'Select proper Region !'
					});
				}
				
				if($('#subRegionEle').exists() && $('#subRegionEle').is(":visible")){
					myNod.add({
						selector: '#subRegionEle',
						validate: 'validateAutocomplete:#subRegionEle_primary_key',
						errorMessage: 'Select proper Area !'
					});
				}
				
				if($('#branchEle').exists() && $('#branchEle').is(":visible")){
					myNod.add({
						selector: '#branchEle',
						validate: 'validateAutocomplete:#branchEle_primary_key',
						errorMessage: 'Select proper Branch !'
					});
				}
				
				let dataTypeList 		= new Array();
				 
				dataTypeList[0] = {'dataTypeId':1,'dataTypeName':'Pending Ewaybill For Extension'};
				dataTypeList[1] = {'dataTypeId':2,'dataTypeName':'EwayBill Extended'};
				
				if(selectEWayBillExtendedOnTripDateOption) {
					dataTypeList[2] = {'dataTypeId':3,'dataTypeName':'TripDateClosed EwayBill'};
					dataTypeList[3] = {'dataTypeId':4,'dataTypeName':'All'};
				} else {
					dataTypeList[2] = {'dataTypeId':4,'dataTypeName':'All'};
				}
			
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	dataTypeList,
					valueField		:	'dataTypeId',
					labelField		:	'dataTypeName',
					searchField		:	'dataTypeName',
					elementId		:	'dataTypeEle',
					create			: 	false,
					maxItems		: 	1,
				});
				
				myNod.add({
					selector		: '#dataTypeEle_wrapper',
					validate		: 'validateAutocomplete:#dataTypeEle',
					errorMessage	: 'Select Proper Selection Type !'
				});

				hideLayer();

				$("#searchBtn").keyup(function(event) {
					if(event.which){
						let keycode = event.which;
						if(keycode == 13){
							next = 'searchBtn';
						}
					}
				});
			
				$("#searchBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmit();								
				});
			});
		},setReportData : function(response) {
			hideLayer();
			
			$("#ewayBillForExtnsDiv").empty();
			$("#extendedEwaybillDiv").empty();
			$("#tripClosedEwayBillDiv").empty();
				
			if(response.message != undefined) {
				$('#bottom-border-boxshadow').addClass('hide');
				$('#middle-border-boxshadow').addClass('hide');
				$('#left-border-boxshadow').addClass('hide');
				return;
			}
			
			if(response.ewayBillForExtension != undefined && response.ewayBillForExtension.CorporateAccount != undefined) {
				$('#bottom-border-boxshadow').removeClass('hide');
				slickGridWrapper2.setGrid(response.ewayBillForExtension);
			} else {
				$('#bottom-border-boxshadow').addClass('hide');
			}
			
			if(response.extendedEwaybill != undefined && response.extendedEwaybill.CorporateAccount != undefined) {
				$('#middle-border-boxshadow').removeClass('hide');
				slickGridWrapper2.setGrid(response.extendedEwaybill);
			} else {
				$('#middle-border-boxshadow').addClass('hide');
			}
			
			if(response.tripDateOnClosedReport != undefined && response.tripDateOnClosedReport.CorporateAccount != undefined) {
				$('#left-border-boxshadow').removeClass('hide');
				slickGridWrapper2.setGrid(response.tripDateOnClosedReport);
			} else {
				$('#left-border-boxshadow').addClass('hide');
			}
			
			hideLayer();
		},onSubmit : function() {
			showLayer();
			
			let jsonObject	= Selection.getElementData();
			
			$("#prevBranchId").val($('#branchEle_primary_key').val());

			jsonObject["operationTypeId"] 	= $('#dataTypeEle').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/ewayBillValidityExtensionReportWS/getEwayBillValidityExtensionReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}
	});
});

function extendedEwaybillDetails(grid,dataView,row) {	
	deatails = dataView.getItem(row)
			
	let isTripClosed = deatails.tripClosed;
	
	if(isTripClosed) {
		showMessage('info', 'Trip Already Closed !');
		hideLayer();
		return;
	}
			
	$('#ewayBillValidityExtensionReport').bPopup({
	},function(){
		$("#ewayBillValidity").val("1");
		let _thisMod = this;
		$(this).html("<div class='confirm' style=\"height: 160px;width: 308px;font-style: inherit;background-color: honeydew;\"><h1 style=\"font-size: 18px;\">Are you sure you want to close <b>EwayBill Extended Validity</b>?</h1><p style=\"font-size: 15px;\" id='shortcut'></p><button id='cancelButton' style=\"font-size: 18px;\">NO</button><button id='confirm' style=\"font-size: 18px;\">YES</button></div>")
		$("#shortcut").html("Shortcut Keys : Enter = Yes, Esc = No")
		$("#confirm").focus();

		$("#confirm").click(function(){
			updateTripDetails(deatails);
			_thisMod.close();
			return true;
		})

		$("#confirm").on('keydown', function(e) {
			if (e.which == 27) {  //escape
				_thisMod.close();
				return true;
			}
		});
		
		$("#cancelButton").click(function(){
			_thisMod.close();
			return false;
		})
	});
}

function updateTripDetails(deatails) {
	if(deatails !== "undefined") {
		let jsonObject = new Object();
		jsonObject["ewaybillNumber"] = deatails.ewayBillNumber;
		getJSON(jsonObject, WEB_SERVICE_URL+'/EwayBillValidityExtensionWS/updateEwaybillTripForWebApp.do', updateTripDetailReport, EXECUTE_WITH_ERROR);
		deatails.tripClosed = true;
	}
}

function updateTripDetailReport(response) {
	let updatedRowCount	= response.updatedRowCount;
	
	if(updatedRowCount > 0) {
		showMessage('success', 'Trip Closed SuccessFully !');
		hideLayer();
	}
}
