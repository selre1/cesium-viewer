var createScene = async function (engine, canvas) {
    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new BABYLON.Scene(engine);

    const server = "https://patrickryanms.github.io/BabylonJStextures/Demos/waveShader/";

    // create camera and lights for scene
    const env = {};scene.debugLayer.show();
    const camera = {};
    const clearColor = new BABYLON.Color3.FromInts(56, 56, 58);
    async function initScene() {
        // color of scene when no skybox present
        scene.clearColor = clearColor;

        // standard ArcRotate camera
        camera.main = new BABYLON.ArcRotateCamera("camera", 0.728, 1.345, 35, new BABYLON.Vector3(0.32, -3.12, 0.26), scene);
        camera.main.minZ = 0.1;
        camera.main.wheelDeltaPercentage = 0.1;
        camera.main.attachControl(canvas, true);

        // add in IBL with linked environment
        env.lighting = BABYLON.CubeTexture.CreateFromPrefilteredData(server + "assets/env/studio.env", scene);
        env.lighting.name = "studioIBL";
        env.lighting.gammaSpace = false;
        env.lighting.rotationY = 2.3667;
        scene.environmentTexture = env.lighting;
        scene.environmentIntensity = 1.0;
    }   

    // create buttons
    let createButton = function(name, gridPos, value, container) {
        let button = BABYLON.GUI.Button.CreateSimpleButton("button", name);
        button.paddingTop = "30px";
        button.width = 0.7;
        button.height = "80px";
        button.color = "white";
        button.thickness = 1;
        button.background = "transparent";
        button.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        button.onPointerDownObservable.add(function() {
            meshesMats.straightWave.value = value;
        });
        container.addControl(button, gridPos.x, gridPos.y);  
    }

    // load or create meshes in scene
    const meshes = {};
    const meshParams = {};
    async function loadMeshes() {
        // load bars mesh
        meshes.barsAsset = await BABYLON.SceneLoader.AppendAsync(server + "assets/gltf/", "bars.glb", scene).then((results) => {
            for (let mesh of results.meshes) {
                if (mesh.name === "bars") {
                    meshes.bars = mesh;
                    meshParams.minX = mesh.getBoundingInfo().boundingBox.minimumWorld.x;
                    meshParams.maxX = mesh.getBoundingInfo().boundingBox.maximumWorld.x;
                    meshParams.minZ = mesh.getBoundingInfo().boundingBox.minimumWorld.z;
                    meshParams.maxZ = mesh.getBoundingInfo().boundingBox.maximumWorld.z;
                }
            }
        });  
    }

    // create materials for scene meshes
    // ignore textures embedded in shader when loading
    BABYLON.NodeMaterial.IgnoreTexturesAtLoadTime = true;
    const meshesMats = {};
    const textures = {};
    async function createMaterials() {
        // load texture for bar color randomization
        textures.barColor = new BABYLON.Texture(server + "assets/textures/barsColor_randomValue.png", scene, false, false, BABYLON.Texture.NEAREST_SAMPLINGMODE);
        textures.barColor.wrapU = textures.barColor.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;

        // node material for bars
        meshesMats.bars = new BABYLON.NodeMaterial("barsMat", scene);
        await meshesMats.bars.loadAsync(server + "assets/shaders/bars.json");
        meshesMats.bars.build(false);
        meshesMats.bars.transparencyMode = 0;

        // set bars material parameters
        meshesMats.bars.getBlockByName("baseColorTex").texture = textures.barColor;
        meshesMats.bars.getBlockByName("minX").value = meshParams.minX;
        meshesMats.bars.getBlockByName("maxX").value = meshParams.maxX;
        meshesMats.bars.getBlockByName("minZ").value = meshParams.minZ;
        meshesMats.bars.getBlockByName("maxZ").value = meshParams.maxZ;
        meshesMats.straightWave = meshesMats.bars.getBlockByName("straightWave");

        // assign material to bars
        meshes.bars.material = meshesMats.bars;
    }

    let rotation = -1;
    scene.onBeforeCameraRenderObservable.add(() => {
        // animate camera rotation
        rotation += 0.008;
        camera.main.alpha = Math.sin(rotation) * 0.00025 + camera.main.alpha;
    });

    // create UI
    const ui = {};
    function createUI() {
        // UI grid
        ui.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        ui.grid = new BABYLON.GUI.Grid("grid");
        ui.grid.addRowDefinition(1.0);
        ui.grid.addColumnDefinition(0.5);
        ui.grid.addColumnDefinition(0.5);
        ui.grid.height = 0.15;
        ui.grid.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        ui.grid.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        ui.advancedTexture.addControl(ui.grid);

        // create buttons
        createButton("Straight Wave", new BABYLON.Vector2(0, 0), 1.0, ui.grid);
        createButton("Circular Wave", new BABYLON.Vector2(0, 1), 0.0, ui.grid);    
    }           
    
    // scene logic
    initScene();
    await loadMeshes();
    await createMaterials();
    createUI();

    return scene;
};
export default createScene
