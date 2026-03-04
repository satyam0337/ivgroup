define(['slickGrid','moment'],function(slickGrid,moment) {
	let thisObj	= null, showDeleteButtonAfterPartial = false;
	
	return {
		setGrid : function(gridData) {
			thisObj	= this;
			
			let applyGridData	= new Object();
			applyGridData.ColumnHead					= $.map(gridData.columnConfiguration, function(el) { return el });
			applyGridData.balanceAmt					= gridData.balanceAmt;
			applyGridData.ColumnData					= gridData.CorporateAccount;
			applyGridData.Language						= gridData.Language != undefined ? gridData.Language : {};
			applyGridData.DivId							= gridData.tableProperties.divId;
			applyGridData.ShowPager						= gridData.tableProperties.showPager;
			applyGridData.ShowPinToLeft					= gridData.tableProperties.showPinToLeft;
			applyGridData.ShowSorting					= gridData.tableProperties.showSorting;
			applyGridData.ShowColumnPicker				= gridData.tableProperties.showColumnPicker;
			applyGridData.EnableColumnReorder			= gridData.tableProperties.enableColumnReOrder;
			applyGridData.ShowPrintButton				= gridData.tableProperties.showPrintButton;
			applyGridData.InnerSlickId					= gridData.tableProperties.gridDataId;
			applyGridData.InnerSlickHeight				= gridData.tableProperties.gridDataHeight;
			applyGridData.SerialNo						= gridData.tableProperties.showSerialNumber;
			applyGridData.ShowGrouping					= gridData.tableProperties.ShowGrouping;
			applyGridData.fullTableHeight				= gridData.tableProperties.fullTableHeight;
			applyGridData.rowHeight						= gridData.tableProperties.rowHeight;
			applyGridData.showPartialButton				= gridData.tableProperties.showPartialButton;
			applyGridData.partialButtonLableName		= gridData.tableProperties.partialButtonLableName;
			applyGridData.CallBackFunctionForPartial	= gridData.tableProperties.callBackFunctionForPartial;
			applyGridData.showDeleteButton				= gridData.tableProperties.showDeleteButton;
			applyGridData.CallBackFunctionForDelete		= gridData.tableProperties.callBackFunctionForDelete;
			applyGridData.multiGroupDtosHM				= gridData.multiGroupDtosHM;
			applyGridData.dateWiseSortOrder				= gridData.dateWiseSortOrder;
			applyGridData.groupingWithoutLabel			= gridData.groupingWithoutLabel;
			applyGridData.ShowCheckBox					= gridData.tableProperties.showCheckBox;
			applyGridData.RemoveSelectAllCheckBox		= gridData.tableProperties.removeSelectAllCheckBox;
			applyGridData.showLrViewForGroupedLr =gridData.tableProperties.showLrViewForGroupedLr;

			if(typeof gridData.showDeleteButtonAfterPartial != "undefined")
				showDeleteButtonAfterPartial	= gridData.showDeleteButtonAfterPartial;
			
			return thisObj.makeElementDiv(applyGridData);
		}, makeElementDiv : function(options) {
			let divId				= options.DivId;
			let showPager			= typeof options.ShowPager != "undefined" ? options.ShowPager : false;
			let innerSlickID		= typeof options.InnerSlickId != "undefined" ? options.InnerSlickId : 'mySlickGrid';
			let showPrintButton		= typeof options.ShowPrintButton != "undefined" ? options.ShowPrintButton : false;
			let innerSlickHeight	= typeof options.InnerSlickHeight != "undefined" ? options.InnerSlickHeight : '500px';
			let fullTableHeight		= typeof options.fullTableHeight != "undefined" ? options.fullTableHeight : false;
			let rowHeight			= options.rowHeight;
			
			if(typeof options.rowHeight != "undefined")
				rowHeight = options.rowHeight;
				
			let columnData			= options.ColumnData;  // column data with key
				
			if(fullTableHeight)
				innerSlickHeight = columnData.length * (options.rowHeight) + 90 + 'px';
				
			let $pager			= $("<div id='pager_" + innerSlickID + "' style='width: 100%; height: 20px;'/></div>");
			let $status			= $("<div id='status_" + innerSlickID + "'><label id='status-label_" + innerSlickID + "'></label></div>");
			let $print			= $("<div id='print_" + innerSlickID + "'><button id='btnprint_" + innerSlickID + "' class='btn btn-primary'><i class='glyphicon glyphicon-print'></i> Print</button></div>");
			let $mySlickGrid	= $("<div id='" + innerSlickID + "' style='width: 100%;height:" + innerSlickHeight + ";'></div>");

			if(showPager)
				$("#" + divId).append($pager);
			
			if(document.getElementById(innerSlickID) == null) {
				if(showPrintButton && document.getElementById("btnprint_" + innerSlickID) == undefined)
					$($print).insertBefore("#" + divId);
			
				$("#" + divId).append($mySlickGrid);
				$("#" + divId).append($status);
			}
			
			options.rowHeight		= rowHeight;
			options.InnerSlickId	= innerSlickID;
			
			//setTimeout(function() {
				return thisObj.applyGrid(options);
			//}, 1000);
		},
		//function returns array oject of tab URLs
		applyGrid : function(options) {
			_this = this;
			let columnHead			= options.ColumnHead;  // header row array
			let columnData			= options.ColumnData;  // column data with key
			let language			= options.Language;
			let showPager			= typeof options.ShowPager != "undefined" ? options.ShowPager : false;
			let showPinToLeft		= typeof options.ShowPinToLeft != "undefined" ? options.ShowPinToLeft : false;
			let showSorting			= typeof options.ShowSorting != "undefined" ? options.ShowSorting : true;
			let showColumnPicker	= typeof options.ShowColumnPicker != "undefined" ? options.ShowColumnPicker : false;
			let enableColumnReorder = typeof options.EnableColumnReorder != "undefined" ? options.EnableColumnReorder : false;
			let showGrouping		= typeof options.ShowGrouping != "undefined" ? options.ShowGrouping : false;
			let innerSlickID		= options.InnerSlickId;
			let showPartialButton	= typeof options.showPartialButton != "undefined" ? options.showPartialButton : false;
			let multiGroupDtos		= options.multiGroupDtosHM;
			let callBackFunctionForPartial;
			let callBackFunctionForDelete;
			let balanceAmt			= options.balanceAmt;
			let showCheckBox		= typeof options.ShowCheckBox != "undefined" ? options.ShowCheckBox : false;
			let removeSelectAll		= typeof options.RemoveSelectAllCheckBox != "undefined" ? options.RemoveSelectAllCheckBox : false;
			let showLrViewForGroupedLr	= options.showLrViewForGroupedLr;
			
			if(typeof options.CallBackFunctionForPartial != "undefined")
				callBackFunctionForPartial = options.CallBackFunctionForPartial;
			
			if(typeof options.CallBackFunctionForDelete != "undefined")
				callBackFunctionForDelete = options.CallBackFunctionForDelete;
			
			let totals = {};
			let averages = {};

			function sorterData(a, b) {
				//date support dd-mm-yyyy please change if any date format is changed
				let regex	= /^\d{2}[./-]\d{2}[./-]\d{4}$/;
				let regex1	= /\b(AM|PM)\b/i;
				
				if (typeof a[sortcol] === 'string' && a[sortcol].match(regex1) && b[sortcol].match(regex1)) {
					const d1 = parseDateTime(a[sortcol]);
					const d2 = parseDateTime(b[sortcol]);

					if (d1 > d2) return sortdir * 1;
					else if (d1 < d2) return sortdir * -1;
					else return sortdir * 0;
				} else if (regex.test(a[sortcol]) && regex.test(b[sortcol])) {
					let momentA = moment(a[sortcol], "DD-MM-YYYY");
					let momentB = moment(b[sortcol], "DD-MM-YYYY");
					
					if (momentA > momentB) return sortdir * 1;
					else if (momentA < momentB) return sortdir * -1;
					else return sortdir * 0;
				} else {// check if numeric should pass to numeric sorting else String comparison
					let x = a[sortcol], y = b[sortcol];
					
					if(parseInt(x) > 0 ) return sorterNumeric(a,b);
					else return sortdir * (x === y ? 0 : (x > y ? 1 : -1));
				}
			}

			function sorterNumeric(a, b) {
				let x = (isNaN(a[sortcol]) || a[sortcol] === "" || a[sortcol] === null) ? -99e+10 : parseFloat(a[sortcol]);
				let y = (isNaN(b[sortcol]) || b[sortcol] === "" || b[sortcol] === null) ? -99e+10 : parseFloat(b[sortcol]);
				return sortdir * (x === y ? 0 : (x > y ? 1 : -1));
			}

			function requiredFieldValidator(value) {
				return {valid: true, msg: 'Should be less then current date'};
			}

			let pinCounter = -1; // number of coumns to froze counter;

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
			
			function getHeaderButtons() {
			   let buttons = [];
			   if(showSorting) buttons.push(sortinglockObj)
			   if(showPinToLeft) buttons.push(pintoleftObj)
			   return buttons;
			}
			
			let buttonsObj = getHeaderButtons();

			let columns = []; // columns array for SlickGrid Object
			let columnPicker = []; // columns array for SlickGrid Object
			
			if(options.showDeleteButton && !showDeleteButtonAfterPartial)
				_this.deleteButtonColumn(options, columns);
			
			let name = 'Sr No';
			
			if(language['serialnumberheader'] != undefined)
				name	= language['serialnumberheader'];

			// for adding Sr No column to Table
			let idFieldPropertyStr = { id:	'id',  field:'id', name:name, width: 50 ,sortable: false,
					formatter: Slick.Formatters.SerialNumber,cssClass:'column-data-left-align',
					searchFilter:true,listFilter:true, dataType:'text',hasTotal:false,hasAverage:false,printWidth:5,
					toolTip:name,
					header: {
						buttons: buttonsObj
					}
			}

			if(options.SerialNo) {
				columns.push(idFieldPropertyStr);
				columnPicker.push(idFieldPropertyStr);
			}
			
			for (const element of columnHead) {
				let buttonsObjCol = getHeaderButtons();

				let name				= element.title;
				let dataDtoKey			= element.dataDtoKey;
				let displayColumnTotal	= element.displayColumnTotal;
				let displayColumnAverageTotal	= element.displayColumnAverage;
				let columnWidth			= element.columnWidth;
					
				if(name == undefined)
					name	= language[element.languageKey];
					
				if(name == undefined)
					name	= language[element.labelId];
					
				if(columnWidth == undefined)
					columnWidth			= element.columnInitialDisplayWidthInPx;

				if(element.inputElement == 'button') {
					columns.push({ 
						id				:	dataDtoKey, 
						name			:	name, 
						minWidth		:	element.columnMinWidth,
						searchFilter	:	false,
						listFilter		:	false,
						hasTotal		:	false,
						hasAverage		:	false,
						displayBalance	:	false,
						buttonCss		:	element.buttonCss,
						width			:	columnWidth,
						editor			:	element.editor,
						formatter		:	Slick.Formatters.Button,
						cssClass		:	element.columnDisplayCssClass,
						dataType		:	'button'
					});
					continue;
				}
				
				if(eval(element.editor) == Slick.Editors.Date || eval(element.editor) == Slick.Editors.Integer || eval(element.editor) == Slick.Editors.Text) {
					var fieldPropertyStr = { 
							id				:	dataDtoKey, 
							name			:	name, 
							field			:	dataDtoKey,
							minWidth		:	element.columnMinimumDisplayWidthInPx,
							width			:	columnWidth,
							sortable		:	element.sortColumn,
							hasTotal		:	displayColumnTotal,
							hasAverage		:	displayColumnAverageTotal,
							cssClass		:	element.columnDisplayCssClass,
							searchFilter	:	element.searchFilter,
							listFilter		:	element.listFilter,
							dataType		:	element.dataType,
							printWidth		:	element.columnPrintWidthInPercentage,
							displayBalance	:	element.displayBalance,
							chargesToHide	:	element.chargesToHide,
							toolTip			:	name,
							slickId			:	innerSlickID,
							sorter			:	sorterData,
							validator		:	requiredFieldValidator,
							editor			:	eval(element.editor),
							maxlength		:	element.maxlength, 
							editable		:	true,
							autoEdit		:	true,
							header: {
								buttons: buttonsObjCol
							}
					};
				} else {
					var fieldPropertyStr = { 
						id				:	dataDtoKey, 
						name			:	name, 
						field			:	dataDtoKey,
						minWidth		:	element.columnMinimumDisplayWidthInPx,
						width			:	columnWidth,
						sortable		:	element.sortColumn,
						hasTotal		:	displayColumnTotal,
						hasAverage		:	displayColumnAverageTotal,
						cssClass		:	element.columnDisplayCssClass,
						searchFilter	:	element.searchFilter,
						listFilter		:	element.listFilter,
						dataType		:	element.dataType,
						printWidth		:	element.columnPrintWidthInPercentage,
						displayBalance	:	element.displayBalance,
						chargesToHide	:	element.chargesToHide,
						toolTip			:	name,
						slickId			:	innerSlickID,
						sorter			:	sorterData,
						formatter		:	Slick.Formatters.DefaultValues,
						groupTotalsFormatter	:	sumTotalsFormatter,
						maxlength		:	element.maxlength,
						header: {
							buttons: buttonsObjCol
						}
					};
				}

				if (element.columnHidden) {
					columnPicker.push(fieldPropertyStr);
				} else {
					columns.push(fieldPropertyStr);
					columnPicker.push(fieldPropertyStr);
				}
			}
			
			if(showPartialButton)
				_this.partialButtonColumn(options, columns, language);
			
			if(showDeleteButtonAfterPartial)
				_this.deleteButtonColumn(options, columns);
			
			function sumTotalsFormatter(totals, columnDef) {
				if(columnDef.hasTotal) {
					let val = totals.sum && totals.sum[columnDef.field];
				
					if (val != null) {
						return "<b> " + ((Math.round(parseFloat(val)*100)/100))+"</b>";
					}
				}
				
				return "";
			}

			var options = {
					enableCellNavigation: true,
					multiColumnSort: true,
					enableColumnReorder: enableColumnReorder,
					frozenColumn: 0,
					fullWidthRows:true,
					rowHeight: 30,
					enableAsyncPostRender: true,
					showFooterRow: true,
					explicitInitialization:true,
					autoHeight:false,
					autoEdit:true,
					editable: true,
			};
			
			if(showGrouping)
				options.frozenColumn = -1;
			
			let groupItemMetadataProvider = new Slick.Data.GroupItemMetadataProvider();
			
			const decimalColumns = columnHead.filter(
				h => h.dataType === 'number' && (h.valueInDecimal || h.displayRoundoffValue)
			);
			
			columnData.forEach((row, index) => {
				row.id = index + 1;

				decimalColumns.forEach(({ dataDtoKey, dataType, valueInDecimal, displayRoundoffValue }) => {
					const value = row[dataDtoKey];

					if (dataType === 'number' && value != null && !isNaN(value)) {
						row[dataDtoKey] = valueInDecimal ? Number(value).toFixed(2)
							: displayRoundoffValue ? Math.round(value) : value;
					}
				});
			});

			let old = JSON.stringify(columnData) //convert to JSON string
			columnData = JSON.parse(old);  // for removing null values in the jsonstring from webservice
			let dataView = new Slick.Data.DataView({ inlineFilters: true, groupItemMetadataProvider: groupItemMetadataProvider});
			dataView.setItems(columnData);

			grid = new Slick.Grid("#" + innerSlickID, dataView, columns, options);
			grid.registerPlugin(groupItemMetadataProvider);

			if(showCheckBox) {
				var checkboxSelector = new Slick.CheckboxSelectColumn({
					cssClass: "slick-cell-checkboxsel column-data-left-align"
				});

				columns.unshift(checkboxSelector.getColumnDefinition());
				grid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow: false}));
				grid.registerPlugin(checkboxSelector);				
				dataView.syncGridSelection(grid, true);
				
				if(removeSelectAll)
					$("[title*='Select/Deselect All']").empty();
			} else
				grid.setSelectionModel(new Slick.CellSelectionModel());

			new Slick.Controls.Pager(dataView, grid, $("#pager_" + innerSlickID)); // for pager id
			
			grid.onFooterRowCellRendered.subscribe(function (e, args) {
				$(args.node).empty();
			
				if(args.column.hasAverage == true)
					$("<span id='columnAerage_" + innerSlickID + args.column.id + "' data-columnTotal=" + innerSlickID + args.column.id + " class='footerTotal'>Avg : " + averages[args.column.id] + "</span>").appendTo(args.node);
				else if(args.column.hasTotal == true)
					$("<span id='columnTotal_" + innerSlickID + args.column.id + "' data-columnTotal=" + innerSlickID + args.column.id + " class='footerTotal'>" + totals[args.column.id] + "</span>").appendTo(args.node);
				else if(args.column.displayBalance == true)
					$("<span id='columnTotal_" + innerSlickID + args.column.id + "' data-columnTotal=" + innerSlickID + args.column.id + " class='footerTotal'>Balance : " + balanceAmt + "</span>").appendTo(args.node);
			});
			
			grid.onCellChange.subscribe(function (e, args) {
				_this.refreshTotals(columnPicker, dataView, innerSlickID, totals, averages);
			});

			dataView.onRowCountChanged.subscribe(function (e, args) {
				grid.updateRowCount();
				grid.render();
				_this.refreshTotals(columnPicker, dataView, innerSlickID, totals, averages);
			});

			dataView.onRowsChanged.subscribe(function (e, args) {
				grid.updateRowCount();
				grid.invalidateRows(args.rows);
				grid.render();
				_this.refreshTotals(columnPicker, dataView, innerSlickID, totals, averages);
			});

			grid.onPageChanged.subscribe(function() {
				_this.refreshTotals(columnPicker, dataView, innerSlickID, totals, averages);
			});

			grid.onSelectedRowsChanged.subscribe(function(e, args) {
				_this.refreshTotals(columnPicker, dataView, innerSlickID, totals, averages);
			});
			
			grid.onCellChange.subscribe(function(e, args) {
				_this.refreshTotals(columnPicker, dataView, innerSlickID, totals, averages);
			});
			
			grid.onBeforeCellEditorDestroy.subscribe(function(e, args) {
				_this.refreshTotals(columnPicker, dataView, innerSlickID, totals, averages);
			});
			
			grid.onCellCssStylesChanged.subscribe(function(e, args) {
				_this.refreshTotals(columnPicker, dataView, innerSlickID, totals, averages);
			});
			
			grid.onHeaderClick.subscribe(function(e, args) {
				_this.refreshTotals(columnPicker, dataView, innerSlickID, totals, averages);
			});

			dataView.beginUpdate();
			dataView.setFilter(filter);
			dataView.endUpdate();

			grid.onSort.subscribe(function (e, args) {
				let cols = args.sortCols;

				dataView.sort(function (dataRow1, dataRow2) {
					for (let i = 0, l = cols.length; i < l; i++) {
						sortdir = cols[i].sortAsc ? 1 : -1;
						sortcol = cols[i].sortCol.field;

						let result = cols[i].sortCol.sorter(dataRow1, dataRow2); // sorter property from column definition comes in play here
						if (result != 0) {
							return result;
						}
					}
					return 0;
				});
				
				args.grid.invalidateAllRows();
				args.grid.render();
			});
			
			let filterPlugin = new Ext.Plugins.HeaderFilter({});

			// This event is fired when a filter is selected
			filterPlugin.onFilterApplied.subscribe(function () {
				dataView.refresh();
				grid.resetActiveCell();
				_this.refreshTotals(columnPicker, dataView, innerSlickID, totals, averages);

				// Excel like status bar at the bottom
				let status;

				if (dataView.getLength() === dataView.getItems().length)
					status = "";
				else
					status = dataView.getLength() + ' OF ' + dataView.getItems().length + ' RECORDS FOUND';
				
				$('#status-label_' + innerSlickID).text(status);
				_this.refreshTotals(columnPicker, dataView, innerSlickID, totals, averages);
			});

			// Event fired when a menu option is selected
			filterPlugin.onCommand.subscribe(function (e, args) {
				dataView.fastSort(args.column.field, args.command === "sort-asc");
			});

			grid.registerPlugin(filterPlugin);

			let overlayPlugin = new Ext.Plugins.Overlays({});

			// Event fires when a range is selected
			overlayPlugin.onFillUpDown.subscribe(function (e, args) {
				let column = grid.getColumns()[args.range.fromCell];

				// Ensure the column is editable
				if (!column.editor)
					return;

				// Find the initial value
				let value = dataView.getItem(args.range.fromRow)[column.field];

				dataView.beginUpdate();

				// Copy the value down
				for (let i = args.range.fromRow + 1; i <= args.range.toRow; i++) {
					dataView.getItem(i)[column.field] = value;
					grid.invalidateRow(i);
				}

				dataView.endUpdate();
				grid.render();
			});

			grid.registerPlugin(overlayPlugin);

			// Filter the data (using userscore's _.contains)
			function filter(item) {
				let columns = grid.getColumns();

				let value = true;

				for (const element of columns) {
					let col = element;
					let filterValues = col.filterValues;
					
					if (filterValues && filterValues.length > 0) {
						value = value & _.contains(filterValues, item[col.field]);
					}
				}
				
				return value;
			}

			let headerButtonsPlugin = new Slick.Plugins.HeaderButtons();
			
			headerButtonsPlugin.onCommand.subscribe(function(e, args) {
				let column = args.column;
				let button = args.button;
				let command = args.command;
			
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
					} else
						showMessage('warning','You cannot pin more than 3 columns ');
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
			grid.onClick.subscribe(function (e, args) {
				let gridObj = args.grid;
				
				if(showLrViewForGroupedLr){
				    let row = args.row;
				    let item = dataView.getItem(row);

				    if (item && item.__group === true) {
				        if (item.rows && item.rows.length > 0) {
				            let firstRowItem = item.rows[0];
				            let realRowIndex = dataView.getIdxById(firstRowItem.id);

				            lrSearch(gridObj, dataView, realRowIndex);
				        }
				        e.stopImmediatePropagation();
				        e.preventDefault();
				        return; 
				    }
				}
				let cell	= gridObj.getCellFromEvent(e);
				
				if (gridObj.getColumns()[cell.cell].id == "PartialButton") {
					showLayer();
					callBackFunctionForPartial(gridObj, dataView, args.row);
					e.stopPropagation();
					_this.refreshTotals(columnPicker, dataView, innerSlickID, totals, averages);
				}
				
				if (gridObj.getColumns()[cell.cell].id == "DeleteButton") {
					showLayer();
					callBackFunctionForDelete(gridObj, dataView, args, e);
					e.stopPropagation();
					_this.refreshTotals(columnPicker, dataView, innerSlickID, totals, averages);
				}
				
				for (const element of columnHead) {
					let dataDtoKey	= element.dataDtoKey;
				
					if(gridObj.getColumns()[cell.cell].id == dataDtoKey && (element.inputElement == 'button' || element.inputElement == 'link')) {
						let functionname = element.buttonCallback+"";
						let isEvent		 = element.getButtonCallbackEvent;
						
						if(isEvent)
							window[functionname+""](gridObj, dataView, args.row, e);
						else
							window[functionname+""](gridObj, dataView, args.row);
						
						e.stopPropagation();
						_this.refreshTotals(columnPicker, dataView, innerSlickID, totals, averages);
					}
				}
				
				Slick.GlobalEditorLock.commitCurrentEdit();
			});

			grid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow: false}));

			if(showColumnPicker)
				columnpicker = new Slick.Controls.ColumnPicker(columnPicker, grid, options);
			
			/*columnpicker: for hide show columns options on right click of header;*/
			dataView.refresh();	  

			// Animate loader off screen

			_this.refreshTotals(columnPicker, dataView, innerSlickID, totals, averages);

			//grid.registerPlugin( new Slick.AutoColumnSize());
	  
			dataView.syncGridSelection(grid, true);
			let printPlugin = new Slick.Plugins.Print();
			grid.registerPlugin(printPlugin);
			
			$('#btnprint_' + innerSlickID).off('click').on('click', function () {
				let strWindowFeatures = "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes";
				printPlugin.printToWindow(window.open('/ivcargo/resources/js/slickgrid/plugins/print-grid.html', `printWindow_${innerSlickID}_${Date.now()}`, strWindowFeatures));
			});

			//grid.setSortColumn("tt",true); //columnId, ascending
			grid.init();
			
			if(showCheckBox)
				dataView.syncGridSelection(grid, true);
			
			if(showGrouping && multiGroupDtos != undefined)
				_this.setMultigroupingRules(grid, multiGroupDtos, options);
			
			hideLayer();

			return grid;
		},getValueForSelectedData:function(grid){
			let selectedData = [],
			selectedIndexes;
			selectedIndexes = grid.getSelectedRows();
			
			if(selectedIndexes == '' || selectedIndexes == null) {
				if(typeof selectionMsg == 'undefined')
					selectionMsg	= ' Please, Select atleast one checkbox !'
				
				showMessage('error', '<i class="fa fa-times-circle"></i>' + selectionMsg);
				return;
			}
			
			jQuery.each(selectedIndexes, function (index, value) {
				selectedData.push(grid.getData().getItem(value));
			});

			return selectedData;

		}, checkToAddRowInTable : function(dataView, columnData, checkDtoName) {
			let originalCollection = dataView.getItems();
			let newCollection  = columnData;
			let equals = true;
			
			jQuery.each(originalCollection, function (originalIndex, originalValue) {
				jQuery.each(newCollection, function (newIndex, newValue) {
					if(originalValue[checkDtoName] == newValue[checkDtoName]){
						equals = false;
						return equals;
					}
				});
				
				if(!equals)
					return equals;
			});

			return equals;
		}, getAllValueFromTable:function(callBackFunc, grid) {
			if(callBackFunc != undefined)
				callBackFunc(grid.getData().getItems());
		}, updateColumnTotal : function (columnPicker, dataView, totals, innerSlickID) {
			let columnsUpdate = columnPicker;
			var columnIdx = columnsUpdate.length;
			
			while (columnIdx--) {
				var column = columnsUpdate[columnIdx];
			
				if (!column.hasTotal)
					continue;
			
				var total = 0;
				var l = dataView.getLength() ;
				var array = [];

				for(var i = 0; i < l; i++) {
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
				
				totals[column.id] =total;

				$('#columnTotal_' + innerSlickID + column.id).html(total);
				$('*[data-columnTotal=' + innerSlickID + column.id + ']').html(total);
				_this.updatePaidAndTopayAmount(dataView, innerSlickID);
				$('*[data-columnTotal=' + innerSlickID + 'totalNumberofRows]').html(dataView.getLength());
			}  
		}, updateRowColor : function(slickgrid, dtoName, equateVal, cssClass) {
			slickgrid.getData().getItemMetadata = function(index) {
				var item = slickgrid.getData().getItem(index);
				
				if(item[dtoName] === equateVal) {
					return { cssClasses: cssClass };
				}
			};
			
			slickgrid.invalidate();
		}, updatePaidAndTopayAmount : function(dataView, innerSlickID) {
			var l = dataView.getLength();
			var totalTopay = 0;
			var totalPaid = 0;
			var totalTbb = 0;
			
			for(var i = 0; i < l; i++) {
				if(dataView.getItem(i)['wayBillTypeId'] == 2)
					totalTopay += parseInt(dataView.getItem(i)['bookingTotal']);
				else if(dataView.getItem(i)['wayBillTypeId'] == 1)
					totalPaid += parseInt(dataView.getItem(i)['bookingTotal']);
				else if(dataView.getItem(i)['wayBillTypeId'] == 4)
					totalTbb += parseInt(dataView.getItem(i)['bookingTotal']);
			}

			if(isNaN(totalTopay))
				totalTopay = 0;

			if(isNaN(totalPaid))
				totalPaid = 0;
			
			if(isNaN(totalTbb))
				totalTbb = 0;

			$('*[data-columnTotal=' + innerSlickID + 'summarytotalPaidAmount]').html(totalPaid);
			$('*[data-columnTotal=' + innerSlickID + 'summarytotalToPayAmount]').html(totalTopay);
			$('*[data-columnTotal=' + innerSlickID + 'summarytotalTbbAmount]').html(totalTbb);
			$('*[data-columnTotal=' + innerSlickID + 'summarytotalAmount]').html(totalTopay + totalPaid + totalTbb);
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
					return	g.value + "	 <span style='color:green'>(" + g.count + " rows)</span>";
				},
				aggregators: columnsArr,
				aggregateCollapsed: false,
				lazyTotalsCalculation: true,
				comparer: function (a, b) {
					var x = a['value'], y = b['value'];
					return 1 * (x === y ? 0 : (x > y ? 1 : -1));
				},
			});
		}, partialButtonColumn : function(options, columns, language) {
			let partialheader	= language['partialheader'];
				
			if(partialheader == undefined && options.partialButtonLableName != undefined)
				partialheader	= options.partialButtonLableName;
			
			var ShowPartialButton	=	{ id:'PartialButton',  field:'PartialButton', name:partialheader, 
					width: 100 ,searchFilter:false,listFilter:false,hasTotal:false,hasAverage:false,buttonCss:'btn btn-primary btn-sm',
					formatter:Slick.Formatters.Button,cssClass:'column-data-left-align',dataType:'button',
			}
				
			columns.push(ShowPartialButton);
		}, deleteButtonColumn : function(options, columns) {
			var language			= options.Language;
			
			var showDeleteButton	=	{ 
				id:'DeleteButton',	field:'DeleteButton', name:language['deactivate'], 
				width: 100 ,searchFilter:false,listFilter:false,hasTotal:false,hasAverage:false,buttonCss:'btn btn-danger btn-xs',
				formatter:Slick.Formatters.Button,cssClass:'column-data-left-align',dataType:'button',
			}
			
			columns.push(showDeleteButton);
		}, setMultigroupingRules : function(grid, multiGroupDtosHM, options) {
			let dataViewObject = grid.getData();
			let columnsArr	= new Array();
			let columns		= grid.getColumns();
			
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
				let obj1		= {};
						
				obj1.label	= multiGroupDtosHM[key];
				obj1.getter	= key;
						
				newList.push(obj1);
			}
			
			for(let i = 0; i < newList.length; i++) {
				let obj		= newList[i];
				
				if(groupingWithoutLabel) {
					obj.formatter	= function (g) {
						return g.value + " <span style='color:green'>(" + g.count + " rows)</span>";
					};
				} else {
					obj.formatter	= function (g) {
						return this.label + " : " + g.value + " <span style='color:green'>(" + g.count + " rows)</span>";
					};
				}
				
				if(i == newList.length - 1)
					obj.aggregators	= columnsArr;
					
				if(obj.aggregateCollapsed == undefined)
					obj.aggregateCollapsed		= false;
					
				if(obj.lazyTotalsCalculation == undefined)
					obj.lazyTotalsCalculation	= true;
					
				obj.comparer	= function (a, b) {
					let x = a['value'], y = b['value'];
					return _this.sortData(x, y, dateWiseSortOrder);
				};
			}

			dataViewObject.setGrouping(newList);
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
		}, limitCheckboxSelection: function(grid, limitCheckBox, noOfCheckBoxToLimit) {
			let selectedIndexes = grid.getSelectedRows();
				
			if(limitCheckBox) {
				const dataView = grid.getData();
				const maxSelection = noOfCheckBoxToLimit;
						
				if (selectedIndexes.length > maxSelection) {
					grid.setSelectedRows(selectedIndexes.slice(0, maxSelection));
					dataView.syncGridSelection(grid, true);
					showMessage('warning', 'You cannot select more than ' + maxSelection + ' checkboxes!');
					return false;
				}
			}

			return true;
		}, unselectAllCheckboxes: function(grid) {
			grid.setSelectedRows([]);
			grid.getData().syncGridSelection(grid, true);
		}, selectCheckboxesInRange: function(grid, jsonObj) {
			let starter = (jsonObj.fromNum) - 1;
			let to = jsonObj.toNum;
			let dataLength = grid.getDataLength();
			
			if(Number(to) > dataLength) {
				showMessage('warning', `<i class="fa fa-warning"></i> Invalid range. To Value cannot be greater than ${dataLength}.`);
				return false;
			}
			
			if(jsonObj.checkMaxDifference && (Number(to) - Number(jsonObj.fromNum)) > jsonObj.maxSelection) {
				showMessage('warning', `<i class="fa fa-warning"></i> Invalid range. Difference cannot be greater than ${jsonObj.maxSelection}.`);
				return false;
			}
					
			let checkboxes = [];
					
			for (let i = starter; i < to; i++) {
				checkboxes.push(i);
			}
					
			grid.setSelectedRows(checkboxes);
			grid.getData().syncGridSelection(grid, true);
			grid.invalidate();
			grid.render();
			return true;
		}, updateColumnAverage : function (columnPicker, dataView, averages, innerSlickID) {
			let columnsUpdate = columnPicker;
			var columnIdx = columnsUpdate.length;
					
			while (columnIdx--) {
				var column = columnsUpdate[columnIdx];
				
				if(column.hasAverage == null || !column.hasAverage)
					continue;
						
				var total = 0;
				var l = dataView.getLength();
				var array = [];

				for(var i = 0; i < l; i++) {
					array.push(dataView.getItem(i)[column.field]);
				}
				
				let count	= 0;
						
				function sum (array) {
					var total = 0;
					var i = array.length; 

					while (i--) {
						if(!isNaN(parseFloat(array[i]))) {
							total += parseFloat(array[i]);
							count++;
						}
					}

					return Math.round(total);
				}

				var total = sum(array);
						
				if(isNaN(total))
					total = 0;
				
				let avg = count === 0 ? 0 : Math.round(total / count);
						
				averages[column.id] = avg;			
				
				$('#columnAerage_' + innerSlickID + column.id).html('Avg - ' + avg);
				$('*[data-columnTotal=' + innerSlickID + column.id + ']').html('Avg - ' + avg);
			}
		}, refreshTotals : function(columnPicker, dataView, innerSlickID, totals, averages) {
			_this.updateColumnTotal(columnPicker, dataView, totals, innerSlickID);
			_this.updateColumnAverage(columnPicker, dataView, averages, innerSlickID);
		}
	};
});

function searchUrl() {
	return 'search.do?pageId=5&eventId=3&wayBillId=';
}

function searchUrlNew() {
	return 'search.do?pageId=5&eventId=3&enwayBillId=';
}

function lhpvSearch(grid, dataView, row) {
	let item	= dataView.getItem(row);
	
	if(item.encryptedLhpvId != undefined)
		window.open(searchUrlNew() + item.encryptedLhpvId + '&wayBillNumber=' + item.lhpvNumber + '&TypeOfNumber=' + SEARCH_TYPE_ID_LHPV);
	else if(item.lhpvId != undefined && item.lhpvId > 0)
		window.open(searchUrl() + item.lhpvId + '&wayBillNumber=' + item.lhpvNumber + '&TypeOfNumber=' + SEARCH_TYPE_ID_LHPV);
}

function blhpvSearch(grid, dataView, row) {
	let item	= dataView.getItem(row);
	
	const blhpvNumber = item.bLHPVNumber ?? item.blhpvNumber;
	const blhpvBranchId = item.bLHPVBranchId ?? item.blhpvBranchId;
	const blhpvBranchName = item.bLHPVBranchName ?? item.blhpvBranchName;
	
	if(item.encryptedBlhpvId != undefined)
		window.open(searchUrlNew() + item.encryptedBlhpvId + '&wayBillNumber=' + blhpvNumber + '&TypeOfNumber=' + SEARCH_TYPE_ID_BLHPV + '&BranchId=' + blhpvBranchId + '&searchBy=' + blhpvBranchName);
	else if(item.blhpvId != undefined && item.blhpvId > 0)
		window.open(searchUrl() + item.blhpvId + '&wayBillNumber=' + blhpvNumber + '&TypeOfNumber=' + SEARCH_TYPE_ID_BLHPV + '&BranchId=' + blhpvBranchId + '&searchBy=' + blhpvBranchName);
}

function lrSearch(grid, dataView, row) {
	let item	= dataView.getItem(row);
	
	if(item.encryptedWayBillId != undefined)
		window.open(searchUrlNew() + item.encryptedWayBillId + '&TypeOfNumber=' + LR_SEARCH_TYPE_ID);
	else if(item.wayBillId != undefined && item.wayBillId > 0)
		window.open(searchUrl() + item.wayBillId + '&TypeOfNumber=' + LR_SEARCH_TYPE_ID);
}

function crSearch(grid, dataView, row) {
	let item	= dataView.getItem(row);
	
	if(item.encryptedDcdId != undefined)
		window.open(searchUrlNew() + item.encryptedDcdId + '&TypeOfNumber=' + SEARCH_TYPE_ID_CR + '&BranchId=' + item.executiveBranchId);
	else if(item.deliveryContactDetailsId != undefined && item.deliveryContactDetailsId > 0)
		window.open(searchUrl() + item.deliveryContactDetailsId + '&TypeOfNumber=' + SEARCH_TYPE_ID_CR + '&BranchId=' + item.executiveBranchId);
}

function ddmSearch(grid, dataView, row) {
	let item	= dataView.getItem(row);
	
	if(item.encryptedDrlId != undefined)
		window.open(searchUrlNew() + item.encryptedDrlId + '&TypeOfNumber=' + SEARCH_TYPE_ID_DOOR_DELIVERY_MEMO + '&BranchId=' + item.executiveBranchId);
	else if(item.deliveryRunSheetLedgerId != undefined && item.deliveryRunSheetLedgerId > 0)
		window.open(searchUrl() + item.deliveryRunSheetLedgerId + '&TypeOfNumber=' + SEARCH_TYPE_ID_DOOR_DELIVERY_MEMO + '&BranchId=' + item.executiveBranchId);
}

function billSearch(grid, dataView, row) {
	let item	= dataView.getItem(row);
	
	if(item.encryptedBillId != undefined)
		window.open(searchUrlNew() + item.encryptedBillId + '&wayBillNumber=' + item.billNumber + '&TypeOfNumber=' + BILL_SEARCH_TYPE_ID + '&BranchId=' + item.billBranchId + '&searchBy=' + item.billBranchName);
	else if(item.billId != undefined && item.billId > 0)
		window.open(searchUrl() + item.billId + '&wayBillNumber=' + item.billNumber + '&TypeOfNumber=' + BILL_SEARCH_TYPE_ID + '&BranchId=' + item.billBranchId + '&searchBy=' + item.billBranchName);
}

function lsSearch(grid, dataView, row) {
	let item	= dataView.getItem(row);
	
	if(item.encryptedDlId != undefined)
		window.open(searchUrlNew() + item.encryptedDlId + '&wayBillNumber=' + item.lsNumber + '&TypeOfNumber=' + SEARCH_TYPE_ID_LS);
	else if(item.dispatchLedgerId != undefined && item.dispatchLedgerId > 0)
		window.open(searchUrl() + item.dispatchLedgerId + '&wayBillNumber=' + item.lsNumber + '&TypeOfNumber=' + SEARCH_TYPE_ID_LS);
}

function turSearch(grid, dataView, row) {
	let item	= dataView.getItem(row);
	
	if(item.encryptedRlId != undefined)
		window.open(searchUrlNew() + item.encryptedRlId + '&TypeOfNumber='+SEARCH_TYPE_ID_TUR + '&BranchId=' + item.executiveBranchId + '&subRegionId=' + item.subRegionId + '&searchBy=' + item.executiveBranchName);
	else if(item.receiveLedgerId != undefined && item.receiveLedgerId > 0)
		window.open(searchUrl() + item.receiveLedgerId + '&TypeOfNumber='+SEARCH_TYPE_ID_TUR + '&BranchId=' + item.executiveBranchId + '&subRegionId=' + item.subRegionId + '&searchBy=' + item.executiveBranchName);
}

function pickupLsSearch(grid, dataView, row) {
	let item				 = dataView.getItem(row);
	let doorPickupDispatchId = item.doorPickupLedgerId;
	
	if(item.pickUpLsNumber != undefined)
		window.open('InterBranch.do?pageId=340&eventId=10&modulename=pickupLoadingSheetPrint&masterid='+doorPickupDispatchId+'&isReprint=true', '', 'location=0, status=0 ,scrollbars=1, width=800, height=600, resizable=1');
}

function trlSearch(grid, dataView, row) {
	let item	= dataView.getItem(row);
	
	if(item.transferReceiveLedgerId != undefined && item.transferReceiveLedgerId > 0)
		window.open('search.do?pageId=340&eventId=1&modulename=searchDetails&masterid=' + item.transferReceiveLedgerId + '&masterid2=' + item.transferReceiveLedgerNumber + '&TypeOfNumber=' + SEARCH_TYPE_ID_TRANSFER_RECEIVE_LEDGER);
}

function tlSearch(grid, dataView, row) {
	let item	= dataView.getItem(row);
	
	if(item.transferLedgerId != undefined && item.transferLedgerId > 0)
		window.open('search.do?pageId=340&eventId=1&modulename=searchDetails&masterid=' + item.transferLedgerId + '&masterid2=' + item.transferLedgerNumber + '&TypeOfNumber=' + SEARCH_TYPE_ID_TRANSFER_LEDGER);
}

function matahdiSearch(grid, dataView, row) {
	let item	= dataView.getItem(row);
	
	if(item.loadingHamaliLedgerId != undefined && item.loadingHamaliLedgerId > 0)
		window.open('modules.do?pageId=340&eventId=1&modulename=searchDetails&masterid=' + item.loadingHamaliLedgerId + '&masterid2=' + item.loadingHamaliNumber+ '&branchId=' + item.branchId + '&TypeOfNumber=' + SEARCH_TYPE_ID_MATHADI_NUMBER);
}

function lsBillNumberSearch(grid, dataView, row) {
	if(dataView.getItem(row).pendingLSPaymentBillId != undefined && dataView.getItem(row).pendingLSPaymentBillId > 0)
		window.open('search.do?pageId=340&eventId=1&modulename=searchDetails&masterid='+dataView.getItem(row).pendingLSPaymentBillId+'&wayBillNumber='+dataView.getItem(row).pendingLSPaymentBillNumber+'&TypeOfNumber=40&branchId='+dataView.getItem(row).branchId+'&CityId=0&searchBy='+dataView.getItem(row).branchStr);
}

function mrSearch(grid, dataView, row) {
	let item	= dataView.getItem(row);
	
	if(item.mrNumber != undefined && item.mrBranchId != undefined && item.mrBranchId > 0)
		window.open('search.do?pageId=5&eventId=3&wayBillNumber=' + item.mrNumber + '&TypeOfNumber='+SEARCH_TYPE_ID_MR + '&BranchId=' + item.mrBranchId);
}

function policySearch(grid, dataView, row) {
	let item	= dataView.getItem(row);
	
	if(item.policyNumber != undefined && item.transactionId != undefined)
		window.open ('viewDetails.do?pageId=340&eventId=2&modulename=viewPolicyNumber&masterid='+item.transactionId,'newwindow','left=300,top=100,width=1000,height=450,toolbar=no,resizable=no,scrollbars=yes');
}

function stbsTransportSearch(grid, dataView, row) {
	let item	= dataView.getItem(row);
	
	if(item.encryptedScclId != undefined)
		window.open(searchUrlNew() + item.encryptedScclId + '&wayBillNumber=' + item.shortCreditCollLedgerNumber+'&TypeOfNumber='+12);
	else if(item.shortCreditCollLedgerId != undefined)
		window.open(searchUrl() + item.shortCreditCollLedgerId+'&wayBillNumber=' + item.shortCreditCollLedgerNumber+'&TypeOfNumber='+12);
}

function truckHisabNumberSearch(grid, dataView, row) {
	let item	= dataView.getItem(row);
	
	if(item.truckHisabVoucerId != undefined && item.truckHisabVoucerId > 0)
		window.open(searchUrl() + item.truckHisabVoucerId+'&wayBillNumber=' + item.truckHisabNumber+'&TypeOfNumber=' + SEARCH_TYPE_ID_TRUCK_HISAB_VOUCHER_NUMBER);
}

function pumpReceiptNumberSearch(grid, dataView, row) {
	let item	= dataView.getItem(row);
	
	if(item.pumpReceiptId != undefined && item.pumpReceiptId > 0)
		window.open(searchUrl() + item.pumpReceiptId+'&wayBillNumber=' + item.pumpReceiptNumber+'&TypeOfNumber=' + SEARCH_TYPE_ID_PUMP_RECEIPT_NUMBER);
}

function getShortCreditDetails(grid, dataView, row) {
	let item	= dataView.getItem(row);
	let creditTxnId = item.creditorWaybillTxnId || item.creditWayBillTxnId;
	
	if(item.paymentStatus != PAYMENT_TYPE_STATUS_DUE_PAYMENT_ID && item.paymentStatus != PAYMENT_TYPE_STATUS_CANCELLED_ID) {
		if(item.paymentTypeId == PAYMENT_TYPE_CREDIT_ID && item.shortCeditCollectionLedgerId > 0)
			childwin = window.open('stbsBillPaymentDetails.do?pageId=340&eventId=2&modulename=stbsBillPaymentDetails&shortCreditCollLedgerId='+ item.shortCeditCollectionLedgerId,'newwindow', config='height=310,width=1200, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
		else if(item.paymentTypeId == PAYMENT_TYPE_CREDIT_ID)
			childwin = window.open('shortCreditPaymentDetails.do?pageId=340&eventId=2&modulename=shortCreditPaymentDetails&creditWayBillTxnId=' + creditTxnId,'newwindow', config='height=600,width=825, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	}
}

function viewLrWiseCostingDetails(grid, dataView, row) {
	let item	= dataView.getItem(row);

	if(item.wayBillId != undefined && item.wayBillId > 0)
		window.open ('details.do?pageId=340&eventId=2&modulename=lrWiseCostingDetails&wayBillId=' + item.wayBillId,'newwindow', config='left=200,top=130,width=1055,height=490, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}