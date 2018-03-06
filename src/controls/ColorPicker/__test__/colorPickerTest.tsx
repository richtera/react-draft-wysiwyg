/* @flow */

import * as React from "react";
import {ContentState, convertFromHTML, EditorState,} from "draft-js";
import {assert, expect} from "chai";
import {mount} from "enzyme";

import ColorPicker from "..";
import defaultToolbar from "../../../config/defaultToolbar";
import ModalHandler from "../../../event-handler/modals";
import localeTranslations from "../../../i18n";

describe('ColorPicker test suite', () => {
  const contentBlocks = convertFromHTML('<div>test</div>');
  const contentState = ContentState.createFromBlockArray(contentBlocks);
  const editorState = EditorState.createWithContent(contentState);

  it('should have a div when rendered', () => {
    expect(mount(
      <ColorPicker
        onChange={() => {}}
        editorState={editorState}
        config={defaultToolbar.colorPicker}
        translations={localeTranslations.en}
        modalHandler={new ModalHandler()}
      />,
    ).html().startsWith('<div')).to.equal(true);
  });

  it('should correctly set default state values', () => {
    const control = mount(
      <ColorPicker
        onChange={() => {}}
        editorState={editorState}
        config={defaultToolbar.colorPicker}
        translations={localeTranslations.en}
        modalHandler={new ModalHandler()}
      />,
    );
    const colorPicker = control.find('ColorPicker');
    const state = colorPicker.node.state;
    assert.isNotTrue(state.expanded);
    assert.isUndefined(state.currentColor);
    assert.isUndefined(state.currentBgColor);
  });

  it('should set variable signalExpanded to true when first child is clicked', () => {
    const control = mount(
      <ColorPicker
        onChange={() => {}}
        editorState={editorState}
        config={defaultToolbar.colorPicker}
        translations={localeTranslations.en}
        modalHandler={new ModalHandler()}
      />,
    );
    const colorPicker = control.find('ColorPicker');
    assert.isNotTrue(colorPicker.node.signalExpanded);
    control.find('Option').simulate('click');
    assert.isTrue(colorPicker.node.signalExpanded);
  });
});