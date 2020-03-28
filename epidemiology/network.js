
/* div:#network-widget */
var slider = d3.select('#network-widget')
    .append("div").attr("id", "snp-slider");

var svg = d3.select('#network-widget')
  .append('svg')
  .attr('id', 'network')
  .attr('height', 700)
  .attr('width', 700);

var selectedNodesTable = d3.select('#selected-nodes-widget')
  .append('table')
  .attr('id', 'selected-nodes-table')
  .attr('class', 'table table-hover');

var width = +svg.attr('width'),
    height = +svg.attr('height'),
    r = 6;
console.log(width + ", " + height);
  
// svg.call(d3.zoom().on('zoom', zoomed)); // TODO(seanbeagle): Fix or remove zoom option
var color = d3.scaleOrdinal(d3.schemeCategory20);
    
/* Define Force Simulation */
var simulation = d3.forceSimulation()
    .force('link', d3.forceLink().id(d => d.fasta_id))
    .force('collide', d3.forceCollide(r+1))
    .force('charge', d3.forceManyBody().strength(-40))
    .force('x', d3.forceX(width/2))
    .force('y', d3.forceY(height/2));

// FILTERS AND DEFAULTS
var colorFilter = 'fw_facility';

var data = 'https://raw.githubusercontent.com/SeanBeagle/D3Bio/master/networkLT30.json';
    
d3.json(data, function(error, graph) {
  if (error) throw error;

  var link = svg.append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(graph.links)
    .enter().append('line');

  var node = svg.append('g')
    .attr('class', 'nodes')
    .selectAll('circle')
    .data(graph.nodes)
    .enter().append('circle')
    .attr('r', r)
    .attr('fill', d => color(d[colorFilter]))
    .on('dblclick', dblclick)
    .call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended));

  node.append('title').text("double click to select");
    
  node
    .on('mouseover', mouseover)
    .on('mouseout', mouseout);
  
  // Describe the effect on the simulation here:
  simulation
    .nodes(graph.nodes)
    .on('tick', ticked);
  simulation.force('link')
    .links(graph.links);

  
  /* Describe ticked function */
  function ticked() {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);
    node
      // .attr('cx', d => d.x)
      // .attr('cy', d => d.y);
      .attr('cx', function(d) { return d.x = Math.max(r, Math.min(width - r, d.x)); })
      .attr('cy', function(d) { return d.y = Math.max(r, Math.min(height - r, d.y)); });
    }
    
  
  /* div#snp-slider: Slider that draws links at or below threshold */
  function makeSNPSlider() {}
  var min = d3.min(graph.links, d => d.snps),	  // GET min and max
      max = d3.max(graph.links, d => d.snps);
     
  
  slider.text('Minimum SNPs: ');                // APPEND label
  slider.append('label')
    .attr('for', 'threshold')
    .text(max);
    
  slider.append('input')			                  // APPEND slider object to DIV
    .attr('type', 'range')
    .attr('id', 'threshold')
    .attr('min', min)
    .attr('max', max)
    .attr('value', max)
    .style('width', '700px')                    // TODO(seanbeagle): delegate to CSS
    .style('display', 'block')                  // TODO(seanbeagle): delegate to CSS
    .on('input', function () {                  // TODO(seanbeagle): create separate function
      var threshold = this.value;
      slider.select('label').text(threshold);
      // create array of links less than or equal to the threshold
      var newData = [];
      graph.links.forEach( function (d) {
        if (d.snps <= threshold) {newData.push(d);};
      });

      // Data join with filtered links
      link = link.data(newData, d => d.source + ', ' + d.target);
      link.exit().remove();
      var linkEnter = link.enter().append('line').attr('class', 'link');
    
      link = linkEnter.merge(link);
      node = node.data(graph.nodes);

      // Restart simulation with new link data
      simulation
        .nodes(graph.nodes).on('tick', ticked)
        .force('link').links(newData);
      simulation.alphaTarget(0.1).restart();
      });    
    

  // TODO(seanbeagle): Loop headers from JSON data
  // build "selected-nodes" table

  var selectedNodes = new Set();  // TODO(seanbeagle): 
  selectedNodesTable.append("caption").text("Selected Nodes");

  var headers = ['Sample', 'Patient', 'Trial', 'State', 'Facility', 'Species','Clone'];
  var headerRow = selectedNodesTable.append("tr").attr("id", "#selected-nodes-header-row");
  headers.forEach(header => headerRow.append("th").text(header));
  
    // TODO(seanbeagle): Get these attributes through JSON loop
    var colorOptions = ['fw_facility', 'state', 'taxon', 'clone', 'fw_patient'];
	
    var ColorSelector = d3.select('#select-color')
//        .append('select')
//        .attr('class','select')
       .on('change',changeColor)
    
    // add options to color select box
    var options = ColorSelector
        .selectAll('option')
        .data(colorOptions).enter()
        .append('option').text(d => d);

    function changeColor() {
        colorFilter = ColorSelector.property('value');
        node.attr('fill', d => color(d[colorFilter]))
    };
    
});

function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (d.selected) {
    d.fx = d.x;
    d.fy = d.y;
  } else {
    d.fx = null;
    d.fy = null;
  }

  if (!d3.event.active) simulation.alphaTarget(0);
  //    d3.select(this).transition()
  //       .attr('r', r)
  //       .style('stroke', 'black')
  //       .style('stroke-dasharray', '1')
  //       .style('stroke-width', 3);
  
  //   // add row to 'My Selections'
  //   if (!d.selected) {
  //     var row = selectedNodesTable.append('tr').attr('id', d.fasta_id.split('.')[0]);
  //     row.append('td').text(d.fw_sample);
  //     row.append('td').text(d.fw_patient);
  //     row.append('td').text(d.fw_trial);
  //     row.append('td').text(d.state);
  //     row.append('td').text(d.fw_facility);
  //     row.append('td').text(d.taxon);
  //     row.append('td').text(d.clone);
  //     d.selected = true;
  //   }
}


/* toggle node selection */
function dblclick(d) {
  if (d.selected) {
    // Return node to normal
    d3.select(this).transition()
      .attr('r', r)
      .style('stroke', 'none')
      .style('stroke-width', 0)
      .style('stroke-dasharray', '0')
      .attr('fill', d => color(d[colorFilter]));
    // REMOVE node from #selected-nodes-table
    var id = '#' + d.fasta_id.split('.')[0];      // TODO(seanbeagle): use reasonable indexes and stop string cat...
    d3.select(id).remove();
    d.selected = false;
    // unfreeze node
    d.fx = null;
    d.fy = null;
  } else {
      d3.select(this).transition()
        .attr('r', r)
        .style('stroke', 'black')
        .style('stroke-width', 3)
        .style('stroke-dasharray', '1')
        .attr('fill', d => color(d[colorFilter]));
    // APPEND node to #selected-nodes-table
      var row = selectedNodesTable.append('tr').attr('id', d.fasta_id.split('.')[0]);
      row.append('td').text(d.fw_sample);
      row.append('td').text(d.fw_patient);
      row.append('td').text(d.fw_trial);
      row.append('td').text(d.state);
      row.append('td').text(d.fw_facility);
      row.append('td').text(d.taxon);
      row.append('td').text(d.clone);
      d.selected = true;
      // freeze node
      d.fx = d.x;
      d.fy = d.y;
  }

  // d.fx = null;
  // d.fy = null;
  
  // // Return node to normal
  // d3.select(this).transition()
  //   .attr('r', r)
  //   .style('stroke', 'none')
  //   .style('stroke-width', 0)
  //   .style('stroke-dasharray', '0')
  //   .attr('fill', d => color(d[colorFilter]));
  
  // // Remove ROW from 'My Selections'
  // var id = '#' + d.fasta_id.split('.')[0];
  // d3.select(id).remove();
  // d.selected = false;
  // console.log('removing ' + id);
}
    
    
function mouseover(d) {
    d3.select('#node-facility').text(d.fw_facility);
    d3.select('#node-state').text(d.state);
    d3.select('#node-taxon').text(d.taxon);
    d3.select('#node-id').text(d.fasta_id);
    if (!d.selected) {
      d3.select(this).transition()
        .attr('r', r*1.5)
        .style('stroke', 'black')
        .style('stroke-width', 3);
    }
}

function mouseout(d) {
    d3.select('#node-facility').text('');
    d3.select('#node-state').text('');
    d3.select('#node-taxon').text('');
    d3.select('#node-id').text('');
    if (!d.selected) {
        d3.select(this).transition()
            .attr('r', r)
            .style('stroke', 'none')
            .style('stroke-width', 0)
            .attr('fill', d => color(d[colorFilter]))
    }
}

function zoomed() {
	  svg.append('g').attr('transform', 'translate(' + d3.event.transform.x + ', ' + d3.event.transform.y + ') scale(' + d3.event.transform.k + ')');
}
