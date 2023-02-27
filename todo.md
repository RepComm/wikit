
# todo

## renderer
Implement layers
- layer: quad/texture or scene graph which can be modified and then finally baked into a texture

Implement brushes
- brush: draws quads w/ specific texture onto scene, either saved in scene layer or baked into texture later after brush pass finishes
  - should provide different blending modes, possible via shader, that allows overlapping quad textures to 'extend' each other instead of adding alpha channels and looking dumb
  - image array support
  - math function for generating the brush stroke (prebake) support
  - [possible] quad GLSL texture (prebake) support
  - quads should be instances for performance, allowing complicated brush strokes with low memory/bus footprint
  - instancing still provides ability to do dynamic coloring per quad during stroke, as well as size variation

Implement layer effects
- post processing (post-bake)
  - raw GLSL user-mode effects
  - built-in GLSL powered effects: separable blur, bloom, edge detection

## interface
Pencil pencil support - https://developer.mozilla.org/en-US/docs/Web/API/Touch/force
- drawing tablets/etc

