var wayBillId, curDate;

define([ 'marionette'
		,'/ivcargo/resources/js/generic/urlparameter.js'
		,'slickGridWrapper2'
		,'nodvalidation'
		,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
		,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
		,'/ivcargo/resources/js/validation/regexvalidation.js'
		,'JsonUtility'
		,'messageUtility'
		,'focusnavigation'
	],
	function(Marionette, UrlParameter) {
	'use strict';// this basically give strictness to this specific js
	let jsonObject	= new Object(), myNod, accountGroupId = 0, showQtyPartNoAndDescriptionInInvoiceDetails = false, validateDeclaredValueInMultipleInvoiceDetails = false,
	_this = '', invoiceDetailArray = [];
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(){
			//initialize is the first function called on call new view()
			_this = this;
			wayBillId 				= UrlParameter.getModuleNameFromParam('wayBillId');
			jsonObject.waybillId	= wayBillId;
		}, render: function() {
			jsonObject				= new Object();
			jsonObject.waybillId	= wayBillId;
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/updateLRInvoiceDetailsWS/getPreviousInvoiceDetailsToUpdate.do?', _this.setInvoiceDetails, EXECUTE_WITH_ERROR);
		}, setInvoiceDetails : function(response) {
			let loadelement 			= new Array();
			let baseHtml 				= new $.Deferred();
			curDate 			   = response.maxDate;
						
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/waybill/editInvoiceDetails/updateMultipleInvoiceDetails.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();

				if(response.message != undefined) {
					hideLayer();
						
					$(".btAddNew").click(function() {
						 _this.addNewRows();
					});
					
					$(".saveBtn").click(function() {
						 _this.submitInvoiceDetailsData();
					});
				}
				
				hideLayer();
				
				$('#bottom-border-boxshadow').removeClass('hide');
				$('#reportData1 thead').empty();
				$('#reportData1 tbody').empty();
				$('#editMultipleInvoiceDetails').empty();
				
				_this.setInvoiceTableDetails(response);				
			});
		}, setInvoiceTableDetails: function(response) {
			accountGroupId									= response.accountGroupId;
			showQtyPartNoAndDescriptionInInvoiceDetails		= response.showQtyPartNoAndDescriptionInInvoiceDetails;
			validateDeclaredValueInMultipleInvoiceDetails	= response.validateDeclaredValueInMultipleInvoiceDetails;
			
			let columnArray		= new Array();
			
			columnArray.push("<th style='width: 6%;text-align: center'>Sr No.</th>");
			columnArray.push("<th style='width: 15%;text-align: center'>Invoice Number</th>");
			columnArray.push("<th style='width: 15%;text-align: center'>Invoice Date</th>");
			columnArray.push("<th style='width: 15%;text-align: center'>Declared Value</th>");
			
			if(showQtyPartNoAndDescriptionInInvoiceDetails) {
				columnArray.push("<th style='width: 15%;text-align: center'>Quantity</th>");
				columnArray.push("<th style='width: 20%;text-align: center'>Part No.</th>");
				columnArray.push("<th style='width: 20%;text-align: center'>Inv. Desc</th>");
			}
			
			columnArray.push("<th style='width: 15%;text-align: center'>Delete</th>");
			
			$('#reportData1 thead').append('<tr class="bg-primary text-center">' + columnArray.join(' ') + '</tr>');
					
			columnArray	= [];
			
			let invoiceDetailsArrList 	= response.invoiceDetailsArr;

			if(invoiceDetailsArrList != undefined && invoiceDetailsArrList.length > 0) {
				let count			= 0;
				columnArray		= new Array();
				
				for (var i = 0; i < invoiceDetailsArrList.length; i++) {
					var obj = invoiceDetailsArrList[i];
					
					count = count + 1;
				
					columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;''>" + (i + 1) + "</td>");
					columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'><input type='text' name='invoiceNumber'  id='invoiceNo" + i + "' value='" + obj.invoiceNumber + "' maxlength='20' class='form-control'/></td>");
					columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'><input class='form-control backDate' type='text' name='invoiceDate' id='invoiceDate" + i + "' value='" + obj.invoiceDate + "' onkeyup='setMonthYear(this);' onfocus='showInfo(this,'Invoice Date');' onblur='setMonthYear(this);' /></td>");
					columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'><input type='text' name='declaredValue' id='declaredValue" + i + "' value='" + obj.declaredValue + "' maxlength='10' class='form-control'/></td>");
					
					if(showQtyPartNoAndDescriptionInInvoiceDetails) {
						columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'><input type='text' name='qty' id='qty" + i + "' value='" + obj.quantity + "' maxlength='6' class='form-control' onkeypress='return noNumbers(event);if(getKeyCode(event) == 1){return false;}'/></td>");
						columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'><input type='text' name='partNo' id='partNo" + i + "' value='" + obj.partNumber + "' maxlength='20' class='form-control'/></td>");
						columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'><input type='text' name='invDesc' id='invDesc" + i + "' value='" + obj.description + "' maxlength='150' class='form-control'/></td>");
					}
					
					columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'><button type='button' class='deleteButton btn btn-danger' onclick='deleteRow(" + i + ")'>Delete</button></td>");
					columnArray.push("<td class='datatd hide' style='text-align: center; vertical-align: middle; font-size:15px;'><input type='hidden' name='invoiceDetailId' id='invoiceDetailId" + i + "' value='" + obj.invoiceDetailId + "'/></td>");

					$(function() {
						$('#invoiceDate' + i).val(obj.invoiceDate);
						$('#invoiceDate' + i).datepicker({
							maxDate		: curDate,
							minDate		: '01-01-2023',
							showAnim	: "fold",
							dateFormat	: 'dd-mm-yy'
						});
					});
					
					$('#reportData1 tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
					
					columnArray	= [];
				}
					
				$(".btAddNew").click(function() {
					 _this.addNewRows();
				});

				$(".saveBtn").click(function() {
					 _this.submitInvoiceDetailsData();
				});
			}
		},addNewRows: function() {
			let inputCount = $("#reportData1 tbody tr").length;
			
			for (let i = 0; i < inputCount; i++) {
				if(!_this.validateInvoiceFeilds(i))
					return;
			}
				
			let columnArray		= new Array();
			
			columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'>" + (inputCount + 1) + "</td>");
			columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'><input type='text' name='invoiceNumber' class='form-control' id='invoiceNo" + inputCount + "' value='' maxlength='20'/></td>");
			columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'><input class='form-control backDate2' type='text' name='invoiceDate' id='invoiceDate" + inputCount + "' value=''  onkeyup='setMonthYear(this);' onblur='setMonthYear(this);' /></td>");
			columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'><input type='text' name='declaredValue' class='form-control' id='declaredValue" + inputCount + "' value='' maxlength='10' placeholder='Allow only number' onkeypress='return validateFloatKeyPress(event, this);if(getKeyCode(event) == 17){return false;}'/></td>");
		
			if(showQtyPartNoAndDescriptionInInvoiceDetails) {
				columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'><input type='text' name='qty' id='qty" + inputCount + "' value='' maxlength='6' class='form-control' onkeypress='return noNumbers(event);if(getKeyCode(event) == 1){return false;}'/></td>");
				columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'><input type='text' name='partNo' id='partNo" + inputCount + "' value='' maxlength='20' class='form-control'/></td>");
				columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'><input type='text' name='invDesc' id='invDesc" + inputCount + "' value='' maxlength='150' class='form-control'/></td>");
			}

			columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;'><button type='button' class='deleteButton btn btn-danger' onclick='deleteRow(" + inputCount + ")'>Delete</button></td>");
			columnArray.push("<td class='datatd hide' style='text-align: center; vertical-align: middle; font-size:15px;'><input type='hidden' name='invoiceDetailId' id='invoiceDetailId" + inputCount + "' value='0' /></td>");

			$('#reportData1 tbody').append('<tr>' + columnArray.join(' ') + '</tr>');

			$('#invoiceNo' + inputCount).focus();
			next = "invoiceDate" + inputCount;
			
		}, validateInvoiceFeilds: function(i) {
			let invoiceNoVal = $('#invoiceNo' + i).val();
			let invoiceDateVal = $('#invoiceDate' + i).val();
			let declaredValueVal = $('#declaredValue' + i).val();

			if (invoiceNoVal == '') {
				showMessage('error', 'Enter Invoice  Number');
				$('#invoiceNo' + i).css('border-color', 'red');
				$('#invoiceNo' + i).focus();
				return false;
			} else if (invoiceDateVal == '') {
				showMessage('error', 'Enter invoice Date');
				$('#invoiceDate' + i).css('border-color', 'red');
				$('#invoiceDate' + i).focus();
				return false;
			} else if (!isValidDateFormat(invoiceDateVal)) {
				showMessage('error', 'Invalid date format. Use "dd-mm-yyyy".');
				$('#invoiceDate' + i).css('border-color', 'red');
				$('#invoiceDate' + i).focus();
				return false;  // Break out of the loop
			} else if (validateDeclaredValueInMultipleInvoiceDetails && declaredValueVal == '') {
				showMessage('error', 'Enter declared Value');
				$('#declaredValue' + i).css('border-color', 'red');
				$('#declaredValue' + i).focus();
				return false;
			}

			$('#invoiceNo' + i).css('border-color', '');
			$('#invoiceDate' + i).css('border-color', '');
			$('#declaredValue' + i).css('border-color', '');

			return true;
		}, submitInvoiceDetailsData: function() {
			let inputCount = $("#reportData1 tbody tr").length;
			
			for(let i = 0; i < inputCount; i++) {
				if(!_this.validateInvoiceFeilds(i))
					return;
			}

			if(!confirm('Are you sure you want Update Invoice Details ?'))
				return;

			invoiceDetailArray = [];
			let i = 0;

			$("#reportData1 tbody tr").each(function() {
				let invoiceDetailsObject = {};
				invoiceDetailsObject.idNum 			= i;
				invoiceDetailsObject.accountGroupId	= accountGroupId;

				$(this).find("input").each(function() {
					const id = $(this).attr("id");

					if (id == 'invoiceNo' + i)
						invoiceDetailsObject.invoiceNumber = $(this).val();

					if (id == 'invoiceDate' + i)
						invoiceDetailsObject.invoiceDate = $(this).val();

					if (id == 'declaredValue' + i && $(this).val() != '')
						invoiceDetailsObject.declaredValue = $(this).val();

					if (id == 'invoiceDetailId' + i)
						invoiceDetailsObject.invoiceDetailId = $(this).val();
					
					if (id == 'qty' + i)
						invoiceDetailsObject.quantity = $(this).val();
						
					if (id == 'partNo' + i)
						invoiceDetailsObject.partNumber = $(this).val();
						
					if (id == 'invDesc' + i)
						invoiceDetailsObject.description = $(this).val();

					$(this).val('');
				});
				
				i++;
				invoiceDetailArray.push(invoiceDetailsObject);
			});

			$("#reportData1").find("tr:gt(0)").remove();
			$('#addInvoiceDetailModal').modal('hide');

			let jsonObject = new Object();
			
			if (invoiceDetailArray != undefined && invoiceDetailArray.length > 0) {
				jsonObject.invoiceDetailsArr = JSON.stringify(invoiceDetailArray);;
				jsonObject.waybillId 		 = wayBillId;
				
				showLayer();				
				getJSON(jsonObject, WEB_SERVICE_URL + '/updateLRInvoiceDetailsWS/updateWayBillInvoiceDetails.do?', _this.redirectToPage, EXECUTE_WITH_ERROR);
			}
		}, redirectToPage : function(response) {
			redirectToAfterUpdate(response);
			
			hideLayer();
		}
	});
})

function deleteRow(index) {
	showLayer();
	let invoiceDetailId = $('#invoiceDetailId' + index).val();
	$('#reportData1 tbody tr:eq(' + index + ')').remove();
	
	if (invoiceDetailId > 0) {
		let jsonObject = new Object();
		jsonObject.waybillId = wayBillId;
		jsonObject.invoicedetailsid = invoiceDetailId;

		$.ajax({
			type: "POST",
			url: WEB_SERVICE_URL + '/updateLRInvoiceDetailsWS/deleteInvoiceDetailById.do?',
			data: jsonObject,
			dataType: 'json',
			success: function(data) {
				if (data.message != undefined) {
					let errorMessage = data.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					hideLayer();
				}
			}
		});
	}else
		showMessage('success', 'Row Deleted Successfully !');

	hideLayer();
}