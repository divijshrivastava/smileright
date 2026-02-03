export default function BlogLoading() {
  return (
    <div style={{
      paddingTop: '170px',
      minHeight: '100vh',
      fontFamily: 'var(--font-sans, system-ui, sans-serif)',
    }}>
      <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{
          height: '2rem',
          width: '120px',
          background: '#e0e0e0',
          borderRadius: '4px',
          marginBottom: '1rem',
        }} />
        <div style={{
          height: '1rem',
          width: '280px',
          background: '#eee',
          borderRadius: '4px',
          marginBottom: '2rem',
        }} />
        {[1, 2, 3].map((i) => (
          <div key={i} style={{
            background: '#f9f9f9',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '1.5rem',
          }}>
            <div style={{ height: '200px', background: '#e0e0e0', borderRadius: '8px', marginBottom: '1rem' }} />
            <div style={{ height: '1.2rem', width: '60%', background: '#e0e0e0', borderRadius: '4px', marginBottom: '0.5rem' }} />
            <div style={{ height: '1rem', width: '80%', background: '#eee', borderRadius: '4px' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
