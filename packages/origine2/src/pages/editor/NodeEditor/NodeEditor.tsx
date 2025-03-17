import {useEffect} from "react";
import {LGraph, LGraphCanvas} from "litegraph.js";
import styles from "./NodeEditor.module.scss";
interface INodeEditorProps {
  targetPath: string;
  targetName: string;
}
export default function NodeEditor(props: INodeEditorProps){
  const graph = new LGraph();
  const canvas = new LGraphCanvas("#mycanvas", graph);
  function updateNodes(props: INodeEditorProps){
    console.log("update Nodes",props);
  }
  graph.start();
  useEffect(()=>{
    updateNodes(props);
  },[]);


  return (
    <div className={styles.NodeEditorWrapper}>
      <canvas id="mycanvas"/>
    </div>
  );
}
