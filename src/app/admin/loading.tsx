export default function AdminLoading() {
  return (
    <div className="admin-loading">
      <div style={{ textAlign: 'center' }}>
        <div className="admin-loading__spinner" />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <p>Loading...</p>
      </div>
    </div>
  )
}
