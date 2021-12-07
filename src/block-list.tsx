interface ToolbarBlockProps {
  type: string
  renderBlock: (props: RenderElementProps) => React.ReactElement
}

export const blocks: ToolbarBlockProps[] = [
  {
    type: 'page',
    renderBlock: ({ attributes, children }: RenderElementProps) => (
      <div className="page" {...attributes} style={{
        background: '#eee',
        height: '11in', // TODO: CUSTOM
        padding: '1in',
        position: 'relative',
        width: '8.5in', // TODO: CUSTOM
      }}>
        {children}
      </div>
    )
  },
  {
    type: 'section',
    renderBlock: ({ attributes, children }: RenderElementProps) => (
      <div className="section" {...attributes} style={{
        // TODO: CUSTOM
        marginBottom: '0in',
        marginLeft: '0in',
        marginRight: '0in',
        marginTop: '0in',
      }}>
        {children}
      </div>
    )
  }
]
