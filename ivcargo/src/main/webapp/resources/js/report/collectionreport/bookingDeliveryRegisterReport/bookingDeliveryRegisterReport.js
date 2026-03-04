define([  
		'slickGridWrapper2'
		,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
		,'JsonUtility'
		,'messageUtility'
		,'autocomplete'
		,'autocompleteWrapper'
		,'nodvalidation'
		,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
		,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'
		,'focusnavigation'//import in require.config
          ],function(slickGridWrapper2, Selection) {
	'use strict';
	let jsonObject = new Object(), myNod, _this = '';
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/report/bookingDeliveryRegisterReportWS/getBookingDeliveryRegisterReportElement.do?', _this.setBookingDeliveryRegisterReportElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setBookingDeliveryRegisterReportElements : function(response) {
			let loadelement 			= new Array();
			let baseHtml 				= new $.Deferred();
			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/report/collectionreport/bookingDeliveryRegisterReport/bookingDeliveryRegisterReport.html",function() {
				baseHtml.resolve();
			});
		
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				let keyObject = Object.keys(response);

				for (let i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]])
						$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
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
			
				$("#findBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmit();								
				});

			});
			
		}, onSubmit : function() {
			showLayer();
			let jsonObject	= Selection.getElementData();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/report/bookingDeliveryRegisterReportWS/getBookingDeliveryRegisterReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}, setReportData: function (response) {
			$("#paidLrDetailsForCashNdShortCreditDiv").empty();
		    $("#paidLrDetailsForCashLessDiv").empty();
		    $("#toPayLrDetailsForCashNdShortCreditDiv").empty();
		    $("#toPayLrDetailsForCashLessDiv").empty();
		
			if(response.message != undefined) {
				$("#middle-border-boxshadow").addClass("hide");
		    	$("#left-border-boxshadow").addClass("hide"); 
		    	$("#right-border-boxshadow").addClass("hide");
		    	$("#bottom-border-boxshadow").addClass("hide");
				return;
			}
			
			const BOOKING_CASH		= response.BOOKING_CASH;
			const BOOKING_CASHLESS	= response.BOOKING_CASHLESS;
			const DELIVERY_CASH		= response.DELIVERY_CASH;
			const DELIVERY_CASHLESS	= response.DELIVERY_CASHLESS;
		   
		    if (BOOKING_CASH != undefined) {
		        $("#middle-border-boxshadow").removeClass("hide");
		        slickGridWrapper2.setGrid(BOOKING_CASH);
		    } else
		    	$("#middle-border-boxshadow").addClass("hide");
		
		    if (BOOKING_CASHLESS != undefined) {
		        $("#left-border-boxshadow").removeClass("hide");
		        slickGridWrapper2.setGrid(BOOKING_CASHLESS);
		    } else
		   	 	$("#left-border-boxshadow").addClass("hide");
		 
		    if (DELIVERY_CASH != undefined) {
		        $("#right-border-boxshadow").removeClass("hide");
		        slickGridWrapper2.setGrid(DELIVERY_CASH);
		    } else
		    	$("#right-border-boxshadow").addClass("hide");

		 	if (DELIVERY_CASHLESS != undefined) {
		        $("#bottom-border-boxshadow").removeClass("hide");
		        slickGridWrapper2.setGrid(DELIVERY_CASHLESS);
		    } else
		    	$("#bottom-border-boxshadow").addClass("hide");
		
		    hideLayer();
		}
	});
});