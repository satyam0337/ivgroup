define (['language',
         'jquerylingua',
         PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatchlsprint/dispatchlsprintdestinationwisefilepath.js',
         PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatchlsprint/dispatchlsprintsummarydestinationwisefilepath.js',
         PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatchlsprint/dispatchlslrformdetailsfilepath.js',
         PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatchlsprint/dispatchlhpvsummaryfilepath.js',
         PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatchlsprint/dispatchpartiallsdetailsfilepath.js'],
         function(Language, JqueryLingua, FilePath, SummaryFilePath, FormFilePath, LHPVSummaryFilePath, PartialLRSummary){
	'use strict'; // Necessary Imports
	var langObjLRSummary; // Specifically For LR Summary en-gb Ref
	var langObjPartialLRSummary; // Specifically For LR Summary en-gb Ref
	var langKeySetLRSummary; // Specifically For LR Summary en-gb Ref
	var langKeySetPartialLRSummary; // Specifically For LR Summary en-gb Ref
	var langObjSummary; // Specifically For LS Summary en-gb Ref
	var langKeySetSummary; // Specifically for LS Summary en-gb Ref
	var langObjFormDetails; // Specifically for LS LR Form Details en-gb Ref
	var langKeySetFormDetails; // Specifically for LS LR Form Details en-gb Ref
	var langObjLHPVSummary; // Specifically for LHPV Summary en-gb Ref
	var langKeySetLHPVSummary; // Specifically for LHPVSummary Details en-gb Ref
	var grandTotalOnLastPage; // For Configuration NOT USED IN CURRENT CODE
	var totalsOnEveryPage; // For Configuration NOT USED IN CURRENT CODE
	var headerOnFirstPage; // For Configuration
	var headerOnEveryPage; // For Configuration NOT USED IN CURRENT CODE
	var lrSummaryTable				= $("<table width='"+100+"%' />"); // LR Summary Table
	lrSummaryTable.attr('data-table', 'lrTable'); // To Apply CSS Class
	var partialLRSummaryTable				= $("<table width='"+100+"%' />"); // LR Summary Table
	partialLRSummaryTable.attr('data-table', 'partialLRTable'); // To Apply CSS Class
	var lrSummaryTableRow			= $(lrSummaryTable[0].insertRow(-1)); // LR Summary Table Row
	var partialLRSummaryTableRow			= $(partialLRSummaryTable[0].insertRow(-1)); // LR Summary Table Row
	var mainHeader					= new Array(); // LS Main Header
	var subHeader					= new Array(); // LS Sub Header
	var reportHeader				= new Array(); // LS Sub Header
	var dataDiv						= new Array(); // LS Header Data Div
	var divName						= new Array(); // To Apply CSS Class
	var grandTotalWeight		= 0; // For Totaling
	var lhpvAmount				= 0; // For Totaling
	var totalActualWeight		= 0;
	var dataArrayObject;	// Object For LHPV Summary Total
	var lrSumarySequenceArray		= new Array(); //Array For LR Summary Total Sequence
	var lsSummarySequenceArray		= new Array(); // Array For LS Summary Total Sequence
	var lhpvSummarySequenceArray	= new Array(); // Array For LHPV Summary Total Sequence
	var pageBreaker		= 2; // For Pagination
	var pageBreak		= 0;
	var headerBreak		= 1; // For Page Break Class
	var rowCounter		= 12; // For Pagination
	var printPageCount;
	return {
		setPageViewConfig:function(SetUpConfig, _parentObject) { // Function 
			// Set Configurations
			grandTotalOnLastPage	= SetUpConfig.grandTotalOnLastPage; // To Show Grand Total On Last Page NOT USED IN CURRENT CODE
			totalsOnEveryPage		= SetUpConfig.totalsOnEveryPage; // To Show Total On Every Page NOT USED IN CURRENT CODE
			headerOnFirstPage		= SetUpConfig.headerOnFirstPage; // To Show Header On First Page
			headerOnEveryPage		= SetUpConfig.headerOnEveryPage; // To Show Header On Every Page NOT USED IN CURRENT CODE
			langObjLRSummary		= FilePath.loadLanguage(); // Read Data From en-gb File LR Summary Specific
			langKeySetLRSummary		= loadLanguageWithParams(langObjLRSummary); // Create Key Set LR Summary Specific
			langObjPartialLRSummary	= PartialLRSummary.loadLanguage(); // Read Data From en-gb File LR Summary Specific
			langKeySetPartialLRSummary		= loadLanguageWithParams(langObjPartialLRSummary); // Create Key Set LR Summary Specific
			langObjSummary 			= SummaryFilePath.loadLanguage(); // Read Data From en-gb File For LS Summary Specific 
		    langKeySetSummary 		= loadLanguageWithParams(langObjSummary); // Create Key Set For LS Summary Specific
		    langObjFormDetails 		= FormFilePath.loadLanguage(); // Read Data From en-gb File For Form Details Specific 
		    langKeySetFormDetails 	= loadLanguageWithParams(langObjFormDetails); // Create Key Set For Form Details Specific
		    langObjLHPVSummary 		= LHPVSummaryFilePath.loadLanguage(); // Read Data From en-gb File For LHPV Details Specific 
			langKeySetLHPVSummary 	= loadLanguageWithParams(langObjLHPVSummary); // Create Key Set For LHPV Details Specific
		},
		setLSHeader:function(dispatchLSHeader, PrintHeaderModel, _parentObject) {
			if (headerOnFirstPage){ // Check True For Header
				var headerData			= dispatchLSHeader[0]; // Derived Object From Response
				var keyObject			= Object.keys(headerData); // Derived Keys For Reference
				var displayData			= new Array(); // New Array For Rendering Data On Display Screen
				var headerCollection	= PrintHeaderModel;
				
				mainHeader.push(headerCollection.accountGroupName); // Main Header i.e. Group Name  
				subHeader.push(headerCollection.branchName); // Sub Header i.e. Branch Name
				subHeader.push(headerCollection.branchAddress); // Sub Header i.e. Branch Address
				subHeader.push(headerCollection.branchContactDetailPhoneNumber); // Sub Header i.e. Phone Number
				reportHeader.push("Motor Report");
				displayData		= this.getHeaderData(mainHeader,subHeader,reportHeader); // Derived Header Data Divs With Function
				for (var i=0; i<displayData.length; i++) {
					_parentObject.$el.append(displayData[i]); // Iterated Over Array For Appending Data To Display Screen
				}
				
				// Preparing Data Div For Other Details Appending To Display Screen
				var firstLine = $("<div />"); // First Line Div After Headers
				firstLine.attr('data-div',"first"); // Applying CSS Class
				dataDiv.push("<b>Truck No. : </b>" + headerData.vehicleNumber); // Providing Data For Div Creation i.e. Vehicle Number
				divName.push(keyObject[5]); // Providing CSS Class Name For Div
				dataDiv.push("<b>Motor Report No. : </b>" + headerData.lsNumber); // Providing Data For Div Creation i.e. Vehicle Number
				divName.push(keyObject[14]);// Providing CSS Class Name For Div
				displayData		= this.getDivData(dataDiv, divName); // Derived Data Divs With Function
				for (var i=0; i<displayData.length; i++) {
					firstLine.append(displayData[i]); // Appended Divs To FirstLine
				}
				_parentObject.$el.append(firstLine); // Appended First Line To Display Screen
				dataDiv	= []; // Cleared For Next Line
				divName = []; // Cleared For Next Line
				
				var secondLine = $("<div />"); // Second Line Div
				secondLine.attr('data-div',"second"); // Applying CSS Class
				dataDiv.push("<b>Driver : </b>" + headerData.driverName+"("+headerData.driverMobileNumber+")"); // Providing Data For Div Creation i.e. Driver Details 
				divName.push(keyObject[12]); // Providing CSS Class Name For Div
				dataDiv.push(headerData.dateString); // Providing Data For Div i.e. Date String
				divName.push(keyObject[18]); // Providing CSS Class Name For Div
				dataDiv.push(headerData.vehicleAgentName); // Providing Data For Div i.e. Agent Name
				divName.push(keyObject[11]); // Providing CSS Class Name For Div
				displayData		= this.getDivData(dataDiv, divName); // Derived Data Divs With Function
				for (var i=0; i<displayData.length; i++) {
					secondLine.append(displayData[i]); // Appended Divs To SecondLine
				}
				_parentObject.$el.append(secondLine); // Appended Second Line To Display Screen
				dataDiv	= []; // Cleared For Next Line
				divName = []; // Cleared For Next Line
				
				if(headerData.vehicleAgentName !== null){ // Check Null For Agent Name
					var thirdLine = $("<div />"); // Third Line Div
					thirdLine.attr('data-div',"third"); // Applying CSS Class
					dataDiv.push(headerData.vehicleAgentName); // Providing Data For Div i.e. Agent Name
					divName.push(keyObject[11]); // Providing CSS Class For Div
					displayData		= this.getDivData(dataDiv, divName); // Derived Data Divs With Function
					for (var i=0; i<displayData.length; i++) {
						thirdLine.append(displayData[i]); // Appended Divs To ThirdLine
					}
					_parentObject.$el.append(thirdLine);// Appended Third Line To Dispay Screen
					dataDiv	= []; // Cleared For Next Line
					divName = []; // Cleared For Next Line
				}
				
				var fourthLine = $("<div />"); // Fourth Line Div
				fourthLine.attr('data-div',"fourth"); // Appying CSS Class
				dataDiv.push("From :"+headerData.dispatchLSSourceBranchName); // Providing Data For Div i.e. Source Branch Name
				divName.push(keyObject[7]); // Providing CSS Class Name For Div
				dataDiv.push("To :"+headerData.dispatchLSDestinationBranchName); // Providing Dat For Div i.e. Destination Branch Name
				divName.push(keyObject[9]);// Providing CSS Class Name For Div
				displayData		= this.getDivData(dataDiv, divName); // Derived Data Divs With Function
				for (var i=0; i<displayData.length; i++) {
					fourthLine.append(displayData[i]); // Appended Divs To Fourth Line
				}
				_parentObject.$el.append(fourthLine); // Appended Fourth Line To Display Screen
				dataDiv		= []; // Cleared For Re-Use
				divName 	= []; // Cleared For Re-Use
				mainHeader	= []; // Cleared For Re-Use
				subHeader	= []; // Cleared For Re-Use
				reportHeader = [];
			}
		},
		setPartialLSHeader:function(dispatchLSHeader, PrintHeaderModel, _parentObject) {
			if (headerOnFirstPage){ // Check True For Header
				var headerData			= dispatchLSHeader[0]; // Derived Object From Response
				var keyObject			= Object.keys(headerData); // Derived Keys For Reference
				var displayData			= new Array(); // New Array For Rendering Data On Display Screen
				var headerCollection	= PrintHeaderModel;

				mainHeader.push(headerCollection.accountGroupName); // Main Header i.e. Group Name  
				subHeader.push(headerCollection.branchName); // Sub Header i.e. Branch Name
				subHeader.push(headerCollection.branchAddress); // Sub Header i.e. Branch Address
				subHeader.push(headerCollection.branchContactDetailPhoneNumber); // Sub Header i.e. Phone Number
				reportHeader.push("Motor Report");
				displayData		= this.getHeaderData(mainHeader,subHeader,reportHeader); // Derived Header Data Divs With Function
				for (var i=0; i<displayData.length; i++) {
					_parentObject.$el.append(displayData[i]); // Iterated Over Array For Appending Data To Display Screen
				}
				
				// Preparing Data Div For Other Details Appending To Display Screen
				var firstLine = $("<div />"); // First Line Div After Headers
				firstLine.attr('data-div',"first"); // Applying CSS Class
				dataDiv.push("<b>Truck No. : </b>" + headerData.vehicleNumber); // Providing Data For Div Creation i.e. Vehicle Number
				divName.push(keyObject[5]); // Providing CSS Class Name For Div
				dataDiv.push("<b>Motor Report No. : </b>" + headerData.lsNumber); // Providing Data For Div Creation i.e. Vehicle Number
				divName.push(keyObject[14]);// Providing CSS Class Name For Div
				displayData		= this.getDivData(dataDiv, divName); // Derived Data Divs With Function
				for (var i=0; i<displayData.length; i++) {
					firstLine.append(displayData[i]); // Appended Divs To FirstLine
				}
				_parentObject.$el.append(firstLine); // Appended First Line To Display Screen
				dataDiv	= []; // Cleared For Next Line
				divName = []; // Cleared For Next Line
				
				var secondLine = $("<div />"); // Second Line Div
				secondLine.attr('data-div',"second"); // Applying CSS Class
				dataDiv.push("<b>Driver : </b>" + headerData.driverName+"("+headerData.driverMobileNumber+")"); // Providing Data For Div Creation i.e. Driver Details 
				divName.push(keyObject[12]); // Providing CSS Class Name For Div
				dataDiv.push(headerData.dateString); // Providing Data For Div i.e. Date String
				divName.push(keyObject[18]); // Providing CSS Class Name For Div
				dataDiv.push(headerData.vehicleAgentName); // Providing Data For Div i.e. Agent Name
				divName.push(keyObject[11]); // Providing CSS Class Name For Div
				displayData		= this.getDivData(dataDiv, divName); // Derived Data Divs With Function
				for (var i=0; i<displayData.length; i++) {
					secondLine.append(displayData[i]); // Appended Divs To SecondLine
				}
				_parentObject.$el.append(secondLine); // Appended Second Line To Display Screen
				dataDiv	= []; // Cleared For Next Line
				divName = []; // Cleared For Next Line
				
				var fourthLine = $("<div />"); // Fourth Line Div
				fourthLine.attr('data-div',"fourth"); // Appying CSS Class
				dataDiv.push("<b style='font-size: 22px;'>Partial Dispatch LRs</b>"); // Providing Data For Div i.e. Source Branch Name
				divName.push(keyObject[7]); // Providing CSS Class Name For Div
				displayData		= this.getDivData(dataDiv, divName); // Derived Data Divs With Function
				for (var i=0; i<displayData.length; i++) {
					fourthLine.append(displayData[i]); // Appended Divs To Fourth Line
				}
				_parentObject.$el.append(fourthLine); // Appended Fourth Line To Display Screen
				dataDiv		= []; // Cleared For Re-Use
				divName 	= []; // Cleared For Re-Use
				mainHeader	= []; // Cleared For Re-Use
				subHeader	= []; // Cleared For Re-Use
				reportHeader = [];
			}
		},
		getHeaderData:function(mainHeader, subHeader, reportHeader) { // Function For MainHeader & SubHeader
			var mainHeaderTag		= $("<h1 />"); // H1 Tag For MainHeader
			if (pageBreak > 0) {
				mainHeaderTag.attr('data-header', "MainHeaderBreak"); // Providing CSS Class
			}else {				
				mainHeaderTag.attr('data-header', "MainHeader"); // Providing CSS Class
			}
			pageBreak++;
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
		},
		setLRSummary:function(dispatchLRSummary, configuration, dispatchLSHeader, PrintHeaderModel, dispatchLSLRCharge, _parentObject) { // Function For Dispatch LR Summary
			var lrSummarySequence	= 1; // For Ref To If Condition In TableHeaderCell
			var cellDataArray	= new Array(); // Array For Table Cells
			var noOfArticle					= 0; // For LR total below LR Rows
			var actualWeight				= 0; // For LR total below LR Rows
			var vasuliAmount				= 0; // For LR total below LR Rows
			var otherAmount					= 0; // For LR total below LR Rows
			var serviceTaxAmount			= 0; // For LR total below LR Rows
			var carrierRiskAmount			= 0; // For LR total below LR Rows
			var totalnoOfArticle					= 0; // For LR total below LR Rows
			var totalactualWeight					= 0; // For LR total below LR Rows
			var totalvasuliAmount					= 0; // For LR total below LR Rows
			var totalotherAmount					= 0; // For LR total below LR Rows
			var totalserviceTaxAmount				= 0; // For LR total below LR Rows
			var totalcarrierRiskAmount				= 0; // For LR total below LR Rows
			cellDataArray		= this.getTableHeaderCell(configuration, langKeySetLRSummary, lrSummarySequence); // Derived Table Header From Function
			for (var i=0; i<cellDataArray.length; i++) {
				lrSummaryTableRow.append(cellDataArray[i]); // Appended Table Header To Table Row
			}
			rowCounter++;
			cellDataArray	= []; // Cleared For Re-Use
			var dataKey		= Object.keys(dispatchLRSummary); // Derived Keys From Received Object
			dataObject	= new Array(); // Object For Processing Received
			for (var i=0; i<dataKey.length; i++) {
				var obj	= dispatchLRSummary[dataKey[i]]; // Derived Array Object From Received ValueObject
				for (var l=0; l<obj.length; l++) {
					var dataObj	= obj[l];  // Derived Object For Array
					var amountObj	= dispatchLSLRCharge[dataObj.wayBillId+""]; // Derived Relative Amount Array Object For Received Parameter
					if (amountObj == undefined){ // If undefined Setting Values Physically
						dataObj.wayBillVasuliAmount 		= 0;
						dataObj.wayBillOtherAmount			= 0;
						dataObj.wayBillServiceTaxAmount		= 0;
						dataObj.wayBillCarrierRiskAmount	= 0;
						dataObj.wayBillType					= "FOC";
						
					} else {
						for (var k=0; k<amountObj.length; k++) {
							var amountdata	= amountObj[k]; // Derived Object From Array
							dataObj		= this.extend(dataObj, amountdata); // Joining Two Objects With Function
							dataObj.wayBillVasuliAmount	=	Math.round(dataObj.wayBillVasuliAmount);
							dataObj.wayBillOtherAmount	=	Math.round(dataObj.wayBillOtherAmount);
							dataObj.wayBillServiceTaxAmount	=	Math.round(dataObj.wayBillServiceTaxAmount);
							dataObj.wayBillCarrierRiskAmount	=	Math.round(dataObj.wayBillCarrierRiskAmount);
						}
					}
					noOfArticle 	= 	parseInt(noOfArticle) + parseInt(dataObj.wayBillArticleQuantity);
					actualWeight	= 	actualWeight + dataObj.wayBillActualWeight;
					vasuliAmount	=	vasuliAmount + dataObj.wayBillVasuliAmount;
					otherAmount		= 	otherAmount  + dataObj.wayBillOtherAmount;
					serviceTaxAmount	= 	serviceTaxAmount + dataObj.wayBillServiceTaxAmount;
					carrierRiskAmount	=	carrierRiskAmount + dataObj.wayBillCarrierRiskAmount;
					dataObj.wayBillDestinationBranchAbrvtinCode	= dataObj.wayBillSourceBranchName;
					dataObject.push(dataObj); // Pushing Final Object For Further Processing
				}
				
			}
			totalnoOfArticle = totalnoOfArticle + noOfArticle;
			totalactualWeight = totalactualWeight + actualWeight;
			totalvasuliAmount = totalvasuliAmount + vasuliAmount;
			totalotherAmount	=	totalotherAmount + otherAmount;
			totalserviceTaxAmount	= totalserviceTaxAmount + serviceTaxAmount;
			totalcarrierRiskAmount	= totalcarrierRiskAmount + carrierRiskAmount;
			
			dataArrayObject	= dataObject;
			var sortedDataArrayObject = _.sortBy(dataArrayObject,'wayBillDestinationBranchName'); //for sorting of Waybill branchwise
			printPageCount	= Math.round(sortedDataArrayObject.length/pageBreaker);
			var finalDataObj	= new Object(); // Final Data Object For Rendering Data On Display Screen
			var objectList; // Array For Grouping Data Destinationwise
			for (var m=0; m<sortedDataArrayObject.length; m++) {
				var obj		= sortedDataArrayObject[m]; // Derived Object Further Processing
				if (finalDataObj[obj.wayBillDestinationBranchName] != undefined) { // Condition For Checking Destination Presence In Final Object
					objectList	= finalDataObj[obj.wayBillDestinationBranchName]; // If Presence, Get That Array
				} else {
					objectList	= new Array(); // If Not, Create New Array
				}
				objectList.push(obj); // Add Object To Array. Either In New Array Or Derived Array Based On IF/ELSE Condition
				finalDataObj[obj.wayBillDestinationBranchName]	= objectList; // Add Array To Final Object
			}
			var branchIdKey	= Object.keys(finalDataObj); // Get Branch Key For Display Screen & Getting Data From Data Object
			for (var n=0; n<branchIdKey.length; n++) {
				var dataObject	= finalDataObj[branchIdKey[n]]; // Derived Data Array For Rendering On Display Screen
				lrSummaryTableRow	= $(lrSummaryTable[0].insertRow(-1)); // New Row To Destination Branch Name
				var tableCell			= $("<td />"); // Table Cell
				tableCell.html(branchIdKey[n]); // Providing Destination Branch Name To Table Cell
				lrSummaryTableRow.append(tableCell); // Appending Row
				if (printPageCount <= 0) {
					for (var o=0; o<dataObject.length; o++) {
						var data	= dataObject[o]; // Data Object From Data Array
						cellDataArray	= this.getTableDataCell(data, langKeySetLRSummary); // Derived Cell Data Array i.e <td> With Function
						lrSummaryTableRow	= $(lrSummaryTable[0].insertRow(-1)); // Row To Append Data In Table
						for (var i=0; i<cellDataArray.length; i++) {
							lrSummaryTableRow.append(cellDataArray[i]); // Append Data To Row
						}
						_parentObject.$el.append(lrSummaryTable); // Final Display Screen Append Of Table
					}
				} else {
					for (var o=0; o<dataObject.length; o++) {
						var data	= dataObject[o]; // Data Object From Data Array
						cellDataArray	= this.getTableDataCell(data, langKeySetLRSummary); // Derived Cell Data Array i.e <td> With Function
						if(rowCounter == pageBreaker) {
							rowCounter = 0;
							this.setLSHeader(dispatchLSHeader, PrintHeaderModel, _parentObject);
							lrSummaryTable			= $("<table width='"+100+"%' />");
							lrSummaryTable.attr('data-table', 'lrTable');
							lrSummaryTableRow		= $(lrSummaryTable[0].insertRow(-1));
							var cellDataArrayHead	= new Array(); // Array For Table Cells
							cellDataArrayHead		= this.getTableHeaderCell(configuration, langKeySetLRSummary, lrSummarySequence); // Derived Table Header From Function
							for (var i=0; i<cellDataArrayHead.length; i++) {
								lrSummaryTableRow.append(cellDataArrayHead[i]);
							}
							rowCounter++;
							_parentObject.$el.append(lrSummaryTable);
						}
						lrSummaryTableRow	= $(lrSummaryTable[0].insertRow(-1)); // Row To Append Data In Table
						for (var i=0; i<cellDataArray.length; i++) {
							lrSummaryTableRow.append(cellDataArray[i]); // Append Data To Row
						}
						rowCounter++;
						_parentObject.$el.append(lrSummaryTable);
					}
				}
			}
			var totalObject			= new Object(); // DTO For Total
			totalObject.wayBillArticleQuantity		= totalnoOfArticle;  // Assigning Values
			totalObject.wayBillVasuliAmount			= totalvasuliAmount;  // Assigning Values
			totalObject.wayBillOtherAmount			= totalotherAmount;  // Assigning Values
			totalObject.wayBillActualWeight			= totalactualWeight;  // Assigning Values
			totalObject.wayBillServiceTaxAmount		= totalserviceTaxAmount;  // Assigning Values
			totalObject.wayBillCarrierRiskAmount	= totalcarrierRiskAmount;  // Assigning Values
			lrSummaryTableRow	= $(lrSummaryTable[0].insertRow(-1)); // Row To Append Data In Table
			cellDataArray = this.getLRSummaryTotals(totalObject, configuration, lrSumarySequenceArray); // Get Array Of <td> With Function
			for (var i=0; i<cellDataArray.length; i++) {
				lrSummaryTableRow.append(cellDataArray[i]); // Append Data To Row
			}
			_parentObject.$el.append(lrSummaryTable);
		},
		setPartialLRSummary:function(dispatchLRSummary, configuration, dispatchLSHeader, PrintHeaderModel, dispatchLSLRCharge, _parentObject) { // Function For Dispatch LR Summary
			this.setPartialLSHeader(dispatchLSHeader, PrintHeaderModel, _parentObject); // To Show Header On Summary Page
			var lrSummarySequence	= 1; // For Ref To If Condition In TableHeaderCell
			
			var cellDataArray	= new Array(); // Array For Table Cells
			cellDataArray		= this.getTableHeaderCell(configuration, langKeySetPartialLRSummary, lrSummarySequence); // Derived Table Header From Function
			for (var i=0; i<cellDataArray.length; i++) {
				partialLRSummaryTableRow.append(cellDataArray[i]); // Appended Table Header To Table Row
			}
			rowCounter++;
			cellDataArray	= []; // Cleared For Re-Use
			
			var dataKey		= Object.keys(dispatchLRSummary); // Derived Keys From Received Object
			dataObject	= new Array(); // Object For Processing Received
			for (var i=0; i<dataKey.length; i++) {
				var obj	= dispatchLRSummary[dataKey[i]]; // Derived Array Object From Received ValueObject
				for (var l=0; l<obj.length; l++) {
					var dataObj	= obj[l];  // Derived Object For Array
					var amountObj	= dispatchLSLRCharge[dataObj.wayBillId+""]; // Derived Relative Amount Array Object For Received Parameter
					if (amountObj == undefined){ // If undefined Setting Values Physically
						dataObj.wayBillVasuliAmount 		= 0;
						dataObj.wayBillOtherAmount			= 0;
						dataObj.wayBillServiceTaxAmount		= 0;
						dataObj.wayBillCarrierRiskAmount	= 0;
						dataObj.wayBillType					= "FOC";
						
					} else {
						for (var k=0; k<amountObj.length; k++) {
							var amountdata	= amountObj[k]; // Derived Object From Array
							dataObj		= this.extend(dataObj, amountdata); // Joining Two Objects With Function
							dataObj.wayBillVasuliAmount	=	Math.round(dataObj.wayBillVasuliAmount);
							dataObj.wayBillOtherAmount	=	Math.round(dataObj.wayBillOtherAmount);
							dataObj.wayBillServiceTaxAmount	=	Math.round(dataObj.wayBillServiceTaxAmount);
							dataObj.wayBillCarrierRiskAmount	=	Math.round(dataObj.wayBillCarrierRiskAmount);
						}						
					}
					dataObj.wayBillDestinationBranchAbrvtinCode	= dataObj.wayBillSourceBranchName;
					if(dataObj.partial){
						dataObject.push(dataObj); // Pushing Final Object For Further Processing
					}
				}
			}
			dataArrayObject	= dataObject;
			printPageCount	= Math.round(dataArrayObject.length/pageBreaker);
			var finalDataObj	= new Object(); // Final Data Object For Rendering Data On Display Screen
			var objectList; // Array For Grouping Data Destinationwise
			for (var m=0; m<dataObject.length; m++) {
				var obj		= dataObject[m]; // Derived Object Further Processing
				if (finalDataObj[obj.wayBillDestinationBranchName] != undefined) { // Condition For Checking Destination Presence In Final Object
					objectList	= finalDataObj[obj.wayBillDestinationBranchName]; // If Presence, Get That Array
				} else {
					objectList	= new Array(); // If Not, Create New Array
				}
				objectList.push(obj); // Add Object To Array. Either In New Array Or Derived Array Based On IF/ELSE Condition
				finalDataObj[obj.wayBillDestinationBranchName]	= objectList; // Add Array To Final Object
			}
			
			var branchIdKey	= Object.keys(finalDataObj); // Get Branch Key For Display Screen & Getting Data From Data Object
			for (var n=0; n<branchIdKey.length; n++) {
				var dataObject	= finalDataObj[branchIdKey[n]]; // Derived Data Array For Rendering On Display Screen
				
				if (printPageCount <= 0) {
					for (var o=0; o<dataObject.length; o++) {
						var data	= dataObject[o]; // Data Object From Data Array
						cellDataArray	= this.getTableDataCell(data, langKeySetPartialLRSummary); // Derived Cell Data Array i.e <td> With Function
						partialLRSummaryTableRow	= $(partialLRSummaryTable[0].insertRow(-1)); // Row To Append Data In Table
						for (var i=0; i<cellDataArray.length; i++) {
							partialLRSummaryTableRow.append(cellDataArray[i]); // Append Data To Row
						}
						_parentObject.$el.append(partialLRSummaryTable); // Final Display Screen Append Of Table
					}
				} else {
					for (var o=0; o<dataObject.length; o++) {
						var data	= dataObject[o]; // Data Object From Data Array
						cellDataArray	= this.getTableDataCell(data, langKeySetPartialLRSummary); // Derived Cell Data Array i.e <td> With Function
						if(rowCounter == pageBreaker) {
							rowCounter = 0;
							this.setLSHeader(dispatchLSHeader, PrintHeaderModel, _parentObject);
							partialLRSummaryTable			= $("<table width='"+100+"%' />");
							partialLRSummaryTable.attr('data-table', 'partialLRTable');
							partialLRSummaryTableRow		= $(partialLRSummaryTable[0].insertRow(-1));
							var cellDataArrayHead	= new Array(); // Array For Table Cells
							cellDataArrayHead		= this.getTableHeaderCell(configuration, langKeySetPartialLRSummary, lrSummarySequence); // Derived Table Header From Function
							for (var i=0; i<cellDataArrayHead.length; i++) {
								partialLRSummaryTableRow.append(cellDataArrayHead[i]);
							}
							rowCounter++;
							_parentObject.$el.append(partialLRSummaryTable);
						}
						partialLRSummaryTableRow	= $(partialLRSummaryTable[0].insertRow(-1)); // Row To Append Data In Table
						
						for (var i=0; i<cellDataArray.length; i++) {
							partialLRSummaryTableRow.append(cellDataArray[i]); // Append Data To Row
						}
						rowCounter++;
						_parentObject.$el.append(partialLRSummaryTable);
					}
				}
				
			}
		},
		getTableHeaderCell:function(dataObject, langKeySet, sequenceRef) { // Function To Create <th>
			var lrRef	= 1;
			var lsRef	= 2;
			var lhpvRef	= 3;
			var tableHeaderArray	= new Array(); // Array For Response
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
			
			return tableHeaderArray; // Array Returned
		},
		getTableDataCell:function(dataObject, langKeySet) { // Function To Create Table Cell
			var tableCellDataArray	= new Array(); // Table Cell Data Array
			jQuery.each(langKeySet, function(value, key){ // Function For Preparing <td>
				var tableCell	= $("<td />"); // Table Cell <td> Element
				tableCell.html(dataObject[value]); // Providing Data To <td>
				tableCell.attr('data-dataCell', value); // Appying CSS Class
				tableCellDataArray.push(tableCell); // Pushing <td> In Array
			});
			
			return tableCellDataArray; // Array Returned
		},
		setLSTotalSummary:function(dispatchLRSummary, dispatchLSHeader, PrintHeaderModel, SummaryConfiguration, dispatchLSLRCharge, _parentObject) {
			this.setLSHeader(dispatchLSHeader, PrintHeaderModel, _parentObject); // To Show Header On Summary Page
			var lsSummarySequence	= 2;
			var cellDataArray	= new Array(); // Cell Data Array For <td>
			var summary			= new Object(); // LS Summary Object
			var summaryDestination	= new Array(); // LS Summary Object
			var summaryAmount	= new Object(); // LS Amount Summary Object
			cellDataArray		= this.getTableHeaderCell(SummaryConfiguration.summaryConfiguration, langKeySetSummary, lsSummarySequence); // Get <th> Array With Function
			var summaryTable		= $("<table width='100%' />"); // New Table For Summary
			summaryTable.attr('data-table', 'lrTotalTable'); // Apply CSS Class
			var summaryTableRow		= $(summaryTable[0].insertRow(-1)); // Row For Summary Table
			for (var k=0; k<cellDataArray.length; k++) {
				summaryTableRow.append(cellDataArray[k]); // append <th> To Row
			}
			
			totalActualWeight = this.getTotalWeight(dispatchLRSummary);
			var branchKey			= Object.keys(dispatchLRSummary); // Get Key Of LR Summary For Processing
			var grandTotalLR			= 0; // For Totaling
			var grandTotalArticle		= 0; // For Totaling
			var grandTotalVasuli		= 0; // For Totaling
			var grandTotalOther			= 0; // For Totaling
			var grandTotalServiceTax	= 0; // For Totaling
			var grandTotalCarrierRisk	= 0; // For Totaling
			var lhpvAverageAmount		= 0; // For DestinationWise LHPV Amount
			for (var i=0; i<branchKey.length; i++) {
				var obj							= dispatchLRSummary[branchKey[i]]; // Get Array From DispatchLRSummary
				var summaryObject				= new Object(); // Object For Summary Processing
				var branchCode					= null; // branchCode
				var noOfLR						= 0; // For Summary
				var noOfArticle					= 0; // For Summary
				var actualWeight				= 0; // For Summary
				var vasuliAmount				= 0; // For Summary
				var otherAmount					= 0; // For Summary
				var serviceTaxAmount			= 0; // For Summary
				var carrierRiskAmount			= 0; // For Summary
				var destinationWiseLHPVAmount	= 0; // For Summary
				noOfLR += obj.length;// For Summary
				for (var j=0; j<obj.length; j++) {
					var data = obj[j]; // Derived Object From Array
					branchCode		= data.wayBillDestinationBranchName; // Branch Code Set Up
					noOfArticle		= parseInt(noOfArticle) + parseInt(data.wayBillArticleQuantity); // For Summary
					actualWeight	= actualWeight + data.wayBillActualWeight; // For Summary
					grandTotalWeight	= totalActualWeight;
					var amountSummaryObject	= dispatchLSLRCharge[data.wayBillId+""]; // For Summary
					if (amountSummaryObject == undefined) { // If Amount Object Is Undefined Set Values Physically
						vasuliAmount		= 0; // For Summary
						otherAmount			= 0; // For Summary
						serviceTaxAmount	= 0; // For Summary
						carrierRiskAmount	= 0; // For Summary
					} else {
						for (var k=0; k<amountSummaryObject.length; k++) {
							var amountobj	= amountSummaryObject[k]; // For Summary
							lhpvAmount			=	amountobj.chargeAmount;
							lhpvAverageAmount	=	lhpvAmount/grandTotalWeight;
							destinationWiseLHPVAmount	= actualWeight*lhpvAverageAmount;
						}
						carrierRiskAmount	= carrierRiskAmount + amountobj.wayBillCarrierRiskAmount; // For Summary
						serviceTaxAmount	= serviceTaxAmount + amountobj.wayBillServiceTaxAmount; // For Summary
						otherAmount			= otherAmount + amountobj.wayBillOtherAmount; // For Summary
						vasuliAmount		= parseFloat(vasuliAmount) + parseFloat(amountobj.wayBillVasuliAmount); // For Summary
					}
				}
				summaryObject.wayBillDestinationBranchAbrvtinCode	= branchCode; // Set Up For Summary
				grandTotalLR								= grandTotalLR + noOfLR;
				summaryObject.totalNumberOfLR				= noOfLR; // Set Up For Summary
				grandTotalArticle							= grandTotalArticle + noOfArticle;
				summaryObject.wayBillArticleQuantity		= noOfArticle; // Set Up For Summary
				grandTotalVasuli							= grandTotalVasuli + vasuliAmount;
				summaryObject.wayBillVasuliAmount			= Math.round(vasuliAmount); // Set Up For Summary
				grandTotalOther								= Math.round(grandTotalOther + otherAmount);
				summaryObject.wayBillOtherAmount			= Math.round(otherAmount); // Set Up For Summary
				summaryObject.wayBillActualWeight			= Math.round(actualWeight); // Set Up For Summary
				grandTotalServiceTax						= Math.round(grandTotalServiceTax + serviceTaxAmount);
				summaryObject.wayBillServiceTaxAmount		= Math.round(serviceTaxAmount); // Set Up For Summary
				grandTotalCarrierRisk						= Math.round(grandTotalCarrierRisk + carrierRiskAmount);
				summaryObject.wayBillCarrierRiskAmount		= Math.round(carrierRiskAmount); // Set Up For Summary
				summaryObject.chargeAmount					= Math.round(destinationWiseLHPVAmount.toFixed()); // Set Up For Summary
				summaryDestination.push({id:branchKey[i],name:summaryObject['wayBillDestinationBranchAbrvtinCode']}) 
				summary[branchKey[i]]						= summaryObject; // Added Final Summary Object For Rendering On Display Screen
				
			}
			var objectKey			= Object.keys(summary); // Get Key For Rendering On Display Screen
			summaryDestination = _.sortBy(summaryDestination, 'name');

			
			for (var a=0; a<summaryDestination.length; a++) {
				summaryTableRow		= $(summaryTable[0].insertRow(-1)); // Row For Summary Table
				cellDataArray	= this.getTableDataCell(summary[summaryDestination[a]['id']], langKeySetSummary); // Derived <td> With Function
				for (var l=0; l<cellDataArray.length; l++) {
					summaryTableRow.append(cellDataArray[l]); // Append <td> To Row
				}
			}
			cellDataArray	= []; // Cleared For Next Processing
			var totalObject			= new Object(); // DTO For Total
			totalObject.totalNumberOfLR				= grandTotalLR; // Assigning Values
			totalObject.wayBillArticleQuantity		= grandTotalArticle;  // Assigning Values
			totalObject.wayBillVasuliAmount			= grandTotalVasuli;  // Assigning Values
			totalObject.wayBillOtherAmount			= grandTotalOther;  // Assigning Values
			totalObject.wayBillActualWeight			= grandTotalWeight;  // Assigning Values
			totalObject.wayBillServiceTaxAmount		= grandTotalServiceTax;  // Assigning Values
			totalObject.wayBillCarrierRiskAmount	= grandTotalCarrierRisk;  // Assigning Values
			totalObject.chargeAmount				= lhpvAmount;  // Assigning Values
			
			summaryTableRow			= $(summaryTable[0].insertRow(-1)); // Row For Summary Table
			cellDataArray			= this.getSummaryTotals(totalObject, SummaryConfiguration.summaryConfiguration, lsSummarySequenceArray); // Get Array Of <td> With Function
			for (var l=0; l<cellDataArray.length; l++) {
				summaryTableRow.append(cellDataArray[l]); // Append <td> To Row
			}
			_parentObject.$el.append(summaryTable); // Append Table To Display Screen
		},
		getSummaryTotals:function(totalObj,configuration,sequenceArray) { // Function To Create Total Cell
			var totalDisplayArray	= new Array();
			/*  var totalCell	= $("<th />");
			  totalCell.html("Total");
			  totalDisplayArray.push(totalCell);*/
			for (var i=0; i<sequenceArray.length; i++) {
				if ((configuration[(sequenceArray[i])].Totalable)) {
					var valueForTotal	= totalObj[(sequenceArray[i])];
					var valueCell	= $("<th />");
					valueCell.html(Math.round(valueForTotal));
					//valueCell.attr('data-totalTable', 'totalTableCell');
					totalDisplayArray.push(valueCell);
				} else {
					var blankCell	= $("<th />");
					blankCell.html("Total");
					totalDisplayArray.push(blankCell)
				}
			}
			return totalDisplayArray;
		},
		setLSLRFormDetails:function(dispatchLSLRFormSummary, LSLRFormDetailsConfig, _parentObject){
			if(dispatchLSLRFormSummary.length > 0){
				var div			= $("<div />");
				div.html("The Below Listed LR(s) Are CC/Modivate Attach");
				var cellDataArray	= new Array();
				var lsLRFormDetailsTable	= $("<table width='"+100+"%' />"); // LR Summary Table
				lsLRFormDetailsTable.attr('data-table', 'lrTable'); // To Apply CSS Class
				cellDataArray		= this.getTableHeaderCell(LSLRFormDetailsConfig.lslrFormConfig, langKeySetFormDetails, null);
				var lsLRFormDetailsTableRow			= $(lsLRFormDetailsTable[0].insertRow(-1)); // LR Summary Table Row
				for (var i=0; i<cellDataArray.length; i++) {
					lsLRFormDetailsTableRow.append(cellDataArray[i]);
				}
				cellDataArray	= [];
				for (var i=0; i<dispatchLSLRFormSummary.length; i++) {
					lsLRFormDetailsTableRow		= $(lsLRFormDetailsTable[0].insertRow(-1));
					cellDataArray	= this.getTableDataCell(dispatchLSLRFormSummary[i], langKeySetFormDetails);
					for (var j=0; j<cellDataArray.length; j++) {
						lsLRFormDetailsTableRow.append(cellDataArray[j]);
					}
				}
				_parentObject.$el.append(div);
				_parentObject.$el.append(lsLRFormDetailsTable);
			}
		},
		setLHPVSummary:function(LHPVSummaryConfig, dispatchLRSummary, dispatchLSHeader, PrintHeaderModel, dispatchLSLRCharge, _parentObject){
			var configuration	= LHPVSummaryConfig.LHPVSummaryConfig;
			var lhpvSummarySequence	= 3;
			//this.setLSHeader(dispatchLSHeader, PrintHeaderModel, _parentObject); // To Show Header On Summary Page
				if(lhpvAmount != 0) {
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
					_parentObject.$el.append(lhpvSummaryTable);
				}
			var lhpvStationSummaryTable	= $("<table width='100%' />"); // LR Summary Table
			lhpvStationSummaryTable.attr('data-table', 'lrTable'); // To Apply CSS Class
			var lhpvStationSummaryTableRow		= $(lhpvStationSummaryTable[0].insertRow(-1)); // Row For Summary Table
			var dataTd	= $("<td colspan='10' class = 'dataTd' />");
			dataTd.html("Summary Of All Booking Stations");
			lhpvStationSummaryTableRow.append(dataTd);
		
			//_parentObject.$el.append(lhpvStationSummaryTable);
			var sourceObjectList; // Array For Grouping Data Source Wise
			var finalSourceDataObj	= new Object();
			for (var m=0; m<dataArrayObject.length; m++) {
				var obj		= dataArrayObject[m]; // Derived Object Further Processing
				if (finalSourceDataObj[obj.wayBillSourceBranchName] != undefined) { // Condition For Checking Destination Presence In Final Object
					sourceObjectList	= finalSourceDataObj[obj.wayBillSourceBranchName]; // If Presence, Get That Array
				} else {
					sourceObjectList	= new Array(); // If Not, Create New Array
				}
				sourceObjectList.push(obj); // Add Object To Array. Either In New Array Or Derived Array Based On IF/ELSE Condition
				finalSourceDataObj[obj.wayBillSourceBranchName]	= sourceObjectList; // Add Array To Final Object
			}
			var cellDataArray		= this.getTableHeaderCell(LHPVSummaryConfig.LHPVSummaryConfig, langKeySetLHPVSummary, lhpvSummarySequence);
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
					finalObj.wayBillVasuliAmount		= Math.round(parseFloat(finalObj.wayBillVasuliAmount) + parseFloat(data.wayBillVasuliAmount));
					finalObj.wayBillOtherAmount			= Math.round(parseFloat(finalObj.wayBillOtherAmount) + parseFloat(data.wayBillOtherAmount));
					finalObj.wayBillActualWeight		= Math.round(parseFloat(finalObj.wayBillActualWeight) + parseFloat(data.wayBillActualWeight));
					finalObj.wayBillServiceTaxAmount	= Math.round(parseFloat(finalObj.wayBillServiceTaxAmount) + parseFloat(data.wayBillServiceTaxAmount));
					finalObj.wayBillCarrierRiskAmount	= Math.round(parseFloat(finalObj.wayBillCarrierRiskAmount) + parseFloat(data.wayBillCarrierRiskAmount));
					finalObj.chargeAmount				= Math.round(data.chargeAmount);
					totalWeight							= totalActualWeight;
					mainStationObj.wayBillSourceBranch	= data.wayBillSourceBranchName;
					mainStationObj.wayBillSourceCode	= data.wayBillSourceBranchName;
					
				}
				finalObj.chargeAmount	= Math.round((finalObj.chargeAmount/totalWeight)*finalObj.wayBillActualWeight);
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
			

			lhpvStationSummaryTableRow	= $(lhpvStationSummaryTable[0].insertRow(-1));
			var remarkTd =  $("<td colspan='10' class='remarkTd' />");
			remarkTd.html('Summary of Main Booking Stations ');
			lhpvStationSummaryTableRow.append(remarkTd);
			
			
			
			var cellDataArray		= this.getTableHeaderCell(LHPVSummaryConfig.LHPVSummaryConfig, langKeySetLHPVSummary, lhpvSummarySequence);
			lhpvStationSummaryTableRow			= $(lhpvStationSummaryTable[0].insertRow(-1)); // LR Summary Table Row
			for (var i=0; i<cellDataArray.length; i++) {
				lhpvStationSummaryTableRow.append(cellDataArray[i]);
			}
			cellDataArray	= [];
			cellDataArray	= this.getTableDataCell(mainStationObj,langKeySetLHPVSummary); // Derived Cell Data Array i.e <td> With Function
			lhpvStationSummaryTableRow	= $(lhpvStationSummaryTable[0].insertRow(-1)); // Row To Append Data In Table
			for (var i=0; i<cellDataArray.length; i++) {
				lhpvStationSummaryTableRow.append(cellDataArray[i]); // Append Data To Row
			}
			//alert(lsRemark);
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
				lhpvStationSummaryTableRow	= $(lhpvStationSummaryTable[0].insertRow(-1));
				var remarkTd =  $("<td colspan='10' class='remarkTd' />");
				remarkTd.html('Remark: '+lsRemark);
				lhpvStationSummaryTableRow.append(remarkTd);
				
			_parentObject.$el.append(lhpvStationSummaryTable); // Final Display Screen Append Of Table
		},getLRSummaryTotals:function(totalObj,configuration,sequenceArray) { // Function To Create Total Cell
			var totalDisplayArray	= new Array();
			/*  var totalCell	= $("<th />");
			  totalCell.html("Total");
			  totalDisplayArray.push(totalCell);*/
			for (var i=0; i<sequenceArray.length; i++) {
				if ((configuration[(sequenceArray[i])].Totalable)) {
					var valueForTotal	= totalObj[(sequenceArray[i])];
					var valueCell	= $("<th />");
					valueCell.html(Math.round(valueForTotal));
					//valueCell.attr('data-totalTable', 'totalTableCell');
					totalDisplayArray.push(valueCell);
				} else {
					var blankCell	= $("<th />");
					blankCell.html(" ");
					totalDisplayArray.push(blankCell)
				}
			}
			return totalDisplayArray;
		},
		applyCSS:function(SetUpConfig, _parentObject,copyDataForPrint) { // Function To Apply CSS
			this.loadCss(); // To Load CSS Files
			var functionName	= SetUpConfig.cssConfiguration; // Derived Function Name From Configuration
			if(copyDataForPrint == undefined){
				copyDataForPrint = false;
			}
			eval("this."+functionName+"("+copyDataForPrint+")"); // Call To Function
			this.resetVariablesOfLS()
		},
		loadCss:function() { // Function To Load CSS
		    var link = document.createElement("link"); // Create link
		    link.type = "text/css"; // Set Type
		    link.rel = "stylesheet"; // Set Relativity
		    link.href = "/ivcargo/resources/css/module/dispatch/dispatchlsprint.css"; // Path To File
		    document.getElementsByTagName("head")[0].appendChild(link); // Append To Document
		    $("*[data-headerCell]").addClass("truncate");
			$("*[data-dataCell]").addClass("truncate");
		    
		},
		defaultCSS:function(copyDataForPrint) { // Default CSS Class Application
			$("*[data-header=MainHeaderBreak]").addClass("page-break"); // To Set Page Braker
			$("*[data-header]").addClass("headersAlignCenter"); // To Align Header In Center And Apply Font
			$("*[data-subheader]").addClass("headersAlignCenter"); // To Align Header In Center And Apply Font
			$("*[data-table]").addClass("table");
			$("*[data-headerCell]").addClass("tableCells");
			$("*[data-dataCell]").addClass("tableCells");
//			$("*[data-dataCell=wayBillArticleQuantity]").addClass("rightCell");
			$("*[data-dataCell=wayBillGrandTotal]").addClass("rightCell");
			$("*[data-div]").addClass("lineDiv");
			$("*[data-RightDiv=lsNumber]").addClass("rightDiv");
			$("*[data-LeftDiv=vehicleNumber]").addClass("leftDiv");
			$("*[data-RightDiv=dateString]").addClass("rightDiv");
			$("*[data-LeftDiv=driverName]").addClass("leftDiv");
			$("*[data-RightDiv=dispatchLSDestinationBranchName]").addClass("rightDiv");
			$("*[data-LeftDiv=dispatchLSSourceBranchName]").addClass("leftDiv");
			$("*[data-totalTable=totalTableCell]").addClass("totalTableCell");
//			$("*[data-totalTable=totalTableCell]").addClass("rightCell");
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
		},extend:function(obj, src) { // Function To Join Two Object
		    for (var key in src) {
		        if (src.hasOwnProperty(key)) obj[key] = src[key];
		    }
		    return obj; // Returned Object
		},resetVariablesOfLS:function(){
			langObjLRSummary; // Specifically For LR Summary en-gb Ref
			langObjPartialLRSummary; // Specifically For LR Summary en-gb Ref
			langKeySetLRSummary; // Specifically For LR Summary en-gb Ref
			langKeySetPartialLRSummary; // Specifically For LR Summary en-gb Ref
			langObjSummary; // Specifically For LS Summary en-gb Ref
			langKeySetSummary; // Specifically for LS Summary en-gb Ref
			langObjFormDetails; // Specifically for LS LR Form Details en-gb Ref
			langKeySetFormDetails; // Specifically for LS LR Form Details en-gb Ref
			langObjLHPVSummary; // Specifically for LHPV Summary en-gb Ref
			langKeySetLHPVSummary; // Specifically for LHPVSummary Details en-gb Ref
			grandTotalOnLastPage; // For Configuration NOT USED IN CURRENT CODE
			totalsOnEveryPage; // For Configuration NOT USED IN CURRENT CODE
			headerOnFirstPage; // For Configuration
			headerOnEveryPage; // For Configuration NOT USED IN CURRENT CODE
			lrSummaryTable				= $("<table width='"+100+"%' />"); // LR Summary Table
			partialLRSummaryTable				= $("<table width='"+100+"%' />"); // LR Summary Table
			lrSummaryTable.attr('data-table', 'lrTable'); // To Apply CSS Class
			partialLRSummaryTable.attr('data-table', 'partialLRTable'); // To Apply CSS Class
			lrSummaryTableRow			= $(lrSummaryTable[0].insertRow(-1)); // LR Summary Table Row
			partialLRSummaryTableRow			= $(lrSummaryTable[0].insertRow(-1)); // LR Summary Table Row
			mainHeader					= new Array(); // LS Main Header
			subHeader					= new Array(); // LS Sub Header
			dataDiv						= new Array(); // LS Header Data Div
			divName						= new Array(); // To Apply CSS Class
			grandTotalWeight		= 0; // For Totaling
			lhpvAmount				= 0; // For Totaling
			totalActualWeight		= 0;
			dataArrayObject;	// Object For LHPV Summary Total
			lrSumarySequenceArray		= new Array(); //Array For LR Summary Total Sequence
			lsSummarySequenceArray		= new Array(); // Array For LS Summary Total Sequence
			lhpvSummarySequenceArray	= new Array(); // Array For LHPV Summary Total Sequence
		},getTotalWeight:function(dispatchLRSummary){
			var totalWeight = 0;
			for(var branch in dispatchLRSummary){
				var lrColl = dispatchLRSummary[branch];
				for(var count in lrColl){
					totalWeight += parseFloat(lrColl[count].wayBillActualWeight);
				}
			}
			return totalWeight;
		}
	}
});