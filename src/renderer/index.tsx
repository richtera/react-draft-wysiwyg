import Embedded from "./Embedded";
import getImageComponent from "../renderer/Image";
import getMediaComponent from "../renderer/Media";

const getBlockRenderFunc = (config, customBlockRenderer) => (block) => {
  if (typeof customBlockRenderer === 'function') {
    const renderedComponent = customBlockRenderer(block, config, config.getEditorState);
    if (renderedComponent) return renderedComponent;
  }
  if (block.getType() === 'atomic') {
    const contentState = config.getEditorState().getCurrentContent();
    const entityKey = block.getEntityAt(0);
    if (entityKey) {
      const entity = contentState.getEntity(entityKey);
      if (entity && entity.type === 'IMAGE') {
        return {
          component: getImageComponent(config),
          editable: false,
        };
      } else if (entity && entity.type === 'EMBEDDED_LINK') {
        return {
          component: Embedded,
          editable: false,
        };
      } else if (entity && (entity.type === 'VIDEO' || entity.type === 'AUDIO')) {
        return {
          component: getMediaComponent(config),
          editable: false,
        };
      }
    }
  }
  return undefined;
};

export default getBlockRenderFunc;
