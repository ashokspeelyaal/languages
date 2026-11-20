/* Kaarten met d3 (lokale kopie in vendor/, dus ook offline).
 *
 * Drie soorten:
 *   radial()  — de hele grammatica als één stralenkaart, gekleurd naar beheersing
 *   tree()    — de begripskaart van één hoofdstuk
 *   bubbles() — woordenschatthema's als cirkels, grootte = aantal woorden
 */
window.OK_MAP = (function () {
  var E = window.OK_ENGINE;

  function colorFor(m) {
    // 0 = niet aangeraakt (grijs) -> 1 = stevig (groen)
    if (m <= 0.001) return "var(--map-none)";
    return d3.interpolateRgb("#c2603a", "#3f8f5f")(Math.max(0, Math.min(1, m)));
  }

  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); }

  /* ---------- 1. stralenkaart van alle hoofdstukken ---------- */
  function radial(el, onPick) {
    clear(el);
    var W = el.clientWidth || 900, H = Math.max(640, Math.min(820, W * 0.86));
    var R = Math.min(W, H) / 2 - 165;

    var levels = ["A1", "A2", "B1", "B2", "Bijlage"];
    var root = { name: "Nederlands", children: [] };
    levels.forEach(function (lv) {
      var kids = window.OK_TOPICS.filter(function (t) { return t.level === lv; })
        .map(function (t) {
          var st = E.topicStats(t.id);
          return { name: t.title.replace(/ — .*/, ""), id: t.id, stats: st, value: st.total };
        });
      if (kids.length) root.children.push({ name: lv, children: kids });
    });

    var svg = d3.select(el).append("svg")
      .attr("viewBox", [-W / 2, -H / 2, W, H])
      .attr("width", "100%").attr("height", H)
      .attr("class", "mapsvg");
    var g = svg.append("g");

    svg.call(d3.zoom().scaleExtent([0.5, 4]).on("zoom", function (ev) {
      g.attr("transform", ev.transform);
    }));

    var hierarchy = d3.hierarchy(root);
    d3.cluster().size([2 * Math.PI, R])(hierarchy);

    g.append("g").attr("fill", "none").attr("stroke", "var(--map-link)")
      .attr("stroke-width", 1.2)
      .selectAll("path").data(hierarchy.links()).join("path")
      .attr("d", d3.linkRadial().angle(function (d) { return d.x; }).radius(function (d) { return d.y; }));

    var node = g.append("g").selectAll("g").data(hierarchy.descendants()).join("g")
      .attr("transform", function (d) {
        return "rotate(" + (d.x * 180 / Math.PI - 90) + ") translate(" + d.y + ",0)";
      });

    node.append("circle")
      .attr("r", function (d) { return d.depth === 0 ? 9 : d.depth === 1 ? 7 : 4 + Math.min(6, (d.data.value || 0) / 40); })
      .attr("fill", function (d) {
        if (d.depth < 2) return "var(--map-node)";
        return colorFor(d.data.stats ? d.data.stats.mastery : 0);
      })
      .attr("class", function (d) { return d.depth === 2 ? "hit" : null; })
      .on("click", function (ev, d) { if (d.depth === 2 && onPick) onPick(d.data.id); });

    node.append("text")
      .attr("dy", "0.32em")
      .attr("x", function (d) { return d.x < Math.PI === !d.children ? 9 : -9; })
      .attr("text-anchor", function (d) { return d.x < Math.PI === !d.children ? "start" : "end"; })
      .attr("transform", function (d) { return d.x >= Math.PI ? "rotate(180)" : null; })
      .attr("class", function (d) { return d.depth === 2 ? "maplabel hit" : "maplabel strong"; })
      .text(function (d) { return d.data.name; })
      .on("click", function (ev, d) { if (d.depth === 2 && onPick) onPick(d.data.id); })
      .append("title").text(function (d) {
        if (!d.data.stats) return d.data.name;
        return d.data.name + " — " + Math.round(d.data.stats.mastery * 100) + "% ingesleten, "
          + d.data.stats.seen + "/" + d.data.stats.total + " gezien";
      });

    return svg.node();
  }

  /* ---------- 2. begripskaart van één hoofdstuk ---------- */
  function tree(el, data) {
    clear(el);
    if (!data) return;
    var W = el.clientWidth || 760;
    var hierarchy = d3.hierarchy(data);
    var leaves = hierarchy.leaves().length;
    var H = Math.max(220, leaves * 30 + 60);

    var svg = d3.select(el).append("svg")
      .attr("viewBox", [0, 0, W, H]).attr("width", "100%").attr("height", H)
      .attr("class", "mapsvg");
    var g = svg.append("g").attr("transform", "translate(90,20)");
    svg.call(d3.zoom().scaleExtent([0.6, 3]).on("zoom", function (ev) {
      g.attr("transform", ev.transform.toString() + " translate(90,20)");
    }));

    d3.tree().size([H - 40, W - 300])(hierarchy);

    g.append("g").attr("fill", "none").attr("stroke", "var(--map-link)").attr("stroke-width", 1.3)
      .selectAll("path").data(hierarchy.links()).join("path")
      .attr("d", d3.linkHorizontal().x(function (d) { return d.y; }).y(function (d) { return d.x; }));

    var node = g.append("g").selectAll("g").data(hierarchy.descendants()).join("g")
      .attr("transform", function (d) { return "translate(" + d.y + "," + d.x + ")"; });

    node.append("circle").attr("r", function (d) { return d.depth === 0 ? 6 : 4; })
      .attr("fill", function (d) { return d.depth === 0 ? "var(--accent)" : d.children ? "var(--map-node)" : "var(--map-leaf)"; });

    node.append("text").attr("dy", "0.32em")
      .attr("x", function (d) { return d.children ? -9 : 9; })
      .attr("text-anchor", function (d) { return d.children ? "end" : "start"; })
      .attr("class", function (d) { return d.depth === 0 ? "maplabel strong" : "maplabel"; })
      .text(function (d) { return d.data.name; });
    return svg.node();
  }

  /* ---------- 3. woordenschatthema's ---------- */
  function bubbles(el, cats, onPick) {
    clear(el);
    var W = el.clientWidth || 900, H = 560;
    var root = d3.hierarchy({ children: cats }).sum(function (d) { return d.n || 0; });
    d3.pack().size([W, H]).padding(6)(root);

    var svg = d3.select(el).append("svg")
      .attr("viewBox", [0, 0, W, H]).attr("width", "100%").attr("height", H)
      .attr("class", "mapsvg");

    var node = svg.append("g").selectAll("g").data(root.leaves()).join("g")
      .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; })
      .style("cursor", "pointer")
      .on("click", function (ev, d) { if (onPick) onPick(d.data.cat); });

    node.append("circle").attr("r", function (d) { return d.r; })
      .attr("fill", function (d) { return colorFor(d.data.mastery); })
      .attr("fill-opacity", 0.85)
      .attr("stroke", "var(--map-link)");

    node.append("title").text(function (d) {
      return d.data.cat + " — " + d.data.n + " woorden, " + Math.round(d.data.mastery * 100) + "% ingesleten";
    });

    node.append("text").attr("class", "bubblelabel").attr("text-anchor", "middle").attr("dy", "0.32em")
      .each(function (d) {
        if (d.r < 30) return;
        var max = Math.max(6, Math.floor(d.r / 3.6));           // tekenbreedte ~ straal
        var words = d.data.cat.replace(/[()]/g, "").split(/[\s–—-]+/), line = "", lines = [], i;
        for (i = 0; i < words.length; i++) {
          var w = words[i].length > max ? words[i].slice(0, max - 1) + "…" : words[i];
          if ((line + " " + w).length > max) { lines.push(line); line = w; }
          else line = line ? line + " " + w : w;
        }
        if (line) lines.push(line);
        var fit = Math.max(1, Math.floor(d.r / 7));
        if (lines.length > fit) lines = lines.slice(0, fit);
        var t = d3.select(this);
        lines.forEach(function (l, j) {
          t.append("tspan").attr("x", 0).attr("y", (j - (lines.length - 1) / 2) * 12).text(l);
        });
      });
    return svg.node();
  }

  return { radial: radial, tree: tree, bubbles: bubbles, colorFor: colorFor };
})();
