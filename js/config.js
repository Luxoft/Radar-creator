// Config file for Radar.html
//
// No need for changes here if only data is updated.

radar_config = {

    svg_id: "radarscreen",

    width: 1450,
    height: 1000,

    rings: [ // Luxoft accent colors
        { color: "#ED9B33"}, // Orange
        { color: "#00968F"}, // Bright Teal
        { color: "#FFCD00"}, // Gold
        { color: "#00A3E1"}, // Bright Blue
        { color: "#6CC24A"}, // Green
        { color: "#003A79"}, // Navy
        { color: "#6056E9"}, // Cobalt Blue
        { color: "#969696"}, // Medium Gray
        { color: "#006975"}, // Dark Teal
        { color: "#330072"}, // Dark Purple
        { color: "#F9F048"}, // Yellow
        { color: "#8B0000"}  // Dark Red
      ],

    colors: {
        emphasize: "#5F249F", // Luxoft Bright Purple
        background: "#FFFFFF",  // White
        blip_text: "#FFFFFF", // White
        grid: "#B0B0B0", // Some Gray
        grid_text: "#E5E5E5",
        inactive: "#D9D9D6" // Light Gray
    },

    font_sizes: {
        heading: 34,
        subheading: 24,
        ring: 34,
        blip: 14,
        legend_heading: 24,
        legend_subheading: 16,
        legend_item: 16,
        footer: 12,
        bubble: 15,
    },

    font_families: {
        sans_serif: "Arial, Helvetica",
    },

    print_layout: true
};