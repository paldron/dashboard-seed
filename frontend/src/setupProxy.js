const proxy = require('http-proxy-middleware');

module.exports = function(app) {
    app.use(proxy('/api', { target: 'http://localhost:8081/' }));
    app.use(proxy('/media', { target: 'http://localhost:8081/' }));
}