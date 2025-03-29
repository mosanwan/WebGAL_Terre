import {memo} from "react";
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
import {sentenceEditorConfig} from "@/pages/editor/GraphicalEditor/SentenceEditor";
import {commandType} from "webgal-parser/src/interface/sceneInterface";
import {useValue} from "@/hooks/useValue";

export default memo(({props})=>{
  const isShowCallout = useValue(true);
  const addSentenceButtons = sentenceEditorConfig.filter(e => e.type !== commandType.comment).map(sentenceConfig => {
    return <div className={stylesAs.sentenceTypeButton} key={sentenceConfig.type} onClick={() => {
      props.onChoose(sentenceConfig.initialText());
      isShowCallout.set(false);
    }}>
      <div style={{padding:'1px 0 0 0'}}>
        {sentenceConfig.icon}
      </div>
      <div className={stylesAs.buttonDesc}>
        <div className={stylesAs.title}>
          {sentenceConfig.title()}
        </div>
        <div className={stylesAs.text}>
          {sentenceConfig.descText()}
        </div>
      </div>
    </div>;
  });


  return (
    <Dialog
      // open={}
      open={true}
      // onOpenChange={() => isShowCallout.set(false)}
    >
      <DialogSurface style={{ maxWidth: "960px"}}>
        <DialogBody>
          <DialogTitle
            action={
              <DialogTrigger action="close">
                <Button
                  appearance="subtle"
                  aria-label="close"
                />
              </DialogTrigger>
            }
          >{props.titleText}</DialogTitle>
          <DialogContent>
            <div className={stylesAs.sentenceTypeButtonList} >
              {addSentenceButtons}
            </div>
          </DialogContent>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
});
