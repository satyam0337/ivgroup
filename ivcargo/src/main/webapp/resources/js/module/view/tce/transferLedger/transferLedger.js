define([  
		'selectizewrapper'
		,PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
		,PROJECT_IVUIRESOURCES + '/resources/js/generic/tabledatawrapper.js'
		,'JsonUtility'
		,'messageUtility'
		,'jquerylingua'
		,'language'
        ,'autocomplete'
        ,'autocompleteWrapper'
        ,'nodvalidation'
        ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
        ,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
        ,'focusnavigation'//import in require.config
		,PROJECT_IVUIRESOURCES + '/js/generic/customValidation.js'
          ],function(Selectizewrapper, UrlParameter, TableDataWrapper) {
	'use strict';
	let jsonObject = new Object(), sourceBranchArray	= new Array(), groupCollection = null, _this = '',  
	transferLedgerId = 0, modal1 = null, tlNumber, addModel, TOKEN_VALUE = "",TOKEN_KEY="";
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
			transferLedgerId		= UrlParameter.getModuleNameFromParam(MASTERID);
			tlNumber   				= UrlParameter.getModuleNameFromParam(MASTERID2);
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/transferLedgerWS/initializeTransferLS.do?',	_this.renderElements, EXECUTE_WITH_NEW_ERROR);
			return _this;
		}, renderElements : function(response) {
			hideLayer();
			
			let loadelement = new Array();
			let baseHtml = new $.Deferred();
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/tce/transferLedger.html", function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				if(transferLedgerId != null && tlNumber != null) {
					showAlertMessage('success', 'Transfer Number ' + tlNumber + ' created successfully !');
					
					$('.printButton').removeClass('hide');
					
					$("#rePrint").click(function() {
						_this.openPrint(transferLedgerId);
					});
						
					_this.openPrint(transferLedgerId);
					$('#tlNumber').html(tlNumber);
					hideLayer();
				}
				
				if(response.message != undefined) {
					hideLayer();
					//let errorMessage = response.message;
					//showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					return;
				}
				
				TOKEN_KEY			= response.TOKEN_KEY;
				TOKEN_VALUE			= response.TOKEN_VALUE;
			
				sourceBranchArray	= response.sourceBranchCollection;
				groupCollection		= response.groupCollection;
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: groupCollection,
					valueField		: 'accountGroupId',
					labelField		: 'accountGroupName',
					searchField		: 'accountGroupName',
					elementId		: 'accountGroupEle',
					create			: false,
					maxItems		: 1,
					onChange		: _this.onGroupSelect
				});
				
				if(groupCollection.length == 1)
					_this.setBranchAutocomplete(sourceBranchArray);
				
				modal1 		= new bootstrap.Modal(document.getElementById('dispatchModel'));
				addModel 	= new bootstrap.Modal(document.getElementById('myModal2'));
				
				let myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({selector: '#accountGroupEle', validate : 'presence', errorMessage: 'Select proper Group !'});
				myNod.add({selector: '#branchEle', validate : 'presence', errorMessage: 'Select proper Branch !'});

				$("#findBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.submitData();
				});
				
				_this.setVehicleNumber();
				_this.setLicenceNumber();
				
				$("#dispatch").click(function(event) {
					$('#lorryHireEle').val('');
					let wayBillIdArr = getAllCheckBoxSelectValue('uniqueIds');

					if (wayBillIdArr.length == 0) {
						showAlertMessage('error', 'Please, Select atleast 1 LR !');
						return;
					}

					modal1.show();
					setTimeout(function() { $('#vehicleNumberEle').focus(); }, 1000);
				});
				
				let myNodForTransfer	= _this.addElementInNodeForFinalDispatch();
				
				$('#validateTruckDetails').click(function() {
					let wayBillIdArr	= getAllCheckBoxSelectValue('uniqueIds');
					
				/*	if ($('#lorryHireEle').val().trim().length === 0) {
						showMessage('error', 'Please Enter Lorry Hire amount!');
						return;
					}*/
			
			
					if(wayBillIdArr.length == 0) {
						showAlertMessage('error', 'Please, Select atleast 1 LR !');
						return;
					}
					
					myNodForTransfer.performCheck();
							
					if(!myNodForTransfer.areAll('valid')) return;
					
					addModel.show();
				});
				
				$('#dispatchFinalData').click(function() {
					_this.dispatchFinalData();
				});
				
				$('#lorryHireEle').attr('maxlength', '15');

				$('#lorryHireEle').on('input', function() {
					let value = $(this).val().replace(/\D/g, ''); 
					$(this).val(value); 
				});
			});
			hideLayer();
		}, onGroupSelect : function() {
			let array = sourceBranchArray;
			let groupId = Number($('#accountGroupEle').val());
			array = array.filter(function(el) { return el.accountGroupId == groupId; });
			array.unshift({branchName : "Select"});
			
			_this.setBranchAutocomplete(array);
		}, setBranchAutocomplete : function(array) {
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	array,
				valueField		:	'branchId',
				labelField		:	'branchName',
				searchField		:	'branchName',
				elementId		:	'branchEle',
				create			: 	false,
				maxItems		: 	1
			});
		}, setVehicleNumber : function() {
			let autoVehicleNumber = new Object();
			autoVehicleNumber.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getVehicleNumberAutocomplete.do';
			autoVehicleNumber.primary_key 	= 'vehicleNumberMasterId';
			autoVehicleNumber.field 		= 'vehicleNumber';
			
			autoVehicleNumber.callBack		= _this.getVehicleDataOnVehicleSelect;
			$("#vehicleNumberEle").autocompleteCustom(autoVehicleNumber);
		}, setLicenceNumber : function () {
			let autoLicenceNumber = new Object();
			autoLicenceNumber.url 			= WEB_SERVICE_URL+'/dispatchWs/getLicenceNumberForDispatch.do';
			autoLicenceNumber.primary_key 	= 'driverMasterId';
			autoLicenceNumber.field 		= 'licenceNumberWithDriverName';
			$("#driverLicenceNumberEle").autocompleteCustom(autoLicenceNumber);
		}, getVehicleDataOnVehicleSelect : function() {
			let jsonObject = new Object();
			
			if($("#" + $(this).attr("id") + "_primary_key").val() == undefined )
				jsonObject.vehicleNumberMasterId = $("#vehicleNumberEle_primary_key").val();
			else
				jsonObject.vehicleNumberMasterId = $("#" + $(this).attr("id") + "_primary_key").val();
			
			jsonObject["vehicleNumberEle"]				= $('#vehicleNumberEle').val();
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/dispatchWs/getVehicleNumberDetailsForDispatch.do', _this.setVehicleNumberData, EXECUTE_WITHOUT_ERROR);
		}, setVehicleNumberData  : function(response){
			let vehicleNumberMaster			= response.vehicleNumberMaster;
			$("#vehicleAgentListEle").val(vehicleNumberMaster.vehicleAgentName);
			setTimeout(function(){
				$(".ac_result_area").css('display','none');
				$("#vehicleAgentListEle_primary_key").val(vehicleNumberMaster.vehicleAgentMasterId);
			},600);
		}, submitData : function() {
			showLayer();
			jsonObject = new Object();
			jsonObject.bookedForAccountGroupId 	= Number($('#accountGroupEle').val());
			jsonObject.destinationBranchId 		= Number($('#branchEle').val());
			getJSON(jsonObject,	WEB_SERVICE_URL + '/transferLedgerWS/getWayBillsForTransfer.do?', _this.setReportData, EXECUTE_WITH_NEW_ERROR);
		}, setReportData : function(response) {
			hideLayer();
			
			if(response.message != undefined) {
				$('#bottom-border-boxshadow').addClass('hide');
				$('.openTruckInfo').addClass('hide');
				return;	
			}
			
			$('#bottom-border-boxshadow').removeClass('hide');
			$('.openTruckInfo').removeClass('hide');
			
			TableDataWrapper.setTableData(response);
			
			$('.remove').click(function(event) {
				let rowId =	(event.target.id).split('_')[1];
				_this.removeDataRow(rowId);
			});
		}, setDestination : function(response) {
			Selectizewrapper.setAutocomplete({
				jsonResultList	: response.destinationBranch,
				valueField		: 'branchId',
				labelField		: 'branchName',
				searchField		: 'branchName',
				elementId		: 'truckDestinationEle',
				create			: false,
				maxItems		: 1
			});
		}, addElementInNodeForFinalDispatch : function() {
			let myNod = nod();
			myNod.configure({
				parentClass:'validation-message'
			});

			myNod.add({selector: '#vehicleNumberEle', validate: 'validateAutocomplete:#vehicleNumberEle_primary_key', errorMessage: 'Select proper Vehicle !'});
			myNod.add({selector: '#driverNameEle', validate : 'presence', errorMessage: 'Enter, Driver Name !'});
			myNod.add({
				selector: '#driverMobileNumberEle',
				validate: function(callback) {
					const mobileRegex = /^[6-9]\d{9}$/;
					const isValid = mobileRegex.test($('#driverMobileNumberEle').val());
					callback(isValid);
				},
				errorMessage: 'Enter a valid 10-digit mobile number, as OTP will be sent on it!'
			});
			
			$("*[data-attribute=vehicleNumber]").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
			$("*[data-attribute=driverName]").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
			$("*[data-attribute=driverNumber]").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
			
			return myNod;
		}, dispatchFinalData : function() {
			let finalJsonObj = new Object();
			

			let wayBillIdArr	= getAllCheckBoxSelectValue('uniqueIds');
			
			finalJsonObj.wayBillIds 			= wayBillIdArr.join(',');
			finalJsonObj.vehicleNumber			= $('#vehicleNumberEle').val();
			finalJsonObj.vehicleNumberMasterId 	= $("#vehicleNumberEle_primary_key").val();
			finalJsonObj.driverName				= $('#driverNameEle').val();
			finalJsonObj.driverMobile			= $('#driverMobileNumberEle').val();
			finalJsonObj.remark					= $('#remarkEle').val();
			finalJsonObj.transferForBranchId 	= Number($('#branchEle').val());
			finalJsonObj.TOKEN_VALUE			= TOKEN_VALUE;
			finalJsonObj.TOKEN_KEY				= TOKEN_KEY;
			finalJsonObj.lorryHire				= $('#lorryHireEle').val();

			showLayer();
			getJSON(finalJsonObj, WEB_SERVICE_URL+'/transferLedgerWS/transferLS.do', _this.onTransfer, EXECUTE_WITH_NEW_ERROR); //submit JSON
		}, onTransfer : function(response) {
			transferLedgerId	= response.transferLedgerId;
			
			if(response.message != undefined) {
				hideLayer();
				TOKEN_KEY			= response.TOKEN_KEY;
				TOKEN_VALUE			= response.TOKEN_VALUE;
				return;
			}
			
			let MyRouter = new Marionette.AppRouter({});
			MyRouter.navigate('&modulename=transferLedger&' + MASTERID + "=" + transferLedgerId + '&' + MASTERID2 + "=" + response.tlNumber, {trigger: true});
			hideLayer();
			location.reload();
		}, openPrint : function(transferLedgerId) {
		var newwindow=window.open('TransferLSPrint.do?pageId=340&eventId=10&modulename=transferLsPrint&masterid='+transferLedgerId+'&isReprint=true', 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
		}
	});
});
