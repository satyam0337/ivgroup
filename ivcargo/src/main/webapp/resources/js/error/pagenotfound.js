/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
			module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
			modules module1Obj and module2Obj are now available for use.
		});
	});
 */
define([
		'jquery',
		'underscore',
		'backbone',
		'text!'+PROJECT_IVVIEWPAGES+'/html/error/404error.html'
		], function($, _, Backbone,PageNotFoundTemplate){
	let PageNotFoundView = Marionette.ItemView.extend({
		initialize: function() {
			this.render()
		}, render: function() {
			this.$el.html(PageNotFoundTemplate);
		}
	});

	return PageNotFoundView;

});
