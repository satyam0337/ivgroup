(function ($) {
	$.extend(true, window, {
		"Ext": {
			"Plugins": {
				"HeaderFilter": HeaderFilter
			}
		}
	});

	/*
	Based on SlickGrid Header Menu Plugin (https://github.com/mleibman/SlickGrid/blob/master/plugins/slick.headermenu.js)

	(Can't be used at the same time as the header menu plugin as it implements the dropdown in the same way)
	*/

	function HeaderFilter(options) {
		var grid;
		var self = this;
		var handler = new Slick.EventHandler();
		var defaults = {
			buttonImage: "glyphicon glyphicon-triangle-bottom",
			filterImage: "glyphicon glyphicon-filter",
		};
		var $menu;
		var cachedFilters = new Object();
		var cachedFilterImage = new Object();

		function init(g) {
			options = $.extend(true, {}, defaults, options);
			grid = g;
			handler.subscribe(grid.onHeaderCellRendered, handleHeaderCellRendered)
				   .subscribe(grid.onBeforeHeaderCellDestroy, handleBeforeHeaderCellDestroy)
				   .subscribe(grid.onClick, handleBodyMouseDown)
				   .subscribe(grid.onColumnsResized, columnsResized);

			grid.setColumns(grid.getColumns());

			$(document.body).bind("mousedown", handleBodyMouseDown);
		}

		function destroy() {
			handler.unsubscribeAll();
			$(document.body).unbind("mousedown", handleBodyMouseDown);
		}

		function handleBodyMouseDown(e) {
			if ($menu && $menu[0] != e.target && !$.contains($menu[0], e.target)) {
				hideMenu();
			}
		}

		function hideMenu() {
			if ($menu) {
				$menu.remove();
				$menu = null;
			}
		}

		function handleHeaderCellRendered(e, args) {
			var column = args.column;
			var $el = $("<div></div>") 
				.addClass("slick-header-button")
				.data("column", column);

			if (cachedFilterImage[column.id] != undefined) {
				$el.addClass(cachedFilterImage[column.id]);
			}else{
				  $el.addClass(options.buttonImage);
			}
			if((column.listFilter) || (column.searchFilter))
			{
				$el.bind("click", showFilter).appendTo(args.node);
			}
		}

		function handleBeforeHeaderCellDestroy(e, args) {
			$(args.node)
				.find(".slick-header-button")
				.remove();
		}

		function showFilter(e) {
			var $menuButton = $(this);
			var columnDef = $menuButton.data("column");
			columnDef.filterValues = columnDef.filterValues || [];
			// WorkingFilters is a copy of the filters to enable apply/cancel behaviour
			var workingFilters = columnDef.filterValues.slice(0);
			if (!$menu) {
				if($('#modalBody').length > 0)
					$menu = $("<div class='slick-header-menu'>").appendTo('#modalBody');
				else
					$menu = $("<div class='slick-header-menu'>").appendTo(document.body);
			}
			$menu.empty();
			
			if( columnDef.searchFilter && (columnDef.dataType=="text" || columnDef.dataType == 'number') ){
				$("<i style=' position: absolute;padding: 15px 12px;pointer-events: none;z-index:5;'" +
						" class = 'glyphicon glyphicon-search'></i><input class='input' placeholder='Search'" +
				" style='margin-top: 5px; width: 206px;border:2px solid grey;border-radius:2px; padding-left: 30px;'>")
				.data("column", columnDef)
			.bind("keyup", function (e) {
				var filterVals = getFilterValuesByInput($(this));
				var filterOptions = "<label><input type='checkbox' value='-1' />&nbsp;(Select All)</label>";
				columnDef.filterValues = columnDef.filterValues || [];
				// WorkingFilters is a copy of the filters to enable apply/cancel behaviour
				//workingFilters = columnDef.filterValues.slice(0);
				if( filterVals != undefined && (filterVals.length > 0) ){
				for (var i = 0; i < filterVals.length; i++) {
					var filtered = _.contains(workingFilters, filterVals[i]);
					filterOptions += "<label><input type='checkbox' value='" + i + "'"
					+ (filtered ? " checked='checked'" : "")
					+ "/>&nbsp;" + filterVals[i] + "</label>";
					}
				var $filter = $menu.find('.filter');
				$filter.empty().append($(filterOptions));

				$(':checkbox', $filter).bind('click', function () {
					workingFilters = changeWorkingFilter(filterVals, workingFilters, $(this));
				});
				}
				else{
					if($(this).val().length > 0){
						filterOptions="<span>Data not found</span>";
						var $filter = $menu.find('.filter');
						$filter.empty().append($(filterOptions));
					}else{
						if(!columnDef.listFilter){
							filterOptions="";	
							var $filter = $menu.find('.filter');
							$filter.empty().append($(filterOptions));
						}
						else{
							listFilterGenerator();
						}
					}
				}
			})
			.appendTo($menu);
			}
			var $filter = $("<div class='filter'>").appendTo($menu);
			if(columnDef.listFilter && (columnDef.dataType=="text" || columnDef.dataType == 'number')){
			listFilterGenerator();
			}
			function listFilterGenerator(){
				var filterItems = getAllFilterValues(grid.getData().getItems(), columnDef);
				var filterOptions ="<div id='page-selection'></div><div id='listFilterContent'></div>";
				var $filter = $menu.find('.filter');
				$filter.empty().append($(filterOptions));
				 
				var arrays = [], size = 500;
				while (filterItems.length > 0){
					arrays.push(filterItems.splice(0, size));
				}
				
				loadFilterPageNo(0);

				if(arrays.length > 1){
					$('#page-selection').bootpag({
						total: arrays.length,
						maxVisible: 3,
						page:1,
						wrapClass: 'pagination pagination-sm row',
						leaps:true,
						firstLastUse: true,
					}).on("page", function(event,pageNo){loadFilterPageNo(pageNo-1);});
				} else
					$('#page-selection').hide();

				function loadFilterPageNo(index){
					var filterOptions = "<label><input type='checkbox' value='-1' />&nbsp;(Select All)</label>";
					for (var i = 0; i < arrays[index].length; i++) {
						var filtered = _.contains(workingFilters, arrays[index][i]);
						
						//if(arrays[index][i] != undefined) {
							filterOptions += "<label><input type='checkbox' value='" + i + "'"
							+ (filtered ? " checked='checked'" : "") + "/>&nbsp;" + arrays[index][i] + "</label>";
						//}
					}
					$("#listFilterContent").html(filterOptions); // some ajax content loading...
					$(':checkbox', $filter).bind('click', function () {
						workingFilters = changeWorkingFilter(arrays[index], workingFilters, $(this));
					});
				}
			}
			
			$('<button type="button" class="btn btn-success">OK</button>')
				.appendTo($menu)
				.bind('click', function (ev) {
					columnDef.filterValues = workingFilters.splice(0);
					setButtonImage($menuButton, columnDef.filterValues.length > 0);
					handleApply(ev, columnDef);
				});

			$('<button ty pe="button" class="btn btn-warning">Clear</button>')
				.appendTo($menu)
				.bind('click', function (ev) {
					columnDef.filterValues.length = 0;
					setButtonImage($menuButton, false);
					handleApply(ev, columnDef);
				});

			$('<button type="button" class="btn btn-danger">Cancel</button>')
				.appendTo($menu)
				.bind('click', hideMenu);


			var offset = $(this).offset();
			var left = offset.left - $menu.width() + $(this).width() - 8;

			var menutop = offset.top + $(this).height();

			if (menutop + offset.top > $(window).height()) {
				menutop -= ($menu.height() + $(this).height() + 8);
			}
			$menu.css("top", menutop)
				 .css("left", (left > 0 ? left : 0));
		}

		function columnsResized() {
			hideMenu();
		}

		function changeWorkingFilter(filterItems, workingFilters, $checkbox) {
			var value = $checkbox.val();
			var $filter = $checkbox.parent().parent();

			if ($checkbox.val() < 0) {
				// Select All
				if ($checkbox.prop('checked')) {
					$(':checkbox', $filter).prop('checked', true);
					//workingFilters = filterItems.slice(0);
					workingFilters = workingFilters.concat(filterItems.slice(0));
				} else {
					$(':checkbox', $filter).prop('checked', false);
					workingFilters = workingFilters.filter( function( el ) {
						return filterItems.indexOf( el ) < 0;
					} );
				}
			} else {
				var index = _.indexOf(workingFilters, filterItems[value]);
				
				if ($checkbox.prop('checked') && index < 0)
					workingFilters.push(filterItems[value]);
				else if (index > -1)
					workingFilters.splice(index, 1);
			}

			return workingFilters;
		}

		function setButtonImage($el, filtered) {
			var image = (filtered ? options.filterImage : options.buttonImage);
			$el.removeClass( options.buttonImage )
			$el.addClass(image);
			var columnDef = $el.data("column");
			cachedFilterImage[columnDef.id]=image;
		}

		function handleApply(e, columnDef) {
			hideMenu();

			self.onFilterApplied.notify({ "grid": grid, "column": columnDef }, e, self);

			e.preventDefault();
			e.stopPropagation();
		}

		function getFilterValuesByInput($input) {
			var column = $input.data("column"),
			filter = $input.val(),
			dataViewObj = grid.getData().getItems(),
			seen = [];
			if (filter.length > 0) {
			for (var i = 0; i < dataViewObj.length ; i++) {
				var value = dataViewObj[i][column.field];
					var mVal = !value ? '' : value;
					var lowercaseFilter = filter.toString().toLowerCase();
					var lowercaseVal = mVal.toString().toLowerCase();
					if (!_.contains(seen, value) && lowercaseVal.indexOf(lowercaseFilter) > -1) {
						if(seen.length < 10){
							seen.push(value);
						}else{
							break;
						}
					}
				}
			return _.sortBy(seen, function (v) { return v; });
			}
		}

		function getAllFilterValues(data, column) {
			if(cachedFilters[column.field] != undefined){
				var cachedColumnFilters = JSON.stringify(cachedFilters[column.field]);
				cachedColumnFilters = JSON.parse(cachedColumnFilters);
				return cachedColumnFilters;
			} else {
				//http://jszen.com/best-way-to-get-unique-values-of-an-array-in-javascript.7.html
				Array.prototype.unique = function() {
					var n = {},r=[];
				
					for(var i = 0; i < this.length; i++) {
						if (!n[this[i]]) {
							n[this[i]] = true; 
							r.push(this[i]); 
						}
					}
				
					return r;
				}
				
				var seen = [];
				
				for (var i = 0; i < data.length; i++) {
					var value = data[i][column.field];
					seen.push(value);
				}
				
				seen= seen.unique();
				var sortedUniqueData = _.sortBy(seen, function (v) { return v; });
				
				if(sortedUniqueData.length > 500) {
					cachedFilters[column.field] = sortedUniqueData;
					sortedUniqueData = JSON.stringify(sortedUniqueData);
					sortedUniqueData = JSON.parse(sortedUniqueData);
				}
				
				return sortedUniqueData;
			}
		}

		$.extend(this, {
			"init": init,
			"destroy": destroy,
			"onFilterApplied": new Slick.Event(),
			"onCommand": new Slick.Event()
		});
	}
})(jQuery);