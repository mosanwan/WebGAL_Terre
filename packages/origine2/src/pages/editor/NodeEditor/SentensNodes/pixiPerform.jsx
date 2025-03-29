import React, {memo} from "react";
import Pixi from "@/pages/editor/GraphicalEditor/SentenceEditor/PixiPerform";
import {Handle, Position} from "@xyflow/react";
import MyNodeToolbar from "@/pages/editor/NodeEditor/SentensNodes/MyNodeToolbar";

export default memo(({data})=>{
  return(
    <div className="IntroContainer">
      <h2>使用特效</h2>
      <MyNodeToolbar data={data}/>
      <Pixi VerticalMode={true} sentence={data.sentence} onSubmit={data.onSubmit} index={data.index}/>
      <Handle type="target"
        position={Position.Left}
        onConnect={(params) => console.log('handle onConnect', params)}
        isConnectable={true} />
      <Handle
        type="source"
        position={Position.Right}
        id="b"
        isConnectable={true}
      />
    </div>
  );
});
