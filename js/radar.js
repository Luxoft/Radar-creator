/// The MIT License (MIT)
///
/// Copyright (C) 2023 Luxoft GmbH
///
/// Based on https://github.com/zalando/tech-radar Copyright (c) 2017 Zalando SE,
/// which itself is based on https://github.com/thoughtworks/build-your-own-radar
////
/// Permission is hereby granted, free of charge, to any person obtaining a copy
/// of this software and associated documentation files (the "Software"), to deal
/// in the Software without restriction, including without limitation the rights
/// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
/// copies of the Software, and to permit persons to whom the Software is
/// furnished to do so, subject to the following conditions:
///
/// The above copyright notice and this permission notice shall be included in
/// all copies or substantial portions of the Software.
///
/// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
/// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
/// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
/// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
/// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
/// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
/// THE SOFTWARE.
///

function radar_visualization(config, data) {

    const C_MAX_GROUPS = 12;
    let valid_ring_ids = [];
    let valid_sector_ids = [];
    let valid_entries = [];

    for (let i = 0; (i < data.rings.length) && (i < C_MAX_GROUPS); i++) {
        valid_ring_ids.push(data.rings[i].id);
    }
    //console.log(valid_ring_ids);

    for (let i = 0; (i < data.sectors.length) && (i < C_MAX_GROUPS); i++) {
        valid_sector_ids.push(data.sectors[i].id);
    }
    //console.log(valid_sector_ids);

    for (let i = 0; i < data.entries.length; i++) {
        if ((valid_ring_ids.indexOf(data.entries[i].ring_id) > -1) &&
            (valid_sector_ids.indexOf(data.entries[i].sector_id) > -1)) {
            let element = {
                "sector": valid_sector_ids.indexOf(data.entries[i].sector_id),
                "ring": valid_ring_ids.indexOf(data.entries[i].ring_id),
                "label": data.entries[i].label,
                "moved": data.entries[i].moved,
                "link": data.entries[i].link,
                "active": (typeof data.entries[i].active === 'undefined') ? true : data.entries[i].active
            };
            valid_entries.push(element);
        }
    }
    //console.log(valid_entries);

    // custom random number generator, to make random sequence reproducible
    // source: https://stackoverflow.com/questions/521295
    let seed = 42;
    function random() {
        let x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }

    function random_between(min, max) {
        return min + random() * (max - min);
    }

    function normal_between(min, max) {
        return min + (random() + random()) * 0.5 * (max - min);
    }

    function px(fontsize) {
        return fontsize + "px";
    }

    function translate(x, y) {
        return `translate(${x},${y})`;
    }

    const C_RING_MAX = 420;
    const C_RING_MIN = 15;
    const C_INNER_RING_ADDITION = Math.ceil(((typeof data.options.inner_ring_addition !== 'undefined') ? data.options.inner_ring_addition : 0.052) * C_RING_MAX);
    const C_RING_THICKNESS = Math.ceil((C_RING_MAX - C_INNER_RING_ADDITION) / valid_ring_ids.length);

    const C_BLIP_RADIUS = 15;
    const C_BLIP_CORE = C_BLIP_RADIUS;

    const C_R_MIN_DIST = C_BLIP_RADIUS;
    const C_PHI_MIN_DIST = 0.15;

    const C_HALF_PI = 0.5 * Math.PI;
    const C_TWO_PI = Math.PI + Math.PI;

    const C_COORD_SHIFT = Math.PI;

    function clip_phi(phi) {
        phi += (phi < 0.0) ? C_TWO_PI : 0;
        phi -= (phi > C_TWO_PI) ? C_TWO_PI : 0;
        return phi;
    }

    function cart_x(r, t) {
        return Math.floor(r * Math.sin(clip_phi(t + C_COORD_SHIFT)));
    }

    function cart_y(r, t) {
        return Math.floor(r * Math.cos(clip_phi(t + C_COORD_SHIFT)));
    }

    function polar_r(x, y) {
        return Math.sqrt(x * x + y * y);
    }

    function polar_t(x, y) {
        // take shifted coordinate system into account
        return clip_phi(C_HALF_PI - Math.atan2(y, x) - C_COORD_SHIFT);
    }

    function segment(sector, ring) {

        let radius_min = (ring === 0) ? C_RING_MIN : C_RING_THICKNESS * ring + C_INNER_RING_ADDITION + C_RING_MIN;
        let radius_max = (ring + 1) * C_RING_THICKNESS + C_INNER_RING_ADDITION - C_RING_MIN;

        let delta = C_TWO_PI / valid_sector_ids.length;
        let phi_min = sector * delta;
        let phi_max = (sector + 1) * delta;

        let p_start_r = normal_between(radius_min + C_R_MIN_DIST, radius_max - C_R_MIN_DIST);
        let p_start_t = random_between(phi_min + C_PHI_MIN_DIST, phi_max - C_PHI_MIN_DIST);

        let c_start_x = cart_x(p_start_r, p_start_t);
        let c_start_y = cart_y(p_start_r, p_start_t);

        return {
            start_r: p_start_r,
            start_t: p_start_t,
            start_x: c_start_x,
            start_y: c_start_y,
            r_min: radius_min,
            r_max: radius_max,
            t_min: phi_min,
            t_max: phi_max,

            clip: function (d) {
                //console.log(`${d.id} clip R: ${d.seg.r_min} - ${d.seg.r_max} | ${d.r}`);
                //console.log(`${d.id} clip T: ${d.seg.t_min} - ${d.seg.t_max} | ${d.t}`);

                d.r = Math.min(Math.max(d.r, d.seg.r_min), d.seg.r_max);
                d.t = Math.min(Math.max(d.t, d.seg.t_min), d.seg.t_max);
                return;
            },
        }
    }

    function ticked() {
        blips.attr("transform", function (d) {

            d.r = polar_r(d.x, d.y);
            d.t = polar_t(d.x, d.y);

            d.seg.clip(d);

            d.x = cart_x(d.r, d.t);
            d.y = cart_y(d.r, d.t);

            return translate(d.x, d.y);
        })
    }

    // position each entry randomly in its segment
    valid_entries.forEach(entry => {
        entry.seg = segment(entry.sector, entry.ring);
        entry.r = entry.seg.start_r;
        entry.t = entry.seg.start_t;
        entry.x = entry.seg.start_x;
        entry.y = entry.seg.start_y;
        let col = config.colors.inactive;
        if (entry.active || config.print_layout) {
            col = (data.options.color_mode == "rings") ? config.rings[entry.ring].color : config.rings[entry.sector].color;
        }
        entry.color = col;
    });

    // partition entries according to segments
    let segmented = [];
    for (let sector = 0; sector < valid_sector_ids.length; sector++) {
        let seg = new Array(valid_ring_ids.length);
        for (let ring = 0; ring < valid_ring_ids.length; ring++) {
            seg[ring] = [];
        }
        segmented.push(seg);
    }

    valid_entries.forEach(entry => {
        segmented[entry.sector][entry.ring].push(entry);
    });

    // assign unique sequential id to each entry
    let id = 1;
    for (let sector = 0; sector < valid_sector_ids.length; sector++) {
        for (let ring = 0; ring < valid_ring_ids.length; ring++) {
            let entries = segmented[sector][ring];
            entries.sort(function (a, b) { return a.label.localeCompare(b.label); });
            entries.forEach(entry => { entry.id = `${id++}`; });
        }
    }

    let svg = d3.select("svg#" + config.svg_id)
        .style("background-color", config.colors.background)
        .attr("width", config.width)
        .attr("height", config.height);

    let radar = svg.append("g");
    radar.attr("transform", translate(config.width / 2, config.height / 2));

    let grid = radar.append("g");

    // draw grid lines
    for (let i = 0; i < valid_sector_ids.length; i++) {

        let r = C_TWO_PI / valid_sector_ids.length;

        let x = cart_x(C_RING_MAX, i * r);
        let y = cart_y(C_RING_MAX, i * r);

        grid.append("line")
            .attr("x1", 0).attr("y1", 0)
            .attr("x2", x).attr("y2", y)
            .style("stroke", config.colors.grid)
            .style("stroke-width", 1);
    }

    // background color. Usage `.attr("filter", "url(#solid)")`
    // SOURCE: https://stackoverflow.com/a/31013492/2609980
    let defs = grid.append("defs");
    let filter = defs.append("filter")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 1)
        .attr("height", 1)
        .attr("id", "solid");
    filter.append("feFlood")
        .attr("flood-color", "rgb(0, 0, 0, 0.8)");
    filter.append("feComposite")
        .attr("in", "SourceGraphic");

    // draw rings
    for (let i = 0; i < valid_ring_ids.length; i++) {
        grid.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", (i === (valid_ring_ids.length - 1)) ? C_RING_MAX : Math.ceil((i + 1) * C_RING_THICKNESS) + C_INNER_RING_ADDITION)
            .style("fill", "none")
            .style("stroke", config.colors.grid)
            .style("stroke-width", 1);
        if (config.print_layout) {
            grid.append("text")
                .text(data.rings[i].name)
                .attr("y", -(Math.ceil(C_RING_THICKNESS * (i + 0.42)) + C_INNER_RING_ADDITION))
                .attr("text-anchor", "middle")
                .style("fill", config.colors.grid_text)
                .style("font-family", config.font_families.sans_serif)
                .style("font-size", px(config.font_sizes.ring))
                .style("font-weight", "bold")
                .style("pointer-events", "none")
                .style("user-select", "none");
        }
    }

    // draw title and legend (only in print layout)
    if (config.print_layout) {

        // title
        radar.append("text")
            .attr("id", "heading")
            .text(data.title)
            .style("font-family", config.font_families.sans_serif)
            .style("font-size", px(config.font_sizes.heading))
            .style("font-weight", "bold")
            .style("fill", config.colors.emphasize);

        let h = d3.select("#heading");
        let len = h.node().getBBox().width;
        h.attr("transform", translate(-Math.floor(len / 2), -465));

        // subtitle
        radar.append("text")
            .attr("id", "subheading")
            .text(data.subtitle)
            .style("font-family", config.font_families.sans_serif)
            .style("font-size", px(config.font_sizes.subheading))
            .style("font-weight", "bold")
            .style("fill", config.colors.emphasize);

        h = d3.select("#subheading");
        len = h.node().getBBox().width;
        h.attr("transform", translate(-Math.floor(len / 2), -465 + config.font_sizes.heading));

        // footer

        radar.append("text")
            .attr("transform", translate(20, 450))
            .text("⚫ same    ⬛ new    ▲ moved in    ▼ moved out")
            .attr("xml:space", "preserve")
            .style("font-family", config.font_families.sans_serif)
            .style("font-size", px(config.font_sizes.footer));

        radar.append("text")
            .attr("transform", translate(-240, 450))
            .text("Made with Luxoft Radar Creator " + document.getElementById("version").innerText)
            .attr("xml:space", "preserve")
            .style("font-family", config.font_families.sans_serif)
            .style("font-size", px(config.font_sizes.footer));

        // legend
        const C_LEGEND_START_LEFT  = { x: -700, y: -465 };
        const C_LEGEND_START_RIGHT = { x:  450, y: -465 };

        const C_LEGEND_MID = Math.ceil(valid_sector_ids.length / 2);

        let legend_dynamic_offset = { x: 0, y: 0 };

        function legend_transform_dynamic(level) {

            switch (level) {
                case 1:
                    legend_dynamic_offset.y += config.font_sizes.legend_heading + 40;
                    break;
                case 2:
                    legend_dynamic_offset.y += config.font_sizes.legend_subheading + 10;
                    break;
                default:
                    legend_dynamic_offset.y += config.font_sizes.legend_item + 3;
                    break;
            }

            return translate(legend_dynamic_offset.x, legend_dynamic_offset.y);
        }

        function legend_fill_sector_info(sector) {
            // Sector name as heading
            legend.append("text")
                .attr("transform", legend_transform_dynamic(1))
                .text(data.sectors[sector].name)
                .style("font-family", config.font_families.sans_serif)
                .style("font-size", px(config.font_sizes.legend_heading))
                .style("font-weight", "bold")
                .style("fill", (data.options.color_mode == "rings") ? config.colors.emphasize : config.rings[sector].color);
        }

        function legend_fill_ring_info(sector) {

            let sector_empty = true;
            for (let ring = 0; ring < valid_ring_ids.length; ring++) {
                if ((data.options.show_headings_for_empty_sections) || (segmented[sector][ring].length > 0)) {
                    sector_empty = false;
                    // Ring name as heading
                    legend.append("text")
                        .attr("transform", legend_transform_dynamic(2))
                        .text((typeof data.rings[ring].name_for_legend === 'undefined') ? data.rings[ring].name : data.rings[ring].name_for_legend)
                        .style("font-family", config.font_families.sans_serif)
                        .style("font-size", px(config.font_sizes.legend_subheading))
                        .style("font-weight", "bold")
                        .style("fill", config.colors.emphasize)
                        .style("fill", (data.options.color_mode == "rings") ? config.rings[ring].color : config.colors.emphasize);

                    // Blip names
                    legend.selectAll(".legend" + sector + ring)
                        .data(segmented[sector][ring])
                        .enter()
                        .append("a")
                        .attr("href", function (d, i) {
                            return d.link ? d.link : "#";
                        })
                        .append("text")
                        .attr("transform", function (d, i) { return legend_transform_dynamic(3); })
                        .attr("class", "legend" + sector + ring)
                        .attr("id", function (d, i) { return "legendItem" + d.id; })
                        .text(function (d, i) { return d.id + ". " + d.label; })
                        .style("font-family", config.font_families.sans_serif)
                        .style("font-size", px(config.font_sizes.legend_item))
                        .on("mouseover", function (d) { showBubble(d); highlightLegendItem(d); })
                        .on("mouseout", function (d) { hideBubble(d); unhighlightLegendItem(d); });
                }
            }

            if (sector_empty) {
                legend.append("text")
                    .attr("transform", legend_transform_dynamic(2))
                    .text("---")
                    .attr("fill", config.colors.grid);
            }
        }

        let legend = radar.append("g");

        legend_dynamic_offset = C_LEGEND_START_LEFT;
        for (let sector = 0; sector < C_LEGEND_MID; sector++) {
            legend_fill_sector_info(sector);
            legend_fill_ring_info(sector);
        }

        legend_dynamic_offset = C_LEGEND_START_RIGHT;
        for (let sector = (valid_sector_ids.length - 1); sector >= C_LEGEND_MID; sector--) {
            legend_fill_sector_info(sector);
            legend_fill_ring_info(sector);
        }
    }

    // layer for entries
    let rink = radar.append("g")
        .attr("id", "rink");

    // rollover bubble (on top of everything else)
    let bubble = radar.append("g")
        .attr("id", "bubble")
        .attr("x", 0)
        .attr("y", 0)
        .style("opacity", 0)
        .style("pointer-events", "none")
        .style("user-select", "none");

    bubble.append("rect")
        .attr("rx", 4)
        .attr("ry", 4)
        .style("fill", config.colors.emphasize);
    bubble.append("text")
        .style("font-family", config.font_families.sans_serif)
        .style("font-size", px(config.font_sizes.bubble))
        .style("fill", config.colors.background);
    bubble.append("path")
        .attr("d", "M -12,0 3,0 15,15 z")
        .style("fill", config.colors.emphasize);

    function showBubble(d) {
        if (d.active || config.print_layout) {

            //let dbg_text =`[(${d.id}) '${d.label}'] S ${d.sector} R ${d.ring}, x ${d.x} y ${d.y} r ${Math.floor(d.r)} t ${Math.round(100* d.t)/100}`;

            let tooltip = d3.select("#bubble text")
                .text(d.label)
                //.text(dbg_text)
                .style("font-size", px(config.font_sizes.bubble));
            let bbox = tooltip.node().getBBox();
            d3.select("#bubble")
                .attr("transform", translate(d.x - bbox.width / 2 - 15, d.y - 25))
                .style("opacity", 0.99);
            d3.select("#bubble rect")
                .attr("x", -5)
                .attr("y", -bbox.height)
                .attr("width", bbox.width + 10)
                .attr("height", bbox.height + 6);
            d3.select("#bubble path")
                .attr("transform", translate(bbox.width / 2 - 5, 3));
        }
    }

    function hideBubble(d) {
        d3.select("#bubble")
            .attr("transform", translate(0, 0))
            .style("opacity", 0);
    }

    function highlightLegendItem(d) {
        if (config.print_layout) {
            let legendItem = document.getElementById("legendItem" + d.id);
            legendItem.setAttribute("filter", "url(#solid)");
            legendItem.setAttribute("fill", config.colors.background);
        }
    }

    function unhighlightLegendItem(d) {
        if (config.print_layout) {
            let legendItem = document.getElementById("legendItem" + d.id);
            legendItem.removeAttribute("filter");
            legendItem.removeAttribute("fill");
        }
    }

    // draw blips on radar
    let blips = rink.selectAll(".blip")
        .data(valid_entries)
        .enter()
        .append("g")
        .attr("class", "blip")
        .on("mouseover", function (d) { showBubble(d); highlightLegendItem(d); })
        .on("mouseout", function (d) { hideBubble(d); unhighlightLegendItem(d); });

    // configure each blip
    blips.each(function (d) {
        let blip = d3.select(this);

        // blip link
        if (!config.print_layout && d.active && d.hasOwnProperty("link")) {
            blip = blip.append("a")
                .attr("xlink:href", d.link);
        }

        // blip shape
        switch (d.moved) {
            case 1:
                blip.append("path")
                    .attr("d", "M -17,9 17,9 0,-21 z") // triangle pointing up
                    .style("fill", d.color);
                break;

            case -1:
                blip.append("path")
                    .attr("d", "M -18,-10 18,-10 0,21 z") // triangle pointing down
                    .style("fill", d.color);
                break;

            case 9:
                blip.append("path")
                .attr("d", "M -14,14 14,14 14,-14 -14,-14 z") // square
                .attr("fill", d.color);
                break;

            case 0:
            default:
                blip.append("circle")
                    .attr("r", C_BLIP_RADIUS)
                    .attr("fill", d.color);
                break;
        }

        // blip text
        if (d.active || config.print_layout) {
            let blip_text = config.print_layout ? d.id : d.label.match(/[a-z]/i);
            blip.append("text")
                .text(blip_text)
                .attr("y", 4)
                .attr("text-anchor", "middle")
                .style("fill", config.colors.blip_text)
                .style("font-family", config.font_families.sans_serif)
                .style("font-size", function (d) { return px(config.font_sizes.blip - (blip_text.length > 1 ? 1 : 0)) })
                .style("font-weight", "bold")
                .style("pointer-events", "none")
                .style("user-select", "none");
        }
    });

    // distribute blips, while avoiding collisions
    d3.forceSimulation()
        .nodes(valid_entries)
        .velocityDecay(0.85) // magic number (found by experimentation), was 0.29
        .force("collision", d3.forceCollide().radius(C_BLIP_CORE).strength(0.65))
        .on("tick", ticked);
}
