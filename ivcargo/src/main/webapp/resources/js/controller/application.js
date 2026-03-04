//Filename: router.js
define(['marionette'
        ,'backbone'
        ,'js/application/layout/AdminLTE.js'
        ,'js/application/controller/router.js'
        ,'error']
		,function(Marionette,Backbone,AdminLTE,Router,error) {

	var App = Marionette.Application.extend({
		region: '#mainContent',

		initialize: function(options) {
			AdminLTE.initilizeAdminLTE();
			Mobile.load();
			initializeError();
		},onBeforeStart: function(options) {

		},onStart: function(options) {
			new Router();
			Backbone.history.start();
		}
	});
	return new App();
});
