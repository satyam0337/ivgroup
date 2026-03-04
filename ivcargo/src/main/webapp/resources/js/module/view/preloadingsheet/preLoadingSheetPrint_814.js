define(['elementTemplateJs'
	],function(elementTemplateJs){
	var rowsPerPage	=5000;
	var _this;
	var headerCollection,dispatchLSHeader,
	numberOfLr = 0,
	currentDateTime,destBrnachesNameCommaSep="";
	
	return ({
		renderElements : function(response){
			_this = this;
			var pendingSheet = response.pendingDispatchArraylist;
			var pendingDispatchmodelColl = response.pendingDispatchmodelColl
			headerCollection = response.PrintHeaderModel;
			dispatchLSHeader = response.dispatchLSHeader;
			currentDateTime = response.currentDateTime;
			destBrnachesNameCommaSep	= response.destBrnachesNameCommaSep;
			this.setDataForView(this.setSorted(pendingDispatchmodelColl), this.setSortedSources(pendingSheet),_this.separateDateTimeAndDay(currentDateTime));
		},setDataForView:function(pendingDispatchmodelColl ,finalJsonObj, separateDateTimeAndDay){
			
			
			require(['text!/ivcargo/template/preloading/preloadingsheet_814.html'],function(PreLoadingSheet){
				$("#myGrid").addClass('visible-print-block');
				var chunkArray = finalJsonObj.splitArray(rowsPerPage);
				var TotalCount = Object.keys(chunkArray).length;
				var TotalCount = Object.keys(chunkArray).length;
				
				for(var key in chunkArray){
					$("#myGrid").append(PreLoadingSheet);
					_this.renderTableValues(chunkArray[key],'.leftdivTableBody');
					$('.pageInfo').last().html("Page "+(parseInt(key)+parseInt(1))+" of "+TotalCount);
					$('.currentDate').html(separateDateTimeAndDay.date);
					$('.currentTime').html(separateDateTimeAndDay.time);
					$('.currentDay').html(separateDateTimeAndDay.day);
					

				}
				
				_this.setTableRowData(pendingDispatchmodelColl);
				hideLayer();	
				_this.showPrintOnPopup();
			})
			
		},setTableRowData:function(pendingDispatchmodelColl){
			hideLayer();
			let mainTable = $('#mainTableTd').empty();

			for (var j = 0; j < pendingDispatchmodelColl.length; j++) {
			    let group = pendingDispatchmodelColl[j];
			    
			    let meta = group[0];
			    let sortedData = group.slice(1).sort((a, b) => a.pendingQuantity - b.pendingQuantity); // Ascending
			    pendingDispatchmodelColl[j] = [meta, ...sortedData];
			    
			    let bl = pendingDispatchmodelColl[j]
			
			    let table = $('<table>').css({
			        'width': '100%',
			        'border-collapse': 'collapse',
			        'border': '1px solid black',
			        'margin-bottom': '5px'
			    });
			
			    let thead = $('<thead>');
			    if (bl.length > 0) {
			    let cityRow = $('<tr>').html(
			            `<th colspan="11" style="text-align: left; font-size:11px; font-weight:bold; border: 1px solid black;">${bl[0].destinationCityName}</th>`
			        );
			        thead.append(cityRow);
			    }
			    let headerRow = $('<tr>').html([
			        '<th style="width:5%; text-align: center;font-size:11px; border-right: 1px solid black; border-bottom: 1px solid black; border-top: 1px solid black;">Sr.</th>',
			        '<th style="width:10%; text-align: center;font-size:11px; border-right: 1px solid black; border-bottom: 1px solid black; border-top: 1px solid black;">GR NO.</th>',
			        '<th style="width:10%; text-align: center;font-size:11px; border-right: 1px solid black; border-bottom: 1px solid black; border-top: 1px solid black;">BKG. Date</th>',
			        '<th style="width:18%; text-align: center;font-size:11px; border-right: 1px solid black; border-bottom: 1px solid black; border-top: 1px solid black;">Consignor</th>',
			        '<th style="width:20%; text-align: center;font-size:11px; border-right: 1px solid black; border-bottom: 1px solid black; border-top: 1px solid black;">P Mark</th>',
			        '<th style="width:5%; text-align: center;font-size:11px; border-right: 1px solid black; border-bottom: 1px solid black; border-top: 1px solid black;">Pkgs</th>',
			        '<th style="width:9%; text-align: center;font-size:11px; border-right: 1px solid black; border-bottom: 1px solid black; border-top: 1px solid black;">Type</th>',
			        '<th style="width:9%; text-align: center;font-size:11px; border-right: 1px solid black; border-bottom: 1px solid black; border-top: 1px solid black;">Item</th>',
			        '<th style="width:5%; 	text-align: center;font-size:11px; border-right: 1px solid black; border-bottom: 1px solid black; border-top: 1px solid black;">Weight</th>',
			        '<th style="width:19%;text-align: center;font-size:11px; border-right: 1px solid black; border-bottom: 1px solid black; border-top: 1px solid black;"></th>',
			    ].join(''));
			    thead.append(headerRow);
			    table.append(thead);
			
			    let tbody = $('<tbody>');
				var totalActWt = 0;
				var totalQty =0;
				var index =0;
				
			    for (var i = 0; i < bl.length; i++) {
			        let el = bl[i];
			        if (el.wayBillNumber !== undefined) {
				        let saidToContainComma = el.saidToContainComma.replace(/[0-9-]+/g, '');
				        let weightQuintal = (el.consignmentSummaryActualWeight)/100;
				        
			            let dataRow = $('<tr>').html([
			                `<td style="font-size:11px; text-align: center; border-right: 1px solid black; border-bottom: 1px solid black;">${i}</td>`,
			                `<td style="font-size:11px; text-align: center; border-right: 1px solid black; border-bottom: 1px solid black;">${el.wayBillNumber}</td>`,
			                `<td style="font-size:11px; text-align: center; border-right: 1px solid black; border-bottom: 1px solid black;">${el.incomingDateTimeStampString}</td>`,
			                `<td style="font-size:11px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; border-right: 1px solid black; border-bottom: 1px solid black; max-width: 115px;">${el.consignorName}</td>`,
			                `<td style="font-size:16px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; border-right: 1px solid black; border-bottom: 1px solid black; max-width: 60px;font-weight: bold;">${el.consignmentSummaryPrivateMark}</td>`,
			                `<td style="font-size:11px; text-align: center; border-right: 1px solid black; border-bottom: 1px solid black;font-weight: bold;">${el.pendingQuantity}</td>`,
			                `<td style="font-size:11px; text-align: center; border-right: 1px solid black; border-bottom: 1px solid black;">${el.packingTypeMasterName}</td>`,
			                `<td style="font-size:11px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; border-right: 1px solid black; border-bottom: 1px solid black; max-width: 60px;">${saidToContainComma}</td>`,
			                `<td style="font-size:11px; text-align: center; border-right: 1px solid black; border-bottom: 1px solid black;">${weightQuintal}</td>`,
			                `<td style="font-size:11px; text-align: center; border-right: 1px solid black; border-bottom: 1px solid black;"></td>`,
			            ].join(''));
						
						totalActWt += weightQuintal;
						totalQty += el.pendingQuantity;
						index ++;
						
						
			            tbody.append(dataRow);
			        }
			    }
			
			    table.append(tbody);
			    let tfoot = $('<tfoot>');
				let footerRow = $('<tr>').html([
			        `<td style="font-size:11px; text-align: center; border-right: 1px solid black; border-bottom: 1px solid black;"></td>`,
			                `<td style="font-size:11px; text-align: center; border-right: 1px solid black; border-bottom: 1px solid black;font-weight: bold;">${index}</td>`,
			                `<td ></td>`,
			                `<td ></td>`,
			                `<td ></td>`,
			                `<td ></td>`,
			                `<td style="font-size:11px; text-align: center; border-right: 1px solid black;border-left: 1px solid black; border-bottom: 1px solid black;font-weight: bold;">${totalQty}</td>`,
			                `<td ></td>`,
			                `<td style="font-size:11px; text-align: center; border-right: 1px solid black; border-left: 1px solid black; border-bottom: 1px solid black;font-weight: bold;">${totalActWt.toFixed(2)}</td>`,
			                `<td style="font-size:11px; text-align: center; border-right: 1px solid black; border-bottom: 1px solid black;"></td>`,
			    ].join(''));
			    tfoot.append(footerRow);
			    table.append(tfoot);
			
			
			    mainTable.append(table);
			}
		    
		},renderTableValues:function(chunkArray,className){
			var htmlVariable = '';
			for(var chunk in chunkArray){
				$.each( $(className).last(), function(i, left) {
					$('div', left).each(function() {
						if(typeof $(this).attr('data-cell') != "undefined" ){
							if(chunkArray[chunk][$(this).attr('data-cell')] != undefined){
								htmlVariable += '<div class="'+$(this).attr('class')+'">'+chunkArray[chunk][$(this).attr('data-cell')]+'</div>'
							}else{
								if($(this).attr('data-fullrow')){
									htmlVariable += '<div class="'+$(this).attr('class')+'"></div>'
								}
							}
						}
					});
				})
			}
			$(className).last().html(htmlVariable);
		},showPrintOnPopup:function(){
			var width = 1000;
			var height = 600;
			var left = parseInt((screen.availWidth/2) - (width/2));
			var top = parseInt((screen.availHeight/2) - (height/2));
			childwin = window.open ('', 'newwindow', config='height='+height+',width='+width+',left='+left+ ',top='+top+', toolbar=no, menubar=no, scrollbars=no, resizable=no,location=no, directories=no, status=no');
			childwin.document.write('<html><head><title>Print it!</title></head><body>')
			childwin.document.write($("#myGrid").html());
			childwin.document.write('</body></html>');
			if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1){
				
				setTimeout(function(){
				childwin.print();
				childwin.close();
				doneTheStuff	= false;
				childwin.opener.setValue(doneTheStuff);
				},200)

			}else{
				setTimeout(function(){
					childwin.print();
					childwin.close();
					doneTheStuff	= false;
					childwin.opener.setValue(doneTheStuff);
				},200)
			}
		}, setSortedSources : function(pendingSheet) {
			for(var i = 0; pendingSheet.length > i; i++) {
				pendingSheet[i].pendingQuantity	= Number(i + 1);
			}
	
			return pendingSheet;
		},setSorted: function(pendingSheet) {
		    var finalJsonObj = [];
		
		    for (var key in pendingSheet) {
		        var cityArray = [{ destinationCityName: key }]; 
		
		        var list = pendingSheet[key];
		
		        list.forEach((item, index) => {
		            item.srNo = index + 1; 
		            cityArray.push(item); 
		        });
		
		        finalJsonObj.push(cityArray); 
		    }
		
		    return finalJsonObj;
		},separateDateTimeAndDay : function(currentDateTime) {
		    let [datePart, timePart, meridian] = currentDateTime.split(" ");
		    let [day, month, year] = datePart.split("-");
		    year = "20" + year; 
		
		    let date = `${year}-${month}-${day}`;
		
		    let time = `${timePart} ${meridian.toUpperCase()}`;
		
		    let dayOfWeek = new Date(`${year}-${month}-${day}`).toLocaleString('en-us', { weekday: 'long' });
		
		    return { date, time, day: dayOfWeek };
		}
	});
});



Object.defineProperty(Array.prototype, 'splitArray', {
	value: function(chunkSize) {
		var array=this;
		return [].concat.apply([],
				array.map(function(elem,i) {
					return i%chunkSize ? [] : [array.slice(i,i+chunkSize)];
				})
		);
	}
});