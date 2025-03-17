import {DataSheet, FileCodeOne, ListView, Terminal} from '@icon-park/react';
import s from './editorToolbar.module.scss';
import {useEffect, useState} from "react";
import {eventBus} from "@/utils/eventBus";
import {useGameEditorContext} from '@/store/useGameEditorStore';
import { t } from '@lingui/macro';

export default function EditorToolbar() {
  const isCodeMode = useGameEditorContext((state) => state.isCodeMode);
  const isShowDebugger = useGameEditorContext((state)=> state.isShowDebugger);
  const updateIsCodeMode = useGameEditorContext((state)=> state.updateIsCodeMode);
  const updateIsShowDebugger = useGameEditorContext((state) => state.updateIsShowDebugger);
  const updateEditorMode = useGameEditorContext((state)=> state.updateEditorMode);
  // const [currentMode,setCurrentMode] = useState("Node");
  const [textNum,setTextNum] = useState(0);
  const [lineNum,setLineNum] = useState(0);
  const EditorMode = useGameEditorContext((state)=>state.EditorMode);

  // 函数用于格式化数字，添加千分位分隔符
  function formatNumberWithCommas(num:number) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // 创建两个字符串
  const textNumString = formatNumberWithCommas(textNum);
  const lineNumString = formatNumberWithCommas(lineNum);

  const handleSetCodeMode = () => {

    console.log("handleSetCodeMode");
    updateIsCodeMode(true);
    updateEditorMode("Code");
  };
  const handleSetGraphMode = () => {
    updateIsCodeMode(false);
    console.log("handleSetGraphMode");
    updateEditorMode("Graph");
  };
  const handleSetNodeMode = () => {
    console.log("handleSetNodeMode");
    updateEditorMode("Node");
  };

  useEffect(() => {
    console.log("当前EditorMode = "+EditorMode);
    const handleUpdagteScene = (scene:string)=>{
      const wordsAndChars = scene.match(/[\w]+|[^\s\w]/g) || [];
      setTextNum(wordsAndChars.length);
      setLineNum(scene.split('\n').length);
    };

    // @ts-ignore
    eventBus.on('update-scene',handleUpdagteScene);
    return ()=>{
      // @ts-ignore
      eventBus.off('update-scene',handleUpdagteScene);
    };
  }, []);


  const switchDebugger = ()=>{
    updateIsShowDebugger(!isShowDebugger);
  };

  return <div className={s.toolbar}>
    <div className={s.toolbar_button+ ' ' + (isShowDebugger  ? s.toolbar_button_active : '')} onClick={()=>switchDebugger()}>
      <Terminal theme="outline" size="20" fill={isShowDebugger ? '#005CAF' : "#333"} strokeWidth={3}/>
      DEBUGGER
    </div>
    <div className={s.toolbar_button}>
      <DataSheet theme="outline" size="20" fill="#333" strokeWidth={3}/>
      {lineNumString} {t`行脚本`}, {textNumString} {t`个字`}
    </div>
    <div onClick={handleSetCodeMode} className={s.toolbar_button + ' ' + (EditorMode==="Code" ? s.toolbar_button_active : '')}
      style={{marginLeft: 'auto'}}>
      <FileCodeOne theme="outline" size="20" fill={EditorMode==="Code" ? '#005CAF' : "#333"} strokeWidth={3}/>
      {t`脚本编辑器`}
    </div>
    <div onClick={handleSetGraphMode} className={s.toolbar_button + ' ' + (EditorMode==="Graph" ? s.toolbar_button_active : '')}>
      <ListView theme="outline" size="20" fill={EditorMode==="Graph" ? '#005CAF':"#333" } strokeWidth={3}/>
      {t`图形编辑器`}
    </div>
    <div onClick={handleSetNodeMode} className={s.toolbar_button + ' ' + (EditorMode==="Node" ? s.toolbar_button_active : '')}>
      <ListView theme="outline" size="20" fill={EditorMode==="Node" ? '#005CAF' : "#333"} strokeWidth={3}/>
      {t`节点编辑器`}
    </div>
  </div>;
}
