define(['marionette'
	, '/ivcargo/resources/js/generic/urlparameter.js'
	, 'nodvalidation'
	, PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	, 'JsonUtility'
	, 'messageUtility'
	, 'focusnavigation'
],
	function(Marionette, UrlParameter) {
		'use strict';// this basically give strictness to this specific js
		let jsonObject = new Object(), wayBillId,
			_this = '';
		//this is used to get the access of key in onRender because this keyword is not found in onRender function
		return Marionette.LayoutView.extend({
			initialize: function() {
				//initialize is the first function called on call new view()
				_this = this;
				wayBillId = UrlParameter.getModuleNameFromParam('masterid');
				jsonObject.waybillId = wayBillId;
			}, render: function() {
				jsonObject = new Object();
				jsonObject.waybillId = wayBillId;

				getJSON(jsonObject, WEB_SERVICE_URL + '/updateLRInvoiceDetailsWS/getPreviousInvoiceDetailsToUpdate.do?', _this.setPolicyDetails, EXECUTE_WITH_ERROR);
			}, setPolicyDetails: function(response) {
				let loadelement = new Array();
				let baseHtml = new $.Deferred();

				loadelement.push(baseHtml);
				
				$("#mainContent").load("/ivcargo/html/module/waybill/viewPolicyNumber/viewPolicyNumber.html", function() {
					baseHtml.resolve();
				});

				$.when.apply($, loadelement).done(function() {
					initialiseFocus();

					if (response.message != undefined) {
						hideLayer();
					}

					hideLayer();

					$('#reportData1 thead').empty();
					$('#reportData1 tbody').empty();

					_this.setPolicyDetailsTableDetails(response);
				});
			}, setPolicyDetailsTableDetails: function(response) {
				let columnArray = new Array();
				columnArray.push("<th style='width: 6%;text-align: center'>Sr No.</th>");
				columnArray.push("<th style='width: 15%;text-align: center'>Policy Number</th>");

				$('#reportData1 thead').append('<tr class="bg-primary text-center">' + columnArray.join(' ') + '</tr>');

				let invoiceDetailsArrList = response.invoiceDetailsArr;

				if (invoiceDetailsArrList != undefined && invoiceDetailsArrList.length > 0) {
					$('#top-border-boxshadow').removeClass('hide');
					columnArray = new Array();

					for (let i = 0; i < invoiceDetailsArrList.length; i++) {
						let obj = invoiceDetailsArrList[i];
						columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;''>" + (i + 1) + "</td>");
						columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'><span>" + obj.policyNumber + "</span></td>");
						$('#reportData1 tbody').append('<tr>' + columnArray.join(' ') + '</tr>');

						columnArray = [];
					}
				}
			}
		});
	})
