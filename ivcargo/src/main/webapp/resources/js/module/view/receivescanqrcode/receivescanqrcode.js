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
        ,'constant' //Constant
        //constant for project name and domain urls
        ,'text!'+PROJECT_IVUIRESOURCES+'/template/scanbarcode/scanbarcode.html'//Elements
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/receivescanqrcode/receiveqrcodebehavior.js'
        ,'jquerylingua'
        ,'language'//import in require.config
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/receivescanqrcode/receivescanqrcodefilepath.js'
        ,PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
        ], function(Marionette,Constant,Template,QRCodeBehavior,jquerylingua,language,FilePath,UrlParameter){


	var myNod,
	_this;
	// to know about layout refer url:http://marionettejs.com/docs/v1.8.7/marionette.layout.html
	return Marionette.LayoutView.extend({
		template: _.template(Template),//this is used to set the static layout and _.template is present in underscore.js
		initialize: function(){
			//initialize is the first function called on call new view()
			//append template first 
			//the html would be set in the el element 
			_this = this;
			this.$el.html(this.template);
			window.Page = window.Page || {};
			hideLayer();
		},onShow:function(){
			setTimeout(function(){hideLayer();
			var langObj = FilePath.loadLanguage();
			LangKeySet = loadLanguageWithParams(langObj);
			
			var ReceivedLedgerId = UrlParameter.getModuleNameFromParam("RECEIVEDLEDGERID");
			if(ReceivedLedgerId != null){
				showMessage('success','Successfully Received');
			}
			},10);
			var behav = new QRCodeBehavior; 
			behav.onPlay();
			
		},triggers: {
			'click #play': 'play',
			'click #pause': 'pause',
			'click #stop': 'stop',
			'click #grab-img': 'grabImage',
			'click #receiveBtn': 'receiveLR'
		},behaviors: {
			QRCodeBehavior: {
				behaviorClass: QRCodeBehavior
			}
		}
	});
});
