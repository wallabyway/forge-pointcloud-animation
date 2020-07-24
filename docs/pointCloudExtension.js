let time = 0;

class PointCloudExtension extends Autodesk.Viewing.Extension {
    load() {
        this.points = this.initPointCloudShader(200, 200);
        this.points.scale.set(150.0, 150.0, 150.0);

        // add to Forge Viewer scene
        this.viewer.impl.createOverlayScene('pointclouds');
        this.viewer.impl.addOverlay('pointclouds', this.points);

        // add animation event loop for updating point-cloud positions and colors
        this.viewer.addEventListener(Autodesk.Viewing.RENDER_PRESENTED_EVENT, e => {
            this.update(e)
        });
        return true; // true = loaded ok
    }

    unload() {}

    initGeometryBuffer(width, length) {
        let numPoints = width * length;
        let positions = new Float32Array(numPoints * 3);
        let colors = new Float32Array(numPoints * 3);
        let color = new THREE.Color();
        let k = 0;
        for (var i = 0; i < width; i++) {
            for (var j = 0; j < length; j++) {
                const u = i / width;
                const v = j / length;
                positions[3 * k] = u - 0.5;
                positions[3 * k + 1] = v - 0.5;
                color.setHSL(u, v, 0.5);
                color.toArray(colors, k * 3);
                k++;
            }
        }
        let geometry = new THREE.BufferGeometry();
        geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.computeBoundingBox();
        geometry.isPoints = true; // This flag will force Forge Viewer to render the geometry as gl.POINTS
        this.geometry = geometry;
    }


    // UPDATE POINTS, both COLOR and POSITION
    update(e) {
        // COLOR: this is how to change the color of a point
        for (var i = 0; i < this.points.geometry.attributes.color.length; i++) {
            this.points.geometry.attributes.color.array[i] += Math.sin(time + i / 100.) / 50.;
        }
        this.points.geometry.attributes.color.needsUpdate = true;

        //POSITION: this is how to update the position of an existing point
        for (var i = 0; i < this.points.geometry.attributes.position.length / 3; i++) {
            let u = (i % 200) * 0.04;
            let v = (i / 200);
            this.points.geometry.attributes.position.array[i * 3 + 2] = (Math.cos(time / 10. + u * Math.PI) + Math.sin(v * Math.PI / 25.)) / 20.;
        }
        this.points.geometry.attributes.position.needsUpdate = true;

        // finally, trigger a render frame
        this.viewer.impl.invalidate(true, false, true);
        time++; // and time-step our animation, for effect
    }


    initPointCloudShader(width, length) {
        this.initGeometryBuffer(width, length);

        // create a custom THREE.js point-cloud Material with a sprite and tint.  
        var material = new THREE.ShaderMaterial({
            uniforms: {
                sprite: { value: THREE.ImageUtils.loadTexture("./particle.png"), type: 't'}, // this changes the sprite. black is made transparent 
                size: { value: 60.0, type: 'f'}, // this changes the size of the sprite w.r.t. to the Revit Building
            },
            // where the point size is determined
            vertexShader: `
                uniform float size;
                varying vec3 vColor;

                void main() {
                    vColor = color;
                    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
                    gl_PointSize = size * ( size / (length(mvPosition.xyz) + 0.00001) );
                    gl_Position = projectionMatrix * mvPosition;
                }`,

            // where the sprite and tint is turned into pixels
            fragmentShader: `
                uniform sampler2D sprite;
                varying vec3 vColor;

                void main() {
                    gl_FragColor = vec4(vColor, 1.0 ) * texture2D( sprite, gl_PointCoord );
                    if (gl_FragColor.x < 0.1) discard;
                }`,
            vertexColors: true,
        });

        return new THREE.PointCloud(this.geometry, material);
    }

}

Autodesk.Viewing.theExtensionManager.registerExtension('PointCloudExtension', PointCloudExtension);