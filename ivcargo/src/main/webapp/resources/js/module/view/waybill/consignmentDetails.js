define([ 'marionette'
         ,'/ivcargo/resources/js/generic/urlparameter.js'
		 ,'slickGridWrapper2'
         ,'JsonUtility'
         ,'messageUtility'
         ,'nodvalidation'
		 ,'focusnavigation'
         ],
         function(Marionette, UrlParameter, SlickGridWrapper2) {
	'use strict';// this basically give strictness to this specific js
	let jsonObject	= new Object(),
	wayBillId,
	_this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function() {
			//initialize is the first function called on call new view()
			_this = this;
			wayBillId 				= UrlParameter.getModuleNameFromParam('wayBillId');
			
			jsonObject.waybillId	= wayBillId;
		}, render: function() {
			jsonObject	= new Object();
			
			jsonObject.waybillId	= wayBillId;
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/lRSearchWS/getConsignmentDetailsByWaybillId.do?', _this.setConsignmentDetails, EXECUTE_WITHOUT_ERROR);
		}, setConsignmentDetails : function(response) {
			
			let loadelement 			= new Array();
			let baseHtml 				= new $.Deferred();
			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/module/waybill/consignmentDetails.html",function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				if(response.message != undefined) {
					let errorMessage = response.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					hideLayer();
					setTimeout(() => {
						window.close();
					}, 2000);
					return;
				}
				
				let consignmentSummary		= response.consignmentSummary;
				let lrViewConfigProperty	= response.LrViewConfigProperty;
				
				if(lrViewConfigProperty.InvoiceNo)
					$('#viewConsignmentDetailsDiv').append('<span><b>Invoice No : </b>' + consignmentSummary.consignmentSummaryInvoiceNo + "</span>");
				
				if(lrViewConfigProperty.DeclaredValue)
					$('#viewConsignmentDetailsDiv').append('<span><b>Declared Value : </b>' + consignmentSummary.consignmentSummaryDeclaredValue + "</span>");
				
				if(lrViewConfigProperty.PrivateMark)
					$('#viewConsignmentDetailsDiv').append('<span><b>Private Mark : </b>' + consignmentSummary.consignmentSummaryPrivateMark + "</span>");
				
				if(lrViewConfigProperty.isRiskAllocationAllow)
					$('#viewConsignmentDetailsDiv').append('<span><b>Risk By : </b>' + consignmentSummary.riskAllocationName + "</span>");
				
				if(consignmentSummary.consignmentSummaryCommodityMasterId > 0)
					$('#viewConsignmentDetailsDiv').append('<span><b>Comodity : </b>' + consignmentSummary.consignmentSummaryCommodityName + "</span>");
				
				if(consignmentSummary.cftValue > 0)
					$('#viewConsignmentDetailsDiv').append('<span><b>CFT Value : </b>' + consignmentSummary.cftValue + "</span>");
					
				if(consignmentSummary.cbmValue > 0)
					$('#viewConsignmentDetailsDiv').append('<span><b>CBM Value : </b>' + consignmentSummary.cbmValue + "</span>");
				
				if(consignmentSummary.businessTypeId > 0)
					$('#viewConsignmentDetailsDiv').append('<span><b>Business Type : </b>' + consignmentSummary.businessType + "</span>");
				
				if(consignmentSummary.transportationCategoryId > 0)
					$('#viewConsignmentDetailsDiv').append('<span><b>Transportation Category : </b>' + consignmentSummary.transportationCategoryName + "</span>");
				
				$('#viewArticleDetails1').append('<span style="background-color: #4C98A6; color: #FFF ; text-transform: capitalize; font:arial; border-spacing: 3; "><b>Charge Type : </b>' + consignmentSummary.chargeType + "</span>");
				
				if(response.unitPerRate != "")
					$('#viewArticleDetails1').append('<span><b>' + response.unitPerRate + "</b></span>");
					
				if(consignmentSummary.cftRate > 0)
					$('#viewArticleDetails1').append('<span><b>CFT Rate : </b>' + consignmentSummary.cftRate + "</span>");
					
				if(consignmentSummary.cbmRate > 0)
					$('#viewArticleDetails1').append('<span><b>CBM Rate : </b>' + consignmentSummary.cbmRate + "</span>");
				
				if(lrViewConfigProperty.WeightShowWithoutDecimal) {
					$('#viewArticleDetails1').append('<span><b>Act. Wt : </b>' + Math.round(consignmentSummary.consignmentSummaryActualWeight) + " kg</span>");
					$('#viewArticleDetails1').append('<span><b>Invoice No : </b>' + Math.round(consignmentSummary.consignmentSummaryChargeWeight) + " kg</span>");
				} else if(lrViewConfigProperty.labelChangeCharWtToVolwt) {
					$('#viewArticleDetails1').append('<span><b>Act. Wt : </b>' + consignmentSummary.consignmentSummaryActualWeight + " kg</span>");
					$('#viewArticleDetails1').append('<span><b>Vol. Wt : </b>' + consignmentSummary.consignmentSummaryChargeWeight + " kg</span>");
				} else {
					$('#viewArticleDetails1').append('<span><b>Act. Wt : </b>' + consignmentSummary.consignmentSummaryActualWeight + " kg</span>");
					$('#viewArticleDetails1').append('<span><b>Ch. Wt : </b>' + consignmentSummary.consignmentSummaryChargeWeight + " kg</span>");
				}
				
				$('#viewArticleDetails1').append('<span><b>Amt : </b>' + Math.round(consignmentSummary.consignmentSummaryAmount) + "</span>");
				$('#viewArticleDetails1').append('<span><b>Total Article : </b>' + consignmentSummary.consignmentSummaryQuantity + "</span>");
				
				if(consignmentSummary.distance > 0)
					$('#viewArticleDetails1').append('<span><b>Distance : </b>' + consignmentSummary.distance + "</span>");
				
				$('#viewArticleDetails').append('<br><br>');
				
				hideLayer();
				SlickGridWrapper2.setGrid(response);
			});
		}
	});
});