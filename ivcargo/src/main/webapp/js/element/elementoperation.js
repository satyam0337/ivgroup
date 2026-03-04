//check if element is exist or not. calling type $("#abc").exists()
$.fn.exists = function () {
	return this.length !== 0;
};

$.fn.isDisabled = function () {
	if($(this).prop('disabled')){
		return true;
	}else{
		return false;
	}
};
$.fn.isReadOnly = function () {
	if($(this).prop('readonly')){
		return true;
	}else{
		return false;
	}
};
$.fn.isHidden = function () {
	if($(this).is(":hidden")){
		return true;
	}else{
		return false;
	}
};

$.fn.isBound = function(type, fn) {
    var data = this.data('events')[type];

    if (data === undefined || data.length === 0) {
        return false;
    }

    return (-1 !== $.inArray(fn, data));
};

//reset value of Elements present in parent Element
 function resetElements(parentElementId,elementType,Value) {
	 var $inputs = $(parentElementId+' :'+elementType);

	 $inputs.each(function (index){$(this).val(Value);});
};

function getUniqueArr(ArrayList){
	var n = {},r=[];for(var i = 0; i < ArrayList.length; i++){if (!n[ArrayList[i]]){n[ArrayList[i]] = true;r.push(ArrayList[i]);}}
	return r;/*.sort(function(a, b) {return a.localeCompare(b);})*/
}