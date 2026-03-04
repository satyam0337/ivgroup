define (['language',
	'jquerylingua',
	PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatchlsprint/dispatchlsprintdestinationwisefilepath.js',
	PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatchlsprint/dispatchlsprintsummarydestinationwisefilepath.js',
	PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatchlsprint/dispatchlslrformdetailsfilepath.js',
	PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatchlsprint/dispatchlhpvsummaryfilepath.js',
	PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatchlsprint/dispatchpartiallsdetailsfilepath.js'],
	function(Language, JqueryLingua, FilePath, SummaryFilePath, FormFilePath, LHPVSummaryFilePath, PartialLRSummary){
	'use strict'; // Necessary Imports
	var totalgrandactualWeight	= 0;
	var _this;
	var LORRY_HIRE			= 4;
	var ADVANCE_AMOUNT		= 5;
	var BALANCE_AMOUNT		= 6;
	var WAYBILL_TYPE_TOPAY	= 2;
	var count				= 0;
	var totalRow			= 0;
	var remarkRow			= "";
	var printType			= 1;
	var rowsPerPage			= 72;
	var rowsPerPageSummary	= 30;
	var headerPrint			= true;
	var pageWiseHeader		= false;
	var lsSrcBranch 		= null;
	var lsDestBranch 		= null;
	var rateDifferenceModelArrList = null;
	var totalActualWt = 0;
	var totalWeightColumnForNml	= false;
	
	var WayBillTypeConstant	= null;
	return ({
		setDataForView : function (responseObj){
		}, setDefaultPrint:function(responseObj,printType) {
			showLayer();
			_this = this;
			var loadelement = new Array();
			var baseHtml 	= new $.Deferred();
			loadelement.push(baseHtml);

			var printType  = printType;
			totalWeightColumnForNml				= responseObj.FlavorConfiguration.totalWeightForNml;
			
			if(printType != undefined && printType == 'dummyLs'){
				$("#lsPrintDiv").load("/ivcargo/html/print/dispatch/dummyLs_233.html", function() {
					baseHtml.resolve();
				});
			} else {
				$("#mainContent").load("/ivcargo/html/print/dispatch/"+responseObj.FlavorConfiguration.dispatchLsSummaryPrintFlavor+".html", function() {
					baseHtml.resolve();
				});
			}
			
			$.when.apply($, loadelement).done(function() {
				var collection 							= responseObj.PrintHeaderModel;
				var dispatchData 						= responseObj.dispatchLRSummary;
				var dispatchLSLRCharge 					= responseObj.dispatchLSLRCharge
				var lhpvChargeList 						= responseObj.lhpvChargeList;
				var dispatchLSHeader					= responseObj.dispatchLSHeader;
				var dispatchLSLRFormSummary 			= responseObj.dispatchLSLRFormSummary;
				var showPartialLSDetailsSummary 		= responseObj.showPartialLSDetailsSummary;
				rateDifferenceModelArrList				= responseObj.rateDifferenceModelArrList;
				lsSrcBranch 							= responseObj.lsSrcBranch;
				lsDestBranch 							= responseObj.lsDestBranch;
				WayBillTypeConstant						= responseObj.WayBillTypeConstant;
				totalActualWt							= responseObj.totalActualWeight;
				var dispatchDataAccountGroupWise 		= new Object();
				var dispatchLSHeaderAccountGroupWise	= new Object();
				var groupDataObject 					= new Object();
				var displayData 						= new Array();
				var dispatchLSLRFormSummaryAccountGroupWise = new Object();
				var groupDataArrayObject;
				
				totalgrandactualWeight 					= _this.getTotalWeight(dispatchData);
				
				_.mapObject(collection,function(groupData,key){
					groupDataArrayObject = groupDataObject[groupData.accountGroupName];
					if(groupDataArrayObject == undefined){
						groupDataArrayObject = new Array();
					}
					groupDataObject[groupData.accountGroupName] = groupData;

					groupDataArrayObject = dispatchDataAccountGroupWise[groupData.accountGroupName];
					if(groupDataArrayObject == undefined){
						groupDataArrayObject = new Array();
					}
					var newObj = new Object();
					
					_.mapObject(dispatchData[key],function(sourceBranchData,sourceBranchId){
						newObj[sourceBranchId] = sourceBranchData;
					})
					
					groupDataArrayObject.push(newObj);
					dispatchDataAccountGroupWise[groupData.accountGroupName] = groupDataArrayObject;

					groupDataArrayObject = dispatchLSHeaderAccountGroupWise[groupData.accountGroupName];
					if(groupDataArrayObject == undefined){
						groupDataArrayObject = new Array();
					}
					var newObj = new Object();
					_.mapObject(dispatchLSHeader[key],function(sourceBranchData,sourceBranchId){
						newObj[sourceBranchId] = sourceBranchData;
					})
					groupDataArrayObject.push(newObj);
					dispatchLSHeaderAccountGroupWise[groupData.accountGroupName] = groupDataArrayObject;
					
					if(dispatchLSLRFormSummary[key].length > 0){
						groupDataArrayObject = dispatchLSLRFormSummaryAccountGroupWise[groupData.accountGroupName];
						if(groupDataArrayObject == undefined){
							groupDataArrayObject = new Array();
						}
						var newObj = new Object();
						_.mapObject(dispatchLSLRFormSummary[key],function(sourceBranchData,sourceBranchId){
							newObj[sourceBranchId] = sourceBranchData;
						})
						groupDataArrayObject.push(newObj);
						dispatchLSLRFormSummaryAccountGroupWise[groupData.accountGroupName] = groupDataArrayObject; 
					}

				});
				var accountGroupKey			= Object.keys(groupDataObject);
				for(var key in accountGroupKey){
					
					_this.setHeaderWiseData(key,accountGroupKey.length,dispatchData,groupDataObject[accountGroupKey[key]],dispatchDataAccountGroupWise[accountGroupKey[key]],dispatchDataAccountGroupWise[accountGroupKey[key]],dispatchLSLRCharge,dispatchLSHeaderAccountGroupWise[accountGroupKey[key]],dispatchLSLRFormSummaryAccountGroupWise[accountGroupKey[key]],showPartialLSDetailsSummary,displayData,lhpvChargeList,printType);
				}
				hideLayer();
					setTimeout(function(){
					window.print();
					},200);
			});
				
		}, setHeaderWiseData : function (iteration,totalGroup,dispatchData,groupData,contentCollection,dispatchDataAccountGroupWise,dispatchLSLRCharge,dispatchLSHeaderAccountGroupWise,dispatchLSLRFormSummaryAccountGroupWise,showPartialLSDetailsSummary,displayData,lhpvChargeList,printType){
			totalRow						= 0;
			headerPrint						= true;
			var groupHeaderWiseTable		= $(".lsPrintTable");
			var tableObjTr					= $('<tr id='+(groupData.accountGroupName).split(" ")[0]+' class="page-break marginTop"></tr>');
			var dataHeder					= $("*[data-row-header='']").clone();
			var destinationWiseCollection 	= new Object();
			var destinationKeyVal 			= new Object();
			var partialCollection 			= new Array();
			var dataTableRows 				= new Array();
			var contentFinalObj 			= new Object();
			var jsonArray;
			
			_.each(contentCollection,function(content){
				_.mapObject(content,function(jsonCheck,key){
					jsonArray 		= contentFinalObj[key];
					if(jsonArray == undefined){
						jsonArray = new Array();
					}
					_.each(jsonCheck,function(dataIndex){
						jsonArray.push(dataIndex);
					})
					contentFinalObj[key] = _.sortBy(jsonArray, 'wayBillNumber');;
				})
			})
			
			_.mapObject(contentFinalObj,function(data,key){
				_.each(data,function(destinationData){
					var dispatchCharges = dispatchLSLRCharge[destinationData.wayBillId+""];
					if(dispatchCharges  == undefined){
						destinationData['wayBillVasuliAmount'] 		= 0;
						destinationData['wayBillOtherAmount'] 		= 0;
						destinationData['wayBillServiceTaxAmount'] 	= 0;
						destinationData['wayBillCarrierRiskAmount']	= 0;
						destinationData['wayBillType'] 				= "FOC";
					} else {
						for (var k = 0; k < dispatchCharges.length; k++) {
							destinationData['wayBillVasuliAmount'] 		= Math.round(dispatchCharges[k].wayBillVasuliAmount);
							destinationData['wayBillOtherAmount'] 		= Math.round(dispatchCharges[k].wayBillOtherAmount);
							destinationData['wayBillServiceTaxAmount'] 	= Math.round(dispatchCharges[k].wayBillServiceTaxAmount);
							destinationData['wayBillCarrierRiskAmount']	= Math.round(dispatchCharges[k].wayBillCarrierRiskAmount) + Math.round(dispatchCharges[k].wayBillCrInsurAmount);
							destinationData['wayBillBHAmount']			= Math.round(dispatchCharges[k].wayBillBHAmount);
							destinationData['chargeAmount']				= Math.round(dispatchCharges[k].chargeAmount);
						}
					}
					
					destinationData['wayBillDestinationBranchAbrvtinCode']	= destinationData.wayBillSourceBranchName;
					destinationKeyVal[destinationData['wayBillDestinationBranchId']] = destinationData['wayBillDestinationBranchName'];
					
					if(destinationData.partial)
						partialCollection.push(destinationData);
				})
			})
			
			var destinationCollection = new Object();
			_.mapObject(contentFinalObj,function(data,key){
				destinationCollection[destinationKeyVal[key]] = data;
			})
			var destination = _.keys(destinationCollection);
			var destinationWisekeys = destination.sort()

			var finalObj = new Object();
			_.each(destinationWisekeys,function(destionationBranch){
				finalObj[destionationBranch] = destinationCollection[destionationBranch];
			})
			_.mapObject(finalObj,function(data,key){
				destinationWiseCollection[key]		= data;
			})
			
			displayData  = _this.setHeader(dispatchLSHeaderAccountGroupWise,groupData,dispatchLSLRCharge,tableObjTr,groupHeaderWiseTable,dispatchDataAccountGroupWise,displayData,dispatchLSLRFormSummaryAccountGroupWise,partialCollection,lhpvChargeList,destinationWiseCollection,printType);
			groupHeaderWiseTable.append(displayData);

			if(groupData.accountGroupName.split(" ")[0] == 'Bombay'){
				rowsPerPage					= headerPrint ? 66 : 90;
				rowsPerPageSummary			= 27
			} else
				rowsPerPage					= headerPrint ? 70 : 92;
			
			if(printType == 'printSummary' ){
				if(groupData.accountGroupId == '442') {
					_this.setTotaWithBillAndlWithoutSummary(groupData,groupHeaderWiseTable,displayData,dispatchData,dispatchLSLRCharge,dispatchLSLRFormSummaryAccountGroupWise,partialCollection,lhpvChargeList,destinationWiseCollection);
					_this.setSummaryOfDestination(groupData,groupHeaderWiseTable,displayData,dispatchLSLRCharge,dispatchLSLRFormSummaryAccountGroupWise,destinationWiseCollection,lhpvChargeList,partialCollection);
				}else {
					_this.setTotalSummary(groupData,groupHeaderWiseTable,displayData,dispatchData,dispatchLSLRFormSummaryAccountGroupWise,partialCollection,lhpvChargeList,destinationWiseCollection);
					_this.setSummaryOfDestination(groupData,groupHeaderWiseTable,displayData,dispatchLSLRCharge,dispatchLSLRFormSummaryAccountGroupWise,destinationWiseCollection,lhpvChargeList,partialCollection);
					_this.setHeader(dispatchLSHeaderAccountGroupWise,groupData,dispatchLSLRCharge,tableObjTr,groupHeaderWiseTable,dispatchDataAccountGroupWise,displayData,dispatchLSLRFormSummaryAccountGroupWise,partialCollection,lhpvChargeList,destinationWiseCollection);
					_this.setHeader(dispatchLSHeaderAccountGroupWise,groupData,dispatchLSLRCharge,tableObjTr,groupHeaderWiseTable,dispatchDataAccountGroupWise,displayData,dispatchLSLRFormSummaryAccountGroupWise,partialCollection,lhpvChargeList,destinationWiseCollection);
					_this.setSummaryOfAllSource(groupData,groupHeaderWiseTable,displayData,dispatchLSLRFormSummaryAccountGroupWise,destinationWiseCollection,partialCollection);
					_this.setHeader(dispatchLSHeaderAccountGroupWise,groupData,dispatchLSLRCharge,tableObjTr,groupHeaderWiseTable,dispatchDataAccountGroupWise,displayData,dispatchLSLRFormSummaryAccountGroupWise,partialCollection,lhpvChargeList,destinationWiseCollection,printType);
					_this.setSummaryOfPaidTBBLr(groupData,groupHeaderWiseTable,displayData,dispatchLSLRFormSummaryAccountGroupWise,destinationWiseCollection,partialCollection);
				}
				//_this.setHeader(dispatchLSHeaderAccountGroupWise,groupData,dispatchLSLRCharge,tableObjTr,groupHeaderWiseTable,dispatchDataAccountGroupWise,displayData,dispatchLSLRFormSummaryAccountGroupWise,partialCollection,lhpvChargeList,destinationWiseCollection);
				//_this.setSummaryOfCcModivatedLr(groupData,groupHeaderWiseTable,displayData,dispatchLSLRFormSummaryAccountGroupWise,destinationWiseCollection,partialCollection);
				//_this.setHeader(dispatchLSHeaderAccountGroupWise,groupData,dispatchLSLRCharge,tableObjTr,groupHeaderWiseTable,dispatchDataAccountGroupWise,displayData,dispatchLSLRFormSummaryAccountGroupWise,partialCollection,lhpvChargeList,destinationWiseCollection);
				//_this.setSummaryOfPartialLr(groupData,groupHeaderWiseTable,displayData,dispatchLSLRFormSummaryAccountGroupWise,partialCollection);
				
			} else {
				dataTableRows = _this.setTableContent(groupHeaderWiseTable,displayData,dispatchLSLRFormSummaryAccountGroupWise,partialCollection,lhpvChargeList,destinationWiseCollection);
			}
		
			while(dataTableRows.length > 0){
				
				var firstTableTd				= $("<td colspan='1' id='firstTableTd' class='valignTop infoStyle' ></td>");
				var secondTableTd				= $("<td colspan='1' id='secondTableTd' class='valignTop infoStyle'></td>");
				var firstTable					= $("<table class='width infoStyle' border='1' cellspacing='0' cellpadding='0' id='firstTable'></table>");
				var secondTable					= $("<table class='width infoStyle' border='1' cellspacing='0' cellpadding='0' id='secondTable'></table>");
				var totalQuantity1				= 0;
				var totalQuantity2				= 0;
				var totalActWht1				= 0;
				var totalActWht2				= 0;
				var totalBkTotal1				= 0;
				var totalBkTotal2				= 0;
				/*if(headerPrint){
					var chunkArray 				= dataTableRows.splice(0,66);
				} else {*/
				if(groupData.accountGroupName.split(" ")[0] == 'Bombay'){
					rowsPerPage					= headerPrint ? 70 : 90;
					rowsPerPageSummary			= 27
				} else
					rowsPerPage					= headerPrint ? 72 : 92;
				
				var chunkArray 				= dataTableRows.splice(0,rowsPerPage);
				//}
				
				setCompanyLogos(groupData.accountGroupId);
				
				headerPrint						= false;
				firstTable.append(dataHeder.clone()[0]);
				secondTable.append(dataHeder.clone()[0]);
				
				for(var key in chunkArray){
					var adjustRows		= Math.round(chunkArray.length/2);
					
					if(adjustRows > key){
						firstTable.append(chunkArray[key]);
						if(chunkArray[key].children().length == 6){
							totalQuantity1	+= Number(chunkArray[key].children()[2].innerText);
							totalActWht1	+= Number(chunkArray[key].children()[4].innerText);
							
							var totalActWhtForNml =   totalActWht1-(5 * totalQuantity1);
							
							if(chunkArray[key].children()[1].children[0].innerText == WAYBILL_TYPE_TOPAY)
								totalBkTotal1	+= Number(chunkArray[key].children()[5].innerText);
						}
					} else {
						secondTable.append(chunkArray[key]);
						
						if(chunkArray[key].children().length == 6){
							totalQuantity2	+= Number(chunkArray[key].children()[2].innerText);
							totalActWht2	+= Number(chunkArray[key].children()[4].innerText);
							var totalActWhtForNml2 =   totalActWht2-(5 * totalQuantity2);
						
							if(chunkArray[key].children()[1].children[0].innerText == WAYBILL_TYPE_TOPAY)
								totalBkTotal2	+= Number(chunkArray[key].children()[5].innerText);
						}
					}
					
					firstTableTd.append(firstTable);
					secondTableTd.append(secondTable);
				}
				if(totalWeightColumnForNml == true || totalWeightColumnForNml == 'true') {
					firstTable.append("<tr><th colspan='2'>Total</th><th class='rightAlign labelPaddingRight'>"+totalQuantity1+"</th><th></th><th class='rightAlign labelPaddingRight'>"+totalActWhtForNml+"</th><th class='rightAlign labelPaddingRight'>"+totalBkTotal1+"</th><tr>");
					secondTable.append("<tr><th colspan='2'>Total</th><th class='rightAlign labelPaddingRight'>"+totalQuantity2+"</th><th></th><th class='rightAlign labelPaddingRight'>"+totalActWhtForNml2+"</th><th class='rightAlign labelPaddingRight'>"+totalBkTotal2+"</th><tr>");
				}else{
					firstTable.append("<tr><th colspan='2'>Total</th><th class='rightAlign labelPaddingRight'>"+totalQuantity1+"</th><th></th><th class='rightAlign labelPaddingRight'>"+totalActWht1+"</th><th class='rightAlign labelPaddingRight'>"+totalBkTotal1+"</th><tr>");
					secondTable.append("<tr><th colspan='2'>Total</th><th class='rightAlign labelPaddingRight'>"+totalQuantity2+"</th><th></th><th class='rightAlign labelPaddingRight'>"+totalActWht2+"</th><th class='rightAlign labelPaddingRight'>"+totalBkTotal2+"</th><tr>");
				}
				displayData.push(firstTableTd);
				displayData.push(secondTableTd);
				
				if(dataTableRows.length > 0){ //for stop adding last page 
					if(pageWiseHeader){
						displayData.push($("#"+(groupData.accountGroupName).split(" ")[0]).clone());
						displayData.push($("#ReportHead"+(groupData.accountGroupName).split(" ")[0]).clone());
					} else {
						displayData.push($("<tr class='page-break marginTop'></tr>"));
					}
				}
			}
			headerPrint						= false;
			groupHeaderWiseTable.append(displayData);
				
			if(rateDifferenceModelArrList != null && rateDifferenceModelArrList.length > 0 && printType != 'printSummary' && iteration == (totalGroup - 1)){
				_this.setRateDifferenceLRDetails(rateDifferenceModelArrList, displayData, groupHeaderWiseTable);
			}
			
		}, setHeader : function(dispatchLSHeader, groupData,dispatchLSLRCharge,tableObjTr,groupHeaderWiseTable,dispatchDataAccountGroupWise,displayData,dispatchLSLRFormSummaryAccountGroupWise,partialCollection,lhpvChargeList,destinationWiseCollection,printType){
			rowsPerPageSummary		= headerPrint ? 27 : 40;
			
			if(totalRow > (rowsPerPageSummary - 2) && pageWiseHeader){
				headerPrint					= false;
				totalRow = 0;
				var headerTr	= $("<tr class='page-break marginTop'></tr>");
				if(pageWiseHeader){
					var headerTd	= $("<td colspan='5' class=''></td>");
				} else {
					var headerTd	= $("<td colspan='5' class='hide'></td>");
				}
				headerTd.append($("#"+(groupData.accountGroupName).split(" ")[0]).clone());
				headerTr.append(headerTd);
				headerTd.append($("#ReportHead"+groupData.accountGroupName.split(" ")[0]).clone());
				headerTr.append(headerTd);
				displayData.push(headerTr);
			
			} else if (totalRow == 0 && headerPrint){
				//headerPrint						= false;
				var herderObject						= $("#header").children().children();
				var herderObjectForDummyLs				= $("#headerForDummyls").children().children();
				var outerTr								= $("<tr class='width infoStyle infoStyleForDummyLs page-break'></tr>");
				var outerTd								= $("<td colspan='1' class='width50Per'></td>");
				//var outerTd2							= $("<td colspan='1' class='width50Per' id='"+(groupData.accountGroupName).split(" ")[0]+"1'></td>");
				var tableObj							= $("<table class='width infoStyle'>");
				var columnObjectForDetails				= herderObject.children();
				var columnObjectForDetailsForDummyLs	= herderObjectForDummyLs.children();
				var ReportHead							= $('<tr id="ReportHead'+(groupData.accountGroupName).split(" ")[0]+'"><td colspan="2" class="infoStyle centerAlign font27 bold bigHeight">Motor Report</td></tr>');
				var keyObject							= Object.keys(dispatchLSHeader); // Derived Keys For Reference
				var headerData							= dispatchLSHeader[keyObject[0]]; // Derived Object From Response
				remarkRow								= headerData[0].lsRemark; // Derived Object From Response
				
				$("*[data-info='vehicleNumber']").html(headerData[0].vehicleNumber);
				$("*[data-info='lhpvNumber']").html(headerData[0].lhpvNumber);
				$("*[data-info='driverMobileNumber']").html(headerData[0].driverMobileNumber);
				$("*[data-info='lsNumber']").html(headerData[0].lsNumber);
				$("*[data-info='driverName']").html(headerData[0].driverName);
				$("*[data-info='driverContact']").html(headerData[0].driverMobileNumber);
				$("*[data-info='driverNameWithMobile']").html(headerData[0].driverName+"("+headerData[0].driverMobileNumber+")");
				$("*[data-info='date']").html(headerData[0].dispatchDateStr);
				$("*[data-info='sourceBranch']").html(headerData[0].dispatchLSSourceBranchName);
				$("*[data-info='destinationBranch']").html(headerData[0].dispatchLSDestinationBranchName);
				$("*[data-info='consolidatedEwaybillNumber']").html(headerData[0].consolidatedEwaybillNumber);
				
				var sideHerderObject			= $("#sideHeader").clone();
				if(printType != undefined && printType == 'dummyLs'){
					for(var i = 0; i < columnObjectForDetailsForDummyLs.length ; i++){
						var datapiker		= $(columnObjectForDetailsForDummyLs[i]).attr("data-group");
						var newTdForDummyLs	= $("<td class='centerAlign fontForDummyLs'></td>");
						var newTrForDummyLs	= $("<tr></tr>");
						if(datapiker == 'name'){
							if(typeof lsSrcBranch !== 'undefined' && lsSrcBranch != undefined 
									&& typeof lsDestBranch !== 'undefined' && lsDestBranch != undefined){
								if(lsSrcBranch.regionId == 404 && lsDestBranch.regionId == 268){
									newTdForDummyLs.append('NM LOGISTICS');
								} else if((lsSrcBranch.subRegionId == 2880 || lsSrcBranch.subRegionId == 4308)
										&& lsDestBranch.regionId == 770){
									newTdForDummyLs.append('AGT LOGISTICS');
								}  else {
									newTdForDummyLs.append(groupData.accountGroupName);
								}
							} else {
								newTdForDummyLs.append(groupData.accountGroupName);
							}
							
							newTrForDummyLs.append(newTdForDummyLs);
						}
						if(datapiker == 'branchName'){
							newTdForDummyLs.append(groupData.branchName);
							newTrForDummyLs.append(newTdForDummyLs);
						}
						if(datapiker == 'branchAddress'){
							newTdForDummyLs.append(groupData.branchAddress);
							newTrForDummyLs.append(newTdForDummyLs);
						}
						if(datapiker == 'branchPhoneNumber'){
							newTdForDummyLs.append(groupData.branchContactDetailPhoneNumber);
							newTrForDummyLs.append(newTdForDummyLs);
						}
						tableObj.append(newTrForDummyLs);
					}
					
				}
				for(var i = 0; i < columnObjectForDetails.length ; i++){
					var datapiker		= $(columnObjectForDetails[i]).attr("data-group");
					var newtd 			= $("<td class='centerAlign '></td>");
					var newTr			= $("<tr></tr>");
										
					$(newtd).attr("class",$(columnObjectForDetails[i]).attr("class"));
					$(newtd).addClass("page-break");
					$(newtd).attr("data-group",datapiker);
					$(newtd).attr("style",$(columnObjectForDetails[i]).attr("style"));
					
					
					if(datapiker == 'name'){
						if(typeof lsSrcBranch !== 'undefined' && lsSrcBranch != undefined 
								&& typeof lsDestBranch !== 'undefined' && lsDestBranch != undefined){
							if(lsSrcBranch.regionId == 404 && lsDestBranch.regionId == 268){
								newtd.append('NM LOGISTICS');
							} else if((lsSrcBranch.subRegionId == 2880 || lsSrcBranch.subRegionId == 4308)
									&& lsDestBranch.regionId == 770){
								newtd.append('AGT LOGISTICS');
							}  else {
								newtd.append(groupData.accountGroupName);
							}
						} else {
							newtd.append(groupData.accountGroupName);
						}
						newTr.append(newtd);
					}
					if(datapiker == "logo") {
						newtd.append($(columnObjectForDetails[i]).children());
						newTr.append(newtd);
					}
					if(datapiker == 'branchName'){
						newtd.append(lsSrcBranch.branchName);
						newTr.append(newtd);
					}
					if(datapiker == 'branchAddress'){
						newtd.append(lsSrcBranch.branchAddress);
						newTr.append(newtd);
					}
					if(datapiker == 'branchPhoneNumber'){
						newtd.append(lsSrcBranch.branchContactDetailPhoneNumber);
						newTr.append(newtd);
					}
					tableObj.append(newTr);
													
				}
				outerTd.append(tableObj);
			//	outerTd2.append(sideHerderObject);
				tableObjTr.append(outerTd)
				tableObjTr.append(sideHerderObject)
				displayData.push(tableObjTr);
				displayData.push(ReportHead);
				
				return displayData;
			}
					
		},setTableContent:function(groupHeaderWiseTable,displayData,dispatchLSLRFormSummaryAccountGroupWise,partialCollection,lhpvChargeList,destinationWiseCollection){
				
			var columnObjectForDetails		= $("[data-row='divTable1']").children();
			var keyObject					= Object.keys(destinationWiseCollection); 
			var tableDataRow				= new Array();

			for(var key in keyObject){
				var newtrFirst 				= $("<tr class='infoStyle'></tr>");
				var dispatchDetails			= destinationWiseCollection[keyObject[key]]; 
				totalRow					+= dispatchDetails.length;
				totalRow++;
				newtrFirst.append("<td class='labelPaddingLeft' colspan='6' style='font-weight:bold;font-size:17px;'>"+(keyObject[key])+"</td>");
				tableDataRow.push(newtrFirst);
				
				for(var i= 0; i < dispatchDetails.length ; i++){
					
					var newtr1 				= $("<tr></tr>");
					for(var j = 0; j < columnObjectForDetails.length; j++){

						var newtd 		= $("<td></td>");
						var dataPicker 	= $(columnObjectForDetails[j]).attr("data-table-details");
						
						$(newtd).attr("class",$(columnObjectForDetails[j]).attr("class"));
						$(newtd).attr("data-table-details",dataPicker);
						if(dataPicker == 'wayBillSourceBranchCode'){
							newtd.append(dispatchDetails[i][dataPicker]);
						}
						if(dataPicker == 'wayBillNumber'){
							newtd.append(dispatchDetails[i][dataPicker]);
							var span 		= $("<span style='display:none;'>"+dispatchDetails[i].wayBillTypeId+"</span>");
							newtd.append(span);
							
						}
						if(dataPicker == 'wayBillConsigneeName'){
							newtd.append(dispatchDetails[i][dataPicker]);
						}
						if(dataPicker == 'wayBillConsigneeMobileNumber'){
							newtd.append(dispatchDetails[i][dataPicker]);
						}
						if(dataPicker == 'wayBillArticleQuantity'){
							newtd.append(dispatchDetails[i][dataPicker]);
						}
						if(dataPicker == 'privateMark'){
							newtd.append(dispatchDetails[i][dataPicker]);
						}
						if(dataPicker == 'wayBillType'){
							newtd.append(dispatchDetails[i][dataPicker]);
						}
						if(dataPicker == 'wayBillActualWeight'){
							newtd.append(dispatchDetails[i][dataPicker]);
						}
						if(dataPicker == 'wayBillGrandTotal'){
							if(dispatchDetails[i].amountShow){
								newtd.append(dispatchDetails[i][dataPicker]);
							} else {
								newtd.append(0);
							}
						}
						
						newtr1.append(newtd);
					}
					tableDataRow.push(newtr1);
				}
			}
			groupHeaderWiseTable.append(displayData);
			return	tableDataRow;
				
		}, setTotalSummary : function(groupData,groupHeaderWiseTable,displayData,dispatchData,dispatchLSLRFormSummaryAccountGroupWise,partialCollection,lhpvChargeList,destinationWiseCollection){
			totalRow++;
				var keyObject							= Object.keys(destinationWiseCollection); 
				var totalnoOfLr							= 0; 
				var totalnoOfArticle					= 0; 
				var totalactualWeight					= 0; 
				var totalvasuliAmount					= 0; 
				var lorryHireAmount						= 0; 
				var advanceAmount						= 0; 
				var balanceAmount						= 0; 
				var destinationWiseLHPVAmount			= 0; // For Summary
				var lhpvAverageAmount					= 0;
				var chargeAmount						= 0;
				var totalPaidTbb						= 0;
				var ReportHead							= $('<tr class="headingHeight"><td colspan="2" class="infoStyle font20 bold ">Total Summary</td></tr>');
				var columnObjectForDetails				= $("[data-total-row='divTable']").children();
				var tableTrObject						= $("<tr class='valignTop'></tr>");
				var tableTdObject						= $("<td colspan='2' id='tableTdObject' class='valignTop infoStyle'></td>");
				var tableObject							= $("<table class='width infoStyle' border='1' cellspacing='0' cellpadding='0'></table>");
				
				displayData.push(ReportHead);
				totalvasuliAmount						= 0;
				for(var key in keyObject){
					count++;
					
					var dispatchDetails					= destinationWiseCollection[keyObject[key]];
					var totalactualWeightForCalc		= 0;
					
					_.each(dispatchDetails, function(waybillData){
						totalactualWeight		+= parseFloat(waybillData.wayBillActualWeight);
						totalactualWeightForCalc+= parseFloat(waybillData.wayBillActualWeight);
						totalnoOfArticle		+= waybillData.wayBillArticleQuantity;
						totalvasuliAmount 		+= parseFloat(waybillData.wayBillVasuliAmount);
						chargeAmount 		 	 = parseFloat(waybillData.chargeAmount);
						balanceAmount			+= waybillData.wayBillVasuliAmount - (waybillData.wayBillServiceTaxAmount + waybillData.wayBillCarrierRiskAmount);
					});
							
					totalnoOfLr					+= dispatchDetails.length;
					lhpvAverageAmount 			 = chargeAmount/totalgrandactualWeight;
					destinationWiseLHPVAmount	 = totalactualWeightForCalc*lhpvAverageAmount;
					
					if(isNaN(destinationWiseLHPVAmount)){
						destinationWiseLHPVAmount 		= 0;
					}
					
					_.each(dispatchDetails,function(waybillData){
						if(waybillData.wayBillTypeId	!= WAYBILL_TYPE_TOPAY){
							totalPaidTbb				+= waybillData.wayBillGrandTotal;
						}
						waybillData.chargeAmount 		= Math.round(destinationWiseLHPVAmount.toFixed());
					})
					
					lorryHireAmount += parseFloat(Math.round(destinationWiseLHPVAmount.toFixed()));
					if(lhpvChargeList != undefined){
						for (var l=0; l<lhpvChargeList.length; l++) {
							if (lhpvChargeList[l].lhpvChargeTypeMasterId == LORRY_HIRE){
								//lorryHireAmount				= lhpvChargeList[l].chargeAmount;
							} else if (lhpvChargeList[l].lhpvChargeTypeMasterId == ADVANCE_AMOUNT){
								advanceAmount			= lhpvChargeList[l].chargeAmount;
							} else if (lhpvChargeList[l].lhpvChargeTypeMasterId == BALANCE_AMOUNT){
								//	balanceAmount				= lhpvChargeList[l].chargeAmount;
							}
						}
					}
					
					var newtr 					= $("<tr></tr>");
					var dataTotalHeader			= $("*[data-total-header='']").clone();
			
					for(var j = 0; j < columnObjectForDetails.length; j++){
						var newtd 		= $("<td></td>");
						var dataPicker 	= $(columnObjectForDetails[j]).attr("data-table-total");
						
						$(newtd).attr("class",$(columnObjectForDetails[j]).attr("class"));
						$(newtd).attr("data-table-total",dataPicker);
						
						if(dataPicker == 'totalLr'){
							newtd.append(totalnoOfLr);
						}
						if(dataPicker == 'totalNoOfArticles'){
							newtd.append(totalnoOfArticle);
						}
						if(dataPicker == 'totalActualWeight'){
							newtd.append(totalactualWeight);
						}
						if(dataPicker == 'totalVasuli'){
							newtd.append(totalvasuliAmount);
						}
						if(dataPicker == 'totalPaidTbb'){
							newtd.append(totalPaidTbb);
						}
						if(dataPicker == 'totalLorryHire'){
							newtd.append(lorryHireAmount);
						}
						if(dataPicker == 'advanceLorryHire'){
							newtd.append(advanceAmount);
						}
						if(dataPicker == 'balance'){
							newtd.append(balanceAmount);
						}
						newtr.append(newtd);
					}
					
				}
				if(count > 0){
					tableObject.append(dataTotalHeader[0]);
				}
				if(totalRow > rowsPerPageSummary && pageWiseHeader){
					headerPrint			= false;
					totalRow = 0;
				}
				tableObject.append(newtr);
				tableTdObject.append(tableObject);
				tableTrObject.append(tableTdObject)
				displayData.push(tableTrObject);
			//return displayData;
			
		}, setTotaWithBillAndlWithoutSummary : function(groupData,groupHeaderWiseTable,displayData,dispatchData,dispatchLSLRCharge,dispatchLSLRFormSummaryAccountGroupWise,partialCollection,lhpvChargeList,destinationWiseCollection){
			totalRow++;
			var keyObject							= Object.keys(destinationWiseCollection); 
			var totalvasuliAmount					= 0; 
			var lorryHireAmount						= 0; 
			var advanceAmount						= 0; 
			var balanceAmount						= 0; 
			var destinationWiseLHPVAmount			= 0; // For Summary
			var lhpvAverageAmount					= 0;
			var chargeAmount						= 0;
			var totalnoOfWithoutBillLr				= 0; 
			var totalnoOfWithoutBillArticle			= 0;
			var totalactualWithoutBillWeight		= 0; 
			var ToPayBillWithoutAmount				= 0;
			var paidBillWithoutAmount				= 0;
			var paidWithBillAmount					= 0;
			var TbbBillAmount 						= 0;
			var TbbBillWithoutAmount				= 0;
			var totalnoOfWithBillLr					= 0; 
			var totalnoOfWithBillArticle			= 0; 
			var totalactualWithBillWeight			= 0; 
			var ToPayWithBillAmount					= 0;
			var totalNumberOfLr						= 0;
			var totalNumberOfArticle				= 0;
			var totalActualWeight					= 0;
			var totalToPayAmount					= 0;
			var totalPaidAmount						= 0;
			var totalTbbAmount						= 0;
			var freightAmountWithBill				= 0;
			var freightAmountWithOutBill			= 0;
			var TotalFreightAmount					= 0;
			
			if(dispatchData != 'undefined') {
			for(var branch in dispatchData){
				var lrColl = dispatchData[branch];
				for(var lrSum in lrColl){
					var lrSumList	= lrColl[lrSum];
					for(var i = 0; i < lrSumList.length; i++) {
						var lrSumObj	= lrSumList[i];
						
						var dispatchLSLRCharges = dispatchLSLRCharge[lrSumObj.wayBillId+""];
						for(var k= 0; k< dispatchLSLRCharges.length; k++) {
							var dispatchLSLRSumObj	= dispatchLSLRCharges[k];
							if(lrSumObj.consignmentSummaryBillSelectionId == BOOKING_WITH_BILL)
								freightAmountWithBill += dispatchLSLRSumObj.wayBillFreightAmount;
							else
								freightAmountWithOutBill += dispatchLSLRSumObj.wayBillFreightAmount;
						}
						
						if(lrSumObj.consignmentSummaryBillSelectionId == BOOKING_WITH_BILL) {
							
							totalnoOfWithBillLr ++;
							totalnoOfWithBillArticle += lrSumObj.wayBillArticleQuantity;
							totalactualWithBillWeight += lrSumObj.wayBillActualWeight;
							if(lrSumObj.wayBillTypeId == WAYBILL_TYPE_TO_PAY) {
								ToPayWithBillAmount += lrSumObj.wayBillGrandTotal;
							}
							
							if(lrSumObj.wayBillTypeId == WAYBILL_TYPE_PAID) {
								paidWithBillAmount += lrSumObj.wayBillGrandTotal;
							}
							
							if(lrSumObj.wayBillTypeId == WAYBILL_TYPE_CREDIT) {
								TbbBillAmount += lrSumObj.wayBillGrandTotal;
							}
							
						}
						
						if(lrSumObj.consignmentSummaryBillSelectionId == BOOKING_WITHOUT_BILL) {
							
							totalnoOfWithoutBillLr ++;
							totalnoOfWithoutBillArticle += lrSumObj.wayBillArticleQuantity;
							totalactualWithoutBillWeight += lrSumObj.wayBillActualWeight;
							
							if(lrSumObj.wayBillTypeId == WAYBILL_TYPE_TO_PAY) {
								ToPayBillWithoutAmount += lrSumObj.wayBillGrandTotal;
							}
							
							if(lrSumObj.wayBillTypeId == WAYBILL_TYPE_PAID) {
								paidBillWithoutAmount += lrSumObj.wayBillGrandTotal;
							}
							
							if(lrSumObj.wayBillTypeId == WAYBILL_TYPE_CREDIT) {
								TbbBillWithoutAmount += lrSumObj.wayBillGrandTotal;
							}
						}
						
					}
				}
			}
			}
			for(var key in keyObject){
				count++;
				
				var dispatchDetails					= destinationWiseCollection[keyObject[key]];
				var totalactualWeightForCalc		= 0;
				
				_.each(dispatchDetails, function(waybillData){
					totalvasuliAmount 		+= parseFloat(waybillData.wayBillVasuliAmount);
					chargeAmount 		 	 = parseFloat(waybillData.chargeAmount);
					//balanceAmount			+= waybillData.wayBillVasuliAmount - (waybillData.wayBillServiceTaxAmount + waybillData.wayBillCarrierRiskAmount);
				});
				
				lhpvAverageAmount 			 = chargeAmount/totalgrandactualWeight;
				destinationWiseLHPVAmount	 = totalactualWeightForCalc*lhpvAverageAmount;
				
				if(isNaN(destinationWiseLHPVAmount)){
					destinationWiseLHPVAmount 		= 0;
				}
				
				_.each(dispatchDetails, function(waybillData){
					waybillData.chargeAmount 		= Math.round(destinationWiseLHPVAmount.toFixed());
				})
				
				lorryHireAmount += parseFloat(Math.round(destinationWiseLHPVAmount.toFixed()));
				if(lhpvChargeList != undefined){
					for (var l=0; l<lhpvChargeList.length; l++) {
						if (lhpvChargeList[l].lhpvChargeTypeMasterId == LORRY_HIRE){
							lorryHireAmount				= lhpvChargeList[l].chargeAmount;
						} else if (lhpvChargeList[l].lhpvChargeTypeMasterId == ADVANCE_AMOUNT){
							advanceAmount			= lhpvChargeList[l].chargeAmount;
						} else if (lhpvChargeList[l].lhpvChargeTypeMasterId == BALANCE_AMOUNT){
							balanceAmount				= lhpvChargeList[l].chargeAmount;
						}
					}
				}
				
				totalNumberOfLr    		= totalnoOfWithBillLr + totalnoOfWithoutBillLr;
				totalActualWeight   	= totalactualWithoutBillWeight + totalactualWithBillWeight;
				totalToPayAmount    	= ToPayBillWithoutAmount + ToPayWithBillAmount;
				totalPaidAmount     	= paidBillWithoutAmount + paidWithBillAmount;
				totalTbbAmount			= TbbBillWithoutAmount + TbbBillAmount;
				totalNumberOfArticle 	= totalnoOfWithoutBillArticle + totalnoOfWithBillArticle;
				TotalFreightAmount 		= freightAmountWithBill + freightAmountWithOutBill;
				
				$("[data-table='totalnoOfWithoutBillLr']").html(totalnoOfWithoutBillLr);
				$("[data-table='freightAmountWithOutBill']").html(freightAmountWithOutBill);
				$("[data-table='totalnoOfWithoutBillArticle']").html(totalnoOfWithoutBillArticle);
				$("[data-table='totalactualWithoutBillWeight']").html(totalactualWithoutBillWeight);
				$("[data-table='ToPayBillWithoutAmount']").html(ToPayBillWithoutAmount);
				$("[data-table='paidBillWithoutAmount']").html(paidBillWithoutAmount);
				$("[data-table='TbbBillWithoutAmount']").html(TbbBillWithoutAmount);
				$("[data-table='totalnoOfWithBillLr']").html(totalnoOfWithBillLr);
				$("[data-table='freightAmountWithBill']").html(freightAmountWithBill);
				$("[data-table='totalnoOfWithBillArticle']").html(totalnoOfWithBillArticle);
				$("[data-table='totalactualWithBillWeight']").html(totalactualWithBillWeight);
				$("[data-table='ToPayWithBillAmount']").html(ToPayWithBillAmount);
				$("[data-table='paidWithBillAmount']").html(paidWithBillAmount);
				$("[data-table='TbbBillAmount']").html(TbbBillAmount);
				$("[data-table='lorryHireAmount']").html(lorryHireAmount);
				$("[data-table='advanceAmount']").html(advanceAmount);
				$("[data-table='balanceAmount']").html(balanceAmount);
				$("[data-table-total='totalNumberOfLr']").html(totalNumberOfLr);
				$("[data-table-total='totalActualWeight']").html(totalActualWeight);
				$("[data-table-total='totalToPayAmount']").html(totalToPayAmount);
				$("[data-table-total='totalPaidAmount']").html(totalPaidAmount);
				$("[data-table-total='totalTbbAmount']").html(totalTbbAmount);
				$("[data-table-total='totalNumberOfArticle']").html(totalNumberOfArticle);
				$("[data-table-total='TotalFreightAmount']").html(TotalFreightAmount);
				$("[data-header='accountGroupName']").html(groupData.accountGroupName);
			}
	},setSummaryOfDestination : function (groupData,groupHeaderWiseTable,displayData,dispatchLSLRCharge,dispatchLSLRFormSummaryAccountGroupWise,destinationWiseCollection,lhpvChargeList,partialCollection){
			totalRow++;
			var keyObject							= Object.keys(destinationWiseCollection); 
			var ReportHead							= $('<tr class="headingHeight"><td colspan="2" class="infoStyle font20 bold ">Summary Of All Destination Stations</td></tr>');
			var columnObjectForDetails				= $("[data-total-dest-row='divTable']").children();
			var tableTrObject						= $("<tr class='valignTop'></tr>");
			var tableTdObject						= $("<td colspan='2' class='valignTop infoStyle'></td>");
			var tableObject							= $("<table class='width infoStyle' border='1' cellspacing='0' cellpadding='0'></table>");
			var dataTotalDestHeader					= $("*[data-total-dest-header='']").clone();
			count									= 0;
			var counTotalnoOfArticle				= 0;
			var counTotalnoOfLrs					= 0;
			var totalNumberLrs						= 0;
			var counTotalactualWeight				= 0;
			var counTotalactualWeightForNml			= 0;
			var counTotalchargeWeight				= 0;
			var counTotalCarrierRiskAmt				= 0;
			var counTotalBHChargeAmt				= 0;
			var counTotalTopayAmount				= 0;
			var counTotalPaidAmount					= 0; 
			var counTotalTbbAmount					= 0;
			var counTotalPaidTbbAmount				= 0;
			var counTotalLWeightAmount				= 0;
			var counTotalLfreightAmount				= 0;
			var counTotalAmount						= 0;
			var lorryHireAmount						= 0;
			var totalFreightAmount					= 0;
			var thead								= $("<thead></thead>");
			var totaltr 							= $("<tr class='infoStyle'></tr>");
			
			thead.append(dataTotalDestHeader[0]);
			tableObject.append(thead);
			
			for(var key in keyObject){
				totalRow++;
				var totalnoOfArticle				= 0; 
				var totalactualWeight				= 0; 
				var totalchargeWeight				= 0; 
				var totalCarrierRiskAmt				= 0; 
				var totalBHChargeAmt				= 0; 
				var totalTopayAmount				= 0; 
				var totalPaidAmount					= 0; 
				var totalTbbAmount					= 0;
				var totalPaidTbbAmount				= 0; 
				var totalAmount						= 0; 
				var LWeight							= 0; 
				var Lfreight						= 0; 
				var freightAmount					= 0; 
				var totalAllTopayPaidTbbAmount		= 0; 
				var totalTotalactualWeight			= 0; 
				
				if(lhpvChargeList != undefined){
					for (var l=0; l<lhpvChargeList.length; l++) {
						if (lhpvChargeList[l].lhpvChargeTypeMasterId == LORRY_HIRE){
							lorryHireAmount				= lhpvChargeList[l].chargeAmount;
						} else if (lhpvChargeList[l].lhpvChargeTypeMasterId == ADVANCE_AMOUNT){
							//advanceAmount			= lhpvChargeList[l].chargeAmount;
						} else if (lhpvChargeList[l].lhpvChargeTypeMasterId == BALANCE_AMOUNT){
							//	balanceAmount				= lhpvChargeList[l].chargeAmount;
						}
					}
				}
				
				var dispatchDetails					= destinationWiseCollection[keyObject[key]];
				totalNumberLrs = dispatchDetails.length;
				_.each(dispatchDetails,function(waybillIdData){
					count++;
					totalactualWeight		+= waybillIdData.wayBillActualWeight;
					totalchargeWeight		+= waybillIdData.wayBillChargeWeight;
					totalnoOfArticle		+= waybillIdData.wayBillArticleQuantity;
					totalCarrierRiskAmt		+= waybillIdData.wayBillCarrierRiskAmount;
					totalBHChargeAmt		+= waybillIdData.wayBillBHAmount;
					
					if(waybillIdData.amountShow) {
						if(waybillIdData.wayBillTypeId == WAYBILL_TYPE_TO_PAY)
							totalTopayAmount 	+= waybillIdData.wayBillGrandTotal;
						else
							totalPaidTbbAmount 	+= waybillIdData.wayBillGrandTotal;
						
						if(waybillIdData.wayBillTypeId == WAYBILL_TYPE_PAID)
							totalPaidAmount 	+= waybillIdData.wayBillGrandTotal;
						
						if(waybillIdData.wayBillTypeId == WAYBILL_TYPE_CREDIT)
							totalTbbAmount 	+= waybillIdData.wayBillGrandTotal;
					} 
					
					totalAmount += waybillIdData.wayBillGrandTotal;
					
					totalAllTopayPaidTbbAmount = totalTopayAmount+ totalPaidAmount + totalTbbAmount;
					
					var dispatchLSLRCharges = dispatchLSLRCharge[waybillIdData.wayBillId+""];
				
					if(dispatchLSLRCharges != undefined) {	
						for(var k = 0; k < dispatchLSLRCharges.length; k++) {
							var dispatchLSLRSumObj	= dispatchLSLRCharges[k];
							freightAmount += dispatchLSLRSumObj.wayBillFreightAmount;
						}
					} else
						freightAmount = 0;
					
					totalFreightAmount   = freightAmount;
					totalTotalactualWeight = totalactualWeight;
				})
				
				Lfreight				= Number((lorryHireAmount/totalActualWt)*totalFreightAmount);
				LWeight					= Number((lorryHireAmount/totalActualWt)*totalTotalactualWeight);
				
				var newtr 							= $("<tr></tr>");
				for(var j = 0; j < columnObjectForDetails.length; j++){
					
					var newtd 		= $("<td></td>");
					var dataPicker 	= $(columnObjectForDetails[j]).attr("data-table-total-dest");
					
					$(newtd).attr("class",$(columnObjectForDetails[j]).attr("class"));
					//$(newtd).addClass("borderRight borderTop");
					$(newtd).attr("data-table-total-dest",dataPicker);
					
					if(dataPicker == 'wayBillSourceBranchCode'){
						newtd.append(dispatchDetails[0].wayBillDestinationBranchCode);
					}
					if(dataPicker == 'totalAllTopayPaidTbbAmount'){
						counTotalAmount += totalAmount;
						newtd.append(totalAllTopayPaidTbbAmount);
					}
				
					if(dataPicker == 'totalNoOfArticles'){
						counTotalnoOfArticle += totalnoOfArticle;
						newtd.append(totalnoOfArticle);
					}
					if(totalWeightColumnForNml ==  true || totalWeightColumnForNml == 'true') {
						if(dataPicker == 'totalActualWeight'){
							counTotalactualWeightForNml += totalactualWeight - (5 * totalnoOfArticle);
							newtd.append(totalactualWeight);
						}
					}else {
						if(dataPicker == 'totalActualWeight'){
							counTotalactualWeight += totalactualWeight;
							newtd.append(totalactualWeight);
						}
					}
					if(dataPicker == 'totalchargeWeight'){
						counTotalchargeWeight += totalchargeWeight;
						newtd.append(totalchargeWeight);
					}
					if(dataPicker == 'carrierRisk'){
						counTotalCarrierRiskAmt += totalCarrierRiskAmt;
						newtd.append(totalCarrierRiskAmt);
					}
					if(dataPicker == 'bhCharge'){
						counTotalBHChargeAmt += totalBHChargeAmt;
						newtd.append(totalBHChargeAmt);
					}
					if(dataPicker == 'topayTotal'){
						counTotalTopayAmount += totalTopayAmount;
						newtd.append(totalTopayAmount);
					}
					if(dataPicker == 'paidTotal'){
						counTotalPaidAmount += totalPaidAmount;
						newtd.append(totalPaidAmount);
					}
					if(dataPicker == 'tbbTotal'){
						counTotalTbbAmount += totalTbbAmount;
						newtd.append(totalTbbAmount);
					}
					if(dataPicker == 'paidTbbTotal'){
						counTotalPaidTbbAmount += totalPaidTbbAmount;
						newtd.append(totalPaidTbbAmount);
					}
					
					if(dataPicker == 'LWeight'){
						counTotalLWeightAmount +=  Number((LWeight).toFixed(3));
						newtd.append(LWeight.toFixed(2));
					}
					if(dataPicker == 'Lfreight'){
						counTotalLfreightAmount += Number((Lfreight).toFixed(3));
						newtd.append(Lfreight.toFixed(2));
					}
					if(dataPicker == 'totalAmount'){
						counTotalAmount += totalAmount;
						newtd.append(totalAmount);
					}
					if(dataPicker == 'totalNumberLrs'){
						counTotalnoOfLrs += totalNumberLrs;
						newtd.append(totalNumberLrs);
					}
					newtr.append(newtd);
				}
				if(count > 0){
					displayData.push(ReportHead);
				}
				if(headerPrint){
					rowsPerPageSummary			= 27;
				} else {
					rowsPerPageSummary			= 40;
				}
				if(totalRow > rowsPerPageSummary && pageWiseHeader){
					headerPrint			= false;
					totalRow = 0;
					tableObject.append('<tr><td colspan="5" class="borderTop borderBot"></td></tr>');
					var headerTr	= $("<tr class='page-break marginTop'></tr>");
					if(pageWiseHeader){
						var headerTd	= $("<td colspan='5' class='borderBot'></td>");
					} else {
						var headerTd	= $("<td colspan='5' class='borderBot hide'></td>");
					}
					
					headerTd.append($("#"+(groupData.accountGroupName).split(" ")[0]).clone());
					headerTr.append(headerTd);
					tableObject.append(headerTr);
					
					headerTd.append($("#ReportHead"+groupData.accountGroupName.split(" ")[0]).clone());
					headerTr.append(headerTd);
					tableObject.append(headerTr);
					
					if(dataTotalDestHeader.length > 1){
						tableObject.append(dataTotalDestHeader[1]);
					} else {
						tableObject.append(dataTotalDestHeader.clone());
					}
				}
				tableObject.append(newtr);
			tableTdObject.append(tableObject);
				tableTrObject.append(tableTdObject);
			}
			
			if(groupData.accountGroupId == '442') {
				totaltr.append('<th>Total</th><th class="rightAlign labelPaddingRight">'+counTotalnoOfLrs+'</th><th class="rightAlign labelPaddingRight">'+counTotalnoOfArticle+'</th>');
				totaltr.append('<th class="rightAlign labelPaddingRight">'+counTotalactualWeight+'</th><th class="rightAlign labelPaddingRight">'+counTotalchargeWeight+'</th>');
				totaltr.append('<th class="rightAlign labelPaddingRight">'+counTotalTopayAmount+'</th><th class="rightAlign labelPaddingRight">'+counTotalPaidAmount+'</th>');
				totaltr.append('<th class="rightAlign labelPaddingRight">'+counTotalTbbAmount+'</th><th class="rightAlign labelPaddingRight">'+counTotalAmount+'</th>');
				totaltr.append('<th class="rightAlign labelPaddingRight">'+counTotalLWeightAmount+'</th><th class="rightAlign labelPaddingRight">'+counTotalLfreightAmount+'</th>');
				
			}else if(groupData.accountGroupId == '368'){
				totaltr.append('<th>Total</th><th class="rightAlign labelPaddingRight">'+counTotalnoOfArticle+'</th><th class="rightAlign labelPaddingRight">'+counTotalactualWeightForNml+'</th>');
				totaltr.append('<th class="rightAlign labelPaddingRight">'+counTotalCarrierRiskAmt+'</th><th class="rightAlign labelPaddingRight">'+counTotalBHChargeAmt+'</th>');
				totaltr.append('<th class="rightAlign labelPaddingRight">'+counTotalTopayAmount+'</th><th class="rightAlign labelPaddingRight">'+counTotalPaidTbbAmount+'</th>');
				
			}else {
					totaltr.append('<th>Total</th><th class="rightAlign labelPaddingRight">'+counTotalnoOfArticle+'</th><th class="rightAlign labelPaddingRight">'+counTotalactualWeight+'</th>');
					totaltr.append('<th class="rightAlign labelPaddingRight">'+counTotalCarrierRiskAmt+'</th><th class="rightAlign labelPaddingRight">'+counTotalBHChargeAmt+'</th>');
					totaltr.append('<th class="rightAlign labelPaddingRight">'+counTotalTopayAmount+'</th><th class="rightAlign labelPaddingRight">'+counTotalPaidTbbAmount+'</th>');
				
			}
			tableObject.append(totaltr);
			displayData.push(tableTrObject);
			
		
		},setSummaryOfAllSource : function (groupData,groupHeaderWiseTable,displayData,dispatchLSLRFormSummaryAccountGroupWise,destinationWiseCollection,partialCollection){
			totalRow++;
			var sourceWiseCollection				= new Object();
			var sourceWiseCollectionarr				= new Array();
			var keyObject							= Object.keys(destinationWiseCollection); 
			
			for(var key in keyObject){
				
				var dispatchDetails					= destinationWiseCollection[keyObject[key]];
				_.each(dispatchDetails,function(waybillIdData){
					sourceWiseCollectionarr.push(waybillIdData);
				})
				sourceWiseCollection   = _.groupBy(sourceWiseCollectionarr,"wayBillSourceBranchName")
			}
			var sourceKeys							= Object.keys(sourceWiseCollection); 
			var ReportHead							= $('<tr class="headingHeight"><td colspan="2" class="infoStyle font20 bold ">Summary of all Booking stations</td></tr>');
			var columnObjectForDetails				= $("[data-total-source-row='divTable']").children();
			var tableTrObject						= $("<tr class='valignTop infoStyle'></tr>");
			var tableTdObject						= $("<td colspan='2' class='valignTop'></td>");
			var tableObject							= $("<table class='width infoStyle' border='1' cellspacing='0' cellpadding='0'></table>");
			var dataTotalSourceHeader				= $("*[data-total-source-header='']").clone();
			count									= 0;
			var counTotalnoOfArticle				= 0;
			var counTotalactualWeight				= 0;
			var counTotalactualWeightForNml			= 0;
			var counTotalTopayAmount				= 0;
			var counTotalPaidTbbAmount				= 0;
			var totaltr 							= $("<tr class='infoStyle'></tr>");
			var thead								= $("<thead></thead>");
			
			thead.append(dataTotalSourceHeader[0]);
			tableObject.append(thead);
			for(var key in sourceKeys){
				totalRow++;
				var totalnoOfArticle				= 0; 
				var totalactualWeight				= 0; 
				var totalTopayAmount				= 0; 
				var totalPaidTbbAmount				= 0; 
				
				var dispatchDetails					= sourceWiseCollection[sourceKeys[key]];
				
				_.each(dispatchDetails,function(waybillIdData){
					count++;
					totalactualWeight		+= waybillIdData.wayBillActualWeight;
					totalnoOfArticle		+= waybillIdData.wayBillArticleQuantity;
					
					if(waybillIdData.amountShow){
						if(waybillIdData.wayBillTypeId == WAYBILL_TYPE_TO_PAY){
							totalTopayAmount 	+= waybillIdData.wayBillGrandTotal;
						} else {
							totalPaidTbbAmount 	+= waybillIdData.wayBillGrandTotal;
						}
						}
				})
				var newtr 							= $("<tr></tr>");
				for(var j = 0; j < columnObjectForDetails.length; j++){
					
					var newtd 		= $("<td></td>");
					var dataPicker 	= $(columnObjectForDetails[j]).attr("data-table-total-source");
					
					$(newtd).attr("class",$(columnObjectForDetails[j]).attr("class"));
					
					$(newtd).attr("data-table-total-source",dataPicker);
					
					if(dataPicker == 'wayBillSourceBranchCode'){
						newtd.append(dispatchDetails[0].wayBillSourceBranchCode);
					}
					if(dataPicker == 'totalNoOfArticles'){
						counTotalnoOfArticle	+= totalnoOfArticle;
						newtd.append(totalnoOfArticle);
					}
					if(totalWeightColumnForNml == true || totalWeightColumnForNml == 'true') {
						if(dataPicker == 'totalActualWeight'){
							counTotalactualWeightForNml += totalactualWeight - (5 * totalnoOfArticle);
							newtd.append(totalactualWeight);
						}
					}else {
						if(dataPicker == 'totalActualWeight'){
							counTotalactualWeight += totalactualWeight;
							newtd.append(totalactualWeight);
						}
					}
					if(dataPicker == 'topayTotal'){
						counTotalTopayAmount	+= totalTopayAmount;
						newtd.append(totalTopayAmount);
					}
					if(dataPicker == 'paidTbbTotal'){
						counTotalPaidTbbAmount	+= totalPaidTbbAmount;
						newtd.append(totalPaidTbbAmount);
					}
					
					newtr.append(newtd);
				}
				if(headerPrint){
					rowsPerPageSummary			= 27;
				} else {
					rowsPerPageSummary			= 40;
				}
				if(totalRow > rowsPerPageSummary && pageWiseHeader){
					headerPrint		= false;
					totalRow = 0;
					tableObject.append('<tr><td colspan="5" class="borderTop borderBot"></td></tr>');
					var headerTr	= $("<tr class='page-break marginTop'></tr>");
					if(pageWiseHeader){
						var headerTd	= $("<td colspan='5' class='borderBot'></td>");
					} else {
						var headerTd	= $("<td colspan='5' class='borderBot hide'></td>");
					}
					headerTd.append($("#"+(groupData.accountGroupName).split(" ")[0]).clone());
					headerTr.append(headerTd);
					tableObject.append(headerTr);
					
					headerTd.append($("#ReportHead"+groupData.accountGroupName.split(" ")[0]).clone());
					headerTr.append(headerTd);
					tableObject.append(headerTr);
					if(dataTotalSourceHeader.length > 1){
						tableObject.append(dataTotalSourceHeader[1]);
					} else {
						tableObject.append(dataTotalSourceHeader.clone());
					}
				}
				tableObject.append(newtr);
				tableTdObject.append(tableObject);
				tableTrObject.append(tableTdObject)
			}
			
			if(count > 0){
				displayData.push(ReportHead);
			}
			if(groupData.accountGroupId == '368') 
				totaltr.append('<th>Total</th><th class="rightAlign labelPaddingRight">'+counTotalnoOfArticle+'</th><th class="rightAlign labelPaddingRight">'+counTotalactualWeightForNml+'</th>');
			else
				totaltr.append('<th>Total</th><th class="rightAlign labelPaddingRight">'+counTotalnoOfArticle+'</th><th class="rightAlign labelPaddingRight">'+counTotalactualWeight+'</th>');

			totaltr.append('<th class="rightAlign labelPaddingRight">'+counTotalTopayAmount+'</th><th class="rightAlign labelPaddingRight">'+counTotalPaidTbbAmount+'</th>');
			tableObject.append(totaltr);
			displayData.push(tableTrObject);
		},setSummaryOfPaidTBBLr : function (groupData,groupHeaderWiseTable,displayData,dispatchLSLRFormSummaryAccountGroupWise,destinationWiseCollection,partialCollection){
			totalRow++;
			var keyObject							= Object.keys(destinationWiseCollection); 
			var totalPaidTbbAmount					= 0; 
			var ReportHead							= $('<tr class="headingHeight"><td colspan="2" class="infoStyle font20 bold ">Summary of Paid and TBB LRs </td></tr>');
			var columnObjectForDetails				= $("[data-total-paidtbb-row='divTable']").children();
			var tableTrObject						= $("<tr class='infoStyle valignTop'></tr>");
			var tableTdObject						= $("<td colspan='2' class='valignTop'></td>");
			var tableObject							= $("<table class='width infoStyle' border='1' cellspacing='0' cellpadding='0'></table>");
			var dataTotalPaidTBBHeader				= $("*[data-total-paidtbb-header='']").clone();
			var totaltr 							= $("<tr class='infoStyle'></tr>");
			var thead								= $("<thead></thead>");
			
			thead.append(dataTotalPaidTBBHeader[0]);
			tableObject.append(thead);
			
			for(var key in keyObject){
				var dispatchDetails					= destinationWiseCollection[keyObject[key]];
				
				_.each(dispatchDetails, function(dispatchDeta){
					if(dispatchDeta.wayBillTypeId != WAYBILL_TYPE_TO_PAY){
						totalRow++;
						if(dispatchDeta.amountShow){
							totalPaidTbbAmount 				+= dispatchDeta.wayBillGrandTotal;
						}
						
						var newtr 						= $("<tr></tr>");
						for(var j = 0; j < columnObjectForDetails.length; j++){
							
							var newtd 		= $("<td></td>");
							var dataPicker 	= $(columnObjectForDetails[j]).attr("data-table-total-paidtbb");
							
							$(newtd).attr("class",$(columnObjectForDetails[j]).attr("class"));
							$(newtd).attr("data-table-total-paidtbb",dataPicker);
							
							if(dataPicker == 'wayBillNumber'){
								newtd.append(dispatchDeta.wayBillNumber);
							}
							if(dataPicker == 'wayBillSourceBranchCode'){
								newtd.append(dispatchDeta.wayBillSourceBranchCode);
							}
							if(dataPicker == 'wayBillDestinationBranchCode'){
								newtd.append(dispatchDeta.wayBillDestinationBranchCode);
							}
							if(dataPicker == 'bookingTotal'){
								if(dispatchDeta.amountShow){
									newtd.append(dispatchDeta.wayBillGrandTotal);
								} else {
									newtd.append(0);
								}
							}
							newtr.append(newtd);
						}
						if(headerPrint){
							rowsPerPageSummary			= 27;
						} else {
							rowsPerPageSummary			= 40;
						}
						if(totalRow > rowsPerPageSummary && pageWiseHeader){
							headerPrint		= false;
							totalRow = 0;
							tableObject.append('<tr><td colspan="5" class="borderTop borderBot"></td></tr>');
							var headerTr	= $("<tr class='page-break marginTop'></tr>");
							if(pageWiseHeader){
								var headerTd	= $("<td colspan='5' class='borderBot'></td>");
							} else {
								var headerTd	= $("<td colspan='5' class='borderBot hide'></td>");
							}
							headerTd.append($("#"+(groupData.accountGroupName).split(" ")[0]).clone());
							headerTr.append(headerTd);
							tableObject.append(headerTr);
							
							headerTd.append($("#ReportHead"+groupData.accountGroupName.split(" ")[0]).clone());
							headerTr.append(headerTd);
							tableObject.append(headerTr);
							if(dataTotalPaidTBBHeader.length > 1){
								tableObject.append(dataTotalPaidTBBHeader[1]);
							} else {
								tableObject.append(dataTotalPaidTBBHeader.clone());
							}
						}
						tableObject.append(newtr);
						tableTdObject.append(tableObject);
						tableTrObject.append(tableTdObject);
						displayData.push(ReportHead);
					}
				});
			}
			totaltr.append('<th colspan="4" class="rightAlign labelPaddingRight">'+totalPaidTbbAmount+'</th>');
			totalRow++;
			tableObject.append(totaltr);
			displayData.push(tableTrObject);
		
		},setSummaryOfCcModivatedLr : function (groupData,groupHeaderWiseTable,displayData,dispatchLSLRFormSummaryAccountGroupWise,destinationWiseCollection,partialCollection){
			totalRow++;
			var ReportHead							= $('<tr class="headingHeight"><td colspan="2" class="infoStyle font20 bold ">The Below Listed LR(s) Are CC/Modivate Attach	 </td></tr>');
			var columnObjectForDetails				= $("[data-total-ccmodivatedlr-row='divTable']").children();
			var tableTrObject						= $("<tr class='valignTop'></tr>");
			var tableTdObject						= $("<td colspan='2' class='valignTop'></td>");
			var tableObject							= $("<table class='width ' border='1' cellspacing='0' cellpadding='0'></table>");
			var dataTotalCcmodivatedlrHeader		= $("*[data-total-ccmodivatedlr-header='']").clone();
			var thead								= $("<thead></thead>");
			
			thead.append(dataTotalCcmodivatedlrHeader[0]);
			tableObject.append(thead);
			count									= 0;
			for(var key in dispatchLSLRFormSummaryAccountGroupWise){
				//totalRow++;
			var dispatchDetails					= dispatchLSLRFormSummaryAccountGroupWise[key];
			_.each(dispatchDetails,function(formDetails){
					count++;
					totalRow++;
					var newtr 						= $("<tr></tr>");
					for(var j = 0; j < columnObjectForDetails.length; j++){
						var newtd 		= $("<td></td>");
						var dataPicker 	= $(columnObjectForDetails[j]).attr("data-table-ccmodivatedlr");
						
						$(newtd).attr("class",$(columnObjectForDetails[j]).attr("class"));
						//$(newtd).addClass(" ");
						$(newtd).attr("data-table-ccmodivatedlr",dataPicker);
						if(dataPicker == 'wayBillNumber'){
							newtd.append(formDetails.wayBillNumber);
						}
						if(dataPicker == 'wayBillSourceBranchName'){
							newtd.append(formDetails.wayBillSourceBranchName);
						}
						if(dataPicker == 'wayBillDestinationBranchName'){
							newtd.append(formDetails.wayBillDestinationBranchName);
						}
						if(dataPicker == 'FormTypeName'){
							newtd.append(formDetails.wayBillFormName);
						}
						if(dataPicker == 'FormNumber'){
							newtd.append(formDetails.formNumber);
						}
						newtr.append(newtd);
					}
					if(headerPrint){
						rowsPerPageSummary			= 27;
					} else {
						rowsPerPageSummary			= 40;
					}
					if(totalRow > rowsPerPageSummary && pageWiseHeader){
						headerPrint		= false;
						totalRow = 0;
						tableObject.append('<tr><td colspan="5" class="borderTop borderBot"></td></tr>');
						var headerTr	= $("<tr class='page-break marginTop'></tr>");
						if(pageWiseHeader){
							var headerTd	= $("<td colspan='5' class='borderBot'></td>");
						} else {
							var headerTd	= $("<td colspan='5' class='borderBot hide'></td>");
						}
						headerTd.append($("#"+(groupData.accountGroupName).split(" ")[0]).clone());
						headerTr.append(headerTd);
						tableObject.append(headerTr);
						
						headerTd.append($("#ReportHead"+groupData.accountGroupName.split(" ")[0]).clone());
						headerTr.append(headerTd);
						tableObject.append(headerTr);
						if(dataTotalCcmodivatedlrHeader.length > 1){
							tableObject.append(dataTotalCcmodivatedlrHeader[1]);
						} else {
							tableObject.append(dataTotalCcmodivatedlrHeader.clone());
						}
					} 
						tableObject.append(newtr);
						tableTdObject.append(tableObject);
						tableTrObject.append(tableTdObject);
					
				});
			}
			
			if(count > 0){
				displayData.push(ReportHead);
				//totalRow++;
			}
			
			displayData.push(tableTrObject);
		},setSummaryOfPartialLr : function (groupData,groupHeaderWiseTable,displayData,dispatchLSLRFormSummaryAccountGroupWise,partialCollection){
			totalRow++;
			var totalnoOfArticle					= 0; 
			var totalactualWeight					= 0; 
			var totalPaidTbbAmount					= 0; 
			var totalvasuliAmount					= 0; 
			var totalNoOfLoadedArticles				= 0; 
			var ReportHead							= $('<tr class="headingHeight"><td colspan="2" class="infoStyle font20 bold ">Partial dispatch lr</td></tr>');
			var columnObjectForDetails				= $("[data-total-partiallr-row='divTable']").children();
			var tableTrObject						= $("<tr class='valignTop infoStyle'></tr>");
			var tableTdObject						= $("<td colspan='2' class='valignTop'></td>");
			var tableObject							= $("<table class='width border' border='0' cellspacing='0' cellpadding='0'></table>");
			var dataTotalPartialHeader				= $("*[data-total-partiallr-header='']").clone();
			count									= 0;
			var thead								= $("<thead></thead>");
			
			thead.append(dataTotalPartialHeader[0]);
			tableObject.append(thead);
			
			_.each(partialCollection,function(partialDetails){
				totalRow++;
				count++;
				totalactualWeight		= partialDetails.wayBillActualWeight;
				totalnoOfArticle		= partialDetails.totalQuantity;
				totalNoOfLoadedArticles	= partialDetails.wayBillArticleQuantity;
				totalvasuliAmount		= partialDetails.wayBillVasuliAmount;
				
				if(partialDetails.wayBillTypeId != WAYBILL_TYPE_TO_PAY){
					totalPaidTbbAmount 	= partialDetails.wayBillGrandTotal;
				}
				
				var newtr 						= $("<tr></tr>");
				for(var j = 0; j < columnObjectForDetails.length; j++){
					
					var newtd 		= $("<td></td>");
					var dataPicker 	= $(columnObjectForDetails[j]).attr("data-table-partiallr");
					
					$(newtd).attr("class",$(columnObjectForDetails[j]).attr("class"));
					$(newtd).addClass("borderRight borderTop");
					$(newtd).attr("data-table-partiallr",dataPicker);
					
					if(dataPicker == 'wayBillNumber'){
						newtd.append(partialDetails.wayBillNumber);
					}
					if(dataPicker == 'wayBillSourceBranchCode'){
						newtd.append(partialDetails.wayBillSourceBranchCode);
					}
					if(dataPicker == 'totalNoOfArticles'){
						newtd.append(totalnoOfArticle);
					}
					if(dataPicker == 'totalNoOfLoadedArticles'){
						newtd.append(totalNoOfLoadedArticles);
					}
					if(dataPicker == 'totalActualWeight'){
						newtd.append(totalactualWeight);
					}
					if(dataPicker == 'totalVasuli'){
						newtd.append(totalvasuliAmount);
					}
					if(dataPicker == 'paidTbbTotal'){
						newtd.append(totalPaidTbbAmount);
					}
					newtr.append(newtd);
				}
				tableObject.append(newtr);
				tableTdObject.append(tableObject);
				tableTrObject.append(tableTdObject);
			});
			if(headerPrint){
				rowsPerPageSummary			= 27;
			} else {
				rowsPerPageSummary			= 40;
			}
			if(totalRow > rowsPerPageSummary && pageWiseHeader){
				headerPrint		= false;
				totalRow = 0;
				tableTrObject.append('<tr><td colspan="5" class="borderTop borderBot"></td></tr>');
				var headerTr	= $("<tr class='page-break marginTop'></tr>");
				if(pageWiseHeader){
					var headerTd	= $("<td colspan='5' class='borderBot'></td>");
				} else {
					var headerTd	= $("<td colspan='5' class='borderBot hide'></td>");
				}
				headerTd.append($("#"+(groupData.accountGroupName).split(" ")[0]).clone());
				headerTr.append(headerTd);
				tableObject.append(headerTr);
				
				headerTd.append($("#ReportHead"+groupData.accountGroupName.split(" ")[0]).clone());
				headerTr.append(headerTd);
				tableObject.append(headerTr);
				if(dataTotalPartialHeader.length > 1){
					tableObject.append(dataTotalPartialHeader[1]);
				} else {
					tableObject.append(dataTotalPartialHeader.clone());
				}
			}
			if(count > 0){
				displayData.push(ReportHead);
			}
			
			var tableTrLSRemark	= $("<tr class='headingHeight'><td colspan='2' class='bold marginTop infoStyle'>Remark : "+remarkRow+"</td></tr>");
			displayData.push(tableTrObject);
			displayData.push(tableTrLSRemark);
			groupHeaderWiseTable.append(displayData);
		
		},getTotalWeight:function(dispatchData){
			var totalWeight = 0;
			for(var branch in dispatchData){
				var lrColl = dispatchData[branch];
				for(var lrSum in lrColl){
					var lrSumList	= lrColl[lrSum];
					for(var i = 0; i < lrSumList.length; i++) {
						totalWeight += parseFloat(lrSumList[i].wayBillActualWeight);
					}
				}
			}
			return totalWeight;
		},setRateDifferenceLRDetails : function (rateDifferenceModelArrList, displayData, groupHeaderWiseTable){
			totalRow++;
			var totalMasterLRFreight				= 0; 
			var totalLRFreight						= 0; 
			var totalChargedWeight					= 0; 
			var totalDiffAmount						= 0; 
			var ReportHead							= $('<tr class="headingHeight"><td colspan="2" class="infoStyle font20 bold ">Rate Difference lr</td></tr>');
			var columnObjectForDetails				= $("[data-rateDifferenceLR-row='divTable']").children();
			var tableTrObject						= $("<tr class='valignTop infoStyle'></tr>");
			var tableTdObject						= $("<td colspan='2' class='valignTop'></td>");
			var tableObject							= $("<table class='width border' border='0' cellspacing='0' cellpadding='0'></table>");
			var dataRateDifferenceLRHeader			= $("*[data-rateDifferenceLR-header='']").clone();
			count									= 0;
			var thead								= $("<thead></thead>");
			
			thead.append(dataRateDifferenceLRHeader[0]);
			tableObject.append(thead);
			
			_.each(rateDifferenceModelArrList,function(rateDifferenceLR){
				totalRow++;
				count++;
				totalMasterLRFreight	+= rateDifferenceLR.masterLRFreight;
				totalLRFreight			+= rateDifferenceLR.lrFreight;
				totalChargedWeight		+= rateDifferenceLR.chargedWeight;
				totalDiffAmount			+= rateDifferenceLR.diffAmount;
				
				var newtr 						= $("<tr></tr>");
				for(var j = 0; j < columnObjectForDetails.length; j++){
					
					var newtd 		= $("<td></td>");
					var dataPicker 	= $(columnObjectForDetails[j]).attr("data-table-rateDifferenceLR");
					
					$(newtd).attr("class",$(columnObjectForDetails[j]).attr("class"));
					$(newtd).addClass("borderRight borderTop");
					$(newtd).attr("data-table-rateDifferenceLR",dataPicker);
					
					if(dataPicker == 'wayBillNumber'){
						newtd.append(rateDifferenceLR.wayBillNumber);
					}
					if(dataPicker == 'wayBillSourceBranch'){
						newtd.append(rateDifferenceLR.sourceBranch);
					}
					if(dataPicker == 'chargeType'){
						newtd.append(rateDifferenceLR.chargeTypeName);
					}
					if(dataPicker == 'masterRate'){
						newtd.append(rateDifferenceLR.masterLRRate);
					}
					if(dataPicker == 'freightByMasterRate'){
						newtd.append(rateDifferenceLR.masterLRFreight);
					}
					if(dataPicker == 'lrFreight'){
						newtd.append(rateDifferenceLR.lrFreight);
					}
					if(dataPicker == 'chargeWeight'){
						newtd.append(rateDifferenceLR.chargedWeight);
					}
					if(dataPicker == 'diffAmount'){
						newtd.append(rateDifferenceLR.diffAmount);
					}
					newtr.append(newtd);
				}
				tableObject.append(newtr);
				tableTdObject.append(tableObject);
				tableTrObject.append(tableTdObject);
			});
			
			var newTotalTr 						= $("<tr class='bold borderTop infoStyle'></tr>");
			var td1	= $("<td class='rightAlign borderTop borderRight'  colspan='4'>Total</td>");
			var td2	= $("<td class='rightAlign borderTop borderRight' >"+totalMasterLRFreight+"</td>");
			var td3	= $("<td class='rightAlign borderTop borderRight' >"+totalLRFreight+"</td>");
			var td4	= $("<td class='rightAlign borderTop borderRight' >"+totalChargedWeight+"</td>");
			var td5	= $("<td class='rightAlign borderTop borderRight' >"+totalDiffAmount+"</td>");
			
			newTotalTr.append(td1);
			newTotalTr.append(td2);
			newTotalTr.append(td3);
			newTotalTr.append(td4);
			newTotalTr.append(td5);
			
			tableObject.append(newTotalTr);
			tableTdObject.append(tableObject);
			tableTrObject.append(tableTdObject);
			
			if(headerPrint)
				rowsPerPageSummary			= 27;
			else
				rowsPerPageSummary			= 40;
			
			if(totalRow > rowsPerPageSummary && pageWiseHeader){
				headerPrint		= false;
				totalRow = 0;
				tableTrObject.append('<tr><td colspan="5" class="borderTop borderBot"></td></tr>');
				var headerTr	= $("<tr class='page-break marginTop'></tr>");
			
				if(pageWiseHeader)
					var headerTd	= $("<td colspan='5' class='borderBot'></td>");
				else
					var headerTd	= $("<td colspan='5' class='borderBot hide'></td>");
				
				headerTd.append($("#"+(groupData.accountGroupName).split(" ")[0]).clone());
				headerTr.append(headerTd);
				tableObject.append(headerTr);
				
				headerTd.append($("#ReportHead"+groupData.accountGroupName.split(" ")[0]).clone());
				headerTr.append(headerTd);
				tableObject.append(headerTr);
				
				if(dataTotalPartialHeader.length > 1)
					tableObject.append(dataTotalPartialHeader[1]);
				else
					tableObject.append(dataTotalPartialHeader.clone());
			}
			
			if(count > 0)
				displayData.push(ReportHead);
			
			var tableTrLSRemark	= $("<tr class='headingHeight'><td colspan='2' class='bold marginTop infoStyle'>Remark : "+remarkRow+"</td></tr>");
			displayData.push(tableTrObject);
			displayData.push(tableTrLSRemark);
			groupHeaderWiseTable.append(displayData);
		
		}
	});
});