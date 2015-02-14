var server = require('express')()
  , Moves = require('./moves')

var moves = Moves({
    client_id: 'X1EBpQUBAMUaK93I3m4ahIl73S8a75By'
  , client_secret: 'gEXh2DCUG23670o6n9nrl383JG5957Jcb2f3yDP0bW6si98VA8hq7IN426XCJDm1'
  , redirect_url: 'http://localhost:8787/token'
})
var at = '34yYBTCie7uDI16Mxwn1XVhCAw7uS6P9NJwno3MkEZW0kA3YibU5Y3Sneu4Jfho8'
  , rt = 'bu5w0VVFtP8gcuIjBRjk63xzSiyedJHC3waMRuATdp9PmNHW40Xdp2GiR10MTNUR'

server.get('/', function(request, response) {
    moves.authorize({
        scope: ['activity']
      , state: '123'
    }, response)
})
server.get('/token', function(request, response) {
    moves.token(request.query.code, function() {
        console.log(arguments)
    })
})
server.get('/info', function(request, response) {
    moves.token_info(at, function() {
        console.log(arguments)
    })
})
server.get('/refresh', function(request, response) {
    moves.refresh_token(rt, function() {
        console.log(arguments)
    })
})
server.get('/get', function(request, response) {
    moves.get('/user/profile', at, function() {
        console.log(arguments)
    })
})
server.listen(8787)
