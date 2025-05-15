import { Controls, ReactFlow, ReactFlowProvider } from '@xyflow/react';

function MovieSectionEditor(props) {
  return (
    <div style={{height: '90%', width: '100px'}} >
      <ReactFlow>
        <Controls/>
      </ReactFlow>
    </div>
  );
}

export default function MovieSectionEditorWithProvider(props){
  return (
    <ReactFlowProvider>
      <MovieSectionEditor {...props} />
    </ReactFlowProvider>
  );
}
