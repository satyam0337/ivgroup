/*
	This wrapper file is for JSP
	
	include files in jsp above this file
	
	/ivcargo/resources/css/datepicker/daterangepicker.css
	/ivcargo/resources/js/datepicker/moment.js
	/ivcargo/resources/js/datepicker/daterangepicker.js
*/
$(function() {
	$.fn.DatePickerCus = function(options) {
		let element 			= this;
		let defaultOPtions 		= new Object();
		let defaultDateRange	= true;
		
		if(typeof minDateFromProperty !== "undefined" && options.minDate == undefined)
			options.minDate	= minDateFromProperty; //calling from header.jsp

		if(options.showMonthWiseDateSelection != undefined && options.showMonthWiseDateSelection)
			defaultDateRange	= false;
		
		let dateRange 			= new Object();

		if(defaultDateRange) {
			dateRange["Today"] 			= [moment(), moment()]
			dateRange["Yesterday"] 		= [moment().subtract(1, 'days'), moment().subtract(1, 'days')]
			dateRange["Last 7 Days"] 	= [moment().subtract(7 , 'days'),  moment().subtract(1, 'days') ]
			dateRange["Last 30 Days"] 	= [moment().subtract(29, 'days'), moment().subtract(1, 'days')]
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
			
		if(options.oneYearDateRange != undefined && options.oneYearDateRange)
			dateRange["Last One Year"] =  [moment().subtract(12, 'month')]
		
		if(options.twoYearDateRange != undefined && options.twoYearDateRange)
			dateRange["Last Two Year"] =  [moment().subtract(24, 'month')]

		defaultOPtions.autoApply 		=  true;  
		defaultOPtions.showDateDropDown =  true;  
		defaultOPtions.dateFormat 		= 'DD-MM-YYYY';
		defaultOPtions.dateRange 		=  dateRange;
		defaultOPtions.startDate 		=  moment().subtract(1, 'days');
		defaultOPtions.monthLimit 		=  1;
		defaultOPtions.maxDate 			=  moment().subtract(1, 'days');
		defaultOPtions.minDate 			=  moment().subtract(2, 'year').startOf('year');
		defaultOPtions.endDate 			=  "";
		
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
			$('#fromDate').val(start.format(defaultOPtions.dateFormat));
			$('#toDate').val(end.format(defaultOPtions.dateFormat));
			element.attr('data-startdate', start.format(defaultOPtions.dateFormat));
			element.attr('data-enddate', end.format(defaultOPtions.dateFormat));
		});
		
		if($('#fromDate').val() != "null" ){
			$('#daterange').val($('#fromDate').val() +" - "+ $('#toDate').val());
		} else {
			$('#fromDate').val((moment()).format(defaultOPtions.dateFormat))
			$('#toDate').val((moment()).format(defaultOPtions.dateFormat))
			$('#daterange').val((moment()).format(defaultOPtions.dateFormat) +" - "+ (moment()).format(defaultOPtions.dateFormat));
		}
	}
});

