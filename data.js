var d3 = require("d3"),
    fs = require("fs");

console.log("parsing geodata ...");
fs.readFile("sa2.geojson", "utf8", function(error, sa2Data) {
  sa2Data = JSON.parse(sa2Data)
    .features;
  console.log("parsing rent data ...");
  fs.readFile("rentData.csv", "utf8", function(error, rentData) {
    rentData = d3.csvParse(rentData)
      .map(function(d) {
        return {
          area: d.area,
          type: d.type,
          median: Math.round(+d.median),
          inc: Math.round(+d.inc * 1000) / 1000
        };
      });
    console.log("filtering geodata ...");
    actData = [];
    sa2Data.forEach(function(sa2) {
      let matches = rentData.filter(function(match) {
        return match.area == sa2.properties.SA2_NAME16;
      });
      if (matches.length > 0) {
        let properties = {};
        matches.forEach(function(match) {
          properties[match.type] = {
            area: match.area,
            median: match.median,
            years1: match.years1,
            years5: match.years5,
            years10: match.years10,
            inc: match.inc
          };
        });
        sa2.properties = properties;
        console.log("adding " + matches[0].area + " ...");
        actData.push(sa2);
      }
    });
    console.log("writing actRent.geojson ...");
    actRent = {
      type: "FeatureCollection",
      features: actData
    };
    fs.writeFile("actRent.geojson", JSON.stringify(actRent), function(error) {
      console.log("actRent.geojson written");
    });
  });
});
