console.log('LOADING: resource-manager.js');

function formatBook(book) {
   return '<li>' + book.author + ' (' + book.year + '). <a href="' + book.link + '">' + book.title + '</a>. ' + book.location + ': ' + book.publisher + '</li>';
}

var books=[], blogs=[], articles=[]; // extracted from resources.json
/* TODO(seanbeagle): Create Functions for each resource type */
$.ajax({
  url: 'resources.json',
  dataType: 'json',
  async: false,
  success: data => data.forEach(item => books.push(item))
});

/* BUILD HTML */
$('<h1/>').text('Resources').appendTo('#resources');
$('<div/>').attr('id', 'filters').appendTo('#resources');

if (books.length > 0) {  // INCLUDE: #books
  $('<label/>').attr('id', 'books-select').appendTo('#filters');
  $('<input/>')
     .attr('type', 'checkbox')
     .attr('name', 'resourceCheckbox')
     .attr('value', 'books')
     .prop('checked', true)
     .appendTo('#books-select');
  $('<span/'>).text('books (' + books.length + ')').appendTo('#books-select');
   
  books.sort((a,b) => a.author < b.author);
  $('<div/>').attr('id', 'books').appendTo('#resources');
  $('<h5/>').text('Books').appendTo('#books');
  $('<ol/>').attr('id', 'book-list').appendTo('#books');
  books.forEach(item => $(formatBook(item)).appendTo('#book-list'));
}
if (blogs.length > 0) {  // INCLUDE: #blogs
  blogs.sort((a,b) => a < b);
  $('<div/>').attr('id', 'blogs').appendTo('#resources');
  $('<h5/>').text('Blogs (' + blogs.length + ')').appendTo('#blogs');
  $('<ol/>').attr('id', 'blog-list').appendTo('#blogs');
  blogs.forEach(item => $(formatBook(item)).appendTo('#blog-list'));
}

$(document).ready(function(){
    $('input[type="checkbox"]').click(function(){
        var inputValue = $(this).attr("value");
        $("#" + inputValue).toggle();
    });
});

