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
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dmmwithqrcodescan/ddmqrcodebehavior.js'
        ,'jquerylingua'
        ,'language'//import in require.config
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dmmwithqrcodescan/ddmscanqrcodefilepath.js'
        ,PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
        ], function(Marionette,Constant,Template,QRCodeBehavior,jquerylingua,language,FilePath,UrlParameter){
	var myNod = new Object(),
	_this, isAllowSearch = false;
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
			LangKeySet 	= loadLanguageWithParams(langObj);
			var deliveryRunSheetLedgerId 	= UrlParameter.getModuleNameFromParam("DeliveryRunSheetLedgerId");
			var ddmNumber 					= UrlParameter.getModuleNameFromParam("DDMNumber");
			
			if(deliveryRunSheetLedgerId != null) {
				showMessage('success', '<i class="fa fa-check"></i> DDM Number <font size="5" color="red">' + ddmNumber + '</font> created successfully');
				_this.showPrint(deliveryRunSheetLedgerId, ddmNumber, false);
				$("#previousDDMstring").html('&emsp;<b>Previous DDM No:</b> ' + '<a style="cursor:pointer;" onclick=showPrint(' + deliveryRunSheetLedgerId + ',' + ddmNumber + ',' + true + ')>' + ddmNumber + '</a>');
			}
			},10);
			myNod = nod();
			
			myNod.add({
				selector		: '#singleLRSearchEle',
				validate		: 'presence',
				errorMessage	: 'Enter Proper LR Number !'
			});
			
			$("#singleLRSearchEle").on("input", function() {
				isAllowSearch = false;
				let value = $(this).val().trim();
				
				if (value.length > 6 && value.includes('~')){
					clearTimeout($(this).data("scanTimeout"));

					let tOut = setTimeout(function() {
						if (myNod.areAll('valid')) {
							isAllowSearch = true;
							_this.searchLRByNumber();
						}
					}, 500);
					
					$(this).data("scanTimeout", tOut);
				}
			});
			
			$("#singleLRSearchEle").keydown(function(e) {
				let value = $(this).val().trim();

				if(e.keyCode === $.ui.keyCode.ENTER) {
					if (value.includes("~")) {
						e.preventDefault();
						return;
					}
					_this.searchLRByNumber(e);
				}
			});
			
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
		},showPrint:function(deliveryRunSheetLedgerId,ddmNumber,reprint){
			showPrint(deliveryRunSheetLedgerId,ddmNumber,reprint);
		}, searchLRByNumber: function(e) {
			if (!myNod.areAll('valid')) return;

			var codeBehavior = new QRCodeBehavior();

			if (e && (e.which === $.ui.keyCode.ENTER || e.keyCode === $.ui.keyCode.ENTER)) {
				showLayer();
				codeBehavior.searchLRByNumber();
			} else if (!e && isAllowSearch) {
				showLayer();
				codeBehavior.processScannedResult($('#singleLRSearchEle').val());
			}
		}
	});
});
function showPrint(deliveryRunSheetLedgerId,ddmNumber,reprint){
	var newwindow=window.open('DDMView.do?pageId=304&eventId=5&deliveryRunSheetLedgerId='+deliveryRunSheetLedgerId+'&isReprint='+reprint, '_blank', 'height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}