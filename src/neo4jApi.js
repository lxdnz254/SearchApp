require('file?name=[name].[ext]!../node_modules/neo4j-driver/lib/browser/neo4j-web.min.js');
repquire('./db/bolt');

var Band = require('./models/Band');
var BandMembers = require('./models/BandMembers');
var _ = require('lodash');

function searchBandByGenre(queryString) {
  var session = driver.session();
  return session
    .run(
      'MATCH (band:Band)-[:HAS_GENRE]->(g:Genre) \
      WHERE g.name = {genre}\
      RETURN band',
      {genre: queryString }
      
    )
    .then(result => {
      session.close();
      return result.records.map(record => {
        return new Band(record.get('band'));
      });
    })
    .catch(error => {
      session.close();
      throw error;
    });
}


function getBand(name) {
  var session = driver.session();
  return session
    .run(
      "MATCH (band:Band {name:{name}}) \
      OPTIONAL MATCH (band)<-[:IN_BAND]-(member:Member) \
      RETURN band.name AS name, \
      collect([member.name, \
          member.instrument]) AS members \
      LIMIT 1", {name})
      .then(result => {
        session.close();

        if(_.isEmpty(result.records))
          return null;

        var record = result.records[0];
        return new BandMembers(record.get('name'), record.get('members'));
      })
      .catch(error => {
        session.close();
        throw error;
      });
}

function getGraph() {
  var session = driver.session();
  return session.run(
    'MATCH (b:BAND)<-[:IN_BAND]-(a:Member) \
    RETURN b.name AS band, collect(a.name) AS member \
    LIMIT {limit}', {limit: 100})
    .then(results => {
      session.close();
      var nodes = [], rels = [], i = 0;
      results.records.forEach(res => {
        nodes.push({title: res.get('band'), label: 'band'});
        var target = i;
        i++;

        res.get('member').forEach(name => {
          var member = {title: name, label: 'member'};
          var source = _.findIndex(nodes, member);
          if (source == -1) {
            nodes.push(member);
            source = i;
            i++;
          }
          rels.push({source, target})
        })
      });

      return {nodes, links: rels};
    });
}

exports.getGraph = getGraph;

exports.searchBandByGenre = searchBandByGenre;
exports.getBand = getBand;

