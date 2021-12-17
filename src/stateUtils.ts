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

import testJson from  './data/paging.json'

type CustomElement = { type: 'p'; children: CustomText[] }
type CustomText = { text: string }


const initialValue: CustomElement[] = []

export const saveEditorState = (value: any) => {
  const content = JSON.stringify(value)
  localStorage.setItem('content', content)
}

export const loadEditorState = () => {
  delete testJson[0].header
  delete testJson[0].footer
  return JSON.parse(JSON.stringify(testJson))

  // @ts-ignore
  // const savedState = JSON.parse(localStorage.getItem('content'))
  const page1 = getElement('page', {style: {
    height: '2in',
    padding: '0.25in',
    width: '4in',
  }})

  const section1 = getElement('section')
  const paragraph1 = getParagraph('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi id auctor ipsum. Maecenas quis tortor in ante pulvinar dictum sit amet at mauris. Fusce ac tellus diam. Duis mattis dignissim nisl, in tristique ante ullamcorper in.Ut purus nisl, scelerisque et elementum eu, sodales sit amet tortor. Curabitur nec sem ut justo mattis malesuada. Nulla maximus pulvinar nulla, ultrices cursus justo gravida et. Etiam sed mi et eros ullamcorper facilisis sed in ante. Nullam tincidunt, nibh sed porta congue, leo est ullamcorper nisl, quis posuere libero nisl accumsan nunc.')
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

  const condition = {
    type: 'condition',
    data: {
      conditions: [
        {
          label: 'Condition 1',
          value: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quaerat, ab.',
        },
        {
          label: 'Condition 2',
          value: 'Quibusdam nulla modi veniam neque, nostrum ipsam officia exercitationem quae nobis dolor.',
        },
      ]
    },
    children: []
  }

  page1.children = [
    // section1
    paragraph1
  ]

  page2.children = [
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

  const DEFAULT_STATE = [
    page1,
    // page2
  ]



  // console.log(JSON.stringify(DEFAULT_STATE, null, 2))

  // return JSON.parse(JSON.stringify(DEFAULT_STATE))
  // return savedState || DEFAULT_STATE
}


const longText = 'asdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdf'
