import RequestButton from  './components/RequestButton.tsx'

export default function App() {
  return (
    <RequestButton
        num={10}
        billing_period={1}
        method="max"
        variable="potable usage"
    />
  )
}
