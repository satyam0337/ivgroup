define([  
	'slickGridWrapper2'
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,'JsonUtility'
	,'messageUtility'
	,'autocomplete'
	,'autocompleteWrapper'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'focusnavigation'//import in require.config
	],function(slickGridWrapper2, Selection) {
	'use strict';
	var jsonObject = new Object(), myNod, _this = '', fromDate = "", toDate = "";

	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/newAllBranchWiseCollectionSummaryReportWS/getReportElementConfiguration.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		},getElementConfigDetails : function(response){
			var loadelement = new Array();
			var baseHtml = new $.Deferred();

			loadelement.push(baseHtml);
			$("#mainContent").load("/ivcargo/html/report/collectionreport/newAllBranchWiseCollectionSummaryReport/newAllBranchWiseCollectionSummaryReport.html", function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				var keyObject = Object.keys(response);
				
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]]) {
						$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
					}
				}
				
				_this.setSelectType();
				_this.dataFrequencyInputBox(response.DataFrequencyList);
				
				function clickHandler() {
 					$('#controlinput_dataFrequencyEle').blur();				  
				}

				setTimeout(clickHandler,100);

				$("#dateEle").on("change",function(){		
					let val =$("#dataFrequencyEle").parent();
					$('#dataFrequencyEle').val(val.find(".item[data-value]").attr("data-value")); 							
				})
					
				$('#dataFrequencyDiv').hide();
				$('#branchEleDiv').addClass('hide');
				
				$("body").on('click', function () {
					let valueStr = $("#dateEle").val();
					valueStr = valueStr.split("-");
					let startyear = valueStr[2].trim();
					let endyear = valueStr[valueStr.length - 1].trim();
					
					if (startyear != endyear) {
						$("#dateEle").val(`01-04-${startyear} - 31-03-${endyear}`)
						$("#dateEle").attr('data-startdate', `01-04-${startyear}`)
						$("#dateEle").attr('data-enddate', `31-03-${endyear}`)
					}
				})
				
					
				var elementConfiguration	= new Object();

				elementConfiguration.dateElement			= $('#dateEle');
				elementConfiguration.regionElement			= $('#regionEle');
				elementConfiguration.subregionElement		= $('#subRegionEle');
				elementConfiguration.branchElement			= $('#branchEle');

				response.elementConfiguration				= elementConfiguration;
				
				var today = new Date();
				today.setDate(today.getDate() - 1);
				var dd = String(today.getDate()).padStart(2, '0');
				var mm = String(today.getMonth() + 1).padStart(2, '0'); 
				var yyyy = today.getFullYear();
				var yesterday = dd + '-' + mm + '-' + yyyy;

				var options		= new Object();
				options.maxDate		= yesterday;
				options.startDate	= yesterday;
				response.options = options;
	
				Selection.setSelectionToGetData(response);
				
				$("ul li").each(function(value, data) {
					if (data.innerText == "Today")
						$(data).hide();
				})

				$('#searchTypeEle').change(function() {
					var selectType = $('#searchTypeEle_primary_key').val();
					
					$('div[data-attribute="dataFrequency"]').first().css("display", "none")
					$('#dataFrequencyDiv').hide();
					$('#branchEleDiv').addClass('hide');
					$('#dataFrequencyEle').val(-1);
					$('#dataFrequencyEle_primary_key').val(-1)
					$("#branchEle").val("ALL");
					$("#branchEle_primary_key").val(-1);
					
					$("ul li").each(function(value, data) {
						if (data.innerText == "Today")
							$(data).hide();

						if (selectType == 1) {
							if (data.innerText == "This Year" || data.innerText == "Last Two Year" || data.innerText == "Last Financial Year")
								$(data).hide();

							if (data.innerText == "Yesterday" || data.innerText == "Last 7 Days" || data.innerText == "Last 30 Days")
								$(data).show();
						} else {
							if (data.innerText == "This Year" || data.innerText == "Last Two Year" || data.innerText == "Last Financial Year")
								$(data).show();

							if (data.innerText == "Yesterday" || data.innerText == "Last 7 Days" || data.innerText == "Last 30 Days")
								$(data).hide();
						}

						if (selectType == 2) {
							if (data.innerText == "This Year" || data.innerText == "Last Two Year" || data.innerText == "Last Financial Year") {
								$(data).click(function() {
									$('#dataFrequencyDiv').show();
									$('#branchEleDiv').removeClass('hide');
									$('#dataFrequencyEle').val(null);
									$('#dataFrequencyEle_primary_key').val(null)
									$("#branchEle").val(null);
									$("#branchEle_primary_key").val(null);
									$('div[data-attribute="dataFrequency"]').first().css("display", "flex")

									myNod.add({
										selector: '#dataFrequencyEle',
										validate: 'validateAutocomplete:#dataFrequencyEle',
										errorMessage: 'Select Data Frequency !'
									});
									
									myNod.add({
										selector: '#branchEle',
										validate: 'validateAutocomplete:#branchEle',
										errorMessage: 'Select Data Frequency !'
									});
								})
							} else {
								$(data).click(function() {
									$('div[data-attribute="dataFrequency"]').first().css("display", "none")
									$('#dataFrequencyDiv').hide();
									$('#branchEleDiv').addClass('hide');
									$('#dataFrequencyEle').val(-1);
									$('#dataFrequencyEle_primary_key').val(-1)
									$("#branchEle").val("ALL");
									$("#branchEle_primary_key").val(-1);
									myNod.remove("#dataFrequencyEle");
									myNod.remove("#branchEle");
								})
							}
						}
					});
				});

				hideLayer();
				
				myNod = Selection.setNodElementForValidation(response);
				
				myNod.configure({
					parentClass:'validation-message'
				});
				
				myNod.add({
					selector: '#searchTypeEle',
					validate: 'validateAutocomplete:#searchTypeEle',
					errorMessage: 'Select proper Type !'
				});
					
				$("#findBtn").click(function() {
					var selectType = $('#searchTypeEle_primary_key').val();

					if (selectType == 1)
						myNod.remove("#branchEle");

					myNod.performCheck();
					
					if (myNod.areAll('valid'))
						_this.onSubmit();
				});
			});
		},onSubmit : function() {
			showLayer();
            let jsonObject = Selection.getElementData();
		
			if($("#dateEle").attr('data-startdate') != undefined)
				fromDate = $("#dateEle").attr('data-startdate'); 

			if($("#dateEle").attr('data-enddate') != undefined)
				toDate = $("#dateEle").attr('data-enddate');
			
			jsonObject["dataFrequency"] = $('#dataFrequencyEle_primary_key').val();
       
			getJSON(jsonObject, WEB_SERVICE_URL+'/newAllBranchWiseCollectionSummaryReportWS/getAllBranchWiseData.do', _this.setReportData, EXECUTE_WITH_NEW_ERROR);
		}, setReportData: function(response) {
			$('#monthWisePanel').addClass('hide');
			$('#branchWisePanel').addClass('hide');
			
			$("#branchWiseCollectionSummaryReportDiv").empty();
			$('#branchWiseCollectionSummaryReport').empty();
			$('#summarytable thead').empty();
			$('#summarytable tbody').empty();
			$('#summarytable tfoot').empty();

			if (response.message != undefined) {
				hideLayer();
				$('#bottom-border-boxshadow').hide();
				$('#btnprint_branchWiseReportDetails').hide();
				return;
			}
			
			if(response.yearBranchWiseHM != undefined)
				_this.setReportSummaryYearWise(response);
			else if(response.halfYearBranchWiseHM != undefined)
				_this.setReportSummaryHalfYearWise(response);
			else if(response.yearQuaterBranchWiseHM != undefined)
				_this.setReportSummaryQuarterWise(response);
			else if(response.monthWiseHm != undefined)
				_this.setReportSummaryMonthWise(response);
			else if(response.CorporateAccount != undefined)
				_this.setReportDetailMonthWise(response);

			hideLayer();
		},setReportSummaryYearWise : function(response){
			$('#monthWisePanel').removeClass('hide');

			var yearBranchWiseHM = response.yearBranchWiseHM;
			var reprtHeaderColumnArray = [];
			var headerArray = [];
			var columnArray = [];
			var footerArray = [];
			var columnTotals = {};
			var branches = {};
			var counter = 1;
			var today = new Date();
			var time = today.getHours() + ":" + today.getMinutes();

			function getYearLabel(financialYear) {
				var [startYear, endYear] = financialYear.split('-');
				return `FY${startYear.slice(2)}-${endYear.slice(2)}`;
			}

			var allYears = new Set();

			for (var branchKey in yearBranchWiseHM) {
				var branchData = yearBranchWiseHM[branchKey];
				
				for (var financialYear in branchData) {
					allYears.add(financialYear);
				}
			}

			allYears = Array.from(allYears).sort((a, b) => a.localeCompare(b));

			allYears.forEach(financialYear => {
				columnTotals[getYearLabel(financialYear)] = 0;
			});

			for (var branchKey in yearBranchWiseHM) {
				var branchData = yearBranchWiseHM[branchKey];
				var [branchName, branchId, financialYear] = branchKey.split('_');
				
				if (!branches[branchId]) {
					branches[branchId] = {
						counter: counter,
						branchName: branchName,
						totals: {},
						totalAmount: 0
					};
					counter++;
				}

				var branch = branches[branchId];
				for (var year in branchData) {
					var amount = parseFloat(branchData[year]) || 0;
					var yearLabel = getYearLabel(year);
					branch.totals[yearLabel] = amount;
					branch.totalAmount += amount;
					columnTotals[yearLabel] += amount;
				}
			}

			var sortedBranches = Object.values(branches).sort((a, b) => a.counter - b.counter);

			var defaultWidth = 15;
			var branchWidth = 20;
			var remainingWidth = 85 - branchWidth - defaultWidth * allYears.length;
			var dynamicWidth = (remainingWidth / (allYears.length + 1)).toFixed(2);

			if (dynamicWidth < defaultWidth) {
				dynamicWidth = defaultWidth;
			}

			branchWidth = dynamicWidth + 3;

			headerArray.push('<th style="width: 5%; text-align: center; font-size: 13px;">Sr No</th>');
			headerArray.push('<th style="width: ' + branchWidth + '%; text-align: center; font-size: 13px;">Branch</th>');
			
			allYears.forEach(year => {
				var yearLabel = getYearLabel(year);
				headerArray.push('<th style="width: ' + dynamicWidth + '%; text-align: center; font-size: 13px;">' + yearLabel + '</th>');
			});
			
			headerArray.push('<th style="width: ' + dynamicWidth + '%; text-align: center; font-size: 13px;">Total</th>');
			
			sortedBranches.forEach(branch => {
				var rowData = '<tr>';
				rowData += '<td style="text-align: center;">' + branch.counter + '</td>';
				rowData += '<td style="text-align: left;">' + branch.branchName + '</td>';
				
				allYears.forEach(year => {
					var yearLabel = getYearLabel(year);
					var amount = branch.totals[yearLabel] || 0;
					rowData += '<td style="text-align: right;">' + amount.toFixed(2) + '</td>';
				});
				
				rowData += '<td style="text-align: right;">' + branch.totalAmount.toFixed(2) + '</td>';
				rowData += '</tr>';
				columnArray.push(rowData);
			});
		
			var totalColumns = 1 + allYears.length;
			footerArray.push('<tr><th></th><th style="font-size: 13px;">Total</th>');
			
			var grandTotal = 0;
			
			allYears.forEach(year => {
				var yearLabel = getYearLabel(year);
				var columnTotal = columnTotals[yearLabel].toFixed(2);
				footerArray.push('<th style="text-align: right; font-size: 13px;">' + columnTotal + '</th>');
				grandTotal += parseFloat(columnTotal);
			});
			
			footerArray.push('<th style="text-align: right; font-size: 13px;">' + grandTotal.toFixed(2) + '</th></tr>');

			reprtHeaderColumnArray.push("<th style='text-align: left;'>Time: " + time + "</th>");
			reprtHeaderColumnArray.push(`<th colspan='${totalColumns}' style='text-align: center; font-size: 14px;'>NEW ALL BRANCH WISE COLLECTION SUMMARY REPORT</th>`);
			reprtHeaderColumnArray.push("<th class='textAlignCenter'>" + fromDate + " --- " + toDate + "</th>");

			$('#summarytable thead').append('<tr class="info">' + reprtHeaderColumnArray.join(' ') + '</tr>');
			$('#summarytable thead').append('<tr>' + headerArray.join('') + '</tr>');
			$('#summarytable tbody').append(columnArray.join(''));
			$('#summarytable tfoot').append(footerArray.join(''));

			$('#summarytable').css('display', 'table');
			
			_this.setDataForPrint(response);
		}, setDataForPrint : function(response) {
			var data = new Object();
			
			var PrintHeaderModel = response.PrintHeaderModel;
			data.accountGroupNameForPrint 	= PrintHeaderModel.accountGroupName;
			data.branchAddress 				= PrintHeaderModel.branchAddress;
			data.branchPhoneNumber 			= PrintHeaderModel.branchPhoneNumber;
			data.isLaserPrintAllow 			= 'true';
			data.isPlainPrintAllow 			= 'true';
			data.isExcelButtonDisplay 		= 'true';
			data.showFromAndToDateInReportData = true;
			data.fromDate 					= fromDate;
			data.toDate 					= toDate;

			printTable(data, 'reportData', 'branchWiseCollectionSummaryReport', 'New All Branch Wise Collection Summary Report', 'branchWiseCollectionSummaryReport');
		}, setReportSummaryHalfYearWise : function(response) {
			 $('#monthWisePanel').removeClass('hide');

			var halfYearBranchWiseHM = response.halfYearBranchWiseHM;
			var reprtHeaderColumnArray = [];
			var headerArray = [];
			var columnArray = [];
			var footerArray = [];
			var columnTotals = {};
			var branches = {};
			var counter = 1;
			var today = new Date();
			var time = today.getHours() + ":" + today.getMinutes();

			function getHalfYearLabel(yearQuarter) {
				var [financialYear, halfYear] = yearQuarter.split('_');
				var [startYear, endYear] = financialYear.split('-');
				var fiscalYear = `FY${startYear.slice(2)}-${endYear.slice(2)}`;
				return `H${halfYear}${fiscalYear}`;
			}

			var allYearHalves = new Set();

			for (var branchKey in halfYearBranchWiseHM) {
				var branchData = halfYearBranchWiseHM[branchKey];
				for (var yearHalf in branchData) {
					allYearHalves.add(yearHalf);
				}
			}

			allYearHalves = Array.from(allYearHalves).sort((a, b) => {
				var [financialYearA, halfA] = a.split('_');
				var [financialYearB, halfB] = b.split('_');
				return financialYearA.localeCompare(financialYearB) || halfA - halfB;
			});

			allYearHalves.forEach(yearHalf => {
				columnTotals[getHalfYearLabel(yearHalf)] = 0;
			});

			for (var branchKey in halfYearBranchWiseHM) {
				var branchData = halfYearBranchWiseHM[branchKey];
				var [branchName, branchId, financialYear, halfYear] = branchKey.split('_');
				if (!branches[branchId]) {
					branches[branchId] = {
						counter: counter,
						branchName: branchName,
						totals: {},
						totalAmount: 0
					};
					counter++;
				}

				var branch = branches[branchId];
				for (var yearHalf in branchData) {
					var amount = parseFloat(branchData[yearHalf]) || 0;
					var halfYearLabel = getHalfYearLabel(yearHalf);
					branch.totals[halfYearLabel] = amount;
					branch.totalAmount += amount;
					columnTotals[halfYearLabel] += amount;
				}
			}

			var sortedBranches = Object.values(branches).sort((a, b) => a.counter - b.counter);

			var defaultWidth = 15;
			var branchWidth = 20;
			var remainingWidth = 85 - branchWidth - defaultWidth * allYearHalves.length;
			var dynamicWidth = (remainingWidth / (allYearHalves.length + 1)).toFixed(2);

			if (dynamicWidth < defaultWidth) {
				dynamicWidth = defaultWidth;
			}

			branchWidth = dynamicWidth + 3;

			headerArray.push('<th style="width: 5%; text-align: center; font-size: 13px;">Sr No</th>');
			headerArray.push('<th style="width: ' + branchWidth + '%; text-align: center; font-size: 13px;">Branch</th>');
			allYearHalves.forEach(yearHalf => {
				var halfYearLabel = getHalfYearLabel(yearHalf);
				headerArray.push('<th style="width: ' + dynamicWidth + '%; text-align: center; font-size: 13px;">' + halfYearLabel + '</th>');
			});
			headerArray.push('<th style="width: ' + dynamicWidth + '%; text-align: center; font-size: 13px;">Total</th>');

			sortedBranches.forEach(branch => {
				var rowData = '<tr>';
				rowData += '<td style="text-align: center;">' + branch.counter + '</td>';
				rowData += '<td style="text-align: left;">' + branch.branchName + '</td>';
				allYearHalves.forEach(yearHalf => {
					var halfYearLabel = getHalfYearLabel(yearHalf);
					var amount = branch.totals[halfYearLabel] || 0;
					rowData += '<td style="text-align: right;">' + amount.toFixed(2) + '</td>';
				});
				rowData += '<td style="text-align: right;">' + branch.totalAmount.toFixed(2) + '</td>';
				rowData += '</tr>';
				columnArray.push(rowData);
			});

			var totalColumns = 1 + allYearHalves.length;
			footerArray.push('<tr><th></th><th style="font-size: 13px;">Total</th>');
			var grandTotal = 0;
			allYearHalves.forEach(yearHalf => {
				var halfYearLabel = getHalfYearLabel(yearHalf);
				var columnTotal = columnTotals[halfYearLabel].toFixed(2);
				footerArray.push('<th style="text-align: right; font-size: 13px;">' + columnTotal + '</th>');
				grandTotal += parseFloat(columnTotal);
			});
			footerArray.push('<th style="text-align: right; font-size: 13px;">' + grandTotal.toFixed(2) + '</th></tr>');

			reprtHeaderColumnArray.push("<th style='text-align: left;'>Time: " + time + "</th>");
			reprtHeaderColumnArray.push(`<th colspan='${totalColumns}' style='text-align: center; font-size: 14px;'>NEW ALL BRANCH WISE COLLECTION SUMMARY REPORT</th>`);
			reprtHeaderColumnArray.push("<th class='textAlignCenter'>" + fromDate + " --- " + toDate + "</th>");

			$('#summarytable thead').append('<tr class="info">' + reprtHeaderColumnArray.join(' ') + '</tr>');
			$('#summarytable thead').append('<tr>' + headerArray.join('') + '</tr>');
			$('#summarytable tbody').append(columnArray.join(''));
			$('#summarytable tfoot').append(footerArray.join(''));

			$('#summarytable').css('display', 'table');

			_this.setDataForPrint(response);
		},setReportSummaryQuarterWise : function(response){
			$('#monthWisePanel').removeClass('hide');
			
			var yearQuaterBranchWiseHM  = response.yearQuaterBranchWiseHM;
			var reprtHeaderColumnArray  = [];
			var headerArray 			= [];
			var columnArray 			= [];
			var footerArray 			= [];
			var columnTotals 			= {};
			var branches 				= {};
			var counter 				= 1;
			var today 					= new Date();
			var time 					= today.getHours() + ":" + today.getMinutes();

			function getQuarterLabel(yearQuarter) {
				var [financialYear, quarter] = yearQuarter.split('_');
				var [startYear, endYear] = financialYear.split('-');
				var fiscalYear = `FY${startYear.slice(2)}-${endYear.slice(2)}`;
				return `Q${quarter}${fiscalYear}`;
			}

			var allYearQuarters = new Set();

			for (var branchKey in yearQuaterBranchWiseHM) {
				var branchData = yearQuaterBranchWiseHM[branchKey];
				for (var yearQuarter in branchData) {
					allYearQuarters.add(yearQuarter);
				}
			}

			allYearQuarters = Array.from(allYearQuarters).sort((a, b) => {
				var [financialYearA, quarterA] = a.split('_');
				var [financialYearB, quarterB] = b.split('_');
				return financialYearA.localeCompare(financialYearB) || quarterA - quarterB;
			});

			allYearQuarters.forEach(yearQuarter => {
				columnTotals[getQuarterLabel(yearQuarter)] = 0;
			});

			for (var branchKey in yearQuaterBranchWiseHM) {
				var branchData = yearQuaterBranchWiseHM[branchKey];
				var [branchName, branchId, financialYear, quarterNo] = branchKey.split('_');
				if (!branches[branchId]) {
					branches[branchId] = {
						counter: counter,
						branchName: branchName,
						totals: {},
						totalAmount: 0
					};
					counter++;
				}

				var branch = branches[branchId];
				for (var yearQuarter in branchData) {
					var amount = parseFloat(branchData[yearQuarter]) || 0;
					var quarterLabel = getQuarterLabel(yearQuarter);
					branch.totals[quarterLabel] = amount;
					branch.totalAmount += amount;
					columnTotals[quarterLabel] += amount;
				}
			}

			var sortedBranches = Object.values(branches).sort((a, b) => a.counter - b.counter);

			var defaultWidth = 15; 
			var branchWidth = 20; 
			var remainingWidth = 85 - branchWidth - defaultWidth * allYearQuarters.length;
			var dynamicWidth = (remainingWidth / (allYearQuarters.length + 1)).toFixed(2); 

			if (dynamicWidth < defaultWidth) {
				dynamicWidth = defaultWidth;
			}

			branchWidth = dynamicWidth + 3;

			headerArray.push('<th style="width: 5%; text-align: center; font-size: 13px;">Sr No</th>');
			headerArray.push('<th style="width: ' + branchWidth + '%; text-align: center; font-size: 13px;">Branch</th>');
		
			allYearQuarters.forEach(yearQuarter => {
				var quarterLabel = getQuarterLabel(yearQuarter);
				headerArray.push('<th style="width: ' + dynamicWidth + '%; text-align: center; font-size: 13px;">' + quarterLabel + '</th>');
			});
		
			headerArray.push('<th style="width: ' + dynamicWidth + '%; text-align: center; font-size: 13px;">Total</th>');

			sortedBranches.forEach(branch => {
				var rowData = '<tr>';
				rowData += '<td style="text-align: center;">' + branch.counter + '</td>';
				rowData += '<td style="text-align: left;">' + branch.branchName + '</td>';
				allYearQuarters.forEach(yearQuarter => {
					var quarterLabel = getQuarterLabel(yearQuarter);
					var amount = branch.totals[quarterLabel] || 0;
					rowData += '<td style="text-align: right;">' + amount.toFixed(2) + '</td>';
				});
				rowData += '<td style="text-align: right;">' + branch.totalAmount.toFixed(2) + '</td>';
				rowData += '</tr>';
				columnArray.push(rowData);
			});

			var totalColumns = 1 + allYearQuarters.length;
						
			reprtHeaderColumnArray.push("<th style='text-align: left;'>" + "Time :" + time + "</th>");
			reprtHeaderColumnArray.push(`<th colspan='${totalColumns}' style='text-align: center; font-size: 14px;'>NEW ALL BRANCH WISE COLLECTION SUMMARY REPORT</th>`);
			reprtHeaderColumnArray.push("<th style='' class='textAlignCenter'>" + fromDate + "---" + toDate + "</th>");
			
			footerArray.push('<tr><th></th><th style="font-size: 13px;">Total</th>');
			var grandTotal = 0;
		
			allYearQuarters.forEach(yearQuarter => {
				var quarterLabel = getQuarterLabel(yearQuarter);
				var columnTotal = columnTotals[quarterLabel].toFixed(2);
				footerArray.push('<th style="text-align: right; font-size: 13px;">' + columnTotal + '</th>');
				grandTotal += parseFloat(columnTotal);
			});
		
			footerArray.push('<th style="text-align: right; font-size: 13px;">' + grandTotal.toFixed(2) + '</th></tr>');

			$('#summarytable thead').append('<tr class="info">' + reprtHeaderColumnArray.join(' ') + '</tr>');
			$('#summarytable thead').append('<tr>' + headerArray.join('') + '</tr>');
			$('#summarytable tbody').append(columnArray.join(''));
			$('#summarytable tfoot').append(footerArray.join(''));

			$('#summarytable').css('display', 'table');
			
			_this.setDataForPrint(response);
		},setReportSummaryMonthWise: function(response) {
			$('#monthWisePanel').removeClass('hide');
			var reprtHeaderColumnArray  = new Array();
			
			var monthWiseHm 	= response.monthWiseHm;
			var headerArray 	= [];
			var columnArray 	= [];
			var footerArray 	= [];
			var columnTotals 	= {};
			var branches 		= {};
			var counter 		= 1;
			var today 			= new Date();
			var time 			= today.getHours() + ":" + today.getMinutes();
			
			function parseMonthYear(monthYear){
				var [month, year] = monthYear.split(' ');
				var monthNumber = new Date(Date.parse(month + " 1, 2020")).getMonth() + 1;
				return new Date(`20${year}`, monthNumber - 1);
			}

			var allMonthYears = new Set();

			for (var branchKey in monthWiseHm) {
				var branchData = monthWiseHm[branchKey];
		
				for (var monthYear in branchData) {
					allMonthYears.add(monthYear);
				}
			}

			allMonthYears = Array.from(allMonthYears).sort((a, b) => parseMonthYear(a) - parseMonthYear(b));
		
			allMonthYears.forEach(monthYear => {
				columnTotals[monthYear] = 0;
			});

			for (var branchKey in monthWiseHm) {
				var branchData = monthWiseHm[branchKey];
				var [branchName, branchId, monthYearKey] = branchKey.split('_');
		
				if (!branches[branchId]) {
					branches[branchId] = {
						counter: counter,
						branchName: branchName,
						totals: {},
						totalAmount: 0
					};
					counter++;
				}

				var branch = branches[branchId];
		
				for (var monthYear in branchData) {
					var amount = parseFloat(branchData[monthYear]) || 0;
					branch.totals[monthYear] = amount;
					branch.totalAmount += amount;
					columnTotals[monthYear] += amount;
				}
			}

			var sortedBranches = Object.values(branches).sort((a, b) => a.counter - b.counter);
			var defaultWidth = 15; 
			var branchWidth = 20;
			var remainingWidth = 85 - branchWidth - defaultWidth * allMonthYears.length;
			var dynamicWidth = (remainingWidth / (allMonthYears.length + 1)).toFixed(2); 

			if (dynamicWidth < defaultWidth) {
				dynamicWidth = defaultWidth;
			}
			
			branchWidth = dynamicWidth + 3;

			headerArray.push('<th style="width: 5%; text-align: center; font-size: 13px;">Sr No</th>');
			headerArray.push('<th style="width: ' + branchWidth + '%; text-align: center; font-size: 13px;">Branch</th>');
		
			allMonthYears.forEach(monthYear => {
				headerArray.push('<th style="width: ' + dynamicWidth + '%; text-align: center; font-size: 13px;">' + monthYear + '</th>');
			});
		
			headerArray.push('<th style="width: ' + dynamicWidth + '%; text-align: center; font-size: 13px;">Total</th>');

			sortedBranches.forEach(branch => {
				var rowData = '<tr>';
				rowData += '<td style="text-align: center;">' + branch.counter + '</td>';
				rowData += '<td style="text-align: left;">' + branch.branchName + '</td>';
		
				allMonthYears.forEach(monthYear => {
					var amount = branch.totals[monthYear] || 0;
					rowData += '<td style="text-align: right;">' + amount.toFixed(2) + '</td>';
				});
		
				rowData += '<td style="text-align: right;">' + branch.totalAmount.toFixed(2) + '</td>';
				rowData += '</tr>';
				columnArray.push(rowData);
			});

			var totalColumns = 1 + allMonthYears.length ;

			reprtHeaderColumnArray.push("<th style='text-align: left;'>" + "Time :" + time + "</th>");
			reprtHeaderColumnArray.push(`<th colspan='${totalColumns}' style='text-align: center; font-size: 14px;'>NEW ALL BRANCH WISE COLLECTION SUMMARY REPORT</th>`);
			reprtHeaderColumnArray.push("<th style='width: 9%;' class='textAlignCenter'>" + fromDate + "---" + toDate + "</th>");

			footerArray.push('<tr><th></th><th style="font-size: 13px;">Total</th>');
			var grandTotal = 0;
		
			allMonthYears.forEach(monthYear => {
				var columnTotal = columnTotals[monthYear].toFixed(2);
				footerArray.push('<th style="text-align: right; font-size: 13px;">' + columnTotal + '</th>');
				grandTotal += parseFloat(columnTotal);
			});
		
			footerArray.push('<th style="text-align: right; font-size: 13px;">' + grandTotal.toFixed(2) + '</th></tr>');

			$('#summarytable thead').append('<tr class="info">' + reprtHeaderColumnArray.join(' ') + '</tr>');
			$('#summarytable thead').append('<tr>' + headerArray.join('') + '</tr>');
			$('#summarytable tbody').append(columnArray.join(''));
			$('#summarytable tfoot').append(footerArray.join(''));

			$('#summarytable').css('display', 'table');
			
			_this.setDataForPrint(response);
		}, setReportDetailMonthWise : function(response){
			$('#branchWisePanel').removeClass('hide');

			if(response.CorporateAccount != undefined && response.CorporateAccount.length > 0)
				slickGridWrapper2.setGrid(response);
		},setSelectType : function(){

			_this.setSelectTypeAutocompleteInstance();
			
			var autoSelectType = $("#searchTypeEle").getInstance();
			
			let SelectTYPE = [
				{ "selectTypeId":1, "selectTypeName": "DETAILS" },
				{ "selectTypeId":2, "selectTypeName": "SUMMARY" },
			]
			
			$( autoSelectType ).each(function() {
				this.option.source = SelectTYPE;
			})
		},setSelectTypeAutocompleteInstance : function() {
			var autoSelectTypeName 			= new Object();
			autoSelectTypeName.primary_key 	= 'selectTypeId';
			autoSelectTypeName.field 		= 'selectTypeName';

			$("#searchTypeEle").autocompleteCustom(autoSelectTypeName)
		}, dataFrequencyInputBox : function (DataFrequencyList) {
			let autoBillSelectionTypeName = new Object();
			autoBillSelectionTypeName.primary_key = 'dataFrequencyConstantId';
			autoBillSelectionTypeName.field = 'value';

			$("#dataFrequencyEle").autocompleteCustom(autoBillSelectionTypeName)
			let autoPaymentType = $("#dataFrequencyEle").getInstance();

			$(autoPaymentType).each(function () {
				this.option.source = DataFrequencyList;
			});
		}
	});
});

function getMonthName(monthNumber) {
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return monthNames[monthNumber - 1];
}

