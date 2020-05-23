$.getJSON( "resources.json", function(data) {
  var items = [];
  $.each(data, function(r) {
    items.push( "<li>" + r.author + ".(" + r.year "). " + r.title + ". " + r.publisher + ": " + r.location + ".</li>");
  });

  $( "<ol/>", {
    "class": "my-new-list",
    html: items.join("")
  }).appendTo("books");
});
