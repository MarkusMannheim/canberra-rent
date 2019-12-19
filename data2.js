var d3 = require("d3"),
    fs = require("fs");

console.log("reading sa2 data ...");
fs.readFile("sa2.geojson", "utf8", function(error, sa2Data) {
  console.log("parsing sa2 data ...");
  sa2s = JSON.parse(sa2Data);
  console.log("cleaning sa2 data ...");
  sa2s = sa2s
    .features
    .filter(function(sa2) {
      return sa2.properties.STE_CODE16 == "8";
    });
  sa2s.forEach(function(sa2) {
    sa2.properties = {
      area: sa2.properties.SA2_NAME16
    };
  });
  console.log("rebuilding ACT sa2 data ...");
  console.log("reading rent data ...");
  fs.readFile("rentData.csv", "utf8", function(error, rentData) {
    console.log("parsing rent data ...");
    rentData = d3.csvParse(rentData);
    console.log("reformatting rent data ...");
    rentData.forEach(function(area) {
      area.q1 = +area.q1;
      area.q2 = +area.q2;
      area.q3 = +area.q3;
      area.years1 = +area.years1;
      area.years5 = +area.years5;
      area.years10 = +area.years10;
    });
    console.log("matching rent data to sa2s ...");
    newSa2s = [];
    sa2s.filter(function(sa2) {
      let areas = rentData.filter(function(d) {
        return d.area == sa2.properties.area;
      });
      if (areas.length > 0) {
        areas.forEach(function(area) {
          sa2.properties[area.type] = {
            q1: area.q1,
            q2: area.q2,
            q3: area.q3,
            yr1: area.years1,
            yr5: area.years5,
            yr10: area.years10
          };
        });
        sa2.properties.area = sa2.properties.area.replace(" (ACT)", "");
        newSa2s.push(sa2);
      } else {
        console.log(sa2.properties.area + " has no matches");
      }
    });
    newSa2s = {
      type: "FeatureCollection",
      features: newSa2s
    };
    fs.writeFile("actSa2s.geojson", JSON.stringify(newSa2s), function(error) {
      console.log("actSa2s.geojson written");
    });
  });
});
