/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
define([
        'marionette'//Marionette
        //marionette JS framework
        
        ], function (Marionette) {
	'use strict';// this basically give strictness to this specific js
	let  jsonObject, _this;

	return Marionette.ItemView.extend({
		initialize: function(jsonObjectData) {
			jsonObject = jsonObjectData;
		},
		render: function(){
			//_this object is added because this object is not found in onRender function
			_this = this; 
			
			let paymentDetails = jsonObject.row.paymentDetails;
			
			if(paymentDetails == undefined) {
				showMessage('error','No Payment Details found for this bill')
				return false;
			}
			
			let $table = $('<table class="table"/>');
			let $thead = $(' <thead class="thead-inverse"/>');
			
			let $thObj = $("<th/>");
			$thObj.append("Date");
			$thead.append($thObj);
			
			$thObj = $("<th/>");
			$thObj.append("Received Amount");
			$thead.append($thObj);
			
			$thObj = $("<th/>");
			$thObj.append("Payment Type");
			$thead.append($thObj);
			
			$table.append($thead);
			
			let $tbody = $("<tbody/>");
			
			for(let chargeName in paymentDetails) {
				let $trObj = $("<tr/>");
				
				let $tdObj = $("<td/>");
				$tdObj.append(paymentDetails[chargeName].billClearanceCreationDateTimeStampString);
				$trObj.append($tdObj);
				
				$tdObj = $("<td/>");
				$tdObj.append(paymentDetails[chargeName].billClearanceTotalReceivedAmount);
				$trObj.append($tdObj);
				
				$tdObj = $("<td/>");
				$tdObj.append(paymentDetails[chargeName].billClearancePaymentModeString);
				$trObj.append($tdObj);
				
				$tbody.append($trObj);
			}
			
			$table.append($tbody);
			
			_this.$el.html($table);
			
		},
		onBeforeRender: function() {
			//code which needs to be rendered before render
		}, 
		onRender: function(){
			//this object is created to synchronize the flow when data is fetched from the method
			//this object is created to synchronize the flow when data is fetched from the method

			return _this;
		},
		onAfterRender: function() {
			//code which needs to be rendered after render
		}
	});	
});