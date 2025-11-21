import CesiumHandler from "./CesiumHandler.js";

$(async function () {
    const app = await CesiumHandler.init("viewerRoot", {
        tilesetUrl: "http://175.116.181.151:29090/3d-tileset/02_draco_glb/tileset.json",
        propertyUrls: [
        "http://175.116.181.151:29090/3d-tileset/properties/combined_properties.json"
        ]
    });
    
})