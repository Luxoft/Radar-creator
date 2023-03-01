// Data structure for Radar.html
//
// How-to:
//
// 1. Fill in the title
// 2. Name the segments (max. 12)
// 3. Name the rings (max. 12)
// 4. Fill in the entries (set sector_id, ring_id, label, move)
// 5. Save file
// 6. Open Radar.html
//

radar_data = {

// 1 TITLE
// -------
//
  title: "Luxoft Radar Creator Example",
  subtitle: "Example data, just for testing",

// 2 SECTORS
// -----------
// The sectors, anti-clockwise, beginning at 12 o'clock (north)
//
  sectors: [
    { id: "A", name: "A-sector" , },
    { id: "B", name: "B-sector", },
    { id: "C", name: "C-sector", },
    { id: "D", name: "D-sector", },
    { id: "E", name: "E-sector", },
    { id: "F", name: "F-sector", },
  ],

// 3 RINGS
// -------
// The rings (innermost to outermost)
//
  rings: [
    { id: "now", name: "Now" },
    { id: "2", name: "Second ring"},
    { id: "3", name: "Third ring" },
    { id: "horizon", name: "Horizon"},
  ],

// 4 ENTRIES
// ---------
// For each entry define:
// - sector_id: id of the angular position (see sectors definition for id)
// - ring_id:   id of the radial position (see rings definition for id)
// - label:     Text for legend and tooltip
// - moved:     0 = not moved, 1 = moved up, -1 = moved down
//
// Optional properties:
// - active:   true or false (only taken into account if print_layout is set to false)
// - link:     An external link
//
  entries: [

       { sector_id: "A", ring_id: "now", label: "Innermost of A", moved: 0},
       { sector_id: "A", ring_id: "2", label: "A on the second ring", moved: 0},
       { sector_id: "B", ring_id: "2", label: "B on the second ring", moved: 0},
       { sector_id: "B", ring_id: "2", label: "B on 2 moved in", moved: 1},
       { sector_id: "C", ring_id: "2", label: "C on 2 moved out", moved: -1},
       { sector_id: "C", ring_id: "3", label: "C3 blip", moved: 0},
       { sector_id: "D", ring_id: "now", label: "Innermost of D", moved: 0},
       { sector_id: "D", ring_id: "horizon", label: "D on the horizon", moved: 0},
       { sector_id: "E", ring_id: "3", label: "First E3", moved: 0},
       { sector_id: "E", ring_id: "3", label: "Second E3", moved: 0},
       { sector_id: "F", ring_id: "now", label: "Innermost of F", moved: 0},
       { sector_id: "F", ring_id: "2", label: "F2 blip", moved: 0},
       { sector_id: "F", ring_id: "3", label: "F3 blip", moved: 0},
       { sector_id: "F", ring_id: "horizon", label: "F on the horizon", moved: 0},
  ],

  options: {
    color_mode: "rings", //rings or sectors,
    show_headings_for_empty_sections: false,
    inner_ring_addition: 0.1,
  },
};
