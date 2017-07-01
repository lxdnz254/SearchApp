var _ = require('lodash');

function Band(_node) {
  _.extend(this, _node.properties);

  if (this.id) {
    this.id = this.id.toNumber();
  }
  if (this.rating) {
      this.rating = this.rating.toNumber();
  }
  if (this.cost) {
      this.cost = this.cost.toNumber();
  }
}

module.exports = Band;