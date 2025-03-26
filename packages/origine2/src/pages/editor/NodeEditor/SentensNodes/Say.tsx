import {useCallback, useEffect,memo} from "react";
import { Handle,Position,Node, NodeProps } from '@xyflow/react';
import styles from "../../GraphicalEditor/SentenceEditor/sentenceEditor.module.scss";
import {ISentenceEditorProps} from "@/pages/editor/GraphicalEditor/SentenceEditor";
import Say from "@/pages/editor/GraphicalEditor/SentenceEditor/Say";

type FigurePosition = "" | "left" |  "right" | "center" | "id";
type FontSize = "default" | "small" | "medium" | "large";

export default function SayNode(props:ISentenceEditorProps) {
  const onChange = useCallback((evt:any)=>{
    console.log(evt.target.value);
  },[]);
  const toString = styles.toString();
  return (
    <>
      <Say sentence={props.sentence} onSubmit={props.onSubmit} index={props.index}/>
      <h1>Hello</h1>
    </>

  );
}
