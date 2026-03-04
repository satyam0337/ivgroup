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
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/populatesubregionandbranch.js'//PopulateAutocomplete
],function(slickGridWrapper2, Selection) {
	'use strict';
	var jsonObject = new Object(), myNod, _this = '';
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/dateWiseLRDetailsReportWS/getDateWiseLRDetailsReportElement.do?', _this.setLHPVRefundElements, EXECUTE_WITH_NEW_ERROR);
			return _this;
		},setLHPVRefundElements : function(response){
			console.log(response)
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			loadelement.push(baseHtml);
		
			$("#mainContent").load("/ivcargo/html/module/dateWiseLrDetails/dateWiseLRDetailsReport.html",function() {
				baseHtml.resolve();
			});
		
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				var keyObject = Object.keys(response);

				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]]) {
						$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
					}
				}
				
				let elementConfiguration				= new Object();
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
		}, onSubmit : function() {
			showLayer();
			let jsonObject = Selection.getElementData();
			getJSON(jsonObject, WEB_SERVICE_URL+'/dateWiseLRDetailsReportWS/getDateWiseLRDetailsReportDetails.do', _this.setReportData, EXECUTE_WITH_NEW_ERROR);
		},setReportData : function(response) {
			$("#editReportDiv").empty();
			
			if(response.message != undefined) {
				hideLayer();
				$('#bottom-border-boxshadow').addClass('hide');
				return;
			}
			
			let bookingChargesNameHM	= response.chargesNameHM;
			
			if(response.CorporateAccount != undefined) {
				$('#bottom-border-boxshadow').removeClass('hide');
				
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