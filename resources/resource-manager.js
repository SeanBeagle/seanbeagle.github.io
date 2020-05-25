console.log('Loading resource-manager.js');
function formatBook(book) {
   return '<li>' + book.author + ' (' + book.year + '). <a href="' + book.link + '">' + book.title + '</a>. ' + book.location + ': ' + book.publisher + '</li>';
}

books = [];
$.getJSON('resources.json', data => {
    data.forEach(book => books.push(book));
});
books.sort((a, b) => a.author < b.author);
books.forEach(book => $(formatBook(book)).appendTo('#books-list'));
$('<li/>').text('test item').appendTo('#books-list');
console.log(books);
