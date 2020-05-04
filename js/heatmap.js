var heatVertex = `
uniform sampler2D heightMap;
uniform float heightRatio;
uniform float alpha;
varying vec2 vUv;
varying float hValue;
void main() {
  vUv = uv;
  vec3 pos = position;
  hValue = texture2D(heightMap, vUv).r;
  pos.y = hValue * heightRatio;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.0);
}
`;
    
var heatFragment = `
varying float hValue;
uniform float alpha;

// honestly stolen from https://www.shadertoy.com/view/4dsSzr
vec3 heatmapGradient(float t) {
  return clamp((pow(t, 1.5) * 0.8 + 0.2) * vec3(smoothstep(0.0, 0.35, t) + t * 0.5, smoothstep(0.5, 1.0, t), max(1.0 - t * 1.7, t * 7.0 - 6.0)), 0.0, 1.0);
}

void main() {
  gl_FragColor = vec4(heatmapGradient(hValue), alpha) ;
}
`;  

class Heatmap {

    createHeightMap(width, height, min, max, values) {
        
        var size = width * height;
        var data = new Uint8Array( 3 * size );

        var minMaxDiff = Math.abs(max - min);
        
		for(let i = 0; i < width; i++){
			for(let j = 0; j < height; j++){
				var a = values[i + j * width] == undefined ? 0 : (values[i + j * width] - min) / minMaxDiff * 255;
				data[(i + (height - 1 - j) * width) * 3] = a;
				data[(i + (height - 1 - j) * width) * 3 + 1] = a;
				data[(i + (height - 1 - j) * width) * 3 + 2] = a;
			}
        }
        
		return new THREE.DataTexture( data, width, height, THREE.RGBFormat );
    }

    constructor(dimensions, divisions, width, height, min, max, values, axislabels, labels, scene) 
    {
		this.alpha = 0.6;

		this.width = width;
		this.height = height;

        var planeGeometry = new THREE.PlaneBufferGeometry(dimensions[0], dimensions[2], width-1, height-1);
		planeGeometry.rotateX(-Math.PI * 0.5);

		this.mesh = new THREE.Mesh(planeGeometry, new THREE.ShaderMaterial({
		uniforms: {
			heightMap: {value: this.createHeightMap(width, height, min, max, values)},
			heightRatio: {value: dimensions[1]},
			alpha: {value: this.alpha}
		},
		vertexShader: heatVertex,
		fragmentShader: heatFragment,
		transparent: true,
		side: THREE.DoubleSide
        }));

        
        scene.add(this.mesh);
        
			
		this.gridXY = new Grid( [dimensions[1], dimensions[0]], [ labels[1].length - 1, labels[0].length - 1], axislabels[1], 'rgb(0,200,0)', min, max);
		this.gridXY.rotation.x = THREE.Math.degToRad(90);
		this.gridXY.rotation.y = THREE.Math.degToRad(90);
		this.gridXY.position.z -= dimensions[2] / 2;
		this.gridXY.position.y += dimensions[1] / 2;

        this.gridXZ = new Grid( [dimensions[0], dimensions[2]], [labels[0].length - 1, divisions[2]], axislabels[0], 'rgb(200,0,0)', labels[0]);
        this.gridXZ.position.y = 0;

		this.gridYZ = new Grid( [dimensions[2], dimensions[1]], [divisions[2], labels[1].length - 1], axislabels[2], 'rgb(0,0,200)', labels[1]);
		this.gridYZ.rotation.z = THREE.Math.degToRad(90);
		this.gridYZ.rotation.y = THREE.Math.degToRad(180);
		this.gridYZ.rotation.x = THREE.Math.degToRad(90);
		this.gridYZ.position.x -= dimensions[0] / 2;
        this.gridYZ.position.y += dimensions[1] / 2;
        

		scene.add( this.gridXY );
		scene.add( this.gridXZ );
		scene.add( this.gridYZ );
	}

	updateHeightmap(labelname, min, max, values) {
		this.mesh.material.uniforms.heightMap.value = this.createHeightMap(this.width, this.height, min, max, values);
		updateLabels(this.gridXY, labelname, min, max);
	}
	
	remove() {
		scene.remove(this.mesh);
		removeLabels(this.gridXY);
		removeLabels(this.gridXZ);
		removeLabels(this.gridYZ);
		scene.remove( this.gridXY );
		scene.remove( this.gridXZ );
		scene.remove( this.gridYZ );
	}
}