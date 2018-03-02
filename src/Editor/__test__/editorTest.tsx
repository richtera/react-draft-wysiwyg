/* @flow */

import * as React from "react";
import {assert, expect} from "chai";
import {shallow} from "enzyme";
import Editor from "..";

describe('Editor test suite', () => {
  it('should have a div when rendered', () => {
    expect(shallow(<Editor />).html().startsWith('<div')).to.equal(true);
  });

  it('should have an editorState object in state', () => {
    const editor = shallow(<Editor />);
    assert.isDefined(editor.state().editorState);
    assert.isDefined(editor.state().editorFocused);
  });

  it('should have toolbarHidden as false by default', () => {
    const editor = shallow(<Editor />);
    expect(editor.find('.rdw-editor-toolbar')).to.have.length(1);
  });
});
