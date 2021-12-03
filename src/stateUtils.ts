export const saveEditorState = (value: any) => {
  const content = JSON.stringify(value)
  localStorage.setItem('content', content)
}

const getElement = (type: string, data = {}): {
  type: string,
  data: {},
  children: []
} => ({
  type,
  data,
  children: [],
})

const getText = (text: string): {text: string} => ({ text })

export const loadEditorState = () => {
  // @ts-ignore
  const savedState = JSON.parse(localStorage.getItem('content'))


  const page1 = getElement('page', {
    height: '11in',
    padding: '1in',
    width: '8.5in',
  })

  const section1 = getElement('section', { marginLeft: '1in', marginRight: '1in' })
  page1.children = [section1]

  const paragraph1 = getElement('paragraph')
  const paragraph2 = getElement('paragraph')
  section1.children = [ paragraph1, paragraph2 ]

  const text1 = getText('Text 1')
  const text2 = getText('Text 2')

  paragraph1.children = [text1]
  paragraph2.children = [text2]

  const page2 = getElement('page', {
    height: '17in',
    width: '11in',
    padding: '0.5in',
  })

  const section2 = getElement('section')
  page2.children = [section2]

  const list = getElement('ol')
  section2.children = [list]

  const li1 = getElement('li')
  const li2 = getElement('li')

  list.children = [ li1, li2 ]
  li1.children = [getText('list item1')]
  li2.children = [getText('list item2')]

  const DEFAULT_STATE = [
    page1,
    page2,
  ]

  console.log(JSON.stringify(DEFAULT_STATE, null, 2))

  // return savedState || DEFAULT_STATE
  return DEFAULT_STATE
}


