/* @flow */

import React from 'react';
import {Editor} from 'react-draft-wysiwyg';
import EditorStyleProp from './EditorStyleProp';
import EditorStateProp from './EditorStateProp';
import CustomizingToolbarProp from './CustomizingToolbarProp';
import MentionProp from './MentionProp';
import HashtagProp from './HashtagProp';
import EventCallbackProp from './EventCallbackProp';
import DraftjsProp from './DraftjsProp';
import TextAlignmentProp from './TextAlignmentProp';
import ReadOnlyProp from './ReadOnlyProp';
import DecoratorProp from './DecoratorProp';
import BlockRenderingProp from './BlockRenderingProp';
import WrapperIdProp from './WrapperIdProp';

const Props = () => (
  <div className="docs-section">
    <h2>Properties</h2>
    <EditorStyleProp />
    <EditorStateProp />
    <CustomizingToolbarProp />
    <MentionProp />
    <HashtagProp />
    <EventCallbackProp />
    <DraftjsProp />
    <TextAlignmentProp />
    <ReadOnlyProp />
    <DecoratorProp />
    <BlockRenderingProp />
    <WrapperIdProp />
  </div>
);

export default Props;
