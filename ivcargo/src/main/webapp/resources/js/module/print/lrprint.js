define([
		'marionette',
        '/ivcargo/resources/js/generic/urlparameter.js',
        PROJECT_IVUIRESOURCES+'/resources/js/module/print/lrprint/lrPrintCommon.js',
        'JsonUtility',
        //jsonutility consist of ajax calls to send json object as an ajax hit to the url specified and get call back as specified
        'messageUtility',
        'jquerylingua',
        'language',
        '/ivcargo/resources/js/generic/genericfunctions.js'
        ],
        function(Marionette, UrlParameter, LRPrintCommon) {
	'use strict';// this basically give strictness to this specific js
	let 
	masterId = "0",
	jsonObject	= new Object(),
	isRePrint,
	isLrPdfAllow = false,
	isPdfExportAllow = false,
    BOOKING_TYPE_SUNDRY_ID = 1,
	_this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function() {
			//masterid is fetched and passed when the view is called and it is set to fetch it from webservice
			masterId 			= UrlParameter.getModuleNameFromParam(MASTERID);
			isRePrint 			= UrlParameter.getModuleNameFromParam("isRePrint");
			isLrPdfAllow		= UrlParameter.getModuleNameFromParam('isLrPdfAllow');
			isPdfExportAllow 	= UrlParameter.getModuleNameFromParam('isPdfExportAllow');
			if(isLrPdfAllow == null || isLrPdfAllow == 'null')
				isLrPdfAllow = false;
			
			if(isPdfExportAllow == null || isPdfExportAllow == 'null')
				isPdfExportAllow = false;
			//initialize is the first function called on call new view()
			_this = this;
		}, render : function() {
			jsonObject.waybillId = masterId;
			jsonObject.isRePrint = isRePrint;
			
			let dataPrint		= JSON.parse(localStorage.getItem("lrDataPrint"));
			let pervwayBillId	= localStorage.getItem("wayBillId");
			
			if(dataPrint == null || typeof dataPrint == 'undefined' || _.isEmpty(dataPrint) || masterId != pervwayBillId)
				getJSON(jsonObject, WEB_SERVICE_URL + '/lrPrintWS/getLRPrintByWaybillId.do?', _this.getResponseForPrint, EXECUTE_WITHOUT_ERROR);
			else
				_this.getResponseForPrint(dataPrint);
			
			return _this;
		}, getResponseForPrint : function(responseOut) {
			hideLayer();
			let configuration 	= responseOut.configuration;
			let printFromDB 	= responseOut.printFromDB;
			let isSundryBooking = configuration.bookingTypeChange && responseOut.bookingTypeId == BOOKING_TYPE_SUNDRY_ID;
			isPdfExportAllow	= isPdfExportAllow == 'true' || isPdfExportAllow == true
			isLrPdfAllow		= isLrPdfAllow == 'true' || isLrPdfAllow == true

			let accountGroupObj = responseOut.PrintHeaderModel;
			
			localStorage.removeItem("lrDataPrint");
			localStorage.removeItem("wayBillId");
			
			let path	= '/ivcargo/resources/js/module/print/lrprint/' + responseOut.lrPrintType + '.js';
			
			if((accountGroupObj.accountGroupId == 226 //aakash
				|| accountGroupObj.accountGroupId == 291 //ARR
				|| accountGroupObj.accountGroupId == 262 //gowtham
				|| accountGroupObj.accountGroupId == 267 //jaypee
				|| accountGroupObj.accountGroupId == 316 //swagat
				|| accountGroupObj.accountGroupId == 414 //Sakar
				|| accountGroupObj.accountGroupId == 209 //NETC
				|| accountGroupObj.accountGroupId == 735 //Gurukrupa
				|| accountGroupObj.accountGroupId == 712 //SHREERAM
				|| accountGroupObj.accountGroupId == 255 //abbas
				|| accountGroupObj.accountGroupId == 385 //RGLPL
				|| accountGroupObj.accountGroupId == 772 //BATPS
				|| accountGroupObj.accountGroupId == 522 //NM
				|| accountGroupObj.accountGroupId == 698 //SRST
				|| accountGroupObj.accountGroupId == 690 //VLJL
				|| accountGroupObj.accountGroupId == 800 //VBL
				|| accountGroupObj.accountGroupId == 806 //network
				|| accountGroupObj.accountGroupId == 203 //maharaja
				|| accountGroupObj.accountGroupId == 442 //batco
				|| accountGroupObj.accountGroupId == 742 //SES
				|| accountGroupObj.accountGroupId == 710 //SRES
				|| accountGroupObj.accountGroupId == 685 //ml
				|| accountGroupObj.accountGroupId == 410 //puneethcargo
				|| accountGroupObj.accountGroupId == 634 //crs
				|| accountGroupObj.accountGroupId == 635 //CLS
				|| accountGroupObj.accountGroupId == 413 //sivasai
				|| accountGroupObj.accountGroupId == 418 //ACS
				|| accountGroupObj.accountGroupId == 675 //NBR
				|| accountGroupObj.accountGroupId == 645 //SFC
				|| accountGroupObj.accountGroupId == 695 //BTrance
				|| accountGroupObj.accountGroupId == 500 //srrr
				|| accountGroupObj.accountGroupId == 669 //APRIM
				|| accountGroupObj.accountGroupId == 670 //BARL
				|| accountGroupObj.accountGroupId == 616 //YGTC
				|| accountGroupObj.accountGroupId == 627 //Shahul
				|| accountGroupObj.accountGroupId == 628 //JKTC
				|| accountGroupObj.accountGroupId == 391 //SVRL
				|| accountGroupObj.accountGroupId == 545 //KKPS
				|| accountGroupObj.accountGroupId == 314 //samarth
				|| accountGroupObj.accountGroupId == 768 //ACCURATE
				|| accountGroupObj.accountGroupId == 804 //VKL
				|| accountGroupObj.accountGroupId == 835 //NRT
				|| accountGroupObj.accountGroupId == 846 //NRT
				|| accountGroupObj.accountGroupId == 855 //NRT
				|| accountGroupObj.accountGroupId == 873 //snrt
				|| accountGroupObj.accountGroupId == 861 //jbl
				|| accountGroupObj.accountGroupId == 884 //jht
				|| accountGroupObj.accountGroupId == 886 //SSMT
				|| accountGroupObj.accountGroupId == 883 //KRT
				|| accountGroupObj.accountGroupId == 842 //krls
				|| accountGroupObj.accountGroupId == 204 //KHTC
				|| accountGroupObj.accountGroupId == 869 //pcpl
				|| accountGroupObj.accountGroupId == 900 //GCTS
				|| accountGroupObj.accountGroupId == 907 //SVTC
				|| accountGroupObj.accountGroupId == 910 //SVMT
				|| accountGroupObj.accountGroupId == 915 //BSR
				|| accountGroupObj.accountGroupId == 717 //HKT
				|| accountGroupObj.accountGroupId == 725 //GMT
				|| accountGroupObj.accountGroupId == 928 //LDPS
				|| accountGroupObj.accountGroupId == 880 //MYTHRI
				|| accountGroupObj.accountGroupId == 922 //KALPAKA
				|| accountGroupObj.accountGroupId == 923 //K.T.C.
				|| accountGroupObj.accountGroupId == 223 //VISHAL
				|| accountGroupObj.accountGroupId == 935 //NAVIN
			) && urlExists(path) && configuration.isGroupSpecificLRPrintFile) {


				require([path, '/ivcargo/resources/js/module/print/lrprintsetup.js'], function(lrprintGroupsetup, lrprintsetup) {
					require(['text!' + lrprintsetup.getConfiguration(responseOut.lrPrintType, configuration, isPdfExportAllow, responseOut.billSelectionId, isSundryBooking),
						lrprintsetup.getFilePathForLabel()], function(View, FilePath) {
					
					_this.$el.html(_.template(View));
					
					console.log(accountGroupObj.accountGroupId)
					
					_this.setCommonLrDetails(lrprintsetup, responseOut, FilePath);
					
					let showPopup	= lrprintsetup.isShowPopUp(responseOut, printFromDB);
					
					if(showPopup)
						lrprintGroupsetup.showPopUp(responseOut, isPdfExportAllow, printFromDB);
					else if (!configuration.isQRPrintOnPopUpSelection)
						lrprintGroupsetup.printWindow(isPdfExportAllow);
						
					try {
						lrprintGroupsetup.setQRDetails(responseOut);
					} catch(e) {}
					
					if(!configuration.sendMailOnCheckBoxChecked) {
						let lsPrint	= new LRPrintCommon();
						lsPrint.generatePdf(responseOut, isLrPdfAllow, isPdfExportAllow);
					}
					
					hideLayer();
				})
				});
			} else if(urlExists(path) && configuration.isGroupSpecificLRPrintFile) {
				require([path], function(lrprintsetup) {
					responseOut.printFromDB = printFromDB;
					responseOut.isPdfExportAllow = isPdfExportAllow;
					lrprintsetup.renderElements(responseOut);
						
					let lsPrint	= new LRPrintCommon();
					lsPrint.generatePdf(responseOut, isLrPdfAllow, isPdfExportAllow);
					
					setCompanyLogos(accountGroupObj.accountGroupId);
						
					hideLayer();
				});
			} else {
				require(['/ivcargo/resources/js/module/print/lrprintsetup.js'], function(lrprintsetup) {
					require(['text!' + lrprintsetup.getConfiguration(responseOut.lrPrintType, configuration, isPdfExportAllow, responseOut.billSelectionId, isSundryBooking),
						lrprintsetup.getFilePathForLabel()], function(View, FilePath) {
					
					_this.$el.html(_.template(View));
					
					_this.setCommonLrDetails(lrprintsetup, responseOut, FilePath);
					lrprintsetup.setQRDetails(responseOut);
					lrprintsetup.showPopUp(responseOut, isPdfExportAllow, printFromDB);
					
					let lsPrint	= new LRPrintCommon();
					lsPrint.generatePdf(responseOut, isLrPdfAllow, isPdfExportAllow);
				})
			});
			}
		}, setCommonLrDetails : function(lrprintsetup, responseOut, FilePath) {
			lrprintsetup.setHeaderDetails(responseOut);
			lrprintsetup.setConsignorname(responseOut);
			lrprintsetup.setLrDetails(responseOut);
			lrprintsetup.setConsignment(responseOut);
			lrprintsetup.setExecutiveDetails(responseOut);
			lrprintsetup.setCurrentDateTime(responseOut);
			lrprintsetup.setDataOnWayBillType(responseOut);
			loadLanguageWithParams(FilePath.loadLanguage(responseOut.lrPrintType));
			lrprintsetup.hideChargesForConditions(responseOut);
			lrprintsetup.setGstTaxDetails(responseOut);
			lrprintsetup.setBranchDetails(responseOut);
			lrprintsetup.setBlankOrZeroCharge(responseOut);
		}
	});
});