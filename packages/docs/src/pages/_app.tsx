import type { AppProps } from 'next/app'
import Script from 'next/script'

const App = function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <Script src="https://oplayer.vercel.app/_vercel/insights/script.js" />
    </>
  )
}

export default App
