var retrospectives = require('./models/retrospectives'),
    tickets = require('./models/tickets'),
    tags = require('./models/tags'),

    allowCrossDomain = function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
        res.set('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        next();
    };

exports.setup = function (api) {
    api.use(allowCrossDomain);

    api.get('/retrospectives', retrospectives.getRetrospectives);
    api.get('/retrospectives/:retroId', retrospectives.getRetrospective);
    api.put('/retrospectives/:retroId', retrospectives.putRetrospective);
    api.post('/retrospectives', retrospectives.postRetrospective);

    api.get('/retrospectives/:retroId/tickets', tickets.getTickets);
    api.get('/retrospectives/:retroId/tickets/:ticketId', tickets.getTicket);
    api.put('/retrospectives/:retroId/tickets/:ticketId', tickets.putTicket);
    api.post('/retrospectives/:retroId/tickets', tickets.postTicketToRetrospective);
    api.delete('/retrospectives/:retroId/tickets/:ticketId', tickets.deleteTicket);

    api.get('/tags', tags.getTags);

    api.get('/wordcloud', tickets.getTicketWords);
};
