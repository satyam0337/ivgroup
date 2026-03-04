/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
//Filename: router.js
define(['marionette'],function (Marionette) {
	var Marionette = require( 'marionette' );
	//app router routes 
	var appRouter =  Marionette.AppRouter.extend( {
		appRoutes: {
			//default action would be called in controller in defaultcontroller
			'*actions': 'defaultAction'
		},

		onRoute: function() {
			//append file if you want to apply it on every page
		}
	});
	return appRouter;

});
