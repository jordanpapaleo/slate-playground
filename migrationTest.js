import * as json from './data-examples/nestedListDraft.json'
import get from 'lodash/get'
import pick from 'lodash/pick'

const {blocks, entityMap} = json

const state = []

blocks.forEach((block) => {
  const entityKey = get(block, 'entityRanges[0].key')

  if (entityKey !== undefined) {
    const entity = entityMap[entityKey]
    state.push({
      type: entity.type,
      id: block.key,
      data: entity.data,
      children: [],
    })
  } else {
    state[state.length - 1].children.push({
      type: block.type,
      children: [],
    })
  }
})

console.log(JSON.stringify(state, null, 2))


const getStuff = (block) => pick(block, [
  'type', 'key', 'data'
])
