export const getBodyOrNull = (event: { body: string | null }) =>
    event.body ? JSON.parse(event.body) : null;

export const EMOJI_LIST = [
    '👍',
    '👎',
    '❤',
    '🔥',
    '🥰',
    '👏',
    '😁',
    '🤔',
    '🤯',
    '😱',
    '🤬',
    '😢',
    '🎉',
    '🤩',
    '🤮',
    '💩',
    '🙏',
    '👌',
    '🕊',
    '🤡',
    '🥱',
    '🥴',
    '😍',
    '🐳',
    '❤‍🔥',
    '🌚',
    '🌭',
    '💯',
    '🤣',
    '⚡',
    '🍌',
    '🏆',
    '💔',
    '🤨',
    '😐',
    '🍓',
    '🍾',
    '💋',
    '🖕',
    '😈',
    '😴',
    '😭',
    '🤓',
    '👻',
    '👨‍💻',
    '👀',
    '🎃',
    '🙈',
    '😇',
    '😨',
    '🤝',
    '✍',
    '🤗',
    '🫡',
    '🎅',
    '🎄',
    '☃',
    '💅',
    '🤪',
    '🗿',
    '🆒',
    '💘',
    '🙉',
    '🦄',
    '😘',
    '💊',
    '🙊',
    '😎',
    '👾',
    '🤷‍♂',
    '🤷',
    '🤷‍♀',
    '😡',
];

export const getRandomEmoji = () =>
    EMOJI_LIST[Math.floor(Math.random() * EMOJI_LIST.length)];
