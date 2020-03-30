//   FILE: network.js
// AUTHOR: Sean Beagle
//  ABOUT: Creates a network widget from JSON containing "nodes" with associated 
//         metadata and "links" with SNP values between nodes.  JSON file format 
//         was chosen as input to allow for integration with MySQL database and 
//         REST-API.
//
// TODO: 
//  Convex Hulls: http://bl.ocks.org/donaldh/2920551 ... look at d3.nest()
//  Link bound to Node past perimeter: https://bl.ocks.org/mbostock/1129492
//  USA MAP: http://bl.ocks.org/michellechandra/0b2ce4923dc9b5809922

var data = 'https://raw.githubusercontent.com/SeanBeagle/D3Bio/master/networkLT30.json';

d3.json(data, function(error, data) {
  if (error) throw error;
  network = new Network(data);
  map = new Map(data);
  // mydata = new MyData(data);

});


class Network {
  constructor(data, widgetID='network-widget') {
    this.widgetID = widgetID;
    this.widget = d3.select('#' + this.widgetID);
    this.height = 600;
    this.width = 700;
    this.r = 6;
    this.color = d3.scaleOrdinal(d3.schemeCategory20);
    this.colorFilter = 'fw_facility';

    // BUILD WIDGET
    this.addFilters();
    this.addSimulation(data);
    this.addSlider(data);
    this.addSVG(data);
    this.addTable();
  }

  /* ADD COLOR SELECTOR */
  addFilters() {
    var filtersID = this.widgetID + '-filters';
    this.filters = this.widget
      .append('div')
      .attr('id', filtersID);

    this.filters
      .append('h5')
      .text('Filters:');

    this.colorSelector = this.filters
      .append('select')
      .attr('class','select')
      .attr('id', 'select-color')
      .on('change', this.changeColor);
    var colorOptions = ['fw_facility', 'state', 'taxon', 'clone', 'fw_patient'];
    var options = this.colorSelector
        .selectAll('option')
        .data(colorOptions).enter()
        .append('option').text(d => d);

  }

  /* ADD SIMULATION */
  addSimulation(data) {
    this.simulation = d3.forceSimulation()
      .force('link', d3.forceLink().id(d => d.fasta_id))
      .force('collide', d3.forceCollide(this.r+1))
      .force('charge', d3.forceManyBody().strength(-40))
      .force('x', d3.forceX(this.width/2))
      .force('y', d3.forceY(this.height/2));
  }

  /* ADD SVG */
  addSVG(data) {
    // SVG:
    this.svg = this.widget
      .append('svg')
      .attr('id', this.widgetID + '-svg')
      .attr('height', 700)        // TODO: make height/width responsive
      .attr('width', 700);
    this.link = this.svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(data.links)
      .enter().append('line');
    this.node = this.svg.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(data.nodes)
      .enter().append('circle')
      .attr('r', this.r)
      .attr('fill', d => this.color(d[this.colorFilter]))
      .on('dblclick', this.dblclick)
      .on('mouseover', this.mouseover)
      .on('mouseout', this.mouseout)
      .call(d3.drag()
        .on('start', this.dragstarted)
        .on('drag', this.dragged)
        .on('end', this.dragended));
    this.node.append('title').text("double click to select");

    this.simulation         // TODO: does this belong here?
      .nodes(data.nodes)
      .on('tick', this.ticked);
    this.simulation.force('link')
      .links(data.links);

  }

  /* ADD SLIDER */
  addSlider(data) {
    var sliderID = this.widgetID + '-slider';
    this.slider = this.widget
      .append('div')
      .attr('id', sliderID);

    var min = d3.min(data.links, d => d.snps),   // GET min and max
    max = d3.max(data.links, d => d.snps);
     
    // LABEL:
    this.slider.text('Minimum SNPs: ');
    this.slider.append('label')
      .attr('for', sliderID + '-input')
      .attr('id', sliderID + '-label')
      .text(max);
    
    // SLIDER
    this.slider.append('input')
      .attr('type', 'range')
      .attr('id', sliderID + '-input')
      .attr('min', min)
      .attr('max', max)
      .attr('value', max)
      .style('width', '100%')  // TODO(seanbeagle): delegate to CSS
      .style('display', 'block')  // TODO(seanbeagle): delegate to CSS
      .on('input', function () {  // TODO(seanbeagle): create separate function
        var threshold = this.value;
        d3.select('#network-widget-slider-label').text(threshold);  // TODO: this is hard coded.. try this.parentNode
        //create array of links less than or equal to the threshold
        var newData = [];
        data.links.forEach(d => {if (d.snps <= threshold) {newData.push(d);};});

        // Data join with filtered links
        network.link = network.link.data(newData, d => d.source + ', ' + d.target);
        network.link.exit().remove();
        var linkEnter = network.link.enter().append('line').attr('class', 'link');
      
        network.link = linkEnter.merge(network.link);
        network.node = network.node.data(data.nodes);

        // Restart simulation with new link data
        network.simulation
          .nodes(data.nodes)
          .on('tick', network.ticked)
          .force('link').links(newData);
        network.simulation.alphaTarget(0.1).restart();
      });
  }


  addTable() {
    var myDataWidget = d3.select('#mydata-widget');
    this.table = myDataWidget
      .append('table')
      .attr('id', "mydata-widget-table")
      .attr('class', 'table table-striped table-sm table-hover');

    this.table
      .append('caption')
      .text('Selected Nodes');

    this.headers = ['Sample', 'Patient', 'DateCollected', 'Trial', 'State', 'Facility', 'Species', 'Clone'];
    var headerRow = this.table
      .append('thead')
      .append('tr');
    this.headers.forEach(header => headerRow.append("th").text(header));

    this.t = $('#mydata-widget-table').DataTable();

    $(document).ready(function() {
      $('#mydta-widget-table').DataTable( {
        dom: 'Bfrtip',
        buttons: ['copy', 'csv', 'excel', 'pdf', 'print']
      });
    });
  }

  /* ticked? */
  ticked() {
    network.link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);
    network.node
      .attr('cx', d => {return d.x = Math.max(network.r, Math.min(network.width - network.r, d.x));})
      .attr('cy', d => {return d.y = Math.max(network.r, Math.min(network.height - network.r, d.y));});
    }

  dragstarted(d) {
      if (!d3.event.active) network.simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
  }

  dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  dragended(d) {
    if (d.isSelected) {
      d.fx = d.x;
      d.fy = d.y;
    } else {
      d.fx = null;
      d.fy = null;
    }

    if (!d3.event.active) network.simulation.alphaTarget(0);
  }

  /* toggle node selection */
  dblclick(d) {
    var id = '#' + d.fasta_id.split('.')[0];
    if (d.isSelected) {
      network.t.row(id)
        .remove()
        .draw();
      d.isSelected = false;
      // unfreeze node
      d.fx = null;
      d.fy = null;
    } else {
        d3.select(this).transition()
          .attr('r', network.r)
          .style('stroke', 'black')
          .style('stroke-width', 3)
          .style('stroke-dasharray', '1')
          .attr('fill', d => network.color(d[network.colorFilter]));
      // APPEND node to #selected-nodes-table

        network.t.row
          .add([d.fw_sample, d.fw_patient, d.date_collected, d.fw_trial, d.state, d.fw_facility, d.taxon, d.clone])
          .node().id = d.fasta_id.split('.')[0];
          network.t.draw(false);
        d.isSelected = true;
        // freeze node
        d.fx = d.x;
        d.fy = d.y;
    }
  }

  mouseover(d) {
    d3.select('#node-facility').text(d.fw_facility);
    d3.select('#node-state').text(d.state);
    d3.select('#node-taxon').text(d.taxon);
    d3.select('#node-id').text(d.fasta_id);
    if (!d.isSelected) {
      d3.select(this).transition()
        .attr('r', network.r*1.5)
        .style('stroke', 'black')
        .style('stroke-width', 3);
    }
  }

  mouseout(d) {
    d3.select('#node-facility').text('');
    d3.select('#node-state').text('');
    d3.select('#node-taxon').text('');
    d3.select('#node-id').text('');
    if (!d.isSelected) {
      d3.select(this).transition()
        .attr('r', network.r)
        .style('stroke', 'none')
        .style('stroke-width', 0)
        .attr('fill', d => network.color(d[network.colorFilter]))
    }
  }
 
  changeColor() {
    network.colorFilter = this.value;
    network.node.attr('fill', d => network.color(d[network.colorFilter]))
 }
}