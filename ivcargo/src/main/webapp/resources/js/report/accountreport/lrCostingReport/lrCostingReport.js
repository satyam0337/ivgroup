let areaSelectedByAutocomplete = {}

define([
	'slickGridWrapper2'
	, PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js'
	, 'JsonUtility'
	, 'messageUtility'
	, 'nodvalidation'
	, PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	, 'focusnavigation'//import in require.config
], function(slickGridWrapper2, Selection) {
	'use strict';
	let jsonObject = new Object(), _this = '',showMaxRows, lastIsSummary = false;
	return Marionette.LayoutView.extend({
		initialize: function() {
			_this = this;
		}, render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/report/lrCostingReportWS/getLRCostingReporElementConfiguration.do?', _this.getElementConfigDetails, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, getElementConfigDetails: function(response) {
			let loadelement = new Array();
			let baseHtml = new $.Deferred();

			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/report/accountreport/lrCostingReport/LrCostingReport.html", function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				$("*[data-selector=header]").html(response.reportName);
				let keyObject = Object.keys(response);

				for (const element of keyObject) {
					if (response[element])
						$("*[data-attribute=" + element + "]").removeClass("hide");
				}

				let elementConfiguration = new Object();

				elementConfiguration.dateElement			= $('#dateEle');
				elementConfiguration.unifiedAreaElement		= $('#fromAreaEle');
				elementConfiguration.unifiedToAreaElement	= $('#toAreaEle');
				
				response.elementConfiguration = elementConfiguration;
				
				response.isCalenderSelection = true;
				
				showMaxRows = response.showMaxRows 
				
				Selection.setSelectionToGetData(response);
				
				hideLayer();

				$("#findBtn").click(function () {
					hideAllMessages();

					if (!_this.validateFields()) return;

					lastIsSummary = false;
					_this.onSubmit(false, lastIsSummary);
				});

				$("#showSummary").click(function() {
					if (!_this.validateFields()) return;

					lastIsSummary = true;
					_this.onSubmit(false, lastIsSummary);
				});
				
				$("#downloadCsv").click(function() {
					if (!_this.validateFields()) return;
						
					_this.onSubmit(true, lastIsSummary);
				});

				$('#fromPercent, #toPercent').on('input', function () {
					let value = this.value;
					value = value.replace(/[^0-9]/g, '');
					value = value.slice(0, 6);
					this.value = value;
				});

				$('#profitType').on('change', function () {
					$('.red-border').removeClass('red-border');
					hideAllMessages();

					if ($(this).val()) {
						$('#profitRangeRow').show();
						setTimeout(function () {
							$('#fromPercent').focus();
						}, 0);
					} else {
						$('#profitRangeRow').hide();
						$('#fromPercent').val('');
						$('#toPercent').val('');

						$(this).addClass('red-border');
						showAlertMessage('error', 'Please select Profit Type');
					}
				});
			});
		}, validateFields : function() {
			if (!validateAreaMandatory('fromAreaEle', 'From')) return false;
			if (!validateAreaMandatory('toAreaEle', 'To')) return false;
			if (!validateProfitRange()) return false;
			
			return true;
		}, onSubmit: function(isCsv, isSummary) {
			let jsonObject = Selection.getElementData();
			let fromText = $('#fromAreaEle').val();
			let toText	 = $('#toAreaEle').val();

			let fromType = extractTypeFromText(fromText);
			let toType	 = extractTypeFromText(toText);

			let fromId = $('#fromAreaEle_primary_key').val();
			let toId   = $('#toAreaEle_primary_key').val();
			
			let profitType = $('#profitType').val();
			let fromPercent = $('#fromPercent').val();
			let toPercent = $('#toPercent').val();
			
			jsonObject.fromType = fromType;
			if (fromType === 'R') jsonObject.regionId = fromId;
			else if (fromType === 'S') jsonObject.subRegionId = fromId;
			else if (fromType === 'B') jsonObject.sourceBranchId = fromId;
		
			jsonObject.toType = toType;
			if (toType === 'R') jsonObject.destinationRegionId = toId;
			else if (toType === 'S') jsonObject.destinationSubRegionId = toId;
			else if (toType === 'B') jsonObject.destinationBranchId = toId;

			jsonObject["isExcel"] = isCsv;
			jsonObject["isSummary"] = isSummary;
			jsonObject.profitType = profitType;

			 if (profitType === 'L') {
				jsonObject.fromPercent = toPercent && toPercent !== '0' ? -toPercent : 0.01;
				jsonObject.toPercent = fromPercent && fromPercent !== '0' ? -fromPercent : 0.01;
			} else {
				jsonObject.fromPercent = fromPercent ? Math.abs(fromPercent) : null;
				jsonObject.toPercent   = toPercent ? Math.abs(toPercent) : null;
			}

			showLayer();

			getJSON(jsonObject, WEB_SERVICE_URL +'/report/lrCostingReportWS/getLRCostingReportDetails.do', isCsv ? _this.downLoadExcel : _this.setReportData, EXECUTE_WITH_ERROR);
		}, setReportData: function(response) {
			hideLayer();
			if (response.message != undefined) {
				$('#bottom-border-boxshadow').addClass('hide');
				return;
			}
			
			const rows = response.CorporateAccount || [];
			
			if (rows.length > showMaxRows) {
				hideAllMessages();
				$('#bottom-border-boxshadow').addClass('hide');
				$('#csvDownloadBtn').removeClass('hide');
				showAlertMessage('error', 'More Than ' + showMaxRows + ' records found. Please download CSV.');
				window.largeCSVData = rows;
				return;
			}

			if (response.CorporateAccount != undefined) {
				$('#bottom-border-boxshadow').removeClass('hide');
				$('#csvDownloadBtn').addClass('hide');	
				hideAllMessages();

				if(response.isSummary)
					response.tableProperties.ShowGrouping = false;
			
				response.tableProperties.showLrViewForGroupedLr = true;
				slickGridWrapper2.setGrid(response);
			}
		}, downLoadExcel: function(data) {
			let errorMessage = data.message;

			if (errorMessage.messageId == 21 || errorMessage.messageId == 491) {
				hideLayer();
				return false;
			}

			let otherContent = data.otherContent;

			if (otherContent != undefined && otherContent != null)
				$('#downloadLink').html(otherContent);

			hideLayer();
		}

	})
});

function extractTypeFromText(text) {
	if (!text) return '';

	if (text === 'ALL') return 'ALL';

	let match = text.match(/\((R|S|B)\)$/);
	return match ? match[1] : '';
}

function validateArea(eleId, label) {
	let text = $('#' + eleId).val().trim();
	let id	 = $('#' + eleId + '_primary_key').val();

	if (!text) return true;
		
	if (text === 'ALL' || id) {
		clearError();
		return true;
	}

	showError();
	return false;

	function showError() {
		$('#' + eleId).addClass('red-border');
		showAlertMessage('error', 'Please select proper ' + label + ' field');
	}

	function clearError() {
		$('#' + eleId).removeClass('red-border');
		hideAllMessages();
	}
}

function validateAreaMandatory(eleId, label) {
	let text = $('#' + eleId).val().trim();

	if (!text) {
		$('#' + eleId).addClass('red-border');
		showAlertMessage('error', 'Please select ' + label);
		return false;
	}
	
	let profitType = $('#profitType').val();

	if (!profitType) {
		$('#profitType').addClass('red-border');
		showAlertMessage('error', 'Please select Profit Type');
		return false;
	}
	
	$('#profitType').removeClass('red-border');

	return validateArea(eleId, label);
}

function validateProfitRange() {
	let profitType	= $('#profitType').val();
	let fromPercent = $('#fromPercent').val();
	let toPercent	= $('#toPercent').val();

	if (!profitType) return false;

	if (!fromPercent || !toPercent) {
		markError('Please enter both From % and To %');
		return false;
	}

	fromPercent = Number(fromPercent);
	toPercent	= Number(toPercent);

	if (isNaN(fromPercent) || isNaN(toPercent)) {
		markError('Profit % must be numeric');
		return false;
	}
	
	if (fromPercent > toPercent) {
		markError('From % cannot be greater than To %');
		return false;
	}
	
	clearError();
	return true;

	function markError(msg) {
		$('#fromPercent, #toPercent').addClass('red-border');
		showAlertMessage('error', msg);
	}

	function clearError() {
		$('#fromPercent, #toPercent').removeClass('red-border');
	}
}