define(['marionette'
        ,'/ivcargo/resources/js/generic/urlparameter.js'
        ,'JsonUtility',
        //jsonutility consist of ajax calls to send json object as an ajax hit to the url specified and get call back as specified
        'messageUtility',
        'jquerylingua',
        'language',
        '/ivcargo/resources/js/generic/genericfunctions.js',
        ],
        function(Marionette, UrlParameter) {
	'use strict';// this basically give strictness to this specific js
	var masterId = 0,
	jsonObject	= new Object(),
	isRePrint,
	isLrPdfAllow = false,
	isPdfExportAllow = false,
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
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/crPrintWS/tranceCRPrint.do?',_this.getData, EXECUTE_WITHOUT_ERROR);
			isPdfExportAllow	= isPdfExportAllow == 'true' || isPdfExportAllow == true
			isLrPdfAllow		= isLrPdfAllow == 'true' || isLrPdfAllow == true
		
		}, getData : function (responseOut){

			require(['/ivcargo/resources/js/module/print/tceCrPrintSetup.js'], function(crprintsetup) {
					require(['text!' + crprintsetup.getConfiguration(),
				    crprintsetup.getFilePathForLabel()], function(View, FilePath) {
					_this.$el.html(_.template(View));
					crprintsetup.setHeader(responseOut);
					crprintsetup.setLRDetails(responseOut);
					crprintsetup.setConsignee(responseOut.ConsigneeDetails);
					crprintsetup.setConsignor(responseOut.ConsignorDetails);
					crprintsetup.setConsignmentDts(responseOut.CONSIGNMENTDETAILS);
					crprintsetup.setCharge(responseOut);
					crprintsetup.setFooter(responseOut)
					
					setTimeout(function() {
						window.print();
					}, 200);
				})
			});

		}
	});
});