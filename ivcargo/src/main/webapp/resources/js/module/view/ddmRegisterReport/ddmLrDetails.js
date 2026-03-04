define([
	PROJECT_IVUIRESOURCES + '/resources/js/generic/urlparameter.js',
	'slickGridWrapper3'
	,'errorshow'
	,'JsonUtility'
	,'messageUtility'
	], function (UrlParameter,slickGridWrapper3) {
	'use strict';// this basically give strictness to this specific js
	let _this = '';

	return Marionette.LayoutView.extend({
		initialize: function(){
			_this 			= this;
		}, render: function() {
			let jsonObject = {
				deliveryRunSheetLedgerId: UrlParameter.getModuleNameFromParam('deliveryRunSheetLedgerId'),
				paymentType: UrlParameter.getModuleNameFromParam('type'),
			};
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/ddmRegisterReportWS/getDDMLrDetails.do', _this.setElementData, EXECUTE_WITH_ERROR);
			return _this;
		}, setElementData : function(response) {
			hideLayer();

			if(response.message != undefined) {
				$('#middle-border-boxshadow').addClass('hide');
				$('#bottom-border-boxshadow').addClass('hide');
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}

			let loadelement		= new Array();
			let baseHtml		= new $.Deferred();

			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/module/ddmRegisterReport/ddmRegisterLrDetails.html",function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				$('#middle-border-boxshadow').removeClass('hide');
				hideAllMessages();
				
				if (response.CorporateAccount != undefined && response.CorporateAccount.length > 0) {
					$('#bottom-border-boxshadow').removeClass('hide');
					$('#middle-border-boxshadow').removeClass('hide');

					let tableProperties = response.tableProperties;
					
					tableProperties.showPartialButton	= false;
					tableProperties.showCheckBox		= false;
					tableProperties.showPrintButton		= false;

					slickGridWrapper3.applyGrid({
						ColumnHead: _.values(response.columnConfiguration), // *compulsory // for table headers
						ColumnData: _.values(response.CorporateAccount), 	// *compulsory // for table's data
						Language: response.Language, 			// *compulsory for table's header row language
						tableProperties: tableProperties,
						SerialNo: [{						// optional field // for showing Row number
							showSerialNo: tableProperties.showSerialNumber,
							SearchFilter: false,	// for search filter on serial no
							ListFilter: false,	// for list filter on serial no
							title: "Sr No."
						}],
						NoVerticalScrollBar: false //optional for no vertical scrolling & if set true remove height attribute to Grid Div
					});
				}
			})
		}
	});
});
