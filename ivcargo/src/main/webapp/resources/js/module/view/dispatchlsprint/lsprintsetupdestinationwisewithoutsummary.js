define (['language',
	'jquerylingua',
	PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatchlsprint/dispatchlsprintdestinationwisewithoutsummaryfilepath.js',
	PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatchlsprint/dispatchlsprintsummarydestinationwisefilepath.js',
	PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatchlsprint/dispatchlslrformdetailsfilepath.js',
	PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatchlsprint/dispatchlhpvsummaryfilepath.js',
	PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatchlsprint/dispatchpartiallsdetailsfilepath.js'],
	function(Language, JqueryLingua, FilePath, SummaryFilePath, FormFilePath, LHPVSummaryFilePath, PartialLRSummary){
	'use strict'; // Necessary Imports
	var totalgrandactualWeight	= 0;
	return {
		setDefaultPrint:function(responseObj) {
			var _this = this;
			var collection 							= responseObj.PrintHeaderModel;
			var dispatchData 						= responseObj.dispatchLRSummary;
			var dispatchDataAccountGroupWise 		= new Object();
			var dispatchLSHeader					= responseObj.dispatchLSHeader;
			var dispatchLSHeaderAccountGroupWise	= new Object();
			var dispatchLSLRFormSummary 			= responseObj.dispatchLSLRFormSummary;
			var displayLSTotalSummary				= responseObj.displayLSTotalSummary;
			var dispatchLSLRFormSummaryAccountGroupWise = new Object();

			var groupDataObject = new Object();
			var groupDataArrayObject;

			totalgrandactualWeight = _this.getTotalWeight(dispatchData);

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

			})

			var dispatchLSLRCharge 			= responseObj.dispatchLSLRCharge
			var configuration 				= responseObj.configuration;
			var summaryConfiguration 		= responseObj.SummaryConfiguration;
			var LSLRFormDetailsConfig 		= responseObj.LSLRFormDetailsConfig;
			var LHPVSummaryConfig 			= responseObj.LHPVSummaryConfig;
			var showPartialLSDetailsSummary = responseObj.showPartialLSDetailsSummary;
			var partialLSconfiguration 		= responseObj.partialLSconfiguration;
			
			var finalDivObj = $('<div/>')
			var langObjLRSummary		= FilePath.loadLanguage(); // Read Data From en-gb File LR Summary Specific
			var langKeySetLRSummary		= loadLanguageWithParams(langObjLRSummary);
			_.mapObject(groupDataObject,function(groupData,key){
				finalDivObj.append(_this.setHeaderWiseData(groupData,dispatchDataAccountGroupWise[key],dispatchLSLRCharge,configuration,langKeySetLRSummary,dispatchLSHeaderAccountGroupWise[key],summaryConfiguration,dispatchLSLRFormSummaryAccountGroupWise[key],LSLRFormDetailsConfig,LHPVSummaryConfig,showPartialLSDetailsSummary,partialLSconfiguration,displayLSTotalSummary))
			})

			return finalDivObj;
		},applyCSS:function(SetUpConfig, copyDataForPrint) { // Function To Apply CSS
			this.loadCss(); // To Load CSS Files
			var functionName	= SetUpConfig.cssConfiguration; // Derived Function Name From Configuration
			if(copyDataForPrint == undefined){
				copyDataForPrint = false;
			}
			eval("this."+functionName+"("+copyDataForPrint+")"); // Call To Function

			$("*[data-header='MainHeaderBreak']").first().removeClass('page-break');
			//this.resetVariablesOfLS()
		},loadCss:function() { // Function To Load CSS
			var link = document.createElement("link"); // Create link
			link.type = "text/css"; // Set Type
			link.rel = "stylesheet"; // Set Relativity
			link.href = "/ivcargo/resources/css/module/dispatch/dispatchlsprint.css"; // Path To File
			document.getElementsByTagName("head")[0].appendChild(link); // Append To Document
			$("*[data-headerCell]").addClass("truncate");
			//$("*[data-dataCell]").addClass("truncate");
			$("*[data-dataCell]").addClass("headersAlignCenter");

		},
		defaultCSS:function(copyDataForPrint) { // Default CSS Class Application
			$("*[data-header=MainHeaderBreak]").addClass("page-break"); // To Set Page Braker
			$("*[data-header]").addClass("headersAlignCenter"); // To Align Header In Center And Apply Font
			$("*[data-subheader]").addClass("headersAlignCenter"); // To Align Header In Center And Apply Font
			//$("*[data-table]").addClass("table");
			//$("*[data-headerCell]").addClass("tableCells");
			//$("*[data-dataCell]").addClass("tableCells");
//			$("*[data-dataCell=wayBillArticleQuantity]").addClass("rightCell");
			$("*[data-dataCell=wayBillGrandTotal]").addClass("rightCell");
			$("*[data-div]").addClass("lineDiv");
			$("*[data-RightDiv=lsNumber]").addClass("rightDiv");
			$("*[data-LeftDiv=vehicleNumber]").addClass("leftDiv");
			$("*[data-LeftDiv=driverMobileNumber]").addClass("leftDiv");
			$("*[data-RightDiv=dateString]").addClass("rightDiv");
			$("*[data-LeftDiv=driverName]").addClass("leftDiv");
			$("*[data-RightDiv=dispatchLSDestinationBranchName]").addClass("rightDiv");
			$("*[data-RightDiv=actualDispatchDateTimeString]").addClass("rightDiv");
			$("*[data-LeftDiv=dispatchLSSourceBranchName]").addClass("leftDiv");
			$("*[data-totalTable=totalTableCell]").addClass("totalTableCell");
			$("*[data-totalTable=totalTableCell]").addClass("headersAlignCenter");
			//this.plainPrint(copyDataForPrint); // To Call Print For Dot Matrix Printer

		},
		plainPrint:function(copyDataForPrint) { // Function For Dot Matrix Printer Print. It Will Remove CSS Class
			$("*[data-table]").removeClass("table");
			$("*[data-headerCell]").removeClass("tableCells");
			$("*[data-dataCell]").removeClass("tableCells");
			$("*[data-table]").addClass("plainTable");

			if(copyDataForPrint){
				var width = 800;
				var height = 500;
				var left = parseInt((screen.availWidth/2) - (width/2));
				var top = parseInt((screen.availHeight/2) - (height/2));
				var childwin = window.open ('', 'Print-Window', "config='height='+height+',width='+width+',left='+left+ ',top='+top+', toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no'");
				childwin.document.open();
				childwin.document.write('<html><head><title>IVCargo!</title><link rel="stylesheet" href="/ivcargo/resources/css/module/dispatch/dispatchlsprint.css" ></head><body onload="window.print()">'+$('#lsPrintDiv').html()+'</body></html>');
				childwin.document.close();
				hideLayer();
			}else{
				setTimeout(function(){window.print();},200)
			}
		},setHeaderWiseData:function(headerCollection,contentCollection,dispatchLSLRCharge,configuration,langKeySetLRSummary,dispatchLSHeader,summaryConfiguration,dispatchLSLRFormSummary,LSLRFormDetailsConfig,LHPVSummaryConfig,showPartialLSDetailsSummary,partialLSconfiguration,displayLSTotalSummary){
			var _this = this;
			var divObj = $('<div/>')
			var cellDataArray; // Array For Table Cells
			var lrSumarySequenceArray; // Array For Table Cells

			var destinationKeyVal = new Object();
			var partialCollection = new Array();
			var contentFinalObj = new Object();
			var jsonArray;
			_.each(contentCollection,function(content){
				_.mapObject(content,function(jsonCheck,key){
					jsonArray = contentFinalObj[key];
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
						destinationData['wayBillOtherAmount'] 			= 0;
						destinationData['wayBillServiceTaxAmount'] 	= 0;
						destinationData['wayBillCarrierRiskAmount']	= 0;
						destinationData['wayBillType'] 				= "FOC";
					}else{
						for (var k=0; k<dispatchCharges.length; k++) {
							destinationData['wayBillVasuliAmount'] 		= Math.round(dispatchCharges[k].wayBillVasuliAmount);
							destinationData['wayBillOtherAmount'] 		= Math.round(dispatchCharges[k].wayBillOtherAmount);
							destinationData['wayBillServiceTaxAmount'] 	= Math.round(dispatchCharges[k].wayBillServiceTaxAmount);
							destinationData['wayBillCarrierRiskAmount']	= Math.round(dispatchCharges[k].wayBillCarrierRiskAmount) + Math.round(dispatchCharges[k].wayBillCrInsurAmount);
							destinationData['chargeAmount']				= Math.round(dispatchCharges[k].chargeAmount);
						}
					}

					destinationData['wayBillDestinationBranchAbrvtinCode']	= destinationData.wayBillSourceBranchName;
					destinationKeyVal[destinationData['wayBillDestinationBranchId']] = destinationData['wayBillDestinationBranchName'];
					if(destinationData.partial){
						partialCollection.push(destinationData);
					}

				})

			})
			var destinationCollection = new Object();
			_.mapObject(contentFinalObj,function(data,key){
				//.log('data test ',destinationKeyVal[key])
				destinationCollection[destinationKeyVal[key]] = data;
			})
			var destination = _.keys(destinationCollection);
			var destinationWisekeys = destination.sort()
			//.log('destinationWisekeys ',destinationWisekeys.length)
			for(var i = 0;i<destinationWisekeys.length;i++ ){
				
				var destinationWisekeys1 = new Array();
				destinationWisekeys1.push(destinationWisekeys[i]);
				_this.setHeader(headerCollection,divObj,dispatchLSHeader,destinationWisekeys[i])
				var finalObj = new Object();
				_.each(destinationWisekeys1,function(destionationBranch){
					finalObj[destionationBranch] = destinationCollection[destionationBranch];
				})
				var destinationWiseCollection = new Array();
				_.mapObject(finalObj,function(data,key){
					destinationWiseCollection.push({'destinationBranchName' : key})
					_.each(data,function(destinationData){
						destinationWiseCollection.push({'destinationBranchData':destinationData});
					})
				})
				var splittedVal = destinationWiseCollection.chunk_inefficient(31);
				_.each(splittedVal,function(pageWiseContent){
					var tableObj = $('<table width="100%">')
					var dataObject		= _this.getTableHeaderCell(configuration, langKeySetLRSummary, 1); // Derived Table Header From Function
					cellDataArray = dataObject.tableHeaderArray;
					lrSumarySequenceArray = dataObject.lrSumarySequenceArray;
					var newtr = $('<tr>')
					for (var i=0; i<cellDataArray.length; i++) {
						newtr.append(cellDataArray[i]); // Appended Table Header To Table Row
					}
					tableObj.append(newtr);
					var totalnoOfArticle					= 0; // For LR total below LR Rows
					var totalactualWeight					= 0; // For LR total below LR Rows
					var totalPaid							= 0; // For LR total below LR Rows
					var totalTopay							= 0; // For LR total below LR Rows
					var totalTbb							= 0; // For LR total below LR Rows

					_.each(pageWiseContent,function(lrDataContent){
						if(lrDataContent['destinationBranchName'] != undefined){
							_this.setTableHeaderContent(lrDataContent,tableObj)
						}else{
							var dataObj = lrDataContent['destinationBranchData'];
							totalnoOfArticle 		+= 	parseInt(dataObj.wayBillArticleQuantity);
							totalactualWeight		+= 	parseFloat(dataObj.wayBillActualWeight);
							if(dataObj.wayBillTypeId == 1) {
								totalPaid		+= 	parseFloat(dataObj.wayBillGrandTotal);
							} else if(dataObj.wayBillTypeId == 2) {
								totalTopay		+= 	parseFloat(dataObj.wayBillGrandTotal);
							}else if(dataObj.wayBillTypeId == 4){
								totalTbb		+= 	parseFloat(dataObj.wayBillGrandTotal);
							}
							_this.setTableContent(lrDataContent,tableObj,langKeySetLRSummary);
						}
					})
					var totalObject			= new Object(); // DTO For Total
					totalObject.wayBillArticleQuantity		= totalnoOfArticle;  // Assigning Values
					totalObject.wayBillActualWeight			= totalactualWeight;  // Assigning Values
					totalObject.wayBillPaidTotal			= totalPaid;  // Assigning Values
					totalObject.wayBillTopayTotal			= totalTopay;  // Assigning Values
					totalObject.wayBillTBBTotal				= totalTbb;  // Assigning Values
					var newtr = $('<tr>');

					cellDataArray = _this.getLRSummaryTotals(totalObject, configuration, lrSumarySequenceArray); // Get Array Of <td> With Function
					for (var i=0; i<cellDataArray.length; i++) {
						newtr.append(cellDataArray[i]); // Append Data To Row
					}
					var tfoot = $('<tfoot/>')
					tfoot.append(newtr)
					tableObj.append(tfoot);
					divObj.append(tableObj)
				});
			}
			
			return divObj;
		},setTableHeaderContent:function(lrDataContent,tableObj){
			var newtr = $('<tr>')
			var newtd = $('<td colspan="3" style="font-weight:bold">')
			newtd.append(lrDataContent['destinationBranchName']);
			newtr.append(newtd)
			tableObj.append(newtr)
		},setTableContent:function(lrDataContent,tableObj,langKeySetLRSummary){
			var cellDataArray = this.getTableDataCell(lrDataContent['destinationBranchData'],langKeySetLRSummary)
			var newtr = $('<tr>')
			for (var i=0; i<cellDataArray.length; i++) {
				newtr.append(cellDataArray[i]); // Appended Table Header To Table Row
			}
			tableObj.append(newtr)
		},
		setHeader:function(headerCollection,divObj,dispatchLSHeader,destinationWisekeys){
			var mainHeader = new Array();
			var subHeader = new Array();
			var reportHeader = new Array();
			var displayData = new Array();
			var dataDiv				= new Array(); // LS Header Data Div
			var divName						= new Array(); // To Apply CSS Class
			var headerData			= dispatchLSHeader[0]; // Derived Object From Response
			var keyObject			= Object.keys(headerData[0]); // Derived Keys For Reference
			mainHeader.push(headerCollection.accountGroupName); // Main Header i.e. Group Name  
			subHeader.push(headerCollection.branchName); // Sub Header i.e. Branch Name
			subHeader.push(headerCollection.branchAddress); // Sub Header i.e. Branch Address
			subHeader.push(headerCollection.branchContactDetailPhoneNumber); // Sub Header i.e. Phone Number
			reportHeader.push("Motor Report");

			displayData		= this.getHeaderData(mainHeader,subHeader,reportHeader); // Derived Header Data Divs With Function
			for (var i=0; i<displayData.length; i++) {
				divObj.append(displayData[i]); // Iterated Over Array For Appending Data To Display Screen
			}

			// Preparing Data Div For Other Details Appending To Display Screen
			var firstLine = $("<div />"); // First Line Div After Headers
			firstLine.attr('data-div',"first"); // Applying CSS Class
			dataDiv.push("<b>Truck No. : </b>" + headerData[0].vehicleNumber); // Providing Data For Div Creation i.e. Vehicle Number
			divName.push(keyObject[5]); // Providing CSS Class Name For Div
			dataDiv.push("<b>Motor Report No. : </b>" + headerData[0].lsNumber); // Providing Data For Div Creation i.e. Vehicle Number
			divName.push(keyObject[14]);// Providing CSS Class Name For Div
			displayData		= this.getDivData(dataDiv, divName); // Derived Data Divs With Function
			for (var i=0; i<displayData.length; i++) {
				firstLine.append(displayData[i]); // Appended Divs To FirstLine
			}
			divObj.append(firstLine); // Appended First Line To Display Screen
			dataDiv	= []; // Cleared For Next Line
			divName = []; // Cleared For Next Line

			var secondLine = $("<div />"); // Second Line Div
			secondLine.attr('data-div',"second"); // Applying CSS Class
			dataDiv.push("<b>Driver : </b>" + headerData[0].driverName+"("+headerData[0].driverMobileNumber+")"); // Providing Data For Div Creation i.e. Driver Details 
			divName.push(keyObject[5]); // Providing CSS Class Name For Div
			dataDiv.push("<b>Date : </b>"+headerData[0].dispatchDateStr); // Providing Data For Div i.e. Date String
			divName.push(keyObject[14]); // Providing CSS Class Name For Div
			dataDiv.push(headerData[0].vehicleAgentName); // Providing Data For Div i.e. Agent Name
			divName.push(keyObject[11]); // Providing CSS Class Name For Div
			displayData		= this.getDivData(dataDiv, divName); // Derived Data Divs With Function
			for (var i=0; i<displayData.length; i++) {
				secondLine.append(displayData[i]); // Appended Divs To SecondLine
			}
			divObj.append(secondLine); // Appended Second Line To Display Screen
			dataDiv	= []; // Cleared For Next Line
			divName = []; // Cleared For Next Line

			if(headerData[0].vehicleAgentName !== null){ // Check Null For Agent Name
				var thirdLine = $("<div />"); // Third Line Div
				thirdLine.attr('data-div',"third"); // Applying CSS Class
				dataDiv.push(headerData[0].vehicleAgentName); // Providing Data For Div i.e. Agent Name
				divName.push(keyObject[11]); // Providing CSS Class For Div
				displayData		= this.getDivData(dataDiv, divName); // Derived Data Divs With Function
				for (var i=0; i<displayData.length; i++) {
					thirdLine.append(displayData[i]); // Appended Divs To ThirdLine
				}
				divObj.append(thirdLine);// Appended Third Line To Dispay Screen
				dataDiv	= []; // Cleared For Next Line
				divName = []; // Cleared For Next Line
			}

			var fourthLine = $("<div />"); // Fourth Line Div
			fourthLine.attr('data-div',"fourth"); // Appying CSS Class
			dataDiv.push("From :"+headerData[0].dispatchLSSourceBranchName); // Providing Data For Div i.e. Source Branch Name
			divName.push(keyObject[7]); // Providing CSS Class Name For Div
			dataDiv.push("To :"+destinationWisekeys); // Providing Dat For Div i.e. Destination Branch Name
			divName.push(keyObject[9]);// Providing CSS Class Name For Div
			displayData		= this.getDivData(dataDiv, divName); // Derived Data Divs With Function
			for (var i=0; i<displayData.length; i++) {
				fourthLine.append(displayData[i]); // Appended Divs To Fourth Line
			}
			divObj.append(fourthLine); // Appended Fourth Line To Display Screen
			dataDiv		= []; // Cleared For Re-Use
			divName 	= []; // Cleared For Re-Use
			mainHeader	= []; // Cleared For Re-Use
			subHeader	= []; // Cleared For Re-Use
			reportHeader = [];


		},getHeaderData:function(mainHeader, subHeader, reportHeader) { // Function For MainHeader & SubHeader
			var mainHeaderTag		= $("<h1 />"); // H1 Tag For MainHeader
			mainHeaderTag.attr('data-header', ""); // Providing CSS Class
			var subHeaderTag		= $("<h4 />"); // H4 Tag For SubHeader
			var reportHeaderTag		= $("<h1 />");
			subHeaderTag.attr('data-subHeader', "SubHeader"); // Providing CSS Class
			reportHeaderTag.attr('data-header', "MainHeader");
			var headerArray	=	new Array(); // Response Array For Headers

			var divArray	= this.getDivForHeader(mainHeader); // Derived Div For H1 Tag
			for (var i=0; i<divArray.length; i++) {
				mainHeaderTag.append(divArray[i]); // Appended Into H1 Tag
			}
			headerArray.push(mainHeaderTag); // Added To Response

			divArray		= this.getDivForHeader(subHeader); // Derived Div For H4 Tag
			for (var i=0; i<divArray.length; i++) {
				subHeaderTag.append(divArray[i]); // Appended Into H4 Tag
			}
			headerArray.push(subHeaderTag); // Added To Response
			divArray		=  this.getDivForHeader(reportHeader);
			for (var i=0; i<divArray.length; i++) {
				reportHeaderTag.append(divArray[i]); // Appended Into H4 Tag
			}
			headerArray.push(reportHeaderTag);
			return headerArray; // Array Returned
		},
		getDivForHeader:function(dataArray){ // Funtion For Header Div
			var divDataArray	= new Array(); // Response Array For Headers
			for (var i=0; i<dataArray.length; i++) {
				var blankDiv	= $("<div />"); // Provided Blank Div For Padding Of Pre-Printed Stationary OR To Display Relative Value For Next Div 
				blankDiv.attr('data-headerDiv', "BlankHeaderDiv"); // Providing CSS Class
				var div			= $("<div />"); // Data Div
				div.attr('data-headerDiv', "DataHeaderDiv");  // Providig CSS Class
				div.html(dataArray[i]); // Providing Display Value For Received Array
				divDataArray.push(blankDiv); // Preparing Response
				divDataArray.push(div); // Preparing Response
			}
			return divDataArray; // Array Returned
		},
		getTableHeaderCell:function(dataObject, langKeySet, sequenceRef) { // Function To Create <th>
			var lrRef	= 1;
			var lsRef	= 2;
			var lhpvRef	= 3;
			var tableHeaderArray	= new Array(); // Array For Response
			var lrSumarySequenceArray = new Array();
			var lsSummarySequenceArray = new Array();
			var lhpvSummarySequenceArray = new Array();
			var configKey			= Object.keys(dataObject); // Get Keys For Table Headers
			var headerSequence		= new Object(); // To Maintain Desired Sequence For Data Rendering
			for (var i=0; i<configKey.length; i++) {
				headerSequence[(dataObject[(configKey[i])].Sequence)]	= configKey[i]; // Comparing Key With Object Pushing Data In Sequence Object
			}
			jQuery.each(headerSequence, function(i, configVal){ // Function For Preparing Header In Respect Of Sequence & en-gb
				var headerCell	= $("<th />"); // Table <th> Element
				headerCell.html(langKeySet[configVal]); // Picking Relative Value By Comparing With Sequence & en-gb Key Set
				headerCell.attr('data-headerCell', configVal); // Appying CSS Class
				if (sequenceRef == lrRef) {
					lrSumarySequenceArray.push(configVal);
				}
				if (sequenceRef == lsRef) {					
					lsSummarySequenceArray.push(configVal);
				}
				if (sequenceRef == lhpvRef) {
					lhpvSummarySequenceArray.push(configVal);					
				}
				tableHeaderArray.push(headerCell); // Prepare header Array
			});

			var dataObject = new Object()
			dataObject['tableHeaderArray'] = tableHeaderArray;
			dataObject['lrSumarySequenceArray'] = lrSumarySequenceArray;
			dataObject['lsSummarySequenceArray'] = lsSummarySequenceArray;
			dataObject['lhpvSummarySequenceArray'] = lhpvSummarySequenceArray;
			return dataObject; // Array Returned
		},getTableDataCell:function(dataObject, langKeySet) { // Function To Create Table Cell
			var tableCellDataArray	= new Array(); // Table Cell Data Array
			jQuery.each(langKeySet, function(value, key){ // Function For Preparing <td>
				var tableCell	= $("<td />"); // Table Cell <td> Element
				tableCell.html(0); // Providing Data To <td>
				if(value == 'wayBillPaidTotal' && dataObject['wayBillTypeId'] == 1) {
					tableCell.html(dataObject['wayBillGrandTotal']); // Providing Data To <td>
				} else if(value == 'wayBillTopayTotal' && dataObject['wayBillTypeId'] == 2) {
					tableCell.html(dataObject['wayBillGrandTotal']); // Providing Data To <td>
				} else if(value == 'wayBillTBBTotal' && dataObject['wayBillTypeId'] == 4){
					
					
					tableCell.html(dataObject['wayBillGrandTotal']); // Providing Data To <td>
				}else {
					tableCell.html(dataObject[value]); // Providing Data To <td>
				}
				tableCell.attr('data-dataCell', value); // Appying CSS Class
				tableCellDataArray.push(tableCell); // Pushing <td> In Array
			});

			return tableCellDataArray; // Array Returned
		},getLRSummaryTotals:function(totalObj,configuration,sequenceArray) { // Function To Create Total Cell
			var totalDisplayArray	= new Array();
			for (var i=0; i<sequenceArray.length; i++) {
				if ((configuration[(sequenceArray[i])].Totalable)) {
					var valueForTotal	= totalObj[(sequenceArray[i])];
					var valueCell	= $("<th />");
					valueCell.html(Math.round(valueForTotal));
					totalDisplayArray.push(valueCell);
				} else if(sequenceArray[i] == 'wayBillConsignorName') {
					var valueCell	= $("<th />");
					valueCell.html("Total");
					totalDisplayArray.push(valueCell);
				} else if(sequenceArray[i] == 'wayBillGrandTotal') {
					var valueCell	= $("<th />");
					valueCell.html("Total");
					totalDisplayArray.push(valueCell);
				}else {
					var blankCell	= $("<th />");
					blankCell.html(valueCell);
					totalDisplayArray.push(blankCell)
				}
				
			}
			return totalDisplayArray;
		},setLSTotalSummary:function(lrSummary,dispatchLSHeader,headerCollection,SummaryConfiguration,dispatchLSLRCharge,dispatchLSLRFormSummary,LSLRFormDetailsConfig,LHPVSummaryConfig){
			var _this = this;
			var langObjSummary 			= SummaryFilePath.loadLanguage(); // Read Data From en-gb File For LS Summary Specific
			var langKeySetSummary 		= loadLanguageWithParams(langObjSummary); // Create Key Set For LS Summary Specific
			var divObj = $('<div/>');
			this.setHeader(headerCollection,divObj,dispatchLSHeader);

			var dataObject		= this.getTableHeaderCell(SummaryConfiguration.summaryConfiguration, langKeySetSummary, 2); // Get <th> Array With Function
			var cellDataArray = dataObject.tableHeaderArray;
			var lsSummarySequenceArray = dataObject.lsSummarySequenceArray;

			var tableObj = $('<table width="100%">')

			var newHeadertr	= $('<tr>')
			var dataTd	= $("<td colspan='10' class = 'dataTd' />");
			dataTd.html("Summary Of All Destination Stations");
			newHeadertr.append(dataTd);
			tableObj.append(newHeadertr);

			var newtr = $('<tr>')
			for (var i=0; i<cellDataArray.length; i++) {
				newtr.append(cellDataArray[i]); // Appended Table Header To Table Row
			}
			tableObj.append(newtr);
			var grandTotalLR = 0; // Assigning Values
			var grandTotalArticle= 0;  // Assigning Values
			var grandTotalVasuli = 0;  // Assigning Values
			var grandTotalOther= 0;  // Assigning Values
			var grandTotalWeight= 0;  // Assigning Values
			var grandTotalServiceTax= 0;  // Assigning Values
			var grandTotalCarrierRisk= 0;  // Assigning Values
			var lhpvAmount= 0;
			var noOfLR,
			noOfArticle,
			actualWeight,
			otherAmount,
			serviceTaxAmount,
			carrierRiskAmount,
			destinationWiseLHPVAmount,
			chargeAmount,
			lhpvAverageAmount,
			totalActualWeight,
			vasuliAmount;  

			_.mapObject(lrSummary,function(value,key){
				noOfLR						= 0; // For Summary
				noOfArticle					= 0; // For Summary
				actualWeight				= 0; // For Summary
				vasuliAmount				= 0; // For Summary
				otherAmount					= 0; // For Summary
				serviceTaxAmount			= 0; // For Summary
				carrierRiskAmount			= 0; // For Summary
				destinationWiseLHPVAmount	= 0; // For Summary
				lhpvAverageAmount			= 0;
				chargeAmount				= 0;


				var cellDataArray;
				noOfLR = value.length;
				_.each(value,function(data){
					noOfArticle 		+= parseInt(data.wayBillArticleQuantity);
					actualWeight 		+= parseFloat(data.wayBillActualWeight)
					vasuliAmount 		+= parseFloat(data.wayBillVasuliAmount); 
					otherAmount 		+= parseFloat(data.wayBillOtherAmount); 
					serviceTaxAmount 	+= parseFloat(data.wayBillServiceTaxAmount); 
					carrierRiskAmount 	+= parseFloat(data.wayBillCarrierRiskAmount);
					chargeAmount 		 = parseFloat(data.chargeAmount);
				})

				lhpvAverageAmount = chargeAmount/totalgrandactualWeight;
				destinationWiseLHPVAmount	= actualWeight*lhpvAverageAmount;
				if(isNaN(destinationWiseLHPVAmount)){
					destinationWiseLHPVAmount = 0;
				}
				_.each(value,function(data){
					data.chargeAmount = Math.round(destinationWiseLHPVAmount.toFixed());
				})

				var rowObj = {
					wayBillDestinationBranchAbrvtinCode : key,
					totalNumberOfLR:noOfLR,
					wayBillArticleQuantity:noOfArticle,
					wayBillVasuliAmount:vasuliAmount,
					wayBillOtherAmount:otherAmount,
					wayBillServiceTaxAmount:serviceTaxAmount,
					wayBillCarrierRiskAmount:carrierRiskAmount,
					chargeAmount:Math.round(destinationWiseLHPVAmount.toFixed()),
					wayBillActualWeight:actualWeight
				}

				grandTotalLR += parseInt(noOfLR);
				grandTotalArticle += parseInt(noOfArticle);  // Assigning Values
				grandTotalVasuli += parseFloat(vasuliAmount);  // Assigning Values
				grandTotalOther += parseFloat(otherAmount);  // Assigning Values
				grandTotalWeight+= parseFloat(actualWeight);
				grandTotalServiceTax += parseFloat(serviceTaxAmount);  // Assigning Values
				grandTotalCarrierRisk +=  parseFloat(carrierRiskAmount); // Assigning Values
				lhpvAmount += parseFloat(Math.round(destinationWiseLHPVAmount.toFixed()));


				cellDataArray	= _this.getTableDataCell(rowObj, langKeySetSummary);
				var newtrappend = $('<tr/>')
				_.each(cellDataArray,function(dataColl){
					newtrappend.append(dataColl); // Appended Table Header To Table Row
				})
				tableObj.append(newtrappend);

			})

			divObj.append(tableObj);

			var totalObject			= new Object(); // DTO For Total
			totalObject.totalNumberOfLR				= grandTotalLR; // Assigning Values
			totalObject.wayBillArticleQuantity		= grandTotalArticle;  // Assigning Values
			totalObject.wayBillVasuliAmount			= grandTotalVasuli;  // Assigning Values
			totalObject.wayBillOtherAmount			= grandTotalOther;  // Assigning Values
			totalObject.wayBillActualWeight			= grandTotalWeight;  // Assigning Values
			totalObject.wayBillServiceTaxAmount		= grandTotalServiceTax;  // Assigning Values
			totalObject.wayBillCarrierRiskAmount	= grandTotalCarrierRisk;  // Assigning Values
			totalObject.chargeAmount				= lhpvAmount;  // Assigning Values
			var cellDataArraySummary			= this.getSummaryTotals(totalObject, SummaryConfiguration.summaryConfiguration, lsSummarySequenceArray); // Get Array Of <td> With Function
			var newtrappend = $('<tr/>')
			_.each(cellDataArraySummary,function(dataColl){
				newtrappend.append(dataColl); // Appended Table Header To Table Row
			})
			var newTfoot = $('<tfoot/>')
			newTfoot.append(newtrappend);
			tableObj.append(newTfoot);
			divObj.append(tableObj);

			var lhpvSummaryDiv = _this.setLHPVSummary(LHPVSummaryConfig,lrSummary,dispatchLSHeader,headerCollection,dispatchLSLRCharge,lhpvAmount,grandTotalWeight,lhpvAverageAmount);
			divObj.append(lhpvSummaryDiv);
			var lslrFormDiv = _this.setLSLRFormDetails(dispatchLSLRFormSummary,LSLRFormDetailsConfig,lrSummary);
			divObj.append(lslrFormDiv);

			return divObj;
		},
		getSummaryTotals:function(totalObj,configuration,sequenceArray) { // Function To Create Total Cell
			var totalDisplayArray	= new Array();
			for (var i=0; i<sequenceArray.length; i++) {
				if ((configuration[(sequenceArray[i])].Totalable)) {
					var valueForTotal	= totalObj[(sequenceArray[i])];
					var valueCell	= $("<th />");
					valueCell.html(Math.round(valueForTotal));
					totalDisplayArray.push(valueCell);
				} else {
					var blankCell	= $("<th />");
					blankCell.html("Total");
					totalDisplayArray.push(blankCell)
				}
			}
			return totalDisplayArray;
		},setLSLRFormDetails:function(dispatchLSLRFormSummary,LSLRFormDetailsConfig,dispatchLRSummary){
			var divObj = $('<div/>');
			var _this = this;
			if(dispatchLSLRFormSummary != undefined && dispatchLSLRFormSummary.length > 0){
				var langObjFormDetails 		= FormFilePath.loadLanguage(); // Read Data From en-gb File For Form Details Specific 
				var langKeySetFormDetails 	= loadLanguageWithParams(langObjFormDetails); // Create Key Set For Form Details Specific
				var div			= $("<div class = 'dataTd' />");
				div.html("The Below Listed LR(s) Are CC/Modivate Attach");
				var lsLRFormDetailsTable	= $("<table width='"+100+"%' />"); // LR Summary Table
				lsLRFormDetailsTable.attr('data-table', 'lrTable'); // To Apply CSS Class
				var cellDataArray		= this.getTableHeaderCell(LSLRFormDetailsConfig.lslrFormConfig, langKeySetFormDetails, null);
				var lsLRFormDetailsTableRow = $('<tr/>')
				for (var i=0; i<cellDataArray.length; i++) {
					lsLRFormDetailsTableRow.append(cellDataArray[i]);
				}

				cellDataArray	= [];
				_.each(dispatchLSLRFormSummary,function(dispatchLSLRFormSummaryData){
					lsLRFormDetailsTableRow		= $(lsLRFormDetailsTable[0].insertRow(-1));
					cellDataArray	= _this.getTableDataCell(dispatchLSLRFormSummaryData[0], langKeySetFormDetails);
					for (var j=0; j<cellDataArray.length; j++) {
						lsLRFormDetailsTableRow.append(cellDataArray[j]);
					}
				})

				divObj.append(div);
				divObj.append(lsLRFormDetailsTable);
				
			}
			
			// Code For Show LS Remark
			
			var lsRemarkTable	= $("<table width='"+100+"%' />"); // LR Summary Table
			lsRemarkTable.attr('data-table', 'lrTable'); // To Apply CSS Class
			var lsRemarkTableRow = $('<tr/>')
			
			var branchKey			= Object.keys(dispatchLRSummary); 
			var lsRemark = null;
			for (var i=0; i<branchKey.length; i++) {
				var obj							= dispatchLRSummary[branchKey[i]]; 
				
				for (var j=0; j<obj.length; j++) {
					var data = obj[j]; // Derived Object From Array
					lsRemark		= data.lsRemark;
					//alert(lsRemark);
				}
			}
			lsRemarkTableRow	= $(lsRemarkTable[0].insertRow(-1));
			var remarkTd =  $("<td class='remarkTd' />");
			remarkTd.html('Remark: '+lsRemark);
			lsRemarkTableRow.append(remarkTd);
			
			divObj.append(lsRemarkTable); // Final Display Screen Append Of Table
			
			return divObj;
		},
		setLHPVSummary:function(LHPVSummaryConfig, dispatchLRSummary, dispatchLSHeader, PrintHeaderModel, dispatchLSLRCharge, lhpvAmount,grandTotalWeight,lhpvAverageAmount){
			var divObj =$('<div/>');
			var configuration	= LHPVSummaryConfig.LHPVSummaryConfig;
			/*if(lhpvAmount != 0) {
				var lhpvSummaryTable	= $("<table width='100%' />"); // LR Summary Table
				lhpvSummaryTable.attr('data-table', 'lrTable'); // To Apply CSS Class
				var lhpvSummaryTableRow		= $(lhpvSummaryTable[0].insertRow(-1)); // Row For Summary Table
				var weightTd		= $("<td />");
				weightTd.html("WEIGHT : "+Math.round(grandTotalWeight));
				var hireTd			= $("<td >");
				hireTd.html("HIRE : "+Math.round(lhpvAmount));
				var avgTd			= $("<td />");
				avgTd.html("AVG : "+(lhpvAmount/grandTotalWeight).toFixed(2));
				lhpvSummaryTableRow.append(weightTd);
				lhpvSummaryTableRow.append(hireTd);
				lhpvSummaryTableRow.append(avgTd);
				divObj.append(lhpvSummaryTable);
			}*/
			var langObjLHPVSummary 		= LHPVSummaryFilePath.loadLanguage(); // Read Data From en-gb File For LHPV Details Specific 
			var langKeySetLHPVSummary 	= loadLanguageWithParams(langObjLHPVSummary); // Create Key Set For LHPV Details Specific
			var lhpvStationSummaryTable	= $("<table width='100%' />"); // LR Summary Table
			lhpvStationSummaryTable.attr('data-table', 'lrTable'); // To Apply CSS Class
			var lhpvStationSummaryTableRow		= $(lhpvStationSummaryTable[0].insertRow(-1)); // Row For Summary Table
			var dataTd	= $("<td colspan='10' class = 'dataTd' />");
			dataTd.html("Summary Of All Booking Stations");
			lhpvStationSummaryTableRow.append(dataTd);

			var finalDataObject = new Array();
			_.each(dispatchLRSummary,function(dataArray){
				_.each(dataArray,function(data){
					finalDataObject.push(data);
				})
			})
			//_parentObject.$el.append(lhpvStationSummaryTable);
			var sourceObjectList; // Array For Grouping Data Source Wise
			var finalSourceDataObj	= new Object();
			for (var m=0; m<finalDataObject.length; m++) {
				var obj		= finalDataObject[m]; // Derived Object Further Processing
				if (finalSourceDataObj[obj.wayBillSourceBranchName] != undefined) { // Condition For Checking Destination Presence In Final Object
					sourceObjectList	= finalSourceDataObj[obj.wayBillSourceBranchName]; // If Presence, Get That Array
				} else {
					sourceObjectList	= new Array(); // If Not, Create New Array
				}
				sourceObjectList.push(obj); // Add Object To Array. Either In New Array Or Derived Array Based On IF/ELSE Condition
				finalSourceDataObj[obj.wayBillSourceBranchName]	= sourceObjectList; // Add Array To Final Object
			}
			var inDataObject		= this.getTableHeaderCell(LHPVSummaryConfig.LHPVSummaryConfig, langKeySetLHPVSummary, 3);
			var cellDataArray = inDataObject['tableHeaderArray'];
			var lhpvSummarySequenceArray = inDataObject['lhpvSummarySequenceArray'];
			lhpvStationSummaryTableRow			= $(lhpvStationSummaryTable[0].insertRow(-1)); // LR Summary Table Row
			for (var i=0; i<cellDataArray.length; i++) {
				lhpvStationSummaryTableRow.append(cellDataArray[i]);
			}
			cellDataArray	= [];
			var branchIdKey	= Object.keys(finalSourceDataObj); // Get Branch Key For Display Screen & Getting Data From Data Object
			var mainStationList	= new Array();
			var mainStationObj	= new Object();
			var finalObjList	= new Array();
			for (var n=0; n<branchIdKey.length; n++) {
				mainStationObj.wayBillSourceBranch		= null;
				mainStationObj.wayBillSourceCode		= null;
				mainStationObj.wayBillArticleQuantity 	= 0;
				mainStationObj.totalNumberOfLR			= 0;
				mainStationObj.wayBillVasuliAmount		= 0;
				mainStationObj.wayBillOtherAmount		= 0;
				mainStationObj.wayBillActualWeight		= 0;
				mainStationObj.wayBillServiceTaxAmount	= 0;
				mainStationObj.wayBillCarrierRiskAmount	= 0;
				mainStationObj.wayBillBalanceAmount		= 0;
				mainStationObj.chargeAmount				= 0;
				var dataObject	= finalSourceDataObj[branchIdKey[n]]; // Derived Data Array For Rendering On Display Screen
				lhpvStationSummaryTableRow	= $(lhpvStationSummaryTable[0].insertRow(-1)); // New Row To Source Branch Name
				var finalObj	= new Object();
				finalObj.wayBillSourceCode			= null;
				finalObj.wayBillArticleQuantity 	= 0;
				finalObj.totalNumberOfLR			= 0;
				finalObj.wayBillVasuliAmount		= 0;
				finalObj.wayBillOtherAmount			= 0;
				finalObj.wayBillActualWeight		= 0;
				finalObj.wayBillServiceTaxAmount	= 0;
				finalObj.wayBillCarrierRiskAmount	= 0;
				finalObj.wayBillBalanceAmount		= 0;
				finalObj.chargeAmount				= 0;
				var totalWeight						= 0;
				for (var o=0; o<dataObject.length; o++) {
					var data	= dataObject[o]; // Data Object From Data Array
					finalObj.wayBillSourceCode			= data.wayBillSourceBranchName;
					finalObj.wayBillArticleQuantity 	= parseFloat(finalObj.wayBillArticleQuantity) + parseFloat(data.wayBillArticleQuantity);
					finalObj.totalNumberOfLR			= finalObj.totalNumberOfLR + 1;
					finalObj.wayBillVasuliAmount		= parseFloat(finalObj.wayBillVasuliAmount) + parseFloat(data.wayBillVasuliAmount);
					finalObj.wayBillOtherAmount			= Math.round(parseFloat(finalObj.wayBillOtherAmount) + parseFloat(data.wayBillOtherAmount));
					finalObj.wayBillActualWeight		= Math.round(parseFloat(finalObj.wayBillActualWeight) + parseFloat(data.wayBillActualWeight));
					finalObj.wayBillServiceTaxAmount	= Math.round(parseFloat(finalObj.wayBillServiceTaxAmount) + parseFloat(data.wayBillServiceTaxAmount));
					finalObj.wayBillCarrierRiskAmount	= Math.round(parseFloat(finalObj.wayBillCarrierRiskAmount) + parseFloat(data.wayBillCarrierRiskAmount));
					finalObj.chargeAmount				= Math.round(data.chargeAmount);
					totalWeight							= grandTotalWeight;
					mainStationObj.wayBillSourceBranch	= data.wayBillSourceBranchName;
					mainStationObj.wayBillSourceCode	= data.wayBillSourceBranchName;

				}
				
				finalObj.chargeAmount	= Math.round((lhpvAverageAmount)*finalObj.wayBillActualWeight);
				finalObj.wayBillBalanceAmount	= finalObj.wayBillVasuliAmount - (finalObj.wayBillServiceTaxAmount + finalObj.wayBillCarrierRiskAmount);
				mainStationObj.wayBillArticleQuantity 	= finalObj.wayBillArticleQuantity;
				mainStationObj.totalNumberOfLR			= finalObj.totalNumberOfLR;
				mainStationObj.wayBillVasuliAmount		= Math.round(finalObj.wayBillVasuliAmount);
				mainStationObj.wayBillOtherAmount		= Math.round(finalObj.wayBillOtherAmount);
				mainStationObj.wayBillActualWeight		= Math.round(finalObj.wayBillActualWeight);
				mainStationObj.wayBillServiceTaxAmount	= Math.round(finalObj.wayBillServiceTaxAmount);
				mainStationObj.wayBillCarrierRiskAmount	= Math.round(finalObj.wayBillCarrierRiskAmount);
				mainStationObj.wayBillBalanceAmount		= Math.round(finalObj.wayBillBalanceAmount);
				mainStationObj.chargeAmount				= Math.round(finalObj.chargeAmount);
				finalObjList.push(finalObj);
				cellDataArray	= this.getTableDataCell(finalObj, langKeySetLHPVSummary); // Derived Cell Data Array i.e <td> With Function
				lhpvStationSummaryTableRow	= $(lhpvStationSummaryTable[0].insertRow(-1)); // Row To Append Data In Table
				for (var i=0; i<cellDataArray.length; i++) {
					lhpvStationSummaryTableRow.append(cellDataArray[i]); // Append Data To Row
				}

				if (mainStationList[mainStationObj.wayBillSourceBranch] != undefined) {
					var obj	= mainStationList[mainStationObj.wayBillSourceBranch];
					obj.wayBillArticleQuantity 		= finalObj.wayBillArticleQuantity + obj.wayBillArticleQuantity;
					obj.totalNumberOfLR				= finalObj.totalNumberOfLR + obj.totalNumberOfLR;
					obj.wayBillVasuliAmount			= finalObj.wayBillVasuliAmount + obj.wayBillVasuliAmount;
					obj.wayBillOtherAmount			= finalObj.wayBillOtherAmount + obj.wayBillOtherAmoun;
					obj.wayBillActualWeight			= finalObj.wayBillActualWeight + obj.wayBillActualWeight;
					obj.wayBillServiceTaxAmount		= finalObj.wayBillServiceTaxAmount + obj.wayBillServiceTaxAmount;
					obj.wayBillCarrierRiskAmount	= finalObj.wayBillCarrierRiskAmount + obj.wayBillCarrierRiskAmount;
					obj.wayBillBalanceAmount		= finalObj.wayBillBalanceAmount + obj.wayBillBalanceAmount;
					obj.chargeAmount				= finalObj.chargeAmount + obj.chargeAmount;	
					mainStationList[mainStationObj.wayBillSourceBranch]	= obj;
				} else {
					mainStationList[mainStationObj.wayBillSourceBranch]	= mainStationObj;
				}
			}
			var objectForTotal		= new Object();
			var totalDisplayArray	= new Array();
			for (var i=0; i<lhpvSummarySequenceArray.length; i++) {
				var valueForTotal	= 0;
				if ((configuration[(lhpvSummarySequenceArray[i])].Totalable)) {
					for(var j=0; j<finalObjList.length; j++) {
						objectForTotal	= finalObjList[j];
						valueForTotal	= valueForTotal + objectForTotal[(lhpvSummarySequenceArray[i])];
					}
					var valueCell	= $("<td />");
					valueCell.html(valueForTotal);
					valueCell.attr('data-totalTable', 'totalTableCell');
					totalDisplayArray.push(valueCell);
				} else {
					var blankCell	= $("<th />");
					blankCell.html("Total");
					totalDisplayArray.push(blankCell)
				}
			}
			lhpvStationSummaryTableRow	= $(lhpvStationSummaryTable[0].insertRow(-1))
			for (var k=0; k<totalDisplayArray.length; k++) {
				lhpvStationSummaryTableRow.append(totalDisplayArray[k]);
			}

//			lhpvStationSummaryTableRow	= $(lhpvStationSummaryTable[0].insertRow(-1));
//			var remarkTd =  $("<td colspan='10' class='remarkTd' />");
//			remarkTd.html('Summary of Main Booking Stations ');
//			lhpvStationSummaryTableRow.append(remarkTd);

//			var cellDataArray		= this.getTableHeaderCell(LHPVSummaryConfig.LHPVSummaryConfig, langKeySetLHPVSummary, 3);
//			lhpvStationSummaryTableRow			= $(lhpvStationSummaryTable[0].insertRow(-1)); // LR Summary Table Row
//			for (var i=0; i<cellDataArray.length; i++) {
//			lhpvStationSummaryTableRow.append(cellDataArray[i]);
//			}
//			cellDataArray	= [];
//			cellDataArray	= this.getTableDataCell(mainStationObj,langKeySetLHPVSummary); // Derived Cell Data Array i.e <td> With Function
//			lhpvStationSummaryTableRow	= $(lhpvStationSummaryTable[0].insertRow(-1)); // Row To Append Data In Table
//			for (var i=0; i<cellDataArray.length; i++) {
//			lhpvStationSummaryTableRow.append(cellDataArray[i]); // Append Data To Row
//			}
			//alert(lsRemark);
//			var branchKey			= Object.keys(dispatchLRSummary); 
//			var lsRemark = null;
//			for (var i=0; i<branchKey.length; i++) {
//				var obj							= dispatchLRSummary[branchKey[i]]; 
//
//				for (var j=0; j<obj.length; j++) {
//					var data = obj[j]; // Derived Object From Array
//					lsRemark		= data.lsRemark;
//					//alert(lsRemark);
//				}
//			}
//			lhpvStationSummaryTableRow	= $(lhpvStationSummaryTable[0].insertRow(-1));
//			var remarkTd =  $("<td colspan='10' class='remarkTd' />");
//			remarkTd.html('Remark: '+lsRemark);
//			lhpvStationSummaryTableRow.append(remarkTd);

			divObj.append(lhpvStationSummaryTable); // Final Display Screen Append Of Table
			return divObj;
		},setPartialLRSummary:function(dispatchLRSummary, configuration, dispatchLSHeader, PrintHeaderModel, dispatchLSLRCharge) { // Function For Dispatch LR Summary
			var _this = this;
			var langObjPartialLRSummary	= PartialLRSummary.loadLanguage(); // Read Data From en-gb File LR Summary Specific
			var langKeySetPartialLRSummary		= loadLanguageWithParams(langObjPartialLRSummary); // Create Key Set LR Summary Specific

			var divObj =$('<div/>');
			if(dispatchLRSummary.length > 0){
				var partialLRSummaryTable				= $("<table width='"+100+"%' />"); // LR Summary Table
				partialLRSummaryTable.attr('data-table', 'partialLRTable'); // To Apply CSS Class

				var dataObject		= _this.getTableHeaderCell(configuration, langKeySetPartialLRSummary, 1); // Derived Table Header From Function
				var cellDataArray = dataObject.tableHeaderArray;

				var newtr = $('<tr>')
				for (var i=0; i<cellDataArray.length; i++) {
					newtr.append(cellDataArray[i]); // Appended Table Header To Table Row
				}
				partialLRSummaryTable.append(newtr);

				var partialHeader = this.setPartialLSHeader(dispatchLSHeader, PrintHeaderModel); // To Show Header On Summary Page
				divObj.append(partialHeader);

				var dataObject		= this.getTableHeaderCell(configuration, langKeySetPartialLRSummary, 1); // Derived Table Header From Function

				_.each(dispatchLRSummary,function(dispatchData){
					var cellDataArrayHead = _this.getTableDataCell(dispatchData,langKeySetPartialLRSummary);
					var partialLRSummaryTableRow = $('<tr>')
					for (var i=0; i<cellDataArrayHead.length; i++) {
						partialLRSummaryTableRow.append(cellDataArrayHead[i]); // Appended Table Header To Table Row
					}

					partialLRSummaryTable.append(partialLRSummaryTableRow);
				})


				divObj.append(partialLRSummaryTable);
			}

			return divObj;
		},setPartialLSHeader:function(dispatchLSHeader, PrintHeaderModel, _parentObject) {
			var divObj = $('<div/>');
			var dataDiv				= new Array(); // LS Header Data Div
			var divName						= new Array(); // To Apply CSS Class
			var headerData			= dispatchLSHeader[0]; // Derived Object From Response
			var keyObject			= Object.keys(headerData); // Derived Keys For Reference
			var displayData			= new Array(); // New Array For Rendering Data On Display Screen
			var headerCollection	= PrintHeaderModel;

			this.setHeader(headerCollection,divObj,dispatchLSHeader)


			dataDiv.push("<b style='font-size: 22px;'>Partial Dispatch LRs</b>"); // Providing Data For Div i.e. Source Branch Name
			divObj.append(dataDiv); // Appended Fourth Line To Display Screen
			dataDiv		= []; // Cleared For Re-Use
			divName 	= []; // Cleared For Re-Use
			/*mainHeader	= []; // Cleared For Re-Use
			subHeader	= []; // Cleared For Re-Use
			reportHeader = [];*/
			return divObj;
		},
		getDivData:function(dataArray, divName) { // Function For Div Creation
			var divDataArray	= new Array(); // Response Array For Div
			for (var i=0; i<dataArray.length; i++) {
				var blankDiv	= $("<div />"); // Provided Blank Div For Padding Of Pre-Printed Stationary OR To Display Relative Value For Next Div 
				blankDiv.attr('data-BlankDiv', "BlankDiv"); // Providing CSS Class
				var div			= $("<div />"); // Data Div
				if ((i%2) !== 0 ) { // For Left-Right Align
					div.attr('data-RightDiv', divName[i]); // Applying CSS Class From Parameter
				}else {
					div.attr('data-LeftDiv', divName[i]); // Applying CSS Class From Parameter
				}
				div.html(dataArray[i]); // Providing Data 
				divDataArray.push(blankDiv); // Preparing Response
				divDataArray.push(div); // Proparing Response
			}
			return divDataArray; // Array Returned
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
		}
	}
});