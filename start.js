'use strict';


const Hapi  = require('hapi');
const fs    = require('fs');
const low   = require('lowdb');

const db    = low('db.json');
db.defaults({'stats': []}).value();
//db.set('stats', []).value();
const dbStats = db.get('stats');



const linkArrayStr      = fs.readFileSync('links_to_check.js');
const linkArray         = JSON.parse(linkArrayStr);


const server = new Hapi.Server();
server.connection({ port: 9091 });

server.route({
    method: 'GET',
    path: '/{file?}',
    handler: function(request, reply) {
        let fileToLoad = 'index.html';
        if (request.params && 'file' in request.params) {
            if (request.params.file == 'client.js') {
                fileToLoad = 'client.js';
            } else {
                return reply('404 not found').code(404);
            }
        } 

        const fileContents = fs.readFileSync(fileToLoad).toString().replace(
         'const list=[]; //=> is replaced by server', 
         'const list='+linkArrayStr   
        );
        return reply(fileContents).code(200);
    }
});

server.route({
    method: 'GET',
    path: '/the-stats',
    handler: function(request, reply) {
        const statsHtml = fs.readFileSync('stats.html').toString();
        const statsDb = fs.readFileSync('db.json').toString();
        reply(statsHtml
            .replace('const srcList=[];','const srcList='+linkArrayStr+';')
            .replace('const userData={};','const userData='+statsDb+';'));
    }
});

server.route({
    method: 'POST',
    path: '/',
    handler: function(request, reply) {
        if (request.payload && 'indices' in request.payload) {
            if (linkArray.length != request.payload.indices.length) {
                return reply('Wrong array length or wrong format').code(404);
            } else {
                var indices = request.payload.indices.split('').map(item=>{
                    if (item=='1') {
                        return '1';
                    } else {
                        return '0';
                    }
                });
                dbStats.push(indices.join('')).value();
                return reply({'success':true}).code(200);
            }
        }
        
        return reply('No Payload given').code(403);
        /*dbStats.push('111101010101').value();
        dbStats.push('111101010102').value();*/
    }
});

server.start((err) => {

    if (err) {
        throw err;
    } else {
        console.log(`Server running at: ${server.info.uri}`);
    }
    
});