import top from './top'

self.onmessage = ({ data }) => {
  self.postMessage({ top: top(data), id: data.id })
}
