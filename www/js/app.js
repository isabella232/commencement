var $speeches = null;
var $tagsFilter = {};
var $search = null;
var $body = null;
var $leadQuote = null;
var $refreshQuoteButton = null;
var $sendMailButton = null;

var searchIndex = null;

var filterSpeeches = function() {
    $speeches.hide();

    var $visibleSpeeches = $speeches;
    var query = $search.val();
    var tags = $tagsFilter.val();

    if (query) {
        var results = searchIndex.search(query);
        var slugs = _.pluck(results, 'ref');
        var ids = _.map(slugs, function(s) { return '#' + s });

        $visibleSpeeches = $(ids.join(','));
    }

    if (tags) {
        $visibleSpeeches = $visibleSpeeches.filter('.tag-' + tags)
    }

    $visibleSpeeches.show();
}

var newSpeech = function(key, value){
    var speech = null;

    return {
        getSpeech: function(){
            this.setSpeech();

            return speech;
        },
        setSpeech: function(key, value){
            speech = _.chain(SPEECHES)
                      .shuffle()
                      .filter(function(pair){
                          return pair[key] == value;
                      })
                      .reject(function(pair){
                          return speech !== null ? pair['slug'] == speech['slug'] : false;
                      })
                      .value()[0];
        }
    };
}

var renderLeadQuote = function(quote){
    var context = typeof(quote['data']) !== 'undefined' ? quote['data'].getSpeech() : quote.getSpeech();
    var html = JST.quote(context);

    $leadQuote.html(html);
    _.defer(function(){
        $leadQuote.find('blockquote').addClass('fadein');
    });
}

var onSendMailClick = function() {
    var $this = $(this);
    var $form = $this.parent('form');
    var email_address = $form.find('input').val();
    var email_body = $form.find('textarea').text();
    var mailto_string = 'mailto:?to='+ email_address +'&subject=This is a really cool speech&body='+ email_body;
    window.location.href = mailto_string;
    return false;
}

$(function() {
    $speeches = $('.speeches li');
    $tagsFilter = $('#tags-filter');
    $search = $('#search');
    $body = $('body');
    $refreshQuoteButton = $('#refresh-quote');
    $sendMailButton = $('a.send-mail');

    $sendMailButton.on('click', onSendMailClick);

    if ($body.hasClass('homepage')){
        $leadQuote = $('#lead-quote');
        searchIndex = lunr(function () {
            this.field('name', {boost: 10})
            this.field('mood')
            this.field('school')
            this.field('year')
            this.ref('slug')
        })
        var quote = newSpeech();

        renderLeadQuote(quote);

        _.each(SPEECHES, function(speech) {
            searchIndex.add(speech);
        });

        $tagsFilter.on('change', filterSpeeches);
        $search.on('keyup', filterSpeeches);
        $refreshQuoteButton.on('click', quote, renderLeadQuote);
    }
});
