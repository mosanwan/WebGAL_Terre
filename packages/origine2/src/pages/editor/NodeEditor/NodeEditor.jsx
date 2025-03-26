import styles from "@/pages/editor/NodeEditor/NodeEditor.module.scss";
import {Background, Controls, ReactFlow} from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import {useCallback, useEffect, useState} from "react";
import axios from "axios";
import {useValue} from "@/hooks/useValue";
import {eventBus} from "@/utils/eventBus";
import {splitToArray} from "@/pages/editor/GraphicalEditor/utils/sceneTextProcessor";
import {parseScene} from "@/pages/editor/GraphicalEditor/parser";
import {applyEdgeChanges, applyNodeChanges} from "reactflow";

export default function NodeEditor(props) {
  const sceneText = useValue("");
  const showSentence = useValue([]);
  const [nodes,setNodes]  = useState([]);
  const [edges,setEdges]  = useState([]);
  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );
  const nodeTypes = {};
  function updateScene() {
    const path = props.targetPath;
    axios.get(path).then((res)=>res.data).then((data)=>{
      sceneText.set(data.toString());
      eventBus.emit("update-scene", data.toString());
      const arr = splitToArray(sceneText.value);
      if (showSentence.value.length!==arr.length) {
        showSentence.set(new Array(arr.length).fill(true));
      }
      const parsedScene = (sceneText.value === "" ? {sentenceList: []} : parseScene(sceneText.value));
      // parsedScene.sentenceList.map((sentence,i) => {
      //
      //   return {sentence:sentence};
      // });
      parsedScene.sentenceList.forEach((sentence,i) => {
        console.log("sentence : "+sentence);
        const newNode = {
          id: String(i),
          data: {
            label: 'Hello'
          },
          position: {
            x: i*200,
            y: 0,
          },
          type: "input"
        };
        setNodes((nds)=>nds.concat(newNode));
      });
    });
  }
  useEffect(() => {
    updateScene();
  },[]);

  return (
    <div style={{height: '100%'}}>
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        // onConnect={onConnect}
        // nodeTypes={nodeTypes}
        fitView
      >

        <Background/>
        <Controls/>
      </ReactFlow>
    </div>
    // <div id="container" className={styles.NodeEditorWrapper}>
    //
    // </div>
  );
};
