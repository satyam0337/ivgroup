define(
		[
		 'slickGridWrapper2',
		 PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js',//PopulateAutocomplete
		 'JsonUtility',
		 'messageUtility',
		 'nodvalidation',
		 'focusnavigation',
		 PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'],
		 function(slickGridWrapper2, Selection) {
			'use strict';
			let jsonObject = new Object(), myNod, myNod1, _this, PODWaybillSelectionConstant;
			return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
					this.$el.html(this.template);
				}, render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/podStatusReportWS/getPodWayBillsStatusElement.do?',	_this.renderPodWayBillsElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, renderPodWayBillsElements : function(response) {
					showLayer();
					let loadelement 	= new Array();
					let baseHtml 		= new $.Deferred();
					loadelement.push(baseHtml);
				
					$("#mainContent").load("/ivcargo/html/report/podreport/podLrStatusReport/podWaybillsStatusDetails.html",
							function() {
								baseHtml.resolve();
					});
					
					PODWaybillSelectionConstant	= response.PODWaybillSelectionConstant;
					
					$.when.apply($, loadelement).done(function() {
						initialiseFocus();
						
						let keyObject 		= Object.keys(response);
					
						for (const element of keyObject) {
							if (!response[element])
								$("*[data-attribute="+ element+ "]").addClass("hide");
						}

						response.sourceAreaSelection	= true;
						response.isCalenderSelection	= true;
						
						let elementConfiguration	= new Object();
						
						elementConfiguration.regionElement		= $('#regionEle');
						elementConfiguration.subregionElement	= $('#subRegionEle');
						elementConfiguration.branchElement		= $('#branchEle');
						elementConfiguration.dateElement		= $('#dateEle');
						
						response.elementConfiguration	= elementConfiguration;
						response.isPhysicalBranchesShow	= true;
						
						Selection.setSelectionToGetData(response);
						
						myNod = nod();
						myNod1 = nod();
						
						myNod.configure({
							parentClass:'validation-message'
						});
						
						myNod1.configure({
							parentClass:'validation-message'
						});
						
						if(response.operationSelection) {
							$("*[data-attribute='partyName']").addClass("hide");
							
							let autoSelectionName 			= new Object();
							autoSelectionName.primary_key 	= 'selectionId';
							autoSelectionName.field 		= 'selectionName';
							autoSelectionName.callBack 		= _this.changeToGetData;
							$("#operationSelectionEle").autocompleteCustom(autoSelectionName);
							
							let autoSelectionNameInstance 	= $("#operationSelectionEle").getInstance();
	
							$(autoSelectionNameInstance).each(function() {
								this.option.source 			= response.selectionArr;
							});
							
							myNod.add({
								selector		: '#operationSelectionEle',
								validate		: 'presence',
								errorMessage	: 'Select Operation !'
							});
							
							myNod1.add({
								selector		: '#operationSelectionEle',
								validate		: 'presence',
								errorMessage	: 'Select Operation !'
							});
							
							if(response.viewSelection) {
								let viewSelectionName 			= new Object();
								viewSelectionName.primary_key 	= 'viewSelectionId';
								viewSelectionName.field 		= 'viewSelectionName';
								$("#viewByEle").autocompleteCustom(viewSelectionName);
								
								let viewSelectionNameInstance 	= $("#viewByEle").getInstance();
		
								$(viewSelectionNameInstance).each(function() {
									this.option.source 			= response.viewSelectionArr;
								});
								
								myNod.add({
									selector		: '#viewByEle',
									validate		: 'presence',
									errorMessage	: 'Select View By!'
								});
							}
						}
						
						if(response.region) {
							addAutocompleteElementInNode(myNod, 'regionEle', 'Select Region !');
							addAutocompleteElementInNode(myNod, 'subRegionEle', 'Select Sub-Region !');
							addAutocompleteElementInNode(myNod, 'branchEle', 'Select Branch !');
						}
							
						if(response.subRegion) {
							addAutocompleteElementInNode(myNod, 'subRegionEle', 'Select Sub-Region !');
							addAutocompleteElementInNode(myNod, 'branchEle', 'Select Branch !');
						}
							
						if(response.branch)
							addAutocompleteElementInNode(myNod, 'branchEle', 'Select Branch !');
						
						if(response.partySelection) {
							myNod1.add({
								selector		: '#partyNameEle',
								validate		: 'presence',
								errorMessage	: 'Select Party !'
							});
						}
						
						hideLayer();
						
						$("#findBtn").click(function() {
							if(response.operationSelection) {
								if($("#operationSelectionEle_primary_key").val() == PODWaybillSelectionConstant.BRANCH_SELECTION) {
									myNod.performCheck();
									
									if(myNod.areAll('valid'))
										_this.onFind();
								} else if($("#operationSelectionEle_primary_key").val() == PODWaybillSelectionConstant.PARTY_SELECTION) {
									myNod1.performCheck();
									
									if(myNod1.areAll('valid'))
										_this.onFind();
								}
							} else {
								myNod.performCheck();
									
								if(myNod.areAll('valid'))
									_this.onFind();
							}
						});
					});
				}, changeToGetData : function() {
					let selectionId			= $("#" + $(this).attr("id") + "_primary_key").val();

					if(parseInt(selectionId) == PODWaybillSelectionConstant.BRANCH_SELECTION) {//for Branch
						$("*[data-attribute='branchSelection']").addClass("show");
						$("*[data-attribute='partyName']").removeClass("show");
					} else if(selectionId == PODWaybillSelectionConstant.PARTY_SELECTION) { //for Party
						$("*[data-attribute='partyName']").addClass("show");
						$("*[data-attribute='branchSelection']").removeClass("show");
					}
				},onFind : function() {
					showLayer();
					let jsonObject 			= Selection.getElementData();
					
					jsonObject.operationSelection		= $('#operationSelectionEle_primary_key').val();
					jsonObject.viewSelection			= $('#viewByEle_primary_key').val();
					
					getJSON(jsonObject, WEB_SERVICE_URL + '/podStatusReportWS/getAllPodWayBillsForStatus.do', _this.setPODWayBillDetailsData, EXECUTE_WITH_ERROR);
				},setPODWayBillDetailsData : function(response) {
					hideLayer();

					if(response.message != undefined) {
						$('#bottom-border-boxshadow').addClass('hide');
						var errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
						return;
					}
					
					if(response.CorporateAccount != undefined) {
						hideAllMessages();
						$('#bottom-border-boxshadow').removeClass('hide');
						
						response.tableProperties.callBackFunctionForPartial 	= _this.searchHistory;
						
						slickGridWrapper2.setGrid(response);
					}
				}, searchHistory : function(grid, dataView, row) {
					hideLayer();
					if(dataView.getItem(row).wayBillId != undefined) {
						window.open ('viewDetails.do?pageId=340&eventId=2&modulename=viewPODStatusDetails&masterid='+dataView.getItem(row).wayBillId,'newwindow','left=300,top=100,width=600,height=350,toolbar=no,resizable=no,scrollbars=yes');
					}
				}
			});
});