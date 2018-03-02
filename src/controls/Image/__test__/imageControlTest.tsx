/* @flow */

import * as React from "react";
import {ContentState, convertFromHTML, EditorState,} from "draft-js";
import {assert, expect} from "chai";
import {mount} from "enzyme";

import ImageControl from "..";
import defaultToolbar from "../../../config/defaultToolbar";
import ModalHandler from "../../../event-handler/modals";
import localeTranslations from "../../../i18n";

describe('ImageControl test suite', () => {
  const contentBlocks = convertFromHTML('<div>test</div>');
  const contentState = ContentState.createFromBlockArray(contentBlocks);
  const editorState = EditorState.createWithContent(contentState);

  it('should have a div when rendered', () => {
    expect(mount(
      <ImageControl
        onChange={() => {}}
        editorState={editorState}
        config={defaultToolbar.image}
        translations={localeTranslations.en}
        modalHandler={new ModalHandler()}
      />,
    ).html().startsWith('<div')).to.equal(true);
  });

  it('should have 1 child element by default', () => {
    const control = mount(
      <ImageControl
        onChange={() => {}}
        editorState={editorState}
        config={defaultToolbar.image}
        translations={localeTranslations.en}
        modalHandler={new ModalHandler()}
      />,
    );
    expect(control.children().length).to.equal(1);
  });

  it('should set signalExpanded to true when option is clicked', () => {
    const control = mount(
      <ImageControl
        onChange={() => {}}
        editorState={editorState}
        config={defaultToolbar.image}
        translations={localeTranslations.en}
        modalHandler={new ModalHandler()}
      />,
    );
    const imageControl = control.find('ImageControl');
    assert.isNotTrue(imageControl.node.signalExpanded);
    control.find('Option').simulate('click');
    assert.isTrue(imageControl.node.signalExpanded);
  });
});
