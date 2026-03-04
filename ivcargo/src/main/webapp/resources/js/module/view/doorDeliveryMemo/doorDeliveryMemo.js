define([
         'marionette'
        ,'text!'+PROJECT_IVUIRESOURCES+'/template/doorDeliveryMemo/DoorDeliveryMemo.html'//Elements
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/doorDeliveryMemo/doorDeliveryMemobehavior.js'
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/doorDeliveryMemo/doorDeliveryMemoFilePath.js'
        ,PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/doorDeliveryMemo/pendingLrForDoorDeliveryMemo.js'
        ,'constant'
        ,'selectizewrapper'
        ,'jquerylingua'
        ,'language'
        ,'nodvalidation'
        ], function(Marionette, Template, DDM, FilePath, UrlParameter, PendingLrForDDM){
	let myNod,
	_this;
	return Marionette.LayoutView.extend({
		template: _.template(Template),
		initialize: function(){
			showLayer();
			_this = this;
			this.$el.html(this.template);
			window.Page = window.Page || {};
		}, onShow : function() {
			setTimeout(function(){
				hideLayer();
				var langObj 					= FilePath.loadLanguage();
				LangKeySet 						= loadLanguageWithParams(langObj);
				var deliveryRunSheetLedgerId 	= UrlParameter.getModuleNameFromParam("DeliveryRunSheetLedgerId");
				var ddmNumber 					= UrlParameter.getModuleNameFromParam("DDMNumber");
				
				if(deliveryRunSheetLedgerId != null){
					showMessage('success','<i class="fa fa-check"></i> DDM Number ' + ddmNumber + ' created successfully')
					_this.showPrint(deliveryRunSheetLedgerId,ddmNumber,false);
					$("#previousDDMstring").html('&emsp;<b>Previous DDM No:</b> '+'<a onclick=showPrint('+deliveryRunSheetLedgerId+','+ddmNumber+','+true+')>'+ddmNumber+'</a>')
				}
			},10);
			$('#deliveryFor').selectize({});
			myNod = nod();
			myNod.configure({
				parentClass:'validation-message'
			});
			myNod.add({
				selector		: '#singleLRSearchEle',
				validate		: 'presence',
				errorMessage	: 'Enter Proper LR Number !'
			});
			var behav = new DDM; 
			behav.initializeDDM();
		},behaviors: {
			DDM: {
				behaviorClass: DDM
			}
		}, showPrint : function(deliveryRunSheetLedgerId, ddmNumber, reprint) {
			showPrint(deliveryRunSheetLedgerId, ddmNumber, reprint);
		}, events: {
			"keydown #singleLRSearchEle"	: 	"searchLRByNumber"
		},searchLRByNumber:function(e){
			if(e.which == $.ui.keyCode.ENTER||e.keyCode == $.ui.keyCode.ENTER){
				if(myNod.areAll('valid')){
					showLayer();
					var pendingDDM 	= new PendingLrForDDM();
					pendingDDM.searchLRByNumber();
				}
			}
		}
	});
});
function showPrint(deliveryRunSheetLedgerId,ddmNumber,reprint){
	var newwindow=window.open('DDMView.do?pageId=304&eventId=5&deliveryRunSheetLedgerId='+deliveryRunSheetLedgerId+'&isReprint='+reprint, '_blank', 'height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}