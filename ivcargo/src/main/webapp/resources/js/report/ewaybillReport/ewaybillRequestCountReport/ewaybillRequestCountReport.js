define([ 
	'marionette'
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,'JsonUtility'
	,'messageUtility'
	,'/ivcargo/resources/js/generic/urlparameter.js'
	,'nodvalidation'
	,'focusnavigation'
	,'autocomplete'
	],
	function(Marionette, Selection) {
	'use strict';// this basically give strictness to this specific js
	var jsonObject	= new Object(), _this = '', accountGroupId ='', filter = 0, accountGroupSelection = false; 
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function() {
			//initialize is the first function called on call new view()
			_this = this;
		}, render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/ewaybillRequestCountReportWS/getInitialDetailsOfEwaybillRequestCount.do?', _this.setGroup, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setGroup : function(response){
			var loadelement = new Array();
			var baseHtml 	= new $.Deferred();

			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/report/ewaybillReport/ewaybillRequestCountReport/ewaybillRequestCountReport.html", function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				accountGroupSelection	= response.accountGroupList != undefined;
				
				if (accountGroupSelection)
					$("*[data-attribute=accountGroup]").removeClass("hide");
				
				var elementConfiguration	= new Object();

				elementConfiguration.dateElement		= $('#dateEle');

				response.elementConfiguration	= elementConfiguration;
				response.isCalenderSelection	= true;
				response.accountGroupSelection	= response.accountGroupList != undefined;

				Selection.setSelectionToGetData(response);

				$("#getRequestCount").click(function() {
					if(accountGroupSelection)
						_this.validateForm();
					else
						_this.getRequestCount();
				});
			});
			
			hideLayer();
		}, validateForm : function() {
			accountGroupId	= $('#accountGroupEle').val();
			
			if(accountGroupId == 0 || accountGroupId == undefined) {
				showAlertMessage('error', 'Please Select Account Group');
				return;
			}
			
			_this.getRequestCount();
		}, 	getRequestCount : function() {
			showLayer();
			
			jsonObject["configAccountGroupId"]	= accountGroupId;
			jsonObject["filter"]				= filter;
			
			if($("#dateEle").attr('data-startdate') != undefined)
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
			
			if($("#dateEle").attr('data-enddate') != undefined)
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
			
			getJSON(jsonObject, WEB_SERVICE_URL + "/ewaybillRequestCountReportWS/getDetailsOfEwaybillRequestCount.do?", _this.setData, EXECUTE_WITHOUT_ERROR );	
		}, setData : function(response) {
			hideLayer();
			
			if(response.message != undefined) {
				$('#middle-border-boxshadow').addClass('hide');
				return;
			}
			
			$('#reportDetailsTable thead').empty();
			$('#reportDetailsTable tbody').empty();
			$('#reportDetailsTable tfoot').empty();
				
			let requestCountList = response.eWayBillCountModelList;

			var columnHeadSubArray			= new Array();
			var columnArray					= new Array();

			columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Sr No</th>");
			columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Account Group Code</th>");
			columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Account Group Name</th>");
			columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;'>Count</th>");
			$('#reportDetailsTable thead').append('<tr id="reportDetailsTableHeader" class="text-success text-center">' + columnHeadSubArray.join(' ') + '</tr>');

			for(var i = 0; i < requestCountList.length; i++) {
				var obj = requestCountList[i];
				columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i+1) + "</td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>" + obj.accountGroupCode + "</b></td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>" + obj.accountGroupName + "</b></td>");
				columnArray.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px; color: #1d7596'>" + obj.noOfRequests + "</b></td>");
				$('#reportDetailsTable tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
				columnArray = [];
			}
			
			$('#middle-border-boxshadow').removeClass('hide');
		}
	});
});