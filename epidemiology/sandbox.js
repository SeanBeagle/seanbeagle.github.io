var data = 'https://raw.githubusercontent.com/SeanBeagle/D3Bio/master/networkLT30.json';

d3.json(data, function(error, graph) {
	if (error) throw error;

var dataWidgetID = 'data-widget';
var dataWidget = d3.select('#' + dataWidgetID)
  .attr('class', 'table-responsive');

var tableID  = 'data-widget-table' 
var dataTable = dataWidget
  .append('table')
    .attr('id', tableID)
    .attr('class', 'table table-sm table-striped');

var headerID = 'data-widget-table-header';
var headerRow = dataTable
  .append('thead')
  .append('tr')
  .attr('class', headerID);


var headers = ['Sample', 'Patient', 'DateCollected', 'Trial', 'State', 'Facility', 'Species', 'Clone'];
headers.forEach(header => headerRow.append('th').text(header));

dataTable.append('tbody');

$('#data-widget-table').DataTable({
    ajax: {
        url: data,
        dataSrc: "nodes"
    },
    columns: [
        { data: 'fw_sample'},
        { data: 'fw_patient'},
        { data: 'date_collected' },
        { data: 'fw_trial' },
        { data: 'state'},
        { data: 'fw_facility'},
        { data: 'taxon'},
        { data: 'clone'}
    ],
    "pageLength": 25
});

$(document).ready(function() {
    $('#example').DataTable( {
        dom: 'Bfrtip',
        buttons: [
            'copy', 'csv', 'excel', 'pdf', 'print'
        ]
    } );
} );






});

// d3.select('body')
//   .append('button')
//   .attr('id', 'add-row');

// var table = d3.select('body')
//   .append('table')
//   .attr('id', 'data-table')
//   .attr('class', 'table');

// var headers = table
//   .append('thead')
//   .append('tr');
// headers.append('th').text('col1');
// headers.append('th').text('col2');
// headers.append('th').text('col3');
// headers.append('th').text('col4');
// headers.append('th').text('col5');



$(document).ready(function() {
    var t = $('#data-table').DataTable();
    var counter = 1;
 
    $('#add-row').on( 'click', function () {
        t.row.add( [
            counter +'.1',
            counter +'.2',
            counter +'.3',
            counter +'.4',
            counter +'.5'
        ] ).draw( false );
 
        counter++;
    } );
 
    // Automatically add a first row of data
    $('#add-row').click();
} );


