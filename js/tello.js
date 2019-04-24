/*
    BIBLIOTECA Tello3D
    
    ESTA CLASSE IMPLEMENTA OS RECURSOS DO THREE
    PARA FACILITAR O USO DOS MESMOS
*/

var renderer;
var scene;
var camera;

var droneMesh;

var droneFrames;

var path;

class Tello {
    constructor(canvas, cor) {
        //RENDERER
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true
        });
        this.renderer.setClearColor(0x000000);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        //SCENE
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f0f0);
        this.droneFrames = new Array();
        this.novaCamera();
        this.novoDrone();
        if(cor == null) {
            cor = 0xCECECE;
        }
        this.novoPlano(window.innerWidth / 10, cor);
        this.novasLuzes();
    }
    novaCamera(posx, posy, posz) {
        //CAMERA
        this.camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 3000);
        if (posx == null || posy == null || posz == null) {
            this.camera.position.set(0,30,-100);
        } else {
            this.camera.position.set(posx, posy, posz);
        }
    }
    novoPlano(width, cor) {
//         ROOM
        var helper = new THREE.GridHelper(100,20);
        helper.position.y = 0;
        helper.position.z = 0;
        helper.material.opacity = 0.25;
        helper.material.transparent = true;
        this.scene.add(helper);
        
        return this.scene;
    }
    novasLuzes() {
        //LIGHTS
        var ambient_light = new THREE.AmbientLight(0xf0f0f0, 1);
        this.scene.add(ambient_light);

        var light = new THREE.SpotLight( 0xffffff, 1.5 );
        light.position.set( 0, 150, 20);
        light.castShadow = true;
        light.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 70, 1, 200, 2000 ) );
        light.shadow.bias = - 0.000222;
        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;
        this.scene.add(light);

        var spotLight = new THREE.SpotLight(0xffffff, 0.2);
        spotLight.position.set(0,0,10);
        spotLight.penumbra = 0.1;
        spotLight.lookAt(new THREE.Vector3(0,10,-60));
        this.scene.add(spotLight);
        
        return this.scene;
    }
    novoDrone() {
        var geometry = new THREE.CubeGeometry(8, 2, 8);
        var material = new THREE.MeshPhysicalMaterial({
            color: 0x32A4D5
        });
        
        this.droneMesh = new THREE.Mesh(geometry, material);
        
        this.droneMesh.position.set(0, 1, 0);
        this.droneMesh.receiveShadow = false;
        this.droneMesh.castShadow = true;
        
        this.droneFrames.push(this.droneMesh);

        this.scene.add(this.droneMesh);
    }
    rotateObject(object, degreeX=0, degreeY=0, degreeZ=0) {
       object.rotateX(THREE.Math.degToRad(degreeX));
       object.rotateY(THREE.Math.degToRad(degreeY));
       object.rotateZ(THREE.Math.degToRad(degreeZ));
    }
    setPositionFrame(cor){
        var geometry = new THREE.CubeGeometry(8, 2, 8);
        var material = new THREE.MeshPhysicalMaterial({
            color: cor,
            transparent: true,
            opacity: 0.4
//            color: 0x32A400
        });
        let frameDrone = new THREE.Mesh(geometry, material);
        frameDrone.position.set(this.droneMesh.position.x, this.droneMesh.position.y, this.droneMesh.position.z);
        frameDrone.rotation.set(this.droneMesh.rotation.x, this.droneMesh.rotation.y, this.droneMesh.rotation.z);
        let pos = this.droneFrames.push(frameDrone) - 1;
        this.scene.add(this.droneFrames[pos]);
    }
    deletePositionFrame(){
        this.scene.remove(this.droneFrames[this.droneFrames.length - 1]);
        this.droneFrames.pop();
    }
    deleteAllFrames(){
        for(let i = this.droneFrames.length - 1; i > 0; i--){
            this.scene.remove(this.droneFrames[i]);
            this.droneFrames.pop();
        }
    }
    desenharPercurso(){
        let obj = this.scene.getObjectByName('percurso');
        this.scene.remove(obj);
        var geo = new THREE.Geometry();
        var mat = new THREE.LineBasicMaterial({
            color: 0x333333,
            linewidth: 50, // in pixels
        } );
        for(let pos in this.droneFrames){
            if(pos > 0)
                geo.vertices.push(this.droneFrames[pos].position);
        }
        var line = new THREE.Line(geo, mat);
        line.name = 'percurso';
        this.scene.add(line);
    }
};