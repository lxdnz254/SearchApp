var api = require('./neo4jApi');
const formatCurrency = require('format-currency');
let opts = { format: '%s%v', symbol: '$'};

$(function () {
  renderGraph();
  searchBand();

  $("#search").submit(e => {
    e.preventDefault();
    searchBand();
  });
});

function showBand(name) {
  api
    .getBand(name)
    .then(band => {
      if (!band) return;

      $("#title").text(band.name);
      $("#poster").attr("src", "https://neo4j-contrib.github.io/developer-resources/language-guides/assets/img/logo-white.svg");
      var $list = $("#crew").empty();
      band.members.forEach(members => {
        $list.append($("<li>" + members.name + " plays " + members.instrument + "</li>"));
      });
    }, "json");
}

function searchBand() {
  var query = $("#search").find("input[name=search]").val();
  api
  .searchBandByGenre(query)
  .then(bands => {
    var t = $("table#results tbody").empty();

    if (bands) {
      bands.forEach(band => {
        $("<tr><td class='band'>" + band.name + "</td><td>" + formatCurrency(band.cost, opts) + "</td><td>" + band.rating + "</td></tr>").appendTo(t)
          .click(function() {
            showBand($(this).find("td.band").text());
          })
      });

      var first = bands[0];
      if (first) {
        showBand(first.name);
      }
    }
  });
}

function renderGraph() {
  var width = 800, height = 800;
  var force = d3.layout.force()
    .charge(-200).linkDistance(30).size([width, height]);

  var svg = d3.select("#graph").append("svg")
    .attr("width", "100%").attr("height", "100%")
    .attr("pointer-events", "all");

  api
    .getGraph()
    .then(graph => {
      force.nodes(graph.nodes).links(graph.links).start();

      var link = svg.selectAll(".link")
        .data(graph.links).enter()
        .append("line").attr("class", "link");

      var node = svg.selectAll(".node")
        .data(graph.nodes).enter()
        .append("circle")
        .attr("class", d => {
          return "node " + d.label
        })
        .attr("r", 10)
        .call(force.drag);

      // html title attribute
      node.append("title")
        .text(d => {
          return d.title;
        });

      // force feed algo ticks
      force.on("tick", () => {
        link.attr("x1", d => {
          return d.source.x;
        }).attr("y1", d => {
          return d.source.y;
        }).attr("x2", d => {
          return d.target.x;
        }).attr("y2", d => {
          return d.target.y;
        });

        node.attr("cx", d => {
          return d.x;
        }).attr("cy", d => {
          return d.y;
        });
      });
    });
}
