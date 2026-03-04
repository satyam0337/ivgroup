/**
 * Anant 07-Feb-2024 11:06:17 am 2024
 */

define([
	PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
	,PROJECT_IVUIRESOURCES + '/resources/js/generic/tabledatawrapper.js'
	,'selectizewrapper'
	 ,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
	,'JsonUtility'
	,'messageUtility'
	 ,"focusnavigation"
	 ,'nodvalidation'
	 ,'/ivcargo/resources/js/backbone/backbone.bootstrap-modal.js'
], function(UrlParameter, TableDataWrapper, Selectizewrapper) {
	'use strict';
	let jsonObject = new Object(),_this = '', transferLedgerId=0,
	TOKEN_VALUE	= "",TOKEN_KEY="", modal1 = null, addModel, trlNumber,transferReceiveLedgerId, rejectModal = null, corporateAccountObj = null,buttonId;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
			transferLedgerId				= UrlParameter.getModuleNameFromParam(MASTERID);
			trlNumber						= UrlParameter.getModuleNameFromParam(MASTERID2);
			jsonObject.transferLedgerId		= transferLedgerId;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/transferReceiveLedgerWS/getTransferLedgerToReceive.do?', _this.setDetailsForReceive, EXECUTE_WITH_NEW_ERROR);
			return _this;
		}, setDetailsForReceive : function(response) {
			let loadelement				= new Array();
			let baseHtml				= new $.Deferred();
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/tce/transferReceiveLedger.html", function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				
				if(transferLedgerId != null && trlNumber != null) {
					showAlertMessage('success', 'Transfer Receive Number ' + trlNumber + ' created successfully !');
					
					$('.printButton').removeClass('hide');
				
				$("#rePrint").click(function() {
						_this.transferReceiveLedgerPrint(response.transferReceiveLedgerId);
					});

					$('#trlNumber').html(trlNumber);
					hideLayer();
				} else if(response.message != undefined) {
					hideLayer();
					$('#bottom-border-boxshadow').addClass('hide');
					$('#loadingSheet').addClass('hide');
					
					setTimeout(function() {
						window.close();
					}, 2000);
					
					//let errorMessage = response.message;
					//showAlertMessage(errorMessage.typeName, errorMessage.typeSymble +	 ' ' + errorMessage.description);
					return;
				}
				
				removeTableRows('loadingSheet', 'tbody');
				removeTableRows('results', 'thead');
				removeTableRows('results', 'tbody');
				removeTableRows('results', 'tfoot');
				
				let tl	= response.transferLedger;
				
				
				if(tl == undefined) {
					$('#loadingSheet').addClass('hide');
					$('#bottom-border-boxshadow').addClass('hide');
					return;
				}
				
				$('#loadingSheet').removeClass('hide');
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: response.GODOWN_LIST,
					valueField		: 'godownId',
					labelField		: 'name',
					searchField		: 'name',
					elementId		: 'godownEle',
					create			: false,
					maxItems		: 1
				});
				
				_this.setTransferLedgerDetails(tl);
				_this.setWayBillReceivableModel(response);
				
				TOKEN_KEY				= response.TOKEN_KEY;
				TOKEN_VALUE				= response.TOKEN_VALUE;
				
				modal1		= new bootstrap.Modal(document.getElementById('dispatchModel'));
				addModel	= new bootstrap.Modal(document.getElementById('myModal2'));
				rejectModal = new bootstrap.Modal(document.getElementById('remarkModal'));
				
				let myNod	= _this.addElementInNodeForFinalReceive();
				
				$("#validateReceiveDetails").click(function() {
					myNod.performCheck();
							
					if(!myNod.areAll('valid')) return;
					
					//addModel.show();
				});	
				
				if(!response.allowToReceive)
					$('#receiveTransferLedger').addClass('disabled');
				
				if(response.allowToReceive) {
					$("#receiveTransferLedger").click(function() {
						let wayBillIdList		= getAllCheckBoxSelectValue('uniqueIds');
						
						if(wayBillIdList.length == 0) {
							showAlertMessage('error', 'Please, Select atleast one LR to Receive !');
							return;
						}
						modal1.show();
					});
				}
				
				$(document).ready(function() {
					/*	var popoverTrigger = document.getElementById('termsPopover');

						var popover = new bootstrap.Popover(popoverTrigger, {
							title: '<span>Terms and Conditions</span><button type="button" class="btn-close" onclick="closePopover()"></button>',
							content: 'You are receiving LR\'s in proper condition & count. After receiving, no short/excess/damage entry will be allowed. If any LR is short or damaged, please don\'t receive that LR. Instead, reject that LR.',
							html: true,
							sanitize: false,
							placement: 'right',
							trigger: 'manual',
							template: '<div class="popover" role="tooltip"><div class="popover-arrow"></div><div class="popover-header"></div><div class="popover-body"></div></div>'
						});
						
						popoverTrigger.addEventListener('click', function (event) {
							popover.toggle();
							event.stopPropagation();
						});

						window.closePopover = function () {
							popover.hide();
						};
*/			
						$('#termsAndconditions').on('change', function () {
							$('#validateReceiveDetails').prop('disabled', !this.checked);
						});
					
					
					$('#rejectAs').change(function() {
						var selectedOption = $(this).val();
						
						if (selectedOption == '1') {
							$('#noOfArticles').html('<b>Short Articles</b>');
							$('#receivedWeight').html('<b>Short Weight</b>');
						} else if (selectedOption == '2') {
							$('#noOfArticles').html('<b>Excess Articles</b>');
							$('#receivedWeight').html('<b>Excess Weight</b>');
						} else if (selectedOption == '3') {
							$('#noOfArticles').html('<b>Damage Articles</b>');
							$('#receivedWeight').html('<b>Damage Weight</b>');
						}
					});
					
					$(document).on('click', 'button.dynamic-action', function() {
						buttonId = $(this).attr('id');

						const map = response.CorporateAccount.reduce((acc, item) => {
							acc[item.wayBillId] = item;
							return acc;
						}, {});

						corporateAccountObj = map[buttonId.split("_")[1]];
						$('#totalWeightin').val(corporateAccountObj.transferWeight).prop('disabled', true);
						$('#totalArticlesin').val(corporateAccountObj.transferQuantity).prop('disabled', true);
						rejectModal.show();
					});
				});

				let tlOTP = response.transferLedger.transferOTP;
				let validateTransferReceiveOTP = response.validateTransferReceiveOTP;
				
				if(tlOTP != undefined && tlOTP != null && validateTransferReceiveOTP)
					$('#otpDiv').removeClass('hide');
				else
					$('#otpDiv').addClass('hide');
					
				if(response.showOTPAtTransferReceive != undefined && response.showOTPAtTransferReceive)
					$('#showOtp').text('OTP : '+tlOTP);

				$("#rejectFinal").click(function() {
					_this.rejectFinalData();
				});

				$("#receiveFinalData").click(function() {
					_this.receiveFinalData();
				});

				$('#otpId').on('blur', function() {
					if (validateTransferReceiveOTP) {
						const otp = $(this).val();
						const isValid = /^\d{4}$/.test(otp);

						if (!isValid)
							$('#otpError').text('Invalid OTP. Please enter a 4-digit numeric OTP.').show();
						else if (otp !== tlOTP)
							$('#otpError').text('OTP does not match. Please try again.').show();
						else
							$('#otpError').hide();
					}
				});

				$('#dispatchModel').on('show.bs.modal', function() {
					$('#otpEle').val('');
					$('#otpError').hide();
				});
				
				$('#validateReceiveDetails').on('click', function(e) {
					e.preventDefault();
						
					if (tlOTP != undefined && tlOTP != null && validateTransferReceiveOTP ) {
						let value = $('#otpId').val();
	
						if (!value || String(value).trim() === '') {
							showAlertMessage('error', 'OTP is required!');
							return false;
						}
	
						if (!/^\d{4}$/.test(String(value))) {
							showAlertMessage('error', 'Invalid OTP. Please enter a 4-digit numeric OTP.');
							return false;
						}
	
						let tlOTP = response.transferLedger.transferOTP;

						if (String(value) !== String(tlOTP)) {
							showAlertMessage('error', 'OTP does not match. Please try again.');
							return false;
						}
					}

					$('#myModal2').modal('show');
				});
				
				/*if (!tlOTP) {
					$('#otpEle').hide();
				} else {
					$('#otpEle').show();
				}*/

				hideLayer();
			});
		}, addElementInNodeForFinalReceive : function() {
			let myNod = nod();
			myNod.configure({
				parentClass:'validation-message'
			});

			myNod.add({selector: '#godownEle', validate: 'validateAutocomplete:#godownEle', errorMessage: 'Select proper Godown !'});
			myNod.add({selector: '#termsAndconditions', validate: 'checked', errorMessage: 'Accept Terms And Conditions !'});
			$("*[data-attribute=godown]").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
			$("*[data-attribute=terms]").find('label').append("<span style='color:red;font-size:20px;'>*</span>");
			
			return myNod;
		}, addElementInNodeForReject : function() {
			let myNod = nod();
			myNod.configure({
				parentClass:'validation-message'
			});

			myNod.add({selector: '#rejectAs',validate: 'checkForNumber:#rejectAs', errorMessage: 'Select Reject As	!'});
			myNod.add({selector: '#noOfArticlesEle', validate : 'checkGreater:#noOfArticlesEle:#totalArticlesin', errorMessage: 'Enter	Received Quantity  !'});
			myNod.add({selector: '#receivedWeightEle', validate : 'checkGreater:#receivedWeightEle:#totalWeightin', errorMessage: 'Enter  Received Weight  !'});
			myNod.add({selector: '#rejectRemark', validate : 'presence', errorMessage: 'Enter proper Remark !'});
			
			$("*[data-attribute=reason]").find('label span.asterisk').remove();
			$("*[data-attribute=noOfArticles]").find('label span.asterisk').remove();
			$("*[data-attribute=receivedWeight]").find('label span.asterisk').remove();
			$("*[data-attribute=remark]").find('label span.asterisk').remove();
			
			$("*[data-attribute=reason]").find('label').append("<span class='asterisk' style='color:red;font-size:20px;'>*</span>");
			$("*[data-attribute=noOfArticles]").find('label').append("<span class='asterisk' style='color:red;font-size:20px;'>*</span>");
			$("*[data-attribute=receivedWeight]").find('label').append("<span class='asterisk' style='color:red;font-size:20px;'>*</span>");
			$("*[data-attribute=remark]").find('label').append("<span class='asterisk' style='color:red;font-size:20px;'>*</span>");
			
			return myNod;
		}, setTransferLedgerDetails : function(tl) {
			let dataColumnArray		= new Array();
				
			dataColumnArray.push("<td>" + tl.transferLedgerNumber + "</td>");
			dataColumnArray.push("<td>" + tl.transferDateTimeStr + "</td>");
			dataColumnArray.push("<td>" + tl.transferByBranchName + " (" + tl.transferByAccountGroupName + ")" + "</td>");
			dataColumnArray.push("<td>" + tl.transferForBranchName + " (" + tl.transferForAccountGroupName + ")" + "</td>");
			dataColumnArray.push("<td>" + tl.vehicleNumber + "</td>");
			dataColumnArray.push("<td>" + tl.driverName + "</td>");
			dataColumnArray.push("<td>" + tl.driverMobile + "</td>");
				
			$('#loadingSheet tbody').append('<tr>' + dataColumnArray.join(' ') + '</tr>');
		}, setWayBillReceivableModel : function(response) {
			let corporateAccount		= response.CorporateAccount;
			
			if(corporateAccount != undefined && corporateAccount.length > 0) {
				TableDataWrapper.setTableData(response);
				$('#bottom-border-boxshadow').removeClass('hide');
			} else
				$('#bottom-border-boxshadow').addClass('hide');
		}, viewConsignmentDetails : function(wayBillId) {
			childwin = window.open ('consignmentDetails.do?pageId=340&eventId=2&modulename=consignmentDetails&wayBillId=' + wayBillId,'newwindow', config='left=200,top=130,width=1055,height=490, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
		}, receiveFinalData: function() {
		/*	let tlOTPForReceive = tlOTP
			let otpValue = $('#otpEle').val().trim();

			if (validateTransferReceiveOTP) {
				if (!otpValue) {
					showAlertMessage('error', 'Please enter the OTP.');
					return;
				}

				if (otpValue !== tlOTPForReceive) {
					showAlertMessage('error', 'OTP does not match!');
					return;
				}
			}*/
			console.log('dsadadadaassad')

			let jsonObject	= {};
			
			let wayBillIdList		= getAllCheckBoxSelectValue('uniqueIds');

			jsonObject['wayBillIds']			= wayBillIdList.join(',');
			jsonObject['transferLedgerId']		= transferLedgerId;
			jsonObject['remark']				= $('#remarkEle').val();
			jsonObject['godownId']				= $('#godownEle').val();
			jsonObject['TOKEN_KEY']				= TOKEN_KEY;
			jsonObject['TOKEN_VALUE']			= TOKEN_VALUE;
			jsonObject['transferOTP']			= $('#otpEle').val();

			
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/transferReceiveLedgerWS/validateAndReceiveLedger.do?', _this.setResponseAfterReceive, EXECUTE_WITH_NEW_ERROR);
		}, rejectFinalData : function() {
			
			let myNod	= _this.addElementInNodeForReject();
			myNod.performCheck();
						
			if(!myNod.areAll('valid')) return;
					
			let jsonObject	= {};
			let rejectAs	= $('#rejectAs').val();
			let weight		= $('#receivedWeightEle').val();
			let remark		= $('#rejectRemark').val();
			let quantity	= $('#noOfArticlesEle').val()
			
			jsonObject['transferLedgerId']		= transferLedgerId;
			jsonObject['remark']				= remark;
			jsonObject['quantity']				= quantity;
			jsonObject['weight']				= weight;
			jsonObject['rejectAs']				= rejectAs;
			jsonObject['TOKEN_KEY']				= TOKEN_KEY;
			jsonObject['TOKEN_VALUE']			= TOKEN_VALUE;
			jsonObject['privateMark']			= remark;
			jsonObject['saidtoContain']			= corporateAccountObj.saidToContain;
			jsonObject['packingTypeMasterId']	= corporateAccountObj.packingTypeMasterId;
			jsonObject['ArticleType']			= corporateAccountObj.packingTypeStr;
			jsonObject['wayBillNumber']			= corporateAccountObj.wayBillNumber;
			jsonObject['consignmentDetailsId']	= corporateAccountObj.consignmentDetailsId;
			jsonObject['totalQuantity']			= corporateAccountObj.transferQuantity;
			jsonObject['totalWeight']			= corporateAccountObj.transferWeight;
			jsonObject['wayBillId']				= corporateAccountObj.wayBillId;
			jsonObject['transferByOperatorId']	= corporateAccountObj.transferByOperatorId;
			jsonObject['transferByBranchId']	= corporateAccountObj.transferByBranchId;
			jsonObject['communityOrderId']		= corporateAccountObj.communityOrderId;
			
			if(Number(rejectAs) == 1) {
				jsonObject['ShortArticle']	= quantity;
				jsonObject['shortWeight']	= weight;
			} else if(Number(rejectAs) == 3) {
				jsonObject['DamageArticle']	= quantity;
				jsonObject['damageWeight']	= weight;
			}
			
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/transferReceiveLedgerWS/rejectTransferLedger.do?', _this.setResponse, EXECUTE_WITH_NEW_ERROR);
		}, setResponseAfterReceive : function(response) {
			
			if(response.message != undefined) {
				let errorMessage = response.message;
				
				if(errorMessage.type != MESSAGE_TYPE_SUCCESS) {
					TOKEN_KEY			= response.TOKEN_KEY;
					TOKEN_VALUE			= response.TOKEN_VALUE;
					return;
				}
			}
			
			if(response.isTLReceived && opener != undefined) {
				if (typeof opener.document.getElementById('tranceSuccessMessage') !== 'undefined')
					opener.document.getElementById("tranceSuccessMessage").innerHTML	= "All the LRs have been received for the TL No " + response.tlNumber;
				
				if (typeof opener.document.getElementById('tlReceiveButton_' + transferLedgerId) !== 'undefined')
					opener.document.getElementById('tlReceiveButton_' + transferLedgerId).innerHTML	= 'Received';
					
				if (typeof opener.document.getElementById('transferLedgerNumber_' + transferLedgerId) !== 'undefined')
					opener.document.getElementById('transferLedgerNumber_' + transferLedgerId).innerHTML	= response.tlNumber;
			} else if(opener != undefined) {
				if (typeof opener.document.getElementById('tranceSuccessMessage') !== 'undefined')
					opener.document.getElementById("tranceSuccessMessage").innerHTML	= "All the selected LRs have been received for the TL No " + response.tlNumber;
					location.reload();
			}
			
			 _this.transferReceiveLedgerPrint(response.transferReceiveLedgerId);
			transferReceiveLedgerId =response.transferReceiveLedgerId;
			hideLayer();
			
			let MyRouter = new Marionette.AppRouter({});
			MyRouter.navigate('&modulename=transferReceiveLedger&transferReceiveLedgerId='+transferReceiveLedgerId+'&' + MASTERID + "=" + transferLedgerId + '&' + MASTERID2 + "=" + response.trlNumber, {trigger: true});
			hideLayer();
			location.reload();
		}, transferReceiveLedgerPrint : function(transferReceiveLedgerId) {
			if(transferReceiveLedgerId == undefined || transferReceiveLedgerId == null || transferReceiveLedgerId == 0)
				transferReceiveLedgerId = UrlParameter.getModuleNameFromParam('transferReceiveLedgerId');
			
			var newwindow=window.open('TransferReceiveLSPrint.do?pageId=340&eventId=10&modulename=transferReceiveLsPrint&masterid='+transferReceiveLedgerId+'&isReprint=true', 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
		},setResponse : function(response){
			hideLayer();
			$('#remarkModal').modal('hide');
			$('#receiveTransferLedger').addClass('hide');
			$('#remarkModal').find('input[type="text"], select').val('');
			location.reload();
		}
	});
});
