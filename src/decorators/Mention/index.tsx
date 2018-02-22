import Mention from './Mention';
import Suggestion from './Suggestion';

export const getDecorators = config => [
  (new Mention(config.mentionClassName)).getMentionDecorator(),
  (new Suggestion(config)).getSuggestionDecorator(),
];
export default getDecorators;