// Generated by CoffeeScript 1.6.2
(function() {
  var e, summarize;

  summarize = require('./summarize').summarize;

  exports.summarize = summarize;

  try {
    hexo.extend.helper.register('auto_keyword_desc', function(html) {
      var v;

      v = summarize(html);
      return "            <meta name=\"description\" content=\"" + (v.summarizes.join(';').replace('"', '\'')) + "\">\n            <meta name=\"keywords\" content=\"" + (v.words.join(',').replace('"', '\'')) + "\">        ";
    });
  } catch (_error) {
    e = _error;
    '';
  }

}).call(this);
