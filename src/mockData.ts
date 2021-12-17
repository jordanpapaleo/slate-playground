export const getList = (type, data = {}) => ({
  type,
  data,
  object: 'block',
  children: [
    {
      type: 'li',
      data: {},
      children: [{ text: 'list item 1' }]
    },
    {
      type: 'li',
      data: {},
      children: [{ text: 'list item 2' }]
    }
  ]
})

export const getParagraph = (text, data = {}) => ({
  type: 'p',
  object: 'block',
  data,
  children: [{ text }],
})

export const getDataElement = (text, data = {}) => ({
  type: 'data-element',
  data,
  children: [{ text }]
})

export const getElement = (type: string, data = {}): {
  type: string,
  data: {},
  children: []
} => ({
  type,
  data,
  children: [],
})

export const getText = (text: string): { text: string } => ({ text })

export const getTr = () => ({
  type: 'tr',
  object: 'block',
  children: [
    {
      type: 'td',
      children: [{ text: 'Column 1', bold: true }],
    },
    {
      type: 'td',
      children: [{ text: 'Column 2' }],
    },
    {
      type: 'td',
      children: [{ text: 'column 3' }],
    },
    {
      type: 'td',
      children: [{ text: 'column 4' }],
    },
  ],
})

export const getTable = (data = {}) => ({
  type: 'table',
  object: 'block',
  data,
  children: [
    getTr(),
    getTr(),
    getTr(),
  ],
})

export const nestedTable = (data = {}) => {
  const table = getTable()
  const tableToNest = getTable({ nested: true })
  const list = getList('ol')
  const tr = getTr()
  tr.children = [
    {
      type: 'td',
      children: [tableToNest]
    },
    {
      type: 'td',
      children: [list]
    },
    {
      type: 'td',
      children: [{ text: 'column 3' }],
    },
    {
      type: 'td',
      children: [{ text: 'column 4' }],
    },
  ]

  table.children.push(tr)

  return table
}
