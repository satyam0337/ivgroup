define(
		[
			'JsonUtility',
			'messageUtility',
			PROJECT_IVUIRESOURCES + '/resources/js/module/view/editreservelrbooking/editreservelrbookingfilepath.js',
			'jquerylingua',
			'language',
			'autocomplete',
			'autocompleteWrapper',
			PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js',
			'bootstrapSwitch',
			'slickGridWrapper2',
			'nodvalidation',
			'focusnavigation',
			PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
			'/ivcargo/resources/js/module/redirectAfterUpdate.js'
			],
			function(JsonUtility, MessageUtility, FilePath, Lingua, Language, AutoComplete,AutoCompleteWrapper,
					UrlParameter, BootstrapSwitch, slickGridWrapper2, NodValidation, FocusNavigation,BootstrapModal,redirectURL) {
			'use strict';
			var jsonObject = new Object()
			,waybillId = "0"
				, myNod
				, masterLangObj
				, masterLangKeySet
				, gridObject
				,  _this;

			return Marionette.LayoutView.extend({
				initialize : function() {
					waybillId = UrlParameter.getModuleNameFromParam(MASTERID)
					_this = this;
					this.$el.html(this.template);
				}, render : function() {
					_this.setEditReserveBookingElement()
					return _this;
				}, setEditReserveBookingElement : function() {

					var loadelement = new Array();
					var baseHtml 	= new $.Deferred();

					loadelement.push(baseHtml);

					$("#mainContent").load("/ivcargo/html/module/editreservelrbooking/EditReserveLRBooking.html",function() {
						baseHtml.resolve();
					});

					$.when.apply($, loadelement).done(function() {
						initialiseFocus();

						masterLangObj 		= FilePath.loadLanguage();
						masterLangKeySet 	= loadLanguageWithParams(masterLangObj);

						hideLayer();

						myNod = nod();

						myNod.configure({
							parentClass:'validation-message'
						});

						myNod.add({
							selector: '#remarkEle',
							validate: 'presence',
							errorMessage: 'Enter Remark !'
						});

						$("#confirmBtn").click(function() {
							myNod.performCheck();
							if(myNod.areAll('valid')){
								_this.onUpdate(_this);								
							}
						});
					});
				},onUpdate : function() {
					
					showLayer();

					jsonObject["remark"] 			= $('#remarkEle').val();
					jsonObject["waybillId"] 		= waybillId;

					getJSON(jsonObject, WEB_SERVICE_URL+'/editReserveBookingWS/updateReserveBookingDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
				},setReportData : function(response) {
					console.log("response After update : " , response);
					redirectToAfterUpdate(response);
				}
			});
		});