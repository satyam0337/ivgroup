/**
 * Ashish Tiwari 
 */

define([
        'slickGrid'
        ,'slickGridWrapper'
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/truckanalyzingreport/truckanalyze-print-plugin.js'
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/truckanalyzingreport/truckanalyzingreportfilepath.js'//FilePath
        ],function(slickGrid,slickGridWrapper,TruckAnalyzePrint,FilePath) {
	var truckAnalyzeModel,lhpvSettelmentCharges,serviceTaxModel,truckAnalyzeHeader,truckAnalyzeLRSummaryModel,configuration,columnsHeader,groupConfiguration;
	var _this;
	return{
		setTruckAnalyzingReportDetails:function(response) {
			_this = this;

			if(response.TruckAnalyzeModelCount != null){
				$("#tableContain").load( "/ivcargo/template/truckanalyzingreport/truckanalyzecount.html", function() {	
					_this.setLSCountRow(response.TruckAnalyzeModelCount);
				});
			}else{	
				$("#tableContain").load( "/ivcargo/template/truckanalyzingreport/truckanalyzingreport.html", function() {	
					_this.setReportData(response);
				});
			}
			
			changeDisplayProperty('bottom-border-boxshadow', 'block');
		},setReportData:function(response) {
			truckAnalyzeHeader 	= response.TruckAnalyzeHeader;
			serviceTaxModel	   	= response.ServiceTaxModel;
			truckAnalyzeModel	= response.TruckAnalyzeModel;
			truckAnalyzeLRSummaryModel	= response.TruckAnalyzeLRSummaryModel;
			configuration		= response.configuration;
			groupConfiguration	= response.groupConfiguration;

			if(configuration.TruckAnalyzeHeaderModel){
				$('.turNo').append(truckAnalyzeHeader.turNumber);
				$('.receivedDate').append(truckAnalyzeHeader.receivedLedgerDateTimeStr);
				$('.vehicleCapacity').append(truckAnalyzeHeader.vehicleCapacity);
				$('.lsBranch').append(truckAnalyzeHeader.lsBranchName);
				$('.vehicleNumber').append(truckAnalyzeHeader.vehicleNumber);
				$('.lsNumber').append(truckAnalyzeHeader.lsNumber);
				$('.lorryHire').append(truckAnalyzeHeader.totalLorryHire);
			} else {
				changeDisplayProperty('reportHeader', 'none');
			}

			if(configuration.TruckAnalyzeServiceTaxModel){
				$('.topayTotal').append(serviceTaxModel.topayBookingTotal);
				$('.topaySTax').append(serviceTaxModel.topayServiceTax);
				$('.topayInsurance').append(serviceTaxModel.topayInsuranceAmt);
				$('.topayBalance').append(serviceTaxModel.topayBalance);
				$('.paidTotal').append(serviceTaxModel.paidBookingTotal);
				$('.paidSTax').append(serviceTaxModel.paidServiceTax);
				$('.paidInsurance').append(serviceTaxModel.paidInsuranceAmt);
				$('.paidBalance').append(serviceTaxModel.paidBalance);
			} else {
				changeDisplayProperty('serviceTaxDetails', 'none');				
			}

			if(configuration.TruckAnalyzeLHPVCharges){				
				$('.totalLrs').append(truckAnalyzeHeader.totalNoOfWayBills);
				$('.totalArts').append(truckAnalyzeHeader.totalNoOfPackages);
				$('.totalWts').append(truckAnalyzeHeader.totalActualWeight);

				_this.setlhpvChrgs(response);
			} else {
				changeDisplayProperty('lhpcChrgsDetails', 'none');								
			}
			
			_this.createSrcDestWiseDetails(_.sortBy(_.sortBy(truckAnalyzeModel, 'destinationBranchName'), 'sourceBranchName'),configuration,groupConfiguration);

			columnsHeader = grid.getColumns();
			
			var thead	= $('#grandTotalSummary thead');
			var colspan	= 0;
			var headrow = $("<tr/>");
			var row = $("<tr/>");
			for(var head in columnsHeader){
				colspan++;
				row.append($("<th style='text-align: center'/>").text(columnsHeader[head].name));
			}
			headrow.append($("<th id='header' style='font-size: 15px;font-weight: bold; text-transform: uppercase;text-align: center;' colspan='"+colspan+"'/>").text("Grand Total Summary"));
			thead.append(headrow);
			thead.append(row);

			if(configuration.TruckAnalyzeLRSummaryModel){	
				_this.setLrSummary(truckAnalyzeLRSummaryModel);				
			} else {				
				changeDisplayProperty('lrSummaryTbb', 'none');
				changeDisplayProperty('lrSummaryPaid', 'none');
				$("#lrSummaryTbb").addClass("hide");
				$("#lrSummaryPaid").addClass("hide");
			}

		},setLrSummary:function(truckAnalyzeLRSummaryModel) {

			var lrno	= null;
			var amnt	= null;
			var stn		= null;
			var wght	= null;
			var billAt	= null;
			var lrno2	= null;
			var amnt2	= null;
			var stn2		= null;
			var wght2	= null;
			var billAt2	= null;
			var totAmtPaid	= null;
			var totWghtPaid	= null;
			var totAmtTbb	= 0;
			var totWghtTbb	= 0;
			var wayBillTypeId	= 0;
			
			if(truckAnalyzeLRSummaryModel != null && truckAnalyzeLRSummaryModel.length > 0) {
				for(var i = 0; i < truckAnalyzeLRSummaryModel.length; i++) {
					tableRow		= _this.createRow(i,'');

					lrno		= _this.createColumnInRow(tableRow, '', i+1, '20%', 'left', 'text-align: center', '');
					amnt		= _this.createColumnInRow(tableRow, '', i+1, '20%', 'right', 'padding-right: 10px', '');
					stn			= _this.createColumnInRow(tableRow, '', i+1, '20%', 'left', 'text-align: center', '');
					wght		= _this.createColumnInRow(tableRow, '', i+1, '20%', 'right', 'padding-right: 10px', '');
					billAt		= _this.createColumnInRow(tableRow, '', i+1, '20%', 'left', 'text-align: center', '');
					wayBillTypeId	= truckAnalyzeLRSummaryModel[i].wayBillTypeId;

					appendValueInTableCol(lrno,  (truckAnalyzeLRSummaryModel[i].wayBillNumber));
					appendValueInTableCol(amnt,  (truckAnalyzeLRSummaryModel[i].bookingTotal));
					appendValueInTableCol(stn,  (truckAnalyzeLRSummaryModel[i].sourceBranchName));
					appendValueInTableCol(wght,  (truckAnalyzeLRSummaryModel[i].dispatchedWeight));
					appendValueInTableCol(billAt,  (truckAnalyzeLRSummaryModel[i].destinationBranchName));
					
					
					
					if(wayBillTypeId == 4){
						totAmtTbb	= totAmtTbb	+ truckAnalyzeLRSummaryModel[i].bookingTotal;
						totWghtTbb	= totWghtTbb	+ truckAnalyzeLRSummaryModel[i].dispatchedWeight;
						appendRowInTable('lrSummaryTbb', tableRow);
					}
					if(wayBillTypeId == 1){
						totAmtPaid	= totAmtPaid	+ truckAnalyzeLRSummaryModel[i].bookingTotal;
						totWghtPaid	= totWghtPaid	+ truckAnalyzeLRSummaryModel[i].dispatchedWeight;
						appendRowInTable('lrSummaryPaid', tableRow);
					}
					
					
				}
				var table = document.getElementById('lrSummaryTbb');
				var rowCount = table.rows.length;
				var row = table.insertRow(rowCount);
				tableRow		= _this.createRow(truckAnalyzeLRSummaryModel.length,'');
				tableRow2		= _this.createRow(rowCount-1,'');
				
				lrno		= _this.createColumnInRow(tableRow, '', truckAnalyzeLRSummaryModel.length+1, '20%', 'left', 'font-weight : bold', '');
				amnt		= _this.createColumnInRow(tableRow, '', truckAnalyzeLRSummaryModel.length+1, '20%', 'right', 'font-weight : bold;padding-right: 10px', '');
				stn			= _this.createColumnInRow(tableRow, '', truckAnalyzeLRSummaryModel.length+1, '20%', 'left', '', '');
				wght		= _this.createColumnInRow(tableRow, '', truckAnalyzeLRSummaryModel.length+1, '20%', 'right', 'font-weight : bold;padding-right: 10px;', '');
				billAt		= _this.createColumnInRow(tableRow, '', truckAnalyzeLRSummaryModel.length+1, '20%', 'left', '', '');
				
				lrno2		= _this.createColumnInRow(tableRow2, '', rowCount, '20%', 'left', 'font-weight : bold', '');
				amnt2		= _this.createColumnInRow(tableRow2, '', rowCount, '20%', 'right', 'font-weight : bold;padding-right: 10px', '');
				stn2		= _this.createColumnInRow(tableRow2, '', rowCount, '20%', 'left', '', '');
				wght2		= _this.createColumnInRow(tableRow2, '', rowCount, '20%', 'right', 'font-weight : bold;padding-right: 10px;', '');
				billAt2		= _this.createColumnInRow(tableRow2, '', rowCount, '20%', 'left', '', '');


				var tablePaid = document.getElementById('lrSummaryPaid');
				var rowCountPaid = tablePaid.rows.length;
				var tableTbb = document.getElementById('lrSummaryTbb');
				var rowCountTbb = tableTbb.rows.length;
					if(rowCountPaid <= 2){
						$("#lrSummaryPaid").addClass("hide");
					}
					
					if(rowCountTbb <= 3){
						$("#lrSummaryTbb").addClass("hide");
					}
					appendValueInTableCol(lrno2,  ("Total"));
					appendValueInTableCol(amnt2,  (totAmtTbb));
					appendValueInTableCol(stn2,  (""));
					appendValueInTableCol(wght2,  (totWghtTbb));
					appendValueInTableCol(billAt2,  (""));
					appendRowInTable('lrSummaryTbb', tableRow2);	
				
				
					appendValueInTableCol(lrno,  ("Total"));
					appendValueInTableCol(amnt,  (totAmtPaid));
					appendValueInTableCol(stn,  (""));
					appendValueInTableCol(wght,  (totWghtPaid));
					appendValueInTableCol(billAt,  (""));
					appendRowInTable('lrSummaryPaid', tableRow);	
				
				
			}else {
				changeDisplayProperty('lrSummaryTbb', 'none');
				changeDisplayProperty('lrSummaryPaid', 'none');
				$("#lrSummaryTbb").addClass("hide");
				$("#lrSummaryPaid").addClass("hide");
			}	

		},setLSCountRow : function(TruckAnalyzeModelCount) {

			var LSNumber	= null;
			var LSBranch	= null;
			var LSDate		= null;

			$('#LSCountTBody').empty();

			for (var i = 0; i < TruckAnalyzeModelCount.length; i++) {

				var lsId	= TruckAnalyzeModelCount[i].dispatchLedgerId;
				var row		= createRowInTable("tr_" + lsId, '', '');

				var col1	= _this.createColumnInRow(row, "td_" + lsId, '', '5%', 'right', '', '');
				var col2	= _this.createColumnInRow(row, "td_" + lsId, '', '25%', 'left', '', '');
				var col3	= _this.createColumnInRow(row, "td_" + lsId, '', '25%', 'left', '', '');
				var col4	= _this.createColumnInRow(row, "td_" + lsId, '', '25%', 'left', '', '');
				var col5	= _this.createColumnInRow(row, "td_" + lsId, '', '20%', 'left', '', '');

				appendValueInTableCol(col1, i+1);
				appendValueInTableCol(col2, TruckAnalyzeModelCount[i].lsNumber);
				appendValueInTableCol(col3, TruckAnalyzeModelCount[i].lsBranchName);
				appendValueInTableCol(col4, TruckAnalyzeModelCount[i].tripDateTimeStr);

				var inputAttr1		= new Object();
				var input			= null;

				inputAttr1.id			= 'lsId' + lsId;
				inputAttr1.type			= 'hidden';
				inputAttr1.value		= lsId;
				inputAttr1.name			= 'lsId' + lsId;
				inputAttr1.disabled		= 'true';

				input	= createInput(col2, inputAttr1);
				input.attr( {
					'data-value' : lsId
				});

				var buttonEditJS		= new Object();
				var buttonEdit			= null;

				buttonEditJS.id			= 'view' + lsId;
				buttonEditJS.name		= 'view' + lsId;
				buttonEditJS.value		= 'View';
				buttonEditJS.type		= 'button';
				buttonEditJS.html		= 'View';
				buttonEditJS.class		= 'btn btn-success';
				buttonEditJS.style		= 'width: 100px;';

				buttonView			= createButton(col5, buttonEditJS);
				buttonView.attr({
					'data-value' : lsId
				});

				appendValueInTableCol(col5, '&emsp;');

				appendRowInTable('LSCountTBody', row);
				
				$('#view' + lsId).on('click', function () {
					_this.ViewDetails(this);
				});
			}
		},createSrcDestWiseDetails : function(truckAnalyzeModel,configuration,groupConfiguration) {

			var destinationColl 	= truckAnalyzeModel;
			var hirechargesHead 	= new Array();
			var ddmchargesHead 		= new Array();

			for(var key in destinationColl){

				var costTypeHM	= destinationColl[key]["costTypeHM"];
				var ddmChrgsHM	= destinationColl[key]["ddmChrgsHM"];

				for(var costTypeId in costTypeHM){
					var charge = costTypeHM[costTypeId]+'';
					var costType	= costTypeId.split("_");
					if(configuration.RestrictChargesColumn){
						if(costType[3] <= configuration.HireAmountColumnCount){							
							destinationColl[key]["Hire"+costType[3]] = charge.replace(/\s+/g, '');
							hirechargesHead.push("Hire"+costType[3]);
						}
					} else {						
						destinationColl[key]["Hire"+costType[3]] = charge.replace(/\s+/g, '');
						hirechargesHead.push("Hire"+costType[3]);
					}
				}
				for(var chargeId in ddmChrgsHM){
					var charge = ddmChrgsHM[chargeId]+'';
					var id = chargeId.split("_");
					if(configuration.RestrictChargesColumn){
						if(id[3] <= configuration.DDMAmountColumnCount){							
							destinationColl[key]["DDM"+id[3]] = charge.replace(/\s+/g, '');
							ddmchargesHead.push("DDM"+id[3]);
						}
					} else {						
						destinationColl[key]["DDM"+id[3]] = charge.replace(/\s+/g, '');
						ddmchargesHead.push("DDM"+id[3]);
					}
				}
			}
			hirechargesHead = getUniqueArr(hirechargesHead);
			ddmchargesHead = getUniqueArr(ddmchargesHead);

			function sumTotalsFormatter(totals, columnDef) {
				var val = totals.sum && totals.sum[columnDef.field];
				if(columnDef['totalSumValue'] == true){
					return "<b> " + ((totals.sum['topayBookingTotal']+totals.sum['paidBookingTotal'])/totals.sum['totalActualWeight']).toFixed(2)+"</b>";
				}else if (val != null) {
					return "<b> " + ((Math.round(parseFloat(val)*100)/100))+"</b>";
				}
				return "";
			}
			var columnsHead = new Array();
			columnsHead.push({dtoName:'destinationBranchName',cssName:'column-data-left-align','hasTotal':false,width:200,printWidth : 40});
			columnsHead.push({dtoName:'totalActualWeight',cssName:'column-data-right-align','hasTotal':true,width:105,printWidth : 15});
			columnsHead.push({dtoName:'average',cssName:'column-data-right-align','hasTotal':false,width:105,printWidth : 15,totalSumValue:true});
			columnsHead.push({dtoName:'topayBookingTotal',cssName:'column-data-right-align','hasTotal':true,width:105,printWidth : 15});
			columnsHead.push({dtoName:'paidBookingTotal',cssName:'column-data-right-align','hasTotal':true,width:105,printWidth : 15});
			for(var charge in hirechargesHead){
				columnsHead.push({dtoName:hirechargesHead[charge],cssName:'column-data-right-align','hasTotal':true,width:105,printWidth : 15});
			}
			columnsHead.push({dtoName:'bookingCommision',cssName:'column-data-right-align','hasTotal':true,width:105,printWidth : 15});
			if(groupConfiguration.showDCommision){
				columnsHead.push({dtoName:'deliveryCommision',cssName:'column-data-right-align','hasTotal':true,width:105,printWidth : 15,show:false});
			}
			columnsHead.push({dtoName:'companyCommission',cssName:'column-data-right-align','hasTotal':true,width:105,printWidth : 15});
			for(var charge in ddmchargesHead){
				columnsHead.push({dtoName:ddmchargesHead[charge],cssName:'column-data-right-align','hasTotal':true,width:105,printWidth : 15});
			}
			columnsHead.push({dtoName:'balance',cssName:'column-data-right-align','hasTotal':true,width:105,printWidth : 15});

			function getUniqueArr(ArrayList){
				var n = {},r=[];for(var i = 0; i < ArrayList.length; i++){if (!n[ArrayList[i]]){n[ArrayList[i]] = true;r.push(ArrayList[i]);}}
				return r.sort(function(a, b) {return a.localeCompare(b);});
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

			var langObj = FilePath.loadLanguage();
			var language	= loadLanguageWithParams(langObj);

			var columns = new Array();
			for(var head in columnsHead){
				columns.push( { id:  columnsHead[head]['dtoName'],name:language[columnsHead[head]['dtoName']], field: columnsHead[head]['dtoName'],
					minWidth:100,width: columnsHead[head]['width'],sortable: true,hasTotal:columnsHead[head]['hasTotal'],cssClass:columnsHead[head]['cssName'],
					searchFilter:false,listFilter:false,dataType:'text',printWidth:columnsHead[head]['printWidth'],valueType:'number',groupTotalsFormatter : sumTotalsFormatter,
					toolTip:columnsHead[head]['dtoName'],sorter:sorterData,formatter:Slick.Formatters.DefaultValues,totalSumValue : columnsHead[head]['totalSumValue']
				});
			}
			for (var i = 0; i < destinationColl.length; i++) {
				destinationColl[i]['id']=parseInt(i)+1;
			} // adding row number to the table
			var old = JSON.stringify(destinationColl) //convert to JSON string
			destinationColl = JSON.parse(old);

			dataView = new Slick.Data.DataView({ inlineFilters: true ,groupItemMetadataProvider: groupItemMetadataProvider});
			dataView.setItems(destinationColl);
			grid = new Slick.Grid("#sourceDestinationWiseLRDetails", dataView, columns, {
				enableCellNavigation: true,
				multiColumnSort: true,
				enableColumnReorder: true,
				frozenColumn: -1,
				fullWidthRows:true,
				rowHeight: 30,
				enableAsyncPostRender: true,
				showFooterRow: false,
				explicitInitialization:true,
				autoHeight:false,
			});
			var groupItemMetadataProvider = new Slick.Data.GroupItemMetadataProvider();
			grid.registerPlugin(groupItemMetadataProvider);

			var columnsArr = new Array();
			var columns = grid.getColumns();
			columns.forEach(function (col) {
				if(col.hasTotal){
					columnsArr.push(new Slick.Data.Aggregators.Sum(col.field));
				}
			});

			dataView.setGrouping({
				getter: 'sourceBranchName',
				formatter: function (g) {
					return  'Station : '+g.value  
				},
				aggregators: columnsArr,
				aggregateCollapsed: false,
				lazyTotalsCalculation: true
			});

			var tbody	= $('#grandTotalSummary tbody');
			var row = $("<tr style='text-align: right;padding-right: 10px' />");
			grid.onFooterRowCellRendered.subscribe(function (e, args) {
				$(args.node).empty();
				if(args.column.hasTotal == true){
					$("<span id='columnTotal_"+args.column.id+"' data-columnTotal="+args.column.id+" class='footerTotal'>"+totals[args.column.id]+"</span>")
					.appendTo(args.node);
				}
				var td = $("<td/>");
				if(totals[args.column.id] != undefined) {
					td.append($("<span id='columnTotal_"+args.column.id+"' data-columnTotal="+args.column.id+" class='footerTotal'>"+totals[args.column.id]+"</span>"))
				} else if(args.column.id == 'average') {
					td.append($("<span id='columnTotal_"+args.column.id+"' data-columnTotal="+args.column.id+" class='footerTotal'>"+((totals['topayBookingTotal'] + totals['paidBookingTotal'])/totals['totalActualWeight']).toFixed(2)+"</span>"))
				}
				row.append(td);
				tbody.append(row);
			});
			
			
			var totals = {};
			_this.updateColumnTotal(columns,dataView,totals);
			var printPlugin = new Slick.Plugins.TruckAnalyzePrint();

			grid.registerPlugin(printPlugin);
			$('#btnprint').on('click', function () {
				var strWindowFeatures = "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes";
				printPlugin.printToWindow(window.open('/ivcargo/template/truckanalyzingreport/printtruckanalyzingreport.html', 'print_window', strWindowFeatures));
			});

			grid.init();
			grid.invalidate();

		},updateColumnTotal:function (columnPicker,dataView,totals){
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

				$('#columnTotal_'+column.id).html(total);

			}  
		},setlhpvChrgs : function(response) {

			var lhpvSettlementCharges	= null;
			var LHPVChargeTypeConstant	= null;
			var lorryHireAmt			= 0;
			var hamali					= 0;
			var oh						= 0;
			var ol						= 0;
			var lc						= 0;
			var doorDelivery			= 0;
			var crossingLH				= 0;
			var crossingHamali			= 0;
			var cartage					= 0;
			var other1					= 0;
			var co_LH					= 0;
			var total					= 0; 
			var advance					= 0;
			var balance					= 0;
			var other2					= 0;
			var refund					= 0;
			var netLorryHire			= 0;
			var hireDiff				= 0;
			var weightDiff				= 0;

			lhpvSettelmentCharges	= response.LHPCSettelmentCharges;
			LHPVChargeTypeConstant	= response.LHPVChargeTypeConstant;
			truckAnalyzeHeader		= response.TruckAnalyzeHeader;

			for(var key in lhpvSettelmentCharges) {
				if(key == LHPVChargeTypeConstant.LORRY_HIRE) {
					lorryHireAmt			= lhpvSettelmentCharges[key];
				} else if(key == LHPVChargeTypeConstant.HAMALI_DEDUCT) {
					hamali					= lhpvSettelmentCharges[key];
				} else if(key == LHPVChargeTypeConstant.OH) {
					oh						= lhpvSettelmentCharges[key];
				} else if(key == LHPVChargeTypeConstant.OL) {
					ol						= lhpvSettelmentCharges[key];
				} else if(key == LHPVChargeTypeConstant.LC) {
					lc						= lhpvSettelmentCharges[key];
				} else if(key == LHPVChargeTypeConstant.DOOR_DELIVERY) {
					doorDelivery			= lhpvSettelmentCharges[key];
				} else if(key == LHPVChargeTypeConstant.CROSSING_LH) {
					crossingLH				= lhpvSettelmentCharges[key];
				} else if(key == LHPVChargeTypeConstant.CROSSING_HAMALI) {
					crossingHamali			= lhpvSettelmentCharges[key];
				} else if(key == LHPVChargeTypeConstant.CARTAGE) {
					cartage					= lhpvSettelmentCharges[key];
				} else if(key == LHPVChargeTypeConstant.OTHER_ADDITIONAL) {
					other1					= lhpvSettelmentCharges[key];
				} else if(key == LHPVChargeTypeConstant.CO_LH) {
					co_LH					= lhpvSettelmentCharges[key];
				} else if(key == LHPVChargeTypeConstant.ADVANCE_AMOUNT) {
					advance					= lhpvSettelmentCharges[key];
				}else if(key == LHPVChargeTypeConstant.OTHER_NEGATIVE) {
					other2					= lhpvSettelmentCharges[key];
				}else if(key == LHPVChargeTypeConstant.REFUND_AMOUNT) {
					refund					= lhpvSettelmentCharges[key];
				}
			}

			$('.lorryHireAmt').append(lorryHireAmt);
			$('.hamali').append(hamali);
			$('.oh').append(oh);
			$('.ol').append(ol);
			$('.lc').append(lc);
			$('.crossingLH').append(crossingLH);
			$('.doorDelivery').append(doorDelivery);
			$('.crossingHamali').append(crossingHamali);
			$('.cartage').append(cartage);
			$('.other1').append(other1);
			$('.co_LH').append(co_LH);
			$('.total').append(truckAnalyzeHeader.totalLorryHire);
			$('.advance').append(advance);
			$('.other2').append(other2);
			$('.balance').append(truckAnalyzeHeader.totalLorryHire - (advance + other2));
			$('.boliWeight').append(truckAnalyzeHeader.boliWeight);
			$('.ratePmt').append(truckAnalyzeHeader.ratePmt);
			$('.actualWeight').append(truckAnalyzeHeader.totalActualWeight);
			
			weightDiff	= -(truckAnalyzeHeader.boliWeight - truckAnalyzeHeader.totalActualWeight);
			hireDiff   = ((truckAnalyzeHeader.ratePmt * weightDiff)/1000);
			//hireDiff	=(((truckAnalyzeHeader.ratePmt * truckAnalyzeHeader.totalActualWeight)/1000) - truckAnalyzeHeader.totalLorryHire);
			$('.weightDiff').append(weightDiff);
			$('.hireDiff').append(Math.round(hireDiff));

			_this.removeChargesWithZero();
			
			if(lorryHireAmt > 0) {
				changeDisplayProperty('InfoMessage', 'none');
			}
			
			if(truckAnalyzeHeader.boliWeight <= 0){
				$('#diffLoryHire').hide();
			}
			
		},removeChargesWithZero : function() {
			// Run function for each tbody tr
			$("#lhpcChrgsDetails tbody tr").each(function() {
				var trToRemove	= $(this).closest('tr');
				// Within tr we find the last td child element and get content
				var value	=	$(this).find("td:last-child span").html();

				if(value !='' || value != undefined){
					if(value == 0){
						trToRemove.remove();
					}
				}
			});
		},ViewDetails : function(obj) {

			showLayer();

			var lsId				= obj.getAttribute('data-value');
			dispatchLedgerId 		= $('#lsId' + lsId).val();

			var jsonObject			= new Object();
			jsonObject["dispatchLedgerId"]	= dispatchLedgerId;
			
			var jsonStr = JSON.stringify(jsonObject);
			$.ajax({
				type: "POST",
				url: WEB_SERVICE_URL+'/truckAnalyzingReportWS/getTruckAnalyzingReportDetailsByDispatchLedgerId.do',
				data:jsonObject,
				success: function(data) {
					var response = JSON.parse(data); 
					if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
						showMessage('error', iconForErrMsg + ' ' + data.errorDescription); // show message to show system processing error massage on top of the window.
						hideLayer();
					} else {
						_this.setTruckAnalyzingReportDetails(response);
						hideLayer();
					}
				}
			});
		},createRow : function(Id,Style){
			var newRow 	=  $('<tr/>');
			newRow.attr({
				id : Id
				,style : Style
			});
			return newRow;
		},createTableRow : function(name,value,tableId) {
			var i = 1;
			var chrgName = null;
			var chrgAmt = null;
			tableRow		= _this.createRow(i,'');

			chrgName		= _this.createColumnInRow(tableRow, name, '', '20%', 'left', 'padding-top: 1px; height:20px; border-right: 0px solid black;', '');
			chrgAmt			= _this.createColumnInRow(tableRow, name, '', '20%', 'right', 'padding-top: 1px; height:20px; border-right: 0px solid black;', '');

			appendValueInTableCol(chrgName, name);
			appendValueInTableCol(chrgAmt, value);

			appendRowInTable(tableId, tableRow);
		},createColumnInRow : function(tableRow, Id, Class, Width, Align, Style, Collspan) {
			var newCol 	=  $('<td/>');

			newCol.attr({
				id 			: Id,
				class		: Class,
				width		: Width,
				align		: Align,
				colspan 	: Collspan,
				style		: Style,
				valign		: "top"
			});

			$(tableRow).append(newCol);

			return newCol;
		}
	}
});