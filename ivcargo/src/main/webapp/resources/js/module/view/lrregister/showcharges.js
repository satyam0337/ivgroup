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
	var 
	//global objects
	jsonObject,
	_this;

	return Marionette.ItemView.extend({
		initialize: function(jsonObjectData) {
			jsonObject = jsonObjectData;
		},
		render: function(){
			//_this object is added because this object is not found in onRender function
			_this = this; 
			
			var bookingCharges = jsonObject.row.bookingChargeHM;
			
			var $table = $('<table class="table"/>');
			var $thead = $(' <thead class="thead-inverse"/>');
			
			var $thObj = $("<th/>");
			$thObj.append("Booking Charge");
			$thead.append($thObj);
			
			var $thObj = $("<th/>");
			$thObj.append("Amount");
			$thead.append($thObj);
			
			$table.append($thead);
			
			var $tbody = $("<tbody/>");
			
			for(var chargeName in bookingCharges) {
				var $trObj = $("<tr/>");
				
				var $tdObj = $("<td/>");
				$tdObj.append(chargeName);
				$trObj.append($tdObj);
				
				var $tdObj = $("<td/>");
				$tdObj.append(bookingCharges[chargeName]);
				$trObj.append($tdObj);
				
				$tbody.append($trObj);
			}
			
			$table.append($tbody);
			
			_this.$el.html($table);
		}, onBeforeRender: function() {
			//code which needs to be rendered before render
		}, onRender: function(){
			//this object is created to synchronize the flow when data is fetched from the method
			//this object is created to synchronize the flow when data is fetched from the method

			return _this;
		}, onAfterRender: function() {
			//code which needs to be rendered after render
		}
	});	
});