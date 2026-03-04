define([  
	'slickGridWrapper2'
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,'JsonUtility'
	,'messageUtility'
	,'nodvalidation'
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
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/billWiseGstReportWS/getbillRegisterTranportationModeWiseElementConfiguration.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		}, getElementConfigDetails : function(response) {
			let loadelement = new Array();
			let baseHtml = new $.Deferred();

			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/billWiseGstReport/billWiseGstReport.html", function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();

				let keyObject = Object.keys(response);
				
				for (let i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]])
						$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
				}

				let elementConfiguration	= new Object();
				elementConfiguration.dateElement			= $('#dateEle');
				elementConfiguration.regionElement			= $('#regionEle');
				elementConfiguration.subregionElement		= $('#subRegionEle');
				elementConfiguration.branchElement			= $('#branchEle');
				elementConfiguration.transportationModeEle	= $('#transportationModeEle');
				
				response.elementConfiguration		= elementConfiguration;
				response.sourceAreaSelection		= true;
				response.isCalenderSelection		= true;
				
				Selection.setSelectionToGetData(response);
				
				myNod = Selection.setNodElementForValidation(response);

				hideLayer();
			
				$("#searchBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmit();								
				});
			});
		}, setReportData : function(response) {
			$("#tranportationModeWiseModelDiv").empty();
				
			if(response.message != undefined) {
				hideLayer();
				$('#bottom-border-boxshadow').addClass('hide');
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
				return;
			}
			
			let bookingChargesNameHM	= response.bookingChargesNameHM;
			let deliveryChargesNameHM	= response.deliveryChargesNameHM;
			
			for(let a = 0; a < response.CorporateAccount.length; a++) {
				let obj					= response.CorporateAccount[a];
				let chargesMap			= obj.wayBillBookingChargesHM;
				let deliveryChargesMap	= obj.wayBillDeliveryChargesHM;
				
				if(bookingChargesNameHM != undefined) {
					for(let chargeId in bookingChargesNameHM) {
						let chargeName	= bookingChargesNameHM[chargeId].replace(/[' ',.,/]/g,"");
						
						obj[chargeName]	= chargesMap != undefined ? (chargesMap[chargeId] != undefined ? Math.round(chargesMap[chargeId]) : 0) : 0;
					}
				}
				
				if(deliveryChargesNameHM != undefined) {
					for(let chargeId in deliveryChargesNameHM) {
						let chargeName	= deliveryChargesNameHM[chargeId].replace(/[' ',.,/]/g,"");
						obj[chargeName]	= deliveryChargesMap != undefined ? (deliveryChargesMap[chargeId] != undefined ? Math.round(deliveryChargesMap[chargeId]) : 0) : 0;
					}
				}
			}
			
			response.Language				= {};

			$('#bottom-border-boxshadow').removeClass('hide');
			slickGridWrapper2.setGrid(response);
			
			hideLayer();
		}, onSubmit : function() {
			showLayer();
			let jsonObject = Selection.getElementData();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/billWiseGstReportWS/getbillRegisterTranportationModeWiseDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}
	});
});
