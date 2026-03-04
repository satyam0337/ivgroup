define([
		'marionette'
		,'text!/ivcargo/template/lrsearch/lrstatusdetails.html'
		], function (Marionette, LRStatusDetailsHtml) {
	var _this, isCustomerAccess = false;
	return Marionette.ItemView.extend({
		initialize: function(jsondata) {
			//_this object is added because this object is not found in onRender function
			_this = this;
			_this.$el.html(LRStatusDetailsHtml);
			
			isCustomerAccess	= jsondata.isCustomerAccess;
		},
		render: function(){
			this.triggerMethod("before:render");
			this.triggerMethod("render");
			this.triggerMethod("after:render");
		},

		onBeforeRender: function() {}, 
		onRender: function(){
			//jsonutility.js
			var jsonObj = new Object();
			jsonObj.waybillId 			= $("#wayBillId").val().trim();
			jsonObj.isCustomerAccess 	= isCustomerAccess;
			jsonObj.isCRMPage			= true;
			getJSON(jsonObj, CUSTOMER_ACCESS_URL_CONSTANT+'/searchWayBillDetails/getLRSatusDetails.do', _this.setElements, EXECUTE_WITH_ERROR);

			return _this;
		},
		onAfterRender: function() {},
		setElements:function(data){
			console.log(data);
			
			$('#reportDetailsTable thead').empty();
			$('#reportDetailsTable tbody').empty();
			
			var columnHeadArray				= new Array();
			var columnArray					= new Array();
			
			setTimeout(function(){
				var wayBillStatusDetailsArr = data.wayBillStatusDetailsArr;
				
				columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Status</th>");
				columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Date</th>");
				columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>From</th>");
				columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>To</th>");
				columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Remark</th>");

				$('#lrStatusDetail thead').append('<tr id="lrStatusDetail" class="text-info text-center">' + columnHeadArray.join(' ') + '</tr>');

				for(var i = 0; i < wayBillStatusDetailsArr.length; i++) {
					var obj = wayBillStatusDetailsArr[i];
									
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>" + obj.statusStr + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>" + obj.dateString + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>" + obj.sourceBranchName + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>" + obj.destinationBranchName + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>" + obj.remark + "</td>");
					
					
					$('#lrStatusDetail tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
					columnArray = [];
				}
			},200)
		}
	});	
});
