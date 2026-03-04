define(
		[
			'slickGridWrapper2',
			PROJECT_IVUIRESOURCES+'/resources/js/module/view/saidtocontainmaster/consignmentDetails.js',
			'selectizewrapper',
			PROJECT_IVUIRESOURCES+'/resources/js/module/view/saidtocontainmaster/partySaidtoContainMappingViewAll.js',
			'JsonUtility',
			'messageUtility',
			'autocomplete',
			'autocompleteWrapper',
			'bootstrapSwitch',
			 'nodvalidation',
			PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
		], function(slickGridWrapper2, Details, Selectizewrapper, PartySaidtoContainMappingViewAll) {
			'use strict';
			let jsonObject = new Object(), _this = '', jsonData, gridObject, myNod, mynod2,tableRow=null,checkboxcount=10, partySaidToContainMappingMaster = false;
		return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
				}, render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL+ '/consignmentGoodsWS/getSaidToContainTabs.do?',_this.renderSaidToContainMasterTabs, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, renderSaidToContainMasterTabs : function(response) {
					hideLayer();
					
					let loadelement = new Array();
					let baseHtml 	= new $.Deferred();
					
					loadelement.push(baseHtml);
					$("#mainContent").load("/ivcargo/html/module/saidToContainMaster/SaidToContainMaster.html",
							function() {
						baseHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						jsonData	= response;
						
						partySaidToContainMappingMaster = response.partySaidToContainMappingMaster ;
						
						if (response.partySaidToContainMappingMaster)
  							$('li[data-attribute="partySaidToContainMappingTab"]').removeClass('hide');

						let keyObject = Object.keys(response);
					
						for (const element of keyObject) {
							if (response[element])
								$("*[data-attribute=" + element + "]").removeClass("hide");
						}
						
						_this.renderSaidToContainMasterAddTabElements();
						
						$('#add').on('click',function() {
							$("#editTab").empty();
							$("#viewTab").empty();
							$("#partySaidToContainMappingTab").empty();
							_this.renderSaidToContainMasterAddTabElements();
						});
						
						$('#edit').on('click',function() {
							$("#addNewTab").empty();
							$("#viewTab").empty();
							$("#partySaidToContainMappingTab").empty();
							_this.renderSaidToContainMasterEditTabElements();
						});
						
						$('#view').on('click',function() {
							$("#addNewTab").empty();
							$("#editTab").empty();
							$("#partySaidToContainMappingTab").empty();
							_this.renderSaidToContainMasterViewTabElements();
						});
					
						if(partySaidToContainMappingMaster) {
							$('#saidToContainMapping').on('click',function() {
								$("#addNewTab").empty();
								$("#editTab").empty();
								$("#viewTab").empty();
								_this.renderPartySaidToContainMasterMappingTabElements();
							});
						}
						
						$('#saidToContainMasterTab a').click(function(e) {
							e.preventDefault();
							$(this).tab('show');
						});
						
						$(function() {
							$('#saidToContainMasterTab a:first').tab('show');
						});
					});
				}, renderSaidToContainMasterAddTabElements : function() {
					let loadaddelement 	= new Array();
					let addNewHtml 		= new $.Deferred();
					loadaddelement.push(addNewHtml);

					$("#addNewTab").load("/ivcargo/html/module/saidToContainMaster/saidToContainMasterTabElements/addTabElements.html",
							function() {
						addNewHtml.resolve();
					});
	
					hideLayer();

					$.when.apply($, loadaddelement).done(function() {
						let keyObject = Object.keys(jsonData);
						
						for (const element of keyObject) {
							if (jsonData[element])
								$("*[data-attribute=" + element + "]").removeClass("hide");
						}
						
						if(jsonData.generateInsuranceForBooking) {
							$("#hsnCodeDiv").removeClass("hide");
							$("#hsnCodeNameDiv").removeClass("hide");
						}

						hideLayer();
						
						$("#hsnCodeEle").blur(function(event) {
							_this.getSaidToContainOnHSNCode();
						});
						
						$("#saveBtn").click(function() {
							_this.onSubmit();
						});
					});
				}, renderSaidToContainMasterEditTabElements : function() {
					let loadeditelement = new Array();
					let editNewHtml 	= new $.Deferred();
					loadeditelement.push(editNewHtml);

					$("#editTab").load("/ivcargo/html/module/saidToContainMaster/saidToContainMasterTabElements/editTabElements.html",
							function() {
						editNewHtml.resolve();
					});

					hideLayer();

					$.when.apply($, loadeditelement).done(function() {
						let keyObject = Object.keys(jsonData);
						
						for (const element of keyObject) {
							if (jsonData[element])
								$("*[data-attribute=" + element + "]").removeClass("hide");
						}
						
						if(jsonData.generateInsuranceForBooking) {
							$("#hsnCodeDiv").removeClass("hide");
							$("#hsnCodeNameDiv").removeClass("hide");
						}
						
						$("#hsnCodeEle").blur(function(event) {
							_this.getSaidToContainOnHSNCode();
						});
						
						let saidToContainNameAutoComplete = new Object();
						saidToContainNameAutoComplete.primary_key 	= 'consignmentGoodsId';
						saidToContainNameAutoComplete.url 			= WEB_SERVICE_URL + '/autoCompleteWS/getAllConsignmentGoodsDetailsByName.do?';
						saidToContainNameAutoComplete.callBack 		= _this.getSaidToContainForEdit;
						saidToContainNameAutoComplete.field 		= 'name';
						$("#saidToContainNameAutoEle").autocompleteCustom(saidToContainNameAutoComplete);

						hideLayer();
						
						$("#editBtn").click(function() {
							_this.onEdit();
						});

						$("#updateBtn").click(function() {
							let btModalConfirm = new Backbone.BootstrapModal({
								content		: 	"Are you sure you want to Update ?",
								modalWidth 	: 	30,
								title		:	'Update Consignment',
								okText		:	'YES',
								showFooter 	: 	true,
								okCloses	:	true
							}).open();
							
							btModalConfirm.on('ok', function() {
								_this.onUpdate();
							});
						});

						$("#deleteBtn").click(function() {
							let btModalConfirm = new Backbone.BootstrapModal({
								content		: 	"Are you sure you want to Delete ?",
								modalWidth 	: 	30,
								title		:	'Delete Consignment',
								okText		:	'YES',
								showFooter 	: 	true,
								okCloses	:	true
							}).open();
							
							btModalConfirm.on('ok', function() {
								_this.onDelete();
							});
						});
					});
				}, renderSaidToContainMasterViewTabElements : function() {
					let loadviewelement = new Array();
					let viewNewHtml 	= new $.Deferred();
					loadviewelement.push(viewNewHtml);

					$("#viewTab").load("/ivcargo/html/module/saidToContainMaster/saidToContainMasterTabElements/viewTabElements.html",
							function() {
						viewNewHtml.resolve();
					});

					hideLayer();

					$.when.apply($, loadviewelement).done(function() {
						let saidToContainNameAutoComplete = new Object();
						saidToContainNameAutoComplete.primary_key 	= 'consignmentGoodsId';
						saidToContainNameAutoComplete.url 			= WEB_SERVICE_URL + '/autoCompleteWS/getAllConsignmentGoodsDetailsByName.do?';
						saidToContainNameAutoComplete.callBack 		= _this.getSaidToContainForView;
						saidToContainNameAutoComplete.field 		= 'name';
						$("#saidToContainNameAutoEle").autocompleteCustom(saidToContainNameAutoComplete);

						hideLayer();

						$("#viewAllBtn").click(function() {
							showLayer();
							getJSON(jsonObject, WEB_SERVICE_URL + '/consignmentGoodsWS/getAllSaidToContain.do?',_this.setReportData, EXECUTE_WITH_ERROR);
						});
					});
				}, renderPartySaidToContainMasterMappingTabElements : function() {
					let loadMappingElement 	= new Array();
					let mappingNewHtml 		= new $.Deferred();
					loadMappingElement.push(mappingNewHtml);

					$("#partySaidToContainMappingTab").load("/ivcargo/html//module/saidToContainMaster/saidToContainMasterTabElements/partySaidToContainMappingElements.html",
							function() {
						mappingNewHtml.resolve();
					});
					
					hideLayer();

					$.when.apply($, loadMappingElement).done(function() {
						let keyObject = Object.keys(jsonData);
						
						for (const element of keyObject) {
							if (jsonData[element])
								$("*[data-attribute=" + element + "]").removeClass("hide");
						}
				
						$("#addBtn").click(function(){
							_this.showAddSaidToContainPanel();
						});
						
						$("#deleteOption").click(function(){
							_this.showDeleteSaidToContainPanel();
						});
						
						$("#viewAllBtn").click(function(){
							_this.getPartySaidToContainsMappingDetailsForView();
						});
				
						myNod = nod();
						myNod.configure({
							parentClass:'validation-message'
						});
						
						myNod.add({
							selector		: '#billingPartyNameEle',
							validate		: 'validateAutocomplete:#billingPartyNameEle_primary_key',
							errorMessage	: 'Please Select Party Name'
						});

						let billingPartyNameAutoComplete 		 	 = new Object();
						billingPartyNameAutoComplete.primary_key 	 = 'corporateAccountId';
						billingPartyNameAutoComplete.url 		 	 = WEB_SERVICE_URL + '/autoCompleteWS/getPartyDetailsAutocomplete.do?';
						billingPartyNameAutoComplete.field			 = 'corporateAccountDisplayName';
	
						$("#billingPartyNameEle").autocompleteCustom(billingPartyNameAutoComplete);
	
						let saidToContainAutoComplete = new Object();
						saidToContainAutoComplete.primary_key 	= 'consignmentGoodsId';
						saidToContainAutoComplete.url 			=  WEB_SERVICE_URL + '/autoCompleteWS/getAllConsignmentGoodsDetailsByName.do?';
						saidToContainAutoComplete.field 		= 'name';
						saidToContainAutoComplete.callBack		= _this.createCheckBoxForSaidToContainList
						
						$("#saidToContainEle").autocompleteCustom(saidToContainAutoComplete);
				
						let partyNameAutoComplete = new Object();
						partyNameAutoComplete.primary_key 	= 'corporateAccountId';
						partyNameAutoComplete.url 			=  WEB_SERVICE_URL +  '/autoCompleteWS/getPartyDetailsAutocomplete.do?';
						partyNameAutoComplete.field 		= 'corporateAccountDisplayName';
						
						$("#partyNameEle").autocompleteCustom(partyNameAutoComplete);
				
						hideLayer();
						
						$("#saveBtn").click(function() {
							myNod.performCheck();
							
							if(partySaidToContainMappingMaster || myNod.areAll('valid')) {
								if (!$('#billingPartyNameEle_primary_key').val()) {
            						showMessage('error', 'Please Select Party Name !');
            						return;
      						  }
								if($('#saidToContainIdList').exists() && !$('#saidToContainIdList').is(':empty')) {
									_this.savePartySaidToContainMappingDetails(_this);								
								} else {
									showMessage('error', 'Please Select Said To Contain !');
									return;
								}
							}
						});
					});
					
					return _this;
				}, getSaidToContainForView : function() {
					showLayer();
					jsonObject = new Object();
					jsonObject.consignmentGoodsId = $("#saidToContainNameAutoEle_primary_key").val();
					_this.resetAutoComplete();
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/consignmentGoodsWS/getSaidToContainById.do?',_this.setReportData, EXECUTE_WITH_ERROR);
				}, getSaidToContainForEdit : function() {
					jsonObject = new Object();
					jsonObject.consignmentGoodsId = $("#saidToContainNameAutoEle_primary_key").val();
					getJSON(jsonObject, WEB_SERVICE_URL + '/consignmentGoodsWS/getSaidToContainById.do?', _this.setDataInEditTab, EXECUTE_WITH_ERROR);
				}, setDataInEditTab : function(response) {
					showLayer();
			
					if(response.CorporateAccount != undefined) {
						let consignmentGoods	= response.CorporateAccount[0];
								
						$("#saidToContainNameEle").val(consignmentGoods.name);
						$('#isExemptedEle').prop('checked', consignmentGoods.isExempted);
						$('#isEWayBillExemptedEle').prop('checked', consignmentGoods.isEWayBillExempted);
						$('#hsnCodeEle').val(consignmentGoods.hsnCode);
						$('#hsnCodeNameEle').val(consignmentGoods.hsnCodeSaidToContainName);
					}
							
					hideLayer();
				}, onSubmit : function() {
					showLayer();
					jsonObject = new Object();
					
					let $inputs = $('#addNewTab :input');
					
					$inputs.each(function() {
						if ($(this).val() != "") {
							jsonObject[$(this).attr('name')] = $.trim($(this).val());
						}
					});
					
					jsonObject.isExempted			= $('#isExemptedEle').is(':checked');
					jsonObject.isEWayBillExempted	= $('#isEWayBillExemptedEle').is(':checked');
		
					getJSON(jsonObject, WEB_SERVICE_URL + '/consignmentGoodsWS/addSaidToContain.do?',_this.afterSave, EXECUTE_WITH_ERROR);
				}, savePartySaidToContainMappingDetails : function() {
					showLayer();
					let jsonObject = new Object();
					jsonObject["corporateAccountId"]	= $('#billingPartyNameEle_primary_key').val();
		
					let checkBoxArray	= new Array();
						
					$("input[name=checkboxSaidToContain]").each( function () {
						checkBoxArray.push($(this).val());
					});
		
					jsonObject["consignmentGoodsIds"]	= checkBoxArray.join(',');
					 getJSON(jsonObject, WEB_SERVICE_URL+'/consignmentGoodsWS/savePartySaidToContainMappingDetails.do',_this.setSavingResponse, EXECUTE_WITH_ERROR);
				},setSavingResponse : function(response) {
					
					$("#billingPartyNameEle").val('');
					$("#saidToContainEle").val('');
					$("#saidToContainIdList").empty();
					
					hideLayer();
				}, afterSave : function(response) {
					_this.resetFeilds();
					hideLayer(); 
				}, onEdit : function() {
					if($("#saidToContainNameAutoEle_primary_key").val() > 0) {
						$("#updateBtn").removeClass("hide");
						$('#saidToContainNameEle').prop('disabled', false);
						$('#isExemptedEle').prop('disabled', false);
						$('#isEWayBillExemptedEle').prop('disabled', false);
						$("#editBtn").addClass("hide");
						$('#hsnCodeEle').prop('disabled', false);
						$('#hsnCodeNameEle').prop('disabled', false);
					} else {
						showMessage('error', "Select Consignment For Update !");
					}
				}, onUpdate : function() {
					showLayer();
					jsonObject = new Object();
					let $inputs = $('#editTab :input');
					$inputs.each(function() {
						if ($(this).val() != "") {
							jsonObject[$(this).attr('name')] = $.trim($(this).val());
						}
					});
							
					jsonObject.name					= $('#saidToContainNameEle').val();
					jsonObject.isExempted			= $('#isExemptedEle').is(':checked');
					jsonObject.isEWayBillExempted	= $('#isEWayBillExemptedEle').is(':checked');
					jsonObject.consignmentGoodsId	= $("#saidToContainNameAutoEle_primary_key").val();
					getJSON(jsonObject, WEB_SERVICE_URL + '/consignmentGoodsWS/updateSaidToContain.do?',_this.afterUpdate, EXECUTE_WITH_ERROR);
				}, afterUpdate : function(response) {
					if(response.message != undefined) {
						hideLayer();
		
						if(Number(response.consignmentGoodHistoryId) > 0) {
							_this.resetAutoComplete();
							_this.resetFeilds();
						}
					}
		
					_this.renderSaidToContainMasterEditTabElements();
					$("#updateBtn").addClass("hide");
					hideLayer();
				}, resetAutoComplete : function() {
					$('#saidToContainNameAutoEle').val("");
					$('#saidToContainNameAutoEle_primary_key').val(0);
				}, resetFeilds : function() {
					$('#saidToContainNameEle').val("");
					$('#isExemptedEle').prop('checked', false);
					$('#isEWayBillExemptedEle').prop('checked', false);
					$('#hsnCodeEle').val("");
					$('#hsnCodeNameEle').val("");
				}, onDelete : function() {
					jsonObject = new Object();
					jsonObject.consignmentGoodsId	= $("#saidToContainNameAutoEle_primary_key").val();
		
					if(jsonObject.consignmentGoodsId > 0) {
						showLayer();
						getJSON(jsonObject, WEB_SERVICE_URL + '/consignmentGoodsWS/deleteSaidToContain.do?',_this.afterDelete, EXECUTE_WITH_ERROR);
					} else {
						showMessage('error', "Select Consignment For Delete !");
					}
				}, afterDelete : function(response) {
					if(response.message != undefined){
						hideLayer();
								
						if(Number(response.consignmentGoodHistoryId) > 0) {
							_this.resetAutoComplete();
							_this.resetFeilds();
						}
					}
		
					_this.renderSaidToContainMasterEditTabElements();
					hideLayer();
				}, setReportData : function(response) {
					$("#saidToContainMasterDiv").empty();
		
					if(response.message != undefined) {
						hideLayer();
						$('#saidToContainMasterDiv').hide();
						$('#btnprint_viewSaidToContainMaster').hide();
						$('#bottom-border-boxshadow').addClass('hide');
						return;
					}
		
					if(response.CorporateAccount != undefined && response.CorporateAccount.length > 0) {
						$('#bottom-border-boxshadow').removeClass('hide');
						$('#saidToContainMasterDiv').show();
						$('#btnprint_viewSaidToContainMaster').show();
						gridObject = slickGridWrapper2.setGrid(response);
					} else {
						$('#bottom-border-boxshadow').addClass('hide');
						$('#saidToContainMasterDiv').hide();
						$('#btnprint_viewSaidToContainMaster').hide();
					}
							
					gridObject.onClick.subscribe(function (e, args){
						let cell 		= gridObject.getCellFromEvent(e)
						let row 		= cell.row;
						let dataView 	= gridObject.getData();
						let item 		= dataView.getItem(row);
								
						if(item.editedOn != undefined && item.editHistory == "Edit History" && cell.cell == 7)
							_this.getConsignmentEditHistoryDetails(item.consignmentGoodsId);
					});
							
					hideLayer();
				}, getConsignmentEditHistoryDetails : function(consignmentGoodsId) {
					let jsonObject = new Object();
		
					jsonObject["consignmentGoodsId"] 	= consignmentGoodsId;
		
					let object 			= new Object();
					object.elementValue = jsonObject;
					object.gridObj 		= gridObject;
		
					let btModal = new Backbone.BootstrapModal({
						content		: new Details(object),
						modalWidth 	: 70,
						title		:'Consignment Edit History Details'
					}).open();
					object.btModal = btModal;
					new Details(object)
					btModal.open();
				}, getSaidToContainOnHSNCode : function() {
					let jsonObject = {};
					jsonObject.hsnCode = $("#hsnCodeEle").val();
							
					$('#hsnCodeNameEle').empty();
							//hsnCodeNameEle
					getJSON(jsonObject, WEB_SERVICE_URL + '/consignmentGoodsWS/getSaidToContainListByHSN.do?', _this.setSaidToContains, EXECUTE_WITHOUT_ERROR);
				}, setSaidToContains : function(response) {
					let saidToContainsList	= response.saidToContainsList;
							
					if(saidToContainsList != undefined && saidToContainsList.length > 0) {
						Selectizewrapper.setAutocomplete({
							jsonResultList	: SaidToContainsList,
							valueField		: 'hsnCodeSaidToContainId',
							labelField		: 'hsnCodeSaidToContainName',
							searchField		: 'hsnCodeSaidToContainName',
							elementId		: 'hsnCodeNameEle',
							create			: false,
							maxItems		: 1
						});
					}
				}, showAddSaidToContainPanel : function(){
					$("#right-border-boxshadow").addClass("hide");
					$("#right-border-boxshadow").css("opacity", 0);
					$("#middle-border-boxshadow").hide();
					$("#bottom-border-boxshadow").css("opacity", 0);
					$("#middle-border-boxshadow").removeClass("hide");
					$("#middle-border-boxshadow").toggle("slide", { direction: "up" }, 500);
					$("#billingPartyNameEle").val('');
					$("#saidToContainEle").val('');
					$("#saidToContainIdList").empty();
					$('#deleteSelection').show();
				}, showDeleteSaidToContainPanel : function(){  
					$("#right-border-boxshadow").addClass("hide");
					$("#right-border-boxshadow").css("opacity", 0);
					$("#middle-border-boxshadow").hide();
					$("#bottom-border-boxshadow").hide();
					$("#bottom-border-boxshadow").css("opacity", 1);
					$("#bottom-border-boxshadow").removeClass("hide");
					$("#bottom-border-boxshadow").toggle("slide", { direction: "up" }, 500);
					$("#partyNameEle").val('');
					$("#saidToContainIdList").empty();
					
					mynod2 = nod();
					mynod2.configure({
						parentClass:'validation-message'
					});
					
					mynod2.add({
						selector		: '#partyNameEle',
						validate		: 'validateAutocomplete:#partyNameEle_primary_key',
						errorMessage	: 'Please Select Party Name'
					});
							
					hideLayer();
				
					$("#findBtn").click(function() {
						mynod2.performCheck();
						
						if(mynod2.areAll('valid'))
							_this.getPartySaidToContainsMappingDetailsForDelete();					
					});
				}, getPartySaidToContainsMappingDetailsForView : function(){
					showLayer();
					getJSON(jsonObject, WEB_SERVICE_URL + '/consignmentGoodsWS/getPartySaidToContainsMappingDetailsByAccountGroupId.do', _this.setViewAllData, EXECUTE_WITH_ERROR);
				}, createCheckBoxForSaidToContainList : function () {
					let id 	= $('#saidToContainEle_primary_key').val();
					let name	= $('#saidToContainEle').val();
					$("#saidToContainIdList").show();
					
					if($("#checkboxSaidToContain" + id).exists()) {
						showMessage('warning', 'Said To Contain Already Added !');
						return;
					}
					
					let rowscounts = $("#saidToContainIdList").find('tr').length;
					let columnscounts = 0;
						
					if (rowscounts == 0)
						tableRow		= createRowInTable('tr_'+id,'','');
					else
						columnscounts = $("#saidToContainIdList").find('tr:last')[0].cells.length;
					
					if (columnscounts % checkboxcount == 0)
						tableRow		=  createRowInTable('tr_'+id,'','');
					
					let tableCol		= createColumnInRow(tableRow,'td_' + id,'50px','','','', '');
					
					let checkboxSaidToContain		= $("<input/>", { 
						type		: 'checkbox', 
						id			: 'checkboxSaidToContain' + id, 
						class		: 'form-control col-xs-1 text-right', 
						name		: 'checkboxSaidToContain' , 
						value 		: id
					}).css("display", "none");
						
					$(tableCol).append(name);
					$(tableCol).append('<br>');
					appendValueInTableCol(tableCol, checkboxSaidToContain);
					
					$('#saidToContainIdList').append(tableRow);
					$('#saidToContainEle').val('');
					$('#saidToContainEle_primary_key').val(0);
				}, getPartySaidToContainsMappingDetailsForDelete : function() {
					$("#right-border-boxshadow").removeClass("hide");
					$("#right-border-boxshadow").css("opacity", 1);
					showLayer();
					let jsonObject = new Object();
					jsonObject["corporateAccountId"]	= $('#partyNameEle_primary_key').val();
					
					getJSON(jsonObject, WEB_SERVICE_URL+'/consignmentGoodsWS/getPartySaidToContainsMappingDetailsByPartyMasterId.do', _this.setDataForDelete, EXECUTE_WITH_ERROR);
				}, setDataForDelete : function(response) {
					$('#middle-border-boxshadow').addClass('hide');
					
					$('#deletePartyNameConsignmentGoodsMappingDetails').empty();
					goToPosition('right-border-boxshadow', 'slow');
								
					hideLayer();
					
					if(response.message != undefined) {
						$('#right-border-boxshadow').addClass('hide');
						return;
					}
					
					let partyIdWithConsignmentGoodsMappingList	= response.partyIdWithConsignmentGoodsMappingList;
					
					if(response.partyIdWithConsignmentGoodsMappingList != undefined) {
						let columnArray		= new Array();
						
						for (let i = 0; i < partyIdWithConsignmentGoodsMappingList.length; i++) {
							let obj		= partyIdWithConsignmentGoodsMappingList[i];
						
						   	columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i + 1) + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' id='partyTd_" + obj.partySaidToContainsMappingId + "'>" + obj.partyName + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' id='saidToContainTd_" + obj.partySaidToContainsMappingId + "'>" + obj.consignmentGoodsName + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'><a style='cursor:pointer;' id='deleteConsignmentGoods_" + obj.partySaidToContainsMappingId + "'><b style='font-size: 14px'>Delete</b></a></td>");
							$('#editDetailsTable tbody').append('<tr id="editPackingTypeConsignmentGoodsMappingDetails_'+ obj.partySaidToContainsMappingId +'">' + columnArray.join(' ') + '</tr>');
						
							$("#deleteConsignmentGoods_" + obj.partySaidToContainsMappingId).bind("click", function() {
								let elementId	= $(this).attr('id');
								_this.deleteSaidToContainPartyMapDetails(elementId.split('_')[1]);
							});
						
							columnArray	= [];
						}
					}
				}, setViewAllData : function(response) {
					if(response.CorporateAccount != undefined && (response.CorporateAccount).length > 0) {
						let jsonObject = new Object();
						jsonObject["response"] 		= response;
						
						let object = new Object();
						object.elementValue = jsonObject;
						
						let btModal = new Backbone.BootstrapModal({
							content: new PartySaidtoContainMappingViewAll(object),
							modalWidth : 55,
							title:'Party Said To Contain Mapping Master Details'
						}).open();
						
						object.btModal = btModal;
						new PartySaidtoContainMappingViewAll(object)
						btModal.open();
					} else {
						hideLayer();
						showMessage('error','No Records Found!');
					}
				}, deleteSaidToContainPartyMapDetails : function (partyIdWithconsignmnentGoodsMappingId) {
					if (confirm("Are you sure to delete?")) {
						showLayer();
						
						if($('#deletePartyNameConsignmentGoodsMappingDetails').is(':empty')) {
							$('#right-border-boxshadow').addClass('hide');
							$("#right-border-boxshadow").css("opacity", 0);
						}
						
						let jsonObject = new Object();
						
						jsonObject["partyIdWithconsignmnentGoodsMappingId"]	= partyIdWithconsignmnentGoodsMappingId;
						getJSON(jsonObject, WEB_SERVICE_URL+'/consignmentGoodsWS/deletePartySaidToContainsMappingDetails.do', _this.showResponseAfterDelete, EXECUTE_WITH_ERROR);
					}
				}, showResponseAfterDelete : function (response) {
					hideLayer();
						
					if(response.deleted) {				
						let row = $('#editPackingTypeConsignmentGoodsMappingDetails_' + response.partyIdWithConsignmentGoodsMappingId).closest('tr');
								
						setTimeout(function() { // Simulating ajax
							let siblings = row.siblings();
							row.remove();
							siblings.each(function(index) {
							$(this).children().first().text(index + 1);
							});
						}, 100);
								
						let deletePackingTypeConsignmentGoodsMappingDetailsLength = $('#deletePackingTypeConsignmentGoodsMappingDetails tr').length - 1;
								
						if(deletePackingTypeConsignmentGoodsMappingDetailsLength == 0)
							$('#right-border-boxshadow').addClass('hide');
					}
					
					hideLayer();
				}
			});
		});