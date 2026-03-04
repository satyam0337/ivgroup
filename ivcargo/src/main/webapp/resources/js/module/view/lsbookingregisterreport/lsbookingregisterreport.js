define([  
          PROJECT_IVUIRESOURCES + '/resources/js/module/view/lsbookingregisterreport/lsbookingregisterreportfilepath.js'
          ,'slickGridWrapper3'
           ,'slickGridWrapper2'
          ,PROJECT_IVUIRESOURCES + '/resources/js/module/generateconsolidateewaybill/consolidatedewaybill.js'
          ,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
		  ,PROJECT_IVUIRESOURCES + '/resources/js/module/generateConsolidateLsPrint/generateConsolidateLsPrint.js'
		 ,'JsonUtility'
          ,'messageUtility'
          ,'jquerylingua'
          ,'language'
          ,'autocomplete'
          ,'autocompleteWrapper'
          ,'selectizewrapper'
          ,'nodvalidation'
          ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
          ,'focusnavigation'//import in require.config
          ,PROJECT_IVUIRESOURCES+'/resources/js/module/saveReportRequest.js'
          ],function(FilePath, slickGridWrapper3,slickGridWrapper2, GenerateEWayBill, Selection, consolidatedLsPrint) {
	'use strict';
	let jsonObject = new Object(), myNod, tab = "createTab", _this = '', gridObject, crossingTypeComboBoxShow = false, masterLangObj, masterLangKeySet, configuration,crossingBranchIds,showLsSummaryButton=false,showDestinationWiseLsSummaryButton=false, showDownloadExelbutton = false,
	showLRWiseDownloadToExcelButton = false, showOnlyActiveVehicle = false;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/lsBookingRegisterReportWS/getLSBookingRegisterReportElement.do?', _this.renderLSBookingRegisterElements,	EXECUTE_WITHOUT_ERROR);
			return _this;
		},renderLSBookingRegisterElements : function(response){
			let loadelement = new Array();
			let baseHtml = new $.Deferred();
			showDownloadExelbutton = response.showDownloadExelbutton;
			showLRWiseDownloadToExcelButton = response.showLRWiseDownloadToExcelButton;
			showLsSummaryButton = response.showLsSummaryButton;
			showDestinationWiseLsSummaryButton = response.showDestinationWiseLsSummaryButton;
			showOnlyActiveVehicle		= response.showOnlyActiveVehicle;

			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/lsbookingregisterreport/LSBookingRegisterReport.html",function() {
				baseHtml.resolve();
			});
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				let keyObject = Object.keys(response);
				for (const element of keyObject) {
					if (element == 'crossingType' && response[element])
						crossingTypeComboBoxShow = true;
				
					if (response[element])
						$("*[data-attribute="+ element+ "]").removeClass("hide");
				}

				let elementConfiguration = {};
				
				elementConfiguration.dateElement		= $("#dateEle");
				elementConfiguration.regionElement		= $("#regionEle");
				elementConfiguration.subregionElement	= $("#subRegionEle");
				elementConfiguration.branchElement		= $("#branchEle");
				elementConfiguration.vehicleElement		= 'vehicleNumberEle';
				elementConfiguration.destSubregionElement	= $("#destSubRegionEle");
				elementConfiguration.destBranchElement		= $("#destBranchEle");
				elementConfiguration.destOperationalBranchElement		= $("#toOperationalBranchEle");
				elementConfiguration.divisionElement		= $('#divisionEle');
				elementConfiguration.showOnlyActiveVehicles 			= showOnlyActiveVehicle;
				response.sourceAreaSelection					= true;
				response.isCalenderSelection					= true;
				response.groupMergingVehicleSelection			= true;
				response.vehicleAgentSelection					= true;
				response.isToOperationalBranchSelection			= response.operationalBranchSelect;
				response.crossingAgentSelectionWithSelectize	= response.crossingAgent;
				response.divisionSelection						= response.division;
				
				response.elementConfiguration	= elementConfiguration;
				response.isPhysicalBranchesShow	= true;
				Selection.setSelectionToGetData(response);
				
				_this.setSelectType();
				
				masterLangObj = FilePath.loadLanguage();
				masterLangKeySet = loadLanguageWithParams(masterLangObj);
				
				response.destSubRegion = false;
				response.destBranch	= false;
				myNod = Selection.setNodElementForValidation(response);

				let lsTypeAutoComplete = new Object();
				lsTypeAutoComplete.primary_key = 'lsId';
				lsTypeAutoComplete.field = 'lsName';
				lsTypeAutoComplete.callBack = _this.onLSTypeSelect;
				lsTypeAutoComplete.keyupFunction = _this.onLSTypeSelect;
				$("#lsTypeEle").autocompleteCustom(lsTypeAutoComplete);

				setLSType();
				
				let crossingTypeAutoComplete = new Object();
				crossingTypeAutoComplete.primary_key = 'crossingId';
				crossingTypeAutoComplete.field = 'crossingName';
				$("#crossingLSEle").autocompleteCustom(crossingTypeAutoComplete);
				
				setCrossingLSType();
				
				if(showLRWiseDownloadToExcelButton) {
					$('#downloadToExcel').removeClass('hide');
					$('#selectTypeDiv').removeClass('hide');
				} else {
					$('#downloadToExcel').remove();
					$('#selectTypeDiv').remove();
				}

				if(showDownloadExelbutton)
					$('#downloadExcel').removeClass('hide');
				else
					$('#downloadExcel').remove();
				
				if(showLsSummaryButton)
					$('#summaryBtn').removeClass('hide');
				else
					$('#summaryBtn').remove();
					
				if(showDestinationWiseLsSummaryButton)
					$('#destSummaryBtn').removeClass('hide');
				else
					$('#destSummaryBtn').remove();

				hideLayer();

				$("#findBtn").click(function() {
					$('#summaryBtn').hide();
					$('#destSummaryBtn').hide();
					myNod.performCheck();

					if(myNod.areAll('valid'))
						_this.onSubmit(_this);								
				});
				$("#summaryBtn").click(function() {
					$('#findBtn').hide();
					$('#destSummaryBtn').hide();
					myNod.performCheck();

					if(myNod.areAll('valid'))
						_this.getSummaryData(_this);								
				});
				$("#destSummaryBtn").click(function() {
					$('#findBtn').hide();
					$('#summaryBtn').hide();
					myNod.performCheck();

					if(myNod.areAll('valid'))
						_this.getDestinationWiseSummaryData(_this);								
				});

				$("#sendRequest").click(function() {
					myNod.performCheck();

					if(myNod.areAll('valid'))
						saveReportRequest(4);	
				});

				configuration			= response;
				response.monthLimit		= response.monthLimitToShowDate;
				
				$('#maxDaysToFindReport').val(configuration.maxDaysToFindReport);
				
				$('#dateEle').change(function(){
					checkDate();
				});
				
				$("#downloadExcel").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmitForExcelDownload(_this);								
				});
				
				if(showLRWiseDownloadToExcelButton) {
					$("#downloadToExcel").click(function() {
						myNod.performCheck();
						
						if(myNod.areAll('valid'))
							_this.setExcelData();								
					});
				}
				
				$("#btnGCR").click(function() {
					response.isValidateSameVehicle = true;
					GenerateEWayBill.generateConsolidatedEwaybill(response);
				});
				
				let showTranshipmentButton = response.showTranshipmentButton;
				
				crossingBranchIds 	  	   = response.crossingBranchIds;
				
				if(showTranshipmentButton)
					$('#transhipmentBtn').show();
				
				$("#transhipmentBtn").click(function() {
					_this.getTranshipmentBranchData();								
				});
				
				let showGeneratePDFButton = response.showGeneratePDFButton;
				
				if(showGeneratePDFButton)
					$('#btnGRPDF').show();
				
				$("#btnGRPDF").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.setPDFData(_this);								
				});
				
				if(configuration.generateConsolidateLsPrint){
					$('#consolidateLsPrintDiv').removeClass('hide');
					$("#btnGCLSPrint").click(function() {
						_this.generateConsolidatedLsPrint();
					});
				}
			});
		},setReportData : function(response) {
			$('#bottom-border-boxshadow').addClass('hide');
			
			if(response.message != undefined) {
				hideLayer();
				$('#middle-border-boxshadow').addClass('hide');
				return;
			}
			
			if(configuration.showAllBookingCharges) {
				let lsBookingRegisterColumnConfig			= response.tableConfig.columnConfiguration;
				let lsBookingRegisterModelKeys				= _.keys(lsBookingRegisterColumnConfig);
				let colConfig								= new Object();
				let newLsBookingRegisterModelKeys	= new Array();
				
				for(let i = 0;lsBookingRegisterModelKeys.length > i; i++) {
					
					if(lsBookingRegisterModelKeys[i] != 'staticalCharge') {
						newLsBookingRegisterModelKeys.push(lsBookingRegisterModelKeys[i]);
					} else {
						break;
					}
					
				}
				if(response.chargesNameHM != undefined) {
					let chargesNameHM	= response.chargesNameHM;
					for(let j in chargesNameHM) {
						if(chargesNameHM[j] != null) {
							newLsBookingRegisterModelKeys.push(chargesNameHM[j].replace(/[' ',.,/]/g,""));
							lsBookingRegisterColumnConfig[chargesNameHM[j].replace(/[' ',.,/]/g,"")] = {
									"dataDtoKey":chargesNameHM[j].replace(/[' ',.,/]/g,"")
									,"dataType":"number"
										,"labelId":chargesNameHM[j].replace(/[' ',.,/]/g,"")
										,"searchFilter":true
										,"listFilter":true
										,"columnHidden":false
										,"displayColumnTotal":true
										,"columnMinimumDisplayWidthInPx":70
										,"columnInitialDisplayWidthInPx":90
										,"columnMaximumDisplayWidthInPx":90
										,"columnPrintWidthInPercentage":10
										,"elementCssClass":""
										,"columnDisplayCssClass":""
										,"columnPrintCssClass":""
										,"sortColumn":true
										,"show":true
							};
							masterLangKeySet[chargesNameHM[j].replace(/[' ',.,/]/g,"")] = chargesNameHM[j].replace(/[' ',.,/]/g,"");
						}
					}
				}
				newLsBookingRegisterModelKeys = _.union(newLsBookingRegisterModelKeys, lsBookingRegisterModelKeys);

				for (let i = 0; i < newLsBookingRegisterModelKeys.length; i++) {

					let bObj	= lsBookingRegisterColumnConfig[newLsBookingRegisterModelKeys[i]];

					if (bObj != null && bObj.show != undefined && bObj.show == true) {
						colConfig[newLsBookingRegisterModelKeys[i]] = bObj;
					}
				}

				response.tableConfig.columnConfiguration		= _.values(colConfig);
				response.tableConfig.Language					= masterLangKeySet;
				if(response.tableConfig.CorporateAccount != undefined && response.tableConfig.CorporateAccount.length > 0) {

					for(let i=0;response.tableConfig.CorporateAccount.length > i; i++) {
						if(response.tableConfig.CorporateAccount[i].chargesCollectionHM != undefined) {
							let chargesHM	= response.tableConfig.CorporateAccount[i].chargesCollectionHM;
							for(let l in chargesHM) {
								if(l.split("_")[1] != undefined) {
									response.tableConfig.CorporateAccount[i][l.split("_")[1].replace(/[' ',.,/]/g,"")] = chargesHM[l];
								}
							}
						}
					}
					
					response.tableConfig.CorporateAccount =	_.sortBy(response.tableConfig.CorporateAccount, 'tripDateTimeForString');
					$('#middle-border-boxshadow').removeClass('hide');
					hideAllMessages();

					gridObject = slickGridWrapper3.applyGrid(
							{
								ColumnHead					: response.tableConfig.columnConfiguration, // *compulsory // for table headers
								ColumnData					: _.values(response.tableConfig.CorporateAccount), 	// *compulsory // for table's data
								Language					: response.tableConfig.Language, 			// *compulsory for table's header row language
								ShowPrintButton				: true,
								ShowCheckBox				: true,
								removeSelectAllCheckBox		: 'false',
								fullTableHeight				: false,
								rowHeight 					: 	30,
								DivId						: 'billDetailsDiv',				// *compulsary field // division id where slickgrid table has to be created
								SerialNo:[{						// optional field // for showing Row number
									showSerialNo	: false,
									searchFilter	: false,          // for search filter on serial no
									ListFilter		: false				// for list filter on serial no
								}],
								InnerSlickId				: 'editReportDivInner', // Div Id
								InnerSlickHeight			: '350px',
								NoVerticalScrollBar			: false //optional for no vertical scrolling & if set true remove height attribute to Grid Div
							});

					if(configuration.showLsBookingRegisterByGrouping)
						slickGridWrapper3.setAggregateFunction(grid,configuration.lsBookingRegisterGroupedBy);
					
					if(configuration.showLsBookingRegisterByVehicleGrouping)
						slickGridWrapper3.setAggregateFunction(grid, configuration.lsBookingRegisterGroupedByVehicleNo);

					$('#middle-border-boxshadow').removeClass('hide');
				} else {
					$('#middle-border-boxshadow').addClass('hide');
				}
			} else {
				let ColumnConfig = response.tableConfig.columnConfiguration;
				let columnKeys	= _.keys(ColumnConfig);
				let bcolConfig	= new Object();

				for (const element of columnKeys) {

					if(response.showCommision == true){
						let bObj	= ColumnConfig[element];
						if (bObj.show) {
							bcolConfig[element] = bObj;
						}
					} else {
						let bObj	= ColumnConfig[element];
						if (bObj != null && element != 'commission' && bObj.show) {
							bcolConfig[element] = bObj;
						}
					}
				}
				
				response.tableConfig.columnConfiguration	= _.values(bcolConfig);
				response.tableConfig.Language				= masterLangKeySet;

				if(response.tableConfig.CorporateAccount != undefined) {
					response.tableConfig.CorporateAccount =	_.sortBy(response.tableConfig.CorporateAccount, 'tripDateTimeForString');
					$('#middle-border-boxshadow').removeClass('hide');
					hideAllMessages();
					gridObject = slickGridWrapper3.applyGrid(
							{
								ColumnHead					: response.tableConfig.columnConfiguration, // *compulsory // for table headers
								ColumnData					: _.values(response.tableConfig.CorporateAccount), 	// *compulsory // for table's data
								Language					: response.tableConfig.Language, 			// *compulsory for table's header row language
								ShowPrintButton				: true,
								ShowCheckBox				: true,
								removeSelectAllCheckBox		: 'false',
								fullTableHeight				: false,
								rowHeight 					: 	30,
								DivId						: 'billDetailsDiv',				// *compulsary field // division id where slickgrid table has to be created
								SerialNo:[{						// optional field // for showing Row number
									showSerialNo	: false,
									searchFilter	: false,          // for search filter on serial no
									ListFilter		: false				// for list filter on serial no
								}],
								InnerSlickId				: 'editReportDivInner', // Div Id
								InnerSlickHeight			: '350px',
								NoVerticalScrollBar			: false //optional for no vertical scrolling & if set true remove height attribute to Grid Div
							});

					if(configuration.showLsBookingRegisterByGrouping)
						slickGridWrapper3.setAggregateFunction(grid, configuration.lsBookingRegisterGroupedBy);
					
					if(configuration.showLsBookingRegisterByVehicleGrouping)
						slickGridWrapper3.setAggregateFunction(grid, configuration.lsBookingRegisterGroupedByVehicleNo);
				}
			}
			
			hideLayer();
		}, setSummaryData : function(response) {
			$('#middle-border-boxshadow').addClass('hide');
			hideLayer();

			if(response.message != undefined) {
				$('#bottom-border-boxshadow').addClass('hide');
				return;
			}

			$('#bottom-border-boxshadow').removeClass('hide');
			
			slickGridWrapper2.setGrid(response);
			
			hideLayer();
		}, setSelectType : function(){
			_this.setSelectTypeAutocompleteInstance();
			
			let autoSelectType = $("#selectTypeEle").getInstance();
			
			let SelectTYPE = [
				{ "selectTypeId":1, "selectTypeName": "INCOMING" },
				{ "selectTypeId":2, "selectTypeName": "OUTGOING" },
			]
			
			$( autoSelectType ).each(function() {
				this.option.source = SelectTYPE;
			})
		}, setSelectTypeAutocompleteInstance : function() {
			let autoSelectTypeName 			= new Object();
			autoSelectTypeName.primary_key 	= 'selectTypeId';
			autoSelectTypeName.field 		= 'selectTypeName';

			$("#selectTypeEle").autocompleteCustom(autoSelectTypeName)
		},onLSTypeSelect : function() {
			if(crossingTypeComboBoxShow){
				let lsType = $('#lsTypeEle_primary_key').val();
					if(lsType == 1){
						$('#crossingLSDiv').switchClass('hide','show');
						$('#crossingLSEle').val('');
						$('#crossingLSEle_primary_key').val("");
					} else {
						$('#crossingLSDiv').switchClass('show','hide');
						$('#crossingLSEle').val('');
						$('#crossingLSEle_primary_key').val("");
					}
			}
		}, setExcelData : function() {
			showLayer();
			let jsonObject	= _this.getSelectionData();

			jsonObject["selectTypeId"] 			= $('#selectTypeEle_primary_key').val();
			jsonObject["isExcel"] 				= true;
						
			getJSON(jsonObject, WEB_SERVICE_URL+'/lsBookingRegisterReportWS/generateLRRegisterReportExcel.do', _this.setExcelReportData, EXECUTE_WITH_ERROR);
		}, getSelectionData : function() {
			let jsonObject = Selection.getElementData();
			
			jsonObject["typeOfLS"] 				= $('#lsTypeEle_primary_key').val();
			jsonObject["typeOfCrossing"]		= $('#crossingLSEle_primary_key').val();
			jsonObject["operationalBranchId"] 	= $('#toOperationalBranchEle_primary_key').val();
			
			return jsonObject;
		},onSubmit : function() {
			showLayer();
			
			let jsonObject	= _this.getSelectionData();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/lsBookingRegisterReportWS/getLSBookingRegisterReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		},getSummaryData : function() {
			showLayer();
			
			let jsonObject	= _this.getSelectionData();
				jsonObject["showDestinationWiseSummaryData"] 				= false;

			getJSON(jsonObject, WEB_SERVICE_URL+'/report/lsSummaryReportWS/getLSSummaryReportDetails.do', _this.setSummaryData, EXECUTE_WITH_ERROR);
		},getDestinationWiseSummaryData : function() {
			showLayer();
			
			let jsonObject	= _this.getSelectionData();
				jsonObject["showDestinationWiseSummaryData"] 				= true;
			getJSON(jsonObject, WEB_SERVICE_URL+'/report/lsSummaryReportWS/getLSSummaryReportDetails.do', _this.setSummaryData, EXECUTE_WITH_ERROR);
		},getTranshipmentBranchData : function() {
			showLayer();
			let jsonObject	= _this.getSelectionData();
			
			jsonObject["regionId"] 				= 0;
			jsonObject["subRegionId"] 			= 0;
			jsonObject["branchIds"] 			= crossingBranchIds ;
			getJSON(jsonObject, WEB_SERVICE_URL+'/lsBookingRegisterReportWS/getLSBookingRegisterReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		},setPDFData : function() {
			showLayer();
			
			let jsonObject	= _this.getSelectionData();
			
			if($('#vehicleNumberEle_wrapper').exists() && $('#vehicleNumberEle_wrapper').is(":visible")) {
				var selectize 		= $('#vehicleNumberEle').get(0).selectize;
							
				if(selectize != undefined) {
					var option 			= selectize.options[ selectize.getValue() ];
					
					if(option != undefined)
						jsonObject["vehicleNumber"] = option.vehicleNumber;
				}
			}
			
			jsonObject["sourceBranchName"] 		= $('#branchEle').val();
			jsonObject["isPDF"] 				= true;
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/lsBookingRegisterReportWS/getLSBookingRegisterReportDetails.do', _this.responseForPDF, EXECUTE_WITH_ERROR);
		}, responseForPDF : function(data) {
			hideLayer();
				
			generateFileToDownload(data);
		}, onSubmitForExcelDownload : function() {
			showLayer();
			let jsonObject	= _this.getSelectionData();

			getJSON(jsonObject, WEB_SERVICE_URL+'/lsBookingRegisterReportWS/generateLSRRegisterReportExcel.do', _this.setExcelReportData, EXECUTE_WITH_ERROR);
		},setExcelReportData : function(response){
			let data = response;
			if(data.message.messageId == 21){
        		hideLayer();
        		return false;
        	}
        	
        	if(data.message != undefined) {
				hideLayer();
				generateFileToDownload(data);
        	}
			hideLayer();
		},generateConsolidatedLsPrint : function(){
			var selectionMsg		= ' Please, Select atleast 1 LS for Consolidate Print !';
			var selectedLSDetails	= slickGridWrapper3.getValueForSelectedData({InnerSlickId : 'editReportDivInner'}, selectionMsg);
			
			if(typeof selectedLSDetails == 'undefined')
				return;

			var selectedLSDetailsLength	= selectedLSDetails.length;
			var dispatchLedgerIds	= [];
			var dayDifference		= configuration.consolidateLsPrintDateDiff; // Max 2 days difference allowed

			if(selectedLSDetailsLength > 0) {
				let minDate = null;
				let maxDate = null;
				for(var i = 0; i < selectedLSDetailsLength; i++) {
					if(selectedLSDetails[0].vehicleNumber != selectedLSDetails[i].vehicleNumber) {
						showMessage("info", "You can not Generate Consolidated Print for Different Vehicle Number !");
						return;
					}
					
					if(selectedLSDetails[i].dispatchLedgerId != undefined)
						dispatchLedgerIds.push(selectedLSDetails[i].dispatchLedgerId);
					
					const time = selectedLSDetails[i].tripDateTimeForString;
					if (!minDate || time < minDate) minDate = time;
					if (!maxDate || time > maxDate) maxDate = time;
				}
				
				if (isDateDifferenceAllowed(minDate, maxDate, dayDifference)) {
					showMessage("info", `You can not Generate Consolidated Print. Date difference is more than ${dayDifference} days!`);
					return;
				}
				
				window.open('prints.do?pageId=340&eventId=10&modulename=generateConsolidateLsPrint&&dispatchLedgerIds='+dispatchLedgerIds.join(','));
			}
		}
	});
});
function setLSType(){
	let lsTypes = '{ "lsTypeArr" : [' +
	'{ "lsId":"3" , "lsName":"InterBranch" },' +
	'{ "lsId":"1" , "lsName":"LS" },' +
	'{ "lsId":"-1" , "lsName":"ALL" } ]}';

	let obj = JSON.parse(lsTypes);
	let autoLSName = $("#lsTypeEle").getInstance();
	$(autoLSName).each(function() {
		this.option.source = obj.lsTypeArr;
	});
}

function setCrossingLSType(){
	let crossingTypes = '{ "crossingTypeArr" : [' +
	'{ "crossingId":"2" , "crossingName":"Crossing" },' +
	'{ "crossingId":"1" , "crossingName":"Normal" },' +
	'{ "crossingId":"-1" , "crossingName":"ALL" } ]}';
	
	let obj = JSON.parse(crossingTypes);
	let autoCrossingLSName = $("#crossingLSEle").getInstance();
	$(autoCrossingLSName).each(function() {
		this.option.source = obj.crossingTypeArr;
	});
}

function lsprint(grid,dataView,row){
	let dispatchLedgerId	= 0;
	
	if(dataView.getItem(row).dispatchLedgerId != undefined && dataView.getItem(row).dispatchLedgerId > 0){
		dispatchLedgerId = dataView.getItem(row).dispatchLedgerId;
	} else if(dataView.getItem(row).lsNumber != undefined && dataView.getItem(row).lsNumber > 0) {
		dispatchLedgerId = dataView.getItem(row).lsNumber;
	}
	
	window.open('Reports.do?pageId=11&eventId=3&dispatchLedgerId='+dispatchLedgerId+'&Type=Dispatched&isDispatchForOwnGroup=true','','location=0, status=0 ,scrollbars=1, width=800, height=600, resizable=1');
}

function ValidateFormElement(type){
	if(type == 1 && !validateSelectedDate()){
		showMessage('error',"You can not find report for more than "+$('#maxDaysToFindReport').val()+" days , Please use request option !");
		return false;
	}

	return true;
}

function downloadToExcelLoadingSheet(grid,dataView,row) {
	let data = new Object();
	
	data.dispatchLedgerId	= dataView.getItem(row).dispatchLedgerId;
	
	showLayer();
	
	$.ajax({
	      type: "POST",
	      url: WEB_SERVICE_URL+"/dispatchWs/getDispatchPrintExcel.do?",
	      data: data,
	      dataType: "json",
	      success: function(resultData) {
	    	  hideLayer();
	    	  
	    	  if(resultData.message != undefined) {
				let errorMessage = resultData.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				hideLayer();
					
				generateFileToDownload(resultData);
	        }
	      }, error: function(result){
	    	  hideLayer();
	    	  showMessage('error', 'Something Really Bad Happened !');
	      }
	});
}


function updateStatusSettled(grid,dataView,row) {
	showLayer();
	let data = new Object();
	let item = dataView.getItem(row); 
	
	data.dispatchLedgerId	= item.dispatchLedgerId;
	
	$.ajax({
		      type: "POST",
		      url: WEB_SERVICE_URL+"/lsBookingRegisterReportWS/updateStatusSettledDetails.do?",
		      data: data,
		      dataType: "json",
		      success: function(resultData) {
		    	  hideLayer();
		    	  
		    	  if(resultData.message !== undefined) {
					let errorMessage = resultData.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					hideLayer();
						
		        }
		      }, error: function(result){
		    	  hideLayer();
		    	  showMessage('error', 'Something Really Bad Happened !');
		      }
		});

}

