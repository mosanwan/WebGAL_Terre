
import {NodeToolbar} from "@xyflow/react";
import {t} from "@lingui/macro";
import React, {memo} from "react";

export default memo(({data})=>{
  const Index= 0;
  return(
    <NodeToolbar >
      <button onClick={()=>data.onDelete(data.index)}>{t`删除`}</button>
      <button onClick={()=>data.onInsertAfter(data.index)}>{t`向前插入`}</button>
      <button onClick={()=>data.onInsertAfter(data.index+1)}>{t`向后插入`}</button>
      <button onClick={()=>data.onExec(data.index)}>{t`执行到此句`}</button>
    </NodeToolbar>
  );
});
