var _thisPopulate;

define(['JsonUtility'], 
	function(JsonUtility) {
	return {
		displayPhotoWithSlider : function(response) {
			_thisPopulate = this;
			
			let photoModelList		= response.photoModelList;
			
			$("<div>").attr("id", "myCarousel").attr("class", "carousel slide").attr("data-ride", "carousel").appendTo("#photoService");
			$("<ol>").attr("id", "list").attr("class", "carousel-indicators").appendTo("#myCarousel");
			
			for(let i = 0; i < photoModelList.length; i++) {
				if(i == 0) {
					$("<li>").attr("data-target", "#myCarousel").attr("data-slide-to", i).attr('class', 'active').appendTo("#list");
				} else {
					$("<li>").attr("data-target", "#myCarousel").attr("data-slide-to", i).appendTo("#list");
				}
			}
			
			$("<div>").attr("id", "carousel-inner").attr("class", "carousel-inner").appendTo("#myCarousel");
			
			for(let i = 0; i < photoModelList.length; i++) {
				let photoTransactionModel	= photoModelList[i];
				
				let photoTransactionPhoto	= photoTransactionModel.photoTransactionPhoto;
				let photoTransactionPhotopdf ='';
				
				if(photoTransactionPhoto != "" && photoTransactionPhoto != undefined) {
					$('#photoService').removeClass('hide');
					
					if(i == 0) {
						$("<div>").attr("id", "item_" + i).attr("class", "item active").appendTo("#carousel-inner");
					} else {
						$("<div>").attr("id", "item_" + i).attr("class", "item").appendTo("#carousel-inner");
					}
					
					if (photoTransactionModel.photoExtentionTypeId == 4) {
						photoTransactionPhotopdf = 'data:image/pdf;base64' + photoTransactionPhoto.split('base64')[1]
						$("<a>").attr("href", photoTransactionPhotopdf).attr("id", "imageLink" + i).attr("download", "image.pdf").appendTo("#item_" + i);
						$('<iframe id="img' + i + '">').attr('src', photoTransactionPhotopdf).attr('class', 'dl').attr('height', '400').attr('width', '400').appendTo('#imageLink' + i);
					} else {
						$("<a>").attr("href", photoTransactionPhoto).attr("id", "imageLink" + i).attr("download", "image.png").appendTo("#item_" + i);
						$('<img id="img' + i + '">').attr('src', photoTransactionPhoto).attr('class', 'dl').attr('height', '400').attr('width', '400').appendTo('#imageLink' + i);
					}
				}
			}
			
			$("<a>").attr("href", "#myCarousel").attr("id", "left").attr("class", "left carousel-control").attr("data-slide", "prev").appendTo("#myCarousel");
			$("<span>").attr("class", "glyphicon glyphicon-chevron-left").appendTo("#left");
			$("<span>").attr("class", "sr-only").appendTo("#left");
			
			$("<a>").attr("href", "#myCarousel").attr("id", "right").attr("class", "right carousel-control").attr("data-slide", "next").appendTo("#myCarousel");
			$("<span>").attr("class", "glyphicon glyphicon-chevron-right").appendTo("#right");
			$("<span>").attr("class", "sr-only").appendTo("#right");
			
			_thisPopulate.setIdProofDetails(photoModelList);
		}, setIdProofDetails : function(photoModelList) {
			for(const element of photoModelList) {
				let photoTransactionModel	= element;
							
				let idProofName				= photoTransactionModel.idProofName;
				let cardNumber				= photoTransactionModel.cardNumber;
							
				let columnArray		= new Array();
							
				if(idProofName != "" && idProofName != undefined) {
					$('#idProofDetails').removeClass('hide');
					$("*[data-selector=header]").html('ID Proof Details');
								
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + idProofName + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + cardNumber + "</td>");
								
					$('#idProofDetails tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
				}
			}
		}
	}
})