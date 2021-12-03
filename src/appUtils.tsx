import { ComboEditor } from "./common.types"

export const keyPressHandler = (editor: ComboEditor) => (event) => {
  switch (event.key) {
    case '`': {
      event.preventDefault()
      // CustomEditor.toggleCode(editor)
      break
    }
    case 'b': {
      event.preventDefault()
      // toggleTextStyle(editor, 'bold')
      break
    }
  }
}


