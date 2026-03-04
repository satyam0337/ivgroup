var appendgrid;
var dispatchPrintData;
var dummyWayBillIdArray = new Array();
var columnFilters = {};
var dummygrid;
var _this1;
define([ 'jquerylingua'
	,'focusnavigation'
	,'nodvalidation'
	,'slickGridWrapper'
	,'JsonUtility'
	,'errorshow'
	,'messageUtility'
	,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatchlsprint/dispatchlsprintsetupdestinationwise.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/dummyls/pendingDummyLR.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/dummyls/dummylsfilepath.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/backbone/backbone.bootstrap-modal.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatchlsprint/lsprintsetupdestinationwise.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dispatchlsprint/lsprintsetupdestinationwiseForDummyLs.js'
	,'slickGrid'],
	function(jquerylingua,Focusnavigation,Validation,slickGridWrapper, JsonUtility, errorshow, MessageUtility, LSPrint, PendingDummyLR, FilePath, BootstrapModal,lsprintsetupdestinationwise,lsprintsetupdestinationwiseForDummyLs,slickGrid){
	var languageKeyset;
	var LangKeySet;
	var columnHeaderJsonArr;
	var filterConfiguration = new Object();
	var lrChargeArr;
	var lhpvAmount;
	var gridWithoutBill;
	var jsonInObject;
	var columnHeaderArr;
	var columnHiddenConfiguration;
	return({
		renderElements : function(response){
			_this1 = this;
			require(['text!/ivcargo/template/dummyls/dummyls.html'],function(dummyLS){
				$("#mainContent").append(dummyLS);
				showLayer();
				languageKeyset = loadLanguageWithParams(FilePath.loadLanguage());
				initialiseFocus();
				var myNod = nod();
				myNod.add({
					selector: '#lsNumberEle',
					validate: 'presence',
					errorMessage: 'Provide valid LS Number'
				});
				$('#searchBtn').click(function() {
					myNod.performCheck();
					if(myNod.areAll('valid')){
						showLayer();
						_this1.searchLSNumber();
					}
				});
				$("#lsNumberEle").focus();
				hideLayer();
				Object.defineProperty(Array.prototype, 'chunk_inefficient', {
					value: function(chunkSize) {
						var array=this;
						return [].concat.apply([],
								array.map(function(elem,i) {
									return i%chunkSize ? [] : [array.slice(i,i+chunkSize)];
								})
						);
					}
				});
				$('#printLSBtn').click(function() {
					keyAdd	= Object.keys(dispatchPrintData.PrintHeaderModel);
					$('#lsPrintDiv').html("");
					var $tempHtml = $('<div />');
					$tempHtml.append(lsprintsetupdestinationwiseForDummyLs.setDefaultPrint(dispatchPrintData,'dummyLs'));
					if(keyAdd.length > 0) {
						$('#lsPrintDiv').html($tempHtml.html());
						lsprintsetupdestinationwise.applyCSS(dispatchPrintData.SetUpConfig,true);
						var width = 800;
						var height = 500;
						var left = parseInt((screen.availWidth/2) - (width/2));
						var top = parseInt((screen.availHeight/2) - (height/2));
						setTimeout(function(){
							childwin = window.open ('', 'newwindow', config='height='+height+',width='+width+',left='+left+ ',top='+top+', toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
							childwin.document.open();
							childwin.document.write('<html><head><title>IVCargo</title></head><section class="content"><div id="lsPrintDiv"><body onload="window.print();">'+$("#lsPrintDiv").html()+'</body></div></section></html>');
							childwin.focus();
							childwin.document.close();
						}, 1200);
						hideLayer();
					}
					_this1.changeFlagOfUsedLR();
				});
				$('#addNewLRBtn').click(function() {
					jsonInObject	= new Object();
					getJSON(jsonInObject, WEB_SERVICE_URL+'/wayBillWS/getDummyWayBillListForBranch.do', _this1.setElements, EXECUTE_WITH_ERROR);
				});
			});
		},searchLSNumber:function(elem){
			$("#lsNumberEle").val();
			jsonInObject = new Object();
			jsonInObject.lsNumber = $("#lsNumberEle").val();
			getJSON(jsonInObject, WEB_SERVICE_URL+'/dummyLSWs/getDispatchedLRDetailsByLSNumber.do', _this1.setSlickGridRows, EXECUTE_WITH_ERROR);
		},setSlickGridRows: function(responseData){
			if(responseData.message != undefined) {
				hideLayer();
				var errorMessage = responseData.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
				return;
			}
			$("slickGridDataWithoutBill").html("");
			dispatchPrintData = responseData;
			$("#summaryTable").removeClass("hide");
			$("#addNewLR").removeClass("hide");
			$("#tableheaderForLS").removeClass("hide");

			var collumnsArray = new Array();
			collumnsArray.push("wayBillNumber");
			collumnsArray.push("wayBillSourceBranchName");
			collumnsArray.push("wayBillDestinationBranchName");
			collumnsArray.push("wayBillArticleQuantity");
			collumnsArray.push("wayBillConsignorName");
			collumnsArray.push("wayBillConsigneeName");
			collumnsArray.push("packingTypeString");
			collumnsArray.push("wayBillGrandTotal");
			collumnsArray.push("wayBillType");
			collumnsArray.push("consignmentSummaryBillSelectionString");

			var columns = new Array();
			var columnPicker = [];

			var data = new Array();
			if(dispatchPrintData != undefined && dispatchPrintData.dispatchLRSummary != undefined){
				var dispatchDataArr = new Array();
				var lrColl = dispatchPrintData.dispatchLRSummary;
				for(var destinationBranchId in lrColl){
					var destinationWiseLRColl = lrColl[destinationBranchId];
					for(var key in destinationWiseLRColl){
						for (var i=0;i<destinationWiseLRColl[key].length; i++) {
							dispatchDataArr.push(destinationWiseLRColl[key][i]);
						}
					}
				}
				columns.push({
					id: "serialNumber", name: languageKeyset["serialNumber"], field: "serialNumber",formatter: Slick.Formatters.SerialNumber
				});

				for(var col in collumnsArray){
					var buttonsObjCol = [];
					buttonsObjCol.push({
						cssClass: "fa fa-thumb-tack",
						command: "toggle-pinToLeft",
						tooltip: "pin to Left"
					});
					buttonsObjCol.push({
						cssClass: "fa fa-lock",
						command: "toggle-sortable",
						tooltip: "sorting locked"
					});
					var obj = {
							id: collumnsArray[col], name: languageKeyset[collumnsArray[col]], field: collumnsArray[col],
							searchFilter : true,listFilter : true,dataType:'text',header : {buttons: buttonsObjCol}
					}
					columnPicker.push(obj);
					columns.push(obj);
				}

				if(dispatchPrintData.dispatchLSLRCharge != undefined){
					lrChargeArr = dispatchPrintData.dispatchLSLRCharge;
					for(var waybillId in lrChargeArr){
						lhpvAmount = lrChargeArr[waybillId][0].chargeAmount;
					}
				}

				for(var i=0;i<dispatchDataArr.length;i++){
					var dataColArr = {}
					for(var col in collumnsArray){
						dataColArr[collumnsArray[col]] = dispatchDataArr[i][collumnsArray[col]];
					}
					dataColArr["wayBillId"] 						= dispatchDataArr[i]["wayBillId"];
					dataColArr["wayBillDestinationBranchId"] 		= dispatchDataArr[i]["wayBillDestinationBranchId"];
					dataColArr["wayBillSourceBranchId"] 			= dispatchDataArr[i]["wayBillSourceBranchId"];
					dataColArr["consignmentSummaryBillSelectionId"] = dispatchDataArr[i]["consignmentSummaryBillSelectionId"];
					dataColArr["wayBillActualWeight"] 				= dispatchDataArr[i]["wayBillActualWeight"];

					data.push(dataColArr);
				}
				_this1.addRemoveButton(columns,languageKeyset);
			}
			for (var i = 0; i < data.length; i++) {
				data[i]["serialNumber"] = parseInt(i)+1;
				data[i]['id']=parseInt(i)+1;
			}

			function filter(item) {
				var columns = dummygrid.getColumns();

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


			data = JSON.parse(JSON.stringify(data).replace(/null/g, '"-"')); //convert to JSON string

			var  dataView;
			dataView = new Slick.Data.DataView({ inlineFilters: true });
			dataView.setItems(data);
			var options = {
					enableCellNavigation: true,
					enableColumnReorder: false,
					showHeaderRow: false,
					headerRowHeight: 30,
					explicitInitialization: true,
					autoEdit				:	true,
					editable				:	true,
					enableAsyncPostRender	: 	true

			};
			dummygrid = new Slick.Grid("#slickGridData", dataView, columns, options);
			_this1.removeButtonAction(dummygrid);

			_this1.updateSummary();

			var filterPlugin = new Ext.Plugins.HeaderFilter({});

			// This event is fired when a filter is selected
			filterPlugin.onFilterApplied.subscribe(function () {
				dataView.refresh();
				dummygrid.resetActiveCell();
			});

			// Event fired when a menu option is selected
			filterPlugin.onCommand.subscribe(function (e, args) {
				dataView.fastSort(args.column.field, args.command === "sort-asc");
			});

			dummygrid.registerPlugin(filterPlugin);
			
			dataView.onRowCountChanged.subscribe(function (e, args) {
				dummygrid.updateRowCount();
				dummygrid.render();
				_this1.updateSummary();
			});

			dataView.onRowsChanged.subscribe(function (e, args) {
				dummygrid.invalidateRows(args.rows);
				dummygrid.render();
				_this1.updateSummary()
			});

			 var overlayPlugin = new Ext.Plugins.Overlays({ decoratorWidth: 1});
	            overlayPlugin.onFillUpDown.subscribe(function (e, args) {
	                var column = grid.getColumns()[args.range.fromCell];
	                if (!column.editor) {
	                    return;
	                }
	                var value = dataView.getItem(args.range.fromRow)[column.field];
	                dataView.beginUpdate();
	                for (var i = args.range.fromRow + 1; i <= args.range.toRow; i++) {
	                    dataView.getItem(i)[column.field] = value;
	                    dummygrid.invalidateRow(i);
	                }
	                dataView.endUpdate();
	                dummygrid.render();
	            });
	            dummygrid.registerPlugin(overlayPlugin);

			dataView.beginUpdate();
			dataView.setFilter(filter);
			dataView.endUpdate();
			dummygrid.init();
			

			hideLayer();
		},addRemoveButton:function(columns,languageKeyset){
			columns.push({ id:  'removeButton',  field:'removeButton', name:languageKeyset['removeheader'], 
				width: 80 ,searchFilter:false,listFilter:false,hasTotal:false,buttonCss:'btn btn-danger btn-xs',
				formatter:Slick.Formatters.Button,cssClass:'column-data-left-align',dataType:'button'});
		},removeButtonAction:function(gridObj){
			gridObj.onClick.subscribe(function (e,args) {
				var cell = gridObj.getCellFromEvent(e);
				var dataView = gridObj.getData();
				if (gridObj.getColumns()[cell.cell].id == "removeButton") {
					_this1.removeDataFromLSData(dataView.getItem(args.row));
					dataView.beginUpdate();
					dataView.deleteItem(dataView.getItem(args.row).id);
					dataView.endUpdate();
					gridObj.invalidate();
					_this1.updateSummary();
				}
			});
		},updateSummary:function(){
			var withBillWeight = 0;
			var withoutBillWeight = 0;
			var dummyWeight = 0;
			var withBillQuantity = 0;
			var withoutBillQuantity = 0;
			var dummyQuantity = 0;
			var withBillCount = 0;
			var withoutBillCount = 0;
			var dummyCount = 0;			
			if(dummygrid != undefined){
				var data = dummygrid.getData().getItems();
				if(data != undefined && data.length > 0){
					for(var key in data){
						if(data[key].consignmentSummaryBillSelectionId == 2 ){
							if(data[key].wayBillActualWeight != undefined){
								withoutBillWeight += parseFloat(data[key].wayBillActualWeight); 
							}
							withoutBillQuantity += parseFloat(data[key].wayBillArticleQuantity);
							withoutBillCount += 1;
						}else{
							if(data[key].wayBillActualWeight != undefined){
								withBillWeight += parseFloat(data[key].wayBillActualWeight); 
							}
							if(data[key].wayBillArticleQuantity != undefined){
								withBillQuantity += parseFloat(data[key].wayBillArticleQuantity);
								withBillCount += 1;
							}
						}
					}
				}
			}

			if(appendgrid != undefined){
				var data = appendgrid.getData().getItems();
				if(data != undefined && data.length > 0){
					for(var key in data){
						if(data[key].wayBillActualWeight != undefined){
							dummyWeight += parseFloat(data[key].wayBillActualWeight);
						}
						if(data[key].wayBillNoOfPkgs != undefined){
							dummyQuantity += parseFloat(data[key].wayBillNoOfPkgs);
							dummyCount += 1;
						}
					}
				}
			}

			$("#withBillWeightTotal").html(withBillWeight);
			$("#withoutBillWeightTotal").html(withoutBillWeight);
			$("#dummyWeightTotal").html(dummyWeight);
			$("#weightTotal").html(parseFloat(withBillWeight)+parseFloat(withoutBillWeight)+parseFloat(dummyWeight));

			$("#withBillArticleTotal").html(withBillQuantity);
			$("#withoutBillArticleTotal").html(withoutBillQuantity);
			$("#dummyArticleTotal").html(dummyQuantity);
			$("#articleTotal").html(parseFloat(withBillQuantity)+parseFloat(withoutBillQuantity)+parseFloat(dummyQuantity));

			$("#withBillCountTotal").html(withBillCount);
			$("#withoutBillCountTotal").html(withoutBillCount);
			$("#dummyCountTotal").html(dummyCount);
			$("#countTotal").html(parseFloat(withBillCount)+parseFloat(withoutBillCount)+parseFloat(dummyCount));
		},removeDataFromLSData:function(rowData){
			delete dispatchPrintData.dispatchLSLRCharge[rowData.wayBillId];
			delete dispatchPrintData.dispatchLSLRFormSummary[rowData.wayBillId];
			var sumObj	= dispatchPrintData.dispatchLRSummary[rowData.wayBillSourceBranchId];
			var wayBillArr = sumObj[rowData.wayBillDestinationBranchId];
			var index;
			for (var i=0; i<wayBillArr.length; i++) {
				if (wayBillArr[i].wayBillId == rowData.wayBillId) {
					index = i;
				}
			}
			if (index > -1) {
				wayBillArr.splice(index, 1);
			}
			if (wayBillArr.length == 0) {
				delete sumObj[rowData.wayBillDestinationBranchId];
				var sourceKey	= Object.keys(sumObj);
				if (sourceKey.length == 0) {
					delete dispatchPrintData.dispatchLRSummary[rowData.wayBillSourceBranchId]
					delete dispatchPrintData.dispatchLSHeader[rowData.wayBillSourceBranchId];
					delete dispatchPrintData.PrintHeaderModel[rowData.wayBillSourceBranchId];
				} else {
					dispatchPrintData.dispatchLRSummary[rowData.wayBillSourceBranchId]	= sumObj;
				}
			} else {
				sumObj[rowData.wayBillDestinationBranchId]	= wayBillArr;
				dispatchPrintData.dispatchLRSummary[rowData.wayBillSourceBranchId]	= sumObj;
			}
		},setElements : function(response){
			if(response.message != undefined) {
				hideLayer();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
				return;
			}
			var object = new Object();
			object.response 		= response;
			object.grid 			= dummygrid;
			object.gridWithoutBill	= gridWithoutBill;
			var btModal = new Backbone.BootstrapModal({
				content		: 	new PendingDummyLR(object),
				modalWidth 	:	80,
				title		:	'Dummy LRs For Dispatch',
				okText		:	'Add',
				showFooter 	: 	true
			}).open();
			object.btModal = btModal;
			new PendingDummyLR(object)
			btModal.open();
		},changeFlagOfUsedLR : function() {
			jsonInObject = new Object();
			jsonInObject.dummyWayBillId = dummyWayBillIdArray.toString();
			getJSON(jsonInObject, WEB_SERVICE_URL+'/dummyLSWs/updateIsPrintedFlagForUsedLR.do', _this1.showMessageForUpdation, EXECUTE_WITH_ERROR);
		},showMessageForUpdation : function(response) {
			if(response.message != undefined) {
				hideLayer();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				return;
			}
		}
	});
})