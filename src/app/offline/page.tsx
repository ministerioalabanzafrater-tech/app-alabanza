export default function OfflinePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="brutal-card-lg max-w-md w-full text-center">
        <div className="text-6xl mb-6">📡</div>
        <h1 className="text-3xl font-black mb-3">Sin conexión</h1>
        <p className="text-gray-600 font-medium mb-6">
          Revisa tu conexión a internet e intenta de nuevo.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="brutal-btn w-full"
        >
          Reintentar
        </button>
      </div>
    </main>
  )
}
