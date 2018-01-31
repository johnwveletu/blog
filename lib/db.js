/**
 * 用来mongodb来连接数据库 测试时使用过 现在使用mongolass连接数据库
 */
var settings = require('../settings'),
    Db = require('mongodb').db,
    Connection = require('mongodb').Connection,
    Server = require('mongodb').Server;

module.exports = new Db(settings.db, new Server(settings.host, settings.port, {
    safe: true
}));