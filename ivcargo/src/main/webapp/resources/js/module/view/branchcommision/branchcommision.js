/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
define([
        //the file which has only name they are are already  been loaded
        'marionette'//Marionette
        //marionette JS framework
        //constant for project name and domain urls
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/branchcommision/branchcommisionelements.js'//Elements
        //this is called to get the elements
        ,'text!'+PROJECT_IVVIEWPAGES+'/template/pagetemplate.html'//Template
        //text! is used to convert the html to plain text which helps to fetch HTML through require
        //Master Template is used to get standard Layout of master pages
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/branchcommision/branchcommisionbehavior.js'
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/actionbutton/actionbuttonview.js'//,AcctionbuttonView
        ], function(Marionette,Elements,Template,SearchBehavior,AcctionbuttonView){

	'use strict';// this basically give strictness to this specific js 
	var myNod;
	// to know about layout refer url:http://marionettejs.com/docs/v1.8.7/marionette.layout.html
	return Marionette.LayoutView.extend({
		template: _.template(Template),//this is used to set the static layout and _.template is present in underscore.js
		regions: {//region is given to provide on which element we have to show the elements
			ElementDivRegion: "#ElementDiv",
				//key is custom and : value is the element id or value as per the jquery standards
			ActionDivRegion: "#ActionButton"
		},
		initialize: function(){
			//initialize is the first function called on call new view()
			//append template first 
			//the html would be set in the el element 
			this.$el.html(this.template);
		},
		onShow: function(){
			// on show function is triggered when this view is displayed on user's machine browser
			//show tabs in master tab div region
			this.ElementDivRegion.show(new Elements());
			this.ActionDivRegion.show(new AcctionbuttonView())
		},triggers: {
			"click #searchBtn": "save"
		},
		behaviors: {
			SearchBehavior: {
				behaviorClass: SearchBehavior,
				fieldSelector: "#mainContent :input"
			}
		},
	});
});