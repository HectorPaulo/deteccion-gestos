interface AdvertenciaPrivacidadProps {
    onAccept: () => void;
    onReject: () => void;
}

const AdvertenciaPrivacidad: React.FC<AdvertenciaPrivacidadProps> = ({ onAccept, onReject }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 backdrop-blur-lg">
            <div className="rounded-xl bg-white border-b-8 border-l-8 border-t-2 b border-r-2 border-blue-950 p-6 max-w-screen w-1/2 mx-auto max-h-full h-2/5 flex flex-col">
                <h2 className="text-3xl font-bold mb-4 text-gray-900 text-center flex-shrink-0">Advertencia de Privacidad</h2>
                <div className="flex-grow overflow-y-auto">
                    <p className="text-gray-700 mb-4 text-xl text-justify">
                        Este sitio web utiliza mediapipe, una herramienta desarrollada por Google cuya tecnología hace posible la visión artificial y procesamiento de datos, tareas vitales para el funcionamiento de esta página. Al continuar navegando, aceptas que, aunque ninguno de tus datos será compartido intencionalmente con una empresa externa, sí serán procesados localmente por el sistema.
                    </p>
                    <p className="text-gray-700 mb-4 text-justify text-xl">
                        Si no estás de acuerdo, puedes abandonar el sitio.
                    </p>
                </div>
                <div className="flex justify-center gap-4 mt-4 flex-shrink-0">
                    <button
                        className="bg-gradient-to-r from-blue-500 to-blue-800 to-80% text-white px-4 py-2 rounded-lg hover:scale-105 transition"
                        onClick={onAccept}
                    >
                        Aceptar
                    </button>
                    <button
                        className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                        onClick={onReject}
                    >
                        Rechazar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdvertenciaPrivacidad;