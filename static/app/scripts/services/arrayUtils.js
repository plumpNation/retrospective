'use strict';


/**
 * You have a javascript array that likely has some duplicate values and you would like
 * a count of those values.
 * @type {[type]}
 */
angular.module('retrospectApp')
    .factory('arrayUtils', [

        function () {
            return {
                'getWordCount': function (original) {

                    var wordcount = {},
                        // make a copy of the input array
                        copy = original.slice(0),
                        myCount,
                        i, w, a;

                    // first loop goes over every element
                    for (i = 0; i < original.length; i += 1) {

                        myCount = 0;

                        // Loop over every element in the copy and see if it's the same.
                        for (w = 0; w < copy.length; w += 1) {
                            if (original[i] === copy[w]) {
                                // Increase amount of times duplicate is found.
                                myCount += 1;
                                // Sets item to undefined.
                                delete copy[w];
                            }
                        }

                        if (myCount > 0) {
                            wordcount[original[i]] = myCount;
                        }
                    }

                    return wordcount;
                }
            };
        }
    ]);
