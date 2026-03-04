define(['elementTemplateJs'
	],function(elementTemplateJs){
	var rowsPerPage	= 1000;
	var _this;
	var headerCollection, currentDateTime, destBrnachesNameCommaSep = "";
	var destBranchCount;
	var destinationRegionName;
	return ({
		renderElements : function(response) {
			_this = this;
			var pendingSheet 			= response.pendingDispatchmodelColl;
			headerCollection 			= response.PrintHeaderModel;
			destBrnachesNameCommaSep	= response.destBrnachesNameCommaSep;
			currentDateTime 			= response.currentDateTime;
			destBranchCount 			= response.destBranchCount;
			destinationRegionName		= response.destinationSubRegionName;
			
			this.setDataForView(response.flavourType, this.setSortedSources(pendingSheet));
		}, setDataForView : function(flavourType, finalJsonObj) {
			require(['text!/ivcargo/template/preloading/' + flavourType + '.html'], function(PreLoadingSheet) {
				$("#myGrid").addClass('visible-print-block');
				var chunkArray = finalJsonObj.splitArray(rowsPerPage);
				var TotalCount = Object.keys(chunkArray).length;

				for(var key in chunkArray) {
					$("#myGrid").append(PreLoadingSheet);
					_this.renderTable(chunkArray[key]);
					$('.pageInfo').last().html("Page " + (parseInt(key) + parseInt(1)) + " of " + TotalCount);
					$('.currentDateTime').last().html(currentDateTime);
				
					count++;
				}
				
				$('.summaryinfo:not(:last)').each(function(){$(this).empty()});
				$('.summaryTable:not(:last)').each(function(){$(this).empty()});
				_this.setHeaderData(headerCollection, destBranchCount, destBrnachesNameCommaSep, destinationRegionName);
				hideLayer();	
				_this.showPrintOnPopup();
			})
			
		}, renderTable : function(chunkArray){
			var leftDataChunk = chunkArray.splitArray(Math.ceil(chunkArray.length / 1));

			for(var leftData in leftDataChunk) {
				if(leftData % 2 == 0)
					this.renderTableValues(leftDataChunk[leftData], '.leftdivTableBody');
				else
					this.renderTableValues(leftDataChunk[leftData], '.rightdivTableBody');
			}
		}, setHeaderData : function(headerCollection, destBranchCount, destBrnachesNameCommaSep, destinationRegionName){
			$("*[data-accountgroup='name']").html(headerCollection.accountGroupName);
			$("*[data-branch='name']").html(headerCollection.branchName);
			$("*[data-branch='address']").html(headerCollection.branchAddress);
			$("*[data-branch='phonenumber']").html(headerCollection.branchContactDetailPhoneNumber);
			$("*[data-heading='heading']").html('Pre Loading Sheet');
			$("*[data-branch='destinationBranch']").html(destBrnachesNameCommaSep);
			$("*[data-branch='destinationSubRegion']").html(destinationRegionName);
			
			if(destBranchCount == 1)
				$('.stationId').html(destBrnachesNameCommaSep);
			else
				$('.stationId').html("MULTIPLE CITIES");
		
			$(".preloadingSheetPage").each(function(i) {if(i!=0){$(this).addClass("page-break");}});
		}, renderTableValues : function(chunkArray, className) {
			var htmlVariable 		= '';
			var count 				= 0;
			var totalNoOfQuantity 	= 0;
			var totalFreight 		= 0;
			var totalCartage	 	= 0;
			var totalHamali 		= 0;
			var totalNetAmount 		= 0;
			
			for(var chunk in chunkArray) {
				$.each( $(className).last(), function(i, left) {
					$('div', left).each(function() {
						if(typeof $(this).attr('data-cell') != "undefined") {
							if(chunkArray[chunk][$(this).attr('data-cell')] != undefined)
								htmlVariable += '<div class="' + $(this).attr('class') + '">' + chunkArray[chunk][$(this).attr('data-cell')] + '</div>'
							else if($(this).attr('data-fullrow'))
								htmlVariable += '<div style="text-align: center;width: 100%;padding-left: 200px;margin-left: 100px;" class="' + $(this).attr('class') + '"></div>'
						}
					});
					
				var k = count + 1;
			
				var quantity 	= parseInt(chunkArray[count].quantity);
				var freight 	= parseInt(chunkArray[count].wayBillFreightCharge);
				var cartage 	= parseInt(chunkArray[count].wayBillCartageCharge);
				var hamali 		= parseInt(chunkArray[count].srsHamali);
				var netAmount 	= parseInt(chunkArray[count].bookingTotal);
				
				if(quantity > 0) {
					totalNoOfQuantity 	+= quantity;
					totalFreight		+= freight;
					totalCartage 		+= cartage;
					totalHamali			+= hamali;
					totalNetAmount 		+= netAmount;
				}
				
				if(count > 0 && count < chunkArray.length - 1) {
						if(chunkArray[k].wayBillId == undefined) {
							htmlVariable += '<table width="100%" style="border-top:solid 2px; border-bottom:solid 2px; margin-bottom:20px;"><tr><td width="58%">Total :</td><td width="7%">'+totalNoOfQuantity+'</td><td width="10%">'+totalFreight+'</td><td width="8%">'+totalCartage+'</td><td width="8%">'+totalHamali+'</td><td width="8%">'+totalNetAmount+'</td></tr></table>'
							totalNoOfQuantity	= 0;	
							totalFreight		= 0;
							totalCartage		= 0;
							totalHamali			= 0;
							totalNetAmount		= 0;
						}
					} else if(count == chunkArray.length - 1) {
						htmlVariable += '<table width="100%" style="border-top:solid 2px; border-bottom:solid 2px; margin-bottom:20px;"><tr><td width="58%">Total :</td><td width="7%">'+totalNoOfQuantity+'</td><td width="10%">'+totalFreight+'</td><td width="8%">'+totalCartage+'</td><td width="8%">'+totalHamali+'</td><td width="8%">'+totalNetAmount+'</td></tr></table>'
						totalNoOfQuantity	= 0;	
						totalFreight		= 0;
						totalCartage		= 0;
						totalHamali			= 0;
						totalNetAmount		= 0;
					}
				})
				
				count++;
			}

			$(className).last().html(htmlVariable);
		}, showPrintOnPopup : function() {
			var width = 1000;
			var height = 600;
			var left = parseInt((screen.availWidth / 2) - (width / 2));
			var top = parseInt((screen.availHeight / 2) - (height / 2));
			childwin = window.open ('', 'newwindow', config='height='+height+',width='+width+',left='+left+ ',top='+top+', toolbar=no, menubar=no, scrollbars=no, resizable=no,location=no, directories=no, status=no');
			childwin.document.write('<html><head><title>Print it!</title></head><body>')
			childwin.document.write($("#myGrid").html());
			childwin.document.write('</body></html>');
			
			if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1){
				childwin.print();
				childwin.close();
				doneTheStuff	= false;
				if(childwin.opener != null) childwin.opener.setValue(doneTheStuff);
			} else {
				setTimeout(function() {
					childwin.print();
					childwin.close();
					doneTheStuff	= false;
					if(childwin.opener != null) childwin.opener.setValue(doneTheStuff);
				}, 200)
			}
		}, setSortedSources : function(pendingSheet) {
			var finalJsonObj = new Array();
			
			for(var key in pendingSheet) {
				finalJsonObj.push({
					wayBillTypeHeader : key
				})
				
				var list	= pendingSheet[key];
				
				for(var i = 0; list.length > i; i++) {
					list[i].srNo	= Number(i + 1);
				}
				
				for(var destkey in list) {
					finalJsonObj.push(list[destkey]);
				}
			}
			
			return finalJsonObj;
		}
	});
});

Object.defineProperty(Array.prototype, 'splitArray', {
	value: function(chunkSize) {
		var array = this;
		
		return [].concat.apply([],
				array.map(function(elem,i) {
					return i % chunkSize ? [] : [array.slice(i, i + chunkSize)];
				})
		);
	}
});
