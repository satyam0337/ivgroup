
function findPos(obj) {
	var curleft = curtop = 0;
	if (obj.offsetParent) {
		curleft = obj.offsetLeft;
		curtop = obj.offsetTop;
		while (obj = obj.offsetParent) {
			curleft += obj.offsetLeft;
			curtop += obj.offsetTop;
		}
	}
	return [curleft,curtop];
}


function showInfo(elObj,tagToDisp) {
	var div = document.getElementById('toolTipInfo');

	div.style.display='block';

	/*var elPos= $(elObj).fixedPosition();

	div.style.left = elPos.left+'px';
	div.style.top = elPos.top - 16 +'px';*/

	 var elPos= findPos(elObj);

	div.style.left = elPos[0]+'px';
	div.style.top = elPos[1] -16 +'px'; 

	if(tagToDisp == 'Consignor Phone' || tagToDisp == 'Consignee Phone') {
		tagToDisp = tagToDisp + ' : ' + elObj.value.length;
	}

	div.innerHTML = tagToDisp;
}

function hideInfo() {
	$('#toolTipInfo').hide();
}