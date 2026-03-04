var PaymentTypeConstant = null,
isGroupAdmin1		= false,
isRegionAdmin		= false,
isSubRegionAdmin	= false,
isNormalUser		= false;
define(
		[
		 '/ivcargo/resources/js/generic/urlparameter.js',
		 'slickGridWrapper2',
		 PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js',
		 'JsonUtility',
		 'messageUtility',
		 'bootstrapSwitch',
		 'nodvalidation',
		 'focusnavigation',
		 PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
		 ],//PopulateAutocomplete
		 function(UrlParameter, slickGridWrapper2, Selection) {
			'use strict';
			var jsonObject = new Object(), myNod, _this,
							isRegion = false, isSubregion = false, isBranch = false, isGroupAdmin = false,branchId=0, showAllPendingRequest = false,showRejectRequest = false,
							srcBranchId,srcSubRegionId,srcRegionId,fromDate,toDate,toTime,onRechargeRequestFlag = false; 
			return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
					srcBranchId		 	= UrlParameter.getModuleNameFromParam('branch');
					srcRegionId		 	= UrlParameter.getModuleNameFromParam('region');
					srcSubRegionId	 	= UrlParameter.getModuleNameFromParam('subRegion');
					fromDate			= UrlParameter.getModuleNameFromParam('fromDate');
					toDate 				= UrlParameter.getModuleNameFromParam('toDate');
					onRechargeRequestFlag	= UrlParameter.getModuleNameFromParam('onRechargeRequestFlag');
					toTime				= UrlParameter.getModuleNameFromParam('toTime');
					this.$el.html(this.template);
				}, render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/rechargeRequestAndApprovedReportWS/getRechargeRequestReportElement.do?',	_this.renderRechargeRequestElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, renderRechargeRequestElements : function(response) {
					showLayer();
					var loadelement 	= new Array();
					var baseHtml 		= new $.Deferred();
					loadelement.push(baseHtml);
				
					$("#mainContent").load("/ivcargo/html/module/rechargeRequestAndApprovedReport/rechargeRequestAndApprovedReport.html",
							function() {
								baseHtml.resolve();
					});
					
					var executive				= response.executive;
					
					$.when.apply($, loadelement).done(function() {
						initialiseFocus();
						
						var keyObject 		= Object.keys(response);
						
						for (var i = 0; i < keyObject.length; i++) {
							if (response[keyObject[i]]) {
								$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
							}
						}
						
						isRegion						= response['region'];
						isSubregion						= response['subRegion'];
						isBranch						= response['branch'];
						
						response.sourceAreaSelection	= true;
						response.isCalenderSelection	= true;
						
						var elementConfiguration	= new Object();
						
						elementConfiguration.regionElement		= $('#regionEle');
						elementConfiguration.subregionElement	= $('#subRegionEle');
						elementConfiguration.branchElement		= $('#branchEle');
						elementConfiguration.dateElement		= $('#dateEle');
						
						response.elementConfiguration	= elementConfiguration;
						
						Selection.setSelectionToGetData(response);
						
						myNod = nod();
						
						if (executive.executiveType == EXECUTIVE_TYPE_GROUPADMIN) {
							isGroupAdmin = true;
							myNod.configure({
								parentClass:'validation-message'
							});
							
							if(isRegion) {
								myNod.add({
									selector		: '#regionEle',
									validate		: 'presence',
									errorMessage	: 'Select Region !'
								});
							}
							
							if(isSubregion) {
								myNod.add({
									selector		: '#subRegionEle',
									validate		: 'presence',
									errorMessage	: 'Select Sub-Region !'
								});
							}
							
							if(isBranch) {
								myNod.add({
									selector		: '#branchEle',
									validate		: 'presence',
									errorMessage	: 'Select Branch !'
								});
							}
							
								
							$('#dateSelection').show();
				        	$('#regionSel').show();
				        	$('#subRegionSel').show();
				        	$('#branchSel').show();
						}else{
							branchId					= executive.branchId;
						}
						
						hideLayer();
						
						if(response.showRejectRequest){
							showRejectRequest = true;
						}
						
						$('#dateSelection').show();
						$("#byDateEle").click(function() {
							if ($('#byDateEle').prop('checked')) {
								if (!isGroupAdmin) {
									branchId					= executive.branchId;
								}
								showAllPendingRequest = true;
								$('#dateSelection').hide();
								if (showRejectRequest && $('#byRejectEle').exists()){
									$('#byRejectEle').prop('checked',false) 
									$('#viewRejectRequest').hide();
								}
								
					        }else{
					        	$('#dateSelection').show();
					        	if (showRejectRequest && $('#byRejectEle').exists()){
									$('#byRejectEle').prop('checked',false) 
									$('#viewRejectRequest').show();
								}
					        }
							
						});
					
					if(showRejectRequest)
						$('#viewRejectRequest').css('display', 'inline');
					else
					  $('#viewRejectRequest').hide();
					  
					  $("#byRejectEle").click(function() {
							if ($('#byRejectEle').prop('checked')) {
								$('#dateSelection').show();
								$('#byDateEle').prop('checked',false) 
								showAllPendingRequest = false;
								$('#viewAllDueBills').hide();
					        } else {
								$('#viewAllDueBills').show();
								$('#dateSelection').show();
								showAllPendingRequest = false;
					         }
						});
					
						$("#findBtn").click(function() {
							myNod.performCheck();
							
							if(myNod.areAll('valid')) {
								_this.onFind(_this);
							}
						});
						
							isGroupAdmin1		= response.isGroupAdmin;
							isRegionAdmin		= response.isRegionAdmin;
							isSubRegionAdmin	= response.isSubRegionAdmin;	
							isNormalUser		= response.isNormalUser;

						if(onRechargeRequestFlag){
							var regionList = response.regionList;
							if(regionList != null ) {
								for(const element of regionList) {
									if(element.regionId == srcRegionId) {
										$("#regionEle").val(element.regionName);
										$('#regionEle_primary_key').val(element.regionId);
									}
								}
							}
							var cashStatementObj 	= 	new Object();

							cashStatementObj.isFromCashStatement	= true;
							cashStatementObj.regionId				= srcRegionId;
							cashStatementObj.subRegionId			= srcSubRegionId;
							cashStatementObj.branchId				= srcBranchId;
							cashStatementObj.subRegionEle			= $('#subRegionEle');
							cashStatementObj.branchEle				= $('#branchEle');
							cashStatementObj.isGroupAdmin			= isGroupAdmin1;
							cashStatementObj.isRegionAdmin			= isRegionAdmin;
							cashStatementObj.isSubRegionAdmin		= isSubRegionAdmin;
							cashStatementObj.isNormalUser			= isNormalUser;
							
							Selection.setDropDownForCashStatementLink(cashStatementObj);
							$('#subRegionEle_primary_key').val(srcSubRegionId);
							$('#branchEle_primary_key').val(srcBranchId);
							$("#dateEle").attr('data-startdate', fromDate);
							$("#dateEle").attr('data-enddate', toDate); 
							$('#dateEle').val(fromDate + " - " + toDate);
							_this.onSubmit();
						}
					});
				},onFind : function() {
					showLayer();
					var jsonObject 			= new Object();
					
					if($("#dateEle").attr('data-startdate') != undefined) {
						jsonObject["fromDate"] 	= $("#dateEle").attr('data-startdate'); 
					}

					if($("#dateEle").attr('data-enddate') != undefined) {
						jsonObject["toDate"] 	= $("#dateEle").attr('data-enddate'); 
					}
					
					jsonObject.regionId 				= $('#regionEle_primary_key').val();
					jsonObject.subRegionId				= $('#subRegionEle_primary_key').val();
					
					if(showAllPendingRequest && !isGroupAdmin)
						jsonObject.branchId					= branchId;
					else if(!isGroupAdmin)
						jsonObject.branchId					= branchId;
					else
						jsonObject.branchId					= $('#branchEle_primary_key').val();
					
					jsonObject["showAllPendingRequest"] = $('#byDateEle').prop('checked');
					jsonObject["showRejectRequest"]     = $('#byRejectEle').prop('checked');
					
					if(isNaN(parseInt(jsonObject.regionId))) {
						jsonObject.regionId 			= 0;
					}
					
					if(isNaN(parseInt(jsonObject.subRegionId))) {
						jsonObject.subRegionId			= 0;
					}
					
					if(isNaN(parseInt(jsonObject.branchId))) {
						jsonObject.branchId 			= 0;
					}
					
					getJSON(jsonObject, WEB_SERVICE_URL + '/rechargeRequestAndApprovedReportWS/getRechargeRequestAndApproveList.do', _this.setRechargeRequestData, EXECUTE_WITH_ERROR);
				},onSubmit : function(){
					showLayer();
					var jsonObject 			= new Object();
					
					jsonObject["showAllPendingRequest"] = $('#byDateEle').prop('checked');
					jsonObject["showRejectRequest"]     = $('#byRejectEle').prop('checked');
					jsonObject["fromDate"] 				= fromDate; 
					jsonObject["toDate"] 				= toDate; 
					jsonObject.regionId 				= srcRegionId;
					jsonObject.subRegionId				= srcSubRegionId;
					jsonObject.branchId					= srcBranchId;
					jsonObject.toTime					= toTime;
					jsonObject.onRechargeRequestFlag	= onRechargeRequestFlag;
					
					getJSON(jsonObject, WEB_SERVICE_URL + '/rechargeRequestAndApprovedReportWS/getRechargeRequestAndApproveList.do', _this.setRechargeRequestData, EXECUTE_WITH_ERROR);
				},setRechargeRequestData : function(response) {
					if(response.message != undefined) {
						hideLayer();
						let errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
						return;
					}
					
					if(response.CorporateAccount != undefined) {
						hideAllMessages();
						$('#bottom-border-boxshadow').show();
						response.tableProperties.callBackFunctionForPartial 	= _this.searchHistory;
						slickGridWrapper2.setGrid(response);
					}
					
					hideLayer();
				}, searchHistory : function(grid, dataView, row) {
					hideLayer();
					if(dataView.getItem(row).wayBillId != undefined) {
						//window.open ('viewDetails.do?pageId=340&eventId=2&modulename=viewPODStatusDetails&masterid='+dataView.getItem(row).wayBillId,'newwindow','left=300,top=100,width=600,height=350,toolbar=no,resizable=no,scrollbars=yes');
					}
				}
			});
});