export default class FocusHandler {
  inputFocused: boolean = false;
  editorMouseDown: boolean = false;
  editorFocused: boolean = false;

  onEditorMouseDown = ():void => {
    this.editorFocused = true;
  }

  onInputMouseDown = ():void => {
    this.inputFocused = true;
  }

  isEditorBlur = (event): boolean => {
    if (event.target.tagName === 'INPUT' && !this.editorFocused) {
      this.inputFocused = false;
      return true;
    } else if (event.target.tagName !== 'INPUT' && !this.inputFocused) {
      this.editorFocused = false;
      return true;
    }
    return false;
  }

  isEditorFocused = (): boolean => {
    if (!this.inputFocused) {
      return true;
    }
    this.inputFocused = false;
    return false;
  }

  isToolbarFocused = (): boolean => {
    if (!this.editorFocused) {
      return true;
    }
    this.editorFocused = false;
    return false;
  }

  isInputFocused = (): boolean => this.inputFocused;
}
