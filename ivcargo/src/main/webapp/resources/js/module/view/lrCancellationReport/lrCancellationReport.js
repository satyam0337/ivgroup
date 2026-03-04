define([  
          'slickGridWrapper2'
          ,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
		  ,'JsonUtility'
          ,'messageUtility'
          ,'nodvalidation'
          ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
          ,'focusnavigation'//import in require.config
          ],function(slickGridWrapper2, Selection) {
	'use strict';
	let jsonObject = new Object(), myNod, _this = '';
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/lrCancellationReportWS/getLrCancellationReportElement.do?',	_this.setLrCancellationReportsElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		},setLrCancellationReportsElements : function(response) {
			let loadelement 			= new Array();
			let baseHtml 				= new $.Deferred();
			let showDownLoadExcelButton      = response.showDownLoadExcelButton;
			loadelement.push(baseHtml);
		
			$("#mainContent").load("/ivcargo/html/module/lrcancellationreport/LrCancellationReport.html",function() {
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
				response.isOneYearCalenderSelection	= false;
				response.monthLimit					= 1;
				response.sourceAreaSelection		= true;
				
				if(showDownLoadExcelButton)
					$('#downloadExcel').removeClass('hide');
				
				response.isPhysicalBranchesShow		= true;
				Selection.setSelectionToGetData(response);
				
				myNod = Selection.setNodElementForValidation(response);
				
				hideLayer();
			
				$("#saveBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmit(false);								
				});
				
				$("#downloadExcel").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmit(true);								
				});
			});
			
		}, setReportData : function(response) {
			if(response.message != undefined) {
				hideLayer();
				$('#middle-border-boxshadow').addClass("hide");
				return;
			}

			$("#bookedLRsDiv").empty();

			if(response.CorporateAccount != undefined) {
				$('#middle-border-boxshadow').removeClass("hide");
				hideAllMessages();
				
				let bookingChargesNameHM	= response.chargesNameHM;
				
				if(bookingChargesNameHM != undefined) {
					for(const obj of response.CorporateAccount) {
						let chargesMap	= obj.chargesCollection;
						
						for(let chargeId in bookingChargesNameHM) {
							let chargeName	= bookingChargesNameHM[chargeId].replace(/[' ',.,/]/g,"");
							
							obj[chargeName]	= chargesMap != undefined ? (chargesMap[chargeId] != undefined ? Math.round(chargesMap[chargeId]) : 0) : 0;
						}
					}
				}

				slickGridWrapper2.setGrid(response);
			} else
				$('#middle-border-boxshadow').addClass("hide");

			hideLayer();
		}, onSubmit : function(isExcel) {
			showLayer();
			let jsonObject = Selection.getElementData();
			
			jsonObject["isExcel"] 			= isExcel;
			
			if(isExcel)
				getJSON(jsonObject, WEB_SERVICE_URL+'/lrCancellationReportWS/getCancelledLRReportDetails.do', _this.responseForExcel, EXECUTE_WITH_ERROR);
			else
				getJSON(jsonObject, WEB_SERVICE_URL+'/lrCancellationReportWS/getCancelledLRReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}, responseForExcel : function(data) {
			let errorMessage = data.message;
			
			if(errorMessage.messageId == 21 || errorMessage.messageId == 491) {
				hideLayer();
				return false;
			}
			
			hideLayer();
				
			generateFileToDownload(data);
		}
	});
});