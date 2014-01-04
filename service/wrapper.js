var sage = require('sage'),
    q = require('q'),
    _ = require('lodash'),
    es = sage('http://localhost:9200'),
    elasticsearch = require('elasticsearch'),
    client = new elasticsearch.Client({
        host: 'localhost:9200'
    }),

    adaptResult = function (result) {
        var _result = result._source;
        _result.id = result._id;

        return _result;
    },

    adaptResults = function (results) {
        results = _.map(results, function(result) {
            return adaptResult(result);
        });

        return results;
    };

/**
 * Delete type from index.
 * @example
 * db.delete('myType').withId(5).from('myIndex');
 * // 'withId' param is the id to delete.
 * // 'from' param is the string name of the index to delete from.
 *
 * @param  {string} typeName The name of the type to delete.
 * @return {object}
 */
exports.delete = function (typeName) {
    var id;

    return {
        withId: function (_id) {
            id = _id;
            return this;
        },

        from: function (indexName) {
            var esi = es.index(indexName),
                est = esi.type(typeName),
                defer = q.defer();

            est.del({'_id': id}, function (err, result) {
                if (err) {
                    defer.reject(err);
                    return;
                }

                defer.resolve(result);
            });

            return defer.promise;
        }
    };
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

                if (!item.createdAt) {
                    item.createdat = json.parse(
                        JSON.stringify(new Date())
                    );
                }
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

exports.put = function (data) {
    var typeName;

    return {
        ofType: function (_typeName) {
            typeName = _typeName;
            return this;
        },
        withId: function(_id) {
            data.id = _id;
            return this;
        },
        into: function (indexName) {
            var esi = es.index(indexName),
                promises = [],
                defer = q.defer(),
                est;

            promises.push(defer.promise);

            if (!typeName) {
                defer.reject(new Error('You must specify a type'));
                return;
            }

            est = esi.type(typeName);

            est.get(data.id, function(err, result) {
                if (err) {
                    // if it didn't find it, do a est.post?
                    defer.reject(err);
                    return;
                }

                data.updatedAt = JSON.parse(
                    JSON.stringify(new Date())
                );

                _.forEach(result._source, function(value, name) {
                    if (!data[name] ) {
                        data[name] = value;
                    }
                });

                est.put(data, function(err, result) {
                    if (err) {
                        defer.reject(err);
                        return;
                    }

                    est.get(result.id, function (err, result) {
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
 * Use to retrieve all results of [type] from [index].
 *
 * @param  {string} type
 * @return {promise}
 */
exports.getAll = function (type) {
    var start = 0;
    return {
        start: function (_start) {
            start = _start;
            return this;
        },

        from: function (indexName) {
            var defer = q.defer();

            if (!type) {
                // @TODO: if we ever actually need 'types' as a array, check
                // back in git history.
                defer.reject(new Error('Type must be supplied'));
            }

            client.search({
                index: indexName,
                q: '_type:' + type,
                from: start
            }, function (error, results) {
                var response;
                if (error) {
                    defer.reject(error);
                    return;
                }
                response = adaptResults(results.hits.hits);
                response.total = results.hits.total;
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

exports.query = function (queryString) {
    var typeName,
        start = 0,
        // results to return
        size = 1000000;

    return {
        of: function (_typeName) {
            typeName = _typeName;
            return this;
        },

        start: function (_start) {
            start = _start;
            return this;
        },

        withSize: function (_size) {
            size = _size;
            return this;
        },

        from: function (indexName) {
            var defer = q.defer();

            if (!typeName) {
                defer.reject(new Error('Type name must be supplied'));
            }

            client.search({
                index: indexName,
                q: queryString,
                from: start,
                size: size
            }, function (error, results) {
                var response;
                if (error) {
                    defer.reject(error);
                    return;
                }
                response = adaptResults(results.hits.hits);
                response.total = results.hits.total;
                defer.resolve(response);
            });

            return defer.promise;
        }
    };
}
