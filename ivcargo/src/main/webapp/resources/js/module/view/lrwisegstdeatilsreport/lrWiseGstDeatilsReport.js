define([
	 PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js',
	 'slickGridWrapper2',
	'JsonUtility',
	 'messageUtility',
	 'nodvalidation',
	 'focusnavigation',
	 PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	],function(Selection, slickGridWrapper2) {
	'use strict';
	var jsonObject = new Object(), myNod,  _this, isBookingWiseExcel= false,isDeliveryWiseExcel =false;

	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/lrWiseGstDeatilsReportWS/getGstDeatilsReportElement.do?',_this.setReportsElements, EXECUTE_WITH_ERROR);
			return _this;
		},setReportsElements : function(response){
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/gstreport/LrWiseGstReport.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				var keyObject = Object.keys(response);
				
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]])
						$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
				}
				
				var elementConfiguration	= new Object();
				
				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
				
				response.elementConfiguration	        = elementConfiguration;
				response.sourceAreaSelection	        = true;
				response.isCalenderSelection	        = true;
				response.isPhysicalBranchesShow	        = true;
				response.AllOptionsForRegion  	        = false,
				response.AllOptionsForSubRegion         = false,
				response.AllOptionsForBranch 	        = true;
				
				Selection.setSelectionToGetData(response);
				
				myNod = Selection.setNodElementForValidation(response);

				if(response.DownloadToExcelButtonForBookingInLrWiseGstReport)
					$('#downloadExcel').css('display', 'inline');
				else
					$('#downloadExcel').remove();
					
				if(response.DownloadToExcelButtonForDeliveryInLrWiseGstReport)
					$('#downloadExcel1').css('display', 'inline');
				else
					$('#downloadExcel1').remove();
					
				hideLayer();
				
				$("#saveBtn").click(function() {
					myNod.performCheck();
					isBookingWiseExcel = false;
					isDeliveryWiseExcel = false;

					if(myNod.areAll('valid'))
						_this.onSubmit();								
				});
				
				$("#downloadExcel").click(function() {
					myNod.performCheck();
					isBookingWiseExcel = true;
					isDeliveryWiseExcel = false;
					
					if(myNod.areAll('valid'))
						_this.onSubmit();
				});

				$("#downloadExcel1").click(function() {
					myNod.performCheck();
					isDeliveryWiseExcel = true;
					isBookingWiseExcel = false;

					if(myNod.areAll('valid'))
						_this.onSubmit();
				});
			});
		},onSubmit : function() {
			showLayer();
			var jsonObject = Selection.getElementData();
			
			jsonObject.isBookingWiseExcel = isBookingWiseExcel;
			jsonObject.isDeliveryWiseExcel = isDeliveryWiseExcel;

			getJSON(jsonObject, WEB_SERVICE_URL+'/lrWiseGstDeatilsReportWS/getLRWiseGstReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
	
		},setReportData : function(response){
					
			$("#lrWiseGstDetailsDiv").empty();
			$("#lrWiseGstDetailsDlyDiv").empty();
			
			if(response.message != undefined) {
				hideLayer();
				$('#middle-border-boxshadow').addClass('hide');
				$('#bottom-border-boxshadow').addClass('hide');
				return;
			}
			
			if(response.LrWiseGstReportByBkgDate != undefined && isBookingWiseExcel)
				_this.setExcelReportData(response.LrWiseGstReportByBkgDate);
			
			if(response.LrWiseGstReportByDlyDate != undefined && isDeliveryWiseExcel)
				_this.setExcelReportData(response.LrWiseGstReportByDlyDate);
			
			if(response.LrWiseGstReportByBkgDate != undefined && response.LrWiseGstReportByBkgDate.CorporateAccount != undefined && !isBookingWiseExcel && !isDeliveryWiseExcel) {
				$('#middle-border-boxshadow').removeClass('hide');
				hideAllMessages();
				slickGridWrapper2.setGrid(response.LrWiseGstReportByBkgDate);
			} else
				$('#middle-border-boxshadow').addClass('hide');
			
			if(response.LrWiseGstReportByDlyDate != undefined && response.LrWiseGstReportByDlyDate.CorporateAccount != undefined && !isDeliveryWiseExcel && !isBookingWiseExcel) {
				$('#bottom-border-boxshadow').removeClass('hide');
				hideAllMessages();
				slickGridWrapper2.setGrid(response.LrWiseGstReportByDlyDate);
			} else
				$('#bottom-border-boxshadow').addClass('hide');
			
			$('#lrWiseGstDetailsDiv').css('font-size','14px');
			$('#lrWiseGstDetailsDlyDiv').css('font-size','14px');
			
			hideLayer();
		}, setExcelReportData : function(response) {
			hideLayer();
			var data = response;
			
			if(data.message.messageId == NO_RECORDS_FOUND)
				return;

			generateFileToDownload(data);
		}
	});
});
