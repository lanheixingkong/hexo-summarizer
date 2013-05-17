// Generated by CoffeeScript 1.6.2
(function() {
  var Segment, get_cluster_val, get_top_TF, get_word_count, segment, summarize,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Segment = require('node-segment').Segment;

  segment = new Segment();

  segment.useDefault();

  get_cluster_val = function(sentence, words) {
    var clustes, data, index, max_value, no_match, size, v, val, w, _i, _j, _k, _len, _len1, _len2, _ref;

    clustes = [
      {
        words: [],
        count: 0
      }
    ];
    index = 0;
    no_match = 0;
    size = 3;
    _ref = sentence.words;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      v = _ref[_i];
      for (_j = 0, _len1 = words.length; _j < _len1; _j++) {
        w = words[_j];
        if (v.w === w) {
          if (no_match >= size) {
            no_match = 0;
            index = index + 1;
            clustes.push({
              words: [],
              count: 0
            });
          }
          data = clustes[index];
          data.count = data.count + 1;
        } else {
          no_match = no_match + 1;
          data = clustes[index];
        }
        data.words.push(v);
      }
    }
    max_value = 0;
    for (_k = 0, _len2 = clustes.length; _k < _len2; _k++) {
      v = clustes[_k];
      val = v.count * v.count / v.words.length;
      if (val > max_value) {
        max_value = val;
      }
    }
    return max_value;
  };

  get_top_TF = function(sentences) {
    var is_in, v, w, word, word_count, _i, _j, _k, _len, _len1, _len2, _ref, _words;

    _words = [];
    for (_i = 0, _len = sentences.length; _i < _len; _i++) {
      v = sentences[_i];
      _ref = v.words;
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        word = _ref[_j];
        word_count = get_word_count(word, sentences);
        if (word_count) {
          is_in = false;
          for (_k = 0, _len2 = _words.length; _k < _len2; _k++) {
            w = _words[_k];
            if (w.word.p === word_count.word.p) {
              is_in = true;
              break;
            }
          }
          if (false === is_in) {
            _words.push(word_count);
          }
        }
      }
    }
    return _words.sort(function(a, b) {
      return b.count - a.count;
    });
  };

  get_word_count = function(word, sentences) {
    var count, not_good, v, w, _i, _j, _len, _len1, _ref, _ref1;

    not_good = [8192, 4096, 262144, 2048];
    if (word.w.length < 2 || (_ref = word.p, __indexOf.call(not_good, _ref) >= 0)) {
      return false;
    }
    count = 0;
    for (_i = 0, _len = sentences.length; _i < _len; _i++) {
      v = sentences[_i];
      _ref1 = v.words;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        w = _ref1[_j];
        if (word.w === w.w) {
          count = count + 1;
        }
      }
    }
    return {
      count: count,
      word: word
    };
  };

  summarize = function(html) {
    var data, k, sentences, summarizes, txt, v, v2, words, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _m, _n, _ref, _ref1, _ref2, _ref3;

    txt = html.replace(/<\/p>/g, '\n').replace(/<\/?[^>]*>/g, '');
    sentences = [];
    _ref = txt.split('\n');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      v = _ref[_i];
      _ref1 = v.split('。');
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        v = _ref1[_j];
        _ref2 = v.split('.');
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          v2 = _ref2[_k];
          v2 = v2.trim();
          if (v2 !== '') {
            sentences.push({
              sentence: v2,
              words: segment.doSegment(v2)
            });
          }
        }
      }
    }
    words = [];
    _ref3 = get_top_TF(sentences);
    for (k = _l = 0, _len3 = _ref3.length; _l < _len3; k = ++_l) {
      v = _ref3[k];
      if (k === 10) {
        break;
      }
      words.push(v.word.w);
    }
    data = [];
    for (_m = 0, _len4 = sentences.length; _m < _len4; _m++) {
      v = sentences[_m];
      data.push({
        sentence: v.sentence,
        val: get_cluster_val(v, words)
      });
    }
    data = data.sort(function(a, b) {
      return b.val - a.val;
    });
    summarizes = [];
    for (k = _n = 0, _len5 = data.length; _n < _len5; k = ++_n) {
      v = data[k];
      if (k === 3) {
        break;
      }
      summarizes.push(v.sentence);
    }
    return {
      summarizes: summarizes,
      words: words
    };
  };

  hexo.extend.helper.register('auto_keyword_desc', function(html) {
    var v;

    v = summarize(html);
    return "        <meta name=\"description\" content=\"" + (v.summarizes.join(';')) + "\">\n        <meta name=\"keywords\" content=\"" + (v.words.join(',')) + "\">    ";
  });

}).call(this);
