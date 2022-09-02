import React from 'react'
import Layout from '@theme/Layout'
import HeaderView from '../components/HeaderView'
import Preview from '../components/Preview'
import StartCoding from '../components/StartCoding'

export default function Home() {
  return (
    <Layout title="Oh! Another HTML5 video player" description="Oh! Another HTML5 video player">
      <HeaderView />
      <Preview />
      <StartCoding />
    </Layout>
  )
}
