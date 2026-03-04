/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
define([
        //the file which has only name they are are already  been loaded
        'marionette',//Marionette
        PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatch/pendingLrForDispatch.js',
        PROJECT_IVUIRESOURCES+'/resources/js/backbone/backbone.bootstrap-modal.js'
        //marionette JS framework
        ], function(Marionette, PendingLrForDispatch) {

	return Marionette.Behavior.extend({
		defaults: {
			fieldSelector: ":input",
		},
		onSearch: function() {
			myNod = nod();
			
			if(isCheckBoxChecked('isAgentCrossing')) {
				addAutocompleteElementInNode(myNod, 'crossingAgentSelectEle', 'Please, Select Crossing Agent !');
				addAutocompleteElementInNode(myNod, 'destinationAreaEle', 'Please, Select Destination Area !');
				if($('#billSelectionEle').exists() && $('#billSelectionEle').is(":visible"))
					addAutocompleteElementInNode(myNod, 'billSelectionEle', 'Please Select Bill Selection Type !');
			} else {
				addAutocompleteElementInNode(myNod, 'sourceSubRegionSelectEle', 'Please, Select Source Area !');
				addAutocompleteElementInNode(myNod, 'sourceSelectEle', 'Please, Select Source Branch !');
				
				if(lsPropertyConfig.wayBillDispatchForMultipleBranch) {
					addElementToCheckEmptyInNode(myNod, 'areaSelectEle', 'Please, Select Destination Area !');
					addElementToCheckEmptyInNode(myNod, 'branchSelectEle', 'Please, Select Destination Branch !');
				} else {
					addAutocompleteElementInNode(myNod, 'areaSelectEle', 'Please, Select Destination Area !');
					addAutocompleteElementInNode(myNod, 'branchSelectEle', 'Please, Select Destination Branch !');
				}
				
				if(lsPropertyConfig.TransportModeForSearch)
					addAutocompleteElementInNode(myNod, 'transportModeSearchEle', 'Please Select Transport Mode');
				
				if(lsPropertyConfig.DeliveryAtForSearch)
					addAutocompleteElementInNode(myNod, 'deliveryAtSearchEle', 'Please Select Delivery At');
				
				if($('#billSelectionEle').exists() && $('#billSelectionEle').is(":visible"))
					addAutocompleteElementInNode(myNod, 'billSelectionEle', 'Please Select Bill Selection Type !');
				
				if($('#crossingBranchEle').exists() && $('#crossingBranchEle').is(":visible"))
					addAutocompleteElementInNode(myNod, 'crossingBranchEle', 'Please Select Crossing Unloading Branch');
			}
			
			myNod.performCheck();
			
			if(myNod.areAll('valid')) {
				var jsonObject = new Object();
				
				if($('#isAgentCrossing').is(":checked")){
					$('#CrossingElementDiv :input').each(function () {
						if($(this).val() != "")
							jsonObject[$(this).attr('name')] = $(this).val();
					});
				} else {
					$('#ElementDiv :input').each(function () {
						if($(this).val() != "")
							jsonObject[$(this).attr('name')] = $(this).val();
					});
				}
				
				if(lsPropertyConfig.wayBillDispatchForMultipleBranch && !$('#isAgentCrossing').is(":checked")) {
					var branchSelectEle	= (jsonObject.branchSelectEle).join(",");
					
					if(branchSelectEle != -1 && isValueExistInArray(branchSelectEle.split(","), -1)) {
						showMessage('error', 'You cannot select ALL option with other branches !');
						return false;
					}
				}
				
				var object = new Object();
				object.elementValue = jsonObject;
				var btModal = new Backbone.BootstrapModal({
					content		: 	new PendingLrForDispatch(object),
					modalWidth 	:	100,
					modalHeight :	100,
					title		:	'Pending LRs For Dispatch',
					okText		:	'Add',
					showFooter 	: 	true
				}).open();
				object.btModal = btModal;
				new PendingLrForDispatch(object)
				btModal.open();
			}
		}, onSaveDispatch : function() {
			var pendingDispatch  = new PendingLrForDispatch();
			pendingDispatch.submitDataFromGrid();
		}, onEnterExcessEntry : function() {
			var pendingDispatch  = new PendingLrForDispatch();
			pendingDispatch.enterLRExcessEntry();
		}, onViewExcessEntry : function() {
			var pendingDispatch  = new PendingLrForDispatch();
			pendingDispatch.viewLRExcessEntry();
		}
	});
});