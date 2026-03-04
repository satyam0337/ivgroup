	let list = null;
	let lsSourceBranchId =0;
	let  id = 0;

define([ PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js'//PopulateAutocomplete
	,'JsonUtility'
	,'messageUtility'
	,'autocomplete'
	,'autocompleteWrapper'
	,'nodvalidation'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	], function(Selection) {
	'use strict';
	var jsonObject = new Object(), myNod,myNod1,  _this = '', BRANCH_SELECTION = 1, PARTY_SELECTION = 2, WAYBILL_NUMBER_SELECTION = 3;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
			this.$el.html(this.template);
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/codDispatchWS/getCODDispatchElement.do?',_this.setElementDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		},setElementDetails : function(response){
			initialiseFocus();
			var loadelement = new Array();
			var baseHtml 	= new $.Deferred();

			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/cod/codDispatch.html",function() {
				baseHtml.resolve();
			
				$("#codNumberEle" ).keydown(function(e) {
					if (e.which == 13) {
						_this.searchCOD();
					}
				});
			});
			
			$.when.apply($, loadelement).done(function() {
				var keyObject = Object.keys(response);
				
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]])
						$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
				}
				
				response.isCalenderSelection		= response['date'];
				response.executiveTypeWiseBranch	= true;
				
				var elementConfiguration	= new Object();
				
				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.branchElement		= $('#codBranchEle');
				
				response.elementConfiguration	= elementConfiguration;
				
				Selection.setSelectionToGetData(response);
				
				var autoSelectionName 			= new Object();
				autoSelectionName.primary_key 	= 'selectionId';
				autoSelectionName.field 		= 'selectionName';
				autoSelectionName.callBack 		= _this.onSearchBySelect;

				$("#searchByOptionEle").autocompleteCustom(autoSelectionName);
				
				var autoSelectionNameInstance 	= $("#searchByOptionEle").getInstance();

				$(autoSelectionNameInstance).each(function() {
					this.option.source 			= response.selectionArr;
				});
				
				var codBranchAutoComplete1 = new Object();
				codBranchAutoComplete1.primary_key 	= 'branchId';
				codBranchAutoComplete1.field 		= 'branchName';
				codBranchAutoComplete1.url			= response.branchList;
				$("#codBranchElepopup").autocompleteCustom(codBranchAutoComplete1);
				
				
				let partyNameAutoComplete = new Object();
				partyNameAutoComplete.primary_key = 'corporateAccountId';
				partyNameAutoComplete.url = WEB_SERVICE_URL + '/autoCompleteWS/getPartyDetailsAutocomplete.do';
				partyNameAutoComplete.field = 'corporateAccountDisplayName';
				$("#partyNameEle").autocompleteCustom(partyNameAutoComplete);
						
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				myNod.add({
					selector		: '#codBranchEle',
					validate		: 'validateAutocomplete:#codBranchEle_primary_key',
					errorMessage	: 'Select COD Branch !'
				});

				myNod1 = nod();
				myNod1.configure({
					parentClass:'validation-message'
				});
				
				myNod.add({
					selector		: '#wayBillNumberEle',
					validate		: 'validateAutocomplete:#lrNumberEleEle_primary_key',
					errorMessage	: 'Select LR Number !'
				});

				hideLayer();

				$("#findNumberBtn").click(function() {
					if($('#searchByOptionEle_primary_key').val() == BRANCH_SELECTION) {
						_this.searchCOD();	
						myNod.performCheck();
					} else if($('#searchByOptionEle_primary_key').val() == WAYBILL_NUMBER_SELECTION) {
						myNod1.performCheck();
						
						if(myNod1.areAll('valid'))
							_this.searchCOD();								
					}else if($('#searchByOptionEle_primary_key').val() == PARTY_SELECTION) {
						myNod1.performCheck();
						
						if(myNod1.areAll('valid'))
							_this.searchCOD();								
					}
				});
				
				$('#savebtn').click(function() { //bt
					if ($('input[type="checkbox"]:checked').length === 0) {
						showAlertMessage('error', 'Please Select At Least One CheckBox');
						return false;
					}
					
					$('#exampleModal').modal('show');
				});
				
				$('#saveRates').click(function() { //bt
					_this.saveRates()
				});

				function toDateInputValue(date) {
					var today = new Date();
					if (date > today) {
						date = today;
					}
					var local = new Date(date);
					local.setMinutes(date.getMinutes() - date.getTimezoneOffset());
					return local.toJSON().slice(0, 10);
				}

				$(document).ready(function() {
					$('#codDate').attr('max', toDateInputValue(new Date()));
					$('#codDate').val(toDateInputValue(new Date()));
				});

			});
		}, onSearchBySelect : function() {
			if($('#searchByOptionEle_primary_key').val() == BRANCH_SELECTION) {
				$('.codBranch').removeClass('hide');
				$('.lrNumber').addClass('hide');
				$('.codParty').addClass('hide');
			} else if($('#searchByOptionEle_primary_key').val() == WAYBILL_NUMBER_SELECTION) {
				$('.lrNumber').removeClass('hide');
				$('.codBranch').addClass('hide');
				$('.codParty').addClass('hide');
			}else if($('#searchByOptionEle_primary_key').val() == PARTY_SELECTION) {
				$('.codParty').removeClass('hide');
				$('.codBranch').addClass('hide');
				$('.lrNumber').addClass('hide');
			}
		}, searchCOD : function() {
			showLayer();
			
			var jsonObject = new Object();

			jsonObject.searchBy 						= $('#searchByOptionEle_primary_key').val();
			jsonObject.codBranchId  					= $("#codBranchEle_primary_key").val();
			jsonObject.lrNumber  						= $('#singleLREle').val();
			jsonObject.corporateAccountId  				= $("#partyNameEle_primary_key").val();

			console.log("jsonObject",jsonObject)
			getJSON(jsonObject, WEB_SERVICE_URL+'/codDispatchWS/getCodDetailsForDispatch.do?', _this.setData, EXECUTE_WITH_ERROR);
		}, setData : function(response) {
			hideLayer();
			$('#mainTable').empty();
		 	list = response.codDispatchList;

			if(list.length  > 0){
				$('#bottom-border-boxshadow').removeClass('hide');
				
				let headerColumnArray = new Array();
				headerColumnArray.push("<th style='width:50px; text-align: center; font-size:18px;box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white'   ><label class='switch m-auto'> <input type='checkbox' id='checkboxAll' onchange='checkBoxForAll();'  value='checkboxAll' unchecked> <span class='slider round'></span></label> </th>");
				headerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white"  >LR Number</th>');
				headerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white"  >Delivery Date</th>');
				headerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white"  >Consignor</th>');
				headerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white"  > Consignee</th>');
				headerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white"  > From</th>');
				headerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white"  > To</th>');
				headerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white" >COD Amount </th>');
				headerColumnArray.push("<th style='text-align: center;display:none ; font-size:15px;'><input style='font-weight:bold;' type='hidden' id='oxAll' value='checkboxAll' unchecked> </th>");
				headerColumnArray.push("<th style='text-align: center;display:none ; font-size:15px;'><input style='font-weight:bold;' type='hidden' id='xAll' value='checkboxAll' unchecked> </th>");

				$('#mainTable').append('<tr>' + headerColumnArray.join(' ') +' </tr>');
				
				for(let i=0;i < list.length;i++){
					var data = list[i];
	
					let dataColumnArray = new Array();
      				dataColumnArray.push("<td style='text-align: center;vertical-align:middle;font-size:15px; '> <label class='switch m-auto'> <input  id='check_"+i+"' value='check_"+i+"' type='checkbox' unchecked><span class='slider round'></span></label> </td>");
					dataColumnArray.push("<td style='text-align: center;vertical-align:middle; font-size:15px;'>" +data.wayBillNumber+ "</td>");
					dataColumnArray.push("<td style='text-align: center;vertical-align:middle; font-size:15px;'>" +data.txnDateTimeStr+ "</td>");
					dataColumnArray.push("<td style='text-align: center;vertical-align:middle; font-size:15px;'>" +data.consignor+ "</td>");
					dataColumnArray.push("<td style='text-align: center;vertical-align:middle; font-size:15px;'>" +data.consignee+ "</td>");
					dataColumnArray.push("<td style='text-align: center;vertical-align:middle; font-size:15px;' id='codNumber"+i+"'>" +data.sourceBranch+ "</td>");
					dataColumnArray.push("<td style='text-align: center;vertical-align:middle; font-size:15px;' id='codNumber"+i+"'>" +data.destinationBranch+ "</td>");
					dataColumnArray.push("<td style='text-align: center;vertical-align:middle;font-size:15px;' id='lsNumber_"+i+"'>" +data.codAmount+ "</td>");

					$("#mainTable").append('<tr>' +dataColumnArray.join(' ')+ '</tr>');
				}	
				
				let totalArray = new Array();
					
					$("#mainTable").append('<tr>' +totalArray.join(' ')+ '</tr>');
			}
		}, saveRates : function() {
			showLayer();
			let jsonObject = _this.getDataToSave();
			getJSON(jsonObject,WEB_SERVICE_URL + '/codDispatchWS/insertAndUpdateCodDetailsForDispatch.do?' ,_this.setResponse, EXECUTE_WITHOUT_ERROR);
		}, setResponse : function(response){
			hideLayer();
			
			if(response.message != undefined) {
				hideLayer();
				var errorMessage = response.message;
				
				if(errorMessage.typeName == 'success') {
					showMessage(errorMessage.typeName, 'COD Dispatch Number '+response.codDispatchNumber+' Successfully Created');
					refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
					
					var MyRouter = new Marionette.AppRouter({});
					MyRouter.navigate('&modulename=codDispatchid='+response.codDispatchLedgerId+'&masterid2='+response.codDispatchNumber);
					setTimeout(function(){ location.reload(); }, 1000);
				} else
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
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
				
					codData.lsSourceBranchId		= $('#codBranchEle_'+i).text();
					codData.pendingCodSettlementId  = list[i].pendingCodSettlementId
					codData.wayBillNumber           = list[i].wayBillNumber
					codData.codAmount          	    = list[i].codAmount
					codData.sourceBranchId			= list[i].sourceBranchId;
					codData.wayBillId       		= list[i].wayBillId
					codData.destinationBranchId		= $('#codBranchElepopup_primary_key').val();
					codData.codDispatchDate 		= $("#codDate").val();
					codData.lrDestinationBranchId	= list[i].destinationBranchId;
					
					codDetailsArray.push(codData);
				}
			
				lsSourceBranchId =$('#branchId_'+i).text();
			}

			jsonObject.CodDetails = JSON.stringify(codDetailsArray);
			jsonObject.codDispatchBranchId		= $('#codBranchElepopup_primary_key').val();
			jsonObject.codDate			        = $("#codDate").val();
			
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