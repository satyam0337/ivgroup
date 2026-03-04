 define([ 
	'marionette'
		 ,'selectizewrapper'
		 ,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
         ,'JsonUtility'
         ,'messageUtility'
         ,'nodvalidation'
		 ,'focusnavigation'
         ],
         function(Marionette, Selectizewrapper, Selection) {
	'use strict';// this basically give strictness to this specific js
	let jsonObject	= new Object(),
	myNod,
	srcount = 0,
	chargesArr = new Array(),
	showAllGroupsOption = false,
	bookingChargesList = null, deliveryChargesList = null, lhpvChargesList = null, operationTypeList = null,
	previousChargesList = null, previousLHPVChargesList = null,
	_this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function() {
			_this = this;
		}, render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/chargeMappingMasterWS/getChargeMappingMasterElementConfiguration.do?', _this.setElements, EXECUTE_WITHOUT_ERROR);
		}, setElements : function(response) {
			
			let loadelement 			= new Array();
			let baseHtml 				= new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/chargeMappingMaster/chargeMappingMaster.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();

				showAllGroupsOption	= response.showAllGroupsOption;
				bookingChargesList	= response.bookingChargesList;
				deliveryChargesList	= response.deliveryChargesList;
				lhpvChargesList		= response.lhpvChargesList;
				operationTypeList	= response.operationTypeList;
				
				if(showAllGroupsOption) {
					response.accountGroupSelection	= showAllGroupsOption;
					
					Selection.setSelectionToGetData(response);
									
					$('#accountGroupSelection').removeClass('hide');
					$('#accountGroupEle').focus();
									
					$('#accountGroupEle').on('change', function(e) {
						console.log(e);
						_this.resetAndHideData();
					});
				} else
					$('#chargeTypeEle').focus();
								
				_this.setChargeType(response);
				_this.setOperationType();
				
				$("#chargeTypeEle").change(function() {
					_this.resetAndHideData();
					_this.getChargesForUpdate($('#chargeTypeEle').val());
				});
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				myNod.add({
					selector		: '#chargeNameEle',
					validate		: 'validateAutocomplete:#chargeNameEle',
					errorMessage	: 'Please Select Atleast 1 Charge !'
				});
				
				myNod.add({
					selector		: '#sequenceNoEle',
					validate		: 'presence:#sequenceNoEle',
					errorMessage	: 'Please enter sequence.'
				});
				
				hideLayer();
				
				$("#saveChargesBtn").click(function() {
					_this.onSubmit();								
				});

				$("#addChargesBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.addCharges();
				});
				
				$("#deleteAllCharges").click(function() {
					_this.deleteAllCharges();								
				});
			});
		}, getChargesForUpdate : function(chargeType) {
			let accountGroupId	= $('#accountGroupEle').val();
			let isGroupSelected	= accountGroupId > 0;
			
			if(showAllGroupsOption && !isGroupSelected) {
				showAlertMessage('error', 'Select Customer !');
				return;
			}

			showLayer();
							
			let jsonObject = new Object();
			jsonObject["chargeTypeId"]			= chargeType;
			jsonObject["configAccountGroupId"]	= accountGroupId;
							
			getJSON(jsonObject, WEB_SERVICE_URL+'/chargeMappingMasterWS/getChargesForMapping.do', _this.setCharges, EXECUTE_WITHOUT_ERROR);
		}, setCharges : function(response) {
			let chargeType	= $('#chargeTypeEle').val();
			
			if($('#chargeNameEle').selectize() != undefined)
				$('#chargeNameEle').selectize()[0].selectize.destroy();
			
			if(chargeType == CHARGE_MAPPING_MASTER_BOOKING_ID)
				_this.setBookingDeliveryCharges(bookingChargesList);
			else if(chargeType == CHARGE_MAPPING_MASTER_DELIVERY_ID)
				_this.setBookingDeliveryCharges(deliveryChargesList);
			
			if(chargeType == CHARGE_MAPPING_MASTER_BOOKING_ID || chargeType == CHARGE_MAPPING_MASTER_DELIVERY_ID) {
				previousChargesList 	= response.previousChargesList;
				$("*[data-attribute=operationType]").removeClass("show")
				_this.showBookingChargesPanel(previousChargesList);
				goToPosition('middle-border-boxshadow', 200);
			} else if(chargeType == CHARGE_MAPPING_MASTER_LHPV_ID || chargeType == CHARGE_MAPPING_MASTER_BLHPV_ID) {
				previousLHPVChargesList		= response.previousLHPVChargesList;
				_this.setLhpvBlhpvCharges();
				_this.showLHPVChargesPanel(previousLHPVChargesList);
				$("*[data-attribute=operationType]").addClass("show")
				goToPosition('middle-border-boxshadow', 200);
			}
								
			$("*[data-attribute=addCharge]").addClass("show")
			$("*[data-attribute=sequenceNo]").addClass("show")
			$("*[data-attribute=addChargeBtn]").addClass("show")
		}, addCharges : function() {
			$('#saveChargesBtn').removeClass('hide');
			let chargeType				= $('#chargeTypeEle').val();
			let bookingChargeSelectize 	= $('#chargeNameEle').get(0).selectize;
			let currentBookingCharge 	= bookingChargeSelectize.getValue(); 
			let bkgChargeOption 		= bookingChargeSelectize.options[ currentBookingCharge ];
			let chargeName 				= null;
			
			if(chargeType == CHARGE_MAPPING_MASTER_BOOKING_ID || chargeType == CHARGE_MAPPING_MASTER_DELIVERY_ID)
				chargeName	= bkgChargeOption.chargeTypeMasterName;
			else
				chargeName	= bkgChargeOption.chargeName;
			
			let chargeTypeMasterId 		= $('#chargeNameEle').val();
			let sequenceNo				= $('#sequenceNoEle').val();
			let operationTypeId			= $('#operationTypeEle').val();
			
			if(chargeType == CHARGE_MAPPING_MASTER_BOOKING_ID || chargeType == CHARGE_MAPPING_MASTER_DELIVERY_ID) {
				let temp = _.find(previousChargesList, function(value) {
					return value.chargeTypeMasterId == chargeTypeMasterId; 
				});
				
				if(temp) {
					showAlertMessage('error', 'Charge Already Added !');
					$('#saveChargesBtn').addClass('hide');
					return false;
				}
				
				let temp2 = _.find(previousChargesList, function(value){ 
					return value.chargeMasterForGroupSequenceNumber == sequenceNo; 
				});
				
				if(temp2) {
					showAlertMessage('error', 'Sequence No. Already Exists !');
					$('#saveChargesBtn').addClass('hide');
					return false;
				}
			} else if(chargeType == CHARGE_MAPPING_MASTER_LHPV_ID || chargeType == CHARGE_MAPPING_MASTER_BLHPV_ID) {
				let temp = _.find(previousLHPVChargesList, function(value){ 
					return value.lhpvChargeTypeMasterId == chargeTypeMasterId; 
				});
				
				if(temp) {
					showAlertMessage('error', 'Charge Already Added !');
					$('#saveChargesBtn').addClass('hide');
					return false;
				}
				
				let temp2 = _.find(previousLHPVChargesList, function(value){ 
					return value.sequenceNumber == sequenceNo; 
				});
				
				if(temp2) {
					showAlertMessage('error', 'Sequence No. Already Exists !');
					$('#saveChargesBtn').addClass('hide');
					return false;
				}
			}
			
			let temp3 = _.find(chargesArr, function(value) {  
				return value.chargeTypeMasterId == chargeTypeMasterId; 
			});
			
			if(temp3) {
				showAlertMessage('error', 'Charge Already Added !');
				$('#saveChargesBtn').addClass('hide');
				return false;
			}
			
			let temp4 = _.find(chargesArr, function(value) { 
				return value.sequenceNumber == sequenceNo; 
			});
			
			if(temp4) {
				showAlertMessage('error', 'Sequence No. Already Exists !');
				$('#saveChargesBtn').addClass('hide');
				return false;
			}
			
			let chargesObj 		= new Object();
			
			chargesObj.chargeTypeMasterId					= chargeTypeMasterId;
			chargesObj.lhpvChargeTypeMasterId				= chargeTypeMasterId;
			chargesObj.chargeTypeMasterName					= chargeName;
			chargesObj.chargeTypeMasterDisplayName			= chargeName;
			chargesObj.displayName							= chargeName;
			chargesObj.sequenceNumber						= sequenceNo;
			chargesObj.chargeMasterForGroupSequenceNumber	= sequenceNo;
			chargesObj.operationType						= operationTypeId;
			
			chargesArr.push(chargesObj);
			
			chargeType	= $('#chargeTypeEle').val();
			
			$("#currentBookingChargesDiv").removeClass('hide');
			
			if(chargeType == CHARGE_MAPPING_MASTER_BOOKING_ID || chargeType == CHARGE_MAPPING_MASTER_DELIVERY_ID)
				_this.createBookingChargesTable();
			else if(chargeType == CHARGE_MAPPING_MASTER_LHPV_ID || chargeType == CHARGE_MAPPING_MASTER_BLHPV_ID)
				_this.createLHPVChargesTable();
			
			let selectize 		= $('#chargeNameEle').get(0).selectize;
			selectize.setValue(''); 
			$('#sequenceNoEle').val('');
		}, resetAndHideData : function() {
			$("#removeBookingCharges").empty();
			$("#deleteBookingCharges").empty();
			$('#sequenceNoEle').val('');
			$('#saveChargesBtn').addClass('hide');
			chargesArr 			= new Array();
			srcount 			= 0;
		}, setChargeType : function(response) {
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	response.chargeTypeList,
				valueField		:	'chargeTypeId',
				labelField		:	'chargeTypeName',
				searchField		:	'chargeTypeName',
				elementId		:	'chargeTypeEle',
				create			: 	false,
				maxItems		: 	1
			});
		}, setBookingDeliveryCharges : function(deliveryChargesList) {
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	deliveryChargesList,
				valueField		:	'chargeTypeMasterId',
				labelField		:	'chargeTypeMasterNameWithChargeId',
				searchField		:	'chargeTypeMasterNameWithChargeId',
				elementId		:	'chargeNameEle',
				create			: 	false,
				maxItems		: 	1
			});
			
		}, setLhpvBlhpvCharges : function() {
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	lhpvChargesList,
				valueField		:	'lhpvChargeTypeMasterId',
				labelField		:	'chargeNameWithChargeId',
				searchField		:	'chargeNameWithChargeId',
				elementId		:	'chargeNameEle',
				create			: 	false,
				maxItems		: 	1
			});
		}, setOperationType : function() {
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	operationTypeList,
				valueField		:	'operationTypeId',
				labelField		:	'operationName',
				searchField		:	'operationName',
				elementId		:	'operationTypeEle',
				create			: 	false,
				maxItems		: 	1
			});
		}, showBookingChargesPanel : function(previousBookingChargesList) {
			$("#middle-border-boxshadow").removeClass('hide');
			$('.operationType').addClass('hide');
			$('.taxExclude').removeClass('hide');
			$('#previousChargesTable tbody').empty();
			
			if(previousBookingChargesList != undefined && previousBookingChargesList.length > 0) {
				let columnArray		= new Array();

				for (let i = 0; i < previousBookingChargesList.length; i++) {
					let obj		= previousBookingChargesList[i];
					
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i + 1) + " <input type='checkbox' name = 'deleteCharges' class='deleteCharges' value='"+ obj.wayBillChargeForGroupId + "'></td>");
					columnArray.push("<td class='hide' style='text-align: center; vertical-align: middle;'>" + obj.chargeTypeMasterId + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (obj.chargeTypeMasterDisplayName) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (obj.chargeMasterForGroupSequenceNumber) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (obj.chargeMasterForGroupTaxExclude ? "Yes" : "No") + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><a style='cursor:pointer;' id='deleteCharges_" + obj.wayBillChargeForGroupId + "'><b style='font-size: 14px'>Delete</b></a></td>");
					$('#previousChargesTable tbody').append('<tr id="deleteChargestr_'+ obj.wayBillChargeForGroupId +'">' + columnArray.join(' ') + '</tr>');

					$("#deleteCharges_" + obj.wayBillChargeForGroupId).bind("click", function() {
						let elementId	= $(this).attr('id');
						_this.deleteBookingCharges(elementId.split('_')[1]);
					});
					
					columnArray	= [];
				}
				
				hideLayer();
			}
		}, showLHPVChargesPanel : function(previousLHPVChargesList) {
			$("#middle-border-boxshadow").removeClass('hide');
			$('.operationType').removeClass('hide');
			$('.taxExclude').addClass('hide');
			$('#previousChargesTable tbody').empty();
			
			if(previousLHPVChargesList != undefined && previousLHPVChargesList.length > 0) {
				let columnArray		= new Array();
	
				for (let i = 0; i < previousLHPVChargesList.length; i++) {
					let obj		= previousLHPVChargesList[i];

					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i + 1) + " <input type='checkbox' name = 'deleteCharges' class='deleteCharges' value='"+ obj.lhpvChargesForGroupId + "'></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' name='chargeNameTd_" + obj.lhpvChargeTypeMasterId + "' value='"+ obj.displayName +"'>" + (obj.displayName) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' name='sequenceNoTd_" + obj.sequenceNumber + "' value='"+ obj.sequenceNumber +"'>" + (obj.sequenceNumber) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' name='operationNameTd_" + obj.operationName + "' value='"+ obj.operationName +"'>" + (obj.operationName) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><a style='cursor:pointer;' id='deleteCharges_" + obj.lhpvChargesForGroupId + "'><b style='font-size: 14px'>Delete</b></a></td>");
					$('#previousChargesTable tbody').append('<tr id="deleteChargestr_'+ obj.lhpvChargesForGroupId +'">' + columnArray.join(' ') + '</tr>');
	
					$("#deleteCharges_" + obj.lhpvChargesForGroupId).bind("click", function() {
						let elementId	= $(this).attr('id');
						_this.deleteLHPVCharges(elementId.split('_')[1]);
					});
					
					columnArray	= [];
				}
				hideLayer();
			}
		}, createBookingChargesTable : function() {
			srcount++;
			
			let bookingChargeSelectize 	= $('#chargeNameEle').get(0).selectize;
			let currentBookingCharge 	= bookingChargeSelectize.getValue(); 
			let bkgChargeOption 		= bookingChargeSelectize.options[ currentBookingCharge ];
			let chargeName 				= bkgChargeOption.chargeTypeMasterName;
			let chargeTypeMasterId 		= $('#chargeNameEle').val();
			let sequenceNo				= $('#sequenceNoEle').val();

			let tr  = $("<tr id='row_" + chargeTypeMasterId + "'></tr>");
			
			let td0 = $("<td id='srNo'></td>");
			let td2 = $("<td id='chargeName_'" + chargeTypeMasterId + "></td>");
			let td3 = $("<td id='sequenceNo_" + chargeTypeMasterId + "'></td>");
			let td4 = $("<td id='" + chargeTypeMasterId + "'></td>");
			let td5 = $("<td><button type='button' class='btn btn-danger' id='removeBookingCharges_" + chargeTypeMasterId + "'>Remove</button></td>");

			td0.append(srcount);
			td2.append(chargeName);
			td3.append(sequenceNo);
			td4.append('<input type="checkbox" id="taxExclude_' + chargeTypeMasterId + '" data-tooltip="Tax Exclude">');
			
			tr.append(td0);
			tr.append(td2);
			tr.append(td3);
			tr.append(td4);
			tr.append(td5);
			
			$("#currentBookingChargesTable").append(tr);
			
			$('#removeBookingCharges_' + chargeTypeMasterId).click(function() {
				_this.removeBookingCharges(chargeTypeMasterId);
			});
			
			$('#saveChargesBtn').removeClass('hide');
		}, createLHPVChargesTable : function() {
			srcount++;
			
			let lhpvChargeSelectize 	= $('#chargeNameEle').get(0).selectize;
			let currentLhpvCharge 		= lhpvChargeSelectize.getValue(); 
			let lhpvChargeOption 		= lhpvChargeSelectize.options[ currentLhpvCharge ];
			let chargeName 				= lhpvChargeOption.chargeName;
			let chargeTypeMasterId 		= $('#chargeNameEle').val();
			let sequenceNo				= $('#sequenceNoEle').val();
			let operationSelectize 		= $('#operationTypeEle').get(0).selectize;
			let currentOperationType	= operationSelectize.getValue(); 
			let operationTypeOption 	= operationSelectize.options[ currentOperationType ];
			let operationTypeName 		= operationTypeOption.operationName;
			
			let columnArray = [];
			
			columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + srcount + "</td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' id='chargeName_" + chargeTypeMasterId + "'>" + chargeName + "</td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;' id='sequenceNo_" + chargeTypeMasterId + "'>" + sequenceNo + "</td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle; text-transform: uppercase' id='operationType_" + chargeTypeMasterId + "'>" + operationTypeName + "</td>");
			columnArray.push("<td style='text-align: center; vertical-align: middle;'><button type='button' class='btn btn-danger' id='removeLHPVCharges_" + chargeTypeMasterId + "'>Remove</button></td>");
			
			$('#currentBookingChargesTable').append('<tr id="row_' + chargeTypeMasterId + '">' + columnArray.join('') + '</tr>');
			
			$('#removeLHPVCharges_'+chargeTypeMasterId).click(function() {
				_this.removeLHPVCharges(chargeTypeMasterId);
			});
			
			$('#saveChargesBtn').removeClass('hide');
		}, removeBookingCharges: function(chargeTypeMasterId) {
			let row = $('#removeBookingCharges_' + chargeTypeMasterId).closest('tr');
			
			setTimeout(function() { // Simulating ajax
				let siblings = row.siblings();
				row.remove();
				siblings.each(function(index) {
					$(this).children().first().text(index + 1);
				});
			}, 100);
			
			srcount--;
			
			chargesArr = chargesArr.filter(function(el) { return el.chargeTypeMasterId != chargeTypeMasterId; }); 
		}, removeLHPVCharges: function(chargeTypeMasterId) {
					
			let row = $('#removeBLHPVCharges_' + chargeTypeMasterId).closest('tr');
			
			setTimeout(function() { // Simulating ajax
				let siblings = row.siblings();
				row.remove();
				siblings.each(function(index) {
					$(this).children().first().text(index + 1);
				});
			}, 100);
			
			srcount--;
			
			chargesArr = chargesArr.filter(function(el) { return el.chargeTypeMasterId != chargeTypeMasterId; }); 
		}, deleteBookingCharges : function (wayBillChargeForGroupId) {
			if (confirm("Are you sure to delete?")) {
				let jsonObject = new Object();
				
				jsonObject["configAccountGroupId"]		= $('#accountGroupEle').val();
				jsonObject["wayBillChargeForGroupId"]	= wayBillChargeForGroupId;
				
				showLayer();
				getJSON(jsonObject, WEB_SERVICE_URL+'/chargeMappingMasterWS/deleteCharges.do', _this.setResponseAfterChargesDelete, EXECUTE_WITHOUT_ERROR);
			}
		}, deleteLHPVCharges : function (lhpvChargeForGroupId) {
			if (confirm("Are you sure to delete?")) {
				let jsonObject = new Object();
				
				jsonObject["configAccountGroupId"]	= $('#accountGroupEle').val();
				jsonObject["lhpvChargeForGroupId"]	= lhpvChargeForGroupId;
				
				showLayer();
				getJSON(jsonObject, WEB_SERVICE_URL+'/chargeMappingMasterWS/deleteCharges.do', _this.setResponseAfterChargesDelete, EXECUTE_WITHOUT_ERROR);
			}
		}, deleteAllCharges : function() {
			let checkBoxArray	= getAllCheckBoxSelectValue('deleteCharges');
			
			if(checkBoxArray.length == 0) {
				showAlertMessage('error', 'Please, Select atleast 1 Charge !');
				return;
			}
			
			if (confirm("Are you sure to delete seleted charges !?")) {
				let chargeType	= $('#chargeTypeEle').val();

				let jsonObject = new Object();
							
				jsonObject["configAccountGroupId"]		= $('#accountGroupEle').val();
				jsonObject["chargeTypeId"]				= chargeType;
				
				if(chargeType == CHARGE_MAPPING_MASTER_BOOKING_ID || chargeType == CHARGE_MAPPING_MASTER_DELIVERY_ID)
					jsonObject["wayBillChargeForGroupIds"]	= checkBoxArray.join(',');
				else if(chargeType == CHARGE_MAPPING_MASTER_LHPV_ID || chargeType == CHARGE_MAPPING_MASTER_BLHPV_ID)
					jsonObject["lhpvChargeForGroupIds"]	= checkBoxArray.join(',');
							
				showLayer();
				getJSON(jsonObject, WEB_SERVICE_URL+'/chargeMappingMasterWS/deleteCharges.do', _this.setResponseAfterChargesDelete, EXECUTE_WITHOUT_ERROR);
			}
		}, setResponseAfterChargesDelete : function(response) {
			hideLayer();
			
			if(response.message != undefined && response.message.type != MESSAGE_TYPE_SUCCESS)
				return;
			
			let chargeTypeMasterId = response.chargeTypeMasterId;
			
			if(chargeTypeMasterId != undefined && chargeTypeMasterId > 0)
				$("#deleteChargestr_" + chargeTypeMasterId).remove();
			else {
				_this.resetAndHideData();
				_this.getChargesForUpdate($('#chargeTypeEle').val());
			}
			
			refreshCache(CHARGE_MASTER, response.accountGroupId);
		}, onSubmit : function() {
			if (confirm("Are you sure to save charge?")) {
				let jsonObject	= new Object();
				
				for(let charge of chargesArr) {
					charge.chargeMasterForGroupTaxExclude = $('#taxExclude_' + charge.chargeTypeMasterId).prop('checked');
				}
				
				jsonObject.chargesArr				= JSON.stringify(chargesArr);
				jsonObject.chargeTypeId				= $('#chargeTypeEle').val();
				jsonObject["configAccountGroupId"]	= $('#accountGroupEle').val();
				
				showLayer();
				getJSON(jsonObject, WEB_SERVICE_URL	+ '/chargeMappingMasterWS/insertBookingAndDeliveryCharges.do?',	_this.setResponseAfterChargesDelete, EXECUTE_WITHOUT_ERROR);
			}
		}
	});
});