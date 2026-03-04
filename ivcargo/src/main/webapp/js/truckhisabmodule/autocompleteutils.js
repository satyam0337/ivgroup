var KEY_DOWN = 'keydown';

/**
 * auto complete wrepper
 */
$.fn.autocompletecus = function (auto) {
	return $( this ).ajaxComboBox (
			auto.url, {
				field			: auto.field,
				primary_key		: auto.primary_key,
				instance		: true,
				bind_to			: 'callBack'
			})
			.bind('callBack', auto.callBack);
};

/**
 * set source in autocomplete. 
 * 
 * @param instance	- autocomplete instance
 * @param source	- autocomplete source
 * 
 */
$.fn.setSourceToAutoComplete = function (source) { // Input Value like in URL 
	$( this ).each(function() {
		this.option.source = source;
	});
};
