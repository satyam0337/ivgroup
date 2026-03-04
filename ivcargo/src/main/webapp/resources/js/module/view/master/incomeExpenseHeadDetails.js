define([
	'JsonUtility',
	'messageUtility',
	'jquerylingua',
	'language',
	PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
	PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'],
	function(JsonUtility, MessageUtility, Lingua, Language, BootstrapModal, UrlParameter) {
	'use strict'; 
	var incExpType = 0, chargeType = 0, regionId = 0, subRegionId = 0, _this;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
			incExpType 	= UrlParameter.getModuleNameFromParam("incExpType");
			chargeType	= UrlParameter.getModuleNameFromParam("chargeType");
			regionId 	= UrlParameter.getModuleNameFromParam("regionId");
			subRegionId	= UrlParameter.getModuleNameFromParam("subRegionId");
			this.$el.html(this.template);
		}, render : function() {
			var object		= new Object();
			object.incExpType	= incExpType;
			object.chargeType	= chargeType;
			object.regionId		= regionId;
			object.subRegionId	= subRegionId;
			getJSON(object, WEB_SERVICE_URL	+ '/incomeExpenseChargeMasterWS/getAllHeads.do?', _this.setDetails, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setDetails: function(response) {
			if (response.message != undefined) {
				hideLayer();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				setTimeout(function(){ window.close(); }, 1000);
				return;
			}
			
			var jsonObject 		= new Object();
			var loadelement 	= new Array();
			var baseHtml 		= new $.Deferred();
			loadelement.push(baseHtml);
		
			$("#mainContent").load("/ivcargo/html/module/incomeexpensechargesmaster/IncomeExpenseChargesAllHeads.html",
					function() {
						baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				$("*[data-selector='header'").html(response.headName);
				
				var incomeexpenseHeadsArr	= response.incomeexpenseHeadsArr;
				
				var columnArray		= new Array();
				
				for (var i = 0; i < incomeexpenseHeadsArr.length; i++) {
					var obj		= incomeexpenseHeadsArr[i];
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i + 1) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.chargeName + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.chargeDescription + "</td>");
					$('#reportTable tbody').append('<tr id="incomeExpenseChargeDetails_'+ obj.incomeExpenseChargeMasterId +'">' + columnArray.join(' ') + '</tr>');
					
					columnArray	= [];
				}
				
				hideLayer();
			});
		}
	});
});