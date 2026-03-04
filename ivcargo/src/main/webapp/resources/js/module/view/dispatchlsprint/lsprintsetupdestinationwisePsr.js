define (['language',
	'jquerylingua',
	PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatchlsprint/dispatchlsprintdestinationwisefilepath.js'],
	function(Language, JqueryLingua, FilePath){
	'use strict'; // Necessary Imports
	var _this;
	var totalRow			= 0;
	var headerPrint			= true;
	var lsSrcBranch 		= null;
	return ({
		setDataForView : function (responseObj){
		}, setDefaultPrint:function(responseObj,printType) {
			showLayer();
			_this = this;
			var loadelement = new Array();
			var baseHtml 	= new $.Deferred();
			loadelement.push(baseHtml);

			var printType  = printType;
			
			$("#mainContent").load("/ivcargo/html/print/dispatch/"+responseObj.FlavorConfiguration.dispatchLsSummaryPrintFlavor+".html", function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				var collection 							= responseObj.PrintHeaderModel;
				var dispatchData 						= responseObj.dispatchLRSummary;
				var dispatchLSLRCharge 					= responseObj.dispatchLSLRCharge
				var dispatchLSHeader					= responseObj.dispatchLSHeader;
				var dispatchLSLRFormSummary 			= responseObj.dispatchLSLRFormSummary;
				lsSrcBranch 							= responseObj.lsSrcBranch;
				var dispatchDataAccountGroupWise 		= new Object();
				var dispatchLSHeaderAccountGroupWise	= new Object();
				var groupDataObject 					= new Object();
				var displayData 						= new Array();
				var dispatchLSLRFormSummaryAccountGroupWise = new Object();
				var groupDataArrayObject;
				
				_.mapObject(collection,function(groupData,key){
					groupDataArrayObject = groupDataObject[groupData.accountGroupName];
					
					if(groupDataArrayObject == undefined)
						groupDataArrayObject = new Array();
					
					groupDataObject[groupData.accountGroupName] = groupData;

					groupDataArrayObject = dispatchDataAccountGroupWise[groupData.accountGroupName];
					
					if(groupDataArrayObject == undefined)
						groupDataArrayObject = new Array();
					
					var newObj = new Object();
					
					_.mapObject(dispatchData[key], function(sourceBranchData, sourceBranchId) {
						newObj[sourceBranchId] = sourceBranchData;
					})
					
					groupDataArrayObject.push(newObj);
					dispatchDataAccountGroupWise[groupData.accountGroupName] = groupDataArrayObject;

					groupDataArrayObject = dispatchLSHeaderAccountGroupWise[groupData.accountGroupName];
				
					if(groupDataArrayObject == undefined)
						groupDataArrayObject = new Array();
				
					var newObj = new Object();
				
					_.mapObject(dispatchLSHeader[key], function(sourceBranchData, sourceBranchId){
						newObj[sourceBranchId] = sourceBranchData;
					})
				
					groupDataArrayObject.push(newObj);
					dispatchLSHeaderAccountGroupWise[groupData.accountGroupName] = groupDataArrayObject;
					
					if(dispatchLSLRFormSummary[key].length > 0) {
						groupDataArrayObject = dispatchLSLRFormSummaryAccountGroupWise[groupData.accountGroupName];
				
						if(groupDataArrayObject == undefined)
							groupDataArrayObject = new Array();
				
						var newObj = new Object();
						_.mapObject(dispatchLSLRFormSummary[key], function(sourceBranchData, sourceBranchId) {
							newObj[sourceBranchId] = sourceBranchData;
						})
						
						groupDataArrayObject.push(newObj);
						dispatchLSLRFormSummaryAccountGroupWise[groupData.accountGroupName] = groupDataArrayObject; 
					}
				});
				
				var accountGroupKey			= Object.keys(groupDataObject);
				
				for(var key in accountGroupKey) {
					_this.setHeaderWiseData(groupDataObject[accountGroupKey[key]], dispatchDataAccountGroupWise[accountGroupKey[key]], dispatchLSLRCharge, dispatchLSHeaderAccountGroupWise[accountGroupKey[key]], displayData);
				}

				hideLayer();
				
				setTimeout(function() {
					window.print();
				},200);
			});
				
		}, setHeaderWiseData : function (groupData, contentCollection, dispatchLSLRCharge, dispatchLSHeaderAccountGroupWise, displayData) {
			totalRow						= 0;
			headerPrint						= true;
			var groupHeaderWiseTable		= $(".lsPrintTable");
			var tableObjTr					= $('<tr id='+(groupData.accountGroupName).split(" ")[0]+' class="page-break marginTop"></tr>');
			var destinationWiseCollection 	= new Object();
			var destinationKeyVal 			= new Object();
			var partialCollection 			= new Array();
			var contentFinalObj 			= new Object();
			var jsonArray;
			
			_.each(contentCollection, function(content) {
				_.mapObject(content, function(jsonCheck, key) {
					jsonArray 		= contentFinalObj[key];
					
					if(jsonArray == undefined)
						jsonArray = new Array();
					
					_.each(jsonCheck,function(dataIndex){
						jsonArray.push(dataIndex);
					})
					contentFinalObj[key] = _.sortBy(jsonArray, 'wayBillNumber');;
				})
			})
			
			_.mapObject(contentFinalObj,function(data, key) {
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
			
			displayData  = _this.setHeader(dispatchLSHeaderAccountGroupWise, groupData, tableObjTr, displayData);
			groupHeaderWiseTable.append(displayData);
			
			_this.setSummaryOfDestination(destinationWiseCollection);
			
			headerPrint						= false;
		}, setHeader : function(dispatchLSHeader, groupData, tableObjTr, displayData){
			if (totalRow == 0 && headerPrint){
				//headerPrint						= false;
				var herderObject						= $("#header").children().children();
				var outerTd								= $("<td colspan='1' class='width50Per'></td>");
				//var outerTd2							= $("<td colspan='1' class='width50Per' id='"+(groupData.accountGroupName).split(" ")[0]+"1'></td>");
				var tableObj							= $("<table class='width100per infoStyle'>");
				var columnObjectForDetails				= herderObject.children();
				var keyObject							= Object.keys(dispatchLSHeader); // Derived Keys For Reference
				var headerData							= dispatchLSHeader[keyObject[0]]; // Derived Object From Response
				
				$(".hidetableForsummaryPrint").css("display","none");
				
				$("[data-group='name']").html(groupData.accountGroupName);
				$("[data-address='branchAddress']").html('Address: ' + groupData.branchAddress);
				
				if(headerData[0].dispatchLSExecutiveBranchPhoneNumber != undefined && headerData[0].dispatchLSExecutiveBranchPhoneNumber != 'undefined')
					$("[data-phoneNumber='branchPhoneNumber']").html('Phone No.: ' + headerData[0].dispatchLSExecutiveBranchPhoneNumber);
				else
					$("[data-phoneNumber='branchPhoneNumber']").html('Phone No.: ');
					
				$("[data-ls='branchGSTN']").html('GST No: ' + groupData.branchGSTN != undefined ? groupData.branchGSTN : '');
				
				$("[data-report='reportType']").html('Dispatch Stock Report');
				
				$("*[data-selector='fromBranchLabel']").html('From:');
				$("*[data-selector='toBranchLabel']").html('To:');
				$("*[data-selector='dispatchNumberLabel']").html('Loading Sheet No.:');
				$("*[data-selector='dispatchDateLabel']").html('Date:');
				$("*[data-selector='vehicleNumberLabel']").html('Vehicle No.:');
				$("*[data-selector='driverNameLabel']").html('Driver:');
				$("*[data-selector='vehicalOwnerLabel']").html('Broker/Owner Name :');
				$("*[data-selector='drivingLicenseLable']").html('Driving Licence no.:');
				$("*[data-selector='consolidateEwayBill']").html('CEway Bill Number:');
				
				$("*[data-info='fromBranch']").html(headerData[0].dispatchLSSourceBranchName+" ("+headerData[0].dispatchLsSourceCityName+")");
				$("*[data-info='toBranch']").html(headerData[0].dispatchLSDestinationBranchName+" ("+headerData[0].dispatchLsDestinationCityName+")");
				$("*[data-info='dispatchNumber']").html(headerData[0].lsNumber);
				$("*[data-info='dispatchDate']").html(headerData[0].dispatchDateStr);
				$("*[data-info='vehicleNumber']").html(headerData[0].vehicleNumber);
				$("*[data-info='driverName']").html(headerData[0].driverName);
				$("*[data-info='driverMobileNumberWithBracket']").html('('+headerData[0].driverMobileNumber+')');
				$("*[data-info='ownerName']").html(headerData[0].ownerName);
				$("*[data-info='consolidatedEwaybillNumber']").html(headerData[0].consolidatedEwaybillNumber);
				
				var sideHerderObject			= $("#sideHeader").clone();

				for(var i = 0; i < columnObjectForDetails.length ; i++){
					var datapiker		= $(columnObjectForDetails[i]).attr("data-group");
					var newtd 			= $("<td class='centerAlign '></td>");
					var newTr			= $("<tr></tr>");
										
					$(newtd).attr("class",$(columnObjectForDetails[i]).attr("class"));
					$(newtd).addClass("page-break");
					$(newtd).attr("data-group",datapiker);
					$(newtd).attr("style",$(columnObjectForDetails[i]).attr("style"));
					
					if(datapiker == 'name'){
						newtd.append(groupData.accountGroupName);
						newTr.append(newtd);
					}
					
					if(datapiker == 'branchName') {
						newtd.append(lsSrcBranch.branchName);
						newTr.append(newtd);
					}
					
					if(datapiker == 'branchAddress') {
						newtd.append(lsSrcBranch.branchAddress);
						newTr.append(newtd);
					}
					
					if(datapiker == 'branchPhoneNumber') {
						newtd.append(lsSrcBranch.branchContactDetailPhoneNumber);
						newTr.append(newtd);
					}
					
					tableObj.append(newTr);
				}

				outerTd.append(tableObj);
				tableObjTr.append(outerTd)
				tableObjTr.append(sideHerderObject)
				displayData.push(tableObjTr);
				
				return displayData;
			}
		}, setSummaryOfDestination : function (destinationWiseCollection) {
			$('.TotalSummaryDestinationWise').removeClass('hide');
			
			totalRow++;
			var keyObject							= Object.keys(destinationWiseCollection); 
			var tbody	= $("[data-table-total-dest='lrDestinationBranch']").parent().parent();
			tbody		= (tbody[tbody.length - 1]);
			
			var columnObjectForDetails				= $("[data-total-dest-row='divTable']").children();
			count									= 0;
			var totalNumberLrs						= 0;
			
			var totalLRs				= 0;
			var totalArticle			= 0;
			var actualWeight			= 0;
			var totalPaidGrandTotal		= 0;
			var totalToPayGrandTotal	= 0;
			var totalTBBGrandTotal		= 0;
			var totalBookingGrandTotal	= 0;
			
			for(var key in keyObject) {
				totalRow++;
				var totalnoOfArticle				= 0; 
				var totalactualWeight				= 0; 
				var totalTopayAmount				= 0; 
				var totalPaidAmount					= 0; 
				var totalTbbAmount					= 0;
				var totalAmount						= 0; 
				var wayBillDestBranch				= null;
				
				var dispatchDetails					= destinationWiseCollection[keyObject[key]];
				
				totalNumberLrs = dispatchDetails.length;
				totalLRs	+= totalNumberLrs;
				
				_.each(dispatchDetails, function(waybillIdData) {
					count++;
					totalactualWeight		+= waybillIdData.wayBillActualWeight;
					totalnoOfArticle		+= waybillIdData.wayBillArticleQuantity;
					
					wayBillDestBranch 	= waybillIdData.wayBillDestinationBranchName;
					
					if(waybillIdData.wayBillTypeId == WAYBILL_TYPE_TO_PAY)
						totalTopayAmount 	+= waybillIdData.wayBillGrandTotal;
					else if(waybillIdData.wayBillTypeId == WAYBILL_TYPE_PAID)
						totalPaidAmount 	+= waybillIdData.wayBillGrandTotal;
					else if(waybillIdData.wayBillTypeId == WAYBILL_TYPE_CREDIT)
						totalTbbAmount 		+= waybillIdData.wayBillGrandTotal;
					
					totalAmount += waybillIdData.wayBillGrandTotal;
				})
				
				totalArticle			+= totalnoOfArticle;
				actualWeight			+= totalactualWeight;
				totalPaidGrandTotal		+= totalPaidAmount;
				totalToPayGrandTotal	+= totalTopayAmount;
				totalTBBGrandTotal		+= totalTbbAmount;
				totalBookingGrandTotal	+= totalAmount;
				
				var newtr 		= $("<tr></tr>");

				for(var j = 0; j < columnObjectForDetails.length; j++){
					var newtd 		= $("<td></td>");
					var dataPicker 	= $(columnObjectForDetails[j]).attr("data-table-total-dest");
					
					$(newtd).attr("class", $(columnObjectForDetails[j]).attr("class"));
					$(newtd).attr("data-table-total-dest", dataPicker);
					
					if(dataPicker == 'lrDestinationBranch')
						newtd.append(wayBillDestBranch);
					
					if(dataPicker == 'totalNumberLrs')
						newtd.append(totalNumberLrs);
					
					if(dataPicker == 'totalNoOfArticles')
						newtd.append(totalnoOfArticle);
					
					if(dataPicker == 'totalActualWeight')
						newtd.append(totalactualWeight);
					
					if(dataPicker == 'paidTotal')
						newtd.append(totalPaidAmount);
					
					if(dataPicker == 'topayTotal')
						newtd.append(totalTopayAmount);
					
					if(dataPicker == 'tbbTotal')
						newtd.append(totalTbbAmount);
					
					if(dataPicker == 'totalAmount')
						newtd.append(totalAmount);
					
					$(newtr).append($(newtd));
				}
				
				$(tbody).before(newtr);
			}
			
			$("[data-destWiseSummaryFooterDetail='totalLRs']").html(totalLRs);
			$("[data-destWiseSummaryFooterDetail='totalArticle']").html(totalArticle);
			$("[data-destWiseSummaryFooterDetail='actualWeight']").html(actualWeight);
			$("[data-destWiseSummaryFooterDetail='totalPaidGrandTotal']").html(totalPaidGrandTotal);
			$("[data-destWiseSummaryFooterDetail='totalToPayGrandTotal']").html(totalToPayGrandTotal);
			$("[data-destWiseSummaryFooterDetail='totalTBBGrandTotal']").html(totalTBBGrandTotal);
			$("[data-destWiseSummaryFooterDetail='totalBookingGrandTotal']").html(totalBookingGrandTotal);
			
			$("[data-total-dest-row='divTable']").remove();
		}
	});
});