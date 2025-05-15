import NodeEditorWithProvider from '@/pages/editor/NodeEditor/NodeEditor';
import MovieSectionEditorWithProvider from '@/pages/editor/NodeEditor/MovieSectionEditor';

export default function NodePanel(props){
  return (
    <div style={{height: '100%'}}>
      <MovieSectionEditorWithProvider {...props}/>
      <NodeEditorWithProvider {...props}/>
    </div>
  );
}
