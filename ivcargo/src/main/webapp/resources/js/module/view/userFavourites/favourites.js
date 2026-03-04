	// Favorites dynamic loading using Marionette & RequireJS

		define([
			'JsonUtility',
			'messageUtility',
			'nodvalidation',
			PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
			'focusnavigation'
		], function() {
			'use strict';
			let jsonObject = new Object(), myNod, _this = '';

			return Marionette.LayoutView.extend({
				initialize: function() {
					_this = this;
				},

				render: function() {
					showLayer();
					// Load favorites dynamically
					getJSON(jsonObject, WEB_SERVICE_URL + '/favouritesWS/getFavouritesElementConfiguration.do?', _this.getElementConfigDetails, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, getElementConfigDetails: function(response) {
					let loadelement = new Array();
					let baseHtml = new $.Deferred();

					loadelement.push(baseHtml);

					$("#mainContent").load("/ivcargo/html/userFavourites/favourites.html", function() {
						baseHtml.resolve();
					});

					$.when.apply($, loadelement).done(function() {
						initialiseFocus();

						if (response && response.data && response.data.length > 0) {
							hideLayer();
							response.data.forEach(function(fav) {
								let button = '<button type="button" id="bfi_' + fav.businessFunctionId + '" class="btn btn-info" data-mdb-ripple-init>' + fav.displayName + '</button>';
								$(".container").append(button);
								
								$('#bfi_' + fav.businessFunctionId).bind('click', function() {
									window.open(fav.url, '_blank');
								});
							});
						} else {
							hideLayer();
							$(".container").append("<em>No favourites found</em>");
						}
					});
				}
			});
		});