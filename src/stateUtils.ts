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

export const saveEditorState = (value: any) => {
  const content = JSON.stringify(value)
  localStorage.setItem('content', content)
}

export const loadEditorState = () => {
  // @ts-ignore
  // const savedState = JSON.parse(localStorage.getItem('content'))
  const page1 = getElement('page', {style: {
    height: '11in',
    padding: '1in',
    width: '8.5in',
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

  // const page2 = getElement('page', {style: {
  //   height: '17in',
  //   width: '11in',
  //   padding: '0.5in',
  // }})

  section1.children = [
    paragraph1,
    de1,
    list1,
    paragraph2,
    table,
    nestedTable(),
  ]

  page1.children = [section1]

  const DEFAULT_STATE = [
    page1,
  ]

  console.log(JSON.stringify(DEFAULT_STATE, null, 2))

  // return savedState || DEFAULT_STATE
  return DEFAULT_STATE
}


