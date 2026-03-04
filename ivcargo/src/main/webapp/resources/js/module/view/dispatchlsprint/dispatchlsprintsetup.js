define (['language',
         'jquerylingua',
         PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatchlsprint/dispatchlsprintfilepath.js'],
         function(Language, JqueryLingua, FilePath){
	'use strict';
	var langObj;
	var langKeySet;
	var grandTotalOnLastPage;
	var totalsOnEveryPage;
	var headerOnFirstPage;
	var headerOnEveryPage;
	var showCityWithBranch;
	var pageBreaker					= 15;
	var pageBreakerWithoutHeader	= 12;
	var printPageCount;
	var rowCounter					= 0;
	var lrSummaryTable				= $("<table width='"+100+"%' />");
	lrSummaryTable.attr('data-table', 'lrTable');
	var lrSummaryTableRow			= $(lrSummaryTable[0].insertRow(-1));
	var lrPerPageTotalTable;
	var lrPerPageTotalTableRow;
	var mainHeader					= new Array();
	var subHeader					= new Array();
	var dataDiv						= new Array();
	var divName						= new Array();
	var sequenceArray				= new Array();
	return {
		setPageViewConfig:function(SetUpConfig, _parentObject) {
			grandTotalOnLastPage	= SetUpConfig.grandTotalOnLastPage;
			totalsOnEveryPage		= SetUpConfig.totalsOnEveryPage;
			headerOnFirstPage		= SetUpConfig.headerOnFirstPage;
			headerOnEveryPage		= SetUpConfig.headerOnEveryPage;
			showCityWithBranch		= SetUpConfig.showCityWithBranch;
		},
		setLSHeader:function(dispatchLSHeader, PrintHeaderModel, _parentObject) {
			if (headerOnFirstPage){				
				var headerData			= dispatchLSHeader[0];
				var keyObject			= Object.keys(headerData);
				var displayData			= new Array();
				var headerCollection	= PrintHeaderModel;
				
				if(headerOnEveryPage=='true') {
					mainHeader.push(headerCollection.accountGroupName);
					subHeader.push(headerCollection.branchName);
					subHeader.push(headerCollection.branchAddress);
					subHeader.push(headerCollection.branchContactDetailPhoneNumber);
				}else {
					mainHeader.push('&nbsp');
					subHeader.push('&nbsp;');
					subHeader.push('&nbsp;');
					subHeader.push('&nbsp;');
				}
				
				
				displayData		= this.getHeaderData(mainHeader,subHeader);
				for (var i=0; i<displayData.length; i++) {
					_parentObject.$el.append(displayData[i]);
				}
				var firstLine = $("<div />");
				firstLine.attr('data-div',"first");
				dataDiv.push('<h4 align="center">Branch - '+headerData.dispatchLSSourceBranchName+'</h1>')
				dataDiv.push('<b>Truck No :</b>&emsp;&emsp;'+headerData.vehicleNumber+'<b style="float: right; display: inline; padding-right: 150px;">Loaded By :</b>&emsp;&emsp;');
				divName.push(keyObject[5]);
				dataDiv.push('<b>LS No. :</b>&emsp;&emsp;&emsp;'+headerData.lsNumber+'<b style="float: right; display: inline; padding-right: 200px;"></b>&emsp;&emsp;');//Prepared By : '+headerData.lsNumber+'
				divName.push(keyObject[16]);
				displayData		= this.getDivData(dataDiv, divName);
				for (var i=0; i<displayData.length; i++) {
					firstLine.append(displayData[i]);
				}
				_parentObject.$el.append(firstLine);
				dataDiv	= [];
				divName = [];
				
				var secondLine = $("<div />");
				secondLine.attr('data-div',"second");
				//dataDiv.push(headerData.driverName+"("+headerData.driverMobileNumber+")"+"("+headerData.driverLicenceNumber+")");
				if(headerData.driverName != undefined && headerData.driverMobileNumber != undefined){
					dataDiv.push('<b>Driver:</b>&emsp;&emsp;'+headerData.driverName+"("+headerData.driverMobileNumber+")"); // Providing Data For Div Creation i.e. Driver Details
				} else if (headerData.driverName != undefined && headerData.driverMobileNumber == undefined){
					dataDiv.push('<b>Driver:</b>&emsp;&emsp;'+headerData.driverName+"(--)"); // Providing Data For Div Creation i.e. Driver Details
				} else {
					dataDiv.push('<b>Driver:</b>&emsp;&emsp;--'); // Providing Data For Div Creation i.e. Driver Details
				}
				divName.push(keyObject[12]);
				//alert(headerData.dateString);
				//dataDiv.push('<b>Driver</b>');
				//divName.push(keyObject[12]);
				dataDiv.push(headerData.dateString);
				divName.push(keyObject[18]);
				//dataDiv.push('<b>Owner/Agent :</b>&emsp;&emsp;'+headerData.vehicleAgentName);
				//divName.push(keyObject[11]);
				displayData		= this.getDivData(dataDiv, divName);
				for (var i=0; i<displayData.length; i++) {
					secondLine.append(displayData[i]);
				}
				_parentObject.$el.append(secondLine);
				dataDiv	= [];
				divName = [];
				
				if(headerData.vehicleAgentName !== null){
					var thirdLine = $("<div />");
					thirdLine.attr('data-div',"third");
					dataDiv.push(headerData.vehicleAgentName);
					divName.push(keyObject[11]);
					displayData		= this.getDivData(dataDiv, divName);
					for (var i=0; i<displayData.length; i++) {
						thirdLine.append(displayData[i]);
					}
					_parentObject.$el.append(thirdLine);
					dataDiv	= [];
					divName = [];	
				}
				var fourthLine = $("<div />");
				fourthLine.attr('data-div',"fourth");
				if(showCityWithBranch){
					dataDiv.push('<b>From :</b>&emsp;&emsp;'+headerData.dispatchLSSourceBranchName+"("+headerData.dispatchLsSourceCityName+")");
				}else{
					dataDiv.push('<b>From :</b>&emsp;&emsp;'+headerData.dispatchLSSourceBranchName);
				}
				
				divName.push(keyObject[7]);
				if(showCityWithBranch){
					dataDiv.push('<b>To :</b>&emsp;&emsp;&emsp;&nbsp;'+headerData.dispatchLSDestinationBranchName+"("+headerData.dispatchLsDestinationCityName+")");
				}else{
					dataDiv.push('<b>To :</b>&emsp;&emsp;&emsp;&nbsp;'+headerData.dispatchLSDestinationBranchName);
				}
				
				divName.push(keyObject[9]);
				displayData		= this.getDivData(dataDiv, divName);
				for (var i=0; i<displayData.length; i++) {
					fourthLine.append(displayData[i]);
				}
				_parentObject.$el.append(fourthLine);
				dataDiv		= [];
				divName 	= [];
				mainHeader	= [];
				subHeader	= [];
			}
		},
		getHeaderData:function(mainHeader, subHeader) {
			var mainHeaderTag		= $("<h1 />");
			mainHeaderTag.attr('data-header', "MainHeader");
			var subHeaderTag		= $("<h4 />");
			subHeaderTag.attr('data-subHeader', "SubHeader");
			var headerArray	=	new Array();
			
			var divArray	= this.getDivForHeader(mainHeader);
			for (var i=0; i<divArray.length; i++) {
				mainHeaderTag.append(divArray[i]);
			}
			headerArray.push(mainHeaderTag);
			
			divArray		= this.getDivForHeader(subHeader);
			for (var i=0; i<divArray.length; i++) {
				subHeaderTag.append(divArray[i]);
			}
			headerArray.push(subHeaderTag);
			return headerArray;
		},
		getDivForHeader:function(dataArray){
			var divDataArray	= new Array();
			for (var i=0; i<dataArray.length; i++) {
				var blankDiv	= $("<div />");
				blankDiv.attr('data-headerDiv', "BlankHeaderDiv");
				var div			= $("<div />");
				div.attr('data-headerDiv', "DataHeaderDiv");
				div.html(dataArray[i]);
				divDataArray.push(blankDiv);
				divDataArray.push(div);
			}
			return divDataArray;
		},
		getDivData:function(dataArray, divName) {
			var divDataArray	= new Array();
			for (var i=0; i<dataArray.length; i++) {
				var blankDiv	= $("<div />");
				blankDiv.attr('data-BlankDiv', "BlankDiv");
				var div			= $("<div />");
				if ((i%2) !== 0 ) {
					div.attr('data-RightDiv', divName[i]);
				}else {
					div.attr('data-LeftDiv', divName[i]);					
				}
				div.html(dataArray[i]);
				divDataArray.push(blankDiv);
				divDataArray.push(div);
			}
			return divDataArray;
		},
		setLRSummary:function(dispatchLRSummary, configuration, dispatchLSHeader, PrintHeaderModel, _parentObject) {
			var dataForTotal	= new Array();
			var cellDataArray	= new Array();
			cellDataArray		= this.getTableHeaderCell(configuration);
			for (var i=0; i<cellDataArray.length; i++) {
				lrSummaryTableRow.append(cellDataArray[i]);
			}
			rowCounter++;
			
			printPageCount	= Math.round(dispatchLRSummary.length/pageBreaker);
			if (printPageCount <= 0) {
				for (var i=0; i<dispatchLRSummary.length; i++) {
					lrSummaryTableRow		= $(lrSummaryTable[0].insertRow(-1));
					cellDataArray	= this.getTableDataCell(dispatchLRSummary[i]);
					for (var j=0; j<cellDataArray.length; j++) {
						lrSummaryTableRow.append(cellDataArray[j]);
					}
					_parentObject.$el.append(lrSummaryTable);
				}
			} else {
				for (var k=0; k<dispatchLRSummary.length; k++){
					if(rowCounter == pageBreaker) {
						rowCounter = 0;
						if (totalsOnEveryPage) {							
							this.getPageWiseTotals(dataForTotal,configuration,_parentObject);
							dataForTotal	= [];
						}
						if (headerOnEveryPage) {
							this.setLSHeader(dispatchLSHeader, PrintHeaderModel, _parentObject);
						} else {
							//pageBreaker	= pageBreakerWithoutHeader; To Increase Number Of Row Uncomment This & Comment Below Code
							$("*[data-header]").addClass("hideData");
							$("*[data-subheader]").addClass("hideData");
							$("*[data-div]").addClass("hideData");
						}
						lrSummaryTable			= $("<table width='"+100+"%' />");
						lrSummaryTable.attr('data-table', 'lrTable');
						lrSummaryTableRow		= $(lrSummaryTable[0].insertRow(-1));
						cellDataArray		= this.getTableHeaderCell(configuration);
						for (var i=0; i<cellDataArray.length; i++) {
							lrSummaryTableRow.append(cellDataArray[i]);
						}
						rowCounter++;
						lrSummaryTableRow		= $(lrSummaryTable[0].insertRow(-1));
						cellDataArray	= this.getTableDataCell(dispatchLRSummary[k]);
						for (var j=0; j<cellDataArray.length; j++) {
							lrSummaryTableRow.append(cellDataArray[j]);
						}
						dataForTotal.push(dispatchLRSummary[k]);
						_parentObject.$el.append(lrSummaryTable);
					} else {
						lrSummaryTableRow		= $(lrSummaryTable[0].insertRow(-1));
						cellDataArray	= this.getTableDataCell(dispatchLRSummary[k]);
						console.log(cellDataArray);
						for (var l=0; l<cellDataArray.length; l++) {
							lrSummaryTableRow.append(cellDataArray[l]);
						}
						dataForTotal.push(dispatchLRSummary[k]);
						_parentObject.$el.append(lrSummaryTable);
					}
					rowCounter++;
				}
			}
		},
		getTableHeaderCell:function(dataObject) {
			langObj = FilePath.loadLanguage();
		    langKeySet = loadLanguageWithParams(langObj);
		    
			var tableHeaderArray	= new Array();
			
			var configKey			= Object.keys(dataObject);
			var headerSequence		= new Object();
			for (var i=0; i<configKey.length; i++) {
				headerSequence[(dataObject[(configKey[i])].Sequence)]	= configKey[i];
			}
			
			jQuery.each(headerSequence, function(i, configVal){
				var headerCell	= $("<th />");
				headerCell.html(langKeySet[configVal]);
				headerCell.attr('data-headerCell', configVal);
				sequenceArray.push(configVal);
				tableHeaderArray.push(headerCell);
			});
			
			return tableHeaderArray;
		},
		getTableDataCell:function(dataObject) {
			var tableCellDataArray	= new Array();
			jQuery.each(langKeySet, function(value, key){
				var tableCell	= $("<td />");
				tableCell.html(dataObject[value]);
				tableCell.attr('data-dataCell', value);
				tableCellDataArray.push(tableCell);
			});
			console.log(tableCellDataArray);
			return tableCellDataArray;
		},
		getPageWiseTotals:function(dataArray,configuration,_parentObject) {
			var objectForTotal		= new Object();
			var totalDisplayArray	= new Array();
			
			for (var i=0; i<sequenceArray.length; i++) {
				var valueForTotal	= 0;
				if ((configuration[(sequenceArray[i])].Totalable)) {
					for(var j=0; j<dataArray.length; j++) {
						objectForTotal	= dataArray[j];
						valueForTotal	= valueForTotal + objectForTotal[(sequenceArray[i])];
					}
					var valueCell	= $("<td />");
					valueCell.html(valueForTotal);
					valueCell.attr('data-totalTable', 'totalTableCell');
					totalDisplayArray.push(valueCell);
				} else {
					var blankCell	= $("<td />");
					blankCell.html("");
					totalDisplayArray.push(blankCell)
				}
			}
			lrPerPageTotalTable		= $("<table width='"+100+"%' />");
			lrPerPageTotalTable.attr('data-table', 'lrTotalTable');
			lrPerPageTotalTableRow	= $(lrPerPageTotalTable[0].insertRow(-1))
			for (var k=0; k<totalDisplayArray.length; k++) {
				lrPerPageTotalTableRow.append(totalDisplayArray[k]);
			}
			sequenceArray	= [];
			_parentObject.$el.append(lrPerPageTotalTable);
		},
		setLSTotalSummary:function(dispatchLSTotalSummary, _parentObject) {
			if(grandTotalOnLastPage) {
				var footerData		= dispatchLSTotalSummary[0];
				var footerString	= "Total Number Of Packages : "+ footerData.totalPackageNumber+", Total Number Of LR : "+footerData.totalLRNumber+", Total LS Amount : "+footerData.totalLSAmount;
				var para			= $("<p />");
				para.html(footerString);
				var footer			= $("<footer />");
				footer.append(para);
				
				_parentObject.$el.append(footer);				
			}
			
			var driverSignDiv		= $("<div style='padding-left:50px; display: inline;' />");
			driverSignDiv.html("Driver Sign");
			_parentObject.$el.append(driverSignDiv);
			var unloadedBySignDiv		= $("<div style='padding-right:50px; display: inline; float:right;' />");
			unloadedBySignDiv.html("Unloaded By");
			_parentObject.$el.append(unloadedBySignDiv);
		},
		setLSFooterDetail:function(_parentObject) {
			
		},
		applyCSS:function(SetUpConfig, _parentObject) {
			this.loadCss();
			/*var functionName	= SetUpConfig.cssConfiguration;
			globals()[functionName];*/
			$("*[data-header]").addClass("headersAlignCenter");
			$("*[data-subheader]").addClass("headersAlignCenter");
			$("*[data-table]").addClass("table");
			$("*[data-headerCell]").addClass("tableCells");
			$("*[data-dataCell]").addClass("tableCells");
			$("*[data-dataCell=wayBillArticleQuantity]").addClass("rightCell");
			$("*[data-dataCell=wayBillGrandTotal]").addClass("rightCell");
			$("*[data-div]").addClass("lineDiv");
//			$("*[data-RightDiv=lsNumber]").addClass("rightDiv");
//			$("*[data-LeftDiv=vehicleNumber]").addClass("leftDiv");
//			$("*[data-RightDiv=dateString]").addClass("rightDiv");
//			$("*[data-LeftDiv=driverName]").addClass("leftDiv");
//			$("*[data-RightDiv=dispatchLSDestinationBranchName]").addClass("rightDiv");
//			$("*[data-LeftDiv=dispatchLSSourceBranchName]").addClass("leftDiv");
			$("*[data-totalTable=totalTableCell]").addClass("totalTableCell");
			$("*[data-totalTable=totalTableCell]").addClass("rightCell");
			this.plainPrint();
		},
		loadCss:function() {
		    var link = document.createElement("link");
		    link.type = "text/css";
		    link.rel = "stylesheet";
		    link.href = "/ivcargo/resources/css/module/dispatch/dispatchlsprint.css";
		    document.getElementsByTagName("head")[0].appendChild(link);
		},
		defaultCSS:function() {
			console.log("here");
			
		},
		plainPrint:function() {
			/*alert("Plain Print");
			$("*[data-table]").removeClass("table");
			$("*[data-headerCell]").removeClass("tableCells");
			$("*[data-dataCell]").removeClass("tableCells");
			$("*[data-table]").addClass("plainTable");*/
			setTimeout(function(){window.print();},1000)
		}
	}
});