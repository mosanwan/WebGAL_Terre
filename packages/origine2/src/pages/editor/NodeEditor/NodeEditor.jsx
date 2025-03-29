import styles from "@/pages/editor/NodeEditor/NodeEditor.module.scss";
import {useReactFlow,Background, Controls,
  Position, ReactFlow,ReactFlowProvider,
  applyNodeChanges,applyEdgeChanges,addEdge,
  Panel
} from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import {useCallback, useEffect, useRef, useState} from "react";
import axios from "axios";
import {useValue} from "@/hooks/useValue";
import {eventBus} from "@/utils/eventBus";
import {mergeToString, splitToArray} from "@/pages/editor/GraphicalEditor/utils/sceneTextProcessor";
import {parseScene} from "@/pages/editor/GraphicalEditor/parser";


import {editorLineHolder} from "@/runtime/WG_ORIGINE_RUNTIME";
import {api} from "@/api";
import {WsUtil} from "@/utils/wsUtil";
import useEditorStore from "@/store/useEditorStore";

import ContextMenu from "@/pages/editor/NodeEditor/SentensNodes/ContextMenu";
import IntroNode from "@/pages/editor/NodeEditor/SentensNodes/Intro";
import PixiPerform from "@/pages/editor/NodeEditor/SentensNodes/pixiPerform";
import PixiInit from "@/pages/editor/NodeEditor/SentensNodes/pixiInit";
import MiniAvatar from "@/pages/editor/NodeEditor/SentensNodes/MiniAvatar";
import PlayEffect from "@/pages/editor/NodeEditor/SentensNodes/PlayEffect";
import GetUserInput from "@/pages/editor/NodeEditor/SentensNodes/GetUserInput";
import SetAnimation from "@/pages/editor/NodeEditor/SentensNodes/SetAnimation";
import SetTransition from "@/pages/editor/NodeEditor/SentensNodes/SetTransition";
import SetTransform from "@/pages/editor/NodeEditor/SentensNodes/SetTransform";
import CallScene from "@/pages/editor/NodeEditor/SentensNodes/CallScene";
import ChangeScene from "@/pages/editor/NodeEditor/SentensNodes/ChangeScene";
import Choose from "@/pages/editor/NodeEditor/SentensNodes/Choose";
import UnlockBgm from "@/pages/editor/NodeEditor/SentensNodes/UnlockBgm";
import UnlockCg from "@/pages/editor/NodeEditor/SentensNodes/UnlockCg";
import SetTextbox from "@/pages/editor/NodeEditor/SentensNodes/SetTextbox";
import End from "@/pages/editor/NodeEditor/SentensNodes/End";
import PlayVideo from "@/pages/editor/NodeEditor/SentensNodes/PlayVideo";
import Bgm from "@/pages/editor/NodeEditor/SentensNodes/Bgm";
import ChangeFigure from "@/pages/editor/NodeEditor/SentensNodes/ChangeFigure";
import ChangeBg from "@/pages/editor/NodeEditor/SentensNodes/ChangeBg";
import Say from "@/pages/editor/NodeEditor/SentensNodes/Say";
import Dagre from '@dagrejs/dagre';
import AddSentence, {addSentenceType} from "@/pages/editor/GraphicalEditor/components/AddSentence";
import {t} from "@lingui/macro";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger
} from "@fluentui/react-components";
import stylesAs from "@/pages/editor/GraphicalEditor/components/addSentence.module.scss";
import AddNodesPanel from "@/pages/editor/NodeEditor/SentensNodes/AddNodesPanel";

const getLayoutedElements = (nodes, edges, options) => {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: options.direction });

  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  nodes.forEach((node) =>
    g.setNode(node.id, {
      ...node,
      width: node.measured?.width ?? 0,
      height: node.measured?.height ?? 0,
    }),
  );

  Dagre.layout(g);

  return {
    nodes: nodes.map((node) => {
      const position = g.node(node.id);
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      const x = position.x - (node.measured?.width ?? 0) / 2;
      const y = position.y - (node.measured?.height ?? 0) / 2;

      return { ...node, position: { x, y } };
    }),
    edges,
  };
};

function NodeEditor(props) {
  const [IsAddNewSentenceOpen, setIsAddNewSentenceOpen] =useState(false);
  const gameName = useEditorStore.use.subPage();
  const sceneText = useValue("");
  const showSentence = useValue([]);
  const [nodes,setNodes]  = useState([]);
  const [edges,setEdges]  = useState([]);
  const [menu, setMenu] = useState(null);
  const ref = useRef(null);
  const {getNode } = useReactFlow();
  const { fitView } = useReactFlow();
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
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [],
  );
  const nodeTypes =
    {
      intro:IntroNode,
      pixiPerform:PixiPerform,
      pixiInit:PixiInit,
      playEffect:PlayEffect,
      miniAvatar:MiniAvatar,
      getUserInput:GetUserInput,
      setAnimation:SetAnimation,
      setTransition:SetTransition,
      setTransform:SetTransform,
      callScene:CallScene,
      changeScene:ChangeScene,
      choose:Choose,
      unlockBgm:UnlockBgm,
      unlockCg:UnlockCg,
      end:End,
      setTextbox:SetTextbox,
      bgm:Bgm,
      playVideo:PlayVideo,
      changeFigure:ChangeFigure,
      changeBg:ChangeBg,
      say:Say
    };
  const NodeSizes = {
    intro: 600,
    pixiPerform: 280,
    pixiInit: 200,
    playEffect: 300,
    miniAvatar: 280,
    getUserInput: 300,
    setAnimation: 420,
    setTransition: 420,
    setTransform: 300,
    callScene: 350,
    changeScene: 350,
    choose: 400,
    unlockBgm: 300,
    unlockCg: 300,
    end: 200,
    setTextbox: 300,
    bgm: 330,
    playVideo: 300,
    changeFigure: 360,
    changeBg: 320,
    say: 400
  };
  function deleteNode(index){
    // console.log("DeleteNode",index);
    const arr = splitToArray(sceneText.value);
    arr.splice(index, 1);
    submitSceneAndUpdate(mergeToString(arr), index);
    const showSentenceList = [...showSentence.value];
    showSentenceList.splice(index, 1);
    showSentence.set(showSentenceList);
    updateScene();
  }
  const currentSelectedNodeIndex = useValue(0);
  function insertNodeAfter(index){
    setIsAddNewSentenceOpen(true);
    currentSelectedNodeIndex.set(index);
  }
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
      let preNodeId = "";
      let NodeX = 0;
      setNodes([]);
      setEdges([]);
      parsedScene.sentenceList.forEach((sentence,i) => {
        console.log("sentence : "+sentence);
        const currentNodeId = "Node_"+String(i);
        const nodeType = sentence["command"] ===0?"say":sentence['commandRaw'];
        const NodeWidth = NodeSizes[nodeType];
        const newNode = {
          id: currentNodeId,
          data: {
            sentence: sentence,
            label: sentence['commandRaw'],
            onSubmit: (newSentence) => {
              // submitSceneAndUpdate(newSentence, i);
              updateSentenceByIndex(newSentence, i);
            },
            onDelete: (index)=>{
              deleteNode(index-1);
            },
            onInsertAfter: (index)=>{
              insertNodeAfter(index-1);
            },
            index: i+1,
            VerticalMode:true
          },
          position: {
            x: NodeX,
            y: 0,
          },
          type: nodeType
        };
        setNodes((nds) => nds.concat(newNode));
        NodeX += NodeWidth;

        if (i>0){
          const newEdge = {
            id:"Edge_"+String(i),
            source:"Node_"+String(i-1),
            target:"Node_"+String(i),
            animated: false
          };
          setEdges((eds) => edges.concat(eds.concat(newEdge)));
        }

      });
    });
  }
  useEffect(() => {
    updateScene();
    // const timer = setTimeout(() => {
    //   console.log('这段代码将在 2 秒后执行一次');
    //   // 这里可以执行你的代码
    //   onLayout('TB');
    // }, 10090); // 2000 毫秒 = 2 秒
    // return () => clearTimeout(timer);

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
  const onLayout = useCallback(
    (direction) => {
      console.log(nodes);
      const layouted = getLayoutedElements(nodes, edges, { direction });

      setNodes([...layouted.nodes]);
      setEdges([...layouted.edges]);

      fitView();
    },
    [nodes, edges],
  );
  // const DismissIcon = bundleIcon(Dismiss24Filled, Dismiss24Regular);
  return (
    <div style={{height: '100%'}}>
      <ReactFlow
        ref={ref}
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        // onNodeContextMenu={onNodeContextMenu}
        onPaneClick={onPaneClick}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Panel position="top-right">
          <button onClick={() => onLayout('LR')}>自动布局</button>
        </Panel>
        {IsAddNewSentenceOpen&& <AddNodesPanel props={{
          onChoose:function (newSentence) {
            console.log('On Choose');
            addOneSentence(newSentence, currentSelectedNodeIndex.value);
            setIsAddNewSentenceOpen(false);
          },
        }} />}



        <Background/>
        {menu && <ContextMenu onClick={onPaneClick} {...menu} />}
        <Controls/>
      </ReactFlow>

    </div>
    // <div id="container" className={styles.NodeEditorWrapper}>
    //
    // </div>
  );
}

export default function NodeEditorWithProvider(props){
  return (
    <ReactFlowProvider>
      <NodeEditor {...props} />
    </ReactFlowProvider>
  );
}
