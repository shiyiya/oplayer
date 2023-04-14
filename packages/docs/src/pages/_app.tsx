import type { AppProps } from 'next/app'

const App = function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default App
