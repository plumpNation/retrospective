var db = db = require('../wrapper');

exports.getTags = function (req, res) {
    db.getAll('tag').from('retrospectives')
        .then(function (result) {
            res.json({'results': result});
        })
        .fail(function (err) {
            console.log(err);
            res.json(err);
        });
};
