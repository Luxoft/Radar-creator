let ver_label = document.getElementById("version");
let version = ver_label.innerText;
ver_label.hidden = true;

let svg = document.getElementById("radarscreen");
let url = null;

const button_col = document.createElement('button');
button_col.innerText = "Toggle colored rings/sectors";
button_col.id = "colorToggle";
button_col.addEventListener("click", () => {
    if (svg) {
        while (svg.lastChild && svg.childElementCount > 1) {
            svg.removeChild(svg.lastChild);
        }
    }
    (radar_data.options.color_mode == "rings") ? radar_data.options.color_mode = "sectors" : radar_data.options.color_mode = "rings";
    radar_visualization(radar_config, radar_data);
});

const button_reload = document.createElement('button');
button_reload.innerText = "Reload radar";
button_reload.id = "reload";
button_reload.addEventListener("click", () => {
    window.location.reload();
});

const button_snapshot = document.createElement('button');
button_snapshot.innerText = "Download SVG";
button_snapshot.id = "snapshot";
button_snapshot.addEventListener("click", () => {
    if (svg) {
        let now = (new Date()).toString();
        svg_text = `<!--Created by Luxoft Radar Creator ${version} on ${now}-->\n<svg id=\"radarscreen\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" viewBox=\"0 0 1450 1200\" width=\"1450\" height=\"1000\" style=\"background-color: rgb(255, 255, 255);\"> ${svg.innerHTML} </svg>`;
        if (url != null) {
            window.URL.revokeObjectURL(url);
            url = null;
        }

        let blob = new Blob([svg_text], { type: "text/plain" });

        if (window.navigator.msSaveBlob) {
            window.navigator.msSaveBlob(blob, "Radar.svg");
        }
        else {
            let lnk = document.getElementById("download_link");
            url = window.URL.createObjectURL(blob);
            lnk.href = url;
            lnk.click();
        }
    }
});

document.body.appendChild(button_col);
//document.body.appendChild(button_reload);
document.body.appendChild(button_snapshot);

//const v = document.createTextNode("  " + version);
//document.body.appendChild(v)
