define([], function(){	
	return {
		setCutomData : function(tableData, columnObjectForDetails, tbody) {
			var tableLength 	= 0;
			var extralrs		= 0;
			var mod 			= 0;
			
			if(tableData.length <= 11)
				tableLength = 6;
			else if(tableData.length > 11 && tableData.length <= 21){
				mod =  tableData.length % 23;
				extralrs = 35 - mod;
				tableLength =  tableData.length + extralrs + 10;
			} else {
				mod = tableData.length % 35;
				var div= tableData.length / 35;
			
				if(mod > 0)
					 extralrs = 35 - mod;
				
				if(div > 1)
					 tableLength = (tableData.length)+ (35- extralrs);
				else
					 tableLength = tableData.length+ extralrs+10;
			}

			for(var i = 0; i < tableLength; i++) {
				var page = tableLength;
				
				$("[data-bill='pageCount']").html(page);
				
				var newtr = $("<tr></tr>");
				
				for(var j = 0; j < columnObjectForDetails.length; j++) {
					var newtd = $("<td></td>");
					var dataPicker = $(columnObjectForDetails[j]).attr("data-dataTableDetail");
					
					if(i < tableData.length) {
						if( dataPicker == "lrBookingDateTimeStrFormatYY"){
							var datetetete = tableData[i].lrBookingDateTimeStr;
							var arr = datetetete.split("-");
							var finalDate = arr[0]+"-"+arr[1]+"-"+arr[2].substring(2, 4);
							$(newtd).html(finalDate);
						}
				
						if( dataPicker =="lrNumberWithDate"){
							var datetetete = tableData[i].lrBookingDateTimeStr;
							var arr = datetetete.split("-");
							var finalDate = arr[0]+"-"+arr[1]+"-"+arr[2].substring(2, 4);
							$(newtd).html( tableData[i].lrNumber +" /   "+finalDate);
						}
					
						$(newtd).attr("class",$(columnObjectForDetails[j]).attr("class"));
						$(newtd).attr("data-dataTableDetail",$(columnObjectForDetails[j]).attr("data-dataTableDetail"));
						
						$("*[data-dataTableDetail='saccode']").html('996511');
				
						$(newtd).html(tableData[i][dataPicker]);
					} else {
						if(j == 0)
							$(newtd).attr('class', 'srrsleft srrs');
						else
							$(newtd).attr('class', 'srrs');
						
						$(newtd).html();
					}
					
					$(newtr).append($(newtd));
					$(tbody).before(newtr);
				}
			}

			$("[data-row='dataTableDetails']").remove();
			$("[data-row='dataTableDetails2']").remove();	
		}
	}
});