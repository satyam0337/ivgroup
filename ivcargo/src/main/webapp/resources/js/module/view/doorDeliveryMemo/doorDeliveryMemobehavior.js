define([
    'marionette'
    ,PROJECT_IVUIRESOURCES+'/resources/js/backbone/backbone.bootstrap-modal.js'
    ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/doorDeliveryMemo/pendingLrForDoorDeliveryMemo.js'
    ,'nodvalidation'
    ,'selectizewrapper'
    ],function(Marionette, BootstrapModal, PendingLrForDDM, NodValidation, Selectizewrapper){
	 var _this
	,myNod
	,destinationList
	,destinationBranchObject = new Object();
	return Marionette.Behavior.extend({
		initializeDDM:function(){
			_this = this;
			var jsonObject = new Object();
			getJSON(jsonObject, WEB_SERVICE_URL+'/deliveryRunsheetWS/initializeDDM.do', _this.setDataForSelections, EXECUTE_WITH_ERROR);
		},setDataForSelections:function(response){
			destinationBranchObject	= response.destinationBranchId;
			if (response.branchId.length == 1){
				destinationList	= destinationBranchObject[response.branchId[0].branchId];
			}
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	response.branchId,
				valueField		:	'branchId',
				labelField		:	'branchName',
				searchField		:	'branchName',
				elementId		:	'branchEle',
				create			: 	false,
				maxItems		: 	1,
				onChange		:	_this.setLRDestination,
			});
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	destinationList,
				valueField		:	'branchId',
				labelField		:	'branchName',
				searchField		:	'branchName',
				elementId		:	'lrDestinationEle',
				create			: 	false,
				maxItems		: 	1
			});
			myNod = nod();
			myNod.configure({
				parentClass:'validation-message'
			});
			
			myNod.add({
				selector		: '#branchEle',
				validate		: 'presence',
				errorMessage	: 'Select Proper Branch !'
			});
			
			myNod.add({
				selector		: '#lrDestinationEle',
				validate		: 'presence',
				errorMessage	: 'Select Proper LR Destination !'
			});
			
			myNod.add({
				selector		: '#deliveryFor',
				validate		: 'presence',
				errorMessage	: 'Select Proper Delivery Type !'
			});
			
			$("#searchDDMLRBtn").click(function() {
				myNod.performCheck();
				if(myNod.areAll('valid')){
					_this.getWayBillDataForSelectedParameter();
				}
			});
			if (response.enableQRDDMButton) {
				$('#ddmWithQR').css('display','block');
				$("#ddmWithQR").click(function() {
					var MyRouter = new Marionette.AppRouter({});
					MyRouter.navigate('&modulename=ddmWithQRCode',{trigger: true});
					location.reload();
				});
			}
			hideLayer();
		},setLRDestination:function(){
			destinationList	= destinationBranchObject[$("#branchEle").val()];
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	destinationList,
				valueField		:	'branchId',
				labelField		:	'branchName',
				searchField		:	'branchName',
				elementId		:	'lrDestinationEle',
				create			: 	false,
				maxItems		: 	1
			});
		},getWayBillDataForSelectedParameter:function(){
			showLayer();
			var destinationIds	= new Array();
			if ($("#lrDestinationEle").val() == -1) {
				for (const element of destinationList) {
					if (element.branchId != -1)
						destinationIds.push(element.branchId);
				}
				
				destinationIds	= destinationIds.join();
			} else {
				destinationIds	= $("#lrDestinationEle").val();
			}
			
			var jsonObject = new Object();
			jsonObject.destinationBranchId			= destinationIds;
			jsonObject.consignmentSummaryDeliveryTo	= $("#deliveryFor").val();
			var object = new Object();
			object.data	= jsonObject;
			var btModal = new Backbone.BootstrapModal({
				content		: 	new PendingLrForDDM(object),
				modalWidth 	:	80,
				title		:	'Pending LRs For Door Delivery Memo',
				okText		:	'Add',
				showFooter 	: 	true
			}).open();
			object.btModal = btModal;
			new PendingLrForDDM(object)
			btModal.open();
		}
	});
});