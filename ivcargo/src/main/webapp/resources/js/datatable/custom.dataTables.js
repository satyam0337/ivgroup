/**
 * @summary     DataTables
 * @description All custem function of datatable
 * @file        custom.dataTables.js
 * @author      Shailesh Khandare 
 */

/**
 * Set DataTables to TableId = pendingShortSettlementList
 **/
function setDataTableble(tableId, data){
	
	var configuration			= data.configuration;
	//Data to read from properties file 
	var disableSortingColumn				= configuration.disableSortingColumn;
	var enabledropdownFilter				= configuration.enabledropdownFilter;
	var isFilterAllow						= configuration.isFilterAllow;
	
	var table =	$(tableId).DataTable( {
		
		"bPaginate"	: false,
		"bJQueryUI" : true,
		 destroy	: true,
		"autoWidth"	: false,
		"sDom"		: "frtiS",
		
		// Disable sorting on the first column
		
		"columnDefs": [ {
				"searchable": false,
				"orderable": false,
				"targets": [Number(disableSortingColumn)],
        }
		],
        
        "order": [[ 1, 'asc' ]],
      
        //Individual Filter
                
        initComplete: function () {
           if(isFilterAllow == 'true'){
        	this.api().columns([enabledropdownFilter]).every( function () {
                var column = this;
                var select = $('<select><option value=""></option></select>')
                    .appendTo( $(column.header()).empty() )
                    .on( 'change', function () {
                        var val = $.fn.dataTable.util.escapeRegex(
                            $(this).val()
                        );
 
                        column
                            .search( val ? '^'+val+'$' : '', true, false )
                            .draw();
                    } );
 
                column.data().unique().sort().each( function ( d, j ) {
                    select.append( '<option value="'+d+'">'+d+'</option>' )
                } );
            } );
        }
        }
    } );
	 
	 // Sorting Start From 1
	
	table.on( 'order.dt search.dt', function () {
		table.column([Number(disableSortingColumn)], {search:'applied', order:'applied'}).nodes().each( function (cell, i) {
	            cell.innerHTML = i+1;
	        } );
	 } ).draw();
}


/**
 *Column Filter   
 */
function hideColumnDynamaclly(table){
	
	$('a.toggle-vis').on( 'click', function (e) {
	      
		e.preventDefault();
	 
	        // Get the column API object
	        var column = table.column( $(this).attr('data-column') );
	 
	        // Toggle the visibility
	        column.visible( ! column.visible() );
	    } );
	
}
/**
 *remove data table After
 *Used to remove data tables before print   
 */
function resetTable(tableId) {
	var table = $(tableId).DataTable();
	 table.destroy();
}