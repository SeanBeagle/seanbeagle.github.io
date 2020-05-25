console.log('Loading resource-manager.js');

function formatBook(book) {
   return '<li>' + book.author + ' (' + book.year + '). <a href="' + book.link + '">' + book.title + '</a>. ' + book.location + ': ' + book.publisher + '</li>';
}

var books=[], blogs=[], articles=[]; // extracted from resources.json
//$.getJSON('resources.json', d => d.forEach(book => books.push(book)));

$.ajax({
  url: 'resources.json',
  dataType: 'json',
  async: false,
  //data: myData,
  success: function(data) {
    data.forEach(book => books.push(book));
  }
});

/* BUILD HTML FRAMEWORK */
// books
$('<ol/>').attr('id', 'books').appendTo('#resources');
$('<h5/>').text('Books (' + books.length + ')').appendTo('#books');
// blogs
$('<ol/>').attr('id', 'blogs').appendTo('#resources');
$('<h5/>').text('Blogs').appendTo('#blogs');

// add books
console.log('...adding books');
console.log(books);
books.forEach( () => console.log('BOOK!') );
books.forEach( item => $(formatBook(item)).appendTo('#books') );
//books.forEach(item => console.log(item));
//books.forEach(item => console.log(item.title));


var arr = ['a', 'b', 'c', 'd'];
arr.forEach(item => $('<li>'+item+'</li>').appendTo('#blogs'));
