define(['elementTemplateJs'
], function(elementTemplateJs) {
	var rowsPerPage = 5000;
	var _this;
	var headerCollection, currentDateTime;

	return ({
		renderElements: function(response) {
			_this = this;
			var preUnloadingSheetList 		= response.preUnloadingSheetList;
						
			headerCollection = response.PrintHeaderModel;
			dispatchLSHeader = response.dispatchLSHeader;
			currentDateTime = response.currentDateTime;
			
			this.setDataForView(preUnloadingSheetList);
		}, setDataForView : function(finalJsonObj) {
			
			var fileref = document.createElement("link");
			fileref.rel = "stylesheet";
			fileref.type = "text/css";
			fileref.href = "/ivcargo/resources/css/module/dispatch/preunloadingsheet.css";
			document.getElementsByTagName("head")[0].appendChild(fileref)

			require(['text!/ivcargo/template/preunloading/preunloadingsheet_03.html'],function(PreLoadingSheet){
				var chunkArray = finalJsonObj.splitArray(rowsPerPage);
				
				var TotalCount = Object.keys(chunkArray).length;
				
				for(var key in chunkArray){
					$("#myGrid").append(PreLoadingSheet);
					_this.renderTableValues(chunkArray[key],'.leftdivTableBody');
					$('.pageInfo').last().html("Page "+(parseInt(key)+parseInt(1))+" of "+TotalCount);
					$('.currentDateTime').last().html(currentDateTime);
				}
				
				_this.setHeaderData(headerCollection, dispatchLSHeader);
				_this.setTableRowData(finalJsonObj);
				hideLayer();
			//	_this.showPrintOnPopup();
				window.print();
			})

		}, setTableRowData: function(tableData) {
			hideLayer();
			$('#leftTable').empty();
			$('#rightTable').empty();
			let totalRowsLeft = 50;
			let totalRowsRight = 50;
			let countLeft = 0;
			let countRight = 0;
			for (var i = 0; i < tableData.length; i++) {
				let el = tableData[i];
				let dataColumnArray = new Array();
				if (el.wayBillNumber != undefined) {
					dataColumnArray.push("<td style='text-align: center; border-right: 1px solid black; border-bottom: 1px solid black;height:25px;'>" + el.wayBillNumber + "</td>");
					dataColumnArray.push("<td style='text-align: center; border-right: 1px solid black; border-bottom: 1px solid black;height:25px'>" + el.packingTypeName + "</td>");
					dataColumnArray.push("<td style='text-align: center; border-right: 1px solid black; border-bottom: 1px solid black;height:25px'>" + el.consignmentSummaryQuantity + "</td>");

					if (i > 75) {
						countRight++;
						$("#rightTable").append('<tr>' + dataColumnArray.join(' ') + '</tr>');
					} else {
						countLeft++;
						$("#leftTable").append('<tr>' + dataColumnArray.join(' ') + '</tr>');
					}
				}
			}

			let remainingRowsRight = totalRowsRight - countRight;
			let remainingRowsLeft = totalRowsLeft - countLeft;
			if (countLeft > 70)
				remainingRowsLeft = 0

			if (countRight > 70)
				remainingRowsRight = 0

			for (var j = 0; j < remainingRowsRight; j++) {
				let blankRow = "<td style='border-right: 1px solid black; border-bottom: 1px solid black;height:25px;'>&nbsp;</td>" +
					"<td style='border-right: 1px solid black; border-bottom: 1px solid black;height:25px;'>&nbsp;</td>" +
					"<td style='border-right: 1px solid black; border-bottom: 1px solid black;height:25px;'>&nbsp;</td>";

				$("#rightTable").append('<tr>' + blankRow + '</tr>');

			}
			for (var j = 0; j < remainingRowsLeft; j++) {
				let blankRow = "<td style='border-right: 1px solid black; border-bottom: 1px solid black;height:25px;'>&nbsp;</td>" +
					"<td style='border-right: 1px solid black; border-bottom: 1px solid black;height:25px;'>&nbsp;</td>" +
					"<td style='border-right: 1px solid black; border-bottom: 1px solid black;height:25px;'>&nbsp;</td>";

				$("#leftTable").append('<tr>' + blankRow + '</tr>');

			}
		}, setHeaderData:function(headerCollection,){
			$("*[data-accountgroup='name']").html(headerCollection.accountGroupName);
			$("*[data-branch='name']").html(headerCollection.branchName);
			$("*[data-branch='address']").html(headerCollection.branchAddress);
			$("*[data-branch='phonenumber']").html(headerCollection.branchContactDetailPhoneNumber);
			$("*[data-heading='heading']").html('Pre UnLoading Sheet');
			$("*[data-current='datetime']").html(currentDateTime);
			$("*[data-lsVehicle='lsVehicle']").html(dispatchLSHeader.vehicleNumber);
			$(".preloadingSheetPage").each(function(i) {if(i!=0){$(this).addClass("page-break");}});

		},renderTableValues:function(chunkArray,className){
			var htmlVariable = '';
			for(var chunk in chunkArray){
				$.each( $(className).last(), function(i, left) {
					$('div', left).each(function() {
						
						if(chunkArray[chunk][$(this).attr('data-cell')] != undefined){
							htmlVariable += '<div class="'+$(this).attr('class')+'">'+chunkArray[chunk][$(this).attr('data-cell')]+'</div>'
                        }else{
                            htmlVariable += '<div class="'+$(this).attr('class')+'"></div>';
                        }
					});
				})
			}
			$(className).last().html(htmlVariable);
		}
	});
});



Object.defineProperty(Array.prototype, 'splitArray', {
	value: function(chunkSize) {
		var array = this;
		return [].concat.apply([],
			array.map(function(elem, i) {
				return i % chunkSize ? [] : [array.slice(i, i + chunkSize)];
			})
		);
	}
});