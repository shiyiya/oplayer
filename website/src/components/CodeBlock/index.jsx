// import { useColorMode } from '@docusaurus/theme-common'
import Highlight, { defaultProps } from 'prism-react-renderer'
import dracula from 'prism-react-renderer/themes/dracula'
// import github from 'prism-react-renderer/themes/github'
import React from 'react'
// import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment'

const CodeBlock = ({ code, language }) => {
  // const colorMode = 'dark' // useColorMode() not supported SSR

  return (
    <Highlight
      {...defaultProps}
      code={code}
      language={language || 'tsx'}
      theme={dracula /*colorMode == 'dark' ? dracula : github*/}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre className={className} style={{ ...style, textAlign: 'left' }}>
          {tokens.map((line, i) => (
            <div {...getLineProps({ line, key: i })}>
              {line.map((token, key) => (
                <span {...getTokenProps({ token, key })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  )
}

export default CodeBlock
