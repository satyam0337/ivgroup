define(
		[
		 'slickGridWrapper2',
		 '/ivcargo/resources/js/generic/urlparameter.js',
		 'JsonUtility',
		 'messageUtility',
		 'nodvalidation',
		 'focusnavigation',
		 ],//PopulateAutocomplete
		 function(slickGridWrapper2, urlParameter) {
			'use strict';
		let jsonObject = new Object(), _this,branchId=0; 
		return Marionette.LayoutView.extend({
			initialize : function() {
				_this = this;
				branchId 	= urlParameter.getModuleNameFromParam('parentBranchId');
				this.$el.html(this.template);
			}, render : function() {
				jsonObject.parentBranchId = branchId;
				getJSON(jsonObject, WEB_SERVICE_URL	+ '/branchMasterWS/getAllChildBranches.do?', _this.renderElements, EXECUTE_WITHOUT_ERROR);
				return _this;
			}, renderElements: function(response) {
				var loadelement = new Array();
			var baseHtml = new $.Deferred();
			loadelement.push(baseHtml);
				$("#mainContent").load("/ivcargo/html/master/branchMaster/childBranches.html", function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
   				hideLayer();

		    	if (response.CorporateAccount !== undefined) {
		        	slickGridWrapper2.setGrid(response);
		    	}
    		});
		}
	});
});