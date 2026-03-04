/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
define([
        PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/dispatchfilepath.js'
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/loaddispatchmodelurls.js'
        ,'language'//import in require.config
        ,'slickGridWrapper'
        ,'errorshow'
        ,'JsonUtility'
        ,'messageUtility'
        ,'elementmodel'
        ,PROJECT_IVUIRESOURCES+'/resources/js/application/application.js'
        ], function (FilePath,ModelUrls,Language,slickGridWrapper,errorshow,JsonUtility,MessageUtility,ElementModel,App) {
	'use strict';// this basically give strictness to this specific js
	var 
	_this = '',
	filterConfiguration = new Object(),
	columnHiddenConfiguration,
	columnHeaderJsonArr,
	responseData,
	LangKeySet,
	columnHeaderArr,
	jsonObject;
	return Marionette.LayoutView.extend({
		regions: {//region is given to provide on which element we have to show the elements
			ElementDivRegion: "#ElementDiv",
		},
		initialize: function(jsonObjectData){
			//initialize is the first function called on call new view()
			//append template first 
			//the html would be set in the el element
			//this object is not found in other function so _this has been created
			_this = this;

			jsonObject = jsonObjectData;

		},render: function(){
			showLayer();
			
			
		}
	});
});

