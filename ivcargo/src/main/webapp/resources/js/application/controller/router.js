//Filename: router.js
define(['marionette'
        ,'resources/js/application/controller/appcontroller.js'],
        function(Marionette,Controller) {
	return Marionette.AppRouter.extend({
		controller : new Controller()
		,appRoutes : {
			'dispatch':'dispatch'
		}
		,onRoute : function() {
			// append file if you want to apply it on every page
		}
	});
});
