//libraries that are required for application and the dependencies of that library
var jQuery = window.jQuery,
    // check for old versions of jQuery
    oldjQuery = jQuery && !!jQuery.fn.jquery.match(/^1\.[0-4](\.|$)/),
    localJqueryPath = PROJECT_IVUIRESOURCES+'/resources/js/jquery/jquery.min',
    paths = {},
    noConflict;

// check for jQuery 
if (!jQuery || oldjQuery) {
    // load if it's not available or doesn't meet min standards
    paths.jquery = localJqueryPath;
    noConflict = !!oldjQuery;
} else {
    // register the current jQuery
    define('jquery', [], function() { return jQuery; });
}

require.config( {
	waitSeconds: 200,
	paths: {
		jquery:  PROJECT_IVUIRESOURCES+'/resources/js/jquery/jquery.min',
		constant		: PROJECT_IVUIRESOURCES+'/serverconfiguration/js/constant/constant',
		underscore		: PROJECT_IVUIRESOURCES+'/resources/js/underscore/underscore-min',
		backbone		: PROJECT_IVUIRESOURCES+'/resources/js/backbone/backbone-min',
		marionette		: PROJECT_IVUIRESOURCES+'/resources/js/backbone/backbone.marionette.min',
		text			: PROJECT_IVUIRESOURCES+'/resources/js/controller/text',
		jquerylingua 	: PROJECT_IVUIRESOURCES+'/resources/js/jquery/jquery.lingua.min',
		language 		: PROJECT_IVUIRESOURCES+'/resources/js/language/language',
		errorshow		: PROJECT_IVUIRESOURCES+'/resources/js/error/error',
		nodvalidation 	: PROJECT_IVUIRESOURCES+'/resources/js/validation/nod',
		validation 		: PROJECT_IVUIRESOURCES+'/resources/js/validation/customvalidation',
		focusnavigation : PROJECT_IVUIRESOURCES+'/resources/js/navigation/elementfocusnavigation',
		elementmodel 	: PROJECT_IVUIRESOURCES+'/resources/js/model/element/elementmodel1',
		elementTemplateJs : PROJECT_IVUIRESOURCES+'/resources/js/template/elementtemplateutils',
		JsonUtility 	: PROJECT_IVUIRESOURCES+'/resources/js/json/jsonutility',
		JsonUtilityConstant : PROJECT_IVUIRESOURCES+'/resources/js/json/jsonutilityconstant',
		
		// SlickGrid related imports for working with large dataset 
		dragEvent		:  PROJECT_IVUIRESOURCES+'/resources/js/slickgrid/lib/jquery.event.drag-2.2',
		slickCore		:   PROJECT_IVUIRESOURCES+'/resources/js/slickgrid/slick.core',
		slickGrid		:   PROJECT_IVUIRESOURCES+'/resources/js/slickgrid/slick.grid',
		slickDataView	:   PROJECT_IVUIRESOURCES+'/resources/js/slickgrid/slick.dataview',
		slickPager 		:   PROJECT_IVUIRESOURCES+'/resources/js/slickgrid/controls/slick.pager',
		slickGridGroupMetaData		: PROJECT_IVUIRESOURCES+'/resources/js/slickgrid/slick.groupitemmetadataprovider',
		slickColumnPicker : PROJECT_IVUIRESOURCES+'/resources/js/slickgrid/controls/slick.columnpicker',
		jqueryUiSortable  : PROJECT_IVUIRESOURCES+'/resources/js/slickgrid/jquery_dependant/jquery.ui.sortable',
		bootPaging  	  : PROJECT_IVUIRESOURCES+'/resources/js/jquery/jquery.bootpag.min',
		// SlickGrid related imports for working with large dataset
		slickCellRangeSelector 		: PROJECT_IVUIRESOURCES+'/resources/js/slickgrid/plugins/slick.cellrangeselector',
		slickCellSelectionModel 	: PROJECT_IVUIRESOURCES+'/resources/js/slickgrid/plugins/slick.cellselectionmodel',
		slickCellRangeDecorator 	: PROJECT_IVUIRESOURCES+'/resources/js/slickgrid/plugins/slick.cellrangedecorator',
		extHeaderFilter 			: PROJECT_IVUIRESOURCES+'/resources/js/slickgrid/ext.headerfilter',
		extOverlays 				: PROJECT_IVUIRESOURCES+'/resources/js/slickgrid/ext.overlays',
		slickHeaderButtons 			: PROJECT_IVUIRESOURCES+'/resources/js/slickgrid/plugins/slick.headerbuttons',
		slickGridPrint 				: PROJECT_IVUIRESOURCES+'/resources/js/slickgrid/plugins/slickgrid-print-plugin',
		slickGridExcel 				: PROJECT_IVUIRESOURCES+'/resources/js/slickgrid/plugins/slickgrid-excel-plugin',
		slickGridRowSelectionModel	: PROJECT_IVUIRESOURCES+'/resources/js/slickgrid/plugins/slick.rowselectionmodel',
		slickGridCheckBox			: PROJECT_IVUIRESOURCES+'/resources/js/slickgrid/plugins/slick.checkboxselectcolumn',
		slickGridFormatter			: PROJECT_IVUIRESOURCES+'/resources/js/slickgrid/slick.formatters',
		slickGridEditor				: PROJECT_IVUIRESOURCES+'/resources/js/slickgrid/slick.editors',
		slickGridTotalsPlugin		: PROJECT_IVUIRESOURCES+'/resources/js/slickgrid/TotalsPlugin',
		slickGridGetscrollbarwidth	: PROJECT_IVUIRESOURCES+'/resources/js/slickgrid/jquery_dependant/jquery.getscrollbarwidth',
		// the wrapper class for using slickgrid functionality
		slickGridWrapper			: PROJECT_IVUIRESOURCES+'/resources/js/slickgrid/slickgridwrapper',
		slickGridWrapper2			: PROJECT_IVUIRESOURCES+'/resources/js/slickgrid/slickgridwrapper2',
		slickGridWrapper3			: PROJECT_IVUIRESOURCES+'/resources/js/slickgrid/slickgridwrapper3',
		// for dropdown and search in the text field
		bootstrapSwitch				: PROJECT_IVUIRESOURCES+'/resources/js/bootstrap/bootstrap-switch',
		simpleOverlay				: PROJECT_IVUIRESOURCES+'/resources/js/simpleoverlay/simpleOverlay',
		autocomplete				: PROJECT_IVUIRESOURCES+'/resources/js/jquery/jquery.ajax-combobox.min',	//for dropdown and search,
		autocompleteWrapper			: PROJECT_IVUIRESOURCES+'/resources/js/ajax/autocompleteutils', // wrapper for ajax-combobox autocomplete
		moment						: PROJECT_IVUIRESOURCES+'/resources/js/datepicker/moment',
		daterangepicker				: PROJECT_IVUIRESOURCES+'/resources/js/datepicker/daterangepicker',
		datepickerWrapper			: PROJECT_IVUIRESOURCES+'/resources/js/datepicker/datepickerwrapper',
		messageConstant				: PROJECT_IVUIRESOURCES+'/resources/js/error/messageconstant', // for messages
		messageUtility				: PROJECT_IVUIRESOURCES+'/resources/js/error/messageutility', // for messages
		selectize					: PROJECT_IVUIRESOURCES+'/resources/js/dropdown/selectize', 
		selectizewrapper			: PROJECT_IVUIRESOURCES+'/resources/js/dropdown/selectize-wrapper',
		notify						: PROJECT_IVUIRESOURCES+'/resources/js/notify/notify.min',
		jqueryConfirm				: PROJECT_IVUIRESOURCES+'/resources/js/confirm/3.3.4/jquery-confirm.min'
		
	},
	shim: {
		jquery			:        { exports: '$' },
		underscore      :	     { exports: '_' },
		backbone		:        {
			deps: [ 'underscore', 'jquery' ],
			exports: 'Backbone'
		},
		JsonUtility		:		{
			deps: [ 'JsonUtilityConstant']
		},
		autocompleteWrapper		:		{
			deps: [ 'autocomplete']
		},
		messageUtility		:		{
			deps: [ 'messageConstant']
		},
		selectizewrapper:{
        	deps:['selectize']
        },
		marionette 		:        {
			deps: [ 'jquery', 'underscore', 'backbone' ],
			exports: 'Marionette'
		},
		nodvalidation	: {
			deps: ['jquery', 'notify']
		},
		dragevent		:   	 ['jquery'],
		slickGrid		:  		 ['slickCore', 'dragEvent','slickDataView','slickPager','slickGridGroupMetaData',
		         		   		  'slickColumnPicker','slickCellRangeSelector','slickCellSelectionModel',
		         		   		  'slickCellRangeDecorator','extHeaderFilter','extOverlays','slickHeaderButtons',
		         		   		  ,'bootstrapSwitch','JsonUtility','bootPaging','slickGridPrint','slickGridExcel','simpleOverlay','slickGridCheckBox','slickGridRowSelectionModel'
		         		   		  ,'slickGridFormatter','jqueryUiSortable','slickGridEditor','slickGridTotalsPlugin','slickGridGetscrollbarwidth']
	},
	baseURL: PROJECT_IVUIRESOURCES+'/resources/js'
});
//baseurl defines the js which starts from specific directory

//master application is called from main js to initialilse the app
require(
		[ PROJECT_IVUIRESOURCES+'/resources/js/application/application.js' ],
		function ( app ) {
			app.start();
			/*app.vent.on("searchLRNumber", function(someData){
				showLayer();
			});
			$("#search-btn").click(function(){
				app.vent.trigger("searchLRNumber", "asdqwxsasd");
			})*/

		}
);