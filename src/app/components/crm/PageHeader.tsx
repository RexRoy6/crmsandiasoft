type Props = {
  title: string;
  buttonLabel?: string;
  onClick?: () => void;
};

export default function PageHeader({ title, buttonLabel, onClick }: Props) {
  return (
    <div className="flex justify-between items-center mb-8">
      {/* Título como subtítulo ejecutivo */}
      <h1 className="text-2xl font-semibold text-gray-700 tracking-tight">
        {title}
      </h1>

      {/* Botón de acción formal y monocromático */}
      {buttonLabel && onClick && (
        <button
          onClick={onClick}
          className="
            px-5 py-2 rounded-lg text-sm font-medium 
            bg-gray-900 text-white shadow-sm
            hover:bg-gray-800 transition-colors duration-200 focus:outline-none
          "
        >
          {buttonLabel}
        </button>
      )}
    </div>
  );
}