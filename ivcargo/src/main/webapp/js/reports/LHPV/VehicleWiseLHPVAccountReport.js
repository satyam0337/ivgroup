var loadSrNo						= new $.Deferred();	//	SR NO
var loadDate						= new $.Deferred();	//	Date
var loadVehilceNo					= new $.Deferred();	//	VehicleNo
var loadLHPVNo						= new $.Deferred();	//	LHPV No
var loadFrom						= new $.Deferred();	//	From
var loadBLHPVNo						= new $.Deferred();	//	BLHPVNO
var loadBLHPVBranch					= new $.Deferred();	//	BlhpvBranch
var loadToPay						= new $.Deferred();	//	To pay
var loadPaid						= new $.Deferred();	//	Paid
var loadTBB							= new $.Deferred();	//	TBB
var loadTotal						= new $.Deferred();	//	Total
var loadTruckHire					= new $.Deferred();	//	Truck hire
var loadAdvance						= new $.Deferred();	//	Advance
var loadBalance						= new $.Deferred();	//	Balnce
var loadBasicFreight				= new $.Deferred();	//	Basic Freight
var loadPL							= new $.Deferred();	//	Pl

var reportConfiguration				= null;
var executiveObj					= null;
var Executive						= null;

function clearTable(){
	var elmtTable = document.getElementById('lhpvViewTbl');
	var tableRows = elmtTable.getElementsByTagName('tr');
	if(elmtTable.rows.length <3){
		loadReportColoumndData();
	}else{
		
		
		var rowCount = tableRows.length;
		
		for (var x=rowCount-1; x>0; x--) {
			elmtTable.removeChild(tableRows[x]);
		}
		
		loadReportColoumndData();
	}
	
}

function loadReportColoumndData(){
	var jsonObject		= new Object();
	var fromdate = document.getElementById("fromDate").value;
	var todate   = document.getElementById("toDate").value;
	var fromRegion   = document.getElementById("region").value;
	var fromArea   	= document.getElementById("subRegion").value;
	var fromBranch   = document.getElementById("branch").value;
	jsonObject.fromdate		= fromdate;
	jsonObject.todate		= todate;
	jsonObject.fromRegion	= fromRegion;
	jsonObject.fromArea		= fromArea;
	jsonObject.fromBranch	= fromBranch;
	
	jsonObject.filter	= 2;
	var jsonStr	= JSON.stringify(jsonObject);
	$.getJSON("VehicleWiseLHPVAccountReport.do?pageId=50&eventId=151",
			{json:jsonStr},function(data){
				console.log(data);
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', "NO Records Found!"); // show message to show system processing error massage on top of the window.
				} else{
					document.getElementById('HideShowMainTable').style.display= 'block';
					
					alert("data "+data.report);
					var lhpvArr = data.report;
					for(var i = 0; i < lhpvArr.length; i++){
						var lhpv	= lhpvArr[i];
						//alert("hi"+lhpv.lhpvId);
						//var row = createRow('tr_'+lhpv.lhpvId, '');
						var srNo 			= i+1;/*createColumn(row,'td_'+lhpv.lhpvId,'10%','center','','');*/
						var date 			= lhpv.creationDateTimeString;
						var vehicleNo		= lhpv.vehicleNumber;
						var lhpvNO 			= lhpv.lhpvNumber;
						var from 			= lhpv.sourceBranchString;
						var blhpvNo 		= lhpv.blhpvNumber;
						var blhpvBranch 	= lhpv.blhpvBranch;
						var tpPay  			= lhpv.toPay;
						var paid			= lhpv.paid;
						var tbb 			= lhpv.tbb;
						var total 			= lhpv.totalLrAmount;
						var truckHire 		= lhpv.totalAmount;
						var advance	    	= lhpv.advanceAmount;
						var balance	    	= lhpv.balanceAmount;
						var basicFreight 	= lhpv.lsNumber;
						var pl	 			= 100;
						
						 $('#lhpvViewTbl').dataTable( {
							 	"bPaginate": false,
						        "bInfo": false,
						        "fnDrawCallback": function ( oSettings ) {
									/* Need to redo the counters if filtered or sorted */
									if ( oSettings.bSorted || oSettings.bFiltered )
									{
										for ( var i=0, iLen=oSettings.aiDisplay.length ; i<iLen ; i++ )
										{
											$('td:eq(0)', oSettings.aoData[ oSettings.aiDisplay[i] ].nTr ).html( i+1 );
										}
									}
								},
								"aoColumnDefs": [
									{ "bSortable": false, "aTargets": [ 0 ] }
								],
								"aaSorting": [[ 1, 'asc' ]],
								dom: 'T<"clear">lfrtip', 
								destroy: true
						 });
						 document.getElementById( 'lhpvViewTbl_filter' ).style.display = 'none';
						 $('#lhpvViewTbl tfoot th').each( function () {
					         var title = $('#lhpvViewTbl thead th').eq( $(this).index() ).text();  
					        $(this).html( '<input type="text" id="'+title+'" size="5px;" placeholder="'+title+'" />' ); 
					   });
						var table = $('#lhpvViewTbl').DataTable();
						// Apply the search
						   table.columns().eq( 0 ).each( function ( colIdx ) {
						       $( 'input', table.column( colIdx ).footer() ).on( 'keyup change', function () {
						    	   
						    	   table
						               .column( colIdx )
						               .search( this.value )
						               .draw();
						       } );
						   });
						
						   table.row.add([srNo,date,vehicleNo,lhpvNO,from,blhpvNo,blhpvBranch,tpPay,paid,tbb,total,truckHire,advance,balance,basicFreight,pl]).draw();
						 /*$(srNo).append(i+1);
						 $(date).append(lhpv.creationDateTimeString);
						 $(vehicleNo).append(lhpv.vehicleNumber);
						 $(lhpvNO).append(lhpv.lhpvNumber);
						 $(from).append(lhpv.sourceBranchString);
						 $(blhpvNo).append(lhpv.blhpvNumber);
						 $(blhpvBranch).append(lhpv.blhpvBranch);
						 $(tpPay).append(lhpv.toPay);
						 $(paid).append(lhpv.paid);
						 $(tbb).append(lhpv.tbb);
						 $(total).append(lhpv.totalLrAmount);
						 $(truckHire).append(lhpv.totalAmount);
						 $(advance).append(lhpv.advanceAmount);
						 $(balance).append(lhpv.balanceAmount);
						 $(basicFreight).append(100);
						 $(pl).append(200);
						 
						 $('#lhpvViewTbl').append(row);
				*/		
					}
				}
			});
	//loadDataTables();
	//loadConfiguration();
}

function loadDataTables(){
	 $('#lhpvViewTbl').dataTable( {
		 	"bPaginate": false,
	        "bInfo": false,
	        "fnDrawCallback": function ( oSettings ) {
				/* Need to redo the counters if filtered or sorted */
				if ( oSettings.bSorted || oSettings.bFiltered )
				{
					for ( var i=0, iLen=oSettings.aiDisplay.length ; i<iLen ; i++ )
					{
						$('td:eq(0)', oSettings.aoData[ oSettings.aiDisplay[i] ].nTr ).html( i+1 );
					}
				}
			},
			"aoColumnDefs": [
				{ "bSortable": false, "aTargets": [ 0 ] }
			],
			"aaSorting": [[ 1, 'asc' ]]
	});
	 document.getElementById( 'lhpvViewTbl_filter' ).style.display = 'none';
	 $('#lhpvViewTbl tfoot th').each( function () {
         var title = $('#lhpvViewTbl thead th').eq( $(this).index() ).text();  
        $(this).html( '<input type="text" id="'+title+'" size="5px;" placeholder="'+title+'" />' ); 
   });
	var table = $('#lhpvViewTbl').DataTable();
	// Apply the search
	   table.columns().eq( 0 ).each( function ( colIdx ) {
	       $( 'input', table.column( colIdx ).footer() ).on( 'keyup change', function () {
	    	   
	    	   table
	               .column( colIdx )
	               .search( this.value )
	               .draw();
	       } );
	   });
}

function loadConfiguration() {
	
	var jsonObject		= new Object();
	jsonObject.filter	= 1;
	var jsonStr = JSON.stringify(jsonObject);
	$.getJSON("VehicleWiseLHPVAccountReport.do?pageId=50&eventId=151",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription); // show message to show system processing error massage on top of the window.
				} else{
					console.log(data);
					jsondata				= data;
					
					executiveObj				= jsondata.executive; // executive object
					Executive					= jsondata.executiveCon; // executive object
					reportConfiguration			= data.reportconfiguration;
					
					//loadColoumn(); // load content as per configuration
				}
				
			});
	}

function loadColoumn1() {
	if (reportConfiguration["lhpvViewTbl_pl_"+executiveObj.accountGroupId] == 1) {
		document.getElementById("hpl").style.display = 'none';
		document.getElementById("pl").style.display = 'none';
	}else if(reportConfiguration[lhpvViewTbl_pl]= 1){
		document.getElementById("hpl").style.display = 'block';
		document.getElementById("pl").style.display = 'block';
	}
}
function loadColoumn() {
	if (reportConfiguration["lhpvViewTbl_SRNO"] == 1) {
		if(reportConfiguration["lhpvViewTbl_SRNO_"+executiveObj.accountGroupId]==1 ){
			document.getElementById("hsrno").style.display = 'block';
			document.getElementById("srno").style.display = 'block';
		}else{
			document.getElementById("hsrno").style.display = 'none';
			document.getElementById("srno").style.display = 'none';
		}
	}else if(reportConfiguration["lhpvViewTbl_SRNO"] == 2){
		if(reportConfiguration["lhpvViewTbl_SRNO_"+executiveObj.accountGroupId]==1 ){
			document.getElementById("hsrno").style.display = 'block';
			document.getElementById("srno").style.display = 'block';
		}else{
			document.getElementById("hsrno").style.display = 'none';
			document.getElementById("srno").style.display = 'none';
		}
	}
}

function ValidateFormElement() {

	var region = document.getElementById('region');
	if(region != null) {
		if(region.options[region.selectedIndex].value == '-1') {
			showMessage('error', 'Please Select Region !');
			toogleElement('basicError','block');
			changeError1('region','0','0');
			$("#region").focus(); 
			return false;
		}
	}
	var subRegion =document.getElementById('subRegion');
	if(subRegion != null) {
		if(subRegion.options[subRegion.selectedIndex].value == '-1') {
			//showSpecificErrors('basicError','Please Select Area !');
			showMessage('error', 'Please Select Area !');
			toogleElement('basicError','block');
			changeError1('subRegion','0','0');
			$("#subRegion").focus(); 
			return false;
		}
	}
	var branch = document.getElementById('branch');
	if(branch != null) {
		if(branch.options[branch.selectedIndex].value == '-1') {
			//showSpecificErrors('basicError','Please Select Branch !');
			showMessage('error', 'Please Select Branch !');
			toogleElement('basicError','block');
			changeError1('branch','0','0');
			$("#branch").focus(); 
			return false;
		}
	}
	
	var dataTypeId = document.getElementById('dataTypeId');
	if(dataTypeId != null) {
		if(dataTypeId.options[dataTypeId.selectedIndex].value == '0'){
			var ele = document.getElementById('basicError');
			//showSpecificErrors('basicError',"Please, Select Type Of Data");
			showMessage('error', 'Please, Select Type Of Data	!');
			toogleElement('basicError','block');
			return false;
		} else {
			toogleElement('basicError','none');	
		}
	}
	clearTable();
	return true;
}

function hideTableOnload(){
	document.getElementById('HideShowMainTable').style.display= 'none';
}
//Create row in HTML table
function createRow(Id,Style){
	var newRow 	=  $('<tr/>');
	newRow.attr({
		id : Id
		,style : Style
	});
	return newRow;
}