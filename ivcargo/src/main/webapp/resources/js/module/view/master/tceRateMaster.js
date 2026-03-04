define([
	 "selectizewrapper"
	 ,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	 ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'JsonUtility'
	,'messageUtility'
	 ,'autocomplete'
	 ,'autocompleteWrapper'
	 ,'nodvalidation'
], function(Selectizewrapper, Selection) {
	'use strict';
	let jsonObject = new Object(),_this = '';
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/tceRateMasterWS/initialiseMaster.do?', _this.setRateMasterDetailsData, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setRateMasterDetailsData : function(response) {
			if(response.message != undefined) {
				hideLayer();
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
				return;
			}
			
			let loadelement 			= new Array();
			let baseHtml 				= new $.Deferred();
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/master/tceRateMaster/tceRateMaster.html", function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				let keyObject = Object.keys(response);

				for (const element of keyObject) {
					if (!response[element])
						$("*[data-attribute=" + element + "Col]").remove();
				}
				
				_this.setSelectionData(response);
				
			  	//let firstTab = new bootstrap.Tab(document.querySelector('#myTab li:last-child a'))
			 	//firstTab.show()
				
				$('#home-tab').click(function() {
					/*$('#routewise').show();
					$('#pickupdrop').hide();
					$('#routewise').addClass('fade show active');
					$('#pickupdrop').removeClass('fade show active');*/
				});
				
				$('#profile-tab').click(function() {
				/*	$('#routewise').hide();
					$('#pickupdrop').show();
					$('#routewise').removeClass('fade show active');
					$('#pickupdrop').addClass('fade show active');*/
				});
				
				_this.addNewRow();
				
				$('#addNewPickupDropRow').click(function() {
					_this.addNewRow();
				});
				
				$('.removeCurrentRow').click(function() {
					_this.removeCurrentRow(this);
				});
				
				$('#saveData').click(function() {
					_this.saveRates();
				});
				
				$('#viewRouteWiseRates').click(function() {
					_this.viewRouteWiseRates();
				});
				
				$('#viewPickupAndDrop').click(function() {
					_this.viewPickupAndDrop();
				});
				
				$('#savePickupDropRate').click(function() {
					_this.savePickupDropRate();
				});
				
				hideLayer();
			});
		}, setSelectionData : function(response) {
			Selectizewrapper.setAutocomplete({
				jsonResultList	: response.branchModel,
				valueField		: 'branchId',
				labelField		: 'branchName',
				searchField		: 'branchName',
				elementId		: 'srcBranchEle',
				onChange		: _this.getSlabsOfBranch,
				maxItems 		: 1
			});
			
			Selectizewrapper.setAutocomplete({
				jsonResultList	: response.branchModel,
				valueField		: 'branchId',
				labelField		: 'branchName',
				searchField		: 'branchName',
				elementId		: 'destBranchEle',
				maxItems 		: 1
			});
			
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	response.branchModel,
				valueField		:	'branchId',
				labelField		:	'branchName',
				searchField		:	'branchName',
				elementId		:	'pickupBranchEle',
				create			: 	false,
				maxItems		: 	1
			});
		}, getSlabsOfBranch : function() {
			let jsonObject	= {};
			
			jsonObject.sourceBranchId	= $('#srcBranchEle').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/slabMasterWS/viewAllConfigSlab.do?', _this.setSlabs, EXECUTE_WITHOUT_ERROR);
		}, setSlabs : function(response)  {
			if(response.SlabMaster == undefined)
				return;
			
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	response.SlabMaster,
				valueField		:	'slabMasterId',
				labelField		:	'range',
				searchField		:	'range',
				elementId		:	'slabEle',
				create			: 	false,
				maxItems		: 	1
			});
		}, saveRates : function() {
			if(!_this.validateSourceAndDestination())
				return;
				
			if($('#rateEle').val() == 0 || $('#rateEle').val() == '') {
				showMessage('error', 'Enter rate !');
				return;
			}
			
			if($('#slabEle').val() == 0 || $('#slabEle').val() == '') {
				showMessage('error', 'Select Slabs !');
				return;
			}
				
			showLayer();
			
			let jsonObject = {};
			
			_this.basicDataToSaveAndGet(jsonObject);
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/tceRateMasterWS/insertAndUpdateRateDetails.do?', _this.setResponse, EXECUTE_WITHOUT_ERROR);
		}, basicDataToSaveAndGet : function(jsonObject) {
			jsonObject.sourceBranchId				= $('#srcBranchEle').val();
			jsonObject.destinationBranchId			= $('#destBranchEle').val();
			jsonObject.slabMasterId					= $('#slabEle').val();
			jsonObject.rate							= $('#rateEle').val();
			jsonObject.isFixedSlabAmt				= $('#fixChargeEle').prop("checked");
		}, savePickupDropRate : function() {
			if(!_this.validatePickupBranch())
				return;
				
			showLayer();
			
			let jsonObject = {};
			
			let dataArray	= [];
			
			let isValid	= true;
			
			$("table tbody tr").each(function() {
				jsonObject	= {};
				
				let rateMasterId= $(this).find("td:eq(0) input[type='text']").val();
				let minWeight	= $(this).find("td:eq(1) input[type='text']").val();
				let maxWeight	= $(this).find("td:eq(2) input[type='text']").val();
				let minRange	= $(this).find("td:eq(3) input[type='text']").val();
				let maxRange	= $(this).find("td:eq(4) input[type='text']").val();
				let rate		= $(this).find("td:eq(5) input[type='text']").val();
				let etaHours	= $(this).find("td:eq(6) input[type='text']").val();
				
				if(minWeight > maxWeight) {
					isValid		= false;
					showMessage('error', 'Minimum weight cannot be more than Maximum weight !');
					return;
				}
				
				if(minRange > maxRange) {
					isValid		= false;
					showMessage('error', 'Minimum KM cannot be more than Maximum KM !');
					return;
				}
				
				jsonObject.sourceBranchId		= $('#pickupBranchEle').val();
				jsonObject.destinationBranchId	= $('#destinationBranchId').val();
				jsonObject.rateTypeId			= $('#rateTypeEle').val();
				jsonObject.rateMasterId			= rateMasterId;
				jsonObject.minWeight			= minWeight;
				jsonObject.maxWeight			= maxWeight;
				jsonObject.minKm				= minRange;
				jsonObject.maxKm				= maxRange;
				jsonObject.rate					= rate;
				jsonObject.etaHours				= etaHours;
				jsonObject.isFixedRate			= $(this).find('input:checkbox').is(':checked');
				
				if((minWeight >= 0 && maxWeight > 0 || minRange > 0 && maxRange > 0) && rate > 0)
					dataArray.push(jsonObject);
			});
			
			if(!isValid) {hideLayer(); return;}
			
			if(dataArray.length == 0) {
				hideLayer();
				showMessage('error', 'Please enter rate !');
				return;
			}
			
			jsonObject	= {};
			
			jsonObject.dataArray	= JSON.stringify(dataArray);
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/tceRateMasterWS/insertPickupAndDropRateDetails.do?', _this.setResponse, EXECUTE_WITHOUT_ERROR);
		}, setResponse : function(response) {
			hideLayer();
					
			if(response.message != undefined) {
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			}
		}, eventForCloneRow : function() {
			$('.cloneCurrentRow').click(function() {
				_this.cloneCurrentRow(this);
			});
		}, eventForRemoveRow : function() {
			$('.removeCurrentRow').click(function() {
				_this.removeCurrentRow(this);
			});
		}, addNewRow : function() {
			let jsonArray	= [];
				
			jsonArray.push('<td class="hide"><input type="text" id="rateMasterId" value="0" class="form-control"/></td>');
			jsonArray.push('<td><input type="text" id="minWeight" value="0" class="form-control" onkeypress="if(this.value==0)this.value=;return validAmount(event);if(event.altKey==1){return false;}"/></td>');
			jsonArray.push('<td><input type="text" id="maxWeight" value="0" class="form-control" onkeypress="if(this.value==0)this.value=;return validAmount(event);if(event.altKey==1){return false;}"/></td>');
			jsonArray.push('<td><input type="text" id="minKm" value="0" class="form-control" onkeypress="if(this.value==0)this.value=;return validAmount(event);if(event.altKey==1){return false;}"/></td>');
			jsonArray.push('<td><input type="text" id="maxKm" value="0" class="form-control" onkeypress="if(this.value==0)this.value=;return validAmount(event);if(event.altKey==1){return false;}"/></td>');
			jsonArray.push('<td><input type="text" id="rate" value="0" class="form-control" onkeypress="if(this.value==0)this.value=;return validAmount(event);if(event.altKey==1){return false;}"/></td>');
			jsonArray.push('<td><input type="text" id="etaHours" value="0" class="form-control" onkeypress="if(this.value==0)this.value=;return validAmount(event);if(event.altKey==1){return false;}"/></td>');
			jsonArray.push('<td><input type="checkbox" id="isFixed"/></td>');
			jsonArray.push('<td><button type = "button" class = "removeCurrentRow btn btn-success">Remove</button></td>');
			jsonArray.push('<td><button type = "button" class = "deleteCurrentRow btn btn-primary hide">Delete</button></td>');
				
			$('#pickupAndDropTr').append('<tr>' + jsonArray.join(' ') + '</tr>');
			_this.eventForCloneRow();
			_this.eventForRemoveRow();
		}, cloneCurrentRow : function(obj) {
			let $curRow = $(obj).closest('tr'),
			$newRow = $curRow.clone(true);
			$curRow.after($newRow);	
		}, removeCurrentRow : function(obj) {
			let count = $('#mainTable tr').length;
			
			if(count <= 2) {
				showMessage('error', 'You cannot remove last row !');
				
				return;
			}
			
			$(obj).closest('tr').remove();
		}, validatePickupBranch : function() {
			if($('#pickupBranchEle').val() == 0 || $('#pickupBranchEle').val() == '') {
				showMessage('error', 'Select branch first !');
				return false;
			}
			
			if($('#rateTypeEle').val() == 0 || $('#rateTypeEle').val() == '') {
				showMessage('error', 'Select Pickup or Drop !');
				return false;
			}
			
			return true;
		}, viewPickupAndDrop : function() {
			if(!_this.validatePickupBranch())
				return;
			
			showLayer();
			
			let jsonObject	= {};
			
			jsonObject.sourceBranchId			= $('#pickupBranchEle').val();
			jsonObject.rateTypeId				= $('#rateTypeEle').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/tceRateMasterWS/viewAllPickupAndDropRates.do?', _this.setPickupDropRates, EXECUTE_WITHOUT_ERROR);
		}, setPickupDropRates : function(response) {
			hideLayer();
			
			if(response.rateList == undefined) {
				$("#pickupAndDropTr").find("tr:gt(0)").remove();
				return;
			}
			
			$("#pickupAndDropTr").find("tr:gt(0)").remove();
			
			let rateList	= response.rateList;
			
			let jsonArray	= [];
			
			for(const element of rateList) {
				let obj	= element;
				
				jsonArray	= [];
				
				jsonArray.push('<td class="hide"><input type="text" id="rateMasterId" value="'+ obj.rateMasterId +'" class="form-control"/></td>');
				jsonArray.push('<td><input type="text" id="minWeight" value="'+ obj.minWeight +'" class="form-control" onkeypress="if(this.value==0)this.value=;return validAmount(event);if(event.altKey==1){return false}" readonly/></td>');
				jsonArray.push('<td><input type="text" id="maxWeight" value="'+ obj.maxWeight +'" class="form-control" onkeypress="if(this.value==0)this.value=;return validAmount(event);if(event.altKey==1){return false}" readonly/></td>');
				jsonArray.push('<td><input type="text" id="minKm" value="'+ obj.minKm +'" class="form-control" onkeypress="if(this.value==0)this.value=;return validAmount(event);if(event.altKey==1){return false}" readonly/></td>');
				jsonArray.push('<td><input type="text" id="maxKm" value="'+ obj.maxKm +'" class="form-control" onkeypress="if(this.value==0)this.value=;return validAmount(event);if(event.altKey==1){return false}" readonly/></td>');
				jsonArray.push('<td><input type="text" id="rate" value="'+ obj.rate +'" class="form-control" onkeypress="if(this.value==0)this.value=;return validAmount(event);if(event.altKey==1){return false}"/></td>');
				
				if(obj.isFixedRate)
					jsonArray.push('<td><input type="checkbox" id="isFixed" checked/></td>');
				else
					jsonArray.push('<td><input type="checkbox" id="isFixed" class=""/></td>');
					
				jsonArray.push('<td><button type = "button" class = "removeCurrentRow btn btn-success">Remove</button></td>');
				jsonArray.push('<td><button type = "button" id = "rate_'+ obj.rateMasterId +'" class = "deleteRecords btn btn-primary">Delete</button></td>');
				
				$('#pickupAndDropTr').append('<tr id="editInvoiceTr">' + jsonArray.join(' ') + '</tr>');
			}
			
			$('.deleteCurrentRow').removeClass('hide');
			
			$('.deleteRecords').click(function() {
				_this.deleteRecords((this.id).split("_")[1]);
				$(this).closest('tr').remove();
			});
			
			//_this.eventForCloneRow();
			_this.eventForRemoveRow();
		}, viewRouteWiseRates : function() {
			if(!_this.validateSourceAndDestination())
				return;
				
			showLayer();
			
			let jsonObject	= {};
			
			jsonObject.sourceBranchId				= $('#srcBranchEle').val();
			jsonObject.destinationBranchId			= $('#destBranchEle').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/tceRateMasterWS/viewAllRouteRates.do?', _this.setRouteWiseRates, EXECUTE_WITHOUT_ERROR);
		}, validateSourceAndDestination : function() {
			if($('#srcBranchEle').val() == 0 || $('#srcBranchEle').val() == '') {
				showMessage('error', 'Select Source Branch first !');
				return false;
			}
			
			if($('#destBranchEle').val() == 0 || $('#destBranchEle').val() == '') {
				showMessage('error', 'Select Destination Branch First !');
				return false;
			}
			
			if($('#srcBranchEle').val() == $('#destBranchEle').val()) {
				showMessage('error', 'Source and Destination Branch cannot be same !');
				return false;
			}
			
			return true;
		}, setRouteWiseRates : function(response) {
			hideLayer();
			
			if(response.message != undefined) {
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				return;
			}
			
			$(".modal-body").empty();
			let formGroup 	= $(".modal-body");
			
			let rateList	= response.rateList;
			
			let modal1 = new bootstrap.Modal(document.getElementById('staticBackdrop'));
			
			let table = $('<table class="table table-hover table-sm" id="routeRatesDetail">');
			
			let jsonArray	= [];
			
			jsonArray.push('<th>Sr. No.</th>');
			jsonArray.push('<th>Slab Range</th>');
			jsonArray.push('<th>Rate</th>');
			jsonArray.push('<th>Is Fixed</th>');
			jsonArray.push('<th>Delete</th>');
			
			table.append('<tr>' + jsonArray.join(' ') + '</tr>');
			formGroup.append(table);
			
			let i = 1;
			
			rateList.forEach(obj => {
				jsonArray	= [];
				
				let tr 	= $('<tr>');
				let td1	= $('<td>');
				let td2	= $('<td>');
				let td3	= $('<td>');
				let td4	= $('<td>');
				let td5	= $('<td>');
				
				td1.append(i);
				td2.append(obj.minWeight + "-" + obj.maxWeight);
				td3.append(obj.rate);
				
				if(obj.fixedSlabAmt)
					td4.append('Yes');
				else
					td4.append('No');
					
				let buttons = $("<button>");
				buttons.attr("class", "btn btn-danger");
				buttons.text("Delete");
				
				$(buttons).click(function() {
					_this.deleteRouteRate(obj.rateMasterId);
					$(this).closest('tr').remove();
				});

				td5.append(buttons);

				tr.append(td1);
				tr.append(td2);
				tr.append(td3);
				tr.append(td4);
				tr.append(td5);
				
				table.append(tr);
				i++;
			});
			
			formGroup.append(table);
			
			modal1.show();
		}, deleteRouteRate : function(rateMasterId) {
			showLayer();
			
			let jsonObject	= {};
			
			jsonObject.rateMasterId	= rateMasterId;
			
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/tceRateMasterWS/deleteRateMasterRate.do?', _this.setResponse, EXECUTE_WITHOUT_ERROR);			
		}, deleteRecords : function(rateMasterId) {
			showLayer();
			
			let jsonObject	= {};
			
			jsonObject.rateMasterId	= rateMasterId;
			
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/tceRateMasterWS/deletePickupAndDropRates.do?', _this.setResponse, EXECUTE_WITHOUT_ERROR);
		}
	});
});