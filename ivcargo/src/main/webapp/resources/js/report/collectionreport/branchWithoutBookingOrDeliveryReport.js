define([
	'slickGridWrapper2'
	, PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js'
	,'JsonUtility'
	, 'messageUtility'
	, 'autocomplete'
	, 'autocompleteWrapper'
	, 'nodvalidation'
	, PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	, 'focusnavigation'//import in require.config
], function(slickGridWrapper2, Selection) {
	'use strict';
	let jsonObject = new Object(), _this = '';

	return Marionette.LayoutView.extend({
		initialize: function() {
			_this = this;
		}, render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/branchWithoutBookingOrDeliveryReportWS/getBranchWithoutBookingOrDeliveryReportElementConfiguration.do?', _this.getElementConfigDetails, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, getElementConfigDetails: function(response) {
			let loadelement = new Array();
			let baseHtml = new $.Deferred();

			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/report/collectionreport/branchWithoutBookingOrDeliveryReport.html", function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				$("*[data-selector=header]").html(response.reportName);
				
				let keyObject = Object.keys(response);
				
				for (let i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]])
						$("*[data-attribute=" + keyObject[i] + "]").removeClass("hide");
				}
				
				_this.setSelectType();

				let elementConfiguration = new Object();

				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');

				response.elementConfiguration 			= elementConfiguration;
				response.sourceAreaSelection			= true;
				response.isCalenderSelection			= response.date;
				
				Selection.setSelectionToGetData(response);

				let myNod = Selection.setNodElementForValidation(response);
			
				myNod.add({
					selector: '#searchTypeEle',
					validate: 'presence',
					errorMessage: 'Select Type !'
				});
				
				$("*[data-attribute=searchType]").find('label').append("<span data-attribute='red-color' style='color:red;font-size:20px;'>*</span>");

				hideLayer();

				$("#searchBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmit();
				});
			});
		}, setSelectType: function() {
			_this.setSelectTypeAutocompleteInstance();

			let autoSelectType = $("#searchTypeEle").getInstance();

			let SelectTYPE = [
				{ "selectTypeId": 1, "selectTypeName": "BOOKING" },
				{ "selectTypeId": 2, "selectTypeName": "DELIVERY" },
			]

			$(autoSelectType).each(function() {
				this.option.source = SelectTYPE;
			})
		}, setSelectTypeAutocompleteInstance: function() {
			let autoSelectTypeName = new Object();
			autoSelectTypeName.primary_key = 'selectTypeId';
			autoSelectTypeName.field = 'selectTypeName';
			$("#searchTypeEle").autocompleteCustom(autoSelectTypeName)
		}, onSubmit: function() {
			showLayer();
			jsonObject = Selection.getElementData();

			getJSON(jsonObject, WEB_SERVICE_URL + '/branchWithoutBookingOrDeliveryReportWS/getBranchWithoutBookingOrDeliveryReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}, setReportData: function(response) {
			hideLayer();
			
			if (response.message != undefined) {
				$('#middle-border-boxshadow').addClass('hide');
				return;
			}
			
			$('#middle-border-boxshadow').removeClass('hide');

			slickGridWrapper2.setGrid(response);

			hideLayer();
		}
	});
});