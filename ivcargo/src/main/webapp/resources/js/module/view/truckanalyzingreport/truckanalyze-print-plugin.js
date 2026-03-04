(function ($) {
	'use strict';

	var SlickPrint = function () {

		var _self = this;
		var _grid;

		this.init = function (grid) {
			_grid = grid;
		};

		this.printToHtml = function () {
			var numRows = _grid.getData().getLength();
			var columns = _grid.getColumns();
			var numCols = columns.length;
			var r, c;
			var rows = [], cols = [], headers = '',footers='';
			var columnPicker='<div id="grpChkBox" style="position:fixed;top:20px;left:20px;background: #EEE; overflow-y: auto; width:250px;height:530px; overflow-x: auto;padding:10px;" class="hidden-print">';
			var cellNode;
			columns.forEach(function (col) {
				if(col.dataType == 'text'){
					headers+="<th data-selector='"+col.name+"' class='"+col.field+" truncate' style='width:"+col.printWidth+"%;background-color: lightblue;'>"+col.name+"</th>";
				}
			});
			columnPicker+="<button style='width:100%;' class='btn btn-success' onclick='applyPrintSetting();'>Laser Print</button>";
			columnPicker+="<button style='width:100%;' class='btn btn-primary' onclick='applyPrintSettingPlainPrint();'>Plain Print</button>";
			columnPicker+="<button style='width:100%;' class='btn btn-danger' onclick='window.close();'>Close</button>";
			columnPicker+="</div>";
			var i=1;
			for (r = 0; r < numRows; r++) {
				var row="";
				for (c = 0; c < numCols; c++) {
					i = i++;
					cellNode = _grid.getData().getItem(r)[columns[c].field];
					if(_grid.getData().getItem(r)['__groupTotals']){
						if(columns[c].field == 'destinationBranchName'){
							row+="<td data-cell='"+columns[c].name+"' class='"+columns[c].field+" truncate' style='background-color: lightgrey;font-weight: bold;'>"+"TOTAL"+"</td>";
						}else{
							var val = (Math.round(parseFloat(_grid.getData().getItem(r)['sum'][columns[c].field])*100)/100)
							if(columns[c]['totalSumValue'] == true){
								row+="<td data-cell='"+columns[c].name+"' class='"+columns[c].field+" "+columns[c].cssClass+" truncate' style='background-color: lightgrey;font-weight: bold;'>"+"<b> " + Math.round((_grid.getData().getItem(r)['sum']['topayBookingTotal']+_grid.getData().getItem(r)['sum']['paidBookingTotal'])/_grid.getData().getItem(r)['sum']['totalActualWeight'])+"</b>"+"</td>";
							}else if (val != null) {
								row+="<td data-cell='"+columns[c].name+"' class='"+columns[c].field+" "+columns[c].cssClass+" truncate' style='background-color: lightgrey;font-weight: bold;'>"+"<b> " + ((Math.round(parseFloat(val)*100)/100))+"</b>"+"</td>";
							}
						}
					}else if(_grid.getData().getItem(r)['__group']){
						row+="<td data-cell='"+columns[c].name+"' class='"+columns[c].field+" truncate'"+" colspan='"+numCols+"''>"+_grid.getData().getItem(r)['title']+"</td>";
						break;
					} else{
						if(columns[c].valueType == 'number' && cellNode == undefined){
							cellNode = 0;
						}
						if(cellNode != undefined){
							row+="<td data-cell='"+columns[c].name+"' class='"+columns[c].field+" "+columns[c].cssClass+" truncate'>"+cellNode+"</td>";
						}
					}
					
				}
				rows.push(row);
			} 
//			rows.push(footers);
			var headerValue = $("*[data-selector='header']").html();
			var headerDetails = $("#printDetails").val();
			var selectedDetails="";
			$("#ElementDiv").find('span').each(function(index) {
				if(!$(this).isHidden() && $(this).prop("id") != undefined && $(this).prop("id") != '' ){
					selectedDetails += "<b>"+$(this).html()+"</b> = "+ $("#"+$(this).prop("id")+'Ele').val()+"&emsp;";	
				}
			});
			if($("#lrSummaryPaid").hasClass("hide")){
				$("#lrSummaryPaid tr").detach();
			}
			if($("#lrSummaryTbb").hasClass("hide")){
				$("#lrSummaryTbb tr").detach();
			}
			var accountGroupName = $("#accountGroupName").val();
			var headerTable = 	'<tr><td align="center" class="" style="font-size: large;"><b>'+accountGroupName+'</b></td></tr>'+
			'<tr><td align="center" class="" style="font-size: small;">'+headerDetails+'</td></tr>'+
			'<tr><td align="center" class="" style="font-size: medium;"><b>'+headerValue+'</b></td></tr>'
			var table = [
			             '<div>',columnPicker,
			             '<div id="chromeTable" style=""><table class="print">',headerTable,'</table><table class="printTable">',$('#reportHeader').html(),'</table><table id="table" class="printTable" border="1"  class="print">',
			             '<thead>',
			             '<tr>',
			             headers,
			             '</tr>',
			             '</thead>',
			             '<tbody>',
			             '<tr>' + rows.join('</tr>\n<tr>') + '</tr>',
			             '</tbody>',
			             '</table><table class="printTable" border="1">',$('#grandTotalSummary').html(),'</table><table class="printTable" border="1">',$('#serviceTaxDetails').html(),'</table><table style="width: 100%;" ><tr><td valign="top" style="width: 50%;"><table style="width: 100%;" class="printTable" border="1" >',$('#lrSummaryTbb').html(),'</table></td><td valign="top" style="width: 50%;"><table style="width: 100%;" class="printTable" border="1">',$('#lrSummaryPaid').html(),'</table></td></tr></table><table border="0"  style="width: 50%;">',$('#lhpvTable').html(),'</table></div></div>'
			             ].join('\n');
			
			return table;
		};

		this.printToElement = function ($element,w) {
			$($element).html(_self.printToHtml());
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
				TruckAnalyzePrint: SlickPrint
			}
		}
	});
}(jQuery));
