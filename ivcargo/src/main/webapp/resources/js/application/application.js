/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
define([
        //the file which has only name they are are already  been loaded
        'jquery',
        'underscore',
        'backbone',
        'marionette',
        PROJECT_IVUIRESOURCES+'/resources/js/controller/defaultactioncontroller.js',//Controller
        PROJECT_IVUIRESOURCES+'/resources/js/controller/router.js'//Router
        ], function($, _, Backbone,Marionette,Controller,Router){
	'use strict';// this basically give strictness to this specific js

	//new application instance is returned to fetch the view by passing through Router
	//Region specifies the section where there should be manipulations
	var App =  Marionette.Application.extend({
		regions: function() {
			return {
				//region for main body
				//section is present at masterheader.html file section tag
				regionMain: '#mainContent',
			};
		},

		start: function( options ) {
			// Perform the default 'start' functionality
			Marionette.Application.prototype.start.apply( this, [ options ] );     

			// Add routers
			//router would be called from default controller 
			this.Router = new Router({ controller: new Controller() });

			// hashes for internal navigation.  If you want Backbone/Marionette
			// to enforce full URLs use:
			// Backbone.history.start( { pushState: true } );
			Backbone.history.start( );
		}
	});
	return new App();
});
