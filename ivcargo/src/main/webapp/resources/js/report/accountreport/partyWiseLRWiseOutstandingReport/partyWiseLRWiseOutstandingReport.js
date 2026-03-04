var STBS_WISE_NAME		= "STBS";
var BILL_WISE_NAME		= "Bill";
var LR_WISE_STBS_NAME	= "STBS LR";
var LR_WISE_BILL_NAME	= "Bill LR";
define(
	[
	'slickGridWrapper2',
	PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js',
	'JsonUtility',
	'messageUtility',
	'autocomplete',
	'focusnavigation',
	'nodvalidation'
	],
	function(slickGridWrapper2, Selection) {
	'use strict';
	var myNod,  _this = '' ,searchOperation = 0, searchVehicleAgentNod;
			
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(null, WEB_SERVICE_URL+'/partyWiseLRWiseOutstandingReportWS/getPartyWiseLRWiseOutstandingReportElement.do', _this.renderElements, EXECUTE_WITH_ERROR);
			return _this;
		}, renderElements :function(response) {
			showLayer();
			var loadelement			= new Array();
			var baseHtml 			= new $.Deferred();
					
			loadelement.push(baseHtml);
					
			$("#mainContent").load("/ivcargo/html/report/accountreport/partyWiseLrWiseOutstandingReport/partyWiseLrWiseOutstandingReport.html",
					function() {
				baseHtml.resolve();
			});
					
			$.when.apply($, loadelement).done(function() {
				hideLayer();
				initialiseFocus();
				
				var keyObject 		= Object.keys(response);
			
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]])
						$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
				}
				
				let partyNameAuto = Object();
				partyNameAuto.url 			= WEB_SERVICE_URL+'/partyWiseLRWiseOutstandingReportWS/getPartyDetailsAutocomplete.do?';
				partyNameAuto.primary_key 	= 'creditorId';
				partyNameAuto.field 		= 'creditorDisplayName';
				$("#partyNameEle").autocompleteCustom(partyNameAuto);
				
				var elementConfiguration	= new Object();
						
				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
						
				response.elementConfiguration	= elementConfiguration;
				response.sourceAreaSelection	= response.sourceAreaSelection;
				response.isCalenderSelection	= response.isCalenderSelection;
				response.isPhysicalBranchesShow	= true;
		
				Selection.setSelectionToGetData(response);
				
				_this.setSelectType();
				
				myNod 					= Selection.setNodElementForValidation(response);

				$('#branchEle').change(function() {
					_this.validatePartyName();
				});
						
				$("#findBtn").click(function() {
					_this.validatePartyName();
					
					myNod.performCheck();
							
					if(myNod.areAll('valid'))
						_this.onFind();
				});
			});
		}, onFind : function() {
			showLayer();
					
			var jsonObject = Selection.getElementData();
			jsonObject["searchType"] 	= $('#selectTypeEle_primary_key').val();

			getJSON(jsonObject, WEB_SERVICE_URL+'/partyWiseLRWiseOutstandingReportWS/getPartyWiseLRWiseOutstandingReportData.do', _this.setData, EXECUTE_WITH_NEW_ERROR);
		}, setData : function(response) {
			hideLayer();
			
			if (response.message != undefined) {
				$('#bottom-border-boxshadow').addClass('hide');
				return;
			}
			
			if(response.CorporateAccount != undefined) {
				$('#bottom-border-boxshadow').removeClass('hide');
				hideAllMessages();
				response.Language	= {};
				slickGridWrapper2.setGrid(response);
			}
		},validatePartyName : function(){
			if ($('#branchEle_primary_key').val() > 0)
				myNod.remove('#partyNameEle');
			else
				addAutocompleteElementInNode(myNod, 'partyNameEle', 'Select proper Party Name !');
			
		},setSelectType: function(){
			_this.setSelectTypeAutocompleteInstance();

			var autoSelectType = $("#selectTypeEle").getInstance();

			var SelectTYPE = [
				{ "selectTypeId": 0, "selectTypeName": "ALL" },
				{ "selectTypeId": 1, "selectTypeName": "Bill" },
				{ "selectTypeId": 2, "selectTypeName": "STBS" },
				{ "selectTypeId": 3, "selectTypeName": "Booking Short Credit" },
				{ "selectTypeId": 4, "selectTypeName": "Delivery Short Credit" },
			]

			$(autoSelectType).each(function(){
				this.option.source = SelectTYPE;
			})
			
			 $("#selectTypeEle").val("ALL");
   
   			 $("#selectTypeEle").trigger("change");
		},setSelectTypeAutocompleteInstance: function() {
			var autoSelectTypeName = new Object();
			autoSelectTypeName.primary_key = 'selectTypeId';
			autoSelectTypeName.field = 'selectTypeName';

			$("#selectTypeEle").autocompleteCustom(autoSelectTypeName)
		}
	});
});


function billSearchInReport(grid,dataView,row){
	if(dataView.getItem(row).billId != undefined && dataView.getItem(row).billId > 0){
		if(dataView.getItem(row).typeName === BILL_WISE_NAME || dataView.getItem(row).typeName === LR_WISE_BILL_NAME)
			window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId='+dataView.getItem(row).billId+'&wayBillNumber='+dataView.getItem(row).billNumber+'&TypeOfNumber=6&BranchId='+dataView.getItem(row).billBranchId+'&CityId=0&searchBy='+dataView.getItem(row).billBranchName);
		else if(dataView.getItem(row).typeName === STBS_WISE_NAME || dataView.getItem(row).typeName === LR_WISE_STBS_NAME)
			window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId='+dataView.getItem(row).billId+'&wayBillNumber='+dataView.getItem(row).billNumber+'&TypeOfNumber=12&BranchId='+dataView.getItem(row).billBranchId+'&CityId=0&searchBy='+dataView.getItem(row).billBranchName);
	} 
}