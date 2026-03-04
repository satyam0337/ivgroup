define(['slickGrid','moment'],function(slickGrid,moment) {
	return {
		//function returns array oject of tab URLs
		applyGrid:function(options){
			_this = this;
			var columnHead 						= options.ColumnHead;  // header row array
			var columnData   					= options.ColumnData;  // column data with key
			var language  	 					= options.Language;
			var divId	   	 					= options.DivId;
			var showPager  	 					= options.ShowPager;
			var showPinToLeft 					= options.ShowPinToLeft;
			var showSorting 					= options.ShowSorting;
			var showColumnPicker 				= options.ShowColumnPicker;
			var enableColumnReorder 			= options.EnableColumnReorder;
			var fetchDataButtonId 				= options.FetchDataButtonId;
			var showCheckBox 					= options.ShowCheckBox;
			var showGrouping 					= options.ShowGrouping;
			var showDeleteButton 				= options.ShowDeleteButton;
			var showPrintButton 				= options.ShowPrintButton;
			var showExportExcelButton			= options.ShowExportExcelButton;
			var showPartialButton 				= options.ShowPartialButton;
			var editRowsInSlick					= options.EditRowsInSlick;
			var callBackFunctionToFetchData 	= options.CallBackFunctionToFetchData;
			var innerSlickID 					= options.InnerSlickId;
			var innerSlickHeight				= options.InnerSlickHeight;
			var editableColumn 					= options.EditableColumn;
			var removeSelectAllCheckBox			= options.RemoveSelectAllCheckBox;
			var callBackFunctionForPartial;
			var dataViewObject;
			var dataGridObject;
			var dataViewObjectCallBackFunction;
			var columnHiddenConfiguration ;
			var searchFilterConfiguration ;
			var listFilterConfiguration ;
			var updateGrid;
			if(typeof options.ColumnHiddenConfiguration != "undefined"){
				columnHiddenConfiguration = options.ColumnHiddenConfiguration;
			}
			if(typeof options.UpdateGrid != "undefined"){
				updateGrid = options.UpdateGrid;
			}

			if(typeof options.RemoveSelectAllCheckBox != "undefined"){
				removeSelectAllCheckBox = options.RemoveSelectAllCheckBox;
			}else{
				removeSelectAllCheckBox = false;
			}
			
			if(typeof options.ShowPager != "undefined"){
				showPager = options.ShowPager;
			}else{
				showPager = false;
			}
			
			if(typeof options.EditRowsInSlick != "undefined"){
				editRowsInSlick = options.EditRowsInSlick;
			}else{
				editRowsInSlick = false;
			}
			if(typeof options.DataViewObjectCallBackFunction != "undefined"){
				dataViewObjectCallBackFunction = options.DataViewObjectCallBackFunction;
			}
			if(typeof options.CallBackFunctionForPartial != "undefined"){
				callBackFunctionForPartial = options.CallBackFunctionForPartial;
			}

			if(typeof options.DataVieObject != "undefined"){
				dataViewObject = options.DataVieObject;
			}else{
				dataViewObject = false;
			}
			if(typeof options.DataGridObject != "undefined"){
				dataGridObject = options.DataGridObject;
			}else{
				dataGridObject = false;
			}

			if(typeof options.ShowCheckBox != "undefined"){
				showCheckBox = options.ShowCheckBox;
			}else{
				showCheckBox = false;
			}
			if(typeof options.ShowGrouping != "undefined"){
				showGrouping = options.ShowGrouping;
			}else{
				showGrouping = false;
			}
			if(typeof options.ShowDeleteButton != "undefined"){
				showDeleteButton = options.ShowDeleteButton;
			}else{
				showDeleteButton = false;
			}
			if(typeof options.ShowPrintButton != "undefined"){
				showPrintButton = options.ShowPrintButton;
			}else{
				showPrintButton = false;
			}
			if(typeof options.ShowExportExcelButton != "undefined"){
				showExportExcelButton = options.ShowExportExcelButton;
			}else{
				showExportExcelButton = false;
			}
			if(typeof options.ShowPartialButton != "undefined"){
				showPartialButton = options.ShowPartialButton;
			}else{
				showPartialButton = false;
			}
			if(typeof options.FetchDataButtonId != "undefined"){
				fetchDataButtonId = options.FetchDataButtonId;
			}else{
				fetchDataButtonId = '';
			}
			if(typeof options.EnableColumnReorder != "undefined"){
				enableColumnReorder = options.EnableColumnReorder;
			}else{
				enableColumnReorder = false;
			}
			if(typeof options.ShowColumnPicker != "undefined"){
				showColumnPicker = options.ShowColumnPicker;
			}else{
				showColumnPicker = false;
			}
			if(typeof options.ShowPinToLeft != "undefined"){
				showPinToLeft = options.ShowPinToLeft;
			}else{
				showPinToLeft = false;
			}

			if(typeof options.ShowSorting != "undefined"){
				showSorting = options.ShowSorting;
			}else{
				showSorting = true;
			}
			if(typeof options.InnerSlickId != "undefined"){
				innerSlickID = options.InnerSlickId;
			}else{
				innerSlickID = 'mySlickGrid';
			}
			if(typeof options.InnerSlickHeight != "undefined"){
				innerSlickHeight = options.InnerSlickHeight;
			}else{
				innerSlickHeight = '250px';
			}
			
			if(typeof options.EditableColumn != "undefined"){
				editableColumn = options.EditableColumn;
			}else{
				editableColumn = false;
			}
			
			if(typeof options.AllowFilter != "undefined"){
				if(typeof options.AllowFilter["searchFilterList"] != "undefined"){
					searchFilterConfiguration = options.AllowFilter["searchFilterList"];
				}
				if(typeof options.AllowFilter["listFilterList"] != "undefined"){
					listFilterConfiguration = options.AllowFilter["listFilterList"];
				}
			}
			var NoVerticalScrollBar = false;
			if( typeof options.NoVerticalScrollBar != "undefined"){
				NoVerticalScrollBar = options.NoVerticalScrollBar;
			}

			var updateStatusWs ;
			var totals = {};

			if(typeof options.ChangeStatusColumn  != "undefined" ){
				var changeStatusCol = options.ChangeStatusColumn;
				updateStatusWs = changeStatusCol[0].WebService;
			}

			function sorterStringCompare(a, b) {

			}

			function sorterData(a, b) {
				//date support dd-mm-yyyy please change if any date format is changed
				var regex = /^\d{2}[./-]\d{2}[./-]\d{4}$/
					if (regex.test(a[sortcol]) && regex.test(b[sortcol])) {
						var momentA = moment(a[sortcol],"DD/MM/YYYY");
						var momentB = moment(b[sortcol],"DD/MM/YYYY");
						if (momentA > momentB) return sortdir * 1;
						else if (momentA < momentB) return sortdir * -1;
						else return sortdir * 0;
					}
					else {// check if numeric should pass to numeric sorting else String comparison
						var x = a[sortcol], y = b[sortcol];
						if(parseInt(x)>0 ){
							return sorterNumeric(a,b);
						}else{
							return sortdir * (x === y ? 0 : (x > y ? 1 : -1));
						}
					}
			}

			function sorterNumeric(a, b) {
				var x = (isNaN(a[sortcol]) || a[sortcol] === "" || a[sortcol] === null) ? -99e+10 : parseFloat(a[sortcol]);
				var y = (isNaN(b[sortcol]) || b[sortcol] === "" || b[sortcol] === null) ? -99e+10 : parseFloat(b[sortcol]);
				return sortdir * (x === y ? 0 : (x > y ? 1 : -1));
			}


			var $pager 			= $("<div id='pager_"+innerSlickID+"' style='width: 100%; height: 20px;'/></div>");
			var $status			= $("<div id='status_"+innerSlickID+"'><label id='status-label_"+innerSlickID+"'></label></div>");
			var $buttonDiv		= $("<div id='buttonDiv' style='display: flex;'>");
			var $print 			= $("<div id='print_"+innerSlickID+"'><button id='btnprint_"+innerSlickID+"' class='btn btn-primary'><i class='glyphicon glyphicon-print'></i> Print</button></div>");
			var $excel 			= $("<div id='excel_"+innerSlickID+"'style='padding-left: 5px;'><button id='btnexcel_"+innerSlickID+"' class='btn btn-primary'><i class='glyphicon glyphicon-download-alt'></i> Download Excel</button></div>");
			var $buttonCloseDiv	= $("</div>");
			var $mySlickGrid 	= $("<div id='"+innerSlickID+"' style='width: 100%;height:"+innerSlickHeight+";'></div>");

			if(showPager){
				$("#"+divId).append($pager);
			}
			if(document.getElementById(innerSlickID) == null){

				$("#"+divId).append($buttonDiv);
				if(showPrintButton){
					if(document.getElementById("btnprint_"+innerSlickID) == undefined){
						$("#buttonDiv").append($print);
					}
				}
				if(showExportExcelButton){
					if(document.getElementById("btnexcel_"+innerSlickID) == undefined){
						$("#buttonDiv").append($excel);
					}
				}
				$("#"+divId).append($buttonCloseDiv);
				$("#"+divId).append($mySlickGrid);
				$("#"+divId).append($status);
			}

			var pinCounter = -1; // number of coumns to froze counter;

			function statusChangeSuccess(vehicle){
				//grid.invalidate();
				//	grid.render();
			}

			function renderSwitch(cellNode, rowIdx, dataContext, colDef, cleanupBeforeRender){
				$('[type="checkbox"]').bootstrapSwitch({});
				$("input[data-primaryId='"+dataContext.masterId+"']").change(function(event) {
					var activecheck ='';
					if(this.checked){activecheck = ACTIVE_ID}
					else{activecheck=INACTIVE_ID}
					var jsonObject = new Object();
					jsonObject.masterId = this.getAttribute("data-primaryId");
					jsonObject.activeDeactive = activecheck ;
					//function in jsonutility.js
					getJSON(jsonObject,updateStatusWs, statusChangeSuccess, 'error', 3);
				});
			}

			var buttonsObj = [];
			var pintoleftObj = {
					cssClass: "fa fa-thumb-tack",
					command: "toggle-pinToLeft",
					tooltip: "pin to Left"
			}
			var sortinglockObj =  {
					cssClass: "fa fa-lock",
					command: "toggle-sortable",
					tooltip: "sorting locked"
			}		 

			if(showSorting){
				buttonsObj.push(sortinglockObj);
			}
			if(showPinToLeft){
				buttonsObj.push(pintoleftObj);
			}

			var columns = []; // columns array for SlickGrid Object
			var columnPicker = []; // columns array for SlickGrid Object

			if(showCheckBox){
				var checkboxSelector = new Slick.CheckboxSelectColumn({
					cssClass: "slick-cell-checkboxsel column-data-left-align"
				});

				columns.push(checkboxSelector.getColumnDefinition());
			}

			if(showDeleteButton){
				var removeCurrentRowStr	=	{ 
								id				:  	'removeButton',  
								field			:	'removeButton', 
								name			:	language['removeheader'], 
								width			: 	80,
								searchFilter	:	false,
								listFilter		:	false,
								hasTotal		:	false,
								buttonCss		:	'btn btn-danger btn-xs',
								formatter		:	Slick.Formatters.Button,
								cssClass		:	'column-data-left-align',
								dataType		:	'button'
				}
				columns.push(removeCurrentRowStr);
				//columnPicker.push(removeCurrentRowStr);
			}

			if(showPartialButton){
				var ShowPartialButton	=	{ id:'PartialButton',  field:'PartialButton', name:language['partialheader'], 
						width: 80 ,searchFilter:false,listFilter:false,hasTotal:false,buttonCss:'btn btn-primary btn-xs',
						formatter:Slick.Formatters.Button,cssClass:'column-data-left-align',dataType:'button',
				}
				columns.push(ShowPartialButton);
			}

			// for adding Sr No column to Table
			var idFieldPropertyStr = { id:  'id',  field:'id', name:language['serialnumberheader'], width: 50 ,sortable: false,
					formatter: Slick.Formatters.SerialNumber,cssClass:'column-data-left-align',
					searchFilter:false,listFilter:false, dataType:'text',hasTotal:false,printWidth:10,
					toolTip:language['serialnumberheader'],
					header: {
						buttons: buttonsObj
					}
			}
			if(typeof options.SerialNo != "undefined"){
				if(options.SerialNo[0].SearchFilter != "undefined"){
					if(options.SerialNo[0].SearchFilter){
						idFieldPropertyStr.searchFilter = true;
					}
				}
				if(options.SerialNo[0].ListFilter != "undefined"){
					if(options.SerialNo[0].ListFilter){
						idFieldPropertyStr.listFilter = true;
					}
				}
				if(options.SerialNo[0].showSerialNo != "undefined"){
					if(options.SerialNo[0].showSerialNo){
						columns.push(idFieldPropertyStr);
						columnPicker.push(idFieldPropertyStr);
					}
				}
			}

			for (var i = 0; i < columnHead.length; i++) {
				var buttonsObjCol = [];
				var pintoleftObj = {
						cssClass: "fa fa-thumb-tack",
						command: "toggle-pinToLeft",
						tooltip: "pin to Left"
				}
				var sortinglockObj =  {
						cssClass: "fa fa-lock",
						command: "toggle-sortable",
						tooltip: "sorting locked"
				}		 
				if(showSorting){
					buttonsObjCol.push(sortinglockObj);
				}
				if(showPinToLeft){
					buttonsObjCol.push(pintoleftObj);
				}

				if(columnHead[i].inputElement == 'button'){
					columns.push({ id:  columnHead[i].dataDtoKey, name:language[columnHead[i].labelId], 
						minWidth: columnHead[i].columnMinWidth,searchFilter:false,listFilter:false,hasTotal:false,buttonCss:columnHead[i].buttonCss,
						width: columnHead[i].columnWidth,formatter:Slick.Formatters.Button,cssClass:columnHead[i].columnDisplayCssClass,dataType:'button'});
					continue;
				}else  if(columnHead[i].dataType == 'input'){
					columns.push({ 
							id			:  	columnHead[i].dataDtoKey,
							name		:	language[columnHead[i].labelId], 
							field		: 	columnHead[i].dataDtoKey,
							minWidth	:	columnHead[i].columnMinWidth,
							width		: 	columnHead[i].columnWidth,
							sortable	: 	false,
							hasTotal	:	columnHead[i].displayColumnTotal,
							cssClass	:	columnHead[i].columnDisplayCssClass,
							searchFilter:	false,
							listFilter	:	false,
							dataType	:	'text',
							printWidth	:	columnHead[i].columnPrintWidthInPercentage,
							valueType	:	columnHead[i].dataType,
							buttonCss	:	columnHead[i].buttonCss,
							toolTip		:	language[columnHead[i].labelId],
							slickId		:	innerSlickID,
							sorter		:	sorterData,
							maxLength	: 	columnHead[i].maxLength,
							formatter	:	Slick.Formatters.Input,
							editor		: 	Slick.Editors.Input
					});
					continue;
				}

				var fieldPropertyStr = { 
							id				:  	columnHead[i].dataDtoKey,
							name			:	language[columnHead[i].labelId], 
							field			: 	columnHead[i].dataDtoKey,
							minWidth		:	columnHead[i].columnMinWidth,
							width			: 	columnHead[i].columnWidth,
							sortable		: 	false,
							hasTotal		:	columnHead[i].displayColumnTotal,
							cssClass		:	columnHead[i].columnDisplayCssClass,
							searchFilter	:	false,
							listFilter		:	false,
							dataType		:	'text',
							printWidth		:	columnHead[i].columnPrintWidthInPercentage,
							valueType		:	columnHead[i].dataType,
							toolTip			:	language[columnHead[i].labelId],
							slickId			:	innerSlickID,
							sorter			:	sorterData,
							formatter		:	Slick.Formatters.DefaultValues,
							header			: {
												buttons: buttonsObjCol
											}
				} ;
				
				if(columnHead[i].labelValue != "" && columnHead[i].labelValue != undefined){
					fieldPropertyStr.name = columnHead[i].labelValue;
				}
				
				if(columnHead[i].displayColumnTotal){
					fieldPropertyStr.groupTotalsFormatter = sumTotalsFormatter;
				}

				if(typeof searchFilterConfiguration  != "undefined"){
					if(searchFilterConfiguration[columnHead[i].elementConfigKey]=='true'){
						fieldPropertyStr.searchFilter = true;
					}
				}

				if(typeof listFilterConfiguration  != "undefined"){
					if(listFilterConfiguration[columnHead[i].elementConfigKey]=='true'){
						fieldPropertyStr.listFilter = true;
					}
				}

				if(typeof columnHiddenConfiguration != "undefined"){
					if(columnHiddenConfiguration[columnHead[i].elementConfigKey]=='true'){
						columns.push(fieldPropertyStr);
					}
					columnPicker.push(fieldPropertyStr);
				}
				else{
					columns.push(fieldPropertyStr);
					columnPicker.push(fieldPropertyStr);
				}
			}
			if(typeof updateStatusWs  != "undefined" )
			{
				var changeStatusPropertyStr	=	{ id:  'masterId',  field:'vehicleId', name:'Change Status', 
						width: 240 ,searchFilter:false,listFilter:false,hasTotal:false,
						formatter:Slick.Formatters.SwitchActiveDeactive,asyncPostRender: renderSwitch,
						cssClass:'column-data-left-align',dataType:'text',
				}
				columns.push(changeStatusPropertyStr);
				columnPicker.push(changeStatusPropertyStr);
			}
			
			function sumTotalsFormatter(totals, columnDef) {
				  var val = totals.sum && totals.sum[columnDef.field];
				  if (val != null) {
				    return "<b> " + ((Math.round(parseFloat(val)*100)/100))+"</b>";
				  }
				  return "";
				}
			
			var options = {
					enableCellNavigation	: 	true,
					multiColumnSort			: 	true,
					enableColumnReorder		: 	enableColumnReorder,
					frozenColumn			: 	0,
					fullWidthRows			:	true,
					rowHeight				: 	30,
					enableAsyncPostRender	: 	true,
					showFooterRow			: 	true,
					explicitInitialization	:	true,
					autoHeight				:	NoVerticalScrollBar,
					autoEdit				:	true,
					editable				:	true
			};
			if(showGrouping){
				options.frozenColumn = -1;
			}
			
			if(editableColumn) {
				options.editable		= false;
			}
			
			var  dataView;
			var groupItemMetadataProvider = new Slick.Data.GroupItemMetadataProvider();
			if(editRowsInSlick){

				if(updateGrid != undefined){
					grid = updateGrid;
					dataView = updateGrid.getData();
				}else{
					for (var i = 0; i < columnData.length; i++) {
						columnData[i]['id']=parseInt(i)+1;
					} // adding row number to the table
					var old = JSON.stringify(columnData) //convert to JSON string
					columnData = JSON.parse(old);  // for removing null values in the jsonstring from webservice
					if(typeof dataViewObject.setItems == 'undefined'){

						dataView = new Slick.Data.DataView({ inlineFilters: true ,groupItemMetadataProvider: groupItemMetadataProvider});
						dataView.setItems(columnData);
						grid = new Slick.Grid("#"+innerSlickID, dataView, columns, options);
						grid.registerPlugin(groupItemMetadataProvider);
						grid.setSelectionModel(new Slick.CellSelectionModel());

						if(dataViewObjectCallBackFunction != undefined){
							dataViewObjectCallBackFunction(dataView,grid);
						}
					}else{
						var old = JSON.stringify(columnData) //convert to JSON string
						columnData = JSON.parse(old);  // for removing null values in the jsonstring from webservice
						//update values
						dataView = dataViewObject;
						grid = dataGridObject;

						dataView.beginUpdate();
						var uniqueId = dataView.getItems().length;
						for (var i = 0; i < columnData.length; i++) {
							uniqueId++;
							columnData[i]['id']=uniqueId+1;
							dataView.insertItem(0,columnData[i]);
						} 
						dataView.endUpdate();
					}
				}

			}else{
				if(updateGrid == undefined){
					for (var i = 0; i < columnData.length; i++) {
						columnData[i]['id']=parseInt(i)+1;
					} // adding row number to the table

					var old = JSON.stringify(columnData) //convert to JSON string
					columnData = JSON.parse(old);  // for removing null values in the jsonstring from webservice

					dataView = new Slick.Data.DataView({ inlineFilters: true ,groupItemMetadataProvider: groupItemMetadataProvider});
					dataView.setItems(columnData);
					grid = new Slick.Grid("#"+innerSlickID, dataView, columns, options);
					grid.registerPlugin(groupItemMetadataProvider);
					grid.setSelectionModel(new Slick.CellSelectionModel());

				}
			}

			if(dataViewObjectCallBackFunction != undefined){
				dataViewObjectCallBackFunction(dataView,grid);
			}
			
			if(updateGrid == undefined){
				var pager = new Slick.Controls.Pager(dataView, grid, $("#pager_"+innerSlickID)); // for pager id
				grid.onFooterRowCellRendered.subscribe(function (e, args) {
					$(args.node).empty();
					if(args.column.hasTotal == true){
						$("<span id='columnTotal_"+innerSlickID+args.column.id+"' data-columnTotal="+innerSlickID+args.column.id+" class='footerTotal'>"+totals[args.column.id]+"</span>")
						.appendTo(args.node);
					}
				});
				grid.onCellChange.subscribe(function (e,args) {
					_this.updateColumnTotal(columnPicker,dataView,totals,innerSlickID);
				});

				dataView.onRowCountChanged.subscribe(function (e, args) {
					grid.updateRowCount();
					grid.render();
					_this.updateColumnTotal(columnPicker,dataView,totals,innerSlickID);
				});

				dataView.onRowsChanged.subscribe(function (e, args) {
					grid.updateRowCount();
					grid.invalidateRows(args.rows);
					grid.render();
					_this.updateColumnTotal(columnPicker,dataView,totals,innerSlickID);
				});

				grid.onPageChanged.subscribe(function() {
					_this.updateColumnTotal(columnPicker,dataView,totals,innerSlickID);
				});

				grid.onSelectedRowsChanged.subscribe(function(e, args) {
					_this.updateColumnTotal(columnPicker,dataView,totals,innerSlickID);
				});
				grid.onCellChange.subscribe(function(e, args) {
					_this.updateColumnTotal(columnPicker,dataView,totals,innerSlickID);
				});
				grid.onBeforeCellEditorDestroy.subscribe(function(e, args) {
					_this.updateColumnTotal(columnPicker,dataView,totals,innerSlickID);
				});
				grid.onCellCssStylesChanged.subscribe(function(e, args) {
					_this.updateColumnTotal(columnPicker,dataView,totals,innerSlickID);
				});
				grid.onHeaderClick.subscribe(function(e, args) {
					_this.updateColumnTotal(columnPicker,dataView,totals,innerSlickID);
				});

				dataView.beginUpdate();
				dataView.setFilter(filter);
				dataView.endUpdate();

				grid.onSort.subscribe(function (e, args) {
					var cols = args.sortCols;

					dataView.sort(function (dataRow1, dataRow2) {
						for (var i = 0, l = cols.length; i < l; i++) {
							sortdir = cols[i].sortAsc ? 1 : -1;
							sortcol = cols[i].sortCol.field;

							var result = cols[i].sortCol.sorter(dataRow1, dataRow2); // sorter property from column definition comes in play here
							if (result != 0) {
								return result;
							}
						}
						return 0;
					});
					args.grid.invalidateAllRows();
					args.grid.render();
				});
				var filterPlugin = new Ext.Plugins.HeaderFilter({});

				// This event is fired when a filter is selected
				filterPlugin.onFilterApplied.subscribe(function () {
					dataView.refresh();
					grid.resetActiveCell();

					// Excel like status bar at the bottom
					var status;

					if (dataView.getLength() === dataView.getItems().length) {
						status = "";
					} else {
						status = dataView.getLength() + ' OF ' + dataView.getItems().length + ' RECORDS FOUND';
					}
					$('#status-label_'+innerSlickID).text(status);
					_this.updateColumnTotal(columnPicker,dataView,totals,innerSlickID);
				});

				// Event fired when a menu option is selected
				filterPlugin.onCommand.subscribe(function (e, args) {
					dataView.fastSort(args.column.field, args.command === "sort-asc");
				});

				grid.registerPlugin(filterPlugin);

				var overlayPlugin = new Ext.Plugins.Overlays({});

				// Event fires when a range is selected
				overlayPlugin.onFillUpDown.subscribe(function (e, args) {
					var column = grid.getColumns()[args.range.fromCell];

					// Ensure the column is editable
					if (!column.editor) {
						return;
					}

					// Find the initial value
					var value = dataView.getItem(args.range.fromRow)[column.field];

					dataView.beginUpdate();

					// Copy the value down
					for (var i = args.range.fromRow + 1; i <= args.range.toRow; i++) {
						dataView.getItem(i)[column.field] = value;
						grid.invalidateRow(i);
					}

					dataView.endUpdate();
					grid.render();
				});

				grid.registerPlugin(overlayPlugin);
			}




			// Filter the data (using userscore's _.contains)
			function filter(item) {
				var columns = grid.getColumns();

				var value = true;

				for (var i = 0; i < columns.length; i++) {
					var col = columns[i];
					var filterValues = col.filterValues;
					if (filterValues && filterValues.length > 0) {
						value = value & _.contains(filterValues, item[col.field]);
					}
				}
				return value;
			}

			if(typeof dataViewObject.setItems == 'undefined' && updateGrid == undefined){
				var headerButtonsPlugin = new Slick.Plugins.HeaderButtons();
				headerButtonsPlugin.onCommand.subscribe(function(e, args) {
					var column = args.column;
					var button = args.button;
					var command = args.command;
					if (command == "toggle-sortable") {
						if (button.cssClass == "fa fa-lock") {
							column.sortable = true;
							button.cssClass = "fa fa-unlock";
							button.tooltip = "sorting allowed";
						} else {
							column.sortable = false;
							button.cssClass = "fa fa-lock";
							button.tooltip = "sorting locked"
						}
						grid.invalidate();
					};
					if (command == "toggle-pinToLeft") {
						if(pinCounter < 2){ // allow max three columns to be pinned

							pinCounter++;

							button.cssClass = "glyphicon glyphicon-pushpin";
							button.tooltip = "unpin";
							button.command='toggle-unPinToLeft';
							//column.cssClass="setBorderRight";
							var columns = grid.getColumns();
							var index = grid.getColumnIndex(column.id)
							for(var i = index ; i > pinCounter;i--){
								columns[i] = columns[i-1];
							}
							columns[pinCounter]=column;
							for(var i =0; i < pinCounter; i++){
								columns[i].cssClass="";
							}
							grid.setOptions({ 'frozenColumn':pinCounter });
							grid.setColumns(columns);
						}
						else{
							showMessage('warning','You cannot pin more than 3 columns ');
						}
					};
					if (command == "toggle-unPinToLeft") {
						button.cssClass = "fa fa-thumb-tack";
						button.tooltip = "pin to Left";
						button.command='toggle-pinToLeft';
						//column.cssClass="";
						var columns = grid.getColumns();
						var index = grid.getColumnIndex(column.id)
						for(var i = index ; i < pinCounter;i++){
							columns[i] = columns[i+1];
						}
						columns[pinCounter]=column;

						pinCounter--;
						/*if(pinCounter>= 0)
					{columns[pinCounter].cssClass="setBorderRight";}
					else{columns[0].cssClass="";}*/
						grid.setOptions({ 'frozenColumn':pinCounter })
						grid.setColumns(columns);
					};
				});
				grid.registerPlugin(headerButtonsPlugin);
				grid.onClick.subscribe(function (e,args) {
					var cell = grid.getCellFromEvent(e);
					if (grid.getColumns()[cell.cell].editor == Slick.Editors.Input) {
						this.editActiveCell();
					}
					var cell = grid.getCellFromEvent(e);
					if (grid.getColumns()[cell.cell].id == "removeButton") {
						dataView.deleteItem(dataView.getItem(args.row).id);
						e.stopPropagation();
						_this.updateColumnTotal(columnPicker,dataView,totals,innerSlickID);
					}
					if (grid.getColumns()[cell.cell].id == "PartialButton") {
						showLayer();
						callBackFunctionForPartial(grid,dataView,args.row);
						e.stopPropagation();
						_this.updateColumnTotal(columnPicker,dataView,totals,innerSlickID);
					}
					for (var i = 0; i < columnHead.length; i++) {
						if(grid.getColumns()[cell.cell].id == columnHead[i].dataDtoKey  && (columnHead[i].inputElement == 'button'||columnHead[i].inputElement == 'link')){
							var functionname = columnHead[i].buttonCallback+"";
							window[functionname+""](grid,dataView,args.row);
							e.stopPropagation();
							_this.updateColumnTotal(columnPicker,dataView,totals,innerSlickID);
						}
					}
				});

				grid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow: false}));
				if(showCheckBox){
					grid.registerPlugin(checkboxSelector);
				}

				if(showColumnPicker && updateGrid == undefined){
					columnpicker = new Slick.Controls.ColumnPicker(columnPicker, grid, options);
				}
				/*columnpicker: for hide show columns options on right click of header;*/
				if(updateGrid == undefined){
					dataView.refresh();	  
				}
			}

			// Animate loader off screen

			_this.updateColumnTotal(columnPicker,dataView,totals,innerSlickID);

			//grid.registerPlugin( new Slick.AutoColumnSize());

			dataView.syncGridSelection(grid, true);
			if(updateGrid == undefined){
				var printPlugin = new Slick.Plugins.Print();
				grid.registerPlugin(printPlugin);
				$('#btnprint_'+innerSlickID).on('click', function () {
					var strWindowFeatures = "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes";
					printPlugin.printToWindow(window.open('/ivcargo/resources/js/slickgrid/plugins/print-grid.html', 'print_window', strWindowFeatures));
				});
				var excelPlugin = new Slick.Plugins.Excel();
				grid.registerPlugin(excelPlugin);
				$('#btnexcel_'+innerSlickID).on('click', function () {
					var strWindowFeatures = "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes";
					excelPlugin.printToWindow(window.open('/ivcargo/resources/js/slickgrid/plugins/print-grid.html', 'excel_window', strWindowFeatures));
				});
			}

			//grid.setSortColumn("tt",true); //columnId, ascending
			grid.init();
			//hideOverlay();	
			if (removeSelectAllCheckBox == 'true') {
				$("[title*='Select/Deselect All']").empty()
			}
			return grid;
		},getValueForSelectedData:function(grid){
			var selectedData = [],
			selectedIndexes;
			selectedIndexes = grid.getSelectedRows();
			
			if(selectedIndexes == '' || selectedIndexes == null) {
				showMessage('error', '<i class="fa fa-times-circle"></i> Please, Select atleast one check box !');
				return;
			}
			
			jQuery.each(selectedIndexes, function (index, value) {
				selectedData.push(grid.getData().getItem(value));
			});

			return selectedData;

		},checkToAddRowInTable:function(dataView,columnData,checkDtoName){
			var originalCollection 	= dataView.getItems();
			var newCollection  		= columnData;
			var equals = true;
			jQuery.each(originalCollection, function (originalIndex, originalValue) {
				jQuery.each(newCollection, function (newIndex, newValue) {
					if(originalValue[checkDtoName] == newValue[checkDtoName]){
						equals = false;
						return equals;
					}
				});
				if(!equals){
					return equals;
				}
			});
			return equals;
		},getAllValueFromTable:function(callBackFunc,grid){
			if(callBackFunc != undefined){
				callBackFunc(grid.getData().getItems());
			}
		},updateColumnTotal:function (columnPicker,dataView,totals,innerSlickID){
			var columnsUpdate = columnPicker;
			var columnIdx = columnsUpdate.length;
			while (columnIdx--) {
				var column = columnsUpdate[columnIdx];
				if (!column.hasTotal) {
					continue;
				}
				var total = 0;
				var l = dataView.getLength() ;
				var array = [];
				for(var i = 0; i < l;i++){
					array.push(dataView.getItem(i)[column.field]);
				}

				function sum (array) {
					var total = 0;
					var i = array.length; 

					while (i--) {
						if(!isNaN(parseInt(array[i]))){
							total += parseInt(array[i]);
						}
					}

					return total;
				}
				var total = sum(array);
				if(isNaN(total)){
					total = 0;
				}
				totals[column.id] =total;

				$('#columnTotal_'+innerSlickID+column.id).html(total);
				$('*[data-columnTotal='+innerSlickID+column.id+']').html(total);
				_this.updatePaidAndTopayAmount(dataView,innerSlickID);
				$('*[data-columnTotal='+innerSlickID+'totalNumberofRows]').html(dataView.getLength());

			}  
		},updateRowColor:function(slickgrid,dtoName,equateVal,cssClass){
			slickgrid.getData().getItemMetadata = function(index){
				var item = slickgrid.getData().getItem(index);
				if(item[dtoName] === equateVal) {
					return { cssClasses: cssClass };
				}
			};
			slickgrid.invalidate();
		},updatePaidAndTopayAmount:function(dataView,innerSlickID){
			var l = dataView.getLength();
			var totalTopay 	= 0;
			var totalPaid 	= 0;
			var totalTbb 	= 0;
			var partialLR	= 0;
			for(var i = 0; i < l;i++){
				if(dataView.getItem(i)['wayBillTypeId'] == 2){
					totalTopay += parseInt(dataView.getItem(i)['bookingTotal']);
				}else if(dataView.getItem(i)['wayBillTypeId'] == 1){
					totalPaid += parseInt(dataView.getItem(i)['bookingTotal']);
				} else if(dataView.getItem(i)['wayBillTypeId'] == 4) {
					totalTbb += parseInt(dataView.getItem(i)['bookingTotal']);
				}
				if(dataView.getItem(i)['partial']){
					partialLR = partialLR + 1;
				}
			}
			if(isNaN(totalTopay)){
				totalTopay = 0;
			}
			if(isNaN(totalPaid)){
				totalPaid = 0;
			}
			if(isNaN(totalTbb)){
				totalTbb = 0;
			}

			$('*[data-columnTotal='+innerSlickID+'summarytotalPaidAmount]').html(totalPaid);
			$('*[data-columnTotal='+innerSlickID+'summarytotalToPayAmount]').html(totalTopay);
			$('*[data-columnTotal='+innerSlickID+'summarytotalTbbAmount]').html(totalTbb);
			$('*[data-columnTotal='+innerSlickID+'summarytotalAmount]').html(totalTopay+totalPaid+totalTbb);
			$('*[data-columnTotal='+innerSlickID+'summaryPartial]').html(partialLR);
		},setAggregateFunction:function(grid,column){
			var dataViewObject = grid.getData();
			var columnsArr = new Array();
			var columns = grid.getColumns();
			  columns.forEach(function (col) {
				  if(col.hasTotal){
					  columnsArr.push(new Slick.Data.Aggregators.Sum(col.field));
				  }
			  });
			
			dataViewObject.setGrouping({
			    getter: column,
			    formatter: function (g) {
			      return  g.value + "  <span style='color:green'>(" + g.count + " rows)</span>";
			    },
			    aggregators: columnsArr,
			    aggregateCollapsed: false,
			    lazyTotalsCalculation: true
			  });
		}
	} ;
} );