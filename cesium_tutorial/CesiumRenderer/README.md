[**reference link**](https://cesium.com/blog/2015/05/15/graphics-tech-in-cesium-architecture/)
## WebGL in Cesium ==> Renderer

 Cesium is built on a custom WebGL engine - the Renderer - that we started developing in March 2011 when the WebGL 1.0 spec was released.

## Why a Renderer
the benefits of centralizing WebGL calls in the Renderer:
- Ease of use: The Renderer provides a higher level of abstraction than WebGL so it makes the rest of Cesium concise and less error-prone.
- Shader Pipeline: **Cesium’s use cases require a runtime shader pipeline for generating shaders, and a GLSL library of uniforms and functions. This is part of the Renderer.**
- Performance: Optimizations and best practices such as caching and minimizing WebGL calls are applied in one place and the rest of Cesium benefits.
- State: WebGL is a state machine and the Renderer manages the state in one place.
- Portability: The Renderer makes it easy (well, easier) to add WebGL extensions, upgrade to WebGL 2, and add workarounds for specific platforms.

## What’s in the Renderer
![img](https://images.prismic.io/cesium/2015-05-15-0.jpg?auto=compress%2Cformat&w=736)<br/>
Check out the source in the Source/Renderer directory. If you use these types in your Cesium apps, be warned that they are not part of Cesium’s public API so they may change from release to release.
<br/>

The objects in the left column form the basis for Cesium’s DrawCommand, which atomically encapsulates a draw call. To render a frame, Cesium executes commands in the potentially visible set.

- VertexArray - a container with a set of vertex attributes and optional indices. Attributes and indices are stored in Buffers. Vertex array uses the OES_vertex_array_object extension when available to reduce the number of WebGL calls.
- RenderState - contains the WebGL fixed-function state, such as the depth, blending, and stencil states, needed to issue a draw call. This is a coarse-grained representation of WebGL’s fine-grained states that actually maps well to today’s GPUs and should be easy to update if a Vulkan-like API comes to the web.
- ShaderProgram - represents a compiled/linked program and its uniforms. Uniforms work directly with Cesium’s matrix, Cartesian, color, texture, and cube map types.
- Framebuffer - a container with texture/renderbuffer attachments that is the target of a draw call.

## <font color=red>**Shader Pipeline**</font>
GLSL built-ins can reference other built-ins forming a Directed Acyclic Graph (DAG).
[True Equator Mean Equinox](./True_Equator_Mean_Equinox.md)