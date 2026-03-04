function initailiseNod(data){
	myNod = nod();
	myNod.configure({
		parentClass:'validation-message'
	});
	
	setValidationInNod(data,myNod);
}

function setValidationInNod(data, myNod) {
	for(var key in data) {
		var Arr = data[key];
		for  (var j=0; j < Arr.length;j++) {
			myNod.add(Arr[j]);
		}
	}
}