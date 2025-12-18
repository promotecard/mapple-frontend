{payments.map((payment) => {
  const today = new Date()
  const dueDate = new Date(payment.due_date)

  const computedStatus =
    payment.status === 'pending' && dueDate < today
      ? 'overdue'
      : payment.status

  const status = statusConfig(computedStatus)

  // 🔴 MORA DIARIA (0.2%)
  const daysLate =
    computedStatus === 'overdue'
      ? Math.max(
          Math.floor(
            (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
          ),
          0
        )
      : 0

  const dailyRate = 0.002
  const lateFee = payment.total_amount * dailyRate * daysLate
  const totalWithLateFee = payment.total_amount + lateFee

  return (
    <div
      key={payment.id}
      style={{
        border: '1px solid #e5e7eb',
        borderLeft: `6px solid ${status.color}`,
        borderRadius: 6,
        padding: 16,
        marginBottom: 12,
      }}
    >
      <p><strong>{payment.concept}</strong></p>

      <p>
        Monto:{' '}
        <strong>
          USD {payment.total_amount.toFixed(2)}
        </strong>
      </p>

      <p>Vence: {payment.due_date}</p>

      <p style={{ color: status.color }}>
        {status.label}
      </p>

      {computedStatus === 'overdue' && (
        <>
          <p style={{ color: 'red', marginTop: 4 }}>
            Este pago está vencido y tiene recargos.
          </p>

          <p style={{ color: 'red' }}>
            Días de atraso: {daysLate}
          </p>

          <p style={{ color: 'red' }}>
            Mora acumulada: USD {lateFee.toFixed(2)}
          </p>

          <p>
            <strong>
              Total a pagar: USD {totalWithLateFee.toFixed(2)}
            </strong>
          </p>
        </>
      )}

      {computedStatus !== 'paid' && (
        <button
          style={{ marginTop: 8 }}
          onClick={() => handlePay(payment.id)}
        >
          Pagar ahora
        </button>
      )}
    </div>
  )
})}
