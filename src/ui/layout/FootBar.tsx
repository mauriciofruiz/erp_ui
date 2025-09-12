import { logoTransparente } from '@/assets';
import '@/template/css/main.css';

export const FootBar = () => {
  return (
    <footer className="footer-brand">
      <img src={logoTransparente} height='65px' width='190px' style={{marginTop: '-30px'}} />
    </footer>
  );
};
