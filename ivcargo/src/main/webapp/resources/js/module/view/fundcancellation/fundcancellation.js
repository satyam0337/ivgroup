define(
		[
		 'JsonUtility',
		 'messageUtility',
		 PROJECT_IVUIRESOURCES + '/resources/js/module/view/fundcancellation/fundCancellationfilepath.js',
		 'jquerylingua',
		 'language',
		 'autocomplete',
	     'autocompleteWrapper',
		 'bootstrapSwitch',
		 'nodvalidation',
		 'focusnavigation',
		 PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
		 '/ivcargo/resources/js/generic/urlparameter.js',
		 PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js',
		 'selectizewrapper',
		 '/ivcargo/resources/js/module/redirectAfterUpdate.js'
		 ],
		 function(JsonUtility, MessageUtility, FilePath, Lingua, Language, AutoComplete, AutoCompleteWrapper, BootstrapSwitch, NodValidation, FocusNavigation,
				 BootstrapModal,UrlParameter,Selection,Selectizewrapper) {
			'use strict';
			var myNod, _this = '' ,fundTransferNumber =0 ,falgWithOutSearch=true,btModalConfirm,centralizedFundCancellation =false,redirectFilter=0,branchId=0;
			return Marionette.LayoutView.extend({
				initialize : function(masterObj) {
					_this = this;
					fundTransferNumber 			= UrlParameter.getModuleNameFromParam('fundTransferNumber');
					redirectFilter				= UrlParameter.getModuleNameFromParam('redirectFilter');
					branchId					= UrlParameter.getModuleNameFromParam('branchId');
				}, render : function() {
					getJSON(null, WEB_SERVICE_URL	+ '/fundTransferWS/fundCancellationConfig.do?',	_this.renderfundCancellationElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, renderfundCancellationElements : function(response) {
					showLayer();
					let loadelement = new Array();
					let baseHtml 	= new $.Deferred();
					loadelement.push(baseHtml);
					
					$("#mainContent").load("/ivcargo/html/module/fundcancel/CancleFundTransfer.html",
							function() {
								baseHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						hideLayer();
						loadLanguageWithParams(FilePath.loadLanguage());
						refreshAndHidePartOfPage('right-border-boxshadow', 'hide');
						
						myNod = nod();
						
						myNod.configure({
							parentClass:'validation-message'
						});
						
						if(fundTransferNumber != undefined && fundTransferNumber != '' ){
							$('#fundTransferNumberEle').val(fundTransferNumber);
							_this.onFind();
							falgWithOutSearch = false;
						}
						
						myNod.add({
							selector		: '#fundTransferNumberEle',
							validate		: 'presence',
							errorMessage	: 'Enter Fund Transfer Number !'
						});
												
						if(falgWithOutSearch){
							$("#fundTransferNumberEle").keydown(function(e) {
								myNod.performCheck();
								if((e.which == $.ui.keyCode.ENTER || e.keyCode == $.ui.keyCode.ENTER)
									&& myNod.areAll('valid'))
									_this.getFundTransferDetails();
							});	
							
							$("#findBtn").click(function(){
								myNod.performCheck();
								if(myNod.areAll('valid'))
									_this.onFind();
							});
						}
							
					});
					
				},getFundTransferDetails: function(){
					var fundTransferNumberEle		= $('#fundTransferNumberEle').val();
						
					if(fundTransferNumberEle == '') {
						showMessage('info', iconForInfoMsg + ' Enter FundTransFer Number !');
						return false;
					}
					
					let jsonObject 					= new Object();
					let fundTransferNumber			= $('#fundTransferNumberEle').val();
					jsonObject.fundTransferNumber	= fundTransferNumber.replace(/\s+/g, "");
					
					$('#remark').val('');
					
					getJSON(jsonObject, WEB_SERVICE_URL + '/fundTransferWS/getFundTransferDetails.do', _this.setFundTransferDetails, EXECUTE_WITH_ERROR);
					showLayer();
				}, onFind : function() {
					showLayer();
					let jsonObject = new Object();
					let fundTransferNumber			= $('#fundTransferNumberEle').val();
					jsonObject.fundTransferNumber	= fundTransferNumber.replace(/\s+/g, "");
					$('#remark').val('');
					getJSON(jsonObject, WEB_SERVICE_URL + '/fundTransferWS/getFundTransferDetails.do', _this.setFundTransferDetails, EXECUTE_WITH_ERROR);
				},setFundTransferDetails : function(response) {
					hideLayer();
					
					let columnArray				= new Array();
					if(response.message != undefined) {
						var errorMessage = response.message;
						$('#fundTransferTable tbody').empty();
						$('#fundTransferDetailsDiv').addClass('hide');
						$('#fundTransferNumberEle').val('');
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						
						if(!falgWithOutSearch) {
							setTimeout(function(){
								window.close();
							 },2000);
						}
						
						hideLayer();
						return;
					}
					
					$('#fundTransferDetails').removeClass('hide');
					$('#right-border-boxshadow').addClass('show');
					$('#fundTransferDetailsDiv').removeClass('hide');
					$('#fundTransferTable tbody').empty();
									
					var fundTransferDetails			= response.FundTransfer;
					centralizedFundCancellation 	= response.centralizedFundCancellation;
					var fundTransferNumber 			= fundTransferDetails[0].fundTransferNumber;
					var fundTransferId 				= fundTransferDetails[0].fundTransferId;
					var showDropDown				= false;
					
					if(centralizedFundCancellation) {
						if(response.executiveType != EXECUTIVE_TYPE_EXECUTIVE) {
							showDropDown = true;
							$('#executiveEle').selectize()[0].selectize.destroy();
							$('.executiveDiv').removeClass('hide');
							Selectizewrapper.setAutocomplete({
								jsonResultList	: 	response.executiveList,
								valueField		:	'executiveId',
								labelField		:	'executiveName',
								searchField		:	'executiveName',
								elementId		:	'executiveEle',
								create			: 	false,
								maxItems		: 	1
							});
						}
					}
					
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>"+ fundTransferDetails[0].fundTransferNumber + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>"+ fundTransferDetails[0].dateTimeStampstr + "</td>");						
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>"+ fundTransferDetails[0].fromBranchName + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>"+ fundTransferDetails[0].toBranchName+ "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>"+ fundTransferDetails[0].paymentModeStr + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>"+ fundTransferDetails[0].amount + "</td>");
					columnArray.push("<td style='text-align: right; vertical-align:  middle;'>"+ fundTransferDetails[0].remark + "</td>");
					$('#fundTransferTable tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
					
					$("#cancelFuntransfer").bind("click", function() {
						_this.onCancel(fundTransferNumber,showDropDown, fundTransferId);
					});
					
					columnArray 		= [];
					fundTransferDetails = [];
				}, onCancel : function(fundTransferNumber, showDropDown, fundTransferId){
					var remark				= $('#remark').val();
					var executiveId			= $('#executiveEle').val();
					var jsonObject 			= {};
					
					if(centralizedFundCancellation && showDropDown) {
						if(executiveId == '') {
							showMessage('error', iconForInfoMsg + 'Please, Select Executive !');
							hideLayer();
							return false;
						}
						
						jsonObject.fundCancellationExecutiveId	= executiveId;
					}
				
					if(remark == '') {
						showMessage('error', iconForInfoMsg + 'Please Enter Remark !');
						hideLayer();
						return false;
					}
					
					btModalConfirm = new Backbone.BootstrapModal({
						content		: 	"Are you sure you want to Cancle Fund Transfer ?",
						modalWidth 	: 	30,
						title		:	'Fund Transfer Cancellation',
						okText		:	'YES',
						showFooter 	: 	true,
						okCloses	:	true
					}).open();
					
					jsonObject.fundTransferNumber			= fundTransferNumber;
					jsonObject.remark						= remark;
					jsonObject.redirectTo					= redirectFilter;
					jsonObject.branchId						= branchId;
					jsonObject.fundTransferId				= fundTransferId;
					
					btModalConfirm.on('ok', function() {
						showLayer()
						getJSON(jsonObject, WEB_SERVICE_URL + '/fundTransferWS/cancleFundTransfer.do', _this.responseAftercancelDDM, EXECUTE_WITH_ERROR);
					});
				}, responseAftercancelDDM : function(response) {
					hideLayer();
					
					if(redirectFilter > 0)
						redirectToAfterUpdate(response);
					else {
						showMessage('success', 'Fund Cancellation Successfully Done');
						refreshAndHidePartOfPage('right-border-boxshadow', 'hide');
						$('#fundTransferTable tbody').empty();
						$( "#cancelFuntransfer").unbind( "click" );
						$('#remark').val('');
						$('#fundTransferNumberEle').val('');
						
						btModalConfirm.close();
						setTimeout(function(){
							location.reload();
						 },50);
						hideLayer();
						return;
					}
				}
			});
});
