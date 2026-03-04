//Filename: router.js
define(['marionette'
        ,'backbone'
        ,'resources/js/application/controller/router.js'
        ]
		,function(Marionette,Backbone,Router) {

	var App = Marionette.Application.extend({
		region: '#mainContent',

		initialize: function(options) {
			//initializeError();
			console.log('init');
		},onBeforeStart: function(options) {

		},onStart: function(options) {
			console.log('started')
			new Router();
			Backbone.history.start();
		}
	});
	return new App();
});
