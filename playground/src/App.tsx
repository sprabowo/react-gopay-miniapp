import useMiniapp from '../../src'

export function App() {
  const {
    isLoading,
    error
  } = useMiniapp({
    onReady: () => console.log('SDK Ready'),
    onError: (err) => console.error('SDK Error', err)
  })

  if (isLoading) return <div>Loading SDK...</div>
  if (error) return <div>Error loading SDK: {error}</div>

  return (
    <div>
      <p>SDK Ready!</p>
    </div>
  )
}
