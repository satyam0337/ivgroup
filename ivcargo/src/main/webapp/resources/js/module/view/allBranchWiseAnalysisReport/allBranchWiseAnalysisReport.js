define([ 
		'JsonUtility'
	    ,'messageUtility'
	    ,PROJECT_IVUIRESOURCES + '/resources/js/module/view/allBranchWiseAnalysisReport/allBranchWiseAnalysisReportfilepath.js'
	    ,'jquerylingua'
	    ,'language'
	    ,'autocomplete'
	    ,'autocompleteWrapper'
	    ,'slickGridWrapper2'
	    ,'selectizewrapper'
	    ,'nodvalidation'
	    ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	    ,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
	    ,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	    ,'focusnavigation'//import in require.config
	    ,PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
       ],function (JsonUtility, MessageUtility, FilePath, Lingua, Language, AutoComplete, AutoCompleteWrapper, slickGridWrapper2, 
    		   Selectizewrapper, NodValidation, BootstrapModal, datePickerUI, Selection, ElementFocusNavigation, UrlParameter) {
		'use strict';
		var jsonObject = new Object(), myNod, _thisRender = '', masterLangObj, wayBillTypeConstantList;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_thisRender = this;
		}, render : function() {
			getJSON(null, WEB_SERVICE_URL + '/allBranchWiseAnalysisReportWS/getAllBranchWiseAnalysisReportElement.do?',	_thisRender.loadViewForReport, EXECUTE_WITHOUT_ERROR);
			return _thisRender;
		}, loadViewForReport : function(response) {
			hideLayer();
			if(response.message != undefined) {
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}
			
			var loadelement		= new Array();
			var baseHtml		= new $.Deferred();
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load( "/ivcargo/html/report/allBranchWiseAnalysisReport/AllBranchWiseAnalysisReport.html" , function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				var keyObject = Object.keys(response);
				
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]].show == false) {
						$("*[data-attribute="+ keyObject[i]+ "]").addClass("hide");
					}
				}
				
				executive			= response.executive;
				
				var elementConfiguration	= new Object();
				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
				elementConfiguration.wayBillTypeElement	= $('#wayBillTypeEle');
				
				wayBillTypeConstantList	= response.WayBillTypeConstantList;
				wayBillTypeConstantList.splice(2, 1);
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	wayBillTypeConstantList,
					valueField		:	'wayBillTypeId',
					labelField		:	'wayBillType',
					searchField		:	'wayBillType',
					elementId		:	'wayBillTypeEle',
					create			: 	false,
					maxItems		: 	1
				});
				
				response.elementConfiguration		= elementConfiguration;
				response.isCalenderSelection		= true;
				response.isOneYearCalenderSelection	= false;
				response.monthLimit					= 12;
				response.sourceAreaSelection		= true;
				
				Selection.setSelectionToGetData(response);
				masterLangObj 		= FilePath.loadLanguage();
				loadLanguageWithParams(masterLangObj);
					
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				if($('#regionEle').is(":visible")){
					myNod.add({
						selector: '#regionEle',
						validate: 'validateAutocomplete:#regionEle_primary_key',
						errorMessage: 'Select proper Region !'
					});
				}

				if($('#subRegionEle').is(":visible")){
					myNod.add({
						selector: '#subRegionEle',
						validate: 'validateAutocomplete:#subRegionEle_primary_key',
						errorMessage: 'Select proper Area !'
					});
				}

				if($('#branchEle').is(":visible")){
					myNod.add({
						selector: '#branchEle',
						validate: 'validateAutocomplete:#branchEle_primary_key',
						errorMessage: 'Select proper Branch !'
					});
				}
				
				myNod.add({
					selector		: '#wayBillTypeEle',
					validate		: 'presence:#wayBillTypeEle',
					errorMessage	: 'Select LR Type.'
				});
				
				hideLayer();
				
				$("#searchBtn").click(function(){
					myNod.performCheck();
					if(myNod.areAll('valid')){
						_thisRender.onSubmit();
					}
				});
			});
			
		},onSubmit:function() {
			
			showLayer();
			var jsonObject = new Object();
			if($("#dateEle").attr('data-startdate') != undefined){
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
			}

			if($("#dateEle").attr('data-enddate') != undefined){
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
			}
			jsonObject["regionId"] 					= $('#regionEle_primary_key').val();
			jsonObject["subRegionId"] 				= $('#subRegionEle_primary_key').val();
			jsonObject["sourceBranchId"] 			= $('#branchEle_primary_key').val();
			jsonObject["wayBillTypeId"] 			= $('#wayBillTypeEle').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/allBranchWiseAnalysisReportWS/getAllBranchWiseAnalysisReportDetails.do?', _thisRender.setReportData, EXECUTE_WITH_ERROR);
		}, setReportData:function(response) {
			if(response.message != undefined) {
				hideLayer();
				$('#middle-border-boxshadow').addClass('hide');
				
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}
			
			var finalBranchWiseHM		= response.finalBranchWiseHM;
			var wayBillStatusHM			= response.wayBillStatusList;
			var wayBillTypeHM			= response.wayBillTypeHM;
			var statusAndLRTypeAmountHM	= response.statusAndLRTypeAmountHM;
			var branchAndLRTypeAmountHM	= response.branchAndLRTypeAmountHM;
			var branch 					= response.branch;
			var accountGroup 			= response.accountGroup;
			$("#printAllBranchWiseAnalysisReport").empty();
			$('#reportDetailsTable thead').empty();
			$('#reportDetailsTable').empty();
			var columnHeadArray			= new Array(); 
			var columnHeadSubArray 		= new Array(); 
			columnHeadArray.push("<th rowspan='3' style='text-align: center; vertical-align: middle;'>BRANCH NAME</th>");
			
			for(const element of wayBillStatusHM) {
				var wbStatusConstant		= element;
				var wayBillStatusName		= wbStatusConstant.wayBillStatusName;
				columnHeadArray.push("<th  colspan='3' style='text-align: center; vertical-align: middle;'>" + wayBillStatusName + "</th>");
				
				for(var wayBillTypeId in wayBillTypeHM) {
					columnHeadSubArray.push("<th style='text-align: center; vertical-align: middle;top: 34px;'>" + wayBillTypeHM[wayBillTypeId] + "</th>");
				}
			}
		
			$('#reportDetailsTable').append('<thead><tr id=""  class="text-info text-center first">' + columnHeadArray.join(' ') + '</tr><tr id=""  class="text-success text-center second">' + columnHeadSubArray.join(' ') + '</tr></thead>');
			
			var	branchIdAndName		= null;
			var	branchId			= 0;
			var	branchIds			= 0;
			var branchName			= null;
			var wayBillTypeId		= 0;
			var wayBillTypeIdForPaid = 1;
			var wayBillTypeIdForToPay = 2;
			var wayBillTypeIdForTbb = 4;
			var paidAmt				= 0;
			var toPayAmt			= 0;
			var tbbAmt				= 0;
			var count				= 0;
			var statusId     		= 0;
			
			for(branchIdAndName in finalBranchWiseHM) {
				var statusWiseHm = finalBranchWiseHM[branchIdAndName];
				var branchId		= branchIdAndName.split("_")[1];
				var branchName		= branchIdAndName.split("_")[0];
				
				if(count % 2 == 0)
					var insideHeaderRow			= createRowInTable('', 'danger', '');
				else
					var insideHeaderRow			= createRowInTable('', 'primary', '');
				
				var branchNameCol			= createColumnInRow(insideHeaderRow, '', '', '', '', '', '');
				appendValueInTableCol(branchNameCol, branchName);
				
				for(var i = 0; i < wayBillStatusHM.length; i++) {
					var wbStatusConstant		= wayBillStatusHM[i];
					var status					= wbStatusConstant.wayBillStatusId;
					var wayBillStatusName		= wbStatusConstant.wayBillStatusName;
					
					if(status == 0) {
						for(var wayBillTypeId in wayBillTypeHM) {
							var amount = 0;
							
							if(branchAndLRTypeAmountHM.hasOwnProperty(branchId + "_" + wayBillTypeId)) {
								amount = branchAndLRTypeAmountHM[branchId + "_" + wayBillTypeId];
							}
							
							if(wayBillTypeId == WAYBILL_TYPE_PAID) {
								paidAmt	 +=	amount;
							} else if(wayBillTypeId == WAYBILL_TYPE_TO_PAY) {
								toPayAmt += amount;
							} else if(wayBillTypeId == WAYBILL_TYPE_CREDIT) {
								tbbAmt 	+= amount;
							}
							
							var paidCol	= createColumnInRow(insideHeaderRow, '', '', '', 'center', '', '');
							
							if(amount > 0)
								appendValueInTableCol(paidCol, '<span style="color : blue;  height: 10%; cursor : pointer;" onclick ="getBranchWiseLrTypeDetails(this)" id = "' + branchId + "_" + status + "_" + wayBillTypeId + '">' + Math.round(amount) + '</span>');
							else
								appendValueInTableCol(paidCol, amount);
						}
					} else {
						if(statusWiseHm.hasOwnProperty(status)) {
							var wayBillTypeWiseHM = statusWiseHm[status];

							for(var wayBillTypeId in wayBillTypeHM) {
								var lrTypeCol	= createColumnInRow(insideHeaderRow, '', '', '', 'center', '', '');
								var amount	= 0;

								if(wayBillTypeWiseHM.hasOwnProperty(wayBillTypeId)) {
									amount = wayBillTypeWiseHM[wayBillTypeId];
								}

								if(amount > 0)
									appendValueInTableCol(lrTypeCol, '<span style="color : blue;  height: 10%; cursor : pointer;" onclick ="getBranchWiseLrTypeDetails(this)" id = "' + branchId + "_" + status + "_" + wayBillTypeId + '">' + Math.round(amount) + '</span>');
								else
									appendValueInTableCol(lrTypeCol, amount);  
							}
						} else {
							for(var wayBillTypeId in wayBillTypeHM) {
								var lrTypeCol	= createColumnInRow(insideHeaderRow, '', '', '', 'center', '', '');
								appendValueInTableCol(lrTypeCol, 0);
							}
						}
					}
				}
				appendRowInTable('reportDetailsTable', insideHeaderRow);
				count++;
			}
			
			var tableFooter		= createRowInTable('', '', '');
			
			var totalCol		= createColumnInRow(tableFooter, '', '', '', 'center', 'background-color: aliceblue;');
			var totalPaidCol	= createColumnInRow(tableFooter, '', '', '', 'center', 'background-color: aliceblue;');
			var totalTopayCol	= createColumnInRow(tableFooter, '', '', '', 'center', 'background-color: aliceblue;');
			var totalTBBCol		= createColumnInRow(tableFooter, '', '', '', 'center', 'background-color: aliceblue;');
			
			appendValueInTableCol(totalCol, '<span style="font-weight : bold;color : #31708f;  height: 10%;">GRAND TOTAL</span>');
			appendValueInTableCol(totalPaidCol, '<span style="color : blue; cursor : pointer;  height: 10%;" onclick ="getBranchWiseLrTypeDetails(this)" id = "' + branchIds + "_" + statusId + "_" + wayBillTypeIdForPaid + '">'+Math.round(paidAmt)+'</span>');
			appendValueInTableCol(totalTopayCol, '<span style="color : blue; cursor : pointer;  height: 10%;" onclick ="getBranchWiseLrTypeDetails(this)" id = "' + branchIds + "_" + statusId + "_" + wayBillTypeIdForToPay + '">'+Math.round(toPayAmt)+'</span>');
			appendValueInTableCol(totalTBBCol, '<span style="color : blue; cursor : pointer;  height: 10%;" onclick ="getBranchWiseLrTypeDetails(this)" id = "' + branchIds + "_" + statusId + "_" + wayBillTypeIdForTbb + '">'+Math.round(tbbAmt)+'</span>');
			
			for(var i = 0; i < wayBillStatusHM.length; i++) {
				var wbStatusConstant		= wayBillStatusHM[i];
				var status					= wbStatusConstant.wayBillStatusId;

				if(status != 0) {
					for(var wayBillTypeId in wayBillTypeHM) {
						var paidCol	= createColumnInRow(tableFooter, '', '', '', 'center', 'background-color: aliceblue;');
						var amount = 0;
						if(statusAndLRTypeAmountHM.hasOwnProperty(status + "_" + wayBillTypeId)) {
							amount	= statusAndLRTypeAmountHM[status + "_" + wayBillTypeId];
						}
						appendValueInTableCol(paidCol, '<span style="color : blue; cursor : pointer;  height: 10%;" onclick ="getBranchWiseLrTypeDetails(this)" id = "' + branchIds + "_" + status + "_" + wayBillTypeId + '">'+Math.round(amount)+'</span>');
					}
				}
			}
			appendRowInTable('reportDetailsTable', tableFooter);
			$('#middle-border-boxshadow').removeClass('hide');
			hideLayer();
			
			var data = new Object();
			data.accountGroupNameForPrint	= accountGroup.accountGroupDescription;
			data.branchAddress				= branch.branchAddress;
			data.branchPhoneNumber			= branch.branchContactDetailPhoneNumber;
			data.isLaserPrintAllow			= 'true';
			data.isPlainPrintAllow			= 'true';
			data.isExcelButtonDisplay		= 'true';
			data.isPdfButtonDisplay			= 'false';
			printTable(data, 'reportData', 'allBranchWiseAnalysisReport', 'All Branch Wise Analysis Report', 'printAllBranchWiseAnalysisReport');
		} 
	});
});


function getBranchWiseLrTypeDetails(obj){
	showLayer();
	var jsonObject = new Object();
	if($("#dateEle").attr('data-startdate') != undefined){
		jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
	}

	if($("#dateEle").attr('data-enddate') != undefined){
		jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
	}
	
	if((obj.id).split('_')[0] > 0)
		jsonObject["sourceBranchId"] 	= (obj.id).split('_')[0];
	else
		jsonObject["sourceBranchId"] 	= $('#branchEle_primary_key').val();
	
	jsonObject["regionId"] 			= $('#regionEle_primary_key').val();
	jsonObject["subRegionId"] 		= $('#subRegionEle_primary_key').val();
	jsonObject["wayBillStatusId"] 	= (obj.id).split('_')[1]; 
	jsonObject["wayBillTypeId"] 	= (obj.id).split('_')[2]; 
	
	require([PROJECT_IVUIRESOURCES + '/resources/js/module/view/allBranchWiseAnalysisReport/allBranchWiseAnalysisLRDetails.js'], function(LRDetails){
		var btModal = new Backbone.BootstrapModal({
			content		: new LRDetails(jsonObject),
			modalWidth 	: 80,
			okText		: 'Close',
			showFooter 	: true,
			title		: '<center>LR Details</center>'

		}).open();
	});
}

function transportSearch(grid,dataView,row){
	var LR_SEARCH_TYPE_ID		= 1;
	if(dataView.getItem(row).wayBillId != undefined) {
		window.open('SearchWayBillAction.do?pageId=5&eventId=3&wayBillId=' + dataView.getItem(row).wayBillId + '&NumberType=' + LR_SEARCH_TYPE_ID + '&BranchId=0');
	} 
}