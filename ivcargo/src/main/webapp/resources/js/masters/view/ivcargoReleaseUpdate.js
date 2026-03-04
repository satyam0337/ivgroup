/**
 * Anant 04-Aug-2025 5:58:52 pm 2025
 */
define([
	'marionette',
	'/ivcargo/resources/js/generic/urlparameter.js',
	'selectizewrapper',
	'JsonUtility',
	'messageUtility',
	'focusnavigation',
	'nodvalidation'
], function (Marionette, UrlParameter, Selectizewrapper) {
	'use strict';
	let _this = this, jsonObject, showAllGroupsOption;

	return Marionette.LayoutView.extend({
		initialize: function () {
			_this = this;
		}, render: function () {
			jsonObject	= {};
			jsonObject.moduleId	= IVCARGO_RELEASE_UPDATE;
			getJSON(jsonObject, WEB_SERVICE_URL + '/uploadPdfDetailsWS/getDateRangeWiseDocumentDetails.do?', _this.setGroup, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setGroup: function (response) {
			let loadelement = [];
			let baseHtml = $.Deferred();
			loadelement.push(baseHtml);
						
			$("#mainContent").load("/ivcargo/html/master/ivcargoReleaseUpdate.html", function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function () {
				initialiseFocus();
				
				showAllGroupsOption	= response.showAllGroupsOption;
				
				_this.setDetails(response);
			});

			hideLayer();
		}, setDetails : function(response) {
			let corporateAccount	= response.CorporateAccount;
			
			let yearArray = Object.keys(corporateAccount);
			yearArray.sort((a, b) => b - a);
			
			for(const year of yearArray) {
				let monthHM	= corporateAccount[year];
				
				let yearDiv	= $("<div class='yearDiv'>").appendTo("#ElementDiv");
				yearDiv.append("<div class='yearHeader'><h2>" + year + "</h2></div>");
				
				let monthArray = Object.keys(monthHM);
				monthArray.sort((a, b) => a.localeCompare(b));
				
				for(const month of monthArray) {
					let monthDetails = monthHM[month];
					
					let monthDiv	= $("<div class='monthDiv'>").appendTo(yearDiv);
					monthDiv.append("<div class='monthHeader'><h3>" + month + "</h3></div>");
					
					let ul = $("<ol class='documentList'>").appendTo(monthDiv);
					
					for (const document of monthDetails) {
						let li1 = $("<li>").appendTo(ul);
						$("<a href='#' id = 'view_" + document.pdfDetailsId + "' name = " + document.pdfName + "'>" + document.pdfName + "</a>").appendTo(li1);
						li1.append("<span class='documentDate'> (" + document.uploadPdfDateTimeStr + ")</span>");

						if(showAllGroupsOption) {
							$("<a href='#' id = 'delete_" + document.pdfDetailsId + "'> Delete</a>").appendTo(li1);
							$("<input type='hidden' id = 'pdfSummaryId_" + document.pdfDetailsId + "' value='" + document.pdfSummaryId + "'>").appendTo(li1);
						}
						
						$('#view_' + document.pdfDetailsId).click(function() {
							_this.showPdfDetails((this.id).split("_")[1]);
						});
						
						$('#delete_' + document.pdfDetailsId).click(function() {
							_this.deletePdfDetails((this.id).split("_")[1]);
						});
					}
				}
			}
		}, showPdfDetails : function(pdfDetailsId) {
			let jsonObject = {};
			jsonObject.id = pdfDetailsId;
			jsonObject.moduleId	= IVCARGO_RELEASE_UPDATE;
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL + '/uploadPdfDetailsWS/getDownloadPdfDataDetailsById.do?', _this.viewPdf, EXECUTE_WITHOUT_ERROR);
		}, deletePdfDetails : function(pdfDetailsId) {
			let jsonObject = {};
			jsonObject.pdfDetailsIds	= pdfDetailsId;
			jsonObject.pdfSummaryId		= $('#pdfSummaryId_' + pdfDetailsId).val();
			jsonObject.moduleId			= IVCARGO_RELEASE_UPDATE;
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL + '/uploadPdfDetailsWS/deleteUploadedPdfFile.do?', _this.showSuccess, EXECUTE_WITHOUT_ERROR);
		}, viewPdf : function(respone) {
			hideLayer();
			
			let uploadPdfModel	= respone.uploadPdfModel;
			
			if(uploadPdfModel != undefined)
				downloadDocument(uploadPdfModel.pdfFile, uploadPdfModel.pdfName);
		}, showSuccess : function(response) {
			if(response.pdfDocumentDetailsId != undefined) {
				setTimeout(function() {
					location.reload();
				}, 1000)
			}
		}
	});
});
