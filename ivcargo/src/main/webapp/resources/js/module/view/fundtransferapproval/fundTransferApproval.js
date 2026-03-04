let doneTheStuff					= false;
define([  
	PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,'JsonUtility'
	,'messageUtility'
	,'autocomplete'
	,'autocompleteWrapper'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'focusnavigation'//import in require.config
	],function(Selection) {
	'use strict';
	let jsonObject = new Object(),myNod,_this = '',isDoneTheStuff=false,isApproved=false,btModalConfirm,totalVoucherCount=0,configuration;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/fundTransferApprovalWS/loadFundTransferApproval.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		},getElementConfigDetails : function(response){
			configuration= response;
			let loadelement = new Array();
			let baseHtml 	= new $.Deferred();

			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/fundtransferapproval/fundTransferApproval.html", function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				let keyObject = Object.keys(response);
				
				for (const element of keyObject) {
					if (response[element])
						$("*[data-attribute="+ element+ "]").removeClass("hide");
				}
				
				_this.setPaymentType();
				
				let elementConfiguration	= new Object();

				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');

				response.elementConfiguration			= elementConfiguration;
				response.sourceAreaSelection			= true;
				response.isPhysicalBranchesShow			= true;
				response.isCalenderSelection			= true;
				response.AllOptionsForRegion  	 		= true;
				response.AllOptionsForSubRegion  		= true;
				response.AllOptionsForBranch 	 		= true;
			
				Selection.setSelectionToGetData(response);
				
				hideLayer();
				
				myNod = Selection.setNodElementForValidation(response);

				myNod.add({
					selector: '#paymentTypeEle',
					validate: 'validateAutocomplete:#paymentTypeEle_primary_key',
					errorMessage: 'Select proper Payment Type !'
				});
					
				$("#searchBtn").click(function() {
					myNod.performCheck();
						
					if(myNod.areAll('valid'))
						_this.findPendingFundTransferForApproval();								
				});
			});

		}, findPendingFundTransferForApproval : function() {
			showLayer();
			
			let jsonObject = Selection.getElementData();
	
			getJSON(jsonObject, WEB_SERVICE_URL+'/fundTransferApprovalWS/getPendingFundTransferForApprove.do', _this.setFundTransferDetails, EXECUTE_WITH_ERROR);
		}, setFundTransferDetails : function(response){			
			$('#pendingFundTransferTable tbody').empty();
			removeTableRows('pendingFundTransferTable', 'table');
			
			if(response.message != undefined) {
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				$('#bottom-border-boxshadow').addClass('hide');
				hideLayer();
				return false;
			}
			
			hideLayer();
			
			$("#approveAll").bind("click", function() {
				_this.approveAll();
			});
			
			let pendingDetailsList			= response.fundTransferDetails;
					
			totalVoucherCount 				= pendingDetailsList.length;
			
			if(totalVoucherCount == 0) {
				showMessage('error', 'no Record found');
				return false;
			}
			
			$('#bottom-border-boxshadow').removeClass('hide');
			let columnHeadArray		= new Array();
			
			columnHeadArray.push("<th style='width: 5%; text-align: center; vertical-align: middle;'>Select <br> <input name='lrDetailsSelectAll' id='lrDetailsSelectAll'  type='checkbox' value='lrDetailsTable' onclick='selectAllCheckBox(this.checked,this.value);'></th>");
			columnHeadArray.push("<th style='width: 10%; text-align: center;'>Fund Transfer No</th>");	
			columnHeadArray.push("<th style='width: 10%; text-align: center;'>Creation Date</th>");
			columnHeadArray.push("<th style='width: 10%; text-align: center;'>Branchhh</th>");
			columnHeadArray.push("<th style='width: 10%; text-align: center;'>Total</th>");
			columnHeadArray.push("<th style='width: 10%; text-align: center;'>FT Remark</th>");
			columnHeadArray.push("<th style='width: 10%; text-align: center;'>Approve Status</th>");
			columnHeadArray.push("<th style='width: 10%; text-align: center;'>Payment Mode</th>");

			if(configuration.showFundApprovalRemarkColumn)
				columnHeadArray.push("<th style='width: 10%; text-align: center;'>Remark</th>");

			columnHeadArray.push("<th style='width: 15%; text-align: center;'> Approve / Reject</th>");
			
			if(!$("#pendingFundTransferTable").children().find('#lrcloumn').exists()){
				$('#pendingFundTransferTable thead').append('<tr id="lrcloumn">' + columnHeadArray.join(' ') + '</tr>');
			}
			
			for(const element of pendingDetailsList) {
				if(!$("#voucherDetailsId_"+element.fundTransferId).exists()) {
					let fundTransferNo = element.fundTransferNumber;
					let columnArray			= new Array();
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><input type='checkbox' name='voucherToApprove' id='voucherToApprove' value='" + element.fundTransferId + "' /></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + element.fundTransferNumber + "</td>");						
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + element.dateTimeStampstr + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + element.branchName + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + element.amount + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;word-break:break-all;'>" + element.remark + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + element.fundTransferApprovalStatusStr + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + element.paymentModeStr + "</td>");
					
					if(configuration.showFundApprovalRemarkColumn)
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><input type='text' class='form-control apprvRejRemarkInput' id='approveRejectRemark_" + element.fundTransferId + "' placeholder='Enter Remark' maxlength='250'/></td>");

					columnArray.push("<td style='text-align: center; vertical-align: middle;' ><button type='button' id='approve_"+element.fundTransferId+"' class='btn btn-success'  >Approve</button> "
							+ "&nbsp;&nbsp;&nbsp<button type='button' id='reject_"+element.fundTransferId+"' class='btn btn-danger'  >Reject</button></td>");
									
					$('#pendingFundTransferTable tbody').append("<tr id='voucherDetailsId_"+element.fundTransferId+"' >" + columnArray.join(' ') + "</tr>");
					
					$("#approve_" + element.fundTransferId).bind("click", function() {
						let elementId			= $(this).attr('id');
						let fundTransferId		= elementId.split('_')[1];
						let approveRejectRemark = $("#approveRejectRemark_" + fundTransferId).val();
					    _this.approveFundTransfer(fundTransferId, approveRejectRemark);
					});

					$("#reject_" + element.fundTransferId).bind("click", function() {
						let elementId			= $(this).attr('id');
						let fundTransferId		= elementId.split('_')[1];
						let approveRejectRemark = $("#approveRejectRemark_" + fundTransferId).val();
						_this.rejectFundTransfer(fundTransferId, fundTransferNo, approveRejectRemark);
					});
				}
			}
			
			hideLayer();
		}, approveFundTransfer : function(fundTransferId, approveRejectRemark) {
			let jsonObject 				= new Object();		
			let fundTransferApproveList = [];
		
			fundTransferApproveList.push({
				fundTransferId: fundTransferId,
				approvalRemark: approveRejectRemark
			});

	 		jsonObject["fundTransferApproveList"] 				= JSON.stringify(fundTransferApproveList);
			
			btModalConfirm = new Backbone.BootstrapModal({
				content		: 	"Are you sure want to Appove Fund Transfer ?",
				modalWidth 	: 	30,
				title		:	'Appove Fund Transfer',
				okText		:	'YES',
				showFooter 	: 	true,
				okCloses	:	true
			}).open();

			if(!isDoneTheStuff) {
				btModalConfirm.on('ok', function() {
					getJSON(jsonObject, WEB_SERVICE_URL + '/fundTransferApprovalWS/insertApprovedFundTransfer.do', _this.responseAfterSingleScucess, EXECUTE_WITH_ERROR);
					showLayer();
					isDoneTheStuff = true;
				});
			}
			
			btModalConfirm.on('cancel', function() {
				hideLayer();
				isDoneTheStuff = false;
			});
			
		},rejectFundTransfer: function(fundTransferId, fundTransferNumber, approveRejectRemark){
			let jsonObject 				= new Object();
			
			btModalConfirm = new Backbone.BootstrapModal({
				content		: 	"Are you sure want to Reject Fund Transfer ?",
				modalWidth 	: 	30,
				title		:	'Add Seleted Voucher',
				okText		:	'YES',
				showFooter 	: 	true,
				okCloses	:	true
			}).open();
			
			if(!isDoneTheStuff) { 
				btModalConfirm.on('ok', function() {
					jsonObject["fundTransferId"]			= fundTransferId;
					jsonObject.isfundTransferRejected		= true;
					jsonObject.fundTransferNumber			= fundTransferNumber;
					jsonObject.remark						= approveRejectRemark;

					getJSON(jsonObject, WEB_SERVICE_URL + '/fundTransferWS/cancleFundTransfer.do', _this.responseAfterScucess, EXECUTE_WITH_ERROR);
					isDoneTheStuff = true;
					showLayer();
				});
			}
			
			btModalConfirm.on('cancel', function() {
				hideLayer();
				isDoneTheStuff = false;
			});
		}, approveAll : function() {
			let checkBoxArray	= getAllCheckBoxSelectValue('voucherToApprove');
			let fundTransferApproveList = [];

			checkBoxArray.forEach(function(fundTransferId) {
				let remark = $("#approveRejectRemark_" + fundTransferId).val();
			
				fundTransferApproveList.push({
					fundTransferId: fundTransferId,
					approvalRemark: remark
				});
			});

			if(checkBoxArray.length == 0) {
				showMessage('error', iconForErrMsg + 'Please Select At least one Fund Transfer !');
				return false;
			}
			
			if(!isApproved) {
				isApproved = true;

				btModalConfirm = new Backbone.BootstrapModal({
					content		: 	"Are you sure want to Approve Fund Transfer ?",
					modalWidth 	: 	30,
					title		:	'Add Seleted LRs',
					okText		:	'YES',
					showFooter 	: 	true,
					okCloses	:	true
				}).open();

				btModalConfirm.on('ok', function() {
					jsonObject["fundTransferApproveList"] = JSON.stringify(fundTransferApproveList);

					if(!isDoneTheStuff)
						getJSON(jsonObject, WEB_SERVICE_URL + '/fundTransferApprovalWS/insertApprovedFundTransfer.do', _this.responseAfterScucess, EXECUTE_WITH_ERROR);

					isDoneTheStuff = true;
					showLayer();
				});

				btModalConfirm.on('cancel', function() {
					hideLayer();
					isDoneTheStuff = false;
					isApproved = false;
				});
			}
		}, responseAfterSingleScucess : function(response) {
			isDoneTheStuff = false;
			
			if(response.message != undefined) {
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
				_this.findPendingFundTransferForApproval();
				btModalConfirm.close();
				hideLayer();
				return;
			}
			hideLayer();
		}, responseAfterScucess : function(response) {
			hideLayer();
			isDoneTheStuff = false;
			
			if(response.message != undefined) {
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
				_this.findPendingFundTransferForApproval();
				totalVoucherCount = 0
				btModalConfirm.close();
				isApproved = false;
			}
		},setPaymentType : function(){
			
			_this.setPaymentTypeAutocompleteInstance();
			
			let autoPaymentType = $("#paymentTypeEle").getInstance();
			
			let PaymentTYPE = [
					{ "paymentTypeId":-1, "paymentTypeName": "ALL" },
			        { "paymentTypeId":1, "paymentTypeName": "CASH" },
			        { "paymentTypeId":2, "paymentTypeName": "CASHLESS"},
			    ]
			
			$( autoPaymentType ).each(function() {
				this.option.source = PaymentTYPE;
			})
		},setPaymentTypeAutocompleteInstance : function() {
			let autoPaymentTypeName 			= new Object();
			autoPaymentTypeName.primary_key 	= 'paymentTypeId';
			autoPaymentTypeName.field 			= 'paymentTypeName';

			$("#paymentTypeEle").autocompleteCustom(autoPaymentTypeName)
		}
	});
});

function selectAllCheckBox(param,tabName){
	let tab 	= document.getElementById('pendingFundTransferTable');
	let count 	= parseFloat(tab.rows.length-1);
	if(param == true){
		for(let row = 1 ; row < tab.rows.length; row++){
			if(tab.rows[row].cells[0].firstChild != null){	
				tab.rows[row].cells[0].firstChild.checked = true;
			}
		}
	
	} else if(param == false){
		for(row = 1 ; row <  tab.rows.length ; row++){
			if(tab.rows[row].cells[0].firstChild != null){	
				tab.rows[row].cells[0].firstChild.checked = false;
			}
		}
	}

}
