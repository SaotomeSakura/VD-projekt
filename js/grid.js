function Grid( size, divisions, labelname, mainColor, minVal, maxVal) {

	this.divisions = divisions;

	var color1 = new THREE.Color( 0x222222 );
	var color2 = new THREE.Color( 0x666666 );

	divisions[0] = (maxVal == undefined ? minVal.length - 1 : divisions[0]);
	var step = [size[0] / divisions[0], size[1] / divisions[1]];
	var halfSize = [size[0] / 2, size[1] / 2];

	var vertices = [], colors = [];

	protrusion = 3;

	var threeMainColor = new THREE.Color(mainColor);

    var j = 0;
	for ( var i = 0, k = - halfSize[1]; i <= divisions[1]; i ++, k += step[1] ) {
		
		vertices.push( - halfSize[0], 0, k, halfSize[0] + (i == divisions[1] ? protrusion : 0) + 1, 0, k );

		var color = (i == 0 || i == divisions[1] ? (i == 0 ? color1 : threeMainColor) : color2);

		color.toArray( colors, j ); j += 3;
		color.toArray( colors, j ); j += 3;
    }
    
	for ( var i = 1, k = - halfSize[0] + step[0]; i <= divisions[0]; i ++, k += step[0] ) {

		vertices.push( k, 0, - halfSize[1], k, 0, halfSize[1] + 1 );

		var color = (i == 0 || i == divisions[0] ? color1 : color2);

		color.toArray( colors, j ); j += 3;
		color.toArray( colors, j ); j += 3;
	}

	var geometry = new THREE.BufferGeometry();
	geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
	geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

	var material = new THREE.LineBasicMaterial( { vertexColors: true } );

	THREE.LineSegments.call( this, geometry, material );
	
	var div = document.createElement( 'div' );
	div.className = 'label';
	div.textContent = labelname;
	div.style.marginTop = '-1em';
	div.style.fontSize = '15px';
	div.style.color = mainColor;
	this.label = new THREE.CSS2DObject( div );
	this.add(this.label);

	this.label.translateX(halfSize[0] + protrusion);
	this.label.translateY(-1);
	this.label.translateZ(halfSize[1]);
	
	this.smallLabels = new Array(divisions[0]);
	var q = (maxVal == undefined ? 0 : Math.abs(maxVal - minVal) / divisions[0]);
	for ( var i = 0, k = - halfSize[0]; i <= divisions[0]; i ++, k += step[0] ) {

		var div2 = document.createElement( 'div' );
		div2.className = 'label';
		div2.textContent = maxVal == undefined ? minVal[i] : minVal + i * q;
		div2.style.marginTop = '1em';
		div2.style.fontSize = '12px';
		div2.style.color = 'rgb(32,32,32)';
		this.smallLabels[i] = new THREE.CSS2DObject( div2 );
		this.add(this.smallLabels[i]);

		this.smallLabels[i].translateZ(halfSize[1] + 2);
		this.smallLabels[i].translateY(-1);
		this.smallLabels[i].translateX(k);
	}
}

function removeLabels(grid) {
	grid.remove(grid.label);
	for (let i = 0; i <= grid.divisions[0]; ++i)
		grid.remove(grid.smallLabels[i]);
}

function updateLabels(grid, labelname, minVal, maxVal) {
	var q = (maxVal == undefined ? 0 : Math.abs(maxVal - minVal) / grid.divisions[0]);
	for (let i = 0; i <= grid.divisions[0]; ++i)
		grid.smallLabels[i].element.textContent = maxVal == undefined ? minVal[i] : minVal + i * q;

	grid.label.element.textContent = labelname;
}

Grid.prototype = Object.assign( Object.create( THREE.LineSegments.prototype ), {

	constructor: Grid,

	copy: function ( source ) {

		THREE.LineSegments.prototype.copy.call( this, source );

		this.geometry.copy( source.geometry );
		this.material.copy( source.material );

		return this;

	},

	clone: function () {

		return new this.constructor().copy( this );

	}

} );