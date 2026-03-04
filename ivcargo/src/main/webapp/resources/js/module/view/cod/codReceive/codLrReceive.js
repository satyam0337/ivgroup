	let list = null;
	let  id = 0;
var codDispatchNumber=0;
var codDispatchLedgerId = 0;

define([
	'/ivcargo/resources/js/generic/urlparameter.js' 
	,'JsonUtility'
	,'messageUtility'
	,'autocomplete'
	,'autocompleteWrapper'
	,'nodvalidation'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,PROJECT_IVUIRESOURCES + '/resources/js/bootstrap/bootstrap.min.js'
	], function(UrlParameter) {
	'use strict';
	var jsonObject = new Object(),  _this = '';

	return Marionette.LayoutView.extend({
		initialize : function() {
			codDispatchNumber 				= UrlParameter.getModuleNameFromParam('codNumber');
			codDispatchLedgerId				= UrlParameter.getModuleNameFromParam('codLedgerId');
			
			_this = this;
			this.$el.html(this.template);
		},render : function() {
			jsonObject["codDispatchNumber"] 	= codDispatchNumber;
			jsonObject["codDispatchLedgerId"] 	= codDispatchLedgerId;
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/codReceiveWS/getCodDetailsForReceiveByCODId.do?', _this.setElementDetails, EXECUTE_WITH_ERROR);
			return _this;
		},setElementDetails : function(response){
			initialiseFocus();
			var loadelement = new Array();
			var baseHtml 	= new $.Deferred();

			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/cod/codLrReceive.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				_this.setReceiveData(response);
				
				$('#saveRates').click(function() { //bt
					if ($('input[type="checkbox"]:checked').length === 0) {
						showAlertMessage('error', 'Please Select At Least One CheckBox');
						return false; // Prevent default action
					}

					_this.saveRates()
				});
			});
		}, setReceiveData : function(response) {			
			hideLayer();
			$('#mainTables').empty();
		 	list = response.codReceiveLrList;

			if(list.length  > 0){
				$('#bottom-border-boxshadow').removeClass('hide');
			
				let headerColumnArray = new Array();
				headerColumnArray.push("<th style='width:50px; text-align: center; font-size:18px;box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white'   ><label class='switch m-auto'> <input type='checkbox' id='checkboxAll' onchange='checkBoxForAll();'  value='checkboxAll' unchecked> <span class='slider round'></span></label> </th>");
				headerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white"  >LR Number</th>');
				headerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white"  > From</th>');
				headerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white"  > To</th>');
				headerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white" >COD Amount </th>');
				headerColumnArray.push("<th style='text-align: center;display:none ; font-size:15px;'><input style='font-weight:bold;' type='hidden' id='oxAll' value='checkboxAll' unchecked> </th>");
				headerColumnArray.push("<th style='text-align: center;display:none ; font-size:15px;'><input style='font-weight:bold;' type='hidden' id='xAll' value='checkboxAll' unchecked> </th>");

				$('#mainTables').append('<tr>' + headerColumnArray.join(' ') +' </tr>');
				
				for (let i = 0; i < list.length; i++) {
					var data = list[i];

					let dataColumnArray = new Array();
					dataColumnArray.push("<td style='text-align: center;vertical-align:middle;font-size:15px; '> <label class='switch m-auto'> <input  id='check_" + i + "' value='check_" + i + "' type='checkbox' unchecked><span class='slider round'></span></label> </td>");
					dataColumnArray.push("<td style='text-align: center;vertical-align:middle; font-size:15px;'>" + data.wayBillNumber + "</td>");
					dataColumnArray.push("<td style='text-align: center;vertical-align:middle; font-size:15px;' id='codNumber"+i+"'>" +data.sourceBranch+ "</td>");
					dataColumnArray.push("<td style='text-align: center;vertical-align:middle; font-size:15px;' id='codNumber"+i+"'>" +data.lrDestinationBranch+ "</td>");
					dataColumnArray.push("<td style='text-align: center;vertical-align:middle;font-size:15px;'>" +data.codAmount+ "</td>");

					$("#mainTables").append('<tr>' + dataColumnArray.join(' ') + '</tr>');
				}
				let totalArray = new Array();
				$("#mainTables").append('<tr>' + totalArray.join(' ') + '</tr>');
			}

		},saveRates : function() {
			showLayer();
			let jsonObject = _this.getDataToSave();
			getJSON(jsonObject,WEB_SERVICE_URL + '/codReceiveWS/insertAndUpdateCodDetails.do?' ,_this.setResponse, EXECUTE_WITHOUT_ERROR);
		},setResponse : function(response){
			hideLayer();

			if(response.message != undefined) {
				hideLayer();
				
				var errorMessage = response.message;
				
				if(errorMessage.typeName == 'success') {
					showMessage(errorMessage.typeName, 'COD Receive Number '+response.codReceiveNumber+' Successfully Created');
					refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
					
					var MyRouter = new Marionette.AppRouter({});
					MyRouter.navigate('&modulename=codReceiveid='+response.codReceiveLedgerId+'&masterid2='+response.codReceiveNumber);
					setTimeout(function(){ window.close();; }, 1000);
				} else
					showAlertMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			}
		
			_this.onSubmit();
		},getDataToSave :function(){
			let jsonObject 			= new Object();
			let codDetailsArray = new Array();

			for(let i=0 ; i < list.length;i++){
				let ischeck = $("#check_"+i).prop("checked");
				
				if(ischeck){
					let codData = new Object();
					id = $("#check_"+i).val();
				
					codData.checkbox				=id;
					codData.wayBillNumber         = list[i].wayBillNumber
					codData.txnDateTimeStr        = list[i].txnDateTimeStr
					codData.consignor          	  = list[i].consignor
					codData.consignee         	  = list[i].consignee
					codData.sourceBranchStr       = list[i].sourceBranchStr
					codData.destinationBranchStr  = list[i].destinationBranchStr
					codData.codAmount          	  = list[i].codAmount
					codData.totalCodAmount 		  += codData.codAmount;
					codData.sourceBranchId		  = list[i].sourceBranchId;
					codData.destinationBranchId	  = list[i].destinationBranchId;
					codData.txnDateTime       	  = list[i].txnDateTime
					codData.wayBillId             = list[i].wayBillId
					codData.dispatchLedgerId      = list[i].dispatchLedgerId
					codData.lrDestinationBranchId = list[i].lrDestinationBranchId;
					codData.codDispatchSummaryId  = list[i].codDispatchSummaryId;
					codData.codDispatchLedgerId	  = list[i].codDispatchLedgerId;

					codDetailsArray.push(codData);
				}
			}
			
			jsonObject.CodDetails = JSON.stringify(codDetailsArray);
			 
			jsonObject.fromDate			= $("#dateEle").attr('data-startdate'); 
			jsonObject.toDate			= $("#dateEle").attr('data-enddate'); 
			jsonObject.regionId			= $('#regionEle_primary_key').val();
			jsonObject.subRegionId		= $('#subRegionEle_primary_key').val();
			jsonObject.branchId			=  $('#branchEle_primary_key').val();
			jsonObject.lrDestinationBranchId = $('#branchEle_primary_key').val();

			return jsonObject;
		}
	});
});

function checkBoxForAll(){
	for(let i = 0; i < list.length; i++) {
		$("#check_"+i).prop("checked", $("#checkboxAll").prop("checked"));
	}
}

$('input[type="checkbox"]').change(function() {
    var anyChecked = $('input[type="checkbox"]:checked').length > 0;
    $('#saveRate').prop('disabled', !anyChecked);
});
