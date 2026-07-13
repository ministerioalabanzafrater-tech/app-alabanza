import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="max-w-sm w-full">
        {/* Big 404 */}
        <div className="border-4 border-black p-8 shadow-[8px_8px_0px_#000] mb-6 text-center">
          <p className="font-black text-[80px] leading-none tracking-tighter">404</p>
          <div className="h-1 w-16 bg-black mx-auto my-4" />
          <p className="font-black text-xl">Página no encontrada</p>
          <p className="text-sm font-medium text-gray-500 mt-2">
            Esta ruta no existe o fue movida.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="brutal-btn w-full text-center"
          >
            Ir al Dashboard
          </Link>
          <Link
            href="/eventos"
            className="brutal-btn-outline w-full text-center"
          >
            Ver Eventos
          </Link>
        </div>
      </div>
    </div>
  )
}
