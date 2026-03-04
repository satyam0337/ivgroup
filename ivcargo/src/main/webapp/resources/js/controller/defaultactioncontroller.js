/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
			module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
			modules module1Obj and module2Obj are now available for use.
		});
	});
 */
define([
		//the file which has only name they are are already  been loaded
		'marionette',
		PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js',
		PROJECT_IVUIRESOURCES+'/resources/js/controller/viewmapping.js',
		//PROJECT_IVUIRESOURCES+'/resources/js/error/error.js',
	], function(Marionette, UrlParameter) {

	//Controller decides which view should be rendered
	return Marionette.Controller.extend( {
		//Default action is set to whichever may be the hit comes directly
		initialize : function() {
			$("*[data-loggedIn='Name']").html(localStorage.getItem("currentCorporateAccountName"));
		}, defaultAction : function() {
			try {
				require( [PROJECT_IVUIRESOURCES+'/resources/js/application/application.js'], function(AppInstance) {

					//ModuleName method gets module name which needs to be fetched from parameter
					//MODULENAME is present as constant in constant.js
					let viewURL = getMapping(UrlParameter.getModuleNameFromParam(MODULENAME), PROJECT_IVUIRESOURCES+'/resources/js/error/pagenotfound.js');

					//get mapping method is present in viewmapping.js to send the current href key 
					//in masterheaderhtml and fetch the URL of the module
					if(viewURL != null && viewURL != '' && viewURL != undefined) {
						require([
							// Load module and pass it to definition function
							viewURL
						], function(View){
							// Initialise to execute Initialize function of the URL loaded JS
							let view = new View();
							// update the main section which is fetched from url found in the viewmapping.js
							AppInstance.regionMain.show( view );

							//URL modified to hide all parameters 
							new Marionette.AppRouter({});
							//MyRouter.navigate('#');
							//used to hide the tooltip present in elementfocusnavigation.js
							showLayer();
							try {
								hideTooltip();
							} catch(err) {
								console.log('hide tooltip not found');
							}
						});
					}
				});
				//current url which gives the href url value which is present in masterheaderhtml 
			} catch (e) {
				console.log('error : '+e)
				showMessage('')
			};
		}
	} );
} );