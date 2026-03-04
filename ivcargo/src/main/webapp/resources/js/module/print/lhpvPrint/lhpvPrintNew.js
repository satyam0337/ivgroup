define([
	PROJECT_IVUIRESOURCES + '/resources/js/generic/urlparameter.js',
	'JsonUtility',
	'messageUtility',
	'jquerylingua',
	'language'
], function(UrlParameter) {
	'use strict';
	let _this;

	return Marionette.LayoutView.extend({
		initialize: function() {
			_this = this;
		}, render: function() {
			let jsonObject = {
				lhpvId: UrlParameter.getModuleNameFromParam(MASTERID),
				typeOfLhpvId: UrlParameter.getModuleNameFromParam("typeOfLhpvId")
			};

			getJSON(jsonObject, WEB_SERVICE_URL + '/lhpvPrintWS/getLhpvPrintData.do?', _this.setLhpvPrintData, EXECUTE_WITH_ERROR);
			return _this;
		}, setLhpvPrintData: function(response) {
			hideLayer();
			
			let flavourName	= response.lhpvPrintFlavor;

			let htmlPath = '/ivcargo/html/print/lhpvPrint/' + flavourName + '.html';

			if (!urlExists(htmlPath))
				htmlPath = '/ivcargo/html/print/lhpvPrint/lhpvPrint_default.html';

			let setupPath = '/ivcargo/resources/js/module/print/lhpvPrint/'+ flavourName + '.js';
			
			if (!urlExists(setupPath))
				setupPath = '/ivcargo/resources/js/module/print/lhpvPrint/lhpvPrint_default.js';
			
			let setupEngb = '/ivcargo/resources/data/languages/print/lhpvPrint/'+ flavourName + '-en-GB.txt';
			
			if (!urlExists(setupEngb))
				flavourName	= 'lhpvPrint_default';
				
			require([setupPath], function(lhpvPrintSetup) {
				let templatePath	= _this.getConfiguration(htmlPath);
				let labelPath		= _this.getFilePathForLabel(response);

				require([templatePath, labelPath], function(View, FilePath) {
					_this.$el.html(_.template(View));
					loadLanguageWithParams(FilePath.loadLanguage(flavourName));
					lhpvPrintSetup.setData(response);
					_this.setHeaderDetails(response);
				});
			});
		}, getConfiguration: function(htmlPath) {
			return 'text!' + htmlPath;
		}, getFilePathForLabel: function() {
			return '/ivcargo/resources/js/module/print/lhpvPrint/lhpvPrintNewFilePath.js';
		}, setHeaderDetails: function(response) {
			let headerModel = response.PrintHeaderModel;
					
			if (headerModel.imagePath) {
				$(".headerType3").removeClass("hide")
				$(".headerType3 img").attr("src", "/ivcargo/" + headerModel.imagePath)
			} else if (response.configuration.showCompanyLogo)
				$(".headerType1").removeClass("hide")
			else
				$(".headerType2").removeClass("hide")

			$("[data-account='name']").html(headerModel.accountGroupName)
			$("[data-account='branchAddress']").html(headerModel.branchAddress)
			$("[data-account='branchMobileNumbers']").html(headerModel.branchMobileNumbers)
			$("[data-account='branchPhoneNumbers']").html(headerModel.branchPhoneNumber + "/" + headerModel.branchContactDetailPhoneNumber2)
			$("[data-account='companyEmailAddress']").html(headerModel.companyEmailAddress	)
			$("[data-account='branchGSTN']").html(headerModel.branchGSTN)
			$("[data-account='companyGstn']").html(headerModel.companyGstNumber)
			$("[data-account='executive']").html(response.executive)
			
			setCompanyLogos(headerModel.accountGroupId);
			
			if(response.configuration.showCompanyLogo) {
				$('.companyLogoCell').show()
				$('.companyLogo').show()
			}
		}
	});
});
