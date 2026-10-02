import PageHeader from './PageHeader';

export default function Placeholder({ titulo }) {
  return (
    <div>
      <PageHeader titulo={titulo} subtitulo="Esta tela ainda está em desenvolvimento." />
    </div>
  );
}