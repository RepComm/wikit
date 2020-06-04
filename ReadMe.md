# WiKiT
A modular HTML5 image editor written in JS

Reworking to fit things I've learned in the past months of coding

Implemented filters (no buttons to push yet)
- Grayscale
- Basic sobel edge
- Gaussian blur
- Gradient

Implemented classes:
- Kernel - advanced class for managing kernel instructions
- Tool - base class for all tools
- - Filter - for manual layer manipulation
- - - PixelFilter - for easy pixel manipulation
- - - - KernelFilter - for kernel and equation based manipulation
- - - MultiKernelFilter - for multi-kernel processing (needs rework)
- - Brush - for easy brush creation