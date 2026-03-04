/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
define([
	'slickGridWrapper3'
	,PROJECT_IVUIRESOURCES+'/resources/js/module/view/doorpickuploadingsheet/doorpickupdispatchdetails.js'
	,'errorshow'
	,'JsonUtility'
	,'messageUtility'
	,'elementmodel'
	,'elementTemplateJs'
	,'constant'
	], function (slickGridWrapper3, DoorPickupDispatchDetails) {
	'use strict';// this basically give strictness to this specific js
	let _this = '',
	columnHeaderJsonArr,
	selectedGridObject,
	viewObject,
	gridObejct,
	findAll = false,
	appendBtn= false,
	btModal,
	divisionId = 0;
	return Marionette.LayoutView.extend({
		initialize: function(jsonObjectData){

			//initialize is the first function called on call new view()
			//append template first 
			//the html would be set in the el element
			//this object is not found in other function so _this has been created
			_this 				= this;
			btModal				= jsonObjectData.btModal;
			divisionId			= jsonObjectData.divisionId;
		}, render: function() {
			showLayer();
			var jsonObject = new Object();
			jsonObject.divisionId = divisionId;
			getJSON(jsonObject, WEB_SERVICE_URL + '/doorPickupDispatchWS/getLRDetailsForDispatchByBranchId.do', _this.setData, EXECUTE_WITH_ERROR);
		}, setData : function(response) {
			hideAllMessages();
			
			if(response.message != undefined) {
				hideLayer();
				btModal.close();
				return;
			}
			
			if(response.CorporateAccount != undefined) {
				columnHeaderJsonArr 	= _.values(response.columnConfiguration);

				setTimeout(function() {
					slickGridWrapper3.applyGrid(
						{
							ColumnHead			:	columnHeaderJsonArr, // *compulsory // for table headers
							ColumnData			:	_.values(response.CorporateAccount), 	// *compulsory // for table's data
							Language			:	{}, 			// *compulsory for table's header row language
							DivId				:	'modalBody',				// *compulsary field // division id where slickgrid table has to be created
							InnerSlickId		:	'popupData',		//	*compulsary field // unique Key for id to be set in slickgrid table
							SerialNo			:[{					// optional field // for showing Row number
								showSerialNo	:	false,
								SearchFilter	:	false,          // for search filter on serial no
								ListFilter		:	false				// for list filter on serial no
							}],
							NoVerticalScrollBar			:	false, //optional for no vertical scrolling & if set true remove height attribute to Grid Div
							//FetchDataButtonId : '.ok',//Add button in modal pop-up
							ShowCheckBox 				: 	true,
							CallBackFunctionToFetchData : 	_this.getDataFromGrid,
							EditableColumn				: 	false,
							RemoveSelectAllCheckBox		:	false
						})
				}, 1000);
			}
			
			hideLayer();
			
			if(!findAll && !appendBtn){
				$( "#dispatchBtn" ).click(function() {
					_this.submitDataFromGrid();
				});
				findAll= true;
			}
			
			btModal.on('ok', function() {
				let selectedVal = slickGridWrapper3.getValueForSelectedData({InnerSlickId : 'popupData'});
				_this.getDataFromGrid(selectedVal);
			});
		}, lrNumberAppend : function(pendingDispatchobj) {
			columnHeaderJsonArr 		= pendingDispatchobj.ColumnHead;

			$('#singleLREle').focus();
		
			if(pendingDispatchobj.count == 1 && !appendBtn && !findAll) {
				$( "#dispatchBtn" ).click(function() {
					_this.submitDataFromGrid();
				});
				appendBtn = true;
			}

			return _this.getDataFromGrid(pendingDispatchobj.data);
		}, getDataFromGrid : function(dataObject) {
			if(dataObject.length > 0) {
				changeDisplayProperty('middle-border-boxshadow', 'block');
				changeDisplayProperty('bottom-border-boxshadow', 'block');

				_this.showDispatchButton();
				
				if(slickGridWrapper3.checkToAddRowInTable({InnerSlickId : 'doorPickupDispatchDiv'},dataObject,'wayBillId')){
					showMessage('error','LR already added.');
					return false;
				}
				
				if($('#divisionSelectionEle').exists() && $('#removeButton_0').val() != undefined && !slickGridWrapper3.checkToAddRowInTable({InnerSlickId : 'doorPickupDispatchDiv'}, dataObject, 'divisionId')) {
					showMessage('error', 'Please add LR with same Division.');
					return false;
				}

				slickGridWrapper3.applyGrid({
							ColumnHead						:	columnHeaderJsonArr, // *compulsory // for table headers
							ColumnData						:	dataObject, 	// *compulsory // for table's data
							Language						:	{}, 			// *compulsory for table's header row language
							DivId							:	'myGrid',				// *compulsary field // division id where slickgrid table has to be created
							InnerSlickId					:	'doorPickupDispatchDiv',
							SerialNo						:[{					// optional field // for showing Row number
								showSerialNo	:	false,
								SearchFilter	:	false,          // for search filter on serial no
								ListFilter		:	false				// for list filter on serial no
							}],
							NoVerticalScrollBar				:	false, //optional for no vertical scrolling & if set true remove height attribute to Grid Div
							FetchAllDataButtonId 			: 	'#dispatchBtn',
							ShowDeleteButton 				: 	true,
							DataVieObject					:	viewObject,
							DataGridObject					:	gridObejct,
							PersistGridToAppend				:	true,
						});
			}	
		}, showDispatchButton : function(){
			$( ".pendingDoorPickupContent").removeClass('hide');
			$( "#dispatchBtn").removeClass('hide');
		}, submitDataFromGrid : function() {
			selectedGridObject = slickGridWrapper3.getSlickGridInstance({InnerSlickId : 'doorPickupDispatchDiv'});
			
			if(selectedGridObject != undefined) {
				let object 		= new Object();
				let dataView 	= selectedGridObject.getData();
				let slickData 	= dataView.getItems();
				
				if(slickData.length <= 0) {
					showMessage('error', selectLrToDispatchErrMsg);
					return false;
				}

				object.slickData = dataView.getItems();

				let btModal = new Backbone.BootstrapModal({
					content		: 	new DoorPickupDispatchDetails(object),
					modalWidth 	: 	80,
					zindex		:  "1000",
					modalId		:	"pickupLs",
					title		:	'Dispatch Information',
					okText		:	'Dispatch',
					showFooter 	: 	true,
					okCloses	:	false,
					focusOk		:	false
				}).open();
			}
		}
	});
});


function partialQuantity(grid, dataView,row){

	let quantity 			= dataView.getItem(row).wayBillConsignmentQuantity;
	let actualWeight		= dataView.getItem(row).wayBillActualWeight;

	let contentTable2		= '<div><table class="table" id="consignemntQuantity"><thead class="thead-inverse"><tr><th><span data-selector="packingType">Total Articles</span></th><th><span data-selector="quantity">Pending Articles</span></th><th><span data-selector="dispatchQuantity">Dispatch Articles</span></th>'
		+ '</tr></thead><tbody><tr><td style="line-height: 2; font-size: larger;">'+quantity+'</td><td style="line-height: 2; font-size: larger;">'+quantity+'</td><td><div class="col-xs-10"><div class="col-xs-8 validation-message nod-success"><div class="left-inner-addon">'
		+ '<i class="glyphicon glyphicon-th"></i> <input class="form-control uneditable-input" id="elementId" value='+quantity+' name="dispatchQtyEle" type="number" placeholder="Dispatch Quantity" data-tooltip="Dispatch Quantity">'
		+ '</div><span style="display: none;" class="nod-success-message"></span></div></div></td></tr></tbody><tbody></tbody></table><table class="table"><tbody><tr><td style="line-height: 2; font-size: larger;"><b>Total Weight </b>	: '+actualWeight+'</td><td><div class="col-xs-9">'
		+ '<label class="col-xs-6"><span id="totalWeight" data-selector="totalWeight"><b>Dispatch Weight</b></span></label><div class="col-xs-6 validation-message"><div class="left-inner-addon"><i class="glyphicon glyphicon-th"></i> <input readOnly="" class="form-control" id="dispatchWeightEle" value='+actualWeight+' name="dispatchWeightEle"></div>'
		+ '<span style="display: none;"></span></div></div></td></tr></tbody></table></div>';

	let btModal = new Backbone.BootstrapModal({
		content		: 	contentTable2,
		modalWidth 	:	50,
		title:		'	LR NUMBER : <b>'+dataView.getItem(row).wayBillNumber+'</b>',
		okText		:	'Update',
		showFooter 	: 	true,
		focusOk 	: 	false,
		okCloses	:	false
	}).open();

	btModal.on('ok', function() {
		$("#modalDialog .close").click();

		dataView.getItem(row).wayBillConsignmentQuantity	= $('#elementId').val();
		dataView.getItem(row).wayBillActualWeight			= $("#dispatchWeightEle").val();
		dataView.getItem(row).partial						= true;
		dataView.endUpdate();
		dataView.refresh();

		updatePartialColor(grid);
		grid.invalidate();
		grid.render();
	});

	btModal.on('cancel', function() {
		//clearInterval(interval);
		hideLayer();
	});

	setTimeout(() => {
		let perQtyWeight  	= Number(actualWeight/quantity);
		$('#elementId').focus();
		$("#elementId").keyup(function() {
			let article 		= Number($('#elementId').val());
			let finalWeight   	= Number(article*perQtyWeight);
			$("#dispatchWeightEle").val(finalWeight);

			if(article > quantity){
				showMessage('info', 'Quantity cannot be greater than '+quantity+'.');
				$('#elementId').val(quantity)
				$("#dispatchWeightEle").val(actualWeight);
				return false;
			}
		});
	}, 1000);
}

function updatePartialColor(slickgrid) {
	require([PROJECT_IVUIRESOURCES + '/resources/js/slickgrid/slickgridwrapper3.js'], function(SlickGridWrapper) {
		SlickGridWrapper.updateRowColor(slickgrid, 'partial', true, 'highlight-row');
	});
}