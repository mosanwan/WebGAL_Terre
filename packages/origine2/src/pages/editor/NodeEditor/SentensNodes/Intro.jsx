import React, {memo} from "react";
import {Handle, Position} from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import './Intro.scss';
// import './Say.scss';
import Intro from "@/pages/editor/GraphicalEditor/SentenceEditor/Intro";

export default memo(({data})=>{
  return(
    <div className="IntroContainer">
      <h2>全屏文字</h2>
      <Intro sentence={data.sentence} onSubmit={data.onSubmit} index={data.index}/>
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
