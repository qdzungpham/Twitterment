const pos = require('pos');
const natural = require('natural');

module.exports = {
    getWords : function(text) {
        const allWords = [];

        if (text) {
            const words = new pos.Lexer().lex(text);
            const taggedWords = new pos.Tagger().tag(words);

            taggedWords.forEach(function(word) {
                const wordTypes = ["NNP", "NNPS", "NNS"];
                if (wordTypes.indexOf(word[1]) !== -1) {
                    if (word[0].length > 2) {
                        allWords.push(word[0]);
                    }
                }
            });
        }

        return allWords;
    },

    analyseCount: function(words) {
        //words = words.split(' ');
        if (words.length == 0) {
            return null;
        }
        var wordAnalysis = {};
        words.forEach(function (word) {
            var hasMatch = false;

            function checkMatch(element, index, words) {
                return  natural.JaroWinklerDistance(word,element) > 0.8;
            }

            hasMatch = words.some(checkMatch);

            if (hasMatch) {
                if (wordAnalysis[word]) {
                    wordAnalysis[word] = parseInt(wordAnalysis[word] + 1);
                }
                else {
                    wordAnalysis[word] = 1;
                }

            }
        });
        var results = [];
        for (var key in wordAnalysis) {
            if (wordAnalysis.hasOwnProperty(key)) {
                results.push(
                    {
                        word: key, appearances: wordAnalysis[key]
                    }
                )
            }
        }
        wordAnalysis = results.sort(
            function (a, b) {
                if (a.appearances > b.appearances) {
                    return -1;
                }
                if (a.appearances < b.appearances) {
                    return 1;
                }
                // a must be equal to b
                return 0;
            }
        );

        return wordAnalysis;
    }

};
