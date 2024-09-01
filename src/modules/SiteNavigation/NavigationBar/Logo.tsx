import { useAppContext } from '@app/AppContext';
import { colorRed500 } from '@utils/color';
import { logoI18n } from './logo.i18n';

export function Logo() {
  const { language } = useAppContext();
  const [alternatinText, careText] = logoI18n[language].split(' ');
  return (
    <p>
      <span
        style={{
          color: colorRed500,
        }}
      >
        <strong>{alternatinText}</strong>{' '}
      </span>
      {careText}
    </p>
  );
}
