console.log('Loading resource-manager.js');

function formatBook(book) {
   return '<li>' + book.author + ' (' + book.year + '). <a href="' + book.link + '">' + book.title + '</a>. ' + book.location + ': ' + book.publisher + '</li>';
}

var books = [];
$.getJSON('resources.json', d => d.forEach(book => books.push(book)));

/* BUILD HTML FRAMEWORK */
// books
$('<ol/>').attr('id', 'books').appendTo('#resources');
$('<h5/>').text('Books').appendTo('#books');
// blogs
$('<ol/>').attr('id', 'blogs').appendTo('#resources');
$('<h5/>').text('Blogs').appendTo('#blogs');

// Add books to HTML
books.sort((a, b) => a.author < b.author);
books.forEach(book => $(formatBook(book)).appendTo('#books'));
books.forEach(item => console.log(item));
books.forEach(item => console.log(item.title));
$('<li/>').text('test item').appendTo('#books');
console.log(books);

var arr = ['a', 'b', 'c', 'd'];
arr.forEach(item => $('<li>'+item+'</li>').appendTo('#books'));
