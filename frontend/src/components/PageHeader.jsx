import './PageHeader.css';

export default function PageHeader({ titulo, subtitulo }) {
  return (
    <div className="page-header">
      <h2>{titulo}</h2>
      {subtitulo && <p>{subtitulo}</p>}
    </div>
  );
}