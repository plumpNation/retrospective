var sage = require('sage'),
    q = require('q'),
    config = require('./config'),
    es = sage(config.db.url),

    /**
     * Convenience function to pull the _source element out of the elastic search response.
     *
     * @param  {object} result Object containing the _source element.
     * @return {object}        The source element with the unique id appended.
     */
    adaptResult = function (result) {
        var _result = result._source;
        _result.id = result.id;

        return _result;
    },

    /**
     * Convenience function to adaptResult of an array of results.
     *
     * @see adaptResult
     * @param  {array} results The array of results
     * @return {array}         The array of adapted results.
     */
    adaptResults = function (results) {
        results = results.map(function (result) {
            return adaptResult(result);
        });

        return results;
    };

exports.post = function (data) {
    var typeName;

    if (!Array.isArray(data)) {
        data = [data];
    }

    return {
        ofType: function (_typeName) {
            typeName = _typeName;
            return this;
        },

        into: function (indexName) {
            var esi = es.index(indexName),
                promises = [],
                est;

            if (!typeName) {
                defer.reject(new Error('You must specify a type'));
                return;
            }

            est = esi.type(typeName);

            data.forEach(function (item) {
                var defer = q.defer();
                promises.push(defer.promise);

                debugger;

                est.post(item, function (err, result) {
                    if (err) {
                        defer.reject(err);
                        return;
                    }

                    debugger;

                    est.get(result.id, function (err, result) {
                        debugger;
                        if (err) {
                            defer.reject(err);
                            return;
                        }

                        result = adaptResult(result);
                        defer.resolve(result);
                    });
                });

            });

            if (data.length === 1) {
                return promises[0];
            }

            return q.all(promises);
        }
    };
};

exports.checkIndexExists = function (indexName) {
    var esi = es.index(indexName),
        defer = q.defer();

    esi.exists(function (err, exists) {
        if (err) {
            defer.reject(err);
            return;
        }

        defer.resolve(exists);
    });

    return defer.promise;
};

exports.getIndexStatus = function (indexName) {
    var esi = es.index(indexName),
        defer = q.defer();

    esi.status(function(err, result) {
        if (err) {
            defer.reject(err);
            return;
        }

        defer.resolve(result);
    });

    return defer.promise;
};

/**
 * Use to retrive all results of [type] from [index].
 *
 * @param  {string|array} types e.g. 'type1' 'type1, type2' ['type1', 'type2']
 * @return {promise}
 */
exports.getAll = function (types) {
    return {
        from: function (indexName) {
            var defer = q.defer(),
                esi = es.index(indexName),
                defer = q.defer(),
                est;

            if (!types) {
                defer.reject(new Error('Type(s) must be supplied'));
            }

            est = esi.type(types);

            est.find(function (err, results) {
                var response;

                if (err) {
                    defer.reject(err);
                    return;
                }

                response = adaptResults(results);

                defer.resolve(response);
            });

            return defer.promise;
        }
    };
};

exports.get = function (types) {
    var getId;

    return {
        withId: function (_id) {
            getId = _id;
            return this;
        },

        from: function (indexName) {
            var defer = q.defer(),
                esi = es.index(indexName),
                defer = q.defer(),
                est;

            if (!types) {
                defer.reject(new Error('Type(s) must be supplied'));
            }

            est = esi.type(types);

            est.get(getId, function (err, results) {
                if (err) {
                    defer.reject(err);
                    return;
                }

                results = adaptResult(results);

                defer.resolve(results);
            });

            return defer.promise;
        }
    };
};

exports.destroyIndex = function (indexName) {
    var esi = es.index(indexName),
        defer = q.defer();

    esi.destroy(function (err, result) {
        if (err) {
            defer.reject(err);
            return;
        }

        defer.resolve(result);
    });

    return defer.promise;
};

/**
 * Creates an index, the equivalent of a database in elastic search.
 *
 * @param  {string} indexName The name of the index
 * @return {promise}           Resolves with a success or failure response.
 */
exports.createIndex = function (indexName) {
    var esi = es.index(indexName),
        defer = q.defer();

    esi.create(function (err, result) {
        if (err) {
            defer.reject(err);
            return;
        }

        defer.resolve(result);
    });

    return defer.promise;
};

/**
 * Use with Apache Lucene query strings
 *
 * @param  {string} queryString
 * @return {promise}
 */
exports.query = function (queryString) {
    var typeName,
        // results to return
        size = 1000000;

    return {
        of: function (_typeName) {
            typeName = _typeName;
            return this;
        },

        withSize: function (_size) {
            size = _size;
        },

        from: function (indexName) {
            var defer = q.defer(),
                esi = es.index(indexName),
                defer = q.defer(),
                qStr,
                est;

            if (!typeName) {
                defer.reject(new Error('Type name must be supplied'));
            }

            est = esi.type(typeName);

            qStr = {'size': size, 'query': { 'query_string': { 'query': queryString }}};

            est.find(qStr, function (err, results) {
                if (err) {
                    defer.reject(err);
                    return;
                }

                results = adaptResults(results);

                defer.resolve(results);
            });

            return defer.promise;
        }
    };
}
