define(['slickGrid','moment'],function(slickGrid,moment) {
	var _slickThisObj;
	var slickGridInstanceGlobalObj = new Object();
	var callBackFromTableProperty = false;
	return {
		applyGrid:function(jsonInObject) {
			_slickThisObj = this;
			var options = {
					ColumnHead  		: [],  // header row array
					ColumnData  		: [],  // column data with key
					Language  	 		: [],
					//DivId	   	 		: 'slickDivId',
					ShowPager  	 		: false,
					ShowPinToLeft 		: false,
					ShowSorting 		: true,
					ShowColumnPicker 	: false,
					EnableColumnReorder : false,
					ShowCheckBox 		: false,
					ShowGrouping 		: false,
					ShowDeleteButton 	: false,
					ShowPrintButton 	: false,
					ShowExportExcelButton: false,
					ShowPartialButton 	: false,
					EditRowsInSlick		: false,
					InnerSlickId 		: 'mySlickGrid',
					InnerSlickHeight	: '250px',
					EditableColumn 		: false,
					RemoveSelectAllCheckBox: false,
					PagerHeight			: '20px',
					ColumnHiddenConfiguratin: [],
					DivId	   	 		: 'mainDivId',
					PersistGridToAppend : false,
					CallBackFunctionForPartial : null,
					fullTableHeight		: false,
					rowHeight			: 25
			}

			var jsonOptions 	= $.extend(options, jsonInObject);
			var tableProperties	= jsonOptions.tableProperties;
			
			if(tableProperties != undefined) {
				jsonOptions.ShowPrintButton			= tableProperties.showPrintButton;
				jsonOptions.ShowCheckBox			= tableProperties.showCheckBox;
				jsonOptions.RemoveSelectAllCheckBox	= tableProperties.removeSelectAllCheckBox;
				jsonOptions.fullTableHeight			= tableProperties.fullTableHeight;
				jsonOptions.rowHeight				= tableProperties.rowHeight;
				jsonOptions.DivId					= tableProperties.divId;
				jsonOptions.InnerSlickId			= tableProperties.gridDataId;
				jsonOptions.InnerSlickHeight		= tableProperties.gridDataHeight;
				jsonOptions.ShowPartialButton		= tableProperties.showPartialButton;
				jsonOptions.ShowGrouping			= tableProperties.ShowGrouping;
				jsonOptions.multiGroupDtosHM		= tableProperties.multiGroupDtosHM;
				
				callBackFromTableProperty			= false;
				
				if(tableProperties.callBackFunctionForPartial != undefined && tableProperties.callBackFunctionForPartial != ""
					&& (jsonOptions.CallBackFunctionForPartial == undefined || jsonOptions.CallBackFunctionForPartial == null)) {
					jsonOptions.CallBackFunctionForPartial	= tableProperties.callBackFunctionForPartial;
					callBackFromTableProperty				= true;
				}
			}
			
			if(jsonOptions.Language == null)
				jsonOptions.Language	= {};

			if(typeof jsonOptions.fullTableHeight != "undefined")
				fullTableHeight = jsonOptions.fullTableHeight;
			else
				fullTableHeight = false;

			if(fullTableHeight)
				jsonOptions.InnerSlickHeight = jsonOptions.ColumnData.length * (jsonOptions.rowHeight) + 90 + 'px';
			
			if(jsonOptions.PersistGridToAppend == false || typeof slickGridInstanceGlobalObj[jsonOptions.InnerSlickId] == "undefined")
				slickGridInstanceGlobalObj[jsonOptions.InnerSlickId] = _slickThisObj.setSlickTable(jsonOptions); 
			else
				_slickThisObj.appendDatatoSlickTable(jsonOptions);
		}, appendDatatoSlickTable : function(jsonOptions) {
			_slickThisObj = this;
			var gridObj = _slickThisObj.getSlickGridInstance(jsonOptions);
			var dataViewObject = gridObj.getData();
			dataViewObject.beginUpdate();
			
			var uniqueId = dataViewObject.getItems().length;
			var columnData = jsonOptions.ColumnData;
			
			for (var i = 0; i < columnData.length; i++) {
				uniqueId++;
				columnData[i]['id']	= uniqueId + 1;
				dataViewObject.insertItem(0, columnData[i]);
			} 
			
			dataViewObject.endUpdate();
			gridObj.invalidate();
		}, setSlickTable : function(jsonOptions){
			_slickThisObj.slickStructureTable(jsonOptions);

			var columns = []; // columns array for SlickGrid Object
			var columnPicker = []; // columns array for SlickGrid Object

			_slickThisObj.checkBoxColumn(jsonOptions, columns);
			_slickThisObj.removeButtonColumn(jsonOptions, columns);
			_slickThisObj.partialButtonColumn(jsonOptions, columns);
			_slickThisObj.serialNumberColumn(jsonOptions, columns, columnPicker);

			var buttonsObjCol = _slickThisObj.headerButton(jsonOptions);

			var columnHead 		= jsonOptions.ColumnHead;
			var language 		= jsonOptions.Language;
			var showGrouping 	= typeof jsonOptions.ShowGrouping != "undefined" ? jsonOptions.ShowGrouping : false;
			var multiGroupDtos	= jsonOptions.multiGroupDtosHM;
			
			function sorterData(a, b) {
				var regex	= /^\d{2}[./-]\d{2}[./-]\d{4}$/
				let regex1	= /\b(AM|PM)\b/i;
								
				if (typeof a[sortcol] === 'string' && a[sortcol].match(regex1) && b[sortcol].match(regex1)) {
					const d1 = parseDateTime(a[sortcol]);
					const d2 = parseDateTime(b[sortcol]);

					if (d1 > d2) return sortdir * 1;
					else if (d1 < d2) return sortdir * -1;
					else return sortdir * 0;
				} else if (regex.test(a[sortcol]) && regex.test(b[sortcol])) {
					var momentA = moment(a[sortcol], "DD/MM/YYYY");
					var momentB = moment(b[sortcol], "DD/MM/YYYY");
					if (momentA > momentB) return sortdir * 1;
					else if (momentA < momentB) return sortdir * -1;
					else return sortdir * 0;
				} else {// check if numeric should pass to numeric sorting else String comparison
					var x = a[sortcol], y = b[sortcol];
						
					if(parseInt(x) > 0)
						return sorterNumeric(a,b);
					else
						return sortdir * (x === y ? 0 : (x > y ? 1 : -1));
				}
			}
			
			function sorterNumeric(a,b){
				var x = (isNaN(a[sortcol]) || a[sortcol] === "" || a[sortcol] === null) ? -99e+10 : parseFloat(a[sortcol]);
				var y = (isNaN(b[sortcol]) || b[sortcol] === "" || b[sortcol] === null) ? -99e+10 : parseFloat(b[sortcol]);
				return sortdir * (x === y ? 0 : (x > y ? 1 : -1));
			}
			
			function requiredFieldValidator(value) {
				return {valid: true, msg: 'Should be less then current date'};
			}
			
			for (var i = 0; i < columnHead.length; i++) {
				var name			= columnHead[i].title;
				var dataDtoKey		= columnHead[i].dataDtoKey;
				var columnMinWidth	= columnHead[i].columnMinWidth;
				var columnWidth		= columnHead[i].columnWidth;
				
				if(language[columnHead[i].labelId] != undefined)
					name	= language[columnHead[i].labelId];
					
				if(columnHead[i].inputElement == 'button') {
					columns.push({ 
						id			:  	dataDtoKey, 
						name 		: 	name, 
						minWidth	: 	columnMinWidth,
						searchFilter:	false,
						listFilter	:	false,
						hasTotal	:	false,
						buttonCss	:	columnHead[i].buttonCss,
						width		: 	columnWidth,
						formatter	:	Slick.Formatters.Button,
						cssClass	:	columnHead[i].columnDisplayCssClass,
						dataType	:	'button'});
					continue;
				} else if(columnHead[i].dataType == 'input'){
					columns.push({ 
						id			:  	dataDtoKey,
						name		:	name, 
						field		: 	dataDtoKey,
						minWidth	:	columnMinWidth,
						width		: 	columnWidth,
						sortable	: 	false,
						hasTotal	:	columnHead[i].displayColumnTotal,
						cssClass	:	columnHead[i].columnDisplayCssClass,
						searchFilter:	false,
						listFilter	:	false,
						dataType	:	'text',
						printWidth	:	columnHead[i].columnPrintWidthInPercentage,
						valueType	:	columnHead[i].dataType,
						buttonCss	:	columnHead[i].buttonCss,
						toolTip		:	name,
						slickId		:	jsonOptions.InnerSlickId,
						sorter		:	sorterData,
						maxLength	: 	columnHead[i].maxLength,
						formatter	:	Slick.Formatters.Input,
						editor		: 	Slick.Editors.Input
					});
					
					columnPicker.push({
						id				:  	dataDtoKey,
						name			:	name, 
						field			: 	dataDtoKey,
						minWidth		:	columnMinWidth,
						width			: 	columnWidth,
						sortable		: 	true,
						hasTotal		:	columnHead[i].displayColumnTotal,
						cssClass		:	columnHead[i].columnDisplayCssClass,
						searchFilter	:	true,
						listFilter		:	true,
						dataType		:	'text',
						printWidth		:	columnHead[i].columnPrintWidthInPercentage,
						valueType		:	columnHead[i].dataType,
						toolTip			:	name,
						slickId			:	jsonOptions.InnerSlickId,
						sorter			:	sorterData,
						formatter		:	Slick.Formatters.DefaultValues,
						validator		:	requiredFieldValidator,
						editor			:	eval(columnHead[i].editor),
						header			: 	{buttons: buttonsObjCol}
					});
					continue;
				}
				
				if(eval(columnHead[i].editor) == Slick.Editors.Date) {
					var fieldPropertyStr = { 
							id				:  	dataDtoKey,
							name			:	name, 
							field			: 	dataDtoKey,
							minWidth		:	columnMinWidth,
							width			: 	columnWidth,
							sortable		: 	true,
							hasTotal		:	columnHead[i].displayColumnTotal,
							cssClass		:	columnHead[i].columnDisplayCssClass,
							searchFilter	:	true,
							listFilter		:	true,
							dataType		:	'text',
							printWidth		:	columnHead[i].columnPrintWidthInPercentage,
							valueType		:	columnHead[i].dataType,
							toolTip			:	name,
							slickId			:	jsonOptions.InnerSlickId,
							sorter			:	sorterData,
							formatter		:	Slick.Formatters.DefaultValues,
							validator		:	requiredFieldValidator,
							editor			:	eval(columnHead[i].editor),
							header			: 	{buttons: buttonsObjCol}
					} ;
				} else {
					var fieldPropertyStr = { 
							id				:  	dataDtoKey,
							name			:	name, 
							field			: 	dataDtoKey,
							minWidth		:	columnMinWidth,
							width			: 	columnWidth,
							sortable		: 	true,
							hasTotal		:	columnHead[i].displayColumnTotal,
							cssClass		:	columnHead[i].columnDisplayCssClass,
							searchFilter	:	true,
							listFilter		:	true,
							dataType		:	'text',
							printWidth		:	columnHead[i].columnPrintWidthInPercentage,
							valueType		:	columnHead[i].dataType,
							toolTip			:	name,
							slickId			:	jsonOptions.InnerSlickId,
							sorter			:	sorterData,
							formatter		:	Slick.Formatters.DefaultValues,
							header			: 	{buttons: buttonsObjCol}
					};
				}

				if(columnHead[i].labelValue != "" && columnHead[i].labelValue != undefined)
					fieldPropertyStr.name = columnHead[i].labelValue;

				if(columnHead[i].displayColumnTotal)
					fieldPropertyStr.groupTotalsFormatter = _slickThisObj.sumTotalsFormatter;

				if(typeof searchFilterConfiguration  != "undefined" )
					fieldPropertyStr.searchFilter 	= searchFilterConfiguration[columnHead[i].elementConfigKey] == 'true';

				if(typeof listFilterConfiguration  != "undefined")
					fieldPropertyStr.listFilter 	= listFilterConfiguration[columnHead[i].elementConfigKey] == 'true';

				if(typeof columnHiddenConfiguration != "undefined") {
					if(columnHiddenConfiguration[columnHead[i].elementConfigKey] == 'true')
						columns.push(fieldPropertyStr);
					
					columnPicker.push(fieldPropertyStr);
				} else {
					columns.push(fieldPropertyStr);
					columnPicker.push(fieldPropertyStr);
				}
			}

			var  dataView;
			var groupItemMetadataProvider = new Slick.Data.GroupItemMetadataProvider();
			var columnData = jsonOptions.ColumnData;
			
			for (var i = 0; i < columnData.length; i++) {
				columnData[i]['id'] = parseInt(i) + 1;
			} // adding row number to the table
			
			var old = JSON.stringify(columnData) //convert to JSON string
			columnData = JSON.parse(old);  // for removing null values in the jsonstring from webservice

			dataView = new Slick.Data.DataView({ inlineFilters: true ,groupItemMetadataProvider: groupItemMetadataProvider});
			dataView.setItems(columnData);

			grid = new Slick.Grid("#"+jsonOptions.InnerSlickId, dataView, columns, {
				enableCellNavigation	: 	true,
				multiColumnSort			: 	true,
				enableColumnReorder		: 	jsonOptions.EnableColumnReorder,
				frozenColumn			: 	-1,
				fullWidthRows			:	true,
				rowHeight				: 	30,
				enableAsyncPostRender	: 	true,
				showFooterRow			: 	true,
				autoHeight				:	jsonOptions.NoVerticalScrollBar,
				autoEdit				:	true,
				editable				:	true
			});

			grid.init();
			grid.registerPlugin(groupItemMetadataProvider);
			_slickThisObj.registerSlickGridPlugins(columnPicker, jsonOptions, grid, dataView, jsonOptions.InnerSlickId);

			if (jsonOptions.RemoveSelectAllCheckBox == 'true' || jsonOptions.RemoveSelectAllCheckBox == true)
				$("[title*='Select/Deselect All']").empty();
			
			if(showGrouping && multiGroupDtos != undefined)
				_slickThisObj.setMultigroupingRules(grid, multiGroupDtos, options);

			return grid;
		}, registerSlickGridPlugins : function(columnPicker, jsonOptions, grid, dataView, innerSlickID) {
			grid.setSelectionModel(new Slick.CellSelectionModel());

			if(jsonOptions.ShowCheckBox)
				grid.registerPlugin(jsonOptions.CheckboxSelector);

			var totals = {};
			
			var pager = new Slick.Controls.Pager(dataView, grid, $("#pager_"+innerSlickID)); // for pager id
			grid.onFooterRowCellRendered.subscribe(function (e, args) {
				$(args.node).empty();
				if(args.column.hasTotal == true){
					$("<span id='columnTotal_"+innerSlickID+args.column.id+"' data-columnTotal="+innerSlickID+args.column.id+" class='footerTotal'>"+totals[args.column.id]+"</span>")
					.appendTo(args.node);
				}
			});

			grid.onPageChanged.subscribe(function() {
				_slickThisObj.updateColumnTotal(columnPicker, dataView, totals, innerSlickID);
			});

			grid.onSelectedRowsChanged.subscribe(function(e, args) {
				_slickThisObj.updateColumnTotal(columnPicker, dataView, totals, innerSlickID);
			});
			
			grid.onCellChange.subscribe(function(e, args) {
				_slickThisObj.updateColumnTotal(columnPicker, dataView, totals, innerSlickID);
			});
			
			grid.onBeforeCellEditorDestroy.subscribe(function(e, args) {
				_slickThisObj.updateColumnTotal(columnPicker, dataView, totals, innerSlickID);
			});
			
			grid.onCellCssStylesChanged.subscribe(function(e, args) {
				_slickThisObj.updateColumnTotal(columnPicker, dataView, totals, innerSlickID);
			});
			
			grid.onHeaderClick.subscribe(function(e, args) {
				_slickThisObj.updateColumnTotal(columnPicker, dataView, totals, innerSlickID);
			});

			dataView.onRowCountChanged.subscribe(function (e, args) {
				grid.updateRowCount();
				grid.render();
				_slickThisObj.updateColumnTotal(columnPicker, dataView, totals, innerSlickID);
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
				_slickThisObj.updateColumnTotal(columnPicker, dataView, totals, innerSlickID);
				grid.invalidate();
				// Excel like status bar at the bottom
				var status;

				if (dataView.getLength() === dataView.getItems().length)
					status = "";
				else
					status = dataView.getLength() + ' OF ' + dataView.getItems().length + ' RECORDS FOUND';
				
				$('#status-label_' + innerSlickID).text(status);
				_slickThisObj.updateColumnTotal(columnPicker, dataView, totals, innerSlickID);
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
				if (!column.editor)
					return;

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
			
			var headerButtonsPlugin = new Slick.Plugins.HeaderButtons();
			headerButtonsPlugin.onCommand.subscribe(function(e, args) {
				var column = args.column;
				var button = args.button;
				var command = args.command;
				
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
				var gridObj = args.grid;
				var dataView = gridObj.getData();
				var cell = gridObj.getCellFromEvent(e);
				if (cell != null && gridObj.getColumns()[cell.cell].editor == Slick.Editors.Input) {
					this.editActiveCell();
				}
				var cell = gridObj.getCellFromEvent(e);
				if (cell != null && gridObj.getColumns()[cell.cell].id == "removeButton") {
					
					if(typeof jsonOptions.CallBackFunctionForRemove !== 'undefined') {
						var functionName = jsonOptions.CallBackFunctionForRemove;
						functionName(gridObj,dataView,args.row);
					}
					
					dataView.deleteItem(dataView.getItem(args.row).id);
					e.stopPropagation();
					gridObj.invalidate();
				}
				
				if (cell != null && gridObj.getColumns()[cell.cell].id == "PartialButton") {
					//showLayer();
					var functionname = jsonOptions.CallBackFunctionForPartial;
					
					if(callBackFromTableProperty)
						window[functionname + ""](gridObj, dataView, args.row);
					else
						functionname(gridObj, dataView, args.row);
					
					e.stopPropagation();
					_slickThisObj.updateColumnTotal(columnPicker, dataView, totals, innerSlickID);
				}

				var columnHead = jsonOptions.ColumnHead;

				for (var i = 0; i < columnHead.length; i++) {
					if(gridObj.getColumns()[cell.cell].id == columnHead[i].dataDtoKey  && (columnHead[i].inputElement == 'button' || columnHead[i].inputElement == 'link')) {
						var functionname = columnHead[i].buttonCallback + "";
						window[functionname + ""](gridObj, dataView, args.row);
						e.stopPropagation();
						_slickThisObj.updateColumnTotal(columnPicker, dataView, totals, innerSlickID);
					}
				}
			});
			
			grid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow: false}));

			dataView.refresh();	  

			// Animate loader off screen

			_slickThisObj.updateColumnTotal(columnPicker,dataView,totals,innerSlickID);

			//grid.registerPlugin( new Slick.AutoColumnSize());
      
			dataView.syncGridSelection(grid, true);
			
			var printPlugin = new Slick.Plugins.Print();
			grid.registerPlugin(printPlugin);
			$('#btnprint_' + innerSlickID).off('click').on('click', function () {
							let strWindowFeatures = "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes";
							printPlugin.printToWindow(window.open('/ivcargo/resources/js/slickgrid/plugins/print-grid.html', `printWindow_${innerSlickID}_${Date.now()}`, strWindowFeatures));
				});
				
			dataView.onRowsChanged.subscribe(function (e, args) {
				grid.updateRowCount();
				grid.invalidateRows(args.rows);
				grid.render();
				_slickThisObj.updateColumnTotal(columnPicker,dataView,totals,innerSlickID);
			});
		}, serialNumberColumn : function(jsonOptions, columns, columnPicker){
			_slickThisObj = this;
			buttonsObj = _slickThisObj.headerButton(jsonOptions);
			// for adding Sr No column to Table
			var idFieldPropertyStr = { id:  'id',  field:'id', name:jsonOptions.Language['serialnumberheader'], width: 50 ,sortable: false,
					formatter: Slick.Formatters.SerialNumber,cssClass:'column-data-left-align',
					searchFilter:false,listFilter:false, dataType:'text',hasTotal:false,printWidth:10,
					toolTip:jsonOptions.Language['serialnumberheader'],
					header: {
						buttons: buttonsObj
					}
			}
			
			if(typeof jsonOptions.SerialNo != "undefined"){
				if(jsonOptions.SerialNo[0].SearchFilter != "undefined" && jsonOptions.SerialNo[0].SearchFilter != undefined)
					idFieldPropertyStr.searchFilter = jsonOptions.SerialNo[0].SearchFilter;
				
				if(jsonOptions.SerialNo[0].ListFilter != "undefined" && jsonOptions.SerialNo[0].ListFilter != undefined)
					idFieldPropertyStr.listFilter = jsonOptions.SerialNo[0].ListFilter;
				
				if(jsonOptions.SerialNo[0].title != undefined) {
					idFieldPropertyStr.name 	= jsonOptions.SerialNo[0].title;
					idFieldPropertyStr.toolTip 	= jsonOptions.SerialNo[0].title;
				}
				
				if(jsonOptions.SerialNo[0].showSerialNo != "undefined" && jsonOptions.SerialNo[0].showSerialNo) {
					columns.push(idFieldPropertyStr);
					columnPicker.push(idFieldPropertyStr);
				}
			}
		}, partialButtonColumn : function(jsonOptions, columns) {
			var language = jsonOptions.Language;
			
			if(jsonOptions.ShowPartialButton){
				columns.push({ id:'PartialButton',  field:'PartialButton', name:language['partialheader'], 
					width: 80 ,searchFilter:false,listFilter:false,hasTotal:false,buttonCss:'btn btn-primary btn-xs',
					formatter:Slick.Formatters.Button,cssClass:'column-data-left-align',dataType:'button',
				});
			}
		}, removeButtonColumn : function(jsonOptions, columns) {
			var language = jsonOptions.Language;
			
			var name = 'Remove';
			
			if(language['removeheader'] != undefined)
				name	= language['removeheader'];
			
			if(jsonOptions.ShowDeleteButton){
				columns.push({id : 'removeButton',field :'removeButton',name : name, 
					width :80, searchFilter	:	false, listFilter :	false, hasTotal	:false,
					buttonCss :	'btn btn-danger btn-xs',formatter :	Slick.Formatters.Button,
					cssClass :	'column-data-left-align', dataType :'button'
				});
			}
		}, checkBoxColumn : function(jsonOptions, columns) {
			if(jsonOptions.ShowCheckBox) {
				var checkboxSelector = new Slick.CheckboxSelectColumn({
					cssClass: "slick-cell-checkboxsel column-data-left-align"
				});
				jsonOptions.CheckboxSelector = checkboxSelector;
				columns.push(checkboxSelector.getColumnDefinition());
			}
		}, headerButton : function(jsonOptions) {
			var buttonsObj = [];
			if(jsonOptions.ShowSorting){
				/*buttonsObj.push( {
					cssClass: "fa fa-lock",
					command: "toggle-sortable",
					tooltip: "sorting locked"
				});*/
			}

			if(jsonOptions.ShowPinToLeft){
				buttonsObj.push({
					cssClass: "fa fa-thumb-tack",
					command: "toggle-pinToLeft",
					tooltip: "pin to Left"
				});
			}
			return buttonsObj;
		}, slickStructureTable : function(jsonOptions) {
			var $status			= $("<div id='status_" + jsonOptions.InnerSlickId + "'><label id='status-label_" + jsonOptions.InnerSlickId + "'></label></div>");
			var $print 			= $("<div id='print_" + jsonOptions.InnerSlickId + "'><button id='btnprint_" + jsonOptions.InnerSlickId + "' class='btn btn-primary'><i class='glyphicon glyphicon-print'></i> Print</button></div>");
			var $excel 			= $("<div id='excel_" + jsonOptions.InnerSlickId + "'style='padding-left: 5px;'><button id='btnexcel_" + jsonOptions.InnerSlickId + "' class='btn btn-primary'><i class='glyphicon glyphicon-download-alt'></i> Download Excel</button></div>");
			var $buttonDiv		= $("<div id='buttonDiv_" + jsonOptions.InnerSlickId + "' style='display: flex;'>");
			var $buttonCloseDiv	= $("</div>");
			var $mySlickGrid 	= $("<div id='" + jsonOptions.InnerSlickId + "' style='width: 100%;height:" + jsonOptions.InnerSlickHeight + ";'></div>");

			if(jsonOptions.ShowPager)
				$("#" + jsonOptions.DivId).append($("<div id='pager_" + jsonOptions.InnerSlickId + "' style='width: 100%; height: " + jsonOptions.PagerHeight + "'/></div>"));
			
			if(document.getElementById(jsonOptions.InnerSlickId) == null) {
				$("#" + jsonOptions.DivId).append($buttonDiv);

				if(jsonOptions.ShowPrintButton && document.getElementById("btnprint_" + jsonOptions.InnerSlickId) == undefined)
					$("#buttonDiv_" + jsonOptions.InnerSlickId).append($print);

				if(jsonOptions.ShowExportExcelButton && document.getElementById("btnexcel_" + jsonOptions.InnerSlickId) == undefined)
					$("#buttonDiv_" + jsonOptions.InnerSlickId).append($excel);

				$("#" + jsonOptions.DivId).append($buttonCloseDiv);
				$("#" + jsonOptions.DivId).append($mySlickGrid);
				$("#" + jsonOptions.DivId).append($status);
			}
		}, sumTotalsFormatter : function(totals, columnDef) {
			var val = totals.sum && totals.sum[columnDef.field];

			if (val != null)
				return "<b> " + ((parseFloat(val) * 100) / 100) + "</b>";

			return "";
		}, getValueForSelectedData : function(jsonOptions, selectionMsg) {
			_slickThisObj = this;
			var griDobj = _slickThisObj.getSlickGridInstance(jsonOptions);
			var selectedData = [],
			selectedIndexes = griDobj.getSelectedRows();

			if(selectedIndexes == '' || selectedIndexes == null) {
				if(typeof selectionMsg == 'undefined')
					selectionMsg	= ' Please, Select atleast one checkbox !'
				
				showMessage('error', '<i class="fa fa-times-circle"></i>' + selectionMsg);
				return;
			}

			jQuery.each(selectedIndexes, function (index, value) {
				var data = griDobj.getData().getItem(value);
				
				if(typeof data != 'undefined')
					selectedData.push(data);
			});

			return selectedData;
		}, updateColumnTotal : function (columnPicker, dataView, totals, innerSlickID) {
			var columnsUpdate = columnPicker;
			var columnIdx = columnsUpdate.length;
			
			while (columnIdx--) {
				var column = columnsUpdate[columnIdx];
			
				if (!column.hasTotal)
					continue;
			
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
						if(!isNaN(parseFloat(array[i])))
							total += parseFloat(array[i]);
					}

					return Math.round(total);
				}

				var total = sum(array);

				if(isNaN(total))
					total = 0;

				totals[column.id] = total;

				$('#columnTotal_' + innerSlickID + column.id).html(total);
				$('*[data-columnTotal=' + innerSlickID + column.id + ']').html(total);
				_slickThisObj.updatePaidAndTopayAmount(dataView, innerSlickID);
				$('*[data-columnTotal=' + innerSlickID + 'totalNumberofRows]').html(dataView.getLength());
			}  
		}, updatePaidAndTopayAmount: function(dataView, innerSlickID) {
			if (typeof lsPropertyConfig !== 'undefined' && lsPropertyConfig.showChargeWeightInSummary)
				$('#chargeWtSummary').removeClass('hide');
				
			var l = dataView.getLength();
			var totalTopay = 0, totalPaid = 0, totalTbb = 0, partialLR = 0, chargeWeight = 0;

			for (var i = 0; i < l; i++) {
				var item = dataView.getItem(i);
				
				var bookingTotal = parseFloat(item['bookingTotal']) || 0;
				var wayBillTypeId = item['wayBillTypeId'];
				var amountToAdd = 0;

				if (typeof lsPropertyConfig !== 'undefined' && lsPropertyConfig.showAmountBasedOnLoadedArt) {
					var totalQty = parseFloat(item['totalQuantity']) || 0;
					var pendingQty = parseFloat(item['pendingQuantity']) || 0;
					var perUnitRate = totalQty > 0 ? bookingTotal / totalQty : 0;
					amountToAdd = Math.round(perUnitRate * pendingQty);
				} else {
					amountToAdd = bookingTotal;
				}

				if (wayBillTypeId === 1) totalPaid += amountToAdd;
				else if (wayBillTypeId === 2) totalTopay += amountToAdd;
				else if (wayBillTypeId === 4) totalTbb += amountToAdd;

				if (item['partial']) partialLR++;
				
				if (typeof lsPropertyConfig !== 'undefined' && lsPropertyConfig.showChargeWeightInSummary) 
					chargeWeight += item['consignmentSummaryChargeWeight']
			}
			
			totalTopay = isNaN(totalTopay) ? 0 : Math.round(totalTopay);
			totalPaid = isNaN(totalPaid) ? 0 : Math.round(totalPaid);
			totalTbb = isNaN(totalTbb) ? 0 : Math.round(totalTbb);

			var totalAmount = totalTopay + totalPaid + totalTbb;

			$('*[data-columnTotal=' + innerSlickID + 'summarytotalPaidAmount]').html(totalPaid);
			$('*[data-columnTotal=' + innerSlickID + 'summarytotalToPayAmount]').html(totalTopay);
			$('*[data-columnTotal=' + innerSlickID + 'summarytotalTbbAmount]').html(totalTbb);
			$('*[data-columnTotal=' + innerSlickID + 'summarytotalAmount]').html(totalAmount);
			$('*[data-columnTotal=' + innerSlickID + 'summaryPartial]').html(partialLR);
			$('*[data-columnTotal=' + innerSlickID + 'SummaryChargeWeight]').html(chargeWeight);			
			
		}, updateRowColor : function(jsonOptions, dtoName, equateVal, cssClass) {
			_slickThisObj = this;
			var slickgrid = _slickThisObj.getSlickGridInstance(jsonOptions);
			var indexArr = new Array();
			
			if(typeof slickgrid !== "undefined"){
				slickgrid.getData().getItemMetadata = function(index){
					var itemValue = slickgrid.getData().getItem(index);
					indexArr.push(index);
			
					if(typeof itemValue != 'undefined' && itemValue[dtoName] === equateVal && typeof itemValue[dtoName] != 'undefined' ) {
						return { cssClasses: cssClass };
					}
				};
			
				slickgrid.invalidate(indexArr);
			}
		}, checkToAddRowInTable : function(jsonInOptions, columnData, checkDtoName) {
			_slickThisObj = this;
			var gridObj = _slickThisObj.getSlickGridInstance(jsonInOptions);
			
			if(typeof gridObj == "undefined")
				return false;
			
			var originalCollection 	= gridObj.getData().getItems();
			var newCollection  		= columnData;
			var equals = false;
			
			jQuery.each(originalCollection, function (originalIndex, originalValue) {
				jQuery.each(newCollection, function (newIndex, newValue) {
					if(originalValue[checkDtoName] == newValue[checkDtoName]){
						equals = true;
						return equals;
					}
				});
			
				if(equals)
					return equals;
			});

			return equals;
		}, getSlickGridInstance : function(jsonInOptions) {
			return slickGridInstanceGlobalObj[jsonInOptions.InnerSlickId];
		}, setAggregateFunction : function(grid, column) {
			var dataViewObject = grid.getData();
			var columnsArr = new Array();
			var columns = grid.getColumns();
			
			columns.forEach(function (col) {
				if(col.hasTotal)
					columnsArr.push(new Slick.Data.Aggregators.Sum(col.field));
			});

			dataViewObject.setGrouping({
				getter: column,
				formatter: function (g) {
					return  g.value + "  <span style='color:green'>(" + g.count + " rows)</span>";
				},
				aggregators: columnsArr,
				aggregateCollapsed: false,
				lazyTotalsCalculation: true,
				comparer: function (a, b) {
					var x = a['value'], y = b['value'];
					return 1 * (x === y ? 0 : (x > y ? 1 : -1));
				    },
			});
		}, resetSlickGridInstance : function(jsonInOptions){
			slickGridInstanceGlobalObj = new Object();
		}, limitCheckboxSelection(jsonOptions, limitCheckBox, noOfCheckBoxToLimit) {
			_slickThisObj = this;
			
			var griDobj = _slickThisObj.getSlickGridInstance(jsonOptions);
			var selectedIndexes = griDobj.getSelectedRows();
			
			if(limitCheckBox) {
				const dataView = griDobj.getData();
				const selectedRows = selectedIndexes;
				const maxSelection = noOfCheckBoxToLimit;
					
				if (selectedRows.length > maxSelection) {
					griDobj.setSelectedRows(selectedRows.slice(0, selectedRows.length - Math.abs(selectedRows.length - maxSelection)));
					// Unselect the last selected row if the maximum selection limit is reached
					if (selectedRows.indexOf(griDobj.row) === -1) {
						dataView.syncGridSelection(griDobj, true);
						showMessage('warning', 'You cannot Select more than ' + maxSelection + ' checkbox !');
						return false;
					}
				}
			}
			
			return true;
		}, unselectAllCheckboxes(grid) {
				var selectionModel = grid.getSelectionModel();
				selectionModel.setSelectedRows([]);
		}, selectCheckboxesInRange(grid, jsonObj) {
			var starter = (jsonObj.fromNum) - 1;
			var to		= jsonObj.toNum;
		 	var selectionModel = grid.getSelectionModel();
			var checkboxes = [];
			
			if((Number(to)) > grid.getDataLength()){
				showMessage('warning','<i class="fa fa-warning"></i> Invalid range. To Value cannot be greater than ' +  grid.getDataLength() + ".");
				return false;
			}
			
			if(jsonObj.checkMaxDifference){	
				if ((Number(to) - Number(jsonObj.fromNum)) > jsonObj.maxSelection) {
					showMessage('warning','<i class="fa fa-warning"></i> Invalid range. Difference cannot be greater than ' + jsonObj.maxSelection + ".");
					return false;
				}
			}
			
			for (var i = starter ; i < to; i++) {
				checkboxes.push(i);
			}
			
			selectionModel.setSelectedRows(checkboxes);
			// Redraw the grid to reflect the changes
			grid.invalidate();
			grid.render();
			return true;
		}, setMultigroupingRules : function(grid, multiGroupDtosHM, options) {
			var dataViewObject = grid.getData();
			var columnsArr 	= new Array();
			var columns 	= grid.getColumns();
			
			columns.forEach(function (col) {
				if(col.hasTotal)
					columnsArr.push(new Slick.Data.Aggregators.Sum(col.field));
			});
			
			let dateWiseSortOrder	= options.dateWiseSortOrder;
			let groupingWithoutLabel= options.groupingWithoutLabel;
			
			if(groupingWithoutLabel == undefined)
				groupingWithoutLabel = false;
			
			let newList = [];
			
			for(let key in multiGroupDtosHM) {
				var obj1		= {};
						
				obj1.label	= multiGroupDtosHM[key];
				obj1.getter	= key;
						
				newList.push(obj1);
			}
			
			for(let i = 0; i < newList.length; i++) {
				var obj		= newList[i];
				
				if(groupingWithoutLabel) {
					obj.formatter	= function (g) {
						return g.value + " <span style='color:green'>(" + g.count + " rows)</span>";
					};
				} else {
					obj.formatter	= function (g) {
						return this.label + " : " + g.value + " <span style='color:green'>(" + g.count + " rows)</span>";
					};
				}
				
				if(i == newList.length - 1) {
					obj.aggregators	= columnsArr;
					obj.collapsed = true
				}
					
				if(obj.aggregateCollapsed == undefined)
					obj.aggregateCollapsed		= true;
					
				if(obj.lazyTotalsCalculation == undefined)
					obj.lazyTotalsCalculation	= true;
					
				obj.comparer	= function (a, b) {
					var x = a['value'], y = b['value'];
					return _this.sortData(x, y, dateWiseSortOrder);
				};
			}

			dataViewObject.setGrouping(newList);
		}, updateMultiRowColor : function(jsonOptions) {
			let lsPropertyConfig = jsonOptions.lsPropertyConfig;
			
			_slickThisObj = this;
			var slickgrid = _slickThisObj.getSlickGridInstance(jsonOptions);
			var indexArr = new Array();
			
			if(typeof slickgrid !== "undefined") {
				slickgrid.getData().getItemMetadata = function(index) {
					var itemValue = slickgrid.getData().getItem(index);
					indexArr.push(index);
					
					if(typeof itemValue != 'undefined') {
						if(typeof itemValue['isTceBooking'] != 'undefined' && itemValue['isTceBooking'] === true)
							return { cssClasses: 'highlight-row-lightBlue' };
						else {
							if(typeof itemValue['txnType'] != 'undefined' && itemValue['txnType'] === 2)
								return { cssClasses: 'highlight-row-onchange' };
							
							if(typeof itemValue['deliveryToId'] != 'undefined' && itemValue['deliveryToId'] === 7)
								return { cssClasses: 'highlight-row-onchange-blue' };
						}
							
						if(lsPropertyConfig.showPartyIsBlackListedParty && typeof itemValue['partyBlackListed'] != 'undefined' && itemValue['partyBlackListed'] === 1)
							return { cssClasses: 'highlight-row-red' };
						
						if(lsPropertyConfig.removeLRForShortExcessReceive) {
							if(typeof itemValue['shortReceive'] != 'undefined' && itemValue['shortReceive'] === 1)
								return { cssClasses: 'highlight-row-red' };
							
							if(typeof itemValue['excessReceive'] != 'undefined' && itemValue['excessReceive'] === 1)
								return { cssClasses: 'highlight-row-blue' };
						}
					}
				};
			
				slickgrid.invalidate(indexArr);
			}
		}, sortData : function(a, b, dateWiseSortOrder) {
			//date support dd-mm-yyyy please change if any date format is changed
			let regex = /^\d{2}[./-]\d{2}[./-]\d{4}$/;
					
			if(dateWiseSortOrder == undefined)
				dateWiseSortOrder	= 0;
					
			if (regex.test(a) && regex.test(b)) {
				let momentA = moment(a, "DD-MM-YYYY");
				let momentB = moment(b, "DD-MM-YYYY");
						
				if(dateWiseSortOrder == 0)//Ascending
					return momentA.isBefore(momentB) ? -1 : 1;
						
				return momentA.isBefore(momentB) ? 1 : -1;
			} else {// check if numeric should pass to numeric sorting else String comparison
				let x = a, y = b;
					
				let z = (x > y ? 1 : -1);
							
				if(parseInt(x) > 0 ) return _this.sorterNumeric(a, b);
				else return 1 * (x === y ? 0 : z);
			}
		}, sorterNumeric : function(a, b) {
			let x = (isNaN(a) || a === "" || a === null) ? -99e+10 : parseFloat(a);
			let y = (isNaN(b) || b === "" || b === null) ? -99e+10 : parseFloat(b);
					
			let z = (x > y ? 1 : -1);
					
			return 1 * (x === y ? 0 : z);
		}
	} ;
} );

function searchUrl() {
	return 'search.do?pageId=5&eventId=3&wayBillId=';
}

function searchUrlNew() {
	return 'search.do?pageId=5&eventId=3&enwayBillId=';
}

function wayBillSearch(grid, dataView, row) {
	let item 	= dataView.getItem(row);
	
	if(item.encryptedWayBillId != undefined)
		window.open(searchUrlNew() + item.encryptedWayBillId + '&TypeOfNumber=' + LR_SEARCH_TYPE_ID);
	else if(item.wayBillId != undefined && item.wayBillId > 0)
		window.open(searchUrl() + item.wayBillId + '&TypeOfNumber=' + LR_SEARCH_TYPE_ID);
}

function getDDMPrint(grid, dataView, row) {
	window.open('DoorDeliveryPrint.do?pageId=304&eventId=5&deliveryRunSheetLedgerId='+dataView.getItem(row).deliveryRunSheetLedgerId, 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function getCRPrint(grid, dataView, row){
	 window.open('printWayBill.do?pageId=340&eventId=10&modulename=multiCRPrint&masterid='+dataView.getItem(row).crId,'newwindow', config='height=300,width=425, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function getSinglePrint(grid, dataView, row) {
	window.open('printWayBill.do?pageId=340&eventId=10&modulename=crPrint&masterid='+dataView.getItem(row).crId+'&isCrPdfAllow=false&multipleCrPrint=false','newwindow', config='height=300,width=425, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function lsSearch(grid, dataView, row) {
	let item	= dataView.getItem(row);
	
	if(item.encryptedDlId != undefined)
		window.open(searchUrlNew() + item.encryptedDlId + '&wayBillNumber=' + item.lsNumber + '&TypeOfNumber=' + SEARCH_TYPE_ID_LS);
	else if(item.dispatchLedgerId != undefined && item.dispatchLedgerId > 0)
		window.open(searchUrl() + item.dispatchLedgerId + '&wayBillNumber=' + item.lsNumber + '&TypeOfNumber=' + SEARCH_TYPE_ID_LS);
}

function matahdiSearch(grid, dataView, row) {
	let item 	= dataView.getItem(row);
	
	if(item.loadingHamaliLedgerId != undefined && item.loadingHamaliLedgerId > 0)
		window.open('modules.do?pageId=340&eventId=1&modulename=searchDetails&masterid=' + item.loadingHamaliLedgerId + '&masterid2=' + item.loadingHamaliNumber+ '&branchId=' + item.branchId + '&TypeOfNumber=' + SEARCH_TYPE_ID_MATHADI_NUMBER);
}

function lsBillNumberSearch(grid, dataView, row) {
	if(dataView.getItem(row).pendingLSPaymentBillId != undefined && dataView.getItem(row).pendingLSPaymentBillId > 0)
		window.open('search.do?pageId=340&eventId=1&modulename=searchDetails&masterid='+dataView.getItem(row).pendingLSPaymentBillId+'&wayBillNumber='+dataView.getItem(row).pendingLSPaymentBillNumber+'&TypeOfNumber=40&branchId='+dataView.getItem(row).branchId+'&CityId=0&searchBy='+dataView.getItem(row).branchStr);
}

function billSearch(grid, dataView, row) {
	let item	= dataView.getItem(row);
	
	if(item.encryptedBillId != undefined)
		window.open(searchUrlNew() + item.encryptedBillId + '&TypeOfNumber=' + SEARCH_TYPE_ID_CREDITOR_INVOICE + '&BranchId=' + item.branchId);
	else if(item.billId != undefined && item.billId > 0)
		window.open(searchUrl() + item.billId + '&TypeOfNumber=' + SEARCH_TYPE_ID_CREDITOR_INVOICE + '&BranchId=' + item.branchId);
}

function lhpvSearch(grid, dataView, row) {
	let item 	= dataView.getItem(row);
		
	if(item.encryptedLhpvId != undefined)
		window.open(searchUrlNew() + item.encryptedLhpvId + '&wayBillNumber=' + item.lhpvNumber + '&TypeOfNumber=' + SEARCH_TYPE_ID_LHPV);
	else if(item.lhpvId != undefined && item.lhpvId > 0)
		window.open(searchUrl() + item.lhpvId + '&wayBillNumber=' + item.lhpvNumber + '&TypeOfNumber=' + SEARCH_TYPE_ID_LHPV);
}

function caLRSearch(grid, dataView, row) {
	let item 	= dataView.getItem(row);
	
	if(item.wayBillId != undefined && item.wayBillId > 0)
		window.open('?modulename=searchLRByLRNumber&wayBillId=' + item.wayBillId);
}

function getDDMPendingLr(grid, dataView, row) {
	window.open('reports.do?pageId=340&eventId=2&modulename=ddmLrDetails&deliveryRunSheetLedgerId='+dataView.getItem(row).deliveryRunSheetLedgerId+'&type=1','newwindow','config=height=410,width=815,toolbar=no,menubar=no,scrollbars=yes,resizable=no,location=no,directories=no,status=no');
}

function getDDMReturnedLr(grid, dataView, row) {
	window.open('reports.do?pageId=340&eventId=2&modulename=ddmLrDetails&deliveryRunSheetLedgerId='+dataView.getItem(row).deliveryRunSheetLedgerId+'&type=2','newwindow','config=height=610,width=815,toolbar=no,menubar=no,scrollbars=yes,resizable=no,location=no,directories=no,status=no');
}
