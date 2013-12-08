'use strict';

angular.module('retrospectApp')
    .controller('WordCloudCtrl', [
        '$scope',
        '$routeParams',
        'arrayUtils',
        'wordcloud',

        function ($scope, $routeParams, arrayUtils, wordcloud) {
            var buildCloud = function (cloudwords) {
                console.log('building cloud');

                var fill = d3.scale.category20(),
                    wordFrequency = arrayUtils.getWordCount(cloudwords),
                    words = cloudwords.map(function (cloudword) {
                        return {
                            text: cloudword,
                            size: 10 + wordFrequency[cloudword] * 90
                        };
                    });

                d3.layout.cloud().size([window.innerWidth, window.innerHeight])
                        .words(words)
                        .padding(5)
                        .rotate(function () { return ~~(Math.random() * 2) * 90; })
                        .font('Impact')
                        .fontSize(function (d) { return d.size; })
                        .on('end', draw)
                        .start();

                function draw(words) {
                    d3.select('#cloud-container').append('svg')
                            .attr('width', window.innerWidth)
                            .attr('height', window.innerHeight)
                        .append('g')
                            .attr('transform', 'translate(150,150)')
                        .selectAll('text')
                            .data(words)
                        .enter().append('text')
                            .style('font-size', function (d) { return d.size + 'px'; })
                            .style('font-family', 'Impact')
                            .style('fill', function (d, i) { return fill(i); })
                            .attr('text-anchor', 'middle')
                            .attr('transform', function (d) {
                                return 'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')';
                            })
                            .text(function (d) { return d.text; });
                }
            };

            wordcloud.get(function (cloudwords) {
                buildCloud(cloudwords.results);
            });
        }
    ]
);
