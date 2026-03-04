define(['JsonUtility',
	'messageUtility',
	PROJECT_IVUIRESOURCES + '/resources/js/module/view/agentOutstandingReport/agentOutstandingReportFilePath.js',
	'jquerylingua',
	'language',
	'bootstrapSwitch',
	'slickGridWrapper2',
	'nodvalidation',
	'focusnavigation',
	'selectizewrapper',
	PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
	PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js',
	PROJECT_IVUIRESOURCES+'/resources/js/module/view/agentOutstandingReport/agentOutstandingReportDetails.js'
	],function(JsonUtility, MessageUtility, FilePath, Lingua, Language, BootstrapSwitch, slickGridWrapper2, 
			NodValidation, FocusNavigation,Selectizewrapper, BootstrapModal, Selection,AgentOutstandingReportDetails){
	'use strict';
	var jsonObject = new Object(), 
	myNod, 
	masterLangObj, 
	masterLangKeySet, 
	gridObject,  
	_this, 
	accountGroupName="",
	selectMaxItems = 1,
	isViewAllSelected,
	sourceBranchId;
	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/agentOutstandingReportWS/getAgentOutstandingReportElement.do?',_this.setReportsElements, EXECUTE_WITH_ERROR);
			return _this;
		},setReportsElements : function(response){

			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();

			loadelement.push(baseHtml);
			$("#mainContent").load("/ivcargo/html/module/agentOutstandingReport/agentOutstandingReport.html",function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();

				var keyObject = Object.keys(response);
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]].show == true) {
						$("*[data-attribute="+ keyObject[i]+ "]").addClass("show");
					}
				}

				var elementConfiguration			= new Object();
				elementConfiguration.dateElement	= $('#dateEle');

				response.elementConfiguration	    = elementConfiguration;
				response.isCalenderSelection	    = true;

				Selection.setSelectionToGetData(response);

				masterLangObj 		= FilePath.loadLanguage();
				masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
				
				var branchAutoComplete 			= new Object();
				branchAutoComplete.primary_key 	= 'branchId';
				branchAutoComplete.field 		= 'branchName';
				$("#branchEle").autocompleteCustom(branchAutoComplete);

				var autoBranchName = $("#branchEle").getInstance();
				$(autoBranchName).each(function() {
					this.option.source = response.sourceBranchCollection;
				});
				
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				myNod.add({
					selector		: '#branchEle',
					validate		: 'validateAutocomplete:#branchEle_primary_key',
					errorMessage	: 'Please Select Agent Branch'
				});
				
				$('#viewAllEle').click(function() {
					_this.checkDateSelection(_this);
				});
				
				hideLayer();
				
				$("#searchBtn").click(function() {
					myNod.performCheck();

					if(myNod.areAll('valid')) {
						_this.onSubmit(_this);								
					}
				});
			});
		},checkDateSelection : function() {
			
			isViewAllSelected	= $('#viewAllEle').is(':checked');
			
			if(isViewAllSelected) {
				$("#dateDiv").removeClass("show");
				$("#dateDiv").addClass("hide");
			} else {
				$("#dateDiv").addClass("show");
				$("#dateDiv").removeClass("hide");
			}
		},onSubmit : function() {
			showLayer();

			var jsonObject = new Object();

			if($("#dateEle").attr('data-startdate') != undefined){
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
			}

			if($("#dateEle").attr('data-enddate') != undefined){
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
			}

			jsonObject["agentBranchId"] 		= $('#branchEle_primary_key').val();
			jsonObject["isShowAllData"] 		= isViewAllSelected;

			getJSON(jsonObject, WEB_SERVICE_URL+'/agentOutstandingReportWS/getAgentOutstandingReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		},setReportData : function(response) {
			
			if(response.message != undefined){
				hideLayer();
				var errorMessage = response.message;
				showMessage('error', errorMessage.typeSymble + '  ' +  errorMessage.description);
				$('#middle-border-boxshadow').addClass('hide');
				return;
			}
			
			$('#agentOustandingReportDetails').empty();
			$('#agentOustandingReportDiv').empty();
			
			var agentOustandingReportDetails	= response.agentOustandingReportDetails;
			
			if(agentOustandingReportDetails != undefined ) {
				
				$('#middle-border-boxshadow').removeClass('hide');
				
				var columnArray			= new Array();
				var count				= 1;
				var unbilledAmt			= 0.0;
				var billedAmt			= 0.0;
				var dueAmt				= 0.0;
				var totalUnbilledAmt	= 0.0;
				var totalBilledAmt		= 0.0;
				var totalDueAmt			= 0.0;
				
				for (var key in agentOustandingReportDetails) {
					var obj		= agentOustandingReportDetails[key];
					
					unbilledAmt		+= obj.unbilledAmt;
					billedAmt		+= obj.billedAmt;
					dueAmt			+= obj.totalCommission;
					
					if(unbilledAmt > 0) {
						totalUnbilledAmt	= unbilledAmt.toFixed(2);
					}
					
					if(billedAmt > 0) {
						totalBilledAmt	= billedAmt.toFixed(2);
					}
					
					if(dueAmt > 0) {
						totalDueAmt	= dueAmt.toFixed(2);
					}
					
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (count) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' id='destinationBranchId_" + obj.sourceBranchId + "' name='' value='"+ obj.sourceBranchName +"'>" + (obj.sourceBranchName) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><a style='cursor:pointer;'id='unbilledAmt_" + obj.sourceBranchId + "'><b style='font-size: 14px'>"+obj.unbilledAmt+"</b></a></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><a style='cursor:pointer;'id='billedAmt_" + obj.sourceBranchId + "'><b style='font-size: 14px'>"+obj.billedAmt+"</b></a></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' id='totalCommission_" + obj.sourceBranchId + "' name='' value='"+ obj.totalCommission +"'>" + (obj.totalCommission) + "</td>");
					
					$('#agentOustandingReportDetailsTable tbody').append('<tr id="agentOustandingReportDetails_'+ obj.sourceBranchId +'">' + columnArray.join(' ') + '</tr>');
					count++;
					$("#unbilledAmt_" + obj.sourceBranchId).bind("click", function() {
						var elementId			= $(this).attr('id');
						sourceBranchId			= elementId.split('_')[1];
						
					    _this.showUnbilledLrDetails();
					});
					
					$("#billedAmt_" + obj.sourceBranchId).bind("click", function() {
						var elementId			= $(this).attr('id');
						sourceBranchId			= elementId.split('_')[1];
					    _this.showBilledLrDetails();
					});
					
					columnArray	= [];
				}
				$('#agentOustandingReportDetailsTable tbody').append("<th class='table-bordered' height ='30px' colspan='2' style='background-color: #FFE5CC; padding-left: 185px;  text-center: middle'; vertical-align: middle; text-transform: uppercase' id='totalCommission_" + obj.sourceBranchId + "' name=''>Total</th>");
				$('#agentOustandingReportDetailsTable tbody').append("<td class='table-bordered' height ='30px' style='background-color: #FFE5CC; text-align: center; vertical-align: middle;'><a style='cursor:pointer;'id='unbilledAmt_" + obj.sourceBranchId + "'><b style='font-size: 14px'value='"+ totalUnbilledAmt +"' >"+ (totalUnbilledAmt) +"</b></a></td>");
				$('#agentOustandingReportDetailsTable tbody').append("<td class='table-bordered' height ='30px' style='background-color: #FFE5CC; text-align: center; vertical-align: middle;'><a style='cursor:pointer;'id='billedAmt_" + obj.sourceBranchId + "'><b style='font-size: 14px' value='"+ totalBilledAmt +"'>"+ (totalBilledAmt) +"</b></a></td>");
				$('#agentOustandingReportDetailsTable tbody').append("<td class='table-bordered' height ='30px' style='background-color: #FFE5CC; text-align: center; vertical-align: middle; text-transform: uppercase' id='totalCommission_" + obj.sourceBranchId + "' name='' value='"+ totalDueAmt +"'>" + (totalDueAmt) + "</td>");
			} else {
				$('#middle-border-boxshadow').addClass('hide');
			}
			
			var data = new Object();
			data.accountGroupNameForPrint	= response.accountGroupName;
			data.branchAddress				= response.accountGroupAdd;
			data.branchPhoneNumber			= response.accountGroupPhone;
			data.isLaserPrintAllow			= 'true';
			data.isPlainPrintAllow			= 'true';
			data.isExcelButtonDisplay		= 'true';
			printTable(data, 'reportData', 'agentOustandingReportDetailsTable', 'Agent Outstanding Report', 'agentOustandingReportDiv');
			
			hideLayer();
		},showUnbilledLrDetails : function() {
			showLayer();

			var jsonObject 				= new Object();

			jsonObject["agentBranchId"]	= sourceBranchId;

			if($("#dateEle").attr('data-startdate') != undefined){
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
			}

			if($("#dateEle").attr('data-enddate') != undefined){
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
			}

			jsonObject["isShowAllData"] 	= isViewAllSelected;

			getJSON(jsonObject, WEB_SERVICE_URL+'/agentOutstandingReportWS/getAgentOutstandingReportUnbilledSummary.do', _this.setUnbilledReportSummary, EXECUTE_WITH_ERROR);
		},showBilledLrDetails : function() {
			showLayer();

			var jsonObject 				= new Object();

			jsonObject["agentBranchId"]	= sourceBranchId;

			if($("#dateEle").attr('data-startdate') != undefined){
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
			}

			if($("#dateEle").attr('data-enddate') != undefined){
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
			}

			jsonObject["isShowAllData"] 	= isViewAllSelected;

			getJSON(jsonObject, WEB_SERVICE_URL+'/agentOutstandingReportWS/getAgentOutstandingReportBilledSummary.do', _this.setBilledReportSummary, EXECUTE_WITH_ERROR);
		},setUnbilledReportSummary : function(response) {
			if(response.message != undefined){
				hideLayer();
				var errorMessage = response.message;
				showMessage('error', errorMessage.typeSymble + '  ' +  errorMessage.description);
				return;
			}
			
			if(response.agentOustandingUnbilledSummaryList != undefined && (response.agentOustandingUnbilledSummaryList.CorporateAccount).length > 0) {
				var jsonObject = new Object();
				jsonObject["response"] 		= response;
				
				var object = new Object();
				object.elementValue = jsonObject;

				var btModal = new Backbone.BootstrapModal({
					content: new AgentOutstandingReportDetails(object),
					modalWidth : 90,
					title:'<center>Agent Outstanding Unbilled Details</center>'
				}).open();
				
				object.btModal = btModal;
				new AgentOutstandingReportDetails(object)
				btModal.open();
			} else {
				hideLayer();
				showMessage('error','No Records Found!');
			}
		},setBilledReportSummary : function(response) {

			if(response.message != undefined){
				hideLayer();
				var errorMessage = response.message;
				showMessage('error', errorMessage.typeSymble + '  ' +  errorMessage.description);
				return;
			}
			
			if(response.agentOustandingBilledSummaryList != undefined && (response.agentOustandingBilledSummaryList.CorporateAccount).length > 0) {
				var jsonObject = new Object();
				jsonObject["response"] 		= response;
				
				var object = new Object();
				object.elementValue = jsonObject;

				var btModal = new Backbone.BootstrapModal({
					content: new AgentOutstandingReportDetails(object),
					modalWidth : 90,
					title:'<center>Agent Outstanding Billed Details</center>'
				}).open();
				
				object.btModal = btModal;
				new AgentOutstandingReportDetails(object)
				btModal.open();
			} else {
				hideLayer();
				showMessage('error','No Records Found!');
			}
		}
	});
});

function transportSearch(grid,dataView,row){
	var LR_SEARCH_TYPE_ID		= 1;
	if(dataView.getItem(row).wayBillId != undefined) {
		window.open('SearchWayBillAction.do?pageId=5&eventId=3&wayBillId=' + dataView.getItem(row).wayBillId + '&NumberType=' + LR_SEARCH_TYPE_ID + '&BranchId=0');
	} 
}