define([  
	PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,'JsonUtility'
	,'messageUtility'
	,'autocomplete'
	,'autocompleteWrapper'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
	],function(Selection) {
	'use strict';
	
	let jsonObject = new Object(), myNod, pendingDetailsList, letestBalance = 0, _this = '',isDoneTheStuff=false,isApproved=false,btModalConfirm,totalVoucherCount=0,
	showPaymentModeColumn = false, validateOpeningBalanceToCreateBranchExpense = false, letestBalanceMap, validateletestBalanceToCreateBranchExpence = false ,
	showButtonForExpensePhotoDetails = false  , allowToEditExpenseAmount = false , 	showExpenseVoucherApprovalRemarkFeild = false, showExpenseType = false;

	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/expenseVoucherApprovalWS/loadExpenseVoucherApproval.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		}, getElementConfigDetails : function(response) {
			let loadelement = new Array();
			let baseHtml 	= new $.Deferred();
 
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/expenseVoucherApproval/expenseVoucherApproval.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				let keyObject = Object.keys(response);
				
				for (const element of keyObject) {
					if (response[element])
						$("*[data-attribute="+ element+ "]").removeClass("hide");
				}
				
				showPaymentModeColumn						= response.paymentMode;
				validateletestBalanceToCreateBranchExpence	= response.validateletestBalanceToCreateBranchExpence;
				showButtonForExpensePhotoDetails 			= response.showButtonForExpensePhotoDetails
				allowToEditExpenseAmount 					= response.allowToEditExpenseAmount

				validateOpeningBalanceToCreateBranchExpense = response.validateOpeningBalanceToCreateBranchExpense;
				showExpenseVoucherApprovalRemarkFeild		= response.showExpenseVoucherApprovalRemarkFeild;
				showExpenseType								= response.showExpenseType;
			
				if(showPaymentModeColumn)
					_this.setPaymentType();
				
				let elementConfiguration	= new Object();

				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');

				response.elementConfiguration			= elementConfiguration;
				response.isCalenderSelection			= true;
				response.sourceAreaSelection			= true;
				response.isPhysicalBranchesShow			= true;
				
				Selection.setSelectionToGetData(response);

				hideLayer();
				
				myNod = Selection.setNodElementForValidation(response);

				$("#searchBtn").click(function() {
					myNod.performCheck();
						
					if(myNod.areAll('valid'))
						_this.findPendingExpenseVoucherForApproval();								
				});

				$("#approveAll").bind("click", function() {
					_this.approveAll();
				});
				
				if(showExpenseType) {
					$("#expenseTypeDiv").removeClass("hide");
					let autoSelectionName 			= new Object();
					autoSelectionName.primary_key 	= 'expenseTypeId';
					autoSelectionName.field 		= 'expenseType';
					$("#expenseTypeEle").autocompleteCustom(autoSelectionName);
					
					let autoSelectionNameInstance 	= $("#expenseTypeEle").getInstance();

					$(autoSelectionNameInstance).each(function() {
						this.option.source 			= response.expenseTypeArr;
					});

					$("#expenseTypeEle").val("All");
					$("#expenseTypeEle_primary_key").val(0);
				} else
					$("#expenseTypeDiv").remove();
			});

		}, findPendingExpenseVoucherForApproval : function() {
			showLayer();
			
			let jsonObject = Selection.getElementData();
			
			if($('#expenseTypeEle').exists())
				jsonObject.expenseTypeId = $('#expenseTypeEle_primary_key').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/expenseVoucherApprovalWS/getPendingExpenseVoucherForApprove.do', _this.setExpenseVoucherDetails, EXECUTE_WITH_ERROR);
		}, setExpenseVoucherDetails : function(response){
			$('#pendingExpenseVoucherTable tbody').empty();
			removeTableRows('pendingExpenseVoucherTable', 'table');
			showPartOfPage('bottom-border-boxshadow');
			
			if(response.message != undefined) {
				$('#bottom-border-boxshadow').addClass('hide');
				hideLayer();
				return false;
			}			
			
			hideLayer();
			
			pendingDetailsList				= response.ExpenseVoucherDetails;
			letestBalanceMap				= response.letestBalanceMap;
			totalVoucherCount 				= pendingDetailsList.length;
			
			if(typeof totalVoucherCount == undefined || totalVoucherCount == 0) {
				showMessage('error', 'no Record found');
				return false;
			}
			
			$('#bottom-border-boxshadow').removeClass('hide');
			
			let columnHeadArray		= new Array();
			
			columnHeadArray.push("<th style='width: 6%; text-align: center; vertical-align: middle;'>Select <br> <input name='lrDetailsSelectAll' id='lrDetailsSelectAll'  type='checkbox' value='lrDetailsTable' onclick='selectAllCheckBox(this.checked,this.value);'></th>");
			columnHeadArray.push("<th style='width: 6%; text-align: center;'>Voucher No</th>");	
			columnHeadArray.push("<th style='width: 6%; text-align: center;'>Creation Date</th>");
			columnHeadArray.push("<th style='width: 8%; text-align: center;'>Branch</th>");
			columnHeadArray.push("<th style='width: 8%; text-align: center;'>Expense Head</th>");
			columnHeadArray.push("<th style='width: 8%; text-align: center;'>Remark</th>");
			columnHeadArray.push("<th style='width: 8%; text-align: center;'>Total</th>");
			columnHeadArray.push("<th style='width: 8%; text-align: center;'>Approve Status</th>");
			
			if(showExpenseType)
				columnHeadArray.push("<th style='width: 8%; text-align: center;'>Expense Type</th>");
			
			if(showPaymentModeColumn)
				columnHeadArray.push("<th style='width: 8%; text-align: center;'>Payment Mode</th>");
			
			if(allowToEditExpenseAmount)
				columnHeadArray.push("<th style='width: 15%; text-align: center;'>Edit Amount</th>");
		
			if(showExpenseVoucherApprovalRemarkFeild)
				columnHeadArray.push("<th style='width: 8%; text-align: center;'>Remark</th>");
			
			if(showButtonForExpensePhotoDetails)
				columnHeadArray.push("<th style='width: 15%; text-align: center;'>View Photos</th>");
			
			columnHeadArray.push("<th style='width: 15%; text-align: center;'> Approve / Reject</th>");

			if(!$("#pendingExpenseVoucherTable").children().find('#lrcloumn').exists())
				$('#pendingExpenseVoucherTable thead').append('<tr id="lrcloumn">' + columnHeadArray.join(' ') + '</tr>');
			
			for(const element of pendingDetailsList) {
				if(!$("#voucherDetailsId_" + element.exepenseVoucherDetailsId).exists()) {
					let columnArray			= new Array();
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><input type='checkbox' name='voucherToApprove' id='voucherToApprove' value='" + element.exepenseVoucherDetailsId + "' /></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + element.paymentVoucherNumber + "</td>");						
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + element.expenseDateTimeStr + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + element.branch + "</td>");
					columnArray.push("<td style='text-align: left;   vertical-align: middle;' id='expenseName_" + element.exepenseVoucherDetailsId + "'>" + element.expenseName + "</td>");
					columnArray.push("<td style='text-align: left;   vertical-align: middle;word-break:break-all;' id='expenseRemark_" + element.exepenseVoucherDetailsId + "'>" + element.remark + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;' id='expenseAmount_" + element.exepenseVoucherDetailsId + "'>" + element.totalAmount + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + element.expenseVoucherAppoveStatusString + "</td>");
					
					if(showExpenseType)
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + element.expenseTypeName + "</td>");
					
					if(showPaymentModeColumn)
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + element.paymentModeName + "</td>");

					if(allowToEditExpenseAmount) {
						let editAmtBtn= "<button type='button' id='editAmt_" + element.exepenseVoucherDetailsId+"' class='btn btn-info'>Edit Amt</button></td>" ;
						columnArray.push("<td style='text-align: center; vertical-align: middle;' >" + editAmtBtn + "</td>");
					}

					if(showExpenseVoucherApprovalRemarkFeild)
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" +"<input type='text' class='form-control' " +"placeholder='Enter Remark' maxlength='200' " +"name='remark_" + element.exepenseVoucherDetailsId + "' " +"id='remark_" + element.exepenseVoucherDetailsId + "' " +"value='' />" +"</td>");
					
					if(showButtonForExpensePhotoDetails) {
						let showVoucherBtn= "<button type='button' id='showVoucher_" + element.exepenseVoucherDetailsId+"' class='btn btn-primary'  >Show Voucher</button> ";
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + showVoucherBtn + "</td>");
					}
					
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><button type='button' id='approve_"+element.exepenseVoucherDetailsId+"' class='btn btn-success'>Approve</button> "
												+ "&nbsp;&nbsp;&nbsp<button type='button' id='reject_" + element.exepenseVoucherDetailsId+"' class='btn btn-danger'>Reject</button></td>");
												
					$('#pendingExpenseVoucherTable tbody').append("<tr id='voucherDetailsId_" + element.exepenseVoucherDetailsId+"' >" + columnArray.join(' ') + "</tr>");
					
					if(showButtonForExpensePhotoDetails) {
						$("#showVoucher_" + element.exepenseVoucherDetailsId).bind("click", function() {
							childwin = window.open('photoService.do?pageId=340&eventId=2&modulename=viewPhotoUpload&masterid=' + $(this).attr('id').split('_')[1] + '&moduleId=' + BRANCH_EXPENSE,'newwindow', 'height=600,width=825, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
						});
					}
					
					$("#approve_" + element.exepenseVoucherDetailsId).bind("click", function() {
						_this.approveExepenseVoucher($(this).attr('id').split('_')[1]);
					});
					
					$("#reject_" + element.exepenseVoucherDetailsId).bind("click", function() {
						_this.rejectExepenseVoucher($(this).attr('id').split('_')[1]);
					});
					
					if(allowToEditExpenseAmount) {
						$("#editAmt_" + element.exepenseVoucherDetailsId).bind("click", function() {
							childwin = window.open('viewDetails.do?pageId=340&eventId=2&modulename=updateVoucherDetails&voucherDetailsId='+ $(this).attr('id').split('_')[1]+'&redirectFilter=13&isFromVoucherApproval=true'  ,'new window','location=0, status=0 ,scrollbars=no, width=825, height=520, resizable=no');
						});
					}
				}
			}
			
			hideLayer();
		},approveExepenseVoucher : function(exepenseVoucherDetailsId){
			let checkBoxArray	= new Array();
			checkBoxArray.push(exepenseVoucherDetailsId);
			
			let jsonObject 				= new Object();
			
			jsonObject["voucherDetailsIds"]						= checkBoxArray.join(',');
			let $remarkInput = $('#remark_' + exepenseVoucherDetailsId);

			jsonObject['remark_' + exepenseVoucherDetailsId] =   $remarkInput.length > 0 ? $remarkInput.val() : "";

			if(validateOpeningBalanceToCreateBranchExpense) {
				let detail = pendingDetailsList.find(detail => detail.exepenseVoucherDetailsId == exepenseVoucherDetailsId);
				letestBalance = letestBalanceMap[detail.branchId];
				
				if(letestBalance < detail.totalAmount) {
					showMessage('error', 'Your ' + detail.branch + ' Branch Balance Is ' + letestBalance + ', It Should Be Greater Than Expence Amount ' + detail.totalAmount + '.');
					hideLayer();
					return false;
				}
			}
			
			btModalConfirm = new Backbone.BootstrapModal({
				content		: 	"Are you sure want Approve Voucher ?",
				modalWidth 	: 	30,
				title		:	'Add Seleted Voucher',
				okText		:	'YES',
				showFooter 	: 	true,
				okCloses	:	true
			}).open();

			if(!isDoneTheStuff) {
				btModalConfirm.on('ok', function() {
					getJSON(jsonObject, WEB_SERVICE_URL + '/expenseVoucherApprovalWS/insertApprovedBranchExpense.do', _this.responseAfterSingleScucess, EXECUTE_WITH_ERROR);
					showLayer();
					isDoneTheStuff = true;
				});
			}
			
			btModalConfirm.on('cancel', function() {
				hideLayer();
				isDoneTheStuff = false;
			});
			
		}, rejectExepenseVoucher: function(exepenseVoucherDetailsId){
			let jsonObject 				= new Object();
			
			btModalConfirm = new Backbone.BootstrapModal({
				content		: 	"Are you sure want Reject Voucher ?",
				modalWidth 	: 	30,
				title		:	'Add Seleted Voucher',
				okText		:	'YES',
				showFooter 	: 	true,
				okCloses	:	true
			}).open();
			
			if(!isDoneTheStuff) { 
				btModalConfirm.on('ok', function() {
					jsonObject["exepenseVoucherDetailsId"]			= exepenseVoucherDetailsId;
					jsonObject.isExepenseVoucherRejected				= true;
					
					getJSON(jsonObject, WEB_SERVICE_URL + '/branchIncomeExpenseWS/paymentVoucherCancellationProcess.do', _this.responseAfterScucess, EXECUTE_WITH_ERROR);
					isDoneTheStuff = true;
					showLayer();
				});
			}
			
			btModalConfirm.on('cancel', function() {
				hideLayer();
				isDoneTheStuff = false;
			});
		}, approveAll : function() {
			let checkBoxArray		= new Array();
			let totalApprovMap		= new Map();
			
			$.each($("input[name=voucherToApprove]:checked"), function() { 
				checkBoxArray.push($(this).val());
			});
			
			if(checkBoxArray.length == 0) {
				showMessage('error', iconForErrMsg + 'Please Select At least Expense Voucher !');
				return false;
			}
			
			if(validateletestBalanceToCreateBranchExpence){
				for(const approveId of checkBoxArray){
					var detail = pendingDetailsList.find(detail => detail.exepenseVoucherDetailsId == approveId);
					
					if (totalApprovMap.has(detail.branchId))
				        totalApprovMap.set(detail.branchId, totalApprovMap.get(detail.branchId) + detail.totalAmount);
				    else
				        totalApprovMap.set(detail.branchId, detail.totalAmount);
				}
				
				for(const approveId of checkBoxArray) {
					var detail = pendingDetailsList.find(detail => detail.exepenseVoucherDetailsId == approveId);

					if(totalApprovMap.get(detail.branchId) > letestBalanceMap[detail.branchId]){
						showMessage('error','Your '+ detail.branch +' Branch Balance Is ' + letestBalanceMap[detail.branchId] + ', It Should Be Greater Than Expence Amount ' + totalApprovMap.get(detail.branchId) + '.');
						hideLayer();
						return false;
					}
				}
			}
			
			if(!isApproved)
				isApproved = true;
			
			if(validateletestBalanceToCreateBranchExpence) {
				for(let data of pendingDetailsList) {
					if(checkBoxArray[0] == data.exepenseVoucherDetailsId) {
						letestBalance = data.letestBalance;
						break;
					}
				}
			}
				
			btModalConfirm = new Backbone.BootstrapModal({
				content		: 	"Are you sure want Approve Voucher ?",
				modalWidth 	: 	30,
				title		:	'Add Seleted LRs',
				okText		:	'YES',
				showFooter 	: 	true,
				okCloses	:	true
			}).open();

			btModalConfirm.on('ok', function() {
				jsonObject["voucherDetailsIds"]						= checkBoxArray.join(',');
					
				checkBoxArray.forEach(function(voucherId) {
				    let $input = $('#remark_' + voucherId);
				    let remarkValue = $input.length > 0 ? $input.val() : "";
				    jsonObject['remark_' + voucherId] = remarkValue;
				});
					
				if(!isDoneTheStuff)
					getJSON(jsonObject, WEB_SERVICE_URL + '/expenseVoucherApprovalWS/insertApprovedBranchExpense.do', _this.responseAfterScucess, EXECUTE_WITH_ERROR);
					
				isDoneTheStuff = true;
				showLayer();
			});

			btModalConfirm.on('cancel', function() {
				hideLayer();
				isDoneTheStuff = false;
				isApproved = false;
			});
		}, responseAfterSingleScucess : function(response) {
			if(response.message != undefined) {
				refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');

				 setTimeout(function() {
		            _this.findPendingExpenseVoucherForApproval(_this);
		        }, 1000);

				btModalConfirm.close();
				isDoneTheStuff = false;
				hideLayer();
				return;
			}
			hideLayer();
		}, responseAfterScucess : function(response) {
			if(response.message != undefined) {
				refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');

				setTimeout(function() {
		            _this.findPendingExpenseVoucherForApproval(_this);
		        }, 2000);

				totalVoucherCount = 0
				btModalConfirm.close();
				isDoneTheStuff = false;
				isApproved = false;
				hideLayer();
			}
		}, setPaymentType : function() {
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
		}, setPaymentTypeAutocompleteInstance : function() {
			let autoPaymentTypeName 			= new Object();
			autoPaymentTypeName.primary_key 	= 'paymentTypeId';
			autoPaymentTypeName.field 			= 'paymentTypeName';

			$("#paymentTypeEle").autocompleteCustom(autoPaymentTypeName)
		}
	});
});

function selectAllCheckBox(param,tabName){
	let tab 	= document.getElementById('pendingExpenseVoucherTable');
	
	for(let row = 1 ; row < tab.rows.length; row++){
		if(tab.rows[row].cells[0].firstChild != null){	
			tab.rows[row].cells[0].firstChild.checked = param;
		}
	}

}