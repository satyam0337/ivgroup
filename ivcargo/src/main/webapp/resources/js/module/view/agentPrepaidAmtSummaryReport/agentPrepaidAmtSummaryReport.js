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
         ,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
         ,'/ivcargo/resources/js/module/redirectAfterUpdate.js',
         ],
		function(Marionette, JsonUtility, MessageUtility, UrlParameter, jquerylingua, language, NodValidation, FocusNavigation,AutoComplete,Selectizewrapper,Selection) {
	'use strict';// this basically give strictness to this specific js
	var jsonObject	= new Object(),
			wayBillId,
			myNod,
			_this = '',
			redirectFilter = 0
			var fromDate
			var toDate;
	var isBranchSelectedFromDropDown = false;
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(masterObj){
		//initialize is the first function called on call new view()
		_this = this;
	},
		render : function() {
		showLayer();
		getJSON(jsonObject, WEB_SERVICE_URL + '/BranchWisePrepaidAmountWS/getAgentBranchPrepaidAmountDetailsSummaryIntialDetails.do?', _this.setIntialData, EXECUTE_WITHOUT_ERROR);
		return _this;
	},
		setIntialData: function(response) {
		console.log(" = ",response.branchList);
		var jsonObject	= new Object();
		wayBillId 				= UrlParameter.getModuleNameFromParam('wayBillId');
		jsonObject["waybillId"] = wayBillId;
		var loadelement = new Array();
		var baseHtml 	= new $.Deferred();
		loadelement.push(baseHtml);
		$("#mainContent").load("/ivcargo/html/module/agentPrepaidAmtSummaryReport/agentPrepaidAmtSummaryReport.html",
				function() {
			baseHtml.resolve();
		});
		$.when.apply($, loadelement).done(function() {
			initialiseFocus();
			hideLayer();
			$("#contentData").html("");
			$("#printTheExpense").css("display", "none");
			var elementConfiguration = new Object();
			elementConfiguration.dateElement = $('#dateEle');
			var resp = new Object();
			resp.elementConfiguration    = elementConfiguration;
			resp.isCalenderSelection    = true;

			Selection.setSelectionToGetData(resp);
			$("#getPrepaidAmtSummary").click(function() {
				var  fromhyperLink		= UrlParameter.getModuleNameFromParam("fromHyperLink");
				console.log("fromhyperLink = ",fromhyperLink);
				console.log("isBranchSelectedFromDropDown = ",isBranchSelectedFromDropDown);
				if(fromhyperLink!= null && fromhyperLink!=undefined && fromhyperLink && !isBranchSelectedFromDropDown){
					_this.getPrepaidAmtSummaryDataFromHyperlink();
				}else{
					_this.getPrepaidAmtSummary();
				}
			});
			$("#viewAllData").click(function() {
				if($('#viewAllData').is(":checked")){
					$('#dataELem').hide();
					$('#dateEle').hide();
					$('#label_1').hide();
				}else{
					$('#dateEle').show();
					$('#dataELem').show();
					$('#label_1').show();
				}
			});
			console.log(" = ",response.branchList);
			var branchArr = new Array();
			if(response!= undefined && response.branchList!= undefined && response.branchList.length > 0){
				for(var i = 0;i<response.branchList.length;i++){
					if(response.branchList[i].branchId > 0){
						branchArr.push(response.branchList[i]);
					}
				}
			}
			var branchesList = 
					Selectizewrapper.setAutocomplete({
						jsonResultList	: 	branchArr,
						valueField		:	'branchId',
						labelField		:	'branchName',
						searchField		:	'branchName',
						elementId		:	'branchEle',
						create			: 	false,
						maxItems		: 	1,
						onChange		:   _this.onBranchSelect
					});
		});
		return _this;
	},
		onBranchSelect : function(value){
		isBranchSelectedFromDropDown = true;
	},
		getPrepaidAmtSummary: function(){
		if($('#branchEle').val() == ''){
			showMessage('error', "Please Select Branch");
			return;
		}
		var filter = 1;
		var jsonObject = new Object();
		showLayer();
		var branchId = $('#branchEle').val()
				jsonObject["branchId"]       =branchId;
		if($("#dateEle").attr('data-startdate') != undefined){
			jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
			fromDate = jsonObject["fromDate"];
		}
		if($("#dateEle").attr('data-enddate') != undefined){
			jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
			toDate = jsonObject["toDate"];
		}
		if($('#viewAllData').is(":checked")){
			filter = 2;
		}
		jsonObject["filter"] = filter; 
		console.log("jsonObject = ",jsonObject)
		getJSON(jsonObject, WEB_SERVICE_URL + "/BranchWisePrepaidAmountWS/getAgentBranchPrepaidAmountDetailsSummary.do?", _this.setData, EXECUTE_WITHOUT_ERROR );	
	}
	,getPrepaidAmtSummaryDataFromHyperlink: function(){
		var filter = 1;
		var jsonObject = new Object();
		showLayer();
		var branchId 		= UrlParameter.getModuleNameFromParam("branch");
		jsonObject["branchId"]       =branchId;
		if($("#dateEle").attr('data-startdate') != undefined){
			jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
			fromDate = jsonObject["fromDate"];
		}
		if($("#dateEle").attr('data-enddate') != undefined){
			jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
			toDate = jsonObject["toDate"];
		}
		if($('#viewAllData').is(":checked")){
			filter = 2;
		}
		jsonObject["filter"] = filter; 
		console.log("jsonObject = ",jsonObject)
		getJSON(jsonObject, WEB_SERVICE_URL + "/BranchWisePrepaidAmountWS/getAgentBranchPrepaidAmountDetailsSummary.do?", _this.setData, EXECUTE_WITHOUT_ERROR );	
	},
	setData : function(response){
		console.log("response = ",response)
		setTimeout(function(){
			hideLayer();
			if(response == null || response.branchWisePrepaidAmountDetailsList == null){
				showMessage('error', "No Records Found");
				$('#reportDetailsTable thead').empty();
				$('#reportDetailsTable tbody').empty();
				$('#reportDetailsTable tfoot').empty();
				$('#middle-border-boxshadow').empty();
				return;
			}
			if(response.branchWisePrepaidAmountDetailsList.length == 0){
				$('#middle-border-boxshadow').addClass('hide');
				$('#bottom-border-boxshadow').addClass('hide');
				showMessage('error', "No Records Found");
				return;
			}
			branchWisePrepaidAmountList = response.branchWisePrepaidAmountDetailsList;
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
			columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Executive Name.</th>");
			columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Branch Name.</th>");
			columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Date.</th>");
			columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Recharge Amt.</th>");
			$('#reportDetailsTable thead').append('<tr id="reportDetailsTableHeader" class="text-success text-center">' + columnHeadSubArray.join(' ') + '</tr>');

			if(branchWisePrepaidAmountList!=null && branchWisePrepaidAmountList.length > 0){
				for(var i = 0;i<branchWisePrepaidAmountList.length;i++){
					var obj = branchWisePrepaidAmountList[i];
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i+1) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>" + obj.executiveName + "</b><input type='hidden' id ='prepaidAmountId_"+i+"' value='"+obj.prepaidAmountId+"'/></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>" + obj.branchName + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>" + obj.updatedTxnDateString + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>" + obj.updatedRechargeAmount + "</td>");
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