import { logoTransparente } from '@/assets';

export const TopBar = () => {
  return (
    <>
      <header className="top-bar">
        {/* <ul className="profile">
          <li>
            <a
              href="#"
              className="btn-circle no-circle"
              style={{ cursor: 'pointer' }}
            >
              <i className="pe-7f-back" onClick={onLogout} />
            </a>
          </li>
          <li>
          <a href="#" onClick={() => false} className="btn-circle btn-sm">
            <i className="pe-7f-mail" />
            <span className="badge badge--blue">8</span>
          </a>
        </li>
        <li>
          <a href="#" onClick={() => false} className="btn-circle btn-sm">
            <i className="pe-7g-sets" />
          </a>
        </li>
        <li>
          <a
            href="#"
            onClick={() => false}
            className="btn-circle btn-sm active"
          >
            <i className="pe-7g-user" />
          </a>
        </li>
          <li className="mobile-nav">
            <a
              href="#"
              onClick={() => {
                $('.sidebar').toggleClass('open');
              }}
              className="btn-circle btn-sm"
            >
              <i className="pe-7f-menu" />
            </a>
          </li>
        </ul>
        <div className="main-search">
          <input type="text" placeholder="Search ..." id="msearch" />
          <label htmlFor="msearch">
            <i className="pe-7s-search" />
          </label>
          <button>
            <i className="pe-7g-arrow-circled pe-rotate-90" />
          </button>
        </div> */}
        <div className="topbar">
          <div className="main-brand__container">
            <div className="main-logo">
              <img
                src={logoTransparente}
                height="55px"
                alt="Logo"
                style={{ marginTop: '2px' }}
              />
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
