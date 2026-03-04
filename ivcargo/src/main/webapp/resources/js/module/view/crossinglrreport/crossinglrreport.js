
define([  
	'slickGridWrapper2'
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,'JsonUtility'
	,'messageUtility'
	,'jquerylingua'
	,'language'
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
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/crossingLrReportWS/getCrossingLrReportElementConfiguration.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		}, getElementConfigDetails : function(response){
			let loadelement = new Array();
			let baseHtml = new $.Deferred();

			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/crossinglrreport/CrossingLrReport.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				let keyObject = Object.keys(response);
				
				for (const element of keyObject) {
					if (response[element])
						$("*[data-attribute="+ element+ "]").removeClass("hide");
				}
				
				let elementConfiguration	= new Object();

				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');

				response.elementConfiguration		= elementConfiguration;
				response.sourceAreaSelection		= true;
				response.isCalenderSelection		= true;

				Selection.setSelectionToGetData(response);
				
				let txnTypeAutoComplete 			= new Object();
				txnTypeAutoComplete.primary_key 	= 'txnTypeId';
				txnTypeAutoComplete.url 			= response.txnTypeArr;
				txnTypeAutoComplete.field 			= 'txnTypeName';
				$("#crossingAgentTypeEle").autocompleteCustom(txnTypeAutoComplete);
			
				myNod = nod();

				myNod.configure({
					parentClass:'validation-message'
				});
				
				if($('#regionEle').exists() && $('#regionEle').is(":visible"))
					addAutocompleteElementInNode(myNod, 'regionEle', 'Select proper Region !');
				
				if($('#subRegionEle').exists() && $('#subRegionEle').is(":visible"))
					addAutocompleteElementInNode(myNod, 'subRegionEle', 'Select proper Area !');
				
				if($('#branchEle').exists() && $('#branchEle').is(":visible"))
					addAutocompleteElementInNode(myNod, 'branchEle', 'Select proper Branch !');
				
				addAutocompleteElementInNode1(myNod, 'crossingAgentEle', 'Select proper Crossing Agent !');
				addAutocompleteElementInNode(myNod, 'crossingAgentTypeEle', 'Select proper Type !');
				
				hideLayer();

				$("#searchBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmit();								
				});
			});
		}, onSubmit : function() {
			showLayer();
			
			let jsonObject		= Selection.getElementData();
			
			jsonObject["txnTypeId"] 		= $('#crossingAgentTypeEle_primary_key').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/crossingLrReportWS/getCrossingLrReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}, setReportData : function(response) {
			$("#crossingLrReportDiv").empty();

			if(response.message != undefined) {
				hideLayer();
				$('#bottom-border-boxshadow').addClass('hide');
				$('#left-border-boxshadow').addClass('hide');
				$('#right-border-boxshadow').addClass('hide');
				return;
			}

			$('#bottom-border-boxshadow').removeClass('hide');
			
			if(response.CorporateAccount != undefined && response.CorporateAccount.length > 0) {
				slickGridWrapper2.setGrid(response);
			} else if(response.tableConfig != undefined) {
				$('#left-border-boxshadow').removeClass('hide');
				$('#right-border-boxshadow').removeClass('hide');
				
				let bookingChargesNameHM	= response.chargesNameHM;
				
				if(bookingChargesNameHM != undefined) {
					for(const obj of response.tableConfig.CorporateAccount) {
						let chargesMap	= obj.chargesCollection;
						
						for(let chargeId in bookingChargesNameHM) {
							let chargeName	= bookingChargesNameHM[chargeId].replace(/[' ',.,/]/g,"");
							
							obj[chargeName]	= chargesMap != undefined ? (chargesMap[chargeId] != undefined ? Math.round(chargesMap[chargeId]) : 0) : 0;
						}
					}
					
					slickGridWrapper2.setGrid(response.tableConfig);
					
					for(const obj of response.tableConfig1.CorporateAccount) {
						let chargesMap	= obj.chargesCollection;
						
						for(let chargeId in bookingChargesNameHM) {
							let chargeName	= bookingChargesNameHM[chargeId].replace(/[' ',.,/]/g,"");
							
							obj[chargeName]	= chargesMap != undefined ? (chargesMap[chargeId] != undefined ? Math.round(chargesMap[chargeId]) : 0) : 0;
						}
					}
					
					slickGridWrapper2.setGrid(response.tableConfig1);
					slickGridWrapper2.setGrid(response.tableConfig2);
				}
			} else {
				$('#bottom-border-boxshadow').addClass('hide');
			}
			
			hideLayer();
		}
	});
});