function FormWindow({ children, onClose, size = 1 }) {
  // Détermine la classe de largeur en fonction de la taille
  const sizeClass =
    size === 1
      ? "max-w-md"
      : size === 2
      ? "max-w-2xl"
      : size === 3
      ? "max-w-3xl"
      : "max-w-4xl";

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
      <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg relative w-full ${sizeClass}`}>
        <button onClick={onClose} className="absolute top-2 right-3 text-gray-500 hover:text-black">✕</button>
        {children}
      </div>
    </div>
  )
}

export default FormWindow