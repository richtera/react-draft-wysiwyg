/* @flow */

import React from 'react';
import {Editor} from 'react-draft-wysiwyg';

export default () => (
  <div className="docs-section">
    <h2>ARIA Support</h2>
    <div className="docs-desc">
      All ARIA props supported by DraftJS editor are available in react-draft-wysiwyg <a target="_blank" rel="noopener noreferrer" href="https://facebook.github.io/draft-js/docs/api-reference-editor.html#aria-props">Ref</a>.
      In addition editor and all option in toolbar have other ARIA attributes also added with pre-configured values.
    </div>
  </div>
);
