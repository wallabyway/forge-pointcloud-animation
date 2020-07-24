# forge-pointcloud-animation
animation point-clouds for simulation data

this demo shows how to update the position and color each point, per frame, used for simulation demo.

#### DEMO:  https://wallabyway.github.io/forge-pointcloud-animation/


![forge-points-anim](https://user-images.githubusercontent.com/440241/88244256-1e858580-cc48-11ea-9729-3feac3df0912.gif)


## Smoother Animation:

Simulation's require smooth animation of points.  In order to achieve maximum frame-rate in ForgeViewer, you need to switch off FX (like SAO, Line-Edges, ground-shadow and background-environment).

Click the "smooth animation" button to see the speed up change, or watch this 60fps video:


#### VIDEO: https://youtu.be/xLJLIvRaBhc

See the function `activate_butterySmoothAnimation()` to see the changes:

```
function activate_butterySmoothAnimation() {
    // reduce heavy fragment shader stuff
    viewer.setQualityLevel(false, true); // turn off ambient occlusion fragment shader
    viewer.impl.toggleEnvMapBackground(false); // reduce the effort on your fragment shader.

    // reduce draw calls
    viewer.impl.toggleGroundShadow(false); // turn off that ground shadow render pass
    viewer.setDisplayEdges(false); // don't render edge lines in AEC buildings.  this is a big one.

    // Switch to perspective (seems faster), and zoom in a little
    viewer.impl.camera.toPerspective();
    viewer.setFOV(50);
    viewer.fitToView([5536, 7012]);
}
```


The point-cloud uses a sprite (particle.png) and taints the color:
![points](https://user-images.githubusercontent.com/440241/88243455-4c1cff80-cc45-11ea-91e1-de1d74faae44.jpg)

