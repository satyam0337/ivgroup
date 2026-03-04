var grandTotalOfHV = 0;

/***
 * Created By : Shailesh Khandare
 * Description : Get Truck Hisab Settlement Module.
 */

/**
 * Get Truck details By vehicle Id
 * Method will give details Of current Lhpv details.  
 */

function display(){
	$("#tripDetails").show();
} 

function showTabs(){
	$("#tabs").show();
}

/**
 *Function for accordion effect 
 *It should be call on bodyonload and 
 *include :-jquery-ui.js,jquery-1.10.2.js,jquery-ui.css  
 */
function getAccordionEffect(){
	$( "#tabs" ).tabs().addClass( "ui-tabs-vertical ui-helper-clearfix" );
    $( "#tabs li" ).removeClass( "ui-corner-top" ).addClass( "ui-corner-left" );
  }


/**
 * 
 */
var i = 0;
var totleAmount = 0;
function addDailyAllowanceTable(){
	$("#dailyAllowanceDiv").show();
	$("#grandTotals").show();
	$("#dailyAllowanceFoor").remove();
	
	var srNo 			= (i + 1);
	var fromDate 		= $("#from-date").val();
	var toDate			= $("#to-date").val();
	var totDays 		= $("#tot-days").val();
	var driverAmt 		= $("#driver-amount").val();
	var totAmt 			= $("#tot-amount").val();
	totleAmount = Number(totAmt) + Number(totleAmount);
	var row 				= createRow('dailyAllowance'+i, '');
	
	var srNoCol 					= createColumn(row,'srNo_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var fromDateCol 				= createColumn(row,'srNo_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var toDateCol	 				= createColumn(row,'srNo_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var totDaysCol 					= createColumn(row,'srNo_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var driverAmtCol 				= createColumn(row,'srNo_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var totAmtCol 					= createColumn(row,'srNo_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	
	$(srNoCol).append(srNo);
	$(fromDateCol).append(fromDate);
	$(toDateCol).append(toDate);
	$(totDaysCol).append(totDays);
	$(driverAmtCol).append(driverAmt);
	$(totAmtCol).append(totAmt);
	
	$("#dailyAllowance").append(row);
	
	var rowFoot 						= createRow('dailyAllowanceFoor', '');
	var srNoFootCol 					= createColumn(rowFoot,'srNo_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var fromDateFootCol 				= createColumn(rowFoot,'srNo_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var toDateFootCol	 				= createColumn(rowFoot,'srNo_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var totDaysFootCol 					= createColumn(rowFoot,'srNo_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var driverAmtFootCol 				= createColumn(rowFoot,'srNo_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var totAmtFootCol 					= createColumn(rowFoot,'srNo_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	
	$(srNoFootCol).append("");
	$(fromDateFootCol).append("");
	$(toDateFootCol).append("");
	$(totDaysFootCol).append("");
	$(driverAmtFootCol).append("Total: - ");
	$(totAmtFootCol).append(totleAmount);
	
	$("#dailyAllowance").append(rowFoot);
	grandTotalOfHV = Number(grandTotalOfHV) + Number(totleAmount);
	$("#grandTotalHisabSettle").val(grandTotalOfHV);
	i=i+1;
}


var i = 0;
var totleTollAmount = 0;
function addTollExpenseTable(){
	$("#tollExpenseDiv").show();
	$("#tollExpenseFoot").remove();
	$("#grandTotals").show();
	var srNo1 			= (i + 1);
	var tolltype 		= $("#toll-type").val();
	var tollname		= $("#toll-name").val();
	var TotTollAmount 	= $("#Tot-Toll-Amount").val();
	
	totleTollAmount = Number(TotTollAmount) + Number(totleTollAmount);
	var row1 				= createRow('tollExpense'+i, '');
	
	var srNo1Col 					= createColumn(row1,'srNo_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var tolltypeCol 				= createColumn(row1,'srNo_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var tollnameCol	 				= createColumn(row1,'srNo_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var TotTollAmountCol 			= createColumn(row1,'srNo_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	
	
	$(srNo1Col).append(srNo1);
	$(tolltypeCol).append(tolltype);
	$(tollnameCol).append(tollname);
	$(TotTollAmountCol).append(TotTollAmount);
	
	$("#tollExpense").append(row1);
	
	var rowFoot1 						= createRow('tollExpenseFoot', '');
	
	var srNo1FootCol 					= createColumn(rowFoot1,'srNo_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var tolltypeColFootCol 				= createColumn(rowFoot1,'srNo_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var tollnameFootCol	 				= createColumn(rowFoot1,'srNo_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var TotTollAmountFootCol 			= createColumn(rowFoot1,'srNo_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
		
	$(srNo1FootCol).append("");
	$(tolltypeColFootCol).append("");
	$(tollnameFootCol).append("Total: - ");
	$(TotTollAmountFootCol).append(totleTollAmount);
	
	
	$("#tollExpense").append(rowFoot1);
	grandTotalOfHV = Number(grandTotalOfHV) + Number(totleTollAmount);
	$("#grandTotalHisabSettle").val(grandTotalOfHV);
	i=i+1;
}


var i = 0;
var totlemiscAmount = 0;

function addMiscExpenseTable(){
	
	$("#miscExpenseFoot").remove();
	$("#miscExpenseDiv").show();
	$("#grandTotals").show();
	var srNo2 			= (i + 1);
/*	var typeOfExpense 	= $("#Type-Of-Expense").val();*/
	var typeOfExpense 	= getSeletedTextFromList("Type-Of-Expense");
	var TotMISCAmount 	= $("#Tot-Amount-Misc").val();
	
	totlemiscAmount 	= Number(TotMISCAmount) + Number(totlemiscAmount);
	var row2 			= createRow('MiscExpense'+i, '');
	
	var srNo2Col 					= createColumn(row2,'srNo_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var typeOfExpenseCol 			= createColumn(row2,'srNo_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var TotMISCAmountCol	 		= createColumn(row2,'srNo_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	
	
	
	$(srNo2Col).append(srNo2);
	$(typeOfExpenseCol).append(typeOfExpense);
	$(TotMISCAmountCol).append(TotMISCAmount);

	
	$("#miscExpense").append(row2);
	
	var rowFoot2 						= createRow('miscExpenseFoot', '');
	
	var srNo2FootCol 					= createColumn(rowFoot2,'srNo_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var tollnameFootCol	 				= createColumn(rowFoot2,'srNo_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
	var TotMISCAmountFootCol 			= createColumn(rowFoot2,'srNo_'+(i+1), 'datatd', '', '', 'letter-spacing:2px', '');
		
	$(srNo2FootCol).append("");
	$(tollnameFootCol).append("Total: - ");
	$(TotMISCAmountFootCol).append(totlemiscAmount);
	
	
	$("#miscExpense").append(rowFoot2);
	grandTotalOfHV = Number(grandTotalOfHV) + Number(totlemiscAmount);
	$("#grandTotalHisabSettle").val(grandTotalOfHV);
	i=i+1;
}


/**
 * This Methods to get Details about Lhpv.
 * And append value of lhpv  
 **/

var newcount = 0;
var counterForRowChng = 0;
var row = null;
var totLhpvDistance = 0;
function getLhpvDetails(){
	
	displaylhpvdetails()
	$("#tottalSummryDiesel").show();
		
		row 	= createRow('rowToClone_'+(counterForRowChng+1), '');
		counterForRowChng = 0;
		newcount 		  = 0;
		counterForRowChng = 0;
		newcount 		  = 0;
	
	var LHPVNoCol  		= createColumn(row,'srNo_'+(Number(newcount)), 'datatd', '', '', 'letter-spacing:2px', '');
	var DateCol  		= createColumn(row,'srNo_'+(Number(newcount)), 'datatd', '', '', 'letter-spacing:2px', '');
	var FromCol  		= createColumn(row,'srNo_'+(Number(newcount)), 'datatd', '', '', 'letter-spacing:2px', '');
	var ToCol  			= createColumn(row,'srNo_'+(Number(newcount)), 'datatd', '', '', 'letter-spacing:2px', '');
	var kilometerCol 	= createColumn(row,'srNo_'+(Number(newcount)), 'datatd', '', '', 'letter-spacing:2px', '');
	
	$(LHPVNoCol).append("123");
	$(DateCol).append("12-04-2016");
	$(FromCol).append("Khadak");
	$(ToCol).append("Vapi");
	$(kilometerCol).append(100);
	
	$("#lhpvTableContent").append(row);
	
	newcount = Number(newcount + 1);
	counterForRowChng = Number(counterForRowChng +1 );
}


/**
 *Calculate Total Lhpv Km 
 **/
function getTotalLhpvAddition(){
	totLhpvDistance =	Number(totLhpvDistance + 100);
	document.getElementById("totNumberOfLHPVDistance").value = totLhpvDistance;
	/*$("#totNumberOfLHPVDistance").text(totLhpvDistance);*/
}

/**********************SJNSNSNNKNKKNKKNKNKN****************************/
var newcountDDM = 0;
var counterForRowChngDDM = 0;
var rowDDM = null;
var totDDMDistance = 0;
function getDDMDetails(){
	console.log("truer");
	$("#dailyAllowanceDiv11").show();
}
/**
 *Calculate Total Lhpv Km 
 **/
function getTotalDDMAddition(){
	totDDMDistance =	Number(totDDMDistance + 100);
	$("#totNumberOfDDMDistance").val(totDDMDistance);
	
}

var  totCollectionDistance = 0;
function getTotalCollectionDetails(){
	
	$("#dailyAllowanceDiv111").show();
	$("#tottalSummryDiesel").show();
	
	totCollectionDistance =	Number(totCollectionDistance) + Number( $("#Collection-In-KM").val());
	$("#totNumberOfCollectionDistance").text(totCollectionDistance);
}
