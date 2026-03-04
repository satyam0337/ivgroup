/**
 * @Author Ashish Tiwari	16-04-2016
 */
var table = null;
var cityList = null;
var configuration	= null;
var billSelectionList	= null;
var cityWiseSeq  = false;
var sourceCitySourceBranchDestinationCityDestinationBranchSequence  = false;
var isCityBranchLrSequenceCounter = false;
var sdBranchWiseSeq  = false;
function loadSequenceCounterData() {

	var jsonObject		= new Object();
	jsonObject.filter	= 1;

	var jsonStr = JSON.stringify(jsonObject);


	showLayer();
	$.getJSON("SDWiseSeqCounterAjaxAction.do?pageId=227&eventId=3",
			{json:jsonStr}, function(data) {
				
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', iconForErrMsg + ' ' + data.errorDescription); // show message to show system processing error massage on top of the window.
					hideLayer();
				} else {

					jsondata				= data;
					executive				= jsondata.executive; // executive object
					branchId				= executive.branchId;
					accountGroupId			= executive.accountGroupId;
					cityList				= jsondata.city;
					// all constants
					billSelectionList		= jsondata.billSelectionList;

					// group configuration
					configuration					= data.configuration;
					isCityBranchLrSequenceCounter 	= configuration.isCityBranchLrSequenceCounter;
					cityWiseSeq  					= data.cityWiseSeq;
					sourceCitySourceBranchDestinationCityDestinationBranchSequence	= data.sourceCitySourceBranchDestinationCityDestinationBranchSequence;
					sdBranchWiseSeq					= data.sdBranchWiseSeq;

					var x = document.createElement("INPUT");
					x.setAttribute("type", "hidden");
					x.setAttribute("id", "DestinationSubRegionShow");
					x.setAttribute('value', configuration.isDestinationSubRegionShow);
					document.body.appendChild(x);
					
					if(configuration.showMaxRangeOfSourceDestinationWiseLRSequence)
						fetchAndShowMaxWaybillRange(data)

					if (!configuration.isDestinationSubRegionShow) {
						$('#destSubRegionDiv').hide();
					}

					if (cityWiseSeq) {

					    $('#cityDiv').show();
					    $('#destCityDiv').removeClass('hide').show();
					    $('#branchDiv').show();

					    renderDestBranchField();

					    $('#billSelectionDiv').hide();
					    $('#billSelectionDivHide').hide();
					    $('#sourceBranchSelection').hide();
					    $('#destinationRegionSelection').hide();
					    $('#destSubRegionDiv').hide();

					    setCityAutoComplete(cityList);
					    setDestCityAutoComplete(cityList);

					} else if (configuration.isCityBranchLrSequenceCounter) {

					    $('#cityDiv').show();
					    $('#branchDiv').show();
					    $('#billSelectionDiv').hide();
					    $('#billSelectionDivHide').hide();
					    $('#sourceBranchSelection').hide();
					    $('#destinationRegionSelection').hide();

					} else if (sourceCitySourceBranchDestinationCityDestinationBranchSequence) {

					    $('#cityDiv').show();
					    $('#destinationRegionSelection').hide();
					    $('#destSubRegionDiv').hide();
					    $('#branchDiv').show();

					    setCityAutoComplete(cityList);
					    setDestCityAutoComplete(cityList);

					    populateBranchSelectionBySubRegionId();

					    renderSrcBranchField();
					    renderDestBranchField();

					    if (configuration.isBillSelectionShow) {
					        $('#billSelectionDiv').show();
					    } else {
					        $('#billSelectionDiv').hide();
					    }

					} else if (sdBranchWiseSeq) {

					    $('#branchDiv').show();
					    $('#sourceBranchHide').show();
					    $('#billSelectionDivHide').hide();
					    $('#destinationBranchHide').hide();
					    $('#billSelectionDiv').hide();
					    $('#cityDiv').hide();

					} else {

					    $('#cityDiv').hide();
					    $('#branchDiv').hide();
					}


					if (!configuration.showManualLRSequenceCounter) {
						$('#bottom-border-style').hide();
					}
					
					if (!cityWiseSeq && !sourceCitySourceBranchDestinationCityDestinationBranchSequence) {
						setBranchAutoComplete();
						setRegions(data.regions);
						setBillSelection();
						setManualBillSelection();
						setDestBranchAutoComplete();
					}
								
					if (configuration.isCityBranchLrSequenceCounter && !cityWiseSeq)
						setCityAutoComplete(cityList);
					
					hideLayer();
				}
			});	
}

function setCityAutoComplete(cityList) {
    console.log("setCityAutoComplete called");
    createOption('cityName', 0, '-- Select City --');
    
    if(cityList && !jQuery.isEmptyObject(cityList)) {
        $.each(cityList, function(key, city) {
            if(city && city.cityId && city.cityName) {
                createOption('cityName', city.cityId, city.cityName);
            }
        });
    }
}	

function setDestCityAutoComplete(cityList) {
    console.log("setDestCityAutoComplete called");
    createOption('destCityName', 0, '-- Select City --');
    
    if(cityList && !jQuery.isEmptyObject(cityList)) {
        $.each(cityList, function(key, city) {
            if(city && city.cityId && city.cityName) {
                createOption('destCityName', city.cityId, city.cityName);
            }
        });
    }
}

function setBranchAutoComplete() {
	$('#scrBranch').prop("autocomplete","off");
	$("#scrBranch").autocomplete({
		source: "Ajax.do?pageId=9&eventId=13&filter=14&typeOfLocaion="+1,
		minLength: 2,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			if(ui.item.id != 0) {
				var destData = (ui.item.id);
				var res = destData.substring(0,destData.indexOf("_"));
				document.getElementById("srcBranchId").value = res;
			}
		}
	});
}

function setDestBranchAutoComplete() {
	$('#destBranch').prop("autocomplete","off");
	$("#destBranch").autocomplete({
		source: "Ajax.do?pageId=9&eventId=13&filter=14&typeOfLocaion="+1,
		minLength: 2,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			if(ui.item.id != 0) {
				var destData = (ui.item.id);
				var res = destData.substring(0,destData.indexOf("_"));
				document.getElementById("destBranchId").value = res;
			}
		},

	});
}


function populateBranchSelectionBySubRegionId(){
	let jsonObject			= new Object();
	showLayer();
	$.ajax({
		type		: "POST",
		url			: WEB_SERVICE_URL+'/selectOptionsWS/getAllPhysicalBranchOptionByAccountGroupId.do',
		data		: jsonObject,
		dataType	: 'json',
		success: function(data) {
			   if(data.message != undefined){
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
			} 
			setdestBranch(data.sourceBranch);
			hideLayer();
		}
	});
}

function onSrcCityChange() {
	const cityId = $('#cityName').val();
	loadBranches(cityId, 'scrBranch');
}

function onCityChange() {
	const cityId = $('#destCityName').val();
	loadBranches(cityId, 'destBranch');
}

function loadBranches(cityId, eleId) {
    createOption(eleId, 0, '-- Select Branch --');
    
    if (!cityId) return;
    
    $.get("Ajax.do", {
        pageId: 9,
        eventId: 13,
        filter: 45,
        cityId: cityId
    }).done(function(branches) {
        $('#' + eleId).empty();
        createOption(eleId, 0, '-- Select Branch --');
        
		if (branches && branches.length) {
            $.each(branches, function(_, branch) {
                if (branch && branch.id && branch.label) {
                    createOption(eleId, branch.id, branch.label);
                }
            });
        }
    });
}

function getFilterWiseLrSeqCounter() {
	if(!validateSequenceCounter()) {
		return false;
	}
	
	if (configuration.isCityBranchLrSequenceCounter) {
		$("#srcbranchtfoot").remove();
		$("#destregiontffot").remove();
		$("#destsubregipontfoot").remove();
		$("#billtypetfoot").remove();
	} else {
		$("#srccitytfoot").remove();
		$('#destbranchtfoot').remove();
	}
	
	if(configuration.isCityBranchLrSequenceCounter)
		createJsPanel("Lr Sequence Counter");

	showLayer();
	
	if(table != null) {
		table.destroy();
		//$("#allLrSeqCounterjspanel #allLrSeqCounterTableTFoot").load( "/ivcargo/jsp/masters/sdWiseLrSeqCounter/footer.jsp");
	}
	
	$('#allLrSeqCounterjspanel #allLrSeqCounterTable').children('thead').empty();
	$('#allLrSeqCounterjspanel #allLrSeqCounterTable').children('tbody').empty();

	var jsonObject   			= new Object();
	jsonObject.filter			= 7;
	
	if(isCityBranchLrSequenceCounter || sourceCitySourceBranchDestinationCityDestinationBranchSequence)
		jsonObject.sourceCityId		= $('#cityName').val();
	
	jsonObject.srcRegion		= $('#allLrSeqCounterjspanel #srcRegion').val();
	jsonObject.srcSubRegion		= $('#allLrSeqCounterjspanel #srcSubRegion').val();
	jsonObject.srcBranch		= $('#allLrSeqCounterjspanel #srcBranch').val();

	var jsonStr = JSON.stringify(jsonObject);
	$.getJSON("SDWiseSeqCounterAjaxAction.do?pageId=227&eventId=3",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('info', lrSequnceCounterNotFoundInfoMsg);
					hideLayer();
				} else {
					if (data.Success && data.sourceDestinationWiseSequenceCounter) {
						createRatesEditData(data.sourceDestinationWiseSequenceCounter);
					} else {
						$('#allLrSeqCounterjspanel #allLrSeqCounterTable').switchClass('show', 'hide');
						showMessage('info', lrSequnceCounterNotFoundInfoMsg);
						hideLayer();
						return;
					}
					
					hideLayer();
					
					
					$('#allLrSeqCounterjspanel #allLrSeqCounterTable').switchClass('show', 'hide');
					//$('#allLrSeqCounterjspanel #allLrSeqCounterTable').switchClass('show', 'hide');
				setDataTableToJsPanel();
}
			});

}

function createRatesEditData(sdWiseSeqCounter) {
	emptyChildInnerValue('allLrSeqCounterTable','tbody');
	emptyChildInnerValue('allLrSeqCounterTable','thead');
	
	var tabHeader		= createRowInTable('HeaderTable', '', '');

	var blanckCell0		= createColumnInRow(tabHeader, 'td_', '', '', 'left', '', '');

	if (configuration.isCityBranchLrSequenceCounter) {
		var blanckCell1		= createColumnInRow(tabHeader, 'td_', '', '', 'left', '', '');
		var blanckCell2		= createColumnInRow(tabHeader, 'td_', '', '', 'left', '', '');
	}else{
		var blanckCell1		= createColumnInRow(tabHeader, 'td_', '', '', 'left', '', '');
		var blanckCell2		= createColumnInRow(tabHeader, 'td_', '', '', 'left', '', '');
		var blanckCell3		= createColumnInRow(tabHeader, 'td_', '', '', 'left', '', '');
		var blanckCell4		= createColumnInRow(tabHeader, 'td_', '', '', 'left', '', '');
	}
	var blanckCell5		= createColumnInRow(tabHeader, 'td_', '', '', 'right', '', '');
	var blanckCell6		= createColumnInRow(tabHeader, 'td_', '', '', 'right', '', '');
	var blanckCell7		= createColumnInRow(tabHeader, 'td_', '', '', 'right', '', '');
	var blanckCell8		= createColumnInRow(tabHeader, 'td_', '', '', 'right', '', '');

	appendValueInTableCol(blanckCell0, 'Sr.NO');
	
	if (configuration.isCityBranchLrSequenceCounter) {
		appendValueInTableCol(blanckCell1, 'Src City');
		appendValueInTableCol(blanckCell2, 'Des Branch');
	}else{
		appendValueInTableCol(blanckCell1, 'Src Branch');
		appendValueInTableCol(blanckCell2, 'Dest Region');
		appendValueInTableCol(blanckCell3, 'Dest SubRegion');
		appendValueInTableCol(blanckCell4, 'Bill Type');
	}
	appendValueInTableCol(blanckCell5, 'Min Range');
	appendValueInTableCol(blanckCell6, 'Max Range');
	appendValueInTableCol(blanckCell7, 'Next Val');
	appendValueInTableCol(blanckCell8, '');

	$('#jsPanelDataContent #allLrSeqCounterTable #allLrSeqCounterTableTHead').append(tabHeader);

	for (var i = 0; i < sdWiseSeqCounter.length; i++) {
		var nextVal ;
		var sdWiseSeqCount	= sdWiseSeqCounter[i];
		if (configuration.isCityBranchLrSequenceCounter) {
			nextVal = (sdWiseSeqCount.nextVal+1);
		}else{
			nextVal = sdWiseSeqCount.nextVal;
		}
		k = i+1;

		var row 								= createRowInTable('tr_'+k, '', '');
		var Srno								= createColumnInRow(row ,'td_' + k, '', '', 'left', '', ''); 
		
		if (configuration.isCityBranchLrSequenceCounter) {
			var SrcCity								= createColumnInRow(row ,'td_' + sdWiseSeqCount.srcCityName, '', '', 'left', '', '');
			var DestBranch							= createColumnInRow(row ,'td_' + sdWiseSeqCount.destBranchName, '', '', 'left', '', '');
		}else{
			var SrcBranch							= createColumnInRow(row ,'td_' + sdWiseSeqCount.srcBranchName, '', '', 'left', '', '');
			var DestRegion							= createColumnInRow(row ,'td_' + sdWiseSeqCount.destRegionName, '', '', 'left', '', '');
			var DestSubRegion						= createColumnInRow(row ,'td_' + sdWiseSeqCount.destSubRegionName, '', '', 'left', '', '');
			var BillType							= createColumnInRow(row ,'td_' + sdWiseSeqCount.billSelectionName, '', '', 'left', '', '');
		}
		
		var MinRange							= createColumnInRow(row ,'td_' + sdWiseSeqCount.minRange, '', '', 'right', '', '');
		var MaxRange							= createColumnInRow(row ,'td_' + sdWiseSeqCount.maxRange, '', '', 'right', '', '');
		var NextVal								= createColumnInRow(row ,'td_' + nextVal, '', '', 'right', '', '');
		var edit								= createColumnInRow(row ,'rate' , '', '', 'right', '', '');

		appendValueInTableCol(Srno, k);

		if (configuration.isCityBranchLrSequenceCounter) {
			appendValueInTableCol(SrcCity, sdWiseSeqCount.srcCityName);
			appendValueInTableCol(DestBranch, sdWiseSeqCount.destBranchName);
		}else{
			appendValueInTableCol(SrcBranch, sdWiseSeqCount.srcBranchName);
			appendValueInTableCol(DestRegion, sdWiseSeqCount.destRegionName);
			appendValueInTableCol(DestSubRegion, sdWiseSeqCount.destSubRegionName);
			appendValueInTableCol(BillType, sdWiseSeqCount.billSelectionName);
		}

		var inputAttr1		= new Object();
		var input			= null;

		inputAttr1.id			= 'counterId'+k;
		inputAttr1.type			= 'hidden';
		inputAttr1.value		= sdWiseSeqCount.sourceDestinationWiseSequenceCounterId;
		inputAttr1.name			= 'counterId'+k;
		inputAttr1.style		= 'width: 50px;text-align: right;';
		inputAttr1.disabled		= 'true';

		input	= createInput(MinRange,inputAttr1);
		input.attr( {
			'data-value' : k
		});

		var inputAttr2		= new Object();
		var input			= null;

		inputAttr2.id			= 'minVal'+k;
		inputAttr2.class		= 'form-control';
		inputAttr2.type			= 'text';
		inputAttr2.value		= sdWiseSeqCount.minRange;
		inputAttr2.name			= 'minVal'+k;
		inputAttr2.style		= 'width: 100px;text-align: right;';
		inputAttr2.onblur		= 'clearIfNotNumeric(this,0);';
		inputAttr2.onkeypress	= 'return noNumbers(event);';
		inputAttr2.disabled		= 'true';

		input	= createInput(MinRange,inputAttr2);
		input.attr( {
			'data-value' : k
		});
		var inputAttr3		= new Object();
		var input			= null;

		inputAttr3.id			= 'maxVal'+k;
		inputAttr3.class		= 'form-control';
		inputAttr3.type			= 'text';
		inputAttr3.value		= sdWiseSeqCount.maxRange;
		inputAttr3.name			= 'maxVal'+k;
		inputAttr3.style		= 'width: 100px;text-align: right;';
		inputAttr3.onblur		= 'clearIfNotNumeric(this,0);';
		inputAttr3.onkeypress	= 'return noNumbers(event);';
		inputAttr3.disabled		= 'true';

		input	= createInput(MaxRange,inputAttr3);
		input.attr( {
			'data-value' : k
		});
		var inputAttr4		= new Object();
		var input			= null;

		inputAttr4.id			= 'nextVal'+k;
		inputAttr4.class		= 'form-control';
		inputAttr4.type			= 'text';
		inputAttr4.value		= nextVal;
		inputAttr4.name			= 'nextVal'+k;
		inputAttr4.style		= 'width: 100px;text-align: right;';
		inputAttr4.onblur		= 'clearIfNotNumeric(this,0);';
		inputAttr4.onkeypress	= 'return noNumbers(event);';
		inputAttr4.disabled		= 'true';

		input	= createInput(NextVal,inputAttr4);
		input.attr( {
			'data-value' : k
		});

		var inputAttr5		= new Object();
		var input			= null;

		inputAttr5.id			= 'hideNextVal'+k;
		inputAttr5.type			= 'hidden';
		inputAttr5.value		= nextVal;
		inputAttr5.name			= 'hideNextVal'+k;
		inputAttr5.style		= 'width: 50px;text-align: right;';
		inputAttr5.disabled		= 'true';

		input	= createInput(NextVal,inputAttr5);
		input.attr( {
			'data-value' : k
		});

		var inputAttr6		= new Object();
		var input			= null;

		inputAttr6.id			= 'hideMinRange'+k;
		inputAttr6.type			= 'hidden';
		inputAttr6.value		= sdWiseSeqCount.minRange;
		inputAttr6.name			= 'hideMinRange'+k;
		inputAttr6.style		= 'width: 50px;text-align: right;';
		inputAttr6.disabled		= 'true';

		input	= createInput(MinRange,inputAttr6);
		input.attr( {
			'data-value' : k
		});

		var inputAttr7		= new Object();
		var input			= null;

		inputAttr7.id			= 'hideMaxRange'+k;
		inputAttr7.type			= 'hidden';
		inputAttr7.value		= sdWiseSeqCount.maxRange;
		inputAttr7.name			= 'hideMaxRange'+k;
		inputAttr7.style		= 'width: 50px;text-align: right;';
		inputAttr7.disabled		= 'true';

		input	= createInput(MaxRange,inputAttr7);
		input.attr( {
			'data-value' : k
		});

		var inputAttr8		= new Object();
		var input			= null;

		inputAttr8.id			= 'sourceBranchId'+k;
		inputAttr8.type			= 'hidden';
		inputAttr8.value		= sdWiseSeqCount.sourceBranchId;
		inputAttr8.name			= 'sourceBranchId'+k;
		inputAttr8.style		= 'width: 50px;text-align: right;';
		inputAttr8.disabled		= 'true';

		input	= createInput(MinRange,inputAttr8);
		input.attr( {
			'data-value' : k
		});

		var inputAttr9		= new Object();
		var input			= null;

		inputAttr9.id			= 'destinationRegionId'+k;
		inputAttr9.type			= 'hidden';
		inputAttr9.value		= sdWiseSeqCount.destinationRegionId;
		inputAttr9.name			= 'destinationRegionId'+k;
		inputAttr9.style		= 'width: 50px;text-align: right;';
		inputAttr9.disabled		= 'true';

		input	= createInput(MinRange,inputAttr9);
		input.attr( {
			'data-value' : k
		});

		var buttonEditJS		= new Object();
		var buttonEdit			= null;

		buttonEditJS.id			= 'edit'+k;
		buttonEditJS.name		= 'edit'+k;
		buttonEditJS.value		= 'Edit';
		buttonEditJS.html		= 'Edit';
		buttonEditJS.class		= 'btn btn-info';
		buttonEditJS.onclick	= 'editRate(this);';
		buttonEditJS.style		= 'width: 50px;';

		buttonEdit			= createButton(edit, buttonEditJS);
		buttonEdit.attr({
			'data-value' : k
		});

		var buttonSaveJS		= new Object();
		var buttonSave			= null;

		buttonSaveJS.id			= 'save'+k;
		buttonSaveJS.name		= 'save'+k;
		buttonSaveJS.value		= 'Save';
		buttonSaveJS.html		= 'Save';
		buttonSaveJS.class		= 'btn btn-primary';
		buttonSaveJS.onclick	= 'updateNextVal(this);';
		buttonSaveJS.style		= 'width: 50px; display: none;';

		buttonSave			= createButton(edit, buttonSaveJS);
		buttonSave.attr({
			'data-value' : k
		});		

		$('#jsPanelDataContent #allLrSeqCounterTable').append(row);
	}
}

function editRate(obj) {
	var rmId	= obj.getAttribute('data-value');
	$('#allLrSeqCounterjspanel #minVal'+rmId).removeAttr('disabled');
	$('#allLrSeqCounterjspanel #maxVal'+rmId).removeAttr('disabled');
	$('#allLrSeqCounterjspanel #nextVal'+rmId).removeAttr('disabled');
	$('#allLrSeqCounterjspanel #save'+rmId).show();
	$(obj).hide();
}

function updateNextVal(obj) {

	var rmId			= obj.getAttribute('data-value');
	if(!InputValidationOnJSPanel(rmId)){
		return false;
	}

	showLayer();
	var jsonObject					= new Object();
	jsonObject.filter				= 8;

	jsonObject.counterId 			= $('#allLrSeqCounterjspanel #counterId'+rmId).val();
	jsonObject.sourceBranchId 		= $('#allLrSeqCounterjspanel #sourceBranchId'+rmId).val();
	jsonObject.destinationRegionId 	= $('#allLrSeqCounterjspanel #destinationRegionId'+rmId).val();
	jsonObject.minVal 				= $('#allLrSeqCounterjspanel #minVal'+rmId).val();
	jsonObject.maxVal 				= $('#allLrSeqCounterjspanel #maxVal'+rmId).val();
	jsonObject.nextVal 				= $('#allLrSeqCounterjspanel #nextVal'+rmId).val();
	jsonObject.hideMinRange			= $('#allLrSeqCounterjspanel #hideMinRange'+rmId).val();
	jsonObject.hideMaxRange			= $('#allLrSeqCounterjspanel #hideMaxRange'+rmId).val();
	jsonObject.hideNextVal			= $('#allLrSeqCounterjspanel #hideNextVal'+rmId).val();

	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("SDWiseSeqCounterAjaxAction.do?pageId=227&eventId=3",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('info', lrSequnceCounterNotFoundInfoMsg);
					hideLayer();
				} else {
					if(data.duplicate == true){
						showDetailedMessage('info', data);
					}else if(data.nextValSuccess != undefined){
						showMessage('success', updateNextValueSuccessMsg);
					} else {
						showMessage('success', updateSeqCounterSuccessMsg);
					}
					hideLayer();
				}
			});
}

function showDetailedMessage(type, data) {
	var height = 33;
	$('.' + type).addClass("showElemnt");
	$('.' + type).removeClass("hideElemnt");
	var srcDestWiseSeqCounterArr = data.srcDestWiseSeqCounterArr;
	$('.' + type).empty();
	$('.' + type).append('<p>Sequence Already Exists For :<span style="float : right;font-size: 20px;"><span onclick="hideAllMessages()" ><span class="glyphicon glyphicon-remove-sign"></span> Close</span></span></p>');
	for (var i = 0; i < srcDestWiseSeqCounterArr.length; i++) {
		height	= height + 33;
		$('.' + type).append("<p>Source Branch : " + srcDestWiseSeqCounterArr[i].srcBranchName+ " To : "+srcDestWiseSeqCounterArr[i].destRegionName +" Destination Region"+" ( Min - "+srcDestWiseSeqCounterArr[i].minRange+" And Max -"+srcDestWiseSeqCounterArr[i].maxRange+" )</p>")	
	}
	$('.' + type).animate({
		top : "0",
		height : height
	}, 400);
}

function InputValidationOnJSPanel(rmId) {

	minVal				= $('#allLrSeqCounterjspanel #minVal'+rmId).val();
	maxVal				= $('#allLrSeqCounterjspanel #maxVal'+rmId).val();
	nextVal				= $('#allLrSeqCounterjspanel #nextVal'+rmId).val();

	if(minVal = '' || Number(minVal) == 0 || Number(minVal) < 0){
		showMessage('info', minRangeGTZeroErrMsg);
		return false;
	} else if(maxVal = '' || maxVal == 0 || maxVal < 0) {
		showMessage('info', maxRangeGTZeroErrMsg);
		return false;
	} else if(Number($('#allLrSeqCounterjspanel #maxVal'+rmId).val()) <= Number($('#allLrSeqCounterjspanel #minVal'+rmId).val())) {
		showMessage('info', maxRangeGTMinRangeErrMsg);
		return false;
	} else if(nextVal == '' || Number(nextVal) == 0 || Number(nextVal) < 0) {
		showMessage('info', nextValGTZeroErrMsg);
		return false;
	} else if(Number($('#allLrSeqCounterjspanel #nextVal'+rmId).val()) >= Number($('#allLrSeqCounterjspanel #maxVal'+rmId).val()) || Number($('#allLrSeqCounterjspanel #nextVal'+rmId).val()) < Number($('#allLrSeqCounterjspanel #minVal'+rmId).val())) {
		showMessage('info', nextValueGTMinRangeAndLTMaxRangeInfoMsg);
		return false;
	} 

	return true;
}

function createJsPanel(title) {
	var jspanelContent	= $('#jsPanelMainContent').html();

	jspanelforratesEdit = $.jsPanel({
		id: 'allLrSeqCounterjspanel',
		content:  jspanelContent,
		size:     {width: 800, height: 350},
		title:    title,
		position: "center",
		theme:    "primary",
		overflow: 'scroll',
		panelstatus: "maximized",
		paneltype: {
			type: 'modal',
			mode: 'extended'
		},
		controls: {
			maximize: true,
			minimize: true,
			normalize: true,
			smallify: true,
		}
	});
}

function setDataTableToJsPanel() {
	var tableId	= '#allLrSeqCounterjspanel #allLrSeqCounterTable';
	// get DataTable Instance
	if(!($.fn.dataTable.isDataTable(tableId))) {
		table = $(tableId).DataTable( {

			"bPaginate": 	  false,
			"bInfo":     	  false,
			"bautoWidth":     false,
			"sDom": '<"top"l>rt<"bottom"ip><"clear">',
			"fnDrawCallback": function ( oSettings ) {

				//Need to redo the counters if filtered or sorted 
				if ( oSettings.bSorted || oSettings.bFiltered ) {
					for ( var i=0, iLen=oSettings.aiDisplay.length ; i<iLen ; i++ ) {
						$('td:eq(0)', oSettings.aoData[ oSettings.aiDisplay[i] ].nTr ).html( i+1 );
					}
				}
			},
			"aoColumnDefs": [ { "bSortable": false, "aTargets": [ 0 ] } ],
			"aaSorting": [[ 1, 'asc' ]]
		});;
	} 
	table.columns().eq( 0 ).each( function ( colIdx ) {
		// Apply the search
		applySearchonDatatable(table, colIdx, '#popup button', 'keyup click', '#popup', true);
		// Set Serach Items
		createCheckBoxForMultiSearchFilter(table, '#allLrSeqCounterjspanel #allLrSeqCounterTable #allLrSeqCounterTableTBody td:nth-child('+(colIdx + 1)+')', 
				colIdx, '#filterContentTable');
	});

	setFilterOnTop('#allLrSeqCounterjspanel #allLrSeqCounterTable #allLrSeqCounterTableTFoot .tfootClass', '#allLrSeqCounterjspanel #allLrSeqCounterTable #allLrSeqCounterTableTHead tr');
	setFilterOverlayPopupToggle('#allLrSeqCounterjspanel #toggle-popup');
}

function setFilter(obj) {
	var btnVal = $(obj).closest("#popup").find('#setData').val(); // closest function find closest tag of given id.
	if(obj.checked) {
		if(btnVal == "") {
			$(obj).closest("#popup").find('#setData').val(obj.value);
		} else {
			$(obj).closest("#popup").find('#setData').val(btnVal + '|' + obj.value);
		}
	} else {
		if (btnVal.match(/\|/g) == null) {
			btnVal	= "";
		} else {
			if (btnVal.substr(0, btnVal.indexOf('|')) == obj.value) {
				btnVal	= btnVal.replace(obj.value + '|', '');
			} else {
				btnVal	= btnVal.replace('|' + obj.value, '');
			}
		}
		$(obj).closest("#popup").find('#setData').val(btnVal);
	}
}

function setFilterOverlayPopupToggle(popurId) {
	$(popurId).click(function() {
		$(this).closest("th").find('#popup').toggle(); // closest function find closest tag of given id.
	});
}

function setFilterOnTop(dataId, headerId) {
	$(dataId).insertAfter(headerId);
}

function applySearchonDatatable(table, colIdx, searchId, searchFunction, toggalFilterId, toggelAllowed) {
	// Apply the search
	$( searchId, table.column( colIdx ).footer() ).on( searchFunction, function () {
		var valto	= this.value;
		table
		.column( colIdx )
		.search( valto, true, false, true)
		.draw();

		if (toggelAllowed) {
			$(this).closest(toggalFilterId).toggle(); // closest function find closest tag of given id.			
		}
	});
}

function createCheckBoxForMultiSearchFilter(table, tableColumnToIterate, colIdx, appendTableId) {
	var srcBranchArr	= new Array();
	$(tableColumnToIterate).each(function (index) {
		if (srcBranchArr.indexOf($(this).html()) == -1) {
			srcBranchArr.push($(this).html());
			var row		= createRow("tr_", '');
			var col1	= createColumn(row, "td_", '200px', 'left', '', '2');
			var inputAttr1			= new Object();
			inputAttr1.id			= 'filter'+$(this).html();
			inputAttr1.type			= 'checkbox';
			inputAttr1.value		= $(this).html();
			inputAttr1.name			= 'filterCB';
			inputAttr1.onclick		= 'setFilter(this);';

			input	= createInput(col1,inputAttr1);
			input.attr( {
				'data-columnIdx' : colIdx
			});
			$(col1).append("&emsp;" + $(this).html());
			$( appendTableId, table.column( colIdx ).footer() ).append(row);
		}
	});
}

function ValidateAndSearch() {
	srcBranchId 			= getValueFromInputField('srcBranchId');

	if(srcBranchId <= 0) {
		showMessage('error', validSourceBranchErrMsg);
		toogleElement('error','block');
		changeError1('scrBranch','0','0');
		resetValues();
		setValueToTextField('scrBranch', '');
	} else {
		callNextValue();
	}
}

function callNextValue() {
	showLayer();

	var jsonObject		= new Object();
	jsonObject.filter	= 2;

	srcBranchId 			= getValueFromInputField('srcBranchId');
	destRegionId			= getValueFromInputField('destRegion');
	destSubRegionId			= getValueFromInputField('destSubRegion');
	billSelectionId			= getValueFromInputField('billSelection');

	jsonObject.SrcBranchId 			= srcBranchId;
	jsonObject.DestRegionId 		= destRegionId;
	jsonObject.DestSubRegionId 		= destSubRegionId;
	jsonObject.BillSelectionId 		= billSelectionId;

	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("SDWiseSeqCounterAjaxAction.do?pageId=227&eventId=3",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', iconForErrMsg + ' ' + data.errorDescription);
				}

				bookingSequenceMin			= data.MinRange;
				bookingSequenceMax			= data.MaxRange;
				bookingSequenceNext 		= data.NextVal;

				if(bookingSequenceMin == 0) {
					showMessage('info', recordNotFoundInfoMsg);
				}

				setMinRange();
				setMaxRange();
				setNextValue();
			});
	hideLayer();
}

function addLRSeqenceCounter() {
	
	showLayer();

	var jsonObject		= new Object();
	jsonObject.filter	= 3;

	jsonObject.cityWiseSeq			= cityWiseSeq;
	jsonObject.sourceBranchId 			= getValueFromInputField('srcBranchId');
	jsonObject.destinationBranchId 		= getValueFromInputField('destBranchId');

	jsonObject.destinationRegionId		= getValueFromInputField('destRegion');
	jsonObject.destinationSubRegionId	= getValueFromInputField('destSubRegion');

	jsonObject.sourceCityId			= getValueFromInputField('cityName');
	jsonObject.destinationCityId	= getValueFromInputField('destCityId');
	
	jsonObject.billSelectionId 		= getValueFromInputField('billSelection');
	jsonObject.BookingSequenceMin 	= getValueFromInputField('bookingSequenceMin');
	jsonObject.BookingSequenceMax 	= getValueFromInputField('bookingSequenceMax');
	jsonObject.BookingSequenceNext 	= getValueFromInputField('bookingSequenceNext');

	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("SDWiseSeqCounterAjaxAction.do?pageId=227&eventId=3",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', iconForErrMsg + ' ' + data.errorDescription);
				}else {
					if (configuration.showMaxRangeOfSourceDestinationWiseLRSequence)
						fetchAndShowMaxWaybillRange(data);
					
					showMessage('success', sequenceCounterAddedSuccessMsg);
					resetValues();
				}
			});

	hideLayer();
}

function fetchAndShowMaxWaybillRange(data) {
	$('#maxRangeDiv').css('display', 'inline-block');
	$("#maxRangeValue").text(data.maxRange || 0);
}

function addManualLRSeqenceCounter() {

	showLayer();

	var jsonObject		= new Object();
	jsonObject.filter	= 6;

	jsonObject.SrcBranchId 			= getValueFromInputField('srcBranchId');
	jsonObject.BookingSequenceMin 	= getValueFromInputField('manualBookingSequenceMin');
	jsonObject.BookingSequenceMax 	= getValueFromInputField('manualBookingSequenceMax');
	jsonObject.BillSelectionId 		= billSelectionId;

	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("SDWiseSeqCounterAjaxAction.do?pageId=227&eventId=3",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', iconForErrMsg + ' ' + data.errorDescription);
				} else {
					if(data.duplicate == true) {
						showMessage('info', manualLRSequnceAlreadyExistInfoMsg);
					} else {
						showMessage('success', manualSequenceCounterAddedSuccessMsg);
						resetManualFields();
					}
				}
			});

	hideLayer();
}

function setRegions(regions) {
	for (var i = 0; i < regions.length; i++) {
		var reg = regions[i];
		createOptionInSelectTag('destRegion', reg.regionId, reg.regionId, reg.name)
		//createOption('destRegion', reg.regionId, reg.name);
	}
}

function populateSubRegions() {

	var jsonObject			= new Object();
	jsonObject.filter		= 1;
	jsonObject.regionId 	= getValueFromInputField('destRegion');

	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("SDWiseSeqCounterAjaxAction.do?pageId=314&eventId=1",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', iconForErrMsg + ' ' + data.errorDescription);
				}

				setSubRegions(data.subRegions);
			});
}


function setSubRegions(subRegions) {
	document.getElementById('destSubRegion').options.length=1;;
	document.getElementById('destSubRegion').options[0].text ='------ Sub Region  ----';
	document.getElementById('destSubRegion').options[0].value=0;

	for (var i = 0; i < subRegions.length; i++) {
		var reg = subRegions[i];

		createOptionInSelectTag('destSubRegion', reg.subRegionId, reg.subRegionId, reg.name);
	}
}

function setBillSelection() {
	for(const element of billSelectionList) {
		createOptionInSelectTag('billSelection', element.billSelectionId, element.billSelectionId, element.billSelectionName);
	}
}

function setManualBillSelection() {
	for(const element of billSelectionList) {
		createOptionInSelectTag('manualBillSelection', element.billSelectionId, element.billSelectionId, element.billSelectionName);
	}
}

function setMinRange() {
	setValueToTextField('bookingSequenceMin', bookingSequenceMin);
}

function setMaxRange() {
	setValueToTextField('bookingSequenceMax', bookingSequenceMax);
}

function setNextValue() {
	setValueToTextField('bookingSequenceNext', bookingSequenceNext);
	setValueToTextField('lrSequenceNextForUpdate', bookingSequenceNext);
}

function manualFormValidation() {
	if(!validateSrcBranch(1, 'scrBranch')) {
		return false;
	}

	if(!validatebManualSequenceMin(1, 'manualBookingSequenceMin')) {
		return false;
	}

	if(!validatebManualSequenceMax(1, 'manualBookingSequenceMax')) {
		return false;
	} else if(!validateManualMaxRangeByMinRange()) {
		return false;
	}

	if(!validateBillType(1, 'manualBillSelection')) {
		return false;
	}

	return true;
}
function formValidation(){
	var SubRegion = getValueFromInputField('DestinationSubRegionShow');

	if(!validateSrcBranch(1, 'scrBranch')) {
		return false;
	}

	if(!validateDestRegion(1, 'destRegion')) {
		return false;
	}
	if(SubRegion == 'true'){
		if(!validateDestSubRegion(1, 'destSubRegion')) {
			return false;
		}
	}

	if(!validateBillType(1, 'billSelection')) {
		return false;
	}
	if(!validateSequenceMin(1, 'bookingSequenceMin')) {
		return false;
	}

	if(!validateSequenceMax(1, 'bookingSequenceMax')) {
		return false;
	} else if(!validateMaxRangeByMinRange()) {
		return false;
	}

	return true;
} 

function formValidationCityWiseSeq() {
    let isValid = true;
    const fields = [
        'cityName',
        'destCityName',
        'destBranch',
        'bookingSequenceMin',
        'bookingSequenceMax'
    ];

    $.each(fields, function(index, id) {
        const $field = $('#' + id);
        if ($field.length && $field.is(':visible')) {
            let validationResult;
            switch (id) {
                case 'destBranch':
                    validationResult = validateInputTextFeild(1,id, id, 'error', destinationBranchErrMsg);
                    break;
                case 'bookingSequenceMin':
                    validationResult = validateInputTextFeild(1,id, id, 'error', minRangeGTZeroErrMsg);
                    break;
                case 'bookingSequenceMax':
                    validationResult = validateInputTextFeild(1,id, id, 'error', maxRangeGTZeroErrMsg);
                    break;
                case 'cityName':
                case 'destCityName':
                    validationResult = validateInputTextFeild(1, id, id, 'error', cityNameErrMsg);
                    break;
                default:
                    validationResult = true;
            }

            if (!validationResult) {
                isValid = false;
                return false; // Exit $.each loop on first error
            }
        }
    });

    const $min = $('#bookingSequenceMin'),
          $max = $('#bookingSequenceMax');

    if (
        isValid &&
        $min.length && $max.length &&
        $min.val().trim() && $max.val().trim() &&
        !validateMaxRangeByMinRange()
    ) {
        isValid = false;
    }

    return isValid;
}

function addSequence() {
	if ((cityWiseSeq && formValidationCityWiseSeq()) || (!cityWiseSeq && formValidation()) || sdBranchWiseSeq && formValidationSrcDestBranch()) {
		addLRSeqenceCounter();
	}
}

function addManualSequence() {
	if(manualFormValidation()){
		addManualLRSeqenceCounter();
	}
}

function validateMaxRangeByMinRange() {
	if(Number(getValueFromInputField('bookingSequenceMax')) <= Number(getValueFromInputField('bookingSequenceMin'))) {
		showMessage('error', maxRangeGTMinRangeErrMsg);
		toogleElement('error', 'block');
		changeError1('bookingSequenceMax','0','0');
		return false;
	}
	return true;
}

function validateManualMaxRangeByMinRange() {
	if(Number(getValueFromInputField('manualBookingSequenceMax')) <= Number(getValueFromInputField('manualBookingSequenceMin'))) {
		showMessage('error', maxRangeGTMinRangeErrMsg);
		toogleElement('error','block');
		changeError1('manualBookingSequenceMax', '0', '0');
		return false;
	}
	return true;
}

function resetValues() {
	setValueToTextField('scrBranch', '');
	setValueToTextField('srcBranchId', 0);
	setValueToTextField('destRegion', 0);
	setValueToTextField('destSubRegion', 0);
	setValueToTextField('billSelection', 0);
	setValueToTextField('bookingSequenceMin', 0);
	setValueToTextField('bookingSequenceMax', 0);
	setValueToTextField('bookingSequenceNext', 0);	
	setValueToTextField('destBranch', '');
}

function resetManualFields() {
	setValueToTextField('scrBranch', '');
	setValueToTextField('srcBranchId', 0);
	setValueToTextField('manualBookingSequenceMin', 0);
	setValueToTextField('manualBookingSequenceMax', 0);
	setValueToTextField('manualBillSelection', 0);
}
//------------------------------------------------------------------------------------------------
//Work For Show LR Sequence Counter Filter Wise
function openLRSequenceCounterPannel() {
	if (configuration.isCityBranchLrSequenceCounter) {
		getFilterWiseLrSeqCounter();
	} else {
		$('#branchSelection').removeClass('hide');
		createJsPanel("Lr Sequence Counter");
		loadLRSequenceCounterPannel();
		
	}
}

function loadLRSequenceCounterPannel() {
	showLayer();

	var jsonObject			= new Object();

	$.ajax({
		url: WEB_SERVICE_URL+'/selectOptionsWS/getRegionOption.do',
		type: "POST",
		dataType: 'json',
		data:jsonObject,
		success: function(data) {
			if(data.message != undefined){
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
			} 
			
			setSourceRegions(data.region);
			hideLayer();
		}
	});
}

function populateSourceSubRegions() {
	showLayer();

	var jsonObject			= new Object();

	jsonObject["regionSelectEle_primary_key"]		= $('#allLrSeqCounterjspanel #srcRegion').val();
	$.ajax({
		url: WEB_SERVICE_URL+'/selectOptionsWS/getSubRegionOption.do',
		type: "POST",
		dataType: 'json',
		data:jsonObject,
		success: function(data) {
			if(data.message != undefined){
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
			} 
			setSourceSubRegions(data.subRegion);
			hideLayer();
		}
	});
}
function populateSourceBranch() {
	showLayer();

	var jsonObject			= new Object();

	jsonObject["subRegionSelectEle_primary_key"]		= $('#allLrSeqCounterjspanel #srcSubRegion').val();
	$.ajax({
		url: WEB_SERVICE_URL+'/selectOptionsWS/getBranchOption.do',
		type: "POST",
		dataType: 'json',
		data:jsonObject,
		success: function(data) {
			if(data.message != undefined){
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
			} 
			if (data.sourceBranch != undefined && data.sourceBranch.length > 0) {
				setSourceBranch(data.sourceBranch);
			}
			hideLayer();
		}
	});
}

function setSourceRegions(regions) {

	createOptionInSelectTag('allLrSeqCounterjspanel #srcRegion', 0,0, '---- Select Region ----');
	for (var i = 0; i < regions.length; i++) {
		var reg = regions[i];
		createOptionInSelectTag('allLrSeqCounterjspanel #srcRegion', reg.regionId, reg.regionId, reg.regionName)
	}
	createOptionInSelectTag('allLrSeqCounterjspanel #srcRegion', -1,-1, 'ALL');
}


function setdestBranch(regions) {
	for (var i = 0; i < regions.length; i++) {
		var reg = regions[i];
		createOptionInSelectTag('branchDiv #destBranch', reg.branchId, reg.branchId, reg.branchName)
	}
}
function setSourceSubRegions(subRegions) {
	removeOption('allLrSeqCounterjspanel #srcSubRegion', null);
	removeOption('allLrSeqCounterjspanel #srcBranch', null);
	createOptionInSelectTag('allLrSeqCounterjspanel #srcSubRegion', 0,0, '---- Select Sub Region ----');
	createOptionInSelectTag('allLrSeqCounterjspanel #srcBranch', 0,0, '---- Select Branch ----');
	for (var i = 0; i < subRegions.length; i++) {
		var subreg = subRegions[i];
		createOptionInSelectTag('allLrSeqCounterjspanel #srcSubRegion', subreg.subRegionId, subreg.subRegionId, subreg.subRegionName)
	}
}
function setSourceBranch(sourceBranch) {

	removeOption('allLrSeqCounterjspanel #srcBranch', null);
	createOptionInSelectTag('allLrSeqCounterjspanel #srcBranch', 0,0, '---- Select Branch ----');
	for (var i = 0; i < sourceBranch.length; i++) {
		var srcBranch = sourceBranch[i];
		createOptionInSelectTag('allLrSeqCounterjspanel #srcBranch', srcBranch.branchId, srcBranch.branchId, srcBranch.branchName)
	}
}

function setDestBranch(sourceBranch) {
	removeOption('allLrSeqCounterjspanel #srcBranch', null);
	createOptionInSelectTag('allLrSeqCounterjspanel #srcBranch', 0,0, '---- Select Branch ----');
	for (var i = 0; i < sourceBranch.length; i++) {
		var srcBranch = sourceBranch[i];
		createOptionInSelectTag('allLrSeqCounterjspanel #srcBranch', srcBranch.branchId, srcBranch.branchId, srcBranch.branchName)
	}
}

function validateSequenceCounter() {
	if(configuration.isCityBranchLrSequenceCounter){
		if(!validateInput('cityName', 'cityName', 'Select City')){
			return false;
		}
	}else{
		if(!validateInput('allLrSeqCounterjspanel #srcRegion','allLrSeqCounterjspanel #srcRegion','Select Region')){
			return false;
		}
		if(!validateInput('allLrSeqCounterjspanel #srcSubRegion','allLrSeqCounterjspanel #srcSubRegion','Select Sub Region')){
			return false;
		}
		if(!validateInput('allLrSeqCounterjspanel #srcBranch','allLrSeqCounterjspanel #srcBranch','Select Branch')){
			return false;
		}
	}

	return true;
}

function validateInput(elementID, errorElementId, errorMsg) {

	if ($('#'+elementID).val() == '' || $('#'+elementID).val() == 0) {
		showMessage('error', errorMsg);
		$('#'+elementID).focus();
		isValidationError=true;

		return false;
	} else {
		hideAllMessages();
		removeError(errorElementId);
	}
	return true;
}

function setCityId(obj) {
	var cityId = obj.value;
	$('#srcCityId').val(Number(cityId));
}

function setDestCityId(obj) {
	var destCityId = obj.value;
	$('#destCityId').val(Number(destCityId));
}

function setSrcBranchId(obj) {
	$('#srcBranchId').val(Number(obj.value));
}

function setDestBranchId(obj) {
	$('#destBranchId').val(Number(obj.value));
}

function renderSrcBranchField() {
    const $branchDiv = $('#sourceBranchSelection');
    if (!$branchDiv.length) return;

    const dropdown = `
        <select id="scrBranch" name="scrBranch" 
                class="width-200px form-control" style="width: 200px;"
                onchange="setSrcBranchId(this)">
            <option value="0">-- Select Branch --</option>
        </select>
    `;

    // Replace the existing input#scrBranch with select#scrBranch
    $branchDiv.find('#scrBranch').replaceWith(dropdown);
}

function renderDestBranchField() {
    const $branchDiv = $('#branchDiv');
    if (!$branchDiv.length) return;

    const dropdown = `
        <select id="destBranch" name="destBranch" 
                class="width-200px form-control" style="width: 200px;"
                onchange="setDestBranchId(this)" onfocus="next='bookingSequenceMin'">
            <option value="0">-- Select Branch --</option>
        </select>
    `;

    // Replace the existing input#destBranch with select#destBranch
    $branchDiv.find('#destBranch').replaceWith(dropdown);
}
function formValidationSrcDestBranch() {
	if (!validateSrcBranch(1, 'scrBranch')) 
		return false;

	if (!validateDestBranch(1, 'destBranch')) 
		return false;
		
	if (!validateSequenceMin(1, 'bookingSequenceMin')) 
		return false;

	if (!validateSequenceMax(1, 'bookingSequenceMax')) 
		return false;
	 else if (!validateMaxRangeByMinRange()) 
		return false;

	return true;
} 
