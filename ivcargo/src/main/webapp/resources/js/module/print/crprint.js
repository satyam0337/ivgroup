define(['JsonUtility',
        //jsonutility consist of ajax calls to send json object as an ajax hit to the url specified and get call back as specified
        'messageUtility',
        PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js',
        // to get parameter from url to send it to ws
        'jquerylingua',
        'language',
        PROJECT_IVUIRESOURCES+'/resources/js/generic/genericfunctions.js',
        ],
        function(JsonUtility, MessageUtility, UrlParameter, jquerylingua, language) {
	'use strict';// this basically give strictness to this specific js
	var 
	masterId = "0",
	jsonObject	= new Object(),
	isCrPdfAllow = false,
	isPdfExportAllow = false,
	multipleCrPrint = false,
	_this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(masterObj){
			//masterid is fetched and passed when the view is called and it is set to fetch it from webservice
			masterId 			= UrlParameter.getModuleNameFromParam(MASTERID)
			isCrPdfAllow		= UrlParameter.getModuleNameFromParam('isCrPdfAllow');
			isPdfExportAllow 	= UrlParameter.getModuleNameFromParam('isPdfExportAllow');
			multipleCrPrint 	= UrlParameter.getModuleNameFromParam('multipleCrPrint');
			
			if(isCrPdfAllow == null || isCrPdfAllow == 'null')
				isCrPdfAllow = false;
			
			if(isPdfExportAllow == null || isPdfExportAllow == 'null')
				isPdfExportAllow = false;
			
			if(multipleCrPrint == null || multipleCrPrint == 'null')
				multipleCrPrint = false;
			
			//initialize is the first function called on call new view()
			_this = this;
		}, render : function() {
			jsonObject.crId = masterId;

			if(multipleCrPrint == 'true')
				getJSON(jsonObject, WEB_SERVICE_URL + '/crPrintWS/getMultipleLrInSingleCRPrintByCRId.do?', _this.getResponseForMultiplePrint, EXECUTE_WITHOUT_ERROR);
			else
				getJSON(jsonObject, WEB_SERVICE_URL + '/crPrintWS/getCRPrintByCRId.do?', _this.getResponseForPrint, EXECUTE_WITHOUT_ERROR);

			return _this;
		}, getResponseForPrint : function(response) {
			hideLayer();
			
			var configuration	= response.configuration;
			
			require(['/ivcargo/resources/js/module/print/crprintsetup.js'], function(crprintsetup){
				require([crprintsetup.getConfiguration(configuration, response.crprintlist.billSelectionId),
				         crprintsetup.getFilePathForLabel(configuration)], function(View, FilePath) {

					_this.$el.html(_.template(View));
					
					crprintsetup.setHeaderDetails(response);
					crprintsetup.disableRightClick();
					crprintsetup.setConsignorname(response);

					crprintsetup.setCrDetails(response);

					crprintsetup.setConsignment(response);

					crprintsetup.setExecutiveDetails(response);

					crprintsetup.setCurrentDateTime(response);
					
					crprintsetup.setDeliveryCharges(response.wayBillDlyCharges, configuration, response);
					
					crprintsetup.setBookingCharges(response.wayBillBkgCharges, configuration, response);
					
					crprintsetup.setDataOnWayBillType(response);

					loadLanguageWithParams(FilePath.loadLanguage(configuration.crPrintType));
					
					if(configuration.allowCookiesBasedDifferentPrint)
						crprintsetup.checkCookieForPrint(isPdfExportAllow);
					
					crprintsetup.showPopUp(response, isPdfExportAllow);
					
					crprintsetup.setTaxDetails(response);

					crprintsetup.setBookingTaxDetails(response, configuration);
					
					crprintsetup.generatePdf(response, isCrPdfAllow, isPdfExportAllow);

					crprintsetup.setBranchWiseBankDetails(response.bankAccountList);
				})
			});
		}, getResponseForMultiplePrint : function(response) {
			hideLayer()
			require(['/ivcargo/resources/js/module/print/crprintsetup.js'], function(crprintsetup){
				require([crprintsetup.getConfiguration(response.configuration),
				         crprintsetup.getFilePathForLabel(response.configuration)], function(View, FilePath){

					_this.$el.html(_.template(View));
					crprintsetup.setMutipleCrDetails(response);
				})
			});
		}
	});
});