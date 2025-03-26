import styles from "@/pages/editor/NodeEditor/NodeEditor.module.scss";
import {Background, Controls, Position, ReactFlow} from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import {useCallback, useEffect, useRef, useState} from "react";
import axios from "axios";
import {useValue} from "@/hooks/useValue";
import {eventBus} from "@/utils/eventBus";
import {mergeToString, splitToArray} from "@/pages/editor/GraphicalEditor/utils/sceneTextProcessor";
import {parseScene} from "@/pages/editor/GraphicalEditor/parser";
import {applyEdgeChanges, applyNodeChanges} from "reactflow";
import ContextMenu from "@/pages/editor/NodeEditor/SentensNodes/ContextMenu";
import IntroNode from "@/pages/editor/NodeEditor/SentensNodes/Intro";
import PixiPerform from "@/pages/editor/NodeEditor/SentensNodes/pixiPerform";
import PixiInit from "@/pages/editor/NodeEditor/SentensNodes/pixiInit";
import {editorLineHolder} from "@/runtime/WG_ORIGINE_RUNTIME";
import {api} from "@/api";
import {WsUtil} from "@/utils/wsUtil";
import useEditorStore from "@/store/useEditorStore";
import MiniAvatar from "@/pages/editor/NodeEditor/SentensNodes/MiniAvatar";
import PlayEffect from "@/pages/editor/NodeEditor/SentensNodes/PlayEffect";
import GetUserInput from "@/pages/editor/NodeEditor/SentensNodes/GetUserInput";

export default function NodeEditor(props) {
  const gameName = useEditorStore.use.subPage();
  const sceneText = useValue("");
  const showSentence = useValue([]);
  const [nodes,setNodes]  = useState([]);
  const [edges,setEdges]  = useState([]);
  const [menu, setMenu] = useState(null);
  const ref = useRef(null);
  const onNodeContextMenu = useCallback(
    (event, node) => {
      // Prevent native context menu from showing
      event.preventDefault();

      // Calculate position of the context menu. We want to make sure it
      // doesn't get positioned off-screen.
      const pane = ref.current.getBoundingClientRect();
      setMenu({
        id: node.id,
        top: event.clientY < pane.height - 200 && event.clientY,
        left: event.clientX < pane.width - 200 && event.clientX,
        right: event.clientX >= pane.width - 200 && pane.width - event.clientX,
        bottom:
          event.clientY >= pane.height - 200 && pane.height - event.clientY,
      });
    },
    [setMenu],
  );
  const onPaneClick = useCallback(() => setMenu(null), [setMenu]);
  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );
  const nodeTypes =
    {
      intro:IntroNode,
      pixiPerform:PixiPerform,
      pixiInit:PixiInit,
      playEffect:PlayEffect,
      miniAvatar:MiniAvatar,
      getUserInput:GetUserInput
    };
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
            sentence: sentence,
            label: sentence['commandRaw'],
            onSubmit: (newSentence) => {
              // submitSceneAndUpdate(newSentence, i);
              updateSentenceByIndex(newSentence, i);
            },
            index: i+1
          },
          position: {
            x: i * 200,
            y: 0,
          },
          type: sentence['commandRaw']
        };
        setNodes((nds) => nds.concat(newNode));

      });
    });
  }
  useEffect(() => {
    updateScene();
  },[]);
  useEffect(() => {
    // @ts-ignore
    eventBus.on('topbar-add-sentence', handleAdd);
    return () => {
      // @ts-ignore
      eventBus.off('topbar-add-sentence', handleAdd);
    };
  }, [sceneText.value]);

  function updateSentenceByIndex(newSentence, updateIndex) {
    const arr = splitToArray(sceneText.value);
    arr[updateIndex] = newSentence;
    submitSceneAndUpdate(mergeToString(arr), updateIndex);
  }
  function submitSceneAndUpdate(newScene, index) {
    const updateIndex = index+1 ;
    editorLineHolder.recordSceneEdittingLine(props.targetPath, updateIndex);
    sceneText.set(newScene);
    const params = new URLSearchParams();
    params.append("gameName", gameName);
    params.append("sceneName", props.targetName);
    params.append("sceneData", JSON.stringify({value: sceneText.value}));
    api.assetsControllerEditTextFile({textFile: newScene, path: props.targetPath}).then(() => {
      const targetValue = sceneText.value.split("\n")[updateIndex - 1];
      WsUtil.sendSyncCommand(props.targetPath, updateIndex, targetValue);
      updateScene();
    });
  }
  function handleAdd(sentence) {
    addNewSentenceAttach(sentence);
  }
  function addNewSentenceAttach(sentence) {
    addOneSentence(sentence, splitToArray(sceneText.value).length);
  }
  function addOneSentence(newSentence, updateIndex) {
    const arr = sceneText.value === "" ? [] : splitToArray(sceneText.value);
    arr.splice(updateIndex, 0, newSentence);
    submitSceneAndUpdate(mergeToString(arr), updateIndex);
    const showSentenceList = [...showSentence.value];
    showSentenceList.splice(updateIndex, 0, true);
    showSentence.set(showSentenceList);
  }

  return (
    <div style={{height: '100%'}}>
      <ReactFlow
        ref={ref}
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onNodeContextMenu={onNodeContextMenu}
        onPaneClick={onPaneClick}
        // onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >

        <Background/>
        {menu && <ContextMenu onClick={onPaneClick} {...menu} />}
        <Controls/>
      </ReactFlow>
    </div>
    // <div id="container" className={styles.NodeEditorWrapper}>
    //
    // </div>
  );
};
