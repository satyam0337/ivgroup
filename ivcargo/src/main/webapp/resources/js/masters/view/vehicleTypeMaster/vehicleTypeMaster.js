let dataList = [];
define([
	'selectizewrapper',
	'JsonUtility',
	'messageUtility',
	'nodvalidation',
	PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
	PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js',
	'focusnavigation'
], function(Selectizewrapper) {
	'use strict';
	let jsonObject = {},myNod;
	let _this = '';
	return Marionette.LayoutView.extend({
		initialize: function() {
			_this = this;
		}, render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/selectOptionsWS/getVehicleTypeAutocomplete.do?', _this.getElementConfigDetails, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, getElementConfigDetails: function(response) {
			let loadelement = [];
			let baseHtml = $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/master/vehicleTypeMaster/vehicleTypeMaster.html", function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	:	response.vehicleTypeList,
					valueField		:	'vehicleTypeId',
					labelField		:	'name',
					searchField		:	'name',
					elementId		:	'vehicleTypeEle',
					create			:	false,
					maxItems		:	1,
					onChange: (value) => {
						_this.setDatainField(response, value);
					}				
				});
				
				$("#addBtn").on("click", function() {
					const name = $.trim($("#vehicleName").val()).toUpperCase();
					const exists = response.vehicleTypeList.some(v => v.name.toUpperCase() === name);
	
				/*	if (exists) {
						 showAlertMessage('error', 'Please Select Proper Vehicle !');
						 return;
					}*/
					_this.saveVehicleTypeData();
					$('#vehicleName').val('')				
					$('#capacity').val('')
				});
   
				$("#editBtn").on("click", function() {
					const btn = $(this);
					const currentOp = btn.data('op');
				
					if (currentOp === 'edit') {
						btn.data('op', 'save');
						btn.removeClass('btn-primary').addClass('btn-success');
						btn.attr('data-tooltip', 'Save');
						btn.find('[data-selector="editBtn"]').text('Save');
						_this.feildEnabled()
					} else {
						_this.feildDisabled()		
						btn.data('op', 'edit');
						btn.removeClass('btn-success').addClass('btn-primary');
						btn.attr('data-tooltip', 'Edit');
						btn.find('[data-selector="editBtn"]').text('Edit');
				
						if(confirm('Are you sure want to update data ?'))
							_this.editVehicleTypeData();
					}
				});
			
				$("#deleteBtn").on("click", function() {
					if(confirm('Are you sure want to delete this vehicle ?')){
						_this.deleteVehicletype();
						_this.resetVehicleTypeData();
					}
				});
				
				$("#resetBtn").on("click", function() {
					_this.resetVehicleTypeData();
				});
				
				$("#refreshBtn").on("click", function() {
					_this.refreshData(response);
				});
			
				$("#viewAllBtn").on("click", function() {
					_this.getAllData();
				});
			});
		}, getAllData: function() {
			window.open('viewDetails.do?pageId=340&eventId=2&modulename=vehicleTypeMasterDetails');
		}, saveVehicleTypeData: function() {
			jsonObject	= new Object();
			jsonObject.name					=  $("#vehicleName").val();
			jsonObject.capacity				=  $("#capacity").val();
			getJSON(jsonObject, WEB_SERVICE_URL+'/vehicleTypeWS/saveVehicleType.do', _this.setResponse, EXECUTE_WITHOUT_ERROR);
		}, editVehicleTypeData: function() {
			jsonObject	= new Object();
			jsonObject.vehicleTypeName		=  $("#vehicleName").val();
			jsonObject.capacity				=  $("#capacity").val();
			jsonObject["vehicleTypeId"]		= $('#vehicleTypeEle').val();
			getJSON(jsonObject, WEB_SERVICE_URL+'/vehicleTypeWS/updateVehicleTypeMasterData.do', _this.setResponse, EXECUTE_WITHOUT_ERROR);
		}, resetVehicleTypeData: function() {
			 $("#vehicleName").val('');
			 $("#capacity").val('');
		  	$('#vehicleTypeEle')[0].selectize.clear(); 
			_this.feildEnabled()
			_this.buttonEnabled()
		}, deleteVehicletype: function() {
			jsonObject	= new Object();
			const vehicleTypeId = $('#vehicleName').data('vehicleTypeId');
			
			jsonObject["vehicleTypeId"]				= vehicleTypeId;

			getJSON(jsonObject, WEB_SERVICE_URL+'/vehicleTypeWS/deleteVehicleTypeDetails.do', _this.setResponse, EXECUTE_WITHOUT_ERROR);
		}, refreshData: function(response) {
			refreshCache(VEHICLE_TYPE_MASTER, response.accountGroupId);
		}, setResponse: function(response) {
			hideLayer();
			
			if (response.message)
				$('#middle-border-boxshadow').addClass('hide');
				 _this.render();
		}, setDatainField : function(response, value) {
			_this.feildDisabled()
			_this.buttonDisabled()
			let res = response.vehicleTypeList.filter(el => el.vehicleTypeId == value);
			$('#vehicleName').data('vehicleTypeId', res[0].vehicleTypeId);

			$('#vehicleName').val(res[0].name)
			$('#capacity').val(res[0].capacity)
		}, feildEnabled : function() {
			$('#vehicleName').prop('disabled', false)				
			$('#capacity').prop('disabled', false)
		}, feildDisabled : function() {
			$('#vehicleName').prop('disabled', true)				
			$('#capacity').prop('disabled', true)
		}, buttonDisabled : function() {
			$('#editBtn').prop('disabled', false)
			$('#deleteBtn').prop('disabled', false)
			$('#addBtn').prop('disabled', true)
		}, buttonEnabled :function() {
			$('#editBtn').prop('disabled', true)
			$('#deleteBtn').prop('disabled', true)
			$('#addBtn').prop('disabled', false)
		}
	});
});
