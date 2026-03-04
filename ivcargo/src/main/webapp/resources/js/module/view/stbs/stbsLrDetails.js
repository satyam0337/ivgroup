var shortCreditCollLedgerNumber;
define(['marionette'
	, '/ivcargo/resources/js/generic/urlparameter.js'
	, 'slickGridWrapper2'
	, 'nodvalidation'
	, 'autocomplete'
	, 'autocompleteWrapper'
	, PROJECT_IVUIRESOURCES + '/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
	, PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	, '/ivcargo/resources/js/validation/regexvalidation.js'
	, 'JsonUtility'
	, 'messageUtility'
	, 'focusnavigation'
],
	function(Marionette, UrlParameter, AutoComplete, AutoCompleteWrapper) {
		'use strict';// this basically give strictness to this specific js
		var jsonObject = new Object(), myNod,
			_this = '';
		//this is used to get the access of key in onRender because this keyword is not found in onRender function
		return Marionette.LayoutView.extend({
			initialize: function() {
				//initialize is the first function called on call new view()
				_this = this;
				shortCreditCollLedgerNumber = UrlParameter.getModuleNameFromParam('shortCreditCollLedgerNumber');
				jsonObject.shortCreditCollnLedgerId = shortCreditCollLedgerNumber;
			}, render: function() {
				jsonObject = new Object();
				jsonObject.shortCreditCollLedgerNumber = shortCreditCollLedgerNumber;

				getJSON(jsonObject, WEB_SERVICE_URL + '/stbsWS/getShortCreditCollSummeryDetails.do?', _this.setStbsDetails, EXECUTE_WITHOUT_ERROR);

				//getJSON(jsonObject, WEB_SERVICE_URL + '/partyWiseLedgerAccountReportWS/getShortCreditLedgerData.do?', _this.setStbsDetails, EXECUTE_WITHOUT_ERROR);
			}, setStbsDetails: function(response) {
				var loadelement = new Array();
				var baseHtml = new $.Deferred();

				loadelement.push(baseHtml);

				$("#mainContent").load("/ivcargo/html/module/stbs/stbsLrDetails.html", function() {
					baseHtml.resolve();
				});

				$.when.apply($, loadelement).done(function() {
					initialiseFocus();

					if (response.message != undefined) {
						var errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						hideLayer();

					}


					hideLayer();

					$('#bottom-border-boxshadow').removeClass('hide');
					$('#reportData1 tbody').empty();

					_this.setStbsSummeryDetails(response);
				});
			}, setStbsSummeryDetails: function(response) {
				var columnArray = [];

				columnArray.push("<th style='width: 6%; text-align: center;'>Sr No.</th>");
				columnArray.push("<th style='width: 15%; text-align: center;'>STBS Number</th>");
				columnArray.push("<th style='width: 15%; text-align: center;'>Amount</th>");

				$('#reportData1 thead').append('<tr class="bg-primary text-center">' + columnArray.join('') + '</tr>');

				columnArray = [];

				var shortCreditCollectionSummaryList = response.shortCreditSummaryArrList;

				if (shortCreditCollectionSummaryList != undefined && shortCreditCollectionSummaryList.length > 0) {

					for (var i = 0; i < shortCreditCollectionSummaryList.length; i++) {
						var obj = shortCreditCollectionSummaryList[i];

						columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size: 15px;'>" + (i + 1) + "</td>");
						columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size: 15px;'>" + (obj.wayBillNumber || '') + "</td>");
						columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size: 15px;'>" + (obj.wayBillGrandTotal) + "</td>");

						$('#reportData1 tbody').append('<tr>' + columnArray.join('') + '</tr>');
						columnArray = [];
					}
				} else {
					$('#reportData1 tbody').append("<tr><td colspan='3' style='text-align:center;'>No records found</td></tr>");
				}
			}

		});
	})
