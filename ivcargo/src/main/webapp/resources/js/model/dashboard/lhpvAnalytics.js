let resultObject = null;
let thisMonthOrLastMonth = false;
let selectedDateRangeLabel = null;
let myChart = null;

define([
	PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js',
	'moment',
	'selectizewrapper',
	'JsonUtility',
	'messageUtility',
	'autocomplete',
	'autocompleteWrapper',
	'nodvalidation',
	PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
	'focusnavigation',
	'daterangepicker',
	PROJECT_IVUIRESOURCES + '/resources/js/datepicker/datepickerwrapper.js'
], function(Selection, moment) {
	'use strict';

	let jsonObject = new Object();
	let myNod;
	let _this = '';

	return Marionette.LayoutView.extend({
		initialize: function() {
			_this = this;
		}, render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/dashboard/getLhpvAnalyticsElementConfiguration.do?', _this.getElementConfigDetails, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, getElementConfigDetails: function(response) {
			let loadelement = new Array();
			let baseHtml = new $.Deferred();
			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/dashboard/lhpvAnalytics.html", function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();

				let keyObject = Object.keys(response);
				
				for (const element of keyObject) {
					if (response[element])
						$("*[data-attribute=" + element + "]").removeClass("hide");
				}

				// Initialize Bootstrap components
				_this.initializeBootstrapComponents();

				let elementConfiguration = new Object();
				elementConfiguration.regionElement = $('#regionEle');
				elementConfiguration.subregionElement = $('#subRegionEle');
				elementConfiguration.branchElement = $('#branchEle');
				elementConfiguration.dateElement = $("#dateEle");

				response.elementConfiguration = elementConfiguration;
				response.sourceAreaSelection = true;
				response.isCalenderSelection = true;

				response.showMonthWiseDateSelection = true;
				response.lastFinancialOneYear = true;
				response.isOneYearCalenderSelection = true;
				response.isTwoYearCalenderSelection = true;
				response.isCurrentYearCalenderSelection = true;

				response.minDate = moment("2018-04-01", "YYYY-MM-DD");
				response.maxDate = moment().subtract(1, 'day');
				response.monthLimit = 24;
				response.startDate = moment().subtract(1, 'day');

				// Set up autocomplete components
				_this.setupAutocompleteComponents(response);

				// Let selectoption.js handle ALL selection logic including date picker
				Selection.setSelectionToGetData(response);
				selectedDateRangeLabel = "Choose Date";
				_this.adjustDataFrequencyBasedOnRange();
				
				// Date change handler - just update summary, no need to reconfigure
				$("#dateEle").on("change", function() {
					const selectedLabel = selectedDateRangeLabel;
					if (!selectedLabel) return;
					
					const today = new Date();
					const isAfterMarch = (today.getMonth() + 1) >= 4;
					const currentFYStartYear = isAfterMarch ? today.getFullYear() : today.getFullYear() - 1;

					// Helper: pad 0 to single-digit numbers
					const pad = n => n < 10 ? '0' + n : n;

					// Helper: format date as DD-MM-YYYY
					const formatDate = date => `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;

					// Yesterday’s date
					const yesterday = new Date(today);
					yesterday.setDate(today.getDate() - 1);
					const endDateStr = formatDate(yesterday);

					let startDateStr = null;

					switch (selectedLabel) {
						case "This Month":
							const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
							startDateStr = formatDate(startOfMonth);
							break;

						case "This Year":
							startDateStr = `01-04-${currentFYStartYear}`;
							break;

						case "Last Financial Year":
							startDateStr = `01-04-${currentFYStartYear - 1}`;
							// Overwrite end date for full last FY
							const endFY = new Date(currentFYStartYear, 2, 31); // 31 March of currentFYStartYear
							$("#dateEle").val(`${startDateStr} - ${formatDate(endFY)}`);
							$("#dateEle").attr('data-startdate', startDateStr);
							$("#dateEle").attr('data-enddate', formatDate(endFY));
							_this.adjustDataFrequencyBasedOnRange();
							return;

						case "Last Two Year":
							startDateStr = `01-04-${currentFYStartYear - 1}`;
							break;

						case "Last Three Year":
							startDateStr = `01-04-${currentFYStartYear - 2}`;
							break;

						case "Last Four Year":
							startDateStr = `01-04-${currentFYStartYear - 3}`;
							break;

						case "Last Five Year":
							startDateStr = `01-04-${currentFYStartYear - 4}`;
							break;

						// No action for "Last Month" or unknown labels
						default:
							_this.adjustDataFrequencyBasedOnRange();
							return;
					}

					// Final assignment
					$("#dateEle").val(`${startDateStr} - ${endDateStr}`);
					$("#dateEle").attr('data-startdate', startDateStr);
					$("#dateEle").attr('data-enddate', endDateStr);

					_this.adjustDataFrequencyBasedOnRange();
				});

				$('.ranges li').each(function() {
					$(this).click(function() {
						selectedDateRangeLabel = $(this).text().trim();
					});
				});

				// Setup validation
				myNod = Selection.setNodElementForValidation(response);

				myNod.add({
					selector: '#dataTypeEle',
					validate: 'validateAutocomplete:#dataTypeEle_primary_key',
					errorMessage: 'Select Data Type!'
				});

				myNod.add({
					selector: '#dataFrequencyEle',
					validate: 'validateAutocomplete:#dataFrequencyEle_primary_key',
					errorMessage: 'Select Data Frequency!'
				});

				myNod.add({
					selector: '#chartTypeEle',
					validate: 'validateAutocomplete:#chartTypeEle_primary_key',
					errorMessage: 'Select Chart Type!'
				});

				myNod.add({
					selector: '#vehicleNumberEle',
					validate: 'validateAutocomplete:#vehicleNumberEle',
					errorMessage: 'Select Vehicle Number!'
				});

				myNod.add({
					selector: '#vehicleOwnerTypeEle',
					validate: 'validateAutocomplete:#vehicleOwnerTypeEle_primary_key',
					errorMessage: 'Select Owner Type!'
				});

				_this.setupEventHandlers();

				hideLayer();
			});
		}, setVehicleNumberSeletion: function() {
			let jsonArray = new Array();
			jsonArray.push($("#vehicleNumberEle"));
			Selection.resetAutcomplete(jsonArray);

			let jsonObject = new Object();
			jsonObject.vehicleOwner = $("#" + $(this).attr("id") + "_primary_key").val();
			jsonObject.viewAll = true;
			getJSON(jsonObject, WEB_SERVICE_URL + '/autoCompleteWS/getVehicleNumberAutocomplete.do?', _this.setVehicleNumber, EXECUTE_WITHOUT_ERROR);
		}, setVehicleNumber: function(response) {
			if (!response || !response.result) return;

			let vehicleNumber = $($("#vehicleNumberEle")).getInstance();
			
			const vehicleAll = response.result.find(
				item => item.vehicleNumberMasterId === -1
			);
			
			if (Number($("#vehicleOwnerTypeEle_primary_key").val()) === -1 && vehicleAll) {
				$(vehicleNumber).each(function() {
					this.option.source = [vehicleAll];
				});
				
				$("#vehicleNumberEle_primary_key").val(vehicleAll.vehicleNumberMasterId);
				$("#vehicleNumberEle").val(vehicleAll.vehicleNumber);
			} else {
				$(vehicleNumber).each(function() {
					this.option.source = response.result;
				});
			}
		}, setVehicleOwnerSeletion: function() {
			let vehicleOwnerTypesAutoComplete = new Object();
			vehicleOwnerTypesAutoComplete.primary_key = 'vehicleOwnerId';
			vehicleOwnerTypesAutoComplete.field = 'vehicleOwnerName';
			vehicleOwnerTypesAutoComplete.callBack = _this.setVehicleNumberSeletion;
			$("#vehicleOwnerTypeEle").autocompleteCustom(vehicleOwnerTypesAutoComplete);
			let jsonObject = new Object();
			jsonObject.viewAll = true;
			getJSON(jsonObject, WEB_SERVICE_URL + '/autoCompleteWS/getVehicleOwnerType.do?', _this.setVehicleOwner, EXECUTE_WITHOUT_ERROR);
		}, setVehicleOwner: function(response) {
			let vehicleNumber = $($("#vehicleOwnerTypeEle")).getInstance();

			$(vehicleNumber).each(function() {
				this.option.source = response.result;
			});
		}, setupAutocompleteComponents: function(response) {
			_this.setVehicleOwnerSeletion();

			let vehicleNumberAutoComplete = new Object();
			vehicleNumberAutoComplete.primary_key = 'vehicleNumberMasterId';
			vehicleNumberAutoComplete.field = 'vehicleNumber';
			$("#vehicleNumberEle").autocompleteCustom(vehicleNumberAutoComplete);

			let dataTypeAutoComplete = new Object();
			dataTypeAutoComplete.primary_key = 'dataTypeConstantId';
			dataTypeAutoComplete.field = 'value';
			$("#dataTypeEle").autocompleteCustom(dataTypeAutoComplete);
			
			$($("#dataTypeEle")).getInstance().each(function() {
				this.option.source = response.dataTypeList;
			});

			let dataFrequencyAutoComplete = new Object();
			dataFrequencyAutoComplete.primary_key = 'dataFrequencyConstantId';
			dataFrequencyAutoComplete.field = 'value';
			$("#dataFrequencyEle").autocompleteCustom(dataFrequencyAutoComplete);
			
			$($("#dataFrequencyEle")).getInstance().each(function() {
				this.option.source = response.dataFrequencyList;
			});

			let chartTypeAutoComplete = new Object();
			chartTypeAutoComplete.primary_key = 'key';
			chartTypeAutoComplete.field = 'value';
			$("#chartTypeEle").autocompleteCustom(chartTypeAutoComplete);
			
			$($("#chartTypeEle")).getInstance().each(function() {
				this.option.source = response.chartSelection;
			});
		}, initializeBootstrapComponents: function() {
			let tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
			
			tooltipTriggerList.map(function(tooltipTriggerEl) {
				return new bootstrap.Tooltip(tooltipTriggerEl);
			});

			let popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
			
			popoverTriggerList.map(function(popoverTriggerEl) {
				return new bootstrap.Popover(popoverTriggerEl);
			});
		}, setupEventHandlers: function() {
			$("#searchBtn").click(function() {
				myNod.performCheck();
				if (myNod.areAll('valid') && _this.validateDateRange()) {
					_this.onSubmit(_this);
				}
			});

			$("#exportPdfBtn").click(function() {
				_this.exportToPDF();
			});

			$("#printChartBtn").click(function() {
				_this.printChart();
			});
		}, updateSummary: function() {
			$("#summaryRegion").text($("#regionEle").val() || "ALL");
			$("#summaryBranch").text($("#branchEle").val() || "ALL");
			$("#summaryPeriod").text($("#dateEle").val() || "-");
			$("#summaryDataType").text($("#dataTypeEle").val() || "-");
		}, onSubmit: function() {
			showLayer();

			jsonObject = Selection.getElementData();

			jsonObject["dataType"] = $('#dataTypeEle_primary_key').val();
			jsonObject["dataFrequency"] = $('#dataFrequencyEle_primary_key').val();

			if (thisMonthOrLastMonth)
				jsonObject["dataFrequency"] = "-1";

			resultObject = jsonObject;
			_this.updateSummary();
			$("#chartSection").removeClass("hide");
			getJSON(jsonObject, IVNEXT_URL + '/lhpvAnalyticsWS/getChartData', _this.processChartData, EXECUTE_WITH_ERROR);
		}, processChartData: function(response) {
			if (response.message != undefined) {
				$('#chartSection').addClass('hide');
				hideLayer();
				return;
			}

			// Extract the actual data from response.data
			const chartData = response.data || {};

			_this.createChart(chartData);

			hideLayer();
		}, createChart: function(response) {
			if (myChart) {
				myChart.destroy();
			}
			
			Chart.register(ChartDataLabels);
			const dataFrequency = resultObject.dataFrequency;  // "3","4","5","6"
			const dataType = resultObject.dataType;            // "1"=amount, "2"=weight
			const chartType = Number($('#chartTypeEle_primary_key').val()) === 1 ? 'bar' : 'line';

			// Get prepared data including raw periods
			const { labels, datasets, rawPeriods } = _this.prepareChartData(response);

			// Helper: format main value with unit (KG for weight, ₹ for amount)
			const formatMainValue = (val) => {
				if (dataType === "1") return '₹' + _this.formatExactNumber(val);
				else return _this.formatExactNumber(val) + ' KG';   // val is in KG
			};

			// Helper: rate per ton
			const getRatePerTon = (amount, weight) => {
				if (!weight || weight <= 0) return 'no weight';
				return '₹' + _this.formatExactNumber(amount / (weight / 1000)) + '/T';
			};

			// Helper: percentage growth
			const formatGrowth = (current, previous) => {
				if (previous === undefined || previous === null || previous === 0) return 'N/A';
				const growth = ((current - previous) / previous) * 100;
				return growth.toFixed(1) + '%';
			};

			// Helper: yearly average for sub-year frequencies
			const getYearlyAverage = (yearIdx) => {
				const yearPeriods = rawPeriods[yearIdx];
				if (!yearPeriods || yearPeriods.length === 0) return 'N/A';
				let total = 0;
				
				yearPeriods.forEach(p => {
					total += (dataType === "1" ? p.amount : p.weight);
				});
				
				const avg = total / yearPeriods.length;
				return formatMainValue(avg);
			};

			// Create canvas
			const canvas = document.createElement('canvas');
			canvas.id = 'lhpvChart';
			canvas.width = 800;
			canvas.height = 400;
			$("#mychartmis").empty().append(canvas);
			const ctx = canvas.getContext('2d');

			myChart = new Chart(ctx, {
				type: chartType,
				data: { labels, datasets },
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						title: {
							display: true,
							text: `LHPV Analytics - ${$("#dateEle").val()}`,
							font: { size: 16, weight: 'bold' }
						},
						legend: { position: 'top' },
						tooltip: {
							mode: 'index',
							intersect: false,
							titleFont: { size: 20, weight: 'bold' },
							bodyFont: { size: 18 },
							footerFont: { size: 12 },
							padding: 20,
							caretSize: 8,
							callbacks: {
								label: function(context) {
									const datasetLabel = context.dataset.label || '';
									const yearIdx = context.datasetIndex;
									const periodIdx = context.dataIndex;
									const raw = rawPeriods[yearIdx]?.[periodIdx];

									if (!raw) return datasetLabel;

									const mainValue = dataType === "1" ? raw.amount : raw.weight;
									const formattedMain = formatMainValue(mainValue);
									const lines = [`${datasetLabel}: ${formattedMain}`];

									// Rate per ton
									lines.push(`Rate: ${getRatePerTon(raw.amount, raw.weight)}`);

									// Period-over-period growth (within same year)
									if (periodIdx > 0) {
										const prevRaw = rawPeriods[yearIdx][periodIdx - 1];
										const prevVal = dataType === "1" ? prevRaw.amount : prevRaw.weight;
										const growth = formatGrowth(mainValue, prevVal);
										lines.push(`PoP Growth: ${growth}`);
									}

									// Year-over-year growth (same period previous year)
									if (yearIdx > 0 && rawPeriods[yearIdx - 1]?.length > periodIdx) {
										const prevYearRaw = rawPeriods[yearIdx - 1][periodIdx];
										const prevYearVal = dataType === "1" ? prevYearRaw.amount : prevYearRaw.weight;
										const yoyGrowth = formatGrowth(mainValue, prevYearVal);
										lines.push(`YoY Growth: ${yoyGrowth}`);
									}

									// Yearly average (only for sub-year frequencies)
									if (dataFrequency !== "6") { // not yearly
										const yearlyAvg = getYearlyAverage(yearIdx);
										lines.push(`Yearly Avg: ${yearlyAvg}`);
									}

									return lines;
								}
							}
						},
						datalabels: {
							display: 'auto',
							color: '#444',
							anchor: 'end',
							align: function(context) {
							    const datasetsCount = context.chart.data.datasets.length;
							    const dataLength = context.dataset.data.length;

							    // Edge points: horizontal alignment inward
							    if (context.dataIndex === 0) return 'right';
							    if (context.dataIndex === dataLength - 1) return 'left';

							    // Single dataset → use a fixed vertical alignment
							    if (datasetsCount === 1) {
							        return 'top';   // you can change to 'bottom' or 'center' if desired
							    }

							    // Multiple datasets → alternate to avoid overlap
							    return context.datasetIndex % 2 === 0 ? 'bottom' : 'top';
							},
							offset: 20,
							formatter: function(value, context) {
								// Show the raw value (formatted) on the bar/point
								if (value === null || value === undefined) return '';
								return _this.formatExactNumber(value);
							},
							font: {
								weight: 'bold',
								size: 13
							}
						}
					},
					scales: {
						x: {
							title: {
								display: true,
								text: _this.getXAxisLabel(),
								font: { size: 14, weight: 'bold' }
							}, ticks: {
								font: { weight: 'bold' }
							}
						},
						y: {
							beginAtZero: true,
							title: {
								display: true,
								text: _this.getYAxisLabel(),
								font: { size: 14, weight: 'bold' }
							},
							ticks: {
								font: { weight: 'bold' },
								callback: function(value) {
									return _this.formatExactNumber(value);
								}
							}
						}
					}
				}
			});
		}, calToFinMonth: function(calMonth) {
		    if (calMonth >= 4) return calMonth - 3;      // Apr(4)→1, …, Dec(12)→9
		    else return calMonth + 9;                     // Jan(1)→10, Feb(2)→11, Mar(3)→12
		}, finToCalMonth: function(finMonth) {
		    if (finMonth <= 9) return finMonth + 3;       // 1→4, 2→5, …, 9→12
		    else return finMonth - 9;                      // 10→1, 11→2, 12→3
		}, calToFinQuarter: function(calMonth) {
		    if (calMonth >= 4 && calMonth <= 6) return 1;
		    if (calMonth >= 7 && calMonth <= 9) return 2;
		    if (calMonth >= 10 && calMonth <= 12) return 3;
		    return 4; // Jan‑Mar
		}, calToFinHalf: function(calMonth) {
		    return (calMonth >= 4 && calMonth <= 9) ? 1 : 2;
		}, prepareChartData: function(response) {
		    const years = Object.keys(response).sort();
		    const dataFrequency = resultObject.dataFrequency;
		    const dataType = resultObject.dataType;
		    const fromDateStr = resultObject.fromDate;
		    const toDateStr = resultObject.toDate;

		    const startMoment = moment(fromDateStr, 'DD-MM-YYYY');
		    const endMoment = moment(toDateStr, 'DD-MM-YYYY');

		    // Use the helper methods from the view
		    const calToFinMonth = _this.calToFinMonth;
		    const finToCalMonth = _this.finToCalMonth;
		    const calToFinQuarter = _this.calToFinQuarter;
		    const calToFinHalf = _this.calToFinHalf;

		    // ----- Determine common financial periods based on the date range -----
		    let commonPeriods = [];
		    if (dataFrequency === "3" || dataFrequency === "4" || dataFrequency === "5") {
		        // Helper to get financial year from a date
		        const getFY = (date) => {
		            const month = date.month() + 1;
		            return month >= 4 ? date.year() : date.year() - 1;
		        };

		        const startFY = getFY(startMoment);
		        const endFY = getFY(endMoment);
		        const financialYears = [];
		        for (let y = startFY; y <= endFY; y++) {
		            financialYears.push(y);
		        }

		        // For each financial year, compute periods that fall within the overlap
		        // of the date range with that FY
		        const periodsPerYear = [];
		        financialYears.forEach(fy => {
		            const fyStart = moment([fy, 3, 1]);          // April 1 of fy
		            const fyEnd = moment([fy + 1, 2, 31]);       // March 31 of next year
		            const overlapStart = startMoment.isAfter(fyStart) ? startMoment : fyStart;
		            const overlapEnd = endMoment.isBefore(fyEnd) ? endMoment : fyEnd;

		            let periods = new Set();
		            let current = overlapStart.clone().startOf('month');
		            while (current.isSameOrBefore(overlapEnd)) {
		                const calMonth = current.month() + 1;
		                if (dataFrequency === "3") {
		                    periods.add(calToFinMonth(calMonth));
		                } else if (dataFrequency === "4") {
		                    periods.add(calToFinQuarter(calMonth));
		                } else if (dataFrequency === "5") {
		                    periods.add(calToFinHalf(calMonth));
		                }
		                current.add(1, 'month');
		            }
		            periodsPerYear.push(periods);
		        });

		        // Intersect the sets across all years
		        if (periodsPerYear.length > 0) {
		            let commonSet = periodsPerYear[0];
		            for (let i = 1; i < periodsPerYear.length; i++) {
		                commonSet = new Set([...commonSet].filter(x => periodsPerYear[i].has(x)));
		            }
		            commonPeriods = Array.from(commonSet).sort((a, b) => a - b);
		        }
		    } // else yearly: commonPeriods remains empty

		    // ----- Generate labels based on common periods -----
		    let labels = [];
		    if (dataFrequency === "3") {
		        const finMonthNames = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
		        labels = commonPeriods.map(fm => finMonthNames[fm - 1]);
		    } else if (dataFrequency === "4") {
		        labels = commonPeriods.map(q => `Q${q}`);
		    } else if (dataFrequency === "5") {
		        labels = commonPeriods.map(h => `H${h}`);
		    } else {
		        // Yearly: labels are the financial year strings
		        labels = years;
		        commonPeriods = years.map((_, idx) => idx); // dummy, not used for data extraction
		    }

		    // ----- Build datasets using only common periods -----
		    const colors = [
		        'rgba(54, 162, 235, 0.7)',
		        'rgba(255, 99, 132, 0.7)',
		        'rgba(75, 192, 192, 0.7)',
		        'rgba(255, 206, 86, 0.7)',
		        'rgba(153, 102, 255, 0.7)',
		        'rgba(255, 159, 64, 0.7)'
		    ];

		    let datasets = [];
		    let rawPeriods = [];

		    years.forEach((year, yearIdx) => {
		        const yearData = response[year];
		        const dataValues = [];
		        const yearRaw = [];

		        if (dataFrequency === "3") {
		            commonPeriods.forEach(finMonth => {
		                const calMonth = finToCalMonth(finMonth);
		                const monthRecords = yearData.filter(d => d.month === calMonth);
		                const amount = monthRecords.reduce((sum, obj) => sum + (obj.totalAmount || 0), 0);
		                const weight = monthRecords.reduce((sum, obj) => sum + (obj.totalWeight || 0), 0);
		                yearRaw.push({ amount, weight });
		                dataValues.push(dataType === "1" ? amount : weight);
		            });

		        } else if (dataFrequency === "4") {
		            commonPeriods.forEach(quarterNum => {
		                const quarterRecords = yearData.filter(d => d.quarter === quarterNum);
		                const amount = quarterRecords.reduce((sum, obj) => sum + (obj.totalAmount || 0), 0);
		                const weight = quarterRecords.reduce((sum, obj) => sum + (obj.totalWeight || 0), 0);
		                yearRaw.push({ amount, weight });
		                dataValues.push(dataType === "1" ? amount : weight);
		            });

		        } else if (dataFrequency === "5") {
		            commonPeriods.forEach(halfNum => {
		                const halfRecords = yearData.filter(d => d.halfYear === halfNum);
		                const amount = halfRecords.reduce((sum, obj) => sum + (obj.totalAmount || 0), 0);
		                const weight = halfRecords.reduce((sum, obj) => sum + (obj.totalWeight || 0), 0);
		                yearRaw.push({ amount, weight });
		                dataValues.push(dataType === "1" ? amount : weight);
		            });

		        } else { // Yearly
		            const amount = yearData.reduce((sum, obj) => sum + (obj.totalAmount || 0), 0);
		            const weight = yearData.reduce((sum, obj) => sum + (obj.totalWeight || 0), 0);
		            yearRaw.push({ amount, weight });
		            dataValues.push(dataType === "1" ? amount : weight);
		        }

		        rawPeriods.push(yearRaw);
		        datasets.push({
		            label: year,
		            data: dataValues,
		            backgroundColor: colors[yearIdx % colors.length].replace('0.7', '0.5'),
		            borderColor: colors[yearIdx % colors.length],
		            borderWidth: 2,
		            fill: true,
		            tension: 0.1
		        });
		    });

		    return { labels, datasets, rawPeriods };
		}, getCommonPeriodsFromRange: function(startMoment, endMoment, dataFrequency) {
			if (dataFrequency === "6") return []; // yearly – handled separately
			const getFY = (date) => (date.month() + 1 >= 4) ? date.year() : date.year() - 1;
			const startFY = getFY(startMoment);
			const endFY = getFY(endMoment);
			const financialYears = [];
			for (let y = startFY; y <= endFY; y++) financialYears.push(y);

			const periodsPerYear = [];
			financialYears.forEach(fy => {
				const fyStart = moment([fy, 3, 1]);          // April 1 of fy
				const fyEnd = moment([fy + 1, 2, 31]);     // March 31 next year
				const overlapStart = startMoment.isAfter(fyStart) ? startMoment : fyStart;
				const overlapEnd = endMoment.isBefore(fyEnd) ? endMoment : fyEnd;

				const periods = new Set();
				let current = overlapStart.clone().startOf('month');
				while (current.isSameOrBefore(overlapEnd)) {
					const calMonth = current.month() + 1;
					if (dataFrequency === "3") periods.add(this.calToFinMonth(calMonth));
					else if (dataFrequency === "4") periods.add(this.calToFinQuarter(calMonth));
					else if (dataFrequency === "5") periods.add(this.calToFinHalf(calMonth));
					current.add(1, 'month');
				}
				periodsPerYear.push(periods);
			});

			if (periodsPerYear.length === 0) return [];
			let common = periodsPerYear[0];
			for (let i = 1; i < periodsPerYear.length; i++) {
				common = new Set([...common].filter(x => periodsPerYear[i].has(x)));
			}
			return Array.from(common).sort((a, b) => a - b);
		}, getChartValue: function(data, dataType) {
			if (!data) return 0;

			switch (dataType) {
				case "1": return parseFloat(data.totalAmount || 0);
				case "2": return parseFloat(data.totalWeight || 0);
				default: return parseFloat(data.totalAmount || 0);
			}
		}, getXAxisLabel: function() {
			const frequency = resultObject.dataFrequency;
			switch (frequency) {
				case "1": return "Days";
				case "2": return "Weeks";
				case "3": return "Months";
				case "4": return "Quarters";
				case "5": return "Half Years";
				case "6": return "Years";
				default: return "Period";
			}
		}, getYAxisLabel: function() {
			const dataType = resultObject.dataType;
			switch (dataType) {
				case "1": return "Amount (₹)";
				case "2": return "Weight (KG)";
				default: return "Value";
			}
		}, formatExactNumber: function(num) {
			if (num === null || num === undefined) return '0';
			num = typeof num === 'string' ? parseFloat(num) : num;
			if (isNaN(num)) return '0';
			// Use Indian numbering with commas, keep up to 2 decimals
			return num.toLocaleString('en-IN', {
				minimumFractionDigits: 0,
				maximumFractionDigits: 2
			});
		}, validateDateRange: function() {
			const startDateStr = $("#dateEle").attr('data-startdate');
			const endDateStr = $("#dateEle").attr('data-enddate');
			if (!startDateStr || !endDateStr) return false;

			const start = moment(startDateStr, 'DD-MM-YYYY');
			const end = moment(endDateStr, 'DD-MM-YYYY');
			if (!start.isValid() || !end.isValid()) return false;

			// Maximum allowed end date = start + 2 years - 1 day
			const maxEnd = start.clone().add(2, 'years').subtract(1, 'day');
			if (end.isAfter(maxEnd)) {
				showAlertMessage('error', 'Date range cannot exceed 2 years. Adjusted to maximum allowed.');
				return false;
			}
			const freq = $('#dataFrequencyEle_primary_key').val();
			if (freq === "6") return true;  // yearly always valid
			const common = this.getCommonPeriodsFromRange(start, end, freq);
			if (common.length === 0) {
				showMessage('error', 'The selected date range does not contain any common period across all financial years. Please choose a different range.');
				return false;
			}
			return true;
		}, adjustDataFrequencyBasedOnRange: function() {
			const startDateStr = $("#dateEle").attr('data-startdate');
			const endDateStr = $("#dateEle").attr('data-enddate');
			if (!startDateStr || !endDateStr) return;

			const start = moment(startDateStr, 'DD-MM-YYYY');
			const end = moment(endDateStr, 'DD-MM-YYYY');
			if (!start.isValid() || !end.isValid()) return;

			// ----- Option A: use actual day difference (more than 365 days = show) -----
			const daysDiff = end.diff(start, 'days');
			const moreThanOneYear = daysDiff >= 364;  // or >= 365? adjust as needed
			const $dataFreqDiv = $('div[data-attribute="dataFrequency"]').first();
			const $dataFreqInput = $('#dataFrequencyEle');
			const $dataFreqPrimary = $('#dataFrequencyEle_primary_key');

			if (moreThanOneYear) {
				// Range spans more than one year → show dropdown
				$dataFreqDiv.show();
				$dataFreqPrimary.val("");
				$dataFreqInput.val("");
			} else {
				// One year or less → hide and force Monthly
				$dataFreqDiv.hide();
				$dataFreqPrimary.val("3");
			}
		}, exportToPDF: function() {
			showLayer();

			const chartSection = document.getElementById('chartSection');
			if (!chartSection) {
				hideLayer();
				showMessage('error', 'No chart to export');
				return;
			}

			html2canvas(chartSection, {
				scale: 2,
				backgroundColor: '#ffffff',
				logging: false,
				allowTaint: false,
				useCORS: true
			}).then((canvas) => {
				const imgData = canvas.toDataURL('image/png');

				// ----- Robust jsPDF constructor detection -----
				let jsPDFConstructor;
				if (window.jspdf && typeof window.jspdf.jsPDF === 'function') {
					// jsPDF 2.x UMD: window.jspdf.jsPDF
					jsPDFConstructor = window.jspdf.jsPDF;
				} else if (typeof window.jsPDF === 'function') {
					// Older versions: window.jsPDF
					jsPDFConstructor = window.jsPDF;
				} else if (typeof window.jspdf === 'function') {
					// Some builds attach constructor directly
					jsPDFConstructor = window.jspdf;
				} else {
					hideLayer();
					showMessage('error', 'jsPDF library not loaded');
					return;
				}
				// ----------------------------------------------

				const pdf = new jsPDFConstructor({
					orientation: 'landscape',
					unit: 'mm',
					format: 'a4'
				});

				// Safely obtain page width and height
				let pageWidth, pageHeight;
				if (pdf.internal && pdf.internal.pageSize) {
					if (typeof pdf.internal.pageSize.getWidth === 'function') {
						pageWidth = pdf.internal.pageSize.getWidth();
						pageHeight = pdf.internal.pageSize.getHeight();
					} else {
						pageWidth = pdf.internal.pageSize.width;
						pageHeight = pdf.internal.pageSize.height;
					}
				} else {
					// Fallback to standard A4 landscape dimensions
					pageWidth = 297;
					pageHeight = 210;
				}

				// Calculate height to maintain aspect ratio
				const pdfHeight = (canvas.height * pageWidth) / canvas.width;

				pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pdfHeight, undefined, 'FAST');
				pdf.save(`LHPV_Analytics_${moment().format('YYYY-MM-DD')}.pdf`);

				hideLayer();
				showMessage('success', 'PDF file downloaded successfully!');
			}).catch((error) => {
				console.error('html2canvas error:', error);
				hideLayer();
				showMessage('error', 'Failed to generate PDF');
			});
		}, printChart: function() {
			// Get chart canvas
			const canvas = document.querySelector('#lhpvChart');
			if (!canvas) {
				showMessage('error', 'No chart to print');
				return;
			}

			// Gather summary information from the existing summary spans
			const region = $('#summaryRegion').text() || 'ALL';
			const branch = $('#summaryBranch').text() || 'ALL';
			const period = $('#summaryPeriod').text() || '-';
			const dataType = $('#summaryDataType').text() || '-';
			const dateRange = $("#dateEle").val() || '';

			const dataURL = canvas.toDataURL(); // PNG by default

			const printWindow = window.open('', '_blank');
			const isChrome = Boolean(printWindow.chrome);

			// Build print document with summary and chart image
			printWindow.document.write('<html><head><title>LHPV Analytics Report</title>');
			printWindow.document.write(`
		        <style>
		            body { font-family: Arial, sans-serif; padding: 20px; }
		            .print-summary {
		                display: grid;
		                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		                gap: 12px;
		                margin-bottom: 30px;
		                background: #f8f9fa;
		                padding: 15px;
		                border-radius: 8px;
		                border: 1px solid #dee2e6;
		            }
		            .print-summary-item {
		                font-size: 14px;
		            }
		            .print-summary-item strong {
		                color: #495057;
		                margin-right: 8px;
		            }
		            img { max-width: 100%; height: auto; display: block; margin: 0 auto; }
		            h2 { text-align: center; color: #0d6efd; margin-bottom: 20px; }
		        </style>
		    `);
			printWindow.document.write('</head><body>');

			printWindow.document.write('<h2>LHPV Analytics Report</h2>');

			// Summary block
			printWindow.document.write('<div class="print-summary">');
			printWindow.document.write(`<div class="print-summary-item"><strong>Region:</strong> ${region}</div>`);
			printWindow.document.write(`<div class="print-summary-item"><strong>Branch:</strong> ${branch}</div>`);
			printWindow.document.write(`<div class="print-summary-item"><strong>Period:</strong> ${period}</div>`);
			printWindow.document.write(`<div class="print-summary-item"><strong>Data Type:</strong> ${dataType}</div>`);
			printWindow.document.write(`<div class="print-summary-item"><strong>Date Range:</strong> ${dateRange}</div>`);
			printWindow.document.write('</div>');

			// Chart image
			printWindow.document.write(`<img src="${dataURL}" />`);

			printWindow.document.write('</body></html>');
			printWindow.document.close();

			// Trigger print after content loads
			if (isChrome) {
				printWindow.onload = function() {
					printWindow.focus();
					printWindow.print();
					printWindow.close();
				};
			} else {
				printWindow.focus();
				printWindow.print();
				printWindow.close();
			}
		}
	});
});