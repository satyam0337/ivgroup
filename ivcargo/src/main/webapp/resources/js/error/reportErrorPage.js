define([
	'/ivcargo/resources/js/generic/urlparameter.js'
	,'JsonUtility'
	,'messageUtility'
], function (UrlParameter) {
	'use strict';
	let _this = '', tab;

	return Marionette.LayoutView.extend({
		initialize: function () {
			tab = UrlParameter.getModuleNameFromParam(MASTERID);
			_this = this;
		}, render: function () {
			_this.showMessage();
			return _this;
		}, showMessage : function (response) {
			let loadelement = new Array();
			let baseHtml = new $.Deferred();

			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/error/reportErrorPage.html", function () {
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

function openNav() {
	  document.getElementById("mySidenav").style.width = "300px";
	}

	function closeNav() {
	  document.getElementById("mySidenav").style.width = "0";
	}