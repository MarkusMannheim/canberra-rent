var d3 = require("d3"),
    fs = require("fs");

console.log("reading ACT mesh ...");
fs.readFile("meshAct.geojson", "utf8", function(error, actData) {
  console.log("parsing ACT mesh ...");
  actMesh = JSON.parse(actData);
  console.log("reading NSW mesh ...");
  fs.readFile("meshNsw.geojson", "utf8", function(error, nswData) {
    console.log("parsing NSW mesh ...");
    nswMesh = JSON.parse(nswData);
    console.log("calculating ACT bounds ...");
    centre = [149.126944, -35.293056];
    mesh = actMesh.features.concat(nswMesh.features);
    console.log("cleaning mesh ...");
    mesh = mesh.filter(function(d) { return d.properties.AREASQKM16 > 0 && (d.properties.MB_CAT16 == "Water" || d.properties.MB_CAT16 == "Parkland"); });
    mesh.forEach(function(d) {
      d.properties = { class: d.properties.MB_CAT16 };
    });
    console.log("removing distant mesh ...");
    newMesh = [];
    mesh.forEach(function(d) {
      let bounds = d3.geoBounds(d);
      if (bounds[0][0] > centre[0] - .5 && bounds[1][0] < centre[0] + .5 && bounds[0][1] > centre[1] - .5 && bounds[1][1] < centre[1] + .5) newMesh.push(d);
    });
    set = new Set(newMesh.map(function(d) { return d.properties.class; }));
    console.log(set);
    newMesh = {
      type: "FeatureCollection",
      features: newMesh
    };
    fs.writeFile("mesh.geojson", JSON.stringify(newMesh), function(error) {
      console.log("mesh.geojson written");
    });
  });
});
