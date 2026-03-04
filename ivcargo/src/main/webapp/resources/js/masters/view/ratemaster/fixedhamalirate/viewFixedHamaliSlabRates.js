var branchId = 0, partyId = 0;
define(
		[
			'slickGridWrapper2',
			PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js',
			'JsonUtility',
			'messageUtility',
			'bootstrapSwitch',
			PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'],
			function(slickGridWrapper2, UrlParameter) {
			'use strict';
			var jsonObject = new Object(), _this = '';
			return Marionette.LayoutView.extend({
				initialize : function() {
					branchId 		= UrlParameter.getModuleNameFromParam('branchId');
					partyId  		= UrlParameter.getModuleNameFromParam('partyId');
					
					_this = this;
				}, render : function() {
					jsonObject.sourceBranchId		= branchId;
					jsonObject.corporateAccountId	= partyId;

					showLayer();
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/rateMasterWS/getHamaliSlabWiseRates.do?', _this.setFixedPartyRates, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, setFixedPartyRates : function(response) {
					hideLayer();
					
					if(response.message != undefined) {
						var errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						setTimeout(function(){ window.close(); }, 1000);
						return;
					}
					
					var loadelement = new Array();
					var baseHtml 	= new $.Deferred();
					loadelement.push(baseHtml);

					$("#mainContent").load("/ivcargo/html/master/ratemaster/fixedpartyrate/FixedPartyChargesDetails.html",
							function() {
						baseHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						if(response.CorporateAccount != undefined && response.CorporateAccount.length > 0)
							slickGridWrapper2.setGrid(response);
					});
				}
			});
		});

function rateUpdate(grid, dataView, row) {
	
	var btModalConfirm = new Backbone.BootstrapModal({
		content		: 	"Are you sure you want to Update ?",
		modalWidth 	: 	30,
		title		:	'Update',
		okText		:	'YES',
		showFooter 	: 	true,
		okCloses	:	true
	}).open();

	btModalConfirm.on('ok', function() {
		var jsonObject = new Object();

		jsonObject["rateMasterId"] 		= dataView.getItem(row).rateMasterId;
		jsonObject["rate"] 				= dataView.getItem(row).rate;
		jsonObject["markForDelete"] 	= false;

		getJSON(jsonObject, WEB_SERVICE_URL+'/rateMasterWS/updateHamaliSlabWiseRate.do', rateUpdateAction, EXECUTE_WITH_ERROR); //submit JSON
	});	
}

function  rateUpdateAction(response) {
	var MyRouter = new Marionette.AppRouter({});
	MyRouter.navigate('&dataUpdate='+true+'&dataDelete='+false);
	location.reload();
}

function rateDelete(grid, dataView, row) {
	var btModalConfirm = new Backbone.BootstrapModal({
		content		: 	"Are you sure you want to Delete ?",
		modalWidth 	: 	30,
		title		:	'Delete',
		okText		:	'YES',
		showFooter 	: 	true,
		okCloses	:	true
	}).open();

	btModalConfirm.on('ok', function() {
		var jsonObject = new Object();

		jsonObject["rateMasterId"] 		= dataView.getItem(row).rateMasterId;

		getJSON(jsonObject, WEB_SERVICE_URL+'/rateMasterWS/deleteHamaliSlabWiseRates.do', rateDeleteAction, EXECUTE_WITH_ERROR); //submit JSON
	});	
}

function rateDeleteAction(response) {
	var MyRouter = new Marionette.AppRouter({});
	MyRouter.navigate('&dataUpdate='+false+'&dataDelete='+true);
	location.reload();
}