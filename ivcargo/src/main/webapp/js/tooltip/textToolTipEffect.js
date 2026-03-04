/**
 * @Author Anant Chaudhary	12-02-2016
 */


function findPos(obj) {
	var curleft = curtop = 0;
	
	if (obj.offsetParent) {
		curleft = obj.offsetLeft;
		curtop 	= obj.offsetTop;
		
		while (obj = obj.offsetParent) {
			curleft += obj.offsetLeft;
			curtop 	+= obj.offsetTop;
		}
	}
	return [curleft, curtop];
}


function showInfo(elObj, tagToDisp) {
	var div = document.getElementById('toolTipInfo');

	div.style.display	= 'block';

	var elPos		= findPos(elObj);

	div.style.left 	= elPos[0] + 'px';
	div.style.top 	= elPos[1] -36 +'px'; 

	if(elObj.id == 'consignorPhn' || elObj.id == 'consigneePhn'
	|| elObj.id == 'consignorTin' || elObj.id == 'consigneeTin'
	|| elObj.id == 'consignoCorprGstn' || elObj.id == 'consigneeCorpGstn'
	|| elObj.id == 'consignorGstn' || elObj.id == 'consigneeGstn')
		tagToDisp = tagToDisp + ' : ' + elObj.value.length;
	
	div.innerHTML 	= tagToDisp;
}

function hideInfo() {
	$('#toolTipInfo').hide();
}