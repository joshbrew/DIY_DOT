## Diffuse Optical Tomography sim

Simulating paths and overlaps for LED and photodiode arrays, and simulating volumetric data. WIP web driver project for the 16 channel headset.

![Capture](https://github.com/joshbrew/DIY_DOT/assets/18196383/ba0c25dc-667e-4840-8525-402499500da7)

NodeJS web app.

`npm i -g tinybuild` or `npm i tinybuild`

then 

`npm start` or `tinybuild`

Then find the local server link in the terminal.


## TODO

- Add a head and brain model for zest
- Connect live data and calibrate the visual further.
- Make the light paths more accurate and diffuse to cover wider volumes. Amplify the representation of fainter readings deeper in for a better image.
- Only require voxel generation the first time with a loading indicator, then save all of the generated indices in IndexedDB so we don't need to iterate the entire sphere with box meshes again. Include something pregenerated as an asset and just check if your parameters match up to decide if to regenerate the model.
- Also do 2D representation
