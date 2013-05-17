# 载入分词模块
Segment = require('node-segment').Segment

segment = new Segment()
# 使用默认的识别模块及字典，载入字典文件需要1秒，仅初始化时执行一次即可
segment.useDefault()

# 找到句子的簇，返回最高的簇重要性
get_cluster_val = (sentence, words)->
    clustes  = [
        { words: [], count: 0 }
    ]
    index    = 0
    no_match = 0
    size     = 3 #门槛值

    for v in sentence.words
        for w in words
            #命中
            if v.w == w
                if no_match >= size
                    no_match = 0
                    index    = index + 1
                    clustes.push { words: [], count: 0 }
                
                data = clustes[index]
                data.count = data.count + 1
            else
                no_match = no_match + 1
                data = clustes[index]

            data.words.push v
    
    # 计算重要性
    max_value = 0
    for v in clustes
        val = v.count * v.count / v.words.length
        if val > max_value
            max_value = val
    return max_value



# 取词频
get_top_TF = (sentences)->
    _words = []

    for v in sentences
        for word in v.words
            word_count = get_word_count(word, sentences)
            if word_count 
                is_in = false
                for w in _words
                    if w.word.p == word_count.word.p 
                        is_in = true
                        break
                if false == is_in
                    _words.push word_count

    _words.sort (a, b)->
        return b.count - a.count

# 取一个词的出现次数
get_word_count = (word, sentences)->
    not_good = [8192, 4096, 262144, 2048]
    #console.log word.w.length
    if word.w.length < 2 or word.p in not_good 
        return false
    count = 0
    for v in sentences
        for w in v.words
            if word.w == w.w
                count = count + 1
    {
        count : count ,
        word : word
    }

summarize = (html) ->
    txt = html.replace(/<\/p>/g, '\n').replace(/<\/?[^>]*>/g,'')
    # 简单的分句子
    sentences = []
    for v in txt.split('\n')
        for v in v.split('。')
            for v2 in v.split('.')
                v2 = v2.trim()
                if v2 != ''
                    sentences.push 
                        sentence : v2
                        words : segment.doSegment v2
                    
    words = []

    # 取前10个关键字
    for v, k in get_top_TF sentences
        break if k == 10
        words.push v.word.w

    data = []
    for v in sentences
        data.push
            sentence: v.sentence
            val: get_cluster_val(v, words)

    data = data.sort (a, b)->
        return b.val - a.val

    summarizes = []
    for v, k in data
        break if k == 3
        summarizes.push v.sentence

    #console.log summarizes
    {
        summarizes : summarizes 
        words : words
    }


hexo.extend.helper.register('auto_keyword_desc', (html)->
    
    v = summarize(html)
    "
        <meta name=\"description\" content=\"#{v.summarizes.join(';')}\">\n
        <meta name=\"keywords\" content=\"#{v.words.join(',')}\">
    "
)