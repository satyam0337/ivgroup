/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
define([
        'marionette'//Marionette
        ,'text!/ivcargo/template/lrsearch/statusdetails.html'
        ], function (Marionette,StatusDetailsHtml) {
	var 
	ElementModelArray='',
	dispatchData,
	myNod,
	myNode,
	myNodeDriver,
	btModal,
	languageKeyset,
	btVehicleModalConfirm,
	btDriverModalConfirm,
	_this;
	return Marionette.ItemView.extend({
		initialize: function(data) {
			//_this object is added because this object is not found in onRender function
			dispatchData = data.slickData;
			btModal = data.btModal;
			_this = this;
			_this.$el.html(StatusDetailsHtml);
		},
		render: function(){
			//this is the first method called when this function is called
			//triggerMethod onBeforeRender
			this.triggerMethod("before:render");
			//triggerMethod onRender
			this.triggerMethod("render");
			//triggerMethod onAfterRender
			this.triggerMethod("after:render");
		},

		onBeforeRender: function() {}, 
		onRender: function(){
			//jsonutility.js
			var jsonObj = new Object();
			jsonObj.waybillId = $("#wayBillId").val().trim();
			jsonObj.isCRMPage = true;
			getJSON(jsonObj, CUSTOMER_ACCESS_URL_CONSTANT+'/searchWayBillDetails/getSatusDetailsForLR.do', _this.setElements, EXECUTE_WITH_ERROR);

			return _this;
		},
		onAfterRender: function() {},
		setElements:function(data){
			console.log(data);
			setTimeout(function(){
				var dispatchSumm = data.dispatchSummary;
				for(var key in dispatchSumm){
					$('#vehicleNumber').html(dispatchSumm[key].vehicleNumber);
					$('#dispatchDateTime').html(dispatchSumm[key].wayBillDispatchTimeString);
				}
			},200)
		}
	});	
});
