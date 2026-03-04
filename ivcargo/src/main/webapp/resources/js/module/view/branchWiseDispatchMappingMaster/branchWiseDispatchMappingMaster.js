let branchList;
let maximumNoOfTPT = 1;
let Selectizewrapper2;
define([
	'marionette'
	,'errorshow'
	,'JsonUtility'
	,'messageUtility'
	,'nodvalidation'
	,'validation'
	,'autocompleteWrapper'
	,'focusnavigation'
	,'/ivcargo/resources/js/backbone/backbone.bootstrap-modal.js'
	], function(Marionette) {
	'use strict'; 
	let myNod,
	_this;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
			this.$el.html(this.template);
		}, render : function() {
			getJSON(null, WEB_SERVICE_URL	+ '/master/branchWiseDispatchMappingMasterWS/getBranchMappingElementConfiguration.do?', _this.setElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setElements: function(response) {
			let loadelement		= new Array();
			let baseHtml		= new $.Deferred();
			loadelement.push(baseHtml);
		
			$("#mainContent").load("/ivcargo/html/master/branchWiseDispatchMappingMaster/branchWiseDispatchMappingMaster.html", function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				maximumNoOfTPT	= response.maximumNoOfTPT;
				branchList		= response.branchList;
				
				let autoBranchName			= new Object();
				autoBranchName.primary_key	= 'branchId';
				autoBranchName.field		= 'branchName';
				$("#branchEle").autocompleteCustom(autoBranchName);
				
				let autoBranchType = $("#branchEle").getInstance();
				
				$(autoBranchType).each(function() {
					this.option.source = branchList;
				});
				
				myNod.add({
					selector: '#branchEle',
					validate: 'validateAutocomplete:#branchEle_primary_key',
					errorMessage: 'Select Branch !'
				});
				
				$("#branchEle").on("change", function () {
					$('#middle-border-boxshadow').addClass('hide');
					$('#branchWiseDispatchDetails thead').empty();
					$('#branchWiseDispatchDetails tbody').empty();
					$('#branchWiseDispatchDetails tfoot').empty();
					$('#topSaveDelBtn tbody').empty();
					$('#bottomSaveDelBtn tbody').empty();
				});
				
				$("#searchBtn").click(function(){
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmit();
				});
				
				$("#viewBtn").click(function(){
					_this.viewAll();
				});
								
				hideLayer();
			});
		}, onSubmit : function() {
			showLayer();
			let jsonObject = new Object();
			jsonObject.sourceBranchId = $("#branchEle_primary_key").val();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/master/branchWiseDispatchMappingMasterWS/getBranchMappingDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}, setReportData : function (response) {
			if (response.message != undefined) {
				$('#middle-border-boxshadow').addClass('hide');
				hideLayer();
				return;
			}
			
			$('#middle-border-boxshadow').removeClass('hide');
			$('#branchWiseDispatchDetails thead').empty();
			$('#branchWiseDispatchDetails tbody').empty();
			$('#branchWiseDispatchDetails tfoor').empty();
			$('#topSaveDelBtn tbody').empty();
			$('#bottomSaveDelBtn tbody').empty();
			
			let crossingDestHm	= response.crossingDestHm;
			
			branchList =  branchList.filter(branch => branch.branchId != 0);
			
			let columnArray				= [];
			
			columnArray.push( "<td class='creditlevel' style=' width:18%;text-align: left; vertical-align: middle; width:20%'>" +
					"<button class='btn btn-success onSave' >Save All</button> " +
					 "<button class='btn btn-danger onDelete'>Delete All</button>" + "</td>");
					 
			$('#topSaveDelBtn tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
			columnArray	= [];
			
			columnArray.push("<th class = 'creditlevel' style='text-align: center; vertical-align: middle; width:10%'>Destination Branch</th>");
			
			for(let i = 1; i <= maximumNoOfTPT; i++){
				columnArray.push("<th class = 'balanceColumn creditlevel' style='  width:18%; text-align: center; vertical-align: middle; background-color: #f7dd0d96;'> TPT_"+ Number(i) +"</th>");
			}
			
			columnArray.push("<th class = 'creditlevel' style='text-align: center; vertical-align: middle; width:18%'>Edit</th>");

			$('#branchWiseDispatchDetails thead').append('<tr>' + columnArray.join(' ') + '</tr>');
			columnArray = [];
			
			for(const element of branchList) {
				columnArray.push("<td class = 'creditlevel' style='width:10%; text-align: center; vertical-align: middle; background-color: #57db2796 ; word-wrap:break-word; white-space: normal;word-break: normal;'>" + element.branchName + "</td>");
			
				let sequenceHm = crossingDestHm[element.branchId];
				
				for (let j = 1; j <= maximumNoOfTPT; j++) {
					let selectedBranchId = sequenceHm && sequenceHm[j] ? sequenceHm[j].crossingBranchId : 0;
					let selectedBranchName = "";

					for (const element1 of branchList) {
						if (Number(selectedBranchId) > 0 && Number(element1.branchId) === Number(selectedBranchId)) {
							selectedBranchName = element1.branchName;
							break;
						}
					}

				  let autocompleteInput = `
					<td class='creditlevel' style='width:18%; text-align: left; vertical-align: middle; background-color: #57db2796;'>
								<div class=" col-xs-8 left-inner-addon">
									<input class="form-control autocompleteBranch" type="text" name="crossingBranchEle_${element.branchId}_${j}" data-tooltip="Search Account"
										placeholder="Branch" id="crossingBranchEle_${element.branchId}_${j}" data-selected-branchid="${selectedBranchId}" value="${selectedBranchName}" 
										onchange="onBranchChange(this);" style='width:160px;' />
								</div>
					</td>`;
					
					columnArray.push(autocompleteInput);
				}
			
				columnArray.push( "<td class='creditlevel' style=' width:18%;text-align: center; vertical-align: middle; width:20%'>" +
					"<button class='btn btn-success' id='save_"+ element.branchId+"' value='" + element.branchId + "' >Save</button> " +
					 "<button class='btn btn-danger' id='delete_"+ element.branchId+"'	value='" + element.branchId + "'>Delete</button>" + "</td>");
					 
				$('#branchWiseDispatchDetails tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
				columnArray	= [];
				
				$("#crossingBranchEle_" + element.branchId).bind("click", function() {
					let elementId		= $(this).attr('id');
					let branchId		= elementId.split('_')[1];
					_this.onSave(branchId);
				});
				
				$("#save_" + element.branchId).bind("click", function() {
					let elementId		= $(this).attr('id');
					let branchId		= elementId.split('_')[1];
					_this.onSave(branchId);
				});
					
				$("#delete_" + element.branchId).bind("click", function() {
					let elementId		= $(this).attr('id');
					let branchId		= elementId.split('_')[1];
					_this.onDelete(branchId);
				});
			}
			
			columnArray = [];
			columnArray.push( "<td class='creditlevel' style=' width:18%;text-align: left; vertical-align: middle; width:20%'>" +
					"<button class='btn btn-success onSave' >Save All</button> " +
					 "<button class='btn btn-danger onDelete'>Delete All</button>" + "</td>");
					 
			$('#bottomSaveDelBtn tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
			
			$(".onSave").bind("click", function() {
				_this.onSaveAll();
			});
					
			$(".onDelete").bind("click", function() {
				_this.onDeleteAll();
			});
			
			let branchesList = branchList;
			branchesList.unshift({ branchId: 0, branchName: "No Records" });
			
			$(".autocompleteBranch").each(function () {
				let elementId = $(this).attr("id"); // "crossingBranchEle_70309_1"
				let parts = elementId.split("_"); // ["crossingBranchEle", "70309", "1"]
				let branchIdToRemove = parts[1]; // "70309"
				
				let filteredBranchesList = branchesList.filter(branch => branch.branchId != branchIdToRemove);

				let autoBranchName = new Object();
				autoBranchName.primary_key	= 'branchId';
				autoBranchName.field		= 'branchName';
			
				$(this).autocompleteCustom(autoBranchName);
			
				let autoBranchType = $(this).getInstance();
			
				$(autoBranchType).each(function () {
					this.option.source = filteredBranchesList; // Using the same source as branchEle
				});
			
			});
			
			hideLayer();
		}, onSave : function (destBranchId) {
			showLayer();
			let crossingBranchMapList = new Array();
			
			let jsonObject = new Object();
			let srcBranchId = $("#branchEle_primary_key").val();
			
			if(Number(srcBranchId) <= 0) {
				showAlertMessage('error', "Please Select Branch");
				return;
			}
			
			jsonObject.sourceBranchId	= srcBranchId;
			jsonObject.destinationBranchId	= destBranchId;
			
			for(let i = 1; i <= maximumNoOfTPT; i++){
				let selectBranchId	= $('#crossingBranchEle_' + destBranchId + "_" + i + "_primary_key").val();

				if(!selectBranchId)
					selectBranchId	= $('#crossingBranchEle_' + destBranchId + "_" + i).attr("data-selected-branchid");
			
				let obj = new Object();
				obj.branchId = srcBranchId;
				obj.destinationMapId	= destBranchId;
				obj.sequenceId = i;
				obj.crossingBranchId = selectBranchId;
				crossingBranchMapList.push(obj);
			}
			
			jsonObject.crossingBranchMapList	= JSON.stringify(crossingBranchMapList);
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/master/branchWiseDispatchMappingMasterWS/saveBranchWiseDispatchMapping.do', _this.setAfterSaveResponse, EXECUTE_WITH_ERROR);
		}, onDelete : function(destBranchId) {
			showLayer();
			let jsonObject = new Object();
			let srcBranchId = $("#branchEle_primary_key").val();
			
			if(Number(srcBranchId) <= 0) {
				showAlertMessage('error', "Please Select Branch");
				return;
			}
			
			jsonObject.sourceBranchId		= srcBranchId;
			jsonObject.destinationBranchId	= destBranchId;
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/master/branchWiseDispatchMappingMasterWS/deleteBranchWiseDispatchMapping.do', _this.setAfterDeleteResponse, EXECUTE_WITH_ERROR);
		}, setAfterSaveResponse : function(response) {
			hideLayer();
		}, setAfterDeleteResponse : function(response) {
			if (response.message != undefined) {
				hideLayer();
				if(response.success == undefined || response.success == 'undefined')
					return;
			}

			let destMapId		= response.destBranchId;
			
			for (let j = 1; j <= maximumNoOfTPT; j++) {
				$('#crossingBranchEle_' + destMapId + "_" + j + "_primary_key").val('');
				$('#crossingBranchEle_' + destMapId + "_" + j).val('');
				$('#crossingBranchEle_' + destMapId + "_" + j).attr("data-selected-branchid", "0");
			}
			hideLayer();
		}, onSaveAll : function () {
			showLayer();
			let crossingBranchMapList = new Array();
			
			let jsonObject = new Object();
			let srcBranchId = $("#branchEle_primary_key").val();
			
			if(Number(srcBranchId) <= 0) {
				showAlertMessage('error', "Please Select Branch");
				return;
			}
			
			jsonObject.srcBranchId	= srcBranchId;
			
			for(const element of branchList) {
				let destBranchId = element.branchId;
				
				for(let i = 1; i <= maximumNoOfTPT; i++) {
					let selectBranchId	= $('#crossingBranchEle_' + destBranchId + "_" + i + "_primary_key").val();
	
					if(!selectBranchId)
						selectBranchId	= $('#crossingBranchEle_' + destBranchId + "_" + i).attr("data-selected-branchid");
				
					let obj = new Object();
					obj.branchId = srcBranchId;
					obj.destinationMapId	= destBranchId;
					obj.sequenceId = i;
					obj.crossingBranchId = selectBranchId;
					crossingBranchMapList.push(obj);
				}
			}
			
			jsonObject.crossingBranchMapList	= JSON.stringify(crossingBranchMapList);
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/master/branchWiseDispatchMappingMasterWS/saveBranchWiseDispatchMapping.do', _this.setAfterResponse, EXECUTE_WITH_ERROR);
		}, onDeleteAll : function() {
			showLayer();
			let jsonObject = new Object();
			let srcBranchId = $("#branchEle_primary_key").val();
			
			if(Number(srcBranchId) <= 0) {
				showAlertMessage('error', "Please Select Branch");
				return;
			}
			
			jsonObject.sourceBranchId	= srcBranchId;
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/master/branchWiseDispatchMappingMasterWS/deleteBranchWiseDispatchMapping.do', _this.setAfterResponse, EXECUTE_WITH_ERROR);
		}, setAfterResponse : function(response) {
			if (response.message != undefined) {
				hideLayer();

				if(response.success == undefined || response.success == 'undefined')
					return;
			}
			
			$('#middle-border-boxshadow').addClass('hide');
			$('#branchWiseDispatchDetails thead').empty();
			$('#branchWiseDispatchDetails tbody').empty();
			$('#branchWiseDispatchDetails tfoot').empty();
			$('#topSaveDelBtn tbody').empty();
			$('#bottomSaveDelBtn tbody').empty();
			hideLayer();
		}, viewAll : function() {
			showLayer();
			let jsonObject = new Object();
			jsonObject.maximumNoOfTPT	= maximumNoOfTPT;
			localStorage.setItem("DispatchMasterJsonObject", JSON.stringify(jsonObject));
			window.open("Master.do?pageId=340&eventId=3&modulename=viewAllBranchWiseDispatchMappingMaster", "_blank");
			hideLayer();
		}
	});
});

function onBranchChange(autoId) {
	let elementId = $(autoId).attr("id");
	let parts = elementId.split("_");
	let destBranchId = parts[1]; // "70309"
	let sequenceId = parts[2]; // "70309"
	
	let selectedBranchIds = new Set();
	
	for (let j = 0; j < maximumNoOfTPT; j++) {
		
		let selectBranchId	= $('#crossingBranchEle_' + destBranchId + "_" + j + "_primary_key").val();

		if(!selectBranchId)
			selectBranchId	= $('#crossingBranchEle_' + destBranchId + "_" + j).attr("data-selected-branchid");
			
		if (!selectBranchId || selectBranchId === "0")
			continue;
			
		if (selectedBranchIds.has(selectBranchId)) {
			$('#crossingBranchEle_' + destBranchId + "_" + sequenceId + "_primary_key").val(0); // Set ID to 0
			$('#crossingBranchEle_' + destBranchId + "_" + sequenceId).val("No Records");
			showAlertMessage('error', "The same branch cannot be selected multiple times!");
			return; // Stop further execution
		}
		
		selectedBranchIds.add(selectBranchId);
	}
}
