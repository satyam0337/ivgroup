define([  
     'slickGridWrapper2'
        ,'selectizewrapper'
		,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
		,'JsonUtility'
          ,'messageUtility'
          ,'nodvalidation'
          ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
          ,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
          ,'focusnavigation'//import in require.config
          ],function(slickGridWrapper2, Selectizewrapper, Selection) {
	'use strict';
	let jsonObject = new Object(), _this = '';
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/report/deliverySummaryReportWS/getDeliverySummaryReportElementConfiguration.do?',	_this.renderDeliverySummaryReportElements,	EXECUTE_WITH_ERROR);
			return _this;
		},renderDeliverySummaryReportElements : function(response) {
			let loadelement = new Array();
			let baseHtml = new $.Deferred();
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/report/deliverySummaryReport/deliverySummaryReport.html",function() {
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
				
				/*
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.TypeOfDataList,
					valueField		:	'transportTypeId',
					labelField		:	'transportTypename',
					searchField		:	'transportTypename',
					elementId		:	'typeEle',
					create			: 	false,
					maxItems		: 	1
				});*/
				
				//response.type = true;
				
				let myNod = Selection.setNodElementForValidation(response);
				
				if(response.billSelection)
					addAutocompleteElementInNode1(myNod, 'billSelectionEle', 'Select proper BillSelection !')
			
				hideLayer();
			
				$("#find").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmit();								
				});
			});
		},setReportData : function(response) {
			if(response.message != undefined) {
				hideLayer();
				$('#middle-border-boxshadow').addClass('hide');
				$('#deliverySummaryReportDetailsDiv').empty();
				return;
			}
			
			$('#middle-border-boxshadow').removeClass('hide');

			let paymentNameHm	= response.paymentNameHm;
										
			if(paymentNameHm != undefined) {
				for(const obj of response.CorporateAccount) {
					let chargesMap	= obj.paymentTypeCollection;
												
					for(let chargeId in paymentNameHm) {
						let chargeName	= paymentNameHm[chargeId].replace(/[^a-zA-Z0-9]+/,"");
						
						obj[chargeName]	= chargesMap != undefined ? (chargesMap[chargeId] != undefined ? toFixedWhenDecimal(chargesMap[chargeId]) : 0) : 0;
					}
				}
			}

			slickGridWrapper2.setGrid(response);
			
			hideLayer();
		},onSubmit:function() {
			showLayer();
			
			let jsonObject = Selection.getElementData();
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/report/deliverySummaryReportWS/getDeliverySummaryReportDetails.do?', _this.setReportData, EXECUTE_WITH_ERROR);
		}
	});
});