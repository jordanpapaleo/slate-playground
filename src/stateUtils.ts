export const saveEditorState = (value: any) => {
  const content = JSON.stringify(value)
  localStorage.setItem('content', content)
}

export const loadEditorState = () => {
  // @ts-ignore
  const savedState = JSON.parse(localStorage.getItem('content'))

  const DEFAULT_STATE = [{
    type: 'paragraph',
    children: [{ text: 'A line of text in a paragraph.' }],
  }]
  return savedState || DEFAULT_STATE
}
