import React,{memo} from 'react';
import {Handle,Position} from "@xyflow/react";
// @ts-ignore
export default memo(({data})=>{
  return(
    <>
      <Handle type="target"
        position={Position.Left}
        onConnect={(params) => console.log('handle onConnect', params)}
        isConnectable={true} />
      <div>
        Custom Color Picker Node: <strong>{data.color}</strong>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="b"
        isConnectable={true}
      />
    </>
  );
});
