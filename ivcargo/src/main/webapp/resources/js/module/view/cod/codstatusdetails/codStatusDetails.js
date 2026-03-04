define(
		[
			PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js',
			'slickGridWrapper2',
			'JsonUtility',
			'messageUtility'],
			function(UrlParameter, slickGridWrapper2) {
			'use strict';
			var jsonObject = new Object(),waybillId = "0", _this;

			return Marionette.LayoutView.extend({
				initialize : function() {
					waybillId = UrlParameter.getModuleNameFromParam(MASTERID)
					_this = this;
					this.$el.html(this.template);
				}, render : function() {
					jsonObject.waybillId = waybillId;
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/codStatusDetailsWS/getCODStatusDetails.do?', _this.setPODStatusDetails, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, setPODStatusDetails : function(response) {
					showLayer();

					var loadelement 	= new Array();
					var baseHtml 		= new $.Deferred();

					loadelement.push(baseHtml);

					$("#mainContent").load("/ivcargo/html/module/cod/codStatusDetails/codStatusDetails.html", function() {
						baseHtml.resolve();
					});

					$.when.apply($, loadelement).done(function() {
						if(response.CorporateAccount != undefined) {
							hideAllMessages();
							slickGridWrapper2.setGrid(response);
						}

						hideLayer();
					});
				}
			});
		});