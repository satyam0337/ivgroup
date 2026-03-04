var branchWisePrepaidAmountList = new Array();
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

		var loadelement = new Array();
		var baseHtml 	= new $.Deferred();
		loadelement.push(baseHtml);
		$("#mainContent").load("/ivcargo/html/module/AgentBranchPrepaidAmountReport/AgentBranchPrepaidAmtReport.html",
				function() {
			baseHtml.resolve();
		});
		$.when.apply($, loadelement).done(function() {
			initialiseFocus();
			hideLayer();
			
			$("#btSubmit").on("click" ,function() {	
				console.log("vpp");
				showLayer();
				getJSON(jsonObject, WEB_SERVICE_URL + '/BranchWisePrepaidAmountWS/getAgentBranchPrepaidAmountDetails.do?', _this.setData, EXECUTE_WITHOUT_ERROR);
			});
		});
	
		return _this;
	},
		setData : function(response){
		setTimeout(function(){
			hideLayer();
			if(response == null || response.branchWisePrepaidAmountList == null){
				showMessage('error', "No Records Found");
				$('#middle-border-boxshadow').addClass('hide');
				$('#bottom-border-boxshadow').addClass('hide');
				$('#reportDetailsTable thead').empty();
				$('#reportDetailsTable tbody').empty();
				$('#reportDetailsTable tfoot').empty();
				$('#middle-border-boxshadow').empty();
				return;
			}
			if(response.branchWisePrepaidAmountList.length == 0){
				$('#middle-border-boxshadow').addClass('hide');
				$('#bottom-border-boxshadow').addClass('hide');
				showMessage('error', "No Records Found");
				return;
			}
			branchWisePrepaidAmountList = response.branchWisePrepaidAmountList;
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
			columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Branch Name.</th>");
			columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Recharge Amount.</th>");
			$('#reportDetailsTable thead').append('<tr id="reportDetailsTableHeader" class="text-success text-center">' + columnHeadSubArray.join(' ') + '</tr>');

			if(branchWisePrepaidAmountList!=null && branchWisePrepaidAmountList.length > 0){
				for(var i = 0;i<branchWisePrepaidAmountList.length;i++){
					var obj = branchWisePrepaidAmountList[i];
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i+1) + "</td>");
					columnArray.push("<td style='text-align: left;'><a style='color : blue; cursor : pointer;' href='Dispatch.do?pageId=340&eventId=1&modulename=agentPrepaidAmtSummaryReport&fromHyperLink="+true+"&toDate="+obj.branchId+"&region="+obj.branchId+"&subRegion="+obj.branchId+"&branch="+obj.branchId+"' target='_blank'>" +obj.branchName+ "</a></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>" + obj.rechargeAmount + "</td>");
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