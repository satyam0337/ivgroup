define([
	'moment',
	'daterangepicker',
], 
	function (moment) {
		$.fn.DatePickerCus = function(options) {

		var element 			= this;
		var defaultOPtions 		= new Object();
		var defaultDateRange	= true;
		var showDefaultDate		= false;
		let lastOneYearLable	= "Last One Year";
		
		if(typeof minDateFromProperty !== "undefined" && options.minDate == undefined)
			options.minDate	= minDateFromProperty; //calling from header.jsp

		if(options.showMonthWiseDateSelection != undefined && options.showMonthWiseDateSelection)
			defaultDateRange	= false;
		/*
			* Default Configuration
		*/
		var dateRange = new Object();
				
		if(defaultDateRange) {
			dateRange["Today"] 			= [moment(), moment()]
			dateRange["Yesterday"] 		= [moment().subtract(1, 'days'), moment().subtract(1, 'days')]
			dateRange["Last 7 Days"] 	= [moment().subtract(options.dataFromDRServer ? 7 : 6, 'days'), options.dataFromDRServer ? moment().subtract(1, 'days') : moment()]
			dateRange["Last 30 Days"] 	= [moment().subtract(29, 'days'), moment().subtract(1, 'days')]
			dateRange["This Month"] 	= [moment().startOf('month'), options.dataFromDRServer ? moment().subtract(1, 'days') : moment()]
			dateRange["Last Month"] 	= [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
		}
		
		if(options.showMonthWiseDateSelection != undefined && options.showMonthWiseDateSelection)
			dateRange["This Month"] = [moment().startOf('month'), moment()]
		
		if(options.showMonthWiseDateSelection != undefined && options.showMonthWiseDateSelection)
			dateRange["Last Month"] = [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]

		if(options.threeMonthDateRange != undefined && options.threeMonthDateRange)
			dateRange["Last 3 Month"] = [moment().subtract(3, 'month')]
		
		if(options.sixMonthDateRange != undefined && options.sixMonthDateRange)
			dateRange["Last 6 Month"] =  [moment().subtract(6, 'month')]
		
		if(options.ThisYearDateRange != undefined && options.ThisYearDateRange) {
			let thisYearStartVar = moment().startOf('year'); 
			let thisYearEnd = moment(thisYearStartVar).add(2, 'year').subtract(1, 'day'); 
			dateRange["This Year"] =  [thisYearStartVar, thisYearEnd];
		}
		
		if(options.lastFinancialOneYear != undefined && options.lastFinancialOneYear)
			lastOneYearLable	= "Last Financial Year";
			
		if(options.oneYearDateRange != undefined && options.oneYearDateRange)
			dateRange[lastOneYearLable] =  [moment().subtract(12, 'month')]
		
		if(options.twoYearDateRange != undefined && options.twoYearDateRange)
			dateRange["Last Two Year"] =  [moment().subtract(24, 'month')]

		if(options.threeYearDateRange != undefined && options.threeYearDateRange)
			dateRange["Last Three Year"] =  [moment().subtract(36, 'month')]

		if(options.fourYearDateRange != undefined && options.fourYearDateRange)
			dateRange["Last Four Year"] =  [moment().subtract(48, 'month')]
		
		if(options.fiveYearDateRange != undefined && options.fiveYearDateRange)
			dateRange["Last Five Year"] =  [moment().subtract(60, 'month')]
		
		if(options.dataFromDRServer) {
			showDefaultDate 	= true;
			options.maxDate		= moment().subtract(1, 'days')
			options.startDate 	= moment().subtract(1, 'days')
		}
		
		defaultOPtions.autoApply 		= options.autoApply != undefined ? options.autoApply : true;  
		defaultOPtions.showDateDropDown = options.showDateDropDown != undefined ? options.showDateDropDown : true;  
		defaultOPtions.dateFormat 		= options.dateFormat != undefined ? options.dateFormat : 'DD-MM-YYYY';
		defaultOPtions.dateRange 		= options.dateRange != undefined ? options.dateRange : dateRange;
		defaultOPtions.startDate 		= options.startDate != undefined ? options.startDate : moment();
		defaultOPtions.monthLimit 		= options.monthLimit != undefined ? options.monthLimit : 1;
		defaultOPtions.maxDate 			= options.maxDate != undefined ? options.maxDate : moment();
		defaultOPtions.minDate 			= options.minDate != undefined ? options.minDate : moment().subtract(2, 'year').startOf('year');
		defaultOPtions.endDate 			= options.endDate != undefined ? options.endDate : "";

		$(this).daterangepicker({
			"autoApply"		: defaultOPtions.autoApply,
			"showDropdowns"	: defaultOPtions.showDateDropDown,
			locale: {
				format: defaultOPtions.dateFormat,
				customRangeLabel : 'Choose Date'
			},
			ranges:defaultOPtions.dateRange,
				"startDate"	: defaultOPtions.startDate,
				"dateLimit"	: {
				"months"	: defaultOPtions.monthLimit
			},
			"maxDate"		: defaultOPtions.maxDate,
			"minDate"		: defaultOPtions.minDate,
		}, function(start, end, label) {
			//start date and end date also updates in library at line 439
			// this function is triggered when there is change on element
			element.attr('data-startdate', start.format(defaultOPtions.dateFormat));
			element.attr('data-enddate', end.format(defaultOPtions.dateFormat));
		});
		if(showDefaultDate){
			element.attr('data-startdate', moment().format(defaultOPtions.dateFormat));
			element.attr('data-enddate', moment().format(defaultOPtions.dateFormat));
			$("#dateEle").val(moment().format(defaultOPtions.dateFormat) + ' - ' + moment().format(defaultOPtions.dateFormat));
		}
	};
	
	$.fn.SingleDatePickerCus = function(options) {
		if(typeof minDateFromProperty !== "undefined" && options.minDate == undefined)
			options.minDate	= minDateFromProperty; //calling from header.jsp
		
		var element 		= this;
		var defaultOPtions 	= new Object();

		defaultOPtions.autoApply 		= options.autoApply != undefined ? options.autoApply : true;  
		defaultOPtions.showDateDropDown = options.showDateDropDown != undefined ? options.showDateDropDown : true;  
		defaultOPtions.dateFormat 		= options.dateFormat != undefined ? options.dateFormat : 'DD-MM-YYYY';
		defaultOPtions.startDate 		= options.startDate != undefined ? options.startDate : moment();
		defaultOPtions.monthLimit 		= options.monthLimit != undefined ? options.monthLimit : 1;
		defaultOPtions.dayLimit 		= options.dayLimit != undefined ? options.dayLimit : 1;
		defaultOPtions.maxDate 			= options.maxDate != undefined ? options.maxDate : moment();
		defaultOPtions.minDate 			= options.minDate != undefined ? options.minDate : moment().subtract(2, 'year').startOf('year');
		defaultOPtions.endDate 			= options.endDate != undefined ? options.endDate : "";

		$(this).daterangepicker({
			singleDatePicker: true,
			"autoApply"		: defaultOPtions.autoApply,
			"showDropdowns"	: defaultOPtions.showDateDropDown,
			locale: {
				format: defaultOPtions.dateFormat,
				customRangeLabel : 'Choose Date'
			},
			"startDate"		: defaultOPtions.startDate,
			"dateLimit"		: {
				"months"	: defaultOPtions.monthLimit
			},
			"maxDate"		: defaultOPtions.maxDate,
			"minDate"		: defaultOPtions.minDate,
		}, function(start, end, label) {
			//start date and end date also updates in library at line 439
			// this function is triggered when there is change on element
			element.attr('data-date', start.format(defaultOPtions.dateFormat));
		});
		//$(this).trigger('click');
	}
});