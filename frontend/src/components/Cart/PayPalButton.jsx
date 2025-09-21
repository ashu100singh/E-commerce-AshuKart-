import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js"

const PayPalButton = ({amount, onSuccess, onError}) => {
  return (
    <PayPalScriptProvider options={{"clientId" : "AcKm1V88Znk5tYvY13FZ47w52U5HrUQjGFpmWV6SVVvEdLFckBtC4TI_DVxBtpHRj6oP3RL9QeVQWtjX"}}>

        <PayPalButtons 
            style={{layout: "vertical"}} 
            createOrder={(data, actions) => {
                return actions.order.create({
                    purchase_units: [{amount: {value: amount}}]
                })
            }}
            onApprove={(data, actions) => {
                return actions.order.capture().then(onSuccess)
            }}
            onError={onError}
        />

    </PayPalScriptProvider>
  )
}

export default PayPalButton