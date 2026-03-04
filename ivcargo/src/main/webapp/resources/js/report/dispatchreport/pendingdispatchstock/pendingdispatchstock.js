define([  
	'slickGridWrapper2'
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,'JsonUtility'
	,'messageUtility'
	,'autocomplete'
	,'autocompleteWrapper'
	,'nodvalidation'
	,'focusnavigation'//import in require.config
	],function(slickGridWrapper2, Selection) {
	'use strict';
	var jsonObject = new Object(), myNod, _this = '', searchTypeSummary = 2;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/pendingDispatchStockReportWS/getPendingDispatchStockReportElement.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		}, getElementConfigDetails : function(response){
			var loadelement = new Array();
			var baseHtml 	= new $.Deferred();

			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/report/dispatchreport/pendingdispatchstock/PendingDispatchStock.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				var keyObject = Object.keys(response);
				
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]])
						$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
				}
				
				_this.setSearchType();

				var elementConfiguration	= new Object();

				elementConfiguration.dateElement			= $('#dateEle');
				elementConfiguration.regionElement			= $('#regionEle');
				elementConfiguration.subregionElement		= $('#subRegionEle');
				elementConfiguration.branchElement			= $('#branchEle');
				elementConfiguration.destSubregionElement 	= $('#destSubRegionEle');
				elementConfiguration.destBranchElement 		= $('#destBranchEle');

				response.elementConfiguration					= elementConfiguration;
				response.sourceAreaSelection					= true;
				response.isPhysicalBranchesShow					= true;
				response.isOperationalDestBranchesShow			= false;
				response.isCalenderSelection					= response['date'];
				
				if(!response['date'])
					$("*[data-attribute=date]").remove();
				
				_this.setSelectType();	
				
				Selection.setSelectionToGetData(response);

				hideLayer();
				
				response.destinationAreaSelection	= true;
				myNod = Selection.setNodElementForValidation(response);

				if($('#selectTypeEle').is(":visible"))
					addAutocompleteElementInNode(myNod, 'selectTypeEle', 'Select proper Type !');
					
				$("#searchBtn").click(function() {
					myNod.performCheck();

					if(Number($('#categoryTypeEle_primary_key').val()) == searchTypeSummary && $('#branchEle_primary_key').val() < 0) {
						showAlertMessage('error', 'Please Select proper Branch !');
						$("#branchEle").focus(); 
						return false;
					}

					if(myNod.areAll('valid'))
						_this.onSubmit(_this);								
				});
			});
		}, setSelectType : function(){
			_this.setSelectTypeAutocompleteInstance();
			
			var autoSelectType = $("#selectTypeEle").getInstance();
			
			var SelectTYPE = [
				{ "selectTypeId":-1, "selectTypeName": "ALL" },
				{ "selectTypeId":1, "selectTypeName": "NORMAL LR" },
				{ "selectTypeId":2, "selectTypeName": "CROSSING LR" },
			]
			
			$( autoSelectType ).each(function() {
				this.option.source = SelectTYPE;
			})
		}, setSelectTypeAutocompleteInstance : function() {
			var autoSelectTypeName 			= new Object();
			autoSelectTypeName.primary_key 	= 'selectTypeId';
			autoSelectTypeName.field 		= 'selectTypeName';

			$("#selectTypeEle").autocompleteCustom(autoSelectTypeName)
		}, setSearchType : function(){
			_this.setSearchTypeAutocompleteInstance();
			
			var autoSearchType = $("#categoryTypeEle").getInstance();
			
			var SearchTYPE = [
				{ "categoryTypeId":1, "categoryTypeName": "DETAILS" },
				{ "categoryTypeId":2, "categoryTypeName": "SUMMARY" },
			]
			
			$( autoSearchType ).each(function() {
				this.option.source = SearchTYPE;
			})
		}, setSearchTypeAutocompleteInstance : function() {
			var autoSearchTypeName 			= new Object();
			autoSearchTypeName.primary_key 	= 'categoryTypeId';
			autoSearchTypeName.field 		= 'categoryTypeName';

			$("#categoryTypeEle").autocompleteCustom(autoSearchTypeName)
		}, onSubmit : function() {
			showLayer();
			
			var jsonObject = Selection.getElementData();
			
			jsonObject["searchType"]		= $('#selectTypeEle_primary_key').val();
			jsonObject["categoryType"]	= $('#categoryTypeEle_primary_key').val();
									
			getJSON(jsonObject, WEB_SERVICE_URL+'/pendingDispatchStockReportWS/getPendingDispatchStockReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}, setReportData : function(response) {
			hideLayer();
			
			if(response.message != undefined) {
				$('#bottom-border-boxshadow').addClass('hide');
				return;
			}
			
			if(response.CorporateAccount != undefined && response.CorporateAccount.length > 0) {
				$('#bottom-border-boxshadow').removeClass('hide');
				slickGridWrapper2.setGrid(response);
			}

			hideLayer();
		}
	});
});