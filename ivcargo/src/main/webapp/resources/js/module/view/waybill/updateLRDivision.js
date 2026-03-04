define(['marionette'
	, '/ivcargo/resources/js/generic/urlparameter.js'
	, PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	, 'JsonUtility'
	, 'messageUtility'
	, 'nodvalidation'
	, 'focusnavigation',
	'/ivcargo/resources/js/module/redirectAfterUpdate.js',
],
	function(Marionette, UrlParameter, Selection) {
		'use strict';// this basically give strictness to this specific js
		let jsonObject = new Object(), wayBillId, currentDivisionId,
			_this = '';
		//this is used to get the access of key in onRender because this keyword is not found in onRender function
		return Marionette.LayoutView.extend({
			initialize: function() {
				//initialize is the first function called on call new view()
				_this = this;
				wayBillId = UrlParameter.getModuleNameFromParam(MASTERID);
				jsonObject.waybillId = wayBillId;
			}, render: function() {
				getJSON(jsonObject, WEB_SERVICE_URL + '/updateLRDivisionWS/getPreviousDivisionToUpdate.do?', _this.renderUpdateDivision, EXECUTE_WITHOUT_ERROR);
				return _this;
			}, renderUpdateDivision: function(response) {
				let loadelement = new Array();
				let baseHtml = new $.Deferred();
				loadelement.push(baseHtml);

				$("#mainContent").load("/ivcargo/html/module/waybill/update/updateLRDivision.html", function() {
					baseHtml.resolve();
				});

				$.when.apply($, loadelement).done(function() {
					currentDivisionId	= response.divisionId;
					
					response.divisionSelection = true;
					
					let elementConfiguration = {};
					
					elementConfiguration.divisionElement = $('#divisionEle');
					
					response.elementConfiguration		= elementConfiguration;

					response.AllOptionForDivision		= false;

					Selection.setSelectionToGetData(response);

					$("#saveBtn").click(() => {
						const selectedId = $("#divisionEle_primary_key").val();
						
						if (selectedId === currentDivisionId) {
							showAlertMessage('error', 'Please Select Different Division');
							return false;
						}
						
						_this.updateAdditionalRemark();
					});
					
					hideLayer();
				});
			}, updateAdditionalRemark: function() {
				let jsonObject = new Object();

				jsonObject.previousDivisionId	= currentDivisionId;
				jsonObject.divisionId			= $("#divisionEle_primary_key").val();
				jsonObject.waybillId			= wayBillId;

				showLayer();
				getJSON(jsonObject, WEB_SERVICE_URL + '/updateLRDivisionWS/updateDivision.do?', _this.redirectToPage, EXECUTE_WITHOUT_ERROR);
			}, redirectToPage: function(response) {
				redirectToAfterUpdate(response);

				hideLayer();
			}
		});
	});