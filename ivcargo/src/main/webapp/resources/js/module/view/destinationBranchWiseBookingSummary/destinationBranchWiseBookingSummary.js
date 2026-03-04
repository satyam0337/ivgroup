define([
	'slickGridWrapper2',
	 PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js',
	'JsonUtility',
	 'messageUtility',
	 'moment',
	 'nodvalidation',
	 'focusnavigation'
],function(slickGridWrapper2, Selection) {
	'use strict';
	let jsonObject = new Object(), myNod,  _this;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/destinationBranchWiseBookingSummaryWS/getDestinationBranchWiseBookingSummaryElement.do?', _this.setLRDestinationWiseLSReportsElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setLRDestinationWiseLSReportsElements : function(response) {
			let loadelement 	= new Array();
			let baseHtml 		= new $.Deferred();
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/report/destinationBranchWiseBookingSummary/destinationBranchWiseBookingSummary.html", function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				let keyObject = Object.keys(response);
				
				for (let i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]]) {
						$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
					}
				}
				
				let elementConfiguration					= new Object();
				
				elementConfiguration.dateElement			= $('#dateEle');
				elementConfiguration.regionElement			= $('#regionEle');
				elementConfiguration.subregionElement		= $('#subRegionEle');
				elementConfiguration.branchElement			= $('#branchEle');

				elementConfiguration.destRegionElement		= $('#destRegionEle');
				elementConfiguration.destSubregionElement	= $('#destSubRegionEle');
				elementConfiguration.destBranchElement		= $('#destBranchEle');

				response.elementConfiguration				= elementConfiguration;

				Selection.setSelectionToGetData(response);
				hideLayer();
				
				myNod	= Selection.setNodElementForValidation(response);

				$("#searchBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmit();								
				});
			});
		}, onSubmit : function() {
			showLayer();
			
			let jsonObject = Selection.getElementData();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/destinationBranchWiseBookingSummaryWS/getDestinationBranchWiseBookingSummaryDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}, setReportData : function(response) {
			hideLayer();
			
			if(response.message != undefined) {
				$('#middle-border-boxshadow').addClass('hide');
				return;
			}
			
			$("#reportDetailsDiv").empty();
			
			if(response.CorporateAccount != undefined) {
				$('#middle-border-boxshadow').removeClass('hide');
				
				let bookingChargesNameHM	= response.chargesNameHM;
								
				if(bookingChargesNameHM != undefined) {
					for(const element of response.CorporateAccount) {
						let obj			= element;
						let chargesMap	= obj.chargesCollection;
										
						for(let chargeId in bookingChargesNameHM) {
							let chargeName	= bookingChargesNameHM[chargeId].replace(/[' ',.,/]/g,"");
											
											
							obj[chargeName]	= chargesMap != undefined ? (chargesMap[chargeId] != undefined ? chargesMap[chargeId] : 0) : 0;
						}
					}
				}
				
				slickGridWrapper2.setGrid(response);
			}
			
			hideLayer();
		}
	});
});