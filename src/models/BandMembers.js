var _ = require('lodash');

function BandMembers(name, members) {
  _.extend(this, {
    name: name,
    members: members.map(function (c) {
      return {
        name: c[0],
        instrument: c[1]
      }
    })
  });
}

module.exports = BandMembers;