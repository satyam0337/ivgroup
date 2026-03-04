var tableHeaderAndFooterCss	= null;

define([
		PROJECT_IVUIRESOURCES + '/resources/js/filterTable/excel-bootstrap-table-filter-bundle.js'
	], function() {
		let _thisPopulate;
	return {
		setTableData : function(response) {
			_thisPopulate = this;
			
			_thisPopulate.setTableHeader(response);
			_thisPopulate.setTableDataRow(response);
			_thisPopulate.setTableFooter(response);
			
			let tableProperties	= response.tableProperties;
			
			if(tableProperties.showSorting)
				$('#' + tableProperties.tableId).excelTableFilter();
		}, setTableHeader : function(response) {
			makeHead(response);
		}, setTableDataRow: function(response) {
			makeBody(response);
		}, setTableFooter : function(response) {
			makeFooter(response);
		}
	}
});

function makeHead(response) {
	let columnHead 			= response.columnConfiguration;  // header row array
	let tableProperties		= response.tableProperties;
	tableHeaderAndFooterCss	= tableProperties.tableHeaderAndFooterCss;
			
	let headerColumnArray		= new Array();
	$('#' + tableProperties.tableId + ' thead').empty();
					
	if(tableProperties.showCheckBox)
		headerColumnArray.push("<th class='checkBox " + tableHeaderAndFooterCss + "' style='text-align: center;width:50px;'><input type='checkBox' id='selectAll'></th>");
	else if(tableProperties.showDeleteButton)
		headerColumnArray.push("<th class='checkBox " + tableHeaderAndFooterCss + "' style=''>Remove</th>");
					
	headerColumnArray.push("<th class='srNo " + tableHeaderAndFooterCss + "' style='width:80px;'>Sr No.</th>");
					
	for (const element of columnHead) {
		let value					= element.dataDtoKey;
		let columnDisplayCssClass	= element.columnDisplayCssClass + ' textAlignCenter';
		let columnWidth				= element.columnWidth;
		let header					= element.title;
		
		headerColumnArray.push("<th class='" + columnDisplayCssClass + " " + value + "' style='width:" + columnWidth + "px;'>" + header + "</th>");
	}
					
	$('#' + tableProperties.tableId + ' thead').append('<tr class="table-primary">' + headerColumnArray.join(' ') + '</tr>');
			
	$("#selectAll").click(function() {
		$("input[type=checkbox]").prop('checked', $(this).prop('checked'));
		$(".checkBoxdatatd").prop('checked', $(this).prop('checked'));
	});
}

function makeBody(response) {
	let columnHead 		= response.columnConfiguration;  // header row array
	let tableProperties	= response.tableProperties;
	let count			= 0;
	$('#' + tableProperties.tableId + ' tbody').empty();
			
	let columnData   			= response.CorporateAccount;  // column data with key
					
	for (const obj of columnData) {
		count = count + 1;
	
		let columnArray		= new Array();
		let rowColorClass 	= '';

		if (obj.color != undefined)
			rowColorClass = ' style="background-color:' + obj.color + '; color: #fff;"';
					
		if(tableProperties.showCheckBox && (obj.showCheckBox == undefined || obj.showCheckBox))
			columnArray.push("<td class='checkBoxdatatd' style='text-align: center; vertical-align: middle; font-size:15px;width:50px;'><input type='checkBox' name = 'uniqueIds' value='" + obj["wayBillId"] + "'></td>");
		else if(tableProperties.showDeleteButton)
			columnArray.push("<td class='' style='text-align: center; vertical-align: middle; font-size:13px;''><input type='checkBox' class='hide' name = 'uniqueIds' value='" + obj["wayBillId"] + " checked'><button style='border-radius:10px;' type='button' class='btn btn-danger btn-sm remove' id='removeBookingCharges_" + obj["wayBillId"] + "'>Remove</button></td>");
		else if(!(obj.showCheckBox == undefined || obj.showCheckBox))		
			columnArray.push("<td class='checkBoxdatatd' style='text-align: center; vertical-align: middle; font-size:15px;width:50px;'></td>");
			
		columnArray.push("<td class='bold' row='row_" + count + "' value='" + obj["wayBillId"] + "' style='text-align: center; vertical-align: middle; font-size:15px;width:50px;'>" + count + "</td>");
					
		for (const element1 of columnHead) {
			let value					= element1.dataDtoKey;
			let columnWidth				= element1.columnWidth;
			let dataType				= element1.dataType;
			let inputElement			= element1.inputElement;
			let buttonCallback			= element1.buttonCallback;
			let columnDisplayCssClass	= element1.columnDisplayCssClass;
			let header					= element1.title;
			let isTooltipAllow			= element1.isTooltipAllow;
			let buttonCss				= element1.buttonCss;
			
			if(columnDisplayCssClass == undefined) columnDisplayCssClass = '';
			if(buttonCss == undefined) buttonCss = 'btn btn-primary';
			
			if(dataType == 'number' || typeof obj[value] === 'number')
				columnDisplayCssClass	= columnDisplayCssClass + ' textAlignRight padding-right-20px';
			else
				columnDisplayCssClass	= columnDisplayCssClass + ' textAlignCenter';
			
			if(inputElement == 'link' && buttonCallback != undefined)
				columnArray.push("<td class='" + columnDisplayCssClass + "' id='" + value + "_" + obj["wayBillId"] + "' style='cursor: pointer;width:" + columnWidth + "px;' onclick='" + buttonCallback + "(this)'>" + obj[value] + "</td>");
			else if(inputElement == 'button' && buttonCallback != undefined)
				columnArray.push("<td class='" + columnDisplayCssClass + "' id='" + value + "_" + obj["wayBillId"] + "' style='width:" + columnWidth + "px;'><button type='button' id='button_" + obj["wayBillId"] + "' name='button_" + obj["wayBillId"] + "' class='" + buttonCss + "' onclick='" + buttonCallback + "(this)'>" + header + "</button></td>");
			else if(isTooltipAllow != undefined && isTooltipAllow)
				columnArray.push("<td class='" + columnDisplayCssClass + "' id='" + value + "_" + obj["wayBillId"] + "' style='width:" + columnWidth + "px;' data-bs-toggle='tooltip' data-bs-title='" + obj[value] + "'>" + obj[value] + "</td>");
			else
				columnArray.push("<td class='" + columnDisplayCssClass + "' id='" + value + "_" + obj["wayBillId"] + "' style='width:" + columnWidth + "px;'>" + obj[value] + "</td>");
		}		
			
		$('#' + tableProperties.tableId + ' tbody').append('<tr' + rowColorClass + '>' + columnArray.join(' ') + '</tr>');
	}
	
	$('[data-bs-toggle="tooltip"]').tooltip({
		sanitize: false,
		placement : 'top'
	}); 
}

function makeFooter(response) {
	let columnHead 		= response.columnConfiguration;  // header row array
	let columnData   	= response.CorporateAccount;  // column data with key
	let tableProperties	= response.tableProperties;
	let tableId			= tableProperties.tableId;
			
	let totalColumnArray		= new Array();
	$('#' + tableId + ' tfoot').empty();
		
	totalColumnArray.push("<td class='backgroundColorBlue colorWhite'><b>Total</b></td>");
			
	if(tableProperties.showCheckBox || tableProperties.showDeleteButton)
		totalColumnArray.push("<td class='backgroundColorBlue colorWhite'><b></b></td>");
						 
	$('.checkBox').children("div").css({"width": '40px',"display":"none"});
	$('.srNo').children("div").css({"width": '60px',"display":"none"});
			
	if(tableProperties.showSorting)
		$(".dropdown-filter-menu-search").after("<button style='margin-top:10px;' class='closeFilter'><b>Close</b></button>");
		
	for (const element of columnHead) {
		let value					= element.dataDtoKey;
		let columnDisplayCssClass	= element.columnDisplayCssClass;
		let columnWidth				= element.columnWidth;
		let displayColumnTotal		= element.displayColumnTotal;
		let dataType				= element.dataType;
		
		let total	= '';
						
		if(displayColumnTotal)
			total =	columnData.reduce((a, b) => a + (b[value] || 0), 0);
			
		if(dataType == 'number' || total != '')
			columnDisplayCssClass				= columnDisplayCssClass + ' textAlignRight padding-right-20px';
		else
			columnDisplayCssClass				= columnDisplayCssClass + ' textAlignCenter';
				
		if(tableProperties.showSorting)
			$('.' + value + ' .dropdown-filter-dropdown').addClass('' + columnDisplayCssClass + '');
				
		$('.' + value).children("div").css("width", '' + columnWidth + 'px');
				
		totalColumnArray.push("<th class='" + columnDisplayCssClass + "' style='width:" + columnWidth + "px;'>" + total + "</th>");
	}
					
	$('#' + tableId + ' tfoot').append('<tr>' + totalColumnArray.join(' ') + '</tr>');
	
	applyCss(tableId);
}

function applyCss(tableId) {
	if(tableHeaderAndFooterCss != undefined && tableHeaderAndFooterCss != "") {
		$('#' + tableId + ' thead tr').addClass(tableHeaderAndFooterCss);
		$('#' + tableId + ' thead tr').removeClass('table-primary');
		$('#' + tableId + ' tfoot tr').addClass(tableHeaderAndFooterCss);
	}
}

function lrSearch(obj) {
	let wayBillId	= (obj.id).split('_')[1];
	
	if(wayBillId != undefined && wayBillId > 0)
		window.open('SearchWayBillAction.do?pageId=5&eventId=3&wayBillId=' + wayBillId + '&TypeOfNumber=' + LR_SEARCH_TYPE_ID);
}