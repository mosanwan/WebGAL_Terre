import {useCallback, useEffect, useState} from "react";
import {
  ReactFlow,
  Controls,
  Background,
  Connection,
  Node,
  Edge,
  EdgeTypes,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge, OnNodesChange, OnConnect,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import styles from "./NodeEditor.module.scss";
import {OnEdgesChange, Panel} from "reactflow";
import {api} from "@/api";
import {useValue} from "@/hooks/useValue";
import {eventBus} from "@/utils/eventBus";
import axios from "axios";
import {splitToArray} from "@/pages/editor/GraphicalEditor/utils/sceneTextProcessor";
import {parseScene} from "@/pages/editor/GraphicalEditor/parser";

interface INodeEditorProps {
  targetPath: string;
  targetName: string;
}
export default function NodeEditor(props: INodeEditorProps){
  const sceneText = useValue("");
  const showSentence = useValue<Array<boolean>>([]);
  const initialNodes:Node[] = [
    {
      id: '1',
      data: { label: 'Hello' },
      position: { x: 0, y: 0 },
      type: 'input',
    },
    {
      id: '2',
      data: { label: 'World' },
      position: { x: 100, y: 100 },
    },
  ];
  const initialEdges: Edge[] = [];
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange:OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );
  // const onEdgesChange:OnEdgesChange = useCallback(
  //   (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
  //   [setEdges],
  // );
  const onConnect:OnConnect = useCallback(
    (params:Connection|Edge|any) => setEdges((eds) => addEdge(params, eds)),
    [],
  );

  function updateScene(){
    const path = props.targetPath;
    axios.get(path).then((res) => res.data).then((data) => {
      sceneText.set(data.toString());
      eventBus.emit("update-scene", data.toString());
      const arr = splitToArray(sceneText.value);
      if (showSentence.value.length!==arr.length) {
        showSentence.set(new Array(arr.length).fill(true));
      }
      console.log(data);
    });
  }

  useEffect(()=>{
    updateScene();
  },[]);

  function handleAdd(sentence: string) {
    console.log(sentence);
  }

  useEffect(() => {
    // @ts-ignore
    eventBus.on('topbar-add-sentence', handleAdd);
    return () => {
      // @ts-ignore
      eventBus.off('topbar-add-sentence', handleAdd);
    };
  }, [sceneText.value]);

  const parsedScene = (sceneText.value === "" ? {sentenceList: []} : parseScene(sceneText.value));
  console.log(parsedScene);
  return (
    <div id="container" className={styles.NodeEditorWrapper}>
      <div style={{ height: '100%' }}>
        <ReactFlow
          nodes={nodes}
          onNodesChange={onNodesChange}
          edges={edges}
          // onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >

          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
