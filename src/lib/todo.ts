/** Flags leftover placeholder copy (`TODO — …`) so it cannot ship unnoticed. */
export const todoClass = (value: string) => (value.trimStart().startsWith('TODO') ? 'is-todo' : '');
