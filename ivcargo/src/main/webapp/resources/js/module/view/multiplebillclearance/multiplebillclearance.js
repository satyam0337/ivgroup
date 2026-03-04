define(
		[
			PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js',
			'JsonUtility',
			'messageUtility',
			'focusnavigation',
			'autocomplete',
			'autocompleteWrapper',
			PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
			'/ivcargo/resources/js/module/redirectAfterUpdate.js',
			'/ivcargo/resources/js/module/view/multiplebillclearance/setupmultiplebillclearancedetails.js?v=1.0'
			], function(UrlParameter) {
			'use strict';
			let jsonObject = new Object()
			,billIds = 0
			,typeOfSelection = 0
			,partialBillId
			,partialBillAmt
			,  _this;

			return Marionette.LayoutView.extend({
				initialize : function() {
					billIds 		= UrlParameter.getModuleNameFromParam('billIds');
					typeOfSelection = UrlParameter.getModuleNameFromParam('typeOfSelection');
					partialBillId 	= UrlParameter.getModuleNameFromParam('partialBillId');
					partialBillAmt 	= UrlParameter.getModuleNameFromParam('partialBillAmt');

					_this = this;
					this.$el.html(this.template);
				}, render : function() {
					jsonObject.billIds 			= billIds;

					getJSON(jsonObject, WEB_SERVICE_URL	+ '/billClearanceWS/getBillDetailsForBillClearanceByBillIds.do?', _this.setMultipleBillClearnaceElement, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, setMultipleBillClearnaceElement : function(response) {
					let loadelement = new Array();
					let baseHtml 	= new $.Deferred();

					loadelement.push(baseHtml);

					$("#mainContent").load("/ivcargo/html/module/multiplebillclearance/multipleBillClearance.html",function() {
						baseHtml.resolve();
					});

					$.when.apply($, loadelement).done(function() {
						if(partialBillId != undefined && partialBillId != null && partialBillId > 0){
							response.partialBillId	= partialBillId;
							response.partialBillAmt	= partialBillAmt;
						} else {
							response.partialBillId	= 0;
							response.partialBillAmt	= 0;
						}
						
						setupMultipleBillClearanceDetails(typeOfSelection, response);
						
						if(response.allowManualMrNumber) {
							$("#mrLabel").css('display','inline');
							$("#mrNumber").css('display','inline');
						} else {
							$("#mrLabel").css('display','none');
							$("#mrNumber").css('display','none');
						}
						
						hideLayer();
					});
				}
			});
		});