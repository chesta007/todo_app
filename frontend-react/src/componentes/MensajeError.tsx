// MensajeError — el cartel rojo de error (era #mensaje-error en el vanilla)
// ------------------------------------------------------------
// En vanilla: mensajeError.textContent = msj; classList.toggle('hidden', !msj).
// En React no hay textContent ni classList: el cartel EXISTE solo cuando
// hay mensaje (render condicional). Si no hay error, no se dibuja nada.
interface Props {
    mensaje: string | null;
}

function MensajeError({ mensaje }: Props) {
    if (!mensaje) return null;
    return (
        <p className="error" role="alert">
            {mensaje}
        </p>
    );
}

export default MensajeError;