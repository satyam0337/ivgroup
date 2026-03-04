define([  'JsonUtility'
	,'messageUtility'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/agentCommissionReport/agentCommissionReportfilepath.js'
	,'jquerylingua'
	,'language'
	,'autocomplete'
	,'slickGridWrapper2'
	,'nodvalidation'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/agentCommissionReport/bookingAndDeliveryLrdDetails.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/module/saveReportRequest.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
	
	],function(JsonUtility, MessageUtility, FilePath, Lingua, Language, BootstrapSwitch, slickGridWrapper2, NodValidation, FocusNavigation,
			 BootstrapModal, Selection,LRDetails,SaveReportRequest,UrlParameter,configuration) {
	'use strict';
	var jsonObject = new Object(), 
	myNod,  
	_this = '', 
	gridObject, 
	masterLangObj, 
	masterLangKeySet, 
	AgentCommissionReportConfig, 
	caLangObj,
	regionList,
	caLangKeySet,
	isFromCashStatement	= false,
	isGroupAdmin		= false,
	isRegionAdmin		= false,
	isSubRegionAdmin	= false,
	isNormalUser		= false,
	regionId		= 0,
	subRegionId		= 0;
	var sourceBranchId	= 0;
	var paymentType		= 0;
	var fromDate 	= null;
	var toDate		= null;

	
	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			
			isFromCashStatement	= UrlParameter.getModuleNameFromParam("isFromCashStatement")
			fromDate 			= UrlParameter.getModuleNameFromParam("fromDate")
			toDate 				= UrlParameter.getModuleNameFromParam("toDate")
			regionId 			= UrlParameter.getModuleNameFromParam("regionId")
			subRegionId 		= UrlParameter.getModuleNameFromParam("subRegionId")
			sourceBranchId 		= UrlParameter.getModuleNameFromParam("sourceBranchId")
			paymentType 		= UrlParameter.getModuleNameFromParam("paymentTypeId")
						
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/agentCommissionReportWS/getAgentCommissionReportElementConfiguration.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		},getElementConfigDetails : function(response){
			showLayer();
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			var executive				= response.executive;

			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/agentCommissionReport/AgentCommissionReport.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				var keyObject = Object.keys(response);
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]].show)
						$("*[data-attribute="+ keyObject[i]+ "]").addClass("show");
				}
				
				var elementConfiguration	= new Object();
				
				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
				
				response.elementConfiguration	= elementConfiguration;
				response.sourceAreaSelection	= true;
				response.isCalenderSelection	= true;
				response.isPhysicalBranchesShow	= true;
				configuration=response.AgentCommissionReportConfig;
				response.monthLimit				=configuration.monthLimitToShowDate;
				
				Selection.setSelectionToGetData(response);
				
				masterLangObj 		= FilePath.loadLanguage();
				masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				var options		= new Object();
				
				options.sixMonthDateRange	= response.AgentCommissionReportConfig.sixMonthDateRange;
				
				$("#dateEle").DatePickerCus(options);
				
				if (executive.executiveType == EXECUTIVE_TYPE_GROUPADMIN) {
						myNod.add({
							selector	: '#regionEle',
							validate	: 'validateAutocomplete:#regionEle_primary_key',
							errorMessage	: 'Select proper Region !'
						});

						myNod.add({
							selector	: '#subRegionEle',
							validate	: 'validateAutocomplete:#subRegionEle_primary_key',
							errorMessage	: 'Select proper Area !'
						});

						myNod.add({
							selector	: '#branchEle',
							validate	: 'validateAutocomplete:#branchEle_primary_key',
							errorMessage	: 'Select proper Branch !'
						});

						myNod.add({
							selector	: '#partNameEle',
							validate	: 'validateAutocomplete:#partyNameEle',
							errorMessage	: 'Enter Party name !'
						});
					}
					if (executive.executiveType == EXECUTIVE_TYPE_REGIONADMIN) {
						myNod.add({
							selector	: '#subRegionEle',
							validate	: 'validateAutocomplete:#subRegionEle_primary_key',
							errorMessage	: 'Select proper Area !'
					});

						myNod.add({
							selector	: '#branchEle',
							validate	: 'validateAutocomplete:#branchEle_primary_key',
							errorMessage	: 'Select proper Branch !'
						});
					}

					if (executive.executiveType == EXECUTIVE_TYPE_SUBREGIONADMIN ) {
						myNod.add({
							selector	: '#branchEle',
							validate	: 'validateAutocomplete:#branchEle_primary_key',
							errorMessage	: 'Select proper Branch !'
						});

					}
					
					
					hideLayer();
					
					if(isFromCashStatement != null && isFromCashStatement) {
					
					$("#dateEle").attr('data-startdate', fromDate);
					$("#dateEle").attr('data-enddate', toDate); 
					
					$("#dateEle").val(fromDate + ' - ' + toDate);
					
					setTimeout(() => {
						$('#subRegionEle_primary_key').val(subRegionId);
						$('#branchEle_primary_key').val(branchId);
					}, 200);
					
					if(response.regionList != undefined) {
						regionList	= response.regionList;
					}
					
					if(regionList != null ) {
						for(var i=0; i< regionList.length; i++) {
							if(regionList[i].regionId == regionId) {
								$("#regionEle").val(regionList[i].regionName);
								$('#regionEle_primary_key').val(regionList[i].regionId);
							}
						}
					}
					
					if(executive.executiveType == EXECUTIVE_TYPE_GROUPADMIN) {
						isGroupAdmin		= true;
					} else if(executive.executiveType == EXECUTIVE_TYPE_REGIONADMIN) {
						isRegionAdmin		= true;
					} else if(executive.executiveType == EXECUTIVE_TYPE_SUBREGIONADMIN) {
						isSubRegionAdmin	= true;	
					} else {
						isNormalUser		= true;
					}
					
					var cashStatementObj 	= 	new Object();

					cashStatementObj.isFromCashStatement	= isFromCashStatement;
					cashStatementObj.regionId				= regionId;
					cashStatementObj.subRegionId			= subRegionId;
					cashStatementObj.branchId				= sourceBranchId;
					cashStatementObj.subRegionEle			= $('#subRegionEle');
					cashStatementObj.branchEle				= $('#branchEle');
					cashStatementObj.isGroupAdmin			= isGroupAdmin;
					cashStatementObj.isRegionAdmin			= isRegionAdmin;
					cashStatementObj.isSubRegionAdmin		= isSubRegionAdmin;
					cashStatementObj.isNormalUser			= isNormalUser;
					
					Selection.setDropDownForCashStatementLink(cashStatementObj);
					
					_this.onSubmit();
				}
				
				$("#findBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid')) {
						_this.onSubmit(_this);								
					}
				});
				$("#sendRequest").click(function() {
					myNod.performCheck();
					if(myNod.areAll('valid')){
						saveReportRequest(7);	
					}
				});
				$('#maxDaysToFindReport').val(configuration.maxDaysToFindReport);
				$('#dateEle').change(function(){
					checkDate();
				});
				
			});

		},onSubmit : function() {
			showLayer();
			var jsonObject = new Object();
			
			if (isFromCashStatement != null && isFromCashStatement) {
				console.log;
				if (fromDate != null) {
					jsonObject["fromDate"] = fromDate;
				}
				if (toDate != null) {
					jsonObject["toDate"] = toDate;
				}

				jsonObject["regionId"] = regionId;
				jsonObject["subRegionId"] = subRegionId;
				jsonObject["branchId"] = sourceBranchId;
			} else {
				if ($("#dateEle").attr('data-startdate') != undefined) {
					jsonObject["fromDate"] = $("#dateEle").attr('data-startdate');
				}
				if ($("#dateEle").attr('data-enddate') != undefined) {
					jsonObject["toDate"] = $("#dateEle").attr('data-enddate');
				}
				jsonObject["regionId"] = $('#regionEle_primary_key').val();
				jsonObject["subRegionId"] = $('#subRegionEle_primary_key').val();
				jsonObject["branchId"] = $('#branchEle_primary_key').val();

			}			
			getJSON(jsonObject, WEB_SERVICE_URL+'/agentCommissionReportWS/getAgentBookingAndDeliveryCommission.do', _this.setReportData, EXECUTE_WITH_ERROR);
			
		},setReportData : function(response){
			isFromCashStatement	= false;
			
		if(response.AgentCommissionReportModel == undefined || response.AgentCommissionReportModel.CorporateAccount.length <= 0){
				showMessage('error', "NO Records Found");
				$('#bottom-border-boxshadow').hide();
				hideLayer();
			} 
			if(response.isAllowExpenseWiseReport) {
				if(response.AgentCommissionReportModel != undefined) {
					var agentCommissionReportColumnConfig		= response.AgentCommissionReportModel.columnConfiguration;
					var agentCommissionReportKeys				= _.keys(agentCommissionReportColumnConfig);
					var bcolConfig								= new Object();
					
					var NewAgentCommissionReportColumnKeys	= new Array();

					for(var i = 0;agentCommissionReportKeys.length > i; i++) {
						if(agentCommissionReportKeys[i] != 'voucherTotal')
							NewAgentCommissionReportColumnKeys.push(agentCommissionReportKeys[i]);
						else
							break;
					}

					if(response.ExpenseChargeHeader != undefined) {
						var expenseChargesNameHM	= response.ExpenseChargeHeader;
						for(var j in expenseChargesNameHM) {
							if(expenseChargesNameHM[j] != null) {
								NewAgentCommissionReportColumnKeys.push(expenseChargesNameHM[j].replace(/[' ',.,/]/g,""));
								agentCommissionReportColumnConfig[expenseChargesNameHM[j].replace(/[' ',.,/]/g,"")] = {	 
										"dataDtoKey":expenseChargesNameHM[j].replace(/[' ',.,/]/g,"")
										,"dataType":"number"
											,"languageKey":expenseChargesNameHM[j].replace(/[' ',.,/]/g,"")
											,"searchFilter":false
											,"listFilter":false
											,"columnHidden":false
											,"displayColumnTotal":true
											,"columnMinimumDisplayWidthInPx":70
											,"columnInitialDisplayWidthInPx":90
											,"columnMaximumDisplayWidthInPx":120
											,"columnPrintWidthInPercentage":8
											,"elementCssClass":""
												,"columnDisplayCssClass":""
													,"columnPrintCssClass":""
														,"sortColumn":true
														,"show":true
								};
								masterLangKeySet[expenseChargesNameHM[j].replace(/[' ',.,/]/g,"")] = expenseChargesNameHM[j].replace(/[' ',.,/]/g,"");
							}
						}
					}

					NewAgentCommissionReportColumnKeys = _.union(NewAgentCommissionReportColumnKeys, agentCommissionReportKeys);
					for (var i = 0; i < NewAgentCommissionReportColumnKeys.length; i++) {
						var bObj	= agentCommissionReportColumnConfig[NewAgentCommissionReportColumnKeys[i]];

						if(bObj != null) {
							if (bObj.show != undefined && bObj.show == true) {
								bcolConfig[NewAgentCommissionReportColumnKeys[i]] = bObj;
							}
						}
					}

					response.AgentCommissionReportModel.columnConfiguration		= bcolConfig;
					response.AgentCommissionReportModel.Language				= masterLangKeySet;
				}

				if(response.AgentCommissionReportModel.CorporateAccount != undefined && response.AgentCommissionReportModel.CorporateAccount.length > 0) {
					hideLayer();

					for(var i=0;response.AgentCommissionReportModel.CorporateAccount.length > i; i++) {
						var expenseChargesAmountHM	= response.ExpenseChargeHeader;
						for(var k in expenseChargesAmountHM) {
							if(expenseChargesAmountHM[k] != null) {
								response.AgentCommissionReportModel.CorporateAccount[i][expenseChargesAmountHM[k].replace(/[' ',.,/]/g,"")] = 0;
							}
						}
						if(response.AgentCommissionReportModel.CorporateAccount[i].expenseChargesAmountHM != undefined) {
							var expenseChargesAmountHM	= response.AgentCommissionReportModel.CorporateAccount[i].expenseChargesAmountHM;
							console.log('expenseChargesAmountHM --- ', expenseChargesAmountHM)
							for(var l in expenseChargesAmountHM) {
								if(l.split("_")[1] != undefined) {
									response.AgentCommissionReportModel.CorporateAccount[i][l.split("_")[1].replace(/[' ',.,/]/g,"")] = expenseChargesAmountHM[l];
								}
							} 
						}
					}

					$('#bottom-border-boxshadow').show();
					$('#agentCommissionReportDiv1').show();
					response.AgentCommissionReportModel.tableProperties.callBackFunctionForPartial = _this.getDetails;
					gridObject = slickGridWrapper2.setGrid(response.AgentCommissionReportModel);

					gridObject.onDblClick.subscribe(function (e, args){
						var cell 		= gridObject.getCellFromEvent(e)
						var row 		= cell.row;
						var dataView 	= gridObject.getData();
						var item 		= dataView.getItem(row);
						if(cell.cell == 1) {
							if(item.branchId != undefined && item.branchId > 0) {
								_this.getLRDetails(item.branchId,item.accountGroupId);
							} else {
								showMessage('error', 'Branch Not Found.');
							}
						}
					});
				}
			} else {
				if(response.AgentCommissionReportModel != undefined){
					$('#bottom-border-boxshadow').hide();
					var agentCommissionReportColumnConfig		= response.AgentCommissionReportModel.columnConfiguration;
					var agentCommissionReportKeys				= _.keys(agentCommissionReportColumnConfig);
					var bcolConfig								= new Object();

					for (var i=0; i<agentCommissionReportKeys.length; i++) {
						var bObj	= agentCommissionReportColumnConfig[agentCommissionReportKeys[i]];
						if (bObj.show == true) {
							bcolConfig[agentCommissionReportKeys[i]]	= bObj;
						}
					}

					response.AgentCommissionReportModel.columnConfiguration		= bcolConfig;
					response.AgentCommissionReportModel.Language				= masterLangKeySet;


					if(response.AgentCommissionReportModel.CorporateAccount != undefined && response.AgentCommissionReportModel.CorporateAccount.length > 0) {
						hideLayer();
						$('#bottom-border-boxshadow').show();
						$('#agentCommissionReportDiv1').show();
						response.AgentCommissionReportModel.tableProperties.callBackFunctionForPartial = _this.getDetails;
						
						gridObject = slickGridWrapper2.setGrid(response.AgentCommissionReportModel);
                        
                        if(!response.showLrDetails){
						gridObject.onDblClick.subscribe(function (e, args){
							var cell 		= gridObject.getCellFromEvent(e)
							var row 		= cell.row;
							var dataView 	= gridObject.getData();
							var item 		= dataView.getItem(row);
							if(cell.cell == 1) {
								if(item.branchId != undefined && item.branchId > 0) {
									_this.getLRDetails(item.branchId,item.accountGroupId);
								} else {
									showMessage('error', 'Branch Not Found.');
								}
							}
						});
						}
					}
				}
			}
			hideLayer();
		},getDetails:function(grid, dataView,row){
			hideLayer();
			if(dataView.getItem(row).branchId != undefined && dataView.getItem(row).branchId > 0) {
				_this.getLRDetails(dataView.getItem(row).branchId,dataView.getItem(row).accountGroupId);
			} else {
				showMessage('error', 'Branch Not Found.');
			}
			
		},getLRDetails: function(branchId,accountGroupId){
			hideLayer();
			var jsonObject = new Object();
			if($("#dateEle").attr('data-startdate') != undefined){
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
			}
			if($("#dateEle").attr('data-enddate') != undefined){
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
			}
			
			jsonObject["branchId"] = branchId;
			jsonObject["accountGroupId"] = accountGroupId;
			
			console.log("jsonObject new ",jsonObject);
			
			var object 				= new Object();
			object.jsonObject		= jsonObject;
			
			var btModal = new Backbone.BootstrapModal({
			content: new LRDetails(object),
			modalWidth : 80,
			title:'LR Details'

			}).open();
			
			object.btModal = btModal;
			new LRDetails(object)
			btModal.open();
			hideLayer();
		}
		
	});
	
});
function ValidateFormElement(type){
    if(type == 1 && !validateSelectedDate()){
    showMessage('error',"You can not find report for more than "+$('#maxDaysToFindReport').val()+" days , Please use request option !");
    return false;
    }
    return true;
    }
function setJsonData(jsonObject){
    
      if($("#dateEle").attr('data-startdate') != undefined){
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
			}

			if($("#dateEle").attr('data-enddate') != undefined){
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
			}

			if($("#dateEle").attr('data-startdate') != undefined){
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
			}
			if($("#dateEle").attr('data-enddate') != undefined){
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
			}
			
            jsonObject["regionId"] 			= $('#regionEle_primary_key').val();
			jsonObject["subRegionId"] 		= $('#subRegionEle_primary_key').val();
			jsonObject["branchId"] 			= $('#branchEle_primary_key').val();
			jsonObject["isExcel"]                     = true;
            jsonObject.filter                        = 7;
}
