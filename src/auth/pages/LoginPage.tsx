import "@/template/css/main.css";
import { LoginPayload } from "@/types/admin/login.type";
import { logoTransparente } from "@/assets";
import { useForm, useLoginAsync } from "@/hooks";
import { motion } from "framer-motion";

export const LoginPage = () => {

  const { fetchLogin } = useLoginAsync();

  const { onInputChange, formState } = useForm({
    user: "",
    password: "",
  });

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const loginPayload: LoginPayload = {
      nick: formState.user,
      password: formState.password,
    };

    await fetchLogin(loginPayload);
  };

  return (
    <>
      <motion.form
        onSubmit={onSubmit}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        <div className="col-md-4  col-md-offset-4">
          <article className="widget widget__login">
            <header className="widget__header one-btn">
              <div className="widget__title">
                <div className="main-logo">
                  <img
                    src={logoTransparente}
                    style={{
                      width: "135px",
                      height: "43px",
                      marginTop: "7px",
                      marginRight: "23px",
                      marginLeft: "23px",
                    }}
                  />
                </div>{" "}
                Unnamed ERP
              </div>
              <div className="widget__config">
                <a href="#" onClick={() => false}>
                  <i className="pe-7s-help1" />
                </a>
              </div>
            </header>
            <div className="widget__content">
              <motion.input
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.9 }}
                type="text"
                placeholder="Usuario"
                name="user"
                value={formState.user}
                onChange={onInputChange}
                autoComplete="username"
              />
              <motion.input
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.9 }}
                type="password"
                placeholder="Password"
                name="password"
                value={formState.password}
                onChange={onInputChange}
                autoComplete="current-password"
              />
              <motion.button
                className="login-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.9 }}
                type="submit"
              >
                Login
              </motion.button>
            </div>
            <div className="login__remember text-center">
              <input
                type="checkbox"
                className="custom-checkbox"
                id="cc1"
                defaultChecked
              />
              <label htmlFor="cc1" />
              Recuerdame
            </div>
          </article>
          {/* /widget */}
        </div>
      </motion.form>
    </>
  );
};
