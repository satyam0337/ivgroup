var consolidateEwaybillList = new Array();
var wayBillId;
define([ 'marionette'
         ,'JsonUtility'
         ,'messageUtility'
         ,'/ivcargo/resources/js/generic/urlparameter.js'
         ,'jquerylingua'
         ,'language'
         ,'nodvalidation'
         ,'focusnavigation'
         ,'autocomplete'
         ,'selectizewrapper'
         ,'/ivcargo/resources/js/module/redirectAfterUpdate.js',
         ],
		function(Marionette, JsonUtility, MessageUtility, UrlParameter, jquerylingua, language, NodValidation, FocusNavigation,AutoComplete,Selectizewrapper) {
	'use strict';// this basically give strictness to this specific js
	var jsonObject	= new Object(),
			wayBillId,
			myNod,
			_this = '',
			redirectFilter = 0;
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(masterObj){
		//initialize is the first function called on call new view()
		_this = this;
	},
		render: function() {
		showLayer();
		var jsonObject	= new Object();
		wayBillId 				= UrlParameter.getModuleNameFromParam('wayBillId');
		jsonObject["waybillId"] = wayBillId;
		showLayer();
		getJSON(jsonObject, WEB_SERVICE_URL + '/consolidateEwaybillDetailsWS/getGeneratedConsolidateEwaybillDetails.do?', _this.setData, EXECUTE_WITHOUT_ERROR);
		var loadelement = new Array();
		var baseHtml 	= new $.Deferred();
		loadelement.push(baseHtml);
		$("#mainContent").load("/ivcargo/html/module/consolidateewaybilldetails/consolidateewaybilldetails.html",
				function() {
			baseHtml.resolve();
		});
		$.when.apply($, loadelement).done(function() {
			initialiseFocus();
			hideLayer();
		});
		return _this;
	},
		setData : function(response){
		setTimeout(function(){
			if(response == null || response.VehiclListDetails == null){
				showMessage('error', "No Records Found");
				return;
			}
			if(response.VehiclListDetails.length == 0){
				$('#middle-border-boxshadow').addClass('hide');
				$('#bottom-border-boxshadow').addClass('hide');
				showMessage('error', "No Records Found");
				return;
			}
			consolidateEwaybillList = response.VehiclListDetails;
			hideLayer();
			if (!response || jQuery.isEmptyObject(response)) {
				showMessage('error', "System error"); // show message to show system processing error massage on top of the window.
				hideLayer();
			} else {
				if(response.Message!=null)
				{
					hideLayer();
					showMessage('success',response.Message);
				}else{
					hideLayer();
				}
			} 
			$('#reportDetailsTable thead').empty();
			$('#reportDetailsTable tbody').empty();
			$('#reportDetailsTable tfoot').empty();

			var columnHeadArray				= new Array();
			var columnHeadSubArray			= new Array();
			var columnArray					= new Array();

			columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Sr No.</th>");
			columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Ewaybill-No.</th>");
			columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Update Mode.</th>");
			columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Vehicle No.</th>");
			columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Place Of Consignor.</th>");
			columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>State of Consignor.</th>");
			columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>TripSheet No.</th>");
			columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Transportation Mode.</th>");
			columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Transportation Document No.</th>");
			columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Transportation Document Date.</th>");
			$('#reportDetailsTable thead').append('<tr id="reportDetailsTableHeader" class="text-success text-center">' + columnHeadSubArray.join(' ') + '</tr>');

			if(consolidateEwaybillList!=null && consolidateEwaybillList.length > 0){
				for(var i = 0;i<consolidateEwaybillList.length;i++){
					var obj = consolidateEwaybillList[i];
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i+1) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>" + obj.ewaybillNo + "</b><input type='hidden' id ='driverIncentiveId_"+i+"' value='"+obj.pendingDriverIncentiveId+"'/></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>" + obj.updateMode + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>" + obj.vehicleNumber + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>"+obj.placeOfConr+"</b><input type='hidden' id ='onAccountBalanceAmountEle_"+i+"' value='"+obj.articleAmount+"'/></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>" + obj.stateOfConr + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>" + obj.tripsheetNo + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>" + obj.transporatationMode + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>" + obj.transportDocuno + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>" + obj.transportDocudate + "</td>");
					$('#reportDetailsTable tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
					columnArray = [];
				}
				$('#middle-border-boxshadow').removeClass('hide');
				$('#bottom-border-boxshadow').removeClass('hide');
			}
		},500);	
	},
	});
});