import { 
  Object3D,
  Mesh,
  BufferGeometry,
  BufferAttribute,
  MeshPhysicalMaterial,
  MeshBasicMaterial,
  CompressedTexture,
  Loader,

  RGBA_ASTC_8x8_Format,
  RGB_S3TC_DXT1_Format,
  UnsignedByteType,
  UVMapping,
  ClampToEdgeWrapping,
  LinearFilter,
  sRGBEncoding,
  LinearEncoding,
} from 'three';
import { VolumetricPlayer4DViews } from './4dviews.js';

class Volumetric4DViewsLoader extends Loader {
  constructor(workerScriptURL='4dviews-worker.js') {
    super();
    this.workerScriptURL = workerScriptURL;
  }
  setWorkerScriptURL(workerScriptURL) {
    this.workerScriptURL = workerScriptURL;
  }
  load(src, onLoad, onError, onProgress) {
    if (src) {
      let obj = new Volumetric4DViewsMesh(this.workerScriptURL);
      return obj.load(src, onLoad, onError, onProgress)
    }
  }
}

class Volumetric4DViewsMesh extends Object3D {
  constructor(workerScriptURL='') {
    super();
    this.workerScriptURL = workerScriptURL;
  }
  load(src, onLoad, onError, onProgress) {
    return new Promise((resolve, reject) => {
      if (src) {
        this.player = new VolumetricPlayer4DViews(this.lighting, this.workerScriptURL);
        //console.log('created 4dviews player', this.player, this.workerScriptURL, onLoad);
        this.player.load(src);//.then(ev => this.play(ev));
        this.player.addEventListener('frame', (ev) => this.handleFrame(ev, resolve));
        if (onLoad) { onLoad(this); }
      }
    });
  }
  play() {
    if (this.player) this.player.play();
  }
  pause() {
    if (this.player) this.player.pause();
  }
  stop() {
    if (this.player) this.player.stop();
  }
  handleLoad(ev) {
  }
  handleFrame(ev, resolve) {
    //console.log('new frame', ev);
    if (!this.mesh) {
      this.createMesh(ev.detail, resolve);
    } else {
      this.updateMesh(ev.detail);
    }
  }
  createMesh(meshdata, resolve) {
    let seq = this.player.sequenceInfo;

    let geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(meshdata.vertices, 3));
    geometry.setAttribute('normal', new BufferAttribute(meshdata.normals, 3));
    geometry.setAttribute('uv', new BufferAttribute(meshdata.uvs, 2));
    geometry.setIndex(new BufferAttribute(meshdata.indices, 1));
    geometry.dynamic = true;

    let textureFormat = (seq.TextureEncoding == 164 ? RGBA_ASTC_8x8_Format : RGB_S3TC_DXT1_Format);
    let texture = new CompressedTexture(null, seq.TextureSizeX, seq.TextureSizeY,
            textureFormat, UnsignedByteType, UVMapping,
            ClampToEdgeWrapping, ClampToEdgeWrapping,
            LinearFilter, LinearFilter);

    texture.encoding = sRGBEncoding;
    let material = (this.lighting ? new MeshPhysicalMaterial({ map: texture }) : new MeshBasicMaterial({ map: texture }));
    //let material = new MeshBasicMaterial({ color: 0xff0000 })

    this.textureSizeX = seq.TextureSizeX;
    this.textureSizeY = seq.TextureSizeY;

    /* Adding the 3D model */
    this.mesh = new Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.rotation.x = -Math.PI / 2;

    this.add(this.mesh);
    resolve(this);
    return this.mesh;
  }
  updateMesh(meshdata) {
//console.log(this.mesh, meshdata, this);
    let geometry = this.mesh.geometry,
        material = this.mesh.material,
        texture = material.map;

    if (geometry.boundingSphere) {
      geometry.boundingSphere.radius = meshdata.radius;
    }

    geometry.attributes.position.array = meshdata.vertices;
    geometry.attributes.normal.array = meshdata.normals;
    geometry.attributes.uv.array = meshdata.uvs;
    geometry.index.array = meshdata.indices;

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.normal.needsUpdate = true;
    geometry.attributes.uv.needsUpdate = true;
    geometry.index.needsUpdate = true;

    geometry.setDrawRange(0, meshdata.numfaces * 3);

//console.log(this.player.sequenceInfo.TextureSizeY);
    if (texture) {
      var mipmap = { "data": meshdata.texture, "width": this.player.sequenceInfo.TextureSizeX, "height": this.player.sequenceInfo.TextureSizeY };

      //console.log('update texture', texture, mipmap, this.player.sequenceInfo.TextureSizeX, this.player.sequenceInfo.TextureSizeY, meshdata.texture);
      texture.mipmaps = [mipmap];
      texture.needsUpdate = true
      material.needsUpdate = true;
    }
    //this.refresh();
    //this.dispatchEvent(new CustomEvent('change'));
  }
}

export { Volumetric4DViewsLoader };
