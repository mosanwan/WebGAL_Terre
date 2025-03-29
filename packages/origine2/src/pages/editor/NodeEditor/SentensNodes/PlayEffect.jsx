import React, {memo} from "react";
import Intro from "@/pages/editor/GraphicalEditor/SentenceEditor/Intro";
import {Handle, Position} from "@xyflow/react";
import OrgComponent from "@/pages/editor/GraphicalEditor/SentenceEditor/PlayEffect";
import MyNodeToolbar from "@/pages/editor/NodeEditor/SentensNodes/MyNodeToolbar";
export default memo(({data})=>{
  return(
    <div className="IntroContainer">
      <h2>效果声音</h2>
      <MyNodeToolbar data={data}/>
      <OrgComponent VerticalMode={true} sentence={data.sentence} onSubmit={data.onSubmit} index={data.index}/>
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
