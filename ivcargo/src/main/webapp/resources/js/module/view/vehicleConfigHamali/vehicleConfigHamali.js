var selectedLhpvNoList 	= new Array();
var doneTheStuffEdit	= false;

define([ 
     	PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,'JsonUtility'
     ,'messageUtility'
     	,'nodvalidation'
     	,'focusnavigation'//import in require.config
     	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
     	],function(Selection) {
	'use strict';// this basically give strictness to this specific js
	var jsonObject	= new Object(),
	myNod,
	doneTheStuff = false,
	vehicleConfigHamaliDetailsList		= new Array(),
	loadingHamaliDetailsList			= new Array(),
	doneTheStuff,
	_this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(){
			_this = this;
		}, render: function() {
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/vehicleConfigHamaliWS/getVehicleConfigHamaliElementConfiguration.do?', _this.setElements, EXECUTE_WITHOUT_ERROR);
		
		}, setElements : function(response) {
			
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/vehicleConfigHamali/vehicleConfigHamali.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				var keyObject = Object.keys(response);
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]]) {
						$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
					}
				}
				
				var elementConfiguration	= new Object();
				
				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
				
				response.elementConfiguration			= elementConfiguration;
				response.isCalenderSelection	    	= true;
				response.sourceAreaSelection			= true;
				response.AllOptionsForRegion  	 		= true;
				response.AllOptionsForSubRegion  		= true;
				response.AllOptionsForBranch 	 		= true;
				
				Selection.setSelectionToGetData(response);
				
				myNod = Selection.setNodElementForValidation(response);
				
				hideLayer();
				
				$("#searchBtn").click(function() {
					myNod.performCheck();

					if(myNod.areAll('valid')) {
						_this.onFind(_this);								
					}
				});
			});
		},onFind : function() {
			jsonObject	= Selection.getElementData();

			getJSON(jsonObject, WEB_SERVICE_URL	+ '/vehicleConfigHamaliWS/getVehicleConfigHamaliDetails.do?',	_this.setData, EXECUTE_WITH_ERROR);
			showLayer();
		}, setData : function (response) {
			
			if(response.message != undefined) {
				hideLayer();
				$('#middle-border-boxshadow').addClass('hide');
				return;
			}
			
			if(response.vehicleConfigHamaliDetailsList != undefined && response.vehicleConfigHamaliDetailsList.length > 0) {
				
				$('#middle-border-boxshadow').removeClass('hide');
				$('#vehicleConfigHamaliDetails').empty();
				
				vehicleConfigHamaliDetailsList	= response.vehicleConfigHamaliDetailsList;
				
				var columnArray		= new Array();

				for (var i = 0; i < vehicleConfigHamaliDetailsList.length; i++) {
					var obj		= vehicleConfigHamaliDetailsList[i];
					
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i + 1) + "</td>");
					
					if(obj.lhpvHamaliDone == 1) {
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>"
								+ "<input class='form-control' type='hidden' name='vehicleConfigHamaliId_" + obj.lhpvId + "' style='text-transform: uppercase;' id='vehicleConfigHamaliId_" + obj.lhpvId + "' value='"+obj.vehicleConfigHamaliId+"'/></input>"
								+ "<input class='form-control' type='hidden' name='sourceBranchId_" + obj.lhpvId + "' style='text-transform: uppercase;' id='sourceBranchId_" + obj.lhpvId + "' value='"+obj.sourceBranchId+"'/></input>"
								+ "<input class='form-control' type='hidden' name='destinationBranchId_" + obj.lhpvId + "' style='text-transform: uppercase;' id='destinationBranchId_" + obj.lhpvId + "' value='"+obj.destinationBranchId+"'/></input>"
								+ "<input class='form-control' type='hidden' name='vehicleNumberMasterId_" + obj.lhpvId + "' style='text-transform: uppercase;' id='vehicleNumberMasterId_" + obj.lhpvId + "' value='"+obj.vehicleNumberMasterId+"'/></input>"
								+ "<input class='form-control' type='hidden' name='vehicleOwnerType_" + obj.lhpvId + "' style='text-transform: uppercase;' id='vehicleOwnerType_" + obj.lhpvId + "' value='"+obj.vehicleOwnerType+"'/></input>"
								+ "<input class='form-control' type='hidden' name='registeredOwner_" + obj.lhpvId + "' style='text-transform: uppercase;' id='registeredOwner_" + obj.lhpvId + "' value='"+obj.registeredOwner+"'/></input>"
								+ "<input class='form-control' type='hidden' name='loadingPerTonAmount_" + obj.lhpvId + "' style='text-transform: uppercase;' id='loadingPerTonAmount_" + obj.lhpvId + "' value='"+obj.loadingPerTonAmount+"'/></input>"
								+ "<input class='form-control' type='hidden' name='thappiPerTonAmount_" + obj.lhpvId + "' style='text-transform: uppercase;' id='thappiPerTonAmount_" + obj.lhpvId + "' value='"+obj.thappiPerTonAmount+"'/></input>"
								+ "<input class='form-control' type='hidden' name='lhpvHamaliDone_" + obj.lhpvId + "' style='text-transform: uppercase;' id='lhpvHamaliDone_" + obj.lhpvId + "' value='"+obj.lhpvHamaliDone+"'/></input>"
								+ "</td>");
					} else {
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><input class='form-control' type='checkbox' name='checkBoxEle_" + obj.lhpvId + "' style='text-transform: uppercase;' id='checkBoxEle_" + obj.lhpvId + "' value='" + obj.lhpvId+"' onclick='addData(this)' /></input>"
								+ "<input class='form-control' type='hidden' name='vehicleConfigHamaliId_" + obj.lhpvId + "' style='text-transform: uppercase;' id='vehicleConfigHamaliId_" + obj.lhpvId + "' value='"+obj.vehicleConfigHamaliId+"'/></input>"
								+ "<input class='form-control' type='hidden' name='sourceBranchId_" + obj.lhpvId + "' style='text-transform: uppercase;' id='sourceBranchId_" + obj.lhpvId + "' value='"+obj.sourceBranchId+"'/></input>"
								+ "<input class='form-control' type='hidden' name='destinationBranchId_" + obj.lhpvId + "' style='text-transform: uppercase;' id='destinationBranchId_" + obj.lhpvId + "' value='"+obj.destinationBranchId+"'/></input>"
								+ "<input class='form-control' type='hidden' name='vehicleNumberMasterId_" + obj.lhpvId + "' style='text-transform: uppercase;' id='vehicleNumberMasterId_" + obj.lhpvId + "' value='"+obj.vehicleNumberMasterId+"'/></input>"
								+ "<input class='form-control' type='hidden' name='vehicleOwnerType_" + obj.lhpvId + "' style='text-transform: uppercase;' id='vehicleOwnerType_" + obj.lhpvId + "' value='"+obj.vehicleOwnerType+"'/></input>"
								+ "<input class='form-control' type='hidden' name='registeredOwner_" + obj.lhpvId + "' style='text-transform: uppercase;' id='registeredOwner_" + obj.lhpvId + "' value='"+obj.registeredOwner+"'/></input>"
								+ "<input class='form-control' type='hidden' name='loadingPerTonAmount_" + obj.lhpvId + "' style='text-transform: uppercase;' id='loadingPerTonAmount_" + obj.lhpvId + "' value='"+obj.loadingPerTonAmount+"'/></input>"
								+ "<input class='form-control' type='hidden' name='thappiPerTonAmount_" + obj.lhpvId + "' style='text-transform: uppercase;' id='thappiPerTonAmount_" + obj.lhpvId + "' value='"+obj.thappiPerTonAmount+"'/></input>"
								+ "<input class='form-control' type='hidden' name='lhpvHamaliDone_" + obj.lhpvId + "' style='text-transform: uppercase;' id='lhpvHamaliDone_" + obj.lhpvId + "' value='"+obj.lhpvHamaliDone+"'/></input>"
								+ "</td>");
					}
					
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><a style='cursor:pointer;'id='loadingHamaliNumber_" + obj.lhpvId + "'><b style='font-size: 14px'>"+obj.loadingHamaliNumber+"</b></a></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><a style='cursor:pointer;'id='lhpvDate_" + obj.lhpvId + "'><b style='font-size: 14px'>"+obj.lhpvDateString+"</b></a></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' id='lhpvNumber_" + obj.lhpvId + "' value='"+ obj.lhpvNumber +"'>" + (obj.lhpvNumber) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' id='vehicleNumber_" + obj.lhpvId + "' value='"+ obj.vehicleNumber +"'>" + (obj.vehicleNumber) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' id='branch_" + obj.lhpvId + "' value='"+ obj.branchName +"'>" + (obj.branchName) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' id='capacity_" + obj.lhpvId + "' value='"+ obj.capacity +"'>" + (obj.capacity) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' id='unladenWeight_" + obj.lhpvId + "' value='"+ obj.unladenWeight +"'>" + (obj.unladenWeight) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' id='carryingCapacity_" + obj.lhpvId + "' value='"+ obj.carryingCapacity +"'>" + (obj.carryingCapacity) + "</td>");
					
					if(obj.lhpvHamaliDone == 1) {
						columnArray.push("<td style='text-align: center; vertical-align: middle; width: 100px;'><input class='form-control' type='text' name='weighBridgeWeight_" + obj.lhpvId + "' value='' data-tooltip='Kata' placeholder='Kata' id='weighBridgeWeight_" + obj.lhpvId + "' value='"+obj.weighBridgeWeight+"' onkeypress='return isNumberKeyWithDecimal(event, this.id);' onkeyup='calcLoadingHamali(event,this," + obj.lhpvId+", "+obj.unladenWeight+", "+obj.loadingPerTonRate+", "+obj.loadingLevyRate+", "+obj.thappiLevyRate+");' readonly/></td>");
					} else {
						columnArray.push("<td style='text-align: center; vertical-align: middle; width: 100px;'><input class='form-control' type='text' name='weighBridgeWeight_" + obj.lhpvId + "' value='' data-tooltip='Kata' placeholder='Kata' id='weighBridgeWeight_" + obj.lhpvId + "' onkeypress='return isNumberKeyWithDecimal(event, this.id);' onkeyup='calcLoadingHamali(event,this," + obj.lhpvId+", "+obj.unladenWeight+", "+obj.loadingPerTonRate+", "+obj.loadingLevyRate+", "+obj.thappiLevyRate+");'/></td>");
					}
					
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' id='loadingAmount_" + obj.lhpvId + "' value='"+ obj.manualPerTonWeight +"'>" + (obj.manualPerTonWeight) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' id='loadingRate_" + obj.lhpvId + "' value='0'>" + (0) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' id='thappiAmount_" + obj.lhpvId + "' value='"+ obj.thappiAmount +"'>" + (obj.thappiAmount) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' id='thappiRate_" + obj.lhpvId + "' value='0'>" + obj.thappiRate + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' id='totalLoadingHamali_" + obj.lhpvId + "' value='0'>" + (0) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' id='loadingLevy_" + obj.lhpvId + "' value='0'>" + (0) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' id='thappiLevy_" + obj.lhpvId + "' value='"+ obj.thappiLevy +"'>" + (0) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' id='totalActualLoadingHamali_" + obj.lhpvId + "' value='"+ obj.thappiLevy +"'>" + (0) + "</td>");
					
					if(obj.lhpvHamaliDone == 1) {
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><input class='form-control' type='text' name='lhpvWiseRemark_" + obj.lhpvId + "' value='' data-tooltip='Remark' placeholder='Remark' id='lhpvWiseRemark_" + obj.lhpvId + "' readonly/></td>");
					} else {
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><input class='form-control' type='text' name='lhpvWiseRemark_" + obj.lhpvId + "' value='' data-tooltip='Remark' placeholder='Remark' id='lhpvWiseRemark_" + obj.lhpvId + "' /></td>");
					}
					
					$('#vehicleConfigHamaliDetailsTable tbody').append('<tr id="vehicleConfigHamaliDetails_'+ obj.lhpvId +'">' + columnArray.join(' ') + '</tr>');
					
					if(obj.lhpvHamaliDone == 1) {
						$("#loadingAmount_" + obj.lhpvId).html(Number(obj.manualPerTonWeight));
						$("#loadingRate_" + obj.lhpvId).html(Number(obj.loadingPerTonAmount));
						$("#totalActualLoadingHamali_" + obj.lhpvId).html(Number(obj.totalActualLoadingHamali));
						
						$('#weighBridgeWeight_'+ obj.lhpvId).val(obj.weighBridgeWeight);
						$('#lhpvWiseRemark_' + obj.lhpvId).val(obj.remark);
					} else {
						$("#totalActualLoadingHamali_" + obj.lhpvId).html(Number(obj.thappiRate));
					}
					
					columnArray	= [];
				}
			}
			
			$("#createVoucherBtn").click(function() {
				myNod.performCheck();

				if(myNod.areAll('valid')) {
					_this.createLoadingHamaliVoucher(_this);								
				}
			});
			
			hideLayer();
		}, createLoadingHamaliVoucher : function () {
			var vehicleConfigHamaliDetailsTable		= document.getElementById('vehicleConfigHamaliDetailsTable');

			if(selectedLhpvNoList != null && selectedLhpvNoList.length > 0) {
				if(typeof vehicleConfigHamaliDetailsTable !== 'undefined') {
					loadingHamaliDetailsList	= new Array();

					for (var i = 0; i < selectedLhpvNoList.length; i++) {
						var lhpvId					= Number(selectedLhpvNoList[i]);
						var vehicleConfigHamaliId	= Number($("#vehicleConfigHamaliId_" + lhpvId).val());

						let loadingHamaliDetailsObj	= new Object;

						loadingHamaliDetailsObj.lhpvId							= lhpvId;
						loadingHamaliDetailsObj.lhpvNumber						= $("#lhpvNumber_" + lhpvId).html();
						loadingHamaliDetailsObj.manualThappiWeight				= Number($("#thappiAmount_" + lhpvId).html());
						loadingHamaliDetailsObj.manualPerTonWeight				= Number($("#loadingAmount_" + lhpvId).html());
						loadingHamaliDetailsObj.thappiAmount					= 0;
						loadingHamaliDetailsObj.loadingHamali					= $("#loadingAmount_" + lhpvId).val();
						loadingHamaliDetailsObj.typeOfHamali					= 1;
						loadingHamaliDetailsObj.sourceBranchId					= $("#sourceBranchId_" + lhpvId).val();
						loadingHamaliDetailsObj.destinationBranchId				= $("#destinationBranchId_" + lhpvId).val();
						loadingHamaliDetailsObj.vehicleNumber					= $("#vehicleNumber_" + lhpvId).html();
						loadingHamaliDetailsObj.vehicleNumberMasterId			= $("#vehicleNumberMasterId_" + lhpvId).val();
						loadingHamaliDetailsObj.vehicleOwnerType				= $("#vehicleOwnerType_" + lhpvId).val();
						loadingHamaliDetailsObj.registeredOwner					= $("#registeredOwner_" + lhpvId).val();
						loadingHamaliDetailsObj.capacity						= Number($("#capacity_" + lhpvId).html());
						loadingHamaliDetailsObj.weighBridgeWeight				= Number($("#weighBridgeWeight_" + lhpvId).val());

						if(vehicleConfigHamaliId > 0) {
							loadingHamaliDetailsObj.lhpvHamaliDone				= 1;
						} else {
							loadingHamaliDetailsObj.lhpvHamaliDone				= 0;
						}

						loadingHamaliDetailsObj.loadingRemark					= $("#lhpvWiseRemark_" + lhpvId).val();
						loadingHamaliDetailsObj.loadingPerTonAmount				= $("#loadingRate_" + lhpvId).html();
						loadingHamaliDetailsObj.totalLoadingTimeHamali			= $("#totalLoadingHamali_" + lhpvId).html();
						loadingHamaliDetailsObj.totalActualLoadingHamali		= $("#totalActualLoadingHamali_" + lhpvId).html();
						
						loadingHamaliDetailsList.push(loadingHamaliDetailsObj);

					}
				}

				jsonObject	= Selection.getElementData();

				jsonObject.remark			=	$('#remarkEle').val();

				jsonObject.loadingHamaliDetailsList	= JSON.stringify(loadingHamaliDetailsList);
				
				if(!doneTheStuff) {
					doneTheStuff = true;

					var btModalConfirm = new Backbone.BootstrapModal({
						content		: 	"Are you sure you want to Create Voucher ?",
						modalWidth 	: 	30,
						title		:	'Loading Hamali',
						okText		:	'YES',
						showFooter 	: 	true,
						okCloses	:	true
					}).open();

					btModalConfirm.on('ok', function() {
						getJSON(jsonObject, WEB_SERVICE_URL	+ '/vehicleConfigHamaliWS/saveVehicleConfigHamaliDetails.do?',	_this.setSuccess, EXECUTE_WITH_ERROR);
						doneTheStuff = true;
						showLayer();
					});

					btModalConfirm.on('cancel', function() {
						$("#saveBtn").removeClass('hide');
						$("#saveBtn").attr("disabled", false);
						doneTheStuff = false;
						hideLayer();
					});
				}

			} else {
				showAlertMessage('error', 'Please Select Atleast 1 Lhpv !');
				return false;
			}
		},setSuccess : function (response) {
			if(response.message != undefined){
				hideLayer();
				return;
			}

			location.reload();
			hideLayer();
		}
	});
});

function addData(obj) {

	var lhpvId	= Number(obj.value);

	if(typeof obj !== 'undefined') {
		if(obj.checked && lhpvId > 0 && !selectedLhpvNoList.includes(lhpvId)) {
			selectedLhpvNoList.push(lhpvId);
		} else if(!obj.checked && lhpvId > 0 && selectedLhpvNoList.includes(lhpvId)) {
			var index = selectedLhpvNoList.indexOf(lhpvId);
			if (index > -1) {
				selectedLhpvNoList.splice(index, 1);
			}
		}
	}
}

function isNumberKeyWithDecimal(evt,id) {

	var charCode = (evt.which) ? evt.which : evt.keyCode;

	if(charCode==46){
		var txt=document.getElementById(id).value;
		if(!(txt.indexOf(".") > -1)){

			return true;
		}
	}
	if (charCode > 31 && (charCode < 48 || charCode > 57) )
		return false;

	return true;
}

function calcLoadingHamali(event, obj, lhpvId, unladenWeight, loadingPerTonAmount, loadingLevyRate, thappiLevyRate) {

	var weighBridgeWeight	= obj.value;

	var capacity 			= $("#capacity_" + lhpvId).html();
	var carryingCapacity	= $("#carryingCapacity_" + lhpvId).html();

	if(Number(weighBridgeWeight) > Number(capacity)) {
		showMessage('error', 'Kata Weight Cannot Be More Than Truck Capacity !');
		obj.value = 0;
		$("#loadingAmount_" + lhpvId).html(0);
		$("#loadingRate_" + lhpvId).html(0);
		return false;
	}

	if(Number(weighBridgeWeight) > 0 && !isNaN(weighBridgeWeight)) {
		$("#loadingAmount_" + lhpvId).html(Number(weighBridgeWeight) - Number(unladenWeight));
	} else {
		$("#loadingAmount_" + lhpvId).html(0);
	}

	var loadingAmount	= $("#loadingAmount_" + lhpvId).html();

	if(Number(loadingAmount) > 0 && Number(loadingPerTonAmount) > 0) {
		$("#loadingRate_" + lhpvId).html(Number(loadingPerTonAmount) * Number(loadingAmount) / 1000);
	} else {
		$("#loadingRate_" + lhpvId).html(0);
	}
	
	if(Number(loadingAmount) > Number(carryingCapacity)) {
		$("#thappiAmount_" + lhpvId).html(Number(loadingAmount));
	} else {
		$("#thappiAmount_" + lhpvId).html(Number(carryingCapacity));
	}

	var loadingRate	= $("#loadingRate_" + lhpvId).html();
	var thappiRate	= $("#thappiRate_" + lhpvId).html();
	
	if(Number(loadingRate) > 0 && Number(loadingLevyRate))
		$("#loadingLevy_" + lhpvId).html((Number(loadingLevyRate) / 1000) * Number(loadingRate));
	
	if(Number(thappiRate) > 0 && Number(thappiLevyRate))
		$("#thappiLevy_" + lhpvId).html((Number(thappiLevyRate) / 1000) * Number(thappiRate));

	$("#totalLoadingHamali_" + lhpvId).html(Number(loadingRate) + Number(thappiRate));
	
	var totalLoadingHamali	= $("#totalLoadingHamali_" + lhpvId).html();
	var loadingLevy			= $("#loadingLevy_" + lhpvId).html();
	var thappiLevy			= $("#thappiLevy_" + lhpvId).html();
	
	if(Number(totalLoadingHamali) > 0)
		$("#totalActualLoadingHamali_" + lhpvId).html(Number(totalLoadingHamali) + Number(loadingLevy) + Number(thappiLevy));
}