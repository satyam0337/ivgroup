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
	var jsonObject = new Object(), myNod, _this = '';
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/toPayLRDetailsReportWS/getToPayLRDetailsReportElement.do?',	_this.setToPayLRDetailsReportsElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		},setToPayLRDetailsReportsElements : function(response) {
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			loadelement.push(baseHtml);
		
			$("#mainContent").load("/ivcargo/html/module/toPayLRDetailsReport/toPayLRDetailsReport.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				let keyObject = Object.keys(response);
				
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]])
						$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
				}
				
				_this.setSelectType();				
				
				var elementConfiguration				= new Object();
				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');

				response.elementConfiguration		= elementConfiguration;
				response.isCalenderSelection		= true;
				response.sourceAreaSelection		= true;
				
				Selection.setSelectionToGetData(response);
				
				myNod = Selection.setNodElementForValidation(response);
				
				hideLayer();
			
				$("#saveBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmit();								
				});
			});
		}, setSelectType : function() {
			_this.setSelectTypeAutocompleteInstance();
			
			var autoSelectType = $("#typeEle").getInstance();
			
			var SelectTYPE = [
			        { "selectTypeId":1, "selectTypeName": "Topay Booking" },
			        { "selectTypeId":2, "selectTypeName": "Collection" },
			        { "selectTypeId":3, "selectTypeName": "Pending" },
			    ]
			
			$( autoSelectType ).each(function() {
				this.option.source = SelectTYPE;
			})
		}, setSelectTypeAutocompleteInstance : function() {
			var autoSelectTypeName 			= new Object();
			autoSelectTypeName.primary_key 	= 'selectTypeId';
			autoSelectTypeName.field 		= 'selectTypeName';

			$("#typeEle").autocompleteCustom(autoSelectTypeName)
		}, onSubmit : function() {
			showLayer();
			var jsonObject = Selection.getElementData();

			jsonObject["searchType"] 		= $('#typeEle_primary_key').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/toPayLRDetailsReportWS/getToPayLRDetailsReportDetails.do', _this.setReportData, EXECUTE_WITH_NEW_ERROR);
		}, setReportData : function(response) {
			hideLayer();
			
			if(response.message != undefined) {
				$('#middle-border-boxshadow').addClass('hide');
				return;
			}
			
			if(response.CorporateAccount != undefined) {
				$('#middle-border-boxshadow').removeClass('hide');
				slickGridWrapper2.setGrid(response);
			}
			
			hideLayer();
		}
	});
});


function ToPayLRDetailReport(grid, dataView,row){
	showLayer();
	
	var jsonObject = new Object();
	
	if($("#dateEle").attr('data-startdate') != undefined){
		jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
	}

	if($("#dateEle").attr('data-enddate') != undefined){
		jsonObject["toDate"] = $("#dateEle").attr('data-enddate');
	}

	jsonObject["sourceBranchId"] 	= dataView.getItem(row).sourceBranchId;
	jsonObject["searchType"] 		= $('#typeEle_primary_key').val();
	
	localStorage.setItem("jsonObject",JSON.stringify(jsonObject));

	childwin = window.open("Reports.do?pageId=340&eventId=3&modulename=toPayDetailsReportLRDetails&tab=4","_blank");

	hideLayer();

	
}
