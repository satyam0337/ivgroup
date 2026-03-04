(function ($) {
	'use strict';

	var SlickPrint = function () {
		let _self = this, summaryId = '';
		let _grid;
		let selectize;
		let option;

		this.init = function (grid) {
			_grid = grid;
		};

		this.printToHtml = function () {
			let numRows = _grid.getData().getLength();
			let columns = _grid.getColumns();
			let numCols = columns.length;

			let r, c;
			let rows = [], headers = '',footers='';
			let columnPicker='<div id="grpChkBox" style="position:fixed;top:20px;left:20px;background: #EEE; overflow-y: auto; width:325px;height:530px; overflow-x: auto;padding:10px;" class="hidden-print">';
			let cellNode;
			let chargeArray = new Array();
			
			columns.forEach(function (col) {
				if(col.name == 'AllCharges')
					chargeArray = col.chargesToHide.split(",");
			});
			
			columns.forEach(function (col) {
				if((col.dataType == 'text' || col.dataType == 'number') && (col.field != 'deleteButtonString' && col.dataType != 'button')) {
					if(isValueExistInArray(chargeArray, col.name))
						col.printWidth = 0;
					
					headers	+= "<th data-selector='" + col.field + "' class='" + col.field + " truncate' style='width:" + col.printWidth + "%;background-color: lightblue;'>" + col.name + "</th>";
					
					if(document.getElementById('columnTotal_' + col.slickId + col.field) != null)
						footers	+= "<th data-selector='" + col.field + "' class='" + col.field + " truncate' style='width:" + col.printWidth + "%;background-color: lightblue;'>" + document.getElementById('columnTotal_' + col.slickId + col.field).innerHTML + "</th>";
					else
						footers	+= "<th data-selector='" + col.field + "' class='" + col.field + " truncate' style='width:" + col.printWidth + "%;background-color: lightblue;'></th>";
				}
			});
			
			columnPicker	+= "<button style='width:100%;' class='btn btn-success' onclick='applyPrintSetting();'>Laser Print</button>";
			columnPicker	+= "<button style='width:100%;' class='btn btn-primary' onclick='applyPrintSettingPlainPrint();'>Plain Print</button>";
			//columnPicker	+= "<button style='width:100%;' class='btn btn-warning' onclick='applyReload();'>Reset</button>";
			columnPicker	+= "<button style='width:100%;' class='btn btn-warning' onclick='exportDataToExcel();'>Export To Excel</button>";
			columnPicker	+= "<button style='width:100%;' class='btn btn-danger' onclick='window.close();'>Close</button>";
			columnPicker	+= "<table style='width:100%'>";
			columnPicker	+= "<thead>";
			columnPicker	+= "<tr style='border-bottom:1px solid; font-weight: 800;'>";
			columnPicker	+= "<td align='center' style='width:33%;'>Column</td>";
			columnPicker	+= "<td align='center' style='width:20%;'>Hide</td>";
			columnPicker	+= "<td align='center' style='width:25%;'>Single-Line</td>";
			columnPicker	+= "<td align='right' style='width:22%; '>Width %</td>";
			columnPicker	+= "</tr>";
			columnPicker	+= "</thead>";
			columnPicker	+= "<tbody>";
			
			columns.forEach(function (col) {
				let field	= col.field;
				
				if((col.dataType == 'text' || col.dataType == 'number') && (field != 'deleteButtonString' && col.dataType != 'button')) {
					columnPicker += "<tr style='border-bottom:1px solid'>";
					columnPicker += "<td align='center' class='" + field + "'><b>" + col.name + "</b></td>";
					
					if(col.printWidth != undefined && col.printWidth == 0)
						columnPicker += "<td align='center'><input type='checkbox' name='" + field + "' id = 'showHide_" + field + "'></td>";
					else					
						columnPicker += "<td align='center'><input type='checkbox' name='" + field + "' id = 'showHide_" + field + "' checked></td>";
					
					columnPicker += "<td align='center'><input data-checkbox='" + field + "' type='checkbox' onchange='changeLineType(this)' id='" + field + "' checked></td>";
					columnPicker += "<td align='center'><input type='number' value='" + col.printWidth + "' onchange='changeWidth(this)' style='width:50px' name='" + field + "'></td>";
					columnPicker += "</tr>";
				}
				
				if(col.slickId != undefined && summaryId == '')
					summaryId	= col.slickId;
			});
			
			if(typeof hideSummaryInPrint !== 'undefined' && hideSummaryInPrint != undefined && hideSummaryInPrint)
				summaryId = '';
				
			if($("*[data-summary='" + summaryId + "']").html() != undefined) {
				const text = summaryId;
				const result = text.replace(/([A-Z])/g, " $1");
				const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
				
				let titleName = $('#' + summaryId + 'Summry').html();
				
				if(titleName == undefined)
					titleName = finalResult;
				
				columnPicker += "<tr style='border-bottom:1px solid'>";
				columnPicker += "<td align='center' class='" + summaryId + "'><b>" + titleName + "</b></td>";
				columnPicker += "<td align='center'><input type='checkbox' id='" + summaryId + "' onchange='showHideSummary(this.id)' name='" + summaryId + "' checked></td>";
				columnPicker += "</tr>";
			}
			
			columnPicker += "</tbody>";
			columnPicker += "</table>"
			columnPicker += "</div>";
			
			Slick.GlobalEditorLock.cancelCurrentEdit();
			
			function roundToTwo(num) {	  
				return +(Math.round(num + "e+2")  + "e-2");
			}
			
			let i = 1;
			
			for (r = 0; r < numRows; r++) {
				let row = "";
			
				if(_grid.getData().getItem(r)['__groupTotals'] || _grid.getData().getItem(r)['__group']) {
					if(_grid.getData().getItem(r)['groupingKey'] != undefined)
						row += "<th data-cell='' colspan='" + numCols + "' class='truncate text-center bg-success'>" + _grid.getData().getItem(r)['groupingKey'] + ' (' + _grid.getData().getItem(r)['count'] + ' rows)' + "</th>";
				}

				for (c = 0; c < numCols; c++) {
					i = i++;
					cellNode = _grid.getData().getItem(r)[columns[c].field];
					
					if((columns[c].valueType == 'number' || columns[c].dataType == 'number') && cellNode == undefined)
						cellNode = 0;
					
					if(_grid.getData().getItem(r)['__groupTotals'] || _grid.getData().getItem(r)['__group']) {
						if(_grid.getData().getItem(r)['sum'] != undefined) {
							let groupTotalsObj = _grid.getData().getItem(r)['sum'][columns[c].field];
							
							if(groupTotalsObj != undefined)
								row += "<th data-cell='' class='" + columns[c].field + " " + columns[c].cssClass + " truncate'>" + roundToTwo(groupTotalsObj) + "</th>";
							else
								row += "<th data-cell='' class='" + columns[c].field + " " + columns[c].cssClass + " truncate'>&nbsp;</th>";
						}
					} else if(columns[c].field == 'id')
						row += "<td data-cell='" + columns[c].field + "' class='" + columns[c].field + " truncate'>" + i++ + "</td>";
					else if(columns[c].field != 'deleteButtonString' && columns[c].dataType != 'button') {
						if(cellNode != undefined)
							row += "<td data-cell='" + columns[c].field + "' class='" + columns[c].field + " " + columns[c].cssClass + " truncate'>" + cellNode + "</td>";
							
						if(cellNode == undefined && columns[c].field != undefined)
							row += "<td data-cell='' class='" + columns[c].field + " " + columns[c].cssClass + " truncate'>&nbsp;</td>";
					}
				}

				rows.push(row);
			} 

			rows.push(footers);

			let headerValue		= $("*[data-selector='header']").html();
			let headerDetails	= $("#printDetails").val();
			let summary			= $("*[data-summary='" + summaryId + "']").html();
			let selectedDetails	= '';
			let branchName		= '';
			let regionName		= '';
			let subRegionName	= '';

			$("#ElementDiv").find('span').each(function() {
				if(!$(this).isHidden() && $(this).prop("id") != undefined && $(this).prop("id") != '') {
					let eleId	= $(this).prop("id") + 'Ele';
					let value	= $("#" + eleId).val();
					
					if($(this).prop("id") == 'branch') branchName	= value;
					if($(this).prop("id") == 'region') regionName	= value;
					if($(this).prop("id") == 'subRegion') subRegionName	= value;
					
					if($('#' + eleId + '_wrapper').exists() && $('#' + eleId + '_wrapper').is(":visible")) {
						selectize		= $('#' + eleId).get(0).selectize;
						
						if(selectize != undefined) {
							let current			= selectize.getValue(); 
							option			= selectize.options[ current ];
							
							if(option != undefined) {
								if(option.name != undefined)
									value			= option.name;
								else if(option.commissionTypeName != undefined)
									value			= option.commissionTypeName;
								else if(option.branchName != undefined) {
									value			= option.branchName;
									branchName		= value;
								} else if(option.regionName != undefined) {
									value			= option.regionName;
									regionName		= value;
								} else if(option.subRegionName != undefined) {
									value			= option.subRegionName;
									subRegionName	= value;
								} else if(option.selectionTypeName != undefined)
									value			= option.selectionTypeName;
								else if(option.billType != undefined)
									value			= option.billType;
								else if(option.executiveName != undefined)
									value			= option.executiveName;
								else if(option.billSelectionName != undefined)
									value			= option.billSelectionName;
								else if(option.vehicleNumber != undefined)
									value			= option.vehicleNumber;
							}
						}
					}
					
					if(value != undefined && value != '')
						selectedDetails += "<b>" + $(this).html() + "</b> = " + value + '&#9;';	
				}
	
				if($('#commissionTypeEle').exists() && $('#commissionTypeEle').is(":visible") && !isNaN($('#commissionTypeEle').val())
					|| $('#commissionTypeEle_wrapper').exists() && $('#commissionTypeEle_wrapper').is(":visible") && !isNaN($('#commissionTypeEle').val())) {
					selectize		= $('#commissionTypeEle').get(0).selectize;
					option			= selectize.options[ selectize.getValue() ];
					$('#commissionTypeEle').val(option.commissionTypeName);
				}
				
				if($('#branchEle').exists() && $('#branchEle').is(":visible") &&  !isNaN($('#branchEle').val())
					|| $('#branchEle_wrapper').exists() && $('#branchEle_wrapper').is(":visible") && !isNaN($('#branchEle').val())) {
					selectize		= $('#branchEle').get(0).selectize;
					
					if(selectize != undefined) {
						option			= selectize.options[ selectize.getValue() ];
						$('#branchEle').val(option.branchName);
					}
				}
				
				if($('#regionEle').exists() && $('#regionEle').is(":visible") && !isNaN($('#regionEle').val())){
					selectize		= $('#regionEle').get(0).selectize;
					option			= selectize.options[ selectize.getValue() ];
					$('#regionEle').val(option.regionName);
				}
				
				if($('#subRegionEle').exists() && $('#subRegionEle').is(":visible") && !isNaN($('#subRegionEle').val())) {
					selectize		= $('#subRegionEle').get(0).selectize;
					option			= selectize.options[ selectize.getValue() ];
					$('#subRegionEle').val(option.subRegionName);
				}

				if($('#selectionTypeEle').exists() && $('#selectionTypeEle').is(":visible") && !isNaN($('#selectionTypeEle').val())) {
					selectize		= $('#selectionTypeEle').get(0).selectize;
					option			= selectize.options[ selectize.getValue() ];
					$('#selectionTypeEle').val(option.selectionTypeName);
				}
				
				if($('#billTypeEle').exists() && $('#billTypeEle_wrapper').is(":visible") && !isNaN($('#billTypeEle').val())) {
					selectize		= $('#billTypeEle').get(0).selectize;
					option			= selectize.options[ selectize.getValue() ];
					$('#billTypeEle').val(option.billType);
				}
			});

			let accountGroupName = $("#accountGroupName").val();
			let imagePath		 = $("#imagePath").val();
			/*
			 * If headerValue is undefined then making it empty
			 */
			if(headerValue == undefined)
				headerValue = "";

			let headerTable;
			
			if(imagePath == undefined || imagePath == null || imagePath == 'null') {
				 headerTable = '<tr><td align="center" colspan="' + numCols + '" style="font-size: large;"><b>' + accountGroupName + '</b></td></tr>' +
					'<tr><td align="center" colspan="' + numCols + '" style="font-size: small;">' + headerDetails + '</td></tr>' +
					'<tr><td align="center" colspan="' + numCols + '" style="font-size: medium;" id = "header"><b>' + headerValue + '</b></td></tr>' +
					'<tr style="display: none;"><td align="center" style="font-size: medium;" id = "branchName">' + branchName + '</td></tr>' +
					'<tr style="display: none;"><td align="center" style="font-size: medium;" id = "regionName">' + regionName + '</td></tr>' +
					'<tr style="display: none;"><td align="center" style="font-size: medium;" id = "subRegionName">' + subRegionName + '</td></tr>' +
					'<tr><td align="left" colspan="' + numCols + '" style="font-size: medium;">' + selectedDetails + '</td></tr>';
			} else {
				 headerTable = '<tr><td align="center"><img src=' + imagePath + ' width="800px" height="130px"/></td></tr>' +
						'<tr><td align="center" style="font-size: medium;" id = "header"><b>' + headerValue + '</b></td></tr>' +
						'<tr style="display: none;"><td align="center" style="font-size: medium;" id = "branchName">' + branchName + '</td></tr>' +
						'<tr style="display: none;"><td align="center" style="font-size: medium;" id = "regionName">' + regionName + '</td></tr>' +
						'<tr style="display: none;"><td align="center" style="font-size: medium;" id = "subRegionName">' + subRegionName + '</td></tr>' +
						'<tr><td align="center" style="font-size: medium;">' + selectedDetails + '</td></tr>';
			}
			
			let table = [
				 '<div>',columnPicker,
				'<div id="chromeTable" style=""><table class="print">', headerTable, '</table><table id="table" border="1"	class="print">',
				'<thead>',
				'<tr>',
					headers,
				'</tr>',
				'</thead>',
				'<tbody>',
					'<tr>' + rows.join('</tr>\n<tr>') + '</tr>',
				'</tbody>',
				'</table>',summary,'</div></div>'
			].join('\n');
			
			return table;
		};

		this.printToElement = function ($element,w) {
			$($element).html(_self.printToHtml());
			w.applyColumnPicker();
			
			if(summaryId != '')
				w.showHideSummary(summaryId);
			
			w.resizeColumn();
		}

		this.printToWindow = function (w) {
			w.onload = function () {
				setTimeout(function () {
					_self.printToElement(w.document.body,w);
				});
			};
		};
	};

	// register namespace
	$.extend(true, window, {
		Slick: {
			Plugins: {
				Print: SlickPrint
			}
		}
	});
}(jQuery));