(function ($) {
    'use strict';

    var SlickExcel = function () {

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
            var columnPicker='<div id="grpChkBox" style="position:fixed;top:20px;left:20px;background: #EEE; overflow-y: auto; width:325px;height:530px; overflow-x: auto;padding:10px;" class="hidden-print">';
            var cellNode;
            columns.forEach(function (col) {
            	if(col.dataType == 'text'){
            		headers+="<th data-selector='"+col.name+"' class='"+col.field+" truncate' style='width:"+col.printWidth+"%;background-color: lightblue;'>"+col.name+"</th>";
            		if(document.getElementById('columnTotal_'+col.field) != null){
            			footers+="<th class='"+col.field+"' style='width:"+col.printWidth+"mm;background-color: lightblue;'>"+document.getElementById('columnTotal_'+col.field).innerHTML+"</th>";;
            		}else{
            			footers+="<th class='"+col.field+"' style='width:"+col.printWidth+"mm;background-color: lightblue;'></th>";
            		}
            	}
            });
            columnPicker+="<button style='width:100%;' class='btn btn-success' onclick='applyPrintSetting();'>Laser Print</button>";
            columnPicker+="<button style='width:100%;' class='btn btn-primary' onclick='applyPrintSettingPlainPrint();'>Plain Print</button>";
            //columnPicker+="<button style='width:100%;' class='btn btn-warning' onclick='applyReload();'>Reset</button>";
            columnPicker+="<button style='width:100%;' class='btn btn-warning' id='excelExport' onclick='exportDataToExcel();'>Export To Excel</button>";
            columnPicker+="<button style='width:100%;' class='btn btn-danger' onclick='window.close();'>Close</button>";
            columnPicker+="<table style='width:100%'>";
            columnPicker+="<thead>";
            columnPicker+="<tr style='border-bottom:1px solid; font-weight: 800;'>";
            columnPicker+="<td align='center' style='width:33%;'>Column</td>";
            columnPicker+="<td align='center' style='width:20%;'>Hide</td>";
            columnPicker+="<td align='center' style='width:25%;'>Single-Line</td>";
            columnPicker+="<td align='right' style='width:22%; '>Width %</td>";
            columnPicker+="</tr>";
           	columnPicker+="</thead>";
           	columnPicker+="<tbody>";
            columns.forEach(function (col) {
            	if(col.dataType == 'text'){
            		columnPicker+="<tr style='border-bottom:1px solid'>";
            		columnPicker+="<td align='center' class='"+col.name+"'><b>"+col.name+"</td>";
            		columnPicker+="<td align='center'><input type='checkbox' name='"+col.field+"'></td>";
            		columnPicker+="<td align='center'><input data-checkbox='"+col.name+"' type='checkbox' onchange='changeLineType(this)' name='"+col.name+"' id='"+col.name+"'></td>";
            		columnPicker+="<td align='center'><input type='number' value='"+col.printWidth+"' onchange='changeWidth(this)' style='width:50px' name='"+col.name+"'></td>";
            		columnPicker+="</tr>";
            	}
            });
            columnPicker+="</tbody>";
            columnPicker+="</table>"
            columnPicker+="</div>";
            Slick.GlobalEditorLock.cancelCurrentEdit();
            var i=1;
            for (r = 0; r < numRows; r++) {
                var row="";
                for (c = 0; c < numCols; c++) {
                	i = i++;
                    cellNode = _grid.getData().getItem(r)[columns[c].field];
                    if(columns[c].field == 'id'){
                    	row+="<td data-cell='"+columns[c].name+"' class='"+columns[c].field+" truncate'>"+i+++"</td>";
                    }else{
                    	if(cellNode != undefined){
                    		row+="<td data-cell='"+columns[c].name+"' class='"+columns[c].field+" truncate'>"+cellNode+"</td>";
                    	}
                    }
                }
                rows.push(row);
            } 
            rows.push(footers);
            
            var headerValue = $("*[data-selector='header']").html();
            var headerDetails = $("#printDetails").val();
            var currentTime	= $("#currentTime").val();
            var selectedDetails="";
            $("#ElementDiv").find('span').each(function(index) {
            	if(!$(this).isHidden() && $(this).prop("id") != undefined && $(this).prop("id") != '' ){
            		selectedDetails += "<b>"+$(this).html()+"</b> = "+ $("#"+$(this).prop("id")+'Ele').val()+"&emsp;";	
            	}
            });
            var accountGroupName = $("#accountGroupName").val();
            var headerTable = 	'<tr><td align="center" class="" style="font-size: large;"><b>'+accountGroupName+'</b></td></tr>'+
            					'<tr><td align="center" class="" style="font-size: small;">'+headerDetails+'</td></tr>'+
            					'<tr><td align="center" class="" style="font-size: medium;"><b>'+headerValue+'</b></td></tr>'+
            					'<tr><td align="center" class="" style="font-size: medium;">'+selectedDetails+'</td></tr>'
            
            var table = [
                 '<div>',columnPicker,
                '<div id="chromeTable" style=""><table class="print">',headerTable,'</table><table id="table" border="1"  class="print">',
                '<thead>',
                '<tr>',
                headers,
                '</tr>',
                '</thead>',
                '<tbody>',
                    '<tr>' + rows.join('</tr>\n<tr>') + '</tr>',
                '</tbody>',
                '</table>',currentTime,'</div></div>'
            ].join('\n');

            return table;
        };

        this.printToElement = function ($element,w) {
            $($element).html(_self.printToHtml());
            w.applyColumnPicker();
            w.resizeColumn();
            w.exportDataToExcel();
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
                Excel: SlickExcel
            }
        }
    });
}(jQuery));
