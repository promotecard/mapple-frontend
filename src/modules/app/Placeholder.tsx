type Props = {
  title: string
  description?: string
}

export default function Placeholder({ title, description }: Props) {
  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 600 }}>
        {title}
      </h1>

      {description && (
        <p style={{ marginTop: 8 }}>
          {description}
        </p>
      )}
    </div>
  )
}
