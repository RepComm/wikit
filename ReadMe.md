# WiKiT
A modular HTML5 image editor written in JS

Reworking to fit things I've learned in the past months of coding

Implemented filters
- Grayscale
- Basic sobel edge
- Gaussian blur
- Gradient

Implemented classes:
- Component - Centralized UI creation/modification (I can't stand using libraries..)
- Input - Event based and procedural functionality
- Kernel - For creating / updating image kernels
- Tool - base class for all tools
- - Filter - for manual layer manipulation
- - - PixelFilter - for easy pixel manipulation
- - - - KernelFilter - for kernel and equation based manipulation
- - - MultiKernelFilter - for multi-kernel processing (needs rework)
- - Brush - for easy brush creation