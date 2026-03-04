define([
	'JsonUtility'
	,'messageUtility'
], function () {
	'use strict';
	let jsonObject = new Object(), _this = '';

	return Marionette.LayoutView.extend({
		initialize: function () {
			_this = this;
		}, render: function () {
			_this.showMessage();
			return _this;
		}, showMessage : function (response) {
			let loadelement = new Array();
			let baseHtml = new $.Deferred();

			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/error/errorPage.html", function () {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function () {
				let errorMessage	= localStorage.getItem('errorMessage');
				
				if(errorMessage == null || errorMessage == undefined)
					$('#results').html(iconForErrMsg + ' Sorry this is dead page !');
				else {
					$('#results').html(errorMessage);
					localStorage.removeItem('errorMessage');
				}
				
				hideLayer();
			});
		}
	});
});