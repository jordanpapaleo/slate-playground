// @ts-nocheck
import {
  getDataElement,
  getElement,
  getList,
  getParagraph,
  getTable,
  // getText,
  nestedTable,
} from './mockData'

type CustomElement = { type: 'paragraph'; children: CustomText[] }
type CustomText = { text: string }

const initialValue: CustomElement[] = []

export const saveEditorState = (value: any) => {
  const content = JSON.stringify(value)
  localStorage.setItem('content', content)
}

export const loadEditorState = () => {
  // @ts-ignore
  // const savedState = JSON.parse(localStorage.getItem('content'))
  const page1 = getElement('page', {style: {
    height: '2in',
    padding: '0.25in',
    width: '8in',
  }})

  const section1 = getElement('section')
  const paragraph1 = getParagraph('some paragraph text')
  const de1 = getDataElement('FASTFILEID', { tooltip: 'This is a data element' })
  const paragraph2 = getParagraph('some other paragraph text')
  const table = getTable()
  const list1 = getList('ol')
  const list2 = getList('ul')
  const list3 = getList('ul')
  const list4 = getList('ul')
  list1.children.push(list2)
  list2.children.push(list3)
  list3.children.push(list4)
  list4.children.push(getList('ol'))

  const page2 = getElement('page', {style: {
    height: '4in',
    width: '4in',
    padding: '0.25in',
  }})

  section1.children = [
    paragraph1,
    // de1,
    // list1,
    paragraph2,
    // table,
    // nestedTable(),
  ]

  page1.children = [
    // section1
    // paragraph1
    {
      type: 'columns',
      children: [
        paragraph1,
        paragraph1,
        paragraph1,
        paragraph1,
        paragraph1,
        paragraph1,
        paragraph1,
      ]
    }
  ]

  page2.children = [
    section1
    // paragraph1
  ]

  const DEFAULT_STATE = [
    page1,
    page2
  ]

  // console.log(JSON.stringify(DEFAULT_STATE, null, 2))

  return JSON.parse(JSON.stringify(DEFAULT_STATE))
  // return savedState || DEFAULT_STATE
}


const longText = 'asdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdf'
