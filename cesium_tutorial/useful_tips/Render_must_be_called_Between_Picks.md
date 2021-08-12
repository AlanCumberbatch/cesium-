Render must be called between picks.<br>
There is a decrease in performance when enabled. There are extra draw calls to write depth for translucent geometry.<br>
<br>
@example<br>
// picking the position of a translucent primitive<br>
viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(movement) {<br>
&emsp;&emsp;&emsp;var pickedFeature = <font color=red>viewer.scene.pick</font>(movement.position);<br>
&emsp;&emsp;&emsp;if (!Cesium.defined(pickedFeature)) {<br>
&emsp;&emsp;&emsp;&emsp;~~// nothing picked~~<br>
&emsp;&emsp;&emsp;&emsp;eturn;<br>
&emsp;&emsp;&emsp;}<br>
&emsp;&emsp;&emsp;<font color=red>viewer.scene.render();</font><br>
&emsp;&emsp;&emsp;var worldPosition = viewer.scene.pickPosition(movement.position);<br>
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);<br>