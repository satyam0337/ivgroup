define(['marionette'
	, '/ivcargo/resources/js/generic/urlparameter.js'
	, 'JsonUtility'
	, 'messageUtility'
	, 'jquerylingua'
	, 'language'
	, 'nodvalidation'
	, 'focusnavigation',
	'/ivcargo/resources/js/module/redirectAfterUpdate.js',
],
	function(Marionette, UrlParameter) {
		'use strict';// this basically give strictness to this specific js
		var jsonObject = new Object(),
			wayBillId,
			myNod,
			_this = '';
		//this is used to get the access of key in onRender because this keyword is not found in onRender function
		return Marionette.LayoutView.extend({
			initialize: function() {
				//initialize is the first function called on call new view()
				_this = this;
				wayBillId = UrlParameter.getModuleNameFromParam(MASTERID);

				jsonObject.waybillId = wayBillId;
			}, render: function() {
				getJSON(jsonObject, WEB_SERVICE_URL + '/updateWayBillAdditionalRemarkWS/getDetailsToUpdate.do?', _this.renderUpdateWayBillAdditionalRemark, EXECUTE_WITHOUT_ERROR);
				return _this;
			}, renderUpdateWayBillAdditionalRemark: function(response) {
				var loadelement = new Array();
				var baseHtml = new $.Deferred();
				loadelement.push(baseHtml);

				$("#mainContent").load("/ivcargo/html/module/waybill/update/updateWayBillAdditionalRemark.html",
					function() {
						baseHtml.resolve();
					});

				$.when.apply($, loadelement).done(function() {
					//loadLanguageWithParams(FilePath.loadLanguage());

					myNod = nod();
					myNod.configure({
						parentClass: 'validation-message'
					});

					myNod.add({
						selector: '#additionalRemarkEle',
						validate: 'presence',
						errorMessage: 'Insert Additional Remark !'
					});

					$('#additionalRemarkEle').val(response.previousAdditionalRemark);

					hideLayer();

					$(".saveBtn").click(function() {
						myNod.performCheck();

						if (myNod.areAll('valid'))
							_this.updateAdditionalRemark();
					});
				});
			}, updateAdditionalRemark: function() {
				var jsonObject = new Object();

				jsonObject.additionalRemark = $('#additionalRemarkEle').val();
				jsonObject.waybillId 		= wayBillId;

				showLayer();
				getJSON(jsonObject, WEB_SERVICE_URL + '/updateWayBillAdditionalRemarkWS/updateWayBillAdditionalRemark.do?', _this.redirectToPage, EXECUTE_WITHOUT_ERROR);
			}, redirectToPage: function(response) {
				redirectToAfterUpdate(response);

				hideLayer();
			}
		});
	});