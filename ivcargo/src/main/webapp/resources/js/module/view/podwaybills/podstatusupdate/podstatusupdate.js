var podDocumentList
,showPodDocument;

define(
		[
			'JsonUtility',
			'messageUtility',
			'autocomplete',
			'autocompleteWrapper',
			'bootstrapSwitch',
			'slickGridWrapper2',
			'nodvalidation',
			'focusnavigation',
			PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	],//PopulateAutocomplete
			function() {
			'use strict';
			let jsonObject = new Object(), appendNewAddedLROnTop = false, podStatusArr = null,
			_this, POD_STATUS_UPDATE_AFTER_DISPATCH = false, POD_STATUS_UPDATE = false;

			return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
					this.$el.html(this.template);
				}, render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/podStatusUpdateWS/getPodStatusUpdateElement.do?', _this.renderElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, renderElements : function(response) {
					showLayer();

					let loadelement 	= new Array();
					let baseHtml 		= new $.Deferred();

					loadelement.push(baseHtml);

					$("#mainContent").load("/ivcargo/html/module/podwaybills/podStatusUpdate/podStatusUpdate.html", function() {
						baseHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						initialiseFocus();
						
						showPodDocument				= response['showPodDocument'];
						POD_STATUS_UPDATE_AFTER_DISPATCH	= response.POD_STATUS_UPDATE_AFTER_DISPATCH;
						POD_STATUS_UPDATE					= response.POD_STATUS_UPDATE;
						podDocumentList					= response.podDocumentList;
						appendNewAddedLROnTop			= response.appendNewAddedLROnTop;
						podStatusArr					= response.podStatusArr;
						
						$( "#wayBillNumberEle" ).keydown(function(e) {
							if (e.which == 13)
								_this.searchLRByNumber();
						});
												
						if(response.markPodReceived)
							$("#markReceive").css("display", "block");
												
						$("#updatePodReceive").click(function() {
							_this.updatePODStatus();
						});
						
						$("#markPODReceive").click(function() {
							showLayer();
													
							if($('#wayBillNumberEle').val() == '') {
								hideLayer();
								showAlertMessage('info','Enter LR Number !');
								$('#wayBillNumberEle').focus();
								return;
							}
													
							let jsonObject 			= new Object();

							jsonObject.wayBillNumber			= $('#wayBillNumberEle').val();
							getJSON(jsonObject, WEB_SERVICE_URL + '/podStatusUpdateWS/insertPODWayBillDetails.do', _this.setPODSuccess, EXECUTE_WITH_ERROR);
						});

						hideLayer();
					});
				}, searchLRByNumber : function() {
					showLayer();
					let jsonObject 			= new Object();
					let wayBillNumber = $('#wayBillNumberEle').val();
					jsonObject.wayBillNumber			= $.trim(wayBillNumber);

					getJSON(jsonObject, WEB_SERVICE_URL + '/podStatusUpdateWS/getAllPodWayBillForStatusUpdate.do', _this.setPODData, EXECUTE_WITH_ERROR);
				}, setPODData : function(response) {
					$('#wayBillNumberEle').val("");
					$('#wayBillNumberEle').focus();

					if(response.message != undefined) {
						hideLayer();
						return;
					}

					if(response.PODStatusUpdateModel != undefined) {
						hideAllMessages();
						$('#bottom-border-boxshadow').show();
						
						let PODStatusUpdateModel 	= response.PODStatusUpdateModel;
						let totalAmount	= 0;
						let table;
						let podDocTypeSelect = null;
						
						if($('#podWayBillStatus').exists() && $('#podWayBillStatus').is(":visible")){
							let tableData = $("#podWayBillStatus");
							let wayBillIdArr = new Array();
							let count 	= parseFloat(tableData[0].rows.length-1);
						
							for (let row = count; row > 0; row--){
								let wayBillId = 	tableData[0].rows[row].cells[0].firstChild.value;
								wayBillIdArr.push(wayBillId);
							}
							
							for (const element of PODStatusUpdateModel) {
								if(!isValueExistInArray(wayBillIdArr, element.wayBillId)) {
									var tr 	=  $('<tr/>'); 
									tr.attr('id',"tr_"+element.wayBillId);
									
									var td0 	=  $('<td/>');
									var td1 	=  $('<td/>');
									var td2 	=  $('<td/>');
									var td3 	=  $('<td/>');
									var td4 	=  $('<td/>');
									
									if(showPodDocument)
										var td5 	=  $('<td class="pure-u-1 pure-u-md-1-5"/>');
									
									var td6 	=  $('<td/>');
									var td7 	=  $('<td/ style="width:6%">');
									var select 	= $('<select type="text" class="form-control">').attr("onchange", 'loadPodDocumentSelection('+element.wayBillId+')');
									
									select.attr('id',"updateStatusEle_"+element.wayBillId);
									
									podDocTypeSelect 	= $('<select multiple="multiple" id="updateDocumentEle_'+ element.wayBillId +'" name="updateDocumentEle_'+ element.wayBillId +'" class="form-control col-xs-2" style="display : none; width :100px"/>');
									
									var newOption = $('<option/>');
									newOption.html("-- Select POD Status --");
									newOption.attr('id',0);
									newOption.val(0);
									$(select).append(newOption);
									
									var newSelection = $('<option/>');
									newSelection.html("-- Select POD Document --");
									newSelection.attr('id',0);
									newSelection.val(0);
									
									$(podDocTypeSelect).append(newOption);
									
									for (var j = 0; j < element.podStatusList.length; j++) {
										var newOption = $('<option/>');
										newOption.html(element.podStatusList[j].podStatusName);
										newOption.attr('id',element.podStatusList[j].podStatusId);
										newOption.val(element.podStatusList[j].podStatusId);
										$(select).append(newOption);
									}
									
									td0.append($('<input type="checkbox" name="wayBills" class="form-control" id="wayBills_' + element.wayBillId + '" value="' + element.wayBillId + '">'));
									td1.append(element.wayBillNumber);
									
									td1.append($('<input type="hidden" id="wayBillIdInput_' + element.wayBillId + '" value="' + element.wayBillId + '">'));
									td1.append($('<input type="hidden" id="podDispatchSummaryInput_' + element.wayBillId + '" value="' + element.podDispatchSummaryId + '">'));
									td1.append($('<input type="hidden" id="podStatusInput_' + element.wayBillId + '" value="'+ element.podStatus +'">'));
									td1.append($('<input type="hidden" id="podDispatchId_' + element.wayBillId + '" value="' + element.podDispatchId + '">'));
									td2.append(element.corporateAccountName);
									td3.append(element.podStatusStr);
									td4.append(select);
									
									if(showPodDocument){
										td5.append(podDocTypeSelect);
									}
									
									td6.append($('<input type="text" class="form-control" id = "remarkInput_' + element.wayBillId + '" placeholder = "Remark">'));
									td7.append($('<input  type="button"  name="Remove" value="Remove"  onclick="remove('+element.wayBillId+')" class=" btn-danger form-control">'));
									tr.append(td0);
									tr.append(td1);
									tr.append(td2);
									tr.append(td3);
									tr.append(td4);
									
									if(showPodDocument)
										tr.append(td5);
									
									tr.append(td6);
									tr.append(td7);

									if(appendNewAddedLROnTop)
										$("#podWayBillStatus tr:eq(0)").after(tr);
									else
										$("table tbody").append(tr);
								} else{
									showAlertMessage('info','LR Already Added !');
								}
								
							}
						} else{
							
							$('#selectPodStatusForAll').show();
							$('#podRemarkEle').show();
							$('#updatePodReceive').show();
							
							var newOption = $('<option/>');
							newOption.html("-- Select POD Status --");
							newOption.attr('id',0);
							newOption.val(0);
							$('#selectPodStatusForAll').append(newOption);
							
							for (const element of podStatusArr) {
								newOption = $('<option/>');
								newOption.html(element.podStatusName);
								newOption.attr('id',element.podStatusId);
								newOption.val(element.podStatusId);
								$('#selectPodStatusForAll').append(newOption);
							}
							
							table = $('<table id="podWayBillStatus" class="table table-bordered" />');
							
							for (var i = 0; i < PODStatusUpdateModel.length; i++){
								if(i == 0) {
									var tr 	=  $('<tr class="header"/>');
									
									var th0 	=  $('<th/>');
									let th1 	=  $('<th/>');
									let th2 	=  $('<th/>');
									let th3 	=  $('<th/>');
									let th4 	=  $('<th/>');
									let th5 	=  $('<th/>');
									let th6 	=  $('<th/>');
									let th7 	=  $('<th/>');
									
									th0.append('All<br/><input id="selectAll" name="selectAll" type="checkbox" valus="Select All" onclick="selectAllLrsForPODReceive(this.checked);">');
									th1.append("LR No");
									th2.append("Party Name");
									th3.append("Current POD Status");
									th4.append("New POD Status");
									
									if(showPodDocument)
										th5.append("POD Document Received");
									
									th6.append("Remark");
									th7.append("Remove");
									tr.append(th0);
									tr.append(th1);
									tr.append(th2);
									tr.append(th3);
									tr.append(th4);
									
									if(showPodDocument)
										tr.append(th5);
									
									tr.append(th6);
									tr.append(th7);
									table.append(tr);
								} 
								var tr 	=  $('<tr/>'); 
								tr.attr('id',"tr_"+PODStatusUpdateModel[i].wayBillId);
								
								var td0 	=  $('<td/>');
								var td1 	=  $('<td/>');
								var td2 	=  $('<td/>');
								var td3 	=  $('<td/>');
								var td4 	=  $('<td/>');
								
								if(showPodDocument)
									var td5 	=  $('<td class="pure-u-1 pure-u-md-1-5"/>');
								
								var td6 	=  $('<td/>');
								var td7 	=  $('<td/ style="width:6%">');
								var select 	= $('<select type="text" class="form-control">').attr("onchange", 'loadPodDocumentSelection('+PODStatusUpdateModel[i].wayBillId+')');
								
								select.attr('id',"updateStatusEle_"+PODStatusUpdateModel[i].wayBillId);
								
								podDocTypeSelect 	= $('<select multiple="multiple" id="updateDocumentEle_'+ PODStatusUpdateModel[i].wayBillId +'" name="updateDocumentEle_'+ PODStatusUpdateModel[i].wayBillId +'" class="form-control col-xs-2" style="display : none; width :100px"/>');
								
								var newOption = $('<option/>');
								newOption.html("-- Select POD Status --");
								newOption.attr('id',0);
								newOption.val(0);
								$(select).append(newOption);
								
								var newSelection = $('<option/>');
								newSelection.html("-- Select POD Document --");
								newSelection.attr('id',0);
								newSelection.val(0);
								
								$(podDocTypeSelect).append(newOption);
								
								for (var j = 0; j < PODStatusUpdateModel[i].podStatusList.length; j++) {
									var newOption = $('<option/>');
									newOption.html(PODStatusUpdateModel[i].podStatusList[j].podStatusName);
									newOption.attr('id',PODStatusUpdateModel[i].podStatusList[j].podStatusId);
									newOption.val(PODStatusUpdateModel[i].podStatusList[j].podStatusId);
									$(select).append(newOption);
								}
								
								td0.append($('<input type="checkbox" name="wayBills" class="form-control" id="wayBills_' + PODStatusUpdateModel[i].wayBillId + '" value="' + PODStatusUpdateModel[i].wayBillId + '">'));
								td1.append(PODStatusUpdateModel[i].wayBillNumber);
								td1.append($('<input type="hidden" id="wayBillIdInput_' +  PODStatusUpdateModel[i].wayBillId + '" value="' +  PODStatusUpdateModel[i].wayBillId + '">'));
								td1.append($('<input type="hidden" id="podDispatchSummaryInput_' + PODStatusUpdateModel[i].wayBillId + '" value="' + PODStatusUpdateModel[i].podDispatchSummaryId + '">'));
								td1.append($('<input type="hidden" id="podStatusInput_' + PODStatusUpdateModel[i].wayBillId + '" value="'+ PODStatusUpdateModel[i].podStatus +'">'));
								td1.append($('<input type="hidden" id="podDispatchId_' + PODStatusUpdateModel[i].wayBillId + '" value="' + PODStatusUpdateModel[i].podDispatchId + '">'));
								td2.append(PODStatusUpdateModel[i].corporateAccountName);
								td3.append(PODStatusUpdateModel[i].podStatusStr);
								td4.append(select);
								
								if(showPodDocument)
									td5.append(podDocTypeSelect);
								
								td6.append($('<input type="text" class="form-control" id = "remarkInput_' + PODStatusUpdateModel[i].wayBillId + '" placeholder = "Remark">'));
								td7.append($('<input type="button"  id="remove_'+PODStatusUpdateModel[i].wayBillId+'" value="Remove" onclick="remove('+PODStatusUpdateModel[i].wayBillId+')"  class=" btn-danger form-control">'));
								
								tr.append(td0);
								tr.append(td1);
								tr.append(td2);
								tr.append(td3);
								tr.append(td4);
								
								if(showPodDocument)
									tr.append(td5);
								
								tr.append(td6);
								tr.append(td7);
								table.append(tr);
							}
						}
						
						$('#podWayBillDetailsDiv').append(table);

						for (var i = 0; i < PODStatusUpdateModel.length; i++) {
							if($('#podStatusInput_'+(i+1)).val() == POD_DISPATCH_STATUS_PENDING) {
								if(!POD_STATUS_UPDATE) {
									$("#updateStatusBtn_"+(i+1)).attr('disabled','disabled');
									showAlertMessage('info','You are not authorized to updated the POD dispatch after dispatch !');
								}
							} else if(!POD_STATUS_UPDATE || !POD_STATUS_UPDATE_AFTER_DISPATCH) {
								$("#updateStatusBtn_"+(i+1)).attr('disabled','disabled');
								showAlertMessage('info','You are not authorized to updated the POD dispatch after dispatch !');
							}
						}
					} else {
						$('#bottom-border-boxshadow').hide();
					}

					hideLayer();
				}, remove : function(wayBillId) {
					let btModalConfirm = new Backbone.BootstrapModal({
						content		: 	"Are you sure you want to Remove ?",
						modalWidth 	: 	30,
						title		:	'Remove LR',
						okText		:	'Yes',
						showFooter 	: 	true,
						okCloses	:	true
					}).open();
						
					btModalConfirm.on('ok', function() {
						$("#tr_" + wayBillId).remove();
					});
						
					btModalConfirm.on('cancel', function() {
						btModalConfirm.close();
					});					
				}, updatePODStatus : function() {
					let table = $("#podWayBillStatus");
					let count 	= parseFloat(table[0].rows.length-1);
						
					let wayBillIdWiseObj		= new Object;
						
					let jsonObject		= new Object();
					let checkBoxArray	= new Array();
					let podDispatchIdsArray	= new Array();
						
					$.each($("input[name=wayBills]:checked"), function(){ 
						checkBoxArray.push($(this).val());
					});
						
					if(checkBoxArray.length == 0){
						showAlertMessage('error', 'Please Select At least One LR!');
						hideLayer();
						return;
					}
						
					for (let row = count; row > 0; row--) {
						if(table[0].rows[row].cells[0].firstChild.checked) {
							let wayBillId = table[0].rows[row].cells[0].firstChild.value;
												
							if($('#updateStatusEle_' + wayBillId).val() == null || $('#updateStatusEle_' + wayBillId).val() == 0) {
								showAlertMessage('info','Select New POD Status !');
								$('#updateStatusEle_'+row).focus();
								return;
							}
												
							if($('#remarkInput_' + wayBillId).val() == "") {
								showAlertMessage('info','Enter Remark !');
								$('#remarkInput_'+row).focus();
								return;
							}
														
							let podDetailsObject 						= new Object();

							podDetailsObject["waybillId"]				= $('#wayBillIdInput_' + wayBillId).val();
							
							podDetailsObject["podStatus"]				= $('#updateStatusEle_' + wayBillId).val();
							
							podDetailsObject["podDocument"]				= getAllCheckBoxSelectValue(wayBillId);
							podDetailsObject["podDispatchSummaryId"]	= $('#podDispatchSummaryInput_' + wayBillId).val();
							podDetailsObject["podRemark"]				= $('#remarkInput_' + wayBillId).val();
							podDetailsObject["podDispatchId"]			= $('#podDispatchId_' + wayBillId).val();
							wayBillIdWiseObj['wayBillId_' + wayBillId]	= podDetailsObject;
								
							if(!podDispatchIdsArray.includes($('#podDispatchId_' + wayBillId).val()))
								podDispatchIdsArray.push($('#podDispatchId_' + wayBillId).val());
						}
					}
						
					$('#updatePodReceive').css('display','none');
					jsonObject["wayBillIdWiseData"]			= JSON.stringify(wayBillIdWiseObj);
					jsonObject["wayBillIds"]				= checkBoxArray.join(',');
					jsonObject["podDispatchIdsStr"]			= podDispatchIdsArray.join();
					
					let btModalConfirm = new Backbone.BootstrapModal({
						content		: 	"Are you sure you want to Update Status ?",
						modalWidth 	: 	30,
						title		:	'Update Status',
						okText		:	'Update',
						showFooter 	: 	true,
						okCloses	:	true
					}).open();
					btModalConfirm.on('ok', function() {
						getJSON(jsonObject, WEB_SERVICE_URL + '/podStatusUpdateWS/updatePODStatusDetails.do', _this.setPODUpdate, EXECUTE_WITH_ERROR);
						showLayer();
					});
						
					btModalConfirm.on('cancel', function() {
						$('#updatePodReceive').show();
						hideLayer();
					});					
				}, setPODUpdate : function(response) {
					hideLayer();
						
					if(response.wayBillIdIdArray != undefined && response.wayBillIdIdArray.length > 0){
						for(const element of response.wayBillIdIdArray){
							$('#tr_'+element).remove();
						}
					}
					
					$('#updatePodReceive').show();					
				}, setPODSuccess : function(response){
					hideLayer();
					
					if(response.podWayBillId != undefined)
						showAlertMessage('success', 'POD Received Successfully !');
				}
			});
		});

function loadPodDocumentSelection(row) {
	let select = $('#updateStatusEle_' + row).val();
	if(showPodDocument){
		if(select == '2') {
			setPodDocumentTypes(row);
		} else {
			destroyMultiselectPodDocumentType(row);
			$('#updateDocumentEle_' + row).css('display', 'none');
		}
	}
}

function getAllCheckBoxSelectValue(row) {
	
	let podDocTypeIds			= [];
	let selected				= $("#updateDocumentEle_" + row + " option:selected");
	
	selected.each(function () {
		podDocTypeIds.push($(this).val());
	});
	
	return podDocTypeIds.join(',');
}

function destroyMultiselectPodDocumentType(row){
	$('#updateDocumentEle_'+row).multiselect('destroy');
}

function multiselectPodDocumentType(row){
	destroyMultiselectPodDocumentType(row);

	$('#updateDocumentEle_'+row).multiselect({
		includeSelectAllOption: true,
		maxHeight: 200
	});
}

function setPodDocumentTypes(row) {
	$('#updateDocumentEle_' + row +' option[value]').remove();
	
	if(!jQuery.isEmptyObject(podDocumentList)) {	
		for(const element of podDocumentList) {
			$('#updateDocumentEle_'+ row).append($("<option>").attr('value', element.podDocumentTypeId).text(element.podDocumentTypeName));
		}
	}
	
	multiselectPodDocumentType(row);
}

function selectAllLrsForPODReceive(param){
	
	let table = $("#podWayBillStatus");
	let count 	= parseFloat(table[0].rows.length-1);
	
	for (let row = count; row > 0; row--){
		if(table[0].rows[row].style.display == ''){
			table[0].rows[row].cells[0].firstChild.checked = param;
		}
	}
}

function selectPodStatusForAll(value){
	let table = $("#podWayBillStatus");
	let count 	= parseFloat(table[0].rows.length-1);
	
	for (let row = count; row > 0; row--){
		let wayBillId = 	table[0].rows[row].cells[0].firstChild.value;
	
		if($("#updateStatusEle_" + wayBillId+" option[value="+value+"]").length > 0){
			$("#updateStatusEle_" + wayBillId).val(value);
			$("#wayBills_" + wayBillId).prop('checked',true);
		} else{
			$("#updateStatusEle_" + wayBillId).val(0);
			$("#wayBills_" + wayBillId).prop('checked',false);
		}
	}
}

function setPodRemark(){
    var table = $("#podWayBillStatus");
    var count     = parseFloat(table[0].rows.length-1);
    for (var row = count; row > 0; row--){
        var wayBillId =     table[0].rows[row].cells[0].firstChild.value;
        $("#remarkInput_"+wayBillId).val($("#podRemarkEle").val());
    }
}

function remove(WaybillId){
	
	var btModalConfirm = new Backbone.BootstrapModal({
		content		: 	"Are you sure you want to Remove ?",
		modalWidth 	: 	30,
		title		:	'Remove LR',
		okText		:	'Yes',
		showFooter 	: 	true,
		okCloses	:	true
	}).open();
	btModalConfirm.on('ok', function() {
		$("#tr_"+WaybillId).remove();
		
	});
	
	btModalConfirm.on('cancel', function() {
		btModalConfirm.close();
	});
}