export const keyPressHandler = (editor: any) => (event) => {
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


