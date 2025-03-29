import React, {memo} from "react";
import Intro from "@/pages/editor/GraphicalEditor/SentenceEditor/Intro";
import {Handle, NodeToolbar, Position} from "@xyflow/react";
import GetUserInput from "@/pages/editor/GraphicalEditor/SentenceEditor/GetUserInput";
import MyNodeToolbar from "./MyNodeToolbar";
import {t} from "@lingui/macro";
export default memo(({data})=>{
  return(
    <div className="IntroContainer">
      <h2>获取输入</h2>
      <MyNodeToolbar data={data}/>
      <GetUserInput VerticalMode={true} sentence={data.sentence} onSubmit={data.onSubmit} index={data.index}/>
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
