var totalbookingcharwithoutDly	= 0;
var grandTotalbookingcharwithoutDly	 = 0;
var grandtotalforptcwithoutdlycharge = 0;
var accountGroupId = 0;
var setFooterToNextPage= false;
var rem = 0;
var MATHADI = 264;
var customTaxForSrst = 0;
var dlycharges =0;
var openInvoicePrintPopUpAfterBkgDly = false;
var isCRMPage = false;
define(['JsonUtility',
	//jsonutility consist of ajax calls to send json object as an ajax hit to the url specified and get call back as specified
	'messageUtility',
	PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js',
	// to get parameter from url to send it to ws
	PROJECT_IVUIRESOURCES+'/resources/js/module/view/invoiceprint/invoiceprintsetup.js',
	'jquerylingua',
	'language',
	PROJECT_IVUIRESOURCES+'/resources/js/generic/genericfunctions.js',
	PROJECT_IVUIRESOURCES+'/js/jspdf/html2canvas.js',
	],
	function(JsonUtility, MessageUtility, UrlParameter, InvoicePrintSetup, jquerylingua, language, genericFunction, html2canvas) {
	'use strict';// this basically give strictness to this specific js
	var 
	masterId = "0",
	jsonObject	= new Object(),
	pageBreaker,
	pageCounter,
	configuration,
	isExcel = false,
	billPdfEmailAllowed=false,
	isSearchBillPDFEmail = false,
	isBkgDlyTimeInvoicePrint = false,
	_this = '',
	dynamicCharges =false;
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(){
			//masterid is fetched and passed when the view is called and it is set to fetch it from webservice
			masterId = UrlParameter.getModuleNameFromParam(MASTERID)

			if(UrlParameter.getModuleNameFromParam('isExcel') != null)
				isExcel	 = UrlParameter.getModuleNameFromParam('isExcel')
				
			if(UrlParameter.getModuleNameFromParam('isCRMPage') != null)
				isCRMPage	 = UrlParameter.getModuleNameFromParam('isCRMPage')
			
			if(UrlParameter.getModuleNameFromParam('billPdfEmailAllowed') != null)
				billPdfEmailAllowed	 = UrlParameter.getModuleNameFromParam('billPdfEmailAllowed')
			
			if(UrlParameter.getModuleNameFromParam('isSearchBillPDFEmail') != null)
				isSearchBillPDFEmail  = UrlParameter.getModuleNameFromParam('isSearchBillPDFEmail')

			if(UrlParameter.getModuleNameFromParam('isBkgDlyTimeInvoicePrint') != null)
				isBkgDlyTimeInvoicePrint  = UrlParameter.getModuleNameFromParam('isBkgDlyTimeInvoicePrint')
			
			if(UrlParameter.getModuleNameFromParam('openInvoicePrintPopUpAfterBkgDly') != null)
				openInvoicePrintPopUpAfterBkgDly  = UrlParameter.getModuleNameFromParam('openInvoicePrintPopUpAfterBkgDly')
			
			//initialize is the first function called on call new view() 
			_this = this;
		}, render: function() {

			jsonObject.billId = masterId;

			if(isCRMPage == true || isCRMPage == 'true') {
				jsonObject.isCRMPage = true;
				getJSON(jsonObject, CUSTOMER_ACCESS_URL_CONSTANT + '/billPrintWS/getInvoicePrintByBillId.do?', _this.setBillDetails, EXECUTE_WITHOUT_ERROR);
			} else
				getJSON(jsonObject, WEB_SERVICE_URL + '/billPrintWS/getInvoicePrintByBillId.do?', _this.setBillDetails, EXECUTE_WITHOUT_ERROR);

			return _this;
		}, setBillDetails : function(response) {
			hideLayer();
			var wayBillDetailsForPrintingBill	= response.WayBillDetailsForPrintingBill;
			var BillDetailsForPrintingBill		= response.BillDetailsForPrintingBill;
			var unAddedTaxAmount				= response.unAddedTaxAmount;
			var billTotalInWords				= response.billTotalInWords;
			var preBillTotalInWords				= response.preBillTotalInWords;
			
			configuration					= response.FlavorConfiguration;
			accountGroupId					= configuration.accountGroupId;
			var headerFooterData			= _this.getHeaderAndFooterObject(response.printHeaderModel, wayBillDetailsForPrintingBill);
			var billData					= _this.getBillData(BillDetailsForPrintingBill, response.corporateAccount, unAddedTaxAmount, response.BillDetailsForBillClearance, configuration, billTotalInWords, preBillTotalInWords, wayBillDetailsForPrintingBill);
			var tableData					= _this.getArrayForTableDetails(wayBillDetailsForPrintingBill, unAddedTaxAmount, configuration, BillDetailsForPrintingBill);
			var suppBillData				= response.suppBillDeatilsList;
			var footerAppendOnLastPage		= configuration.footerAppendOnLastPage;
			var pageCountForFooterAppend	= configuration.pageCountForFooterAppend;
			var header						= configuration.headerPrintCount;
			var lastPageLRTotal				= configuration.totalPageOfline;
			var footersize					= configuration.footerPrintSize;
			var lastpagelrcount				= 0; 
			var diffLrCount					= 0; 
			var headerAppendOnFirstPage		= configuration.headerAppendOnFirstPage;
			var lastDiffLRCount = 0;
			var extraRowsAfterFirstPage		= configuration.extraRowsAfterFirstPage;
			var showFooterOnLastPageBottom	= configuration.showFooterOnLastPageBottom;
			var invoicePrintFlavor			= configuration.invoicePrintFlavor;
			var invoicePrintForBitlaGroup	= response.invoicePrintForBitlaGroup;
			var invoicePrintForNewGroups	= response.invoicePrintForNewGroups;
			dynamicCharges					= configuration.dynamicCharges;
			
			_this.getServiceTax(billData, BillDetailsForPrintingBill, response);
			
			var totalLR						= tableData.length;
			
			tableData						= _this.setSrNumber(tableData);
			var otherChargesCountForSKL		= tableData[0].count;
			var sklRowCount					= tableData.length + otherChargesCountForSKL;
			
			_this.getBillCreatetax(billData, response); 

			require([InvoicePrintSetup.getConfiguration(invoicePrintFlavor, tableData, invoicePrintForBitlaGroup, invoicePrintForNewGroups), 
				InvoicePrintSetup.getFilePathForLabel()], function(View, FilePath) {
					
				var branchAddress				= BillDetailsForPrintingBill.branchAddress;
				var billNumber					= BillDetailsForPrintingBill.billNumber;
				var fromDateStr					= BillDetailsForPrintingBill.fromDateStr;
				var toDateStr					= BillDetailsForPrintingBill.toDateStr;
				var creditorName				= BillDetailsForPrintingBill.creditorName;
				var creditorAddress				= BillDetailsForPrintingBill.creditorAddress;
				var creditorMobileNumber		= BillDetailsForPrintingBill.creditorMobileNumber;
				var creationDateTimeStampStr	= BillDetailsForPrintingBill.creationDateTimeStampStr;
								
				if(BillDetailsForPrintingBill.creditorGstn != undefined && BillDetailsForPrintingBill.creditorGstn !='undefined')
					var creditorGstn = BillDetailsForPrintingBill.creditorGstn;
				else
					var creditorGstn = "";
								
				var partyStateCode	= BillDetailsForPrintingBill.partyStateCode;
				
				if(isExcel == true || isExcel == 'true')
					pageBreaker		= 500000;
				else
					pageBreaker		= configuration.pageBreaker;

				if(configuration.showAllCharges){
					pageCounter		 = Math.round(sklRowCount/pageBreaker);
				} else {
					pageCounter		 = Math.ceil(tableData.length/pageBreaker);
					
					if(pageCounter > 0) {
						if(tableData.length > pageBreaker){
							lastpagelrcount		= ((tableData.length - pageBreaker )% (pageBreaker + extraRowsAfterFirstPage));
							lastDiffLRCount		= (pageBreaker + extraRowsAfterFirstPage) - lastpagelrcount;
						} else{
							lastpagelrcount		= tableData.length % pageBreaker;
							lastDiffLRCount		= pageBreaker - lastpagelrcount;
						}
						
						if(lastpagelrcount == 0)
							lastpagelrcount = configuration.pageBreaker + extraRowsAfterFirstPage;
						
						diffLrCount = (lastPageLRTotal - header - lastpagelrcount) ;
					} else {
						lastpagelrcount	 = (tableData.length % pageBreaker);
						
						if(lastpagelrcount == 0)
							lastpagelrcount = configuration.pageBreaker;
						
						diffLrCount		= (lastPageLRTotal - header - lastpagelrcount) ;
						lastDiffLRCount = pageBreaker - lastpagelrcount;
					}
				}
				
				var lastItrObj	= new Object();
				lastItrObj.firstITR = false;
				lastItrObj.lastITR	= false;
				
				if(configuration.showFooterOnLastPageBottom) {
					lastItrObj.diffLRCount				  = lastDiffLRCount;
					lastItrObj.lastpagelrcount			  = lastpagelrcount;
					lastItrObj.showFooterOnLastPageBottom = showFooterOnLastPageBottom;
				}
				
				if (pageCounter <= 0) {
					var pageNumber = 0;
					lastItrObj.firstITR		= true;
					lastItrObj.lastITR		= true;
					
					if(pageCountForFooterAppend && diffLrCount < footersize)
						pageCounter = pageCounter + 1;
					
					_this.$el.html(_.template(View));
					InvoicePrintSetup.setHeadersForPrint(headerFooterData, pageNumber, billData, configuration,isExcel);
					InvoicePrintSetup.setInformationDivs(headerFooterData);
					InvoicePrintSetup.setBillData(billData, suppBillData, customTaxForSrst,isBkgDlyTimeInvoicePrint);
					tableData.push(lastItrObj);
					InvoicePrintSetup.setDataTableDetails(tableData, configuration, dynamicCharges);
					InvoicePrintSetup.setDataTableDetailsForTotal(BillDetailsForPrintingBill,tableData, totalLR, lastItrObj, configuration);
					InvoicePrintSetup.setSuppBillDetails(suppBillData);
					InvoicePrintSetup.setBranchWiseBankDetails(response.bankAccountList, BillDetailsForPrintingBill.branchId);
					InvoicePrintSetup.setCurrentDateTime(response);
					InvoicePrintSetup.setDeductionCharges(response);

					pageNumber++;
					$("*[data-footerpage='pageNo']").last().html(pageNumber);
					$("[data-footerpage='pagecounter']").html(pageCounter+1);
					$("*[data-footerpage='firstpageNo']").first().html(pageNumber);
					$("[data-footerpage='firstpagecounter']").html(pageCounter+1);
					
					if(footerAppendOnLastPage){
						if(diffLrCount < footersize){
							$('.header2').prev('div').addClass('header1');
							$('.header1').addClass('page-break');
							$('.header1').append("<table width='100%' cellpadding='0' cellspacing='0' border='0'><tr><td width='30%' style='text-align: center;'><img src='/ivcargo/images/Logo/372.GIF' width='100%' height='60px' style='padding-left: 51px;'/></td></tr><tr><td style='width: 65%;'><table style='border: 1px solid black;margin-left: 50px;margin-bottom: 1px;' width='100%'><tr><td colspan='2' width='70%'class='pageBreakNeeded'>" +
									"<span class='font12' data-selector='branchAddressLabel'></span><span class='font12'>"+branchAddress+"</span>" +
									" </td></tr><tr><td colspan='2' width='70%'><span class='font12' data-selector='email'></span>&nbsp;<span class='font12'>accounts@cxlexpress.com,</span>&nbsp;<span class='font12' data-selector='website'></span>&nbsp;<span class='font12'>www.cxlexpress.com</span>" +
									"&nbsp;&nbsp;<span class='font12' data-selector='branchPhoneNumberLabel'></span>&nbsp;<span class='font12'>9980008855</span></td></tr><tr><td colspan='2' width='70%'><span class='font12' data-selector='cin'></span>&nbsp;<span class='font12'>U60232KA2019PTC123448</span>&nbsp;<span class='font12' data-selector='gst'></span>&nbsp;<span class='font12'>29AAICC1295L1Z6</span>&nbsp;<span class='font12' data-selector='code'>" +
									"</span>&nbsp;<span class='font12'>29</span>&nbsp;<span class='font12' data-selector='state'>:</span>&nbsp;<span class='font12'>Karnataka</span></td></tr></table></td><td style='width: 35%;'><table style='margin-left: 50px;'><tr><td colspan='2' width='70%' class='' style='padding-left: 32px;'><span class='font12'>Freight Bill (Consolidated Statement)</span></td></tr>" +
									"<tr><td colspan='2' width='70%' class='rightAlign' style='padding-right: 40px;'><span class='font12'>Page NO.: </span><span >"+(pageNumber+1)+"</span>&nbsp;Of&nbsp;<span>"+pageCounter+"</span></td></tr></table></td></tr></table>" +
									"<table width='100%' cellpadding='0' cellspacing='0' border='0'><tr> <td class=' font13 width70per'><table width= '100%' cellpadding='0' cellspacing='0' border='0' style='position: relative;bottom: 12px;margin-left: 6px;'><tr><td class='height20px'><span class='bold' data-selector='freightbillno'></span><span>"+billNumber+"</span></td></tr><tr><td class='height20px'>" +
									"<span class='bold' data-selector='date'></span><span>"+creationDateTimeStampStr+"</span></td></tr><tr><td class='height20px' width='28%'><span class='bold' data-selector='billingperiod'></span><span>"+fromDateStr+"</span></td><td class='height20px'><span class='bold' data-selector='to'></span><span>"+toDateStr+"</span></td></tr><tr><td class='leftAlign font12' >&nbsp; " +
									"</td></tr></table></td><td class='font13 width30'><table width= 100% cellpadding='0' cellspacing='0' border='0'><tr><td class='height20px'><span class='bold' data-selector='customername'></span><span class='pageBreakNeeded'>"+creditorName+"</span></td></tr><tr><td class='height50px'><span class='bold' data-selector='address'></span><span class='pageBreakNeeded'>"+creditorAddress+"</span></td></tr>" +
									"<tr><td class='height20px'><span class='bold' data-selector='gst'></span><span>"+creditorGstn+"</span></td></tr><tr><td class='height20px'><span class='bold' data-selector='code'></span><span>"+partyStateCode+"</span>&nbsp;&nbsp;<span class='bold' data-selector='state' style='margin-left: 20%;'></span><span></span></td></tr></table></td></tr></table><br><br>");
						}
					}
					
					if(headerAppendOnFirstPage) {
						$('.header2').prev('div').addClass('header1');
						$('.header1').append("<table  width= '100%' cellpadding='0' cellspacing='0' border='0' class='borderLeft borderRight borderTop'><tr><td class='textCenter borderBottom bold'><span>Original</span></td></tr></table><table width= '100%' cellpadding='0' cellspacing='0' border='0' class=' borderLeft borderRight'><tr><td width='33%' class='textCenter borderBottom borderRight'></td><td width='34%' class='textCenter borderBottom borderRight bold'>" + 
									"<span>INVOICE</span></td><td width='33%' class='textCenter borderBottom bold'><span>&nbsp;&nbsp;</span></td></tr></table><table width= '100%' cellpadding='0' cellspacing='0' border='0' class=' borderLeft borderRight'><tr><td class='height70 width50 borderRight borderBottom'><table width= '100%' cellpadding='0' cellspacing='0' border='0' ><tr><td class='width50 pageBreakNeeded' colspan='2' ><span class='paddingLeft5'>To,</span><br>" + 
									"<span class='paddingLeft5 bold'>"+creditorName+"</span></td></tr><tr><td class='width100 pageBreakNeeded paddingLeft5' colspan='2'>"+creditorAddress+"</td></tr><tr><td class='width100 pageBreakNeeded ' colspan='2'><span class='paddingLeft5' data-selector='mob'></span><span class='paddingLeft5'>"+creditorMobileNumber+"</span></td></tr><tr><td class='width100'><span class='paddingLeft5' data-selector='gst'></span>" +
									"<span class='paddingLeft5'>"+creditorGstn+"</span></td></tr></table></td><td class='height70 width25 borderRight borderBottom'><table width= '100%' cellpadding='0' cellspacing='0' border='0'><tr><td class='width70 width100'><span class='paddingLeft5' data-selector='invoiceno'></span><br><span class='paddingLeft5 bold'>"+billNumber+"</span></td></tr><tr><td class='width70'>&nbsp;</td><td class='width30'>&nbsp;</td></tr><tr><td class='width70'>&nbsp;</td>" +
									"<td class='width30'>&nbsp;</td></tr></tr><td class='width70'>&nbsp;</td><td class='width30'>&nbsp;</td></tr><tr><td class='width70'>&nbsp;</td><td class='width30'>&nbsp;</td></tr></table></td><td class='height70 width25 borderBottom'><table width= '100%' cellpadding='0' cellspacing='0' border='0'><tr><td class='width100'><span class='paddingLeft5' data-selector='date'></span><br><span class='paddingLeft5 bold'>"+creationDateTimeStampStr+"</span></td></tr><tr><td class='width70'>&nbsp;</td>" +
									"<td class='width30'>&nbsp;</td></tr><tr><td class='width70'>&nbsp;</td><td class='width30'>&nbsp;</td></tr><tr><td class='width70'>&nbsp;</td><td class='width30'>&nbsp;</td></tr><tr><td class='width70'>&nbsp;</td><td class='width30'>&nbsp;</td></tr></table></td></tr></table>" );
					}
					
					InvoicePrintSetup.setFooterDiv(billData , headerFooterData , configuration, isExcel, isSearchBillPDFEmail,tableData);
				} else {
					var pageNumber = 0;
					diffLrCount = (lastPageLRTotal - header - lastpagelrcount) ;
					
					if(pageCountForFooterAppend && diffLrCount < footersize)
						pageCounter = pageCounter + 1;
					
					if(configuration.autoPageBreak)
						pageBreaker = tableData.length;
					
					if(configuration.setFooterOnNextPage) {
						rem = tableData.length % pageBreaker;
						let diff = (pageBreaker - rem);
						
						if(diff <= configuration.setPageBreakForFooter)
						  setFooterToNextPage =	 true;
					}
					
					for (var j = 0; j < tableData.length; j += pageBreaker) {
						_this.$el.append(_.template(View));
						
						if(configuration.autoPageBreak) {
							lastItrObj.firstITR		= true;
							lastItrObj.lastITR		= true;
						} else {
							if(j == 0)
								lastItrObj.firstITR	   = true;
							else
								lastItrObj.firstITR	   = false;
							
							if(!lastItrObj.firstITR && pageBreaker == j && extraRowsAfterFirstPage > 0)
								pageBreaker = pageBreaker + extraRowsAfterFirstPage;
							
							if (j + pageBreaker >= tableData.length)
								lastItrObj.lastITR = true;
						}
						
						var chunkArray = tableData.slice(j,j+pageBreaker);
						InvoicePrintSetup.setHeadersForPrint(headerFooterData, pageNumber, billData, configuration,isExcel);
						InvoicePrintSetup.setInformationDivs(headerFooterData);
						InvoicePrintSetup.setBillData(billData, suppBillData, customTaxForSrst, isBkgDlyTimeInvoicePrint);
						chunkArray.push(lastItrObj);
						InvoicePrintSetup.setDataTableDetails(chunkArray, configuration, dynamicCharges);
						InvoicePrintSetup.setDataTableDetailsForTotal(BillDetailsForPrintingBill,chunkArray, totalLR, lastItrObj, configuration);
						InvoicePrintSetup.setSuppBillDetails(suppBillData);
						InvoicePrintSetup.setBranchWiseBankDetails(response.bankAccountList, BillDetailsForPrintingBill.branchId);
						InvoicePrintSetup.setCurrentDateTime(response);
						InvoicePrintSetup.setDeductionCharges(response);
						
						pageNumber++;
						
						$("*[data-footerpage='pageNo']").last().html(pageNumber);
						$("[data-footerpage='pagecounter']").html(pageCounter);
						$("*[data-footerpage='firstpageNo']").first().html(pageNumber);
						$("[data-footerpage='firstpagecounter']").html(pageCounter);
						
						if(lastItrObj.firstITR) {
							if(headerAppendOnFirstPage){
								$('.header2').prev('div').addClass('header1');
								$('.header1').append("<table  width= '100%' cellpadding='0' cellspacing='0' border='0' class='borderLeft borderRight borderTop'><tr><td class='textCenter borderBottom bold'><span>Original</span></td></tr></table><table width= '100%' cellpadding='0' cellspacing='0' border='0' class=' borderLeft borderRight'><tr><td width='33%' class='textCenter borderBottom borderRight'></td><td width='34%' class='textCenter borderBottom borderRight bold'>" + 
										"<span>INVOICE</span></td><td width='33%' class='textCenter borderBottom bold'><span>&nbsp;&nbsp;</span></td></tr></table><table width= '100%' cellpadding='0' cellspacing='0' border='0' class=' borderLeft borderRight'><tr><td class='height70 width50 borderRight borderBottom'><table width= '100%' cellpadding='0' cellspacing='0' border='0' ><tr><td class='width50 pageBreakNeeded' colspan='2' ><span class='paddingLeft5'>To,</span><br>" + 
										"<span class='paddingLeft5 bold'>"+creditorName+"</span></td></tr><tr><td class='width100 pageBreakNeeded paddingLeft5' colspan='2'>"+creditorAddress+"</td></tr><tr><td class='width100 pageBreakNeeded ' colspan='2'><span class='paddingLeft5' data-selector='mob'></span><span class='paddingLeft5'>"+creditorMobileNumber+"</span></td></tr><tr><td class='width100'><span class='paddingLeft5' data-selector='gst'></span>" +
										"<span class='paddingLeft5'>"+creditorGstn+"</span></td></tr></table></td><td class='height70 width25 borderRight borderBottom'><table width= '100%' cellpadding='0' cellspacing='0' border='0'><tr><td class='width70 width100'><span class='paddingLeft5' data-selector='invoiceno'></span><br><span class='paddingLeft5 bold'>"+billNumber+"</span></td></tr><tr><td class='width70'>&nbsp;</td><td class='width30'>&nbsp;</td></tr><tr><td class='width70'>&nbsp;</td>" +
										"<td class='width30'>&nbsp;</td></tr></tr><td class='width70'>&nbsp;</td><td class='width30'>&nbsp;</td></tr><tr><td class='width70'>&nbsp;</td><td class='width30'>&nbsp;</td></tr></table></td><td class='height70 width25 borderBottom'><table width= '100%' cellpadding='0' cellspacing='0' border='0'><tr><td class='width100'><span class='paddingLeft5' data-selector='date'></span><br><span class='paddingLeft5 bold'>"+creationDateTimeStampStr+"</span></td></tr><tr><td class='width70'>&nbsp;</td>" +
										"<td class='width30'>&nbsp;</td></tr><tr><td class='width70'>&nbsp;</td><td class='width30'>&nbsp;</td></tr><tr><td class='width70'>&nbsp;</td><td class='width30'>&nbsp;</td></tr><tr><td class='width70'>&nbsp;</td><td class='width30'>&nbsp;</td></tr></table></td></tr></table>" );
							}
						}  
					}
					
					if(footerAppendOnLastPage){
						if(diffLrCount < footersize){
							$('.header2').prev('div').addClass('header1');
							$('.header1').addClass('page-break');
							$('.header1').append("<table width='100%' cellpadding='0' cellspacing='0' border='0'><tr><td width='30%' style='text-align: center;'><img src='/ivcargo/images/Logo/372.GIF' width='100%' height='60px' style='padding-left: 51px;'/></td></tr><tr><td style='width: 65%;'><table style='border: 1px solid black;margin-left: 50px;margin-bottom: 1px;' width='100%'><tr><td colspan='2' width='70%'class='pageBreakNeeded'>" +
									"<span class='font12' data-selector='branchAddressLabel'></span><span class='font12'>"+branchAddress+"</span>" +
									" </td></tr><tr><td colspan='2' width='70%'><span class='font12' data-selector='email'></span>&nbsp;<span class='font12'>errappan@cxllogistics.com,</span>&nbsp;<span class='font12' data-selector='website'></span>&nbsp;<span class='font12'>www.cxllogistics.com</span>" +
									"&nbsp;&nbsp;<span class='font12' data-selector='branchPhoneNumberLabel'></span>&nbsp;<span class='font12'>+91 9945728898</span></td></tr><tr><td colspan='2' width='70%'><span class='font12' data-selector='cin'></span>&nbsp;<span class='font12'>U60232KA2019PTC123448</span>&nbsp;<span class='font12' data-selector='gst'></span>&nbsp;<span class='font12'>29AAICC1295L1Z6</span>&nbsp;<span class='font12' data-selector='code'>" +
									"</span>&nbsp;<span class='font12'>29</span>&nbsp;<span class='font12' data-selector='state'>:</span>&nbsp;<span class='font12'>Karnataka</span></td></tr></table></td><td style='width: 35%;'><table style='margin-left: 50px;'><tr><td colspan='2' width='70%' class='' style='padding-left: 32px;'><span class='font12'>Freight Bill (Consolidated Statement)</span></td></tr>" +
									"<tr><td colspan='2' width='70%' class='rightAlign' style='padding-right: 40px;'><span class='font12'>Page NO.: </span><span >"+(pageNumber+1)+"</span>&nbsp;Of&nbsp;<span>"+pageCounter+"</span></td></tr></table></td></tr></table>" +
									"<table width='100%' cellpadding='0' cellspacing='0' border='0'><tr> <td class=' font13 width70per'><table width= '100%' cellpadding='0' cellspacing='0' border='0' style='position: relative;bottom: 12px;margin-left: 6px;'><tr><td class='height20px'><span class='bold' data-selector='freightbillno'></span><span>"+billNumber+"</span></td></tr><tr><td class='height20px'>" +
									"<span class='bold' data-selector='date'></span><span>"+creationDateTimeStampStr+"</span></td></tr><tr><td class='height20px' width='28%'><span class='bold' data-selector='billingperiod'></span><span>"+fromDateStr+"</span></td><td class='height20px'><span class='bold' data-selector='to'></span><span>"+toDateStr+"</span></td></tr><tr><td class='leftAlign font12' >&nbsp; " +
									"</td></tr></table></td><td class='font13 width30'><table width= 100% cellpadding='0' cellspacing='0' border='0'><tr><td class='height20px'><span class='bold' data-selector='customername'></span><span class='pageBreakNeeded'>"+creditorName+"</span></td></tr><tr><td class='height50px'><span class='bold' data-selector='address'></span><span class='pageBreakNeeded'>"+creditorAddress+"</span></td></tr>" +
									"<tr><td class='height20px'><span class='bold' data-selector='gst'></span><span>"+creditorGstn+"</span></td></tr><tr><td class='height20px'><span class='bold' data-selector='code'></span><span>"+partyStateCode+"</span>&nbsp;&nbsp;<span class='bold' data-selector='state' style='margin-left: 20%;'></span><span></span></td></tr></table></td></tr></table><br><br>");
						}
					}

					InvoicePrintSetup.setFooterDiv(billData , headerFooterData, configuration, isExcel, isSearchBillPDFEmail,tableData);
				}
				
				loadLanguageWithParams(FilePath.loadLanguage(invoicePrintFlavor));
				
				BillDetailsForPrintingBill.invoicePrintPdfOrientation	= configuration.invoicePrintPdfOrientation;
				InvoicePrintSetup.generateBillPdf(BillDetailsForPrintingBill, billPdfEmailAllowed, isSearchBillPDFEmail);
			});
		}, getServiceTax : function(billData, billDetails, response) {
			billData.cgst						= Math.round(response.totalBookingCGST);
			billData.sgst						= Math.round(response.totalBookingSGST);
			billData.igst						= Math.round(response.totalBookingIGST);
			billData.GrandTotalIncludingTaxes	= Math.round(billDetails.grandTotal);
			billData.cgstwithoutRoundOff		= (response.totalBookingCGST).toFixed(2);
			billData.sgstwithoutRoundOff		= (response.totalBookingSGST).toFixed(2);
			billData.igstwithoutRoundOff		= (response.totalBookingIGST).toFixed(2);
			billData.totalTaxAmount				= Math.round(response.totalTaxAmount);
			billData.roundOffTaxAmount			= (Math.round(response.totalTaxAmount) - response.totalTaxAmount).toFixed(2);
			billData.totalDeliveryTaxAmount		= Math.round(response.totalDeliveryTaxAmount);
			billData.deliveryCgstwithoutRoundOff	= (response.totalDeliveryCGST).toFixed(2);
			billData.deliverySgstwithoutRoundOff	= (response.totalDeliverySGST).toFixed(2);
			billData.deliveryIgstwithoutRoundOff	= (response.totalDeliveryIGST).toFixed(2);
			billData.deliverySgst					= (parseFloat(billData.deliverySgstwithoutRoundOff) + parseFloat(billData.sgstwithoutRoundOff)).toFixed(2);
			billData.deliveryCgst					= (parseFloat(billData.deliveryCgstwithoutRoundOff) + parseFloat(billData.cgstwithoutRoundOff)).toFixed(2);
			billData.deliveryIgst					= (parseFloat(billData.deliveryIgstwithoutRoundOff) + parseFloat(billData.igstwithoutRoundOff)).toFixed(2);
			billData.GrandTotalIncludingTaxesReporter	= Math.round(billDetails.grandTotal).toFixed(2);
			let subTotalForTCS = response.WayBillDetailsForPrintingBill.map(d => d.bookingAmount).reduce((a, b) => a + b, 0)
			billData.grandTotalForTCS = (subTotalForTCS + response.totalTaxAmount).toFixed(2)
		}, getBillCreatetax : function(billData, response) {
			if(response.billCGST > 0){
				billData.cgst					= Math.round(response.billCGST);
				billData.cgstWithoutRoundOff	= (response.billCGST).toFixed(2);
			}
				
			if(response.billSGST > 0){
				billData.sgst					= Math.round(response.billSGST);
				billData.sgstWithoutRoundOff	= (response.billSGST).toFixed(2);
			}
			
			if(response.billIGST > 0){
				billData.igst					= Math.round(response.billIGST);
				billData.igstWithoutRoundOff	= (response.billIGST).toFixed(2);
			}
			if(response.IGSTtaxPecentage != undefined || response.CGSTtaxPecentage != undefined){
				billData.IGSTtaxPecentage	= Number(response.IGSTtaxPecentage);
				billData.CGSTtaxPecentage	= Number(response.CGSTtaxPecentage);
			}
			
			if(response.IGSTPercentAmount != undefined || response.CGSTPercentAmount != undefined || response.SGSTPercentAmount != undefined) {
				billData.igstPercentage				= Number(response.IGSTPercentAmount);
				billData.sgstPercentage				= Number(response.SGSTPercentAmount);
				billData.cgstPercentage				= Number(response.CGSTPercentAmount);
			}

		}, getArrayForTableDetails : function(LrDetails, unAddedTaxAmount, configuration, BillDetailsForPrintingBill) {
			var dataArray	= new Array();
			var srNo						= 1;
			var totalHamalisct				= 0;
			var totalothersct				= 0;
			var totalfreight				= 0;
			var totalWeight					= 0;
			var totalhamali					= 0;
			var totalhalting				= 0;
			var totalQuantity				= 0;
			var totalOthercharge			= 0;
			var totalExtraWt				= 0;
			var totalServiceCharge			= 0;
			var totalOtherchargeremove		= 0;	   
			var totallrCharge				= 0;
			var totalDD						= 0;
			var totaldetentionCharge		= 0;
			var totaldocketCharge			= 0;
			var totalforGrandtotal			= 0;
			var totalweightRate				= 0;
			var totalarticleRate			= 0;
			var totalweightRatetoFixed		= 0;
			var totalFinalAmount			= 0;
			var totalGST					= 0;
			var totaldlycharge				= 0;
			var totalgrandtotal				= 0;
			var totalHandling				= 0;
			var totalCollection				= 0;
			var totalAoc					= 0;
			var totalLongLength				= 0;
			var totalBookingDelivery		= 0;
			var otherChargesBookingTime		= 0;
			var totalOtherCharges			= 0;
			var totalotherChargeBooking		= 0;
			var grandtotalcustomAOCCharge	= 0;
			var grandtotalcustomcharge		= 0;
			var bookingTotalWithoutTax		= 0;
			var totalDDCharge				= 0;
			var totalLocalCharge			= 0;
			var totalLabourCharge			= 0;
			var totalOtherBkgCharge			= 0;
			var totalStatisticalCharge		= 0;
			var totalRiskCharge				= 0;
			var totalbookingcharge			= 0;
			var otherChargeForCustom		= 0;
			var totalotherChargeForCustom	= 0;
			var totalSTChargeBooking		= 0;
			var totalCCACharge				= 0;
			var totalTollCharge				= 0;
			var totalDoorCollection			= 0;
			var totalDD						= 0;
			var totalDC						= 0;
			var totalStationaryCharge		= 0;
			var totalFOV					= 0;
			var totalOtherCharge1			= 0
			var totalCGST		= 0;
			var totalSGST		= 0;
			var totalIGST		= 0;
			var totalnewOtherCharge			= 0;
			var totalOtherChargeExcFreight	= 0;
			var totalLoading				= 0;
			var totalUnloading				= 0;
			var totalUnion					= 0;
			var totalBookCharge				= 0;
			var totalCrossingCharge			= 0;
			var totalBcCharge				= 0;
			var totalBookingChargsCustome	= 0;
			var totalOtherChargeHtc			= 0;
			var totalDoubleDelivery			= 0;
			var totalLoadingDetention		= 0;
			var totalUnloadingDetention		= 0;
			var totalQuantityForHtc			= 0
			var totalCGSTWithDecimal		= 0;
			var totalSGSTWithDecimal		= 0;
			var totalIGSTWithDecimal		= 0;
			var totalOtherNew				= 0;
			var totalAcCharge				= 0;
			var totalOctroiChrg				= 0;
			var totalCartingChrg			= 0;
			var totOtherChrgSngt			= 0;
			var wayBillNumberForTransporter = "";
			var wayBillNumberForUnaddedTaxAmnt = "";
			var totalIandSCharge			= 0;
			var totalPickupCharge			= 0;
			var totalPickUpAndDdCharge		= 0;
			var	totalHamaliAndIAndSCharges	= 0;
			var lrGrandTotalForRectus		= 0;
			var grandTotalForSts			= 0;
			var totalBuiltyChrg				= 0;
			var totalLocalChrg				= 0;
			var totallateNeight				= 0;
			var totalwaiting				= 0;
			var totalToPayHamali			= 0;
			var totalDdcCharge				= 0;
			var totalPodCharge				= 0;	
			var totalArtRate				= 0;
			var totalEwayBillCharge			= 0;
			var totalFuelSurCharge			= 0;
			var totalCODDOD					= 0;
			var totalSurCharge				= 0;
			var totalhandling				= 0;
			var totalPacking				= 0;
			var actualTotalfreight			= 0;
			var totalRTOCharge				= 0;
			var totalReceivedAmount			= 0;
			var totalNetAmount				= 0;
			var totalInsurace				= 0;
			var totalDelCollCharge			= 0;
			var totalMathadi				= 0;
			var totalKatta					= 0;
			var totalExtraRunning			= 0;
			var totalExpressCharge			= 0;
			var totalGodownCharge			= 0;
			var totalReceipt				= 0;
			var totalOda					= 0;
			var totalUnloadingHamali		= 0;
			var totalFreightAmountForReporter = 0;
			var totalDoorPickupCharge		= 0;
			var totalActualWeight			= 0;
			var totalscCharge				= 0;
			var totalhcCharge				= 0;
			var totaleicCharge				= 0;
			var totalwpCharge				= 0;
			var totaldbcCharge				= 0;
			var totalBookingAmtRenuka		= 0;
			var totalDelyChrgExcHamali		= 0;
			var totalHamaliDelyChrge		= 0;
			var grandBookingTotalDelyTotal	= 0;
			var totalGCCharge				=0;
			var totalODACharge				=0;
			var totalDDForSET				=0;
			var totalOtherForSET			=0;
			var lrGrandTotalWithDelivery	= 0;
			var totalTempoBhada				= 0;
			var totalGrCharge				= 0;
			var totalOtherChargesForMGLLP	= 0;
			var totalfsCharge				= 0;
			var totalLabourChg				= 0;
			var totalParkingChg				= 0;
			var totalOtherChargeExcFreightAndDDC	= 0;
			var totalExcFrgtHamaliSt		= 0;
			var totalGrandTotalForMGLLP		= 0;
			var totalDeliveryCharge			= 0;
			var totalspHandlingDICCharge	= 0;
			var totalCWBCharge				= 0;
			var totalWithPassCharge			= 0;
			var totalCgstSgstOfbookingAmount= 0;
			var totalIgstOfbookingAmount	= 0;
			
			

			for (const element of LrDetails) {
				var dataObj			= element;
				var dataObject		= new Object();
				var cgst = dataObj.cgstAmount;
				var sgst = dataObj.sgstAmount;
				var igst = dataObj.igstAmount;
				var gst	 = cgst + sgst;
				var articleRateMultiple = 0;
				var articleRateMultipleCommaSeperated = 0;
				var articleQuantityMultiple = 0;
				var articleTypeMultiple = "";
				var articleTypeMultipleFormate5 = "";
				var articleFreightForFormate5 = "";
				var articleQtyForFormate4 = 0;
				var articleQtyForFormate5 = 0;
				var articleRateForFromate5	="";
				var articleRateForFromate4	="";
				var articalRateforPanindia ="";
				var articalRateforSES;
				var crNumber;
				var wayBillBookingTax = dataObj.wayBillBookingTax ? dataObj.wayBillBookingTax : [];

				var dataObject	= new Object();
				if(dataObj.wayBillBookingTax!=undefined){
					dataObj.wayBillBookingTax.forEach(tax => {
					    dataObject.taxPercentage = tax.percentTaxAmount;
					});	
				}
				
				
				dataObject.srNumber							= srNo;
				dataObject.lrNumber							= dataObj.wayBillNumber;
				dataObject.lrBookingDateTimeStr				= dataObj.bookingDateTimeStr;
				dataObject.lrConsigneeName					= dataObj.consigneeName;
				dataObject.lrConsignorName					= dataObj.consignorName;
				dataObject.lrSourceBranch					= dataObj.sourceBranch;
				dataObject.lrDestinationBranch				= dataObj.destinationBranch;
				dataObject.destinationSubRegion				= dataObj.destinationSubRegion;
				dataObject.totalArticle						= dataObj.quantity;
				dataObject.consinmentDetails				= dataObj.consignmentDetails;
				dataObject.packageDetails					= dataObj.packageDetails;
				dataObject.lrGrandTotal						= Math.round(dataObj.grandTotal);
				dataObject.lrGrandTotalDecimalValue			= Math.round(dataObj.grandTotal)+ ".00";
				dataObject.lrGrandTotalForNM				= dataObj.grandTotal.toFixed(2);
				dataObject.lrGrandTotalDecimal				= (dataObj.chargesSum + sgst + igst + cgst).toFixed(2);				
				dataObject.lrFreight						= dataObj.articleAmount;
				dataObject.lrFreightDecimal					= dataObj.articleAmount.toFixed(2);
				dataObject.packageDetailsWithSaidTocontain	= dataObj.packingType+' Of '+dataObj.saidToContain;
				dataObject.weight							= dataObj.consignmentSummaryWeight;
				dataObject.bookingTotal						= dataObj.wayBillBookingTotal;
				dataObject.bookingAmount					= dataObj.bookingAmount;
				
				if (dataObj.sourceBranchState === dataObj.destinationBranchState) {
				    dataObject.cgstSgstOfbookingAmount = (dataObj.bookingAmount * 2.5) / 100;
				    dataObject.igstOfbookingAmount = 0;
				} else {
				    dataObject.igstOfbookingAmount = (dataObj.bookingAmount * 5) / 100;
				    dataObject.cgstSgstOfbookingAmount = 0; 
				}

				dataObject.bookingNewAmount					= Math.round(dataObj.bookingAmount);
				dataObject.other							= dataObj.chargesSum;
				dataObject.otherCharges						= dataObj.chargesSum - dataObj.articleAmount;
				dataObject.bookingServiceTax				= dataObj.bookingServiceTax;
				dataObject.deliveryServiceTax				= dataObj.deliveryServiceTax;
				dataObject.chargeWeight						= dataObj.chargeWeight;
				dataObject.chargeWeightWithKG				= dataObj.chargeWeight + "kg";
				dataObject.actualWeight						= dataObj.actualWeight;
				dataObject.vehicleNumber					= dataObj.vehicleNumber;
				dataObject.vehicleNumberNew					= dataObj.vehicleNumberNew;
				dataObject.totalGstAmt						= dataObj.bookingServiceTax + dataObj.deliveryServiceTax;
				dataObject.invoiceNo						= dataObj.invoiceNo;
				
				if(dataObj.invoiceNo!=undefined)
				dataObject.invoiceNoCommaWithSpace     		= replaceSlash(dataObj.invoiceNo,',',', ');
				
				if (dataObj.invoiceNo != undefined)
					dataObject.invoiceNoWithSpaces = dataObj.invoiceNo.replace(/,/g, ", ").replace(/\//g, " / ")
				
				if(dataObj.deliveryTimeTBB)
					dataObject.lrDateForDeliveryTimeTBB				= dataObj.deliveryDateTimeString;
				else
				    dataObject.lrDateForDeliveryTimeTBB				= dataObj.bookingDateTimeStr;
									
				dataObject.packageDetail					= dataObj.packingType;
				dataObject.isDeliveryTimeTBB				= dataObj.deliveryTimeTBB;
				dataObject.transportationModeName			= dataObj.transportationModeName;
				dataObject.trasportaionMode					= dataObj.trasportaionMode;
				dataObject.weightRate					    = dataObj.weightRate;
				dataObject.weightRatetoFixed				= dataObj.weightRate.toFixed(2);
				dataObject.packingTypeWithSaidToContain		= dataObj.packingTypeWithSaidToContain;
				dataObject.packingTypeWithSaidToContainsubString	= dataObj.packingType;
				dataObject.pkgTypeWithSaidToCtnSubString	= dataObj.packingTypeWithSaidToContain;
				dataObject.declaredValue					= dataObj.declaredValue;
				dataObject.ftlBookingVehicleNumber			= dataObj.ftlBookingVehicleNumber;
				dataObject.purchaseOrderNumber				= dataObj.purchaseOrderNumber;
				dataObject.purchaseOrderDatestr				= dataObj.purchaseOrderDatestr;
				dataObject.deliveryTimeTBB					= dataObj.deliveryTimeTBB;
				dataObject.hamaliCharge						= dataObj.hamaliCharge;	 
				dataObject.arrivalDateTimestring			= dataObj.arrivalDateTimeString;
				dataObject.vehicleTypeName					= dataObj.vehicleTypeName || "--";
				dataObject.deliveryDateTimestring			= dataObj.deliveryDateTimeString;
				dataObject.ewayBillCharge					= dataObj.ewayBillCharge; 
                dataObject.destinationSubRegion				= dataObj.destinationSubRegion;

				dataObject.categoryTypeName					= dataObj.categoryTypeName;
				dataObject.categoryTypeId					= dataObj.categoryTypeId;
				dataObject.totalQuantityWithPkgs			=	dataObject.packageDetails +" OF "+ dataObj.saidToContain;
				dataObject.shipmentNumber					= dataObj.shipmentNumber;
				dataObject.rFQNumber						= dataObj.rFQNumber;
				dataObject.deliveryOrderNumber				= dataObj.deliveryOrderNumber;
				dataObject.shipmentEndDateTimeStr			= dataObj.shipmentEndDateTimeStr;
				dataObject.receivedAmount					= dataObj.receivedAmount;
				dataObject.totalReceivedAmount				+= dataObj.receivedAmount;
				dataObject.netAmount						= dataObj.receivedAmount;
				dataObject.totalNetAmount					+= dataObj.netAmount;
				dataObject.vehicleCapacity					= dataObj.vehicleCapacity;
				dataObject.bookingTypeId					= dataObj.bookingTypeId;
				dataObject.invoiceDateTimeStr				= dataObj.invoiceDateTimeStr;
				dataObject.lrHsnCode						= dataObj.lrHsnCode;			
				dataObject.bookingTypeId					= dataObj.bookingTypeId;
				dataObject.consigneePincode					= dataObj.consigneePincode;
				
				dataObject.approvalTypeId					= dataObj.approvalTypeId
				if (dataObject.approvalTypeId == APPROVAL_TYPE_SHORT_QUANTITY_ID)
					dataObject.approvalTypeName = APPROVAL_TYPE_SHORT_QUANTITY_NAME
				if (dataObject.approvalTypeId == APPROVAL_TYPE_DEDUCTION_ID)
					dataObject.approvalTypeName = APPROVAL_TYPE_DEDUCTION_NAME
				if (dataObject.approvalTypeId == APPROVAL_TYPE_NOT_APPLICABLE_ID)
					dataObject.approvalTypeName = APPROVAL_TYPE_NOT_APPLICABLE_NAME
				
				if(dataObj.privateMarka!=undefined)
					dataObject.privateMarka						= dataObj.privateMarka;			

				if(dataObj.invoiceDetailsList != undefined && dataObj.invoiceDetailsList != 'undefined')
					dataObject.multipleInvoiceNumber		= dataObj.invoiceDetailsList[0].invoiceNumber;		

				if(dataObj.chargeWeight > 0)
					dataObject.edisafeRate	= (Number(dataObj.articleAmount * 1000/dataObj.chargeWeight)).toFixed(2);
				else
					dataObject.edisafeRate	= 0;

				if(dataObject.categoryTypeId > 0)
				   dataObject.slabMasterRangeFormate1 = dataObj.categoryTypeName;
				else
				   dataObject.slabMasterRangeFormate1	= dataObj.vehicleTypeName;
				   
				  if(dataObject.categoryTypeId > 0)
					dataObject.slabMasterRange = dataObj.categoryTypeName;
				  else
					dataObject.slabMasterRange = dataObj.slabRange;

				try {
					if(!isNaN(dataObj.articleRate))
						dataObject.articleRate			= (Number(dataObj.articleRate)).toFixed(2);	
					else 
						dataObject.articleRate			= dataObj.articleRate;
				} catch(err) {
					dataObject.articleRate				= dataObj.articleRate;
				}
				
				if(dataObj.crNumber != undefined){
					crNumber = dataObj.crNumber;									
				} else{	
					crNumber = "--";					
				};
								
				dataObject.gst								= Math.round(gst)
				dataObject.cgst								= Math.round(cgst);
				dataObject.sgst								= Math.round(sgst);
				dataObject.igst								= Math.round(igst);
				dataObject.cgstWithDecimal					= cgst.toFixed(2);
				dataObject.sgstWithDecimal					= sgst.toFixed(2);
				dataObject.igstWithDecimal					= igst.toFixed(2);
				dataObject.newOtherCharge					= dataObj.grandTotal - (dataObject.lrFreight + dataObject.totalGstAmt);
				dataObject.newOtherChargeDecimal			= (dataObj.grandTotal - (dataObject.lrFreight + dataObject.totalGstAmt)).toFixed(2);
				dataObject.waybillRemark					= dataObj.remark;
				dataObject.quantityForHtc					= Number(dataObj.chargeWeight/1000);
				dataObject.saidToContain					= dataObj.saidToContain;
				dataObject.custimezBookingDateTimeStr		= dataObj.custimezBookingDateTimeStr;
				dataObject.sourceBranchCode					= dataObj.sourceBranchCode;
				dataObject.destinationBranchCode			= dataObj.destinationBranchCode;
				dataObject.deliveryToName					= dataObj.deliveryToName;
				dataObject.deliveryDateTimeString			= dataObj.deliveryDateTimeString;
				dataObject.deliveryToNumber					= dataObj.deliveryToNumber;
				dataObject.deliveryDiscount					= dataObj.deliveryDiscount;
				dataObject.deliverySumCharges				= dataObj.deliverySumCharges;
                dataObject.DestinationBranch			    =(dataObject.lrDestinationBranch + "&nbsp;"+ "(" +"&nbsp;"+ dataObject.lrDestinationBranch + ")");				
				dataObject.OtherChargeSnts					= (Math.round(dataObj.bookingAmount-(dataObject.lrFreight+dataObject.hamali+dataObject.BookingDelivery)));
				dataObject.consignorneeName					=  dataObj.consignorName +",&nbsp;"+ dataObj.consigneeName;
				dataObject.qtyConsignorConsigneeName		= dataObj.quantity + "&nbsp;" + dataObj.consignorName +"<br>"+ `<span class="colorb35aaf"> ${dataObj.consigneeName} </span>` ;
				dataObject.consignorId						= dataObj.consignorId;
				dataObject.consigneeId						= dataObj.consigneeId;
				dataObject.creditorId						= dataObj.creditorId;
				dataObject.sourceAndLrNumber				= dataObject.lrSourceBranch +"<br>"+ dataObject.lrNumber;
				dataObject.sourceAndDestination				= dataObject.lrSourceBranch + "To" + dataObject.lrDestinationBranch+"<br>"+dataObject.lrConsigneeName;
				dataObject.crNumber							= dataObj.crNumber;
				dataObject.crNumberWithBlank				= crNumber;
				dataObject.creditorName						= BillDetailsForPrintingBill.creditorName;
				dataObject.particulars						= "Transportation of Materials<br>from(" + dataObject.lrSourceBranch + ") To (" + dataObject.lrDestinationBranch + ")<br><b>Invoice No is:<b>" + dataObject.invoiceNo;
				dataObject.particular						= "Transportation of Materials<br>from(" + dataObject.lrSourceBranch + ") To (" + dataObject.lrDestinationBranch + ")<br><b>Invoice No:<b>" + dataObject.invoiceNo;
				dataObject.particularWithRemark             = "Transportation of Materials<br>from(" + dataObject.lrSourceBranch + ") To (" + dataObject.lrDestinationBranch + ")<br><b>Remark:&nbsp;</b>" +dataObj.lrWiseBillRemark +"<br><b>Invoice No:</b>" + dataObject.invoiceNo;
				dataObject.sourcebranchDisplayName			= dataObj.branchDisplayName;
				dataObject.lrDestBranchDisplayName			= dataObj.destBranchDisplayName;
				dataObject.waybillAdditionalRemark			= dataObj.additionalRemark;
				dataObject.lrCity							= dataObj.sourceCity;
				dataObject.lrDestinationCity				= dataObj.destinationCity;
				dataObject.sourceSubRegion					= dataObj.sourceSubRegion;
				dataObject.branchAddressPincode				= dataObj.branchAddressPincode;
				dataObject.emailAddress						= dataObj.emailAddress;
				dataObject.chargeWeightEdisafe				= Number(dataObj.chargeWeight/1000);
				dataObject.ChargeWeight						= dataObject.chargeWeight
				dataObject.RtcarticleRate					= dataObject.articleRate
				dataObject.roundOffGSTAmount				= (Math.round(dataObj.taxAmount)-dataObj.taxAmount).toFixed(2);
				dataObject.mytotal							= dataObject.hamali+dataObject.halting	
				dataObject.bookingAmountSRST				= Number(dataObj.bookingAmount) + Number(dataObj.bookingServiceTax);
				dataObject.bookingTotalSRST					= Number(dataObj.bookingAmount);  
				dataObject.RtcarticleRate					= dataObject.articleRate
				dataObject.DestinationBranch	            = (dataObject.destinationSubRegion +" (" + dataObject.lrDestinationBranch + ")");
				dataObject.mytotal                          = dataObject.hamali+dataObject.halting 
				
				var destinationDateAndWeight			= "";
				 
				if(dataObject.actualWeight > 0)
					 destinationDateAndWeight = dataObject.lrDestinationBranch +"<br>"+"Dt."+dataObject.lrBookingDateTimeStr +"&nbsp;&nbsp; "+ dataObject.actualWeight+"kg";
				else
					 destinationDateAndWeight = dataObject.lrDestinationBranch +"<br>"+"Dt."+dataObject.lrBookingDateTimeStr;
				
				dataObject.DestinationDateAndWeight			= destinationDateAndWeight;
				var deliveryDateDDMM = dataObject.deliveryDateTimestring.split('-')
				    deliveryDateDDMM = deliveryDateDDMM[0]+'-'+deliveryDateDDMM[1]
				dataObject.deliveryDateDDMM = deliveryDateDDMM
				
				if(dataObject.creditorId == dataObject.consignorId)
					dataObject.particularName = dataObject.lrConsigneeName;
				else if(dataObject.creditorId == dataObject.consigneeId)
					dataObject.particularName = dataObject.lrConsignorName;
					
				//	particulars in invoice print for IND Technoligies
				if(dataObject.creditorId == dataObject.consignorId)
					dataObject.particularsName = dataObj.consigneeName;
				else if(dataObject.creditorId == dataObject.consigneeId)
					dataObject.particularsName = dataObj.consignorName;
				else
					dataObject.particularsName = dataObj.consigneeName;
				 
				var grandTotalForPtc						= 0;
				var grandTotalForSts						= 0;
				
				if(dataObject.deliveryTimeTBB)
					grandTotalForPtc = dataObject.deliverySumCharges + dataObject.bookingAmount;
				else
					grandTotalForPtc = dataObject.bookingAmount;

				dataObject.grandTotalForPtc			= grandTotalForPtc;
				dataObject.grandTotalAndInr			=  "&#X20B9;" + grandTotalForPtc;
				dataObject.grandTotalForvljl		= grandTotalForPtc
				dataObject.grandTotalAndvljlInr		=  "&#X20B9;" + Number(grandTotalForPtc).toFixed(2);
				
				if(dataObj.articleRate != undefined && dataObj.articleRate != "undefined" && dataObj.articleRate != null) {
					if((dataObj.articleRate).includes(','))
						dataObject.articleRateString	= ((dataObj.articleRate).substring(0, (dataObj.articleRate).length)).replace(/','/g,", ")
					else
						dataObject.articleRateString	= dataObj.articleRate;
				}
				
				if(configuration.showArticleRateAndWeightRateInOneColumn) {
					if(dataObj.chargeTypeId == CHARGETYPE_ID_WEIGHT) {
						dataObject.articleRate		= dataObj.weightRate;
						dataObject.articleRateLable = "Weight"
					} else if(dataObj.chargeTypeId == CHARGETYPE_ID_QUANTITY) {
						dataObject.articleRate		= dataObj.articleRate;
						dataObject.articleRateLable	= "Article"
					}
				}
				
				if(dataObj.chargeTypeId == CHARGETYPE_ID_QUANTITY)
					dataObject.artRate	 = dataObj.articleRate;
				else
					dataObject.artRate	 = 0;
				
				if(configuration.showInvoiceChargeWtZero) {
					 if(dataObject.chargeWeight == 0)
						 dataObject.chargeWeight	= "FIX"
					else
						dataObject.chargeWeight	= dataObj.chargeWeight;
				}
				
				if(dataObj.chargeTypeId == CHARGETYPE_ID_FIX)
					dataObject.chargeType	= CHARGETYPE_NAME_FIX;
				else if(dataObj.chargeTypeId == CHARGETYPE_ID_QUANTITY)
					dataObject.chargeType	= CHARGETYPE_NAME_QUANTITY;
				else if(dataObj.chargeTypeId == CHARGETYPE_ID_WEIGHT)
					dataObject.chargeType	= CHARGETYPE_NAME_WEIGHT;
				else
					dataObject.chargeType	= "";
				
				if(configuration.showInvoiceVehicleTypeName && dataObj.bookingTypeId == BOOKING_TYPE_FTL_ID) {
					if(dataObj.vehicleTypeName	!= undefined) {
						dataObject.vehicleTypeName		= dataObj.vehicleTypeName;
						dataObject.chargeWeight			= dataObj.vehicleTypeName;
					} else
						dataObject.vehicleTypeName ="--"
				}
				
				if(dataObj.chargeTypeId == CHARGETYPE_ID_FIX)
					dataObject.RtcarticleRate ="--";
				
				if(dataObject.articleRate == "Fix")
					dataObject.articleRate = dataObj.articleAmount;
					
				dataObject.lrConsigneeNamesubString 	= dataObject.lrConsigneeName + '..';
				dataObject.lrConsignorNamesubString		= dataObject.lrConsignorName + '..';
				
				if (dataObject.packingTypeWithSaidToContainsubString.length > 8)
					dataObject.packingTypeWithSaidToContainsubString	 = ((dataObject.packingTypeWithSaidToContainsubString).substring(0,8) + '..');
				
				if (dataObject.pkgTypeWithSaidToCtnSubString.length > 8)
					dataObject.pkgTypeWithSaidToCtnSubString	 = ((dataObject.pkgTypeWithSaidToCtnSubString).substring(0,8) + '..');
					
				if (dataObject.privateMarka != undefined && dataObject.privateMarka.length > 8) {
					var newString = '';
						
					for (var i = 0; i < dataObject.privateMarka.length; i += 8) {
						newString += dataObject.privateMarka.substring(i, i + 8) + '<br>';
					}
						
					dataObject.privateMarka = newString;
				}
				
				if(configuration.doNotAllowDeliveryTimeTbbAmntInFrghtTotal)
					dataObject.grandTotalChargesForDeliveryTimeTBB		= dataObject.lrFreight;
				else if(dataObject.isDeliveryTimeTBB)
					dataObject.grandTotalChargesForDeliveryTimeTBB		= dataObj.grandTotal;
				else
					dataObject.grandTotalChargesForDeliveryTimeTBB		= dataObject.lrFreight;
				
				if(dataObject.isDeliveryTimeTBB)
					dataObject.partyName	= dataObj.consignorName;
				else
					dataObject.partyName	= dataObj.consigneeName;
				
				for(var i = 0 ; i < dataObject.consinmentDetails.length ; i++) {
					dataObject.ArticleAmount	= dataObject.consinmentDetails[i].amount.toFixed(2);
				
					if(dataObject.weightRatetoFixed > 0)
						dataObject.weightRatetoFixed = dataObject.weightRatetoFixed;
					else
						dataObject.weightRatetoFixed = dataObject.ArticleAmount;
						
					if(dataObj.chargeTypeId == CHARGETYPE_ID_QUANTITY) {
						articleRateMultiple 		= articleRateMultiple + dataObject.consinmentDetails[i].amount + '<br>';
						articleRateMultipleCommaSeperated = articleRateMultipleCommaSeperated + dataObject.consinmentDetails[i].amount + (i == dataObject.consinmentDetails.length - 1 ? " " : ", ");
						articleRateForFromate5 		= articleRateForFromate5 + dataObject.consinmentDetails[i].amount + '<br>';
						articleRateForFromate4 		= articleRateForFromate4 + dataObject.consinmentDetails[i].amount + '<br>';
						articleFreightForFormate5 	= articleFreightForFormate5 + (dataObject.consinmentDetails[i].amount * dataObject.consinmentDetails[i].quantity).toFixed(2) + '<br>';
					}
						
					articleQuantityMultiple 	= articleQuantityMultiple + dataObject.consinmentDetails[i].quantity + '<br>';
					articleQtyForFormate5		= articleQtyForFormate5 + dataObject.consinmentDetails[i].quantity + '<br>';
					articleQtyForFormate4		= articleQtyForFormate4 + dataObject.consinmentDetails[i].quantity;
					articleTypeMultiple 		= articleTypeMultiple + dataObject.consinmentDetails[i].packingTypeName + '<br>';
					articleTypeMultipleFormate5 = articleTypeMultipleFormate5 + dataObject.consinmentDetails[i].packingTypeName + '<br>';
				}
						
				dataObject.bookingCharges						= dataObj.wayBillBookingCharges
				
				if(dataObject.deliveryTimeTBB)
					dataObject.wayBillDeliveryCharges				= dataObj.wayBillDeliveryCharges
				
				var bookingCharges								= dataObj.wayBillBookingCharges;

				dataObject.hamali			= 0;
				dataObject.docketCharge		= 0;
				
				if(bookingCharges != undefined && bookingCharges != 'undefined')
					var count = bookingCharges.length;
				
				dataObject.hamali							 = 0;
				dataObject.halting							 = 0;
				dataObject.grCharge							 = 0;
				dataObject.fsCharge							 = 0;
				var freight									 = 0;
				if(bookingCharges != undefined && bookingCharges != 'undefined') {
					for(const element of bookingCharges) {
						if(element.chargeTypeMasterId == HAMALI) {
							dataObject.hamali		= element.wayBillBookingChargeChargeAmount;
							totalhamali				+= element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == HALTING_CHARGE) {
							dataObject.halting		= element.wayBillBookingChargeChargeAmount;
							totalhalting			+= element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == FREIGHT) {
							dataObject.freight		= element.wayBillBookingChargeChargeAmount;
							
							if(dataObject.isDeliveryTimeTBB)
								totalfreight		+= dataObject.grandTotalChargesForDeliveryTimeTBB;
							else
								totalfreight		+= element.wayBillBookingChargeChargeAmount;
								
							actualTotalfreight			+= element.wayBillBookingChargeChargeAmount;
							count--;
						} else if(element.chargeTypeMasterId == DETENTION_BOOKING) {
							dataObject.detentionCharge		= element.wayBillBookingChargeChargeAmount;
							totaldetentionCharge			+= element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == DOOR_DLY_BOOKING) {
							dataObject.dd					= element.wayBillBookingChargeChargeAmount;
							totalDD						+= element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == LR_CHARGE) {
							dataObject.lrCharge				= element.wayBillBookingChargeChargeAmount;
							dataObject.otherChargesRE		= dataObject.otherCharges - dataObject.lrCharge;
							dataObject.otherChargeForAtc	= dataObject.otherCharges - (dataObject.lrCharge + dataObject.BookingDelivery + dataObject.DoorCollection);
							totallrCharge					+=element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == COLLECTION) {
							dataObject.collection			= element.wayBillBookingChargeChargeAmount;
							totalCollection					+=element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == AOC) {
							dataObject.Aoc					= element.wayBillBookingChargeChargeAmount;
							totalAoc						+=element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == DOCKET_CHARGE) {
							dataObject.docketCharge			= element.wayBillBookingChargeChargeAmount;
							totaldocketCharge				+=element.wayBillBookingChargeChargeAmount;
							count--;
						} else if(element.chargeTypeMasterId == DLY_CHARGE) {
							dataObject.dlycharge			= element.wayBillBookingChargeChargeAmount;	
						} else if(element.chargeTypeMasterId == SRS_HAMALI_BOOKING) {
							dataObject.Handling				= element.wayBillBookingChargeChargeAmount;
							totalHandling					+=element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == LONG_LENGTH) {
							dataObject.LongLength			= element.wayBillBookingChargeChargeAmount;
							totalLongLength					+=element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == DOOR_DELIVERY_BOOKING) {
							dataObject.BookingDelivery		= element.wayBillBookingChargeChargeAmount;
							totalBookingDelivery			+=element.wayBillBookingChargeChargeAmount;
						} else if (element.chargeTypeMasterId == DD_CHARGE) {
							dataObject.ddCharge				= element.wayBillBookingChargeChargeAmount;
							totalDDCharge					+=element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == LOCAL_BOOKING) {
							dataObject.LocalCharge			= element.wayBillBookingChargeChargeAmount;
							totalLocalCharge				+= element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == LABOUR) {
							dataObject.LabourCharge			= element.wayBillBookingChargeChargeAmount;
							totalLabourCharge				+= element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == OTHER_BOOKING) {
							dataObject.OtherBkgCharge		= element.wayBillBookingChargeChargeAmount;
							totalOtherBkgCharge				+= element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == STATISTICAL) {
							dataObject.StatisticalCharge	= element.wayBillBookingChargeChargeAmount;
							totalStatisticalCharge			+= element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == RISK_CHARGE) {
							dataObject.RiskCharge			= element.wayBillBookingChargeChargeAmount;
							totalRiskCharge					+= element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == ST_CHARGE_BOOKING) {
							dataObject.STChargeBooking		= element.wayBillBookingChargeChargeAmount;
							totalSTChargeBooking			+= element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == CCA) {
							dataObject.CCACharge			= element.wayBillBookingChargeChargeAmount;
							totalCCACharge					+= element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == TOLL) {
							dataObject.TollCharge			= element.wayBillBookingChargeChargeAmount;
							totalTollCharge					+= element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == DOOR_COLLECTION) {
							dataObject.DoorCollection		= element.wayBillBookingChargeChargeAmount;
							totalDoorCollection				+= element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == DD) {
							dataObject.DD					= element.wayBillBookingChargeChargeAmount;
							totalDD							+= element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == DC) {
							dataObject.DC					= element.wayBillBookingChargeChargeAmount;
							totalDC							+= element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == STATIONARY_BOOKING) {
							dataObject.StationaryCharge		= element.wayBillBookingChargeChargeAmount;
							totalStationaryCharge			+= element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == FOV) {
							dataObject.fov					= element.wayBillBookingChargeChargeAmount;
							totalFOV						+= element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == EXTRA_WT) {
							dataObject.extraWt				= element.wayBillBookingChargeChargeAmount;
							totalExtraWt					+= element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == SERVICE_CHARGE) {
							dataObject.serviceCharge		= element.wayBillBookingChargeChargeAmount;
							totalServiceCharge				+= element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == LOADING) {
							dataObject.Loading				= element.wayBillBookingChargeChargeAmount;
							totalLoading					+= element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == UNLOADING_BOOKING) {
							dataObject.Unloading			= element.wayBillBookingChargeChargeAmount;
							totalUnloading					+= element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == UNION) {
							dataObject.Union				= element.wayBillBookingChargeChargeAmount;
							totalUnion						+= element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == BOOK_CHARGE) {
							dataObject.bookCharge			= element.wayBillBookingChargeChargeAmount;
							totalBookCharge					+= element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == CROSSING_BOOKING) {
							dataObject.crossingCharge		= element.wayBillBookingChargeChargeAmount;
							totalCrossingCharge				+= element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == B_C_CHARGE) {
							dataObject.bcCharge				= element.wayBillBookingChargeChargeAmount;
							totalBcCharge					+= element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == DOUBLE_DELIVERY) {
							dataObject.doubleDelivery		= element.wayBillBookingChargeChargeAmount;
							totalDoubleDelivery				+= element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == LOADING_DETENTION) {
							dataObject.loadingDetetion		= element.wayBillBookingChargeChargeAmount;
							totalLoadingDetention			+= element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == UNLOADING_DETENTION) {
							dataObject.unLoadingDetetion	= element.wayBillBookingChargeChargeAmount;
							totalUnloadingDetention			+= element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == AC) {
							dataObject.acCharge				= element.wayBillBookingChargeChargeAmount;
							totalAcCharge					+= element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == I_AND_S) {
							dataObject.iandsCharge			= element.wayBillBookingChargeChargeAmount;
							totalIandSCharge				+= element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == PICKUP) {
							dataObject.pickupCharge			= element.wayBillBookingChargeChargeAmount;
							totalPickupCharge				+= element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == OCTROI_BOOKING) {
							dataObject.octroiChrg			= element.wayBillBookingChargeChargeAmount;
							totalOctroiChrg					+= element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == CARTING_CHARGE) {
							dataObject.cartingChrg			= element.wayBillBookingChargeChargeAmount;
							totalCartingChrg				+= element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == BUILTY_CHARGE) {
							dataObject.builtyChrg			= element.wayBillBookingChargeChargeAmount;
							totalBuiltyChrg					+= element.wayBillBookingChargeChargeAmount;	
						}else if(element.chargeTypeMasterId == LOCAL_CHARGE) {
							dataObject.localCharge			= element.wayBillBookingChargeChargeAmount;
							totalLocalChrg					+= element.wayBillBookingChargeChargeAmount;	
						}else if(element.chargeTypeMasterId == LATE_NIGHT) {
							dataObject.lateNeight		= element.wayBillBookingChargeChargeAmount;
							totallateNeight			+= element.wayBillBookingChargeChargeAmount;
						}else if(element.chargeTypeMasterId == WAITING) {
							dataObject.waiting		= element.wayBillBookingChargeChargeAmount;
							totalwaiting			+= element.wayBillBookingChargeChargeAmount;
						}else if(element.chargeTypeMasterId == TOPAY_HAMALI) {
							dataObject.toPayHamali		= element.wayBillBookingChargeChargeAmount;
							totalToPayHamali			+= element.wayBillBookingChargeChargeAmount;
						}else if(element.chargeTypeMasterId == DDC) {
							dataObject.ddcCharge		= element.wayBillBookingChargeChargeAmount;
							totalDdcCharge			+= element.wayBillBookingChargeChargeAmount;
						}else if(element.chargeTypeMasterId == POD) {
							dataObject.podCharge		= element.wayBillBookingChargeChargeAmount;
							totalPodCharge			+= element.wayBillBookingChargeChargeAmount;
						}else if(element.chargeTypeMasterId == STATIONARY_CHARGE) {
							dataObject.StationaryCharge		= element.wayBillBookingChargeChargeAmount;
							totalStationaryCharge			+= element.wayBillBookingChargeChargeAmount;	
						} else if(element.chargeTypeMasterId == EWAYBILL_CHARGE) {
							dataObject.ewayBillCharge		= element.wayBillBookingChargeChargeAmount;
							totalEwayBillCharge			+= element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == FUEL_SURCHARGE) {
							dataObject.fuelSurCharge		= element.wayBillBookingChargeChargeAmount;
							totalFuelSurCharge				+= element.wayBillBookingChargeChargeAmount;	
						}else if(element.chargeTypeMasterId == COD_DOD) {
							dataObject.CODDOD	= element.wayBillBookingChargeChargeAmount;
							totalCODDOD		+= element.wayBillBookingChargeChargeAmount;		
						}else if(element.chargeTypeMasterId == SUR_CHARGE) {
							dataObject.surCharge	= element.wayBillBookingChargeChargeAmount;
							totalSurCharge	+= element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == HANDLING_BOOKING) {
							dataObject.handling	= element.wayBillBookingChargeChargeAmount;
							totalhandling	+= element.wayBillBookingChargeChargeAmount;		
						} else if(element.chargeTypeMasterId == PACKING) {
							dataObject.packing	= element.wayBillBookingChargeChargeAmount;
							totalPacking	+= element.wayBillBookingChargeChargeAmount;		
						} else if(element.chargeTypeMasterId == RTO_CHARGE) {
							dataObject.rtoCharge	= element.wayBillBookingChargeChargeAmount;
							totalRTOCharge	+= element.wayBillBookingChargeChargeAmount;
						}else if(element.chargeTypeMasterId == INSURANCE) {
							dataObject.insurace	= element.wayBillBookingChargeChargeAmount;
							totalInsurace	+= element.wayBillBookingChargeChargeAmount;
						}else if(element.chargeTypeMasterId == DEL_COLL_CHARGE) {
							dataObject.delcollCharge	= element.wayBillBookingChargeChargeAmount;
							totalDelCollCharge	+= element.wayBillBookingChargeChargeAmount;
						}else if(element.chargeTypeMasterId == MATHADI) {
							dataObject.mathadi	= element.wayBillBookingChargeChargeAmount;
							totalMathadi	+= element.wayBillBookingChargeChargeAmount;
						}else if(element.chargeTypeMasterId == KATA_CHARGE) {
							dataObject.katta	= element.wayBillBookingChargeChargeAmount;
							totalKatta	+= element.wayBillBookingChargeChargeAmount;
						}else if(element.chargeTypeMasterId == EXTRA_RUNNING) {
							dataObject.extraRunning	= element.wayBillBookingChargeChargeAmount;
							totalExtraRunning	+= element.wayBillBookingChargeChargeAmount;
						}else if(element.chargeTypeMasterId == EXPRESS_CHARGE) {
							dataObject.expressCharge	= element.wayBillBookingChargeChargeAmount;
							totalExpressCharge	+= element.wayBillBookingChargeChargeAmount;
						}else if(element.chargeTypeMasterId == GODOWN_CHARGE) {
							dataObject.godownCharge	= element.wayBillBookingChargeChargeAmount;
							totalGodownCharge	+= element.wayBillBookingChargeChargeAmount;
						}else if(element.chargeTypeMasterId == RECEIPT_BOOKING) {
							dataObject.receipt	= element.wayBillBookingChargeChargeAmount;
							totalReceipt	+= element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == ODA) {
							dataObject.oda	= element.wayBillBookingChargeChargeAmount;
							totalOda	+= element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == UNLOADING_HAMALI_BOOKING) {
							dataObject.unloadingHamali	= element.wayBillBookingChargeChargeAmount;
							totalUnloadingHamali	+= element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == DOOR_PICKUP) {
							dataObject.doorPickupCharge	= element.wayBillBookingChargeChargeAmount;
							totalDoorPickupCharge	+= element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == SC) {
							dataObject.scCharge				= element.wayBillBookingChargeChargeAmount;
							totalscCharge					+= element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == HC) {
							dataObject.hcCharge				= element.wayBillBookingChargeChargeAmount;
							totalhcCharge					+= element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == EIC) {
							dataObject.eicCharge				= element.wayBillBookingChargeChargeAmount;
							totaleicCharge					+= element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == WP) {
							dataObject.wpCharge				= element.wayBillBookingChargeChargeAmount;
							totalwpCharge					+= element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == DBC) {
							dataObject.dbcCharge				= element.wayBillBookingChargeChargeAmount;
							totaldbcCharge					+= element.wayBillBookingChargeChargeAmount;
						}else if(element.chargeTypeMasterId == TEMPO_BHADA_BOOKING) {
							dataObject.tempoBhada			= element.wayBillBookingChargeChargeAmount;
							totalTempoBhada				+= element.wayBillBookingChargeChargeAmount;
						}else if(element.chargeTypeMasterId == GR_CHARGE) {
							dataObject.grCharge			= element.wayBillBookingChargeChargeAmount;
							totalGrCharge				+= element.wayBillBookingChargeChargeAmount;
						} else if (element.chargeTypeMasterId == FS_CHARGE) {
							dataObject.fsCharge			= element.wayBillBookingChargeChargeAmount;
							totalfsCharge				+= element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == LABOUR_CHG) {
							dataObject.labourChg			= element.wayBillBookingChargeChargeAmount;
							totalLabourChg				    += element.wayBillBookingChargeChargeAmount;
						} else if(element.chargeTypeMasterId == PARKING_CHG) {
							dataObject.parkingChg			= element.wayBillBookingChargeChargeAmount;
							totalParkingChg		    	    += element.wayBillBookingChargeChargeAmount;
						}else if(element.chargeTypeMasterId == GC_CHARGE) {
							dataObject.GCCharge			= element.wayBillBookingChargeChargeAmount;
							totalGCCharge				+= element.wayBillBookingChargeChargeAmount;
						}else if(element.chargeTypeMasterId == ODA_CHARGE) {
							dataObject.ODACharge			= element.wayBillBookingChargeChargeAmount;
							totalODACharge				+= element.wayBillBookingChargeChargeAmount;
						}else if(element.chargeTypeMasterId == DELIVERY_CHG) {
							dataObject.deliveryCharge			= element.wayBillBookingChargeChargeAmount;
							totalDeliveryCharge				+= element.wayBillBookingChargeChargeAmount;
						}else if(element.chargeTypeMasterId == SP_HANDLING_DIC_CHG) {
							dataObject.spHandlingDICCharge			= element.wayBillBookingChargeChargeAmount;
							totalspHandlingDICCharge				+= element.wayBillBookingChargeChargeAmount;
						}else if(element.chargeTypeMasterId == CWB_CHG) {
							dataObject.CWBCharge			= element.wayBillBookingChargeChargeAmount;
							totalCWBCharge				+= element.wayBillBookingChargeChargeAmount;
						}else if(element.chargeTypeMasterId == WITH_PASS) {
							dataObject.withPassCharge			= element.wayBillBookingChargeChargeAmount;
							totalWithPassCharge				+= element.wayBillBookingChargeChargeAmount;
						}
					}
					
					/*
					dataObject.otherChargesForMGLLP =
						bookingCharges
						.filter(b => b.chargeTypeMasterId !== FREIGHT && b.chargeTypeMasterId !== GR_CHARGE)
						.map(b => b.wayBillBookingChargeChargeAmount)
						.reduce((a, b) => a + b, 0);
					totalOtherChargesForMGLLP += dataObject.otherChargesForMGLLP;
					*/
					
					const freightAndGRTotal = bookingCharges
					    .filter(b => b.chargeTypeMasterId === FREIGHT || b.chargeTypeMasterId === GR_CHARGE)
					    .map(b => b.wayBillBookingChargeChargeAmount)
					    .reduce((a, b) => a + b, 0);

					dataObject.otherChargesForMGLLP = dataObject.lrGrandTotal - freightAndGRTotal;
					totalOtherChargesForMGLLP += dataObject.otherChargesForMGLLP;

					totalGrandTotalForMGLLP += dataObject.lrGrandTotal
				}
			
				switch (dataObj.chargeTypeId) {
					case CHARGETYPE_ID_FIX:
						dataObject.chargeSelection = (dataObj.vehicleTypeName !== undefined && dataObj.vehicleTypeName !== 'undefined')
							? dataObj.vehicleTypeName
							: dataObj.additionalRemark;
						break;
					case CHARGETYPE_ID_QUANTITY:
						dataObject.chargeSelection = dataObj.additionalRemark;
						break;
					case CHARGETYPE_ID_WEIGHT:
						dataObject.chargeSelection = dataObj.chargeWeight;
						break;
					default:
						dataObject.chargeSelection = "";
				}
			
				if(dataObj.chargeTypeId == CHARGETYPE_ID_WEIGHT) {
					articleRateMultiple = dataObj.weightRate;
					articleRateMultipleCommaSeperated = dataObj.weightRate;
					
					if(dataObject.freight != undefined)
						articleFreightForFormate5	=  Math.round(dataObject.freight).toFixed(2);	
					
					articleRateForFromate5		= dataObj.weightRate;
					articleRateForFromate4		= dataObj.weightRate;
				}
					
				if(dataObj.chargeTypeId == CHARGETYPE_ID_FIX) {
					articleRateMultiple = dataObj.ArticleAmount;
					
					if (configuration.accountGroupId == ACCOUNT_GROUP_ID_NPE)
						articleRateMultipleCommaSeperated = 'Fixed Cost';
					else
						articleRateMultipleCommaSeperated = dataObj.articleAmount;
					
					if(dataObject.freight)
						articleFreightForFormate5	=  Math.round(dataObject.freight).toFixed(2);	
					
					articleRateForFromate5		=	"Fix";
					articleRateForFromate4		=	"Fix";
					articleTypeMultipleFormate5	=	"Part Load";
					articleQtyForFormate5		=	articleQtyForFormate4;
				}	
				if(configuration != undefined && configuration.accountGroupId == ACCOUNT_GROUP_ID_ABBAS){
					if(dataObj.chargeTypeId == CHARGETYPE_ID_WEIGHT){
						dataObject.totalArticle =0;
					}else if(dataObj.chargeTypeId == CHARGETYPE_ID_QUANTITY){
						dataObject.chargeWeightWithKG =0;
					}else if(dataObj.chargeTypeId == CHARGETYPE_ID_FIX){
						dataObject.totalArticle =0;
					}	
				}
				
				if(dataObj.chargeTypeId == CHARGETYPE_ID_WEIGHT)
					articalRateforPanindia = dataObject.articleRate
				
				if(dataObj.chargeTypeId == CHARGETYPE_ID_QUANTITY)
					articalRateforPanindia = dataObject.articleRate
					
				if(dataObj.chargeTypeId == CHARGETYPE_ID_FIX)
					articalRateforPanindia = "FIX";
				
				if(dataObj.chargeTypeId == CHARGETYPE_ID_WEIGHT)
					articalRateforSES = dataObject.weightRate
				
				if(dataObj.chargeTypeId == CHARGETYPE_ID_QUANTITY) {
					var artAmount = new Array();

					for(var data of dataObj.consignmentDetails) {
						artAmount.push(data.amount);
					}

					articalRateforSES = artAmount.join(',')
				}
					
				if(dataObj.chargeTypeId == CHARGETYPE_ID_FIX)
					articalRateforSES = dataObject.freight;
				 
				if(dataObject.categoryTypeId > 0)
					dataObject.slabMasterRangeFormate4 = dataObj.categoryTypeName;
				else if(dataObj.bookingTypeId == BOOKING_TYPE_FTL_ID)
					dataObject.slabMasterRangeFormate4	= dataObj.vehicleTypeName;
				else
					dataObject.slabMasterRangeFormate4	= dataObj.slabRange;

				dataObject.totalhalting			= totalhalting;	
				dataObject.totalDD					= totalDD;
				dataObject.totalfreight				= totalfreight;
				dataObject.actualTotalfreight		= actualTotalfreight;
				dataObject.totalhamali				= totalhamali;
				dataObject.totallrCharge			= totallrCharge;
				dataObject.totaldetentionCharge		= totaldetentionCharge;
				dataObject.totaldocketCharge		= totaldocketCharge;
				dataObject.totalHandling			= totalHandling;
				dataObject.totalCollection			= totalCollection;
				dataObject.totalAoc					= totalAoc;
				dataObject.totalLongLength			= totalLongLength;
				dataObject.totalBookingDelivery		= totalBookingDelivery;
				dataObject.totalOtherCharges		= totalOtherCharges;
				dataObject.totalDDCharge			= totalDDCharge;
				dataObject.totalLocalCharge			= totalLocalCharge;
				dataObject.totalLabourCharge		= totalLabourCharge;
				dataObject.totalOtherBkgCharge		= totalOtherBkgCharge;
				dataObject.totalStatisticalCharge	= totalStatisticalCharge;
				dataObject.totalRiskCharge			= totalRiskCharge;
				dataObject.totalSTChargeBooking		= totalSTChargeBooking;
				dataObject.totalCCACharge			= totalCCACharge;
				dataObject.totalTollCharge			= totalTollCharge;
				dataObject.totalDoorCollection		= totalDoorCollection;
				dataObject.totalDD					= totalDD;
				dataObject.totalDC					= totalDC;
				dataObject.totalStationaryCharge	= totalStationaryCharge;
				dataObject.totalFOV					= totalFOV;
				dataObject.totalExtraWt				= totalExtraWt;
				dataObject.totalServiceCharge		= totalServiceCharge;
				dataObject.totalLoading				= totalLoading;
				dataObject.totalUnloading			= totalUnloading;
				dataObject.totalUnion				= totalUnion;
				dataObject.totalBookCharge			= totalBookCharge;
				dataObject.totalCrossingCharge		= totalCrossingCharge;
				dataObject.totalBcCharge			= totalBcCharge;
				dataObject.totalDoubleDelivery		= totalDoubleDelivery;
				dataObject.totalLoadingDetention	= totalLoadingDetention;
				dataObject.totalUnloadingDetention	= totalUnloadingDetention;
				dataObject.totalOtherChargeHtc		= totalOtherChargeHtc;
				dataObject.totalOtherNew			= totalOtherNew;
				dataObject.totalAcCharge			= totalAcCharge;
				dataObject.totalIandSCharge			= totalIandSCharge;
				dataObject.totalPickupCharge		= totalPickupCharge;
				dataObject.totalOctroiChrg			= totalOctroiChrg;
				dataObject.totalCartingChrg			= totalCartingChrg;
				dataObject.totalBuiltyChrg			= totalBuiltyChrg;
				dataObject.totalLocalChrg			= totalLocalChrg;
				dataObject.grandTotalForSts			= totalgrandtotal - ( dataObject.totalExtraWt  +  dataObject.totalSTChargeBooking);

				dataObject.totallateNeight			= totallateNeight;
				dataObject.totalwaiting				= totalwaiting;
				dataObject.totalToPayHamali			= totalToPayHamali;
				dataObject.totalDdcCharge			= totalDdcCharge;
				dataObject.totalEwayBillCharge			= totalEwayBillCharge;
				dataObject.totalPodCharge			= totalPodCharge;
				dataObject.totalFuelSurCharge		= totalFuelSurCharge;
				dataObject.totalCODDOD				= totalCODDOD;
				dataObject.totalSurCharge			= totalSurCharge;	
				dataObject.totalhandling			= totalhandling;
				dataObject.totalPacking				= totalPacking;
				dataObject.totalRTOCharge			= totalRTOCharge;
				dataObject.totalReceivedAmount		= totalReceivedAmount;				
				dataObject.totalNetAmount			= totalNetAmount;
				dataObject.totalInsurace			= totalInsurace;
				dataObject.totalDelCollCharge		= totalDelCollCharge;
				dataObject.totalOda					= totalOda;
				dataObject.totalUnloadingHamali		= totalUnloadingHamali;
				dataObject.totalHamalisct			= totalHamalisct;
				dataObject.totalothersct			= totalothersct;
				dataObject.totalFreightAmountForReporter			= totalFreightAmountForReporter;	
				dataObject.totalscCharge			= totalscCharge;
				dataObject.totalhcCharge			= totalhcCharge;
				dataObject.totaleicCharge			= totaleicCharge;
				dataObject.totalwpCharge			= totalwpCharge;
				dataObject.totaldbcCharge			= totaldbcCharge;
				dataObject.totalTempoBhada			= totalTempoBhada;
				dataObject.totalGCCharge			= totalGCCharge;
				dataObject.totalODACharge			= totalODACharge;
				dataObject.totalDeliveryCharge		= totalDeliveryCharge;
				dataObject.totalspHandlingDICCharge	= totalspHandlingDICCharge;
				dataObject.totalCWBCharge			= totalCWBCharge;
				dataObject.totalWithPassCharge			= totalWithPassCharge;
				dataObject.totalDDForSET			= totalDDForSET;
				dataObject.totalOtherForSET			= totalOtherForSET;
				dataObject.totalLabourChg			= totalLabourChg;
				dataObject.totalParkingChg			= totalParkingChg;
				dataObject.totalGrCharge			= totalGrCharge;
				dataObject.totalOtherChargesForMGLLP = totalOtherChargesForMGLLP;
				dataObject.totalGrandTotalForMGLLP   = totalGrandTotalForMGLLP;
				dataObject.totalDoorPickupCharge   	 = totalDoorPickupCharge;
				
				if(dataObject.totalpacking == undefined || dataObject.totalpacking == 'undefined')
					 dataObject.totalpacking	  = 0;	
					 
				if(dataObject.totalhandling == undefined || dataObject.totalhandling == 'undefined')
					 dataObject.totalhandling	  = 0;	
			
				if(dataObject.totalSurCharge == undefined || dataObject.totalSurCharge == 'undefined')
					 dataObject.totalSurCharge	  = 0;	

				if(dataObject.totalRTOCharge == undefined || dataObject.totalRTOCharge == 'undefined')
					 dataObject.totalRTOCharge	  = 0;	

				if(dataObject.totalReceivedAmount == undefined || dataObject.totalReceivedAmount == 'undefined')
					 dataObject.totalReceivedAmount	  = 0;	
					 
				if(dataObject.totalNetAmount == undefined || dataObject.totalNetAmount == 'undefined')
					 dataObject.totalNetAmount	  = 0;			 
				
				if(dataObject.hamali == undefined || dataObject.hamali == 'undefined')
					 dataObject.hamali = 0;
				 
				if(dataObject.freight == undefined || dataObject.freight == 'undefined')
					 dataObject.freight = 0;
				 
				if(dataObject.dd == undefined || dataObject.dd == 'undefined')
					 dataObject.dd = 0;
				
				if(dataObject.DoorDelivery == undefined || dataObject.DoorDelivery == 'undefined')
					 dataObject.DoorDelivery = 0;	 
					 
				 
				if(dataObject.lrCharge == undefined || dataObject.lrCharge == 'undefined') {
					 dataObject.lrCharge = 0;
					dataObject.otherChargeForAtc =dataObject.otherCharges;	
				} 
				
				if(dataObject.detentionCharge == undefined || dataObject.detentionCharge == 'undefined')
					 dataObject.detentionCharge = 0;
				 
				if(dataObject.Aoc == undefined || dataObject.Aoc == 'undefined')
					 dataObject.Aoc = 0;
				 
				if(dataObject.collection == undefined || dataObject.collection == 'undefined')
					 dataObject.collection = 0;
				 
				if(dataObject.dlycharge == undefined || dataObject.dlycharge == 'undefined')
					 dataObject.dlycharge = 0;
				 
				if(dataObject.weight == undefined || dataObject.weight == 'undefined')
					 dataObject.weight = 0;
				 
				if(dataObject.detentionCharge == undefined || dataObject.detentionCharge == 'undefined')
					 dataObject.detentionCharge = 0;
				 
				if(dataObject.Handling	== undefined || dataObject.Handling	 == 'undefined')
					 dataObject.Handling  = 0;
				 
				if(dataObject.LongLength == undefined || dataObject.LongLength == 'undefined')
					 dataObject.LongLength	  = 0;
				 
				if(dataObject.BookingDelivery == undefined || dataObject.BookingDelivery == 'undefined')
					 dataObject.BookingDelivery	  = 0;
				 
				if(dataObject.ddCharge == undefined || dataObject.ddCharge == 'undefined')
					 dataObject.ddCharge	  = 0;
				 
				if(dataObject.LocalCharge == undefined || dataObject.LocalCharge == 'undefined')
					 dataObject.LocalCharge	  = 0;
				 
				if(dataObject.LabourCharge == undefined || dataObject.LabourCharge == 'undefined')
					 dataObject.LabourCharge	  = 0;
				 
				if(dataObject.OtherBkgCharge == undefined || dataObject.OtherBkgCharge == 'undefined')
					 dataObject.OtherBkgCharge	  = 0;
				
				if(dataObject.fuelSurCharge == undefined || dataObject.fuelSurCharge == 'undefined')
					 dataObject.fuelSurCharge	  = 0;
				 
				if(dataObject.StatisticalCharge == undefined || dataObject.StatisticalCharge == 'undefined')
					 dataObject.StatisticalCharge	  = 0;
				 
				if(dataObject.RiskCharge == undefined || dataObject.RiskCharge == 'undefined')
					 dataObject.RiskCharge	  = 0;
				 
				if(dataObject.STChargeBooking == undefined || dataObject.STChargeBooking == 'undefined')
					 dataObject.STChargeBooking	  = 0;
				 
				if(dataObject.CCACharge == undefined || dataObject.CCACharge == 'undefined')
					 dataObject.CCACharge	  = 0;
				 
				if(dataObject.TollCharge == undefined || dataObject.TollCharge == 'undefined')
					 dataObject.TollCharge	  = 0;
				 
				if(dataObject.DoorCollection == undefined || dataObject.DoorCollection == 'undefined')
					 dataObject.DoorCollection	  = 0;
				
				if(dataObject.stationaryChrge == undefined || dataObject.stationaryChrge == 'undefined')
					 dataObject.stationaryChrge	  = 0;	 
					 
				 
				if(dataObject.DD	  == undefined || dataObject.DD == 'undefined')
					 dataObject.DD	  = 0;
				 
				if(dataObject.DC	  == undefined || dataObject.DC == 'undefined')
					 dataObject.DC	  = 0;
				 
				if(dataObject.StationaryCharge == undefined || dataObject.StationaryCharge == 'undefined')
					 dataObject.StationaryCharge	  = 0;
				 
				if(dataObject.fov	  == undefined || dataObject.fov == 'undefined'){
					if(configuration.accountGroupId == ACCOUNT_GROUP_ID_SET){
						dataObject.declaredValue = "";	
					}
					dataObject.fov	  = 0;
				}
				 
				if(dataObject.serviceCharge == undefined || dataObject.serviceCharge == 'undefined')
					 dataObject.serviceCharge	  = 0;
				 
				if(dataObject.Loading == undefined ||  dataObject.Loading == 'undefined')
					 dataObject.Loading	  = 0;
				 
				if(dataObject.Unloading	== undefined ||	 dataObject.Unloading == 'undefined')
					 dataObject.Unloading	  = 0;
				 
				if(dataObject.Union	== undefined ||	 dataObject.Union == 'undefined')
					 dataObject.Union	  = 0;
				 
				if(dataObject.bookCharge == undefined || dataObject.bookCharge == 'undefined')
					 dataObject.bookCharge	  = 0;
				 
				if(dataObject.crossingCharge == undefined || dataObject.crossingCharge == 'undefined')
					 dataObject.crossingCharge	  = 0;
				 
				if(dataObject.bcCharge == undefined || dataObject.bcCharge == 'undefined')
					 dataObject.bcCharge	  = 0;
				 
				if(dataObject.doubleDelivery == undefined || dataObject.doubleDelivery == 'undefined')
					 dataObject.doubleDelivery	  = 0;
				 
				if(dataObject.loadingDetetion == undefined || dataObject.loadingDetetion == 'undefined')
					 dataObject.loadingDetetion	  = 0;
				 
				if(dataObject.unLoadingDetetion	== undefined || dataObject.unLoadingDetetion == 'undefined')
					 dataObject.unLoadingDetetion	  = 0;
				 
				if(dataObject.acCharge == undefined || dataObject.acCharge == 'undefined')
					 dataObject.acCharge	  = 0;

				if(dataObject.iandsCharge == undefined || dataObject.iandsCharge == 'undefined')
					 dataObject.iandsCharge	  = 0;

				if(dataObject.pickupCharge == undefined || dataObject.pickupCharge == 'undefined')
					 dataObject.pickupCharge	  = 0;

				if(dataObject.octroiChrg == undefined || dataObject.octroiChrg == 'undefined')
					 dataObject.octroiChrg	  = 0;
				 
				if(dataObject.cartingChrg == undefined || dataObject.cartingChrg == 'undefined')
					 dataObject.cartingChrg	  = 0;
				 
				if(dataObject.builtyChrg == undefined || dataObject.builtyChrg == 'undefined')
					 dataObject.builtyChrg	  = 0;
				 
				if(dataObject.deliveryDiscount == undefined || dataObject.deliveryDiscount == 'undefined')
					 dataObject.deliveryDiscount	  = 0;
				 
				if(dataObject.extraWt == undefined || dataObject.extraWt == 'undefined')
					 dataObject.extraWt	  = 0;	
				
				if(dataObject.localCharge == undefined || dataObject.localCharge == 'undefined')
					 dataObject.localCharge	  = 0;
			
				if(dataObject.lateNeight == undefined || dataObject.lateNeight == 'undefined')
					 dataObject.lateNeight	  = 0;
			
				if(dataObject.waiting == undefined || dataObject.waiting == 'undefined')
					 dataObject.waiting	  = 0;
					 
				if(dataObject.toPayHamali == undefined || dataObject.toPayHamali == 'undefined')
					 dataObject.toPayHamali	  = 0;	
					 
				if(dataObject.ddcCharge == undefined || dataObject.ddcCharge == 'undefined')
					 dataObject.ddcCharge	  = 0;
					 
				if(dataObject.podCharge == undefined || dataObject.podCharge == 'undefined')
					dataObject.podCharge	  = 0;	 
					 
				if(dataObject.ewayBillCharge == undefined || dataObject.ewayBillCharge == 'undefined')
					 dataObject.ewayBillCharge	  = 0;	 
			
				if(dataObject.fuelCharge == undefined || dataObject.fuelCharge == 'undefined')
					 dataObject.fuelCharge	  = 0;	
					  
				if(dataObject.CODDOD == undefined || dataObject.CODDOD == 'undefined')
					 dataObject.CODDOD	  = 0;	
					 
				if(dataObject.handling == undefined || dataObject.totalhandling == 'undefined')
					 dataObject.totalhandling	  = 0;	
				
				if(dataObject.rtoCharge == undefined || dataObject.rtoCharge == 'undefined')
					 dataObject.rtoCharge	  = 0;	
					 
				if(dataObject.delcollCharge == undefined || dataObject.delcollCharge == 'undefined')
					 dataObject.delcollCharge	  = 0;	
					  
				if(dataObject.insurace == undefined || dataObject.insurace == 'undefined')
					 dataObject.insurace	  = 0;
				
				if(dataObject.katta == undefined || dataObject.katta == 'undefined')
					 dataObject.katta	  = 0;	 
					
				if(dataObject.mathadi == undefined || dataObject.mathadi == 'undefined')
					 dataObject.mathadi	  = 0;	
				
				if(dataObject.extraRunning == undefined || dataObject.extraRunning == 'undefined')
					 dataObject.extraRunning	  = 0;	
					 
				if(dataObject.expressCharge == undefined || dataObject.expressCharge == 'undefined')
					 dataObject.expressCharge	  = 0;	
				
				if(dataObject.godownCharge == undefined || dataObject.godownCharge == 'undefined')
				 dataObject.godownCharge	  = 0;	 
				
				if(dataObject.receipt == undefined || dataObject.receipt == 'undefined')
				 dataObject.receipt	  = 0;	  
				 
				if(dataObject.oda == undefined || dataObject.oda == 'undefined')
					dataObject.oda = 0;
					
				if(dataObject.totalUnloadingHamali == undefined || dataObject.totalUnloadingHamali == 'undefined')
					dataObject.totalUnloadingHamali = 0;
				
				if(dataObject.totalHamalisct == undefined || dataObject.totalHamalisct == 'undefined')
					dataObject.totalHamalisct = 0;
				
				if(dataObject.totalothersct == undefined || dataObject.totalothersct == 'undefined')
					dataObject.totalothersct = 0;	
				
				if(dataObject.totalFreightAmountForReporter == undefined || dataObject.totalFreightAmountForReporter == 'undefined')
					dataObject.totalFreightAmountForReporter = 0;	
					
				if(dataObject.doorPickupCharge == undefined || dataObject.doorPickupCharge == 'undefined')
					dataObject.doorPickupCharge = 0;	
				
				if(dataObject.scCharge == undefined || dataObject.scCharge == 'undefined')
					 dataObject.scCharge	  = 0;
				
				if(dataObject.hcCharge == undefined || dataObject.hcCharge == 'undefined')
					 dataObject.hcCharge	  = 0;	
				
				if(dataObject.eicCharge == undefined || dataObject.eicCharge == 'undefined')
					 dataObject.eicCharge	  = 0;	
					 
				if(dataObject.wpCharge == undefined || dataObject.wpCharge == 'undefined')
					 dataObject.wpCharge	  = 0;
					 
				if(dataObject.dbcCharge == undefined || dataObject.dbcCharge == 'undefined')
					 dataObject.dbcCharge	  = 0;	
				
				if(dataObject.tempoBhada == undefined || dataObject.tempoBhada == 'undefined')
					 dataObject.tempoBhada	  = 0;	
				if(dataObject.GCCharge == undefined || dataObject.GCCharge == 'undefined')
					 dataObject.GCCharge	  = 0;	
				if(dataObject.ODACharge == undefined || dataObject.ODACharge == 'undefined')
					 dataObject.ODACharge	  = 0;	
				if(dataObject.deliveryCharge == undefined || dataObject.deliveryCharge == 'undefined')
					 dataObject.deliveryCharge	  = 0;	
				if(dataObject.spHandlingDICCharge == undefined || dataObject.spHandlingDICCharge == 'undefined')
					dataObject.spHandlingDICCharge	  = 0;	
				if(dataObject.CWBCharge == undefined || dataObject.CWBCharge == 'undefined')
					 dataObject.CWBCharge	  = 0;	
				if(dataObject.withPassCharge == undefined || dataObject.withPassCharge == 'undefined')
					 dataObject.withPassCharge	  = 0;	
				if(dataObject.totalDDForSET == undefined || dataObject.totalDDForSET == 'undefined')
					 dataObject.totalDDForSET	  = 0;	
				if(dataObject.totalOtherForSET == undefined || dataObject.totalOtherForSET == 'undefined')
					 dataObject.totalOtherForSET	  = 0;	
				if(dataObject.labourChg == undefined || dataObject.labourChg == 'undefined')
					dataObject.labourChg	  = 0;	
						 
				if(dataObject.parkingChg == undefined || dataObject.parkingChg == 'undefined')
					dataObject.parkingChg	  = 0;

				if(dataObject.customBookingAmtRenukaCgst == undefined || dataObject.customBookingAmtRenukaCgst == 'undefined')
					dataObject.customBookingAmtRenukaCgst	  = 0;
				
				if(dataObject.customBookingAmtRenukaSgst == undefined || dataObject.customBookingAmtRenukaSgst == 'undefined')
					dataObject.customBookingAmtRenukaSgst	  = 0;
					
				if(dataObject.customBookingAmtRenukaIgst == undefined || dataObject.customBookingAmtRenukaIgst == 'undefined')
					dataObject.customBookingAmtRenukaIgst	  = 0;


				if(dataObj.chargeTypeId == CHARGETYPE_ID_FIX)
					dataObject.RtcCostPerTPT =	dataObj.articleAmount;
				else
					dataObject.RtcCostPerTPT =Number(dataObj.chargeWeight*dataObj.articleRate);
				
				dataObject.hamaliCharge						= dataObject.totalhamali
				dataObject.totalRtc							= dataObject.RtcCostPerTPT+dataObject.StatisticalCharge+dataObject.hamali;
				grandTotalForSts					= dataObject.lrGrandTotal - (dataObject.STChargeBooking + dataObject.extraWt);
				dataObject.grandTotalForSts			= grandTotalForSts;
			
				dataObject.otherLrChg					= dataObj.grandTotal-(dataObject.hamali+dataObject.freight+dataObject.detentionCharge+dataObject.dd+dataObject.lrCharge);
				dataObject.otherLrCharges				= dataObj.grandTotal-(dataObject.hamali+dataObject.freight);
				totalWeight							+= dataObj.chargeWeight;
				dataObject.totalWeight					= totalWeight;
				totaldlycharge							+= dataObject.dlycharge;
				dataObject.totaldlycharge				= totaldlycharge;
				dataObject.totalotherChargeBooking		= dataObject.Aoc + dataObject.dd + dataObject.collection;
				dataObject.totalcustomAOCCharge			= dataObject.Aoc+dataObject.BookingDelivery +dataObject.collection;
				grandtotalcustomAOCCharge				+= dataObject.totalcustomAOCCharge;
				dataObject.grandtotalcustomAOCCharge	= grandtotalcustomAOCCharge;
				dataObject.grandTotalCharges		= dataObject.lrFreight +dataObject.hamali +dataObject.lrCharge + dataObject.totalcustomAOCCharge ;
				grandtotalcustomcharge				+= dataObject.grandTotalCharges 
				dataObject.grandtotalcustomcharge		= grandtotalcustomcharge
				totalotherChargeBooking				+= dataObject.Aoc + dataObject.dd + dataObject.collection;
				dataObject.totalOtherChargesAmount		= totalotherChargeBooking;
				totalQuantity							+= dataObject.totalArticle;
				dataObject.totalQuantity				= totalQuantity;
				otherChargesBookingTime				= dataObject.LongLength + dataObject.collection + dataObject.BookingDelivery ;
				dataObject.otherChargesBookingTime		= otherChargesBookingTime;
				dataObject.totalBokingChargeForSSTS	   = dataObject.freight+ dataObject.hamali + dataObject.lrCharge + dataObject.pickupCharge + dataObject.lateNeight + dataObject.waiting + dataObject.totalGstAmt;
				dataObject.builtyChargePsr						= dataObject.lrCharge + dataObject.StationaryCharge;
				totalOtherCharges					  += dataObject.LongLength + dataObject.collection + dataObject.BookingDelivery ;
				dataObject.totalOtherCharges		  = totalOtherCharges;
				 
				dataObject.TotalBookingCharge		 = dataObject.freight + dataObject.Handling + dataObject.lrCharge + dataObject.LongLength + dataObject.collection + dataObject.BookingDelivery;
				totalbookingcharwithoutDly			= dataObject.lrGrandTotal - dataObject.dlycharge ; 
				dataObject.totalbookingcharwithoutDly	= totalbookingcharwithoutDly;
				grandTotalbookingcharwithoutDly			+=	totalbookingcharwithoutDly ;
				totalforGrandtotal						+= dataObject.lrGrandTotal;
				dataObject.totalforGrandtotal			= totalforGrandtotal;
				dataObject.grandTotalbookingcharwithoutDly		= grandTotalbookingcharwithoutDly;
				dataObject.totalgrandtotal			= dataObject.lrGrandTotal + dataObject.dlycharge;
				dataObject.verticalChargesForNVT	= "<table style='width:100%;'cellpadding='0' cellspacing='0'><tr><td style='width:50%;border-bottom: 1px solid black;border-right: 1px solid black;'>Freight </td><td style='border-bottom: 1px solid black;border-left: 1px solid black;'> "+ dataObject.lrFreight + " </td></tr><tr><td style='width:50%;border-bottom: 1px solid black;border-right: 1px solid black;'>DD  </td><td style='width:50%;border-bottom: 1px solid black;border-left: 1px solid black;'> "+ dataObject.BookingDelivery + " </td></tr><tr><td style='width:50%;border-bottom: 1px solid black;border-right: 1px solid black;'>Hamali  </td><td style='width:50%;border-bottom: 1px solid black;border-left: 1px solid black;'> "+ dataObject.hamali + " </td></tr><tr><td style='width:50%;border-bottom: 1px solid black;border-right: 1px solid black;'>Builty </td><td style='border-bottom: 1px solid black;border-left: 1px solid black;'> "+ dataObject.builtyChrg + " </td></tr>	<tr><td style='width:50%;border-bottom: 1px solid black;border-right: 1px solid black;'>E-way Bill </td><td style='border-bottom: 1px solid black;border-left: 1px solid black;'> "+ dataObject.ewayBillCharge + " </td></tr>	   <tr><td style='width:50%;border-bottom: 1px solid black;border-right: 1px solid black;'>Coll.Chg </td><td style='border-bottom: 1px solid black;border-left: 1px solid black;'> "+ dataObject.collection + " </td></tr><tr><td style='width:50%;border-bottom: 1px solid black;border-right: 1px solid black;'>Others </td><td style='border-bottom: 1px solid black;border-left: 1px solid black;'> "+ dataObject.OtherBkgCharge + " </td></tr><tr><td style='width:50%;border-bottom: 1px solid black;border-right: 1px solid black;'>Taxable Amount </td><td style='border-bottom: 1px solid black;border-left: 1px solid black;'> "+ dataObject.bookingNewAmount + " </td></tr><tr><td style='width:50%;border-bottom: 1px solid black;border-right: 1px solid black;'>SGST </td><td style='border-bottom: 1px solid black;border-left: 1px solid black;'> "+ dataObject.sgstWithDecimal + " </td></tr><tr><td style='width:50%;border-bottom: 1px solid black;border-right: 1px solid black;'>CGST </td><td style='border-bottom: 1px solid black;border-left: 1px solid black;'> "+ dataObject.cgstWithDecimal + " </td></tr><tr><td style='width:50%;border-bottom: 1px solid black;border-right: 1px solid black;'>IGST </td><td style='border-bottom: 1px solid black;border-left: 1px solid black;'> "+ dataObject.igstWithDecimal + " </td></tr><tr><td style='width:50%;border-bottom: 1px solid black;border-right: 1px solid black;'>Round Off </td><td style='border-bottom: 1px solid black;border-left: 1px solid black;'> "+dataObject.roundOffGSTAmount+ " </td></tr><tr><td style='width:50%;border-bottom: 1px solid black;border-right: 1px solid black;'>Grand Total </td><td style='border-bottom: 1px solid black;border-left: 1px solid black;'> "+ dataObject.lrGrandTotal + " </td></tr></table>"
				totalbookingcharge		= dataObject.lrGrandTotal;
				dataObject.totalBokingChargeForKTCO	  = dataObject.freight+ dataObject.hamali + dataObject.halting;
				dataObject.omkarfreight		= dataObject.freight + dataObject.DoorCollection +dataObject.BookingDelivery + dataObject.StationaryCharge + dataObject.hamali ;
				dataObject.totalomkarfreight		= dataObject.omkarfreight;
				


				totalActualWeight							+= dataObj.actualWeight;
				dataObject.totalActualWeight					= totalActualWeight;
				//Other Chareges Data For SLPL
				
				dataObject.slplOtherF1						= dataObj.chargesSum - (dataObject.oda + dataObject.lrFreight);
				dataObject.slplOtherF3						= dataObj.chargesSum - (dataObject.lrFreight + dataObject.Handling + dataObject.docketCharge);
				
				//HAMALI AND OTHER DATA For sct
				
				if(dataObject.unloadingHamali == undefined){
					dataObject.unloadingHamali = 0;
				}
				dataObject.hamalisct						= Number(dataObject.unloadingHamali) + Number(dataObject.Loading);
				dataObject.totalHamalisct					+=	dataObject.hamalisct;
				dataObject.othersct							= Math.abs(dataObject.lrGrandTotal - (dataObject.hamalisct + dataObject.freight));
				dataObject.totalothersct					+= dataObject.othersct;
				
				//FREIGHT AMOUNT FOR REPORTER
				
				dataObject.freightAmountForReporter			= dataObject.bookingAmount - dataObject.OtherBkgCharge;
				dataObject.totalFreightAmountForReporter	+= dataObject.bookingAmount - dataObject.OtherBkgCharge;
				
				// Door Delivery OTHER Charge For SET
				dataObject.ddForSET			= dataObject.ODACharge + dataObject.dd;
				dataObject.totalDDForSET	+= dataObject.ddForSET
				dataObject.otherForSET		= dataObject.hamali + dataObject.RiskCharge;
				dataObject.totalOtherForSET	+= dataObject.otherForSET
				
				//BOOKING TYPE	
				
				if(dataObj.bookingTypeId == BOOKING_TYPE_SUNDRY_ID)
					dataObject.bookingType	 = "Sundry";
				else if(dataObj.bookingTypeId == BOOKING_TYPE_FTL_ID)		
					dataObject.bookingType	 = "FTL";
				else
					dataObject.bookingType	 = "Direct Delivery Direct Vasuli";			

				if(dataObject.deliveryTimeTBB)
					grandtotalforptcwithoutdlycharge = (dataObject.bookingAmount + dataObject.deliverySumCharges) - dataObject.deliveryDiscount;
				else
					grandtotalforptcwithoutdlycharge =	dataObject.bookingAmount;
					
				dataObject.totalAmountReceivedPtc	= grandtotalforptcwithoutdlycharge;	
					 
				dataObject.totalbookingcharge		= totalbookingcharge;
				totalgrandtotal					+= dataObject.totalbookingcharwithoutDly  + dataObject.dlycharge;
				dataObject.totalgrandtotalkps		= totalgrandtotal.toFixed(2);
				totalweightRate						+= dataObject.weightRate;
				dataObject.totalweightRate			= totalweightRate;
				dataObject.deliveryDiscount		= dataObj.deliveryDiscount;
				totalweightRatetoFixed				+= Number(dataObject.weightRatetoFixed);
				dataObject.totalweightRatetoFixed	= totalweightRatetoFixed;
				totalArtRate						+= dataObject.artRate;
				dataObject.totalArtRate				= totalArtRate;			
				totalarticleRate					+= dataObject.articleRate;
				dataObject.totalarticleRate		= totalarticleRate;
				 
				totalOthercharge					= dataObject.totalforGrandtotal-(dataObject.totalfreight+dataObject.totalhamali);
				dataObject.totalOthercharge		= totalOthercharge;
				
								 
				dataObject.finalAmount			= (Number(dataObject.lrFreight) + Number(dataObject.docketCharge)).toFixed(2);
				totalFinalAmount				+= Number(dataObject.finalAmount);
				 
				dataObject.otherChargeExcFreight			= dataObj.grandTotal - dataObject.freight;
				totalOtherChargeExcFreight				+= dataObject.otherChargeExcFreight;
				dataObject.totalOtherChargeExcFreight		= totalOtherChargeExcFreight;
				
				dataObject.otherChargeExcFreightRoundoff 		= Math.max(0, Math.floor(dataObj.grandTotal - dataObject.freight));
				dataObject.totalOtherChargeExcFreightRoundoff 	= Math.max(0, Math.floor(totalOtherChargeExcFreight));


				
				//For VPT
				dataObject.otherChargeExcFreightAndDDC			= dataObj.grandTotal - dataObject.lrFreight - dataObject.BookingDelivery;
				totalOtherChargeExcFreightAndDDC				+= dataObject.otherChargeExcFreightAndDDC;
				dataObject.totalOtherChargeExcFreightAndDDC		= totalOtherChargeExcFreightAndDDC;
				 
				
				totalGST						+= Number(dataObject.totalGstAmt);
				dataObject.totalGST				= totalGST.toFixed(2);
				
				totalOtherchargeremove					= dataObject.totalforGrandtotal - totalFinalAmount;
				dataObject.totalOtherchargeremove		= totalOtherchargeremove - totalGST;
	
				dataObject.totalFinalAmount		= totalFinalAmount + dataObject.totalOtherchargeremove;
				 
				dataObject.count					= count;
				dataObject.unAddedTaxAmount		= unAddedTaxAmount;
				  
				bookingTotalWithoutTax				+= dataObject.bookingAmount;
				dataObject.bookingTotalWithoutTax	= bookingTotalWithoutTax.toFixed(2);
				dataObject.bookingTotalforGldts		=	bookingTotalWithoutTax;
				
				dataObject.deliverychargesforSrst = 0;
				
				if(dataObject.deliveryTimeTBB) {
					dataObject.deliverychargesforSrst			= dataObject.deliverySumCharges - dataObject.deliveryDiscount;
					dlycharges	+= dataObject.deliverySumCharges - dataObject.deliveryDiscount;
				}

				dataObject.customTaxForSrst 			= dlycharges;
				customTaxForSrst							= dataObject.customTaxForSrst;	
							
				totalOtherCharge1						+= Number(dataObject.otherCharges);
				dataObject.totalOtherCharge1			 = totalOtherCharge1;
				  
				otherChargeForCustom =	dataObj.grandTotal - (dataObject.lrFreight + dataObject.StatisticalCharge) ; 
				dataObject.otherChargeForCustom = otherChargeForCustom;
				totalotherChargeForCustom += dataObject.otherChargeForCustom
				dataObject.totalotherChargeForCustom = totalotherChargeForCustom
				  
				totalCGST							+= Number(dataObject.cgst);
				dataObject.totalCGST				= totalCGST;
				  
				totalSGST							+= Number(dataObject.sgst);
				dataObject.totalSGST				= totalSGST;
				  
				totalIGST							+= Number(dataObject.igst);
				dataObject.totalIGST				= totalIGST;

				totalCGSTWithDecimal				+= Number(dataObject.cgstWithDecimal);
				dataObject.totalCGSTWithDecimal	= totalCGSTWithDecimal;
				  
				totalSGSTWithDecimal				+= Number(dataObject.sgstWithDecimal);
				dataObject.totalSGSTWithDecimal	= totalSGSTWithDecimal;
				  
				totalIGSTWithDecimal				+= Number(dataObject.igstWithDecimal);
				dataObject.totalIGSTWithDecimal	 = totalIGSTWithDecimal;
				 
				totalCgstSgstOfbookingAmount				+= Number(dataObject.cgstSgstOfbookingAmount);
				dataObject.totalCgstSgstOfbookingAmount	 = totalCgstSgstOfbookingAmount;
				
				totalIgstOfbookingAmount				+= Number(dataObject.igstOfbookingAmount);
				dataObject.totalIgstOfbookingAmount	 = totalIgstOfbookingAmount;
				
				//	var ccc =dataObject.totalIGSTWithDecimal;
				
				//dataObject.sss =bookingTotalWithoutTax +dataObject.totalTaxWithDecimal
				
				totalnewOtherCharge					+= Number(dataObject.newOtherCharge);
				dataObject.totalnewOtherCharge		 = totalnewOtherCharge;
				
				dataObject.totalTaxWithDecimal		= totalCGSTWithDecimal+totalSGSTWithDecimal+totalIGSTWithDecimal;
				dataObject.totalTaxWitoutDecimal	= totalCGST+totalSGST+totalIGST;

				totalBookingChargsCustome = Number(dataObject.crossingCharge)+Number(dataObject.hamali)+Number(dataObject.bcCharge)
				 +Number(dataObject.bookCharge)+Number(dataObject.loadingDetetion)+Number(dataObject.unLoadingDetetion)+Number(dataObject.doubleDelivery);
				
				dataObject.otherChargeHtc = totalBookingChargsCustome;
				totalOtherChargeHtc	+= Number(dataObject.otherChargeHtc);
				dataObject.totalOtherChargeHtc = totalOtherChargeHtc
				
				totalOtherNew			+= Number(dataObj.chargesSum + sgst + igst + cgst);
				dataObject.totalOtherNew	= totalOtherNew;
				
				totalQuantityForHtc	+= dataObject.quantityForHtc; 
				dataObject.totalQuantityForHtc	= totalQuantityForHtc.toFixed(2);
				 

				dataObject.grandTotalPanIndia	= dataObject.totalTaxWithDecimal+ bookingTotalWithoutTax;
				
				dataObject.grandTotalPanIndia	= Math.round(dataObject.grandTotalPanIndia).toFixed(2);
				
				if(dataObj.taxAmount > 0) {
					dataObject.showDetailsForSngt	= dataObj.showDetailsForSngt;
					wayBillNumberForTransporter		= wayBillNumberForTransporter + dataObj.wayBillNumber + ",";
				}

				if(dataObj.chargeTypeId == CHARGETYPE_ID_WEIGHT) {
					dataObject.articleRatePgt	= dataObj.weightRate.toFixed(2);
				} else if(dataObj.chargeTypeId == CHARGETYPE_ID_QUANTITY) {
					dataObject.articleRatePgt	= ((dataObj.articleAmount / dataObject.totalQuantity).toFixed(2));
				}
				
				if(dataObj.unAddedTaxAmount > 0) {
					dataObject.showDetailsForSngt		= dataObj.showDetailsForSngt;
					wayBillNumberForUnaddedTaxAmnt	= wayBillNumberForUnaddedTaxAmnt + dataObj.wayBillNumber + ",";
				}
				
				dataObject.wayBillNumberForTransporter	= wayBillNumberForTransporter.replace(/,\s*$/, "");
				dataObject.wayBillNumberForUnaddedTaxAmnt = wayBillNumberForUnaddedTaxAmnt.replace(/,\s*$/, "");
				dataObject.otherChargeForAtc	= dataObject.hamali+dataObject.OtherBkgCharge+dataObject.TollCharge;

				if(configuration.isShowDeliveryChargesInOtherChrge){
					var deliveryCharges							 = dataObj.wayBillDeliveryCharges;
					
					if(deliveryCharges != undefined) {
						for(const element of deliveryCharges) {
							if(element.wayBillChargeMasterId == OCTROI_CLEARING)
								dataObject.octroiClrearing			= element.wayBillDeliverychargeAmount;
							else if(element.wayBillChargeMasterId == STATIONARY)
								dataObject.stationaryChrge			= element.wayBillDeliverychargeAmount;
							else if(element.wayBillChargeMasterId == DAMERAGE)
								dataObject.demerageChrge			= element.wayBillDeliverychargeAmount;
							else if(element.wayBillChargeMasterId == DELIVERY_SERVICE)
								dataObject.delyServiceChrge			= element.wayBillDeliverychargeAmount;
							else if(element.wayBillChargeMasterId == DOOR_DELIVERY_DELIVERY)
								dataObject.doorDelyChrge			= element.wayBillDeliverychargeAmount;
							else if(element.wayBillChargeMasterId == CARTING_DELIVERY)
								dataObject.cartingChrge			= element.wayBillDeliverychargeAmount;
							else if(element.wayBillChargeMasterId == HAMALI_DELIVERY)
								dataObject.hamaliDelyChrge			= element.wayBillDeliverychargeAmount;
						} 

					}
					
					if(dataObject.isDeliveryTimeTBB) {
						if(dataObject.hamaliDelyChrge == undefined)
							dataObject.hamaliDelyChrge = 0;
						
						dataObject.hamaliDely =	dataObject.hamaliDelyChrge;	
						totalHamaliDelyChrge += dataObject.hamaliDely;
					
						dataObject.delyChrgExcHamali = dataObject.deliverySumCharges - dataObject.deliveryDiscount - dataObject.hamaliDelyChrge;
					
						totalDelyChrgExcHamali += dataObject.deliverySumCharges - dataObject.deliveryDiscount - dataObject.hamaliDelyChrge;

						dataObject.bookingTotalDelyTotal = dataObject.delyChrgExcHamali + dataObject.hamaliDelyChrge + dataObject.bookingAmount;
					} else {
						dataObject.hamaliDely = 0;
						dataObject.delyChrgExcHamali = 0;
						dataObject.bookingTotalDelyTotal = dataObject.bookingAmount;
					}	
					grandBookingTotalDelyTotal += dataObject.bookingTotalDelyTotal;
					dataObject.grandBookingTotalDelyTotal	= grandBookingTotalDelyTotal;
					dataObject.totalHamaliDelyChrge			= totalHamaliDelyChrge;
					dataObject.totalDelyChrgExcHamali		= totalDelyChrgExcHamali;

					if(typeof dataObject.octroiClrearing == 'undefined')
						dataObject.octroiClrearing	  = 0;

					if(typeof dataObject.stationaryChrge == 'undefined')
						dataObject.stationaryChrge	  = 0;
						  
					if(typeof dataObject.demerageChrge == 'undefined')
						dataObject.demerageChrge	  = 0;
						  
					if(typeof dataObject.delyServiceChrge == 'undefined')
						dataObject.delyServiceChrge	  = 0;
						
					if(dataObject.hamali == undefined || dataObject.hamali == 'undefined')
						dataObject.hamali	  = 0;
						  
					if(typeof dataObject.doorDelyChrge == 'undefined')
						dataObject.doorDelyChrge	  = 0;
						  
					if(typeof dataObject.cartingChrge == 'undefined')
						dataObject.cartingChrge	  = 0;
						  
					if(typeof dataObject.hamaliDelyChrge == 'undefined')
						dataObject.hamaliDelyChrge	  = 0;
				} 
				  
				dataObject.OtherChrgSngt  = Number(dataObject.collection + dataObject.octroiChrg + dataObject.cartingChrg + dataObject.BookingDelivery 
						+ dataObject.octroiClrearing + dataObject.stationaryChrge + dataObject.demerageChrge
						+ dataObject.delyServiceChrge + dataObject.doorDelyChrge + dataObject.cartingChrge + dataObject.hamaliDelyChrge +dataObject.katta);
				totOtherChrgSngt += dataObject.OtherChrgSngt;
				dataObject.totOtherChrgSngt = totOtherChrgSngt;

				dataObject.pickupAndDDCharge = Number(dataObject.pickupCharge + dataObject.dd);
				totalPickUpAndDdCharge		+=	dataObject.pickupAndDDCharge;
				dataObject.totalPickUpAndDdCharge = totalPickUpAndDdCharge;
				  
				dataObject.hamaliAndIAndSCharges = Number(dataObject.iandsCharge +	dataObject.OtherBkgCharge);
				totalHamaliAndIAndSCharges	+= dataObject.hamaliAndIAndSCharges;
				dataObject.totalHamaliAndIAndSCharges = totalHamaliAndIAndSCharges;
				  
				
				dataObject.lrTotalForRectus	= Number(dataObject.dd + dataObject.pickupCharge + dataObject.iandsCharge + dataObject.hamali+ + dataObject.freight+ dataObject.OtherBkgCharge);
				lrGrandTotalForRectus		+= dataObject.lrTotalForRectus;
				dataObject.lrGrandTotalForRectus = lrGrandTotalForRectus;
								
				dataObject.customBookingAmtRenuka	= Number((dataObject.lrGrandTotalForNM -  Number((sgst + igst + cgst).toFixed(2))).toFixed(2));
				totalBookingAmtRenuka			   += dataObject.customBookingAmtRenuka;
				dataObject.totalBookingAmtRenuka	= totalBookingAmtRenuka;

				if(cgst > 0){
					dataObject.customBookingAmtRenukaCgstSgst	= dataObject.lrGrandTotalForNM -  cgst - sgst;
                }	
				
				if(igst > 0){
					dataObject.customBookingAmtRenukaIgst	= dataObject.lrGrandTotalForNM -  igst;
				}
				
				if(dataObject.isDeliveryTimeTBB) {
					dataObject.deliveryChargesSum = dataObject.deliverySumCharges
					dataObject.delyDiscount		  = dataObject.deliveryDiscount
					dataObject.bookingTotalWithDelivery = dataObject.bookingAmount + dataObject.deliverySumCharges - dataObject.deliveryDiscount
				} else {
					dataObject.deliveryChargesSum = 0;
					dataObject.delyDiscount		 = 0;
					dataObject.bookingTotalWithDelivery = dataObject.bookingAmount;
				}
				dataObject.ExcFrgtHamaliSt						= Math.round( dataObject.totalTaxWithDecimal+ dataObject.bookingAmount - (dataObject.lrFreight + dataObject.hamali + dataObject.StatisticalCharge) )						
				totalExcFrgtHamaliSt							+=	dataObject.ExcFrgtHamaliSt
				dataObject.totalExcFrgtHamaliSt					= Math.round(totalExcFrgtHamaliSt)
				
				lrGrandTotalWithDelivery += dataObject.bookingTotalWithDelivery
				dataObject.lrGrandTotalWithDelivery = lrGrandTotalWithDelivery
				srNo++;
				
				dataObject.bookingTypeName					= dataObj.bookingTypeName;
				dataObject.articleRateMultiple				= articleRateMultiple;
				dataObject.articleQuantityMultiple			= articleQuantityMultiple;
				dataObject.articleTypeMultiple				= articleTypeMultiple;
				dataObject.articleFreightForFormate5		= articleFreightForFormate5
				dataObject.articleQtyForFormate4			= articleQtyForFormate4;
				dataObject.articleRateForFromate5			= articleRateForFromate5;
				dataObject.articleRateForFromate4			= articleRateForFromate4;
				dataObject.articleRateMultipleCommaSeperated= articleRateMultipleCommaSeperated;
				dataObject.freightWithDecimal				= Math.round(dataObject.freight).toFixed(2);
				dataObject.articleTypeMultipleFormate5		= articleTypeMultipleFormate5;
				dataObject.articleQtyForFormate5			= articleQtyForFormate5;
				dataObject.freightforPanindia				= dataObject.freight;
				dataObject.articalRateforPanindia			= articalRateforPanindia;
				dataObject.articalRateforSES				= articalRateforSES; 

				if(wayBillBookingTax.length){
					if( wayBillBookingTax[0].taxMasterId == IGST_MASTER_ID){
						dataObject.gstPercent				= wayBillBookingTax[0].percentTaxAmount + '%';
					}else{
						dataObject.gstPercent				= wayBillBookingTax[0].percentTaxAmount*2 + '%';
					}
				}else{
					dataObject.gstPercent				= '5%'
				}				

				dataArray.push(dataObject);
			}
			return dataArray;
		}, getHeaderAndFooterObject : function(printHeaderModel, wayBillDetailsForPrintingBill) {
			
			var headerObject					= new Object();
			headerObject.name					= printHeaderModel.accountGroupName;
			headerObject.branchName				= printHeaderModel.branchName;
			headerObject.branchAddress			= printHeaderModel.branchAddress;
			headerObject.branchPhoneNumber		= printHeaderModel.branchPhoneNumber;
			headerObject.branchMobileNumber		= printHeaderModel.branchContactDetailMobileNumber;
			headerObject.branchMobileNumber2	= printHeaderModel.branchContactDetailMobileNumber2;
			headerObject.branchGSTN				= printHeaderModel.branchGSTN;
			headerObject.branchPanNumber		= printHeaderModel.branchPanNumber;
			headerObject.vehicleNumber			= printHeaderModel.vehicleNumber;
			headerObject.showVehicleNumber		= printHeaderModel.showVehicleNumber;
			headerObject.branchContactDetailEmailAddress		= printHeaderModel.branchContactDetailEmailAddress;
			headerObject.destinationBranch		= wayBillDetailsForPrintingBill[0].destinationBranch;
			headerObject.sourceBranch			= wayBillDetailsForPrintingBill[0].sourceBranch;
			headerObject.branchDisplayName			= printHeaderModel.branchDisplayName;
			headerObject.companyGstNumber			= printHeaderModel.companyGstNumber;
			headerObject.branchContactDetailPhoneNumber		= printHeaderModel.branchContactDetailPhoneNumber;
			headerObject.branchContactDetailPhoneNumber2	= printHeaderModel.branchContactDetailPhoneNumber2;
			
			return headerObject;
		}, getBillData : function(BillDetailsForPrintingBill, corporateAccount, unAddedTaxAmount, BillDetailsForBillClearance, configuration, billTotalInWords, preBillTotalInWords, wayBillDetailsForPrintingBill){
			var totalBillClearenceAmount	= 0;
			var prevBillNumber				= 0;
		
			var billObject						= BillDetailsForPrintingBill;
			billObject.grandTotalRound			= Math.round(BillDetailsForPrintingBill.grandTotal);
			billObject.grandTotalDecimal		= BillDetailsForPrintingBill.grandTotal.toFixed(2);
			billObject.totalTax					= BillDetailsForPrintingBill.taxOnBill;
			billObject.totalTaxRoundOff			= Math.round(BillDetailsForPrintingBill.taxOnBill);
			billObject.totalExcludingtax		= BillDetailsForPrintingBill.grandTotal - BillDetailsForPrintingBill.taxOnBill;
			billObject.billRemark				= BillDetailsForPrintingBill.remark;
			billObject.billRemarkDash 			= BillDetailsForPrintingBill.remark || '--'; 

			if(corporateAccount != undefined)
				billObject.corporateAccountName		= corporateAccount.corporateAccountName;
				
			billObject.grandTotalIncludeGST		= billObject.grandTotal + billObject.additionalCharge + billObject.totalTax;
			billObject.unAddedTaxAmount			= unAddedTaxAmount;
			billObject.branchID					= BillDetailsForPrintingBill.branchId;
			billObject.roundOffAmount			= Math.abs((BillDetailsForPrintingBill.grandTotal.toFixed(2) - Math.round(BillDetailsForPrintingBill.grandTotal)).toFixed(2));
			billObject.roundOffAmountWithSign	= (Math.round(BillDetailsForPrintingBill.grandTotal) - BillDetailsForPrintingBill.grandTotal.toFixed(2)  ).toFixed(2);
			billObject.customCreationDateTimeStampStr	= BillDetailsForPrintingBill.customCreationDateTimeStampStr;
			billObject.collectionPreson			= BillDetailsForPrintingBill.collectionPerson;
			billObject.pdlGrandTotal			= BillDetailsForPrintingBill.additionalCharge + BillDetailsForPrintingBill.grandTotal;
			billObject.grandTotalWithTaxAndAdditionalCharge	 = Math.round(billObject.grandTotal + billObject.additionalCharge);
			billObject.grandTotalWithTaxAndAdditionalWithDecimal= billObject.grandTotal + billObject.additionalCharge;
			billObject.grandTotalWithTaxAndAdditionalChargeInDecimal	 = Math.round(billObject.grandTotal + billObject.additionalCharge).toFixed(2);
			billObject.billTotalInWords				= billTotalInWords;
			billObject.preBillTotalInWords			= preBillTotalInWords;
			billObject.sourceBranchWithState		= wayBillDetailsForPrintingBill[0].sourceBranch + "( " + wayBillDetailsForPrintingBill[0].sourceBranchState +" )"
			billObject.destinationBranchWithState	= wayBillDetailsForPrintingBill[0].destinationBranch + "( " + wayBillDetailsForPrintingBill[0].destinationBranchState +" )"
			billObject.ftlBookingVehicleNumber		= wayBillDetailsForPrintingBill[0].ftlBookingVehicleNumber;
			billObject.consigneePincode				= wayBillDetailsForPrintingBill[0].consigneePincode;
			billObject.destBranchAddress			= wayBillDetailsForPrintingBill[0].destBranchAddress;
			billObject.destBranchAddressPincode		= wayBillDetailsForPrintingBill[0].destBranchAddressPincode;
			billObject.destBranchEmailAddress		= wayBillDetailsForPrintingBill[0].destBranchEmailAddress;
			billObject.destBranchPhoneNumber1		= wayBillDetailsForPrintingBill[0].destBranchPhoneNumber1;
			billObject.wayBillTypeId				= wayBillDetailsForPrintingBill[0].wayBillTypeId;
			billObject.deliveryAmount				= wayBillDetailsForPrintingBill[0].deliveryAmount;
			billObject.billSubRegionId				= BillDetailsForPrintingBill.billSubRegionId;
			billObject.sourceBranchPhoneNumber1		= wayBillDetailsForPrintingBill[0].sourceBranchPhoneNumber1;
			billObject.sourceBranchGSTN				= wayBillDetailsForPrintingBill[0].sourceBranchGSTN;
			billObject.emailAddress					= wayBillDetailsForPrintingBill[0].emailAddress;
			billObject.destinationBranchGSTN				= wayBillDetailsForPrintingBill[0].destinationBranchGSTN;
			
			if(configuration.printOutStandingAmount) {
				if(BillDetailsForBillClearance != undefined) {
					var columnArray		= new Array();
					
					for(const element of BillDetailsForBillClearance) {
						var prevBillDetails = element;
						
						if(prevBillDetails != undefined) {
							if(prevBillDetails.billId != BillDetailsForPrintingBill.billId) {
								totalBillClearenceAmount += prevBillDetails.balAmount;
								billObject.totalBillClearenceAmount = totalBillClearenceAmount;
								prevBillNumber	= prevBillDetails.billNumber;
								billObject.prevCreationDate	= prevBillDetails.creationDateTimeStampString;
								
								columnArray.push("<tr><td style='font-weight: bold; padding-left: 10px;'><span>Bill No:</span><span>"+prevBillDetails.billNumber+"</span>(<span>"+prevBillDetails.creationDateTimeStampString+"</span>) - <span>"+prevBillDetails.balAmount+"</span></td></tr>");
							} else {
								billObject.currentBillAmount = prevBillDetails.balAmount;
							}
						}
					}
					
					setTimeout(() => {
						$('#billClearenceTable').append(columnArray.join(' '));
					}, 500);
				
					if(typeof billObject.totalBillClearenceAmount == 'undefined')
						billObject.totalBillClearenceAmount = 0;
					
					if(typeof billObject.currentBillAmount == 'undefined')
						billObject.currentBillAmount = 0;
					
					billObject.totalAmnt = Math.round(Number(billObject.totalBillClearenceAmount) + Number(billObject.currentBillAmount));
					billObject.totalAmntWithoutRoundOff = (Number(billObject.totalBillClearenceAmount) + Number(billObject.currentBillAmount));
				}
			}
			
			billObject.prevBillNumber  = prevBillNumber;
			
			return billObject;
		}, setSrNumber : function(dataArray) {
			for(var i = 0; dataArray.length > i; i++) {
				dataArray[i].srNumber	= i + 1;
			}
			
			return dataArray;
		}
	});
});
function replaceSlash(str,oldChar,replaceChar) {
	var charArray = str.split('');

	for (var i = 0; i < charArray.length; i++) {
		if (charArray[i] === oldChar) {
			charArray[i] = replaceChar;
		}
	}

	return charArray.join('');
}