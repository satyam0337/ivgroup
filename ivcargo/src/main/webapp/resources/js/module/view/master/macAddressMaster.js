define([
		PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js',//PopulateAutocomplete
		PROJECT_IVUIRESOURCES+'/resources/js/module/view/master/macAddressMasterDetails.js',
		'JsonUtility',
		'messageUtility',
		'autocomplete',
		'autocompleteWrapper',
		'bootstrapSwitch',
		'nodvalidation',
		'focusnavigation',
		PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	],
	function(Selection, MacAddressMasterDetails) {
	'use strict'; 
	let myNod,
	myNodSearch,
	macIpAddressConfiguration,
	ipAddressValidationId,
	isAllowToSave = true,
	isAllowToUpdate	= false,
	isAllowToDelete	= false,
	isAllowToEdit	= false,
	noOfIPDetails	= 0,
	_this;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
			this.$el.html(this.template);
		}, render : function() {
			getJSON(null, WEB_SERVICE_URL	+ '/macAddressMasterWS/getMacAddressElementConfiguration.do?',	_this.setElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setElements: function(response) {
			let loadelement 	= new Array();
			let baseHtml 		= new $.Deferred();
			loadelement.push(baseHtml);
		
			$("#mainContent").load("/ivcargo/html/master/macaddressmaster.html",
					function() {
						baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				let keyObject 		= Object.keys(response);
				
				for (let i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]])
						$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
				}
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				myNodSearch = nod();
				myNodSearch.configure({
					parentClass:'validation-message'
				});
				
				macIpAddressConfiguration	= response;
				
				_this.setCreateData(response);
				hideLayer();
			});
		}, setCreateData : function(response) {
			let elementConfiguration	= new Object();
			
			response.executiveWithBranchSelection	= true;
			response.executiveListByBranch			= true;
			
			elementConfiguration.branchElement		= $('#branchEle');
			elementConfiguration.executiveElement	= $('#executiveEle');
			
			response.elementConfiguration			= elementConfiguration;
			
			Selection.setSelectionToGetData(response);
			
			addAutocompleteElementInNode(myNod, 'branchEle', 'Select Valid Branch !');
			addAutocompleteElementInNode(myNod, 'executiveEle', 'Select Valid Executive !');
			addElementToCheckEmptyInNode(myNod, 'macAddressEle', 'Enter Mac Address');
			
			addAutocompleteElementInNode(myNodSearch, 'branchEle', 'Select Valid Branch !');
			addAutocompleteElementInNode(myNodSearch, 'executiveEle', 'Select Valid Executive !');
			
			if (macIpAddressConfiguration.description)
				addElementToCheckEmptyInNode(myNod, 'macAddressDesEle', 'Enter Description');
			
			_this.showButtonsDiv();
			
			$('#searchBtn').click(function() {
				myNodSearch.performCheck();
					
				if(myNodSearch.areAll('valid')) {
					_this.resetfeilds();
					_this.getMacAddressDetails();
				}
			});
			
			$('#viewAllMacAddress').click(function() {
				_this.viewAllAddressDetails();
			});
			
			$('#viewPendingMacAddress').click(function() {
				_this.viewAllPendingAddressDetails();
			});
			
			$('#executiveEle').click(function() {
				$('#middle-border-boxshadow').removeClass('hide');
				$('#bottom-border-boxshadow').addClass('hide');
				_this.showButtonsDiv();
				_this.setButtons(true);
				$('#macDetails').empty();
				_this.resetfeilds();
			});
			
			$("#addNewBtn").click(function() {
				isAllowToSave	= true;
				$('#saveDiv').removeClass('hide');
				$('#saveBtn').removeClass('disabled');
				$('#editDiv').addClass('hide');
				$('#deleteDiv').addClass('hide');
				$('#addNewDiv').addClass('hide');
				$("#macAddressEle").val("");
				$("#macAddressDesEle").val("");
				$('#macAddressEle').removeAttr('disabled');
				$('#macAddressDesEle').removeAttr('disabled');
				$('#middle-border-boxshadow').removeClass('hide');
			});

			$("#saveBtn").click(function() {
				if(isAllowToSave) {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.saveMacAddressDetails();
				}
			});
			
			$("#updateBtn").click(function() {
				if(isAllowToUpdate) {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.updateMacAddressDetails(ipAddressValidationId);
				}
			});
			
			$("#deleteBtn").click(function() {
				if(isAllowToDelete) {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.deleteMacAddressDetails(ipAddressValidationId);
				}
			});
			
			$("#editBtn").click(function() {
				if(isAllowToEdit) {
					$('#updateDiv').removeClass('hide');
					$('#cancelDiv').removeClass('hide');
					$('#saveDiv').addClass('hide');
					$('#editDiv').addClass('hide');
					$('#deleteDiv').addClass('hide');
					$('#macAddressEle').removeAttr('disabled');
					$('#macAddressDesEle').removeAttr('disabled');
				}
			});
			
			$("#cancelBtn").click(function() {
				$('#saveDiv').removeClass('hide');
				$('#editDiv').removeClass('hide');
				$('#deleteDiv').removeClass('hide');
				$('#addNewDiv').addClass('hide');
				$("#branchEle").val("");
				$("#executiveEle").val("");
				_this.resetfeilds();
			});
			
			$("#resetBtn").click(function() {
				$('#editDiv').removeClass('hide');
				$('#deleteDiv').removeClass('hide');
				$('#addNewDiv').addClass('hide');
				$("#branchEle").val("");
				$("#executiveEle").val("");
				$('#middle-border-boxshadow').removeClass('hide');
				$('#bottom-border-boxshadow').addClass('hide');
				$('#macDetails').empty();
				_this.resetfeilds();
			});
			
			$("#addNewMac").click(function() {
				$('#middle-border-boxshadow').removeClass('hide');
				$('#saveDiv').removeClass('hide');
				$("#saveBtn").removeClass("disabled");
				goToPosition('middle-border-boxshadow', 'slow');
			});
		}, setButtons : function(flag) {
			if (!flag) {
				//In case of record
				isAllowToSave	= false;
				isAllowToUpdate	= true;
				isAllowToDelete	= true;
				isAllowToEdit	= true;
				$("#saveBtn").addClass("disabled");
				$("#deleteBtn").removeClass("disabled");
				$('#updateBtn').removeClass("disabled");
				$("#editBtn").removeClass("disabled");
			} else if(flag) {
				//Record not found
				isAllowToSave	= true;
				isAllowToUpdate	= false;
				isAllowToDelete	= false;
				isAllowToEdit	= false;
				$("#saveBtn").removeClass("disabled");
				$("#deleteBtn").addClass("disabled");
				$('#updateBtn').addClass("disabled");
				$("#editBtn").addClass("disabled");
			}
		}, showResponseAfterOperation : function (response) {
			if (response.message != undefined) {
				hideLayer();
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				
				if(response.assigned) {
					goToPosition('left-border-boxshadow', 'slow');
					$('#left-border-boxshadow').removeClass('hide');
					$('#assignedUserDetails').html(response.userInfo);
					$('#left-border-boxshadow').delay(5000).fadeOut();
				}
				
				if(response.saved && !response.assigned) {
					_this.getMacAddressDetails();
				} else {
					if(ipAddressValidationId > 0) {
						$('#oldMacAddressEle_' + ipAddressValidationId).val(response.newMacAddress);
						
						if(response.updated && noOfIPDetails == 1) {
							$('#saveDiv').removeClass('hide');
							$('#editDiv').removeClass('hide');
							$('#deleteDiv').removeClass('hide');
							$('#addNewDiv').addClass('hide');
							$("#branchEle").val("");
							$("#executiveEle").val("");
							$("#executiveEle_primary_key").val("");
							noOfIPDetails--;
						} else if(response.deleted) {
							let row = $('#macDetails_' + ipAddressValidationId).closest('tr');
							
							setTimeout(function() { // Simulating ajax
								let siblings = row.siblings();
								row.remove();
								siblings.each(function(index) {
									$(this).children().first().text(index + 1);
								});
							}, 100);
							
							let macDetailsLength = $('#macDetails tr').length - 1;
							
							if(macDetailsLength == 0) {
								$('#middle-border-boxshadow').removeClass('hide');
								$('#bottom-border-boxshadow').addClass('hide');
								$('#saveDiv').removeClass('hide');
								$('#editDiv').removeClass('hide');
								$('#deleteDiv').removeClass('hide');
							}
						}
					}
				}
				
				_this.resetfeilds();
				return;
			}
			
			hideLayer();
		}, getMacAddressDetails : function () {
			let jsonObject	= new Object();
			
			let $inputs = $('#top-border-boxshadow :input');
			$inputs.each(function (){if($(this).val() != ""){jsonObject[$(this).attr('name')] = $.trim($(this).val());}});
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/macAddressMasterWS/getMacAddressByExecutiveId.do', _this.setForEdit, EXECUTE_WITH_ERROR);
		}, setForEdit : function (response) {
			if (response.message != undefined) {
				hideLayer();
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				_this.resetfeilds();
				$('#editDiv').removeClass('hide');
				$('#deleteDiv').removeClass('hide');
				$('#middle-border-boxshadow').removeClass('hide');
				$('#bottom-border-boxshadow').addClass('hide');
				_this.setButtons(true);
				$('#macDetails').empty();
				return;
			}
			
			let macIPAddressMaster	= response.MacIPAddressMaster;
			
			if(macIPAddressMaster != undefined || response.MacIPAddressMasterList != undefined) {
				if(macIPAddressMaster != undefined) {
					ipAddressValidationId	= macIPAddressMaster.ipAddressValidationId;
					$("#macAddressEle").val(macIPAddressMaster.macAddress);
					$("#macAddressDesEle").val(macIPAddressMaster.description);
					$("#oldMacAddressEle").val(macIPAddressMaster.macAddress);
					$('#middle-border-boxshadow').removeClass('hide');
					$('#bottom-border-boxshadow').addClass('hide');
					$('#macAddressEle').attr('disabled', 'true');
					$('#macAddressDesEle').attr('disabled', 'true');
					$('#bottom-border-boxshadow').addClass('hide');
					$('#addNewDiv').removeClass('hide');
					noOfIPDetails++;
					_this.showButtonsDiv();
					_this.setButtons(false);
				} else {
					if(response.MacIPAddressMasterList != undefined) {
						$('#middle-border-boxshadow').addClass('hide');
						$('#bottom-border-boxshadow').removeClass('hide');
						noOfIPDetails--;
						_this.hideButtonsDiv();
						_this.resetfeilds();
						$('#macDetails').empty();
						goToPosition('bottom-border-boxshadow', 'slow');
						
						let macIPAddressMasterList	= response.MacIPAddressMasterList;
						
						let columnArray		= new Array();
						
						for (let i = 0; i < macIPAddressMasterList.length; i++) {
							let obj		= macIPAddressMasterList[i];
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i + 1) + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'><input class='form-control' type='hidden' name='oldMacAddressEle_" + obj.ipAddressValidationId + "' value='"+ obj.macAddress +"' style='text-transform: uppercase;' id='oldMacAddressEle_" + obj.ipAddressValidationId + "' /><input class='form-control' type='text' name='macAddressEle_" + obj.ipAddressValidationId + "' value='"+ obj.macAddress +"' style='text-transform: uppercase;' data-tooltip='Insert Mac Address' placeholder='Insert Mac Address' id='macAddressEle_" + obj.ipAddressValidationId + "' /></td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'><input class='form-control' type='text' name='macAddressDesEle_" + obj.ipAddressValidationId + "' value='"+ obj.description +"' data-tooltip='Insert Mac Address' placeholder='Insert Description' id='macAddressDesEle_" + obj.ipAddressValidationId + "' /></td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'><a style='cursor:pointer;' id='updateMacAddress_" + obj.ipAddressValidationId + "'><b style='font-size: 14px'>Update</b></a></td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle;'><a style='cursor:pointer;' id='deleteMacAddress_" + obj.ipAddressValidationId + "'><b style='font-size: 14px'>Delete</b></a></td>");
							$('#reportTable tbody').append('<tr id="macDetails_'+ obj.ipAddressValidationId +'">' + columnArray.join(' ') + '</tr>');
							
							$("#updateMacAddress_" + obj.ipAddressValidationId).bind("click", function() {
								let elementId			= $(this).attr('id');
								ipAddressValidationId	= elementId.split('_')[1];
							    _this.updateMacAddressDetails(ipAddressValidationId);
							});
							
							$("#deleteMacAddress_" + obj.ipAddressValidationId).bind("click", function() {
								let elementId			= $(this).attr('id');
								ipAddressValidationId	= elementId.split('_')[1];
							    _this.deleteMacAddressDetails(ipAddressValidationId);
							});
							
							columnArray	= [];
						}
					}
				}
			} else
				_this.setButtons(true);
		}, saveMacAddressDetails : function() {
			if (confirm("Are you sure?")) {
				showLayer();

				let jsonObject = _this.getData();
				
				getJSON(jsonObject, WEB_SERVICE_URL+'/macAddressMasterWS/saveMacAddressDetails.do', _this.showResponseAfterOperation, EXECUTE_WITH_ERROR);
			}
		}, updateMacAddressDetails : function(ipAddressValidationId) {
			if(ipAddressValidationId > 0 && $('#macAddressEle_' + ipAddressValidationId).exists() && $('#macAddressEle_' + ipAddressValidationId).val() == '') {
				showMessage('error', 'Enter Mac Address');
				$('#macAddressEle_' + ipAddressValidationId).focus();
				$('#macAddressEle_' + ipAddressValidationId).css('borderColor', 'red');
				return false;
			}
			
			if (confirm("Are you sure to update?")) {
				showLayer();

				let jsonObject = _this.getData();
				
				jsonObject.ipAddressValidationId	= ipAddressValidationId;
				
				if($('#oldMacAddressEle_' + ipAddressValidationId).exists() && $('#oldMacAddressEle_' + ipAddressValidationId).val() != '')
					jsonObject.oldMacAddress		= $('#oldMacAddressEle_' + ipAddressValidationId).val();
				else
					jsonObject.oldMacAddress		= $('#oldMacAddressEle').val();
				
				if($('#macAddressEle_' + ipAddressValidationId).exists() && $('#macAddressEle_' + ipAddressValidationId).val() != '')
					jsonObject.macAddressEle		= $('#macAddressEle_' + ipAddressValidationId).val();
				
				if($('#macAddressDesEle_' + ipAddressValidationId).exists() && $('#macAddressDesEle_' + ipAddressValidationId).val() != '')
					jsonObject.macAddressDesEle		= $('#macAddressDesEle_' + ipAddressValidationId).val();
				
				getJSON(jsonObject, WEB_SERVICE_URL+'/macAddressMasterWS/updateMacAddressDetails.do', _this.showResponseAfterOperation, EXECUTE_WITH_ERROR);
			}
		}, deleteMacAddressDetails : function(ipAddressValidationId) {
			if (confirm("Are you sure to delete?")) {
				showLayer();
				let jsonObject = new Object();
				
				jsonObject.ipAddressValidationId	= ipAddressValidationId;
			
				getJSON(jsonObject, WEB_SERVICE_URL+'/macAddressMasterWS/deleteMacAddressDetails.do', _this.showResponseAfterOperation, EXECUTE_WITH_ERROR);
			}
		}, getData : function() {
			let jsonObject	= new Object();
			
			let $inputs = $('#top-border-boxshadow :input');
			$inputs.each(function (){if($(this).val() != ""){jsonObject[$(this).attr('name')] = $.trim($(this).val());}});
		
			$inputs = $('#middle-border-boxshadow :input');
			$inputs.each(function (){if($(this).val() != ""){jsonObject[$(this).attr('name')] = $.trim($(this).val());}});
			
			return jsonObject;
		}, resetfeilds : function() {
			$("#macAddressEle").val("");
			$("#macAddressDesEle").val("");
			$("#oldMacAddressEle").val("");
			$('#macAddressEle').removeAttr('disabled');
			$('#macAddressDesEle').removeAttr('disabled');
			$('#updateDiv').addClass("hide");
			$("#deleteBtn").addClass("disabled");
			$("#editBtn").addClass("disabled");
			$('#saveBtn').removeClass('disabled');
			$('#saveDiv').removeClass('hide');
			$('#addNewDiv').addClass('hide');
			$('#cancelDiv').addClass('hide');
			isAllowToSave 	= true;
			isAllowToUpdate	= false;
			isAllowToDelete	= false;
			isAllowToEdit	= false
		}, showButtonsDiv : function() {
			if(noOfIPDetails <= 0) {
				$('#saveDiv').removeClass('hide');
			} else {
				$('#saveDiv').addClass('hide');
			}
			
			$('#deleteDiv').removeClass('hide');
			$('#editDiv').removeClass('hide');
			$('#resetDiv').removeClass('hide');
		}, hideButtonsDiv : function() {
			$('#saveDiv').addClass('hide');
			$('#updateDiv').addClass('hide');
			$('#deleteDiv').addClass('hide');
			$('#editDiv').addClass('hide');
		}, viewAllAddressDetails : function () {
			let jsonObject	= new Object();
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL+'/macAddressMasterWS/viewAllMacAddressDetails.do', _this.viewAllIpAddress, EXECUTE_WITH_ERROR);
		}, viewAllIpAddress : function(response) {
			hideLayer();
			
			if(response.CorporateAccount != undefined && (response.CorporateAccount).length > 0) {
				let jsonObject = new Object();
				jsonObject["response"] 		= response;
				
				let object = new Object();
				object.elementValue = jsonObject;

				let btModal = new Backbone.BootstrapModal({
					content: new MacAddressMasterDetails(object),
					modalWidth : 55,
					title:'Mac Address Master View All Details'
				}).open();
				
				object.btModal = btModal;
				new MacAddressMasterDetails(object)
				btModal.open();
			}
		}, viewAllPendingAddressDetails : function () {
			let jsonObject	= new Object();
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL+'/macAddressMasterWS/viewAllPendingMacAddressDetails.do', _this.viewAllPendingIpAddress, EXECUTE_WITH_ERROR);
		}, viewAllPendingIpAddress : function(response) {
			hideLayer();
			
			if(response.CorporateAccount != undefined && (response.CorporateAccount).length > 0) {
				let jsonObject = new Object();
				jsonObject["response"] 		= response;
				
				let object = new Object();
				object.elementValue = jsonObject;

				let btModal = new Backbone.BootstrapModal({
					content: new MacAddressMasterDetails(object),
					modalWidth : 55,
					title:'Pending Mac Address Master View All Details'
				}).open();
				
				object.btModal = btModal;
				new MacAddressMasterDetails(object)
				btModal.open();
			}
		}
	});
});